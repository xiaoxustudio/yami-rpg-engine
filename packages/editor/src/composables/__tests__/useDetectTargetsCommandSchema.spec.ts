import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import DetectTargets from '@app/components/commands/DetectTargets.vue';
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

describe('useDetectTargetsCommandSchema（detectTargets 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 selector/inSight 选项', async () => {
		const wrapper = mount(DetectTargets, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const selector = document.getElementById('detectTargets-selector') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		const inSight = document.getElementById('detectTargets-inSight') as unknown as {
			dataItems?: Array<{ name: string; value: boolean }>;
		};
		expect(selector.dataItems).toHaveLength(6);
		expect(inSight.dataItems!.map((item) => item.value)).toEqual([true, false]);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(DetectTargets, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'detectTargets');
		expect(Window.open).toHaveBeenCalledWith('detectTargets');
		expect(getControl('detectTargets-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('detectTargets-distance').read()).toBe(0);
		expect(getControl('detectTargets-selector').read()).toBe('enemy');
		expect(getControl('detectTargets-inSight').read()).toBe(false);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(DetectTargets, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'detectTargets',
			params: { actor: { type: 'trigger' }, distance: 3, selector: 'friend', inSight: true }
		});
		expect(Window.open).toHaveBeenCalledWith('detectTargets');
		expect(getControl('detectTargets-distance').read()).toBe(3);
		expect(getControl('detectTargets-selector').read()).toBe('friend');
		expect(getControl('detectTargets-inSight').read()).toBe(true);
		wrapper.unmount();
	});

	it('save 路径：distance 为 0 时校验失败不保存', async () => {
		const wrapper = mount(DetectTargets, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.detectTargets.customLoad!({
			actor: { type: 'trigger' },
			distance: 0,
			selector: 'enemy',
			inSight: false
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.detectTargets.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.detectTargets.save 保存', async () => {
		const wrapper = mount(DetectTargets, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.detectTargets.customLoad!({
			actor: { type: 'trigger' },
			distance: 2,
			selector: 'enemy',
			inSight: false
		});
		getControl('detectTargets-distance').write(5);
		getControl('detectTargets-selector').input('team');
		getControl('detectTargets-inSight').input(true);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.detectTargets.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			distance: 5,
			selector: 'team',
			inSight: true
		});
		wrapper.unmount();
	});
});
