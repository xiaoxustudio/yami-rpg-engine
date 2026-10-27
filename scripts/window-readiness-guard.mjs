#!/usr/bin/env node
/**
 * 窗口就绪门禁（window-readiness-guard）
 *
 * 背景：工具窗口是**按需挂载**的（`tools/tool-window-host.ts`），控件 API 在组件 `onMounted`
 * 里接线。于是两类写法定时失效：
 *   R1 `open(懒挂载窗口)` 之后在同一函数体里直接写控件 —— 首次打开时控件还不存在，
 *      `?.` 静默丢数据、非可选链直接抛错。正确写法是 `Window.openWith(id, prepare)`。
 *   R2 注册表取值后**非可选**解引用（`els.get('x') as Foo).bar`）—— 元素缺失即崩。
 *
 * 用法：
 *   node scripts/window-readiness-guard.mjs              校验（失败退出码 1）
 *   node scripts/window-readiness-guard.mjs --json       机器可读输出
 *   node scripts/window-readiness-guard.mjs --verbose    打印扫描范围与通过项
 *   node scripts/window-readiness-guard.mjs --selftest   验证门禁自身的判定口径
 *
 * 豁免：在 open 那一行或同一函数体内写 `// window-guard-allow: <理由>`。
 * 基线：`scripts/window-readiness-baseline.json` 记录 R2 的存量数（只降不升）。
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'packages/editor/src');
const BASELINE_FILE = join(ROOT, 'scripts/window-readiness-baseline.json');
const APP_SHELL = join(SRC, 'AppShell.vue');

const ARGV = new Set(process.argv.slice(2));
const AS_JSON = ARGV.has('--json');
const VERBOSE = ARGV.has('--verbose');
const SELFTEST = ARGV.has('--selftest');

const REGISTRIES = [
	'composableEls',
	'textCaptureEls',
	'conditionEls',
	'localEls',
	'sceneEls',
	'moduleEls',
	'titleEls',
	'storesEls',
	'eventEditorEls',
	'scriptCommandEls',
	'windowShellEls',
	'variableEls',
	'inspectorEls',
	'dataEls',
	'objectAttributeEls'
];

const WRITE_RE = new RegExp(
	`(?:${REGISTRIES.join('|')})\\s*\\.\\s*get\\s*\\(|\\.loadItems\\b|\\.setForm\\b|\\.write2?\\b|\\.save\\s*\\(|\\.style\\.|\\.textContent\\s*=`
);
const UNSAFE_DEREF_RE = new RegExp(
	`\\b(${REGISTRIES.join('|')})\\s*\\.\\s*get\\s*\\(\\s*'[^']+'\\s*\\)\\s*as\\s+[^;\\n]+?\\)\\s*\\.`,
	'g'
);
const WAIVER_RE = /window-guard-allow\s*:\s*(.+)/;

/** 从 AppShell 的 deferredToolIds 读出「懒挂载窗口」集合。 */
function loadDeferredIds() {
	const text = readFileSync(APP_SHELL, 'utf8');
	const block = text.match(/const deferredToolIds = \[([\s\S]*?)\];/);
	if (!block) return new Set();
	return new Set([...block[1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]));
}

const openCallRe = () =>
	new RegExp(
		`(?:Window\\.open!?|getWindowStore\\(\\)\\.open|(?<![.\\w])open!?)\\s*\\(\\s*'([\\w-]+)'`,
		'g'
	);

/** 从 index 起取「大括号深度不低于起点的后续文本」当作函数体近似。 */
function enclosingBlock(text, index) {
	const depthAt = (end) => {
		let depth = 0;
		for (let i = 0; i < end; i++) {
			const c = text[i];
			if (c === '{') depth++;
			else if (c === '}') depth--;
		}
		return depth;
	};
	const base = depthAt(index);
	let depth = base;
	const lines = text.slice(index).split('\n');
	const kept = [];
	for (let i = 0; i < lines.length && i < 200; i++) {
		const line = lines[i];
		kept.push(line);
		for (const c of line) {
			if (c === '{') depth++;
			else if (c === '}') depth--;
		}
		if (i > 0 && depth < base) break;
	}
	return kept.join('\n');
}

