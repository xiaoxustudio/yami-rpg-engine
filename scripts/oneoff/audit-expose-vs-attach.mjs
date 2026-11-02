#!/usr/bin/env node
// 一次性探针：包装组件的 defineExpose 成员 vs attachElementApi 成员，找出「只有元素上才有」的成员。
// 迁移到组件实例（defineExpose）时，这类成员会在调用点静默变成 undefined。
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const dirs = ['packages/editor/src/components/common', 'packages/editor/src/components'];

function walk(dir, out = []) {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		const st = statSync(full);
		if (st.isDirectory()) {
			if (name === 'node_modules' || name === '__tests__') continue;
			walk(full, out);
		} else if (name.endsWith('.vue')) out.push(full);
	}
	return out;
}

const files = [...new Set(dirs.flatMap((d) => walk(join(ROOT, d))))];

function blockAfter(text, marker) {
	const at = text.indexOf(marker);
	if (at < 0) return null;
	const open = text.indexOf('{', at);
	if (open < 0) return null;
	let depth = 0;
	for (let i = open; i < text.length; i += 1) {
		const ch = text[i];
		if (ch === '{') depth += 1;
		else if (ch === '}') {
			depth -= 1;
			if (depth === 0) return text.slice(open + 1, i);
		}
	}
	return null;
}

/** 取对象字面量的一级键（`a, b: 1, c()` 与 `...rest` 都认）。 */
function keysOf(objText) {
	const keys = [];
	let depth = 0;
	let token = '';
	const flush = () => {
		const t = token.trim();
		if (t) {
			const m = /^([A-Za-z_$][\w$]*)/.exec(t);
			if (m) keys.push(m[1]);
		}
		token = '';
	};
	for (const ch of objText) {
		if ('{[('.includes(ch)) depth += 1;
		if ('}])'.includes(ch)) depth -= 1;
		if (ch === ',' && depth === 0) flush();
		else token += ch;
	}
	flush();
	return keys;
}

const rows = [];
for (const file of files) {
	const text = readFileSync(file, 'utf8');
	const expose = blockAfter(text, 'defineExpose(');
	const attach = blockAfter(text, 'attachElementApi(');
	if (!attach) continue;
	const exposed = expose ? keysOf(expose) : [];
	const attached = keysOf(attach.replace(/^[^,]*,/, ''));
	const missing = attached.filter((k) => !exposed.includes(k));
	rows.push({
		file: relative(ROOT, file).replace(/\\/g, '/'),
		hasExpose: Boolean(expose),
		attached: attached.length,
		exposed: exposed.length,
		missing
	});
}

rows.sort((a, b) => b.missing.length - a.missing.length);
const bad = rows.filter((r) => r.missing.length > 0);
console.log(`组件：attach ${rows.length} 个，其中 expose 缺成员 ${bad.length} 个\n`);
for (const row of rows) {
	const tag = row.missing.length ? '⚠' : '✓';
	console.log(
		`${tag} ${row.file}  attach=${row.attached} expose=${row.exposed}` +
			(row.missing.length ? `  缺: ${row.missing.join(', ')}` : '') +
			(row.hasExpose ? '' : '  (无 defineExpose)')
	);
}
