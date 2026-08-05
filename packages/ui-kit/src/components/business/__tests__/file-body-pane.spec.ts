import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import YMFileBodyPane from '../YMFileBodyPane/YMFileBodyPane.vue';

function makeFile(name: string, type = 'image') {
	const file: any = {
		name,
		basename: name,
		extname: '.png',
		path: `C:/test/${name}.png`,
		type,
		stats: { mtimeMs: 1 },
		meta: { guid: `guid-${name}` },
		data: null
	};
	const ctx: any = { element: undefined };
	file.getContext = () => ctx;
	return file;
}

function makeProps(extra: any = {}) {
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
		const el = wrapper.element as any;
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
		(wrapper.vm as any).select(a, b);
		expect((wrapper.element as any).selections).toEqual([a, b]);
		wrapper.vm.unselect();
		expect((wrapper.element as any).selections).toEqual([]);
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
		(wrapper.vm as any).setViewIndex(2);
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
		(wrapper.element as any).updateFiles();
		await new Promise((r) => setTimeout(r, 30));
		expect((wrapper.element as any).elements.count).toBeGreaterThan(0);
		wrapper.unmount();
	});

	it('keydown Delete triggers deleteFiles flow', async () => {
		const props = makeProps();
		const wrapper = mount(YMFileBodyPane, { props, attachTo: host });
		const a = makeFile('A');
		(wrapper.vm as any).select(a);
		const node = wrapper.element as any;
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
});
