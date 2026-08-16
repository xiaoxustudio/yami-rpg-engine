import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setElement = new CommandSchema({
	name: 'setElement',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'operation', default: 'hide' }
	],
	customParse({ element, operation }: { element: unknown; operation: string }) {
		const words = Command.words
			.push(Command.parseElement!(element))
			.push(Local.get!('command.setElement.' + operation));
		return [
			{ color: 'element' },
			{ text: Local.get!('command.setElement.alias') + Token(': ') },
			{ text: words.join() }
		];
	}
});
