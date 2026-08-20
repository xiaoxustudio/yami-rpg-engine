import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

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
