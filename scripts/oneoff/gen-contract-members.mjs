/**
 * ④-4 契约生成器：用 TS 类型检查器把「域成员对象」的**真实类型**打印出来。
 *
 * 为什么不是文本抬签名（第 193 轮实测）：69 个成员全是
 * `const X = function (this: UIShape, …) { … }` —— **返回类型是推断的**，源码里没有可抬的注解。
 * 类型检查器知道它们，正则不知道。
 *
 * 用法：node scripts/oneoff/gen-contract-members.mjs [--out <file>]
 */
import { createRequire } from 'node:module';
const require_ = createRequire(new URL('../../packages/editor/package.json', import.meta.url));
const ts = require_('typescript');
import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const cfg = ts.readConfigFile(join(ROOT, 'packages/editor/tsconfig.strict.json'), ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, join(ROOT, 'packages/editor'));
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();

const membersFile = parsed.fileNames.find((f) => f.endsWith('engine/ui/ui-members.ts'));
if (!membersFile) throw new Error('找不到 engine/ui/ui-members.ts');
const sf = program.getSourceFile(membersFile);
const moduleSym = checker.getSymbolAtLocation(sf);
const membersSym = checker.getExportsOfModule(moduleSym).find((s) => s.name === 'uiMembers');
if (!membersSym) throw new Error('ui-members.ts 没有导出 uiMembers');
const membersType = checker.getTypeOfSymbolAtLocation(
	membersSym,
	membersSym.valueDeclaration ?? sf
);

// 导出索引：名字 -> 相对模块路径（用于生成 import）
const index = new Map();
const walk = (d) => {
	for (const e of readdirSync(d)) {
		const p = join(d, e);
		if (statSync(p).isDirectory()) {
			if (!p.includes('__tests__') && !p.includes('node_modules')) walk(p);
			continue;
		}
		if (!e.endsWith('.ts') || e.includes('.spec.')) continue;
		for (const m of readFileSync(p, 'utf8').matchAll(
			/^export (?:interface|type|class|const|function|enum) ([A-Za-z_$][\w$]*)/gm
		)) {
			if (!index.has(m[1])) index.set(m[1], p.slice(ROOT.length + 1).replace(/\\/g, '/'));
		}
	}
};
walk(join(ROOT, 'packages/editor/src'));

