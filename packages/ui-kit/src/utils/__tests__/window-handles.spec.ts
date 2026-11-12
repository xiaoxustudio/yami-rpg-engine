import { describe, expect, it } from 'vitest';
import { clearWindowHandle, getWindowHandle, setWindowHandle } from '../window-handles';

describe('window-handles（按窗口 id 的能力句柄表）', () => {
	it('set 后能按 id 取回，clear 只清自己那一份', () => {
		const root = document.createElement('div');
		const handle = { root, open: () => {} };
		setWindowHandle('a', handle);
		expect(getWindowHandle('a')).toBe(handle);
		// 别家登记的同名句柄不会误清
		clearWindowHandle('a', { root: null });
		expect(getWindowHandle('a')).toBe(handle);
		clearWindowHandle('a', handle);
		expect(getWindowHandle('a')).toBeNull();
	});

	it('空 id 不登记（匿名窗口不进表）', () => {
		const handle = { root: null };
		setWindowHandle('', handle);
		expect(getWindowHandle('')).toBeNull();
	});
});
