import { describe, expect, it } from 'vitest';
import { createFileHeadPaneCore, type AddressNode, type FileItem } from '../file-head-pane-core';

const core = createFileHeadPaneCore();

const makeId = (): (() => number) => {
	let seq = 0;
	return () => ++seq;
};

const node = (name: string, parent?: FileItem): FileItem => ({
	name,
	parent,
	subfolders: []
});

const folderTypes = (nodes: AddressNode[]): string[] => nodes.map((n) => n.type);

describe('file-head-pane-core', () => {
	describe('buildAddressNodes', () => {
		it('normal 且单个无父目录：一个禁用 folder 节点，file 指向自身', () => {
			const a: FileItem = { name: 'a', subfolders: [] };
			const nodes = core.buildAddressNodes({
				display: 'normal',
				selections: [a],
				isFolderItem: () => false,
				nextId: makeId(),
				searchCount: 0
			});
			expect(folderTypes(nodes)).toEqual(['folder']);
			expect(nodes[0]).toMatchObject({ text: 'a', file: a, disabled: true });
		});

		it('normal 且单条父链：按根→叶顺序输出 folder/arrow 交替，file/target 指向根', () => {
			const a: FileItem = { name: 'a', subfolders: [] };
			const b = node('b', a);
			const c = node('c', b);
			a.subfolders = [b];
			b.subfolders = [c];
			const isFolderItem = (obj: unknown): boolean => obj === a || obj === b;
			const nodes = core.buildAddressNodes({
				display: 'normal',
				selections: [c],
				isFolderItem,
				nextId: makeId(),
				searchCount: 0
			});
			expect(folderTypes(nodes)).toEqual(['folder', 'arrow', 'folder', 'arrow', 'folder']);
			expect(nodes.map((n) => n.text)).toEqual(['a', undefined, 'b', undefined, 'c']);
			expect(nodes[0]).toMatchObject({ type: 'folder', file: a });
			expect(nodes[1]).toMatchObject({ type: 'arrow', target: a, folders: a.subfolders });
			expect(nodes[4]).toMatchObject({ type: 'folder', file: a, disabled: true });
			expect(nodes[3]).toMatchObject({ type: 'arrow', target: a, folders: b.subfolders });
		});

		it('normal 且多选：folder 节点间插入 & link', () => {
			const a = node('a');
			const b = node('b');
			const nodes = core.buildAddressNodes({
				display: 'normal',
				selections: [a, b],
				isFolderItem: () => false,
				nextId: makeId(),
				searchCount: 0
			});
			expect(folderTypes(nodes)).toEqual(['folder', 'link', 'folder']);
			expect(nodes.map((n) => n.text)).toEqual(['a', '&', 'b']);
			expect(nodes[0]).toMatchObject({ file: a });
			expect(nodes[2]).toMatchObject({ file: b });
		});

		it('search：单个 text 节点带文件数', () => {
			const nodes = core.buildAddressNodes({
				display: 'search',
				selections: [],
				isFolderItem: () => false,
				nextId: makeId(),
				searchCount: 7
			});
			expect(nodes).toEqual([{ id: 1, type: 'text', text: '7 个文件' }]);
		});

		it('未知 display：返回空数组', () => {
			expect(
				core.buildAddressNodes({
					display: undefined,
					selections: [node('a')],
					isFolderItem: () => false,
					nextId: makeId(),
					searchCount: 0
				})
			).toEqual([]);
			expect(
				core.buildAddressNodes({
					display: 'other',
					selections: [node('a')],
					isFolderItem: () => false,
					nextId: makeId(),
					searchCount: 0
				})
			).toEqual([]);
		});
	});
});
