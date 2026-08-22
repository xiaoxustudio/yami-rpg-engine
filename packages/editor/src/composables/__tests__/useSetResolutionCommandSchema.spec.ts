import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetResolution from '@app/components/commands/SetResolution.vue';
import { useSetResolutionCommandSchema } from '@app/composables/commands/useSetResolutionCommandSchema';
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

describe('useSetResolutionCommandSchema（setResolution 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetResolution, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetResolutionCommandSchema();
		CommandSchema.insert(target, 'setResolution');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setResolution');
		expect(form.width).toBe(1920);
		expect(form.height).toBe(1080);
		expect(form.sceneScale).toBe(1);
		expect(form.uiScale).toBe(1);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SetResolution, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetResolutionCommandSchema();
		CommandSchema.edit(target, {
			id: 'setResolution',
			params: { width: 2560, height: 1440, sceneScale: 0.5, uiScale: 2 }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setResolution');
		expect(form.width).toBe(2560);
		expect(form.height).toBe(1440);
		expect(form.sceneScale).toBe(0.5);
		expect(form.uiScale).toBe(2);
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.setResolution.save 保存', async () => {
		const wrapper = mount(SetResolution, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetResolutionCommandSchema();
		Command.cases.setResolution.customLoad!({
			width: 1920,
			height: 1080,
			sceneScale: 1,
			uiScale: 1
		});
		form.width = 3840;
		form.sceneScale = 0.5;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setResolution.save!();
		expect(saved).toHaveBeenCalledWith({
			width: 3840,
			height: 1080,
			sceneScale: 0.5,
			uiScale: 1
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染分辨率 + 缩放文本', () => {
		setWords();
		Command.parseVariableNumber = vi.fn((v: unknown) => `N:${v}`) as never;
		const contents = Command.cases.setResolution.parse!({
			width: 1920,
			height: 1080,
			sceneScale: 1,
			uiScale: 1
		});
		const text = (contents[2] as { text: string }).text;
		expect(text).toContain('N:1920');
		expect(text).toContain('N:1080');
		expect(text).toContain('N:1');
	});
});
