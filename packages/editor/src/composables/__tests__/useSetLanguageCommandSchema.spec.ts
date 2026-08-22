import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetLanguage from '@app/components/commands/SetLanguage.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { useSetLanguageCommandSchema } from '@app/composables/commands/useSetLanguageCommandSchema';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

describe('useSetLanguageCommandSchema（setLanguage 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetLanguage, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetLanguageCommandSchema();
		CommandSchema.insert(target, 'setLanguage');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setLanguage');
		expect(form.language).toBe('auto');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SetLanguage, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetLanguageCommandSchema();
		CommandSchema.edit(target, { id: 'setLanguage', params: { language: 'en' } });
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setLanguage');
		expect(form.language).toBe('en');
		wrapper.unmount();
	});

	it('save 路径：customLoad 未传 language 时使用默认 auto，改 form 后保存', async () => {
		const wrapper = mount(SetLanguage, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetLanguageCommandSchema();
		Command.cases.setLanguage.customLoad!({});
		form.language = 'zh-CN';
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setLanguage.save!();
		expect(saved).toHaveBeenCalledWith({ language: 'zh-CN' });
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 language 文本', () => {
		const contents = Command.cases.setLanguage.parse!({ language: 'en' });
		expect(contents[0]).toEqual({ color: 'system' });
		expect(contents[1].text).toContain('command.setLanguage');
		expect(contents[2].text).toBe('languages.en');
	});
});
