import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import YMFileHeadPane from '../YMFileHeadPane/YMFileHeadPane.vue';

type HeadApi = InstanceType<typeof YMFileHeadPane>;

interface TestFileItem {
	name: string;
	parent?: TestFileItem;
	subfolders: TestFileItem[];
}

/**
 * 句柄表桩：nav 只有 `getSelections()`（选中项不再是 `nav.selections` 属性），
 * body 只给 `content` / `getFileCount()` / `setViewIndex()`。
 */
function makeLinks(selections: TestFileItem[] = [], display = 'normal', count = 3) {
	const browser = { display, searchFiles: vi.fn(), backToParentFolder: vi.fn() };
	const nav = {
		getSelections: () => selections,
		load: vi.fn(),
		scrollToSelection: vi.fn()
	};
	const body = {
		content: document.createElement('div'),
		setViewIndex: vi.fn(),
		getFileCount: () => count
	};
	return { browser, nav, body };
}

function mountPane(props: InstanceType<typeof YMFileHeadPane>['$props']) {
	return mount(YMFileHeadPane, { props, attachTo: document.body });
}

describe('YMFileHeadPane', () => {
	it('mounts and exposes updateAddress through the component instance', () => {
		const links = makeLinks();
		const wrapper = mountPane({ links });
		expect(wrapper.classes()).toContain('file-head-pane');
		expect(typeof (wrapper.vm as HeadApi).updateAddress).toBe('function');
		// 元素上不再有 `updateAddress` / `links`：这条断言防止「又挂回元素」
		const el = wrapper.element as { updateAddress?: unknown; links?: unknown };
		expect(el.updateAddress).toBeUndefined();
		expect(el.links).toBeUndefined();
		wrapper.unmount();
	});

	it('updateAddress renders folder breadcrumb', async () => {
		const folder: TestFileItem = { name: 'Root', subfolders: [] };
		const sub: TestFileItem = { name: 'Sub', parent: folder, subfolders: [] };
		const links = makeLinks([sub]);
		const wrapper = mountPane({
			links,
			isFolderItem: (obj: unknown) => !!obj && typeof obj === 'object' && 'name' in obj
		});
		(wrapper.vm as HeadApi).updateAddress();
		await wrapper.vm.$nextTick();
		const folders = wrapper.element.querySelectorAll('file-head-address-folder');
		expect(folders.length).toBe(2);
		expect(folders[0].textContent).toBe('Root');
		expect(folders[1].textContent).toBe('Sub');
		expect((folders[1] as HTMLElement & { disabled?: boolean }).disabled).toBe(true);
		wrapper.unmount();
	});

	it('updateAddress search mode shows file count', async () => {
		const links = makeLinks([], 'search', 3);
		const wrapper = mountPane({ links });
		(wrapper.vm as HeadApi).updateAddress();
		await wrapper.vm.$nextTick();
		const text = wrapper.element.querySelector('file-head-address-text');
		expect(text?.textContent).toBe('3 个文件');
		wrapper.unmount();
	});

	it('back button calls browser.backToParentFolder', async () => {
		const links = makeLinks();
		const wrapper = mountPane({ links });
		const back = wrapper.element.querySelector('.upper-level-directory');
		await back?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(links.browser.backToParentFolder).toHaveBeenCalled();
		wrapper.unmount();
	});

	it('searcher input triggers browser.searchFiles', async () => {
		const links = makeLinks();
		const wrapper = mountPane({ links });
		const input = wrapper.element.querySelector(
			'.file-head-searcher input'
		) as HTMLInputElement;
		input.value = 'abc';
		input.dispatchEvent(new InputEvent('input', { inputType: 'insertText', bubbles: true }));
		await wrapper.vm.$nextTick();
		expect(links.browser.searchFiles).toHaveBeenCalledWith('abc');
		wrapper.unmount();
	});

	it('clicking address folder navigates', async () => {
		const parent: TestFileItem = { name: 'Parent', subfolders: [] };
		const sub: TestFileItem = { name: 'Sub', parent, subfolders: [] };
		const links = makeLinks([sub]);
		const wrapper = mountPane({
			links,
			isFolderItem: (obj: unknown) => !!obj && typeof obj === 'object' && 'name' in obj
		});
		(wrapper.vm as HeadApi).updateAddress();
		await wrapper.vm.$nextTick();
		const nodes = wrapper.element.querySelectorAll('file-head-address-folder');
		expect(nodes.length).toBe(2);
		const node = nodes[0] as HTMLElement;
		node.dispatchEvent(new MouseEvent('pointerdown', { button: 0, bubbles: true }));
		await wrapper.vm.$nextTick();
		node.dispatchEvent(new MouseEvent('pointerup', { button: 0, bubbles: true }));
		await wrapper.vm.$nextTick();
		expect(links.nav.load).toHaveBeenCalled();
		wrapper.unmount();
	});

	it('clicking address arrow opens menu popup', async () => {
		const menuPopup = vi.fn();
		const folder: TestFileItem = {
			name: 'Parent',
			subfolders: [{ name: 'Child', subfolders: [] }]
		};
		const sub: TestFileItem = { name: 'Sub', parent: folder, subfolders: [] };
		const links = makeLinks([sub]);
		const wrapper = mountPane({
			links,
			menuPopup,
			isFolderItem: (obj: unknown) => !!obj && typeof obj === 'object' && 'name' in obj
		});
		(wrapper.vm as HeadApi).updateAddress();
		await wrapper.vm.$nextTick();
		const arrow = wrapper.element.querySelector('file-head-address-arrow') as HTMLElement;
		arrow.dispatchEvent(new MouseEvent('pointerdown', { button: 0, bubbles: true }));
		await wrapper.vm.$nextTick();
		arrow.dispatchEvent(new MouseEvent('pointerup', { button: 0, bubbles: true }));
		await wrapper.vm.$nextTick();
		expect(menuPopup).toHaveBeenCalled();
		expect(menuPopup.mock.calls[0][1].length).toBe(1);
		wrapper.unmount();
	});
});
