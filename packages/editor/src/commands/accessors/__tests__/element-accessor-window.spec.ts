import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ElementGetterWindow from '@app/components/tools/ElementGetter.vue';
import { useElementGetterWindow } from '@app/composables/useElementGetterWindow';
import { ElementGetter } from '@app/commands/accessors/element-accessor-window.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

vi.mock('@app/composables/usePresetElementWindow', () => ({
	usePresetElementWindow: () => ({ getDefaultPresetId: () => 'preset-0' }),
	PresetElement: { getDefaultPresetId: () => 'preset-0' }
}));

const makeTarget = (read?: () => unknown) => ({
	dataValue: undefined,
	read,
	input: vi.fn()
});

describe('ElementGetter（元素访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(ElementGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'preset-7' }));
		ElementGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('elementGetter');
		expect(useElementGetterWindow().form.type).toBe('by-id');
		expect(useElementGetterWindow().form.presetId).toBe('preset-7');
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(ElementGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		ElementGetter.open!(target as never);
		const elementGetter = useElementGetterWindow();
		elementGetter.form.type = 'by-ancestor-and-id';
		elementGetter.form.presetId = 'preset-8';
		ElementGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'by-ancestor-and-id',
			ancestor: { type: 'trigger' },
			presetId: 'preset-8'
		});
		expect(Window.close).toHaveBeenCalledWith('elementGetter');
		wrapper.unmount();
	});

	it('checkDataForPlugin 匹配 getter=element', () => {
		expect(ElementGetter.checkDataForPlugin!({ getter: 'element' })).toBe(true);
		expect(ElementGetter.checkDataForPlugin!({ getter: 'actor' })).toBe(false);
	});

	it('createDefaultForPlugin 返回默认结构', () => {
		expect(ElementGetter.createDefaultForPlugin!()).toEqual({
			getter: 'element',
			type: 'trigger'
		});
	});
});
