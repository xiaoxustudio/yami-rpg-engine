import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import YMToastManager from '../YMToastManager.vue';

describe('YMToastManager', () => {
	it('shows a toast with message and type class', async () => {
		const wrapper = mount(YMToastManager);
		const vm = wrapper.vm as unknown as Record<string, any>;
		const el = vm.show('Hello', 'error', 0);
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.toast').exists()).toBe(true);
		expect(el.className).toContain('toast-error');
		expect(el.querySelector('.toast-text')?.textContent).toBe('Hello');
		vm.dismiss(el);
		await new Promise((r) => setTimeout(r, 250));
		expect(wrapper.find('.toast').exists()).toBe(false);
	});

	it('dismisses via close button', async () => {
		const wrapper = mount(YMToastManager);
		const vm = wrapper.vm as unknown as Record<string, any>;
		vm.show('Msg', 'info', 0);
		await wrapper.vm.$nextTick();
		const close = wrapper.find('.toast-close');
		void close.trigger('click');
		await new Promise((r) => setTimeout(r, 250));
		expect(wrapper.find('.toast').exists()).toBe(false);
	});

	it('auto-dismisses after duration', async () => {
		vi.useFakeTimers();
		const wrapper = mount(YMToastManager);
		const vm = wrapper.vm as unknown as Record<string, any>;
		vm.show('Auto', 'info', 50);
		vi.advanceTimersByTime(300);
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.toast').exists()).toBe(false);
		vi.useRealTimers();
	});

	it('容器是常驻 live region（动态插入的 toast 才会被读屏播报）', () => {
		const wrapper = mount(YMToastManager);
		expect(wrapper.attributes('role')).toBe('status');
		expect(wrapper.attributes('aria-live')).toBe('polite');
	});

	it('does not dismiss elements outside the manager', async () => {
		const wrapper = mount(YMToastManager);
		const vm = wrapper.vm as unknown as Record<string, any>;
		const foreign = document.createElement('div');
		document.body.appendChild(foreign);
		vm.dismiss(foreign);
		await wrapper.vm.$nextTick();
		expect(foreign.isConnected).toBe(true);
		foreign.remove();
	});
});
