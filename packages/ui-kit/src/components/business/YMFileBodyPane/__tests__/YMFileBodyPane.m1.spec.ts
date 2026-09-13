import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import YMFileBodyPane from '../YMFileBodyPane.vue';

/**
 * P6/M1 行为金标准（文件 body 组，**第一批**）：锁住当前实现的"无输入不建行"契约与选区清理。
 *
 * ⚠️ 行渲染 / 网格度量 / 尺寸三类用例**尚未写出**（见文件末尾 `it.todo`）——原因是这套 SFC 的
 * 元素 API 挂在**面板元素**上（`attachApi(el.value, …)`），而行渲染要走
 * `createFlatItems → computeGridProperties → updateContentSize → resize` 且 `computeGridProperties`
 * 在 `rect(node).width <= 0` 时直接 return；jsdom 下还需要补 `getBoundingClientRect` 等一整套
 * 尺寸桩，并让 `.file-body-content` 上的度量字段可读。已记入 `docs/monolith-render-plan.md` 的 M1 段。
 */
class FileItem {
	path: string;
	name: string;
	basename: string;
	extname: string;
	type: string;
	children: FileItem[] = [];
	parent?: FileItem;
	context: { element?: HTMLElement } = {};
	constructor(path: string, name: string, extname = '') {
		this.path = path;
		this.name = name;
		this.basename = name;
		this.extname = extname;
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
	parent?: FolderItem;
	context: { element?: HTMLElement } = {};
	constructor(path: string, name: string) {
		this.path = path;
		this.name = name;
	}
	getContext(): { element?: HTMLElement } {
		return this.context;
	}
}

interface BodyElement extends HTMLElement {
	[k: string]: unknown;
	createFlatItems: (dir: unknown[]) => void;
	selectAll: () => void;
	unselect: () => void;
	updateFiles: () => void;
	selections?: unknown[];
}

const makeLinks = (display = 'normal') => ({
	browser: { display, filters: null, searchResults: null, backToParentFolder: vi.fn() },
	nav: { selections: [], load: vi.fn(), scrollToSelection: vi.fn() },
	body: null
});

const mountBody = (display = 'normal') => {
	const wrapper = mount(YMFileBodyPane, {
		props: { links: makeLinks(display), fileClasses: { FileItem, FolderItem } }
	});
	return { wrapper, el: wrapper.element as BodyElement };
};

const rows = (el: BodyElement): HTMLElement[] =>
	Array.from(el.querySelectorAll<HTMLElement>('.file-body-item'));

describe('YMFileBodyPane（M1 行为金标准 第一批：无输入不建行 / 选区清理）', () => {
	it('createFlatItems：空目录不产生行', () => {
		const { el } = mountBody();
		el.createFlatItems([]);
		expect(rows(el).length).toBe(0);
	});

	it('updateFiles：display=normal 且没有目录文件时不建行', () => {
		const { el } = mountBody('normal');
		el.updateFiles();
		expect(rows(el).length).toBe(0);
	});

	it('unselect：没有选中项时安全清空（selections 归零、DOM 无 selected）', () => {
		const { el } = mountBody();
		el.createFlatItems([]);
		el.selectAll();
		el.unselect();
		expect(el.selections ?? []).toEqual([]);
		expect(rows(el).filter((row) => row.classList.contains('selected')).length).toBe(0);
	});
});

describe.todo('YMFileBodyPane（M1 行为金标准 待补：行渲染/选区/度量/尺寸）', () => {
	it.todo('createFlatItems + resize：按文件建立可见行（文本含文件名）');
	it.todo('createFlatItems：文件夹与文件都能成行');
	it.todo('selectAll：行上出现 selected 类、selections 非空');
	it.todo('selectByPath：只选中路径匹配的那一行');
	it.todo('computeGridProperties：normal 下算出每行数量/可见行数/行高');
	it.todo('computeGridProperties：scroll 与 normal 的每行数量不同');
	it.todo('updateContentSize：内容元素拿到滚动区尺寸');
});
