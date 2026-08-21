import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetWindow from '@app/components/commands/SetWindow.vue';
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

describe('useSetWindowCommandSchema（setWindow 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(SetWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'setWindow');
		expect(Window.open).toHaveBeenCalledWith('setWindow');
		expect(getControl('setWindow-element').read()).toEqual({ type: 'trigger' });
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(SetWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'setWindow',
			params: { element: { type: 'trigger' }, properties: [{ key: 'content', value: 'hi' }] }
		});
		expect(Window.open).toHaveBeenCalledWith('setWindow');
		expect(getControl('setWindow-element').read()).toEqual({ type: 'trigger' });
		expect(getControl('setWindow-properties').read()).toEqual([
			{ key: 'content', value: 'hi' }
		]);
		wrapper.unmount();
	});

	it('save 路径：properties 为空时校验失败不保存', async () => {
		const wrapper = mount(SetWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setWindow.customLoad!({ element: { type: 'trigger' }, properties: [] });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setWindow.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：properties 非空时经 Command.cases.setWindow.save 保存', async () => {
		const wrapper = mount(SetWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setWindow.customLoad!({
			element: { type: 'trigger' },
			properties: [{ key: 'content', value: 'hi' }]
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setWindow.save!();
		expect(saved).toHaveBeenCalledWith({
			element: { type: 'trigger' },
			properties: [{ key: 'content', value: 'hi' }]
		});
		wrapper.unmount();
	});
});
