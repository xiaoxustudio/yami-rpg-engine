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
