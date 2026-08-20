import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SimulateKey from '@app/components/commands/SimulateKey.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Window } from '@app/legacy/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface ControlEl extends HTMLElement {
	read(): unknown;
	input(value: unknown): void;
	inputCode(code: number): void;
}

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

describe('useSimulateKeyCommandSchema（simulateKey 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 operation 选项', async () => {
		const wrapper = mount(SimulateKey, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const operation = document.getElementById('simulateKey-operation') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(operation.dataItems).toHaveLength(3);
		expect(operation.dataItems!.map((item) => item.value)).toEqual([
			'click',
			'press',
			'release'
		]);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(SimulateKey, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'simulateKey');
		expect(Window.open).toHaveBeenCalledWith('simulateKey');
		expect(getControl('simulateKey-operation').read()).toBe('click');
		expect(getControl('simulateKey-keycode').read()).toBe('');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(SimulateKey, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'simulateKey',
			params: { operation: 'press', keycode: 65 }
		});
		expect(Window.open).toHaveBeenCalledWith('simulateKey');
		expect(getControl('simulateKey-operation').read()).toBe('press');
		expect(getControl('simulateKey-keycode').read()).toBe(65);
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.simulateKey.save 保存', async () => {
		const wrapper = mount(SimulateKey, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.simulateKey.customLoad!({ operation: 'click', keycode: '' });
		getControl('simulateKey-operation').input('release');
		getControl('simulateKey-keycode').inputCode(87);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.simulateKey.save!();
		expect(saved).toHaveBeenCalledWith({ operation: 'release', keycode: 87 });
		wrapper.unmount();
	});
});
