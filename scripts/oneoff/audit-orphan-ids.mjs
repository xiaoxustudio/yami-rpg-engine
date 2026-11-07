import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';

/**
 * 一致性体检：**被读但没人登记**的注册表 id。
 *
 * 迁移中若先删登记、后忘改消费方，就会变成「读到的永远 undefined」—— 编译与 lint 都不报，
 * 只有真机或测试偶发才暴露（`animation-dirList` 就是这么发现的）。
 *
 * 「登记」的判定要覆盖几种真实写法，否则噪音会把线索埋掉：
 *   - `registerElement(reg, 'literal', …)` / `registryRef(reg, 'literal')`
 *   - 函数 ref：`fieldRef('literal')`、`:ref="bind('literal')"`
 *   - 骨架表 ids 表：`\tkey: 'literal',`
 *
 * 仍会漏「完全用变量拼 id」的登记，所以这是**线索**不是判定。
 */
const files = globSync('packages/editor/src/**/*.{ts,vue}');
const sources = new Map(files.map((file) => [file, readFileSync(file, 'utf8')]));

const registered = new Set();
const add = (list) => list.forEach((id) => registered.add(id));

for (const [, text] of sources) {
	add([...text.matchAll(/registerElement\(\s*\w+\s*,\s*'([^']+)'/g)].map((m) => m[1]));
	add([...text.matchAll(/registryRef\(\s*\w+\s*,\s*'([^']+)'\s*\)/g)].map((m) => m[1]));
	add([...text.matchAll(/\.set\(\s*'([^']+)'\s*,/g)].map((m) => m[1]));
	add([...text.matchAll(/fieldRef\(\s*'([^']+)'\s*\)/g)].map((m) => m[1]));
	add([...text.matchAll(/:ref="bind\(\s*'([^']+)'\s*\)"/g)].map((m) => m[1]));
	add([...text.matchAll(/^\t(\w+):\s*'([\w-]+)',?$/gm)].map((m) => m[2]));
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
		`      ← ${[...new Set(readers.map((f) => f.replace(/.*src\//, '')))].slice(0, 3).join(', ')}`
	);
}
