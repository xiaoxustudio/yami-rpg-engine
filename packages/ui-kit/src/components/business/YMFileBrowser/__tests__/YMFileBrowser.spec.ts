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

	// 方法挂在**组件实例**上（`defineExpose`），元素只留 `directory` 这类宿主写入的数据
	it('exposes api through the component instance', async () => {
		const container = makeContainer();
		const wrapper = mount(YMFileBrowser, { props: makeProps(), attachTo: container });
		await nextTick();
		expect(typeof wrapper.vm.update).toBe('function');
		expect(typeof wrapper.vm.searchFiles).toBe('function');
		expect(typeof wrapper.vm.backToParentFolder).toBe('function');
		expect(typeof wrapper.vm.getFilePaths).toBe('function');
		// 元素上不再有方法：这条断言防止「又挂回元素」
		expect((container as unknown as { update?: unknown }).update).toBeUndefined();
		container.remove();
	});

	it('window 上的 os-dragstart / os-dragend 能到达并切换根元素上的拖放监听', async () => {
		const container = makeContainer();
		const wrapper = mount(YMFileBrowser, { props: makeProps(), attachTo: container });
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
		const wrapper = mount(YMFileBrowser, { props: makeProps(), attachTo: container });
		await nextTick();
		const files = [new FileItem('/a/ev', 'ev')];
		const result = wrapper.vm.getFilePaths(files);
		expect(result.relativePaths).toEqual(['/a/ev']);
		expect(result.absolutePaths).toEqual(['/a/ev']);
		container.remove();
	});
});
