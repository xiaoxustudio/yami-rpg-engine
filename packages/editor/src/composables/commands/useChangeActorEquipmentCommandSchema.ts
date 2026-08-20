import '@app/legacy/module/command/changeActorEquipment.ts';
import { getFocus, read, write } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { commit } from '@app/composables/useCommandSchema';
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
