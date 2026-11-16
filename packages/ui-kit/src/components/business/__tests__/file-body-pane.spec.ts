import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import YMFileBodyPane from '../YMFileBodyPane/YMFileBodyPane.vue';

type BodyApi = InstanceType<typeof YMFileBodyPane>;

function makeFile(name: string, type = 'image') {
	const file: {
		name: string;
		basename: string;
		extname: string;
		path: string;
		type: string;
		stats: { mtimeMs: number };
		meta: { guid: string };
		data: { id?: string } | null;
		getContext: (element: HTMLElement) => { element: HTMLElement | undefined };
	} = {
		name,
		basename: name,
		extname: '.png',
		path: `C:/test/${name}.png`,
		type,
		stats: { mtimeMs: 1 },
		meta: { guid: `guid-${name}` },
		data: null,
		getContext: () => ({ element: undefined })
	};
	const ctx: { element: HTMLElement | undefined } = { element: undefined };
	file.getContext = () => ctx;
	return file;
}

function makeProps(extra: Record<string, unknown> = {}) {
	const browser = {
		display: 'normal',
		filters: null as string[] | null,
		searchResults: [],
		update: vi.fn(),
		restoreDisplay: vi.fn(),
		getFilePaths: vi.fn(() => ({ relativePaths: [], absolutePaths: [] }))
	};
	const nav = { getSelections: () => [] as unknown[], load: vi.fn(), scrollToSelection: vi.fn() };
	const links = { browser, nav, body: null, head: { view: { write: vi.fn() } } };
	return {
		links,
		fileClasses: {
			FileItem: class FileItem {},
			FolderItem: class FolderItem {}
		},
		directoryApi: {
			sortFiles: vi.fn(),
			getFolder: vi.fn(),
			update: vi.fn(),
			assets: null,
			inoMap: {},
			deleteFiles: vi.fn(() => Promise.resolve()),
			moveFiles: vi.fn(() => Promise.resolve()),
			copyFiles: vi.fn(() => Promise.resolve()),
			saveFiles: vi.fn(() => Promise.resolve()),
			readdir: vi.fn(() => Promise.resolve([]))
		},
		fileSystemApi: {
			path: (p: string) => p,
			route: (p: string) => p,
			getPath: (p: string) => p,
			getFileName: () => ({ path: 'p', route: 'r' }),
			getImageResolution: () => Promise.resolve({ width: 1, height: 1 }),
			showInExplorer: vi.fn(),
			showOpenDialog: () => Promise.resolve({ filePaths: [] }),
			showSaveDialog: () => Promise.resolve({}),
			mkdir: () => Promise.resolve(),
			copyFile: () => Promise.resolve(),
			stat: () => Promise.resolve(),
			rename: vi.fn(() => Promise.resolve()),
			existsSync: () => false,
			addOversizeImagePaths: vi.fn()
		},
		pathUtil: {
			dirname: () => 'C:/test',
			normalize: (p: string) => p,
			slash: (p: string) => p,
			extname: () => '.png',
			basename: (p: string) => p,
			resolve: (...p: string[]) => p.join('/')
		},
		localize: { createGetter: () => () => 'Confirm' },
		windowApi: { confirm: vi.fn(), getTopWindow: () => null },
		glApi: { maxTexSize: 1024 },
		menuState: () => 'closed',
		clipboardApi: { write: vi.fn(), read: vi.fn(() => null) },
		referenceApi: {
			findRelated: () => ({ isEmpty: true }),
			openList: vi.fn(),
			openRelated: vi.fn()
		},
		editorApi: { config: { dialogs: {} } },
		dataApi: { manifest: { guidMap: {} } },
		setIconClip: vi.fn(),
		createTextBox: () => null,
		...extra
	};
}

/** 夹具把尺寸钉死：body 的行窗口按 `clientWidth/Height` 与 `getBoundingClientRect` 计算 */
const mockBox = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 300, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 400, configurable: true });
	Object.defineProperty(el, 'getBoundingClientRect', {
		value: () => ({ width: 400, height: 300, top: 0, left: 0, right: 400, bottom: 300 }),
		configurable: true
	});
};

