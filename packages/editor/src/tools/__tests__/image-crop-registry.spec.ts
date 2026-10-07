import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import ImageClipWindow from '@app/components/tools/ImageClip.vue';
import { ImageClip, imageClipEls } from '../image-crop-window.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} }),
	getLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

describe('裁剪窗口注册表', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		imageClipEls.clear();
		ImageClip.window = undefined as unknown as typeof ImageClip.window;
	});

	it('ImageClip.vue 登记窗口 + screen/image/marquee（元素 id 与注册键一致）', async () => {
		const wrapper = mount(ImageClipWindow, { attachTo: document.body });
		await nextTick();

		const missing: string[] = [];
		for (const id of [
			'imageClip',
			'imageClip-screen',
			'imageClip-image',
			'imageClip-marquee'
		]) {
			const el = imageClipEls.get(id);
			if (!(el instanceof HTMLElement)) missing.push(id);
			else if (el.id !== id) missing.push(`${id} → ${el.id}`);
		}
		expect(missing).toEqual([]);

		wrapper.unmount();
	});

	it('initialize 从注册表绑定 window/screen/image/marquee', async () => {
		const wrapper = mount(ImageClipWindow, { attachTo: document.body });
		await nextTick();

		for (const name of [
			'dprchange',
			'windowClosed',
			'windowResize',
			'screenKeydown',
			'marqueePointerdown'
		]) {
			(ImageClip as unknown as Record<string, unknown>)[name] = vi.fn();
		}

		expect(() => ImageClip.initialize!()).not.toThrow();
		expect(ImageClip.window).toBe(imageClipEls.get('imageClip'));
		expect(ImageClip.screen).toBe(imageClipEls.get('imageClip-screen'));
		expect(ImageClip.image).toBe(imageClipEls.get('imageClip-image'));
		expect(ImageClip.marquee).toBe(imageClipEls.get('imageClip-marquee'));

		wrapper.unmount();
	});

	it('注册表为空时（未挂载）initialize 不抛错', () => {
		imageClipEls.clear();
		for (const name of [
			'dprchange',
			'windowClosed',
			'windowResize',
			'screenKeydown',
			'marqueePointerdown'
		]) {
			(ImageClip as unknown as Record<string, unknown>)[name] = vi.fn();
		}
		expect(() => ImageClip.initialize!()).not.toThrow();
	});
});
