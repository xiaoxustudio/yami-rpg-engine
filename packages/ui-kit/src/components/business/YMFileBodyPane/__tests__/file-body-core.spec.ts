import { describe, expect, it } from 'vitest';
import { createFileBodyCore } from '../file-body-core';

const core = createFileBodyCore();

describe('file-body-core', () => {
	describe('clamp', () => {
		it('限制数值在边界内', () => {
			expect(core.clamp(5, 0, 4)).toBe(4);
			expect(core.clamp(-1, 0, 4)).toBe(0);
			expect(core.clamp(2, 0, 4)).toBe(2);
		});
	});

	describe('computeListGridMetrics', () => {
		it('按容器尺寸计算列表模式网格属性', () => {
			expect(core.computeListGridMetrics(500, 100)).toEqual({
				itemSize: 242,
				itemWidth: 242,
				visibleLines: 4,
				normalCountPerLine: 4,
				scrollCountPerLine: 4,
				scrollCount: 9
			});
		});
	});

	describe('computeTileGridMetrics', () => {
		it('按容器尺寸与图块大小计算平铺模式网格属性', () => {
			expect(core.computeTileGridMetrics(500, 300, 40, 72)).toEqual({
				itemSize: 74,
				itemWidth: 42,
				visibleLines: 6,
				normalCountPerLine: 11,
				scrollCountPerLine: 11,
				scrollCount: 34
			});
		});
	});

	describe('computeVisibleRange', () => {
		it('滚动为零时窗口从首行开始', () => {
			expect(core.computeVisibleRange(0, 100, 4, 100, 3)).toEqual({ start: 0, end: 12 });
		});

		it('滚动到末行时窗口截止于总项数', () => {
			expect(core.computeVisibleRange(2400, 100, 4, 100, 3)).toEqual({
				start: 96,
				end: 100
			});
		});

		it('总项数不足一屏时窗口覆盖全部项', () => {
			expect(core.computeVisibleRange(0, 5, 4, 100, 3)).toEqual({ start: 0, end: 5 });
		});

		it('滚动越界时起始行被 clamp 到末行', () => {
			expect(core.computeVisibleRange(100000, 100, 4, 100, 3)).toEqual({
				start: 96,
				end: 100
			});
		});

		it('负滚动偏移被 clamp 到首行', () => {
			expect(core.computeVisibleRange(-500, 100, 4, 100, 3)).toEqual({ start: 0, end: 12 });
		});

		it('零项时保持原有边界计算结果', () => {
			expect(core.computeVisibleRange(0, 0, 4, 100, 3)).toEqual({ start: -4, end: 0 });
		});

		it('单列模式下按行推进窗口', () => {
			expect(core.computeVisibleRange(40, 10, 1, 20, 5)).toEqual({ start: 2, end: 7 });
		});
	});

	describe('computeNavigationIndex', () => {
		it('无选中时 prev 回到末项、next 回到首项', () => {
			expect(core.computeNavigationIndex('prev', 10, 4, false, Infinity, -Infinity)).toBe(9);
			expect(
				core.computeNavigationIndex('prev-line', 10, 4, false, Infinity, -Infinity)
			).toBe(9);
			expect(core.computeNavigationIndex('next', 10, 4, false, Infinity, -Infinity)).toBe(0);
			expect(
				core.computeNavigationIndex('next-line', 10, 4, false, Infinity, -Infinity)
			).toBe(0);
		});

		it('有选中时 prev 与 next 在选区外侧移动一格', () => {
			expect(core.computeNavigationIndex('prev', 10, 4, true, 3, 5)).toBe(2);
			expect(core.computeNavigationIndex('next', 10, 4, true, 3, 5)).toBe(6);
		});

		it('prev-line 与 next-line 按每行列数跨行移动', () => {
			expect(core.computeNavigationIndex('prev-line', 10, 4, true, 3, 5)).toBe(-1);
			expect(core.computeNavigationIndex('next-line', 10, 4, true, 3, 5)).toBe(9);
		});

		it('next-line 越界时回绕到末项', () => {
			expect(core.computeNavigationIndex('next-line', 14, 4, true, 9, 10)).toBe(13);
		});

		it('next-line 越界且行首超出总数时保持越界索引', () => {
			expect(core.computeNavigationIndex('next-line', 10, 4, true, 5, 8)).toBe(12);
		});

		it('prev 在首项处返回越界索引', () => {
			expect(core.computeNavigationIndex('prev', 10, 4, true, 0, 2)).toBe(-1);
		});
	});
});
