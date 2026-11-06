import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';

/**
 * 逐个 `attachElementApi(el, { ... })` 站点，统计每个成员在**别的文件**里还有没有被调用。
 * 成员全无调用 => 这条 attach 已经死了，可以整条删（不需要先补 defineExpose）。
 *
 * 只认「像调用」的用法：`.<member>(`、`.<member>?.(`、`.<member>!.(`。
 * 这是**线索**不是判定：删之前仍然要看一眼、跑测试。
 */
const files = globSync('packages/editor/src/**/*.{ts,vue}').filter(
	(file) => !file.includes('__tests__')
);
const sources = new Map(files.map((file) => [file, readFileSync(file, 'utf8')]));

const readBy = (member, ownerFile) => {
	const patterns = [
		new RegExp(`\\.${member}\\?\\.\\(`),
		new RegExp(`\\.${member}\\(`),
		new RegExp(`\\.${member}!\\.\\(`)
	];
	const hits = [];
	for (const [file, text] of sources) {
		if (file === ownerFile) continue;
		if (patterns.some((pattern) => pattern.test(text))) hits.push(file);
	}
	return hits;
};

const rows = [];
for (const [file, text] of sources) {
	for (const match of text.matchAll(
		/(?:attachApi|attachElementApi)\s*(?:<[^>]*>)?\s*\([^,]+,\s*\{([\s\S]*?)\}\)/g
	)) {
		const members = [...match[1].matchAll(/([\w$]+)\s*:/g)].map((m) => m[1]);
		const dead = members.filter((member) => readBy(member, file).length === 0);
		if (members.length === 0) continue;
		rows.push({ file, members, dead, allDead: dead.length === members.length });
	}
}

rows.sort((a, b) => b.dead.length - a.dead.length);
for (const row of rows) {
	const flag = row.allDead ? '全死' : `存活 ${row.members.length - row.dead.length}`;
	console.log(
		`${String(row.dead.length).padStart(2)}/${String(row.members.length).padEnd(2)} ${flag.padEnd(7)} ${row.file.replace(/.*src\//, '')}`
	);
}
const allDead = rows.filter((row) => row.allDead);
console.log(`\nattach 站点 ${rows.length} 个；成员全无调用的 ${allDead.length} 个`);
