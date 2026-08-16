import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.controlDialog = new CommandSchema({
	name: 'controlDialog',
	fields: [
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'operation', default: 'pause' }
	],
	customParse({ element, operation }: { element: unknown; operation: string }) {
		const words = Command.words
			.push(Command.parseElement!(element))
			.push(Local.get!('command.controlDialog.' + operation));
		return [
			{ color: 'element' },
			{ text: Local.get!('command.controlDialog') + Token(': ') },
			{ text: words.join() }
		];
	}
});
