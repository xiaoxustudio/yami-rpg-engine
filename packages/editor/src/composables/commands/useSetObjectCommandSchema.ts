import '@/module/command/setObject.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

type ObjectRef = {
	type: string;
	[k: string]: unknown;
};

type SetObjectOperand = {
	type: string;
	actor?: ObjectRef | null;
	skill?: ObjectRef | null;
	state?: ObjectRef | null;
	equipment?: ObjectRef | null;
	item?: ObjectRef | null;
	trigger?: ObjectRef | null;
	light?: ObjectRef | null;
	object?: ObjectRef | null;
	element?: ObjectRef | null;
	variable?: ObjectRef | null;
	index?: ObjectRef | number | null;
};

export function useSetObjectCommandSchema() {
	const { form, save, load } = useCommandSchema('setObject', {
		onLoad() {
			getFocus($('#setObject-variable'));
		}
	});
	const onLoad = (params: Record<string, unknown>): void => {
		const variable = (params.variable ?? { type: 'local', key: '' }) as ObjectRef;
		const operand = (params.operand ?? { type: 'none' }) as SetObjectOperand;
		load({
			...params,
			variable,
			'operand-type': operand.type,
			'operand-actor': operand.actor ?? { type: 'trigger' },
			'operand-skill': operand.skill ?? { type: 'trigger' },
			'operand-state': operand.state ?? { type: 'trigger' },
			'operand-equipment': operand.equipment ?? { type: 'trigger' },
			'operand-item': operand.item ?? { type: 'trigger' },
			'operand-trigger': operand.trigger ?? { type: 'trigger' },
			'operand-light': operand.light ?? { type: 'trigger' },
			'operand-object': operand.object ?? { type: 'trigger' },
			'operand-element': operand.element ?? { type: 'trigger' },
			'operand-variable': operand.variable ?? { type: 'local', key: '' },
			'operand-list-index': operand.index ?? 0
		});
	};
	const onSave = (): void => {
		const variable = read($('#setObject-variable')) ?? form.variable;
		if (VariableGetter.isNone!(variable)) {
			getFocus($('#setObject-variable'));
			return;
		}
		const type = read($('#setObject-operand-type')) ?? form['operand-type'];
		let operand: SetObjectOperand = { type: type as string };
		switch (type) {
			case 'none':
				break;
			case 'actor':
				operand.actor = read($('#setObject-operand-actor')) ?? form['operand-actor'];
				break;
			case 'skill':
				operand.skill = read($('#setObject-operand-skill')) ?? form['operand-skill'];
				break;
			case 'state':
				operand.state = read($('#setObject-operand-state')) ?? form['operand-state'];
				break;
			case 'equipment':
				operand.equipment =
					read($('#setObject-operand-equipment')) ?? form['operand-equipment'];
				break;
			case 'item':
				operand.item = read($('#setObject-operand-item')) ?? form['operand-item'];
				break;
			case 'trigger':
				operand.trigger = read($('#setObject-operand-trigger')) ?? form['operand-trigger'];
				break;
			case 'light':
				operand.light = read($('#setObject-operand-light')) ?? form['operand-light'];
				break;
			case 'object':
				operand.object = read($('#setObject-operand-object')) ?? form['operand-object'];
				break;
			case 'element':
				operand.element = read($('#setObject-operand-element')) ?? form['operand-element'];
				break;
			case 'variable': {
				const value = read($('#setObject-operand-variable')) ?? form['operand-variable'];
				if (VariableGetter.isNone!(value)) {
					getFocus($('#setObject-operand-variable'));
					return;
				}
				operand.variable = value;
				break;
			}
			case 'list': {
				const value = read($('#setObject-operand-variable')) ?? form['operand-variable'];
				if (VariableGetter.isNone!(value)) {
					getFocus($('#setObject-operand-variable'));
					return;
				}
				operand.variable = value;
				operand.index =
					read($('#setObject-operand-list-index')) ?? form['operand-list-index'];
				break;
			}
		}
		Command.save?.({ variable, operand });
	};
	Command.cases.setObject.customLoad = onLoad;
	Command.cases.setObject.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
