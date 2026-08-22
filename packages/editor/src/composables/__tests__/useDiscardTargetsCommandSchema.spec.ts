import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import DiscardTargets from '@app/components/commands/DiscardTargets.vue';
import { useDiscardTargetsCommandSchema } from '@app/composables/commands/useDiscardTargetsCommandSchema';
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

describe('useDiscardTargetsCommandSchema（discardTargets 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(DiscardTargets, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useDiscardTargetsCommandSchema();
		CommandSchema.insert(target, 'discardTargets');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('discardTargets');
		expect(form.actor).toEqual({ type: 'trigger' });
		expect(form.selector).toBe('any');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(DiscardTargets, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useDiscardTargetsCommandSchema();
		CommandSchema.edit(target, {
			id: 'discardTargets',
			params: { actor: { type: 'player' }, selector: 'enemy', distance: 5 }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('discardTargets');
		expect(form.selector).toBe('enemy');
		expect(form.distance).toBe(5);
		wrapper.unmount();
	});

	it('save 路径：form 改动经 Command.cases.discardTargets.save 保存', async () => {
		const wrapper = mount(DiscardTargets, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useDiscardTargetsCommandSchema();
		Command.cases.discardTargets.customLoad!({
			actor: { type: 'trigger' },
			selector: 'any',
			distance: 0
		});
		form.distance = 10;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.discardTargets.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			selector: 'any',
			distance: 10
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 actor + selector 文本', () => {
		setWords();
		Command.parseActor = vi.fn((a: unknown) => `A:${(a as { type: string }).type}`) as never;
		Command.parseActorSelector = vi.fn((v: unknown) => `S:${v}`) as never;
		const contents = Command.cases.discardTargets.parse!({
			actor: { type: 'trigger' },
			selector: 'any',
			distance: 0
		});
		expect(contents[0]).toHaveProperty('color');
		expect(contents[2]).toHaveProperty('text');
	});
});
