#!/usr/bin/env node
// 一次性 codemod：测试里的 `document.getElementById(id) as unknown as ControlEl`
// 改成 `controlApi(id)` —— 元素上不再挂 read/write，能力只在组件实例（defineExpose）上。
// 用法：node scripts/oneoff/spec-control-api-codemod.mjs [--apply]
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const APPLY = process.argv.includes('--apply');
const IMPORT = "import { controlApi } from '@app/__tests__/control-api';";

function walk(dir, out = []) {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) {
			if (name === 'node_modules' || name === 'dist') continue;
			walk(full, out);
		} else if (name.endsWith('.spec.ts')) out.push(full);
	}
	return out;
}

const files = walk(join(ROOT, 'packages/editor/src'));
const report = [];

for (const file of files) {
	let text = readFileSync(file, 'utf8');
	if (!text.includes('as unknown as ControlEl')) continue;
	const before = text;
	text = text.replace(
		/document\.getElementById\(([^()]*)\) as unknown as ControlEl/g,
		'controlApi($1) as unknown as ControlEl'
	);
	if (text === before) continue;

	if (!text.includes(IMPORT)) {
		const lines = text.split('\n');
		let lastImport = -1;
		for (let i = 0; i < lines.length; i += 1) {
			if (/^import\s/.test(lines[i])) lastImport = i;
		}
		lines.splice(lastImport + 1, 0, IMPORT);
		text = lines.join('\n');
	}

	if (APPLY) writeFileSync(file, text);
	report.push(`${APPLY ? 'OK' : 'dry'} ${relative(ROOT, file).replace(/\\/g, '/')}`);
}

console.log(report.join('\n'));
console.log(`\n共 ${report.length} 个文件${APPLY ? '已改写' : '（dry-run，加 --apply 落盘）'}`);
