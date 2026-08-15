import { describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useFileVideoPage } from '@app/composables/useFileVideoPage';

const Host = defineComponent({
	setup() {
		return useFileVideoPage();
	},
	render: () => null
});

describe('useFileVideoPage（fileVideo inspector 页面 composable）', () => {
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
});
