import { Command } from '@app/commands/command-object.ts';
import { commit } from '@app/composables/useCommandSchema';
import { useIfBranchSchema } from '@app/composables/useIfBranchSchema';

const IfBranch = useIfBranchSchema();
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { getCommandSchemaFormsStore } from '@app/stores/command-schema-forms';

export interface IfForm {
	branches?: unknown[];
	else: boolean;
}

Command.cases.if = new CommandSchema({
	name: 'if',
	customParse({
		branches,
		elseCommands
	}: {
		branches: Array<{ commands: unknown }>;
		elseCommands: unknown;
	}) {
		const contents: Array<{
			fold?: boolean;
			color?: string;
			text?: string;
			children?: unknown;
			break?: boolean;
		}> = [{ fold: true }];
		const textIf = t('command.if');
		const textElse = t('command.if.else');
		for (let index = 0; index < branches.length; index++) {
			const branch = branches[index];
			contents.push(
				{ color: 'flow' },
				...(index === 0 ? [] : [{ text: textElse + ' ' }]),
				{ text: textIf + ' ' },
				{ color: 'normal' },
				{ text: IfBranch.parse!(branch as never) },
				{ children: branch.commands }
			);
		}
		if (elseCommands) {
			contents.push(
				{ color: 'flow' },
				{ text: t('command.if.else') },
				{ children: elseCommands }
			);
		}
		contents.push({ color: 'flow' }, { text: t('command.if.end') });
		return contents;
	}
});

/**
 * 表单**真源在 store**（`ifForm`），这里只做转发。
 *
 * ⚠️ `branches` 必须有访问器：`load()` 用 `Object.assign(form, …)` 一次性写入，
 * 缺访问器时它只会变成普通对象上的**非响应式**自有属性。此时列表能否刷新，取决于
 * 同一批写入里 `else` 是否恰好变了（变了才会重渲染、`v-model` 才被重新读到）——
 * 打开一个 `else` 状态没变的"如果"指令，分支列表就会停在上一次的内容或空白。
 * 与"显示选项"窗口同因（2026-10-22 实报）。
 */
const form: IfForm = {
	get branches(): IfForm['branches'] {
		return getCommandSchemaFormsStore().ifForm.branches;
	},
	set branches(value: IfForm['branches']) {
		getCommandSchemaFormsStore().ifForm.branches = value;
	},
	get else(): IfForm['else'] {
		return getCommandSchemaFormsStore().ifForm.else;
	},
	set else(value: IfForm['else']) {
		getCommandSchemaFormsStore().ifForm.else = value;
	}
};
let elseCommands: unknown[] | null = null;

const load = ({
	branches = [],
	elseCommands: value = null
}: {
	branches?: unknown[];
	elseCommands?: unknown;
} = {}): void => {
	Object.assign(form, {
		branches: branches.slice(),
		else: !!value
	});
	elseCommands = value as unknown[] | null;
	requestFocus('if-branches');
};

const save = (): unknown => {
	const branches = form.branches ?? [];
	if (branches.length === 0) {
		return requestFocus('if-branches');
	}
	switch (form.else) {
		case true: {
			const commands = elseCommands ?? [];
			commit({ branches, elseCommands: commands });
			break;
		}
		case false:
			commit({ branches });
			break;
	}
};

const windowClosed = (_event: Event): void => {
	elseCommands = null;
};

const schema = Command.cases.if;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useIfCommandSchema() {
	return { form, load, save, windowClosed };
}
