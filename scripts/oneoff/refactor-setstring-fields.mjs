#!/usr/bin/env node
/**
 * 把 `useSetStringFields` 从「按 id 读注册表」改成「入参是控件表」。
 *
 * 改造要点（与 `useIfConditionFields` / `useSetNumberOperandFields` 同口径）：
 *   - 参数从 `ElementRegistry` 换成 `SetStringFieldTable`（id → 控件实例，`ControlApi`）；
 *   - `fieldEls.get('x')` → `fields['x']`；
 *   - `relate()` 的 targets 仍是 DOM 语义 → 用 `controlRoot(fields['x'])` 取根元素。
 *
 * targets 用括号配平扫描而不是正则：`targets: [` … `]` 里是数组字面量，正则容易被
 * 换行/嵌套括号带偏（这一处之前用正则试过，静默 0 命中）。
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'packages/editor/src/composables/useSetStringFields.ts';
let text = readFileSync(FILE, 'utf8');

text = text.replace(/fieldEls\s*\.\s*get\(\s*'([^']+)'\s*\)/g, "fields['$1']");

/** 从 `[` 起配平到 `]`，返回闭括号下标。 */
function matchBracket(source, open) {
	let depth = 0;
	for (let i = open; i < source.length; i += 1) {
		const ch = source[i];
		if (ch === '[' || ch === '(' || ch === '{') depth += 1;
		else if (ch === ']' || ch === ')' || ch === '}') {
			depth -= 1;
			if (depth === 0) return i;
		}
	}
	return -1;
}

let wrapped = 0;
let from = 0;
for (;;) {
	const at = text.indexOf('targets:', from);
	if (at < 0) break;
	const open = text.indexOf('[', at);
	const close = matchBracket(text, open);
	if (close < 0) throw new Error('targets 数组不闭合');
	let inner = text.slice(open + 1, close);
	inner = inner.replace(/\bfields\[('[^']+')\]/g, (_m, id) => {
		wrapped += 1;
		return `controlRoot(fields[${id}])`;
	});
	text = `${text.slice(0, open + 1)}${inner}${text.slice(close)}`;
	from = open + 1 + inner.length + 1;
}

writeFileSync(FILE, text);
console.log(`wrapped ${wrapped} relate targets`);
