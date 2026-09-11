import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setTile = new CommandSchema({
	name: 'setTile',
	fields: [
		{ key: 'tilemap', default: { type: 'trigger' } },
		{ key: 'tilemapX', default: 0 },
		{ key: 'tilemapY', default: 0 },
		{ key: 'tilesetId', default: '' },
		{ key: 'tilesetX', default: 0 },
		{ key: 'tilesetY', default: 0 }
	],
	customParse({
		tilemap,
		tilemapX,
		tilemapY,
		tilesetId,
		tilesetX,
		tilesetY
	}: {
		tilemap: unknown;
		tilemapX: unknown;
		tilemapY: unknown;
		tilesetId: unknown;
		tilesetX: unknown;
		tilesetY: unknown;
	}) {
		const words = Command.words
			.push(Command.parseTilemap!(tilemap))
			.push(Command.parseVariableNumber!(tilemapX))
			.push(Command.parseVariableNumber!(tilemapY))
			.push(Command.parseFileName!(tilesetId))
			.push(Command.parseVariableNumber!(tilesetX))
			.push(Command.parseVariableNumber!(tilesetY));
		return [
			{ color: 'scene' },
			{ text: t('command.setTile') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetTileCommandSchema() {
	const { form, load, commit } = useCommandSchema('setTile', {
		skipWrite: true,
		onLoad() {
			requestFocus('setTile-tilemap');
		}
	});
	const onSave = (): void => {
		const tilesetId = form.tilesetId as string;
		if (tilesetId === '') {
			requestFocus('setTile-tilesetId');
			return;
		}
		commit({
			tilemap: form.tilemap,
			tilemapX: form.tilemapX,
			tilemapY: form.tilemapY,
			tilesetId,
			tilesetX: form.tilesetX,
			tilesetY: form.tilesetY
		});
	};
	Command.cases.setTile.customSave = onSave;
	return { form, save: onSave, load };
}
