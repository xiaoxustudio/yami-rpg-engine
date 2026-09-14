import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import YMFileBodyPane from '../YMFileBodyPane.vue';
import { deriveFileRows } from '../file-body-render';

/**
 * P6/M3 切片 3：**可见行数据模型**与"命令式渲染出的 DOM"必须等价。
 *
 * 为什么这条用例是换源（`v-for`）的前提：M3 要把行的产生从 `createFileElement` 搬到模板，
 * 搬之前必须先证明"派生层算出来的行序列"与"现在真正渲染出来的行序列"**逐项一致**
 * （顺序、key、窗口边界）。不一致就先修模型，而不是先动渲染。
 */
class FileItem {
	path: string;
	name: string;
	basename: string;
	extname: string;
	type: string;
	children: FileItem[] = [];
	context: { element?: HTMLElement } = {};
	constructor(path: string, name: string) {
		this.path = path;
		this.name = name;
		this.basename = name;
		this.extname = '';
		this.type = 'event';
	}
	getContext(): { element?: HTMLElement } {
		return this.context;
	}
}

class FolderItem {
	path: string;
	name: string;
	children: FileItem[] = [];
	context: { element?: HTMLElement } = {};
	constructor(path: string, name: string) {
		this.path = path;
		this.name = name;
	}
	getContext(): { element?: HTMLElement } {
		return this.context;
	}
}

interface RowModel {
	start: number;
	end: number;
	countPerLine: number;
	viewMode: string;
	keys: string[];
}

interface BodyElement extends HTMLElement {
	[k: string]: unknown;
	createFlatItems: (dir: unknown[]) => void;
	setViewIndex: (idx: number) => void;
	updateViewMode: () => void;
	computeGridProperties: () => void;
	updateContentSize: () => void;
	resize: () => void;
	getRowModel: () => RowModel;
}

const makeLinks = () => ({
	browser: { display: 'normal', filters: null, searchResults: null, backToParentFolder: vi.fn() },
	nav: { selections: [], load: vi.fn(), scrollToSelection: vi.fn() },
	head: { view: { write: vi.fn() } },
	body: null
});

const mountBody = () => {
	vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
		width: 600,
		height: 400,
		top: 0,
		left: 0,
		right: 600,
		bottom: 400,
		x: 0,
		y: 0,
		toJSON: () => ({})
	} as DOMRect);
	const wrapper = mount(YMFileBodyPane, {
		props: { links: makeLinks(), fileClasses: { FileItem, FolderItem } }
	});
	const el = wrapper.element as BodyElement;
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 600, configurable: true });
	return { wrapper, el };
};

const renderItems = (el: BodyElement, list: unknown[], viewIndex = 0): void => {
	el.setViewIndex(viewIndex);
	el.updateViewMode();
	el.createFlatItems(list);
	el.computeGridProperties();
	el.updateContentSize();
	el.resize();
};

const items = (n = 6) => Array.from({ length: n }, (_, i) => new FileItem(`/a/ev${i}`, `ev${i}`));

const domRowKeys = (el: BodyElement): (string | undefined)[] =>
	Array.from(el.querySelectorAll<HTMLElement & { rowKey?: string }>('.file-body-item')).map(
		(row) => row.rowKey
	);

describe('YMFileBodyPane（M3 切片 3：可见行模型 ↔ DOM 等价）', () => {
	it('模型里的 key 序列与 DOM 中行元素顺序逐项一致', () => {
		const { el } = mountBody();
		renderItems(el, items(5));
		const model = el.getRowModel();
		expect(model.keys.length).toBeGreaterThan(0);
		expect(domRowKeys(el)).toEqual(model.keys);
	});

	it('模型窗口切片等于派生层给出的同一段 key（顺序一致）', () => {
		const { el } = mountBody();
		const list = items(5);
		renderItems(el, list);
		const model = el.getRowModel();
		const derived = deriveFileRows(list).map((row) => row.key);
		expect(model.keys).toEqual(derived.slice(model.start, model.end));
	});

	it('模型带出窗口边界与度量（start/end/countPerLine/viewMode）', () => {
		const { el } = mountBody();
		renderItems(el, items(5));
		const model = el.getRowModel();
		expect(model.start).toBeGreaterThanOrEqual(0);
		expect(model.end).toBeGreaterThan(model.start);
		expect(model.countPerLine).toBeGreaterThan(0);
		expect(model.viewMode).toBe('list');
	});

	it('空目录：模型为空且与 DOM 一致（零行）', () => {
		const { el } = mountBody();
		renderItems(el, []);
		const model = el.getRowModel();
		expect(model.keys).toEqual([]);
		expect(domRowKeys(el)).toEqual([]);
	});

	it('getRowModel 返回副本：改它不影响内部状态', () => {
		const { el } = mountBody();
		renderItems(el, items(3));
		const first = el.getRowModel();
		first.keys.push('injected');
		first.start = 999;
		const second = el.getRowModel();
		expect(second.keys).not.toContain('injected');
		expect(second.start).not.toBe(999);
	});
});
