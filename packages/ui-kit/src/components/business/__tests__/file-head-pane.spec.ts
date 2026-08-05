import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import YMFileHeadPane from '../YMFileHeadPane/YMFileHeadPane.vue';

function makeLinks() {
	const browser = { display: 'normal', searchFiles: vi.fn(), backToParentFolder: vi.fn() };
	const nav = { selections: [] as any[], load: vi.fn(), scrollToSelection: vi.fn() };
	const body = {
		content: document.createElement('div'),
		setViewIndex: vi.fn(),
		elements: { count: 3 }
	};
	return { browser, nav, body };
}

function mountPane(props: any) {
	return mount(YMFileHeadPane, { props, attachTo: document.body });
}

describe('YMFileHeadPane', () => {
	it('mounts with links and exposes updateAddress', () => {
		const links = makeLinks();
		const wrapper = mountPane({ links });
		expect(wrapper.classes()).toContain('file-head-pane');
		expect(typeof wrapper.vm.updateAddress).toBe('function');
		expect((wrapper.element as any).links?.browser).toBeTruthy();
		expect((wrapper.element as any).updateAddress).toBeTypeOf('function');
		wrapper.unmount();
	});

	it('updateAddress renders folder breadcrumb', async () => {
		const links = makeLinks();
		const folder = { name: 'Root', parent: null };
		const sub = { name: 'Sub', parent: folder };
		links.nav.selections = [sub];
		const wrapper = mountPane({ links, isFolderItem: (obj: any) => !!obj?.name });
		wrapper.vm.updateAddress();
		await wrapper.vm.$nextTick();
		const folders = wrapper.element.querySelectorAll('file-head-address-folder');
		expect(folders.length).toBe(2);
		expect(folders[0].textContent).toBe('Root');
		expect(folders[1].textContent).toBe('Sub');
		expect((folders[1] as any).disabled).toBe(true);
		wrapper.unmount();
	});

	it('updateAddress search mode shows file count', () => {
		const links = makeLinks();
		links.browser.display = 'search';
		const wrapper = mountPane({ links });
		wrapper.vm.updateAddress();
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
		const links = makeLinks();
		const parent = { name: 'Parent', parent: null };
		const sub = { name: 'Sub', parent };
		links.nav.selections = [sub];
		const wrapper = mountPane({ links, isFolderItem: (obj: any) => !!obj?.name });
		wrapper.vm.updateAddress();
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
		const links = makeLinks();
		const menuPopup = vi.fn();
		const folder = {
			name: 'Parent',
			parent: null,
			subfolders: [{ name: 'Child', parent: null }]
		};
		const sub = { name: 'Sub', parent: folder };
		links.nav.selections = [sub];
		const wrapper = mountPane({ links, menuPopup, isFolderItem: (obj: any) => !!obj?.name });
		wrapper.vm.updateAddress();
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