/**
 * 扫描一份源码。
 * @returns {{ opens: Array<{id:string,line:number,write:boolean,guarded:boolean,waived:string|null}>,
 *             unsafeDeref: Array<{line:number,text:string}> }}
 */
function scanSource(text, deferred) {
	const lineOf = (index) => text.slice(0, index).split('\n').length;
	const result = { opens: [], unsafeDeref: [] };

	for (const m of text.matchAll(openCallRe())) {
		const id = m[1];
		if (!deferred.has(id)) continue;
		const block = enclosingBlock(text, m.index);
		const write = WRITE_RE.test(block);
		if (!write) continue;
		const guarded = new RegExp(`(?:openWith|onToolWindowMounted)!?\\s*\\(\\s*'${id}'`).test(
			block
		);
		// 豁免注释常写在 open 的上一行：把前 3 行并入判定
		const before = text
			.slice(Math.max(0, m.index - 400), m.index)
			.split('\n')
			.slice(-3)
			.join('\n');
		const waived = (block.match(WAIVER_RE) ?? before.match(WAIVER_RE))?.[1]?.trim() ?? null;
		result.opens.push({ id, line: lineOf(m.index), write, guarded, waived });
	}

	for (const m of text.matchAll(UNSAFE_DEREF_RE)) {
		const lineStart = text.lastIndexOf('\n', m.index) + 1;
		const lineEnd = text.indexOf('\n', m.index);
		const lineText = text.slice(lineStart, lineEnd === -1 ? undefined : lineEnd).trim();
		const waived = lineText.match(WAIVER_RE)?.[1]?.trim() ?? null;
		result.unsafeDeref.push({ line: lineOf(m.index), text: lineText.slice(0, 120), waived });
	}

	return result;
}

function collectFiles(dir) {
	const files = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		const stat = statSync(full);
		if (stat.isDirectory()) {
			if (entry === '__tests__' || entry === 'node_modules') continue;
			files.push(...collectFiles(full));
			continue;
		}
		if (!/\.(ts|vue)$/.test(entry)) continue;
		if (entry.endsWith('.spec.ts')) continue;
		files.push(full);
	}
	return files;
}

function readBaseline() {
	if (!existsSync(BASELINE_FILE)) return { unsafeDeref: 0 };
	try {
		return JSON.parse(readFileSync(BASELINE_FILE, 'utf8'));
	} catch {
		return { unsafeDeref: 0 };
	}
}

function runScan() {
	const deferred = loadDeferredIds();
	const files = collectFiles(SRC);
	const openFindings = [];
	const derefFindings = [];

	for (const file of files) {
		const rel = relative(ROOT, file).replace(/\\/g, '/');
		let text;
		try {
			text = readFileSync(file, 'utf8');
		} catch {
			continue;
		}
		const { opens, unsafeDeref } = scanSource(text, deferred);
		for (const item of opens) {
			if (item.guarded || item.waived) continue;
			openFindings.push({ file: rel, ...item });
		}
		for (const item of unsafeDeref) {
			if (item.waived) continue;
			derefFindings.push({ file: rel, ...item });
		}
	}

	return { deferred: deferred.size, files: files.length, openFindings, derefFindings };
}

const SELFTEST_CASES = [
	{
		name: 'R1：懒挂载窗口 open 后直接写控件 → 命中',
		source: `function f() {
	Window.open!('insertImage');
	composableEls.get('insertImage-mode')?.loadItems([]);
}`,
		deferred: new Set(['insertImage']),
		expectOpen: 1,
		expectDeref: 0
	},
	{
		name: 'R1：openWith 包装 → 不命中',
		source: `function f() {
	Window.openWith!('insertImage', () => {
		composableEls.get('insertImage-mode')?.loadItems([]);
	});
}`,
		deferred: new Set(['insertImage']),
		expectOpen: 0,
		expectDeref: 0
	},
	{
		name: 'R1：模板常驻窗口（非 deferred）→ 不命中',
		source: `function f() {
	Window.open!('attribute');
	composableEls.get('attribute-type')?.loadItems([]);
}`,
		deferred: new Set(['insertImage']),
		expectOpen: 0,
		expectDeref: 0
	},
	{
		name: 'R1：显式豁免注释 → 不命中',
		source: `function f() {
	// window-guard-allow: 单元测试夹具
	Window.open!('insertImage');
	composableEls.get('insertImage-mode')?.loadItems([]);
}`,
		deferred: new Set(['insertImage']),
		expectOpen: 0,
		expectDeref: 0
	},
	{
		name: 'R2：注册表取值后非可选解引用 → 命中',
		source: `(titleEls.get('copyProgress-bar') as YamiElement).style.width = '0';`,
		deferred: new Set(),
		expectOpen: 0,
		expectDeref: 1
	},
	{
		name: 'R2：先取到变量再判空 → 不命中',
		source: `const bar = titleEls.get('copyProgress-bar') as YamiElement | null;
if (bar) bar.style.width = '0';`,
		deferred: new Set(),
		expectOpen: 0,
		expectDeref: 0
	}
];

