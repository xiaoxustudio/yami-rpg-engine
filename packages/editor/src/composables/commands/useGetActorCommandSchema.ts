import '@/module/command/getActor.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { Attribute } from '@/attribute/attribute-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useGetActorCommandSchema() {
	const { form, save, load } = useCommandSchema('getActor', {
		onLoad() {
			getFocus($('#getActor-variable'));
		}
	});
	const onLoad = (params: Record<string, unknown>): void => {
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
		load({ ...params, selector, activation });
	};
	const onSave = (): void => {
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
	Command.cases.getActor.customLoad = onLoad;
	Command.cases.getActor.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
