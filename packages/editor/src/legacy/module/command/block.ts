import { $ } from '@/util/dom.ts';
import { getFocus, on, read, write } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.block = new CommandSchema({
	name: 'block',
	onInitialize() {
		on($('#block-confirm'), 'click', () => this.save!());
	},
	customParse({ note, asynchronous, commands }: any) {
		if (asynchronous === undefined) {
			asynchronous = false;
		}
		const asyncFlag = asynchronous ? Command.setOperatorColor!('*') : '';
		const blockNote = note || asyncFlag ? Token(': ') + note + asyncFlag : '';
		return [
			{ fold: true },
			{ color: 'flow' },
			{ text: Local.get!('command.block') + blockNote },
			{ children: commands },
			{ color: 'flow' },
			{ text: Local.get!('command.block.end') }
		];
	},
	customLoad({ note = '', asynchronous = false, commands = [] }) {
		write($('#block-note'), note);
		write($('#block-asynchronous'), asynchronous);
		getFocus($('#block-note'));
		this.commands = commands;
	},
	customSave() {
		const note = read($('#block-note')).trim();
		const asynchronous = read($('#block-asynchronous'));
		Command.save!({ note, asynchronous, commands: this.commands });
	}
});
