import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import MoveActor from '@app/components/commands/MoveActor.vue';
import { Command } from '@app/legacy/command/command-object.ts';
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

describe('useMoveActorCommandSchema（moveActor 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 mode/wait 选项', async () => {
		const wrapper = mount(MoveActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const mode = document.getElementById('moveActor-mode') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		const wait = document.getElementById('moveActor-wait') as unknown as {
			dataItems?: Array<{ name: string; value: boolean }>;
		};
		expect(mode.dataItems).toHaveLength(6);
		expect(wait.dataItems!.map((item) => item.value)).toEqual([true, false]);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(MoveActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'moveActor');
		expect(Window.open).toHaveBeenCalledWith('moveActor');
		expect(getControl('moveActor-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('moveActor-mode').read()).toBe('straight');
		expect(getControl('moveActor-angle').read()).toBe(0);
		expect(getControl('moveActor-destination').read()).toEqual({
			type: 'absolute',
			x: 0,
			y: 0
		});
		expect(getControl('moveActor-wait').read()).toBe(false);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(MoveActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'moveActor',
			params: {
				actor: { type: 'player' },
				mode: 'teleport',
				destination: { type: 'absolute', x: 5, y: 6 }
			}
		});
		expect(Window.open).toHaveBeenCalledWith('moveActor');
		expect(getControl('moveActor-actor').read()).toEqual({ type: 'player' });
		expect(getControl('moveActor-mode').read()).toBe('teleport');
		expect(getControl('moveActor-destination').read()).toEqual({
			type: 'absolute',
			x: 5,
			y: 6
		});
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.moveActor.save 保存', async () => {
		const wrapper = mount(MoveActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.moveActor.customLoad!({
			actor: { type: 'trigger' },
			mode: 'straight',
			destination: { type: 'absolute', x: 0, y: 0 },
			wait: false
		});
		getControl('moveActor-mode').input('navigate');
		getControl('moveActor-destination').input({ type: 'absolute', x: 3, y: 4 });
		getControl('moveActor-wait').input(true);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.moveActor.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			mode: 'navigate',
			destination: { type: 'absolute', x: 3, y: 4 },
			wait: true
		});
		wrapper.unmount();
	});
});
