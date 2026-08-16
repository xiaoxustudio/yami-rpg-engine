import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.gameData = new CommandSchema({
	name: 'gameData',
	fields: [
		{ key: 'operation', default: 'save' },
		{ key: 'index', default: 0 },
		{ key: 'variables', default: '' }
	],
	customParse({
		operation,
		index,
		variables
	}: {
		operation: string;
		index: unknown;
		variables: string;
	}) {
		const words = Command.words
			.push(Local.get!('command.gameData.' + operation))
			.push(Command.parseVariableNumber!(index));
		switch (operation) {
			case 'save':
				if (variables) {
					const label = Local.get!('command.gameData.variables');
					const keys = variables
						.split(/\s*,\s*/)
						.map((key: string) => Command.setVariableColor!(key));
					const string = keys.join(Token(', '));
					words.push(label + ' ' + Token('{') + string + Token('}'));
				}
				break;
		}
		return [
			{ color: 'system' },
			{ text: Local.get!('command.gameData') + Token(': ') },
			{ text: words.join() }
		];
	}
});
