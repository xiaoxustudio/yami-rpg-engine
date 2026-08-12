import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setTile = new CommandSchema({
	name: 'setTile',
	onInitialize() {
		$('#setTile-confirm').on('click', () => this.save!());
	},
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
			{ text: Local.get!('command.setTile') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({
		tilemap = { type: 'trigger' },
		tilemapX = 0,
		tilemapY = 0,
		tilesetId = '',
		tilesetX = 0,
		tilesetY = 0
	}) {
		const write = getElementWriter('setTile');
		write('tilemap', tilemap);
		write('tilemapX', tilemapX);
		write('tilemapY', tilemapY);
		write('tilesetId', tilesetId);
		write('tilesetX', tilesetX);
		write('tilesetY', tilesetY);
		getFocus($('#setTile-tilemap'));
	},
	customSave() {
		const read = getElementReader('setTile');
		const tilesetId = read('tilesetId');
		if (tilesetId === '') {
			return getFocus($('#setTile-tilesetId'));
		}
		Command.save!({
			tilemap: read('tilemap'),
			tilemapX: read('tilemapX'),
			tilemapY: read('tilemapY'),
			tilesetId,
			tilesetX: read('tilesetX'),
			tilesetY: read('tilesetY')
		});
	}
});
