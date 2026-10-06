import { describe, expect, it } from 'vitest';
import { getDataStore, dataKeys, type ManifestShape } from '@app/stores/data';

describe('useDataStore（Data 状态桥接）', () => {
	it('setManifest 承载 manifest 且可读回', () => {
		const store = getDataStore();
		store.setManifest({ guidMap: { g1: { id: 'x' } } } as unknown as ManifestShape);
		expect(store.manifest?.guidMap.g1.id).toBe('x');
		expect(store.data.manifest?.guidMap.g1.id).toBe('x');
	});

	it('setManifest 替换引用（shallowRef 语义）', () => {
		const store = getDataStore();
		store.setManifest({ guidMap: {} } as unknown as ManifestShape);
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

	it('manifest 只有一处存放：字段即 ref，且可枚举（序列化不漏）', () => {
		const store = getDataStore();
		const first = { guidMap: { g9: { id: 'z' } } } as unknown as ManifestShape;
		store.setManifest(first);
		// ref 侧是原始引用（shallowRef 不代理）；经 data 代理读到的是同一份内容
		expect(store.manifest).toBe(first);
		expect(store.data.manifest).toEqual(first);

		const second = { guidMap: {} } as unknown as ManifestShape;
		store.data.manifest = second; // 写字段 ⇒ 落到同一个 ref
		expect(store.manifest).toBe(second);
		expect(store.data.manifest).toEqual(second);

		// 可枚举性：`Object.keys` 与 `JSON.stringify` 都必须看得到 manifest，
		// 否则项目数据的序列化会静默丢字段（这正是当初不敢去重的原因）。
		expect(Object.keys(store.data)).toContain('manifest');
		expect(JSON.stringify(store.data)).toContain('"manifest"');

		store.setManifest(null);
		expect(store.data.manifest).toBeNull();
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

	it('数组列表类结构（easings/variables/teams/localization/attribute）', () => {
		const store = getDataStore();
		store.setData('easings', [{ id: 'e1', name: 'Linear' }]);
		store.setData('variables', [{ id: 'v1', name: 'HP', value: 100, children: [] }]);
		store.setData('teams', { list: [{ id: 't1', name: 'TeamA' }] });
		store.setData('localization', { list: [{ id: 'l1', name: 'en-US' }] });
		store.setData('attribute', [{ id: 'a1', name: 'AttrA' }]);
		expect(store.data.easings?.[0].name).toBe('Linear');
		expect(store.data.variables?.[0].value).toBe(100);
		expect(store.data.teams?.list[0].name).toBe('TeamA');
		expect(store.data.localization?.list[0].name).toBe('en-US');
		expect(store.data.attribute?.[0].name).toBe('AttrA');
	});

	it('setData 单项赋值可读回', () => {
		const store = getDataStore();
		store.setData('actors', { a1: { id: 'a1' } });
		expect(store.data.actors?.a1.id).toBe('a1');
		store.setData('scenes', []);
		expect(store.data.scenes).toEqual([]);
	});
});
