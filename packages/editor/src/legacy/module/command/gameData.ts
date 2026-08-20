import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

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
			.push(t('command.gameData.' + operation))
			.push(Command.parseVariableNumber!(index));
		switch (operation) {
			case 'save':
				if (variables) {
					const label = t('command.gameData.variables');
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
			{ text: t('command.gameData') + Token(': ') },
			{ text: words.join() }
		];
	}
});
