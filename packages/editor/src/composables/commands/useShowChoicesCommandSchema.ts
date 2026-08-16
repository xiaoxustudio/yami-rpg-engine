import '@/module/command/showChoices.ts';
import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { clear, getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Local } from '@/tools/localization.ts';

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
	const write = getElementWriter('showChoices');
	write('choices', list.slice());
	write('parameters', parameters);
	choices = list;
	getFocus($('#showChoices-choices'));
};

const save = (): unknown => {
	const read = getElementReader('showChoices');
	const list = read('choices');
	if (list.length === 0) {
		return getFocus($('#showChoices-choices'));
	}
	const parameters = read('parameters');
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
