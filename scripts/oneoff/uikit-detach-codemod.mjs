#!/usr/bin/env node
// 一次性 codemod：删掉 ui-kit 组件里的 `attachApi(el, {...})` 语句（括号配对，不靠行猜测）。
// 用法：FILES=a.vue,b.vue node scripts/oneoff/uikit-detach-codemod.mjs [--apply]
import { readFileSync, writeFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const files = (process.env.FILES ?? '')
	.split(',')
	.map((s) => s.trim())
	.filter(Boolean);

function matchParen(text, open) {
	let depth = 0;
	for (let i = open; i < text.length; i += 1) {
		if (text[i] === '(') depth += 1;
		else if (text[i] === ')') {
			depth -= 1;
			if (depth === 0) return i;
		}
	}
	return -1;
}

for (const file of files) {
	let text = readFileSync(file, 'utf8');
	const at = text.indexOf('attachApi(');
	if (at < 0) {
		console.log(`SKIP ${file}`);
		continue;
	}
	const open = text.indexOf('(', at);
	const close = matchParen(text, open);
	let end = close + 1;
	while (text[end] === ' ' || text[end] === '\t') end += 1;
	if (text[end] === ';') end += 1;
	const lineStart = text.lastIndexOf('\n', at) + 1;
	// 连同行首缩进与行尾换行一起删
	let tail = end;
	while (text[tail] === ' ' || text[tail] === '\t') tail += 1;
	if (text[tail] === '\r') tail += 1;
	if (text[tail] === '\n') tail += 1;
	text = text.slice(0, lineStart) + text.slice(tail);
	text = text.replace(/import \{ attachApi \} from '[^']*';\r?\n/, '');
	if (APPLY) writeFileSync(file, text);
	console.log(`${APPLY ? 'OK' : 'dry'} ${file}`);
}
