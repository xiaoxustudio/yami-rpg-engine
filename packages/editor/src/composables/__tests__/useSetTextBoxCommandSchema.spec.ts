import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetTextBox from '@app/components/commands/SetTextBox.vue';
import { Command, initCommandParseBridges } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Window } from '@app/tools/window-object.ts';

initCommandParseBridges();

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface ControlEl extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
}

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

describe('useSetTextBoxCommandSchema（setTextBox 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(SetTextBox, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'setTextBox');
		expect(Window.open).toHaveBeenCalledWith('setTextBox');
		expect(getControl('setTextBox-element').read()).toEqual({ type: 'trigger' });
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(SetTextBox, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'setTextBox',
			params: { element: { type: 'trigger' }, properties: [{ key: 'content', value: 'hi' }] }
		});
		expect(Window.open).toHaveBeenCalledWith('setTextBox');
		expect(getControl('setTextBox-element').read()).toEqual({ type: 'trigger' });
		expect(getControl('setTextBox-properties').read()).toEqual([
			{ key: 'content', value: 'hi' }
		]);
		wrapper.unmount();
	});

	it('save 路径：properties 为空时校验失败不保存', async () => {
		const wrapper = mount(SetTextBox, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setTextBox.customLoad!({ element: { type: 'trigger' }, properties: [] });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setTextBox.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：properties 非空时经 Command.cases.setTextBox.save 保存', async () => {
		const wrapper = mount(SetTextBox, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setTextBox.customLoad!({
			element: { type: 'trigger' },
			properties: [{ key: 'content', value: 'hi' }]
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setTextBox.save!();
		expect(saved).toHaveBeenCalledWith({
			element: { type: 'trigger' },
			properties: [{ key: 'content', value: 'hi' }]
		});
		wrapper.unmount();
	});
});
