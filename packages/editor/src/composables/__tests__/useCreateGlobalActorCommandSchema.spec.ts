import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import CreateGlobalActor from '@app/components/commands/CreateGlobalActor.vue';
import { useCreateGlobalActorCommandSchema } from '@app/composables/commands/useCreateGlobalActorCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Data } from '@app/data/data-object.ts';
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

describe('useCreateGlobalActorCommandSchema（createGlobalActor 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Data.teams = { list: [{ id: 'team0', name: 'Team0' }] } as never;
		Data.createTeamItems = vi.fn(() => [{ name: 'Team0', value: 'team0' }]) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(CreateGlobalActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useCreateGlobalActorCommandSchema();
		CommandSchema.insert(target, 'createGlobalActor');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('createGlobalActor');
		expect(form.actorId).toBe('');
		expect(form.teamId).toBe('team0');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(CreateGlobalActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useCreateGlobalActorCommandSchema();
		CommandSchema.edit(target, {
			id: 'createGlobalActor',
			params: { actorId: 'a1', teamId: 'team1' }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('createGlobalActor');
		expect(form.actorId).toBe('a1');
		expect(form.teamId).toBe('team1');
		wrapper.unmount();
	});

	it('save 校验：actorId 必填，为空不保存', async () => {
		const wrapper = mount(CreateGlobalActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.createGlobalActor.customLoad!({ actorId: '', teamId: 'team0' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.createGlobalActor.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：DOM 改动经 Command.cases.createGlobalActor.save 保存', async () => {
		const wrapper = mount(CreateGlobalActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.createGlobalActor.customLoad!({ actorId: 'a1', teamId: 'team0' });
		getControl('createGlobalActor-actorId').input('a2');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.createGlobalActor.save!();
		expect(saved).toHaveBeenCalledWith({ actorId: 'a2', teamId: 'team0' });
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 actor 文本', () => {
		setWords();
		Command.parseFileName = vi.fn((v: unknown) => `F:${v}`) as never;
		Command.parseTeam = vi.fn((v: unknown) => `T:${v}`) as never;
		const contents = Command.cases.createGlobalActor.parse!({ actorId: 'a1', teamId: 'team0' });
		expect(contents[0]).toHaveProperty('color');
		expect(contents[2]).toHaveProperty('text');
	});
});
