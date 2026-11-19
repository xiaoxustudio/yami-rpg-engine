import { describe, expect, it } from 'vitest';
import { getElementApi } from '../../../../utils/element-apis';
import { createNavBarElement } from '../nav-bar-api';
import type { NavBarApi } from '../nav-bar-api';

describe('createNavBarElement', () => {
	it('creates nav-bar', () => {
		const el = createNavBarElement();
		const api = getElementApi<NavBarApi>(el)!;
		expect(el.classList.contains('nav-bar')).toBe(true);
		// 方法只在旁表里
		expect(typeof (el as unknown as { read?: unknown }).read).toBe('undefined');
		expect(typeof api.read).toBe('function');
		expect(typeof api.write).toBe('function');
		expect(typeof api.unselect).toBe('function');
		expect(typeof api.on).toBe('function');
	});

	it('write selects matching nav-item', () => {
		const el = createNavBarElement();
		const api = getElementApi<NavBarApi>(el)!;
		const a = document.createElement('div');
		a.className = 'nav-item';
		a.setAttribute('value', 'a');
		const b = document.createElement('div');
		b.className = 'nav-item';
		b.setAttribute('value', 'b');
		el.appendChild(a);
		el.appendChild(b);
		api.write('b');
		expect(b.classList.contains('selected')).toBe(true);
		expect(a.classList.contains('selected')).toBe(false);
		expect(api.read()).toBe('b');
	});

	it('pointerdown selects item', () => {
		const el = createNavBarElement();
		const api = getElementApi<NavBarApi>(el)!;
		const a = document.createElement('div');
		a.className = 'nav-item';
		a.setAttribute('value', 'a');
		el.appendChild(a);
		a.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
		expect(api.read()).toBe('a');
		expect(a.classList.contains('selected')).toBe(true);
	});

	it('unselect 清掉全部 selected（不只第一个）', () => {
		const el = createNavBarElement();
		const api = getElementApi<NavBarApi>(el)!;
		const a = document.createElement('div');
		a.className = 'nav-item selected';
		a.setAttribute('value', 'a');
		const b = document.createElement('div');
		b.className = 'nav-item selected';
		b.setAttribute('value', 'b');
		el.append(a, b);

		api.unselect();

		expect(el.querySelectorAll('.selected')).toHaveLength(0);
	});

	it('页签晚于 write 到达（Teleport）：按当前值重放选中，残留被清掉', async () => {
		const el = createNavBarElement();
		const api = getElementApi<NavBarApi>(el)!;
		const a = document.createElement('div');
		a.className = 'nav-item';
		a.setAttribute('value', 'a');
		el.appendChild(a);
		api.write('a');

		const stale = document.createElement('div');
		stale.className = 'nav-item selected';
		stale.setAttribute('value', 'b');
		el.appendChild(stale);
		await Promise.resolve();

		expect(el.querySelectorAll('.selected')).toHaveLength(1);
		expect(a.classList.contains('selected')).toBe(true);
		expect(stale.classList.contains('selected')).toBe(false);
	});
});
