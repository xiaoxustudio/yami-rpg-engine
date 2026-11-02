#!/usr/bin/env node
/**
 * 一次性 codemod：把「按 id 从 ElementRegistry 取裸元素」的窗口改成
 * 「`useControlRefs` 局部表 + 组件实例（defineExpose）」。
 *
 * 覆盖两种起点：
 *   ① 还挂着 `registryRef(<registry>, 'id')` 的窗口（控件进全局注册表）；
 *   ② 上一批已经落过**局部表**、但表里存的是**裸元素**的窗口（`boxRef` + `ControlElement` 那 22 行）。
 *      这类只是把查找搬出了注册表，元素 API 还在，`element-api-attach` 不会降。
 *
 * 只做机械改写，语义改动留给人工与编译器：
 *   - `el.enableHiddenMode()?.relate(…)` 这类**链式**写法依赖「返回值是元素」，codemod 拆成两句；
 *   - 需要 DOM 的站点（`clear()` / `TextSuggestion.listen()`）人工换成 `controlRoot()`。
 *
 * 用法：
 *   node scripts/oneoff/control-refs-codemod.mjs            # 干跑，打印每个文件的改写点
 *   node scripts/oneoff/control-refs-codemod.mjs --apply    # 落盘
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

/** 从 `boxRef('x')` / `registryRef(reg, 'x')` / `fieldEls.get('x')` 收集 id。 */
function collectIds(text) {
	const ids = new Set();
	for (const m of text.matchAll(/boxRef\(\s*'([^']+)'\s*\)/g)) ids.add(m[1]);
	for (const m of text.matchAll(/registryRef\(\s*\w+\s*,\s*'([^']+)'\s*\)/g)) ids.add(m[1]);
	for (const m of text.matchAll(/(?:fieldEls|boxEls)\s*\.\s*get\(\s*'([^']+)'\s*\)/g))
		ids.add(m[1]);
	return [...ids];
}

/** 定位「上一批留下的局部表」整块：从注释/`type ControlElement` 到 `boxRef` 结尾。 */
function stripLegacyTable(text, eol) {
	const legacyStart = text.search(
		/(?:\/\/[^\n]*\r?\n)*type ControlElement = HTMLElement & \{|const boxes: Record<string, ControlElement \| null> = \{\};/
	);
	if (legacyStart < 0) return { text, stripped: false };
	// `const boxRef = (id: string) => (el: unknown) => { … };` 的收尾
	const boxRefAt = text.indexOf('const boxRef = (id: string) => (el: unknown) => {', legacyStart);
	if (boxRefAt < 0) throw new Error('找到旧表头但找不到 boxRef 定义');
	let depth = 0;
	let end = -1;
	for (let i = text.indexOf('{', boxRefAt); i < text.length; i += 1) {
		if (text[i] === '{') depth += 1;
		else if (text[i] === '}') {
			depth -= 1;
			if (depth === 0) {
				// 跳到 `};`
				end = text.indexOf(eol, i);
				break;
			}
		}
	}
	if (end < 0) throw new Error('boxRef 定义没有按预期收尾');
	return { text: text.slice(0, legacyStart) + text.slice(end + eol.length), stripped: true };
}

/** 去掉注册表相关的 import 与局部注册表创建。 */
function stripRegistryGlue(text, eol) {
	return text
		.replace(
			new RegExp(
				`import \\{ createElementRegistry, registryRef \\} from '@app/utils/element-registry';${eol}`,
				'g'
			),
			''
		)
		.replace(
			new RegExp(
				`import \\{ composableEls \\} from '@app/composables/element-registry';${eol}`,
				'g'
			),
			''
		)
		.replace(
			new RegExp(
				`import \\{ createElementRegistry \\} from '@app/utils/element-registry';${eol}`,
				'g'
			),
			''
		)
		.replace(
			new RegExp(`const fieldEls = createElementRegistry\\(composableEls\\);${eol}`, 'g'),
			''
		);
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

const IMPORT_LINE = "import { useControlRefs } from '@app/composables/control-refs';";
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

	const legacy = stripLegacyTable(text, eol);
	text = legacy.text;
	const beforeRegistry = text;
	text = stripRegistryGlue(text, eol);
	const removedRegistry = beforeRegistry !== text;

	text = text
		.replace(
			/:ref="registryRef\(\s*fieldEls\s*,\s*'([^']+)'\s*\)"/g,
			':ref="controlRef(\'$1\')"'
		)
		.replace(/(?:fieldEls|boxEls)\s*\.\s*get\(\s*'([^']+)'\s*\)/g, "controls['$1']")
		.replace(/boxes\[/g, 'controls[')
		.replace(/boxRef\(/g, 'controlRef(')
		// `clear(el)` 要的是 DOM 节点（清空子节点），取根元素
		.replace(/clear\(controls\[([^\]]+)\]\)/g, 'clear(controlRoot(controls[$1]))');

	const { text: chained, hits: chainHits } = splitChains(text, 0);
	text = chained;

	// id 联合 + 表声明：插到最后一条 import 之后（模板/脚本都在作用域内）
	const decl = [
		'/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */',
		`type Id = ${ids
			.map((id) => `'${id}'`)
			.sort()
			.join(' | ')};`,
		'',
		'const { controls, controlRef } = useControlRefs<Id>();'
	].join(eol);
	const importStatements = [...text.matchAll(/^import [^\n]*;$/gm)];
	const lastImport = importStatements.at(-1);
	if (!lastImport) throw new Error(`${file}: 找不到 import 语句`);
	const insertAt = lastImport.index + lastImport[0].length;
	const importLine = text.includes('controlRoot(')
		? "import { controlRoot, useControlRefs } from '@app/composables/control-refs';"
		: IMPORT_LINE;
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
console.log(`\n${APPLY ? '已落盘' : '干跑'}：${REPORT.filter((r) => !r.skipped).length} 个文件`);
