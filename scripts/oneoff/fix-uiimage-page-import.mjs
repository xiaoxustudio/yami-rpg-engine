import { readFileSync, writeFileSync } from 'node:fs';

/** 修 `UIImagePage.vue` 被字面量 `\n` 写坏的一行 import。 */
const file = 'packages/editor/src/components/inspector/UIImagePage.vue';
const text = readFileSync(file, 'utf8');
const fixed = text.replace(
	"import { inspectorEls } from '@app/inspector/element-registry.ts';\\nimport { registryElements } from '@app/utils/element-registry';",
	"import { inspectorEls } from '@app/inspector/element-registry.ts';\nimport { registryElements } from '@app/utils/element-registry';"
);
writeFileSync(file, fixed);
console.log(fixed === text ? '! 没匹配到' : '✓ 已修');
