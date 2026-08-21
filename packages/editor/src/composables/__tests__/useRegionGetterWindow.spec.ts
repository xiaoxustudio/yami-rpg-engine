import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import RegionGetter from '@app/components/tools/RegionGetter.vue';
import { useRegionGetterWindow } from '@app/composables/useRegionGetterWindow';
import { Window } from '@app/tools/window-object.ts';
import { RegionGetter as RegionGetterController } from '@app/commands/accessors/region-accessor-window.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

const getFrame = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;

const makeTarget = (read?: () => unknown) => ({
	dataValue: undefined,
	read,
	input: vi.fn()
});

describe('useRegionGetterWindow（区域访问器窗口 composable：form 状态 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 打开窗口、解析 read 数据填充 form', async () => {
		const wrapper = mount(RegionGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const regionGetter = useRegionGetterWindow();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'region-1' }));
		regionGetter.open(target as never);
		expect(Window.open).toHaveBeenCalledWith('regionGetter');
		expect(regionGetter.form.type).toBe('by-id');
		expect(regionGetter.form.presetId).toBe('region-1');
		wrapper.unmount();
	});

	it('confirm 经 form 读回值回调并关闭窗口（by-id 含 presetId）', async () => {
		const wrapper = mount(RegionGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const regionGetter = useRegionGetterWindow();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'region-1' }));
		regionGetter.open(target as never);
		regionGetter.form.type = 'by-id';
		regionGetter.form.presetId = 'region-9';
		regionGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({ type: 'by-id', presetId: 'region-9' });
		expect(Window.close).toHaveBeenCalledWith('regionGetter');
		wrapper.unmount();
	});

	it('confirm 校验失败（by-id presetId 为空）聚焦控件且不回调不关闭', async () => {
		const wrapper = mount(RegionGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const regionGetter = useRegionGetterWindow();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'region-1' }));
		regionGetter.open(target as never);
		regionGetter.form.type = 'by-id';
		regionGetter.form.presetId = '';
		regionGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('closed 事件清除回调，后续 confirm 不再触发', async () => {
		const wrapper = mount(RegionGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const regionGetter = useRegionGetterWindow();
		const target = makeTarget(() => ({ type: 'trigger' }));
		regionGetter.open(target as never);
		getFrame('regionGetter').dispatchEvent(new CustomEvent('closed'));
		regionGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('legacy RegionGetter.open/confirm 转发 composable 并回调 target.input', async () => {
		const wrapper = mount(RegionGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const regionGetter = useRegionGetterWindow();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'region-1' }));
		RegionGetterController.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('regionGetter');
		expect(regionGetter.form.type).toBe('by-id');
		expect(regionGetter.form.presetId).toBe('region-1');
		regionGetter.form.presetId = 'region-2';
		RegionGetterController.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({ type: 'by-id', presetId: 'region-2' });
		expect(Window.close).toHaveBeenCalledWith('regionGetter');
		wrapper.unmount();
	});
});
