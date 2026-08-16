import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.block = new CommandSchema({
	name: 'block',
	fields: [
		{ key: 'note', default: '' },
		{ key: 'asynchronous', default: false }
	],
	customParse({
		note,
		asynchronous,
		commands
	}: {
		note: string;
		asynchronous: unknown;
		commands: unknown;
	}) {
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
	}
});
