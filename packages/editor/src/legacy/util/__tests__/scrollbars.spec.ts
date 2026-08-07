import { describe, expect, it } from 'vitest';
import { addScrollbars } from '@/util/element-utils';

describe('addScrollbars 集成（9.45-9.48 回归保护）', () => {
	it('creates horizontal/vertical scroll bars bound to target', () => {
		const target = document.createElement('div');
		target.style.cssText = 'width:200px;height:200px;overflow:auto;position:relative;';
		const content = document.createElement('div');
		content.style.cssText = 'width:600px;height:600px;';
		target?.appendChild?.(content);
		const parent = document.createElement('div');
		parent.appendChild(target);
		document.body.appendChild(parent);

		Object.defineProperty(target, 'clientWidth', { value: 200, configurable: true });
		Object.defineProperty(target, 'clientHeight', { value: 200, configurable: true });
		Object.defineProperty(target, 'scrollWidth', { value: 600, configurable: true });
		Object.defineProperty(target, 'scrollHeight', { value: 600, configurable: true });

		addScrollbars(target);

		const hBar = parent.querySelector('.scroll-bar.horizontal');
		const vBar = parent.querySelector('.scroll-bar.vertical');
		expect(hBar).toBeTruthy();
		expect(vBar).toBeTruthy();
		expect((hBar as any).target).toBe(target);
		expect((vBar as any).target).toBe(target);

		// 拖拽 vertical thumb → scrollTop 更新 + userscroll 派发（marquee 同步链）
		let userscrollCount = 0;
		target?.addEventListener?.('userscroll', () => userscrollCount++);
		const thumb = (vBar as any).thumb;
		const fire = (el: any, type: string, props: any) => {
			const ev = new PointerEvent(type, {
				bubbles: true,
				cancelable: true,
				button: 0,
				pointerId: 1,
				...props
			});
			el.dispatchEvent(ev);
			return ev;
		};
		fire(thumb, 'pointerdown', { clientX: 15, clientY: 20 });
		fire(window, 'pointermove', { clientX: 15, clientY: 80, pointerId: 1 });
		expect(target.scrollTop).toBeGreaterThan(0);
		expect(userscrollCount).toBeGreaterThan(0);
		fire(window, 'pointerup', { clientX: 15, clientY: 80, pointerId: 1 });

		parent.remove();
	});

	it('updateScrollbars toggles with-corner and visible', () => {
		const target = document.createElement('div');
		const parent = document.createElement('div');
		parent.appendChild(target);
		document.body.appendChild(parent);
		Object.defineProperty(target, 'clientWidth', { value: 100, configurable: true });
		Object.defineProperty(target, 'clientHeight', { value: 100, configurable: true });
		Object.defineProperty(target, 'scrollWidth', { value: 300, configurable: true });
		Object.defineProperty(target, 'scrollHeight', { value: 300, configurable: true });

		addScrollbars(target);
		(target as any).updateScrollbars();
		const hBar = parent.querySelector('.scroll-bar.horizontal');
		const vBar = parent.querySelector('.scroll-bar.vertical');
		expect(hBar.classList.contains('with-corner')).toBe(true);
		expect(vBar.classList.contains('with-corner')).toBe(true);
		expect(parent.querySelector('scroll-corner').classList.contains('visible')).toBe(true);

		parent.remove();
	});
});
