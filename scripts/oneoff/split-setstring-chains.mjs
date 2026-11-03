import { readFileSync, writeFileSync } from 'node:fs';

const file = 'packages/editor/src/composables/useSetStringFields.ts';
let text = readFileSync(file, 'utf8');

// `x?.enableHiddenMode?.()?.relate?.(` → 两句：enable 一次、relate 一次
text = text.replace(
	/([A-Za-z_$][\w$]*(?:\[[^\]]+\])?)\?\.enableHiddenMode\?\.\(\)\?\.relate\?\.\(/g,
	(_m, receiver) => `${receiver}?.enableHiddenMode?.();\n\t${receiver}?.relate?.(`
);

writeFileSync(file, text);
console.log('split', (text.match(/enableHiddenMode\?\.\(\);/g) ?? []).length);
