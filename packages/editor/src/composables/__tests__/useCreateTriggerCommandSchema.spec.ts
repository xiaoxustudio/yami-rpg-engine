import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import CreateTrigger from '@app/components/commands/CreateTrigger.vue';
import { useCreateTriggerCommandSchema } from '@app/composables/commands/useCreateTriggerCommandSchema';
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

describe('useCreateTriggerCommandSchema（createTrigger 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(CreateTrigger, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useCreateTriggerCommandSchema();
		CommandSchema.insert(target, 'createTrigger');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('createTrigger');
		expect(form.triggerId).toBe('');
		expect(form.caster).toEqual({ type: 'trigger' });
		expect(form.distance).toBe(0);
		expect(form.scale).toBe(1);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(CreateTrigger, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useCreateTriggerCommandSchema();
		CommandSchema.edit(target, {
			id: 'createTrigger',
			params: { triggerId: 't1', distance: 5 }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('createTrigger');
		expect(form.triggerId).toBe('t1');
		expect(form.distance).toBe(5);
		wrapper.unmount();
	});

	it('save 校验：triggerId 为空不保存', async () => {
		const wrapper = mount(CreateTrigger, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.createTrigger.customLoad!({
			triggerId: '',
			caster: { type: 'trigger' },
			origin: { type: 'actor', actor: { type: 'trigger' } },
			angle: { type: 'direction', degrees: 0 },
			distance: 0,
			scale: 1,
			timeScale: 1
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.createTrigger.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：DOM 改动经 Command.cases.createTrigger.save 保存', async () => {
		const wrapper = mount(CreateTrigger, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.createTrigger.customLoad!({
			triggerId: 't1',
			caster: { type: 'trigger' },
			origin: { type: 'actor', actor: { type: 'trigger' } },
			angle: { type: 'direction', degrees: 0 },
			distance: 0,
			scale: 1,
			timeScale: 1
		});
		getControl('createTrigger-triggerId').write('t2');
		getControl('createTrigger-distance').write(3);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.createTrigger.save!();
		expect(saved).toHaveBeenCalledWith({
			triggerId: 't2',
			caster: { type: 'trigger' },
			origin: { type: 'actor', actor: { type: 'trigger' } },
			angle: { type: 'direction', degrees: 0 },
			distance: 3,
			scale: 1,
			timeScale: 1
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 trigger 文本', () => {
		setWords();
		Command.parseVariableFile = vi.fn((v: unknown) => `F:${v}`) as never;
		Command.parseActor = vi.fn(() => 'ACTOR') as never;
		Command.parsePosition = vi.fn(() => 'POS') as never;
		Command.parseAngle = vi.fn(() => 'ANG') as never;
		Command.parseVariableNumber = vi.fn((v: unknown) => `N:${v}`) as never;
		const contents = Command.cases.createTrigger.parse!({
			triggerId: 't1',
			caster: { type: 'trigger' },
			origin: { type: 'actor', actor: { type: 'trigger' } },
			angle: { type: 'direction', degrees: 0 },
			distance: 0,
			scale: 1,
			timeScale: 1
		});
		expect(contents[0]).toHaveProperty('color');
		expect(contents[2]).toHaveProperty('text');
	});
});
