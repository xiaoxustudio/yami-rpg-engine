import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetElement from '@app/components/commands/SetElement.vue';
import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
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

describe('useSetElementCommandSchema（setElement 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 operation 选项', async () => {
		const wrapper = mount(SetElement, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const operation = document.getElementById('setElement-operation') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(operation.dataItems).toHaveLength(7);
		expect(operation.dataItems!.map((item) => item.value)).toContain('hide');
		expect(operation.dataItems!.map((item) => item.value)).toContain('move-to-last');
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(SetElement, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'setElement');
		expect(Window.open).toHaveBeenCalledWith('setElement');
		expect(getControl('setElement-element').read()).toEqual({ type: 'trigger' });
		expect(getControl('setElement-operation').read()).toBe('hide');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(SetElement, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'setElement',
			params: { element: { type: 'trigger' }, operation: 'show' }
		});
		expect(Window.open).toHaveBeenCalledWith('setElement');
		expect(getControl('setElement-element').read()).toEqual({ type: 'trigger' });
		expect(getControl('setElement-operation').read()).toBe('show');
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.setElement.save 保存', async () => {
		const wrapper = mount(SetElement, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setElement.customLoad!({
			element: { type: 'trigger' },
			operation: 'hide'
		});
		getControl('setElement-operation').input('show');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setElement.save!();
		expect(saved).toHaveBeenCalledWith({ element: { type: 'trigger' }, operation: 'show' });
		wrapper.unmount();
	});
});
