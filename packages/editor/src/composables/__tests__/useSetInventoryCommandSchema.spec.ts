import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetInventory from '@app/components/commands/SetInventory.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Window } from '@app/tools/window-object.ts';
import { useSetInventoryCommandSchema } from '@app/composables/commands/useSetInventoryCommandSchema';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

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

	const mountWindow = async () => {
		const wrapper = mount(SetInventory, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		return wrapper;
	};

	it('onMounted loadItems 填充 operation 选项', async () => {
		const wrapper = await mountWindow();
		const operation = document.getElementById('setInventory-operation') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(operation.dataItems).toHaveLength(14);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = await mountWindow();
		const { form } = useSetInventoryCommandSchema();
		CommandSchema.insert(target, 'setInventory');
		expect(Window.open).toHaveBeenCalledWith('setInventory');
		expect(form.actor).toEqual({ type: 'trigger' });
		expect(form.operation).toBe('increase-money');
		expect(form.money).toBe(1);
		expect(form.quantity).toBe(1);
		expect(form.order1).toBe(0);
		expect(form.order2).toBe(1);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = await mountWindow();
		const { form } = useSetInventoryCommandSchema();
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
		expect(form.operation).toBe('swap');
		expect(form.order1).toBe(3);
		expect(form.order2).toBe(7);
		wrapper.unmount();
	});

	it('save 路径：用户改 form 后经 Command.cases.setInventory.save 保存', async () => {
		const wrapper = await mountWindow();
		const { form } = useSetInventoryCommandSchema();
		Command.cases.setInventory.customLoad!({
			actor: { type: 'trigger' },
			operation: 'increase-money',
			money: 1
		});
		form.operation = 'increase-items';
		form.itemId = 'item1';
		form.quantity = 5;
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
		const wrapper = await mountWindow();
		const { form } = useSetInventoryCommandSchema();
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
