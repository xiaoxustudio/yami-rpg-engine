/* oxlint-disable eslint/no-restricted-properties */
import { getFocus } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { GameLocal } from '@app/local/local-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { commit } from '@app/composables/useCommandSchema';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);
import { reactive } from 'vue';

export interface ShowChoicesForm {
	choices?: Array<{ content: string; commands: unknown }>;
	parameters: string;
}

Command.cases.showChoices = new CommandSchema({
	name: 'showChoices',
	customParse({
		choices,
		parameters
	}: {
		choices: Array<{ content: string; commands: unknown }>;
		parameters: unknown;
	}) {
		const contents: Array<{
			fold?: boolean;
			color?: string;
			text?: string;
			children?: unknown;
			break?: boolean;
		}> = [
			{ fold: true },
			{ color: 'flow' },
			{ text: t('command.showChoices') + Token(': ') },
			{ color: 'text' },
			{ color: 'save' }
		];
		contents.push({ text: Command.setNumberColor!(choices.length) });
		if (parameters) {
			contents.push(
				{ color: 'gray' },
				{ color: 'save' },
				{
					text: ' ' + Token('(') + Command.setCommaColors!(parameters) + Token(')')
				}
			);
		}
		contents.push({ color: 'flow' });
		contents.push({ break: true });
		const when = t('command.showChoices.when');
		for (const choice of choices) {
			contents.push(
				{ color: 'flow' },
				{ text: when + ' ' },
				{ color: 'text' },
				{
					text: Command.parseVariableTag!(GameLocal.replace!(choice.content))
				},
				{ children: choice.commands }
			);
		}
		contents.push({ color: 'flow' }, { text: t('command.showChoices.end') });
		return contents;
	}
});

const createDefaultChoices = (): unknown[] => {
	return [
		{
			content: t('showChoices.yes'),
			commands: []
		},
		{
			content: t('showChoices.no'),
			commands: []
		}
	];
};

const form = reactive<ShowChoicesForm>({
	parameters: ''
});

const load = ({
	choices: list = createDefaultChoices(),
	parameters = ''
}: {
	choices?: unknown[];
	parameters?: string;
} = {}): void => {
	Object.assign(form, { choices: list.slice(), parameters });
	getFocus(document.getElementById('showChoices-choices'));
};

const save = (): unknown => {
	const list = form.choices ?? [];
	if (list.length === 0) {
		return getFocus(document.getElementById('showChoices-choices'));
	}
	const parameters = form.parameters;
	commit({ choices: list, parameters });
};

const windowClosed = (_event: Event): void => {};

const schema = Command.cases.showChoices;
schema.createDefaultChoices = createDefaultChoices;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useShowChoicesCommandSchema() {
	return { form, load, save, windowClosed };
}
