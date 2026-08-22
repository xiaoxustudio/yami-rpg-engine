import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import LightGetterWindow from '@app/components/tools/LightGetter.vue';
import ObjectGetterWindow from '@app/components/tools/ObjectGetter.vue';
import {
	useLightGetterWindow,
	useObjectGetterWindow
} from '@app/composables/usePresetGetterWindow';
import { LightGetter, ObjectGetter } from '@app/commands/accessors/preset-accessor-factory.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

vi.mock('@app/composables/usePresetObjectWindow', () => ({
	usePresetObjectWindow: () => ({
		getDefaultPresetId: vi.fn(() => 'preset-1')
	}),
	PresetObject: { getDefaultPresetId: vi.fn(() => 'preset-1') }
}));

const makeTarget = (read?: () => unknown) => ({
	dataValue: undefined,
	read,
	input: vi.fn()
});

describe('preset-accessor-factory（工厂生成的 LightGetter/ObjectGetter 转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('LightGetter.open 转发 composable 并解析 variable 数据填充 form', async () => {
		const wrapper = mount(LightGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({
			type: 'variable',
			variable: { type: 'local', key: 'v1' }
		}));
		LightGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('lightGetter');
		expect(useLightGetterWindow().form.type).toBe('variable');
		expect(useLightGetterWindow().form.variable).toEqual({ type: 'local', key: 'v1' });
		wrapper.unmount();
	});

	it('LightGetter.confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(LightGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		LightGetter.open!(target as never);
		LightGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({ type: 'trigger' });
		expect(Window.close).toHaveBeenCalledWith('lightGetter');
		wrapper.unmount();
	});

	it('ObjectGetter 独立单例：open/confirm trigger 路径回调并关闭', async () => {
		const wrapper = mount(ObjectGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		ObjectGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('objectGetter');
		expect(useObjectGetterWindow().form.type).toBe('trigger');
		ObjectGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({ type: 'trigger' });
		expect(Window.close).toHaveBeenCalledWith('objectGetter');
		wrapper.unmount();
	});
});
