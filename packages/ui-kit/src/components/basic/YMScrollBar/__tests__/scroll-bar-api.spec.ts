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

	it('drag dispatches userscroll on target（9.48 回归——marquee 同步链）', () => {
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

		let userscrollCount = 0;
		target.addEventListener('userscroll', () => userscrollCount++);

		const fire = (el2: any, type: string, props: any) => {
			const ev = new PointerEvent(type, {
				bubbles: true,
				cancelable: true,
				button: 0,
				pointerId: 3,
				...props
			});
			el2.dispatchEvent(ev);
			return ev;
		};
		fire(el.thumb, 'pointerdown', { clientX: 5, clientY: 10 });
		fire(window, 'pointermove', { clientX: 5, clientY: 50, pointerId: 3 });
		expect(target.scrollTop).toBeGreaterThan(0);
		expect(userscrollCount).toBeGreaterThan(0);
		fire(window, 'pointerup', { clientX: 5, clientY: 50, pointerId: 3 });

		el.remove();
		target.remove();
	});

	it('drag works when bar size is 0 (denom fallback——9.46 回归)', () => {
		const el = createScrollBarElement() as any;
		const target = document.createElement('div');
		target.style.cssText = 'width:100px;height:100px;overflow-y:auto;';
		const content = document.createElement('div');
		content.style.height = '300px';
		target.appendChild(content);
		document.body.appendChild(target);
		Object.defineProperty(target, 'clientHeight', { value: 100, configurable: true });
		Object.defineProperty(target, 'scrollHeight', { value: 300, configurable: true });
		el.style.cssText = 'width:0;height:0;';
		el.bind(target, 'vertical');
		el.updateVerticalBar();

		const fire = (el2: any, type: string, props: any) => {
			const ev = new PointerEvent(type, {
				bubbles: true,
				cancelable: true,
				button: 0,
				pointerId: 4,
				...props
			});
			el2.dispatchEvent(ev);
			return ev;
		};
		fire(el.thumb, 'pointerdown', { clientX: 5, clientY: 10 });
		fire(window, 'pointermove', { clientX: 5, clientY: 50, pointerId: 4 });
		expect(target.scrollTop).toBeGreaterThan(0);
		fire(window, 'pointerup', { clientX: 5, clientY: 50, pointerId: 4 });

		el.remove();
		target.remove();
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
