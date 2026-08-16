import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetReverb from '@app/components/commands/SetReverb.vue';
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

describe('useSetReverbCommandSchema（setReverb 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Data.easings = [{ id: 'easing0', name: 'Linear' }] as never;
		Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'easing0' }]) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 type/wait 选项', async () => {
		const wrapper = mount(SetReverb, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const type = document.getElementById('setReverb-type') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		const wait = document.getElementById('setReverb-wait') as unknown as {
			dataItems?: Array<{ name: string; value: boolean }>;
		};
		expect(type.dataItems!.map((item) => item.value)).toEqual(['bgm', 'bgs', 'cv', 'se']);
		expect(wait.dataItems!.map((item) => item.value)).toEqual([true, false]);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(SetReverb, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'setReverb');
		expect(Window.open).toHaveBeenCalledWith('setReverb');
		expect(getControl('setReverb-type').read()).toBe('bgm');
		expect(getControl('setReverb-dry').read()).toBe(1);
		expect(getControl('setReverb-wet').read()).toBe(0);
		expect(getControl('setReverb-easingId').read()).toBe('easing0');
		expect(getControl('setReverb-duration').read()).toBe(0);
		expect(getControl('setReverb-wait').read()).toBe(false);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(SetReverb, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'setReverb',
			params: { type: 'se', dry: 0.5, wet: 0.3, easingId: 'e2', duration: 400, wait: true }
		});
		expect(Window.open).toHaveBeenCalledWith('setReverb');
		expect(getControl('setReverb-type').read()).toBe('se');
		expect(getControl('setReverb-dry').read()).toBe(0.5);
		expect(getControl('setReverb-wet').read()).toBe(0.3);
		expect(getControl('setReverb-easingId').read()).toBe('e2');
		expect(getControl('setReverb-duration').read()).toBe(400);
		expect(getControl('setReverb-wait').read()).toBe(true);
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.setReverb.save 保存', async () => {
		const wrapper = mount(SetReverb, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setReverb.customLoad!({
			type: 'bgm',
			dry: 1,
			wet: 0,
			easingId: 'easing0',
			duration: 0,
			wait: false
		});
		getControl('setReverb-type').input('cv');
		getControl('setReverb-dry').write(0.8);
		getControl('setReverb-duration').write(500);
		getControl('setReverb-wait').input(true);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setReverb.save!();
		expect(saved).toHaveBeenCalledWith({
			type: 'cv',
			dry: 0.8,
			wet: 0,
			easingId: 'easing0',
			duration: 500,
			wait: true
		});
		wrapper.unmount();
	});
});
