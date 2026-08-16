import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import UseItem from '@app/components/commands/UseItem.vue';
import { Command } from '@/command/command-object.ts';
import { CommandSchema } from '@/module/command/schema.ts';
import { Enum } from '@/enum/enum-window.ts';
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

describe('useUseItemCommandSchema（useItem 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Enum.getStringItems = vi.fn(() => [{ name: 'Key 1', value: 'key1' }]) as never;
		Enum.getDefStringId = vi.fn(() => 'key1') as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 mode/wait 选项', async () => {
		const wrapper = mount(UseItem, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const mode = document.getElementById('useItem-mode') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(mode.dataItems).toHaveLength(3);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(UseItem, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'useItem');
		expect(Window.open).toHaveBeenCalledWith('useItem');
		expect(getControl('useItem-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('useItem-mode').read()).toBe('by-key');
		expect(getControl('useItem-key').read()).toBe('key1');
		expect(getControl('useItem-wait').read()).toBe(false);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(UseItem, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'useItem',
			params: {
				actor: { type: 'player' },
				mode: 'by-item',
				item: { type: 'item' },
				wait: true
			}
		});
		expect(Window.open).toHaveBeenCalledWith('useItem');
		expect(getControl('useItem-actor').read()).toEqual({ type: 'player' });
		expect(getControl('useItem-mode').read()).toBe('by-item');
		expect(getControl('useItem-item').read()).toEqual({ type: 'item' });
		expect(getControl('useItem-wait').read()).toBe(true);
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.useItem.save 保存', async () => {
		const wrapper = mount(UseItem, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.useItem.customLoad!({
			actor: { type: 'trigger' },
			mode: 'by-key',
			key: 'key1',
			wait: false
		});
		getControl('useItem-mode').input('by-id');
		getControl('useItem-itemId').input('item1');
		getControl('useItem-wait').input(true);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.useItem.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			mode: 'by-id',
			itemId: 'item1',
			wait: true
		});
		wrapper.unmount();
	});

	it('save 路径：by-key 空 key 校验失败不保存', async () => {
		const wrapper = mount(UseItem, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.useItem.customLoad!({
			actor: { type: 'trigger' },
			mode: 'by-key',
			key: '',
			wait: false
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.useItem.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
