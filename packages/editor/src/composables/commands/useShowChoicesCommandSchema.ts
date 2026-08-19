import '@app/legacy/module/command/showChoices.ts';
import { clear, getFocus, read, write } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { t } from '@app/i18n';
import { reactive } from 'vue';

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
	Command.save?.({ choices: list, parameters });
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
