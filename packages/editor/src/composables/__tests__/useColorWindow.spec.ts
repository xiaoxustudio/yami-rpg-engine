import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import Color from '@app/components/tools/Color.vue';
import { useColorWindow } from '@app/composables/useColorWindow';
import { Window } from '@app/tools/window-object.ts';
import { radioProxyMap } from '@ui-kit';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() })
}));

describe('useColorWindow（颜色窗口 composable：form 状态 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		for (const key of Object.keys(radioProxyMap)) {
			delete radioProxyMap[key];
		}
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 打开窗口、填充简化 hex 与 rgba 到 form 并写入回调', async () => {
		const wrapper = mount(Color, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const color = useColorWindow();
		const callback = vi.fn();
		color.open('ff0000ff', null, false, callback);
		expect(Window.open).toHaveBeenCalledWith('color');
		expect(color.form.hex).toBe('ff0000');
		expect(color.form.r).toBe(255);
		expect(color.form.g).toBe(0);
		expect(color.form.b).toBe(0);
		expect(color.form.a).toBe(255);
		wrapper.unmount();
	});

	it('open 传入 index 时写入 form.index', async () => {
		const wrapper = mount(Color, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const color = useColorWindow();
		const callback = vi.fn();
		color.open('ff0000ff', 3, true, callback);
		expect(color.form.index).toBe(3);
		wrapper.unmount();
	});

	it('confirm 以 form 的 rgba 回调 hex 并关闭窗口', async () => {
		const wrapper = mount(Color, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const color = useColorWindow();
		const callback = vi.fn();
		color.open('ff0000ff', null, false, callback);
		color.form.r = 10;
		color.confirm();
		expect(callback).toHaveBeenCalledWith('0a0000ff');
		expect(Window.close).toHaveBeenCalledWith('color');
		wrapper.unmount();
	});

	it('confirm 在 indexEnabled 且选中索引时回调索引值', async () => {
		const wrapper = mount(Color, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const color = useColorWindow();
		const callback = vi.fn();
		color.open('ff0000ff', null, true, callback);
		color.form.index = 5;
		color.confirm();
		expect(callback).toHaveBeenCalledWith(5);
		wrapper.unmount();
	});

	it('closed 事件清除回调，后续 confirm 不再触发', async () => {
		const wrapper = mount(Color, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const color = useColorWindow();
		const callback = vi.fn();
		color.open('ff0000ff', null, false, callback);
		document.getElementById('color')!.dispatchEvent(new CustomEvent('closed'));
		color.confirm();
		expect(callback).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
