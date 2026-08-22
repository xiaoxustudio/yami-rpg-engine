import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import PositionGetterWindow from '@app/components/tools/PositionGetter.vue';
import { usePositionGetterWindow } from '@app/composables/usePositionGetterWindow';
import { PositionGetter } from '@app/commands/accessors/position-accessor-window.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

const makeTarget = (read?: () => unknown) => ({
	dataValue: undefined,
	read,
	input: vi.fn()
});

describe('PositionGetter（位置访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(PositionGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'absolute', x: 5, y: 9 }));
		PositionGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('positionGetter');
		expect(usePositionGetterWindow().form.type).toBe('absolute');
		expect(usePositionGetterWindow().form.x).toBe(5);
		expect(usePositionGetterWindow().form.y).toBe(9);
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(PositionGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'absolute', x: 1, y: 2 }));
		PositionGetter.open!(target as never);
		const positionGetter = usePositionGetterWindow();
		positionGetter.form.x = 10;
		positionGetter.form.y = 20;
		PositionGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({ type: 'absolute', x: 10, y: 20 });
		expect(Window.close).toHaveBeenCalledWith('positionGetter');
		wrapper.unmount();
	});

	it('checkDataForPlugin 匹配 getter=position', () => {
		expect(PositionGetter.checkDataForPlugin!({ getter: 'position' })).toBe(true);
		expect(PositionGetter.checkDataForPlugin!({ getter: 'actor' })).toBe(false);
	});

	it('createDefaultForPlugin 返回默认结构', () => {
		expect(PositionGetter.createDefaultForPlugin!()).toEqual({
			getter: 'position',
			type: 'absolute',
			x: 0,
			y: 0
		});
	});
});
