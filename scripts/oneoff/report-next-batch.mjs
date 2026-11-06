import { readFileSync } from 'node:fs';

/** 列出「单个消费方 + id 数少」的窗口，按 id 数排序 —— 最省事的下一批。 */
const data = JSON.parse(readFileSync(`${process.env.TEMP}/inv11.json`, 'utf8'));

const rows = [];
for (const window of data.windows) {
	if (window.schemaDynamic) continue;
	const consumers = new Set();
	for (const id of window.ids) for (const consumer of id.consumers) consumers.add(consumer);
	if (consumers.size === 0) continue;
	rows.push({
		file: window.file.replace(/\\/g, '/'),
		ids: window.ids.length,
		consumers: [...consumers]
	});
}

rows.sort((a, b) => a.ids - b.ids || a.consumers.length - b.consumers.length);
for (const row of rows.slice(0, 30)) {
	console.log(
		`${String(row.ids).padStart(3)} ids  ${row.consumers.length} 消费  ${row.file}  ← ${row.consumers.join(', ')}`
	);
}
console.log(`\n共 ${rows.length} 个窗口还有消费方`);
