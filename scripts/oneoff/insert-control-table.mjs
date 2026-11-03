import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
let text = readFileSync(file, 'utf8');
if (text.includes('useControlRefs<')) {
	console.log('already has table');
	process.exit(0);
}
const ids = [...new Set([...text.matchAll(/controlRef\('([^']+)'\)/g)].map((m) => m[1]))].sort(
	(a, b) => a.localeCompare(b)
);
const eol = text.includes('\r\n') ? '\r\n' : '\n';
const decl = [
	'/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */',
	`type Id = ${ids.map((id) => `'${id}'`).join(' | ')};`,
	'',
	'const { controls, controlRef } = useControlRefs<Id>();'
].join(eol);
const imports = [...text.matchAll(/^import [^\n]*;$/gm)];
const last = imports.at(-1);
const at = last.index + last[0].length;
text = `${text.slice(0, at)}${eol}import { useControlRefs } from '@app/composables/control-refs';${eol}${eol}${decl}${text.slice(at)}`;
writeFileSync(file, text);
console.log(`inserted ${ids.length} ids`);
