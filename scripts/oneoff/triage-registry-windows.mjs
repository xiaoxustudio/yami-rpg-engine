#!/usr/bin/env node
/**
 * 批次分诊：某个窗口挂的注册表，**别处还有没有动态读**（`.get(x)` 变量、`for … of <reg>`、`.forEach`）。
 *
 * 为什么需要：`contract-inventory.mjs` 只认字面量 id 的消费方。`titleEls` / `windowShellEls` 这类
 * 注册表是**按变量 id 查**的查找表，静态看不见 —— 直接把窗口改成模板 ref，会让窗口管理器/标题栏
 * 静默找不到窗口。这个脚本把「注册表被动态读」暴露出来，先分诊再动模板。
 *
 * 用法：node scripts/oneoff/triage-registry-windows.mjs <src 相对路径…>
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = 'packages/editor/src';

function walk(dir, out = []) {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		const st = statSync(full);
		if (st.isDirectory()) walk(full, out);
		else if (/\.(ts|vue)$/.test(name)) out.push(full);
	}
	return out;
}

const sources = new Map(walk(SRC).map((f) => [f, readFileSync(f, 'utf8')]));

/** 某个注册表变量在「别的文件」里的动态读形态。 */
function dynamicReaders(registry, owner) {
	const hits = new Set();
	const probe = [
		new RegExp(`${registry}\\s*\\.\\s*get\\(\\s*[^'\\s)]`), // .get(variable)
		new RegExp(`for\\s*\\([^)]*of\\s*${registry}\\b`),
		new RegExp(`${registry}\\s*\\.\\s*forEach\\(`),
		new RegExp(`${registry}\\s*\\.\\s*entries\\(`),
		new RegExp(`${registry}\\s*\\.\\s*values\\(`),
		new RegExp(`${registry}\\s*\\.\\s*keys\\(`),
		new RegExp(`${registry}\\s*\\.\\s*size\\b`)
	];
	for (const [file, text] of sources) {
		const rel = relative(SRC, file).replace(/\\/g, '/');
		if (`${SRC}/${rel}` === owner || rel.endsWith('.spec.ts')) continue;
		if (!text.includes(registry)) continue;
		if (probe.some((re) => re.test(text))) hits.add(rel);
	}
	return [...hits];
}

for (const target of process.argv.slice(2)) {
	const owner = `${SRC}/${target.split('\\').join('/')}`;
	const text = sources.get(join(SRC, target)) ?? readFileSync(join(SRC, target), 'utf8');
	const registries = new Set();
	for (const m of text.matchAll(/registryRef\(\s*([\w$.]+)\s*,/g)) registries.add(m[1]);
	for (const m of text.matchAll(/(\w*Els)\s*\.\s*get\(/g)) registries.add(m[1]);
	const rows = [...registries].map((reg) => ({ reg, readers: dynamicReaders(reg, owner) }));
	const flagged = rows.filter((r) => r.readers.length > 0);
	const mark = flagged.length ? '⚠ 动态读' : '✓ 可迁';
	console.log(`${mark}  ${target}`);
	for (const row of rows) {
		console.log(
			`      ${row.reg}${row.readers.length ? ` ← ${row.readers.slice(0, 3).join(', ')}${row.readers.length > 3 ? ` …(+${row.readers.length - 3})` : ''}` : '（无动态读）'}`
		);
	}
}
