import { getCommandSchemaFormsStore } from '@app/stores/command-schema-forms';
import { Command } from '@app/commands/command-object.ts';
import { commit } from '@app/composables/useCommandSchema';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

export interface ForEachForm {
	data: string;
	list: { type: string; key: string };
	actor: { type: string };
	element: { type: string };
	attributeGroupId: string;
	enumGroupId: string;
	variable: { type: string; key: string };
	saveIndex: { type: string; key: string };
	touchId: { type: string; key: string };
}

Command.cases.forEach = new CommandSchema({
	name: 'forEach',
	customParse({
		data,
		list,
		actor,
		element,
		groupId,
		variable,
		saveIndex,
		touchId,
		commands
	}: {
		data: string;
		list: unknown;
		actor: unknown;
		element: unknown;
		groupId: unknown;
		variable: unknown;
		saveIndex: unknown;
		touchId: unknown;
		commands: unknown;
	}) {
		const dataInfo = t('command.forEach.' + data);
		const words = Command.words;
		switch (data) {
			case 'list': {
				const varName = Command.parseVariable!(variable, 'any', true);
				const listName = Command.parseVariable!(list, 'object');
				words.push(varName + Token(' = ') + listName + Token(' -> ') + dataInfo);
				break;
			}
			case 'skill':
			case 'state':
			case 'equipment':
			case 'inventory': {
				const varName = Command.parseVariable!(variable, 'object', true);
				const actorInfo = Command.parseActor!(actor);
				words.push(varName + Token(' = ') + actorInfo + Token(' -> ') + dataInfo);
				break;
			}
			case 'element': {
				const varName = Command.parseVariable!(variable, 'object', true);
				const elInfo = Command.parseElement!(element);
				words.push(varName + Token(' = ') + elInfo + Token(' -> ') + dataInfo);
				break;
			}
			case 'member': {
				const varName = Command.parseVariable!(variable, 'object', true);
				words.push(varName + Token(' = ') + dataInfo);
				break;
			}
			case 'attribute': {
				const varName = Command.parseVariable!(variable, 'string', true);
				const group = Command.parseAttributeGroup!(groupId);
				words.push(varName + Token(' = ') + group + Token(' -> ') + dataInfo);
				break;
			}
			case 'enum': {
				const varName = Command.parseVariable!(variable, 'string', true);
				const group = Command.parseEnumGroup!(groupId);
				words.push(varName + Token(' = ') + group + Token(' -> ') + dataInfo);
				break;
			}
			case 'save': {
				const varName = Command.parseVariable!(saveIndex, 'number', true);
				words.push(
					Token('{') +
						varName +
						Command.setDelimiterColor!(', ...}') +
						Token(' = ') +
						dataInfo
				);
				break;
			}
			case 'touch':
			case 'changed-touch': {
				const varName = Command.parseVariable!(touchId, 'number', true);
				words.push(varName + Token(' = ') + dataInfo);
				break;
			}
		}
		return [
			{ fold: true },
			{ color: 'flow' },
			{ text: t('command.forEach') + ' ' },
			{ color: 'restore' },
			{ text: words.join() },
			{ children: commands },
			{ color: 'flow' },
			{ text: t('command.forEach.end') }
		];
	}
});

let commands: unknown[] | null = null;

// 表单真源在 `stores/command-schema-forms.ts`（原先是本文件的模块级 `reactive`）。
// 逐字段访问器 ⇒ `Object.assign(form, …)`、`const data = form` 与模板 v-model 都不用改。
const form: ForEachForm = {
	get data(): ForEachForm['data'] {
		return getCommandSchemaFormsStore().forEachForm.data;
	},
	set data(value: ForEachForm['data']) {
		getCommandSchemaFormsStore().forEachForm.data = value;
	},
	get list(): ForEachForm['list'] {
		return getCommandSchemaFormsStore().forEachForm.list;
	},
	set list(value: ForEachForm['list']) {
		getCommandSchemaFormsStore().forEachForm.list = value;
	},
	get actor(): ForEachForm['actor'] {
		return getCommandSchemaFormsStore().forEachForm.actor;
	},
	set actor(value: ForEachForm['actor']) {
		getCommandSchemaFormsStore().forEachForm.actor = value;
	},
	get element(): ForEachForm['element'] {
		return getCommandSchemaFormsStore().forEachForm.element;
	},
	set element(value: ForEachForm['element']) {
		getCommandSchemaFormsStore().forEachForm.element = value;
	},
	get attributeGroupId(): ForEachForm['attributeGroupId'] {
		return getCommandSchemaFormsStore().forEachForm.attributeGroupId;
	},
	set attributeGroupId(value: ForEachForm['attributeGroupId']) {
		getCommandSchemaFormsStore().forEachForm.attributeGroupId = value;
	},
	get enumGroupId(): ForEachForm['enumGroupId'] {
		return getCommandSchemaFormsStore().forEachForm.enumGroupId;
	},
	set enumGroupId(value: ForEachForm['enumGroupId']) {
		getCommandSchemaFormsStore().forEachForm.enumGroupId = value;
	},
	get variable(): ForEachForm['variable'] {
		return getCommandSchemaFormsStore().forEachForm.variable;
	},
	set variable(value: ForEachForm['variable']) {
		getCommandSchemaFormsStore().forEachForm.variable = value;
	},
	get saveIndex(): ForEachForm['saveIndex'] {
		return getCommandSchemaFormsStore().forEachForm.saveIndex;
	},
	set saveIndex(value: ForEachForm['saveIndex']) {
		getCommandSchemaFormsStore().forEachForm.saveIndex = value;
	},
	get touchId(): ForEachForm['touchId'] {
		return getCommandSchemaFormsStore().forEachForm.touchId;
	},
	set touchId(value: ForEachForm['touchId']) {
		getCommandSchemaFormsStore().forEachForm.touchId = value;
	}
};

