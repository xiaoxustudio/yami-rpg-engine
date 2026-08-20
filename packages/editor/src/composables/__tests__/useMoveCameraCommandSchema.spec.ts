import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import MoveCamera from '@app/components/commands/MoveCamera.vue';
import { Command } from '@app/commands/command-object.ts';
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

describe('useMoveCameraCommandSchema（moveCamera 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
		Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 mode/wait 选项', async () => {
		const wrapper = mount(MoveCamera, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const mode = document.getElementById('moveCamera-mode') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		const wait = document.getElementById('moveCamera-wait') as unknown as {
			dataItems?: Array<{ name: string; value: boolean }>;
		};
		expect(mode.dataItems).toHaveLength(2);
		expect(wait.dataItems!.map((item) => item.value)).toEqual([true, false]);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(MoveCamera, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'moveCamera');
		expect(Window.open).toHaveBeenCalledWith('moveCamera');
		expect(getControl('moveCamera-mode').read()).toBe('position');
		expect(getControl('moveCamera-position').read()).toEqual({ type: 'absolute', x: 0, y: 0 });
		expect(getControl('moveCamera-easingId').read()).toBe('easing0');
		expect(getControl('moveCamera-duration').read()).toBe(0);
		expect(getControl('moveCamera-wait').read()).toBe(false);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(MoveCamera, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'moveCamera',
			params: {
				mode: 'actor',
				actor: { type: 'player' },
				easingId: 'e2',
				duration: 1000,
				wait: true
			}
		});
		expect(Window.open).toHaveBeenCalledWith('moveCamera');
		expect(getControl('moveCamera-mode').read()).toBe('actor');
		expect(getControl('moveCamera-actor').read()).toEqual({ type: 'player' });
		expect(getControl('moveCamera-easingId').read()).toBe('e2');
		expect(getControl('moveCamera-duration').read()).toBe(1000);
		expect(getControl('moveCamera-wait').read()).toBe(true);
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.moveCamera.save 保存', async () => {
		const wrapper = mount(MoveCamera, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.moveCamera.customLoad!({
			mode: 'position',
			position: { type: 'absolute', x: 0, y: 0 },
			easingId: 'easing0',
			duration: 0,
			wait: false
		});
		getControl('moveCamera-mode').input('actor');
		getControl('moveCamera-actor').input({ type: 'friend' });
		getControl('moveCamera-easingId').input('e3');
		getControl('moveCamera-duration').write(500);
		getControl('moveCamera-wait').input(true);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.moveCamera.save!();
		expect(saved).toHaveBeenCalledWith({
			mode: 'actor',
			actor: { type: 'friend' },
			easingId: 'e3',
			duration: 500,
			wait: true
		});
		wrapper.unmount();
	});
});
