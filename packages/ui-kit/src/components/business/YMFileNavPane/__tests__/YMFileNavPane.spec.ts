import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import YMFileNavPane from '../YMFileNavPane.vue';

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
	browser: { display: 'normal', update: vi.fn(), restoreDisplay: vi.fn() },
	nav: {},
	body: {}
});

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
};

interface NavElement extends HTMLElement {
	load?: (...files: FileItem[]) => void;
	select?: (...files: FileItem[]) => void;
	unselect?: () => void;
	clear?: () => HTMLElement;
	getSelections?: () => unknown[];
	selections?: FileItem[];
	elements?: { count: number };
}

describe('YMFileNavPane', () => {
	it('mounts and exposes api', () => {
		const wrapper = mount(YMFileNavPane, { props: { links: makeLinks() } });
		expect(wrapper.element.classList.contains('file-nav-pane')).toBe(true);
		const el = wrapper.element as NavElement;
		expect(typeof el.load).toBe('function');
		expect(typeof el.select).toBe('function');
		expect(typeof el.unselect).toBe('function');
		expect(typeof el.clear).toBe('function');
		expect(typeof el.getSelections).toBe('function');
	});

	it('load renders folder items from parent directory', () => {
		const links = makeLinks();
		const wrapper = mount(YMFileNavPane, { props: { links } });
		const el = wrapper.element as NavElement;
		const parent = el.parentNode as HTMLElement & { directory?: unknown };
		const folderA = makeFile('A');
		const folderB = makeFile('B');
		parent.directory = { subfolders: [folderA, folderB] };
		mockHeight(el);
		el.load!(folderA);
		expect(el.elements!.count).toBeGreaterThan(0);
		const items = Array.from(el.querySelectorAll('.file-nav-item'));
		expect(items.length).toBeGreaterThan(0);
		expect(items[0].textContent).toContain('A');
	});

	it('select adds selected class and getSelections returns files', () => {
		const links = makeLinks();
		const wrapper = mount(YMFileNavPane, { props: { links } });
		const el = wrapper.element as NavElement;
		const parent = el.parentNode as HTMLElement & { directory?: unknown };
		const folderA = makeFile('A');
		parent.directory = { subfolders: [folderA] };
		mockHeight(el);
		el.load!(folderA);
		el.select!(folderA);
		expect(el.getSelections!()).toEqual([folderA]);
		const item = el.querySelector('.file-nav-item') as HTMLElement;
		expect(item.classList.contains('selected')).toBe(true);
	});

	it('unselect clears selection', () => {
		const links = makeLinks();
		const wrapper = mount(YMFileNavPane, { props: { links } });
		const el = wrapper.element as NavElement;
		const parent = el.parentNode as HTMLElement & { directory?: unknown };
		const folderA = makeFile('A');
		parent.directory = { subfolders: [folderA] };
		el.load!(folderA);
		el.select!(folderA);
		el.unselect!();
		expect(el.getSelections!()).toEqual([]);
	});
});

describe('YMFileNavPane 的卸载清理', () => {
	/** Ctrl/Cmd 多选取消时会在 window 上登记一次性 pointerup；这里把那个状态造出来 */
	const pressItemWithCmdOrCtrl = (el: NavElement) => {
		const items = Array.from(el.querySelectorAll('.file-nav-item')) as HTMLElement[];
		expect(items.length).toBeGreaterThan(1);
		const event = new PointerEvent('pointerdown', { button: 0, bubbles: true });
		Object.defineProperty(event, 'cmdOrCtrlKey', { value: true });
		items[1].dispatchEvent(event);
	};

	it('多选按下后卸载：登记在 window 上的 pointerup 被摘掉', () => {
		const wrapper = mount(YMFileNavPane, { props: { links: makeLinks() } });
		const el = wrapper.element as NavElement;
		const parent = el.parentNode as HTMLElement & { directory?: unknown };
		const folderA = makeFile('A');
		const folderB = makeFile('B');
		parent.directory = { subfolders: [folderA, folderB] };
		mockHeight(el);
		el.load!(folderA);
		el.select!(folderA, folderB);
		pressItemWithCmdOrCtrl(el);

		const removed: string[] = [];
		const spy = vi
			.spyOn(window, 'removeEventListener')
			.mockImplementation((type: string | symbol) => void removed.push(String(type)));
		wrapper.unmount();
		spy.mockRestore();

		expect(removed).toContain('pointerup');
	});

	it('没按下过行时，卸载不会误摘 pointerup', () => {
		const wrapper = mount(YMFileNavPane, { props: { links: makeLinks() } });

		const removed: string[] = [];
		const spy = vi
			.spyOn(window, 'removeEventListener')
			.mockImplementation((type: string | symbol) => void removed.push(String(type)));
		wrapper.unmount();
		spy.mockRestore();

		expect(removed).not.toContain('pointerup');
	});
});
