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
		el.switch('a');
		p2.classList.add('visible');

		el.switch('a');

		expect(p1.classList.contains('visible')).toBe(true);
		expect(p2.classList.contains('visible')).toBe(false);

		el.switch('b');
		expect(p1.classList.contains('visible')).toBe(false);
		expect(p2.classList.contains('visible')).toBe(true);
		expect(p1.classList.contains('visible')).toBe(false);
	});

	it('页框晚于激活写入到达（Teleport）：按当前 index 重新解析并归一化', async () => {
		const el = createPageManagerElement() as unknown as PageManagerApi;
		el.switch('late');
		const arrived = document.createElement('div');
		arrived.className = 'page-frame visible';
		arrived.setAttribute('value', 'late');
		el.appendChild(arrived);
		await Promise.resolve();

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
