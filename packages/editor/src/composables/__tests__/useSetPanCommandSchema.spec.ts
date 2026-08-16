import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetPan from '@app/components/commands/SetPan.vue';
import { Command } from '@/command/command-object.ts';
import { CommandSchema } from '@/module/command/schema.ts';
import { Data } from '@/data/data-object.ts';
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

describe('useSetPanCommandSchema（setPan 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
		Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 type/wait 选项', async () => {
		const wrapper = mount(SetPan, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const type = document.getElementById('setPan-type') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		const wait = document.getElementById('setPan-wait') as unknown as {
			dataItems?: Array<{ name: string; value: boolean }>;
		};
		expect(type.dataItems).toHaveLength(4);
		expect(wait.dataItems!.map((item) => item.value)).toEqual([true, false]);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(SetPan, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'setPan');
		expect(Window.open).toHaveBeenCalledWith('setPan');
		expect(getControl('setPan-type').read()).toBe('bgm');
		expect(getControl('setPan-pan').read()).toBe(0);
		expect(getControl('setPan-easingId').read()).toBe('easing0');
		expect(getControl('setPan-duration').read()).toBe(0);
		expect(getControl('setPan-wait').read()).toBe(false);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(SetPan, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'setPan',
			params: { type: 'se', pan: -0.5, easingId: 'e2', duration: 300, wait: true }
		});
		expect(Window.open).toHaveBeenCalledWith('setPan');
		expect(getControl('setPan-type').read()).toBe('se');
		expect(getControl('setPan-pan').read()).toBe(-0.5);
		expect(getControl('setPan-easingId').read()).toBe('e2');
		expect(getControl('setPan-duration').read()).toBe(300);
		expect(getControl('setPan-wait').read()).toBe(true);
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.setPan.save 保存', async () => {
		const wrapper = mount(SetPan, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setPan.customLoad!({
			type: 'bgm',
			pan: 0,
			easingId: 'easing0',
			duration: 0,
			wait: false
		});
		getControl('setPan-type').input('cv');
		getControl('setPan-pan').write(0.5);
		getControl('setPan-duration').write(500);
		getControl('setPan-wait').input(true);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setPan.save!();
		expect(saved).toHaveBeenCalledWith({
			type: 'cv',
			pan: 0.5,
			easingId: 'easing0',
			duration: 500,
			wait: true
		});
		wrapper.unmount();
	});
});
