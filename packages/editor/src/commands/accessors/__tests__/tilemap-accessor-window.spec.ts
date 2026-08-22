import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import TilemapGetterWindow from '@app/components/tools/TilemapGetter.vue';
import { useTilemapGetterWindow } from '@app/composables/useTilemapGetterWindow';
import { TilemapGetter } from '@app/commands/accessors/tilemap-accessor-window.ts';
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

describe('TilemapGetter（瓦片地图访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(TilemapGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'preset-7' }));
		TilemapGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('tilemapGetter');
		expect(useTilemapGetterWindow().form.type).toBe('by-id');
		expect(useTilemapGetterWindow().form.presetId).toBe('preset-7');
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(TilemapGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		TilemapGetter.open!(target as never);
		const tilemapGetter = useTilemapGetterWindow();
		tilemapGetter.form.type = 'variable';
		tilemapGetter.form.variable = { type: 'local', key: 'v1' };
		TilemapGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'variable',
			variable: { type: 'local', key: 'v1' }
		});
		expect(Window.close).toHaveBeenCalledWith('tilemapGetter');
		wrapper.unmount();
	});
});
