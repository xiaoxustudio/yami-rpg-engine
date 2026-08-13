import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

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
	onInitialize() {
		$('#setObject-operand-type').loadItems([
			{ name: 'None', value: 'none' },
			{ name: 'Actor', value: 'actor' },
			{ name: 'Skill', value: 'skill' },
			{ name: 'State', value: 'state' },
			{ name: 'Equipment', value: 'equipment' },
			{ name: 'Item', value: 'item' },
			{ name: 'Trigger', value: 'trigger' },
			{ name: 'Light', value: 'light' },
			{ name: 'Object', value: 'object' },
			{ name: 'Element', value: 'element' },
			{ name: 'Variable', value: 'variable' },
			{ name: 'List', value: 'list' }
		]);
		$('#setObject-operand-type')
			.enableHiddenMode()
			.relate([
				{ case: 'actor', targets: [$('#setObject-operand-actor')] },
				{ case: 'skill', targets: [$('#setObject-operand-skill')] },
				{ case: 'state', targets: [$('#setObject-operand-state')] },
				{
					case: 'equipment',
					targets: [$('#setObject-operand-equipment')]
				},
				{ case: 'item', targets: [$('#setObject-operand-item')] },
				{ case: 'trigger', targets: [$('#setObject-operand-trigger')] },
				{ case: 'light', targets: [$('#setObject-operand-light')] },
				{ case: 'object', targets: [$('#setObject-operand-object')] },
				{ case: 'element', targets: [$('#setObject-operand-element')] },
				{
					case: 'variable',
					targets: [$('#setObject-operand-variable')]
				},
				{
					case: 'list',
					targets: [$('#setObject-operand-variable'), $('#setObject-operand-list-index')]
				}
			]);
	},
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
			{ text: Local.get!('command.setObject.alias') + ' ' },
			{ color: 'restore' },
			{ text: `${varDesc} ${Token('=')} ${object}` }
		];
	},
	customLoad({
		variable = { type: 'local', key: '' },
		operand = {
			type: 'none',
			actor: null,
			skill: null,
			state: null,
			equipment: null,
			item: null,
			trigger: null,
			light: null,
			object: null,
			element: null,
			variable: null,
			index: null
		}
	}: SetObjectData) {
		const write = getElementWriter('setObject');
		let operandActor: ObjectRef | null | undefined = { type: 'trigger' };
		let operandSkill: ObjectRef | null | undefined = { type: 'trigger' };
		let operandState: ObjectRef | null | undefined = { type: 'trigger' };
		let operandEquipment: ObjectRef | null | undefined = { type: 'trigger' };
		let operandItem: ObjectRef | null | undefined = { type: 'trigger' };
		let operandTrigger: ObjectRef | null | undefined = { type: 'trigger' };
		let operandLight: ObjectRef | null | undefined = { type: 'trigger' };
		let operandObject: ObjectRef | null | undefined = { type: 'trigger' };
		let operandElement: ObjectRef | null | undefined = { type: 'trigger' };
		let operandVariable: ObjectRef | null | undefined = { type: 'local', key: '' };
		let operandListIndex: ObjectRef | number | null | undefined = 0;
		switch (operand.type) {
			case 'actor':
				operandActor = operand.actor;
				break;
			case 'skill':
				operandSkill = operand.skill;
				break;
			case 'state':
				operandState = operand.state;
				break;
			case 'equipment':
				operandEquipment = operand.equipment;
				break;
			case 'item':
				operandItem = operand.item;
				break;
			case 'trigger':
				operandTrigger = operand.trigger;
				break;
			case 'light':
				operandLight = operand.light;
				break;
			case 'object':
				operandObject = operand.object;
				break;
			case 'element':
				operandElement = operand.element;
				break;
			case 'variable':
				operandVariable = operand.variable;
				break;
			case 'list':
				operandVariable = operand.variable;
				operandListIndex = operand.index;
				break;
		}
		write('variable', variable);
		write('operand-type', operand.type);
		write('operand-actor', operandActor);
		write('operand-skill', operandSkill);
		write('operand-state', operandState);
		write('operand-equipment', operandEquipment);
		write('operand-item', operandItem);
		write('operand-trigger', operandTrigger);
		write('operand-light', operandLight);
		write('operand-object', operandObject);
		write('operand-element', operandElement);
		write('operand-variable', operandVariable);
		write('operand-list-index', operandListIndex);
		getFocus($('#setObject-variable'));
	},
	customSave() {
		const read = getElementReader('setObject');
		const variable = read('variable');
		if (VariableGetter.isNone!(variable)) {
			return getFocus($('#setObject-variable'));
		}
		const type = read('operand-type');
		let operand;
		switch (type) {
			case 'none':
				operand = { type };
				break;
			case 'actor': {
				const actor = read('operand-actor');
				operand = { type, actor };
				break;
			}
			case 'skill': {
				const skill = read('operand-skill');
				operand = { type, skill };
				break;
			}
			case 'state': {
				const state = read('operand-state');
				operand = { type, state };
				break;
			}
			case 'equipment': {
				const equipment = read('operand-equipment');
				operand = { type, equipment };
				break;
			}
			case 'item': {
				const item = read('operand-item');
				operand = { type, item };
				break;
			}
			case 'trigger': {
				const trigger = read('operand-trigger');
				operand = { type, trigger };
				break;
			}
			case 'light': {
				const light = read('operand-light');
				operand = { type, light };
				break;
			}
			case 'object': {
				const object = read('operand-object');
				operand = { type, object };
				break;
			}
			case 'element': {
				const element = read('operand-element');
				operand = { type, element };
				break;
			}
			case 'variable': {
				const variable = read('operand-variable');
				if (VariableGetter.isNone!(variable)) {
					return getFocus($('#setObject-operand-variable'));
				}
				operand = { type, variable };
				break;
			}
			case 'list': {
				const variable = read('operand-variable');
				if (VariableGetter.isNone!(variable)) {
					return getFocus($('#setObject-operand-variable'));
				}
				const index = read('operand-list-index');
				operand = { type, variable, index };
				break;
			}
		}
		Command.save!({ variable, operand });
	}
});
