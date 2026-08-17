import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetAnimationComponent from '@app/components/commands/SetAnimationComponent.vue';
import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from '@app/legacy/module/command/schema.ts';
import { Animation } from '@app/legacy/animation/animation-window.ts';
import { Window } from '@app/legacy/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface ControlEl extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
	write2(value: unknown): void;
	input(value: unknown): void;
}

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

describe('useSetAnimationComponentCommandSchema（setAnimationComponent 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Animation.getMotionListItems = vi.fn(() => [{ name: 'Idle', value: 'idle' }]) as never;
		Animation.getSpriteListItems = vi.fn(() => [{ name: 'Body', value: 'body' }]) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 operation/wait 选项', async () => {
		const wrapper = mount(SetAnimationComponent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const operation = document.getElementById('setAnimationComponent-operation') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		const wait = document.getElementById('setAnimationComponent-wait') as unknown as {
			dataItems?: Array<{ name: string; value: boolean }>;
		};
		expect(operation.dataItems).toHaveLength(9);
		expect(wait.dataItems!.map((item) => item.value)).toEqual([true, false]);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(SetAnimationComponent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'setAnimationComponent');
		expect(Window.open).toHaveBeenCalledWith('setAnimationComponent');
		expect(getControl('setAnimationComponent-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('setAnimationComponent-animationId').read()).toBe('');
		expect(getControl('setAnimationComponent-operation').read()).toBe('set-angle');
		expect(getControl('setAnimationComponent-angle').read()).toEqual({
			type: 'absolute',
			degrees: 0
		});
		expect(getControl('setAnimationComponent-wait').read()).toBe(false);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(SetAnimationComponent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'setAnimationComponent',
			params: {
				actor: { type: 'player' },
				animationId: 'anim1',
				motion: 'idle',
				operation: 'set-speed',
				speed: 2
			}
		});
		expect(Window.open).toHaveBeenCalledWith('setAnimationComponent');
		expect(getControl('setAnimationComponent-actor').read()).toEqual({ type: 'player' });
		expect(getControl('setAnimationComponent-animationId').read()).toBe('anim1');
		expect(getControl('setAnimationComponent-operation').read()).toBe('set-speed');
		expect(getControl('setAnimationComponent-speed').read()).toBe(2);
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.setAnimationComponent.save 保存', async () => {
		const wrapper = mount(SetAnimationComponent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setAnimationComponent.customLoad!({
			actor: { type: 'trigger' },
			animationId: 'anim1',
			motion: 'idle',
			operation: 'set-angle',
			angle: { type: 'absolute', degrees: 0 }
		});
		getControl('setAnimationComponent-operation').input('set-sprite');
		getControl('setAnimationComponent-spriteId').input('body');
		getControl('setAnimationComponent-image').input('img1');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setAnimationComponent.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			animationId: 'anim1',
			motion: 'idle',
			operation: 'set-sprite',
			spriteId: 'body',
			image: 'img1'
		});
		wrapper.unmount();
	});

	it('save 路径：空 animationId 校验失败不保存', async () => {
		const wrapper = mount(SetAnimationComponent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setAnimationComponent.customLoad!({
			actor: { type: 'trigger' },
			animationId: '',
			motion: '',
			operation: 'set-angle'
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setAnimationComponent.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
