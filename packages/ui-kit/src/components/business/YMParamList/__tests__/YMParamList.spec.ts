import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import YMParamList from '../YMParamList.vue';
import { getListConfig } from '../../../../utils/list-config';
import { ParamListHistory } from '../param-history';

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
};

const makeObject = (): {
	type: string;
	initialize: () => void;
	parse: (item: { name: string }) => string;
	save: () => unknown;
	onPaste: undefined;
} => ({
	type: 'test',
	initialize: () => {},
	parse: (item: { name: string }) => item.name,
	save: () => undefined,
	onPaste: undefined
});

interface ParamListElement extends HTMLElement {
	[k: string]: unknown;
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
	start: number;
	togglable: boolean;
	inserting: boolean;
	history: { canUndo: () => boolean };
}

const testWindow = window as unknown as { __menuItems?: unknown };

describe('YMParamList', () => {
	it('mounts and exposes api', () => {
		const wrapper = mount(YMParamList);
		expect(wrapper.element.classList.contains('param-list')).toBe(true);
		const el = wrapper.element as unknown as ParamListElement;
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
			expect(typeof el[name], name).toBe('function');
		}
	});

	/**
	 * 拖拽选择期的两个 window 监听（`pointerup` 收尾 / `pointermove` 跟随）本次改成
	 * `useEventListener` + `enabled`。此前 spec 只覆盖了右键 popup 那条分支，
	 * **拖拽选择分支没有任何用例**，故补这条：验证 `pointerup` 收尾确实能到达（清空 `dragging`）。
	 */
	it('拖拽选择：window 上的 pointerup 能收尾（useEventListener 的 enabled 通道）', async () => {
		const wrapper = mount(YMParamList, { attachTo: document.body });
		const el = wrapper.element as unknown as ParamListElement;
		mockHeight(el);
		el.bind(makeObject());
		el.focus();
		el.write([{ name: 'One' }, { name: 'Two' }, { name: 'Three' }]);
		await nextTick();

		const item = el.querySelector('.param-item') as HTMLElement;
		item.dispatchEvent(
			new PointerEvent('pointerdown', { button: 0, bubbles: true, pointerId: 5 })
		);
		expect(el.dragging).toBeTruthy();
		// window 上的监听由 useEventListener 在 flush: 'post' 挂载，先让出一拍
		await nextTick();
		window.dispatchEvent(
			new PointerEvent('pointerup', { button: 0, bubbles: true, pointerId: 5 })
		);
		expect(el.dragging).toBe(null);
	});

	/**
	 * 回归（2026-10-22 实报）：**列表变短后双击会崩**。
	 *
	 * `update()` 重建行时会 `elements.count = 0`、`elements.start = -1`，
	 * 但**不重置** `self.start` / `self.end`。于是"先选中第 4 行、随后列表只剩 1 行"时，
	 * `self.start` 仍是 3，`elements[3]` 已是 `undefined`；`edit()` 原先只守 `start !== null`，
	 * 读 `.dataItem` 就抛 `Cannot read properties of undefined (reading 'dataItem')`。
	 * 双击是 `attachDoubleclick` 合成 `doubleclick` 事件后走 `edit()`，所以双击必命中。
	 */
	it('列表变短后 edit 不崩（start 越界）', async () => {
		const wrapper = mount(YMParamList, { attachTo: document.body });
		const el = wrapper.element as unknown as ParamListElement;
		mockHeight(el);
		el.bind(makeObject());
		el.focus();
		el.write([{ name: 'One' }, { name: 'Two' }, { name: 'Three' }, { name: 'Four' }]);
		await nextTick();

		el.select(3);
		await nextTick();
		expect(el.start).toBe(3);

		// 列表缩短：`update()` 重建了行，但 `self.start` 仍是 3（越界）
		el.write([{ name: 'Only' }]);
		await nextTick();
		expect(el.start).toBe(3);

		expect(() => el.edit()).not.toThrow();
	});

	it('bind and write render items', () => {
		const wrapper = mount(YMParamList);
		const el = wrapper.element as unknown as ParamListElement;
		mockHeight(el);
		const object = makeObject();
		el.bind(object);
		el.focus();
		const data = [{ name: 'One' }, { name: 'Two' }, { name: 'Three' }];
		el.write(data);
		expect(el.data).toBe(data);
		const texts = Array.from(el.querySelectorAll('.param-item') as NodeListOf<Element>).map(
			(n: Element) => n.textContent
		);
		expect(texts).toEqual(['One', 'Two', 'Three', '3 items']);
	});

	it('select highlights and read returns data', () => {
		const wrapper = mount(YMParamList, { attachTo: document.body });
		const el = wrapper.element as unknown as ParamListElement;
		mockHeight(el);
		el.bind(makeObject());
		el.focus();
		el.write([{ name: 'One' }, { name: 'Two' }]);
		el.select(1);
		expect(el.querySelectorAll('.param-item')[1].classList.contains('selected')).toBe(true);
		expect(el.start).toBe(1);
	});

	it('delete removes items and saves history', () => {
		const wrapper = mount(YMParamList);
		const el = wrapper.element as unknown as ParamListElement;
		mockHeight(el);
		el.bind(makeObject());
		el.focus();
		const data = [{ name: 'One' }, { name: 'Two' }, { name: 'Three' }];
		el.write(data);
		el.select(1);
		el.delete();
		expect(data.map((d) => d.name)).toEqual(['One', 'Three']);
		expect(el.history.canUndo()).toBe(true);
	});

	it('undo restores deleted items', () => {
		const wrapper = mount(YMParamList);
		const el = wrapper.element as unknown as ParamListElement;
		mockHeight(el);
		el.bind(makeObject());
		el.focus();
		const data = [{ name: 'One' }, { name: 'Two' }];
		el.write(data);
		el.select(1);
		el.delete();
		el.undo();
		expect(data.map((d) => d.name)).toEqual(['One', 'Two']);
	});

	it('toggle disables items', () => {
		const wrapper = mount(YMParamList);
		const el = wrapper.element as unknown as ParamListElement;
		mockHeight(el);
		el.bind(makeObject());
		el.focus();
		getListConfig(el).togglable = true;
		const data = [
			{ name: 'One', enabled: true },
			{ name: 'Two', enabled: true }
		];
		el.write(data);
		el.select(0, 1);
		el.toggle();
		expect(data[0].enabled).toBe(false);
		expect(data[1].enabled).toBe(false);
	});

	it('元素访问器 togglable 与 getListConfig 是同一份真源', () => {
		const wrapper = mount(YMParamList);
		const el = wrapper.element as unknown as ParamListElement;
		mockHeight(el);
		el.bind(makeObject());
		el.focus();
		el.togglable = true;
		expect(getListConfig(el).togglable).toBe(true);
		expect(el.togglable).toBe(true);
		const data = [
			{ name: 'One', enabled: true },
			{ name: 'Two', enabled: true }
		];
		el.write(data);
		el.select(0, 1);
		el.toggle();
		expect(data[0].enabled).toBe(false);
		expect(data[1].enabled).toBe(false);
	});

	it('save dispatches change and replaces item', () => {
		const wrapper = mount(YMParamList);
		const el = wrapper.element as unknown as ParamListElement;
		mockHeight(el);
		let changed: EventTarget | null = null;
		el.on('change', (e: Event) => (changed = e.target));
		const object = makeObject();
		object.save = () => ({ name: 'Replaced' });
		el.bind(object);
		el.focus();
		const data = [{ name: 'One' }, { name: 'Two' }];
		el.write(data);
		el.select(1);
		el.edit = () => {};
		el.inserting = false;
		el.save();
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
		const el = wrapper.element as unknown as ParamListElement;
		mockHeight(el);
		el.bind(makeObject());
		el.focus();
		const data = [{ name: 'One' }];
		el.write(data);
		el.select(0);
		el.paste();
		expect(data.map((d) => d.name)).toEqual(['Pasted', 'One']);
	});

	it('custom history factory is used', () => {
		const wrapper = mount(YMParamList, {
			props: {
				historyFactory: (list: unknown) => new ParamListHistory(list as never)
			}
		});
		const el = wrapper.element as unknown as ParamListElement;
		mockHeight(el);
		el.bind(makeObject());
		el.focus();
		el.write([{ name: 'A' }]);
		expect(el.history).toBeInstanceOf(ParamListHistory);
	});

	it('right-click popup uses injected menuPopup', () => {
		const wrapper = mount(YMParamList, {
			attachTo: document.body,
			props: {
				localize: (key: string) => key,
				menuPopup: (options: unknown, items: unknown[]) => {
					testWindow.__menuItems = items;
				}
			}
		});
		const el = wrapper.element as unknown as ParamListElement;
		mockHeight(el);
		el.bind(makeObject());
		el.focus();
		el.write([{ name: 'One' }]);
		el.select(0);
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
