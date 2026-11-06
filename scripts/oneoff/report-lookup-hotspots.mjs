import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** 元素注册表寻址最多的文件（修复方向优先级）。 */
const root = 'packages/editor/src';
const re =
	/\b[A-Za-z_$][\w$]*Els\s*\??\.\s*(?:get|set)\s*(?:\?\.)?\s*\(|registryElement(?:s)?\s*(?:<[^>]*>)?\s*(?:\?\.)?\s*\(/g;

const rows = [];
const walk = (dir) => {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) {
			walk(full);
			continue;
		}
		if (!/\.(ts|vue)$/.test(name) || name.includes('.spec.')) continue;
		const hits = readFileSync(full, 'utf8').match(re);
		if (hits) rows.push([hits.length, full.replace(`${root}\\`, '').replace(/\\/g, '/')]);
	}
};
walk(root);

rows.sort((a, b) => b[0] - a[0]);
for (const [count, file] of rows.slice(0, 20)) console.log(`${String(count).padStart(3)}  ${file}`);
console.log(`\n${rows.length} 个文件，共 ${rows.reduce((sum, row) => sum + row[0], 0)} 处`);
