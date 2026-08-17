import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetCooldown from '@app/components/commands/SetCooldown.vue';
import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from '@app/legacy/module/command/schema.ts';
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

describe('useSetCooldownCommandSchema（setCooldown 命令表单 composable：insert/edit/save 路径）', () => {
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

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(SetCooldown, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'setCooldown');
		expect(Window.open).toHaveBeenCalledWith('setCooldown');
		expect(getControl('setCooldown-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('setCooldown-operation').read()).toBe('set');
		expect(getControl('setCooldown-key').read()).toBe('skill1');
		expect(getControl('setCooldown-cooldown').read()).toBe(1);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(SetCooldown, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'setCooldown',
			params: {
				actor: { type: 'trigger' },
				operation: 'increase',
				key: 'skill1',
				cooldown: 500
			}
		});
		expect(Window.open).toHaveBeenCalledWith('setCooldown');
		expect(getControl('setCooldown-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('setCooldown-operation').read()).toBe('increase');
		expect(getControl('setCooldown-key').read()).toBe('skill1');
		expect(getControl('setCooldown-cooldown').read()).toBe(500);
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.setCooldown.save 保存', async () => {
		const wrapper = mount(SetCooldown, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setCooldown.customLoad!({
			actor: { type: 'trigger' },
			operation: 'set',
			key: 'skill1',
			cooldown: 0
		});
		getControl('setCooldown-operation').input('decrease');
		getControl('setCooldown-cooldown').write(300);
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
