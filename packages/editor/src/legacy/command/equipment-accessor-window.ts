import { $, getElementReader } from '@/util/dom.ts';
import { getFocus, write } from '@/util/element-utils.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { Enum } from '@/enum/enum-window.ts';
function getWindow() {
	return (window as any).Window;
}

export const EquipmentGetter = {
	target: null as any,
	initialize: null as any,
	open: null as any,
	checkDataForPlugin: null as any,
	createDefaultForPlugin: null as any,
	confirm: null as any
};

EquipmentGetter.initialize = function (this: any) {
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

EquipmentGetter.open = function (this: any, target: any) {
	this.target = target;
	getWindow().open('equipmentGetter');
	$('#equipmentGetter-slot').loadItems(Enum.getStringItems('equipment-slot'));

	let actor = { type: 'trigger' };
	let slot = Enum.getDefStringId('equipment-slot');
	let equipmentId = '';
	let variable = { type: 'local', key: '' };
	const equipment = target.dataValue;
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

EquipmentGetter.checkDataForPlugin = function (this: any, data: any) {
	if (data instanceof Object) {
		return data.getter === 'equipment';
	}
	return false;
};

EquipmentGetter.createDefaultForPlugin = function (this: any) {
	return { getter: 'equipment', type: 'trigger' };
};

EquipmentGetter.confirm = function (this: any, event: any) {
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
	if (this.target.isPluginInput) {
		getter = { getter: 'equipment', ...getter };
	}
	this.target.input(getter);
	getWindow().close('equipmentGetter');
}.bind(EquipmentGetter);
