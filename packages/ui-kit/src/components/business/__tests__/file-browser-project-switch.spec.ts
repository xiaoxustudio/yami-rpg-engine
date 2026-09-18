import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import YMFileBrowser from '../YMFileBrowser/YMFileBrowser.vue';

/**
 * 项目切换回归：`Editor.close()` → `editor.getBrowserInstance().close()` 必须清掉上一个项目
 * 在文件浏览器里留下的行（nav 文件夹列表 + body 文件列表），否则打开新项目时旧行还在 DOM 里，
 * 与新行重叠（"上一次的项目在背景"）。
 *
 * 这里用的假目录/假文件类与真实类的契约相同：`getContext(node)` 按节点缓存上下文（含 `element`）。
 */

let inoSeq = 0;

interface FakeContext {
	element?: HTMLElement;
	expanded: boolean;
}

class FakeFile {
	name: string;
	basename: string;
	extname = '.json';
	path: string;
	type = 'actor';
	stats: { mtimeMs: number; ino: number };
	meta: { guid: string };
	data = { enabled: true };
	private contexts = new Map<unknown, FakeContext>();

	constructor(name: string, dir: string) {
		this.name = name;
		this.basename = name;
		this.path = `${dir}/${name}.json`;
		this.stats = { mtimeMs: 1, ino: ++inoSeq };
		this.meta = { guid: `guid-${this.path}` };
	}

	getContext(node: unknown): FakeContext {
		let context = this.contexts.get(node);
		if (context === undefined) {
			context = { expanded: false };
			this.contexts.set(node, context);
		}
		return context;
	}
}

class FakeFolder {
	name: string;
	path: string;
	subfolders: FakeFolder[] = [];
	children: FakeFile[] = [];
	parent?: FakeFolder;
	stats: { ino: number };
	private contexts = new Map<unknown, FakeContext>();

	constructor(name: string, path: string) {
		this.name = name;
		this.path = path;
		this.stats = { ino: ++inoSeq };
	}

	getContext(node: unknown): FakeContext {
		let context = this.contexts.get(node);
		if (context === undefined) {
			context = { expanded: false };
			this.contexts.set(node, context);
		}
		return context;
	}
}

const makeProject = (
	folderName: string,
	fileNames: string[]
): { assets: FakeFolder; folder: FakeFolder } => {
	const assets = new FakeFolder('Assets', '');
	const folder = new FakeFolder(folderName, folderName);
	// 真实 FolderItem 由 create() 建立 parent 链（头部地址栏沿 parent 拼面包屑）
	folder.parent = assets;
	folder.children = fileNames.map((name) => new FakeFile(name, folderName));
	assets.subfolders = [folder];
	return { assets, folder };
};

const makeProps = (getAssets: () => FakeFolder) => ({
	menuPopup: vi.fn(),
	directoryApi: {
		sortFiles: vi.fn(),
		getFolder: vi.fn(),
		update: vi.fn(() => Promise.resolve(false)),
		searchFiles: vi.fn(),
		readdir: vi.fn(() => Promise.resolve([])),
		moveFiles: vi.fn(() => Promise.resolve()),
		copyFiles: vi.fn(() => Promise.resolve()),
		saveFiles: vi.fn(() => Promise.resolve()),
		existsSync: () => false,
		get assets() {
			return getAssets();
		},
		inoMap: {}
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
		rename: () => Promise.resolve(),
		existsSync: () => false,
		addOversizeImagePaths: vi.fn()
	},
	pathUtil: {
		dirname: () => '',
		normalize: (p: string) => p,
		slash: (p: string) => p,
		extname: () => '.json',
		basename: (p: string) => p,
		resolve: (...p: string[]) => p.join('/')
	},
	localize: { createGetter: () => () => '' },
	fileClasses: { FileItem: FakeFile, FolderItem: FakeFolder },
	menuState: () => 'closed',
	createTextBox: () => null,
	dataApi: { manifest: { guidMap: {} } },
	windowApi: { confirm: vi.fn(), getTopWindow: () => null },
	glApi: { maxTexSize: 1024 },
	clipboardApi: { write: vi.fn(), read: vi.fn(() => null) },
	referenceApi: {
		findRelated: () => ({ isEmpty: true }),
		openList: vi.fn(),
		openRelated: vi.fn()
	},
	editorApi: { config: { dialogs: {} } },
	setIconClip: vi.fn(),
	onBrowserMount: vi.fn(),
	onSelectorMount: vi.fn()
});

interface PaneEl extends HTMLElement {
	load?: (...folders: unknown[]) => void;
	updateFiles?: () => void;
	computeGridProperties?: () => void;
	resize?: () => void;
	setViewIndex?: (index: number) => void;
}

const mockBox = (el: HTMLElement, width = 400, height = 300): void => {
	Object.defineProperty(el, 'clientWidth', { value: width, configurable: true });
	Object.defineProperty(el, 'clientHeight', { value: height, configurable: true });
	Object.defineProperty(el, 'getBoundingClientRect', {
		value: () => ({ width, height, top: 0, left: 0, right: width, bottom: height }),
		configurable: true
	});
};

