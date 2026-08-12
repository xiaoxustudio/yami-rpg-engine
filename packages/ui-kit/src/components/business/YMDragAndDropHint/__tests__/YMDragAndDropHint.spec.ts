import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMDragAndDropHint from '../YMDragAndDropHint.vue';
import { createDragAndDropHintElement } from '../drag-and-drop-hint-api';
import type { DragAndDropHintApi } from '../drag-and-drop-hint-api';

describe('YMDragAndDropHint', () => {
	it('mounts with api on element', () => {
		const wrapper = mount(YMDragAndDropHint);
		expect(wrapper.element.classList.contains('drag-and-drop-hint')).toBe(true);
		const el = wrapper.element as unknown as DragAndDropHintApi;
		expect(typeof el.measure).toBe('function');
		expect(typeof el.moveUp).toBe('function');
		expect(typeof el.moveDown).toBe('function');
		expect(typeof el.set).toBe('function');
	});

	it('set applies coordinates', () => {
		const wrapper = mount(YMDragAndDropHint);
		const el = wrapper.element as unknown as DragAndDropHintApi;
		el.set({ left: 10, top: 20, width: 30, height: 40 });
		expect(el.style.left).toBe('10px');
		expect(el.style.top).toBe('20px');
		expect(el.style.width).toBe('30px');
		expect(el.style.height).toBe('40px');
		expect(el.left).toBe(10);
		expect(el.top).toBe(20);
	});

	it('set skips unchanged coords', () => {
		const wrapper = mount(YMDragAndDropHint);
		const el = wrapper.element as unknown as DragAndDropHintApi;
		el.set({ left: 10, top: 20, width: 30, height: 40 });
		el.set({ left: 10, top: 20, width: 30, height: 40 });
		expect(el.style.left).toBe('10px');
	});

	it('moveUp and moveDown toggle z-index', () => {
		const wrapper = mount(YMDragAndDropHint);
		const el = wrapper.element as unknown as DragAndDropHintApi;
		el.moveUp();
		expect(el.upper).toBe(true);
		expect(el.style.zIndex).toBe('1');
		el.moveDown();
		expect(el.upper).toBe(false);
		expect(el.style.zIndex).toBe('');
	});

	it('measure computes coords relative to parent', () => {
		const wrapper = mount(YMDragAndDropHint, { attachTo: document.body });
		const el = wrapper.element as unknown as DragAndDropHintApi;
		const parent = document.createElement('div');
		parent.style.cssText =
			'position:relative;border-left:2px solid black;border-top:3px solid black;';
		parent.appendChild(el);
		document.body.appendChild(parent);
		const item = document.createElement('div');
		parent.appendChild(item);
		Object.defineProperty(parent, 'getBoundingClientRect', {
			value: () => ({ left: 100, top: 50, width: 300, height: 200 }),
			configurable: true
		});
		Object.defineProperty(item, 'getBoundingClientRect', {
			value: () => ({ left: 115, top: 75, width: 50, height: 20 }),
			configurable: true
		});
		const coords = el.measure(item);
		expect(coords.left).toBe(13);
		expect(coords.top).toBe(22);
		expect(coords.width).toBe(50);
		expect(coords.height).toBe(20);
		parent.remove();
	});

	it('createDragAndDropHintElement returns attached div', () => {
		const el = createDragAndDropHintElement();
		expect(el.classList.contains('drag-and-drop-hint')).toBe(true);
		expect(typeof el.measure).toBe('function');
		expect(typeof el.set).toBe('function');
	});
});
