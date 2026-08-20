import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ActivateScene from '@app/components/commands/ActivateScene.vue';
import { Command } from '@app/commands/command-object.ts';
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

describe('useActivateSceneCommandSchema（activateScene 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(ActivateScene, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'activateScene');
		expect(Window.open).toHaveBeenCalledWith('activateScene');
		expect(getControl('activateScene-pointer').read()).toBe(0);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(ActivateScene, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, { id: 'activateScene', params: { pointer: 1 } });
		expect(Window.open).toHaveBeenCalledWith('activateScene');
		expect(getControl('activateScene-pointer').read()).toBe(1);
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.activateScene.save 保存', async () => {
		const wrapper = mount(ActivateScene, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.activateScene.customLoad!({ pointer: 0 });
		getControl('activateScene-pointer').input(1);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.activateScene.save!();
		expect(saved).toHaveBeenCalledWith({ pointer: 1 });
		wrapper.unmount();
	});
});
