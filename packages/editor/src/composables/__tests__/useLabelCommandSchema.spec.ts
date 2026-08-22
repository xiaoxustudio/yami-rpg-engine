import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import Label from '@app/components/commands/Label.vue';
import { useLabelCommandSchema } from '@app/composables/commands/useLabelCommandSchema';
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

describe('useLabelCommandSchema（label 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form（name 空）', async () => {
		const wrapper = mount(Label, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useLabelCommandSchema();
		CommandSchema.insert(target, 'label');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('label');
		expect(form.name).toBe('');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(Label, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useLabelCommandSchema();
		CommandSchema.edit(target, { id: 'label', params: { name: 'start' } });
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('label');
		expect(form.name).toBe('start');
		wrapper.unmount();
	});

	it('save 校验：name 必填，为空不保存', async () => {
		const wrapper = mount(Label, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.label.customLoad!({ name: '' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.label.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.label.save 保存', async () => {
		const wrapper = mount(Label, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useLabelCommandSchema();
		Command.cases.label.customLoad!({ name: 'a' });
		form.name = 'start';
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.label.save!();
		expect(saved).toHaveBeenCalledWith({ name: 'start' });
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 label 名称', () => {
		const contents = Command.cases.label.parse!({ name: 'start' });
		expect(contents[0]).toHaveProperty('color');
		expect(contents[3]).toHaveProperty('text');
	});
});
