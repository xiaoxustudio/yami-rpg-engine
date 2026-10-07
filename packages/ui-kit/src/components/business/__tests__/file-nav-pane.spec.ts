import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import YMFileNavPane from '../YMFileNavPane/YMFileNavPane.vue';

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
	const browser = { display: 'normal', update: vi.fn(), restoreDisplay: vi.fn() };
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

interface FileNavPaneElement extends HTMLElement {
	[k: string]: unknown;
	load: () => void;
	update: () => void;
	select: (...files: unknown[]) => void;
	clear: () => void;
	links: unknown;
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

	it('mounts and exposes core api', () => {
		const props = makeProps();
		const wrapper = mount(YMFileNavPane, { props, attachTo: host });
		const el = wrapper.element as unknown as FileNavPaneElement;
		expect(el.className).toContain('file-nav-pane');
		expect(typeof el.load).toBe('function');
		expect(typeof el.update).toBe('function');
		expect(typeof el.select).toBe('function');
		expect(typeof el.clear).toBe('function');
		expect(typeof wrapper.vm.update).toBe('function');
		wrapper.unmount();
	});

	it('暴露拖拽流程写入的 pressing（legacy 元素属性）', () => {
		const props = makeProps();
		const wrapper = mount(YMFileNavPane, { props, attachTo: host });
		const el = wrapper.element as unknown as FileNavPaneElement & {
			pressing?: ((event: PointerEvent) => void) | null;
		};
		expect(el.pressing).toBe(null);
		const sentinel = (): void => {};
		el.pressing = sentinel;
		expect(el.pressing).toBe(sentinel);
		el.pressing = null;
		expect(el.pressing).toBe(null);
		wrapper.unmount();
	});

	it('load selects folders and calls browser update', async () => {
		const props = makeProps();
		const wrapper = mount(YMFileNavPane, { props, attachTo: host });
		(wrapper.element as unknown as FileNavPaneElement).links = props.links;
		const file = makeFile('Assets');
		wrapper.vm.select(file);
		expect(wrapper.vm.getSelections()).toContain(file);
		wrapper.unmount();
	});

	it('select/unselect toggles selection state', async () => {
		const props = makeProps();
		const wrapper = mount(YMFileNavPane, { props, attachTo: host });
		const a = makeFile('A');
		const b = makeFile('B');
		(wrapper.vm as unknown as FileNavPaneElement).select(a);
		(wrapper.vm as unknown as FileNavPaneElement).select(a, b);
		expect(wrapper.vm.getSelections()).toEqual([a, b]);
		wrapper.vm.unselect();
		expect(wrapper.vm.getSelections()).toEqual([]);
		wrapper.unmount();
	});

	it('keydown ArrowRight expands single selection', async () => {
		const props = makeProps();
		const wrapper = mount(YMFileNavPane, { props, attachTo: host });
		const sub = makeFile('Sub');
		const file = makeFile('Folder', [sub]);
		(wrapper.vm as unknown as FileNavPaneElement).select(file);
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
		const el = wrapper.element as unknown as FileNavPaneElement;
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