const load = ({
	data = 'list',
	list = { type: 'local', key: '' },
	actor = { type: 'trigger' },
	element = { type: 'trigger' },
	groupId = '',
	variable = { type: 'local', key: '' },
	saveIndex = { type: 'local', key: '' },
	touchId = { type: 'local', key: '' },
	commands: children = []
}: {
	data?: string;
	groupId?: string;
	list?: unknown;
	actor?: unknown;
	element?: unknown;
	variable?: unknown;
	saveIndex?: unknown;
	touchId?: unknown;
	commands?: unknown;
} = {}): void => {
	let attrGroupId = '';
	let enumGroupId = '';
	switch (data) {
		case 'attribute':
			attrGroupId = groupId;
			break;
		case 'enum':
			enumGroupId = groupId;
			break;
	}
	Object.assign(form, {
		data,
		list: list as { type: string; key: string },
		actor: actor as { type: string },
		element: element as { type: string },
		attributeGroupId: attrGroupId,
		enumGroupId: enumGroupId,
		variable: variable as { type: string; key: string },
		saveIndex: saveIndex as { type: string; key: string },
		touchId: touchId as { type: string; key: string }
	});
	commands = children as unknown[];
	requestFocus('forEach-data');
};

const save = (): unknown => {
	const data = form.data;
	const children = commands;
	switch (data) {
		case 'list': {
			const list = form.list;
			if (VariableGetter.isNone!(list)) {
				return requestFocus('forEach-list');
			}
			const variable = form.variable;
			if (VariableGetter.isNone!(variable)) {
				return requestFocus('forEach-variable');
			}
			commit({ data, list, variable, commands: children });
			break;
		}
		case 'skill':
		case 'state':
		case 'equipment':
		case 'inventory': {
			const actor = form.actor;
			const variable = form.variable;
			if (VariableGetter.isNone!(variable)) {
				return requestFocus('forEach-variable');
			}
			commit({ data, actor, variable, commands: children });
			break;
		}
		case 'element': {
			const element = form.element;
			const variable = form.variable;
			if (VariableGetter.isNone!(variable)) {
				return requestFocus('forEach-variable');
			}
			commit({ data, element, variable, commands: children });
			break;
		}
		case 'member': {
			const variable = form.variable;
			if (VariableGetter.isNone!(variable)) {
				return requestFocus('forEach-variable');
			}
			commit({ data, variable, commands: children });
			break;
		}
		case 'attribute': {
			const groupId = form.attributeGroupId;
			if (groupId === '') {
				return requestFocus('forEach-attribute-groupId');
			}
			const variable = form.variable;
			if (VariableGetter.isNone!(variable)) {
				return requestFocus('forEach-variable');
			}
			commit({ data, groupId, variable, commands: children });
			break;
		}
		case 'enum': {
			const groupId = form.enumGroupId;
			if (groupId === '') {
				return requestFocus('forEach-enum-groupId');
			}
			const variable = form.variable;
			if (VariableGetter.isNone!(variable)) {
				return requestFocus('forEach-variable');
			}
			commit({ data, groupId, variable, commands: children });
			break;
		}
		case 'save': {
			const saveIndex = form.saveIndex;
			if (VariableGetter.isNone!(saveIndex)) {
				return requestFocus('forEach-saveIndex');
			}
			commit({ data, saveIndex, commands: children });
			break;
		}
		case 'touch':
		case 'changed-touch': {
			const touchId = form.touchId;
			if (VariableGetter.isNone!(touchId)) {
				return requestFocus('forEach-touchId');
			}
			commit({ data, touchId, commands: children });
			break;
		}
	}
};

const windowClosed = (_event: Event): void => {
	commands = null;
};

const schema = Command.cases.forEach;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useForEachCommandSchema() {
	return { form, load, save, windowClosed };
}
