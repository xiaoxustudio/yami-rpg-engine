import '@/module/command/setInventory.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetInventoryCommandSchema() {
	const { form, save, load } = useCommandSchema('setInventory', {
		onLoad() {
			getFocus($('#setInventory-actor'));
		}
	});
	const onSave = (): void => {
		const actor = read($('#setInventory-actor')) ?? form.actor;
		const operation = read($('#setInventory-operation')) ?? form.operation;
		switch (operation) {
			case 'increase-money':
			case 'decrease-money':
				Command.save?.({
					actor,
					operation,
					money: read($('#setInventory-money')) ?? form.money
				});
				break;
			case 'increase-items':
			case 'decrease-items': {
				const itemId = read($('#setInventory-itemId')) ?? form.itemId;
				if (itemId === '') {
					getFocus($('#setInventory-itemId'));
					return;
				}
				Command.save?.({
					actor,
					operation,
					itemId,
					quantity: read($('#setInventory-quantity')) ?? form.quantity
				});
				break;
			}
			case 'gain-equipment':
			case 'lose-equipment': {
				const equipmentId = read($('#setInventory-equipmentId')) ?? form.equipmentId;
				if (equipmentId === '') {
					getFocus($('#setInventory-equipmentId'));
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
					equipment: read($('#setInventory-equipment')) ?? form.equipment
				});
				break;
			case 'swap':
				Command.save?.({
					actor,
					operation,
					order1: read($('#setInventory-order1')) ?? form.order1,
					order2: read($('#setInventory-order2')) ?? form.order2
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
					refActor: read($('#setInventory-refActor')) ?? form.refActor
				});
				break;
		}
	};
	Command.cases.setInventory.customSave = onSave;
	return { form, save: onSave, load };
}
