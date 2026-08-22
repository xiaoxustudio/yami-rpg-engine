import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import LoadImage from '@app/components/commands/LoadImage.vue';
import { useLoadImageCommandSchema } from '@app/composables/commands/useLoadImageCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Data } from '@app/data/data-object.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
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

describe('useLoadImageCommandSchema（loadImage 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Data.enumeration = { context: { getString: (id: string) => id } } as never;
		Enum.getStringItems = vi.fn(() => [{ name: 'k0', value: 'k0' }]) as never;
		Enum.getDefStringId = vi.fn(() => 'k0') as never;
		VariableGetter.isNone = (v: unknown) => v === null || v === undefined;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(LoadImage, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useLoadImageCommandSchema();
		CommandSchema.insert(target, 'loadImage');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('loadImage');
		expect(form.element).toEqual({ type: 'trigger' });
		expect(form.type).toBe('actor-portrait');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(LoadImage, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useLoadImageCommandSchema();
		CommandSchema.edit(target, {
			id: 'loadImage',
			params: { element: { type: 'player' }, type: 'skill-icon', skill: { type: 'trigger' } }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('loadImage');
		expect(form.element).toEqual({ type: 'player' });
		expect(form.type).toBe('skill-icon');
		wrapper.unmount();
	});

	it('save 路径：skill-icon 保存 element + type + skill', async () => {
		const wrapper = mount(LoadImage, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useLoadImageCommandSchema();
		Command.cases.loadImage.customLoad!({
			element: { type: 'trigger' },
			type: 'skill-icon',
			skill: { type: 'trigger' }
		});
		form.type = 'skill-icon';
		form.skill = { type: 'fire' };
		getControl('loadImage-skill').input({ type: 'fire' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.loadImage.save!();
		expect(saved).toHaveBeenCalledWith({
			element: { type: 'trigger' },
			type: 'skill-icon',
			skill: { type: 'fire' }
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 actor 文本', () => {
		setWords();
		Command.parseElement = vi.fn((e: unknown) => `E:${(e as { type: string }).type}`) as never;
		Command.parseActor = vi.fn((a: unknown) => `A:${(a as { type: string }).type}`) as never;
		const contents = Command.cases.loadImage.parse!({
			element: { type: 'trigger' },
			type: 'actor-portrait',
			actor: { type: 'player' }
		});
		expect(contents[0]).toHaveProperty('color');
		expect(contents[2]).toHaveProperty('text');
	});
});
