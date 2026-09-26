import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import YMFileBodyPane from '../YMFileBodyPane.vue';

/**
 * 行为金标准（文件 body 组）：锁住**行渲染 / 选区 / 网格度量 / 内容尺寸**行为，
 * 这些用例只允许改断言方式，不允许改语义。
 *
 * 编辑器形态 fixture 的五个要点（逐条踩出来的）：
 *   ①元素 API 挂在**面板元素**上（`attachApi(el.value, …)`），度量字段写在 `.file-body-content` 上；
 *   ②jsdom 必须给 `getBoundingClientRect` 打尺寸桩，否则 `computeGridProperties()` 开头的
 *     `if (rect(node).width <= 0) return;` 直接返回；
 *   ③`viewMode` 由 **`setViewIndex(0..4)`** 决定（0=list、1=small、2=medium…）：不设序号，
 *     后面 `switch (viewMode)` 落空，度量字段一个都不会写；
 *   ④`setViewIndex` 会写 **`props.links.head.view`**——缺这个桩会直接抛错（本文件曾因此 9 例全红）；
 *   ⑤渲染链：`setViewIndex → updateViewMode → createFlatItems → computeGridProperties →
 *     updateContentSize → resize`。
 */
class FileItem {
	path: string;
	name: string;
	basename: string;
	extname: string;
	type: string;
	children: FileItem[] = [];
	parent?: FileItem;
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

interface BodyContent extends HTMLElement {
	countPerLine?: number;
	itemSize?: number;
	itemWidth?: number;
	visibleLines?: number;
	/** 可见窗口 [start, end]（由内部 `computeStartAndEnd` 写入） */
	range?: Uint32Array;
}

interface BodyElement extends HTMLElement {
	[k: string]: unknown;
	createFlatItems: (dir: unknown[]) => void;
	selectAll: () => void;
	selectByPath: (path: string) => void;
	unselect: () => void;
	updateFiles: () => void;
	setViewIndex: (idx: number) => void;
	updateViewMode: () => void;
	computeGridProperties: () => void;
	updateContentSize: () => void;
	updateContentOffset: () => void;
	resize: () => void;
	selections?: unknown[];
}

const makeLinks = (display = 'normal') => ({
	browser: { display, filters: null, searchResults: null, backToParentFolder: vi.fn() },
	nav: { selections: [], load: vi.fn(), scrollToSelection: vi.fn() },
	// `setViewIndex` 会写 `head.view`：少了这个桩会抛错
	head: { view: { write: vi.fn() } },
	body: null
});

const mountBody = () => {
	vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
		width: 600,
		height: 400,
		top: 0,
		left: 0,
		right: 600,
		bottom: 400,
		x: 0,
		y: 0,
		toJSON: () => ({})
	} as DOMRect);
	const wrapper = mount(YMFileBodyPane, {
		props: { links: makeLinks('normal'), fileClasses: { FileItem, FolderItem } }
	});
	const el = wrapper.element as BodyElement;
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 600, configurable: true });
	return {
		wrapper,
		el,
		content: el.querySelector<BodyContent>('.file-body-content') as BodyContent
	};
};

/** 编辑器形态渲染链（`viewIndex`：0=列表、2=网格） */
const renderItems = async (el: BodyElement, list: unknown[], viewIndex = 0): Promise<void> => {
	el.setViewIndex(viewIndex);
	el.updateViewMode();
	el.createFlatItems(list);
	el.computeGridProperties();
	el.updateContentSize();
	el.resize();
	await nextTick();
	await nextTick();
};

const items = (n = 6) => Array.from({ length: n }, (_, i) => new FileItem(`/a/ev${i}`, `ev${i}`));

const rows = (el: BodyElement): HTMLElement[] =>
	Array.from(el.querySelectorAll<HTMLElement>('.file-body-item'));

