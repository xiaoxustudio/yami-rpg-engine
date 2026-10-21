import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import YMFileNavPane from '../YMFileNavPane.vue';

interface FileItem {
	name: string;
	path: string;
	stats: { ino: unknown };
	parent?: FileItem;
	subfolders: FileItem[];
	getContext(node: HTMLElement): { element?: HTMLElement; expanded: boolean };
}

const makeFile = (name: string, parent?: FileItem): FileItem => ({
	name,
	path: parent ? `${parent.path}/${name}` : name,
	stats: { ino: name },
	parent,
	subfolders: [],
	getContext: () => ({ expanded: false })
});

const makeLinks = () => ({
	browser: { display: 'normal', update: vi.fn(), restoreDisplay: vi.fn() },
	nav: {},
	body: {}
});

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
};

interface NavElement extends HTMLElement {
	load?: (...files: FileItem[]) => void;
	select?: (...files: FileItem[]) => void;
	unselect?: () => void;
	clear?: () => HTMLElement;
	getSelections?: () => unknown[];
	selections?: FileItem[];
	elements?: { count: number };
	/** 对外导出的取消令牌：保存待处理的 pointerup 处理器，置 null 即取消。 */
	pressing?: ((event: PointerEvent) => void) | null;
}

describe('YMFileNavPane', () => {
	it('mounts and exposes api', () => {
		const wrapper = mount(YMFileNavPane, { props: { links: makeLinks() } });
		expect(wrapper.element.classList.contains('file-nav-pane')).toBe(true);
		const el = wrapper.element as NavElement;
		expect(typeof el.load).toBe('function');
		expect(typeof el.select).toBe('function');
		expect(typeof el.unselect).toBe('function');
		expect(typeof el.clear).toBe('function');
		expect(typeof el.getSelections).toBe('function');
	});

	it('load renders folder items from parent directory', () => {
		const links = makeLinks();
		const wrapper = mount(YMFileNavPane, { props: { links } });
		const el = wrapper.element as NavElement;
		const parent = el.parentNode as HTMLElement & { directory?: unknown };
		const folderA = makeFile('A');
		const folderB = makeFile('B');
		parent.directory = { subfolders: [folderA, folderB] };
		mockHeight(el);
		el.load!(folderA);
		expect(el.elements!.count).toBeGreaterThan(0);
		const items = Array.from(el.querySelectorAll('.file-nav-item'));
		expect(items.length).toBeGreaterThan(0);
		expect(items[0].textContent).toContain('A');
	});

	it('select adds selected class and getSelections returns files', () => {
		const links = makeLinks();
		const wrapper = mount(YMFileNavPane, { props: { links } });
		const el = wrapper.element as NavElement;
		const parent = el.parentNode as HTMLElement & { directory?: unknown };
		const folderA = makeFile('A');
		parent.directory = { subfolders: [folderA] };
		mockHeight(el);
		el.load!(folderA);
		el.select!(folderA);
		expect(el.getSelections!()).toEqual([folderA]);
		const item = el.querySelector('.file-nav-item') as HTMLElement;
		expect(item.classList.contains('selected')).toBe(true);
	});

	it('unselect clears selection', () => {
		const links = makeLinks();
		const wrapper = mount(YMFileNavPane, { props: { links } });
		const el = wrapper.element as NavElement;
		const parent = el.parentNode as HTMLElement & { directory?: unknown };
		const folderA = makeFile('A');
		parent.directory = { subfolders: [folderA] };
		el.load!(folderA);
		el.select!(folderA);
		el.unselect!();
		expect(el.getSelections!()).toEqual([]);
	});
});

describe('YMFileNavPane 的卸载清理', () => {
	/** Ctrl/Cmd 多选取消时会在 window 上登记一次性 pointerup；这里把那个状态造出来 */
	const pressItemWithCmdOrCtrl = (el: NavElement) => {
		const items = Array.from(el.querySelectorAll('.file-nav-item')) as HTMLElement[];
		expect(items.length).toBeGreaterThan(1);
		const event = new PointerEvent('pointerdown', { button: 0, bubbles: true });
		Object.defineProperty(event, 'cmdOrCtrlKey', { value: true });
		items[1].dispatchEvent(event);
	};

	it('多选按下后卸载：登记在 window 上的 pointerup 被摘掉', async () => {
		const wrapper = mount(YMFileNavPane, { props: { links: makeLinks() } });
		const el = wrapper.element as NavElement;
		const parent = el.parentNode as HTMLElement & { directory?: unknown };
		const folderA = makeFile('A');
		const folderB = makeFile('B');
		parent.directory = { subfolders: [folderA, folderB] };
		mockHeight(el);
		el.load!(folderA);
		el.select!(folderA, folderB);
		pressItemWithCmdOrCtrl(el);
		// window 上的 pointerup 由 useEventListener 在 flush: 'post' 挂载，先让出一拍；
		// 否则"卸载时摘掉"这条断言其实是在测一个尚未发生的挂载。
		await nextTick();

		const removed: string[] = [];
		const spy = vi
			.spyOn(window, 'removeEventListener')
			.mockImplementation((type: string | symbol) => void removed.push(String(type)));
		wrapper.unmount();
		spy.mockRestore();

		expect(removed).toContain('pointerup');
	});

	it('没按下过行时，卸载不会误摘 pointerup', () => {
		const wrapper = mount(YMFileNavPane, { props: { links: makeLinks() } });

		const removed: string[] = [];
		const spy = vi
			.spyOn(window, 'removeEventListener')
			.mockImplementation((type: string | symbol) => void removed.push(String(type)));
		wrapper.unmount();
		spy.mockRestore();

		expect(removed).not.toContain('pointerup');
	});
});

/**
 * 行为验证：上面两条只断言"卸载时摘了/没摘"，**证不了抬手处理真的会跑**。
 * 这条从行为上钉住整条 `enabled` 通道：按下 → 令牌置上 → window 抬手 → 处理器到达并清空令牌。
 */
describe('YMFileNavPane 的 pending-press 通道', () => {
	it('Ctrl 多选按下后抬手：window pointerup 能到达并清空令牌', async () => {
		// 需要 attachTo：不挂到 document 上，行内派发的 pointerup 冒泡不到 window
		const wrapper = mount(YMFileNavPane, {
			props: { links: makeLinks() },
			attachTo: document.body
		});
		const el = wrapper.element as NavElement;
		const parent = el.parentNode as HTMLElement & { directory?: unknown };
		const folderA = makeFile('A');
		const folderB = makeFile('B');
		parent.directory = { subfolders: [folderA, folderB] };
		mockHeight(el);
		el.load!(folderA);
		el.select!(folderA, folderB);

		const items = Array.from(el.querySelectorAll('.file-nav-item')) as HTMLElement[];
		expect(items.length).toBeGreaterThan(1);
		const event = new PointerEvent('pointerdown', { button: 0, bubbles: true });
		Object.defineProperty(event, 'cmdOrCtrlKey', { value: true });
		items[1].dispatchEvent(event);

		// 令牌已置上（消费者可见的那份契约）
		expect(typeof el.pressing).toBe('function');
		// window 上的监听由 useEventListener 在 flush: 'post' 挂载，先让出一拍
		await nextTick();
		items[1].dispatchEvent(new PointerEvent('pointerup', { button: 0, bubbles: true }));
		expect(el.pressing).toBe(null);
	});
});
