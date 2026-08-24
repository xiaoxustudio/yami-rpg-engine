import { $ } from '@app/utils/dom';
import { useEquipmentGetterWindow } from '@app/composables/useEquipmentGetterWindow';
import { Enum } from '@app/enum/enum-window.ts';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const EquipmentGetter = createAccessor({
	initialize() {
		if (!$('#equipmentGetter-type')) return;
		$('#equipmentGetter-type').loadItems([
			{ name: 'Event Trigger Equipment', value: 'trigger' },
			{ name: 'Latest Equipment', value: 'latest' },
			{ name: 'By Equipment Slot', value: 'by-slot' },
			{ name: 'By Equipment ID (Equipped)', value: 'by-id-equipped' },
			{ name: 'By Equipment ID (Inventory)', value: 'by-id-inventory' },
			{ name: 'Variable', value: 'variable' }
		]);

		$('#equipmentGetter-type')
			.enableHiddenMode()
			.relate([
				{
					case: 'by-slot',
					targets: [$('#equipmentGetter-actor'), $('#equipmentGetter-slot')]
				},
				{
					case: ['by-id-equipped', 'by-id-inventory'],
					targets: [$('#equipmentGetter-actor'), $('#equipmentGetter-equipmentId')]
				},
				{ case: 'variable', targets: [$('#equipmentGetter-variable')] }
			]);
	},
	open(target: AccessorTarget) {
		$('#equipmentGetter-slot').loadItems(Enum.getStringItems('equipment-slot'));
		useEquipmentGetterWindow().open(target, { slot: Enum.getDefStringId('equipment-slot') });
	},
	checkDataForPlugin: (data: unknown) =>
		data instanceof Object && (data as { getter?: string }).getter === 'equipment',
	createDefaultForPlugin: () => ({ getter: 'equipment', type: 'trigger' }),
	confirm() {
		useEquipmentGetterWindow().confirm();
	}
});
