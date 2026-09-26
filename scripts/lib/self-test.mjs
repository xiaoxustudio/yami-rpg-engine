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
import { existsSync } from 'node:fs';
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
	LEGACY_UI_DIR,
	declaredSlots,
	declaredSlotsFrom,
	placeholdersAmong,
	singletonPlaceholders,
	providedSlots,
	declaredWithoutProvider,
	uiDirRe,
	uiFacadeGaps,
	uiSlotCoverage,
	unassignedStoreSlots,
	domainSingletonImporters,
	isLegacySingletonUiImport,
	objectLiteralKeys,
	keysOfObjectAt,
	facadeAssemblySites,
	objectPartsAt,
	resolveMemberKeys,
	assignedSlots
} from './ui-slots.mjs';
import { checkTextIntegrity, scanTextIntegrity } from './text-integrity.mjs';
import { detectMojibake } from './gbk-mojibake.mjs';

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

// ④-4 动手前必查（2026-09-22 第 186 轮）：`declaredSlots()` 的锚**钉在即将被删的字面量身上**。
// 字面量一删，旧实现返回 `[]` ⇒ `declared` 134 → 0、报表写「✓ 已完成」——与 PHASE 开头记的
// 「假绿三连」同型。**必须让「缺锚」与「真的删干净了」可区分**，所以缺锚=抛错。
process.stdout.write('\n④-4 前提 —— 缺锚必须炸，不能静默归零\n');
test('declaredSlotsFrom：写法免疫地取名；缺字面量/括号不配平必须抛错', () => {
	// 写法自证：类型标注可有可无（历史上「技法 5」改声明行就让旧实现瞎过一次）
	eq(
		declaredSlotsFrom('export const UI: UIShape = {\n\ta: null,\n\tb: null\n};\n'),
		['a', 'b'],
		'带类型标注的字面量应当照常取名'
	);
	eq(
		declaredSlotsFrom(
			'export const UI = {\n\tx: 1\n} satisfies Partial<UIShape> as UIShape;\n'
		),
		['x'],
		'`satisfies` 写法应当照常取名'
	);
	// 缺锚自证：这两条才是本用例存在的理由
	let missingThrew = false;
	try {
		declaredSlotsFrom('// 这里没有字面量\n');
	} catch {
		missingThrew = true;
	}
	ok(missingThrew, '缺字面量时必须抛错 —— 静默返回 [] 会让 ④-4 的归零无法与「仪器瞎了」区分');
	let unbalancedThrew = false;
	try {
		declaredSlotsFrom('export const UI = {\n\ta: null\n');
	} catch {
		unbalancedThrew = true;
	}
	ok(unbalancedThrew, '花括号不配平（源码截断/解析错）时也必须抛错');
	// 真实仓库：此刻字面量还在，读数必须非空（④-4 删掉它之后，这条会主动炸 ⇒ 逼出换锚）
	ok(declaredSlots().length > 0, '真实仓库里 declaredSlots() 此刻必须非空（134）');
});

// ④-4 前置判据（2026-09-22 第 187 轮）：删字面量**之前**，先问「谁还会提供这个槽位」。
// `providedSlots()` 只看提供者（域成员对象 / 家族文件里的 `this.x =` / store 桥 / `UIEngine` 实现），
// **完全不碰字面量** ⇒ 它若读到空，那是提供者口径瞎了，而不是「没有提供者」。
process.stdout.write('\n④-4 前置判据 —— 删之前，谁还会提供它\n');
test('providedSlots()：134 个声明槽位必须**全部**另有提供者（缺口=0）', () => {
	const declared = declaredSlots();
	const provided = providedSlots();
	ok(provided.size > 0, 'providedSlots() 读到空 ⇒ 提供者口径瞎了（它本不该依赖字面量）');
	// 自证它不是 declaredSlots() 的同义反复：字面量**从未声明**的运行期成员也必须被看见
	ok(
		[...provided].filter((s) => !declared.includes(s)).length > 0,
		'providedSlots() 看不见字面量之外的运行期成员 ⇒ 它退化成 declaredSlots() 的同义反复'
	);
	eq(
		declaredWithoutProvider(),
		[],
		'这些槽位一旦删掉字面量就失去唯一的家 ⇒ ④-4 必须先给它们安排住处'
	);
});

