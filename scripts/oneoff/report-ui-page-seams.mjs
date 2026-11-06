import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';

/** 扫描 inspector 页：找出「自己 registryElements / attachElementApi」的那些，列出接缝清单。 */
const pages = globSync('packages/editor/src/components/inspector/**/*.vue');

for (const file of pages) {
	const text = readFileSync(file, 'utf8');
	const usesRegistryElements = /registryElements\(inspectorEls/.test(text);
	const mount = /attachElementApi\(el, \{ ([^}]+) \}\)/.exec(text);
	const mountId = /inspectorEls\.get\('([\w-]+-vue-mount)'\)/.exec(text);
	if (!usesRegistryElements && !mount && !mountId) continue;
	console.log(
		[
			file.replace('packages/editor/src/components/inspector/', ''),
			usesRegistryElements ? 'registryElements' : '',
			mountId ? `mount=${mountId[1]}` : '',
			mount ? `api={${mount[1]}}` : ''
		]
			.filter(Boolean)
			.join(' | ')
	);
}
