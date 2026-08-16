import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import LoadScene from '@app/components/commands/LoadScene.vue';
import { Command } from '@/command/command-object.ts';
import { CommandSchema } from '@/module/command/schema.ts';
import { Window } from '@/tools/window-object.ts';

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

describe('useLoadSceneCommandSchema（loadScene 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(LoadScene, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'loadScene');
		expect(Window.open).toHaveBeenCalledWith('loadScene');
		expect(getControl('loadScene-sceneId').read()).toBe('');
		expect(getControl('loadScene-transfer').read()).toBe(true);
		expect(getControl('loadScene-x').read()).toBe(0);
		expect(getControl('loadScene-y').read()).toBe(0);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(LoadScene, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'loadScene',
			params: { sceneId: 'scene1', transfer: true, x: 10, y: 20 }
		});
		expect(Window.open).toHaveBeenCalledWith('loadScene');
		expect(getControl('loadScene-sceneId').read()).toBe('scene1');
		expect(getControl('loadScene-transfer').read()).toBe(true);
		expect(getControl('loadScene-x').read()).toBe(10);
		expect(getControl('loadScene-y').read()).toBe(20);
		wrapper.unmount();
	});

	it('save 路径：sceneId 为空时校验失败不保存', async () => {
		const wrapper = mount(LoadScene, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.loadScene.customLoad!({ sceneId: '', transfer: true, x: 0, y: 0 });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.loadScene.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：transfer=true 时保存 sceneId/transfer/x/y', async () => {
		const wrapper = mount(LoadScene, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.loadScene.customLoad!({ sceneId: 'scene1', transfer: true, x: 10, y: 20 });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.loadScene.save!();
		expect(saved).toHaveBeenCalledWith({ sceneId: 'scene1', transfer: true, x: 10, y: 20 });
		wrapper.unmount();
	});

	it('save 路径：transfer=false 时仅保存 sceneId/transfer', async () => {
		const wrapper = mount(LoadScene, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.loadScene.customLoad!({ sceneId: 'scene1', transfer: false, x: 10, y: 20 });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.loadScene.save!();
		expect(saved).toHaveBeenCalledWith({ sceneId: 'scene1', transfer: false });
		wrapper.unmount();
	});
});
