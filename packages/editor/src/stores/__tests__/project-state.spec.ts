import { describe, expect, it } from 'vitest';
import { getProjectStore, projectStateKeys } from '@app/stores/project';

describe('useProjectStore（Project 窗口状态桥接）', () => {
	it('初始状态默认值', () => {
		const store = getProjectStore();
		expect(store.state).toBe('closed');
		expect(store.target).toBe(null);
		expect(store.data).toBe(null);
	});

	it('状态键完整（3 项）', () => {
		const store = getProjectStore();
		expect(projectStateKeys).toHaveLength(3);
		for (const key of projectStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('data 赋值读回', () => {
		const store = getProjectStore();
		store.data = {
			window: { title: 'YAMI' },
			localization: { languages: [{ name: 'zh', font: '', scale: 1 }] }
		};
		expect(store.data?.window.title).toBe('YAMI');
		expect(store.data?.localization.languages[0].name).toBe('zh');
		store.data = null;
		expect(store.data).toBe(null);
	});

	it('无 Project 时 syncState 兜底默认值', () => {
		const store = getProjectStore();
		store.syncState();
		expect(store.state).toBe('closed');
		expect(store.target).toBe(null);
		expect(store.data).toBe(null);
	});
});
