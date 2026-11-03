import { readFileSync } from 'node:fs';

const FILE = 'packages/editor/src/composables/useSetStringFields.ts';
let text = readFileSync(FILE, 'utf8');
text = text.replace(/fieldEls\s*\.\s*get\(\s*'([^']+)'\s*\)/g, "fields['$1']");

let wrapped = 0;
const out = text.replace(/targets:\s*\[([^\]]*)\]/g, (whole, inner) => {
	const next = inner.replace(/(?<!controlRoot\()\bfields\[('[^']+')\]/g, (_m, id) => {
		wrapped += 1;
		return `controlRoot(fields[${id}])`;
	});
	return `targets: [${next}]`;
});

console.log('wrapped', wrapped);
console.log('changed', out !== text);
console.log(JSON.stringify(out.match(/targets: \[[^\]]*\]/)?.[0]?.slice(0, 90)));
