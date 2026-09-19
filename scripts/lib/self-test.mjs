#!/usr/bin/env node
// 迁移台账的**自测**：`node scripts/lib/self-test.mjs`
//
// 为什么不用 vitest / `node --test`：台账是**门禁基础设施**，它必须在「工具链起不来」的
// 环境里也能自证。vitest 要拉起 vite/rolldown，`node --test` 会为每个测试文件 spawn 子进程
// ——两者在受限沙箱/精简 CI 镜像里都会 `spawn EPERM`。本文件是**零依赖、零子进程**的纯
// 断言清单：直接 `node` 跑，退出码就是结论。
//
// 这些用例锁的是**口径**本身——口径漂了，台账的数字就失去意义：
//   1. codeOnly() 必须吃掉注释 / 字符串 / HTML 注释 / .vue 的 template+style，
//      否则「已迁完」的历史记录会被算成迁移债（2026-09-17 实测虚高 29 文件 / 34 处）。
//   2. 白名单必须真的是从 .oxlintrc.json 读出来的（单一真源），且每条都有设计理由。
//   3. 监听器扫描必须区分「匿名/具名」与「once/非 once」。

import { join } from 'node:path';
import {
	codeOnly,
	countCodeMatches,
	collectImports,
	scanAddListenerCalls,
	DOM_PATTERNS,
	ANY_HATCH_RE,
	NULL_CAST_RE,
	UNKNOWN_CAST_RE,
	readSource,
	ROOT
} from './scan.mjs';
import { readDomWhitelist, loadDomWhitelist, WHITELIST_RATIONALE } from './dom-whitelist.mjs';

// ---------------------------------------------------------------------------
// 极简测试框架（够用就好：一个用例 = 一个函数 + 一句断言）
// ---------------------------------------------------------------------------

let passed = 0;
const failures = [];

function test(name, fn) {
	try {
		fn();
		passed++;
		process.stdout.write(`  ✓ ${name}\n`);
	} catch (err) {
		failures.push({ name, message: err?.message ?? String(err) });
		process.stdout.write(`  ✗ ${name}\n      ${err?.message ?? err}\n`);
	}
}

function eq(actual, expected, hint) {
	const a = JSON.stringify(actual);
	const e = JSON.stringify(expected);
	if (a !== e) {
		throw new Error(`${hint ? hint + '\n      ' : ''}期望 ${e}，实际 ${a}`);
	}
}

function ok(value, hint) {
	if (!value) throw new Error(hint ?? '期望为真，实际为假');
}

/** 取一条全新的正则（DOM_PATTERNS 里的 /g 正则带 lastIndex 状态，用例之间不能共用） */
const fresh = (key) => DOM_PATTERNS.find((p) => p.key === key).re;

// ---------------------------------------------------------------------------
// codeOnly：口径的核心
// ---------------------------------------------------------------------------

process.stdout.write('\ncodeOnly —— 排除注释/字符串/template，只留真实代码\n');

test('行注释里的受限 API 不算命中', () => {
	eq(
		countCodeMatches(
			"// 原先用 document.getElementById('x') 反查\nconst a = 1;\n",
			fresh('getElementById')
		),
		0
	);
});

test('块注释里的受限 API 不算命中', () => {
	eq(
		countCodeMatches(
			"/* P1b：过去是 document.getElementById('x')，现在走注册表 */\nconst a = 1;\n",
			fresh('getElementById')
		),
		0
	);
});

test('字符串字面量里的受限 API 不算命中', () => {
	eq(
		countCodeMatches(
			'const msg = "use document.getElementById instead";\n',
			fresh('getElementById')
		),
		0
	);
});

test('HTML 注释里的受限 API 不算命中（含带属性的 template 标签）', () => {
	// 这条对应实测漏网：`<template v-if=…>` 带属性时，早先按 `<template>` 字面匹配会整段漏掉
	const src = [
		'<template v-if="ok">',
		'  <!-- 原先是 document.createElement("div") + render() -->',
		'  <div />',
		'</template>',
		'<script setup lang="ts">',
		"const el = document.getElementById('real');",
		'</script>'
	].join('\n');
	eq(countCodeMatches(src, fresh('getElementById')), 1, '只应数到 <script> 里那一处真实调用');
});

