import '@/module/command/changeActorEquipment.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, read } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Enum } from '@/enum/enum-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useChangeActorEquipmentCommandSchema() {
	const { form, save, load } = useCommandSchema('changeActorEquipment', {
		onLoad() {
			$('#changeActorEquipment-slot')?.loadItems?.(Enum.getStringItems!('equipment-slot'));
			getFocus($('#changeActorEquipment-actor'));
		}
	});
	const onSave = (): void => {
		const actor = read($('#changeActorEquipment-actor')) ?? form.actor;
		const operation = read($('#changeActorEquipment-operation')) ?? form.operation;
		switch (operation) {
			case 'add': {
				const slot = read($('#changeActorEquipment-slot')) ?? form.slot;
				if (slot === '') {
					getFocus($('#changeActorEquipment-slot'));
					return;
				}
				const equipmentId =
					read($('#changeActorEquipment-equipmentId')) ?? form.equipmentId;
				if (equipmentId === '') {
					getFocus($('#changeActorEquipment-equipmentId'));
					return;
				}
				Command.save?.({ actor, operation, slot, equipmentId });
				break;
			}
			case 'remove': {
				const equipmentId =
					read($('#changeActorEquipment-equipmentId')) ?? form.equipmentId;
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
	Command.cases.changeActorEquipment.customSave = onSave;
	return { form, save: onSave, load };
}
