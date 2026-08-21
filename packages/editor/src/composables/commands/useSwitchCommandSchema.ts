import { getFocus } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { useSwitchBranchSchema } from '@app/composables/useSwitchBranchSchema';

const SwitchBranch = useSwitchBranchSchema();
import { CommandSchema } from '@app/commands/schema.ts';
import { commit } from '@app/composables/useCommandSchema';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { t } from '@app/i18n';
import { reactive } from 'vue';

export interface SwitchForm {
	variable: { type: string; key: string };
	branches?: unknown[];
	default: boolean;
}

Command.cases.switch = new CommandSchema({
	name: 'switch',
	customParse({
		variable,
		branches,
		defaultCommands
	}: {
		variable: unknown;
		branches: Array<{ commands: unknown }>;
		defaultCommands: unknown;
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
			{ text: t('command.switch') + ' ' },
			{ color: 'normal' },
			{ text: Command.parseVariable!(variable, 'any') },
			{ break: true }
		];
		const textCase = t('command.switch.case');
		for (const branch of branches) {
			contents.push(
				{ color: 'flow' },
				{ text: textCase + ' ' },
				{ color: 'normal' },
				{ text: SwitchBranch.parse!(branch as never) },
				{ children: branch.commands }
			);
		}
		if (defaultCommands) {
			contents.push(
				{ color: 'flow' },
				{ text: t('command.switch.default') },
				{ children: defaultCommands }
			);
		}
		contents.push({ color: 'flow' }, { text: t('command.switch.end') });
		return contents;
	}
});

const form = reactive<SwitchForm>({
	variable: { type: 'local', key: '' },
	default: false
});
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
	Object.assign(form, {
		variable,
		branches: branches.slice(),
		default: !!value
	});
	defaultCommands = value as unknown[] | null;
	getFocus(document.getElementById('switch-variable'));
};

const save = (): unknown => {
	const variable = form.variable;
	if (VariableGetter.isNone!(variable)) {
		return getFocus(document.getElementById('switch-variable'));
	}
	const branches = form.branches ?? [];
	if (branches.length === 0) {
		return getFocus(document.getElementById('switch-branches'));
	}
	switch (form.default) {
		case true: {
			const commands = defaultCommands ?? [];
			commit({ variable, branches, defaultCommands: commands });
			break;
		}
		case false:
			commit({ variable, branches });
			break;
	}
};

const windowClosed = (event: Event): void => {
	defaultCommands = null;
};

const schema = Command.cases.switch;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useSwitchCommandSchema() {
	return { form, load, save, windowClosed };
}
