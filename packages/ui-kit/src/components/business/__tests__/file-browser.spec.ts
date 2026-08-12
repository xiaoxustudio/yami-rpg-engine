import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import YMFileBrowser from '../YMFileBrowser/YMFileBrowser.vue';

function makeProps(extra: Record<string, unknown> = {}) {
	return {
		menuPopup: vi.fn(),
		directoryApi: {
			sortFiles: vi.fn(),
			getFolder: vi.fn(),
			update: vi.fn(),
			searchFiles: vi.fn(),
			existFiles: vi.fn(() => Promise.resolve(false)),
			readdir: vi.fn(() => Promise.resolve([])),
			moveFiles: vi.fn(() => Promise.resolve()),
			copyFiles: vi.fn(() => Promise.resolve()),
			saveFiles: vi.fn(() => Promise.resolve()),
			assets: null,
			inoMap: {}
		},
		fileSystemApi: { path: (p: string) => p },
		pathUtil: { basename: (p: string) => p.split('/').pop() },
		localize: { createGetter: () => () => 'Move' },
		fileClasses: { FileItem: class FileItem {}, FolderItem: class FolderItem {} },
		menuState: () => 'closed',
		createTextBox: () => null,
		onBrowserMount: vi.fn(),
		onSelectorMount: vi.fn(),
		...extra
	};
}

describe('YMFileBrowser', () => {
	let host: HTMLElement;

	beforeEach(() => {
		host = document.createElement('div');
		host.className = 'file-browser';
		host.style.cssText = 'width:600px;height:400px;';
		document.body.appendChild(host);
	});

	afterEach(() => {
		host.remove();
	});

	it('mounts with three panes and exposes api', () => {
		const props = makeProps();
		const wrapper = mount(YMFileBrowser, { props, attachTo: host });
		expect(host.querySelector('.file-nav-pane')).toBeTruthy();
		expect(host.querySelector('.file-head-pane')).toBeTruthy();
		expect(host.querySelector('.file-body-pane')).toBeTruthy();
		expect(typeof wrapper.vm.update).toBe('function');
		expect(typeof wrapper.vm.searchFiles).toBe('function');
		expect(typeof wrapper.vm.backToParentFolder).toBe('function');
		wrapper.unmount();
	});

	it('calls onBrowserMount for project-browser', async () => {
		const onBrowserMount = vi.fn();
		const props = makeProps({ onBrowserMount });
		host.id = 'project-browser';
		const wrapper = mount(YMFileBrowser, { props, attachTo: host });
		await wrapper.vm.$nextTick();
		await new Promise((r) => setTimeout(r, 20));
		expect(onBrowserMount).toHaveBeenCalled();
		wrapper.unmount();
	});

	it('searchFiles delegates to directoryApi', async () => {
		const props = makeProps();
		const wrapper = mount(YMFileBrowser, { props, attachTo: host });
		await wrapper.vm.$nextTick();
		await new Promise((r) => setTimeout(r, 20));
		wrapper.vm.searchFiles('abc');
		expect(props.directoryApi.searchFiles).toHaveBeenCalled();
		wrapper.unmount();
	});

	it('backToParentFolder returns false without selection', async () => {
		const props = makeProps();
		const wrapper = mount(YMFileBrowser, { props, attachTo: host });
		await wrapper.vm.$nextTick();
		await new Promise((r) => setTimeout(r, 20));
		expect(wrapper.vm.backToParentFolder()).toBe(false);
		wrapper.unmount();
	});
});
