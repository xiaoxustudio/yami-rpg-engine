import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import YMFileBodyPane from '../YMFileBodyPane/YMFileBodyPane.vue';

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
		update: vi.fn(),
		restoreDisplay: vi.fn(),
		getFilePaths: vi.fn(() => ({ relativePaths: [], absolutePaths: [] }))
	};
	const nav = { selections: [], load: vi.fn(), scrollToSelection: vi.fn() };
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

interface FileBodyPaneElement extends HTMLElement {
	[k: string]: unknown;
	updateFiles: () => void;
	select: (a: unknown, b?: unknown) => void;
	unselect: () => void;
	setViewIndex: (index: number) => void;
	clear: () => void;
	on: (type: string, listener: (event: Event) => void) => void;
	content: unknown;
	selections: unknown[];
	elements: { count: number } & { [i: number]: HTMLElement | undefined };
}

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

	it('mounts and exposes core api', () => {
		const props = makeProps();
		const wrapper = mount(YMFileBodyPane, { props, attachTo: host });
		const el = wrapper.element as unknown as FileBodyPaneElement;
		expect(el.className).toContain('file-body-pane');
		expect(typeof el.updateFiles).toBe('function');
		expect(typeof el.select).toBe('function');
		expect(typeof el.setViewIndex).toBe('function');
		expect(typeof el.clear).toBe('function');
		expect(el.content).toBeTruthy();
		wrapper.unmount();
	});

	it('select/unselect toggles selection', () => {
		const props = makeProps();
		const wrapper = mount(YMFileBodyPane, { props, attachTo: host });
		const a = makeFile('A');
		const b = makeFile('B');
		(wrapper.vm as unknown as FileBodyPaneElement).select(a, b);
		expect((wrapper.element as unknown as FileBodyPaneElement).selections).toEqual([a, b]);
		wrapper.vm.unselect();
		expect((wrapper.element as unknown as FileBodyPaneElement).selections).toEqual([]);
		wrapper.unmount();
	});

	it('setViewIndex writes to head view and updates mode', () => {
		const viewWrite = vi.fn();
		const props = makeProps({
			links: {
				browser: { display: 'normal' },
				nav: { selections: [] },
				head: { view: { write: viewWrite } }
			}
		});
		const wrapper = mount(YMFileBodyPane, { props, attachTo: host });
		(wrapper.vm as unknown as FileBodyPaneElement).setViewIndex(2);
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
				nav: { selections: [folder] }
			}
		});
		Object.setPrototypeOf(a, FileItemClass.prototype);
		const wrapper = mount(YMFileBodyPane, { props, attachTo: host });
		Object.defineProperty(wrapper.element, 'clientHeight', { value: 300, configurable: true });
		Object.defineProperty(wrapper.element, 'clientWidth', { value: 400, configurable: true });
		(wrapper.element as unknown as FileBodyPaneElement).updateFiles();
		await new Promise((r) => setTimeout(r, 30));
		expect((wrapper.element as unknown as FileBodyPaneElement).elements.count).toBeGreaterThan(
			0
		);
		wrapper.unmount();
	});

	it('暴露拖拽流程依赖的 activeFile / pressing / deactivateFile（legacy 元素成员）', async () => {
		const FileItemClass = class FileItem {};
		const FolderItemClass = class FolderItem {};
		const a = makeFile('A');
		const folder = { children: [a] };
		const props = makeProps({
			fileClasses: { FileItem: FileItemClass, FolderItem: FolderItemClass },
			links: {
				browser: { display: 'normal', filters: null },
				nav: { selections: [folder] },
				head: { view: { write: vi.fn() } }
			}
		});
		Object.setPrototypeOf(a, FileItemClass.prototype);
		const wrapper = mount(YMFileBodyPane, { props, attachTo: host });
		const node = wrapper.element as unknown as FileBodyPaneElement & {
			activeFile?: unknown;
			pressing?: unknown;
			deactivateFile?: () => void;
			selectActiveFile?: () => void;
		};
		Object.defineProperty(node, 'clientHeight', { value: 300, configurable: true });
		Object.defineProperty(node, 'clientWidth', { value: 400, configurable: true });
		Object.defineProperty(node, 'getBoundingClientRect', {
			value: () => ({ width: 400, height: 300, top: 0, left: 0, right: 400, bottom: 300 }),
			configurable: true
		});
		node.setViewIndex(0);
		node.updateFiles();
		await nextTick();

		const row = node.querySelector('.file-body-item') as HTMLElement & { file?: unknown };
		expect(row).not.toBe(null);

		row.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		expect(node.activeFile).toBe(row.file);
		expect(typeof node.pressing).toBe('function');

		node.pressing = null;
		window.dispatchEvent(new PointerEvent('pointerup'));
		expect(node.selections).toEqual([]);

		expect(row.classList.contains('selected')).toBe(true);
		expect(typeof node.deactivateFile).toBe('function');
		node.deactivateFile?.();
		expect(node.activeFile).toBe(null);
		expect(row.classList.contains('selected')).toBe(false);

		wrapper.unmount();
	});

	it('按下行的激活走元素覆写（选择器窗口 activateFile = select）', async () => {
		const FileItemClass = class FileItem {};
		const FolderItemClass = class FolderItem {};
		const a = makeFile('A');
		const props = makeProps({
			fileClasses: { FileItem: FileItemClass, FolderItem: FolderItemClass },
			links: {
				browser: { display: 'normal', filters: null },
				nav: { selections: [{ children: [a] }] },
				head: { view: { write: vi.fn() } }
			}
		});
		Object.setPrototypeOf(a, FileItemClass.prototype);
		const wrapper = mount(YMFileBodyPane, { props, attachTo: host });
		const node = wrapper.element as unknown as FileBodyPaneElement & {
			activateFile?: (file: unknown) => void;
			activeFile?: unknown;
		};
		Object.defineProperty(node, 'clientHeight', { value: 300, configurable: true });
		Object.defineProperty(node, 'clientWidth', { value: 400, configurable: true });
		Object.defineProperty(node, 'getBoundingClientRect', {
			value: () => ({ width: 400, height: 300, top: 0, left: 0, right: 400, bottom: 300 }),
			configurable: true
		});
		node.setViewIndex(0);
		node.updateFiles();
		await nextTick();

		const override = vi.fn();
		node.activateFile = override;
		const row = node.querySelector('.file-body-item') as HTMLElement;
		row.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));

		expect(override).toHaveBeenCalledTimes(1);
		expect(node.activeFile).toBe(null);

		wrapper.unmount();
	});

	it('keydown Delete triggers deleteFiles flow', async () => {
		const props = makeProps();
		const wrapper = mount(YMFileBodyPane, { props, attachTo: host });
		const a = makeFile('A');
		(wrapper.vm as unknown as FileBodyPaneElement).select(a);
		const node = wrapper.element as unknown as FileBodyPaneElement;
		const ctx = a.getContext(node);
		ctx.element = document.createElement('div');
		node.elements[0] = ctx.element;
		node.elements.count = 1;
		wrapper.element.dispatchEvent(
			new KeyboardEvent('keydown', { code: 'Delete', bubbles: true })
		);
		await new Promise((r) => setTimeout(r, 30));
		expect(props.windowApi.confirm).toHaveBeenCalled();
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
				nav: { selections: [{ children: [a] }] },
				head: { view: { write: vi.fn() } }
			}
		});
		Object.setPrototypeOf(a, FileItemClass.prototype);
		const wrapper = mount(YMFileBodyPane, { props, attachTo: host });
		const node = wrapper.element as unknown as FileBodyPaneElement;
		Object.defineProperty(node, 'clientHeight', { value: 300, configurable: true });
		Object.defineProperty(node, 'clientWidth', { value: 400, configurable: true });
		Object.defineProperty(node, 'getBoundingClientRect', {
			value: () => ({ width: 400, height: 300, top: 0, left: 0, right: 400, bottom: 300 }),
			configurable: true
		});
		node.setViewIndex(0);
		node.updateFiles();
		const opened: unknown[] = [];
		node.on('open', (event: Event) =>
			opened.push((event as Event & { value?: unknown }).value)
		);
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
