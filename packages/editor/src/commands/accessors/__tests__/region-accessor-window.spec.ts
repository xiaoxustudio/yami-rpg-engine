import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import RegionGetterWindow from '@app/components/tools/RegionGetter.vue';
import { useRegionGetterWindow } from '@app/composables/useRegionGetterWindow';
import { RegionGetter } from '@app/commands/accessors/region-accessor-window.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

vi.mock('@app/composables/usePresetObjectWindow', () => ({
	usePresetObjectWindow: () => ({ getDefaultPresetId: () => 'preset-0' }),
	PresetObject: { getDefaultPresetId: () => 'preset-0' }
}));

const makeTarget = (read?: () => unknown) => ({
	dataValue: undefined,
	read,
	input: vi.fn()
});

describe('RegionGetter（区域访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(RegionGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'preset-7' }));
		RegionGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('regionGetter');
		expect(useRegionGetterWindow().form.type).toBe('by-id');
		expect(useRegionGetterWindow().form.presetId).toBe('preset-7');
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(RegionGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		RegionGetter.open!(target as never);
		const regionGetter = useRegionGetterWindow();
		regionGetter.form.type = 'by-id';
		regionGetter.form.presetId = 'preset-8';
		RegionGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({ type: 'by-id', presetId: 'preset-8' });
		expect(Window.close).toHaveBeenCalledWith('regionGetter');
		wrapper.unmount();
	});
});
