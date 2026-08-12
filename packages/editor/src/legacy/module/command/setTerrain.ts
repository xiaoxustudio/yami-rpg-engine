import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setTerrain = new CommandSchema({
	name: 'setTerrain',
	onInitialize() {
		$('#setTerrain-confirm').on('click', () => this.save!());
		$('#setTerrain-terrain').loadItems([
			{ name: 'Land', value: 'land' },
			{ name: 'Water', value: 'water' },
			{ name: 'Wall', value: 'wall' }
		]);
	},
	customParse({ position, terrain }: { position: unknown; terrain: string }) {
		const words = Command.words
			.push(Command.parsePosition!(position))
			.push(Local.get!('command.setTerrain.' + terrain));
		return [
			{ color: 'scene' },
			{ text: Local.get!('command.setTerrain') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({ position = { type: 'absolute', x: 0, y: 0 }, terrain = 'land' }) {
		const write = getElementWriter('setTerrain');
		write('position', position);
		write('terrain', terrain);
		getFocus($('#setTerrain-position'));
	},
	customSave() {
		const read = getElementReader('setTerrain');
		Command.save!({
			position: read('position'),
			terrain: read('terrain')
		});
	}
});
