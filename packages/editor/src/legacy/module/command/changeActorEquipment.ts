import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.changeActorEquipment = new CommandSchema({
	name: 'changeActorEquipment',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'operation', default: 'add' },
		{ key: 'slot', default: () => Enum.getDefStringId!('equipment-slot') },
		{ key: 'equipmentId', default: '' },
		{ key: 'equipment', default: { type: 'trigger' } }
	],
	customParse({
		actor,
		operation,
		slot,
		equipmentId,
		equipment
	}: {
		actor: unknown;
		operation: string;
		slot: unknown;
		equipmentId: unknown;
		equipment: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(t('command.changeActorEquipment.' + operation));
		switch (operation) {
			case 'add': {
				const equipSlot = Command.parseVariableEnum!('equipment-slot', slot);
				const equipName = Command.parseFileName!(equipmentId);
				words.push(equipSlot + Token(' = ') + equipName);
				break;
			}
			case 'remove':
				words.push(Command.parseFileName!(equipmentId));
				break;
			case 'add-instance': {
				const equipSlot = Command.parseVariableEnum!('equipment-slot', slot);
				const equipName = Command.parseEquipment!(equipment);
				words.push(equipSlot + Token(' = ') + equipName);
				break;
			}
			case 'remove-instance':
				words.push(Command.parseEquipment!(equipment));
				break;
			case 'remove-slot':
				words.push(Command.parseVariableEnum!('equipment-slot', slot));
				break;
		}
		return [
			{ color: 'actor' },
			{ text: t('command.changeActorEquipment') + Token(': ') },
			{ text: words.join() }
		];
	}
});
