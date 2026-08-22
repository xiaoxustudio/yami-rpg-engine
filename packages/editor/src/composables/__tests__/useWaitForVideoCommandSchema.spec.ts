import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import WaitForVideo from '@app/components/commands/WaitForVideo.vue';
import { useWaitForVideoCommandSchema } from '@app/composables/commands/useWaitForVideoCommandSchema';
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

describe('useWaitForVideoCommandSchema（waitForVideo 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(WaitForVideo, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useWaitForVideoCommandSchema();
		CommandSchema.insert(target, 'waitForVideo');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('waitForVideo');
		expect(form.element).toEqual({ type: 'trigger' });
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(WaitForVideo, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useWaitForVideoCommandSchema();
		CommandSchema.edit(target, {
			id: 'waitForVideo',
			params: { element: { type: 'player' } }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('waitForVideo');
		expect(form.element).toEqual({ type: 'player' });
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.waitForVideo.save 保存', async () => {
		const wrapper = mount(WaitForVideo, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useWaitForVideoCommandSchema();
		Command.cases.waitForVideo.customLoad!({ element: { type: 'trigger' } });
		form.element = { type: 'global' };
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.waitForVideo.save!();
		expect(saved).toHaveBeenCalledWith({ element: { type: 'global' } });
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 element 文本', () => {
		setWords();
		Command.parseElement = vi.fn((e: { type: string }) => `E:${e.type}`) as never;
		const contents = Command.cases.waitForVideo.parse!({ element: { type: 'trigger' } });
		expect(contents).toContainEqual({ text: 'E:trigger' });
	});
});