test('.vue 的 template 与 style 整段跳过', () => {
	const src = [
		'<template><div>{{ document.getElementById("x") }}</div></template>',
		'<style>/* document.querySelector("#y") */</style>',
		'<script setup>const a = 1;</script>'
	].join('\n');
	eq(countCodeMatches(src, fresh('getElementById')), 0);
});

test('真实代码里的受限 API 照常命中', () => {
	eq(
		countCodeMatches(
			"const a = document.getElementById('a');\nconst b = document.getElementById('b');\n",
			fresh('getElementById')
		),
		2
	);
});

test('保留换行数（行号仍可对齐）', () => {
	const src = 'a\n/* multi\nline\ncomment */\nb\n';
	eq(codeOnly(src).split('\n').length, src.split('\n').length);
});

// ---------------------------------------------------------------------------
// 正则字面量（2026-09-19 仪器修复的回归测试）
//
// 症状：扫描器不认识正则字面量，遇到 `/["']/` 这类正则时把正则里的引号当成字符串开头，
// 于是**从那里到下一个同类引号之间的所有代码都被置空**。因为长度保持、行号仍对得上，
// 极难察觉 —— 实测全仓 1516 个文件里 389 个被少统计，`plugin-parse-meta.ts` 的
// 8 处 `null as unknown as` 全部消失，导致那条轴对整批文件是瞎的。
// ---------------------------------------------------------------------------
process.stdout.write('\n正则字面量 —— 不能让正则里的引号把后面整段代码吃掉\n');

test('正则里的引号不吞掉后续代码', () => {
	const src = [
		'const re = /["\']/;',
		"const a = document.getElementById('a');",
		"const b = document.getElementById('b');"
	].join('\n');
	eq(countCodeMatches(src, fresh('getElementById')), 2);
});

test('正则里的反引号同样不吞代码', () => {
	const src = ['const re = /`/;', "const a = document.getElementById('a');"].join('\n');
	eq(countCodeMatches(src, fresh('getElementById')), 1);
});

test('字符类里的 `/` 不提前结束正则', () => {
	const src = ['const re = /[/"\']+/;', "const a = document.getElementById('a');"].join('\n');
	eq(countCodeMatches(src, fresh('getElementById')), 1);
});

test('除号不会被误当成正则开头', () => {
	const src = "const half = total / 2;\nconst a = document.getElementById('a');\n";
	eq(countCodeMatches(src, fresh('getElementById')), 1);
});

test('`return /re/` 之后的正则仍被识别', () => {
	const src = [
		'function f() { return /[\'"]/.test(x); }',
		"const a = document.getElementById('a');"
	].join('\n');
	eq(countCodeMatches(src, fresh('getElementById')), 1);
});

test('转义引号不会错切字符串边界', () => {
	eq(
		countCodeMatches(
			'const a = "he said \\"document.getElementById\\"";\nconst b = 1;\n',
			fresh('getElementById')
		),
		0
	);
});

test('反引号模板串里的受限 API 不算命中', () => {
	eq(countCodeMatches('const s = `document.getElementById("x")`;\n', fresh('getElementById')), 0);
});

// 这一组是 2026-09-17 第二次踩到的同一个坑：写注释解释「老路径靠 [k: string]: any 兜住」，
// 结果台账把**注释本身**算成了新增的泛型逃生口，棘轮当场报「any-hatches 上升」。
// 注释里提到某个坏模式，不该让这个坏模式的计数变多——计数口径必须对「说明文字」免疫。
test('注释里提到 [k: string]: any 不算逃生口', () => {
	const src = '// 老路径走的是 `UIShape` 的 `[k: string]: any` 索引签名\nconst a = 1;\n';
	eq(countCodeMatches(src, ANY_HATCH_RE), 0);
});

test('注释里提到 null as unknown as 不算遗留单例形状', () => {
	const src = '/* 过去这里是 `foo: null as unknown as Bar` 的写法 */\nconst a = 1;\n';
	eq(countCodeMatches(src, NULL_CAST_RE), 0);
});

