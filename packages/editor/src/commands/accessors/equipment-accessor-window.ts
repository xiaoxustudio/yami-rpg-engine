import { $ } from '@app/utils/dom';
import { useEquipmentGetterWindow } from '@app/composables/useEquipmentGetterWindow';
import { Enum } from '@app/enum/enum-window.ts';
import { AccessorBaseShape, AccessorTarget } from '@app/types/shapes.ts';

interface EquipmentGetterShape extends AccessorBaseShape {
	checkDataForPlugin: ((data: unknown) => boolean) | null;
	createDefaultForPlugin: (() => { getter: string; type: string }) | null;
}

export const EquipmentGetter: EquipmentGetterShape = {
	target: null,
	initialize: null,
	open: null,
	checkDataForPlugin: null,
	createDefaultForPlugin: null,
	confirm: null
};

EquipmentGetter.initialize = function (this: EquipmentGetterShape) {
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
};

EquipmentGetter.open = function (this: EquipmentGetterShape, target: AccessorTarget) {
	this.target = target;
	$('#equipmentGetter-slot').loadItems(Enum.getStringItems('equipment-slot'));
	useEquipmentGetterWindow().open(target, { slot: Enum.getDefStringId('equipment-slot') });
};

EquipmentGetter.checkDataForPlugin = function (this: EquipmentGetterShape, data: unknown) {
	if (data instanceof Object) {
		return (data as { getter?: string }).getter === 'equipment';
	}
	return false;
};

EquipmentGetter.createDefaultForPlugin = function (this: EquipmentGetterShape) {
	return { getter: 'equipment', type: 'trigger' };
};

EquipmentGetter.confirm = function (this: EquipmentGetterShape, event: Event) {
	useEquipmentGetterWindow().confirm();
};
