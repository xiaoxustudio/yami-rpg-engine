import { describe, expect, it } from 'vitest';
import { addScrollbars } from '@app/utils/element-utils';
import { elementDataOf } from '@ui-kit';

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
		// P4b：滚动条的宿主（`target`）是**元素数据**（`scroll-bar-api.ts` 的 `data.target`），
		// 元素上不再有同名隐式属性——这里读元素数据（原先读 `hBar.target` 恒为 undefined）
		expect(elementDataOf<{ target?: HTMLElement | null }>(hBar).target).toBe(target);
		expect(elementDataOf<{ target?: HTMLElement | null }>(vBar).target).toBe(target);

		// 拖拽 vertical thumb → scrollTop 更新 + userscroll 派发（marquee 同步链）
		let userscrollCount = 0;
		target?.addEventListener?.('userscroll', () => userscrollCount++);
		const thumb = elementDataOf<{ thumb?: HTMLElement }>(vBar).thumb;
		const fire = (el: EventTarget, type: string, props: PointerEventInit) => {
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
		fire(thumb!, 'pointerdown', { clientX: 15, clientY: 20 });
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
		target.updateScrollbars();
		const hBar = parent.querySelector('.scroll-bar.horizontal')!;
		const vBar = parent.querySelector('.scroll-bar.vertical')!;
		expect(hBar.classList.contains('with-corner')).toBe(true);
		expect(vBar.classList.contains('with-corner')).toBe(true);
		expect(parent.querySelector('.scroll-corner')!.classList.contains('visible')).toBe(true);

		parent.remove();
	});
});
