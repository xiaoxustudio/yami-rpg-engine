import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMMarqueeArea from '../YMMarqueeArea.vue';
import { elementDataOf } from '../../../../utils/element-data';

interface MarqueeElement extends HTMLElement {
	[k: string]: unknown;
	x: number;
	y: number;
	width: number;
	height: number;
	visible: boolean;
	scaleX: number;
	scaleY: number;
	select: (x: number, y: number, w: number, h: number) => void;
	clear: () => void;
	save: (name: string) => void;
	restore: (name: string) => void;
	resize: (size: { width: number; height: number }) => void;
	selection: Element | null;
}

describe('YMMarqueeArea', () => {
	it('mounts with selection hidden', () => {
		const wrapper = mount(YMMarqueeArea);
		expect(wrapper.element.classList.contains('marquee-area')).toBe(true);
		expect(wrapper.element.querySelector('.selection')).toBeTruthy();
		expect((wrapper.element.querySelector('.selection') as HTMLElement).style.display).toBe(
			'none'
		);
	});

	it('select shows selection with scaled coords', () => {
		const wrapper = mount(YMMarqueeArea);
		const vm = wrapper.vm as unknown as MarqueeElement;
		vm.select(10, 20, 30, 40);
		const sel = wrapper.element.querySelector('.selection') as HTMLElement;
		expect(sel.style.display).toBe('block');
		expect(sel.style.left).toBe('10px');
		expect(sel.style.top).toBe('20px');
		expect(sel.style.width).toBe('30px');
		expect(sel.style.height).toBe('40px');
		expect((wrapper.element as unknown as MarqueeElement).x).toBe(10);
		expect((wrapper.element as unknown as MarqueeElement).y).toBe(20);
		expect((wrapper.element as unknown as MarqueeElement).visible).toBe(true);
	});

	it('select applies scaleX/scaleY', () => {
		const wrapper = mount(YMMarqueeArea);
		const vm = wrapper.vm as unknown as MarqueeElement;
		(wrapper.element as unknown as MarqueeElement).scaleX = 0.5;
		(wrapper.element as unknown as MarqueeElement).scaleY = 2;
		vm.select(10, 10, 100, 100);
		const sel = wrapper.element.querySelector('.selection') as HTMLElement;
		expect(sel.style.left).toBe('5px');
		expect(sel.style.top).toBe('20px');
		expect(sel.style.width).toBe('50px');
		expect(sel.style.height).toBe('200px');
	});

	it('clear hides selection', () => {
		const wrapper = mount(YMMarqueeArea);
		const vm = wrapper.vm as unknown as MarqueeElement;
		vm.select(0, 0, 10, 10);
		vm.clear();
		expect((wrapper.element.querySelector('.selection') as HTMLElement).style.display).toBe(
			'none'
		);
		expect((wrapper.element as unknown as MarqueeElement).visible).toBe(false);
	});

	it('save and restore round-trip state', () => {
		const wrapper = mount(YMMarqueeArea);
		const vm = wrapper.vm as unknown as MarqueeElement;
		vm.select(5, 6, 7, 8);
		vm.save('area1');
		vm.select(50, 60, 70, 80);
		vm.restore('area1');
		expect((wrapper.element as unknown as MarqueeElement).x).toBe(5);
		expect((wrapper.element as unknown as MarqueeElement).y).toBe(6);
		expect((wrapper.element as unknown as MarqueeElement).width).toBe(7);
		expect((wrapper.element as unknown as MarqueeElement).height).toBe(8);
	});

	it('resize sets element size', () => {
		const wrapper = mount(YMMarqueeArea);
		const vm = wrapper.vm as unknown as MarqueeElement;
		vm.resize({ width: 300, height: 200 });
		expect(wrapper.element.style.width).toBe('300px');
		expect(wrapper.element.style.height).toBe('200px');
	});

	it('exposes state through element properties', () => {
		const wrapper = mount(YMMarqueeArea);
		const el = wrapper.element as unknown as MarqueeElement;
		el.scaleX = 3;
		expect((wrapper.element as unknown as MarqueeElement).scaleX).toBe(3);
		expect(typeof el.save).toBe('function');
		expect(typeof el.restore).toBe('function');
		expect(typeof el.resize).toBe('function');
		expect(typeof el.clear).toBe('function');
		expect(typeof el.select).toBe('function');
		// P4b：`selection` 是元素数据（WeakMap），不是组件实例属性
		expect(elementDataOf<{ selection: HTMLElement | null }>(el).selection).toBe(
			wrapper.element.querySelector('.selection')
		);
	});
});
