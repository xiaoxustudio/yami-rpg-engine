import { Command } from '@app/commands/command-object.ts';
import { useSwitchBranchSchema } from '@app/composables/useSwitchBranchSchema';

const SwitchBranch = useSwitchBranchSchema();
import { CommandSchema } from '@app/commands/schema.ts';
import { commit } from '@app/composables/useCommandSchema';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { getCommandSchemaFormsStore } from '@app/stores/command-schema-forms';

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

/**
 * 表单**真源在 store**（`switchForm`），这里只做转发。
 *
 * ⚠️ `branches` 必须有访问器：`load()` 用 `Object.assign(form, …)` 一次性写入，
 * 缺访问器时它只会变成普通对象上的**非响应式**自有属性，列表要等同一批写入里
 * `default` 恰好变化引发的重渲染才会更新。与"显示选项"窗口同因（2026-10-22 实报）。
 */
const form: SwitchForm = {
	get variable(): SwitchForm['variable'] {
		return getCommandSchemaFormsStore().switchForm.variable;
	},
	set variable(value: SwitchForm['variable']) {
		getCommandSchemaFormsStore().switchForm.variable = value;
	},
	get branches(): SwitchForm['branches'] {
		return getCommandSchemaFormsStore().switchForm.branches;
	},
	set branches(value: SwitchForm['branches']) {
		getCommandSchemaFormsStore().switchForm.branches = value;
	},
	get default(): SwitchForm['default'] {
		return getCommandSchemaFormsStore().switchForm.default;
	},
	set default(value: SwitchForm['default']) {
		getCommandSchemaFormsStore().switchForm.default = value;
	}
};
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
	requestFocus('switch-variable');
};

const save = (): unknown => {
	const variable = form.variable;
	if (VariableGetter.isNone!(variable)) {
		return requestFocus('switch-variable');
	}
	const branches = form.branches ?? [];
	if (branches.length === 0) {
		return requestFocus('switch-branches');
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

const windowClosed = (_event: Event): void => {
	defaultCommands = null;
};

const schema = Command.cases.switch;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useSwitchCommandSchema() {
	return { form, load, save, windowClosed };
}
