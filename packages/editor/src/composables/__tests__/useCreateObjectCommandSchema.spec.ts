import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import CreateObject from '@app/components/commands/CreateObject.vue';
import { useCreateObjectCommandSchema } from '@app/composables/commands/useCreateObjectCommandSchema';
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

describe('useCreateObjectCommandSchema（createObject 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(CreateObject, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useCreateObjectCommandSchema();
		CommandSchema.insert(target, 'createObject');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('createObject');
		expect(form.presetId).toBe('');
		expect(form.position).toEqual({ type: 'actor', actor: { type: 'trigger' } });
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(CreateObject, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useCreateObjectCommandSchema();
		CommandSchema.edit(target, {
			id: 'createObject',
			params: { presetId: 'p1', position: { type: 'absolute', x: 1, y: 2 } }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('createObject');
		expect(form.presetId).toBe('p1');
		expect(form.position).toEqual({ type: 'absolute', x: 1, y: 2 });
		wrapper.unmount();
	});

	it('save 校验：presetId 必填，为空不保存', async () => {
		const wrapper = mount(CreateObject, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.createObject.customLoad!({
			presetId: '',
			position: { type: 'actor', actor: { type: 'trigger' } }
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.createObject.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：DOM 改动经 Command.cases.createObject.save 保存', async () => {
		const wrapper = mount(CreateObject, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.createObject.customLoad!({
			presetId: 'p1',
			position: { type: 'actor', actor: { type: 'trigger' } }
		});
		getControl('createObject-presetId').input('p2');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.createObject.save!();
		expect(saved).toHaveBeenCalledWith({
			presetId: 'p2',
			position: { type: 'actor', actor: { type: 'trigger' } }
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 preset 文本', () => {
		setWords();
		Command.parsePresetObject = vi.fn((v: unknown) => `P:${v}`) as never;
		Command.parsePosition = vi.fn(() => 'POS') as never;
		const contents = Command.cases.createObject.parse!({
			presetId: 'p1',
			position: { type: 'actor', actor: { type: 'trigger' } }
		});
		expect(contents[0]).toHaveProperty('color');
		expect(contents[2]).toHaveProperty('text');
	});
});