describe('YMFileBodyPane', () => {
	let host: HTMLElement;

	beforeEach(() => {
		host = document.createElement('div');
		host.style.cssText = 'width:400px;height:300px;';
		document.body.appendChild(host);
	});

	afterEach(() => {
		host.remove();
	});

	it('mounts and exposes core api through the component instance', () => {
		const wrapper = mount(YMFileBodyPane, { props: makeProps(), attachTo: host });
		const vm = wrapper.vm as BodyApi;
		const el = wrapper.element;
		expect(el.className).toContain('file-body-pane');
		expect(typeof vm.updateFiles).toBe('function');
		expect(typeof vm.select).toBe('function');
		expect(typeof vm.setViewIndex).toBe('function');
		expect(typeof vm.clear).toBe('function');
		expect(vm.content).toBeTruthy();
		// 元素上不再有方法/`selections`：这条断言防止「又挂回元素」
		const raw = el as { select?: unknown; selections?: unknown };
		expect(raw.select).toBeUndefined();
		expect(raw.selections).toBeUndefined();
		wrapper.unmount();
	});

	it('select/unselect toggles selection', () => {
		const wrapper = mount(YMFileBodyPane, { props: makeProps(), attachTo: host });
		const vm = wrapper.vm as BodyApi;
		const a = makeFile('A');
		const b = makeFile('B');
		vm.select(a as never, b as never);
		expect(vm.getSelections()).toEqual([a, b]);
		vm.unselect();
		expect(vm.getSelections()).toEqual([]);
		wrapper.unmount();
	});

	it('setViewIndex writes to head view and updates mode', () => {
		const viewWrite = vi.fn();
		const props = makeProps({
			links: {
				browser: { display: 'normal' },
				nav: { getSelections: () => [] },
				head: { view: { write: viewWrite } }
			}
		});
		const wrapper = mount(YMFileBodyPane, { props, attachTo: host });
		(wrapper.vm as BodyApi).setViewIndex(2);
		expect(viewWrite).toHaveBeenCalledWith(2);
		expect(wrapper.element.querySelector('.file-body-content')?.className).toContain('medium');
		wrapper.unmount();
	});

	it('updateFiles creates items from folder children', async () => {
		const FileItemClass = class FileItem {};
		const FolderItemClass = class FolderItem {};
		const a = makeFile('A');
		const folder = { children: [a] };
		const props = makeProps({
			fileClasses: { FileItem: FileItemClass, FolderItem: FolderItemClass },
			links: {
				browser: { display: 'normal', filters: null },
				nav: { getSelections: () => [folder] },
				head: { view: { write: vi.fn() } }
			}
		});
		Object.setPrototypeOf(a, FileItemClass.prototype);
		const wrapper = mount(YMFileBodyPane, { props, attachTo: host });
		mockBox(wrapper.element);
		const vm = wrapper.vm as BodyApi;
		vm.setViewIndex(0);
		vm.updateFiles();
		await new Promise((r) => setTimeout(r, 30));
		expect(vm.getFileCount()).toBeGreaterThan(0);
		expect(wrapper.element.querySelectorAll('.file-body-item').length).toBeGreaterThan(0);
		wrapper.unmount();
	});

	it('暴露拖拽流程依赖的 activeFile / pressing / deactivateFile（实例句柄）', async () => {
		const FileItemClass = class FileItem {};
		const FolderItemClass = class FolderItem {};
		const a = makeFile('A');
		const folder = { children: [a] };
		const props = makeProps({
			fileClasses: { FileItem: FileItemClass, FolderItem: FolderItemClass },
			links: {
				browser: { display: 'normal', filters: null },
				nav: { getSelections: () => [folder] },
				head: { view: { write: vi.fn() } }
			}
		});
		Object.setPrototypeOf(a, FileItemClass.prototype);
		const wrapper = mount(YMFileBodyPane, { props, attachTo: host });
		const node = wrapper.element;
		mockBox(node);
		const vm = wrapper.vm as BodyApi;
		vm.setViewIndex(0);
		vm.updateFiles();
		await nextTick();

		const row = node.querySelector('.file-body-item') as HTMLElement & { file?: unknown };
		expect(row).not.toBe(null);

		row.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		expect(vm.activeFile).toBe(row.file);
		expect(typeof vm.pressing).toBe('function');

		vm.pressing = null;
		window.dispatchEvent(new PointerEvent('pointerup'));
		expect(vm.getSelections()).toEqual([]);

		expect(row.classList.contains('selected')).toBe(true);
		vm.deactivateFile();
		expect(vm.activeFile).toBe(null);
		expect(row.classList.contains('selected')).toBe(false);

		wrapper.unmount();
	});

	it('按下行的激活走实例覆写（选择器窗口 setActivateFile = select）', async () => {
		const FileItemClass = class FileItem {};
		const FolderItemClass = class FolderItem {};
		const a = makeFile('A');
		const props = makeProps({
			fileClasses: { FileItem: FileItemClass, FolderItem: FolderItemClass },
			links: {
				browser: { display: 'normal', filters: null },
				nav: { getSelections: () => [{ children: [a] }] },
				head: { view: { write: vi.fn() } }
			}
		});
		Object.setPrototypeOf(a, FileItemClass.prototype);
		const wrapper = mount(YMFileBodyPane, { props, attachTo: host });
		const node = wrapper.element;
		mockBox(node);
		const vm = wrapper.vm as BodyApi;
		vm.setViewIndex(0);
		vm.updateFiles();
		await nextTick();

		const override = vi.fn();
		vm.setActivateFile(override);
		const row = node.querySelector('.file-body-item') as HTMLElement;
		row.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));

		expect(override).toHaveBeenCalledTimes(1);
		expect(vm.activeFile).toBe(null);

		wrapper.unmount();
	});

	it('keydown Delete triggers deleteFiles flow', async () => {
		const FileItemClass = class FileItem {};
		const FolderItemClass = class FolderItem {};
		const a = makeFile('A');
		const props = makeProps({
			fileClasses: { FileItem: FileItemClass, FolderItem: FolderItemClass },
			links: {
				browser: { display: 'normal', filters: null },
				nav: { getSelections: () => [{ children: [a] }] },
				head: { view: { write: vi.fn() } }
			}
		});
		Object.setPrototypeOf(a, FileItemClass.prototype);
		const wrapper = mount(YMFileBodyPane, { props, attachTo: host });
		const node = wrapper.element;
		mockBox(node);
		const vm = wrapper.vm as BodyApi;
		vm.setViewIndex(0);
		vm.updateFiles();
		await nextTick();
		// 先让行渲染出来（`deleteFiles` 只删可见行里的选中项）
		vm.select(a as never);
		await nextTick();
		node.dispatchEvent(new KeyboardEvent('keydown', { code: 'Delete', bubbles: true }));
		await new Promise((r) => setTimeout(r, 30));
		expect(
			(props.windowApi as { confirm: ReturnType<typeof vi.fn> }).confirm
		).toHaveBeenCalled();
		wrapper.unmount();
	});

	it('双击行派发 open 事件（文件浏览器据此打开事件编辑器）', async () => {
		const FileItemClass = class FileItem {};
		const FolderItemClass = class FolderItem {};
		const a = makeFile('e1', 'event');
		a.meta = { guid: 'guid-e1' };
		a.data = { id: 'e1' };
		const props = makeProps({
			fileClasses: { FileItem: FileItemClass, FolderItem: FolderItemClass },
			links: {
				browser: { display: 'normal', filters: null },
				nav: { getSelections: () => [{ children: [a] }] },
				head: { view: { write: vi.fn() } }
			}
		});
		Object.setPrototypeOf(a, FileItemClass.prototype);
		const wrapper = mount(YMFileBodyPane, { props, attachTo: host });
		const node = wrapper.element;
		mockBox(node);
		const vm = wrapper.vm as BodyApi;
		vm.setViewIndex(0);
		vm.updateFiles();
		const opened: unknown[] = [];
		vm.on('open', (event: Event) => opened.push((event as Event & { value?: unknown }).value));
		await nextTick();

		const row = node.querySelector('.file-body-item') as HTMLElement;
		const click = (target: HTMLElement, type: string): void => {
			target.dispatchEvent(
				new MouseEvent(type, { bubbles: true, button: 0, clientX: 10, clientY: 10 })
			);
		};
		const firstIcon = row.querySelector('.file-body-icon') as HTMLElement;
		click(firstIcon, 'pointerdown');
		click(firstIcon, 'pointerup');
		await nextTick();

		const secondRow = node.querySelector('.file-body-item') as HTMLElement;
		const secondIcon = secondRow.querySelector('.file-body-icon') as HTMLElement;
		click(secondIcon, 'pointerdown');
		click(secondIcon, 'pointerup');

		expect(opened).toHaveLength(1);
		expect((opened[0] as { name?: string }).name).toBe('e1');
		wrapper.unmount();
	});
});
