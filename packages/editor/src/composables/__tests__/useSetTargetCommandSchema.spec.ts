import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetTarget from '@app/components/commands/SetTarget.vue';
import { useSetTargetCommandSchema } from '@app/composables/commands/useSetTargetCommandSchema';
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

describe('useSetTargetCommandSchema（setTarget 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetTarget, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTargetCommandSchema();
		CommandSchema.insert(target, 'setTarget');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setTarget');
		expect(form.actor).toEqual({ type: 'trigger' });
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SetTarget, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTargetCommandSchema();
		CommandSchema.edit(target, { id: 'setTarget', params: { actor: { type: 'player' } } });
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setTarget');
		expect(form.actor).toEqual({ type: 'player' });
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.setTarget.save 保存', async () => {
		const wrapper = mount(SetTarget, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTargetCommandSchema();
		Command.cases.setTarget.customLoad!({ actor: { type: 'trigger' } });
		form.actor = { type: 'global' };
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setTarget.save!();
		expect(saved).toHaveBeenCalledWith({ actor: { type: 'global' } });
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 actor 文本', () => {
		setWords();
		Command.parseActor = vi.fn((a: { type: string }) => `A:${a.type}`) as never;
		const contents = Command.cases.setTarget.parse!({ actor: { type: 'trigger' } });
		expect(contents).toContainEqual({ text: 'A:trigger' });
	});
});
