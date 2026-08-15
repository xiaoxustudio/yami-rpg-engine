import { describe, expect, it } from 'vitest';
import { getLocalStore, localStateKeys } from '@app/stores/local';
import { Local } from '@/tools/localization.ts';

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

	it('legacy 写入经 store 生效（store 为源）', () => {
		const store = getLocalStore();
		Local.language = 'zh-CN';
		expect(store.language).toBe('zh-CN');
		Local.language = 'en';
		expect(store.language).toBe('en');
		Local.active = 'zh-CN.json';
		expect(store.active).toBe('zh-CN.json');
		Local.active = null as unknown as string;
		expect(store.active).toBe(null);
		Local.languages = [{ key: 'zh-CN', alias: '简体中文', filename: 'zh-CN.json' }];
		expect(store.languages[0].key).toBe('zh-CN');
		Local.languages = [];
		expect(store.languages).toEqual([]);
	});

	it('store 写入经桥反向可读（外部 legacy 读取兼容）', () => {
		const store = getLocalStore();
		store.language = 'zh-TW';
		expect(Local.language).toBe('zh-TW');
		store.language = 'en';
		expect(Local.language).toBe('en');
		store.active = 'zh-TW.json';
		expect(Local.active).toBe('zh-TW.json');
		store.active = null;
		expect(Local.active).toBe(null);
	});
});
