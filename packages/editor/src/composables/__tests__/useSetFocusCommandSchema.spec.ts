import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetFocus from '@app/components/commands/SetFocus.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Window } from '@app/tools/window-object.ts';

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

describe('useSetFocusCommandSchema（setFocus 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 operation/mode 选项', async () => {
		const wrapper = mount(SetFocus, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const operation = document.getElementById('setFocus-operation') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		const mode = document.getElementById('setFocus-mode') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(operation.dataItems).toHaveLength(4);
		expect(mode.dataItems).toHaveLength(2);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(SetFocus, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'setFocus');
		expect(Window.open).toHaveBeenCalledWith('setFocus');
		expect(getControl('setFocus-operation').read()).toBe('add');
		expect(getControl('setFocus-element').read()).toEqual({ type: 'trigger' });
		expect(getControl('setFocus-mode').read()).toBe('control-child-buttons');
		expect(getControl('setFocus-cancelable').read()).toBe(true);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(SetFocus, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'setFocus',
			params: {
				operation: 'remove',
				element: { type: 'player' }
			}
		});
		expect(Window.open).toHaveBeenCalledWith('setFocus');
		expect(getControl('setFocus-operation').read()).toBe('remove');
		expect(getControl('setFocus-element').read()).toEqual({ type: 'player' });
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.setFocus.save 保存', async () => {
		const wrapper = mount(SetFocus, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setFocus.customLoad!({
			operation: 'add',
			element: { type: 'trigger' },
			mode: 'control-child-buttons',
			cancelable: true
		});
		getControl('setFocus-operation').input('remove');
		getControl('setFocus-element').input({ type: 'player' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setFocus.save!();
		expect(saved).toHaveBeenCalledWith({
			operation: 'remove',
			element: { type: 'player' }
		});
		wrapper.unmount();
	});

	it('save 路径：remove-latest/reset 只保存 operation', async () => {
		const wrapper = mount(SetFocus, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setFocus.customLoad!({
			operation: 'reset',
			element: { type: 'trigger' },
			mode: 'control-child-buttons',
			cancelable: true
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setFocus.save!();
		expect(saved).toHaveBeenCalledWith({ operation: 'reset' });
		wrapper.unmount();
	});
});
