import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

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
		skipWrite: true,
		onLoad() {
			requestFocus('gameData-operation');
		}
	});
	const onSave = (): void => {
		const operation = form.operation as string;
		const index = form.index;
		switch (operation) {
			case 'save': {
				const variables = form.variables as string;
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
