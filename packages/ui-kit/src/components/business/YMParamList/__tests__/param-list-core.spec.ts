import { describe, expect, it } from 'vitest';
import {
	clearElementSlots,
	computeRowMargins,
	computeVisibleRange
} from '../../../../utils/common-list';
import { createParamListCore } from '../param-list-core';

const core = createParamListCore();

describe('param-list-core', () => {
	it('窗口/边距/清空槽位与 utils/common-list 的唯一一份是同一个实现（防再抄一份）', () => {
		// 身份比较而非取值比较：取值比较在「又抄一份」时依然通过，
		// 而收口要保住的正是「只有一份实现」。
		expect(core.computeVisibleRange).toBe(computeVisibleRange);
		expect(core.computeHeadAndFootMargins).toBe(computeRowMargins);
		expect(core.clearElements).toBe(clearElementSlots);
	});

	describe('resolveSelectionRange', () => {
		it('交换并夹紧起止索引', () => {
			expect(core.resolveSelectionRange(5, 2, 10, () => true)).toEqual({ start: 2, end: 5 });
			expect(core.resolveSelectionRange(-1, 99, 10, () => true)).toEqual({
				start: 0,
				end: 9
			});
		});

		it('范围末尾无数据项时回退 end', () => {
			expect(core.resolveSelectionRange(2, 3, 10, (index) => index !== 3)).toEqual({
				start: 2,
				end: 2
			});
			expect(core.resolveSelectionRange(0, 9, 10, (index) => index !== 9)).toEqual({
				start: 0,
				end: 8
			});
		});

		it('单选时不做数据项回退', () => {
			expect(core.resolveSelectionRange(3, 3, 10, () => false)).toEqual({ start: 3, end: 3 });
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

	describe('computeFlexibleHeight', () => {
		it('按条目数计算高度', () => {
			expect(core.computeFlexibleHeight(0)).toBe(2);
			expect(core.computeFlexibleHeight(5)).toBe(102);
		});

		it('高度上限为 500 加边框', () => {
			expect(core.computeFlexibleHeight(25)).toBe(502);
			expect(core.computeFlexibleHeight(100)).toBe(502);
		});
	});

	describe('computeSelectionScrollTop', () => {
		it('将滚动位置夹紧到选中行可见范围', () => {
			expect(core.computeSelectionScrollTop(0, 5, 200)).toBe(0);
			expect(core.computeSelectionScrollTop(500, 5, 200)).toBe(100);
		});

		it('低于可见下限时回滚', () => {
			expect(core.computeSelectionScrollTop(0, 20, 200)).toBe(220);
			expect(core.computeSelectionScrollTop(50, 20, 200)).toBe(220);
		});
	});

	describe('computeDragSelectIndex', () => {
		it('按纵坐标换算行索引并夹紧', () => {
			expect(core.computeDragSelectIndex(45, 0, 20, 100)).toBe(2);
			expect(core.computeDragSelectIndex(-100, 0, 20, 100)).toBe(0);
			expect(core.computeDragSelectIndex(10000, 0, 20, 100)).toBe(99);
		});

		it('考虑顶部内边距', () => {
			expect(core.computeDragSelectIndex(50, 10, 20, 100)).toBe(2);
			expect(core.computeDragSelectIndex(29, 10, 20, 100)).toBe(0);
		});
	});

	describe('collectToggleItems', () => {
		it('全部启用时收集为禁用项', () => {
			const a = { enabled: true };
			const b = { enabled: true };
			const result = core.collectToggleItems([a, b, null], 0, 2);
			expect(result.method).toBe('disable');
			expect(result.items).toEqual([a, b]);
		});

		it('首个禁用项触发收集为启用项', () => {
			const a = { enabled: true };
			const b = { enabled: false };
			const c = { enabled: false };
			const result = core.collectToggleItems([a, b, c], 0, 2);
			expect(result.method).toBe('enable');
			expect(result.items).toEqual([b, c]);
		});

		it('前段启用后段禁用时只返回禁用段', () => {
			const a = { enabled: true };
			const b = { enabled: false };
			const result = core.collectToggleItems([a, b, a], 0, 2);
			expect(result.method).toBe('enable');
			expect(result.items).toEqual([b]);
		});

		it('空值条目被跳过', () => {
			const a = { enabled: true };
			const result = core.collectToggleItems([a, null, a], 0, 2);
			expect(result.method).toBe('disable');
			expect(result.items).toEqual([a, a]);
		});
	});

	describe('setItemsEnabled', () => {
		it('设置条目启用状态', () => {
			const a = { enabled: false };
			const b: { enabled?: boolean } = {};
			core.setItemsEnabled([a, b], true);
			expect(a.enabled).toBe(true);
			expect(b.enabled).toBe(true);
		});

		it('设置条目禁用状态', () => {
			const a = { enabled: true };
			core.setItemsEnabled([a], false);
			expect(a.enabled).toBe(false);
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
