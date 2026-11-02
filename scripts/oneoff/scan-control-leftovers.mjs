import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const files = execSync('git diff --name-only', { encoding: 'utf8' })
	.split(/\r?\n/)
	.filter((f) => f.endsWith('.vue'));

const PATTERNS = [
	['registryRef(', /registryRef\(/],
	['fieldEls', /fieldEls/],
	['boxRef(', /boxRef\(/],
	['boxes[', /boxes\[/],
	['registerElement(', /registerElement\(/],
	['registryElement(', /registryElement\(/],
	['createElementRegistry', /createElementRegistry/],
	['composableEls', /composableEls/],
	['frame.value', /frame\.value/],
	['as TextSuggestionTarget', /as TextSuggestionTarget/],
	['enableHiddenMode?.()?.', /enableHiddenMode\?\.\(\)\?\./]
];

let issues = 0;
for (const file of files) {
	const text = readFileSync(file, 'utf8');
	const hits = PATTERNS.filter(([, re]) => re.test(text)).map(([name]) => name);
	if (hits.length) {
		issues += 1;
		console.log(`${file}: ${hits.join(', ')}`);
	}
}
console.log(`\n${files.length} 个改动文件，${issues} 个仍有残留`);
