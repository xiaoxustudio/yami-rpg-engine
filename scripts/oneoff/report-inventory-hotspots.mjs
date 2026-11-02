import { readFileSync, writeFileSync } from 'node:fs';

const d = JSON.parse(readFileSync(`${process.env.TEMP}/inv5.json`, 'utf8'));
const windows = d.windows;
const clean = windows.filter(
	(w) => !w.schemaDynamic && w.ids.every((i) => i.consumers.length === 0)
);
console.log(`=== clean (${clean.length}) ===`);
for (const w of clean) console.log(w.file);

const byConsumer = new Map();
for (const w of windows) {
	for (const id of w.ids) {
		for (const c of id.consumers) {
			const file = c.split(':')[0];
			byConsumer.set(file, (byConsumer.get(file) ?? 0) + 1);
		}
	}
}
const top = [...byConsumer].sort((a, b) => b[1] - a[1]).slice(0, 18);
console.log('\n=== 消费方文件（被读 id 次数）===');
for (const [file, count] of top) console.log(String(count).padStart(4), file);

console.log('\nschemaDynamic windows:', windows.filter((w) => w.schemaDynamic).length);
writeFileSync(`${process.env.TEMP}/clean5.txt`, clean.map((w) => w.file).join('\n'));
