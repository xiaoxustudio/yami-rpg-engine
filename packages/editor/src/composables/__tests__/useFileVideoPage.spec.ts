import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useFileVideoPage } from '@app/composables/useFileVideoPage';

const fileVideo = vi.hoisted(() => ({
	info: null as {
		name: string;
		size: string;
		duration: string;
		resolution: string;
		bitrate: string;
	} | null
}));

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		fileVideo
	}
}));

const Host = defineComponent({
	setup() {
		return useFileVideoPage();
	},
	render: () => null
});

describe('useFileVideoPage（fileVideo inspector 页面 composable）', () => {
	beforeEach(() => {
		fileVideo.info = null;
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useFileVideoPage>
		};
	};

	const makeErrorEvent = (message: string) => {
		const event = new Event('error') as ErrorEvent;
		Object.defineProperty(event, 'message', { value: message });
		event.stopImmediatePropagation = vi.fn();
		return event;
	};

	it('windowError 阻止 ResizeObserver loop limit exceeded 错误', () => {
		const { wrapper, page } = mountPage();
		const event = makeErrorEvent('ResizeObserver loop limit exceeded');
		page.windowError(event);
		expect(event.stopImmediatePropagation).toHaveBeenCalled();
		wrapper.unmount();
	});

	it('windowError 忽略其他错误', () => {
		const { wrapper, page } = mountPage();
		const event = makeErrorEvent('other error');
		page.windowError(event);
		expect(event.stopImmediatePropagation).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('sync 从 Inspector.fileVideo.info 读取文件信息', () => {
		const { wrapper, page } = mountPage();
		fileVideo.info = {
			name: 'v.mp4',
			size: '2.0 MB',
			duration: '1:30',
			resolution: '1920 x 1080',
			bitrate: '2500Kbps'
		};
		page.sync();
		expect(page.form.name).toBe('v.mp4');
		expect(page.form.size).toBe('2.0 MB');
		expect(page.form.duration).toBe('1:30');
		expect(page.form.resolution).toBe('1920 x 1080');
		expect(page.form.bitrate).toBe('2500Kbps');
		wrapper.unmount();
	});

	it('sync 在 info 为空时保持表单不变', () => {
		const { wrapper, page } = mountPage();
		page.sync();
		expect(page.form.name).toBe('');
		expect(page.form.size).toBe('');
		wrapper.unmount();
	});
});
