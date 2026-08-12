import { $, getElementReader } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus, write } from '@/util/element-utils.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { Enum } from '@/enum/enum-window.ts';
import { AccessorBaseShape, AccessorTarget } from '@/types/legacy-shapes.ts';

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

	$('#equipmentGetter-confirm').on('click', this.confirm);
};

EquipmentGetter.open = function (this: EquipmentGetterShape, target: AccessorTarget) {
	this.target = target;
	Window.open!('equipmentGetter');
	$('#equipmentGetter-slot').loadItems(Enum.getStringItems('equipment-slot'));

	let actor = { type: 'trigger' };
	let slot = Enum.getDefStringId('equipment-slot');
	let equipmentId = '';
	let variable = { type: 'local', key: '' };
	const equipment = target.read?.();
	switch (equipment.type) {
		case 'trigger':
		case 'latest':
			break;
		case 'by-slot':
			actor = equipment.actor;
			slot = equipment.slot;
			break;
		case 'by-id-equipped':
		case 'by-id-inventory':
			actor = equipment.actor;
			equipmentId = equipment.equipmentId;
			break;
		case 'variable':
			variable = equipment.variable;
			break;
	}
	write($('#equipmentGetter-type'), equipment.type);
	write($('#equipmentGetter-actor'), actor);
	write($('#equipmentGetter-slot'), slot);
	write($('#equipmentGetter-equipmentId'), equipmentId);
	write($('#equipmentGetter-variable'), variable);
	getFocus($('#equipmentGetter-type'));
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
	const read = getElementReader('equipmentGetter');
	const type = read('type');
	let getter;
	switch (type) {
		case 'trigger':
		case 'latest':
			getter = { type };
			break;
		case 'by-slot': {
			const actor = read('actor');
			const slot = read('slot');
			if (slot === '') {
				return getFocus($('#equipmentGetter-slot'));
			}
			getter = { type, actor, slot };
			break;
		}
		case 'by-id-equipped':
		case 'by-id-inventory': {
			const actor = read('actor');
			const equipmentId = read('equipmentId');
			if (equipmentId === '') {
				return getFocus($('#equipmentGetter-equipmentId'));
			}
			getter = { type, actor, equipmentId };
			break;
		}
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone(variable)) {
				return getFocus($('#equipmentGetter-variable'));
			}
			getter = { type, variable };
			break;
		}
	}
	if (this.target!.isPluginInput) {
		getter = { getter: 'equipment', ...getter };
	}
	this.target?.input?.(getter!);
	Window.close!('equipmentGetter');
}.bind(EquipmentGetter);
