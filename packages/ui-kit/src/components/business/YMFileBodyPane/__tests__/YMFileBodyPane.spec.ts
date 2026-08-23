import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import YMFileBodyPane from '../YMFileBodyPane.vue';

class FileItem {
	path: string;
	name: string;
	basename: string;
	extname: string;
	type: string;
	children: FileItem[] = [];
	parent?: FileItem;
	data?: Record<string, unknown>;
	meta?: { guid: string };
	stats?: { ino: number };
	context: { element?: HTMLElement } = {};
	constructor(path: string, name: string, extname = '') {
		this.path = path;
		this.name = name;
		this.basename = name;
		this.extname = extname;
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
	parent?: FolderItem;
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
	browser: { display: 'normal', filters: null, backToParentFolder: vi.fn() },
	nav: { selections: [], load: vi.fn(), scrollToSelection: vi.fn() },
	body: null
});

interface BodyElement extends HTMLElement {
	select?: (...files: unknown[]) => void;
	unselect?: () => void;
	selectByPath?: (path: string) => void;
	clear?: () => HTMLElement;
	on?: (type: string, listener: (e: Event) => void) => void;
	selections?: unknown[];
	content?: HTMLElement;
}

describe('YMFileBodyPane', () => {
	it('mounts and exposes api', () => {
		const wrapper = mount(YMFileBodyPane, {
			props: { links: makeLinks(), fileClasses: { FileItem, FolderItem } }
		});
		expect(wrapper.element.classList.contains('file-body-pane')).toBe(true);
		expect(wrapper.element.querySelector('.file-body-content')).toBeTruthy();
		const el = wrapper.element as BodyElement;
		expect(typeof el.select).toBe('function');
		expect(typeof el.unselect).toBe('function');
		expect(typeof el.selectByPath).toBe('function');
		expect(typeof el.clear).toBe('function');
		expect(typeof el.on).toBe('function');
	});

	it('select adds selected class to context element', () => {
		const wrapper = mount(YMFileBodyPane, {
			props: { links: makeLinks(), fileClasses: { FileItem, FolderItem } }
		});
		const el = wrapper.element as BodyElement;
		const file = new FileItem('/a/ev', 'ev');
		const item = document.createElement('div');
		item.classList.add('file-body-item');
		file.context.element = item;
		el.select!(file);
		expect(el.selections).toEqual([file]);
		expect(item.classList.contains('selected')).toBe(true);
	});

	it('unselect removes selected class', () => {
		const wrapper = mount(YMFileBodyPane, {
			props: { links: makeLinks(), fileClasses: { FileItem, FolderItem } }
		});
		const el = wrapper.element as BodyElement;
		const file = new FileItem('/a/ev', 'ev');
		const item = document.createElement('div');
		item.classList.add('file-body-item');
		file.context.element = item;
		el.select!(file);
		el.unselect!();
		expect(el.selections).toEqual([]);
		expect(item.classList.contains('selected')).toBe(false);
	});

	it('on enables select event dispatch', () => {
		const wrapper = mount(YMFileBodyPane, {
			props: { links: makeLinks(), fileClasses: { FileItem, FolderItem } }
		});
		const el = wrapper.element as BodyElement;
		let value: unknown;
		el.on!('select', (e: Event) => (value = (e as Event & { value?: unknown }).value));
		const file = new FileItem('/a/ev', 'ev');
		const item = document.createElement('div');
		item.classList.add('file-body-item');
		file.context.element = item;
		el.select!(file);
		expect(value).toEqual([file]);
	});
});