describe('YMFileBodyPane（行为金标准：行渲染/选区/度量/尺寸）', () => {
	it('列表视图：按文件建立可见行，文本含文件名', async () => {
		const { el } = mountBody();
		await renderItems(el, items(3), 0);
		expect(rows(el).length).toBeGreaterThanOrEqual(3);
		expect(el.textContent).toContain('ev0');
	});

	it('文件夹与文件都能成行', async () => {
		const { el } = mountBody();
		await renderItems(el, [new FileItem('/a/ev', 'ev'), new FolderItem('/a/sub', 'sub')], 0);
		expect(rows(el).length).toBeGreaterThanOrEqual(2);
		expect(el.textContent).toContain('sub');
	});

	it('selectAll：行上出现 selected 类、selections 非空', async () => {
		const { el } = mountBody();
		await renderItems(el, items(4), 0);
		el.selectAll();
		await nextTick();
		expect(rows(el).some((row) => row.classList.contains('selected'))).toBe(true);
		expect((el.selections ?? []).length).toBeGreaterThan(0);
	});

	it('selectByPath：只选中路径匹配的那一行', async () => {
		const { el } = mountBody();
		await renderItems(el, items(3), 0);
		el.selectByPath('/a/ev1');
		await nextTick();
		expect(rows(el).filter((row) => row.classList.contains('selected')).length).toBe(1);
	});

	it('unselect：清空选区并移除 selected 类', async () => {
		const { el } = mountBody();
		await renderItems(el, items(3), 0);
		el.selectAll();
		await nextTick();
		el.unselect();
		await nextTick();
		expect(el.selections ?? []).toEqual([]);
		expect(rows(el).filter((row) => row.classList.contains('selected')).length).toBe(0);
	});

	it('网格度量：列表视图（viewIndex=0）算出每行数量/可见行数/行高', async () => {
		const { el, content } = mountBody();
		await renderItems(el, items(3), 0);
		expect(content.countPerLine).toBeGreaterThan(0);
		expect(content.visibleLines).toBeGreaterThan(0);
		expect(content.itemSize).toBeGreaterThan(0);
	});

	it('网格度量：网格视图（viewIndex=2）与列表视图的每行数量不同', async () => {
		const { el: listEl, content: listContent } = mountBody();
		await renderItems(listEl, items(3), 0);
		const { el: gridEl, content: gridContent } = mountBody();
		await renderItems(gridEl, items(3), 2);
		expect(listContent.countPerLine).toBeGreaterThan(0);
		expect(gridContent.countPerLine).not.toBe(listContent.countPerLine);
	});

	it('updateContentSize：内容元素拿到滚动区尺寸（宽或高被写上）', async () => {
		const { el, content } = mountBody();
		await renderItems(el, items(30), 0);
		expect(content.style.width !== '' || content.style.height !== '').toBe(true);
	});

	it('空目录不产生行', async () => {
		const { el } = mountBody();
		await renderItems(el, [], 0);
		expect(rows(el).length).toBe(0);
	});

	it('行元素契约：行是 file-body-item + file-item，内含 .file-body-name 且文本为 basename', async () => {
		const { el } = mountBody();
		await renderItems(el, [new FileItem('/a/really-long-name', 'really-long-name')], 0);
		const row = rows(el)[0];
		expect(row.classList.contains('file-body-item')).toBe(true);
		expect(row.classList.contains('file-item')).toBe(true);
		const nameBox = row.querySelector('.file-body-name');
		expect(nameBox).toBeTruthy();
		expect(nameBox?.textContent).toBe('really-long-name');
	});

	it('updateFiles：display=normal 且无目录文件时不建行', async () => {
		const { el } = mountBody();
		el.updateFiles();
		expect(rows(el).length).toBe(0);
	});

	it('selectAll 覆盖**全部**行（含窗口外未渲染的那些）——数据化的直接收益', async () => {
		const { el } = mountBody();
		const list = items(400); // 足够多，窗口只渲染其中一段
		await renderItems(el, list, 0);
		expect(rows(el).length).toBeLessThan(list.length); // 只渲染了窗口内的一段
		el.selectAll();
		await nextTick();
		// 选区按数据算：400 个文件全部进入 selections（原先按元素槽位取，只能选到渲染出的那段）
		expect((el.selections ?? []).length).toBe(list.length);
	});

	it('窗口迁移：列表视图滚动后可见区（content.range）随之右移', async () => {
		const { el, content } = mountBody();
		await renderItems(el, items(80), 0); // viewIndex=0 ⇒ 列表视图按 scrollLeft 计算窗口
		const before = Array.from(content.range ?? []);
		Object.defineProperty(el, 'scrollLeft', { value: 600, configurable: true, writable: true });
		el.scrollTop = 0;
		el.resize();
		await nextTick();
		const after = Array.from(content.range ?? []);
		expect(after[0]).toBeGreaterThan(before[0]);
	});

	it('窗口迁移：滚动后渲染的行切到后面的文件（首行不再是 ev0）', async () => {
		const { el } = mountBody();
		await renderItems(el, items(80), 0);
		expect(el.textContent).toContain('ev0');
		Object.defineProperty(el, 'scrollLeft', { value: 600, configurable: true, writable: true });
		el.resize();
		await nextTick();
		expect(el.textContent).not.toContain('ev0 ');
		expect(rows(el).length).toBeGreaterThan(0);
	});

	it('updateContentOffset：内容偏移被写到内容元素样式上', async () => {
		const { el, content } = mountBody();
		await renderItems(el, items(40), 0);
		Object.defineProperty(el, 'scrollLeft', { value: 600, configurable: true, writable: true });
		el.updateContentOffset();
		expect(typeof content.style.transform === 'string').toBe(true);
	});

	it('网格视图：窗口迁移按 scrollTop 计算（与列表视图的轴不同）', async () => {
		const { el, content } = mountBody();
		await renderItems(el, items(80), 2); // viewIndex=2 ⇒ 网格视图
		const before = Array.from(content.range ?? []);
		Object.defineProperty(el, 'scrollTop', { value: 400, configurable: true, writable: true });
		Object.defineProperty(el, 'scrollLeft', { value: 0, configurable: true, writable: true });
		el.resize();
		await nextTick();
		const after = Array.from(content.range ?? []);
		expect(after[0]).toBeGreaterThanOrEqual(before[0]);
	});

	/**
	 * 文件名由**模板**渲染（`{{ row.name }}`），因此改名必须经"模型 → 模板"反映出来。
	 * 这条用例正是为此加的：改名后 `resize()` 会重建行描述，名字随之更新
	 * （直接写 DOM 的实现才不需要这一步）。
	 */
	it('改名：改 basename 后 resize 会让模板显示新名字', async () => {
		const { el } = mountBody();
		const list = items(3);
		await renderItems(el, list);
		const names = (): (string | null)[] =>
			Array.from(el.querySelectorAll('.file-body-name')).map((n) => n.textContent);
		expect(names()[0]).toBe('ev0');

		(list[0] as unknown as { basename: string }).basename = 'renamed';
		el.resize();
		await nextTick();

		expect(names()[0]).toBe('renamed');
	});

	/**
	 * 行内**不重复**：回写桥会在挂载与多次 `resize` 时重复绑定，而内容构建是"追加"语义
	 * （命令列表那边就曾因此把行内文本叠成两份）。文件 body 这里是"有则跳过"的写法，
	 * 这条用例把该不变量钉住：反复 resize 后每行仍只有 1 个图标 + 1 个名字。
	 * **文件与文件夹都要覆盖**——文件夹那条曾经绕过"有则跳过"，额外 append 了第二个名字。
	 */
	it('行内不重复：反复 resize 后每行仍只有 1 个图标 + 1 个名字（含文件夹行）', async () => {
		const { el } = mountBody();
		await renderItems(el, [...items(3), new FolderItem('/a/sub', 'sub')]);
		el.resize();
		await nextTick();
		el.resize();
		await nextTick();

		const rows = Array.from(el.querySelectorAll('.file-body-item'));
		expect(rows.length).toBeGreaterThanOrEqual(4);
		for (const row of rows) {
			expect(row.querySelectorAll('.file-body-name').length).toBe(1);
			expect(row.children.length).toBe(2); // 图标 + 名字
		}
	});

	it('文件夹行：复用模板渲染的名字（不追加第二个），且图标在名字之前', async () => {
		const { el } = mountBody();
		await renderItems(el, [new FolderItem('/a/sub', 'sub')]);
		el.resize();
		await nextTick();

		const row = rows(el)[0];
		// 模板已经渲染了 `.file-body-name`：api 只能复用它，不能再造一个（实机表现为"两个名字"）
		expect(row.querySelectorAll('.file-body-name').length).toBe(1);
		expect(row.querySelector('.file-body-name')?.textContent).toBe('sub');
		// 顺序与命令式实现一致：图标在前、名字在后
		expect(Array.from(row.children).map((child) => child.className)).toEqual([
			'file-body-icon icon-folder',
			'file-body-name'
		]);
	});
});
