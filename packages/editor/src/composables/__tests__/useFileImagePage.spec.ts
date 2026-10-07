import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useFileImagePage } from '@app/composables/useFileImagePage';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement } from '@app/utils/element-registry';

const fileImage = vi.hoisted(() => ({
	target: null as unknown,
	symbol: null as unknown,
	info: null as { name: string; size: string; resolution: string } | null
}));

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		fileImage
	}
}));

const cssSpy = vi.hoisted(() => vi.fn(() => ({ width: 200, height: 200 })));

vi.mock('@app/utils/css', async (importOriginal) => ({
	...(await importOriginal<typeof import('@app/utils/css')>()),
	getDevicePixelContentBoxSize: cssSpy
}));

const Host = defineComponent({
	setup() {
		return useFileImagePage();
	},
	render: () => null
});

describe('useFileImagePage（fileImage inspector 页面 composable）', () => {
	beforeAll(() => {});

	beforeEach(() => {
		document.body.innerHTML = '';
		fileImage.target = null;
		fileImage.symbol = null;
		fileImage.info = null;
		cssSpy.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useFileImagePage>
		};
	};

	const makeImage = (width = 400, height = 300) => {
		const frame = document.createElement('div');
		const image = document.createElement('img');
		image.id = 'fileImage-image';
		Object.defineProperty(image, 'naturalWidth', { value: width });
		Object.defineProperty(image, 'naturalHeight', { value: height });
		frame.appendChild(image);
		document.body.appendChild(frame);
		registerElement(inspectorEls, 'fileImage-image', image);
		return { frame, image };
	};

	it('updateImage 按容器尺寸等比适配图像', () => {
		const { wrapper, page } = mountPage();
		const { image } = makeImage();
		page.updateImage();
		expect(image.style.width).toBe('200px');
		expect(image.style.height).toBe('150px');
		expect(image.style.display).toBe('');
		wrapper.unmount();
	});

	it('updateImage 在图像小于容器时保持原尺寸', () => {
		const { wrapper, page } = mountPage();
		const { image } = makeImage(100, 80);
		page.updateImage();
		expect(image.style.width).toBe('100px');
		expect(image.style.height).toBe('80px');
		wrapper.unmount();
	});

	it('windowResize 在 target 非空且未加载时调用 updateImage', () => {
		const { wrapper, page } = mountPage();
		const { image } = makeImage();
		fileImage.target = {};
		fileImage.symbol = null;
		page.windowResize(new Event('resize'));
		expect(image.style.width).toBe('200px');
		wrapper.unmount();
	});

	it('sync 从 Inspector.fileImage.info 读取文件信息', () => {
		const { wrapper, page } = mountPage();
		fileImage.info = { name: 'a.png', size: '1.5 KB', resolution: '400 x 300' };
		page.sync();
		expect(page.form.name).toBe('a.png');
		expect(page.form.size).toBe('1.5 KB');
		expect(page.form.resolution).toBe('400 x 300');
		wrapper.unmount();
	});

	it('sync 在 info 为空时保持表单不变', () => {
		const { wrapper, page } = mountPage();
		page.sync();
		expect(page.form.name).toBe('');
		expect(page.form.size).toBe('');
		expect(page.form.resolution).toBe('');
		wrapper.unmount();
	});

	it('windowResize 在 target 为空时跳过 updateImage', () => {
		const { wrapper, page } = mountPage();
		const { image } = makeImage();
		fileImage.target = null;
		page.windowResize(new Event('resize'));
		expect(image.style.width).toBe('');
		expect(image.style.display).toBe('');
		wrapper.unmount();
	});
});
