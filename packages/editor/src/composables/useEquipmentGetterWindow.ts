import { reactive } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { requestFocus } from '@app/directives/focus';

export interface EquipmentGetterForm {
	type: string;
	actor: { type: string };
	slot: string;
	equipmentId: string;
	variable: { type: string; key: string };
}

interface EquipmentGetterTarget {
	// oxlint-disable-next-line no-explicit-any
	read?: () => any;
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

interface EquipmentGetterWindow {
	form: EquipmentGetterForm;
	open: (target: EquipmentGetterTarget, defaults?: Partial<EquipmentGetterForm>) => void;
	confirm: () => void;
	onWindowClosed: () => void;
}

const form = reactive<EquipmentGetterForm>({
	type: 'trigger',
	actor: { type: 'trigger' },
	slot: '',
	equipmentId: '',
	variable: { type: 'local', key: '' }
});
let callback: ((getter: Record<string, unknown>) => void) | null = null;
let pluginInput = false;

const open = (target: EquipmentGetterTarget, defaults?: Partial<EquipmentGetterForm>): void => {
	callback = (getter: Record<string, unknown>) => target.input(getter);
	pluginInput = target.isPluginInput === true;
	getWindowStore().open('equipmentGetter');

	let actor = { type: 'trigger' };
	let slot = defaults?.slot ?? '';
	let equipmentId = '';
	let variable = { type: 'local', key: '' };
	const equipment = target.read?.() ?? {};
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
	Object.assign(form, { type: equipment.type, actor, slot, equipmentId, variable });
	requestFocus('equipmentGetter-type');
};

const confirm = (): void => {
	const data = form;
	let getter: Record<string, unknown> | undefined;
	switch (data.type) {
		case 'trigger':
		case 'latest':
			getter = { type: data.type };
			break;
		case 'by-slot':
			if (data.slot === '') {
				requestFocus('equipmentGetter-slot');
				return;
			}
			getter = { type: data.type, actor: data.actor, slot: data.slot };
			break;
		case 'by-id-equipped':
		case 'by-id-inventory':
			if (data.equipmentId === '') {
				requestFocus('equipmentGetter-equipmentId');
				return;
			}
			getter = { type: data.type, actor: data.actor, equipmentId: data.equipmentId };
			break;
		case 'variable':
			if (data.variable.key === '') {
				requestFocus('equipmentGetter-variable');
				return;
			}
			getter = { type: data.type, variable: data.variable };
			break;
	}
	if (pluginInput) {
		getter = { getter: 'equipment', ...getter };
	}
	callback?.(getter!);
	getWindowStore().close('equipmentGetter');
};

const onWindowClosed = (): void => {
	callback = null;
};

export function useEquipmentGetterWindow(): EquipmentGetterWindow {
	return { form, open, confirm, onWindowClosed };
}
