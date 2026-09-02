import { describe, expect, it } from 'vitest';
import { createTabBarCore, type TabItem } from '../tab-bar-core';

const core = createTabBarCore();

const item = (name: string, extra: Record<string, unknown> = {}): TabItem =>
	({ icon: 'i', name, ...extra }) as TabItem;

describe('tab-bar-core', () => {
	describe('parseTabName', () => {
		it('拼接图标与名称', () => {
			expect(core.parseTabName(item('a'))).toBe('i a');
			expect(core.parseTabName({ icon: 'X', name: 'b' })).toBe('X b');
		});

		it('名称含空格时原样保留', () => {
			expect(core.parseTabName({ icon: 'i', name: 'a b' })).toBe('i a b');
		});
	});

	describe('arrayRemove', () => {
		it('移除已存在条目并返回 true', () => {
			const a = item('a');
			const b = item('b');
			const arr = [a, b];
			expect(core.arrayRemove(arr, a)).toBe(true);
			expect(arr).toEqual([b]);
		});

		it('条目不存在时返回 false 且不改数组', () => {
			const arr = [item('a')];
			expect(core.arrayRemove(arr, item('x'))).toBe(false);
			expect(arr.length).toBe(1);
		});
	});

	describe('insertTabItem', () => {
		it('在指定索引之后插入新条目', () => {
			const a = item('a');
			const c = item('c');
			const items = [a, item('b'), c];
			expect(core.insertTabItem(items, item('x'), 1)).toBe(true);
			expect(items.map((tab) => tab.name)).toEqual(['a', 'b', 'x', 'c']);
		});

		it('条目已存在时不插入', () => {
			const a = item('a');
			const items = [a, item('b')];
			expect(core.insertTabItem(items, a, 0)).toBe(false);
			expect(items.length).toBe(2);
		});
	});

	describe('findTabByProperty', () => {
		it('按属性值查找条目', () => {
			const a = item('a', { guid: 'g1' });
			const b = item('b', { guid: 'g2' });
			expect(core.findTabByProperty([a, b], 'guid', 'g2')).toBe(b);
			expect(core.findTabByProperty([a, b], 'name', 'a')).toBe(a);
		});

		it('未找到时返回 undefined', () => {
			expect(core.findTabByProperty([item('a')], 'guid', 'gx')).toBeUndefined();
			expect(core.findTabByProperty([], 'name', 'a')).toBeUndefined();
		});
	});

	describe('collectOtherTabs', () => {
		it('保留指定条目与目录条目并移除其余', () => {
			const a = item('a');
			const b = item('b');
			const c = item('c');
			const dir = item('dir');
			const items = [dir, a, b, c];
			const closed = core.collectOtherTabs(items, b, dir);
			expect(items).toEqual([dir, b]);
			expect(closed).toEqual([c, a]);
		});

		it('无条目被移除时返回空数组', () => {
			const a = item('a');
			const items = [a];
			expect(core.collectOtherTabs(items, a, null)).toEqual([]);
			expect(items).toEqual([a]);
		});
	});

	describe('collectTabsToTheRight', () => {
		it('移除指定条目右侧的全部条目', () => {
			const a = item('a');
			const b = item('b');
			const c = item('c');
			const items = [a, b, c];
			const closed = core.collectTabsToTheRight(items, a, null);
			expect(items).toEqual([a]);
			expect(closed).toEqual([c, b]);
		});

		it('目录条目被保留且目标不存在时返回空数组', () => {
			const dir = item('dir');
			const b = item('b');
			const c = item('c');
			const items = [dir, b, c];
			const closed = core.collectTabsToTheRight(items, dir, dir);
			expect(items).toEqual([dir]);
			expect(closed).toEqual([c, b]);
			expect(core.collectTabsToTheRight([item('a')], item('x'), null)).toEqual([]);
		});
	});

	describe('moveTabItem', () => {
		it('before 位置插入到目标之前', () => {
			const a = item('a');
			const b = item('b');
			const c = item('c');
			const items = [a, b, c];
			expect(core.moveTabItem(items, a, c, 'before')).toBe(1);
			expect(items.map((tab) => tab.name)).toEqual(['b', 'a', 'c']);
		});

		it('after 位置插入到目标之后', () => {
			const a = item('a');
			const b = item('b');
			const c = item('c');
			const items = [a, b, c];
			expect(core.moveTabItem(items, a, b, 'after')).toBe(1);
			expect(items.map((tab) => tab.name)).toEqual(['b', 'a', 'c']);
		});

		it('源条目不存在时返回 null', () => {
			const items = [item('a')];
			expect(core.moveTabItem(items, item('x'), item('a'), 'before')).toBeNull();
			expect(items.length).toBe(1);
		});
	});

	describe('computeDropPosition', () => {
		it('点击在左半侧时为 before 右半侧为 after', () => {
			expect(core.computeDropPosition(10, { left: 0, width: 100 })).toBe('before');
			expect(core.computeDropPosition(50, { left: 0, width: 100 })).toBe('after');
		});

		it('按盒子左边界换算坐标', () => {
			expect(core.computeDropPosition(210, { left: 200, width: 100 })).toBe('before');
			expect(core.computeDropPosition(260, { left: 200, width: 100 })).toBe('after');
		});
	});

	describe('computeHintRect', () => {
		it('before 位置在左侧绘制 2px 竖线', () => {
			expect(
				core.computeHintRect({ left: 100, top: 0, width: 50, height: 28 }, 'before')
			).toEqual({ left: 99, top: 0, width: 2, height: 28 });
		});

		it('after 位置在右侧绘制 2px 竖线', () => {
			expect(
				core.computeHintRect({ left: 100, top: 0, width: 50, height: 28 }, 'after')
			).toEqual({ left: 149, top: 0, width: 2, height: 28 });
			expect(
				core.computeHintRect({ left: 0, top: 5, width: 10, height: 20 }, 'after')
			).toEqual({
				left: 9,
				top: 5,
				width: 2,
				height: 20
			});
		});
	});
});
