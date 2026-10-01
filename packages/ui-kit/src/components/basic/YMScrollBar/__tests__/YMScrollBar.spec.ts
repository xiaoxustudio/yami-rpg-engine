import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import YMScrollBar from '../YMScrollBar.vue';
import type { ScrollBarApi } from '../scroll-bar-api';

describe('YMScrollBar', () => {
	it('bind creates thumb and adds type class', () => {
		const wrapper = mount(YMScrollBar);
		const vm = wrapper.vm as unknown as ScrollBarApi;
		const target = document.createElement('div');
		vm.bind(target, 'vertical');
		expect(wrapper.find('.scroll-thumb').exists()).toBe(true);
		expect(wrapper.classes()).toContain('vertical');
	});

	it('updateVerticalBar shows display when scrollable', () => {
		const wrapper = mount(YMScrollBar);
		const vm = wrapper.vm as unknown as ScrollBarApi;
		const target = document.createElement('div');
		Object.defineProperty(target, 'clientHeight', { value: 100, configurable: true });
		Object.defineProperty(target, 'scrollHeight', { value: 300, configurable: true });
		Object.defineProperty(target, 'scrollTop', { value: 50, configurable: true });
		vm.bind(target, 'vertical');
		vm.updateVerticalBar();
		expect(wrapper.classes()).toContain('visible');
		const thumb = wrapper.find('.scroll-thumb').element as HTMLElement;
		expect(thumb.style.top).toBe('16.666667%');
	});

	it('updateVerticalBar hides when not scrollable', () => {
		const wrapper = mount(YMScrollBar);
		const vm = wrapper.vm as unknown as ScrollBarApi;
		const target = document.createElement('div');
		Object.defineProperty(target, 'clientHeight', { value: 300, configurable: true });
		Object.defineProperty(target, 'scrollHeight', { value: 100, configurable: true });
		vm.bind(target, 'vertical');
		vm.updateVerticalBar();
		expect(wrapper.classes()).not.toContain('visible');
	});

	it('exposes bridge functions on root element', () => {
		const wrapper = mount(YMScrollBar);
		const el = wrapper.element as unknown as ScrollBarApi;
		expect(typeof el.bind).toBe('function');
		expect(typeof el.updateHorizontalBar).toBe('function');
		expect(typeof el.updateVerticalBar).toBe('function');
		expect(typeof el.updateDisplay).toBe('function');
	});
});

describe('YMScrollBar 的卸载清理', () => {
	/** 在滑块上按下 ⇒ 进入 scroll 拖拽模式，登记 window 上的 pointerup / pointermove */
	const pressThumb = (wrapper: ReturnType<typeof mount>) => {
		const vm = wrapper.vm as unknown as ScrollBarApi;
		const target = document.createElement('div');
		Object.defineProperty(target, 'clientHeight', { value: 100, configurable: true });
		Object.defineProperty(target, 'scrollHeight', { value: 300, configurable: true });
		vm.bind(target, 'vertical');
		const thumb = wrapper.find('.scroll-thumb').element as HTMLElement;
		thumb.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
	};

	it('拖拽中卸载：摘掉 window 上的 pointerup / pointermove', () => {
		const wrapper = mount(YMScrollBar);
		pressThumb(wrapper);

		const removed: string[] = [];
		const spy = vi
			.spyOn(window, 'removeEventListener')
			.mockImplementation((type: string | symbol) => void removed.push(String(type)));
		wrapper.unmount();
		spy.mockRestore();

		expect(removed).toContain('pointerup');
		expect(removed).toContain('pointermove');
	});
});
