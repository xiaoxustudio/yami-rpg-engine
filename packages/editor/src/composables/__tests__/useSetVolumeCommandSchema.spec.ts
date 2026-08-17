import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetVolume from '@app/components/commands/SetVolume.vue';
import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from '@app/legacy/module/command/schema.ts';
import { Data } from '@app/legacy/data/data-object.ts';
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

describe('useSetVolumeCommandSchema（setVolume 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
		Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(SetVolume, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'setVolume');
		expect(Window.open).toHaveBeenCalledWith('setVolume');
		expect(getControl('setVolume-type').read()).toBe('bgm');
		expect(getControl('setVolume-volume').read()).toBe(1);
		expect(getControl('setVolume-easingId').read()).toBe('easing0');
		expect(getControl('setVolume-duration').read()).toBe(0);
		expect(getControl('setVolume-wait').read()).toBe(false);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(SetVolume, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'setVolume',
			params: { type: 'se', volume: 0.5, easingId: 'e2', duration: 300, wait: true }
		});
		expect(Window.open).toHaveBeenCalledWith('setVolume');
		expect(getControl('setVolume-type').read()).toBe('se');
		expect(getControl('setVolume-volume').read()).toBe(0.5);
		expect(getControl('setVolume-easingId').read()).toBe('e2');
		expect(getControl('setVolume-duration').read()).toBe(300);
		expect(getControl('setVolume-wait').read()).toBe(true);
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.setVolume.save 保存', async () => {
		const wrapper = mount(SetVolume, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setVolume.customLoad!({
			type: 'bgm',
			volume: 1,
			easingId: 'easing0',
			duration: 0,
			wait: false
		});
		getControl('setVolume-type').input('cv');
		getControl('setVolume-volume').write(0.8);
		getControl('setVolume-duration').write(500);
		getControl('setVolume-wait').input(true);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setVolume.save!();
		expect(saved).toHaveBeenCalledWith({
			type: 'cv',
			volume: 0.8,
			easingId: 'easing0',
			duration: 500,
			wait: true
		});
		wrapper.unmount();
	});
});
