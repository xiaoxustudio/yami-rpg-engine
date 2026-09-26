import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import YMFileBodyPane from '../YMFileBodyPane.vue';
import { deriveFileRows } from '../file-body-render';

/**
 * **可见行数据模型**与渲染出的 DOM 必须等价。
 *
 * 行由模板按本模型产生，因此必须证明"派生层算出来的行序列"与"真正渲染出来的行序列"**逐项一致**
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

interface RowDescriptor {
	key: string;
	index: number;
	name: string;
	isFolder: boolean;
	selected: boolean;
	style: { left: string; top: string };
}

interface RowModel {
	start: number;
	end: number;
	countPerLine: number;
	viewMode: string;
	keys: string[];
	rows: RowDescriptor[];
}

interface BodyElement extends HTMLElement {
	[k: string]: unknown;
	createFlatItems: (dir: unknown[]) => void;
	setViewIndex: (idx: number) => void;
	updateViewMode: () => void;
	computeGridProperties: () => void;
	updateContentSize: () => void;
	resize: () => void;
	selectAll: () => void;
	unselect: () => void;
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

const renderItems = async (el: BodyElement, list: unknown[], viewIndex = 0): Promise<void> => {
	el.setViewIndex(viewIndex);
	el.updateViewMode();
	el.createFlatItems(list);
	el.computeGridProperties();
	el.updateContentSize();
	el.resize();
	await nextTick();
	await nextTick();
};

const items = (n = 6) => Array.from({ length: n }, (_, i) => new FileItem(`/a/ev${i}`, `ev${i}`));

const domRowKeys = (el: BodyElement): (string | undefined)[] =>
	Array.from(el.querySelectorAll<HTMLElement & { rowKey?: string }>('.file-body-item')).map(
		(row) => row.rowKey
	);

describe('YMFileBodyPane（可见行模型 ↔ DOM 等价）', () => {
	it('模型里的 key 序列与 DOM 中行元素顺序逐项一致', async () => {
		const { el } = mountBody();
		await renderItems(el, items(5));
		const model = el.getRowModel();
		expect(model.keys.length).toBeGreaterThan(0);
		expect(domRowKeys(el)).toEqual(model.keys);
	});

	it('模型窗口切片等于派生层给出的同一段 key（顺序一致）', async () => {
		const { el } = mountBody();
		const list = items(5);
		await renderItems(el, list);
		const model = el.getRowModel();
		const derived = deriveFileRows(list).map((row) => row.key);
		expect(model.keys).toEqual(derived.slice(model.start, model.end));
	});

	it('模型带出窗口边界与度量（start/end/countPerLine/viewMode）', async () => {
		const { el } = mountBody();
		await renderItems(el, items(5));
		const model = el.getRowModel();
		expect(model.start).toBeGreaterThanOrEqual(0);
		expect(model.end).toBeGreaterThan(model.start);
		expect(model.countPerLine).toBeGreaterThan(0);
		expect(model.viewMode).toBe('list');
	});

	it('空目录：模型为空且与 DOM 一致（零行）', async () => {
		const { el } = mountBody();
		await renderItems(el, []);
		const model = el.getRowModel();
		expect(model.keys).toEqual([]);
		expect(domRowKeys(el)).toEqual([]);
	});

	it('getRowModel 返回副本：改它不影响内部状态', async () => {
		const { el } = mountBody();
		await renderItems(el, items(3));
		const first = el.getRowModel();
		first.keys.push('injected');
		first.start = 999;
		const second = el.getRowModel();
		expect(second.keys).not.toContain('injected');
		expect(second.start).not.toBe(999);
	});
});

/**
 * 模板渲染一行需要的**全部数据**必须与命令式渲染结果一致
 * （名称、文件夹标记、选中态、定位样式）——换源时模板只吃这份数据，不再读 DOM。
 */
describe('YMFileBodyPane（行描述 ↔ DOM 双写一致）', () => {
	it('行描述与 DOM 逐项一致：名称、文件夹标记、定位样式', async () => {
		const { el } = mountBody();
		await renderItems(el, [new FileItem('/a/ev', 'ev'), new FolderItem('/a/sub', 'sub')]);
		const model = el.getRowModel();
		const domRows = Array.from(el.querySelectorAll<HTMLElement>('.file-body-item'));
		expect(model.rows.length).toBe(domRows.length);
		model.rows.forEach((row, i) => {
			const dom = domRows[i] as HTMLElement & { rowKey?: string };
			expect(row.key).toBe(dom.rowKey);
			expect(row.name).toBe(dom.querySelector('.file-body-name')?.textContent);
			expect(row.isFolder).toBe(!dom.classList.contains('file-item'));
			expect(row.style.left).toBe(dom.style.left);
			expect(row.style.top).toBe(dom.style.top);
		});
	});

	it('行描述带出全局下标（index），且随窗口迁移更新为新窗口的行', async () => {
		const { el } = mountBody();
		await renderItems(el, items(60), 0);
		const before = el.getRowModel().rows.map((row) => row.index);
		expect(before[0]).toBe(el.getRowModel().start);
		Object.defineProperty(el, 'scrollLeft', { value: 600, configurable: true, writable: true });
		el.resize();
		await nextTick();
		const after = el.getRowModel();
		expect(after.start).toBeGreaterThan(0);
		expect(after.rows[0].index).toBe(after.start);
	});

	it('选中态进入行描述（选中后 selected=true，取消后回到 false）', async () => {
		const { el } = mountBody();
		await renderItems(el, items(3), 0);
		expect(el.getRowModel().rows.every((row) => !row.selected)).toBe(true);
		el.selectAll();
		await nextTick();
		expect(el.getRowModel().rows.some((row) => row.selected)).toBe(true);
		el.unselect();
		await nextTick();
		expect(el.getRowModel().rows.every((row) => !row.selected)).toBe(true);
	});
});
