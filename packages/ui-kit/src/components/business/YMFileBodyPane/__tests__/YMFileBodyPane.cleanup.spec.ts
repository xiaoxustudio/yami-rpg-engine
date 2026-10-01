import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import YMFileBodyPane from '../YMFileBodyPane.vue';

/**
 * 卸载清理：临时挂在 `window` 上的监听必须在组件卸载时被摘掉。
 *
 * 这些监听都有收尾分支会自行摘除，但**收尾分支不保证跑到** —— 手势/按键序列进行到一半
 * 就卸载时，`{ once: true }` 还没触发，监听连闭包（引用着已卸载的 DOM）会永久留在
 * window 上。这类泄漏在测试里不会报错、只在长会话里慢慢累积，所以要显式钉住。
 *
 * 这里挑 **Alt 序列** 作为触发路径：它是唯一一条不需要先渲染出文件行就能走到的登记分支
 * （`windowKeydown` 的 `AltLeft`），因此不依赖任何布局度量桩。
 */
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
	it('Alt 序列登记了 keyup / pointermove，卸载时全部摘掉', () => {
		const wrapper = mountBody();
		// 走 `windowKeydown` 的 AltLeft 分支：登记 keyup + pointermove
		window.dispatchEvent(new KeyboardEvent('keydown', { code: 'AltLeft', altKey: true }));

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
