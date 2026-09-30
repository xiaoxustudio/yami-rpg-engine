import { describe, expect, it } from 'vitest';
import { createFileBodyCore } from '../file-body-core';
import {
	buildFileBodyWindowRows,
	computeViewMetrics,
	deriveFileRows,
	FILE_GRID_GAP,
	FILE_GRID_PADDING,
	FILE_LIST_ROW_HEIGHT,
	fileRowKeyOf,
	fileRowOffset,
	TILE_SIZE_BY_VIEW_MODE,
	viewModeOfIndex,
	VIEW_MODE_BY_INDEX
} from '../file-body-render';

/**
 * 只验证「视图模式 → 度量」映射与「文件列表 → 行数据」的纯推导。
 * 渲染怎么变都行，派生结果不许变。
 */
const core = createFileBodyCore();

class FolderItem {
	path: string;
	basename: string;
	constructor(path: string) {
		this.path = path;
		this.basename = path.split('/').pop() ?? path;
	}
}

const file = (path: string) => ({ path, basename: path.split('/').pop() ?? path });

describe('file-body-render（派生层：视图模式与度量）', () => {
	it('viewModeOfIndex：0..4 依次映射为 list/small/medium/large/huge（越界夹取）', () => {
		expect(VIEW_MODE_BY_INDEX).toEqual(['list', 'small', 'medium', 'large', 'huge']);
		expect(viewModeOfIndex(0)).toBe('list');
		expect(viewModeOfIndex(2)).toBe('medium');
		expect(viewModeOfIndex(4)).toBe('huge');
		expect(viewModeOfIndex(-3)).toBe('list');
		expect(viewModeOfIndex(99)).toBe('huge');
		expect(viewModeOfIndex(1.7)).toBe('small');
	});

	it('computeViewMetrics：list 走 computeListGridMetrics，平铺模式按模式尺寸走 computeTileGridMetrics', () => {
		const viewport = { width: 600, height: 400 };
		expect(computeViewMetrics('list', core, viewport)).toEqual(
			core.computeListGridMetrics(600, 400)
		);
		expect(computeViewMetrics('medium', core, viewport)).toEqual(
			core.computeTileGridMetrics(600, 400, ...TILE_SIZE_BY_VIEW_MODE.medium)
		);
		expect(computeViewMetrics('huge', core, viewport)).toEqual(
			core.computeTileGridMetrics(600, 400, ...TILE_SIZE_BY_VIEW_MODE.huge)
		);
	});

	it('computeViewMetrics：度量结果随视图模式变化（列表与平铺的单元尺寸不同）', () => {
		const viewport = { width: 600, height: 400 };
		const list = computeViewMetrics('list', core, viewport);
		const small = computeViewMetrics('small', core, viewport);
		expect(list.itemSize).toBeGreaterThan(0);
		expect(list.itemSize).not.toBe(small.itemSize);
	});

	it('平铺尺寸表：small < medium < large < huge（单调递增）', () => {
		const sizes = ['small', 'medium', 'large', 'huge'] as const;
		const widths = sizes.map((mode) => TILE_SIZE_BY_VIEW_MODE[mode][0]);
		expect(widths).toEqual([...widths].sort((a, b) => a - b));
		expect(new Set(widths).size).toBe(widths.length);
	});
});

