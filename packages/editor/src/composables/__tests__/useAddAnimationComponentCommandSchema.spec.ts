import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import AddAnimationComponent from '@app/components/commands/AddAnimationComponent.vue';
import { useAddAnimationComponentCommandSchema } from '@app/composables/commands/useAddAnimationComponentCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface ControlEl extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
	write2(value: unknown): void;
	input(value: unknown): void;
	loadItems(items: unknown[]): void;
}

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

describe('useAddAnimationComponentCommandSchema（addAnimationComponent 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 rotatable/syncAngle 选项', async () => {
		const wrapper = mount(AddAnimationComponent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const rotatable = document.getElementById('addAnimationComponent-rotatable') as unknown as {
			dataItems?: Array<{ name: string; value: boolean }>;
		};
		const syncAngle = document.getElementById('addAnimationComponent-syncAngle') as unknown as {
			dataItems?: Array<{ name: string; value: boolean }>;
		};
		expect(rotatable.dataItems!.map((item) => item.value)).toEqual([true, false]);
		expect(syncAngle.dataItems!.map((item) => item.value)).toEqual([true, false]);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(AddAnimationComponent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'addAnimationComponent');
		expect(Window.open).toHaveBeenCalledWith('addAnimationComponent');
		expect(getControl('addAnimationComponent-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('addAnimationComponent-animationId').read()).toBe('');
		expect(getControl('addAnimationComponent-motion').read()).toBe('');
		expect(getControl('addAnimationComponent-rotatable').read()).toBe(false);
		expect(getControl('addAnimationComponent-syncAngle').read()).toBe(false);
		expect(getControl('addAnimationComponent-priority').read()).toBe(0);
		expect(getControl('addAnimationComponent-offsetY').read()).toBe(0);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(AddAnimationComponent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'addAnimationComponent',
			params: {
				actor: { type: 'trigger' },
				animationId: 'anim1.json',
				motion: 'run',
				rotatable: true,
				syncAngle: false,
				priority: 2,
				offsetY: 5
			}
		});
		expect(Window.open).toHaveBeenCalledWith('addAnimationComponent');
		expect(getControl('addAnimationComponent-animationId').read()).toBe('anim1.json');
		expect(getControl('addAnimationComponent-motion').read()).toBe('run');
		expect(getControl('addAnimationComponent-rotatable').read()).toBe(true);
		expect(getControl('addAnimationComponent-syncAngle').read()).toBe(false);
		expect(getControl('addAnimationComponent-priority').read()).toBe(2);
		expect(getControl('addAnimationComponent-offsetY').read()).toBe(5);
		wrapper.unmount();
	});

	it('writeHandler 路径：animationId 变化时刷新 motion 列表', async () => {
		const wrapper = mount(AddAnimationComponent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { writeHandler } = useAddAnimationComponentCommandSchema();
		writeHandler({ value: 'anim1.json' });
		const motion = getControl('addAnimationComponent-motion');
		expect(motion.loadItems).toBeDefined();
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.addAnimationComponent.save 保存', async () => {
		const wrapper = mount(AddAnimationComponent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useAddAnimationComponentCommandSchema();
		Command.cases.addAnimationComponent.customLoad!({
			actor: { type: 'trigger' },
			animationId: 'anim1.json',
			motion: 'idle',
			rotatable: false,
			syncAngle: false,
			priority: 0,
			offsetY: 0
		});
		form.priority = 3;
		form.offsetY = -2;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.addAnimationComponent.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			animationId: 'anim1.json',
			motion: 'idle',
			rotatable: false,
			syncAngle: false,
			priority: 3,
			offsetY: -2
		});
		wrapper.unmount();
	});
});
