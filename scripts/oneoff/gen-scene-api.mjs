// 从实现里抽出 `Scene.<name>` 的成员表（第 2 轮的 SceneShape 站点准备）。
//
// 用法：node scripts/oneoff/gen-scene-api.mjs > scene-members.txt
//
// 规则沿用 animation 版（那边已走通）：IIFE 取内层形参、去掉前导 this 段、镜像回查引擎实现。
// Scene 侧多两种形态：`Scene.x = SceneEngine.y!;`（镜像带 `!`）与 `Scene.Point = class …`（值，跳过）。
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIRS = ['packages/editor/src/scene', 'packages/editor/src/engine/scene'];

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
		const withThis = candidates.find((p) => /^\s*this:\s*typeof Scene\b/.test(p));
		impls.set(`${m[1]}.${m[2]}`, tidy(withThis ?? candidates[0]));
	}
}

const resolved = new Map();
for (const file of files) {
	const text = readFileSync(file, 'utf8');
	for (const m of text.matchAll(/^Scene\.(\w+) = (\w+)\.(\w+)!?;$/gm)) {
		const found = impls.get(`${m[2]}.${m[3]}`);
		if (found !== undefined) resolved.set(m[1], found);
	}
}
for (const [key, params] of impls) {
	if (key.startsWith('Scene.')) resolved.set(key.slice('Scene.'.length), params);
}

for (const [name, params] of [...resolved].sort((a, b) => a[0].localeCompare(b[0]))) {
	console.log(`\t${name}: (${params}) => unknown;`);
}
console.error(`// scene members: ${resolved.size}`);
