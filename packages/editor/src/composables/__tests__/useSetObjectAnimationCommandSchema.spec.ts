import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetObjectAnimation from '@app/components/commands/SetObjectAnimation.vue';
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

describe('useSetObjectAnimationCommandSchema（setObjectAnimation 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
		Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 sort/operation/wait 选项', async () => {
		const wrapper = mount(SetObjectAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const sort = document.getElementById('setObjectAnimation-sort') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		const operation = document.getElementById('setObjectAnimation-operation') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		const wait = document.getElementById('setObjectAnimation-wait') as unknown as {
			dataItems?: Array<{ name: string; value: boolean }>;
		};
		expect(sort.dataItems).toHaveLength(4);
		expect(operation.dataItems).toHaveLength(6);
		expect(wait.dataItems!.map((item) => item.value)).toEqual([true, false]);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(SetObjectAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'setObjectAnimation');
		expect(Window.open).toHaveBeenCalledWith('setObjectAnimation');
		expect(getControl('setObjectAnimation-sort').read()).toBe('actor');
		expect(getControl('setObjectAnimation-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('setObjectAnimation-operation').read()).toBe('set-tint');
		expect(getControl('setObjectAnimation-tint-0').read()).toBe(0);
		expect(getControl('setObjectAnimation-easingId').read()).toBe('easing0');
		expect(getControl('setObjectAnimation-duration').read()).toBe(0);
		expect(getControl('setObjectAnimation-wait').read()).toBe(false);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(SetObjectAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'setObjectAnimation',
			params: {
				sort: 'trigger',
				object: { type: 'player' },
				operation: 'set-opacity',
				opacity: 0.5,
				easingId: 'e2',
				duration: 500,
				wait: true
			}
		});
		expect(Window.open).toHaveBeenCalledWith('setObjectAnimation');
		expect(getControl('setObjectAnimation-sort').read()).toBe('trigger');
		expect(getControl('setObjectAnimation-trigger').read()).toEqual({ type: 'player' });
		expect(getControl('setObjectAnimation-operation').read()).toBe('set-opacity');
		expect(getControl('setObjectAnimation-opacity').read()).toBe(0.5);
		expect(getControl('setObjectAnimation-duration').read()).toBe(500);
		expect(getControl('setObjectAnimation-wait').read()).toBe(true);
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.setObjectAnimation.save 保存', async () => {
		const wrapper = mount(SetObjectAnimation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setObjectAnimation.customLoad!({
			sort: 'actor',
			object: { type: 'trigger' },
			operation: 'set-tint',
			tint: [0, 0, 0, 0],
			easingId: 'easing0',
			duration: 0,
			wait: false
		});
		getControl('setObjectAnimation-operation').input('set-rgb');
		getControl('setObjectAnimation-tint-0').write(10);
		getControl('setObjectAnimation-tint-1').write(20);
		getControl('setObjectAnimation-tint-2').write(30);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setObjectAnimation.save!();
		expect(saved).toHaveBeenCalledWith({
			sort: 'actor',
			object: { type: 'trigger' },
			operation: 'set-rgb',
			tint: [10, 20, 30, 0],
			easingId: 'easing0',
			duration: 0,
			wait: false
		});
		wrapper.unmount();
	});
});
