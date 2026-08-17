import '@app/legacy/module/command/getActor.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read, write } from '@app/legacy/util/element-utils';
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
	$('#getActor-attribute')?.loadItems?.(attrItems);
	$('#getActor-divisor')?.loadItems?.(attrItems);
	Object.assign(form, createDefault(), { ...params, selector, activation });
	write($('#getActor-variable'), form.variable);
	write($('#getActor-position'), form.position);
	write($('#getActor-area'), form.area);
	write($('#getActor-size'), form.size);
	write($('#getActor-radius'), form.radius);
	write($('#getActor-selector'), form.selector);
	write($('#getActor-teamId'), form.teamId);
	write($('#getActor-condition'), form.condition);
	write($('#getActor-attribute'), form.attribute);
	write($('#getActor-divisor'), form.divisor);
	write($('#getActor-activation'), form.activation);
	write($('#getActor-exclusion'), form.exclusion);
	write($('#getActor-exclusionActor'), form.exclusionActor);
	write($('#getActor-exclusionTeamId'), form.exclusionTeamId);
	getFocus($('#getActor-variable'));
};

const save = (): void => {
	const variable = read($('#getActor-variable')) ?? form.variable;
	if (VariableGetter.isNone!(variable)) {
		getFocus($('#getActor-variable'));
		return;
	}
	const position = read($('#getActor-position')) ?? form.position;
	const area = read($('#getActor-area')) ?? form.area;
	const size = read($('#getActor-size')) ?? form.size;
	const radius = read($('#getActor-radius')) ?? form.radius;
	const selector = read($('#getActor-selector')) ?? form.selector;
	const teamId = read($('#getActor-teamId')) ?? form.teamId;
	const condition = read($('#getActor-condition')) ?? form.condition;
	const attribute = read($('#getActor-attribute')) ?? form.attribute;
	const divisor = read($('#getActor-divisor')) ?? form.divisor;
	const activation = read($('#getActor-activation')) ?? form.activation;
	const exclusion = read($('#getActor-exclusion')) ?? form.exclusion;
	const exclusionActor = read($('#getActor-exclusionActor')) ?? form.exclusionActor;
	const exclusionTeamId = read($('#getActor-exclusionTeamId')) ?? form.exclusionTeamId;
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
				getFocus($('#getActor-attribute'));
				return;
			}
			params3 = { condition, attribute };
			break;
		case 'min-attribute-ratio':
		case 'max-attribute-ratio':
			if (attribute === '') {
				getFocus($('#getActor-attribute'));
				return;
			}
			if (divisor === '' || attribute === divisor) {
				getFocus($('#getActor-divisor'));
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
