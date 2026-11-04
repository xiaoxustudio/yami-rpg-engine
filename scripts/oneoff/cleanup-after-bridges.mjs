import { readFileSync, writeFileSync } from 'node:fs';

/** 迁移后清理未使用 import，并修 `getSpriteListItems` 的 unknown 返回类型。 */
const edits = [
	{
		file: 'packages/editor/src/composables/commands/useAddAnimationComponentCommandSchema.ts',
		replacements: [
			["import { read } from '@app/utils/element-utils';\n", ''],
			["import type { YamiElement } from '@app/types/element-api';\n", '']
		]
	},
	{
		file: 'packages/editor/src/composables/commands/useRemoveAnimationComponentCommandSchema.ts',
		replacements: [
			["import { read } from '@app/utils/element-utils';\n", ''],
			["import type { YamiElement } from '@app/types/element-api';\n", '']
		]
	},
	{
		file: 'packages/editor/src/composables/commands/useChangeActorSpriteCommandSchema.ts',
		replacements: [
			["import { read, write } from '@app/utils/element-utils';\n", ''],
			["import type { YamiElement } from '@app/types/element-api';\n", ''],
			[
				'getChangeActorSpriteBridge()?.reloadSprite(items);',
				'getChangeActorSpriteBridge()?.reloadSprite(items as unknown[]);'
			]
		]
	},
	{
		file: 'packages/editor/src/composables/commands/useDownloadFileCommandSchema.ts',
		replacements: [["import { disable, enable } from '@app/utils/element-utils';\n", '']]
	}
];

for (const edit of edits) {
	let text = readFileSync(edit.file, 'utf8');
	for (const [from, to] of edit.replacements) text = text.replace(from, to);
	writeFileSync(edit.file, text);
	console.log(`✎ ${edit.file}`);
}
