import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import EquipmentGetter from '@app/components/tools/EquipmentGetter.vue';
import { useEquipmentGetterWindow } from '@app/composables/useEquipmentGetterWindow';
import { Window } from '@app/tools/window-object.ts';
import { EquipmentGetter as EquipmentGetterController } from '@app/commands/accessors/equipment-accessor-window.ts';
import { Enum } from '@app/enum/enum-window.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() })
}));

const getFrame = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;

const makeTarget = (read?: () => unknown) => ({
	dataValue: undefined,
	read,
	input: vi.fn()
});

describe('useEquipmentGetterWindow（装备访问器窗口 composable：form 状态 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
		Enum.getStringItems = vi.fn(() => [{ name: 'Body', value: 'body' }]) as never;
		Enum.getDefStringId = vi.fn(() => 'body') as never;
	});

	it('open 打开窗口、解析 read 数据填充 form', async () => {
		const wrapper = mount(EquipmentGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const equipmentGetter = useEquipmentGetterWindow();
		const target = makeTarget(() => ({
			type: 'by-slot',
			actor: { type: 'trigger' },
			slot: 'weapon'
		}));
		equipmentGetter.open(target as never);
		expect(Window.open).toHaveBeenCalledWith('equipmentGetter');
		expect(equipmentGetter.form.type).toBe('by-slot');
		expect(equipmentGetter.form.slot).toBe('weapon');
		wrapper.unmount();
	});

	it('confirm 经 form 读回值回调并关闭窗口（by-id-equipped 含 actor/equipmentId）', async () => {
		const wrapper = mount(EquipmentGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const equipmentGetter = useEquipmentGetterWindow();
		const target = makeTarget(() => ({ type: 'by-id-equipped' }));
		equipmentGetter.open(target as never);
		equipmentGetter.form.type = 'by-id-equipped';
		equipmentGetter.form.actor = { type: 'actor', key: 'a1' } as { type: string; key?: string };
		equipmentGetter.form.equipmentId = 'equip-2';
		equipmentGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({
			type: 'by-id-equipped',
			actor: { type: 'actor', key: 'a1' },
			equipmentId: 'equip-2'
		});
		expect(Window.close).toHaveBeenCalledWith('equipmentGetter');
		wrapper.unmount();
	});

	it('confirm 校验失败（by-slot slot 为空）聚焦控件且不回调不关闭', async () => {
		const wrapper = mount(EquipmentGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const equipmentGetter = useEquipmentGetterWindow();
		const target = makeTarget(() => ({ type: 'by-slot', slot: 'weapon' }));
		equipmentGetter.open(target as never);
		equipmentGetter.form.type = 'by-slot';
		equipmentGetter.form.slot = '';
		equipmentGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('plugin 输入在回调前包裹 getter 标识', async () => {
		const wrapper = mount(EquipmentGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const equipmentGetter = useEquipmentGetterWindow();
		const target = makeTarget(() => ({ type: 'trigger' }));
		(target as { isPluginInput?: boolean }).isPluginInput = true;
		equipmentGetter.open(target as never);
		equipmentGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({ getter: 'equipment', type: 'trigger' });
		expect(Window.close).toHaveBeenCalledWith('equipmentGetter');
		wrapper.unmount();
	});

	it('closed 事件清除回调，后续 confirm 不再触发', async () => {
		const wrapper = mount(EquipmentGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const equipmentGetter = useEquipmentGetterWindow();
		const target = makeTarget(() => ({ type: 'trigger' }));
		equipmentGetter.open(target as never);
		getFrame('equipmentGetter').dispatchEvent(new CustomEvent('closed'));
		equipmentGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('legacy EquipmentGetter.open/confirm 转发 composable 并回调 target.input', async () => {
		const wrapper = mount(EquipmentGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const equipmentGetter = useEquipmentGetterWindow();
		const target = makeTarget(() => ({
			type: 'by-id-inventory',
			actor: { type: 'trigger' },
			equipmentId: 'equip-1'
		}));
		EquipmentGetterController.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('equipmentGetter');
		expect(equipmentGetter.form.type).toBe('by-id-inventory');
		expect(equipmentGetter.form.equipmentId).toBe('equip-1');
		equipmentGetter.form.equipmentId = 'equip-2';
		EquipmentGetterController.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'by-id-inventory',
			actor: { type: 'trigger' },
			equipmentId: 'equip-2'
		});
		expect(Window.close).toHaveBeenCalledWith('equipmentGetter');
		wrapper.unmount();
	});
});
