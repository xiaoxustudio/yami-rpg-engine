import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import YMFileBodyPane from '../YMFileBodyPane.vue';
import { deriveFileRows } from '../file-body-render';

/**
 * P6/M3 切片 1：渲染出的行必须带**派生层发的稳定行 key**（`element.rowKey`）。
 * 这一步是 `v-for` 换源的前置条件——M3 换模板时这些 key 直接当 `:key`。
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

interface BodyElement extends HTMLElement {
	[k: string]: unknown;
	createFlatItems: (dir: unknown[]) => void;
	updateFiles: () => void;
	setViewIndex: (idx: number) => void;
	updateViewMode: () => void;
	computeGridProperties: () => void;
	updateContentSize: () => void;
	resize: () => void;
	selections?: unknown[];
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

const renderItems = async (el: BodyElement, list: unknown[]): Promise<void> => {
	el.setViewIndex(0);
	el.updateViewMode();
	el.createFlatItems(list);
	el.computeGridProperties();
	el.updateContentSize();
	el.resize();
	await nextTick();
	await nextTick();
};

const rows = (el: BodyElement): (HTMLElement & { rowKey?: string })[] =>
	Array.from(el.querySelectorAll<HTMLElement>('.file-body-item'));

describe('YMFileBodyPane（M3 切片 1：行 key 接线）', () => {
	it('文件行与文件夹行都带上派生层发的 rowKey', async () => {
		const { el } = mountBody();
		const list = [new FileItem('/a/ev', 'ev'), new FolderItem('/a/sub', 'sub')];
		await renderItems(el, list);
		const expected = deriveFileRows(list).map((row) => row.key);
		expect(rows(el).map((row) => row.rowKey)).toEqual(expected);
	});

	it('重复渲染后 key 不变（同一对象复用同一 key）', async () => {
		const { el } = mountBody();
		const list = [new FileItem('/a/ev', 'ev')];
		await renderItems(el, list);
		const before = rows(el)[0].rowKey;
		await renderItems(el, list);
		expect(rows(el)[0].rowKey).toBe(before);
	});

	it('不同对象即使路径相同也拿到不同 key（不能拿路径当 key）', async () => {
		const { el } = mountBody();
		const list = [new FileItem('/a/same', 'same'), new FileItem('/a/same', 'same')];
		await renderItems(el, list);
		const keys = rows(el).map((row) => row.rowKey);
		expect(keys[0]).not.toBe(keys[1]);
	});
});
