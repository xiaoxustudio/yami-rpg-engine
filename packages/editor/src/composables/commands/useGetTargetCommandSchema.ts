import '@app/legacy/module/command/getTarget.ts';
import { getFocus, read, write } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { Attribute } from '@app/legacy/attribute/attribute-window.ts';
import { reactive } from 'vue';

const form = reactive<Record<string, unknown>>({});

const createDefault = (): Record<string, unknown> => {
	const data: Record<string, unknown> = {};
	for (const field of Command.cases.getTarget.fields) {
		const value = typeof field.default === 'function' ? field.default() : field.default;
		if (value !== undefined) {
			data[field.key] = value;
		}
	}
	return data;
};

const load = (params: Record<string, unknown> = {}): void => {
	const attrItems = Attribute.getAttributeItems!('actor', 'number');
	document.getElementById('getTarget-attribute')?.loadItems?.(attrItems);
	document.getElementById('getTarget-divisor')?.loadItems?.(attrItems);
	Object.assign(form, createDefault(), params);
	write(document.getElementById('getTarget-actor')!, form.actor);
	write(document.getElementById('getTarget-selector')!, form.selector);
	write(document.getElementById('getTarget-condition')!, form.condition);
	write(document.getElementById('getTarget-attribute')!, form.attribute);
	write(document.getElementById('getTarget-divisor')!, form.divisor);
	getFocus(document.getElementById('getTarget-actor')!);
};

const save = (): void => {
	const actor = read(document.getElementById('getTarget-actor')!) ?? form.actor;
	const selector = read(document.getElementById('getTarget-selector')!) ?? form.selector;
	const condition = read(document.getElementById('getTarget-condition')!) ?? form.condition;
	switch (condition) {
		case 'max-threat':
		case 'nearest':
		case 'farthest':
		case 'random':
			Command.save?.({ actor, selector, condition });
			break;
		case 'min-attribute-value':
		case 'max-attribute-value': {
			const attribute =
				read(document.getElementById('getTarget-attribute')!) ?? form.attribute;
			if (attribute === '') {
				getFocus(document.getElementById('getTarget-attribute')!);
				return;
			}
			Command.save?.({ actor, selector, condition, attribute });
			break;
		}
		case 'min-attribute-ratio':
		case 'max-attribute-ratio': {
			const attribute =
				read(document.getElementById('getTarget-attribute')!) ?? form.attribute;
			const divisor = read(document.getElementById('getTarget-divisor')!) ?? form.divisor;
			if (attribute === '') {
				getFocus(document.getElementById('getTarget-attribute')!);
				return;
			}
			if (divisor === '') {
				getFocus(document.getElementById('getTarget-divisor')!);
				return;
			}
			Command.save?.({
				actor,
				selector,
				condition,
				attribute,
				divisor
			});
			break;
		}
	}
};

const schema = Command.cases.getTarget;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useGetTargetCommandSchema() {
	return { load, save };
}
