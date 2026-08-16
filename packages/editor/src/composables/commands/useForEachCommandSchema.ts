import '@/module/command/forEach.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import type { ForEachForm } from '@/module/command/forEach.ts';

let commands: unknown[] | null = null;

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
	const setForm = (
		$('#forEach') as (HTMLElement & { setForm?: (data: Partial<ForEachForm>) => void }) | null
	)?.setForm;
	setForm?.({
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
	getFocus($('#forEach-data'));
};

const save = (): unknown => {
	const getForm = ($('#forEach') as (HTMLElement & { getForm?: () => ForEachForm }) | null)
		?.getForm;
	const form = getForm?.() ?? ({} as ForEachForm);
	const data = form.data;
	const children = commands;
	switch (data) {
		case 'list': {
			const list = form.list;
			if (VariableGetter.isNone!(list)) {
				return getFocus($('#forEach-list'));
			}
			const variable = form.variable;
			if (VariableGetter.isNone!(variable)) {
				return getFocus($('#forEach-variable'));
			}
			Command.save?.({ data, list, variable, commands: children });
			break;
		}
		case 'skill':
		case 'state':
		case 'equipment':
		case 'inventory': {
			const actor = form.actor;
			const variable = form.variable;
			if (VariableGetter.isNone!(variable)) {
				return getFocus($('#forEach-variable'));
			}
			Command.save?.({ data, actor, variable, commands: children });
			break;
		}
		case 'element': {
			const element = form.element;
			const variable = form.variable;
			if (VariableGetter.isNone!(variable)) {
				return getFocus($('#forEach-variable'));
			}
			Command.save?.({ data, element, variable, commands: children });
			break;
		}
		case 'member': {
			const variable = form.variable;
			if (VariableGetter.isNone!(variable)) {
				return getFocus($('#forEach-variable'));
			}
			Command.save?.({ data, variable, commands: children });
			break;
		}
		case 'attribute': {
			const groupId = form.attributeGroupId;
			if (groupId === '') {
				return getFocus($('#forEach-attribute-groupId'));
			}
			const variable = form.variable;
			if (VariableGetter.isNone!(variable)) {
				return getFocus($('#forEach-variable'));
			}
			Command.save?.({ data, groupId, variable, commands: children });
			break;
		}
		case 'enum': {
			const groupId = form.enumGroupId;
			if (groupId === '') {
				return getFocus($('#forEach-enum-groupId'));
			}
			const variable = form.variable;
			if (VariableGetter.isNone!(variable)) {
				return getFocus($('#forEach-variable'));
			}
			Command.save?.({ data, groupId, variable, commands: children });
			break;
		}
		case 'save': {
			const saveIndex = form.saveIndex;
			if (VariableGetter.isNone!(saveIndex)) {
				return getFocus($('#forEach-saveIndex'));
			}
			Command.save?.({ data, saveIndex, commands: children });
			break;
		}
		case 'touch':
		case 'changed-touch': {
			const touchId = form.touchId;
			if (VariableGetter.isNone!(touchId)) {
				return getFocus($('#forEach-touchId'));
			}
			Command.save?.({ data, touchId, commands: children });
			break;
		}
	}
};

const windowClosed = (event: Event): void => {
	commands = null;
};

const schema = Command.cases.forEach;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useForEachCommandSchema() {
	return { load, save, windowClosed };
}