test('注释里提到 as unknown as 不算双重断言', () => {
	const src = '// 说明：这里曾经用 as unknown as 绕过类型\nconst a = 1;\n';
	eq(countCodeMatches(src, UNKNOWN_CAST_RE), 0);
});

test('真实代码里的逃生口与断言照常命中', () => {
	eq(countCodeMatches('interface X { [k: string]: any }', ANY_HATCH_RE), 1);
	eq(countCodeMatches('const a = null as unknown as Foo;', NULL_CAST_RE), 1);
	eq(countCodeMatches('const a = x as unknown as Foo;', UNKNOWN_CAST_RE), 1);
});

// ---------------------------------------------------------------------------
// collectImports：遗留层进度不能虚高
// ---------------------------------------------------------------------------

process.stdout.write('\ncollectImports —— 区分运行时与仅类型 import\n');

test('四类写法归类正确', () => {
	const src = [
		"import type { UIShape } from '@app/ui/ui-window.ts';",
		"import { UI } from '@app/ui/ui-window.ts';",
		"import { type A, type B } from '@app/ui/other.ts';",
		"import { C, type D } from '@app/ui/mixed.ts';"
	].join('\n');
	const imports = collectImports(src);
	eq(imports.length, 4, '应识别出 4 条 import');
	eq(
		imports.map((i) => [i.specifier, i.typeOnly]),
		[
			['@app/ui/ui-window.ts', true],
			['@app/ui/ui-window.ts', false],
			['@app/ui/other.ts', true],
			// 混合写法保守判为运行时：宁可把运行时算多，也不要让「拆遗留层」的进度虚高
			['@app/ui/mixed.ts', false]
		]
	);
});

// ---------------------------------------------------------------------------
// 监听器扫描
// ---------------------------------------------------------------------------

process.stdout.write('\nscanAddListenerCalls —— 匿名/具名 与 once 的区分\n');

test('匿名且非 once = 「无法 remove」', () => {
	const calls = scanAddListenerCalls("window.addEventListener('resize', () => {});");
	eq(calls.length, 1);
	eq(calls[0].inline, true);
	eq(calls[0].once, false);
});

test('具名回调不算风险（可以 removeEventListener）', () => {
	eq(scanAddListenerCalls("window.addEventListener('resize', onResize);")[0].inline, false);
});

test('匿名 + once 不算泄漏（浏览器自动摘除）', () => {
	const calls = scanAddListenerCalls(
		"window.addEventListener('resize', () => {}, { once: true });"
	);
	eq(calls[0].inline, true);
	eq(calls[0].once, true);
});

test('注释里的 addEventListener 不算一次调用', () => {
	eq(scanAddListenerCalls("// window.addEventListener('resize', () => {});\n").length, 0);
});

// ---------------------------------------------------------------------------
// 白名单单一真源
// ---------------------------------------------------------------------------

process.stdout.write('\n白名单 —— 单一真源与「必须有理由」\n');

test('确实是从 .oxlintrc.json 读出来的，且不含测试/playground', () => {
	const entries = readDomWhitelist();
	ok(entries.length > 0, '白名单不该为空');
	for (const e of entries) {
		ok(!/__tests__|\.spec\.|playground/.test(e.pattern), `不该把 ${e.pattern} 当作设计豁免`);
	}
});

test('每条豁免都必须有设计理由（防止白名单变成后门）', () => {
	eq(
		readDomWhitelist()
			.filter((e) => e.reason === null)
			.map((e) => e.pattern),
		[],
		'新增豁免时必须同时在 scripts/lib/dom-whitelist.mjs 的 WHITELIST_RATIONALE 里写明理由'
	);
});

test('理由表里不该有已删除的陈旧条目', () => {
	const patterns = new Set(readDomWhitelist().map((e) => e.pattern));
	eq(
		Object.keys(WHITELIST_RATIONALE).filter((p) => !patterns.has(p)),
		[],
		'这些理由条目对应的 glob 已不在 .oxlintrc.json 中'
	);
});

