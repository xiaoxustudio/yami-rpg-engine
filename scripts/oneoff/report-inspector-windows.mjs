import { readFileSync } from 'node:fs';

const d = JSON.parse(readFileSync(`${process.env.TEMP}/inv8.json`, 'utf8'));
const rows = d.windows
	.filter((w) => w.file.replace(/\\/g, '/').startsWith('components/inspector'))
	.map((w) => {
		const consumers = new Set();
		for (const id of w.ids) for (const c of id.consumers) consumers.add(c);
		return { file: w.file, ids: w.ids.length, consumers: [...consumers] };
	});
rows.sort((a, b) => a.consumers.length - b.consumers.length);
for (const row of rows) console.log(`${row.file}\t${row.ids} ids\t${row.consumers.join(' | ')}`);
console.log(`\n${rows.length} 个 inspector 窗口`);
