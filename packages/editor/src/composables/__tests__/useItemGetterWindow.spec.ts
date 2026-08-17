import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ItemGetter from '@app/components/tools/ItemGetter.vue';
import { useItemGetterWindow } from '@app/composables/useItemGetterWindow';
import { Window } from '@app/legacy/tools/window-object.ts';
import { ItemGetter as ItemGetterController } from '@app/legacy/command/item-accessor-window.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface FormFrame extends HTMLElement {
	setForm(data: Record<string, unknown>): void;
	getForm(): Record<string, unknown>;
}

interface ControlEl extends HTMLElement {
	write(value: unknown): void;
	read(): unknown;
}

const getFrame = (id: string): FormFrame => document.getElementById(id) as unknown as FormFrame;

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

const makeTarget = (read?: () => unknown) => ({
	dataValue: undefined,
	read,
	input: vi.fn()
});

describe('useItemGetterWindow（物品访问器窗口 composable：form 状态 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
		Enum.getStringItems = vi.fn(() => [{ name: 'Space', value: 'space' }]) as never;
		Enum.getDefStringId = vi.fn(() => 'space') as never;
	});

	it('open 打开窗口、解析 read 数据填充 form 与控件 DOM 并写入回调', async () => {
		const wrapper = mount(ItemGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const itemGetter = useItemGetterWindow();
		const target = makeTarget(() => ({
			type: 'by-key',
			actor: { type: 'trigger' },
			key: 'enter'
		}));
		itemGetter.open(target as never);
		expect(Window.open).toHaveBeenCalledWith('itemGetter');
		expect(itemGetter.form.type).toBe('by-key');
		expect(itemGetter.form.key).toBe('enter');
		expect(getFrame('itemGetter').getForm().type).toBe('by-key');
		expect(getFrame('itemGetter').getForm().key).toBe('enter');
		expect(getControl('itemGetter-type').read()).toBe('by-key');
		expect(getControl('itemGetter-key').read()).toBe('enter');
		wrapper.unmount();
	});

	it('confirm 经 getForm 读回控件值回调并关闭窗口（by-id 含 actor）', async () => {
		const wrapper = mount(ItemGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const itemGetter = useItemGetterWindow();
		const target = makeTarget(() => ({
			type: 'by-id',
			actor: { type: 'trigger' },
			itemId: 'item-1'
		}));
		itemGetter.open(target as never);
		getControl('itemGetter-type').write('by-id');
		getControl('itemGetter-actor').write({ type: 'actor', key: 'a1' });
		getControl('itemGetter-itemId').write('item-2');
		itemGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({
			type: 'by-id',
			actor: { type: 'actor', key: 'a1' },
			itemId: 'item-2'
		});
		expect(Window.close).toHaveBeenCalledWith('itemGetter');
		wrapper.unmount();
	});

	it('confirm 校验失败（variable 未选）聚焦控件且不回调不关闭', async () => {
		const wrapper = mount(ItemGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const itemGetter = useItemGetterWindow();
		const target = makeTarget(() => ({
			type: 'variable',
			variable: { type: 'local', key: 'v1' }
		}));
		itemGetter.open(target as never);
		getControl('itemGetter-type').write('variable');
		getControl('itemGetter-variable').write({ type: 'local', key: '' });
		itemGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('plugin 输入在回调前包裹 getter 标识', async () => {
		const wrapper = mount(ItemGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const itemGetter = useItemGetterWindow();
		const target = makeTarget(() => ({ type: 'trigger' }));
		(target as { isPluginInput?: boolean }).isPluginInput = true;
		itemGetter.open(target as never);
		itemGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({ getter: 'item', type: 'trigger' });
		expect(Window.close).toHaveBeenCalledWith('itemGetter');
		wrapper.unmount();
	});

	it('closed 事件清除回调，后续 confirm 不再触发', async () => {
		const wrapper = mount(ItemGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const itemGetter = useItemGetterWindow();
		const target = makeTarget(() => ({ type: 'trigger' }));
		itemGetter.open(target as never);
		getFrame('itemGetter').dispatchEvent(new CustomEvent('closed'));
		itemGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('legacy ItemGetter.open/confirm 转发 composable 并回调 target.input', async () => {
		const wrapper = mount(ItemGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({
			type: 'by-key',
			actor: { type: 'trigger' },
			key: 'enter'
		}));
		ItemGetterController.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('itemGetter');
		expect(getControl('itemGetter-type').read()).toBe('by-key');
		expect(getControl('itemGetter-key').read()).toBe('enter');
		getControl('itemGetter-key').write('space');
		ItemGetterController.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'by-key',
			actor: { type: 'trigger' },
			key: 'space'
		});
		expect(Window.close).toHaveBeenCalledWith('itemGetter');
		wrapper.unmount();
	});
});
