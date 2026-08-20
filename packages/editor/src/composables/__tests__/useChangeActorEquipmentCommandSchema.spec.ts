import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ChangeActorEquipment from '@app/components/commands/ChangeActorEquipment.vue';
import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';
import { Window } from '@app/legacy/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface ControlEl extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
	input(value: unknown): void;
}

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

describe('useChangeActorEquipmentCommandSchema（changeActorEquipment 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Enum.getStringItems = vi.fn(() => [
			{ name: 'Weapon', value: 'weapon' },
			{ name: 'Armor', value: 'armor' }
		]) as never;
		Enum.getDefStringId = vi.fn(() => 'weapon') as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 operation 选项', async () => {
		const wrapper = mount(ChangeActorEquipment, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const operation = document.getElementById('changeActorEquipment-operation') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(operation.dataItems).toHaveLength(5);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(ChangeActorEquipment, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'changeActorEquipment');
		expect(Window.open).toHaveBeenCalledWith('changeActorEquipment');
		expect(getControl('changeActorEquipment-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('changeActorEquipment-operation').read()).toBe('add');
		expect(getControl('changeActorEquipment-slot').read()).toBe('weapon');
		expect(getControl('changeActorEquipment-equipmentId').read()).toBe('');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(ChangeActorEquipment, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'changeActorEquipment',
			params: {
				actor: { type: 'player' },
				operation: 'remove-instance',
				equipment: { type: 'equipment' }
			}
		});
		expect(Window.open).toHaveBeenCalledWith('changeActorEquipment');
		expect(getControl('changeActorEquipment-operation').read()).toBe('remove-instance');
		expect(getControl('changeActorEquipment-equipment').read()).toEqual({ type: 'equipment' });
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.changeActorEquipment.save 保存', async () => {
		const wrapper = mount(ChangeActorEquipment, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.changeActorEquipment.customLoad!({
			actor: { type: 'trigger' },
			operation: 'add',
			slot: 'weapon',
			equipmentId: ''
		});
		getControl('changeActorEquipment-equipmentId').input('sword');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.changeActorEquipment.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			operation: 'add',
			slot: 'weapon',
			equipmentId: 'sword'
		});
		wrapper.unmount();
	});

	it('save 路径：add 空 slot 校验失败不保存', async () => {
		const wrapper = mount(ChangeActorEquipment, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.changeActorEquipment.customLoad!({
			actor: { type: 'trigger' },
			operation: 'add',
			slot: '',
			equipmentId: 'sword'
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.changeActorEquipment.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
