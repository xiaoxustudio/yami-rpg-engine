import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import YMFileBodyPane from '../YMFileBodyPane.vue';

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
	getFileCount: () => number;
	select: (...files: unknown[]) => void;
	unselect: () => void;
	clear: () => unknown;
	getRowModel: () => { keys: string[]; rows: { selected: boolean }[] };
	elements: { count: number };
}

/** wrapper.vm 的公开类型不含 defineExpose 的成员：类型层收窄一次，运行期就是实例 */
const bodyApiOf = (view: unknown): BodyApi => view as BodyApi;

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
						searchResults: [],
						backToParentFolder: vi.fn()
					},
					nav: { getSelections: () => [], load: vi.fn(), scrollToSelection: vi.fn() },
					head: { view: { write: vi.fn() } },
					body: null
				},
				fileClasses: { FileItem, FolderItem: FileItem }
			}
		});
		const el = wrapper.element as HTMLElement;
		const vm = bodyApiOf(wrapper.vm);
		Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
		Object.defineProperty(el, 'clientWidth', { value: 600, configurable: true });
		Object.defineProperty(el, 'scrollLeft', { value: 0, configurable: true, writable: true });
		Object.defineProperty(el, 'scrollTop', { value: 0, configurable: true, writable: true });

		const domRows = (): HTMLElement[] =>
			Array.from(el.querySelectorAll<HTMLElement>('.file-body-item'));
		const nonEmpty = (keys: string[]): string[] => keys.filter((k) => k.length > 0);
		const expectConsistent = (): void => {
			const model = vm.getRowModel();
			const dom = domRows();
			expect(model.rows.length).toBe(vm.getFileCount());
			expect(dom.length).toBe(vm.getFileCount());
			expect(nonEmpty(model.keys)).toEqual(
				nonEmpty(dom.map((r) => (r as unknown as { rowKey?: string }).rowKey ?? ''))
			);
			expect(model.rows.filter((r) => r.selected).length).toBe(
				dom.filter((r) => r.classList.contains('selected')).length
			);
		};

		const list = Array.from({ length: 5 }, (_, i) => new FileItem(`/a/f${i}`, `f${i}`));
		vm.setViewIndex(0);
		vm.updateViewMode();
		vm.createFlatItems(list);
		vm.computeGridProperties();
		vm.updateContentSize();
		vm.resize();
		await nextTick();
		expectConsistent();

		vm.select(list[1]);
		await nextTick();
		expectConsistent();

		vm.unselect();
		await nextTick();
		expectConsistent();

		vm.resize();
		await nextTick();
		expectConsistent();

		vm.clear();
		await nextTick();
		expect(vm.getFileCount()).toBe(0);
		expect(vm.getRowModel().rows).toEqual([]);
		expect(domRows()).toEqual([]);
	});

	it('长序列（切视图/滚动/多选/清空/重渲染）每一步都保持三者一致', async () => {
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
						searchResults: [],
						backToParentFolder: vi.fn()
					},
					nav: { getSelections: () => [], load: vi.fn(), scrollToSelection: vi.fn() },
					head: { view: { write: vi.fn() } },
					body: null
				},
				fileClasses: { FileItem, FolderItem: FileItem }
			}
		});
		const el = wrapper.element as HTMLElement;
		const vm = bodyApiOf(wrapper.vm);
		Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
		Object.defineProperty(el, 'clientWidth', { value: 600, configurable: true });
		Object.defineProperty(el, 'scrollLeft', { value: 0, configurable: true, writable: true });
		Object.defineProperty(el, 'scrollTop', { value: 0, configurable: true, writable: true });

		const domRows = (): HTMLElement[] =>
			Array.from(el.querySelectorAll<HTMLElement>('.file-body-item'));
		const nonEmpty = (keys: string[]): string[] => keys.filter((k) => k.length > 0);
		const expectConsistent = (): void => {
			const model = vm.getRowModel();
			const dom = domRows();
			expect(model.rows.length).toBe(dom.length);
			expect(nonEmpty(model.keys)).toEqual(
				nonEmpty(dom.map((r) => (r as unknown as { rowKey?: string }).rowKey ?? ''))
			);
			expect(model.rows.filter((r) => r.selected).length).toBe(
				dom.filter((r) => r.classList.contains('selected')).length
			);
		};

		const list = Array.from({ length: 60 }, (_, i) => new FileItem(`/a/f${i}`, `f${i}`));
		const render = (): void => {
			vm.createFlatItems(list);
			vm.computeGridProperties();
			vm.updateContentSize();
			vm.resize();
		};
		vm.setViewIndex(0);
		vm.updateViewMode();
		render();
		await nextTick();
		expectConsistent();

		for (const view of [1, 2, 3, 4, 0]) {
			vm.setViewIndex(view);
			vm.updateViewMode();
			render();
			// oxlint-disable-next-line no-await-in-loop
			await nextTick();
			expectConsistent();
		}

		Object.defineProperty(el, 'scrollLeft', { value: 900, configurable: true, writable: true });
		vm.resize();
		await nextTick();
		expectConsistent();

		vm.select(list[20], list[21], list[22]);
		await nextTick();
		expectConsistent();

		vm.unselect();
		await nextTick();
		expectConsistent();

		vm.clear();
		await nextTick();
		expect(vm.getRowModel().rows).toEqual([]);
		expect(domRows()).toEqual([]);

		render();
		await nextTick();
		expectConsistent();
	});
});
