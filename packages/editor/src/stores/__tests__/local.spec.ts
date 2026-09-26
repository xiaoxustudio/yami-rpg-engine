import { describe, expect, it } from 'vitest';
import { getLocalStore, localStateKeys } from '@app/stores/local';

describe('useLocalStore（Local 状态反转：store 为源）', () => {
	it('初始状态默认值', () => {
		const store = getLocalStore();
		expect(store.language).toBe('en');
		expect(store.active).toBe(null);
		expect(store.languages).toEqual([]);
		expect(store.properties).toEqual({});
		expect(store.components).toEqual({});
		// ready：语言资源就绪标志（主菜单可见性由它驱动）
		expect(store.ready).toBe(false);
	});

	it('状态键完整（4 项）', () => {
		const store = getLocalStore();
		expect(localStateKeys).toHaveLength(4);
		for (const key of localStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('setLanguage/setActive/setLanguages/setReady 读写', () => {
		const store = getLocalStore();
		store.setLanguage('zh-CN');
		expect(store.language).toBe('zh-CN');
		store.setActive('zh-CN.json');
		expect(store.active).toBe('zh-CN.json');
		store.setLanguages([{ key: 'zh-CN', alias: '简体中文', filename: 'zh-CN.json' }]);
		expect(store.languages[0].key).toBe('zh-CN');
		store.setReady(true);
		expect(store.ready).toBe(true);
		store.setLanguage('en');
		store.setActive(null);
		store.setLanguages([]);
		store.setReady(false);
	});
});
