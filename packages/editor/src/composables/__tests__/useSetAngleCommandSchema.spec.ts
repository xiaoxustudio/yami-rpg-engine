import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetAngle from '@app/components/commands/SetAngle.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { useSetAngleCommandSchema } from '@app/composables/commands/useSetAngleCommandSchema';
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

describe('useSetAngleCommandSchema（setAngle 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
		Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 wait 选项', async () => {
		const wrapper = mount(SetAngle, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const wait = document.getElementById('setAngle-wait') as unknown as {
			dataItems?: Array<{ name: string; value: boolean }>;
		};
		expect(wait.dataItems).toHaveLength(2);
		expect(wait.dataItems!.map((item) => item.value)).toEqual([true, false]);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(SetAngle, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'setAngle');
		expect(Window.open).toHaveBeenCalledWith('setAngle');
		expect(getControl('setAngle-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('setAngle-angle').read()).toEqual({ type: 'absolute', degrees: 0 });
		expect(getControl('setAngle-easingId').read()).toBe('easing0');
		expect(getControl('setAngle-duration').read()).toBe(0);
		expect(getControl('setAngle-wait').read()).toBe(false);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(SetAngle, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'setAngle',
			params: {
				actor: { type: 'trigger' },
				angle: { type: 'absolute', degrees: 90 },
				easingId: 'e2',
				duration: 300,
				wait: true
			}
		});
		expect(Window.open).toHaveBeenCalledWith('setAngle');
		expect(getControl('setAngle-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('setAngle-angle').read()).toEqual({ type: 'absolute', degrees: 90 });
		expect(getControl('setAngle-easingId').read()).toBe('e2');
		expect(getControl('setAngle-duration').read()).toBe(300);
		expect(getControl('setAngle-wait').read()).toBe(true);
		wrapper.unmount();
	});

	it('save 路径：用户改 form 后经 Command.cases.setAngle.save 保存', async () => {
		const wrapper = mount(SetAngle, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetAngleCommandSchema();
		Command.cases.setAngle.customLoad!({
			actor: { type: 'trigger' },
			angle: { type: 'absolute', degrees: 0 },
			easingId: 'easing0',
			duration: 0,
			wait: false
		});
		form.angle = { type: 'absolute', degrees: 180 };
		form.duration = 1000;
		form.wait = true;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setAngle.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			angle: { type: 'absolute', degrees: 180 },
			easingId: 'easing0',
			duration: 1000,
			wait: true
		});
		wrapper.unmount();
	});
});
