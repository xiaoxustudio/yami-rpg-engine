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

import { join, dirname } from 'node:path';
import {
	codeOnly,
	countCodeMatches,
	collectImports,
	collectFiles,
	importRefs,
	scanAddListenerCalls,
	SCAN_DIRS,
	DOM_PATTERNS,
	ANY_HATCH_RE,
	NULL_CAST_RE,
	UNKNOWN_CAST_RE,
	UI_SINGLETON_RE,
	readSource,
	ROOT
} from './scan.mjs';
import { readDomWhitelist, loadDomWhitelist, WHITELIST_RATIONALE } from './dom-whitelist.mjs';
import {
	uiWindowRel,
	legacyOnlyStoreSlots,
	storeReferencedSlots,
	uiDirRe,
	uiFacadeGaps,
	uiSlotCoverage,
	unassignedStoreSlots
} from './ui-slots.mjs';
import { checkTextIntegrity, scanTextIntegrity } from './text-integrity.mjs';

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

// 2026-09-20 扩口径：`Record<string, any>` 与索引签名是**同一个逃生的两种写法**。
// 只数一种的话，把 `[k: string]: any` 改写成 `Record<string, any>` 就能凭空「归零」。
test('Record<string, any> 与索引签名计同一条轴', () => {
	eq(countCodeMatches('const m: Record<string, any> = {};', ANY_HATCH_RE), 1);
	eq(countCodeMatches('type M = Record<string, any>;', ANY_HATCH_RE), 1);
	eq(countCodeMatches('interface X { [key: string]: any }', ANY_HATCH_RE), 1);
});

test('Record 收紧后的写法不算逃生口', () => {
	eq(countCodeMatches('const m: Record<string, unknown> = {};', ANY_HATCH_RE), 0);
	eq(countCodeMatches('const m: Record<string, string> = {};', ANY_HATCH_RE), 0);
	// `Record<string, any[]>` 的元素类型是数组，不是 `any` 本身
	eq(countCodeMatches('const m: Record<string, any[]> = {};', ANY_HATCH_RE), 0);
});

test('注释里提到 Record<string, any> 不算逃生口', () => {
	eq(countCodeMatches('// 旧写法是 Record<string, any>\nconst a = 1;\n', ANY_HATCH_RE), 0);
});

// ---------------------------------------------------------------------------
// UI 单例成员挂载：legacy-ui-lines 的替代轴口径
// ---------------------------------------------------------------------------

process.stdout.write('\nUI_SINGLETON_RE —— 不受目录影响的 1c 进度口径\n');

test('成员挂载照常命中（含链式赋值）', () => {
	eq(countCodeMatches('UI.open = function () {};', UI_SINGLETON_RE), 1);
	eq(countCodeMatches('UI.setZoom = UIEngine.setZoom;', UI_SINGLETON_RE), 1);
	// 链式：行首锚定的 grep 数不到这一处（实测 ui-prefab.ts:105）
	eq(
		countCodeMatches(
			'uiElClasses.createElement = UI.createElement = function () {};',
			UI_SINGLETON_RE
		),
		1
	);
});

// 本轴数的是「挂在 UI **单例本身**上的成员」。`UI.list.copy = null` / `UI.marquee.resize = null`
// 这类改的是**成员的成员**，`list` / `marquee` 早已挂好 —— 不算新的挂载点。
// （注意：`ui-slots.mjs` 的 `assignedSlots()` 把这类算作「该槽位有赋值」，那是**另一个口径**，
//   服务的是「槽位会不会读到 undefined」，不是「单例面上还剩多少成员」。两者不可互换。）
test('成员的成员不算单例挂载', () => {
	eq(countCodeMatches('UI.list.copy = null;', UI_SINGLETON_RE), 0);
	eq(countCodeMatches('UI.marquee.resize = null;', UI_SINGLETON_RE), 0);
	eq(countCodeMatches('UI.prefabs.x = 1;', UI_SINGLETON_RE), 0);
});

