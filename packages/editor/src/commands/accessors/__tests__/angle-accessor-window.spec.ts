import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import AngleGetterWindow from '@app/components/tools/AngleGetter.vue';
import { useAngleGetterWindow } from '@app/composables/useAngleGetterWindow';
import { AngleGetter } from '@app/commands/accessors/angle-accessor-window.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

const makeTarget = (read?: () => unknown) => ({
	dataValue: undefined,
	read,
	input: vi.fn()
});

describe('AngleGetter（角度访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(AngleGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'absolute', degrees: 90 }));
		AngleGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('angleGetter');
		expect(useAngleGetterWindow().form.type).toBe('absolute');
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(AngleGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'absolute', degrees: 90 }));
		AngleGetter.open!(target as never);
		const angleGetter = useAngleGetterWindow();
		angleGetter.form.type = 'relative';
		angleGetter.form.degrees = 45;
		AngleGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({ type: 'relative', degrees: 45 });
		expect(Window.close).toHaveBeenCalledWith('angleGetter');
		wrapper.unmount();
	});
});
