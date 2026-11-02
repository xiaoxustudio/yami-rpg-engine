#!/usr/bin/env node
/**
 * 迁后审计：某个已迁窗口自己的控件 id，是否仍被**别的文件**按 id 从 `composableEls` 读。
 *
 * 为什么需要：`contract-inventory.mjs` 只能看还挂着 `registryRef` 的窗口 —— 窗口一旦迁成
 * 模板 ref 就从清单里消失，于是「迁之前有全局消费方」这件事也一起消失。迁移的正确顺序是
 * 先查消费方再动手，这个脚本是那条顺序的**回溯校验**（迁移后跑一遍，确认没人还在读）。
 *
 * 用法：node scripts/oneoff/audit-migrated-controls.mjs <src 相对路径…>
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

const files = walk(SRC);
const sources = new Map(files.map((file) => [file, readFileSync(file, 'utf8')]));

let flagged = 0;
for (const target of process.argv.slice(2)) {
	const owner = join(SRC, target).replace(/\\/g, '/');
	const text = sources.get(join(SRC, target)) ?? readFileSync(join(SRC, target), 'utf8');
	const union = /type Id =([^;]+);/.exec(text);
	if (!union) continue;
	const ids = [...union[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
	const hits = [];
	for (const [file, other] of sources) {
		const rel = relative(join(process.cwd(), SRC), file).replace(/\\/g, '/');
		if (`${SRC}/${rel}` === owner || rel.endsWith('.spec.ts')) continue;
		for (const id of ids) {
			if (!other.includes(`'${id}'`)) continue;
			if (new RegExp(`composableEls\\s*\\.\\s*get\\(\\s*'${id}'`).test(other)) {
				hits.push(`${id} <- ${rel}:get`);
			}
			if (new RegExp(`registryElement[\\s\\S]{0,120}?'${id}'`).test(other)) {
				hits.push(`${id} <- ${rel}:registryElement`);
			}
		}
	}
	if (hits.length) {
		flagged += 1;
		console.log(`⚠ ${target}`);
		for (const hit of hits) console.log(`    ${hit}`);
	}
}
console.log(`\n${flagged} 个已迁窗口仍有全局消费方`);
process.exitCode = flagged ? 1 : 0;
