import { readFileSync } from 'node:fs';

const d = JSON.parse(readFileSync(`${process.env.TEMP}/inv6.json`, 'utf8'));
const windows = d.windows;

/** consumer 文件 → 它卡住了哪些窗口。 */
const windowsByConsumer = new Map();
for (const w of windows) {
	const consumers = new Set();
	for (const id of w.ids) for (const c of id.consumers) consumers.add(c.split(':')[0]);
	for (const c of consumers) {
		if (!windowsByConsumer.has(c)) windowsByConsumer.set(c, new Set());
		windowsByConsumer.get(c).add(w.file);
	}
}
const rows = [...windowsByConsumer]
	.map(([file, set]) => [file, set.size])
	.sort((a, b) => b[1] - a[1]);
console.log('consumerFile -> 被卡住的窗口数');
for (const [file, count] of rows) console.log(String(count).padStart(3), file);
console.log(`\n共 ${rows.length} 个消费方文件；窗口 ${windows.length} 个`);
