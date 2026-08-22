import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import AncestorGetterWindow from '@app/components/tools/AncestorGetter.vue';
import { useAncestorGetterWindow } from '@app/composables/useAncestorGetterWindow';
import { AncestorGetter } from '@app/commands/accessors/ancestor-accessor-window.ts';
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

describe('AncestorGetter（祖先访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(AncestorGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'preset-7' }));
		AncestorGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('ancestorGetter');
		expect(useAncestorGetterWindow().form.type).toBe('by-id');
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(AncestorGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		AncestorGetter.open!(target as never);
		const ancestorGetter = useAncestorGetterWindow();
		ancestorGetter.form.type = 'variable';
		ancestorGetter.form.variable = { type: 'local', key: 'v1' };
		AncestorGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'variable',
			variable: { type: 'local', key: 'v1' }
		});
		expect(Window.close).toHaveBeenCalledWith('ancestorGetter');
		wrapper.unmount();
	});
});
