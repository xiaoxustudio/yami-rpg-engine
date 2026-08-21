import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ChangeActorEquipment from '@app/components/commands/ChangeActorEquipment.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { Window } from '@app/tools/window-object.ts';
import { useChangeActorEquipmentCommandSchema } from '@app/composables/commands/useChangeActorEquipmentCommandSchema';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

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

	const mountWindow = async () => {
		const wrapper = mount(ChangeActorEquipment, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		return wrapper;
	};

	it('onMounted loadItems 填充 operation 选项', async () => {
		const wrapper = await mountWindow();
		const operation = document.getElementById('changeActorEquipment-operation') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(operation.dataItems).toHaveLength(5);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = await mountWindow();
		const { form } = useChangeActorEquipmentCommandSchema();
		CommandSchema.insert(target, 'changeActorEquipment');
		expect(Window.open).toHaveBeenCalledWith('changeActorEquipment');
		expect(form.actor).toEqual({ type: 'trigger' });
		expect(form.operation).toBe('add');
		expect(form.slot).toBe('weapon');
		expect(form.equipmentId).toBe('');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = await mountWindow();
		const { form } = useChangeActorEquipmentCommandSchema();
		CommandSchema.edit(target, {
			id: 'changeActorEquipment',
			params: {
				actor: { type: 'player' },
				operation: 'remove-instance',
				equipment: { type: 'equipment' }
			}
		});
		expect(Window.open).toHaveBeenCalledWith('changeActorEquipment');
		expect(form.operation).toBe('remove-instance');
		expect(form.equipment).toEqual({ type: 'equipment' });
		wrapper.unmount();
	});

	it('save 路径：用户改 form 后经 Command.cases.changeActorEquipment.save 保存', async () => {
		const wrapper = await mountWindow();
		const { form } = useChangeActorEquipmentCommandSchema();
		Command.cases.changeActorEquipment.customLoad!({
			actor: { type: 'trigger' },
			operation: 'add',
			slot: 'weapon',
			equipmentId: ''
		});
		form.equipmentId = 'sword';
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
		const wrapper = await mountWindow();
		const { form } = useChangeActorEquipmentCommandSchema();
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
