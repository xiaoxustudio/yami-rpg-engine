import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus, read } from '@app/utils/element-utils';
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
	const { form, save, load, commit } = useCommandSchema('setTile', {
		onLoad() {
			getFocus(document.getElementById('setTile-tilemap'));
		}
	});
	const onSave = (): void => {
		const tilesetId = read(document.getElementById('setTile-tilesetId')) ?? form.tilesetId;
		if (tilesetId === '') {
			getFocus(document.getElementById('setTile-tilesetId'));
			return;
		}
		commit({
			tilemap: read(document.getElementById('setTile-tilemap')) ?? form.tilemap,
			tilemapX: read(document.getElementById('setTile-tilemapX')) ?? form.tilemapX,
			tilemapY: read(document.getElementById('setTile-tilemapY')) ?? form.tilemapY,
			tilesetId,
			tilesetX: read(document.getElementById('setTile-tilesetX')) ?? form.tilesetX,
			tilesetY: read(document.getElementById('setTile-tilesetY')) ?? form.tilesetY
		});
	};
	Command.cases.setTile.customSave = onSave;
	return { form, save: onSave, load };
}
