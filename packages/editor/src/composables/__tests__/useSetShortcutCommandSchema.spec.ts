import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetShortcut from '@app/components/commands/SetShortcut.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';
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

describe('useSetShortcutCommandSchema（setShortcut 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Enum.getStringItems = vi.fn(() => [
			{ name: 'Key 1', value: 'key1' },
			{ name: 'Key 2', value: 'key2' }
		]) as never;
		Enum.getDefStringId = vi.fn(() => 'key1') as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 operation 选项', async () => {
		const wrapper = mount(SetShortcut, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const operation = document.getElementById('setShortcut-operation') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(operation.dataItems).toHaveLength(4);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(SetShortcut, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'setShortcut');
		expect(Window.open).toHaveBeenCalledWith('setShortcut');
		expect(getControl('setShortcut-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('setShortcut-operation').read()).toBe('set-item-shortcut');
		expect(getControl('setShortcut-key').read()).toBe('key1');
		expect(getControl('setShortcut-key2').read()).toBe('key1');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(SetShortcut, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'setShortcut',
			params: {
				actor: { type: 'player' },
				operation: 'swap-shortcuts',
				key: 'key1',
				key2: 'key2'
			}
		});
		expect(Window.open).toHaveBeenCalledWith('setShortcut');
		expect(getControl('setShortcut-operation').read()).toBe('swap-shortcuts');
		expect(getControl('setShortcut-key').read()).toBe('key1');
		expect(getControl('setShortcut-key2').read()).toBe('key2');
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.setShortcut.save 保存', async () => {
		const wrapper = mount(SetShortcut, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setShortcut.customLoad!({
			actor: { type: 'trigger' },
			operation: 'set-item-shortcut',
			itemId: 'item1',
			key: 'key1'
		});
		getControl('setShortcut-operation').input('set-skill-shortcut');
		getControl('setShortcut-skillId').write('skill1');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setShortcut.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			operation: 'set-skill-shortcut',
			key: 'key1',
			skillId: 'skill1'
		});
		wrapper.unmount();
	});

	it('save 路径：key 为空校验失败不保存', async () => {
		const wrapper = mount(SetShortcut, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setShortcut.customLoad!({
			actor: { type: 'trigger' },
			operation: 'delete-shortcut',
			key: ''
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setShortcut.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
