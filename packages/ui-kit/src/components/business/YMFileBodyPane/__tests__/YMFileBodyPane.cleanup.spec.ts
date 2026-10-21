import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import YMFileBodyPane from '../YMFileBodyPane.vue';

class FileItem {
	path: string;
	name: string;
	basename: string;
	extname: string;
	type = 'event';
	children: FileItem[] = [];
	context: { element?: HTMLElement } = {};
	constructor(path: string, name: string, extname = '') {
		this.path = path;
		this.name = name;
		this.basename = name;
		this.extname = extname;
	}
	getContext(): { element?: HTMLElement } {
		return this.context;
	}
}

class FolderItem {
	path: string;
	name: string;
	children: FileItem[] = [];
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
	browser: { display: 'normal', filters: null, searchResults: null, backToParentFolder: vi.fn() },
	nav: { selections: [], load: vi.fn(), scrollToSelection: vi.fn() },
	head: { view: { write: vi.fn() } },
	body: null
});

const mountBody = () =>
	mount(YMFileBodyPane, {
		props: { links: makeLinks(), fileClasses: { FileItem, FolderItem } }
	});

/** 记录卸载期间被摘掉的监听类型 */
const trackRemovals = (): { removed: string[]; restore: () => void } => {
	const removed: string[] = [];
	const spy = vi
		.spyOn(window, 'removeEventListener')
		.mockImplementation((type: string | symbol) => void removed.push(String(type)));
	return { removed, restore: () => spy.mockRestore() };
};

describe('YMFileBodyPane 的卸载清理', () => {
	it('Alt 序列登记了 keyup / pointermove，卸载时全部摘掉', async () => {
		const wrapper = mountBody();
		window.dispatchEvent(new KeyboardEvent('keydown', { code: 'AltLeft', altKey: true }));
		// keyup / pointermove 由 useEventListener + enabled 在 flush: 'post' 挂载，先让出一拍；
		// 否则"卸载时摘掉"这条断言是在测一个尚未发生的挂载。
		await nextTick();

		const { removed, restore } = trackRemovals();
		wrapper.unmount();
		restore();

		expect(removed).toContain('keyup');
		expect(removed).toContain('pointermove');
	});

	it('常驻监听（keydown / resize）仍在卸载时摘掉', () => {
		const wrapper = mountBody();
		const { removed, restore } = trackRemovals();
		wrapper.unmount();
		restore();

		expect(removed).toContain('keydown');
		expect(removed).toContain('resize');
	});

	it('没有触发任何手势时，卸载不会误摘不存在的监听', () => {
		const wrapper = mountBody();
		const { removed, restore } = trackRemovals();
		wrapper.unmount();
		restore();

		expect(removed).not.toContain('pointerup');
		expect(removed).not.toContain('pointermove');
	});
});
