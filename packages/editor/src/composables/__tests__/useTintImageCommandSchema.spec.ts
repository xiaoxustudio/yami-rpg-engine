import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import TintImage from '@app/components/commands/TintImage.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Data } from '@app/data/data-object.ts';
import { Window } from '@app/tools/window-object.ts';

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

describe('useTintImageCommandSchema（tintImage 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
		Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口后 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(TintImage, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'tintImage');
		expect(Window.open).toHaveBeenCalledWith('tintImage');
		expect(getControl('tintImage-element').read()).toEqual({ type: 'trigger' });
		expect(getControl('tintImage-mode').read()).toBe('full');
		expect(getControl('tintImage-tint-0').read()).toBe(0);
		expect(getControl('tintImage-tint-3').read()).toBe(0);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM（含 filter 预览）', async () => {
		const wrapper = mount(TintImage, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'tintImage',
			params: { element: { type: 'trigger' }, mode: 'rgb', tint: [1, 2, 3, 0], duration: 100 }
		});
		expect(Window.open).toHaveBeenCalledWith('tintImage');
		expect(getControl('tintImage-tint-0').read()).toBe(1);
		expect(getControl('tintImage-tint-2').read()).toBe(3);
		expect(getControl('tintImage-duration').read()).toBe(100);
		wrapper.unmount();
	});

	it('save 路径：full 模式经 Command.cases.tintImage.save 保存完整 tint', async () => {
		const wrapper = mount(TintImage, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.tintImage.customLoad!({
			element: { type: 'trigger' },
			mode: 'full',
			tint: [1, 2, 3, 4],
			duration: 100,
			wait: true
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.tintImage.save!();
		expect(saved).toHaveBeenCalledWith(
			expect.objectContaining({
				element: { type: 'trigger' },
				mode: 'full',
				tint: [1, 2, 3, 4],
				duration: 100,
				wait: true
			})
		);
		wrapper.unmount();
	});

	it('save 路径：gray 模式仅保留灰度通道', async () => {
		const wrapper = mount(TintImage, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.tintImage.customLoad!({
			element: { type: 'trigger' },
			mode: 'gray',
			tint: [10, 20, 30, 40]
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.tintImage.save!();
		expect(saved).toHaveBeenCalledWith(expect.objectContaining({ tint: [0, 0, 0, 40] }));
		wrapper.unmount();
	});
});
