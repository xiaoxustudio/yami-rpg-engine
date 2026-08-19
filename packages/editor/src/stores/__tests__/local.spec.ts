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
	});

	it('状态键完整（3 项）', () => {
		const store = getLocalStore();
		expect(localStateKeys).toHaveLength(3);
		for (const key of localStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('setLanguage/setActive/setLanguages 读写', () => {
		const store = getLocalStore();
		store.setLanguage('zh-CN');
		expect(store.language).toBe('zh-CN');
		store.setActive('zh-CN.json');
		expect(store.active).toBe('zh-CN.json');
		store.setLanguages([{ key: 'zh-CN', alias: '简体中文', filename: 'zh-CN.json' }]);
		expect(store.languages[0].key).toBe('zh-CN');
		store.setLanguage('en');
		store.setActive(null);
		store.setLanguages([]);
	});
});
