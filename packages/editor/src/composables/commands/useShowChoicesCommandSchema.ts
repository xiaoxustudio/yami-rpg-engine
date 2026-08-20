import { clear, getFocus, read, write } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { GameLocal } from '@app/legacy/local/local-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { commit } from '@app/composables/useCommandSchema';
import { t } from '@app/i18n';
import { reactive } from 'vue';

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

const form = reactive<Record<string, unknown>>({});
let choices: unknown[] | null = null;

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

const load = ({
	choices: list = createDefaultChoices(),
	parameters = ''
}: {
	choices?: unknown[];
	parameters?: string;
} = {}): void => {
	form.choices = list.slice();
	form.parameters = parameters;
	write(document.getElementById('showChoices-choices'), form.choices);
	write(document.getElementById('showChoices-parameters'), form.parameters);
	choices = list;
	getFocus(document.getElementById('showChoices-choices'));
};

const save = (): unknown => {
	const list = (read(document.getElementById('showChoices-choices')) ??
		form.choices) as unknown[];
	if (list.length === 0) {
		return getFocus(document.getElementById('showChoices-choices'));
	}
	const parameters = read(document.getElementById('showChoices-parameters')) ?? form.parameters;
	commit({ choices: list, parameters });
};

const windowClosed = (event: Event): void => {
	choices = null;
	clear(document.getElementById('showChoices-choices'));
};

const schema = Command.cases.showChoices;
schema.createDefaultChoices = createDefaultChoices;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useShowChoicesCommandSchema() {
	return { load, save, windowClosed };
}
