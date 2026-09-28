// 从实现里抽出 `Animation.<name>` 的成员表（第 245 轮）。
//
// 用法：node scripts/oneoff/gen-anim-api.mjs > members.txt
//
// 三条规则（都是前面几轮踩出来的）：
//  1. IIFE 形态 `Animation.x = (function () { … return function (this: typeof Animation, a, b) {…} })();`
//     ⇒ 取**带 `this: typeof Animation` 的那个** function 的形参（找不到才用外侧的）；
//  2. 形参表里任何前导 `this: …` 段一并去掉（否则会生成 `(& HTMLElement, event)` 这种语法错误）；
//  3. 调用点实参比实现多的那批成员（LOOSE）追加 `...args: unknown[]`：实现形参少时仍可赋给它。
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIRS = ['packages/editor/src/animation', 'packages/editor/src/engine/animation'];
const LOOSE = new Set([
	'cloneFrame',
	'copy',
	'delete',
	'unselectMarquee',
	'selectMarquee',
	'pasteFrame',
	'selectFrame',
	'setDirection',
	'openLayer',
	'paste',
	'play',
	'setMotion',
	'setHover',
	'shiftLayerPosition',
	'translationKeyup',
	'setMotionMode',
	'addEventListener',
	'outerTimelineListPointermove'
]);

function paramsAt(text, open) {
	let depth = 0;
	for (let i = open; i < text.length; i++) {
		if (text[i] === '(') depth++;
		else if (text[i] === ')') {
			depth--;
			if (depth === 0) return { body: text.slice(open + 1, i), end: i };
		}
	}
	return null;
}

function stripThis(params) {
	const text = params.replace(/\s+/g, ' ').trim();
	if (!text.startsWith('this')) return text;
	let depth = 0;
	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		if (ch === '{' || ch === '[' || ch === '(' || ch === '<') depth++;
		else if (ch === '}' || ch === ']' || ch === ')' || ch === '>') depth--;
		else if (ch === ',' && depth === 0) return text.slice(i + 1).trim();
	}
	return '';
}

const tidy = (s) =>
	stripThis(s)
		.replace(/(\w+) = (false|true)\b/g, '$1?: boolean')
		.replace(/(\w+) = (-?\d+(?:\.\d+)?)\b/g, '$1?: number');

const files = DIRS.flatMap((dir) =>
	readdirSync(dir)
		.filter((f) => f.endsWith('.ts'))
		.map((f) => join(dir, f))
);

const impls = new Map();
for (const file of files) {
	const text = readFileSync(file, 'utf8');
	for (const m of text.matchAll(/^(\w+)\.(\w+) = function\s*\(/gm)) {
		const outer = paramsAt(text, m.index + m[0].length - 1);
		if (!outer) continue;
		const rest = text.slice(outer.end, outer.end + 1500);
		const innerMatch = /return function\s*\(/.exec(rest);
		let inner = null;
		if (innerMatch) {
			const parsed = paramsAt(rest, innerMatch.index + innerMatch[0].length - 1);
			if (parsed) inner = parsed.body;
		}
		const candidates = [outer.body, ...(inner ? [inner] : [])];
		const withThis = candidates.find((p) => /^\s*this:\s*typeof Animation\b/.test(p));
		impls.set(`${m[1]}.${m[2]}`, tidy(withThis ?? candidates[0]));
	}
}

const resolved = new Map();
for (const file of files) {
	const text = readFileSync(file, 'utf8');
	for (const m of text.matchAll(/^Animation\.(\w+) = (\w+)\.(\w+);/gm)) {
		const found = impls.get(`${m[2]}.${m[3]}`);
		if (found !== undefined) resolved.set(m[1], found);
	}
}
for (const [key, params] of impls) {
	if (key.startsWith('Animation.')) resolved.set(key.slice('Animation.'.length), params);
}

for (const [name, params] of [...resolved].sort((a, b) => a[0].localeCompare(b[0]))) {
	const loose = LOOSE.has(name);
	const list =
		params.trim() === ''
			? loose
				? '...args: unknown[]'
				: ''
			: params + (loose ? ', ...args: unknown[]' : '');
	console.log(`\t${name}: (${list}) => unknown;`);
}
console.error(`// members: ${resolved.size}`);
