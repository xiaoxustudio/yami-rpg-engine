import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus, read, write } from '@app/utils/element-utils';
import { commit } from '@app/composables/useCommandSchema';
import { reactive } from 'vue';

Command.cases.setInventory = new CommandSchema({
	name: 'setInventory',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'operation', default: 'increase-money' },
		{ key: 'money', default: 1 },
		{ key: 'itemId', default: '' },
		{ key: 'quantity', default: 1 },
		{ key: 'equipmentId', default: '' },
		{ key: 'equipment', default: { type: 'trigger' } },
		{ key: 'order1', default: 0 },
		{ key: 'order2', default: 1 },
		{ key: 'refActor', default: { type: 'player' } }
	],
	customParse({
		actor,
		operation,
		money,
		itemId,
		quantity,
		equipmentId,
		equipment,
		order1,
		order2,
		refActor
	}: {
		actor: unknown;
		operation: string;
		money: unknown;
		itemId: unknown;
		quantity: unknown;
		equipmentId: unknown;
		equipment: unknown;
		order1: unknown;
		order2: unknown;
		refActor: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(t('command.setInventory.' + operation));
		switch (operation) {
			case 'increase-money':
			case 'decrease-money':
				words.push(Command.parseVariableNumber!(money));
				break;
			case 'increase-items':
			case 'decrease-items':
				words.push(Command.parseVariableFile!(itemId));
				words.push(Command.parseVariableNumber!(quantity));
				break;
			case 'gain-equipment':
			case 'lose-equipment':
				words.push(Command.parseVariableFile!(equipmentId));
				break;
			case 'gain-equipment-instance':
			case 'lose-equipment-instance':
				words.push(Command.parseEquipment!(equipment));
				break;
			case 'swap': {
				const a = Command.parseVariableNumber!(order1);
				const b = Command.parseVariableNumber!(order2);
				words.push(a + Token(' <-> ') + b);
				break;
			}
			case 'reference':
				words.push(Command.parseActor!(refActor));
				break;
		}
		return [
			{ color: 'inventory' },
			{ text: t('command.setInventory') + Token(': ') },
			{ text: words.join() }
		];
	}
});

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
			commit({
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
			commit({
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
			commit({ actor, operation, equipmentId });
			break;
		}
		case 'gain-equipment-instance':
		case 'lose-equipment-instance':
			commit({
				actor,
				operation,
				equipment: read(document.getElementById('setInventory-equipment')) ?? form.equipment
			});
			break;
		case 'swap':
			commit({
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
			commit({ actor, operation });
			break;
		case 'reference':
			commit({
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
