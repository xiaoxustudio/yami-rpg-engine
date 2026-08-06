import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.simulateKey = new CommandSchema({
	name: 'simulateKey',
	fields: [
		{ key: 'operation', default: 'click' },
		{ key: 'keycode', default: '' }
	],
	onInitialize() {
		$('#simulateKey-confirm').on('click', () => this.save!());
		$('#simulateKey-operation').loadItems([
			{ name: 'Click', value: 'click' },
			{ name: 'Press', value: 'press' },
			{ name: 'Release', value: 'release' }
		]);
	},
	customParse({ operation, keycode }: any) {
		const words = Command.words
			.push(Local.get!('command.simulateKey.' + operation))
			.push(Command.setStringColor!(keycode));
		return [
			{ color: 'system' },
			{ text: Local.get!('command.simulateKey') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		getFocus($('#simulateKey-operation'));
	}
});
