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

describe('YMFileHeadPane 的卸载清理', () => {
	/** 渲染出一个地址栏文件夹节点，并在它上面按下（这会登记 window 上的 pointerup） */
	const pressAddressFolder = async (wrapper: ReturnType<typeof mount>) => {
		(wrapper.vm as unknown as { updateAddress: () => void }).updateAddress();
		await wrapper.vm.$nextTick();
		const address = wrapper.element.querySelector('.file-head-address') as HTMLElement;
		const folderEl = address.querySelector('file-head-address-folder') as HTMLElement;
		expect(folderEl).toBeTruthy();
		folderEl.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
	};

	it('按下后卸载：登记在 window 上的 pointerup 被摘掉', async () => {
		const links = makeLinks({
			nav: { selections: [makeFolder('Root')], load: vi.fn(), scrollToSelection: vi.fn() }
		});
		const wrapper = mount(YMFileHeadPane, { props: { links } });
		await pressAddressFolder(wrapper);

		const removed: string[] = [];
		const spy = vi
			.spyOn(window, 'removeEventListener')
			.mockImplementation((type: string | symbol) => void removed.push(String(type)));
		wrapper.unmount();
		spy.mockRestore();

		expect(removed).toContain('pointerup');
	});

	it('没按下过任何地址节点时，卸载不会误摘 pointerup', () => {
		const wrapper = mount(YMFileHeadPane, { props: { links: makeLinks() } });

		const removed: string[] = [];
		const spy = vi
			.spyOn(window, 'removeEventListener')
			.mockImplementation((type: string | symbol) => void removed.push(String(type)));
		wrapper.unmount();
		spy.mockRestore();

		expect(removed).not.toContain('pointerup');
	});
});
