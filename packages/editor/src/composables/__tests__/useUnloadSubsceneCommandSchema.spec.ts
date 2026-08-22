import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import UnloadSubscene from '@app/components/commands/UnloadSubscene.vue';
import { useUnloadSubsceneCommandSchema } from '@app/composables/commands/useUnloadSubsceneCommandSchema';
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

describe('useUnloadSubsceneCommandSchema（unloadSubscene 命令表单 composable：insert/edit/save/validate/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(UnloadSubscene, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useUnloadSubsceneCommandSchema();
		CommandSchema.insert(target, 'unloadSubscene');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('unloadSubscene');
		expect(form.sceneId).toBe('');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(UnloadSubscene, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useUnloadSubsceneCommandSchema();
		CommandSchema.edit(target, {
			id: 'unloadSubscene',
			params: { sceneId: 'subscene1' }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('unloadSubscene');
		expect(form.sceneId).toBe('subscene1');
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.unloadSubscene.save 保存', async () => {
		const wrapper = mount(UnloadSubscene, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useUnloadSubsceneCommandSchema();
		Command.cases.unloadSubscene.customLoad!({ sceneId: 'subscene1' });
		form.sceneId = 'subscene2';
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.unloadSubscene.save!();
		expect(saved).toHaveBeenCalledWith({ sceneId: 'subscene2' });
		wrapper.unmount();
	});

	it('save 路径：sceneId 为空校验失败不保存', async () => {
		const wrapper = mount(UnloadSubscene, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.unloadSubscene.customLoad!({ sceneId: '' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.unloadSubscene.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 scene 文件文本', () => {
		setWords();
		Command.parseVariableFile = vi.fn((v: unknown) => `F:${v}`) as never;
		const contents = Command.cases.unloadSubscene.parse!({ sceneId: 'subscene1' });
		expect(contents).toContainEqual({ text: 'F:subscene1' });
	});
});
