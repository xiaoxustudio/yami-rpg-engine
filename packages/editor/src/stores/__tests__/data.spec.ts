import { describe, expect, it } from 'vitest';
import { getDataStore, dataKeys } from '@app/stores/data';

describe('useDataStore（Phase 10——Data 状态桥接）', () => {
	it('setManifest 承载 manifest 且可读回', () => {
		const store = getDataStore();
		store.setManifest({ guidMap: { g1: { id: 'x' } } } as any);
		expect(store.manifest?.guidMap.g1.id).toBe('x');
		expect(store.data.manifest?.guidMap.g1.id).toBe('x');
	});

	it('setManifest 替换引用（shallowRef 语义）', () => {
		const store = getDataStore();
		store.setManifest({ guidMap: {} } as any);
		expect(store.manifest?.guidMap).toEqual({});
		store.setManifest(null);
		expect(store.manifest).toBe(null);
	});

	it('data 对象包含全部 26 个数据键', () => {
		const store = getDataStore();
		expect(dataKeys.length).toBeGreaterThanOrEqual(26);
		for (const key of dataKeys) {
			expect(key in store.data, String(key)).toBe(true);
		}
	});

	it('scenePresets/uiPresets 结构类型（sceneId/uiId + data）', () => {
		const store = getDataStore();
		store.setData('scenePresets', { p1: { sceneId: 's1', data: { id: 'n1' } } });
		store.setData('uiPresets', { p2: { uiId: 'u1', data: { id: 'n2' } } });
		expect(store.data.scenePresets?.p1.sceneId).toBe('s1');
		expect(store.data.scenePresets?.p1.data.id).toBe('n1');
		expect(store.data.uiPresets?.p2.uiId).toBe('u1');
		expect(store.data.uiPresets?.p2.data.id).toBe('n2');
	});

	it('guid 数据映射键可读写（DataMapShape）', () => {
		const store = getDataStore();
		store.setData('scenes', { s1: { name: 'Overworld' } });
		store.setData('tilesets', { t1: { name: 'Grass' } });
		expect(store.data.scenes?.s1.name).toBe('Overworld');
		expect(store.data.tilesets?.t1.name).toBe('Grass');
	});

	it('setData 单项赋值可读回', () => {
		const store = getDataStore();
		store.setData('actors', { a1: { id: 'a1' } });
		expect(store.data.actors?.a1.id).toBe('a1');
		store.setData('scenes', []);
		expect(store.data.scenes).toEqual([]);
	});
});
