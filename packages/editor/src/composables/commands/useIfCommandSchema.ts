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

// 表单真源在 `stores/command-schema-forms.ts`（原先是本文件的模块级 `reactive`）。
// 逐字段访问器 ⇒ `Object.assign(form, …)`、`const data = form` 与模板 v-model 都不用改。
const form: IfForm = {
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