function runSelftest() {
	let failed = 0;
	for (const testCase of SELFTEST_CASES) {
		const { opens, unsafeDeref } = scanSource(testCase.source, testCase.deferred);
		const openHits = opens.filter((item) => !item.guarded && !item.waived).length;
		const derefHits = unsafeDeref.filter((item) => !item.waived).length;
		const ok = openHits === testCase.expectOpen && derefHits === testCase.expectDeref;
		if (!ok) failed++;
		const mark = ok ? '✓' : '✗';
		console.log(
			`${mark} ${testCase.name}（open=${openHits}/${testCase.expectOpen}，deref=${derefHits}/${testCase.expectDeref}）`
		);
	}
	if (failed > 0) {
		console.error(`\n门禁口径自测失败：${failed} 例`);
		process.exit(1);
	}
	console.log('\n门禁口径自测通过。');
}

if (SELFTEST) {
	runSelftest();
	process.exit(0);
}

const { deferred, files, openFindings, derefFindings } = runScan();
const baseline = readBaseline();
const derefBudget = Number(baseline.unsafeDeref ?? 0);
const derefOver = derefFindings.length - derefBudget;

if (AS_JSON) {
	console.log(
		JSON.stringify(
			{
				scan: { files, deferredWindows: deferred },
				openWrites: openFindings,
				unsafeDeref: {
					count: derefFindings.length,
					budget: derefBudget,
					items: derefFindings
				},
				ok: openFindings.length === 0 && derefOver <= 0
			},
			null,
			2
		)
	);
} else {
	console.log('窗口就绪门禁（window-readiness-guard）');
	console.log(`  扫描：${files} 个文件 / ${deferred} 个懒挂载窗口`);
	console.log('');
	if (openFindings.length === 0) {
		console.log(
			'  ✓ R1 懒挂载窗口 open 后写控件：0 处（全部走 openWith / onToolWindowMounted）'
		);
	} else {
		console.log(`  ✗ R1 懒挂载窗口 open 后直接写控件：${openFindings.length} 处`);
		for (const item of openFindings) {
			console.log(`      ${item.file}:${item.line}  窗口 '${item.id}'`);
			console.log("        改法：Window.openWith('" + item.id + "', () => { ...写控件... })");
		}
	}
	console.log('');
	if (derefOver > 0) {
		console.log(
			`  ✗ R2 注册表取值后非可选解引用：${derefFindings.length} 处（基线 ${derefBudget}，超出 ${derefOver}）`
		);
		for (const item of derefFindings.slice(0, 20)) {
			console.log(`      ${item.file}:${item.line}  ${item.text}`);
		}
	} else {
		console.log(
			`  ✓ R2 注册表取值后非可选解引用：${derefFindings.length} 处（基线 ${derefBudget}，只降不升）`
		);
	}
	if (VERBOSE && derefFindings.length > 0) {
		console.log('\n  R2 明细：');
		for (const item of derefFindings)
			console.log(`    ${item.file}:${item.line}  ${item.text}`);
	}
	console.log('');
	if (openFindings.length === 0 && derefOver <= 0) {
		console.log('✓ 全部通过。\n');
	} else {
		console.error('✗ 门禁未通过：按上面的「改法」调整后重跑。\n');
		process.exit(1);
	}
}

if (openFindings.length !== 0 || derefOver > 0) process.exit(1);
