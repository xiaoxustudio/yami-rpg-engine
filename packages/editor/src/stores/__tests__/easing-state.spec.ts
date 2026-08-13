import { describe, expect, it } from 'vitest';
import { getEasingStore, easingStateKeys } from '@app/stores/easing';

describe('useEasingStore（Easing 窗口状态桥接）', () => {
	it('初始状态默认值', () => {
		const store = getEasingStore();
		expect(store.state).toBe('closed');
		expect(store.target).toBe(null);
		expect(store.data).toBe(null);
	});

	it('状态键完整（3 项）', () => {
		const store = getEasingStore();
		expect(easingStateKeys).toHaveLength(3);
		for (const key of easingStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('data 赋值读回', () => {
		const store = getEasingStore();
		store.data = [{ id: 'e1', key: '', name: 'Linear', points: [] }];
		expect(store.data?.[0].id).toBe('e1');
		expect(store.data?.[0].name).toBe('Linear');
		expect(store.data?.[0].points).toEqual([]);
		store.data = null;
		expect(store.data).toBe(null);
	});

	it('无 Easing 时 syncState 兜底默认值', () => {
		const store = getEasingStore();
		store.syncState();
		expect(store.state).toBe('closed');
		expect(store.target).toBe(null);
		expect(store.data).toBe(null);
	});
});