// ④-4 那一段的验收线（2026-09-25 第 212 轮）：要退役的是**占位表** —— 也就是
// 「出现在单例字面量里、而实现由别处（装配 / 引擎）提供」的那些键。它们正是历史上那 123 行
// `initialize: null` / `open: null` …（域模块先声明、后填充；④-3 之后改由 `uiWindowReady` 装配）。
process.stdout.write('\n④-4 验收线 —— 占位表退役（placeholders）\n');
test('placeholdersAmong：判据是「实现由别处提供」，不是「值是不是 null」', () => {
	// 纯函数自证（合成样本，不动真实仓库）
	eq(
		placeholdersAmong(
			'export const UI = {\n\tinitialize: null,\n\topen: null,\n\ttranslationKey: 0b0000\n};\n',
			new Set(['initialize', 'open'])
		),
		['initialize', 'open'],
		'装配会提供 initialize/open ⇒ 它们是占位；translationKey 有真值 ⇒ 不是'
	);
	eq(
		placeholdersAmong(
			// 第一版口径（值 == null）会在这里数出 4 条 —— 那 4 条是单例**自己真持有**的状态字段
			'export const UI = {\n\tdragging: null as T | null,\n\thover: null as U | null\n};\n',
			new Set(['initialize', 'open'])
		),
		[],
		'`dragging`/`hover` 的初值 null 有语义（`UI.dragging === null` 是判断），不算占位'
	);
	let missingThrew = false;
	try {
		placeholdersAmong('// 没有字面量\n', new Set(['a']));
	} catch {
		missingThrew = true;
	}
	ok(missingThrew, '缺字面量时 `declaredSlotsFrom()` 抛错 ⇒ 本判据不会静默返回空数组');
	// 真实仓库 + **非空自证**：两个提供者来源都必须看得见东西，否则 0 是"仪器瞎了"而不是"做到了"
	eq(singletonPlaceholders(), [], '真实仓库的占位表此刻必须已退役（placeholders = 0）');
	ok(
		declaredSlots().length > 0,
		'字面量此时仍在（还有单例真持有的字段）—— 它不是"已归零"，别把两者读混'
	);
});

// ⚠️ 上面那条测试记的是**本轴的盲区**（不是「这样写没问题」）：三种等价写法都读 0，
// 于是「把 82 行挂载改成成员对象 + 一次 Object.assign」就能让本轴归零而所有权没变。
// 补它的就是 ④-3 的伴随判据：改写法拿不到它。下面这条自证把那个洞**永久钉住**。
process.stdout.write('\n④-3 伴随判据 —— 改写法白拿的洞\n');
test('改写法让 ui-singleton-members 读 0，但伴随判据仍命中', () => {
	const src = [
		"import { UI } from './legacy/ui-window.ts';",
		'Object.assign(UI, { x() {} });',
		"for (const k of ['y']) UI[k] = () => {};",
		"Object.defineProperty(UI, 'z', { value: 1 });"
	].join('\n');
	eq(countCodeMatches(src, UI_SINGLETON_RE), 0, '同样的写法下旧轴读 0 —— 这正是要补的洞');
	eq(
		collectImports(src).filter(isLegacySingletonUiImport).length,
		1,
		'伴随判据必须认出那条运行时 import（否则洞还开着）'
	);
});

test('伴随判据只认「运行时 + 具名 UI + 遗留窗口」三条同时成立', () => {
	const hit = (s) => collectImports(s).filter(isLegacySingletonUiImport).length;
	eq(hit("import { UI } from './legacy/ui-window.ts';"), 1);
	// 仅类型导入不算「依赖单例去改它」
	eq(hit("import type { UI } from './legacy/ui-window.ts';"), 0);
	// 别的名字不算（域模块 import 形状/元素类是正常的，且不该降这条轴）
	eq(hit("import { UIShape } from './legacy/ui-window.ts';"), 0);
	// 别的来源不算
	eq(hit("import { UI } from '@app/stores/ui';"), 0);
	// 混合子句里带 UI 仍算
	eq(hit("import { type UIShape, UI } from './legacy/ui-window.ts';"), 1);
});

test('伴随判据的读数与「独立文本重算」一致（轴为 0 时必须能被解释）', () => {
	const { perFile } = domainSingletonImporters();
	for (const { rel } of perFile) {
		const src = readSource(join(ROOT, rel));
		ok(
			/import\s*\{[^}]*\bUI\b[^}]*\}\s*from\s*['"][^'"]*legacy\/ui-window/.test(src),
			`轴报的 ${rel} 必须真的有一条 import { UI } from legacy/ui-window（独立重算不一致 ⇒ 先怀疑仪器）`
		);
	}
});

