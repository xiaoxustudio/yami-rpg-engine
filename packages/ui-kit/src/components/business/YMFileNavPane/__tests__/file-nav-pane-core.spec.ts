import { describe, expect, it } from 'vitest';
import { createFileNavCore } from '../file-nav-pane-core';

const core = createFileNavCore();

describe('file-nav-pane-core', () => {
	describe('clamp', () => {
		it('将值限制在范围内', () => {
			expect(core.clamp(5, 0, 10)).toBe(5);
			expect(core.clamp(-1, 0, 10)).toBe(0);
			expect(core.clamp(11, 0, 10)).toBe(10);
		});

		it('处理 Infinity 边界', () => {
			expect(core.clamp(Infinity, 0, 3)).toBe(3);
			expect(core.clamp(-Infinity, 0, 3)).toBe(0);
		});
	});

	describe('computeRelativeSelectionIndex', () => {
		it('向上取 start-1 向下取 end+1 并夹紧边界', () => {
			expect(core.computeRelativeSelectionIndex('up', 10, [2, 5])).toBe(1);
			expect(core.computeRelativeSelectionIndex('down', 10, [2, 5])).toBe(6);
			expect(core.computeRelativeSelectionIndex('up', 10, [0])).toBe(0);
			expect(core.computeRelativeSelectionIndex('down', 10, [9])).toBe(9);
		});

		it('无有效索引时向上到末尾向下到开头', () => {
			expect(core.computeRelativeSelectionIndex('up', 5, [])).toBe(4);
			expect(core.computeRelativeSelectionIndex('down', 5, [])).toBe(0);
			expect(core.computeRelativeSelectionIndex('up', 5, [-1])).toBe(4);
		});
	});

	describe('computeScrollTop', () => {
		it('active 模式将滚动位置夹紧到行可见范围', () => {
			expect(core.computeScrollTop('active', 3, 100, 200)).toBe(60);
			expect(core.computeScrollTop('active', 10, 50, 100)).toBe(120);
		});

		it('middle 模式滚动到居中位置，未知模式返回 null', () => {
			expect(core.computeScrollTop('middle', 5, 0, 200)).toBe(20);
			expect(core.computeScrollTop('middle', 10, 0, 200)).toBe(120);
			expect(core.computeScrollTop('other', 3, 100, 200)).toBe(null);
		});
	});

	describe('computeFolderExpansionState', () => {
		it('无子文件夹时不可见且不展开', () => {
			expect(core.computeFolderExpansionState({ subfolders: [] }, true)).toEqual({
				markVisible: false,
				expanded: false
			});
		});

		it('有子文件夹时可见且跟随展开状态', () => {
			expect(core.computeFolderExpansionState({ subfolders: [{}] }, true)).toEqual({
				markVisible: true,
				expanded: true
			});
			expect(core.computeFolderExpansionState({ subfolders: [{}] }, false)).toEqual({
				markVisible: true,
				expanded: false
			});
		});
	});

	describe('computeTextIndent', () => {
		it('按缩进层级计算像素值', () => {
			expect(core.computeTextIndent(0)).toBe(0);
			expect(core.computeTextIndent(3)).toBe(36);
		});

		it('层级与像素成正比', () => {
			expect(core.computeTextIndent(1)).toBe(12);
			expect(core.computeTextIndent(5)).toBe(60);
		});
	});

	describe('clearFolderElements', () => {
		it('超过 256 且不等于 start 时截断长度', () => {
			const list = Array.from({ length: 300 }, (_, i) => i);
			core.clearFolderElements(list, 5);
			expect(list.length).toBe(5);
			expect(list.slice(0, 5)).toEqual([0, 1, 2, 3, 4]);
		});

		it('不超过 256 时保留长度并清空 start 起的槽位', () => {
			const list = [1, 2, 3, 4];
			core.clearFolderElements(list, 2);
			expect(list.length).toBe(4);
			expect(list[0]).toBe(1);
			expect(list[1]).toBe(2);
			expect(list[2]).toBeUndefined();
			expect(list[3]).toBeUndefined();
		});

		it('长度等于 start 时不截断', () => {
			const list = Array.from({ length: 300 }, (_, i) => i);
			core.clearFolderElements(list, 300);
			expect(list.length).toBe(300);
		});
	});

	describe('resolveSelections', () => {
		it('normal 与 search 模式返回对应引用', () => {
			const normal = [1, 2];
			const search = [3, 4];
			expect(core.resolveSelections('normal', normal, search)).toBe(normal);
			expect(core.resolveSelections('search', normal, search)).toBe(search);
		});

		it('未知或未定义模式返回空数组', () => {
			expect(core.resolveSelections('other', [1], [2])).toEqual([]);
			expect(core.resolveSelections(undefined, [1], [2])).toEqual([]);
		});
	});

	describe('computeShiftSelectionRange', () => {
		it('以锚点为基础与选区索引取并集范围', () => {
			expect(core.computeShiftSelectionRange(5, [2, 8])).toEqual({ start: 2, end: 8 });
			expect(core.computeShiftSelectionRange(3, [3, 7])).toEqual({ start: 3, end: 7 });
		});

		it('锚点与索引均无效时保持 -1', () => {
			expect(core.computeShiftSelectionRange(-1, [-1])).toEqual({ start: -1, end: -1 });
		});
	});

	describe('resolveFolderPaths', () => {
		it('无映射时返回文件夹自身路径', () => {
			const selections = [
				{ stats: { ino: 'a' }, path: 'p1' },
				{ stats: { ino: 'b' }, path: 'p2' }
			];
			expect(core.resolveFolderPaths(selections, {})).toEqual(['p1', 'p2']);
		});

		it('命中 inoMap 时返回映射路径', () => {
			const selections = [
				{ stats: { ino: 'a' }, path: 'p1' },
				{ stats: { ino: 'b' }, path: 'p2' }
			];
			const inoMap = { a: { path: 'mapped' }, b: null };
			expect(core.resolveFolderPaths(selections, inoMap)).toEqual(['mapped', 'p2']);
		});
	});

	describe('isForbiddenFileNameChar', () => {
		it('普通字符返回 false', () => {
			expect(core.isForbiddenFileNameChar('a')).toBe(false);
			expect(core.isForbiddenFileNameChar('文')).toBe(false);
		});

		it('Windows 非法字符返回 true', () => {
			for (const char of ['\\', '/', ':', '*', '?', '"', '<', '>', '|']) {
				expect(core.isForbiddenFileNameChar(char)).toBe(true);
			}
		});
	});

	describe('collectAncestorFolders', () => {
		it('沿 parent 链收集祖先且不含自身', () => {
			type Node = { name: string; parent?: Node };
			const root: Node = { name: 'root' };
			const mid: Node = { name: 'mid', parent: root };
			const leaf: Node = { name: 'leaf', parent: mid };
			expect(core.collectAncestorFolders([leaf])).toEqual([mid, root]);
			expect(core.collectAncestorFolders([root])).toEqual([]);
		});

		it('多个文件夹的祖先按顺序拼接', () => {
			type Node = { name: string; parent?: Node };
			const root: Node = { name: 'root' };
			const a: Node = { name: 'a', parent: root };
			const b: Node = { name: 'b', parent: root };
			expect(core.collectAncestorFolders([a, b])).toEqual([root, root]);
		});
	});
});
