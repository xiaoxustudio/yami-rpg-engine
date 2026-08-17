import '@app/legacy/module/command/changeActorEquipment.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read, write } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';
import { reactive } from 'vue';

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
	$('#changeActorEquipment-slot')?.loadItems?.(Enum.getStringItems!('equipment-slot'));
	Object.assign(form, createDefault(), params);
	write($('#changeActorEquipment-actor'), form.actor);
	write($('#changeActorEquipment-operation'), form.operation);
	write($('#changeActorEquipment-slot'), form.slot);
	write($('#changeActorEquipment-equipmentId'), form.equipmentId);
	write($('#changeActorEquipment-equipment'), form.equipment);
	getFocus($('#changeActorEquipment-actor'));
};

const save = (): void => {
	const actor = read($('#changeActorEquipment-actor')) ?? form.actor;
	const operation = read($('#changeActorEquipment-operation')) ?? form.operation;
	switch (operation) {
		case 'add': {
			const slot = read($('#changeActorEquipment-slot')) ?? form.slot;
			if (slot === '') {
				getFocus($('#changeActorEquipment-slot'));
				return;
			}
			const equipmentId = read($('#changeActorEquipment-equipmentId')) ?? form.equipmentId;
			if (equipmentId === '') {
				getFocus($('#changeActorEquipment-equipmentId'));
				return;
			}
			Command.save?.({ actor, operation, slot, equipmentId });
			break;
		}
		case 'remove': {
			const equipmentId = read($('#changeActorEquipment-equipmentId')) ?? form.equipmentId;
			if (equipmentId === '') {
				getFocus($('#changeActorEquipment-equipmentId'));
				return;
			}
			Command.save?.({ actor, operation, equipmentId });
			break;
		}
		case 'add-instance': {
			const slot = read($('#changeActorEquipment-slot')) ?? form.slot;
			if (slot === '') {
				getFocus($('#changeActorEquipment-slot'));
				return;
			}
			Command.save?.({
				actor,
				operation,
				slot,
				equipment: read($('#changeActorEquipment-equipment')) ?? form.equipment
			});
			break;
		}
		case 'remove-instance':
			Command.save?.({
				actor,
				operation,
				equipment: read($('#changeActorEquipment-equipment')) ?? form.equipment
			});
			break;
		case 'remove-slot': {
			const slot = read($('#changeActorEquipment-slot')) ?? form.slot;
			if (slot === '') {
				getFocus($('#changeActorEquipment-slot'));
				return;
			}
			Command.save?.({ actor, operation, slot });
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
