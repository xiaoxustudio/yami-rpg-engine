import { readFileSync } from 'node:fs';

const d = JSON.parse(readFileSync(`${process.env.TEMP}/inv7.json`, 'utf8'));
const rows = d.windows
	.filter((w) => w.file.replace(/\\/g, '/').startsWith('components/tools'))
	.map((w) => {
		const consumers = new Set();
		for (const id of w.ids) for (const c of id.consumers) consumers.add(c);
		return { file: w.file, ids: w.ids.length, consumers: [...consumers] };
	});
for (const row of rows) {
	console.log(`${row.file}\t${row.ids} ids\t${row.consumers.join(' | ') || 'clean'}`);
}
console.log(`\n${rows.length} 个 tools 窗口`);
