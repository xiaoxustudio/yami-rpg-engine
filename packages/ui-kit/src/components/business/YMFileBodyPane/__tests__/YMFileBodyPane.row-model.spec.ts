import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import YMFileBodyPane from '../YMFileBodyPane.vue';

type BodyApi = InstanceType<typeof YMFileBodyPane>;
import { deriveFileRows } from '../file-body-render';

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

const makeLinks = () => ({
	browser: { display: 'normal', filters: null, searchResults: [], backToParentFolder: vi.fn() },
	nav: { getSelections: () => [], load: vi.fn(), scrollToSelection: vi.fn() },
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
	const el = wrapper.element as HTMLElement;
	const vm = wrapper.vm as BodyApi;
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 600, configurable: true });
	return { wrapper, el, vm };
};

/** BodyApi 是实例 + 局部接口的交叉类型，getRowModel() 的返回类型在这里收窄一次 */
const rowModelOf = (vm: BodyApi): RowModel => vm.getRowModel() as RowModel;

const renderItems = async (vm: BodyApi, list: unknown[], viewIndex = 0): Promise<void> => {
	vm.setViewIndex(viewIndex);
	vm.updateViewMode();
	vm.createFlatItems(list);
	vm.computeGridProperties();
	vm.updateContentSize();
	vm.resize();
	await nextTick();
	await nextTick();
};

const items = (n = 6) => Array.from({ length: n }, (_, i) => new FileItem(`/a/ev${i}`, `ev${i}`));

const domRowKeys = (el: HTMLElement): (string | undefined)[] =>
	Array.from(el.querySelectorAll<HTMLElement & { rowKey?: string }>('.file-body-item')).map(
		(row) => row.rowKey
	);

describe('YMFileBodyPane（可见行模型 ↔ DOM 等价）', () => {
	it('模型里的 key 序列与 DOM 中行元素顺序逐项一致', async () => {
		const { el, vm } = mountBody();
		await renderItems(vm, items(5));
		const model = rowModelOf(vm);
		expect(model.keys.length).toBeGreaterThan(0);
		expect(domRowKeys(el)).toEqual(model.keys);
	});

	it('模型窗口切片等于派生层给出的同一段 key（顺序一致）', async () => {
		const { vm } = mountBody();
		const list = items(5);
		await renderItems(vm, list);
		const model = rowModelOf(vm);
		const derived = deriveFileRows(list).map((row) => row.key);
		expect(model.keys).toEqual(derived.slice(model.start, model.end));
	});

	it('模型带出窗口边界与度量（start/end/countPerLine/viewMode）', async () => {
		const { vm } = mountBody();
		await renderItems(vm, items(5));
		const model = rowModelOf(vm);
		expect(model.start).toBeGreaterThanOrEqual(0);
		expect(model.end).toBeGreaterThan(model.start);
		expect(model.countPerLine).toBeGreaterThan(0);
		expect(model.viewMode).toBe('list');
	});

	it('空目录：模型为空且与 DOM 一致（零行）', async () => {
		const { el, vm } = mountBody();
		await renderItems(vm, []);
		const model = rowModelOf(vm);
		expect(model.keys).toEqual([]);
		expect(domRowKeys(el)).toEqual([]);
	});

	it('getRowModel 返回副本：改它不影响内部状态', async () => {
		const { vm } = mountBody();
		await renderItems(vm, items(3));
		const first = rowModelOf(vm);
		first.keys.push('injected');
		first.start = 999;
		const second = rowModelOf(vm);
		expect(second.keys).not.toContain('injected');
		expect(second.start).not.toBe(999);
	});
});

describe('YMFileBodyPane（行描述 ↔ DOM 双写一致）', () => {
	it('行描述与 DOM 逐项一致：名称、文件夹标记、定位样式', async () => {
		const { el, vm } = mountBody();
		await renderItems(vm, [new FileItem('/a/ev', 'ev'), new FolderItem('/a/sub', 'sub')]);
		const model = rowModelOf(vm);
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
		const { el, vm } = mountBody();
		await renderItems(vm, items(60), 0);
		const before = rowModelOf(vm).rows.map((row) => row.index);
		expect(before[0]).toBe(rowModelOf(vm).start);
		Object.defineProperty(el, 'scrollLeft', { value: 600, configurable: true, writable: true });
		vm.resize();
		await nextTick();
		const after = rowModelOf(vm);
		expect(after.start).toBeGreaterThan(0);
		expect(after.rows[0].index).toBe(after.start);
	});

	it('选中态进入行描述（选中后 selected=true，取消后回到 false）', async () => {
		const { vm } = mountBody();
		await renderItems(vm, items(3), 0);
		expect(rowModelOf(vm).rows.every((row) => !row.selected)).toBe(true);
		vm.selectAll();
		await nextTick();
		expect(rowModelOf(vm).rows.some((row) => row.selected)).toBe(true);
		vm.unselect();
		await nextTick();
		expect(rowModelOf(vm).rows.every((row) => !row.selected)).toBe(true);
	});
});