process.stdout.write('\n④-3 facade 装配 —— 槽位实现搬出遗留层后的口径\n');
test('facade 装配的成员对象要算成「槽位被赋值」（否则仪器瞎、表现为回归）', () => {
	// 成员对象（含 IIFE 成员）的顶层键 —— 跨文件解析靠它
	const src = [
		'export const m: T = {',
		'  a() {},',
		'  b: (function IIFE() { const inner = { x: 1 }; return function () { return inner; }; })(),',
		'  c: 1,',
		'};'
	].join('\n');
	eq(objectLiteralKeys(src, 'm'), ['a', 'b', 'c'], '必须取到顶层键，且不被 IIFE 内部的逗号带偏');
	// 内联字面量同样要认（`Object.assign(UI, { … })`）
	eq(keysOfObjectAt('{ hasPrefab() {}, setAsPrefab: 1 }', 0), ['hasPrefab', 'setAsPrefab']);
	// 注释里的键不算
	eq(keysOfObjectAt('{ /* a: 1 */ b: 2 }', 0), ['b']);
	// 装配实参的三种写法都要认出名字 —— 尤其**点号路径**（`.then((m) => Object.assign(UI, m.x))`），
	// 漏了它仪器会当场失明（第 167 轮实测：三条轴假报回归）
	eq(facadeAssemblySites('Object.assign(UI, uiSlotsMembers)'), [{ name: 'uiSlotsMembers' }]);
	eq(facadeAssemblySites('Object.assign(UI, m.uiSlotsMembers)'), [{ name: 'uiSlotsMembers' }]);
	const inline = facadeAssemblySites('Object.assign(UI, { a() {} })')[0];
	ok(typeof inline?.open === 'number', '内联字面量要给出 `{` 的下标');
	eq('Object.assign(UI, { a() {} })'[inline.open], '{', '那个下标必须正好指向 `{`');
});

test('通用装配入口：多源 + `{ ...spread }` 都要解析（否则仪器第 5 次失明）', () => {
	// spread 那一支：汇总对象 `{ ...a, ...b, c: 1 }`
	eq(objectPartsAt('{ ...a, ...b, c: 1 }', 0).spreads, ['a', 'b']);
	eq(objectPartsAt('{ ...a, ...b, c: 1 }', 0).keys, ['c']);
	// **简写**也是合法写法（`{ initialize: initialize }` 可能被压成 `{ initialize }`）
	// —— 漏掉就是第 6 类失明
	eq(objectPartsAt('{ a, b: 1, c() {} }', 0).keys, ['a', 'b', 'c']);
	// 多源装配：三个源（含内联字面量）都要认出来
	eq(
		facadeAssemblySites('Object.assign(UI, m.uiMembers, m.other, { x() {} })').map(
			(s) => s.name ?? 'inline'
		),
		['uiMembers', 'other', 'inline']
	);
	// **传递**解析：`uiMembers` 是 `{ ...uiSlotsMembers }`，要展开到各域真正的槽位名
	const keys = resolveMemberKeys(collectFiles({ dirs: SCAN_DIRS }), ['uiMembers']);
	for (const k of [
		'hasPrefab',
		'clearInvalidPrefabs',
		'registerPreset',
		'unregisterPreset',
		'setAsPrefab',
		'unsetAsPrefab'
	]) {
		ok(keys.has(k), `uiMembers 应经 spread 传递展开出 ${k}（否则那些槽位会被误判成没实现）`);
	}
});

