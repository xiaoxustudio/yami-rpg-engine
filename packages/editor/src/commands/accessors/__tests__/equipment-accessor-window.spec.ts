import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import EquipmentGetterWindow from '@app/components/tools/EquipmentGetter.vue';
import { useEquipmentGetterWindow } from '@app/composables/useEquipmentGetterWindow';
import { EquipmentGetter } from '@app/commands/accessors/equipment-accessor-window.ts';
import { Window } from '@app/tools/window-object.ts';
import { Enum } from '@app/enum/enum-window.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

const makeTarget = (read?: () => unknown) => ({
	dataValue: undefined,
	read,
	input: vi.fn()
});

describe('EquipmentGetter（装备访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
		Enum.getDefStringId = vi.fn(() => 'slot-1');
		Enum.getStringItems = vi.fn(() => []);
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(EquipmentGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'by-id-equipped', equipmentId: 'e1' }));
		EquipmentGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('equipmentGetter');
		expect(useEquipmentGetterWindow().form.type).toBe('by-id-equipped');
		expect(Enum.getDefStringId).toHaveBeenCalledWith('equipment-slot');
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(EquipmentGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		EquipmentGetter.open!(target as never);
		const equipmentGetter = useEquipmentGetterWindow();
		equipmentGetter.form.type = 'by-slot';
		equipmentGetter.form.slot = 'weapon';
		EquipmentGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'by-slot',
			actor: { type: 'trigger' },
			slot: 'weapon'
		});
		expect(Window.close).toHaveBeenCalledWith('equipmentGetter');
		wrapper.unmount();
	});

	it('checkDataForPlugin 匹配 getter=equipment', () => {
		expect(EquipmentGetter.checkDataForPlugin!({ getter: 'equipment' })).toBe(true);
		expect(EquipmentGetter.checkDataForPlugin!({ getter: 'item' })).toBe(false);
	});

	it('createDefaultForPlugin 返回默认结构', () => {
		expect(EquipmentGetter.createDefaultForPlugin!()).toEqual({
			getter: 'equipment',
			type: 'trigger'
		});
	});
});
