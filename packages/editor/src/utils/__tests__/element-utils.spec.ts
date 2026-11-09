import { describe, expect, it, vi } from 'vitest';
import {
	hide,
	show,
	hideChildNodes,
	showChildNodes,
	seek,
	hasScrollBar,
	read,
	write,
	addClass,
	removeClass,
	hasClass,
	on
} from '@app/utils/element-utils';

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
		const item = document.createElement('div');
		item.classList.add('node-item');
		item.setAttribute('data-i', '0');
		const inner = document.createElement('div');
		item.appendChild(inner);
		const deep = document.createElement('span');
		inner.appendChild(deep);
		const found = seek(deep, '.node-item', 2);
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
		const el = document.createElement('div') as HTMLElement & { dataValue?: unknown };
		el.dataValue = 42;
		expect(read(el)).toBe(42);
		write(el, 99);
		expect(el.dataValue).toBe(99);

		const el2 = document.createElement('div') as HTMLElement & {
			_v?: unknown;
			write?: (v: unknown) => void;
		};
		el2.write = (v: unknown) => {
			el2._v = v;
		};
		write(el2, 'x');
		expect(el2._v).toBe('x');
	});

	it('addClass/removeClass/hasClass（含无 classList 节点保护——9.80 回归）', () => {
		const el = document.createElement('div');
		addClass(el, 'a');
		expect(hasClass(el, 'a')).toBe(true);
		removeClass(el, 'a');
		expect(hasClass(el, 'a')).toBe(false);
		addClass(el, 'a');
		addClass(el, 'b');
		expect(hasClass(el, 'b')).toBe(true);
		const text = document.createTextNode('x');
		expect(hasClass(text as unknown as HTMLElement, 'a')).toBe(false);
		expect(() => addClass(text as unknown as HTMLElement, 'a')).not.toThrow();
	});

	it('hasScrollBar 无滚动（scrollWidth === clientWidth）', () => {
		const el = document.createElement('div');
		Object.defineProperty(el, 'clientWidth', { value: 100, configurable: true });
		Object.defineProperty(el, 'clientHeight', { value: 100, configurable: true });
		Object.defineProperty(el, 'scrollWidth', { value: 100, configurable: true });
		Object.defineProperty(el, 'scrollHeight', { value: 100, configurable: true });
		expect(hasScrollBar(el)).toBe(false);
	});

	it('组件实例（defineExpose 的 root）解析到根元素：show/hide/addClass 不再静默失败', () => {
		const el = document.createElement('div');
		const control = { root: el };
		hide(control);
		expect(el.classList.contains('hidden')).toBe(true);
		show(control);
		expect(el.classList.contains('hidden')).toBe(false);
		expect(addClass(control, 'x')).toBe(true);
		expect(hasClass(control, 'x')).toBe(true);
		expect(removeClass(control, 'x')).toBe(true);
	});

	it('on 从组件实例解析根元素；解析不到时不抛错', () => {
		const el = document.createElement('div');
		const listener = vi.fn();
		on({ root: el }, 'click', listener);
		el.dispatchEvent(new Event('click'));
		expect(listener).toHaveBeenCalledTimes(1);

		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(() => on({} as never, 'click', listener)).not.toThrow();
		spy.mockRestore();
	});
});