test('glob 语义：** 跨目录、* 不跨目录', () => {
	const { match } = loadDomWhitelist();
	eq(match('packages/ui-kit/src/components/basic/YMButton/YMButton.vue'), true);
	eq(match('packages/editor/src/main.ts'), true);
	eq(match('packages/editor/src/not-whitelisted.ts'), false);
	// ui-kit/src/components/** 不该把同级非 components 目录也放进来
	eq(match('packages/ui-kit/src/utils/dom.ts'), false);
});

// ---------------------------------------------------------------------------
// 阶段 1b/1c 的结构不变量
//
// 这两条守的是「迁移过程中最容易悄悄错位、但 tsc/oxlint 都不会报」的东西。
// 它们是 2026-09-17 那轮 `git checkout` 误撤两个已迁文件的直接教训：
// 当时唯一发现问题的信号就是台账的 legacy-ui-refs 数字，而不是类型或 lint。
// ---------------------------------------------------------------------------

process.stdout.write('\n结构不变量 —— uiStateKeys 与 UIEngine 桥\n');

const uiStoreSrc = readSource(join(ROOT, 'packages/editor/src/stores/ui.ts'));

test('uiStateKeys 的每一项在 store 里都有同名声明', () => {
	const m = uiStoreSrc.match(/export const uiStateKeys = \[([\s\S]*?)\] as const;/);
	ok(m !== null, '找不到 uiStateKeys 定义');
	const keys = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
	ok(keys.length > 0, 'uiStateKeys 不该为空');
	const missing = keys.filter(
		(k) =>
			!new RegExp(`\\bconst ${k}\\s*=`).test(uiStoreSrc) &&
			!new RegExp(`\\b${k}:`).test(uiStoreSrc)
	);
	eq(missing, [], '这些键登记在 uiStateKeys 里却没有对应声明（桥会装到 undefined 上）');
});

test('uiStateKeys 无重复项', () => {
	const m = uiStoreSrc.match(/export const uiStateKeys = \[([\s\S]*?)\] as const;/);
	const keys = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
	eq(new Set(keys).size, keys.length, '重复的键会让 defineProperty 重复安装');
});

test('ui-window.ts 的每个 `UI.x = UIEngine.x` 都有真实同名定义', () => {
	// 这 21 行不是「间接层」而是 **this 绑定**：UIEngine 的方法内部会用 `this.planToSave` 等，
	// 所以 UI 对象必须以接收者身份调用它们。若某个名字在 UIEngine 上不存在，
	// 这行会把 UI 槽位置成 undefined —— 而 UIShape 的 `[k: string]: any` 不会报错。
	const winSrc = readSource(join(ROOT, 'packages/editor/src/ui/ui-window.ts'));
	const engineSrc = readSource(join(ROOT, 'packages/editor/src/engine/ui/ui-engine.ts'));
	const assigned = [
		...winSrc.matchAll(/^UI\.([A-Za-z_$][\w$]*)\s*=\s*UIEngine\.([A-Za-z_$][\w$]*);/gm)
	];
	ok(assigned.length > 0, '找不到 `UI.x = UIEngine.x` 形式的赋值（结构可能已变，请复核本用例）');
	const broken = assigned
		.filter(
			([, lhs, rhs]) =>
				lhs !== rhs || !new RegExp(`^UIEngine\\.${rhs}\\s*=`, 'm').test(engineSrc)
		)
		.map(([line]) => line);
	eq(broken, [], '这些 UI 槽位被赋成了不存在的 UIEngine 成员（运行时会读到 undefined）');
});

// ---------------------------------------------------------------------------
// 结论
// ---------------------------------------------------------------------------

process.stdout.write(`\n${'─'.repeat(60)}\n`);
if (failures.length === 0) {
	process.stdout.write(`self-test: OK（${passed}/${passed} 通过）\n\n`);
	process.exit(0);
}
process.stdout.write(
	`self-test: ${failures.length} 个用例失败（${passed} 通过 / ${passed + failures.length} 总计）\n`
);
for (const f of failures) process.stdout.write(`  ✗ ${f.name}\n      ${f.message}\n`);
process.stdout.write('\n');
process.exit(1);
