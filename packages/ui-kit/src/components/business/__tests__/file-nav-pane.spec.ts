import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import YMFileNavPane from '../YMFileNavPane/YMFileNavPane.vue';

type NavApi = InstanceType<typeof YMFileNavPane>;

interface FileItem {
	name: string;
	path: string;
	stats: { ino: string };
	subfolders: FileItem[];
	getContext(element: HTMLElement): { element: undefined; expanded: boolean };
}

function makeFile(name: string, subfolders: FileItem[] = []) {
	const file: FileItem = {
		name,
		path: `C:/test/${name}`,
		subfolders,
		stats: { ino: name },
		getContext: () => ({ element: undefined, expanded: false })
	};
	const ctx: { element: undefined; expanded: boolean } = { element: undefined, expanded: false };
	file.getContext = () => ctx;
	return file;
}

function makeProps(extra: Record<string, unknown> = {}) {
	const browser = {
		display: 'normal',
		update: vi.fn(),
		restoreDisplay: vi.fn(),
		backupFolders: []
	};
	const links = { browser, nav: null, body: null };
	return {
		links,
		directoryApi: {
			sortFiles: vi.fn(),
			getFolder: vi.fn((p: string) => ({ name: p })),
			update: vi.fn(),
			assets: null,
			inoMap: {}
		},
		fileSystem: {
			path: (p: string) => p,
			rename: vi.fn(() => Promise.resolve()),
			existsSync: vi.fn(() => false)
		},
		pathUtil: { dirname: (p: string) => p.slice(0, p.lastIndexOf('/')) },
		menuState: () => 'closed',
		createTextBox: () => null,
		...extra
	};
}

describe('YMFileNavPane', () => {
	let host: HTMLElement;

	beforeEach(() => {
		host = document.createElement('div');
		host.style.cssText = 'width:300px;height:400px;';
		document.body.appendChild(host);
	});

	afterEach(() => {
		host.remove();
	});

	it('mounts and exposes core api through the component instance', () => {
		const props = makeProps();
		const wrapper = mount(YMFileNavPane, { props, attachTo: host });
		const vm = wrapper.vm as NavApi;
		expect(wrapper.element.className).toContain('file-nav-pane');
		expect(typeof vm.load).toBe('function');
		expect(typeof vm.update).toBe('function');
		expect(typeof vm.select).toBe('function');
		expect(typeof vm.clear).toBe('function');
		// 元素上不再有方法：这条断言防止「又挂回元素」
		expect((wrapper.element as { load?: unknown }).load).toBeUndefined();
		wrapper.unmount();
	});

	it('暴露拖拽流程写入的 pressing（实例访问器）', () => {
		const props = makeProps();
		const wrapper = mount(YMFileNavPane, { props, attachTo: host });
		const vm = wrapper.vm as NavApi;
		expect(vm.pressing).toBe(null);
		const sentinel = (): void => {};
		vm.pressing = sentinel;
		expect(vm.pressing).toBe(sentinel);
		vm.pressing = null;
		expect(vm.pressing).toBe(null);
		wrapper.unmount();
	});

	it('select stores selections (load selects folders and calls browser update)', () => {
		const props = makeProps();
		const wrapper = mount(YMFileNavPane, { props, attachTo: host });
		const vm = wrapper.vm as NavApi;
		const file = makeFile('Assets');
		vm.select(file as never);
		expect(vm.getSelections()).toContain(file);
		wrapper.unmount();
	});

	it('select/unselect toggles selection state', async () => {
		const props = makeProps();
		const wrapper = mount(YMFileNavPane, { props, attachTo: host });
		const vm = wrapper.vm as NavApi;
		const a = makeFile('A');
		const b = makeFile('B');
		vm.select(a as never);
		vm.select(a as never, b as never);
		expect(vm.getSelections()).toEqual([a, b]);
		vm.unselect();
		expect(vm.getSelections()).toEqual([]);
		wrapper.unmount();
	});

	it('keydown ArrowRight expands single selection', async () => {
		const props = makeProps();
		const wrapper = mount(YMFileNavPane, { props, attachTo: host });
		const vm = wrapper.vm as NavApi;
		const sub = makeFile('Sub');
		const file = makeFile('Folder', [sub]);
		vm.select(file as never);
		const el = wrapper.element;
		el.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true }));
		expect(file.getContext(el).expanded).toBe(true);
		el.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true }));
		expect(file.getContext(el).expanded).toBe(false);
		wrapper.unmount();
	});

	it('pointerdown on folder-mark toggles expansion', async () => {
		const props = makeProps();
		const wrapper = mount(YMFileNavPane, { props, attachTo: host });
		const sub = makeFile('Sub');
		const file = makeFile('Folder', [sub]);
		const el = wrapper.element;
		const element = document.createElement('div') as unknown as HTMLElement & {
			[k: string]: unknown;
		};
		element.classList.add('file-nav-item');
		element.file = file;
		const folderMark = document.createElement('span');
		folderMark.classList.add('folder-mark');
		element.appendChild(folderMark);
		el.appendChild(element);
		Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
		Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true });
		Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
		folderMark.dispatchEvent(new MouseEvent('pointerdown', { button: 0, bubbles: true }));
		expect(file.getContext(el).expanded).toBe(true);
		wrapper.unmount();
	});
});
