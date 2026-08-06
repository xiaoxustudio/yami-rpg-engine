import { describe, expect, it, vi } from 'vitest';
import { createPageManagerElement, attachPageManagerApi } from '../page-manager-api';
import { createToastManagerElement } from '../../YMToastManager/toast-api';

describe('createPageManagerElement', () => {
	it('switches visible page-frame', () => {
		const el = createPageManagerElement() as any;
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
});

describe('createToastManagerElement', () => {
	it('shows and dismisses toast', () => {
		vi.useFakeTimers();
		const el = createToastManagerElement() as any;
		const toast = el.show('hello');
		expect(toast.classList.contains('toast-info')).toBe(true);
		expect(toast.querySelector('.toast-text').textContent).toBe('hello');
		el.dismiss(toast);
		expect(toast.parentNode).toBe(el);
		vi.runAllTimers();
		expect(toast.parentNode).toBeNull();
		vi.useRealTimers();
	});
});
