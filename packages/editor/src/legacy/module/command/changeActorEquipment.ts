import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Enum } from '@/enum/enum-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

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
			.push(Local.get!('command.changeActorEquipment.' + operation));
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
			{ text: Local.get!('command.changeActorEquipment') + Token(': ') },
			{ text: words.join() }
		];
	}
});
