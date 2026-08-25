import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import YMFileBrowser from '../YMFileBrowser.vue';
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

const makeProps = () => ({
	fileClasses: { FileItem, FolderItem },
	directoryApi: {
		assets: null,
		inoMap: {},
		sortFiles: vi.fn(),
		getFolder: vi.fn(),
		update: vi.fn(),
		searchFiles: vi.fn()
	},
	fileSystemApi: { path: (p: string) => p },
	pathUtil: { dirname: (p: string) => p }
});

interface BrowserElement extends HTMLElement {
	update?: () => void;
	searchFiles?: (kw: string | RegExp) => void;
	backToParentFolder?: () => boolean;
	getFilePaths?: (files: unknown[]) => { relativePaths: string[]; absolutePaths: string[] };
	display?: string;
}

const makeContainer = (): HTMLElement => {
	const container = document.createElement('div');
	container.classList.add('file-browser');
	document.body.appendChild(container);
	return container;
};

describe('YMFileBrowser', () => {
	it('mounts with all panes', async () => {
		const container = makeContainer();
		const wrapper = mount(YMFileBrowser, { props: makeProps(), attachTo: container });
		await nextTick();
		expect(wrapper.element.querySelector('.file-nav-pane')).toBeTruthy();
		expect(wrapper.element.querySelector('.file-head-pane')).toBeTruthy();
		expect(wrapper.element.querySelector('.file-body-pane')).toBeTruthy();
		container.remove();
	});

	it('exposes api on root element', async () => {
		const container = makeContainer();
		const _wrapper = mount(YMFileBrowser, { props: makeProps(), attachTo: container });
		await nextTick();
		const el = container as BrowserElement;
		expect(typeof el.update).toBe('function');
		expect(typeof el.searchFiles).toBe('function');
		expect(typeof el.backToParentFolder).toBe('function');
		expect(typeof el.getFilePaths).toBe('function');
		container.remove();
	});

	it('getFilePaths maps relative and absolute paths', async () => {
		const container = makeContainer();
		const _wrapper = mount(YMFileBrowser, { props: makeProps(), attachTo: container });
		await nextTick();
		const el = container as BrowserElement;
		const files = [new FileItem('/a/ev', 'ev')];
		const result = el.getFilePaths!(files);
		expect(result.relativePaths).toEqual(['/a/ev']);
		expect(result.absolutePaths).toEqual(['/a/ev']);
		container.remove();
	});
});
