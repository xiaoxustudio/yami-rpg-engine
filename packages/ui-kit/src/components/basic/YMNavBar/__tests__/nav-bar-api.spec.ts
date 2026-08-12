import { describe, expect, it } from 'vitest';
import { createNavBarElement } from '../nav-bar-api';
import type { NavBarApi } from '../nav-bar-api';

describe('createNavBarElement', () => {
	it('creates nav-bar', () => {
		const el = createNavBarElement() as unknown as NavBarApi;
		expect(el.classList.contains('nav-bar')).toBe(true);
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.unselect).toBe('function');
		expect(typeof el.on).toBe('function');
	});

	it('write selects matching nav-item', () => {
		const el = createNavBarElement() as unknown as NavBarApi;
		const a = document.createElement('div');
		a.className = 'nav-item';
		a.setAttribute('value', 'a');
		const b = document.createElement('div');
		b.className = 'nav-item';
		b.setAttribute('value', 'b');
		el.appendChild(a);
		el.appendChild(b);
		el.write('b');
		expect(b.classList.contains('selected')).toBe(true);
		expect(a.classList.contains('selected')).toBe(false);
		expect(el.read()).toBe('b');
	});

	it('pointerdown selects item', () => {
		const el = createNavBarElement() as unknown as NavBarApi;
		const a = document.createElement('div');
		a.className = 'nav-item';
		a.setAttribute('value', 'a');
		el.appendChild(a);
		a.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
		expect(el.read()).toBe('a');
		expect(a.classList.contains('selected')).toBe(true);
	});
});
