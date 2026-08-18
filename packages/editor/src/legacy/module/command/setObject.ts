import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

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
