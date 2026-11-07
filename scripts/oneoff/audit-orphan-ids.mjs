import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';

/**
 * 一致性体检：**被读但没人登记**的注册表 id。
 *
 * 迁移过程中如果先删了登记、后忘了改消费方，就会变成「读到的永远是 undefined」——
 * 编译与 lint 都不报，只有真机或测试偶发才暴露（`animation-dirList` 就是这么发现的）。
 *
 * 这是**线索**不是判定：动态拼出来的 id（`${prefix}-type`）与 worker/测试专用 id 会有噪音。
 */
const files = globSync('packages/editor/src/**/*.{ts,vue}');
const sources = new Map(files.map((file) => [file, readFileSync(file, 'utf8')]));

const registered = new Set();
for (const [, text] of sources) {
	for (const m of text.matchAll(/registerElement\(\s*\w+\s*,\s*'([^']+)'/g)) registered.add(m[1]);
	for (const m of text.matchAll(/registryRef\(\s*\w+\s*,\s*'([^']+)'\s*\)/g))
		registered.add(m[1]);
	for (const m of text.matchAll(/\.set\(\s*'([^']+)'\s*,/g)) registered.add(m[1]);
	// skeleton-table 的 ids 表
	for (const m of text.matchAll(/^\t(\w+):\s*'([\w-]+)',?$/gm)) registered.add(m[2]);
}

const readIds = new Map();
for (const [file, text] of sources) {
	if (file.includes('__tests__')) continue;
	for (const m of text.matchAll(/\w*Els\s*\.\s*get\(\s*'([^']+)'\s*\)/g)) {
		if (!readIds.has(m[1])) readIds.set(m[1], []);
		readIds.get(m[1]).push(file);
	}
	for (const m of text.matchAll(
		/registryElement(?:s)?\s*(?:<[^>]*>)?\s*\(\s*\w+\s*,\s*'([^']+)'/g
	)) {
		if (!readIds.has(m[1])) readIds.set(m[1], []);
		readIds.get(m[1]).push(file);
	}
}

const orphans = [...readIds.entries()].filter(([id]) => !registered.has(id));
orphans.sort((a, b) => b[1].length - a[1].length);

console.log(`被读但未登记：${orphans.length} 个 id\n`);
for (const [id, readers] of orphans) {
	console.log(`${String(readers.length).padStart(2)} 读  ${id}`);
	console.log(
		`      ← ${readers
			.map((f) => f.replace(/.*src\//, ''))
			.slice(0, 3)
			.join(', ')}`
	);
}
