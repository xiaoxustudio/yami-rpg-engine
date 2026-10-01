import { describe, expect, it } from 'vitest';
import { computeRowMargins, computeVisibleRange } from '../../../../utils/common-list';
import { createCommonListCore } from '../common-list-core';

const core = createCommonListCore();

describe('common-list-core', () => {
	it('窗口/边距公式与 utils/common-list 的唯一一份是同一个实现（防再抄一份）', () => {
		// 这两条断言是**身份**比较，不是取值比较：取值比较在「又抄一份」时依然会通过，
		// 而本次收口要保住的正是「只有一份实现」。`tree-render` / `param-list-core` 同理。
		expect(core.computeVisibleRange).toBe(computeVisibleRange);
		expect(core.computeHeadAndFootMargins).toBe(computeRowMargins);
	});

	describe('findItemIndex', () => {
		it('按 dataValue 查找索引', () => {
			const items = [{ dataValue: 'a' }, { dataValue: 'b' }, { dataValue: 'c' }];
			expect(core.findItemIndex(items, 3, 'b')).toBe(1);
			expect(core.findItemIndex(items, 3, 'c')).toBe(2);
		});

		it('未找到时返回 0 且只搜索 count 范围', () => {
			const items = [{ dataValue: 'a' }, { dataValue: 'b' }];
			expect(core.findItemIndex(items, 2, 'x')).toBe(0);
			expect(core.findItemIndex(items, 1, 'b')).toBe(0);
		});
	});

	describe('computeVisibleRange', () => {
		it('按滚动位置与可视高度计算范围', () => {
			expect(core.computeVisibleRange(0, 100, 50)).toEqual({ start: 0, end: 6 });
			expect(core.computeVisibleRange(40, 41, 50)).toEqual({ start: 2, end: 6 });
		});

		it('范围不超过总数且滚动越界时贴底', () => {
			expect(core.computeVisibleRange(0, 100, 3)).toEqual({ start: 0, end: 3 });
			expect(core.computeVisibleRange(10000, 100, 50)).toEqual({ start: 49, end: 50 });
		});
	});

	describe('computeHeadAndFootMargins', () => {
		it('按起始行与结束行计算上下边距', () => {
			expect(core.computeHeadAndFootMargins(20, 3, 8, false)).toEqual({
				marginTop: 60,
				marginBottom: 240
			});
			expect(core.computeHeadAndFootMargins(20, 0, 5, false)).toEqual({
				marginTop: 0,
				marginBottom: 300
			});
		});

		it('带内边距时下边距额外加一行', () => {
			expect(core.computeHeadAndFootMargins(10, 2, 6, true)).toEqual({
				marginTop: 40,
				marginBottom: 100
			});
			expect(core.computeHeadAndFootMargins(10, 2, 6, false)).toEqual({
				marginTop: 40,
				marginBottom: 80
			});
		});
	});

	describe('computeItemScrollTop', () => {
		it('将滚动位置夹紧到条目可见范围', () => {
			expect(core.computeItemScrollTop(0, 5, 200)).toBe(0);
			expect(core.computeItemScrollTop(500, 5, 200)).toBe(100);
		});

		it('低于可见下限时回滚', () => {
			expect(core.computeItemScrollTop(0, 20, 200)).toBe(220);
			expect(core.computeItemScrollTop(50, 20, 200)).toBe(220);
		});
	});

	describe('computeRelativeIndex', () => {
		it('有当前索引时向上向下移动一格', () => {
			expect(core.computeRelativeIndex('up', 10, 5)).toBe(4);
			expect(core.computeRelativeIndex('down', 10, 5)).toBe(6);
		});

		it('到达边界时保持不变', () => {
			expect(core.computeRelativeIndex('up', 10, 0)).toBe(0);
			expect(core.computeRelativeIndex('down', 10, 9)).toBe(9);
		});

		it('无当前索引时向上到末尾向下到开头', () => {
			expect(core.computeRelativeIndex('up', 5, -1)).toBe(4);
			expect(core.computeRelativeIndex('down', 5, -1)).toBe(0);
		});
	});

	describe('clearElements', () => {
		it('从起始位置清空已缓存条目', () => {
			const list = [1, 2, 3, 4];
			core.clearElements(list, 2);
			expect(list).toEqual([1, 2, undefined, undefined]);
		});

		it('起始位置无条目时不影响列表', () => {
			const list = [1, 2];
			core.clearElements(list, 5);
			expect(list).toEqual([1, 2]);
			expect(list.length).toBe(2);
		});
	});
});
