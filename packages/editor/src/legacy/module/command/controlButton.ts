import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.controlButton = new CommandSchema({
	name: 'controlButton',
	fields: [
		{ key: 'operation', default: 'select-default' },
		{ key: 'element', default: { type: 'trigger' } }
	],
	customParse({ operation, element }: { operation: string; element: unknown }) {
		const words = Command.words.push(Local.get!('command.controlButton.' + operation));
		switch (operation) {
			case 'select':
			case 'hover-mode':
			case 'active-mode':
			case 'normal-mode':
				words.push(Command.parseElement!(element));
				break;
		}
		return [
			{ color: 'element' },
			{ text: Local.get!('command.controlButton') + Token(': ') },
			{ text: words.join() }
		];
	}
});
