import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetInventory from '@app/components/commands/SetInventory.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
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

describe('useSetInventoryCommandSchema（setInventory 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 operation 选项', async () => {
		const wrapper = mount(SetInventory, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const operation = document.getElementById('setInventory-operation') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(operation.dataItems).toHaveLength(14);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(SetInventory, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'setInventory');
		expect(Window.open).toHaveBeenCalledWith('setInventory');
		expect(getControl('setInventory-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('setInventory-operation').read()).toBe('increase-money');
		expect(getControl('setInventory-money').read()).toBe(1);
		expect(getControl('setInventory-quantity').read()).toBe(1);
		expect(getControl('setInventory-order1').read()).toBe(0);
		expect(getControl('setInventory-order2').read()).toBe(1);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(SetInventory, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'setInventory',
			params: {
				actor: { type: 'player' },
				operation: 'swap',
				order1: 3,
				order2: 7
			}
		});
		expect(Window.open).toHaveBeenCalledWith('setInventory');
		expect(getControl('setInventory-operation').read()).toBe('swap');
		expect(getControl('setInventory-order1').read()).toBe(3);
		expect(getControl('setInventory-order2').read()).toBe(7);
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.setInventory.save 保存', async () => {
		const wrapper = mount(SetInventory, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setInventory.customLoad!({
			actor: { type: 'trigger' },
			operation: 'increase-money',
			money: 1
		});
		getControl('setInventory-operation').input('increase-items');
		getControl('setInventory-itemId').write('item1');
		getControl('setInventory-quantity').write(5);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setInventory.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			operation: 'increase-items',
			itemId: 'item1',
			quantity: 5
		});
		wrapper.unmount();
	});

	it('save 路径：increase-items 空 itemId 校验失败不保存', async () => {
		const wrapper = mount(SetInventory, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setInventory.customLoad!({
			actor: { type: 'trigger' },
			operation: 'increase-items',
			itemId: '',
			quantity: 1
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setInventory.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
