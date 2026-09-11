import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.deleteTile = new CommandSchema({
	name: 'deleteTile',
	fields: [
		{ key: 'tilemap', default: { type: 'trigger' } },
		{ key: 'tilemapX', default: 0 },
		{ key: 'tilemapY', default: 0 }
	],
	customParse({
		tilemap,
		tilemapX,
		tilemapY
	}: {
		tilemap: unknown;
		tilemapX: unknown;
		tilemapY: unknown;
	}) {
		const words = Command.words
			.push(Command.parseTilemap(tilemap))
			.push(Command.parseVariableNumber(tilemapX))
			.push(Command.parseVariableNumber(tilemapY));
		return [
			{ color: 'scene' },
			{ text: t('command.deleteTile') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useDeleteTileCommandSchema() {
	return useCommandSchema('deleteTile', {
		skipWrite: true,
		onLoad() {
			requestFocus('deleteTile-tilemap');
		}
	});
}
