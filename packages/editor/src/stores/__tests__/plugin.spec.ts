import { describe, expect, it } from 'vitest';
import { getPluginStore, pluginStateKeys } from '@app/stores/plugin';
import { PluginManager } from '@app/legacy/plugin/plugin.ts';

describe('usePluginStore（PluginManager 状态反转：store 为源）', () => {
	it('初始状态默认值', () => {
		const store = getPluginStore();
		expect(store.plugins).toEqual([]);
	});

	it('状态键完整（1 项）', () => {
		const store = getPluginStore();
		expect(pluginStateKeys).toHaveLength(1);
		for (const key of pluginStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('字段直接赋值读回', () => {
		const store = getPluginStore();
		store.plugins = [{ id: 'p1', enabled: true }];
		expect(store.plugins).toEqual([{ id: 'p1', enabled: true }]);
		store.plugins = [];
	});

	it('legacy 写入经 store 生效（store 为源）', () => {
		const store = getPluginStore();
		PluginManager.plugins = [{ id: 'p1', enabled: true }];
		expect(store.plugins).toEqual([{ id: 'p1', enabled: true }]);
		PluginManager.plugins = [];
		expect(store.plugins).toEqual([]);
	});

	it('store 写入经桥反向可读（外部 legacy 读取兼容）', () => {
		const store = getPluginStore();
		store.plugins = [{ id: 'p2', enabled: false }];
		expect(PluginManager.plugins).toEqual([{ id: 'p2', enabled: false }]);
		store.plugins = [];
	});
});
