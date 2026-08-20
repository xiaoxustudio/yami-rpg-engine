import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

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
