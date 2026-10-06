import { describe, expect, it } from 'vitest';
import { getLocalizationStore, localizationStateKeys } from '@app/stores/localization';
import { Localization } from '@app/local/local-window.ts';

describe('useLocalizationStore（Localization 状态反转：store 为源）', () => {
	it('初始状态默认值', () => {
		const store = getLocalizationStore();
		expect(store.state).toBe('closed');
		expect(store.strings).toEqual({});
	});

	it('状态键完整（7 项：state/strings + 本批升上来的 5 个）', () => {
		const store = getLocalizationStore();
		expect(localizationStateKeys).toHaveLength(7);
		for (const key of localizationStateKeys) {
			expect(key in store, String(key)).toBe(true);
			// 每个键都必须在单例上装了桥（getter/setter），否则「store 为源」是假象
			const descriptor = Object.getOwnPropertyDescriptor(Localization, key);
			expect(typeof descriptor?.get, String(key)).toBe('function');
			expect(typeof descriptor?.set, String(key)).toBe('function');
		}
	});

	it('新升的 5 个键：单例写入 → store 可见，store 写入 → 单例可读', () => {
		const store = getLocalizationStore();
		const items = [{ name: 'a' }];
		Localization.data = items;
		Localization.languages = ['en', 'zh'];
		Localization.changed = true;
		expect(store.data).toBe(items);
		expect(store.languages).toEqual(['en', 'zh']);
		expect(store.changed).toBe(true);

		store.data = null;
		store.languages = null;
		store.changed = false;
		expect(Localization.data).toBeNull();
		expect(Localization.languages).toBeNull();
		expect(Localization.changed).toBe(false);
	});

	it('legacy 写入经 store 生效（store 为源）', () => {
		const store = getLocalizationStore();
		Localization.state = 'open';
		expect(store.state).toBe('open');
		Localization.state = 'closed';
		expect(store.state).toBe('closed');
	});

	it('store 写入经桥反向可读（外部 legacy 读取兼容）', () => {
		const store = getLocalizationStore();
		store.state = 'open';
		expect(Localization.state).toBe('open');
		store.state = 'closed';
		expect(Localization.state).toBe('closed');
	});
});
