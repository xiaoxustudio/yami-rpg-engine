import { describe, expect, it, vi } from 'vitest';
import { createPageManagerElement, attachPageManagerApi } from '../page-manager-api';
import type { PageManagerApi } from '../page-manager-api';
import { createToastManagerElement } from '../../YMToastManager/toast-api';
import type { ToastManagerApi } from '../../YMToastManager/toast-api';

describe('createPageManagerElement', () => {
	it('switches visible page-frame', () => {
		const el = createPageManagerElement() as unknown as PageManagerApi;
		const p1 = document.createElement('div');
		p1.className = 'page-frame';
		p1.setAttribute('value', 'a');
		const p2 = document.createElement('div');
		p2.className = 'page-frame';
		p2.setAttribute('value', 'b');
		el.appendChild(p1);
		el.appendChild(p2);
		el.switch('b');
		expect(p1.classList.contains('visible')).toBe(false);
		expect(p2.classList.contains('visible')).toBe(true);
		expect(el.index).toBe('b');
		expect(el.active).toBe(p2);
	});

	it('removes non page-frame children on attach', () => {
		const el = document.createElement('div');
		const junk = document.createElement('div');
		el.appendChild(junk);
		attachPageManagerApi(el);
		expect(junk.parentNode).toBeNull();
	});

	// 回归（实机：页签/页框由整壳 Teleport 在分组间搬运）：搬进来的页框带着**旧组的** `visible`，
	// 旧实现只清「自己记着的那个 active」⇒ 第二个 `.visible` 永远留着，两个 `inset:0` 的页完全
	// 叠在一起、DOM 序靠后的盖在上面（看到的永远是另一个面板）。
	it('switch 清掉全部残留 visible（不只自己记着的那个）', () => {
		const el = createPageManagerElement() as unknown as PageManagerApi;
		const p1 = document.createElement('div');
		p1.className = 'page-frame visible';
		p1.setAttribute('value', 'a');
		const p2 = document.createElement('div');
		p2.className = 'page-frame';
		p2.setAttribute('value', 'b');
		el.appendChild(p1);
		el.appendChild(p2);
		el.switch('a'); // active = p1
		// 模拟搬运带来的旧组残留：第二个页框也带着 visible
		p2.classList.add('visible');

		el.switch('a'); // index 未变（旧实现整段被 `last !== value` 挡住，什么都不做）

		expect(p1.classList.contains('visible')).toBe(true);
		expect(p2.classList.contains('visible')).toBe(false);

		el.switch('b');
		expect(p1.classList.contains('visible')).toBe(false);
		expect(p2.classList.contains('visible')).toBe(true);
		expect(p1.classList.contains('visible')).toBe(false);
	});

	it('页框晚于激活写入到达（Teleport）：按当前 index 重新解析并归一化', async () => {
		const el = createPageManagerElement() as unknown as PageManagerApi;
		el.switch('late'); // 目标页还没搬进来：index 记下、active 仍是 null
		const arrived = document.createElement('div');
		arrived.className = 'page-frame visible';
		arrived.setAttribute('value', 'late');
		el.appendChild(arrived); // 到达
		await Promise.resolve(); // MutationObserver 走微任务

		expect(el.active).toBe(arrived);
		expect(arrived.classList.contains('visible')).toBe(true);
		expect(el.querySelectorAll('.page-frame.visible')).toHaveLength(1);
	});
});

describe('createToastManagerElement', () => {
	it('shows and dismisses toast', () => {
		vi.useFakeTimers();
		const el = createToastManagerElement() as unknown as ToastManagerApi;
		const toast = el.show('hello');
		expect(toast.classList.contains('toast-info')).toBe(true);
		expect(toast.querySelector('.toast-text')!.textContent).toBe('hello');
		el.dismiss(toast);
		expect(toast.parentNode).toBe(el);
		vi.runAllTimers();
		expect(toast.parentNode).toBeNull();
		vi.useRealTimers();
	});
});
