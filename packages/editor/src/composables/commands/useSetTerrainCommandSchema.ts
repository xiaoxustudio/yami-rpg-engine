/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setTerrain = new CommandSchema({
	name: 'setTerrain',
	fields: [
		{ key: 'position', default: { type: 'absolute', x: 0, y: 0 } },
		{ key: 'terrain', default: 'land' }
	],
	customParse({ position, terrain }: { position: unknown; terrain: string }) {
		const words = Command.words
			.push(Command.parsePosition!(position))
			.push(t('command.setTerrain.' + terrain));
		return [
			{ color: 'scene' },
			{ text: t('command.setTerrain') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetTerrainCommandSchema() {
	return useCommandSchema('setTerrain', {
		onLoad() {
			getFocus(document.getElementById('setTerrain-position'));
		}
	});
}
