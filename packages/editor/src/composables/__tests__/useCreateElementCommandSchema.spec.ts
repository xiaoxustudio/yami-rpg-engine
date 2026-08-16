import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import CreateElement from '@app/components/commands/CreateElement.vue';
import { Command } from '@/command/command-object.ts';
import { CommandSchema } from '@/module/command/schema.ts';
import { Window } from '@/tools/window-object.ts';

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

describe('useCreateElementCommandSchema（createElement 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口后 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(CreateElement, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'createElement');
		expect(Window.open).toHaveBeenCalledWith('createElement');
		expect(getControl('createElement-operation').read()).toBe('append-all-to-root');
		expect(getControl('createElement-parent').read()).toEqual({ type: 'trigger' });
		expect(getControl('createElement-uiId').read()).toBe('');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(CreateElement, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'createElement',
			params: {
				operation: 'append-one-to-element',
				parent: { type: 'trigger' },
				presetId: 'p1'
			}
		});
		expect(Window.open).toHaveBeenCalledWith('createElement');
		expect(getControl('createElement-operation').read()).toBe('append-one-to-element');
		expect(getControl('createElement-parent').read()).toEqual({ type: 'trigger' });
		expect(getControl('createElement-presetId').read()).toBe('p1');
		wrapper.unmount();
	});

	it('save 路径：append-all-to-root 且 uiId 为空时校验失败不保存', async () => {
		const wrapper = mount(CreateElement, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.createElement.customLoad!({ operation: 'append-all-to-root', uiId: '' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.createElement.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：append-one-to-element 经 Command.cases.createElement.save 保存', async () => {
		const wrapper = mount(CreateElement, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.createElement.customLoad!({
			operation: 'append-one-to-element',
			parent: { type: 'trigger' },
			presetId: 'p1'
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.createElement.save!();
		expect(saved).toHaveBeenCalledWith({
			operation: 'append-one-to-element',
			parent: { type: 'trigger' },
			presetId: 'p1'
		});
		wrapper.unmount();
	});
});
