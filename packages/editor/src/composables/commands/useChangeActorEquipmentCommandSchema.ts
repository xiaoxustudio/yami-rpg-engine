import { getFocus, read, write } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { commit } from '@app/composables/useCommandSchema';
import { Enum } from '@app/enum/enum-window.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { reactive } from 'vue';

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

const form = reactive<Record<string, unknown>>({});

const createDefault = (): Record<string, unknown> => {
	const data: Record<string, unknown> = {};
	for (const field of Command.cases.changeActorEquipment.fields) {
		const value = typeof field.default === 'function' ? field.default() : field.default;
		if (value !== undefined) {
			data[field.key] = value;
		}
	}
	return data;
};

const load = (params: Record<string, unknown> = {}): void => {
	document
		.getElementById('changeActorEquipment-slot')
		?.loadItems?.(Enum.getStringItems!('equipment-slot'));
	Object.assign(form, createDefault(), params);
	write(document.getElementById('changeActorEquipment-actor'), form.actor);
	write(document.getElementById('changeActorEquipment-operation'), form.operation);
	write(document.getElementById('changeActorEquipment-slot'), form.slot);
	write(document.getElementById('changeActorEquipment-equipmentId'), form.equipmentId);
	write(document.getElementById('changeActorEquipment-equipment'), form.equipment);
	getFocus(document.getElementById('changeActorEquipment-actor'));
};

const save = (): void => {
	const actor = read(document.getElementById('changeActorEquipment-actor')) ?? form.actor;
	const operation =
		read(document.getElementById('changeActorEquipment-operation')) ?? form.operation;
	switch (operation) {
		case 'add': {
			const slot = read(document.getElementById('changeActorEquipment-slot')) ?? form.slot;
			if (slot === '') {
				getFocus(document.getElementById('changeActorEquipment-slot'));
				return;
			}
			const equipmentId =
				read(document.getElementById('changeActorEquipment-equipmentId')) ??
				form.equipmentId;
			if (equipmentId === '') {
				getFocus(document.getElementById('changeActorEquipment-equipmentId'));
				return;
			}
			commit({ actor, operation, slot, equipmentId });
			break;
		}
		case 'remove': {
			const equipmentId =
				read(document.getElementById('changeActorEquipment-equipmentId')) ??
				form.equipmentId;
			if (equipmentId === '') {
				getFocus(document.getElementById('changeActorEquipment-equipmentId'));
				return;
			}
			commit({ actor, operation, equipmentId });
			break;
		}
		case 'add-instance': {
			const slot = read(document.getElementById('changeActorEquipment-slot')) ?? form.slot;
			if (slot === '') {
				getFocus(document.getElementById('changeActorEquipment-slot'));
				return;
			}
			commit({
				actor,
				operation,
				slot,
				equipment:
					read(document.getElementById('changeActorEquipment-equipment')) ??
					form.equipment
			});
			break;
		}
		case 'remove-instance':
			commit({
				actor,
				operation,
				equipment:
					read(document.getElementById('changeActorEquipment-equipment')) ??
					form.equipment
			});
			break;
		case 'remove-slot': {
			const slot = read(document.getElementById('changeActorEquipment-slot')) ?? form.slot;
			if (slot === '') {
				getFocus(document.getElementById('changeActorEquipment-slot'));
				return;
			}
			commit({ actor, operation, slot });
			break;
		}
	}
};

const schema = Command.cases.changeActorEquipment;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useChangeActorEquipmentCommandSchema() {
	return { load, save };
}