const OPTIONAL_FIRST = new Set(['screenBlur', 'zoomFocus']);
const EVENT_WIDE = new Set(['listChange', 'listOpen', 'listPopup', 'listRecord', 'listSelect']);
const nullPlaceholders = new Set(
	[
		...readFileSync(
			join(ROOT, 'packages/editor/src/engine/ui/legacy/ui-window.ts'),
			'utf8'
		).matchAll(/^\t([A-Za-z_$][\w$]*)\s*:\s*null\s*,?/gm)
	].map((m) => m[1])
);
const UIOUT = 'packages/editor/src/engine/ui/ui-domain-contract.ts';
const lines = [];
const importsNeeded = new Set();
const skipped = [];
for (const prop of checker.getPropertiesOfType(membersType)) {
	const decl = prop.valueDeclaration ?? prop.declarations?.[0];
	if (!decl) {
		skipped.push(`${prop.name}: 无声明点`);
		continue;
	}
	const t = checker.getTypeOfSymbolAtLocation(prop, decl);
	let s = checker.typeToString(t, decl, ts.TypeFormatFlags.NoTruncation);
	// 丢掉 `this: UIShape` 参数：成员对象里的函数都带它，而契约里的成员不需要（这正是第 189 轮成环的根源）
	s = s
		.replace(/this:\s*UIShape\s*,\s*/g, '')
		.replace(/,\s*this:\s*UIShape\b/g, '')
		.replace(/this:\s*UIShape\b/g, '');
	if (s.length > 600) {
		skipped.push(`${prop.name}: 类型过长(${s.length})`);
		continue;
	}
	if (/\bUIShape\b|\bUIContextShape\b/.test(s)) {
		skipped.push(`${prop.name}: 含 UIShape`);
		continue;
	}
	const ids = [...new Set([...s.matchAll(/\b([A-Z][A-Za-z0-9_$]*)\b/g)].map((x) => x[1]))].filter(
		(x) =>
			![
				'Record',
				'Partial',
				'Array',
				'Promise',
				'Map',
				'Set',
				'Readonly',
				'Omit',
				'Pick',
				'Event',
				'KeyboardEvent',
				'PointerEvent',
				'MouseEvent',
				'WheelEvent',
				'HTMLElement',
				'Element',
				'Node',
				'DragEvent',
				'TouchEvent',
				'FocusEvent',
				'InputEvent',
				'ClipboardEvent',
				'CustomEvent',
				'Function',
				'Date',
				'RegExp',
				'Error'
			].includes(x)
	);
	const unresolved = ids.filter((x) => !index.has(x));
	if (unresolved.length) {
		skipped.push(`${prop.name}: 未解析 ${unresolved.join(',')}`);
		continue;
	}
	for (const id of ids) importsNeeded.add(id);
	// 显式覆盖表（第 201 轮）：这几个成员在 .vue 侧是按原生 Event 调用的（UI?.listSelect?.(event)、
	// event: Event），契约里的具体事件类比调用方窄。只放开**参数**类型，不动实现。
	if (OPTIONAL_FIRST.has(prop.name)) s = s.replace(/\((_?[a-z]\w*): /, '($1?: ');
	if (EVENT_WIDE.has(prop.name)) s = s.replace(/(\([^)]*?): [A-Za-z_$][\w$]*/, '$1: Event');
	const emitted = nullPlaceholders.has(prop.name)
		? s.includes('=>')
			? `(${s}) | null`
			: ` | null`
		: s;
	lines.push(`\t${prop.name}: ${emitted};`);
}
const rel = (mod) => {
	const from = 'packages/editor/src/engine/ui'.split('/');
	const t = mod.split('/');
	let i = 0;
	while (i < from.length && i < t.length - 1 && from[i] === t[i]) i++;
	const up = '../'.repeat(from.length - i);
	return (up === '' ? './' : up) + t.slice(i).join('/');
};
const importLines = [];
for (const id of [...importsNeeded].toSorted((a, b) => a.localeCompare(b))) {
	importLines.push('import type { ' + id + " } from '" + rel(index.get(id)) + "';");
}
const out = `/**\n * ④-4 契约（生成物 —— 由 scripts/oneoff/gen-contract-members.mjs 产出，第 193 轮）。\n *\n * 成员类型来自类型检查器对 \`uiMembers\` 的**推断**（源码里没有可抬的注解）。\n * 生成 ${lines.length} 条；跳过 ${skipped.length} 条（原因见生成器输出）。\n */\n${importLines.join('\n')}\n\nexport interface UIDomainMembers {\n${lines.join('\n')}\n}\n`;
writeFileSync(join(ROOT, UIOUT), out);
console.log(`生成 ${lines.length} 条 → ${UIOUT}`);
console.log(`跳过 ${skipped.length} 条，前 6：${skipped.slice(0, 6).join(' | ')}`);
console.log('前 3 条声明:');
lines.slice(0, 3).forEach((l) => console.log(l.slice(0, 100)));

// —— 收尾清理（第 193 轮）：生成物必须过本仓的门禁 ——
// ① 可选参数里再写 `| undefined` 是冗余（lint/typescript 会拦）；
// ② `=> any` 会被 lint 拦，且本仓 `any-hatches` 是棘轮轴 ⇒ 这类成员不进契约，留给手写清单。
{
	const f = join(ROOT, UIOUT);
	let cleaned = readFileSync(f, 'utf8')
		.replace(/(\?:\s*[^,)]+?)\s*\|\s*undefined/g, '$1')
		.split('\n')
		.filter((l) => !/=> any\b/.test(l))
		.join('\n');
	const n = cleaned.split('\n').filter((l) => /^\t[A-Za-z_$][\w$]*:/.test(l)).length;
	cleaned = cleaned.replace(/生成 \d+ 条/, `生成 ${n} 条`);
	writeFileSync(f, cleaned);
	console.log(`收尾清理后：${n} 条声明`);
}
