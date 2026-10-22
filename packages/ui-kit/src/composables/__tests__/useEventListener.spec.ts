import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import { useEventListener } from '../useEventListener';

const Host = defineComponent({
	props: {
		onEvent: { type: Function, required: true }
	},
	setup(props) {
		const handler = (event: Event): void => props.onEvent(event);
		useEventListener(window, 'probe', handler);
		return () => h('div');
	}
});

const ToggleHost = defineComponent({
	props: {
		onEvent: { type: Function, required: true },
		on: { type: Boolean, default: false }
	},
	setup(props) {
		const handler = (event: Event): void => props.onEvent(event);
		useEventListener(window, 'probe', handler, { enabled: () => props.on });
		return () => h('div');
	}
});

const DeferredHost = defineComponent({
	props: {
		onEvent: { type: Function, required: true },
		ready: { type: Boolean, default: false }
	},
	setup(props) {
		const root = ref<HTMLElement | null>(null);
		const handler = (event: Event): void => props.onEvent(event);
		useEventListener(() => (props.ready ? root.value : null), 'probe', handler);
		return () => h('div', { ref: root });
	}
});

describe('useEventListener', () => {
	it('挂载后能收到事件', () => {
		const onEvent = vi.fn();
		const wrapper = mount(Host, { props: { onEvent } });

		window.dispatchEvent(new Event('probe'));
		expect(onEvent).toHaveBeenCalledTimes(1);

		wrapper.unmount();
	});

	it('卸载后监听被摘除（不泄漏）', () => {
		const onEvent = vi.fn();
		const wrapper = mount(Host, { props: { onEvent } });
		wrapper.unmount();

		window.dispatchEvent(new Event('probe'));
		expect(onEvent).not.toHaveBeenCalled();
	});

	it('卸载时对同一 handler 调用 removeEventListener', () => {
		const remove = vi.spyOn(window, 'removeEventListener');
		const wrapper = mount(Host, { props: { onEvent: vi.fn() } });
		wrapper.unmount();

		expect(remove).toHaveBeenCalledWith('probe', expect.any(Function), undefined);
		remove.mockRestore();
	});

	it('target 由 null 变为元素后自动挂上（getter 跟随）', async () => {
		const onEvent = vi.fn();
		const wrapper = mount(DeferredHost, { props: { onEvent } });
		const element = wrapper.element as HTMLElement;

		await wrapper.setProps({ ready: true });
		element.dispatchEvent(new Event('probe'));
		expect(onEvent).toHaveBeenCalledTimes(1);

		wrapper.unmount();
		element.dispatchEvent(new Event('probe'));
		expect(onEvent).toHaveBeenCalledTimes(1);
	});

	it('enabled=false 时不注册；置真后挂上、再置假后摘掉', async () => {
		const onEvent = vi.fn();
		const wrapper = mount(ToggleHost, { props: { onEvent } });

		window.dispatchEvent(new Event('probe'));
		expect(onEvent).not.toHaveBeenCalled();

		await wrapper.setProps({ on: true });
		window.dispatchEvent(new Event('probe'));
		expect(onEvent).toHaveBeenCalledTimes(1);

		await wrapper.setProps({ on: false });
		window.dispatchEvent(new Event('probe'));
		expect(onEvent).toHaveBeenCalledTimes(1);

		wrapper.unmount();
	});
});
