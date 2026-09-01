/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
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
		skipWrite: true,
		onLoad() {
			requestFocus('setObject-variable');
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
		const variable = form.variable;
		if (VariableGetter.isNone!(variable as { key: string })) {
			requestFocus('setObject-variable');
			return;
		}
		const type = form['operand-type'];
		let operand: SetObjectOperand = { type: type as string };
		switch (type) {
			case 'none':
				break;
			case 'actor':
				operand.actor = form['operand-actor'] as ObjectRef;
				break;
			case 'skill':
				operand.skill = form['operand-skill'] as ObjectRef;
				break;
			case 'state':
				operand.state = form['operand-state'] as ObjectRef;
				break;
			case 'equipment':
				operand.equipment = form['operand-equipment'] as ObjectRef;
				break;
			case 'item':
				operand.item = form['operand-item'] as ObjectRef;
				break;
			case 'trigger':
				operand.trigger = form['operand-trigger'] as ObjectRef;
				break;
			case 'light':
				operand.light = form['operand-light'] as ObjectRef;
				break;
			case 'object':
				operand.object = form['operand-object'] as ObjectRef;
				break;
			case 'element':
				operand.element = form['operand-element'] as ObjectRef;
				break;
			case 'variable': {
				const value = form['operand-variable'];
				if (VariableGetter.isNone!(value as { key: string })) {
					requestFocus('setObject-operand-variable');
					return;
				}
				operand.variable = value as ObjectRef;
				break;
			}
			case 'list': {
				const value = form['operand-variable'];
				if (VariableGetter.isNone!(value as { key: string })) {
					requestFocus('setObject-operand-variable');
					return;
				}
				operand.variable = value as ObjectRef;
				operand.index = form['operand-list-index'] as number;
				break;
			}
		}
		commit({ variable, operand });
	};
	Command.cases.setObject.customLoad = onLoad;
	Command.cases.setObject.customSave = onSave;
	return { form, save: onSave, load: onLoad };
}
