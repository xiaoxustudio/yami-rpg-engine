import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import TilemapGetter from '@app/components/tools/TilemapGetter.vue';
import { useTilemapGetterWindow } from '@app/composables/useTilemapGetterWindow';
import { Window } from '@app/tools/window-object.ts';
import { TilemapGetter as TilemapGetterController } from '@app/commands/accessors/tilemap-accessor-window.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() })
}));

const getFrame = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;

const makeTarget = (read?: () => unknown) => ({
	dataValue: undefined,
	read,
	input: vi.fn()
});

describe('useTilemapGetterWindow（瓦片地图访问器窗口 composable：form 状态 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 打开窗口、解析 read 数据填充 form', async () => {
		const wrapper = mount(TilemapGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const tilemapGetter = useTilemapGetterWindow();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'tile-1' }));
		tilemapGetter.open(target as never);
		expect(Window.open).toHaveBeenCalledWith('tilemapGetter');
		expect(tilemapGetter.form.type).toBe('by-id');
		expect(tilemapGetter.form.presetId).toBe('tile-1');
		wrapper.unmount();
	});

	it('confirm 经 form 读回值回调并关闭窗口（variable 含变量）', async () => {
		const wrapper = mount(TilemapGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const tilemapGetter = useTilemapGetterWindow();
		const target = makeTarget(() => ({ type: 'variable' }));
		tilemapGetter.open(target as never);
		tilemapGetter.form.type = 'variable';
		tilemapGetter.form.variable = { type: 'local', key: 'v1' };
		tilemapGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({
			type: 'variable',
			variable: { type: 'local', key: 'v1' }
		});
		expect(Window.close).toHaveBeenCalledWith('tilemapGetter');
		wrapper.unmount();
	});

	it('confirm 校验失败（variable 未选）聚焦控件且不回调不关闭', async () => {
		const wrapper = mount(TilemapGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const tilemapGetter = useTilemapGetterWindow();
		const target = makeTarget(() => ({
			type: 'variable',
			variable: { type: 'local', key: 'v1' }
		}));
		tilemapGetter.open(target as never);
		tilemapGetter.form.type = 'variable';
		tilemapGetter.form.variable = { type: 'local', key: '' };
		tilemapGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('closed 事件清除回调，后续 confirm 不再触发', async () => {
		const wrapper = mount(TilemapGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const tilemapGetter = useTilemapGetterWindow();
		const target = makeTarget(() => ({ type: 'trigger' }));
		tilemapGetter.open(target as never);
		getFrame('tilemapGetter').dispatchEvent(new CustomEvent('closed'));
		tilemapGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('legacy TilemapGetter.open/confirm 转发 composable 并回调 target.input', async () => {
		const wrapper = mount(TilemapGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const tilemapGetter = useTilemapGetterWindow();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'tile-1' }));
		TilemapGetterController.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('tilemapGetter');
		expect(tilemapGetter.form.type).toBe('by-id');
		expect(tilemapGetter.form.presetId).toBe('tile-1');
		tilemapGetter.form.presetId = 'tile-2';
		TilemapGetterController.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({ type: 'by-id', presetId: 'tile-2' });
		expect(Window.close).toHaveBeenCalledWith('tilemapGetter');
		wrapper.unmount();
	});
});
