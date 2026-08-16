import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import FollowActor from '@app/components/commands/FollowActor.vue';
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

describe('useFollowActorCommandSchema（followActor 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口后 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(FollowActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'followActor');
		expect(Window.open).toHaveBeenCalledWith('followActor');
		expect(getControl('followActor-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('followActor-mode').read()).toBe('circle');
		expect(getControl('followActor-minDist').read()).toBe(1);
		expect(getControl('followActor-navigate').read()).toBe(true);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(FollowActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'followActor',
			params: { actor: { type: 'trigger' }, mode: 'rectangle', vertDist: 2, navigate: false }
		});
		expect(Window.open).toHaveBeenCalledWith('followActor');
		expect(getControl('followActor-mode').read()).toBe('rectangle');
		expect(getControl('followActor-vertDist').read()).toBe(2);
		expect(getControl('followActor-navigate').read()).toBe(false);
		wrapper.unmount();
	});

	it('save 路径：circle 模式经 Command.cases.followActor.save 保存 offset', async () => {
		const wrapper = mount(FollowActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.followActor.customLoad!({
			actor: { type: 'trigger' },
			target: { type: 'trigger' },
			mode: 'circle',
			offset: 0.5,
			navigate: false,
			once: true
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.followActor.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			target: { type: 'trigger' },
			mode: 'circle',
			minDist: 1,
			maxDist: 2,
			offset: 0.5,
			bufferDist: 0,
			navigate: false,
			once: true,
			wait: false
		});
		wrapper.unmount();
	});

	it('save 路径：navigate 且 once 时保存 bypass 与 wait', async () => {
		const wrapper = mount(FollowActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.followActor.customLoad!({
			mode: 'rectangle',
			vertDist: 2,
			navigate: true,
			bypass: true,
			once: true,
			wait: true
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.followActor.save!();
		expect(saved).toHaveBeenCalledWith(
			expect.objectContaining({
				mode: 'rectangle',
				vertDist: 2,
				navigate: true,
				bypass: true,
				once: true,
				wait: true
			})
		);
		wrapper.unmount();
	});
});
