import { describe, expect, it } from 'vitest';
import { createScrollBarElement } from '../scroll-bar-api';

describe('createScrollBarElement', () => {
	it('creates scroll-bar and binds', () => {
		const el = createScrollBarElement() as any;
		expect(el.classList.contains('scroll-bar')).toBe(true);
		const target = document.createElement('div');
		el.bind(target, 'vertical');
		expect(el.target).toBe(target);
		expect(el.type).toBe('vertical');
		expect(el.thumb).toBeTruthy();
		expect(typeof el.updateVerticalBar).toBe('function');
		expect(typeof el.updateHorizontalBar).toBe('function');
	});

	it('updateDisplay toggles visible class', () => {
		const el = createScrollBarElement() as any;
		el.updateDisplay(true);
		expect(el.classList.contains('visible')).toBe(true);
		el.updateDisplay(false);
		expect(el.classList.contains('visible')).toBe(false);
	});

	it('updateVerticalBar shows/hides based on scroll', () => {
		const el = createScrollBarElement() as any;
		const target = document.createElement('div');
		target.style.cssText = 'width:100px;height:100px;overflow-y:auto;';
		const content = document.createElement('div');
		content.style.height = '300px';
		target.appendChild(content);
		document.body.appendChild(target);
		Object.defineProperty(target, 'clientHeight', { value: 100, configurable: true });
		Object.defineProperty(target, 'scrollHeight', { value: 300, configurable: true });
		el.bind(target, 'vertical');
		el.updateVerticalBar();
		expect(el.classList.contains('visible')).toBe(true);
		expect(parseFloat(el.thumb.style.height)).toBeGreaterThan(0);
		el.remove();
		target.remove();
	});
});
