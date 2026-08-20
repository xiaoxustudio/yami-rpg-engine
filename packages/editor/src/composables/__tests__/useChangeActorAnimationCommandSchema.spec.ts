import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ChangeActorAnimation from '@app/components/commands/ChangeActorAnimation.vue';
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

describe('useChangeActorAnimationCommandSchema（changeActorAnimation 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(ChangeActorAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'changeActorAnimation');
		expect(Window.open).toHaveBeenCalledWith('changeActorAnimation');
		expect(getControl('changeActorAnimation-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('changeActorAnimation-animationId').read()).toBe('');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(ChangeActorAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'changeActorAnimation',
			params: { actor: { type: 'trigger' }, animationId: 'anim1.json' }
		});
		expect(Window.open).toHaveBeenCalledWith('changeActorAnimation');
		expect(getControl('changeActorAnimation-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('changeActorAnimation-animationId').read()).toBe('anim1.json');
		wrapper.unmount();
	});

	it('save 路径：animationId 为空时校验失败不保存', async () => {
		const wrapper = mount(ChangeActorAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.changeActorAnimation.customLoad!({
			actor: { type: 'trigger' },
			animationId: ''
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.changeActorAnimation.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.changeActorAnimation.save 保存', async () => {
		const wrapper = mount(ChangeActorAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.changeActorAnimation.customLoad!({
			actor: { type: 'trigger' },
			animationId: 'anim1.json'
		});
		getControl('changeActorAnimation-animationId').write('anim2.json');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.changeActorAnimation.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			animationId: 'anim2.json'
		});
		wrapper.unmount();
	});
});
