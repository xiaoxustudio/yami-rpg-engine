import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import DeleteElement from '@app/components/commands/DeleteElement.vue';
import { useDeleteElementCommandSchema } from '@app/composables/commands/useDeleteElementCommandSchema';
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

const words: string[] = [];
const setWords = (): void => {
	words.length = 0;
	Command.words = {
		push: (value: string) => {
			words.push(value);
			return Command.words;
		},
		join: (separator?: string) => words.join(separator ?? '')
	} as never;
};

describe('useDeleteElementCommandSchema（deleteElement 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(DeleteElement, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useDeleteElementCommandSchema();
		CommandSchema.insert(target, 'deleteElement');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('deleteElement');
		expect(form.operation).toBe('delete-element');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(DeleteElement, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useDeleteElementCommandSchema();
		CommandSchema.edit(target, {
			id: 'deleteElement',
			params: { operation: 'delete-children', element: { type: 'button' } }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('deleteElement');
		expect(form.operation).toBe('delete-children');
		expect(form.element).toEqual({ type: 'button' });
		wrapper.unmount();
	});

	it('save 路径：delete-children 保存 operation + element', async () => {
		const wrapper = mount(DeleteElement, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useDeleteElementCommandSchema();
		Command.cases.deleteElement.customLoad!({
			operation: 'delete-children',
			element: { type: 'button' }
		});
		form.operation = 'delete-children';
		form.element = { type: 'dialog' };
		getControl('deleteElement-element').input({ type: 'dialog' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.deleteElement.save!();
		expect(saved).toHaveBeenCalledWith({
			operation: 'delete-children',
			element: { type: 'dialog' }
		});
		wrapper.unmount();
	});

	it('save 路径：delete-all 仅保存 operation', async () => {
		const wrapper = mount(DeleteElement, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useDeleteElementCommandSchema();
		Command.cases.deleteElement.customLoad!({
			operation: 'delete-all',
			element: { type: 'button' }
		});
		form.operation = 'delete-all';
		form.element = { type: 'dialog' };
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.deleteElement.save!();
		expect(saved).toHaveBeenCalledWith({ operation: 'delete-all' });
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 element 文本', () => {
		setWords();
		Command.parseElement = vi.fn((e: unknown) => `E:${(e as { type: string }).type}`) as never;
		const contents = Command.cases.deleteElement.parse!({
			operation: 'delete-children',
			element: { type: 'button' }
		});
		expect(contents[0]).toHaveProperty('color');
		expect(contents[2]).toHaveProperty('text');
	});
});
