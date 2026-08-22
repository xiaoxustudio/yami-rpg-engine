import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import DeleteActor from '@app/components/commands/DeleteActor.vue';
import { useDeleteActorCommandSchema } from '@app/composables/commands/useDeleteActorCommandSchema';
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

describe('useDeleteActorCommandSchema（deleteActor 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(DeleteActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useDeleteActorCommandSchema();
		CommandSchema.insert(target, 'deleteActor');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('deleteActor');
		expect(form.actor).toEqual({ type: 'trigger' });
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(DeleteActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useDeleteActorCommandSchema();
		CommandSchema.edit(target, { id: 'deleteActor', params: { actor: { type: 'player' } } });
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('deleteActor');
		expect(form.actor).toEqual({ type: 'player' });
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.deleteActor.save 保存', async () => {
		const wrapper = mount(DeleteActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useDeleteActorCommandSchema();
		Command.cases.deleteActor.customLoad!({ actor: { type: 'trigger' } });
		form.actor = { type: 'player' };
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.deleteActor.save!();
		expect(saved).toHaveBeenCalledWith({ actor: { type: 'player' } });
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 actor 文本', () => {
		Command.parseActor = vi.fn((a: unknown) => `A:${(a as { type: string }).type}`) as never;
		const contents = Command.cases.deleteActor.parse!({ actor: { type: 'player' } });
		expect(contents[0]).toHaveProperty('color');
		expect(contents[2]).toHaveProperty('text');
	});
});
