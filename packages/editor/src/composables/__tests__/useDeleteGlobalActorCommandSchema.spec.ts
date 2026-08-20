import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import DeleteGlobalActor from '@app/components/commands/DeleteGlobalActor.vue';
import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Window } from '@app/legacy/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface ControlEl extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
	input(value: unknown): void;
}

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

describe('useDeleteGlobalActorCommandSchema（deleteGlobalActor 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(DeleteGlobalActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'deleteGlobalActor');
		expect(Window.open).toHaveBeenCalledWith('deleteGlobalActor');
		expect(getControl('deleteGlobalActor-actorId').read()).toBe('');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(DeleteGlobalActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, { id: 'deleteGlobalActor', params: { actorId: 'hero.json' } });
		expect(Window.open).toHaveBeenCalledWith('deleteGlobalActor');
		expect(getControl('deleteGlobalActor-actorId').read()).toBe('hero.json');
		wrapper.unmount();
	});

	it('save 路径：required actorId 为空时校验失败不保存', async () => {
		const wrapper = mount(DeleteGlobalActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.deleteGlobalActor.customLoad!({ actorId: '' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.deleteGlobalActor.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.deleteGlobalActor.save 保存', async () => {
		const wrapper = mount(DeleteGlobalActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.deleteGlobalActor.customLoad!({ actorId: '' });
		getControl('deleteGlobalActor-actorId').input('enemy.json');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.deleteGlobalActor.save!();
		expect(saved).toHaveBeenCalledWith({ actorId: 'enemy.json' });
		wrapper.unmount();
	});
});
