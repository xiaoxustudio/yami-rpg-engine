import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.deleteElement = new CommandSchema({
	name: 'deleteElement',
	fields: [
		{ key: 'operation', default: 'delete-element' },
		{ key: 'element', default: { type: 'trigger' } }
	],
	customParse({ operation, element }: { operation: string; element: unknown }) {
		let info;
		switch (operation) {
			case 'delete-element':
				info = Command.parseElement!(element);
				break;
			case 'delete-children':
				info =
					Command.parseElement!(element) +
					Token(' -> ') +
					Local.get!('command.deleteElement.children');
				break;
			case 'delete-all':
				info = Local.get!('command.deleteElement.all-elements');
				break;
		}
		return [
			{ color: 'element' },
			{ text: Local.get!('command.deleteElement') + Token(': ') },
			{ text: info }
		];
	}
});
