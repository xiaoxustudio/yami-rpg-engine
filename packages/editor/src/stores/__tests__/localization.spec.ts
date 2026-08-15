import { describe, expect, it } from 'vitest';
import { getLocalizationStore, localizationStateKeys } from '@app/stores/localization';
import { Localization } from '@/local/local-window.ts';

describe('useLocalizationStore（Localization 状态反转：store 为源）', () => {
	it('初始状态默认值', () => {
		const store = getLocalizationStore();
		expect(store.state).toBe('closed');
		expect(store.strings).toEqual({});
	});

	it('状态键完整（2 项）', () => {
		const store = getLocalizationStore();
		expect(localizationStateKeys).toHaveLength(2);
		for (const key of localizationStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
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
