import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import TintScreen from '@app/components/commands/TintScreen.vue';
import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
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

describe('useTintScreenCommandSchema（tintScreen 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
		Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(TintScreen, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'tintScreen');
		expect(Window.open).toHaveBeenCalledWith('tintScreen');
		expect(getControl('tintScreen-tint-0').read()).toBe(0);
		expect(getControl('tintScreen-tint-3').read()).toBe(0);
		expect(getControl('tintScreen-easingId').read()).toBe('easing0');
		expect(getControl('tintScreen-duration').read()).toBe(0);
		expect(getControl('tintScreen-wait').read()).toBe(false);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(TintScreen, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'tintScreen',
			params: {
				tint: [10, 20, 30, 40],
				easingId: 'e2',
				duration: 300,
				wait: true
			}
		});
		expect(Window.open).toHaveBeenCalledWith('tintScreen');
		expect(getControl('tintScreen-tint-0').read()).toBe(10);
		expect(getControl('tintScreen-tint-1').read()).toBe(20);
		expect(getControl('tintScreen-tint-2').read()).toBe(30);
		expect(getControl('tintScreen-tint-3').read()).toBe(40);
		expect(getControl('tintScreen-easingId').read()).toBe('e2');
		expect(getControl('tintScreen-duration').read()).toBe(300);
		expect(getControl('tintScreen-wait').read()).toBe(true);
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.tintScreen.save 保存', async () => {
		const wrapper = mount(TintScreen, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.tintScreen.customLoad!({
			tint: [0, 0, 0, 0],
			easingId: 'easing0',
			duration: 0,
			wait: false
		});
		getControl('tintScreen-tint-0').write(50);
		getControl('tintScreen-tint-1').write(60);
		getControl('tintScreen-tint-2').write(70);
		getControl('tintScreen-tint-3').write(80);
		getControl('tintScreen-duration').write(1000);
		getControl('tintScreen-wait').input(true);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.tintScreen.save!();
		expect(saved).toHaveBeenCalledWith({
			tint: [50, 60, 70, 80],
			easingId: 'easing0',
			duration: 1000,
			wait: true
		});
		wrapper.unmount();
	});
});
