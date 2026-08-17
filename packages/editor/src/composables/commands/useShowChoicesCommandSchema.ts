import '@app/legacy/module/command/showChoices.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { clear, getFocus, read, write } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { Local } from '@app/legacy/tools/localization.ts';
import { reactive } from 'vue';

const form = reactive<Record<string, unknown>>({});
let choices: unknown[] | null = null;

const createDefaultChoices = (): unknown[] => {
	return [
		{
			content: Local.get!('showChoices.yes'),
			commands: []
		},
		{
			content: Local.get!('showChoices.no'),
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
	write($('#showChoices-choices'), form.choices);
	write($('#showChoices-parameters'), form.parameters);
	choices = list;
	getFocus($('#showChoices-choices'));
};

const save = (): unknown => {
	const list = (read($('#showChoices-choices')) ?? form.choices) as unknown[];
	if (list.length === 0) {
		return getFocus($('#showChoices-choices'));
	}
	const parameters = read($('#showChoices-parameters')) ?? form.parameters;
	Command.save?.({ choices: list, parameters });
};

const windowClosed = (event: Event): void => {
	choices = null;
	clear($('#showChoices-choices'));
};

const schema = Command.cases.showChoices;
schema.createDefaultChoices = createDefaultChoices;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useShowChoicesCommandSchema() {
	return { load, save, windowClosed };
}
