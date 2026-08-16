import '@/module/command/switch.ts';
import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { clear, getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';

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
	const write = getElementWriter('switch');
	write('variable', variable);
	write('branches', branches.slice());
	write('default', !!value);
	defaultCommands = value as unknown[] | null;
	getFocus($('#switch-variable'));
};

const save = (): unknown => {
	const read = getElementReader('switch');
	const variable = read('variable');
	if (VariableGetter.isNone!(variable)) {
		return getFocus($('#switch-variable'));
	}
	const branches = read('branches');
	if (branches.length === 0) {
		return getFocus($('#switch-branches'));
	}
	switch (read('default')) {
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
