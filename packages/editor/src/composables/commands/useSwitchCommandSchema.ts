import '@app/legacy/module/command/switch.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { clear, getFocus, read, write } from '@app/legacy/util/element-utils';
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
	write($('#switch-variable'), form.variable);
	write($('#switch-branches'), form.branches);
	write($('#switch-default'), form.default);
	defaultCommands = value as unknown[] | null;
	getFocus($('#switch-variable'));
};

const save = (): unknown => {
	const variable = read($('#switch-variable')) ?? form.variable;
	if (VariableGetter.isNone!(variable as any)) {
		return getFocus($('#switch-variable'));
	}
	const branches = (read($('#switch-branches')) ?? form.branches) as unknown[];
	if (branches.length === 0) {
		return getFocus($('#switch-branches'));
	}
	switch (read($('#switch-default')) ?? form.default) {
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
	clear($('#switch-branches'));
};

const schema = Command.cases.switch;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useSwitchCommandSchema() {
	return { load, save, windowClosed };
}
