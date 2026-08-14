import { describe, expect, it } from 'vitest';
import { getSearchStringStore, searchStringStateKeys } from '@app/stores/searchString';

describe('useSearchStringStore（SearchString 搜索状态桥接）', () => {
	it('初始状态默认值', () => {
		const store = getSearchStringStore();
		expect(store.index).toBe(0);
		expect(store.searchMode).toEqual({
			caseInsensitive: false,
			regex: false,
			matchLine: false
		});
	});

	it('状态键完整（2 项）', () => {
		const store = getSearchStringStore();
		expect(searchStringStateKeys).toHaveLength(2);
		for (const key of searchStringStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('字段直接赋值读回', () => {
		const store = getSearchStringStore();
		store.index = 3;
		expect(store.index).toBe(3);
		store.searchMode = { caseInsensitive: true, regex: false, matchLine: true };
		expect(store.searchMode).toEqual({
			caseInsensitive: true,
			regex: false,
			matchLine: true
		});
		store.index = 0;
		store.searchMode = { caseInsensitive: false, regex: false, matchLine: false };
	});

	it('无 SearchString 时 syncState 兜底默认值', () => {
		const store = getSearchStringStore();
		store.syncState();
		expect(store.index).toBe(0);
		expect(store.searchMode).toEqual({
			caseInsensitive: false,
			regex: false,
			matchLine: false
		});
	});
});
