import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setPointerEventRoot = new CommandSchema({
	name: 'setPointerEventRoot',
	fields: [
		{ key: 'operation', default: 'add' },
		{ key: 'element', default: { type: 'trigger' } }
	],
	customParse({ operation, element }: { operation: string; element: unknown }) {
		if (operation === 'set') {
			operation = 'add';
		}
		const words = Command.words.push(Local.get!('command.setPointerEventRoot.' + operation));
		switch (operation) {
			case 'add':
			case 'remove':
				words.push(Command.parseElement!(element));
				break;
		}
		return [
			{ color: 'element' },
			{ text: Local.get!('command.setPointerEventRoot') + Token(': ') },
			{ text: words.join() }
		];
	}
});