// 唯一的程序化挂载写法：ui-window.ts:256 给 6 个 store 桥接键装 getter/setter。
// 那是**状态同步**，不是成员挂载，故有意不计入本轴。
test('Object.defineProperty(UI, key, …) 不计入本轴', () => {
	eq(countCodeMatches('Object.defineProperty(UI, key, { get, set });', UI_SINGLETON_RE), 0);
});

// 裸 `\s*=` 会把比较误判成赋值：实测 ui-events.ts:80 就栽在这里（104 vs 103）
test('比较运算符不算成员挂载', () => {
	eq(countCodeMatches('if (state === "open" && UI.dragging === null) {}', UI_SINGLETON_RE), 0);
	eq(countCodeMatches('if (UI.zoom == null) {}', UI_SINGLETON_RE), 0);
	eq(countCodeMatches('const a = UI.height >= 1;', UI_SINGLETON_RE), 0);
});

test('只读与注释不算成员挂载（纯移动不该让本轴下降）', () => {
	eq(countCodeMatches('const h = UI.outerHeight;', UI_SINGLETON_RE), 0);
	eq(countCodeMatches('UI.page.resize();', UI_SINGLETON_RE), 0);
	eq(
		countCodeMatches(
			'// 原先这里是 UI.background = new StageColor(…)\nconst a = 1;\n',
			UI_SINGLETON_RE
		),
		0
	);
	// 别的单例不算：本轴只盯 UI
	eq(countCodeMatches('Scene.list = {};', UI_SINGLETON_RE), 0);
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

test('再导出（export … from）算运行期依赖，且 specifier 必须真的取到', () => {
	// 为什么这条必须有：`tools/window-cluster.ts` 是用
	// `export { UI } from '@app/engine/ui/legacy/ui-window.ts'` 转出遗留 UI 单例的。
	// 旧口径只认 `import … from` ⇒ 这条依赖在任何计数里都不存在 ⇒ 搬运之后
	// `legacy-ui-refs` 读到 0，看起来像「遗留层已经没人用了」。
	// 实测踩过的第二个坑：正则少写一个捕获组时 specifier 是 `undefined`，
	// 于是再导出被 filter **静默丢弃** —— 数字还是 0，而且不报错。所以这里连 specifier 一起钉。
	eq(
		collectImports("export { UI } from '@app/engine/ui/legacy/ui-window.ts';").map((i) => [
			i.specifier,
			i.typeOnly,
			i.kind
		]),
		[['@app/engine/ui/legacy/ui-window.ts', false, 'reexport']]
	);
	eq(
		collectImports("export * from '@app/engine/ui/legacy/register.ts';").map((i) => [
			i.specifier,
			i.kind
		]),
		[['@app/engine/ui/legacy/register.ts', 'reexport']]
	);
	eq(
		collectImports("export type { UIShape } from '@app/engine/ui/legacy/ui-window.ts';").map(
			(i) => [i.specifier, i.typeOnly]
		),
		[['@app/engine/ui/legacy/ui-window.ts', true]]
	);
	// 普通导出（没有 from）不是依赖，不能算进来
	eq(collectImports('export const a = 1;\nexport function b() {}'), []);
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

test('UIEngine 桥：镜像若还在就必须指到真实成员；退役后 store 的引擎转发仍须有实现', () => {
	// 这 21 行不是「间接层」而是 **this 绑定**：UIEngine 的方法内部会用 `this.planToSave` 等，
	// 所以 UI 对象必须以接收者身份调用它们。若某个名字在 UIEngine 上不存在，
	// 这行会把 UI 槽位置成 undefined —— 而 UIShape 的 `[k: string]: any` 不会报错。
	//
	// ⚠️ 路径必须走 `uiWindowRel()`，**不要写死** `packages/editor/src/ui/ui-window.ts`。
	// 2026-09-20 的 P5-B 纯移动把整个 `src/ui/` 搬到 `src/engine/ui/legacy/` 之后，
	// 写死路径的版本读不到任何赋值，本用例当场红 —— 而且这条门禁当时**没被复跑**
	// （`migration:check` 是绿的，红的只有 `migration:selftest`），
	// 正是「挪了目录，仪器跟着瞎」的又一次实例。仪器只维护一份。
	//
	// ⚠️ **2026-09-22 第 114 轮改过**：原判据里有一条 `assigned.length > 0`（「镜像必须还在」）。
	// 阶段 1c 第 ④-2c 步把 21 行镜像**退役**了，那条前提不再成立 —— 但它要守的东西还在，
	// 而且换了形态、**更强**：store 的 7 个引擎转发不再经过镜像，直接从注册进来的 `UIEngine`
	// 取函数（`makeEngineForwarder`）。所以下面加 ②：那 7 个必须在 `UIEngine` 上有实现，
	// 否则它们会**静默**返回 undefined。① 保留成「若镜像还在（有人加回来）就必须指得对」。
	const winRel = uiWindowRel();
	ok(winRel !== null, '找不到 UI 单例对象字面量所在文件（uiWindowRel() 返回 null）');
	const winSrc = readSource(join(ROOT, winRel));
	const engineSrc = readSource(join(ROOT, 'packages/editor/src/engine/ui/ui-engine.ts'));

	// ① 镜像若存在，每一条都必须指向真实存在的**同名**成员
	const assigned = [
		...winSrc.matchAll(/^UI\.([A-Za-z_$][\w$]*)\s*=\s*UIEngine\.([A-Za-z_$][\w$]*);/gm)
	];
	const broken = assigned
		.filter(
			([, lhs, rhs]) =>
				lhs !== rhs || !new RegExp(`^UIEngine\\.${rhs}\\s*=`, 'm').test(engineSrc)
		)
		.map(([line]) => line);
	eq(broken, [], '这些 UI 槽位被赋成了不存在的 UIEngine 成员（运行时会读到 undefined）');

	// ② 镜像退役后真正承重的那条：store 的引擎转发清单必须都能在 UIEngine 上找到实现
	const storeSrc = readSource(join(ROOT, 'packages/editor/src/stores/ui.ts'));
	const keysBlock = storeSrc.match(/const uiEngineForwardKeys = \[([\s\S]*?)\] as const;/);
	ok(
		keysBlock !== null,
		'找不到 uiEngineForwardKeys —— store 的转发写法变了，请复核本用例而不是删掉它'
	);
	const engineKeys = [...keysBlock[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
	ok(engineKeys.length > 0, 'uiEngineForwardKeys 不该为空');
	const missingImpl = engineKeys.filter(
		(k) => !new RegExp(`^UIEngine\\.${k}\\s*=`, 'm').test(engineSrc)
	);
	eq(
		missingImpl,
		[],
		'这些槽位被 store 当作「引擎实现」转发，但 UIEngine 上没有定义 ⇒ 运行时静默 undefined'
	);
});

test('遗留层还在 ⟹ 与目录无关的挂载点轴非 0；且 1c-store-slot-gaps 的 0 必须被独立重算解释', () => {
	// 这一条守的是 2026-09-21 实测到的**假绿三连**：
	//
	//   - `legacy-ui-lines` 写死 `packages/editor/src/ui`，而目录已被搬到 `engine/ui/legacy/`
	//     ⇒ `collectFiles` 对不存在的目录返回 `[]` ⇒ 读到 **0**，报表写「✓ 已完成」；
	//   - `legacy-ui-refs` 用 `^@app/ui/` 前缀 + 只认 `import … from`，而真实引用是
	//     `export { UI } from '@app/engine/ui/legacy/ui-window.ts'` ⇒ 也读到 **0**；
	//   - 与此同时 `ui-singleton-members` 报 **103 处挂载**。**两条轴自相矛盾时先怀疑仪器。**
	//
	// `collectFiles` 永不报错、`importRefs` 永不报错 —— 仪器瞎了不会有任何信号，
	// 所以必须有一条用例把「主体还在」与「读数非 0」绑在一起。
	//
	// ⚠️ **2026-09-21 第 97 轮改过**：`1c-store-slot-gaps` 现在**合法地为 0** ——
	// 阶段 1c ③ 已把 7 个域模块全部搬出 `legacy/`，那里只剩 `ui-window.ts` 的对象字面量
	// 与接线文件。所以原先那条「遗留层还在 ⟹ 槽位轴非 0」的前提**不再成立**，
	// 但它要守的东西还在。新判据把它拆成两半，**比原来更强**：
	//   ① 「主体还在」由**与目录无关**的 `ui-singleton-members` 口径守（数 `UI.x =` 处数）；
	//   ② 「轴为 0」必须能被**独立重算**解释 —— 直接翻遗留目录，若其中仍有属于 store 引用、
	//      且不是 `UIEngine.x = …` 镜像的 `UI.<slot> =`，那实现就仍在遗留层，轴不该是 0。
	const winRel = uiWindowRel();
	ok(winRel !== null, '找不到 UI 窗口文件；本用例的前提变了，请复核而不是删掉它');
	const legacyDir = dirname(winRel);
	const legacyFiles = collectFiles({ dirs: [legacyDir], includeTests: true });
	ok(
		legacyFiles.length > 0,
		`${legacyDir} 下应有文件（把目录写死会让这里静默返回空 → 行数轴假 0）`
	);
	const refs = importRefs(collectFiles({ dirs: SCAN_DIRS }), /^@app\/engine\/ui\/legacy\//);
	ok(
		refs.total > 0,
		'遗留 UI 单例应当仍被静态引用（若为 0：要么真删干净了，要么仪器漏了 `export … from`）'
	);
	// ① 「主体还在」：**判据在 2026-09-22 第 114 轮换过一次，必须记下来。**
	//    原判据是「遗留目录里仍有 `UI.<name> =` 挂载（用与目录无关的 ui-singleton-members 口径证）」。
	//    阶段 1c 第 ④-2c 步退役了那 21 行 `UI.x = UIEngine.x` 镜像之后，实测遗留目录里
	//    **一条直接挂载都不剩了**（它们是最后一批）⇒ 原判据前提消失，会一直红。
	//    要守的东西没变：**不能因为仪器瞎了而把「已搬完」读成 0**。新的正向信号取「单例本体仍在这里」：
	//      · 域槽位的**嵌套**挂载（`UI.list.copy = null` 这类，不属本轴口径，但证明对象字面量还在）；
	//      · store 桥的安装（`Object.defineProperty(UI, key, …)`，见本文件另一条用例的口径说明）。
	//    这两者可都在 ui-window.ts 里被搬走/掏空时立刻变红。
	const legacySrc = codeOnly(legacyFiles.map(({ full }) => readSource(full)).join('\n'));
	const hasSingletonBody =
		/Object\.defineProperty\(\s*UI\s*,/.test(legacySrc) &&
		/\bUI\.[A-Za-z_$][\w$]*\.[A-Za-z_$][\w$]*\s*=/.test(legacySrc);
	ok(
		hasSingletonBody,
		'遗留目录里应仍是 UI 单例本体所在处（桥安装 + 嵌套挂载）；两者都读不到 ⇒ 扫描面瞎了，或本体已被搬走'
	);
	// 另留一条**与目录无关**的读数：全局挂载点轴仍非 0（全体 82 处都在 engine/ui/ 的域模块里）。
	const singletonMembers = countCodeMatches(
		collectFiles({ dirs: SCAN_DIRS })
			.map(({ full }) => readSource(full))
			.join('\n'),
		UI_SINGLETON_RE
	);
	ok(
		singletonMembers > 0,
		'全仓仍应有 UI 槽位挂载（1c ①–③ 的产物在 engine/ui/ 各域模块里）；读到 0 ⇒ ui-singleton-members 瞎了'
	);

	// ② 「轴为 0」必须能被独立重算解释（在遗留目录里直接翻 `UI.<slot> =`）。
	// 注意这不是复述轴的实现：轴是从「遗留目录**之外**有没有赋值」反推的，
	// 这里是从「遗留目录**之内**还有没有实现」正推的 —— 两条路必须给出同一个答案。
	const engineSrc = readSource(
		join(ROOT, 'packages', 'editor', 'src', 'engine', 'ui', 'ui-engine.ts')
	);
	const storeRefs = storeReferencedSlots();
	const stillLegacy = new Set();
	for (const { full } of legacyFiles) {
		const src = codeOnly(readSource(full));
		for (const m of src.matchAll(/\bUI\.([A-Za-z_$][\w$]*)\s*=/g)) {
			const slot = m[1];
			if (!storeRefs.has(slot)) continue;
			// `UI.x = UIEngine.x` 是**镜像**，实现在 ui-engine.ts，不算「实现只在遗留层」。
			if (new RegExp(`^UIEngine\\.${slot}\\s*=`, 'm').test(engineSrc)) continue;
			stillLegacy.add(slot);
		}
	}
	eq(
		[...stillLegacy].sort((a, b) => a.localeCompare(b)),
		[],
		'遗留目录里仍有「实现只在遗留层」的 store 槽位 —— 此时 1c-store-slot-gaps 不该是 0'
	);
	eq(
		legacyOnlyStoreSlots().length,
		stillLegacy.size,
		'正推（翻遗留目录）与反推（轴的排除口径）不一致 ⇒ 先怀疑仪器，别信任何一边'
	);

	// ③ 上面那条交叉校验在「两边都是 0」时是**平凡成立**的 —— 所以再加一条能当场咬人的：
	// 排出判据本身必须仍按**目录**判（遗留目录内的算「没搬出去」，已搬到 `engine/ui/` 的模块算「搬了」）。
	// 这条与轴的读数无关，因此不会被「反正都是 0」掩盖。
	const dirRe = uiDirRe();
	ok(dirRe.test(winRel), '「遗留目录」判据必须匹配 UI 窗口自己所在的那个文件');
	const movedModule = join('packages', 'editor', 'src', 'engine', 'ui', 'ui-file.ts');
	ok(
		!dirRe.test(movedModule),
		`已搬到 ${movedModule} 的域模块不该仍被算成「在遗留目录里」（否则搬运白做、轴假 0）`
	);
	// 最后一道：台账源码不得回退到那两个已证伪的硬编码口径（回退即静默假 0）
	const ledgerSrc = readSource(join(ROOT, 'scripts', 'migration-ledger.mjs'));
	ok(
		!ledgerSrc.includes("'src', 'ui'"),
		'legacy-ui-lines 又写死了 packages/editor/src/ui —— P5-B 搬运后它恒为 0'
	);
	ok(
		!ledgerSrc.includes('^@app\\/ui\\/'),
		'legacy-ui-refs 又用回了 @app/ui/ 前缀 —— 现路径是 @app/engine/ui/legacy/'
	);
});

test('ui-slot-coverage：engineBacked 的槽位不算「引用了却没人赋值」（样本自证，不依赖镜像是否已删）', () => {
	// 为什么需要**样本版**：真实仓库里那 7 个槽位**当前**正因为还有镜像赋值而读数为 0，
	// 所以「只断言真实读数」是**不可自证**的 —— 判据被改坏也看不出来。
	// 样本版能当场咬人：
	//   样本：refs = {a,b,c}；assigned = {a}；engineBacked = [b] ⇒ 只有 c 该算缺口。
	eq(
		unassignedStoreSlots(new Set(['a', 'b', 'c']), new Set(['a']), ['b']),
		['c'],
		'engineBacked 的 b 有家（实现在 ui-engine.ts）⇒ 不该算「引用了却没人赋值」'
	);
	// 反方向：把 b 从 engineBacked 里拿掉，它必须**出现** —— 证明确实是那条排除在起作用，
	// 而不是「恰好被别的条件挡掉了」。
	eq(
		unassignedStoreSlots(new Set(['a', 'b', 'c']), new Set(['a']), []),
		['b', 'c'],
		'b 不再是 engineBacked ⇒ 它必须作为「引用了却没人赋值」被报出来'
	);
});

test('ui-slot-coverage：真实仓库里 engineBacked 与 storeRefsUnassigned 不得相交（④-2c 的前置条件）', () => {
	// 这条守的是 2026-09-22 第 113 轮量出来的那件事：`assignedSlots()` 把 ui-window.ts 的镜像
	// 也算赋值 ⇒ ④-2c 删掉 21 行镜像时，那 7 个 engineBacked 槽位会**凭空**变成
	// 「引用了但没人赋值」，一次**正确**的删除被棘轮挡下。
	const { storeRefsUnassigned, engineBacked } = uiSlotCoverage();
	const both = engineBacked.filter((s) => storeRefsUnassigned.includes(s));
	eq(
		both,
		[],
		'这些槽位由引擎自己实现、且 store 已改走注册进来的 UIEngine ⇒ 不算「没人赋值」；' +
			'否则删镜像会被一条过时判据挡下'
	);
});

test('ui-facade-gaps：口径自证（三类「有家」都要认出来，其余的才算缺口）', () => {
	// 这条轴是 1c 第 ④ 步的工作单，口径必须自己站得住。三类「有家」——
	//   ① 在 store 的 `uiStateKeys` 里；② 在 facade 契约里声明；
	//   ③ 引擎自己定义（`UIEngine.<name> =`，如 renderingFunction / requestRendering）
	// ——都要被排除，其余才是缺口。下面三个样本各验一个方向。
	const { engineReads, missing } = uiFacadeGaps();

	ok(engineReads > 0, '引擎应当至少读一个 `this.<x>`；为 0 说明扫描面瞎了');
	ok(
		!missing.includes('renderingFunction'),
		'`renderingFunction` 由 ui-engine 自己定义（那 21 行镜像的来源）⇒ 家就是引擎，不该算缺口'
	);
	ok(!missing.includes('hover'), '`hover` 已在 uiStateKeys 里 ⇒ 不该算缺口');

	// ⚠️ 「必须算进来」这个方向**不能写死某个成员名** —— ④ 一推进它就有家了，用例会变成绊脚石
	// （第 99 轮实测过：临时加一个声明了 `body` 的 facade，写死 `body` 的断言当场变红）。
	// 改成断言**契约本身**：缺口里的每一项都必须真的「无家」——不在 store 键里、也非引擎自有。
	// 这样它在 ④ 全过程中都成立，且口径一旦坏掉（例如 keys 正则失配）立刻能抓到。
	const storeSrc = readSource(join(ROOT, 'packages', 'editor', 'src', 'stores', 'ui.ts'));
	const keysMatch = storeSrc.match(/export const uiStateKeys = \[([\s\S]*?)\]\s*as const;/);
	ok(keysMatch !== null, '没能解析出 uiStateKeys —— 口径的前提变了，请复核而不是删掉这条用例');
	const keys = new Set([...keysMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]));
	const engineSrc = codeOnly(
		readSource(join(ROOT, 'packages', 'editor', 'src', 'engine', 'ui', 'ui-engine.ts'))
	);
	for (const name of missing) {
		ok(!keys.has(name), `缺口 \`${name}\` 其实已在 uiStateKeys 里 ⇒ 口径漏了`);
		ok(
			!new RegExp(`^UIEngine\\.${name}\\s*=`, 'm').test(engineSrc),
			`缺口 \`${name}\` 其实由引擎自己定义 ⇒ 口径漏了`
		);
	}
	ok(
		missing.length < engineReads,
		`缺口数（${missing.length}）应小于读点数（${engineReads}）—— 否则「有家」的判据全失效了`
	);
});

// ---------------------------------------------------------------------------
// 文本污染 —— 每条规则都必须能抓到「故意写坏」的样本
//
// 为什么必须有这一节：这类污染**语法合法**，`tsc` / `oxlint` / `oxfmt` / vitest 全都看不见
// （2026-09-21 实测：`as`→`0x07`+`s`、`textarea`→`<TAB>extarea`、两条语句被吞进 `//` 注释、
// 整段注释被复制进自己，四种形态全绿通过所有既有门禁）。规则写了却没人验证过它抓不抓得到，
// 与「门禁起不来」是同一个失败模式 —— 所以这里用**故意写坏的样本**逐条自证。
// ---------------------------------------------------------------------------

process.stdout.write('\n文本污染 —— 每条规则都要能抓到「故意写坏」的样本\n');

test('control-char：单词首字母被换成控制字符时命中', () => {
	eq(
		checkTextIntegrity(' * 各写一遍 \u0007s unknown as\n').map((i) => i.rule),
		['control-char']
	);
	eq(
		checkTextIntegrity(' * 代价：\u0008indInput 的 owner 形参\n').map((i) => i.rule),
		['control-char']
	);
	eq(
		checkTextIntegrity(' * 而 \u001bditor/owner 的实参顺序\n').map((i) => i.rule),
		['control-char']
	);
});

test('control-char：合法的 TAB / 换行 / 回车不算污染', () => {
	eq(checkTextIntegrity('const a = 1;\r\n\tconst b = 2;\n'), []);
});

test('replacement-char：U+FFFD（解码失败留下的坑）命中', () => {
	// 实测形态：一个中文字解不出来 → `\uFFFD`，常常还多带一个 `?`
	// （`// 存在1个参\uFFFD?` 的真值是 `// 存在1个参数`）。
	eq(
		checkTextIntegrity('// 存在1个参\uFFFD?\n').map((i) => i.rule),
		['replacement-char']
	);
	eq(
		checkTextIntegrity('/** \uFFFD原始 APK \uFFFD路径 */\n').map((i) => i.rule),
		['replacement-char']
	);
	// 正常中文注释不能被误报
	eq(checkTextIntegrity('// 存在1个参数\n'), []);
});

test('cjk-then-tab：中文后直接跟 TAB 时命中', () => {
	eq(
		checkTextIntegrity(' * 内部\textarea 元素\n').map((i) => i.rule),
		['cjk-then-tab', 'mid-line-tab']
	);
});

test('mid-line-tab：中文与 TAB 之间有一个空格（真实案例）时命中', () => {
	eq(
		checkTextIntegrity(' * 带历史记录的内部 \textarea 元素\n').map((i) => i.rule),
		['mid-line-tab']
	);
});

test('mid-line-tab：注释行里紧跟注释标记的 TAB（代码样例缩进）不算污染', () => {
	eq(checkTextIntegrity(' * \t[k: string]: any;\n'), []);
});

test('nested-comment-opener：注释体行尾又出现块注释起始符时命中', () => {
	eq(
		checkTextIntegrity(' * 不走本注册表：`/**\n').map((i) => i.rule),
		['nested-comment-opener']
	);
});

test('nested-comment-opener：glob 写法（packages/**）不算污染', () => {
	eq(checkTextIntegrity(' *   扫描 `packages/**` + `scripts/**`\n'), []);
});

test('glued-statement：字面量 \\n 把下一条语句粘进行注释时命中', () => {
	const rules = checkTextIntegrity('\t// 说明文字\\n\tfor (const m of xs) f(m);\n').map(
		(i) => i.rule
	);
	ok(
		rules.includes('glued-statement'),
		`期望命中 glued-statement，实际 ${JSON.stringify(rules)}`
	);
});

test("glued-statement：注释里解释转义串（如 `'\\n};'`）不算污染", () => {
	eq(checkTextIntegrity("// 与 `'\\n};'` 形态\n"), []);
});

test('duplicated-comment-block：连续 3 行注释被逐字重复时命中', () => {
	const bad = [
		'/**',
		' * alpha beta gamma',
		' * delta epsilon zeta',
		' * eta theta iota',
		' */',
		'/* 中间隔一段 */',
		' * alpha beta gamma',
		' * delta epsilon zeta',
		' * eta theta iota',
		' */'
	].join('\n');
	ok(
		checkTextIntegrity(bad).some((i) => i.rule === 'duplicated-comment-block'),
		'整段注释被重复时应当命中'
	);
});

test('文本污染：当前全仓零命中（规则不能靠「够宽」来制造工作量）', () => {
	// 上面每条证明了「规则抓得到故意写坏的样本」；这条证明「当前仓库确实干净」。
	// 两条合起来才说明门禁是有意义的：单看任何一条都可能被「规则从来不命中」骗过。
	const { issues } = scanTextIntegrity(ROOT);
	eq(
		issues.map((i) => `${i.rel}:${i.line}`),
		[]
	);
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
