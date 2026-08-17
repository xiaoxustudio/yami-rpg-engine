import '@app/legacy/module/command/if.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { clear, getFocus, read, write } from '@app/legacy/util/element-utils.ts';
import { Command } from '@app/legacy/command/command-object.ts';
import { reactive } from 'vue';

const form = reactive<Record<string, unknown>>({});
let elseCommands: unknown[] | null = null;

const load = ({
	branches = [],
	elseCommands: value = null
}: {
	branches?: unknown[];
	elseCommands?: unknown;
} = {}): void => {
	form.branches = branches.slice();
	form.else = !!value;
	write($('#if-branches'), form.branches);
	write($('#if-else'), form.else);
	elseCommands = value as unknown[] | null;
	getFocus($('#if-branches'));
};

const save = (): unknown => {
	const branches = (read($('#if-branches')) ?? form.branches) as unknown[];
	if (branches.length === 0) {
		return getFocus($('#if-branches'));
	}
	switch (read($('#if-else')) ?? form.else) {
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
