import { describe, expect, it } from 'vitest';
import {
	hide,
	show,
	hideChildNodes,
	showChildNodes,
	seek,
	hasScrollBar,
	read,
	write
} from '@/util/element-utils';

describe('element-utils 低依赖工具（回归保护）', () => {
	it('hide/show toggles hidden class', () => {
		const el = document.createElement('div');
		hide(el);
		expect(el.classList.contains('hidden')).toBe(true);
		show(el);
		expect(el.classList.contains('hidden')).toBe(false);
	});

	it('hideChildNodes/showChildNodes toggles hidden class', () => {
		const el = document.createElement('div');
		const c1 = document.createElement('span');
		const c2 = document.createElement('span');
		el.appendChild(c1);
		el.appendChild(c2);
		hideChildNodes(el);
		expect(c1.classList.contains('hidden')).toBe(true);
		expect(c2.classList.contains('hidden')).toBe(true);
		showChildNodes(el);
		expect(c1.classList.contains('hidden')).toBe(false);
	});

	it('seek walks up to nth ancestor of tag', () => {
		const item = document.createElement('node-item');
		item.setAttribute('data-i', '0');
		const inner = document.createElement('div');
		item.appendChild(inner);
		const deep = document.createElement('span');
		inner.appendChild(deep);
		const found = seek(deep, 'node-item', 2);
		expect(found).toBe(item);
	});

	it('hasScrollBar detects overflow', () => {
		const el = document.createElement('div');
		Object.defineProperty(el, 'clientWidth', { value: 100, configurable: true });
		Object.defineProperty(el, 'clientHeight', { value: 100, configurable: true });
		Object.defineProperty(el, 'scrollWidth', { value: 100, configurable: true });
		Object.defineProperty(el, 'scrollHeight', { value: 200, configurable: true });
		expect(hasScrollBar(el)).toBe(true);
	});

	it('read/write use el.read/write or dataValue', () => {
		const el: any = document.createElement('div');
		el.dataValue = 42;
		expect(read(el)).toBe(42);
		write(el, 99);
		expect(el.dataValue).toBe(99);

		const el2: any = document.createElement('div');
		el2.write = (v: any) => {
			el2._v = v;
		};
		write(el2, 'x');
		expect(el2._v).toBe('x');
	});
});
