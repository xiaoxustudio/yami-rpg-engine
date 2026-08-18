import '@app/legacy/module/command/setInventory.ts';
import { getFocus, read, write } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { reactive } from 'vue';

const form = reactive<Record<string, unknown>>({});

const createDefault = (): Record<string, unknown> => {
	const data: Record<string, unknown> = {};
	for (const field of Command.cases.setInventory.fields) {
		const value = typeof field.default === 'function' ? field.default() : field.default;
		if (value !== undefined) {
			data[field.key] = value;
		}
	}
	return data;
};

const load = (params: Record<string, unknown> = {}): void => {
	Object.assign(form, createDefault(), params);
	write(document.getElementById('setInventory-actor'), form.actor);
	write(document.getElementById('setInventory-operation'), form.operation);
	write(document.getElementById('setInventory-money'), form.money);
	write(document.getElementById('setInventory-itemId'), form.itemId);
	write(document.getElementById('setInventory-quantity'), form.quantity);
	write(document.getElementById('setInventory-equipmentId'), form.equipmentId);
	write(document.getElementById('setInventory-equipment'), form.equipment);
	write(document.getElementById('setInventory-order1'), form.order1);
	write(document.getElementById('setInventory-order2'), form.order2);
	write(document.getElementById('setInventory-refActor'), form.refActor);
	getFocus(document.getElementById('setInventory-actor'));
};

const save = (): void => {
	const actor = read(document.getElementById('setInventory-actor')) ?? form.actor;
	const operation = read(document.getElementById('setInventory-operation')) ?? form.operation;
	switch (operation) {
		case 'increase-money':
		case 'decrease-money':
			Command.save?.({
				actor,
				operation,
				money: read(document.getElementById('setInventory-money')) ?? form.money
			});
			break;
		case 'increase-items':
		case 'decrease-items': {
			const itemId = read(document.getElementById('setInventory-itemId')) ?? form.itemId;
			if (itemId === '') {
				getFocus(document.getElementById('setInventory-itemId'));
				return;
			}
			Command.save?.({
				actor,
				operation,
				itemId,
				quantity: read(document.getElementById('setInventory-quantity')) ?? form.quantity
			});
			break;
		}
		case 'gain-equipment':
		case 'lose-equipment': {
			const equipmentId =
				read(document.getElementById('setInventory-equipmentId')) ?? form.equipmentId;
			if (equipmentId === '') {
				getFocus(document.getElementById('setInventory-equipmentId'));
				return;
			}
			Command.save?.({ actor, operation, equipmentId });
			break;
		}
		case 'gain-equipment-instance':
		case 'lose-equipment-instance':
			Command.save?.({
				actor,
				operation,
				equipment: read(document.getElementById('setInventory-equipment')) ?? form.equipment
			});
			break;
		case 'swap':
			Command.save?.({
				actor,
				operation,
				order1: read(document.getElementById('setInventory-order1')) ?? form.order1,
				order2: read(document.getElementById('setInventory-order2')) ?? form.order2
			});
			break;
		case 'sort':
		case 'sort-by-order':
		case 'reset':
		case 'dereference':
			Command.save?.({ actor, operation });
			break;
		case 'reference':
			Command.save?.({
				actor,
				operation,
				refActor: read(document.getElementById('setInventory-refActor')) ?? form.refActor
			});
			break;
	}
};

const schema = Command.cases.setInventory;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useSetInventoryCommandSchema() {
	return { load, save };
}
