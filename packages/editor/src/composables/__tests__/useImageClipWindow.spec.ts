import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ImageClip from '@app/components/tools/ImageClip.vue';
import { useImageClipWindow } from '@app/composables/useImageClipWindow';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

describe('useImageClipWindow（裁剪窗口 composable：form 状态 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 打开窗口、填充 form 并写入回调', async () => {
		const wrapper = mount(ImageClip, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const imageClip = useImageClipWindow();
		const callback = vi.fn();
		imageClip.open({ x: 10, y: 20, width: 64, height: 32 }, callback);
		expect(Window.open).toHaveBeenCalledWith('imageClip');
		expect(imageClip.form.x).toBe(10);
		expect(imageClip.form.height).toBe(32);
		wrapper.unmount();
	});

	it('confirm 以 form 读回以数组回调并关闭窗口', async () => {
		const wrapper = mount(ImageClip, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const imageClip = useImageClipWindow();
		const callback = vi.fn();
		imageClip.open({ x: 0, y: 0, width: 64, height: 64 }, callback);
		imageClip.form.x = 5;
		imageClip.form.y = 6;
		imageClip.form.width = 16;
		imageClip.form.height = 8;
		imageClip.confirm();
		expect(callback).toHaveBeenCalledWith([5, 6, 16, 8]);
		expect(Window.close).toHaveBeenCalledWith('imageClip');
		wrapper.unmount();
	});

	it('closed 事件清除回调，后续 confirm 不再触发', async () => {
		const wrapper = mount(ImageClip, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const imageClip = useImageClipWindow();
		const callback = vi.fn();
		imageClip.open({ x: 0, y: 0, width: 64, height: 64 }, callback);
		document.getElementById('imageClip')!.dispatchEvent(new CustomEvent('closed'));
		imageClip.confirm();
		expect(callback).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
