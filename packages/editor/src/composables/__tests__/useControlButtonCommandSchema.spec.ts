import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ControlButton from '@app/components/commands/ControlButton.vue';
import { useControlButtonCommandSchema } from '@app/composables/commands/useControlButtonCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

interface ControlEl extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
	input(value: unknown): void;
}

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

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

describe('useControlButtonCommandSchema（controlButton 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(ControlButton, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useControlButtonCommandSchema();
		CommandSchema.insert(target, 'controlButton');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('controlButton');
		expect(form.operation).toBe('select-default');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(ControlButton, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useControlButtonCommandSchema();
		CommandSchema.edit(target, {
			id: 'controlButton',
			params: { operation: 'select', element: { type: 'player' } }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('controlButton');
		expect(form.operation).toBe('select');
		expect(form.element).toEqual({ type: 'player' });
		wrapper.unmount();
	});

	it('save 路径：select 操作保存 operation + element', async () => {
		const wrapper = mount(ControlButton, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useControlButtonCommandSchema();
		Command.cases.controlButton.customLoad!({
			operation: 'select',
			element: { type: 'trigger' }
		});
		form.operation = 'select';
		form.element = { type: 'button' };
		getControl('controlButton-element').input({ type: 'button' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.controlButton.save!();
		expect(saved).toHaveBeenCalledWith({
			operation: 'select',
			element: { type: 'button' }
		});
		wrapper.unmount();
	});

	it('save 路径：select-default 仅保存 operation', async () => {
		const wrapper = mount(ControlButton, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useControlButtonCommandSchema();
		Command.cases.controlButton.customLoad!({
			operation: 'select-default',
			element: { type: 'trigger' }
		});
		form.operation = 'select-default';
		form.element = { type: 'button' };
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.controlButton.save!();
		expect(saved).toHaveBeenCalledWith({ operation: 'select-default' });
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染操作文本', () => {
		setWords();
		Command.parseElement = vi.fn((e: unknown) => `E:${(e as { type: string }).type}`) as never;
		const contents = Command.cases.controlButton.parse!({
			operation: 'select',
			element: { type: 'button' }
		});
		expect(contents[0]).toHaveProperty('color');
		expect(contents[2]).toHaveProperty('text');
	});
});
