import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = 'packages/editor/src';
function walk(dir, out = []) {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		const st = statSync(full);
		if (st.isDirectory()) walk(full, out);
		else if (name.endsWith('.ts') && !name.endsWith('.spec.ts')) out.push(full);
	}
	return out;
}

const files = walk(SRC);
const sources = new Map(files.map((f) => [f, readFileSync(f, 'utf8')]));

/** 命令 schema → 它按 id 读的控件 / 窗口。 */
for (const [file, text] of sources) {
	const rel = relative(SRC, file).replace(/\\/g, '/');
	if (!rel.startsWith('composables/commands/')) continue;
	if (!/composableEls\s*\.\s*get\(|registryElement\s*\(/.test(text)) continue;
	const ids = new Set();
	for (const m of text.matchAll(
		/composableEls\s*\.\s*get\(\s*'([^']+)'|registryElement\s*\([\s\S]{0,60}?'([^']+)'/g
	))
		ids.add(m[1] ?? m[2]);
	const members = new Set();
	for (const m of text.matchAll(
		/\?\.\s*(loadItems|bind|write|read|enable|disable|setItemNames|on|input|write2)\b/g
	))
		members.add(m[1]);
	// 窗口文件：composables/commands/useXxxCommandSchema.ts → components/commands/Xxx.vue
	const base = rel
		.split('/')
		.pop()
		.replace(/^use/, '')
		.replace(/CommandSchema\.ts$/, '');
	console.log(
		`${rel}\n  window≈ components/commands/${base}.vue\n  ids: ${[...ids].join(', ')}\n  members: ${[...members].join(', ')}`
	);
}
