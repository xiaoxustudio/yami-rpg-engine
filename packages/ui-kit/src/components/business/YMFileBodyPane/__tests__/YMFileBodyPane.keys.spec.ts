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

const renderItems = async (vm: BodyApi, list: unknown[]): Promise<void> => {
	vm.setViewIndex(0);
	vm.updateViewMode();
	vm.createFlatItems(list);
	vm.computeGridProperties();
	vm.updateContentSize();
	vm.resize();
	await nextTick();
	await nextTick();
};

const rows = (el: HTMLElement): (HTMLElement & { rowKey?: string })[] =>
	Array.from(el.querySelectorAll<HTMLElement>('.file-body-item'));

describe('YMFileBodyPane（行 key 接线）', () => {
	it('文件行与文件夹行都带上派生层发的 rowKey', async () => {
		const { el, vm } = mountBody();
		const list = [new FileItem('/a/ev', 'ev'), new FolderItem('/a/sub', 'sub')];
		await renderItems(vm, list);
		const expected = deriveFileRows(list).map((row) => row.key);
		expect(rows(el).map((row) => row.rowKey)).toEqual(expected);
	});

	it('重复渲染后 key 不变（同一对象复用同一 key）', async () => {
		const { el, vm } = mountBody();
		const list = [new FileItem('/a/ev', 'ev')];
		await renderItems(vm, list);
		const before = rows(el)[0].rowKey;
		await renderItems(vm, list);
		expect(rows(el)[0].rowKey).toBe(before);
	});

	it('不同对象即使路径相同也拿到不同 key（不能拿路径当 key）', async () => {
		const { el, vm } = mountBody();
		const list = [new FileItem('/a/same', 'same'), new FileItem('/a/same', 'same')];
		await renderItems(vm, list);
		const keys = rows(el).map((row) => row.rowKey);
		expect(keys[0]).not.toBe(keys[1]);
	});
});