test('④-3 后家族判据仍要认域模块（它们不再写 `UI.x =`，但 `this.x =` 依旧算槽位）', () => {
	// 第 7 类失明：域模块改法后「文件里出现过 UI.x =」不再成立 ⇒ 它体内的 this.x = 被漏算
	// （实测 ui-initialize 的 13 处：assigned 132 → 119）。这些名字只在那个文件里以 this.x = 赋值。
	const assigned = assignedSlots();
	for (const k of ['translationTimer', 'zoomTimer', 'inspectorTypeMap', 'controlPoints']) {
		ok(
			assigned.has(k),
			`${k} 只在 ui-initialize.ts 里以 this.x = 赋值 ⇒ 家族判据必须认得「装配入口 import 的域模块」`
		);
	}
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
	// 2026-09-20 的一次纯目录搬运把整个 `src/ui/` 搬到 `src/engine/ui/legacy/` 之后，
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

test('④-4 收口 ⟹ 与目录无关的轴读 0，且「0」必须能被独立重算解释（目录真删了、单例没丢）', () => {
	// 这一条守的是 2026-09-21 实测到的**假绿三连**（历史见 `xr.md` 与 git）：
	//
	//   - `legacy-ui-lines` 写死 `packages/editor/src/ui`，而目录已被搬到 `engine/ui/legacy/`
	//     ⇒ `collectFiles` 对不存在的目录返回 `[]` ⇒ 读到 **0**，报表写「✓ 已完成」；
	//   - `legacy-ui-refs` 用 `^@app/ui/` 前缀 + 只认 `import … from`，而真实引用是
	//     `export { UI } from '@app/engine/ui/legacy/ui-window.ts'` ⇒ 也读到 **0**；
	//   - 与此同时 `ui-singleton-members` 报 **103 处挂载**。**两条轴自相矛盾时先怀疑仪器。**
	//
	// `collectFiles` 永不报错、`importRefs` 永不报错 —— 仪器瞎了不会有任何信号，
	// 所以必须有一条用例把「主体还在/已搬走」与「读数」绑在一起。
	//
	// ⚠️ **本用例换过三次锚，每次都写在案；换锚 ≠ 删判据**（规律见 `xr.md` 第 183 轮）：
	//   · 2026-09-21 第 97 轮：`1c-store-slot-gaps` 合法为 0（7 个域模块已搬出 `legacy/`）；
	//   · 2026-09-22 第 114 轮：「主体还在」的正向信号从「还有 `UI.x =` 挂载」换成
	//     「桥安装 + 嵌套挂载仍在」（那 21 行镜像退役后前者合法归零）；
	//   · **2026-09-25 第 212 轮（本轮）：前提从「遗留层**还在**」翻成「遗留层**已删**」**
	//     —— ④-4 把单例搬出 `legacy/`、删掉整个目录。
	// 要守的东西一字未变：**「轴读 0」必须能被独立重算解释**，不能是"仪器找不到了"。
	// 新判据拆成四半：
	//   ① **目录真没了**（用 `existsSync` 直接问文件系统，而不是 `collectFiles` 的返回值 —— 后者
	//      对"不存在"与"空目录"给同一个答案，正是这条轴历史上被骗过的地方）；
	//   ② **单例没丢**：内容定位仍找得到它、已不在遗留目录下、且本体的两处指纹还在（搬走 ≠ 掏空）；
	//   ③ 三条相关轴读 0，且**按前缀独立重算**一遍；
	//   ④ 判据本身仍按「遗留目录」判（域模块不会被算成遗留层，否则搬运白做、轴假 0）。
	ok(
		!existsSync(join(ROOT, LEGACY_UI_DIR)),
		`${LEGACY_UI_DIR} 应当已被 ④-4 删除（它还在 ⇒ 收口结论不成立）`
	);

	// ② 单例没丢
	const winRel = uiWindowRel();
	ok(winRel !== null, '找不到 UI 窗口文件；本用例的前提变了，请复核而不是删掉它');
	ok(
		!winRel.replace(/\\/g, '/').startsWith(`${LEGACY_UI_DIR}/`),
		`单例应当已搬出遗留层，实际仍在 ${winRel}`
	);
	const singletonSrc = codeOnly(readSource(join(ROOT, winRel)));
	ok(
		/Object\.defineProperty\(\s*UI\s*,/.test(singletonSrc) &&
			/\bUI\.[A-Za-z_$][\w$]*\.[A-Za-z_$][\w$]*\s*=/.test(singletonSrc),
		'新家里应仍是 UI 单例本体（桥安装 + 嵌套挂载）；两者都读不到 ⇒ 要么被掏空，要么扫描面瞎了'
	);

	// ③ 轴读 0 的独立重算（不复述轴的实现，直接按前缀数）
	eq(
		collectFiles({ dirs: [LEGACY_UI_DIR], includeTests: true }).length,
		0,
		'遗留目录下的文件数必须为 0（目录已删；非 0 ⇒ 有人把遗留层加回来了）'
	);
	eq(
		importRefs(collectFiles({ dirs: SCAN_DIRS }), /^@app\/engine\/ui\/legacy\//).total,
		0,
		'遗留层引用面必须为 0（按前缀独立数；非 0 ⇒ 仪器漏了 `export … from` 或 `import()`）'
	);

	// ④ 判据本身仍按「遗留目录」判：域模块不能被算成遗留层
	const dirRe = uiDirRe();
	ok(
		!dirRe.test(winRel),
		'单例已搬出 ⇒ 不该再匹配「遗留目录」判据（否则 legacyOnlyStoreSlots 会全算成遗留）'
	);
	const movedModule = join('packages', 'editor', 'src', 'engine', 'ui', 'ui-file.ts');
	ok(
		!dirRe.test(movedModule),
		`已搬到 ${movedModule} 的域模块不该被算成「在遗留目录里」（否则搬运白做、轴假 0）`
	);

	// ⑤ 「槽位仍被提供」由**另一个仪器**独立证：`assignedSlots()`（`ui-slot-coverage` 报 132）。
	//    它若与上面几条一起归零，才是真的瞎了（而不是"搬完了"）。
	ok(
		assignedSlots(collectFiles({ dirs: SCAN_DIRS })).size > 0,
		'`UI.x` 挂载点合法归零后，「槽位仍被提供」只能由独立仪器 assignedSlots() 证；它也读到 0 ⇒ 扫描面瞎了'
	);

	// 最后一道：台账源码不得回退到那两个已证伪的硬编码口径（回退即静默假 0）
	const ledgerSrc = readSource(join(ROOT, 'scripts', 'migration-ledger.mjs'));
	ok(
		!ledgerSrc.includes("'src', 'ui'"),
		'legacy-ui-lines 又写死了 packages/editor/src/ui —— P5-B 搬运后它恒为 0'
	);
	ok(
		ledgerSrc.includes('LEGACY_UI_DIR'),
		'legacy-ui-lines 必须继续按**遗留层目录常量**判（第 212 轮换锚：不再由「单例在哪」推导）'
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

// 复现误解码：UTF-8 字节被当成 GBK 解码。门禁要抓的就是这个变换，
// 所以自证样本由它现场生成 —— 而不是把一段乱码抄进源码（抄进来的乱码本身就是污染）。
const mojibakeOf = (s) => new TextDecoder('gbk').decode(Buffer.from(s, 'utf8'));

test('mojibake：无丢字的样本能一字不差还原（判据是可逆的）', () => {
	// 样本**现场生成**，不硬编码乱码字面量 —— 硬编码的乱码本身就成了仓库里的一处乱码，
	// 而且会被这条规则自己抓到（这正是第 125 轮学到的一课：样本要存就存可再生的形式）。
	const good = '// 控件';
	const bad = mojibakeOf(good);
	// 挑「控件」这两个字是有理由的：这一串字节按 GBK 解码**一个字节都不丢**（无 U+FFFD），
	// 所以它只触发 `mojibake`，而且判据必须**精确可逆**。丢字的形态在下一个用例。
	eq(
		checkTextIntegrity(`${bad}\n`).map((i) => i.rule),
		['mojibake']
	);
	eq(detectMojibake(bad)?.text, good);
	// 好文本不能被误报
	eq(checkTextIntegrity(`${good}\n`), []);
});

test('mojibake：真实事故的两种形态（丢字写半角 ? / 在乱码上再乱一次）仍然命中', () => {
	// 形态一：本仓那次事故的解码器把解不出的字节对写成**半角 `?`**（不是 U+FFFD），
	// 所以 `replacement-char` 规则放过了它；丢字会让后面的字节流全部错位。
	const good = '// 直接复制，更新语言包中的内容';
	const once = mojibakeOf(good);
	ok(once.includes('\uFFFD'), '这条样本本身应当含丢字留下的 U+FFFD');
	const lossy = once.replaceAll('\uFFFD', '?');
	// 只触发 `mojibake`：这就是「此前 7 条规则全都看不见它」的可执行证明
	// （把这条规则摘掉，本断言会变成 [] 并失败 —— 规则是自证的，不是声明自证的）。
	eq(
		checkTextIntegrity(`${lossy}\n`).map((i) => i.rule),
		['mojibake']
	);
	// 丢字处的 2 个字节永久丢失 ⇒ 判据只保证「没丢字的部分」精确：
	// 能读出来的中文必须是对的，但不可能整句一字不差（真实修复靠 `git log -L` 取旧版）。
	const hit = detectMojibake(lossy);
	ok(
		hit !== null && hit.text.includes('直接复制') && hit.text.includes('更新语'),
		`丢字形态下也应当还原出可读片段，实际 ${JSON.stringify(hit?.text)}`
	);
	// 形态二：在乱码上再误解码一次（`3f259bc9` 就是这么毁第二次的），仍须命中
	const twice = mojibakeOf(once);
	ok(
		checkTextIntegrity(`${twice}\n`).some((i) => i.rule === 'mojibake'),
		'两层乱码仍须命中'
	);
});

test('mojibake：以 \\u 转义写下的乱码字符不算污染（样本要存就存转义）', () => {
	// 这条守的是一个**自指的坑**：门禁自己的源码与自证样本就躺在被扫面里。
	// 乱码以转义形式存放时，文件里只有 ASCII ⇒ 既不被误报，也不会被二次转码。
	eq(checkTextIntegrity("const s = '\\u95ba\\u5099\\u80f6'; // 乱码样本\n"), []);
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
