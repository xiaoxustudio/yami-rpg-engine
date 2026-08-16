import '@/module/command/if.ts';
import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { clear, getFocus } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';

let elseCommands: unknown[] | null = null;

const load = ({
	branches = [],
	elseCommands: value = null
}: {
	branches?: unknown[];
	elseCommands?: unknown;
} = {}): void => {
	const write = getElementWriter('if');
	write('branches', branches.slice());
	write('else', !!value);
	elseCommands = value as unknown[] | null;
	getFocus($('#if-branches'));
};

const save = (): unknown => {
	const read = getElementReader('if');
	const branches = read('branches');
	if (branches.length === 0) {
		return getFocus($('#if-branches'));
	}
	switch (read('else')) {
		case true: {
			const commands = elseCommands ?? [];
			Command.save?.({ branches, elseCommands: commands });
			break;
		}
		case false:
			Command.save?.({ branches });
			break;
	}
};

const windowClosed = (event: Event): void => {
	elseCommands = null;
	clear($('#if-branches'));
};

const schema = Command.cases.if;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useIfCommandSchema() {
	return { load, save, windowClosed };
}
