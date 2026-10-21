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

	/**
	 * `os-dragstart` / `os-dragend` / `dirchange` 三个 window 监听本次改成了 `useEventListener`
	 * + `enabled`（原先是 onMounted 的 nextTick 回调里手工登记、onBeforeUnmount 手工摘除）。
	 * 此前 spec 只覆盖挂载与 API，**没有一条派发过这三个事件**，故补这条行为例：
	 * 收到 `os-dragstart` 后应在根元素上补挂拖放四件套，`os-dragend` 后再摘掉。
	 */
	it('window 上的 os-dragstart / os-dragend 能到达并切换根元素上的拖放监听', async () => {
		const container = makeContainer();
		const wrapper = mount(YMFileBrowser, { props: makeProps(), attachTo: container });
		// `windowHooksReady` 在 onMounted 的 nextTick 回调里才置真，再经 flush: 'post' 挂载，故多等一拍
		await nextTick();
		await nextTick();

		const added: string[] = [];
		const removed: string[] = [];
		const addSpy = vi
			.spyOn(container, 'addEventListener')
			.mockImplementation((type: string | symbol) => void added.push(String(type)));
		const removeSpy = vi
			.spyOn(container, 'removeEventListener')
			.mockImplementation((type: string | symbol) => void removed.push(String(type)));

		window.dispatchEvent(new Event('os-dragstart'));
		expect(added).toContain('dragenter');
		expect(added).toContain('drop');

		window.dispatchEvent(new Event('os-dragend'));
		expect(removed).toContain('dragenter');
		expect(removed).toContain('drop');

		addSpy.mockRestore();
		removeSpy.mockRestore();
		wrapper.unmount();
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
