import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import Block from '@app/components/commands/Block.vue';
import { useBlockCommandSchema } from '@app/composables/commands/useBlockCommandSchema';
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

describe('useBlockCommandSchema（block 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form（note 空、asynchronous false）', async () => {
		const wrapper = mount(Block, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useBlockCommandSchema();
		CommandSchema.insert(target, 'block');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('block');
		expect(form.note).toBe('');
		expect(form.asynchronous).toBe(false);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form 与控件 DOM', async () => {
		const wrapper = mount(Block, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useBlockCommandSchema();
		CommandSchema.edit(target, {
			id: 'block',
			params: { note: 'note', asynchronous: true }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('block');
		expect(form.note).toBe('note');
		expect(form.asynchronous).toBe(true);
		expect(getControl('block-note').read()).toBe('note');
		wrapper.unmount();
	});

	it('save 路径：note 经 onSave 收集并保存（asynchronous 来自控件）', async () => {
		const wrapper = mount(Block, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useBlockCommandSchema();
		Command.cases.block.customLoad!({ note: 'hello', asynchronous: false });
		form.note = 'hello ';
		getControl('block-asynchronous').input(true);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.block.customSave!();
		expect(saved).toHaveBeenCalledWith({
			note: 'hello',
			asynchronous: true,
			commands: []
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 note 与子命令块', () => {
		setWords();
		const contents = Command.cases.block.parse!({
			note: 'x',
			asynchronous: false,
			commands: []
		});
		expect(contents).toHaveLength(6);
		expect(contents[0]).toEqual({ fold: true });
		expect(contents[1]).toHaveProperty('color');
		expect(contents[5]).toHaveProperty('text');
	});
});
