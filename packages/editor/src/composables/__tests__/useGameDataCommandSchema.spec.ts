import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import GameData from '@app/components/commands/GameData.vue';
import { useGameDataCommandSchema } from '@app/composables/commands/useGameDataCommandSchema';
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

describe('useGameDataCommandSchema（gameData 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(GameData, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useGameDataCommandSchema();
		CommandSchema.insert(target, 'gameData');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('gameData');
		expect(form.operation).toBe('save');
		expect(form.index).toBe(0);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(GameData, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useGameDataCommandSchema();
		CommandSchema.edit(target, {
			id: 'gameData',
			params: { operation: 'load', index: 3 }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('gameData');
		expect(form.operation).toBe('load');
		expect(form.index).toBe(3);
		wrapper.unmount();
	});

	it('save 路径：save 操作保存 variables（去空格）', async () => {
		const wrapper = mount(GameData, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useGameDataCommandSchema();
		Command.cases.gameData.customLoad!({ operation: 'save', index: 1, variables: 'a' });
		form.operation = 'save';
		form.index = 1;
		form.variables = ' hp, mp ';
		getControl('gameData-variables').write(' hp, mp ');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.gameData.save!();
		expect(saved).toHaveBeenCalledWith({ operation: 'save', index: 1, variables: 'hp, mp' });
		wrapper.unmount();
	});

	it('save 路径：load 操作仅保存 operation + index', async () => {
		const wrapper = mount(GameData, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useGameDataCommandSchema();
		Command.cases.gameData.customLoad!({ operation: 'load', index: 2, variables: '' });
		form.operation = 'load';
		form.index = 2;
		form.variables = 'hp';
		getControl('gameData-operation').input('load');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.gameData.save!();
		expect(saved).toHaveBeenCalledWith({ operation: 'load', index: 2 });
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 save 操作文本', () => {
		setWords();
		Command.parseVariableNumber = vi.fn((v: unknown) => `N:${v}`) as never;
		Command.setVariableColor = vi.fn((v: unknown) => `V:${v}`) as never;
		const contents = Command.cases.gameData.parse!({
			operation: 'save',
			index: 1,
			variables: 'hp'
		});
		expect(contents[0]).toHaveProperty('color');
		expect(contents[2]).toHaveProperty('text');
	});
});