describe('file-body-render（派生层：行数据）', () => {
	it('deriveFileRows：顺序与传入一致，字段取 basename/path', () => {
		const rows = deriveFileRows([file('/a/one'), file('/a/two')]);
		expect(rows.map((row) => row.name)).toEqual(['one', 'two']);
		expect(rows.map((row) => row.path)).toEqual(['/a/one', '/a/two']);
		expect(rows.map((row) => row.index)).toEqual([0, 1]);
	});

	it('deriveFileRows：默认按类名判文件夹', () => {
		const rows = deriveFileRows([file('/a/ev'), new FolderItem('/a/sub')]);
		expect(rows.map((row) => row.isFolder)).toEqual([false, true]);
	});

	it('deriveFileRows：可注入 isFolderOf（消费方用自己的类判定）', () => {
		const rows = deriveFileRows(
			[{ path: '/a/x', kind: 'folder' }],
			(item) => item.kind === 'folder'
		);
		expect(rows[0].isFolder).toBe(true);
	});

	it('行 key 稳定：同一对象多次派生同一个 key，且不同对象不冲突', () => {
		const a = file('/a/same');
		const b = file('/a/same');
		const first = deriveFileRows([a, b]);
		const second = deriveFileRows([a, b]);
		expect(first.map((row) => row.key)).toEqual(second.map((row) => row.key));
		expect(first[0].key).not.toBe(first[1].key);
		expect(fileRowKeyOf(a)).toBe(first[0].key);
	});

	it('空输入：返回空数组', () => {
		expect(deriveFileRows()).toEqual([]);
		expect(deriveFileRows([])).toEqual([]);
	});
});

describe('file-body-render（派生层：行定位与窗口行）', () => {
	it('fileRowOffset：列表模式按列×行高定位（列宽×列 + 内边距，行×行高）', () => {
		expect(fileRowOffset('list', 5, 4, 100, 999)).toEqual({
			left: `${Math.floor(5 / 4) * 100 + FILE_GRID_PADDING}px`,
			top: `${(5 % 4) * FILE_LIST_ROW_HEIGHT}px`
		});
		expect(fileRowOffset('list', 3, 10, 50, 999)).toEqual({
			left: `${FILE_GRID_PADDING}px`,
			top: `${3 * FILE_LIST_ROW_HEIGHT}px`
		});
	});

	it('fileRowOffset：平铺模式按 列%列数/行÷列数 与单元尺寸定位（左侧/顶部均加内边距）', () => {
		expect(fileRowOffset('medium', 5, 4, 100, 80)).toEqual({
			left: `${(5 % 4) * 100 + FILE_GRID_PADDING}px`,
			top: `${Math.floor(5 / 4) * 80 + FILE_GRID_PADDING}px`
		});
	});

	it('常量：内边距/间隙/列表行高与既有字面量一致', () => {
		expect(FILE_GRID_PADDING).toBe(4);
		expect(FILE_GRID_GAP).toBe(2);
		expect(FILE_LIST_ROW_HEIGHT).toBe(20);
	});

	it('buildFileBodyWindowRows：切片窗口、字段与 key 顺序与 deriveFileRows 一致', () => {
		const files = [file('/a/0'), file('/a/1'), file('/a/2'), file('/a/3')];
		const rows = buildFileBodyWindowRows({
			files,
			start: 1,
			end: 3,
			viewMode: 'list',
			countPerLine: 1,
			itemWidth: 100,
			itemSize: 80,
			isFolderOf: () => false,
			isSelected: (item) => item === files[2],
			nameOf: (item) => item.basename
		});
		expect(rows.map((row) => row.index)).toEqual([1, 2]);
		expect(rows.map((row) => row.key)).toEqual(
			deriveFileRows(files)
				.slice(1, 3)
				.map((row) => row.key)
		);
		expect(rows.map((row) => row.name)).toEqual(['1', '2']);
		expect(rows.map((row) => row.isFolder)).toEqual([false, false]);
		expect(rows.map((row) => row.selected)).toEqual([false, true]);
		expect(rows[0].style).toEqual({
			left: `${Math.floor(1 / 1) * 100 + FILE_GRID_PADDING}px`,
			top: `${(1 % 1) * FILE_LIST_ROW_HEIGHT}px`
		});
	});

	it('buildFileBodyWindowRows：跳过窗口内缺失的下标（稀疏数组）', () => {
		const files: { path: string; basename: string }[] = [];
		files[2] = file('/a/2');
		const rows = buildFileBodyWindowRows({
			files,
			start: 0,
			end: 3,
			viewMode: 'list',
			countPerLine: 1,
			itemWidth: 10,
			itemSize: 10,
			isFolderOf: () => false,
			isSelected: () => false,
			nameOf: (item) => item.basename
		});
		expect(rows.map((row) => row.index)).toEqual([2]);
	});
});
