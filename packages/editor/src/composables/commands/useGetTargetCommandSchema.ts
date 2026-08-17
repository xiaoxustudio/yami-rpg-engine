import '@app/legacy/module/command/getTarget.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read, write } from '@app/legacy/util/element-utils';
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
	$('#getTarget-attribute')?.loadItems?.(attrItems);
	$('#getTarget-divisor')?.loadItems?.(attrItems);
	Object.assign(form, createDefault(), params);
	write($('#getTarget-actor'), form.actor);
	write($('#getTarget-selector'), form.selector);
	write($('#getTarget-condition'), form.condition);
	write($('#getTarget-attribute'), form.attribute);
	write($('#getTarget-divisor'), form.divisor);
	getFocus($('#getTarget-actor'));
};

const save = (): void => {
	const actor = read($('#getTarget-actor')) ?? form.actor;
	const selector = read($('#getTarget-selector')) ?? form.selector;
	const condition = read($('#getTarget-condition')) ?? form.condition;
	switch (condition) {
		case 'max-threat':
		case 'nearest':
		case 'farthest':
		case 'random':
			Command.save?.({ actor, selector, condition });
			break;
		case 'min-attribute-value':
		case 'max-attribute-value': {
			const attribute = read($('#getTarget-attribute')) ?? form.attribute;
			if (attribute === '') {
				getFocus($('#getTarget-attribute'));
				return;
			}
			Command.save?.({ actor, selector, condition, attribute });
			break;
		}
		case 'min-attribute-ratio':
		case 'max-attribute-ratio': {
			const attribute = read($('#getTarget-attribute')) ?? form.attribute;
			const divisor = read($('#getTarget-divisor')) ?? form.divisor;
			if (attribute === '') {
				getFocus($('#getTarget-attribute'));
				return;
			}
			if (divisor === '') {
				getFocus($('#getTarget-divisor'));
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
