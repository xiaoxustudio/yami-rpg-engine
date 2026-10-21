import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
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
	const pressThumb = async (wrapper: ReturnType<typeof mount>) => {
		const vm = wrapper.vm as unknown as ScrollBarApi;
		const target = document.createElement('div');
		Object.defineProperty(target, 'clientHeight', { value: 100, configurable: true });
		Object.defineProperty(target, 'scrollHeight', { value: 300, configurable: true });
		vm.bind(target, 'vertical');
		const thumb = wrapper.find('.scroll-thumb').element as HTMLElement;
		thumb.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
		// window 上的两个监听改由 `useEventListener` + `enabled` 管理，挂载发生在
		// `flush: 'post'`（微任务），因此同步派发 pointerdown 之后必须让出一拍。
		// 这是把**测试**对齐到真实时序：真实浏览器里 pointerdown 与随后的
		// pointermove / pointerup 必然分属不同 task，不存在"同一 tick 内紧接着"的情形。
		await nextTick();
	};

	it('拖拽中卸载：摘掉 window 上的 pointerup / pointermove', async () => {
		const wrapper = mount(YMScrollBar);
		await pressThumb(wrapper);
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

describe('YMScrollBar 的拖拽走 useEventListener 的 enabled 通道', () => {
	/**
	 * 卸载用例只能证明"卸载时调了 removeEventListener"（`useEventListener` 无条件调它），
	 * **证不了挂载真的发生**。这条从行为上证明整条通道：能滚 ⇒ 挂上了；抬手后再动不滚 ⇒ 摘掉了。
	 */
	it('pointerdown → nextTick → window pointermove 真的滚动；pointerup 后摘除不再响应', async () => {
		const wrapper = mount(YMScrollBar);
		const vm = wrapper.vm as unknown as ScrollBarApi;
		const target = document.createElement('div');
		target.style.cssText = 'width:100px;height:100px;overflow-y:auto;';
		Object.defineProperty(target, 'clientHeight', { value: 100, configurable: true });
		Object.defineProperty(target, 'scrollHeight', { value: 300, configurable: true });
		vm.bind(target, 'vertical');
		vm.updateVerticalBar();
		await nextTick();

		const fire = (el: EventTarget, type: string, props: object): void => {
			el.dispatchEvent(
				new PointerEvent(type, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerId: 3,
					...props
				})
			);
		};

		const thumb = wrapper.find('.scroll-thumb').element as HTMLElement;
		fire(thumb, 'pointerdown', { clientX: 5, clientY: 10 });
		// enabled 的挂载发生在 flush: 'post'，让出一拍再打到 window 上
		await nextTick();
		fire(window, 'pointermove', { clientX: 5, clientY: 50 });

		// 能滚 ⇒ 监听确实挂上了、且 handler 走的就是新通道（不只是"卸载时被 remove"）。
		// jsdom 里设 scrollTop 不产生组件层的 `userscroll`，故只断言滚动结果本身。
		expect(target.scrollTop).toBeGreaterThan(0);
		const afterDrag = target.scrollTop;

		// 抬手 ⇒ enabled 置假 ⇒ 摘除；再动不应再滚
		fire(window, 'pointerup', { clientX: 5, clientY: 50 });
		await nextTick();
		fire(window, 'pointermove', { clientX: 5, clientY: 95 });
		expect(target.scrollTop).toBe(afterDrag);
	});
});
