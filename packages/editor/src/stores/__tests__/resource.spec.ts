import { describe, expect, it } from 'vitest';
import { getResourceStore, resourceStateKeys, type ResourceRow } from '@app/stores/resource';

/** 资源列表数据化：store 的状态与行补丁语义 */
const makeRow = (key: string): ResourceRow => ({
	key,
	value: key.replace(/[.]/g, '_'),
	version: '',
	installed: false,
	hasTemp: false,
	sizeText: '大小: 未知',
	speedText: '速度: 0 KB/s',
	progress: 0,
	phase: 'idle'
});

describe('useResourceStore（资源列表数据化）', () => {
	it('初始状态默认值', () => {
		const store = getResourceStore();
		store.reset();
		expect(store.rows).toEqual([]);
		expect(store.nodeText).toBe('当前节点: 加载中...');
		expect(store.pingText).toBe('Ping: --');
		expect(store.pingColor).toBe('var(--text-color-weak)');
	});

	it('状态键完整（4 项）', () => {
		const store = getResourceStore();
		expect(resourceStateKeys).toHaveLength(4);
		for (const key of resourceStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('setRows 替换整表，patchRow 只改目标行且替换数组（触发响应式）', () => {
		const store = getResourceStore();
		store.setRows([makeRow('arpg-ts-english'), makeRow('arpg-ts-chinese')]);
		const before = store.rows;

		store.patchRow('arpg-ts-chinese', { installed: true, version: 'v1.2.3', progress: 42 });

		expect(store.rows).not.toBe(before);
		expect(store.rows[0]).toEqual(makeRow('arpg-ts-english'));
		expect(store.rows[1].installed).toBe(true);
		expect(store.rows[1].version).toBe('v1.2.3');
		expect(store.rows[1].progress).toBe(42);
	});

	it('patchRow 对不存在的 key 是 no-op', () => {
		const store = getResourceStore();
		store.setRows([makeRow('arpg-ts-english')]);
		store.patchRow('not-exist', { installed: true });
		expect(store.rows).toHaveLength(1);
		expect(store.rows[0].installed).toBe(false);
	});

	it('节点信息读写', () => {
		const store = getResourceStore();
		store.setNodeText('当前节点: 自动选择');
		store.setPing('Ping: 128ms', '#4caf50');
		expect(store.nodeText).toBe('当前节点: 自动选择');
		expect(store.pingText).toBe('Ping: 128ms');
		expect(store.pingColor).toBe('#4caf50');
	});
});
