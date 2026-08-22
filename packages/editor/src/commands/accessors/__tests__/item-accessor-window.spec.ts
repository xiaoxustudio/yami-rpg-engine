import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ItemGetterWindow from '@app/components/tools/ItemGetter.vue';
import { useItemGetterWindow } from '@app/composables/useItemGetterWindow';
import { ItemGetter } from '@app/commands/accessors/item-accessor-window.ts';
import { Window } from '@app/tools/window-object.ts';
import { Enum } from '@app/enum/enum-window.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

const makeTarget = (read?: () => unknown) => ({
	dataValue: undefined,
	read,
	input: vi.fn()
});

describe('ItemGetter（物品访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
		Enum.getDefStringId = vi.fn(() => 'key-1');
		Enum.getStringItems = vi.fn(() => []);
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(ItemGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'by-id', itemId: 'i1' }));
		ItemGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('itemGetter');
		expect(useItemGetterWindow().form.type).toBe('by-id');
		expect(Enum.getDefStringId).toHaveBeenCalledWith('shortcut-key');
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(ItemGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		ItemGetter.open!(target as never);
		const itemGetter = useItemGetterWindow();
		itemGetter.form.type = 'by-id';
		itemGetter.form.itemId = 'i2';
		ItemGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'by-id',
			actor: { type: 'trigger' },
			itemId: 'i2'
		});
		expect(Window.close).toHaveBeenCalledWith('itemGetter');
		wrapper.unmount();
	});

	it('checkDataForPlugin 匹配 getter=item', () => {
		expect(ItemGetter.checkDataForPlugin!({ getter: 'item' })).toBe(true);
		expect(ItemGetter.checkDataForPlugin!({ getter: 'skill' })).toBe(false);
	});

	it('createDefaultForPlugin 返回默认结构', () => {
		expect(ItemGetter.createDefaultForPlugin!()).toEqual({ getter: 'item', type: 'trigger' });
	});
});
