import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import YMFileNavPane from '../YMFileNavPane.vue';

type NavApi = InstanceType<typeof YMFileNavPane>;

interface FileItem {
	name: string;
	path: string;
	stats: { ino: unknown };
	parent?: FileItem;
	subfolders: FileItem[];
	getContext(node: HTMLElement): { element?: HTMLElement; expanded: boolean };
}

const makeFile = (name: string, parent?: FileItem): FileItem => ({
	name,
	path: parent ? `${parent.path}/${name}` : name,
	stats: { ino: name },
	parent,
	subfolders: [],
	getContext: () => ({ expanded: false })
});

const makeLinks = () => ({
	browser: {
		display: 'normal',
		update: vi.fn(),
		restoreDisplay: vi.fn(),
		backupFolders: [] as FileItem[]
	},
	nav: {},
	body: {}
});

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
};

const mountPane = () => {
	const wrapper = mount(YMFileNavPane, { props: { links: makeLinks() } });
	return { wrapper, vm: wrapper.vm as NavApi, el: wrapper.element as HTMLElement };
};

/** 夹具：把目录树喂给 pane（nav 从 `parentNode.directory` 读文件夹树） */
const feedDirectory = (el: HTMLElement, subfolders: FileItem[]): HTMLElement => {
	const parent = el.parentNode as HTMLElement & { directory?: unknown };
	parent.directory = { subfolders };
	return parent;
};

describe('YMFileNavPane', () => {
	it('mounts and exposes api through the component instance', () => {
		const { wrapper, vm, el } = mountPane();
		expect(el.classList.contains('file-nav-pane')).toBe(true);
		expect(typeof vm.load).toBe('function');
		expect(typeof vm.select).toBe('function');
		expect(typeof vm.unselect).toBe('function');
		expect(typeof vm.clear).toBe('function');
		expect(typeof vm.getSelections).toBe('function');
		// 元素上不再有方法：这条断言防止「又挂回元素」
		expect((el as { load?: unknown }).load).toBeUndefined();
		wrapper.unmount();
	});

	it('pressing 走实例访问器（拖拽流程用它清待定按下令牌）', () => {
		const { wrapper, vm } = mountPane();
		expect(vm.pressing).toBe(null);
		const sentinel = (): void => {};
		vm.pressing = sentinel;
		expect(vm.pressing).toBe(sentinel);
		vm.pressing = null;
		expect(vm.pressing).toBe(null);
		wrapper.unmount();
	});

	it('load renders folder items from parent directory', () => {
		const { wrapper, vm, el } = mountPane();
		const folderA = makeFile('A');
		const folderB = makeFile('B');
		feedDirectory(el, [folderA, folderB]);
		mockHeight(el);
		vm.load(folderA as never);
		const items = Array.from(el.querySelectorAll('.file-nav-item'));
		expect(items.length).toBeGreaterThan(0);
		expect(items[0].textContent).toContain('A');
		wrapper.unmount();
	});

	it('select adds selected class and getSelections returns files', () => {
		const { wrapper, vm, el } = mountPane();
		const folderA = makeFile('A');
		feedDirectory(el, [folderA]);
		mockHeight(el);
		vm.load(folderA as never);
		vm.select(folderA as never);
		expect(vm.getSelections()).toEqual([folderA]);
		const item = el.querySelector('.file-nav-item') as HTMLElement;
		expect(item.classList.contains('selected')).toBe(true);
		wrapper.unmount();
	});

	it('unselect clears selection', () => {
		const { wrapper, vm, el } = mountPane();
		const folderA = makeFile('A');
		feedDirectory(el, [folderA]);
		vm.load(folderA as never);
		vm.select(folderA as never);
		vm.unselect();
		expect(vm.getSelections()).toEqual([]);
		wrapper.unmount();
	});
});

describe('YMFileNavPane 的卸载清理', () => {
	/** Ctrl/Cmd 多选取消时会在 window 上登记一次性 pointerup；这里把那个状态造出来 */
	const pressItemWithCmdOrCtrl = (el: HTMLElement) => {
		const items = Array.from(el.querySelectorAll('.file-nav-item')) as HTMLElement[];
		expect(items.length).toBeGreaterThan(1);
		const event = new PointerEvent('pointerdown', { button: 0, bubbles: true });
		Object.defineProperty(event, 'cmdOrCtrlKey', { value: true });
		items[1].dispatchEvent(event);
	};

	it('多选按下后卸载：登记在 window 上的 pointerup 被摘掉', async () => {
		const { wrapper, vm, el } = mountPane();
		const folderA = makeFile('A');
		const folderB = makeFile('B');
		feedDirectory(el, [folderA, folderB]);
		mockHeight(el);
		vm.load(folderA as never);
		vm.select(folderA as never, folderB as never);
		pressItemWithCmdOrCtrl(el);
		await nextTick();

		const removed: string[] = [];
		const spy = vi
			.spyOn(window, 'removeEventListener')
			.mockImplementation((type: string | symbol) => void removed.push(String(type)));
		wrapper.unmount();
		spy.mockRestore();

		expect(removed).toContain('pointerup');
	});

	it('没按下过行时，卸载不会误摘 pointerup', () => {
		const { wrapper } = mountPane();

		const removed: string[] = [];
		const spy = vi
			.spyOn(window, 'removeEventListener')
			.mockImplementation((type: string | symbol) => void removed.push(String(type)));
		wrapper.unmount();
		spy.mockRestore();

		expect(removed).not.toContain('pointerup');
	});
});

describe('YMFileNavPane 的 pending-press 通道', () => {
	it('Ctrl 多选按下后抬手：window pointerup 能到达并清空令牌', async () => {
		const wrapper = mount(YMFileNavPane, {
			props: { links: makeLinks() },
			attachTo: document.body
		});
		const vm = wrapper.vm as NavApi;
		const el = wrapper.element as HTMLElement;
		const folderA = makeFile('A');
		const folderB = makeFile('B');
		feedDirectory(el, [folderA, folderB]);
		mockHeight(el);
		vm.load(folderA as never);
		vm.select(folderA as never, folderB as never);

		const items = Array.from(el.querySelectorAll('.file-nav-item')) as HTMLElement[];
		expect(items.length).toBeGreaterThan(1);
		const event = new PointerEvent('pointerdown', { button: 0, bubbles: true });
		Object.defineProperty(event, 'cmdOrCtrlKey', { value: true });
		items[1].dispatchEvent(event);

		expect(typeof vm.pressing).toBe('function');
		await nextTick();
		items[1].dispatchEvent(new PointerEvent('pointerup', { button: 0, bubbles: true }));
		expect(vm.pressing).toBe(null);
	});
});
