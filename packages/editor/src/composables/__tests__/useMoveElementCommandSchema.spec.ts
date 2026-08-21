import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import MoveElement from '@app/components/commands/MoveElement.vue';
import { Command, initCommandParseBridges } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Data } from '@app/data/data-object.ts';
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

const params = {
	element: { type: 'trigger' },
	properties: [{ key: 'content', value: 'hi' }],
	easingId: 'linear',
	duration: 1000,
	wait: true
};

describe('useMoveElementCommandSchema（moveElement 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
		Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(MoveElement, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'moveElement');
		expect(Window.open).toHaveBeenCalledWith('moveElement');
		expect(getControl('moveElement-element').read()).toEqual({ type: 'trigger' });
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(MoveElement, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, { id: 'moveElement', params });
		expect(Window.open).toHaveBeenCalledWith('moveElement');
		expect(getControl('moveElement-element').read()).toEqual({ type: 'trigger' });
		expect(getControl('moveElement-properties').read()).toEqual(params.properties);
		wrapper.unmount();
	});

	it('save 路径：properties 为空时校验失败不保存', async () => {
		const wrapper = mount(MoveElement, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.moveElement.customLoad!({ element: { type: 'trigger' }, properties: [] });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.moveElement.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：properties 非空时经 Command.cases.moveElement.save 保存', async () => {
		const wrapper = mount(MoveElement, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.moveElement.customLoad!(params);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.moveElement.save!();
		expect(saved).toHaveBeenCalledWith(params);
		wrapper.unmount();
	});
});
