import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { commit } from '@app/composables/useCommandSchema';

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

const form = dynamicForm(() => getCommandSchemaFormsStore().setInventoryForm);
import { dynamicForm } from '@app/composables/dynamic-form';
import { getCommandSchemaFormsStore } from '@app/stores/command-schema-forms';

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
	requestFocus('setInventory-actor');
};

const save = (): void => {
	const actor = form.actor;
	const operation = form.operation;
	switch (operation) {
		case 'increase-money':
		case 'decrease-money':
			commit({ actor, operation, money: form.money });
			break;
		case 'increase-items':
		case 'decrease-items': {
			const itemId = form.itemId;
			if (itemId === '') {
				requestFocus('setInventory-itemId');
				return;
			}
			commit({ actor, operation, itemId, quantity: form.quantity });
			break;
		}
		case 'gain-equipment':
		case 'lose-equipment': {
			const equipmentId = form.equipmentId;
			if (equipmentId === '') {
				requestFocus('setInventory-equipmentId');
				return;
			}
			commit({ actor, operation, equipmentId });
			break;
		}
		case 'gain-equipment-instance':
		case 'lose-equipment-instance':
			commit({ actor, operation, equipment: form.equipment });
			break;
		case 'swap':
			commit({ actor, operation, order1: form.order1, order2: form.order2 });
			break;
		case 'sort':
		case 'sort-by-order':
		case 'reset':
		case 'dereference':
			commit({ actor, operation });
			break;
		case 'reference':
			commit({ actor, operation, refActor: form.refActor });
			break;
	}
};

const schema = Command.cases.setInventory;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useSetInventoryCommandSchema() {
	return { form, load, save };
}
