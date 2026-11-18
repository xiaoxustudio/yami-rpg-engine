import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import YMParamList from '../YMParamList.vue';
import { getListConfig } from '../../../../utils/list-config';
import { ParamListHistory } from '../param-history';

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true });
};

// 早先的替身漏了它 —— 只在 `edit()` 真走到"占位行 → 新增"那条分支时才会暴露。
const makeObject = (): {
	type: string;
	initialize: () => void;
	parse: (item: { name: string }) => string;
	save: () => unknown;
	onPaste: undefined;
	open: (data?: unknown) => void;
} => ({
	type: 'test',
	initialize: () => {},
	parse: (item: { name: string }) => item.name,
	save: () => undefined,
	onPaste: undefined,
	open: () => {}
});

/** 组件暴露的能力对象（`defineExpose(api)`）：方法/状态从这里读，元素只做 DOM 断言。 */
interface ParamListApi {
	[k: string]: unknown;
	root: HTMLElement | null;
	bind: (object: unknown) => void;
	read: () => unknown;
	write: (data: unknown) => void;
	update: () => void;
	select: (...indexes: number[]) => void;
	unselect: () => void;
	insert: () => void;
	edit: () => void;
	copy: () => void;
	paste: () => void;
	delete: () => void;
	undo: () => void;
	redo: () => void;
	save: () => void;
	clear: () => void;
	on: (name: string, cb: (e: Event) => void) => void;
	toggle: () => void;
	data: unknown;
	elements: { count: number };
	start: number | null;
	end: number | null;
	togglable: boolean;
	inserting: boolean;
	dragging: unknown;
	history: { canUndo: () => boolean };
}

const testWindow = window as unknown as { __menuItems?: unknown };

