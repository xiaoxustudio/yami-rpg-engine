import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetButton from '@app/components/commands/SetButton.vue';
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

describe('useSetButtonCommandSchema（setButton 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(SetButton, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'setButton');
		expect(Window.open).toHaveBeenCalledWith('setButton');
		expect(getControl('setButton-element').read()).toEqual({ type: 'trigger' });
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(SetButton, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'setButton',
			params: { element: { type: 'trigger' }, properties: [{ key: 'content', value: 'hi' }] }
		});
		expect(Window.open).toHaveBeenCalledWith('setButton');
		expect(getControl('setButton-element').read()).toEqual({ type: 'trigger' });
		expect(getControl('setButton-properties').read()).toEqual([
			{ key: 'content', value: 'hi' }
		]);
		wrapper.unmount();
	});

	it('save 路径：properties 为空时校验失败不保存', async () => {
		const wrapper = mount(SetButton, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setButton.customLoad!({ element: { type: 'trigger' }, properties: [] });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setButton.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：properties 非空时经 Command.cases.setButton.save 保存', async () => {
		const wrapper = mount(SetButton, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setButton.customLoad!({
			element: { type: 'trigger' },
			properties: [{ key: 'content', value: 'hi' }]
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setButton.save!();
		expect(saved).toHaveBeenCalledWith({
			element: { type: 'trigger' },
			properties: [{ key: 'content', value: 'hi' }]
		});
		wrapper.unmount();
	});
});
