import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import ImageClipWindow from '@app/components/tools/ImageClip.vue';
import { ImageClip } from '../image-crop-window.ts';
import { getImageCropHandles } from '@app/composables/image-crop-handles';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} }),
	getLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

const resetSlots = () => {
	ImageClip.window = undefined as unknown as typeof ImageClip.window;
	ImageClip.screen = undefined as unknown as typeof ImageClip.screen;
	ImageClip.image = undefined as unknown as typeof ImageClip.image;
	ImageClip.marquee = undefined as unknown as typeof ImageClip.marquee;
};

const stubListeners = () => {
	for (const name of [
		'dprchange',
		'windowClosed',
		'windowResize',
		'screenKeydown',
		'marqueePointerdown'
	]) {
		(ImageClip as unknown as Record<string, unknown>)[name] = vi.fn();
	}
};

/**
 * 裁剪窗口：控件不再进 `imageClipEls`（注册表已删除）。这里守新的接缝 —— 窗口挂载时把
 * window / screen / image / marquee 四个长期句柄一次性交给单例，卸载时注销。
 */
describe('裁剪窗口：句柄表接缝', () => {
	const mounted: Array<{ unmount(): void }> = [];

	const mountWindow = () => {
		const wrapper = mount(ImageClipWindow, { attachTo: document.body });
		mounted.push(wrapper);
		return wrapper;
	};

	beforeEach(() => {
		setActivePinia(createPinia());
		resetSlots();
	});

	afterEach(() => {
		for (const wrapper of mounted.splice(0)) wrapper.unmount();
	});

	it('挂载后句柄表就位，四个节点与 DOM id 一致', async () => {
		const wrapper = mountWindow();
		await nextTick();

		const handles = getImageCropHandles();
		expect(handles).toBeTruthy();
		expect(handles?.win.id).toBe('imageClip');
		expect(handles?.screen.id).toBe('imageClip-screen');
		expect(handles?.image.id).toBe('imageClip-image');
		expect(handles?.marquee.id).toBe('imageClip-marquee');

		wrapper.unmount();
		expect(getImageCropHandles(), '卸载后应注销').toBeNull();
	});

	it('initialize 从句柄表绑定 window/screen/image/marquee', async () => {
		mountWindow();
		await nextTick();
		stubListeners();

		expect(() => ImageClip.initialize!()).not.toThrow();
		const handles = getImageCropHandles()!;
		expect(ImageClip.window).toBe(handles.win);
		expect(ImageClip.screen).toBe(handles.screen);
		expect(ImageClip.image).toBe(handles.image);
		expect(ImageClip.marquee).toBe(handles.marquee);
	});

	it('未挂载（句柄表为空）时 initialize 不抛错', () => {
		stubListeners();
		expect(getImageCropHandles()).toBeNull();
		expect(() => ImageClip.initialize!()).not.toThrow();
		expect(ImageClip.window).toBeUndefined();
	});
});
