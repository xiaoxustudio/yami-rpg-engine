import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
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

export function useGameDataCommandSchema() {
	const { form, load, commit } = useCommandSchema('gameData', {
		onLoad() {
			getFocus(document.getElementById('gameData-operation')!);
		}
	});
	const onSave = (): void => {
		const operation = read(document.getElementById('gameData-operation')!) ?? form.operation;
		const index = read(document.getElementById('gameData-index')!) ?? form.index;
		switch (operation) {
			case 'save': {
				const variables =
					read(document.getElementById('gameData-variables')!) ?? form.variables;
				commit({ operation, index, variables: variables.trim() });
				break;
			}
			case 'load':
			case 'delete': {
				commit({ operation, index });
				break;
			}
		}
	};
	Command.cases.gameData.customSave = onSave;
	return { form, save: onSave, load };
}
