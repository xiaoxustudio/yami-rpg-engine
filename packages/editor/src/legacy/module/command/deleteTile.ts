import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

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
			{ text: Local.get!('command.deleteTile') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		getFocus($('#deleteTile-tilemap'));
	}
});