describe('YMFileBrowser 项目切换', () => {
	let host: HTMLElement;
	let assets: FakeFolder;
	let wrapper: ReturnType<typeof mount> | null = null;
	let nav: PaneEl;
	let body: PaneEl;

	/**
	 * 真实结构里三个 pane 是 `#project-browser` 的直接子元素，store 也把 `Browser.directory`
	 * 写在它上面（nav 从 `parentNode.directory` 取文件夹树）。
	 * VTU 挂 fragment 根组件时会包一层 div，所以这里两个都写：宿主元素给组件读，pane 的父节点给 nav 读。
	 */
	const setDirectory = (value: unknown): void => {
		(host as HTMLElement & { directory?: unknown }).directory = value;
		(nav.parentNode as HTMLElement & { directory?: unknown }).directory = value;
	};

	const boot = async (): Promise<void> => {
		wrapper = mount(YMFileBrowser, { props: makeProps(() => assets), attachTo: host });
		await nextTick();
		await nextTick();
		nav = host.querySelector('.file-nav-pane') as PaneEl;
		body = host.querySelector('.file-body-pane') as PaneEl;
		mockBox(nav, 160, 300);
		mockBox(body, 400, 300);
		body.setViewIndex?.(0);
	};

	const bodyNames = (): string[] =>
		Array.from(host.querySelectorAll('.file-body-item .file-body-name')).map(
			(node) => node.textContent ?? ''
		);
	const navNames = (): string[] =>
		Array.from(host.querySelectorAll('.file-nav-item')).map((node) => node.textContent ?? '');
	const addressNames = (): string[] =>
		Array.from(host.querySelectorAll('.file-head-address > *'))
			.map((node) => node.textContent ?? '')
			.filter((text) => text !== '');

	beforeEach(() => {
		host = document.createElement('div');
		host.className = 'file-browser';
		host.style.cssText = 'width:600px;height:400px;';
		document.body.appendChild(host);
	});

	afterEach(() => {
		wrapper?.unmount();
		wrapper = null;
		host.remove();
	});

	it('close 之后清空文件夹列表与文件列表', async () => {
		const projectA = makeProject('FolderA', ['A1', 'A2']);
		assets = projectA.assets;
		await boot();

		// 模拟 store 的 `Browser.directory = Directory.assets` + loadFromProject 的 nav.load
		setDirectory(assets);
		nav.load?.(projectA.folder);
		await nextTick();

		expect(bodyNames()).toEqual(['A1', 'A2']);
		expect(navNames()).toEqual(['FolderA']);
		expect(addressNames()).toEqual(['Assets', 'FolderA']);

		(host as HTMLElement & { close?: () => void }).close?.();
		await nextTick();

		expect(bodyNames()).toEqual([]);
		expect(navNames()).toEqual([]);
		expect(addressNames()).toEqual([]);
		expect((host as HTMLElement & { directory?: unknown }).directory).toBe(null);
	});

	it('close 会清掉搜索框里的关键字并回到 normal 显示', async () => {
		const projectA = makeProject('FolderA', ['A1', 'A2']);
		assets = projectA.assets;
		await boot();

		setDirectory(assets);
		nav.load?.(projectA.folder);
		await nextTick();

		const searcher = host.querySelector('.file-head-searcher input') as HTMLInputElement;
		searcher.value = 'A1';
		(host as HTMLElement & { searchFiles?: (kw: string) => void }).searchFiles?.('A1');
		await nextTick();
		expect((host as HTMLElement & { display?: string }).display).toBe('search');

		(host as HTMLElement & { close?: () => void }).close?.();
		await nextTick();

		expect(searcher.value).toBe('');
		expect((host as HTMLElement & { display?: string }).display).toBe('normal');
	});

	it('切到另一个项目后只剩新项目的行', async () => {
		const projectA = makeProject('FolderA', ['A1', 'A2']);
		assets = projectA.assets;
		await boot();

		setDirectory(assets);
		nav.load?.(projectA.folder);
		await nextTick();
		expect(bodyNames()).toEqual(['A1', 'A2']);

		// Editor.close() → browser.close()
		(host as HTMLElement & { close?: () => void }).close?.();
		await nextTick();

		const projectB = makeProject('FolderB', ['B1']);
		assets = projectB.assets;
		setDirectory(assets);
		nav.load?.(projectB.folder);
		await nextTick();

		expect(bodyNames()).toEqual(['B1']);
		expect(navNames()).toEqual(['FolderB']);
	});

	/**
	 * Editor.open 的真实顺序：`close()`（`Layout.manager.switch(null)` 之后页面不可见）→
	 * `File.updateRoot` + `loadProject()`（此时 pane 还是隐藏的，`resize()` 会因 `clientHeight === 0`
	 * 提前返回）→ `Layout.manager.switch('directory')`（面板可见，ResizeObserver / pageResize 补一次
	 * resize）。这条路径必须保证"可见后只渲染新项目"，既不能留旧行，也不能空着不出行。
	 */
	it('页面隐藏期间切换项目，重新可见后只渲染新项目', async () => {
		const projectA = makeProject('FolderA', ['A1', 'A2']);
		assets = projectA.assets;
		await boot();

		setDirectory(assets);
		nav.load?.(projectA.folder);
		await nextTick();
		expect(bodyNames()).toEqual(['A1', 'A2']);

		// 页面切走：两个 pane 都变成 0 高
		mockBox(nav, 160, 0);
		mockBox(body, 400, 0);
		(host as HTMLElement & { close?: () => void }).close?.();
		await nextTick();

		// 隐藏期间载入新项目
		const projectB = makeProject('FolderB', ['B1']);
		assets = projectB.assets;
		setDirectory(assets);
		nav.load?.(projectB.folder);
		await nextTick();

		// 页面切回：ResizeObserver / pageResize 的等价动作
		mockBox(nav, 160, 300);
		mockBox(body, 400, 300);
		body.computeGridProperties?.();
		body.resize?.();
		nav.resize?.();
		await nextTick();

		expect(navNames()).toEqual(['FolderB']);
		expect(bodyNames()).toEqual(['B1']);
	});
});