describe('YMParamList', () => {
	it('mounts and exposes api', () => {
		const wrapper = mount(YMParamList);
		expect(wrapper.element.classList.contains('param-list')).toBe(true);
		const vm = wrapper.vm as unknown as ParamListApi;
		expect(vm.root).toBe(wrapper.element);
		for (const name of [
			'bind',
			'read',
			'write',
			'update',
			'select',
			'unselect',
			'insert',
			'edit',
			'copy',
			'paste',
			'delete',
			'undo',
			'redo',
			'save',
			'clear',
			'on'
		]) {
			expect(typeof vm[name], name).toBe('function');
		}
	});

	it('拖拽选择：window 上的 pointerup 能收尾（useEventListener 的 enabled 通道）', async () => {
		const wrapper = mount(YMParamList, { attachTo: document.body });
		const el = wrapper.element as HTMLElement;
		const vm = wrapper.vm as unknown as ParamListApi;
		mockHeight(el);
		vm.bind(makeObject());
		el.focus();
		vm.write([{ name: 'One' }, { name: 'Two' }, { name: 'Three' }]);
		await nextTick();

		const item = el.querySelector('.param-item') as HTMLElement;
		item.dispatchEvent(
			new PointerEvent('pointerdown', { button: 0, bubbles: true, pointerId: 5 })
		);
		expect(vm.dragging).toBeTruthy();
		await nextTick();
		window.dispatchEvent(
			new PointerEvent('pointerup', { button: 0, bubbles: true, pointerId: 5 })
		);
		expect(vm.dragging).toBe(null);
	});

	/**
	 * 回归（2026-10-22 实报）：**列表变短后双击会崩**，以及对应的行为约定
	 * 「列表变短时选中自动收敛到最后一行」。
	 *
	 * `update()` 会重建全部行并重置 `elements.count`，而 `start` / `end` 存的是
	 * 上一批行的索引。列表变短后它们越界 ⇒ `elements[i]` 为 `undefined`，
	 * `edit()` 读 `.dataItem` 就抛 `Cannot read properties of undefined (reading 'dataItem')`。
	 * 现在 `update()` 末尾的 `reconcileSelection()` 会把范围夹回有效区间。
	 *
	 * 注意 `elements.count` **含末尾占位行**（N 项数据 → count = N + 1），
	 * 所以"最后一行"通常就是那个占位行 —— 选中落在那儿意味着下一次 `edit()` 是"新增"。
	 */
	const rowCount = (vm: ParamListApi): number => vm.elements.count;

	it('列表变短时选中收敛到最后一行，且 edit 不崩', async () => {
		const wrapper = mount(YMParamList, { attachTo: document.body });
		const el = wrapper.element as HTMLElement;
		const vm = wrapper.vm as unknown as ParamListApi;
		mockHeight(el);
		vm.bind(makeObject());
		el.focus();
		vm.write([{ name: 'One' }, { name: 'Two' }, { name: 'Three' }, { name: 'Four' }]);
		await nextTick();

		vm.select(3);
		await nextTick();
		expect(vm.start).toBe(3);

		vm.write([{ name: 'Only' }, { name: 'Second' }]);
		await nextTick();
		expect(vm.start).toBe(rowCount(vm) - 1);
		expect(vm.end).toBe(rowCount(vm) - 1);
		expect(vm.start).toBeLessThan(3);

		expect(() => vm.edit()).not.toThrow();
	});

	it('列表被清空时选中收敛到占位行（不会停在越界索引）', async () => {
		const wrapper = mount(YMParamList, { attachTo: document.body });
		const el = wrapper.element as HTMLElement;
		const vm = wrapper.vm as unknown as ParamListApi;
		mockHeight(el);
		vm.bind(makeObject());
		el.focus();
		vm.write([{ name: 'One' }, { name: 'Two' }]);
		await nextTick();

		vm.select(1);
		await nextTick();
		expect(vm.start).toBe(1);

		vm.write([]);
		await nextTick();
		expect(vm.start).toBe(rowCount(vm) - 1);
		expect(vm.end).toBe(rowCount(vm) - 1);
		expect(() => vm.edit()).not.toThrow();
	});

	it('列表变长时不动选中', async () => {
		const wrapper = mount(YMParamList, { attachTo: document.body });
		const el = wrapper.element as HTMLElement;
		const vm = wrapper.vm as unknown as ParamListApi;
		mockHeight(el);
		vm.bind(makeObject());
		el.focus();
		vm.write([{ name: 'One' }, { name: 'Two' }]);
		await nextTick();

		vm.select(1);
		await nextTick();
		expect(vm.start).toBe(1);

		vm.write([{ name: 'One' }, { name: 'Two' }, { name: 'Three' }, { name: 'Four' }]);
		await nextTick();
		expect(vm.start).toBe(1);
		expect(vm.end).toBe(1);
	});

	it('空列表被聚焦后不产生 -1 的选中，右键不崩', async () => {
		const wrapper = mount(YMParamList, {
			attachTo: document.body,
			props: {
				localize: (key: string) => key,
				menuPopup: () => {}
			}
		});
		const el = wrapper.element as HTMLElement;
		const vm = wrapper.vm as unknown as ParamListApi;
		mockHeight(el);
		vm.bind(makeObject());
		el.focus();
		await nextTick();

		expect(vm.start).toBe(null);
		expect(vm.end).toBe(null);

		expect(() =>
			el.dispatchEvent(
				new PointerEvent('pointerup', {
					bubbles: true,
					button: 2,
					clientX: 10,
					clientY: 10
				})
			)
		).not.toThrow();
	});

	it('选中索引越界时右键仍能弹出菜单，逐项操作降级为不可用', async () => {
		const wrapper = mount(YMParamList, {
			attachTo: document.body,
			props: {
				localize: (key: string) => key,
				menuPopup: (_options: unknown, items: unknown[]) => {
					testWindow.__menuItems = items;
				}
			}
		});
		const el = wrapper.element as HTMLElement;
		const vm = wrapper.vm as unknown as ParamListApi;
		mockHeight(el);
		vm.bind(makeObject());
		el.focus();
		vm.write([{ name: 'One' }, { name: 'Two' }]);
		await nextTick();

		vm.start = 9;
		vm.end = 9;
		expect(() =>
			el.dispatchEvent(
				new PointerEvent('pointerup', {
					bubbles: true,
					button: 2,
					clientX: 10,
					clientY: 10
				})
			)
		).not.toThrow();

		const items = testWindow.__menuItems as { label: string; enabled?: boolean }[];
		expect(items).toBeTruthy();
		const byLabel = (label: string): { label: string; enabled?: boolean } =>
			items.find((item) => item.label === label)!;
		expect(byLabel('edit').enabled).toBe(false);
		expect(byLabel('copy').enabled).toBe(false);
		delete testWindow.__menuItems;
	});

	it('双击按指针所在行编辑，不依赖旧的选中索引', async () => {
		const opened: unknown[] = [];
		const mergeObject = makeObject();
		const wrapper = mount(YMParamList, { attachTo: document.body });
		const el = wrapper.element as HTMLElement;
		const vm = wrapper.vm as unknown as ParamListApi;
		mockHeight(el);
		mergeObject.open = (data?: unknown) => opened.push(data);
		vm.bind(mergeObject);
		el.focus();
		vm.write([{ name: 'One' }, { name: 'Two' }]);
		await nextTick();

		vm.start = 9;
		vm.end = 9;

		const row = el.querySelectorAll('.param-item')[1] as HTMLElement;
		row.dispatchEvent(
			new PointerEvent('doubleclick', { bubbles: true, clientX: 10, clientY: 30 })
		);
		await nextTick();

		expect(vm.start).toBe(1);
		expect(vm.end).toBe(1);
		expect(opened).toEqual([(vm.data as { name: string }[])[1]]);
	});

	it('列表重建后选中高亮仍在（范围没变也要重画）', async () => {
		const wrapper = mount(YMParamList, { attachTo: document.body });
		const el = wrapper.element as HTMLElement;
		const vm = wrapper.vm as unknown as ParamListApi;
		mockHeight(el);
		vm.bind(makeObject());
		el.focus();
		vm.write([{ name: 'One' }, { name: 'Two' }, { name: 'Three' }]);
		await nextTick();

		vm.select(1);
		await nextTick();
		expect(vm.start).toBe(1);

		vm.write([{ name: 'One' }, { name: 'Two' }, { name: 'Three' }]);
		await nextTick();

		const rows = el.querySelectorAll('.param-item');
		expect(rows[1].classList.contains('selected')).toBe(true);
		expect(rows[0].classList.contains('selected')).toBe(false);
	});

	it('bind and write render items', () => {
		const wrapper = mount(YMParamList);
		const el = wrapper.element as HTMLElement;
		const vm = wrapper.vm as unknown as ParamListApi;
		mockHeight(el);
		const object = makeObject();
		vm.bind(object);
		el.focus();
		const data = [{ name: 'One' }, { name: 'Two' }, { name: 'Three' }];
		vm.write(data);
		expect(vm.data).toBe(data);
		const texts = Array.from(el.querySelectorAll('.param-item') as NodeListOf<Element>).map(
			(n: Element) => n.textContent
		);
		expect(texts).toEqual(['One', 'Two', 'Three', '3 items']);
	});

	it('select highlights and read returns data', () => {
		const wrapper = mount(YMParamList, { attachTo: document.body });
		const el = wrapper.element as HTMLElement;
		const vm = wrapper.vm as unknown as ParamListApi;
		mockHeight(el);
		vm.bind(makeObject());
		el.focus();
		vm.write([{ name: 'One' }, { name: 'Two' }]);
		vm.select(1);
		expect(el.querySelectorAll('.param-item')[1].classList.contains('selected')).toBe(true);
		expect(vm.start).toBe(1);
	});

	it('delete removes items and saves history', () => {
		const wrapper = mount(YMParamList);
		const el = wrapper.element;
		const vm = wrapper.vm as unknown as ParamListApi;
		mockHeight(el);
		vm.bind(makeObject());
		el.focus();
		const data = [{ name: 'One' }, { name: 'Two' }, { name: 'Three' }];
		vm.write(data);
		vm.select(1);
		vm.delete();
		expect(data.map((d) => d.name)).toEqual(['One', 'Three']);
		expect(vm.history.canUndo()).toBe(true);
	});

	it('undo restores deleted items', () => {
		const wrapper = mount(YMParamList);
		const el = wrapper.element;
		const vm = wrapper.vm as unknown as ParamListApi;
		mockHeight(el);
		vm.bind(makeObject());
		el.focus();
		const data = [{ name: 'One' }, { name: 'Two' }];
		vm.write(data);
		vm.select(1);
		vm.delete();
		vm.undo();
		expect(data.map((d) => d.name)).toEqual(['One', 'Two']);
	});

	it('toggle disables items', () => {
		const wrapper = mount(YMParamList);
		const el = wrapper.element;
		const vm = wrapper.vm as unknown as ParamListApi;
		// 列表配置按能力对象寻址（宿主元素只做 DOM），所以 config 要拿 api 本身。
		const api = (wrapper.vm as unknown as { $: { exposed: ParamListApi } }).$.exposed;
		mockHeight(el);
		vm.bind(makeObject());
		el.focus();
		getListConfig(api).togglable = true;
		const data = [
			{ name: 'One', enabled: true },
			{ name: 'Two', enabled: true }
		];
		vm.write(data);
		vm.select(0, 1);
		vm.toggle();
		expect(data[0].enabled).toBe(false);
		expect(data[1].enabled).toBe(false);
	});

	it('api 访问器 togglable 与 getListConfig 是同一份真源', () => {
		const wrapper = mount(YMParamList);
		const el = wrapper.element;
		const vm = wrapper.vm as unknown as ParamListApi;
		const api = (wrapper.vm as unknown as { $: { exposed: ParamListApi } }).$.exposed;
		mockHeight(el);
		vm.bind(makeObject());
		el.focus();
		vm.togglable = true;
		expect(getListConfig(api).togglable).toBe(true);
		expect(vm.togglable).toBe(true);
		const data = [
			{ name: 'One', enabled: true },
			{ name: 'Two', enabled: true }
		];
		vm.write(data);
		vm.select(0, 1);
		vm.toggle();
		expect(data[0].enabled).toBe(false);
		expect(data[1].enabled).toBe(false);
	});

	it('save dispatches change and replaces item', () => {
		const wrapper = mount(YMParamList);
		const el = wrapper.element;
		const vm = wrapper.vm as unknown as ParamListApi;
		mockHeight(el);
		let changed: EventTarget | null = null;
		vm.on('change', (e: Event) => (changed = e.target));
		const object = makeObject();
		object.save = () => ({ name: 'Replaced' });
		vm.bind(object);
		el.focus();
		const data = [{ name: 'One' }, { name: 'Two' }];
		vm.write(data);
		vm.select(1);
		vm.edit = () => {};
		vm.inserting = false;
		vm.save();
		expect(data[1].name).toBe('Replaced');
		expect(changed).toBe(el);
	});

	it('paste inserts clipboard items', () => {
		const wrapper = mount(YMParamList, {
			props: {
				clipboard: {
					write: () => {},
					read: (type: string) => (type === 'yami.test' ? [{ name: 'Pasted' }] : null),
					has: () => true
				}
			}
		});
		const el = wrapper.element;
		const vm = wrapper.vm as unknown as ParamListApi;
		mockHeight(el);
		vm.bind(makeObject());
		el.focus();
		const data = [{ name: 'One' }];
		vm.write(data);
		vm.select(0);
		vm.paste();
		expect(data.map((d) => d.name)).toEqual(['Pasted', 'One']);
	});

	it('custom history factory is used', () => {
		const wrapper = mount(YMParamList, {
			props: {
				historyFactory: (list: unknown) => new ParamListHistory(list as never)
			}
		});
		const el = wrapper.element;
		const vm = wrapper.vm as unknown as ParamListApi;
		mockHeight(el);
		vm.bind(makeObject());
		el.focus();
		vm.write([{ name: 'A' }]);
		expect(vm.history).toBeInstanceOf(ParamListHistory);
	});

	it('right-click popup uses injected menuPopup', () => {
		const wrapper = mount(YMParamList, {
			attachTo: document.body,
			props: {
				localize: (key: string) => key,
				menuPopup: (_options: unknown, items: unknown[]) => {
					testWindow.__menuItems = items;
				}
			}
		});
		const el = wrapper.element as HTMLElement;
		const vm = wrapper.vm as unknown as ParamListApi;
		mockHeight(el);
		vm.bind(makeObject());
		el.focus();
		vm.write([{ name: 'One' }]);
		vm.select(0);
		el.dispatchEvent(
			new PointerEvent('pointerup', { bubbles: true, button: 2, clientX: 10, clientY: 10 })
		);
		const items = testWindow.__menuItems;
		expect(items).toBeTruthy();
		expect((items as { label: string }[])[0].label).toBe('edit');
		expect((items as { label: string }[])[1].label).toBe('insert');
		delete testWindow.__menuItems;
	});
});
