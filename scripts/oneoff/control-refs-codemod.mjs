#!/usr/bin/env node
/**
 * 一次性 codemod：把「按 id 从 ElementRegistry 取控件」的窗口改成
 * 「`useControlRefs` 局部表 + 组件实例（defineExpose）」。
 *
 * 覆盖两种起点：
 *   ① 还挂着 `registryRef(<reg>, 'id')` 的窗口（reg 可为 titleEls / inspectorEls / …）；
 *   ② 上一批已经落过**局部表**、但表里存的是**裸元素**的窗口（`boxRef` + `ControlElement` 那 22 行）。
 *      这类只是把查找搬出了注册表，元素 API 还在，`element-api-attach` 不会降。
 *
 * 只做机械改写，语义改动留给人工与编译器：
 *   - `el.enableHiddenMode()?.relate(…)` 这类**链式**写法依赖「返回值是元素」，codemod 拆成两句；
 *   - `clear(el)` 要 DOM，包成 `controlRoot(...)`；`relate()` 的 targets 由 `fix-relate-targets.mjs` 再包一层；
 *   - 残留 `registryElements` / `registerElement` / `attachElementApi` 的文件**跳过并报出** ——
 *     那些是路径 2（接桥）的活，机械改写会把「根元素 / 页面 API 的登记」一起删掉。
 *
 * 两条实现细节是踩出来的：
 *   - 注册表的 import 清理必须放在**改写之后**：改写前模板里还写着 `registryRef(windowShellEls, …)`，
 *     那时判断「这个注册表还被用着」永远为真，import 删不掉 → vue-tsc 报 TS6133；
 *   - 只在模板里用 `controlRef` 的文件不要解构 `controls`（脚本里没人用 → 同样 TS6133）。
 *
 * 用法：
 *   node scripts/oneoff/control-refs-codemod.mjs <src 相对路径…>            # 干跑
 *   node scripts/oneoff/control-refs-codemod.mjs <src 相对路径…> --apply    # 落盘
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'packages/editor/src');
const APPLY = process.argv.includes('--apply');
const FILES = process.argv
	.slice(2)
	.filter((a) => !a.startsWith('--'))
	.map((p) => join(SRC, p));

const eolOf = (s) => (s.includes('\r\n') ? '\r\n' : '\n');

/** 从 `registryRef(<reg>, 'x')` / `<reg>.get('x')` / `boxRef('x')` 收集 id。 */
function collectIds(text) {
	const ids = new Set();
	for (const m of text.matchAll(/boxRef\(\s*'([^']+)'\s*\)/g)) ids.add(m[1]);
	for (const m of text.matchAll(/registryRef\(\s*[\w$.]+\s*,\s*'([^']+)'\s*\)/g)) ids.add(m[1]);
	for (const m of text.matchAll(/\w*Els\s*\.\s*get\(\s*'([^']+)'\s*\)/g)) ids.add(m[1]);
	return [...ids];
}

/** 定位「上一批留下的局部表」整块：从注释/`type ControlElement` 到 `boxRef` 结尾。 */
function stripLegacyTable(text, eol) {
	const legacyStart = text.search(
		/(?:\/\/[^\n]*\r?\n)*type ControlElement = HTMLElement & \{|const boxes: Record<string, ControlElement \| null> = \{\};/
	);
	if (legacyStart < 0) return { text, stripped: false };
	const boxRefAt = text.indexOf('const boxRef = (id: string) => (el: unknown) => {', legacyStart);
	if (boxRefAt < 0) throw new Error('找到旧表头但找不到 boxRef 定义');
	let depth = 0;
	let end = -1;
	for (let i = text.indexOf('{', boxRefAt); i < text.length; i += 1) {
		if (text[i] === '{') depth += 1;
		else if (text[i] === '}') {
			depth -= 1;
			if (depth === 0) {
				end = text.indexOf(eol, i);
				break;
			}
		}
	}
	if (end < 0) throw new Error('boxRef 定义没有按预期收尾');
	return { text: text.slice(0, legacyStart) + text.slice(end + eol.length), stripped: true };
}

/** 去掉注册表相关的 import 与局部注册表创建（只删「改写后确实不再出现」的那些）。 */
function stripRegistryGlue(text, eol, registries) {
	let out = text;
	out = out.replace(
		new RegExp(
			`import \\{[^}]*\\bregistryRef\\b[^}]*\\} from '@app/utils/element-registry';${eol}`,
			'g'
		),
		''
	);
	out = out.replace(
		new RegExp(
			`import \\{[^}]*\\bcreateElementRegistry\\b[^}]*\\} from '@app/utils/element-registry';${eol}`,
			'g'
		),
		''
	);
	for (const reg of registries) {
		out = out.replace(
			new RegExp(`const ${reg} = createElementRegistry\\([^)]*\\);${eol}`, 'g'),
			''
		);
		const withoutImports = out
			.replace(/import \{[^}]*\} from '[^']*';/g, '')
			.replace(/import [\w$]+ from '[^']*';/g, '');
		if (!new RegExp(`\\b${reg}\\b`).test(withoutImports)) {
			out = out.replace(
				new RegExp(`import \\{[^}]*\\b${reg}\\b[^}]*\\} from '[^']*';${eol}`, 'g'),
				''
			);
		}
	}
	return out;
}

/** 链式调用拆成两句：`x?.enableHiddenMode?.()?.relate?.(…)` → enable 一次、relate 一次。 */
function splitChains(text) {
	let out = text;
	let hits = 0;
	const CHAIN = /\?\.\s*enableHiddenMode\?\.\(\)\s*\?\.\s*relate\?\.\(/;
	for (;;) {
		const match = CHAIN.exec(out);
		if (!match) break;
		const at = match.index;
		const argsStart = out.indexOf('(', at + match[0].length - 1);
		let depth = 0;
		let end = -1;
		for (let i = argsStart; i < out.length; i += 1) {
			if (out[i] === '(' || out[i] === '[' || out[i] === '{') depth += 1;
			else if (out[i] === ')' || out[i] === ']' || out[i] === '}') {
				depth -= 1;
				if (depth === 0) {
					end = i;
					break;
				}
			}
		}
		if (end < 0) throw new Error('relate 实参括号不闭合');
		const head = out.slice(0, at).replace(/\s+$/, '');
		const receiver = head.split(/[\s;{}]/).pop();
		const args = out.slice(argsStart + 1, end);
		const tail = out[end + 1] === ';' ? end + 2 : end + 1;
		out = `${head}?.enableHiddenMode?.();\n\t${receiver}?.relate?.(${args});${out.slice(tail)}`;
		hits += 1;
	}
	return { text: out, hits };
}

const REPORT = [];

for (const file of FILES) {
	const original = readFileSync(file, 'utf8');
	const eol = eolOf(original);
	let text = original;
	const ids = collectIds(text);
	if (ids.length === 0) {
		REPORT.push({ file, skipped: 'no ids' });
		continue;
	}

	const registries = new Set();
	for (const m of text.matchAll(/registryRef\(\s*([\w$.]+)\s*,/g)) registries.add(m[1]);
	for (const m of text.matchAll(/(\w*Els)\s*\.\s*get\(/g)) registries.add(m[1]);

	const legacy = stripLegacyTable(text, eol);
	text = legacy.text;

	// 先改写，再清 import：改写前模板里还在用注册表，清理会全部落空（见文件头注释）。
	text = text
		.replace(
			/:ref="registryRef\(\s*[\w$.]+\s*,\s*'([^']+)'\s*\)"/g,
			':ref="controlRef(\'$1\')"'
		)
		.replace(/=\s*registryRef\(\s*[\w$.]+\s*,\s*'([^']+)'\s*\)/g, "= controlRef('$1')")
		.replace(/\w*Els\s*\.\s*get\(\s*'([^']+)'\s*\)/g, "controls['$1']")
		.replace(/boxes\[/g, 'controls[')
		.replace(/boxRef\(/g, 'controlRef(')
		// `clear(el)` 要的是 DOM 节点（清空子节点），取根元素
		.replace(/clear\(controls\[([^\]]+)\]\)/g, 'clear(controlRoot(controls[$1]))');

	const { text: chained, hits: chainHits } = splitChains(text);
	text = chained;

	const beforeRegistry = text;
	text = stripRegistryGlue(text, eol, registries);
	const removedRegistry = beforeRegistry !== text;

	const residual = ['registryElements(', 'registerElement(', 'attachElementApi('].filter(
		(token) => text.includes(token)
	);
	if (residual.length) {
		REPORT.push({ file, skipped: `残留 ${residual.join(' / ')}（路径 2：接桥）` });
		continue;
	}

	// id 联合 + 表声明：插到最后一条 import 之后（模板/脚本都在作用域内）
	const readsControls = /\bcontrols\[/.test(text);
	const decl = [
		'/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */',
		`type Id = ${ids
			.map((id) => `'${id}'`)
			.sort()
			.join(' | ')};`,
		'',
		readsControls
			? 'const { controls, controlRef } = useControlRefs<Id>();'
			: 'const { controlRef } = useControlRefs<Id>();'
	].join(eol);
	const importStatements = [...text.matchAll(/^import [^\n]*;$/gm)];
	const lastImport = importStatements.at(-1);
	if (!lastImport) throw new Error(`${file}: 找不到 import 语句`);
	const insertAt = lastImport.index + lastImport[0].length;
	const importLine = text.includes('controlRoot(')
		? "import { controlRoot, useControlRefs } from '@app/composables/control-refs';"
		: "import { useControlRefs } from '@app/composables/control-refs';";
	text = `${text.slice(0, insertAt)}${eol}${importLine}${eol}${eol}${decl}${text.slice(insertAt)}`;

	// 表声明后面原来紧跟的注释/空行收一下，避免出现双空行
	text = text.replace(/(\r?\n){3,}/g, `${eol}${eol}`);

	REPORT.push({
		file,
		ids: ids.length,
		strippedLocalTable: legacy.stripped,
		removedRegistryGlue: removedRegistry,
		chainSplits: chainHits
	});
	if (APPLY) writeFileSync(file, text);
}

for (const row of REPORT) {
	if (row.skipped) {
		console.log(`- ${row.file}: ${row.skipped}`);
		continue;
	}
	console.log(
		`${APPLY ? '✎' : '·'} ${row.file}: ${row.ids} id` +
			(row.strippedLocalTable ? '，拆旧局部表' : '') +
			(row.removedRegistryGlue ? '，去注册表粘合' : '') +
			(row.chainSplits ? `，拆链 ${row.chainSplits} 处` : '')
	);
}
const done = REPORT.filter((r) => !r.skipped).length;
console.log(`\n${APPLY ? '已落盘' : '干跑'}：${done} 个文件可迁，${REPORT.length - done} 个跳过`);
