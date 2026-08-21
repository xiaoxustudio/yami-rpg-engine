import { describe, expect, it } from 'vitest';
import { getEasingStore, easingStateKeys } from '@app/stores/easing';
import { Easing } from '@app/data/transition-window.ts';

describe('useEasingStore（Easing 窗口状态反转：store 为源）', () => {
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

	it('legacy 写入经 store 生效（store 为源）', () => {
		const store = getEasingStore();
		const legacy = Easing as unknown as Record<string, any>;
		legacy.state = 'open';
		expect(store.state).toBe('open');
		legacy.target = { guid: 't1' };
		expect(store.target).toEqual({ guid: 't1' });
		legacy.data = [{ id: 'e1', key: '', name: 'Linear', points: [] }];
		expect(store.data?.[0].id).toBe('e1');
		legacy.state = 'closed';
		legacy.target = null;
		legacy.data = null;
		expect(store.state).toBe('closed');
		expect(store.target).toBe(null);
		expect(store.data).toBe(null);
	});

	it('store 写入经桥反向可读（外部 legacy 读取兼容）', () => {
		const store = getEasingStore();
		const legacy = Easing as unknown as Record<string, any>;
		store.state = 'open';
		expect(legacy.state).toBe('open');
		store.data = [{ id: 'e2', key: 'k', name: 'EaseOut', points: [] }];
		expect(legacy.data?.[0].name).toBe('EaseOut');
		store.state = 'closed';
		store.data = null;
		expect(legacy.state).toBe('closed');
		expect(legacy.data).toBe(null);
	});
});
