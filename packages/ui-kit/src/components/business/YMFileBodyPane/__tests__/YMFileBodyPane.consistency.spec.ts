import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import YMFileBodyPane from '../YMFileBodyPane.vue';

/**
 * 一致性回归（文件 body）：换源后"模型驱动渲染"，因此每一步之后
 * **行模型 / DOM / 书（`elements.count`）三者都要对得上**。
 *
 * 这条来自一次探针：它当场抓出 `clear()` 之后 `count=0, dom=0` 但 **`modelRows=5`**（模型留着旧行），
 * 而 `clear()` 还在直接 `content.textContent = ''`——那是把 Vue 的节点表打乱（同一类问题在命令列表
 * 已经踩过一次）。单点断言（只查 `count`）看不到这些，所以这里比对三者。
 */
class FileItem {
	path: string;
	name: string;
	basename: string;
	extname = '';
	type = 'event';
	children: unknown[] = [];
	context: { element?: HTMLElement } = {};
	constructor(path: string, name: string) {
		this.path = path;
		this.name = name;
		this.basename = name;
	}
	getContext(): { element?: HTMLElement } {
		return this.context;
	}
}

interface BodyApi extends HTMLElement {
	[k: string]: unknown;
	setViewIndex: (index: number) => void;
	updateViewMode: () => void;
	createFlatItems: (list: unknown[]) => void;
	computeGridProperties: () => void;
	updateContentSize: () => void;
	resize: () => void;
	select: (...files: unknown[]) => void;
	unselect: () => void;
	clear: () => unknown;
	getRowModel: () => { keys: string[]; rows: { selected: boolean }[] };
	elements: { count: number };
}

describe('YMFileBodyPane（模型 ↔ DOM ↔ 书 一致性）', () => {
	it('一串操作之后三者一致；clear 之后都归零', async () => {
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
			props: {
				links: {
					browser: {
						display: 'normal',
						filters: null,
						searchResults: null,
						backToParentFolder: vi.fn()
					},
					nav: { selections: [], load: vi.fn(), scrollToSelection: vi.fn() },
					head: { view: { write: vi.fn() } },
					body: null
				},
				fileClasses: { FileItem, FolderItem: FileItem }
			}
		});
		const el = wrapper.element as unknown as BodyApi;
		Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
		Object.defineProperty(el, 'clientWidth', { value: 600, configurable: true });
		Object.defineProperty(el, 'scrollLeft', { value: 0, configurable: true, writable: true });
		Object.defineProperty(el, 'scrollTop', { value: 0, configurable: true, writable: true });

		const domRows = (): HTMLElement[] => Array.from(el.querySelectorAll<HTMLElement>('.file-body-item'));
		const nonEmpty = (keys: string[]): string[] => keys.filter((k) => k.length > 0);
		const expectConsistent = (): void => {
			const model = el.getRowModel();
			const dom = domRows();
			// 书、模型、DOM 三者的行数一致
			expect(model.rows.length).toBe(el.elements.count);
			expect(dom.length).toBe(el.elements.count);
			// key 序列一致
			expect(nonEmpty(model.keys)).toEqual(
				nonEmpty(
					dom.map((r) => (r as unknown as { rowKey?: string }).rowKey ?? '')
				)
			);
			// 选中态在两边一致
			expect(model.rows.filter((r) => r.selected).length).toBe(
				dom.filter((r) => r.classList.contains('selected')).length
			);
		};

		const list = Array.from({ length: 5 }, (_, i) => new FileItem(`/a/f${i}`, `f${i}`));
		el.setViewIndex(0);
		el.updateViewMode();
		el.createFlatItems(list);
		el.computeGridProperties();
		el.updateContentSize();
		el.resize();
		await nextTick();
		expectConsistent();

		el.select(list[1]);
		await nextTick();
		expectConsistent();

		el.unselect();
		await nextTick();
		expectConsistent();

		el.resize();
		await nextTick();
		expectConsistent();

		el.clear();
		await nextTick();
		// 清空后三者都必须归零（曾经模型留着 5 行）
		expect(el.elements.count).toBe(0);
		expect(el.getRowModel().rows).toEqual([]);
		expect(domRows()).toEqual([]);
	});
});
