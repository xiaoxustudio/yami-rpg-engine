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

	// 回归（实机「点哪个页签都同时显示 active」）：页签由整壳 Teleport 在分组间搬运，
	// 搬进来的页签带着旧组的 `selected`；旧 `unselect` 用 `querySelector('.selected')` 只清第一个，
	// 残留 + 新选中会同时亮。
	it('unselect 清掉全部 selected（不只第一个）', () => {
		const el = createNavBarElement() as unknown as NavBarApi;
		const a = document.createElement('div');
		a.className = 'nav-item selected';
		a.setAttribute('value', 'a');
		const b = document.createElement('div');
		b.className = 'nav-item selected';
		b.setAttribute('value', 'b');
		el.append(a, b);

		el.unselect();

		expect(el.querySelectorAll('.selected')).toHaveLength(0);
	});

	it('页签晚于 write 到达（Teleport）：按当前值重放选中，残留被清掉', async () => {
		const el = createNavBarElement() as unknown as NavBarApi;
		const a = document.createElement('div');
		a.className = 'nav-item';
		a.setAttribute('value', 'a');
		el.appendChild(a);
		el.write('a');

		// 搬进来的页签带着旧组的 selected
		const stale = document.createElement('div');
		stale.className = 'nav-item selected';
		stale.setAttribute('value', 'b');
		el.appendChild(stale);
		await Promise.resolve(); // MutationObserver 走微任务

		expect(el.querySelectorAll('.selected')).toHaveLength(1);
		expect(a.classList.contains('selected')).toBe(true);
		expect(stale.classList.contains('selected')).toBe(false);
	});
});
