import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import AppendTarget from '@app/components/commands/AppendTarget.vue';
import { useAppendTargetCommandSchema } from '@app/composables/commands/useAppendTargetCommandSchema';
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

describe('useAppendTargetCommandSchema（appendTarget 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form（actor/target 默认 trigger）', async () => {
		const wrapper = mount(AppendTarget, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useAppendTargetCommandSchema();
		CommandSchema.insert(target, 'appendTarget');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('appendTarget');
		expect(form.actor).toEqual({ type: 'trigger' });
		expect(form.target).toEqual({ type: 'trigger' });
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(AppendTarget, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useAppendTargetCommandSchema();
		CommandSchema.edit(target, {
			id: 'appendTarget',
			params: { actor: { type: 'player' } }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('appendTarget');
		expect(form.actor).toEqual({ type: 'player' });
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.appendTarget.save 保存', async () => {
		const wrapper = mount(AppendTarget, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useAppendTargetCommandSchema();
		Command.cases.appendTarget.customLoad!({
			actor: { type: 'trigger' },
			target: { type: 'trigger' }
		});
		form.target = { type: 'player' };
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.appendTarget.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			target: { type: 'player' }
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 actor + target 文本', () => {
		setWords();
		Command.parseActor = vi.fn((a: unknown) => `A:${(a as { type: string }).type}`) as never;
		const contents = Command.cases.appendTarget.parse!({
			actor: { type: 'trigger' },
			target: { type: 'player' }
		});
		expect(contents).toContainEqual({ text: 'A:triggerA:player' });
	});
});
