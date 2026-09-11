import { useEquipmentGetterWindow } from '@app/composables/useEquipmentGetterWindow';
import { Enum } from '@app/enum/enum-window.ts';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const EquipmentGetter = createAccessor({
	initialize() {
		if (!this.fields?.get('equipmentGetter-type')) return;
		this.fields?.get('equipmentGetter-type')?.loadItems?.([
			{ name: 'Event Trigger Equipment', value: 'trigger' },
			{ name: 'Latest Equipment', value: 'latest' },
			{ name: 'By Equipment Slot', value: 'by-slot' },
			{ name: 'By Equipment ID (Equipped)', value: 'by-id-equipped' },
			{ name: 'By Equipment ID (Inventory)', value: 'by-id-inventory' },
			{ name: 'Variable', value: 'variable' }
		]);

		this.fields
			?.get('equipmentGetter-type')
			?.enableHiddenMode?.()
			?.relate?.([
				{
					case: 'by-slot',
					targets: [
						this.fields?.get('equipmentGetter-actor')?.root,
						this.fields?.get('equipmentGetter-slot')?.root
					]
				},
				{
					case: ['by-id-equipped', 'by-id-inventory'],
					targets: [
						this.fields?.get('equipmentGetter-actor')?.root,
						this.fields?.get('equipmentGetter-equipmentId')?.root
					]
				},
				{ case: 'variable', targets: [this.fields?.get('equipmentGetter-variable')?.root] }
			]);
	},
	open(target: AccessorTarget) {
		this.fields
			?.get('equipmentGetter-slot')
			?.loadItems?.(Enum.getStringItems('equipment-slot'));
		useEquipmentGetterWindow().open(target, { slot: Enum.getDefStringId('equipment-slot') });
	},
	checkDataForPlugin: (data: unknown) =>
		data instanceof Object && (data as { getter?: string }).getter === 'equipment',
	createDefaultForPlugin: () => ({ getter: 'equipment', type: 'trigger' }),
	confirm() {
		useEquipmentGetterWindow().confirm();
	}
});
