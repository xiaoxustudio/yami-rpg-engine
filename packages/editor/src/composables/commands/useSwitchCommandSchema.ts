import '@app/legacy/module/command/switch.ts';
import { clear, getFocus, read, write } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { reactive } from 'vue';

const form = reactive<Record<string, unknown>>({});
let defaultCommands: unknown[] | null = null;

const load = ({
	variable = { type: 'local', key: '' },
	branches = [],
	defaultCommands: value = null
}: {
	variable?: unknown;
	branches?: unknown[];
	defaultCommands?: unknown;
} = {}): void => {
	form.variable = variable;
	form.branches = branches.slice();
	form.default = !!value;
	write(document.getElementById('switch-variable'), form.variable);
	write(document.getElementById('switch-branches'), form.branches);
	write(document.getElementById('switch-default'), form.default);
	defaultCommands = value as unknown[] | null;
	getFocus(document.getElementById('switch-variable'));
};

const save = (): unknown => {
	const variable = read(document.getElementById('switch-variable')) ?? form.variable;
	if (VariableGetter.isNone!(variable)) {
		return getFocus(document.getElementById('switch-variable'));
	}
	const branches = (read(document.getElementById('switch-branches')) ??
		form.branches) as unknown[];
	if (branches.length === 0) {
		return getFocus(document.getElementById('switch-branches'));
	}
	switch (read(document.getElementById('switch-default')) ?? form.default) {
		case true: {
			const commands = defaultCommands ?? [];
			Command.save?.({ variable, branches, defaultCommands: commands });
			break;
		}
		case false:
			Command.save?.({ variable, branches });
			break;
	}
};

const windowClosed = (event: Event): void => {
	defaultCommands = null;
	clear(document.getElementById('switch-branches'));
};

const schema = Command.cases.switch;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useSwitchCommandSchema() {
	return { load, save, windowClosed };
}
