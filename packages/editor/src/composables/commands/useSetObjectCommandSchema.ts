import '@app/legacy/module/command/setObject.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
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
			getFocus(document.getElementById('setObject-variable'));
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
		const variable = read(document.getElementById('setObject-variable')) ?? form.variable;
		if (VariableGetter.isNone!(variable)) {
			getFocus(document.getElementById('setObject-variable'));
			return;
		}
		const type =
			read(document.getElementById('setObject-operand-type')) ?? form['operand-type'];
		let operand: SetObjectOperand = { type: type as string };
		switch (type) {
			case 'none':
				break;
			case 'actor':
				operand.actor =
					read(document.getElementById('setObject-operand-actor')) ??
					form['operand-actor'];
				break;
			case 'skill':
				operand.skill =
					read(document.getElementById('setObject-operand-skill')) ??
					form['operand-skill'];
				break;
			case 'state':
				operand.state =
					read(document.getElementById('setObject-operand-state')) ??
					form['operand-state'];
				break;
			case 'equipment':
				operand.equipment =
					read(document.getElementById('setObject-operand-equipment')) ??
					form['operand-equipment'];
				break;
			case 'item':
				operand.item =
					read(document.getElementById('setObject-operand-item')) ?? form['operand-item'];
				break;
			case 'trigger':
				operand.trigger =
					read(document.getElementById('setObject-operand-trigger')) ??
					form['operand-trigger'];
				break;
			case 'light':
				operand.light =
					read(document.getElementById('setObject-operand-light')) ??
					form['operand-light'];
				break;
			case 'object':
				operand.object =
					read(document.getElementById('setObject-operand-object')) ??
					form['operand-object'];
				break;
			case 'element':
				operand.element =
					read(document.getElementById('setObject-operand-element')) ??
					form['operand-element'];
				break;
			case 'variable': {
				const value =
					read(document.getElementById('setObject-operand-variable')) ??
					form['operand-variable'];
				if (VariableGetter.isNone!(value)) {
					getFocus(document.getElementById('setObject-operand-variable'));
					return;
				}
				operand.variable = value;
				break;
			}
			case 'list': {
				const value =
					read(document.getElementById('setObject-operand-variable')) ??
					form['operand-variable'];
				if (VariableGetter.isNone!(value)) {
					getFocus(document.getElementById('setObject-operand-variable'));
					return;
				}
				operand.variable = value;
				operand.index =
					read(document.getElementById('setObject-operand-list-index')) ??
					form['operand-list-index'];
				break;
			}
		}
		Command.save?.({ variable, operand });
	};
	Command.cases.setObject.customLoad = onLoad;
	Command.cases.setObject.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
