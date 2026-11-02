#!/usr/bin/env node
/**
 * relate 的 targets 是**DOM** 语义：`select-box-core.setRelatedDisplay()` 会读写
 * `element.style.display` 与它的兄弟节点（把左边的 `.text` 标签一起隐藏）。
 * 组件实例没有 `style`，所以这一处必须回落到根元素 —— 用 `controlRoot()` 包一层。
 */
import { readFileSync, writeFileSync } from 'node:fs';

const files = process.argv.slice(2);

/** 从 `(` 起做括号配平，返回闭括号下标。 */
function matchParen(text, open) {
	let depth = 0;
	for (let i = open; i < text.length; i += 1) {
		if (text[i] === '(' || text[i] === '[' || text[i] === '{') depth += 1;
		else if (text[i] === ')' || text[i] === ']' || text[i] === '}') {
			depth -= 1;
			if (depth === 0) return i;
		}
	}
	return -1;
}

for (const file of files) {
	let text = readFileSync(file, 'utf8');
	const before = text;
	let hits = 0;
	let from = 0;
	for (;;) {
		const call = text.indexOf('?.relate?.(', from);
		if (call < 0) break;
		const open = call + '?.relate?.'.length;
		const close = matchParen(text, open);
		if (close < 0) throw new Error(`${file}: relate 实参不闭合`);
		const args = text.slice(open, close + 1);
		const wrapped = args.replace(
			/(?<!controlRoot\()\bcontrols\[('[^']+')\]/g,
			(_match, id) => `controlRoot(controls[${id}])`
		);
		if (wrapped !== args) {
			text = text.slice(0, open) + wrapped + text.slice(close + 1);
			from = open + wrapped.length;
			hits += 1;
		} else {
			from = close + 1;
		}
	}
	if (hits > 0) {
		if (!/import \{[^}]*controlRoot/.test(text)) {
			text = text.replace(
				"import { useControlRefs } from '@app/composables/control-refs';",
				"import { controlRoot, useControlRefs } from '@app/composables/control-refs';"
			);
		}
		writeFileSync(file, text);
		console.log(`✎ ${file}（${hits} 处 relate targets）`);
	} else if (text !== before) {
		writeFileSync(file, text);
	}
}
