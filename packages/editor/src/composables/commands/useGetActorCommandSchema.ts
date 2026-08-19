import '@app/legacy/module/command/getActor.ts';
import { getFocus, read, write } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { Attribute } from '@app/legacy/attribute/attribute-window.ts';
import { reactive } from 'vue';

const form = reactive<Record<string, unknown>>({});

const createDefault = (): Record<string, unknown> => {
	const data: Record<string, unknown> = {};
	for (const field of Command.cases.getActor.fields) {
		const value = typeof field.default === 'function' ? field.default() : field.default;
		if (value !== undefined) {
			data[field.key] = value;
		}
	}
	return data;
};

const load = (params: Record<string, unknown> = {}): void => {
	const selector = Command.cases.getActor.remapSelectorPatch!(
		(params.selector as string) ?? 'enemy'
	);
	const activation = Command.cases.getActor.remapActivationPatch!(
		(params.activation as string) ?? 'active',
		params.active as boolean | undefined
	);
	const attrItems = Attribute.getAttributeItems!('actor', 'number');
	document.getElementById('getActor-attribute')?.loadItems?.(attrItems);
	document.getElementById('getActor-divisor')?.loadItems?.(attrItems);
	Object.assign(form, createDefault(), { ...params, selector, activation });
	write(document.getElementById('getActor-variable'), form.variable);
	write(document.getElementById('getActor-position'), form.position);
	write(document.getElementById('getActor-area'), form.area);
	write(document.getElementById('getActor-size'), form.size);
	write(document.getElementById('getActor-radius'), form.radius);
	write(document.getElementById('getActor-selector'), form.selector);
	write(document.getElementById('getActor-teamId'), form.teamId);
	write(document.getElementById('getActor-condition'), form.condition);
	write(document.getElementById('getActor-attribute'), form.attribute);
	write(document.getElementById('getActor-divisor'), form.divisor);
	write(document.getElementById('getActor-activation'), form.activation);
	write(document.getElementById('getActor-exclusion'), form.exclusion);
	write(document.getElementById('getActor-exclusionActor'), form.exclusionActor);
	write(document.getElementById('getActor-exclusionTeamId'), form.exclusionTeamId);
	getFocus(document.getElementById('getActor-variable'));
};

const save = (): void => {
	const variable = read(document.getElementById('getActor-variable')) ?? form.variable;
	if (VariableGetter.isNone!(variable)) {
		getFocus(document.getElementById('getActor-variable'));
		return;
	}
	const position = read(document.getElementById('getActor-position')) ?? form.position;
	const area = read(document.getElementById('getActor-area')) ?? form.area;
	const size = read(document.getElementById('getActor-size')) ?? form.size;
	const radius = read(document.getElementById('getActor-radius')) ?? form.radius;
	const selector = read(document.getElementById('getActor-selector')) ?? form.selector;
	const teamId = read(document.getElementById('getActor-teamId')) ?? form.teamId;
	const condition = read(document.getElementById('getActor-condition')) ?? form.condition;
	const attribute = read(document.getElementById('getActor-attribute')) ?? form.attribute;
	const divisor = read(document.getElementById('getActor-divisor')) ?? form.divisor;
	const activation = read(document.getElementById('getActor-activation')) ?? form.activation;
	const exclusion = read(document.getElementById('getActor-exclusion')) ?? form.exclusion;
	const exclusionActor =
		read(document.getElementById('getActor-exclusionActor')) ?? form.exclusionActor;
	const exclusionTeamId =
		read(document.getElementById('getActor-exclusionTeamId')) ?? form.exclusionTeamId;
	let params1;
	let params2;
	let params3;
	let params4;
	switch (area) {
		case 'square':
			params1 = { variable, position, area, size };
			break;
		case 'circle':
			params1 = { variable, position, area, radius };
			break;
	}
	switch (selector) {
		case 'enemy':
		case 'friend':
		case 'team':
			params2 = { selector, teamId };
			break;
		case 'any':
			params2 = { selector };
			break;
	}
	switch (condition) {
		case 'nearest':
		case 'farthest':
		case 'random':
			params3 = { condition };
			break;
		case 'min-attribute-value':
		case 'max-attribute-value':
			if (attribute === '') {
				getFocus(document.getElementById('getActor-attribute'));
				return;
			}
			params3 = { condition, attribute };
			break;
		case 'min-attribute-ratio':
		case 'max-attribute-ratio':
			if (attribute === '') {
				getFocus(document.getElementById('getActor-attribute'));
				return;
			}
			if (divisor === '' || attribute === divisor) {
				getFocus(document.getElementById('getActor-divisor'));
				return;
			}
			params3 = { condition, attribute, divisor };
			break;
	}
	switch (exclusion) {
		case 'none':
			params4 = { activation, exclusion };
			break;
		case 'actor':
			params4 = { activation, exclusion, exclusionActor };
			break;
		case 'team':
			params4 = { activation, exclusion, exclusionTeamId };
			break;
	}
	Command.save?.({ ...params1, ...params2, ...params3, ...params4 });
};

const schema = Command.cases.getActor;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useGetActorCommandSchema() {
	return { load, save };
}
