import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetCooldown from '@app/components/commands/SetCooldown.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { useSetCooldownCommandSchema } from '@app/composables/commands/useSetCooldownCommandSchema';
import { Enum } from '@app/enum/enum-window.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

describe('useSetCooldownCommandSchema（setCooldown 命令表单 composable：form 状态 + insert/edit/save）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Enum.getStringItems = vi.fn(() => [{ name: 'Skill 1', value: 'skill1' }]) as never;
		Enum.getDefStringId = vi.fn(() => 'skill1') as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 operation 选项', async () => {
		const wrapper = mount(SetCooldown, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const operation = document.getElementById('setCooldown-operation') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(operation.dataItems).toHaveLength(3);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form（v-model 驱动控件）', async () => {
		const wrapper = mount(SetCooldown, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetCooldownCommandSchema();
		CommandSchema.insert(target, 'setCooldown');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setCooldown');
		expect(form.actor).toEqual({ type: 'trigger' });
		expect(form.operation).toBe('set');
		expect(form.key).toBe('skill1');
		expect(form.cooldown).toBe(0);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form（v-model 驱动控件）', async () => {
		const wrapper = mount(SetCooldown, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetCooldownCommandSchema();
		CommandSchema.edit(target, {
			id: 'setCooldown',
			params: {
				actor: { type: 'trigger' },
				operation: 'increase',
				key: 'skill1',
				cooldown: 500
			}
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setCooldown');
		expect(form.actor).toEqual({ type: 'trigger' });
		expect(form.operation).toBe('increase');
		expect(form.key).toBe('skill1');
		expect(form.cooldown).toBe(500);
		wrapper.unmount();
	});

	it('save 路径：用户改 form 后经 Command.cases.setCooldown.save 保存', async () => {
		const wrapper = mount(SetCooldown, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetCooldownCommandSchema();
		Command.cases.setCooldown.customLoad!({
			actor: { type: 'trigger' },
			operation: 'set',
			key: 'skill1',
			cooldown: 0
		});
		form.operation = 'decrease';
		form.cooldown = 300;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setCooldown.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			operation: 'decrease',
			key: 'skill1',
			cooldown: 300
		});
		wrapper.unmount();
	});
});
