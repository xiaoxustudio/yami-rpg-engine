import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import ImageClipWindow from '@app/components/tools/ImageClip.vue';
import { ImageClip, imageClipEls } from '../image-crop-window.ts';

/**
 * P5b 批次 3 回归：裁剪窗口不再用 `$('#id')` 查 DOM——控件由 `ImageClip.vue` 登记进
 * `imageClipEls`；窗口自身因 `:ref` 槽位被 `ref="frame"` 占用，改在 onMounted 里
 * 用 `registerElement()` 命令式登记（否则 `ensureDomBound()` 会早退，整套绑定静默失效）。
 */
vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

describe('裁剪窗口注册表（P5b 批次 3）', () => {
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

		// initialize 会挂这些处理器（正常启动时由别处赋值），用例里补桩以走到绑定段
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
