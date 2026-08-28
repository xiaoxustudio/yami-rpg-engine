/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus, read } from '@app/utils/element-utils';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
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

type SetObjectData = {
	variable: ObjectRef;
	operand: SetObjectOperand;
};

Command.cases.setObject = new CommandSchema({
	name: 'setObject',
	fields: [
		{ key: 'variable', default: { type: 'local', key: '' } },
		{ key: 'operand-type', default: 'none' },
		{ key: 'operand-actor', default: { type: 'trigger' } },
		{ key: 'operand-skill', default: { type: 'trigger' } },
		{ key: 'operand-state', default: { type: 'trigger' } },
		{ key: 'operand-equipment', default: { type: 'trigger' } },
		{ key: 'operand-item', default: { type: 'trigger' } },
		{ key: 'operand-trigger', default: { type: 'trigger' } },
		{ key: 'operand-light', default: { type: 'trigger' } },
		{ key: 'operand-object', default: { type: 'trigger' } },
		{ key: 'operand-element', default: { type: 'trigger' } },
		{ key: 'operand-variable', default: { type: 'local', key: '' } },
		{ key: 'operand-list-index', default: 0 }
	],
	parseOperand(operand: SetObjectOperand) {
		switch (operand.type) {
			case 'none':
				return Token('null');
			case 'actor':
				return Command.parseActor!(operand.actor);
			case 'skill':
				return Command.parseSkill!(operand.skill);
			case 'state':
				return Command.parseState!(operand.state);
			case 'equipment':
				return Command.parseEquipment!(operand.equipment);
			case 'item':
				return Command.parseItem!(operand.item);
			case 'trigger':
				return Command.parseTrigger!(operand.trigger);
			case 'light':
				return Command.parseLight!(operand.light);
			case 'object':
				return Command.parseObject!(operand.object);
			case 'element':
				return Command.parseElement!(operand.element);
			case 'variable':
				return Command.parseVariable!(operand.variable, 'object');
			case 'list':
				return Command.parseListItem!(operand.variable, operand.index);
		}
	},
	customParse({ variable, operand }: SetObjectData) {
		const varDesc = Command.parseVariable!(variable, 'object', true);
		const object = this.parseOperand!(operand);
		return [
			{ color: 'variable' },
			{ text: t('command.setObject.alias') + ' ' },
			{ color: 'restore' },
			{ text: `${varDesc} ${Token('=')} ${object}` }
		];
	}
});

export function useSetObjectCommandSchema() {
	const { form, load, commit } = useCommandSchema('setObject', {
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
		commit({ variable, operand });
	};
	Command.cases.setObject.customLoad = onLoad;
	Command.cases.setObject.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
