import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import YMFileHeadPane from '../YMFileHeadPane.vue';

interface FileItem {
	name: string;
	parent?: FileItem;
	subfolders: FileItem[];
}

const makeFolder = (name: string, parent?: FileItem): FileItem => ({
	name,
	parent,
	subfolders: []
});

const makeLinks = (overrides: Record<string, unknown> = {}) => ({
	browser: {
		display: 'normal',
		backToParentFolder: vi.fn(),
		searchFiles: vi.fn()
	},
	nav: {
		selections: [] as FileItem[],
		load: vi.fn(),
		scrollToSelection: vi.fn()
	},
	body: {
		content: document.createElement('div'),
		elements: { count: 0 },
		setViewIndex: vi.fn()
	},
	...overrides
});

describe('YMFileHeadPane', () => {
	it('mounts with key dom structure', () => {
		const wrapper = mount(YMFileHeadPane, { props: { links: makeLinks() } });
		expect(wrapper.element.classList.contains('file-head-pane')).toBe(true);
		expect(wrapper.element.querySelector('.file-head-address')).toBeTruthy();
		expect(wrapper.element.querySelector('.upper-level-directory')).toBeTruthy();
		expect(wrapper.element.querySelector('.file-head-searcher')).toBeTruthy();
		expect(wrapper.element.querySelector('.file-head-view')).toBeTruthy();
	});

	it('updateAddress renders single folder breadcrumb', async () => {
		const folder = makeFolder('Root');
		const links = makeLinks({
			nav: { selections: [folder], load: vi.fn(), scrollToSelection: vi.fn() }
		});
		const wrapper = mount(YMFileHeadPane, { props: { links } });
		(wrapper.vm as unknown as { updateAddress: () => void }).updateAddress();
		await wrapper.vm.$nextTick();
		const address = wrapper.element.querySelector('.file-head-address') as HTMLElement;
		const folderEl = address.querySelector('file-head-address-folder');
		expect(folderEl).toBeTruthy();
		expect(folderEl!.textContent).toBe('Root');
	});

	it('updateAddress renders search count', async () => {
		const links = makeLinks({
			browser: { display: 'search', backToParentFolder: vi.fn(), searchFiles: vi.fn() },
			body: {
				content: document.createElement('div'),
				elements: { count: 5 },
				setViewIndex: vi.fn()
			}
		});
		const wrapper = mount(YMFileHeadPane, { props: { links } });
		(wrapper.vm as unknown as { updateAddress: () => void }).updateAddress();
		await wrapper.vm.$nextTick();
		const address = wrapper.element.querySelector('.file-head-address') as HTMLElement;
		expect(address.textContent).toContain('5 个文件');
	});

	it('back button calls browser.backToParentFolder', async () => {
		const links = makeLinks();
		const wrapper = mount(YMFileHeadPane, { props: { links } });
		await wrapper.find('.upper-level-directory').trigger('click');
		expect(links.browser.backToParentFolder).toHaveBeenCalled();
	});
});
