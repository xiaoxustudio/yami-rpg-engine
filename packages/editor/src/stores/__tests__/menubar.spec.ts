import { describe, expect, it } from 'vitest';
import { getMenubarStore, menubarStateKeys } from '@app/stores/menubar';
import { Menubar } from '@app/title/menu-bar.ts';

describe('useMenubarStore（Menubar 状态反转：store 为源）', () => {
	it('初始状态默认值', () => {
		const store = getMenubarStore();
		expect(store.state).toBe('closed');
	});

	it('状态键完整（1 项）', () => {
		const store = getMenubarStore();
		expect(menubarStateKeys).toHaveLength(1);
		for (const key of menubarStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('legacy 写入经 store 生效（store 为源）', () => {
		const store = getMenubarStore();
		Menubar.state = 'open';
		expect(store.state).toBe('open');
		Menubar.state = 'closed';
		expect(store.state).toBe('closed');
	});

	it('store 写入经桥反向可读（外部 legacy 读取兼容）', () => {
		const store = getMenubarStore();
		store.state = 'open';
		expect(Menubar.state).toBe('open');
		store.state = 'closed';
		expect(Menubar.state).toBe('closed');
	});
});
