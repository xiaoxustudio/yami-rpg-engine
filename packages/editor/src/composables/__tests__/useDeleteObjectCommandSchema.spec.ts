import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import DeleteObject from '@app/components/commands/DeleteObject.vue';
import { useDeleteObjectCommandSchema } from '@app/composables/commands/useDeleteObjectCommandSchema';
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

describe('useDeleteObjectCommandSchema（deleteObject 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(DeleteObject, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useDeleteObjectCommandSchema();
		CommandSchema.insert(target, 'deleteObject');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('deleteObject');
		expect(form.object).toEqual({ type: 'trigger' });
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(DeleteObject, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useDeleteObjectCommandSchema();
		CommandSchema.edit(target, { id: 'deleteObject', params: { object: { type: 'player' } } });
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('deleteObject');
		expect(form.object).toEqual({ type: 'player' });
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.deleteObject.save 保存', async () => {
		const wrapper = mount(DeleteObject, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useDeleteObjectCommandSchema();
		Command.cases.deleteObject.customLoad!({ object: { type: 'trigger' } });
		form.object = { type: 'player' };
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.deleteObject.save!();
		expect(saved).toHaveBeenCalledWith({ object: { type: 'player' } });
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 object 文本', () => {
		Command.parseObject = vi.fn((o: unknown) => `O:${(o as { type: string }).type}`) as never;
		const contents = Command.cases.deleteObject.parse!({ object: { type: 'player' } });
		expect(contents[0]).toHaveProperty('color');
		expect(contents[2]).toHaveProperty('text');
	});
});
