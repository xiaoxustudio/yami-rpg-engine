import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setFocus = new CommandSchema({
	name: 'setFocus',
	fields: [
		{ key: 'operation', default: 'add' },
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'mode', default: 'control-child-buttons' },
		{ key: 'cancelable', default: true }
	],
	customParse({
		operation,
		element,
		mode,
		cancelable
	}: {
		operation: string;
		element: unknown;
		mode: string;
		cancelable: unknown;
	}) {
		const words = Command.words.push(Local.get!('command.setFocus.' + operation));
		switch (operation) {
			case 'add':
				if (mode === undefined) {
					mode = 'control-child-buttons';
				}
				words.push(Command.parseElement!(element));
				words.push(Local.get!('command.setFocus.' + mode));
				if (cancelable) {
					words.push(Local.get!('command.setFocus.cancelable'));
				}
				break;
			case 'remove':
				words.push(Command.parseElement!(element));
				break;
		}
		return [
			{ color: 'element' },
			{ text: Local.get!('command.setFocus') + Token(': ') },
			{ text: words.join() }
		];
	}
});
