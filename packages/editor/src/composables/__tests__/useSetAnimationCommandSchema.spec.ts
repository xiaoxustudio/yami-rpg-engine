import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetAnimation from '@app/components/commands/SetAnimation.vue';
import { Command, initCommandParseBridges } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { Window } from '@app/legacy/tools/window-object.ts';

initCommandParseBridges();

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

describe('useSetAnimationCommandSchema（setAnimation 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Data.manifest = { guidMap: {} } as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(SetAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'setAnimation');
		expect(Window.open).toHaveBeenCalledWith('setAnimation');
		expect(getControl('setAnimation-element').read()).toEqual({ type: 'trigger' });
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(SetAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'setAnimation',
			params: {
				element: { type: 'trigger' },
				properties: [{ key: 'animation', value: 'a1' }]
			}
		});
		expect(Window.open).toHaveBeenCalledWith('setAnimation');
		expect(getControl('setAnimation-element').read()).toEqual({ type: 'trigger' });
		expect(getControl('setAnimation-properties').read()).toEqual([
			{ key: 'animation', value: 'a1' }
		]);
		wrapper.unmount();
	});

	it('save 路径：properties 为空时校验失败不保存', async () => {
		const wrapper = mount(SetAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setAnimation.customLoad!({ element: { type: 'trigger' }, properties: [] });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setAnimation.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：properties 非空时经 Command.cases.setAnimation.save 保存', async () => {
		const wrapper = mount(SetAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setAnimation.customLoad!({
			element: { type: 'trigger' },
			properties: [{ key: 'animation', value: 'a1' }]
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setAnimation.save!();
		expect(saved).toHaveBeenCalledWith({
			element: { type: 'trigger' },
			properties: [{ key: 'animation', value: 'a1' }]
		});
		wrapper.unmount();
	});
});
