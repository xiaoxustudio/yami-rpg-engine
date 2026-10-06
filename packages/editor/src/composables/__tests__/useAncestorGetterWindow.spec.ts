import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import AncestorGetter from '@app/components/tools/AncestorGetter.vue';
import { useAncestorGetterWindow } from '@app/composables/useAncestorGetterWindow';
import { Window } from '@app/tools/window-object.ts';
import { AncestorGetter as AncestorGetterController } from '@app/commands/accessors/ancestor-accessor-window.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() }),
	getLocalStore: () => ({ syncState: vi.fn() })
}));

const getFrame = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;

const makeTarget = (read?: () => unknown) => ({
	dataValue: undefined,
	read,
	input: vi.fn()
});

describe('useAncestorGetterWindow（祖先元素访问器窗口 composable：form 状态 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 打开窗口、解析 read 数据填充 form', async () => {
		const wrapper = mount(AncestorGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const ancestorGetter = useAncestorGetterWindow();
		const target = makeTarget(() => ({ type: 'latest' }));
		ancestorGetter.open(target as never);
		expect(Window.open).toHaveBeenCalledWith('ancestorGetter');
		expect(ancestorGetter.form.type).toBe('latest');
		wrapper.unmount();
	});

	it('confirm 经 form 读回值回调并关闭窗口（by-id 含 presetId）', async () => {
		const wrapper = mount(AncestorGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const ancestorGetter = useAncestorGetterWindow();
		const target = makeTarget(() => ({ type: 'by-id' }));
		ancestorGetter.open(target as never);
		ancestorGetter.form.type = 'by-id';
		ancestorGetter.form.presetId = 'preset-9';
		ancestorGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({ type: 'by-id', presetId: 'preset-9' });
		expect(Window.close).toHaveBeenCalledWith('ancestorGetter');
		wrapper.unmount();
	});

	it('confirm 校验失败（by-id presetId 为空）聚焦控件且不回调不关闭', async () => {
		const wrapper = mount(AncestorGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const ancestorGetter = useAncestorGetterWindow();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'preset-1' }));
		ancestorGetter.open(target as never);
		ancestorGetter.form.type = 'by-id';
		ancestorGetter.form.presetId = '';
		ancestorGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('closed 事件清除回调，后续 confirm 不再触发', async () => {
		const wrapper = mount(AncestorGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const ancestorGetter = useAncestorGetterWindow();
		const target = makeTarget(() => ({ type: 'latest' }));
		ancestorGetter.open(target as never);
		getFrame('ancestorGetter').dispatchEvent(new CustomEvent('closed'));
		ancestorGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('legacy AncestorGetter.open/confirm 转发 composable 并回调 target.input', async () => {
		const wrapper = mount(AncestorGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const ancestorGetter = useAncestorGetterWindow();
		const target = makeTarget(() => ({
			type: 'variable',
			variable: { type: 'local', key: 'v1' }
		}));
		AncestorGetterController.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('ancestorGetter');
		expect(ancestorGetter.form.type).toBe('variable');
		ancestorGetter.form.variable = { type: 'local', key: 'v2' };
		AncestorGetterController.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'variable',
			variable: { type: 'local', key: 'v2' }
		});
		expect(Window.close).toHaveBeenCalledWith('ancestorGetter');
		wrapper.unmount();
	});
});
