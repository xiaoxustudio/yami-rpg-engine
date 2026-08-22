import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import StopAudio from '@app/components/commands/StopAudio.vue';
import { useStopAudioCommandSchema } from '@app/composables/commands/useStopAudioCommandSchema';
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

describe('useStopAudioCommandSchema（stopAudio 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(StopAudio, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useStopAudioCommandSchema();
		CommandSchema.insert(target, 'stopAudio');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('stopAudio');
		expect(form.type).toBe('bgm');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(StopAudio, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useStopAudioCommandSchema();
		CommandSchema.edit(target, { id: 'stopAudio', params: { type: 'se' } });
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('stopAudio');
		expect(form.type).toBe('se');
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.stopAudio.save 保存', async () => {
		const wrapper = mount(StopAudio, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useStopAudioCommandSchema();
		Command.cases.stopAudio.customLoad!({ type: 'bgm' });
		form.type = 'all';
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.stopAudio.save!();
		expect(saved).toHaveBeenCalledWith({ type: 'all' });
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染音频类型文本', () => {
		setWords();
		Command.parseAudioType = vi.fn((v: unknown) => `AT:${v}`) as never;
		const contents = Command.cases.stopAudio.parse!({ type: 'bgm' });
		expect(contents).toContainEqual({ text: 'AT:bgm' });
	});
});
