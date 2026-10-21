import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import YMTabBar from '../YMTabBar.vue';
import { elementDataOf } from '../../../../utils/element-data';

const makeData = (): { icon: string; name: string; type: string; meta: string }[] => [
	{ icon: 'A', name: 'Alpha', type: 'file', meta: 'm1' },
	{ icon: 'B', name: 'Beta', type: 'file', meta: 'm2' },
	{ icon: 'D', name: 'Dir', type: 'directory', meta: 'm3' }
];

interface TabBarElement extends HTMLElement {
	[k: string]: unknown;
	read: () => unknown;
	write: (item: unknown) => void;
	update: () => void;
	parseTabName: () => void;
	select: (item: unknown) => void;
	unselect: () => void;
	insert: (item: unknown) => void;
	close: (item: unknown) => void;
	closeByProperty: (property: string, value: unknown) => void;
	closeOtherTabs: (item: unknown) => void;
	closeTabsToTheRight: () => void;
	find: (value: unknown) => unknown;
	clear: () => void;
	on: (name: string, cb: (e: Event & { value: unknown; closedItems: unknown }) => void) => void;
	data: unknown;
	dirItem: unknown;
}

/** `dragging` 不再是元素上的隐式属性，走显式元素数据 */
const listData = (el: unknown): { dragging: unknown } => elementDataOf<{ dragging: unknown }>(el);

describe('YMTabBar', () => {
	it('mounts and exposes api', () => {
		const wrapper = mount(YMTabBar);
		expect(wrapper.element.classList.contains('tab-bar')).toBe(true);
		const el = wrapper.element as unknown as TabBarElement;
		for (const name of [
			'read',
			'write',
			'update',
			'parseTabName',
			'select',
			'unselect',
			'insert',
			'close',
			'closeByProperty',
			'closeOtherTabs',
			'closeTabsToTheRight',
			'find',
			'clear',
			'on'
		]) {
			expect(typeof el[name], name).toBe('function');
		}
	});

	it('update renders tabs with close marks', () => {
		const wrapper = mount(YMTabBar);
		const el = wrapper.element as unknown as TabBarElement;
		const data = makeData();
		el.data = data;
		el.update();
		const texts = Array.from(el.querySelectorAll('.tab-text')).map(
			(n) => (n as HTMLElement).textContent
		);
		expect(texts).toEqual(['A Alpha', 'B Beta', 'D Dir']);
		expect(el.querySelectorAll('.tab-item').length).toBe(3);
		expect(el.querySelectorAll('.tab-close').length).toBe(2);
	});

	it('write selects matching tab and dispatches event', () => {
		const wrapper = mount(YMTabBar);
		const el = wrapper.element as unknown as TabBarElement;
		const data = makeData();
		el.data = data;
		el.update();
		let written = null;
		el.on('write', (e: Event & { value: unknown }) => (written = e.value));
		el.write(data[1]);
		expect(el.querySelectorAll('.tab-item')[1].classList.contains('selected')).toBe(true);
		expect(written).toBe(data[1]);
	});

	it('select dispatches select event', () => {
		const wrapper = mount(YMTabBar);
		const el = wrapper.element as unknown as TabBarElement;
		const data = makeData();
		el.data = data;
		el.update();
		let selected = null;
		el.on('select', (e: Event & { value: unknown }) => (selected = e.value));
		el.select(data[0]);
		expect(selected).toBe(data[0]);
	});

	it('insert adds tab after selection', () => {
		const wrapper = mount(YMTabBar);
		const el = wrapper.element as unknown as TabBarElement;
		const data = makeData();
		el.data = data;
		el.update();
		el.select(data[1]);
		const node = { icon: 'C', name: 'Gamma', type: 'file', meta: 'm4' };
		el.insert(node);
		expect(data).toContain(node);
		expect(data.indexOf(node)).toBe(2);
	});

	it('close removes tab and selects neighbor', () => {
		const wrapper = mount(YMTabBar);
		const el = wrapper.element as unknown as TabBarElement;
		const data = makeData();
		el.data = data;
		el.update();
		el.select(data[1]);
		let closed = null;
		el.on('closed', (e: Event & { closedItems: unknown }) => (closed = e.closedItems));
		const beta = data[1];
		const dir = data[2];
		el.close(beta);
		expect(data).not.toContain(beta);
		expect(closed).toEqual([beta]);
		expect(el.read()).toBe(dir);
	});

	it('closeByProperty closes matching tab', () => {
		const wrapper = mount(YMTabBar);
		const el = wrapper.element as unknown as TabBarElement;
		const data = makeData();
		el.data = data;
		el.update();
		const beta = data[1];
		el.closeByProperty('meta', 'm2');
		expect(data).not.toContain(beta);
	});

	it('closeOtherTabs keeps only target and dirItem', () => {
		const wrapper = mount(YMTabBar);
		const el = wrapper.element as unknown as TabBarElement;
		const data = makeData();
		el.data = data;
		el.dirItem = data[2];
		el.update();
		const alpha = data[0];
		const dir = data[2];
		el.closeOtherTabs(alpha);
		expect(data).toEqual([alpha, dir]);
	});

	it('find locates tab by meta', () => {
		const wrapper = mount(YMTabBar);
		const el = wrapper.element as unknown as TabBarElement;
		const data = makeData();
		el.data = data;
		el.update();
		expect(el.find('m2')).toBe(data[1]);
		expect(el.find('none')).toBe(undefined);
	});

	it('pointerdown on close mark triggers close on pointerup', async () => {
		const wrapper = mount(YMTabBar, { attachTo: document.body });
		const el = wrapper.element as unknown as TabBarElement;
		const data = makeData();
		el.data = data;
		el.update();
		const tab = el.querySelectorAll('.tab-item')[0] as HTMLElement;
		const closeMark = tab.querySelector('.tab-close') as HTMLElement;
		closeMark.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		expect(listData(el).dragging).toBeTruthy();
		// window 上的 pointerup 由 `useEventListener` 在 flush: 'post' 挂载，让出一拍
		await nextTick();
		const alpha = data[0];
		closeMark.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0 }));
		expect(data).not.toContain(alpha);
		expect(listData(el).dragging).toBe(null);
	});

	it('pointerdown on tab selects it', () => {
		const wrapper = mount(YMTabBar, { attachTo: document.body });
		const el = wrapper.element as unknown as TabBarElement;
		const data = makeData();
		el.data = data;
		el.update();
		const tab = el.querySelectorAll('.tab-item')[2] as HTMLElement;
		tab.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		expect(tab.classList.contains('selected')).toBe(true);
	});

	it('close 拖动期间再次 pointerdown：dragend 不因 hint 为 null 而中断', () => {
		const wrapper = mount(YMTabBar, { attachTo: document.body });
		const el = wrapper.element as unknown as TabBarElement;
		const data = makeData();
		el.data = data;
		el.update();
		const tab = el.querySelectorAll('.tab-item')[0] as HTMLElement;
		const closeMark = tab.querySelector('.tab-close') as HTMLElement;
		closeMark.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		expect(listData(el).dragging).toBeTruthy();
		tab.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 2 }));
		expect(listData(el).dragging).toBe(null);
	});

	it('popup 手势：pointerup 不再抛错，命中时派发 popup 事件并清空手势态', async () => {
		const wrapper = mount(YMTabBar, { attachTo: document.body });
		const el = wrapper.element as unknown as TabBarElement;
		const data = makeData();
		el.data = data;
		el.update();
		let popped: unknown = 'unset';
		el.on('popup', (e: Event & { value: unknown }) => (popped = e.value));
		const tab = el.querySelectorAll('.tab-item')[0] as HTMLElement;
		tab.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 2 }));
		expect(listData(el).dragging).toBeTruthy();
		await nextTick();
		expect(() =>
			tab.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 2 }))
		).not.toThrow();
		expect(popped).toBe(data[0]);
		expect(listData(el).dragging).toBe(null);
	});

	it('关闭键按下后把指针移开再松开：不关标签，但手势态必须清空', async () => {
		const wrapper = mount(YMTabBar, { attachTo: document.body });
		const el = wrapper.element as unknown as TabBarElement;
		const data = makeData();
		el.data = data;
		el.update();
		const tab = el.querySelectorAll('.tab-item')[0] as HTMLElement;
		const closeMark = tab.querySelector('.tab-close') as HTMLElement;
		closeMark.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		expect(listData(el).dragging).toBeTruthy();
		await nextTick();
		document.body.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0 }));
		expect(el.querySelectorAll('.tab-item').length).toBe(3);
		expect(listData(el).dragging).toBe(null);
	});

	it('拖拽途中卸载：组件子树之外的 hint 被显式回收', () => {
		const wrapper = mount(YMTabBar, { attachTo: document.body });
		const el = wrapper.element as unknown as TabBarElement;
		const data = makeData();
		el.data = data;
		el.update();
		const tab = el.querySelectorAll('.tab-item')[0] as HTMLElement;
		tab.dispatchEvent(new Event('dragstart', { bubbles: true }));
		expect(listData(el).dragging).toBeTruthy();
		const hint = document.querySelector('.drag-and-drop-hint') as HTMLElement;
		expect(hint).not.toBe(null);
		const hintRemove = vi.spyOn(hint, 'remove');
		wrapper.unmount();
		expect(hintRemove).toHaveBeenCalled();
		vi.restoreAllMocks();
	});

	/**
	 * 这条原先和上面的 hint 回收混在一句里，靠的是旧实现**无条件**
	 * `window.removeEventListener('pointerup', …)`，所以 `dragstart` 那条手势
	 * （它**不挂** window 监听，只有 `pointerdown` 的两条分支才挂）也能"通过"。
	 *
	 * 改走 `enabled` 后摘除是**有条件的**，于是必须用一个真的会挂上监听的手势来测，
	 * 并且等 `flush: 'post'` 挂完再卸载 —— 这样断言的才是真实回收。
	 */
	it('手势进行中卸载：window 上的 pointerup 被回收（enabled 通道）', async () => {
		const wrapper = mount(YMTabBar, { attachTo: document.body });
		const el = wrapper.element as unknown as TabBarElement;
		el.data = makeData();
		el.update();
		const tab = el.querySelectorAll('.tab-item')[0] as HTMLElement;
		const closeMark = tab.querySelector('.tab-close') as HTMLElement;
		closeMark.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		expect(listData(el).dragging).toBeTruthy();
		await nextTick();

		const removeListener = vi.spyOn(window, 'removeEventListener');
		wrapper.unmount();
		// 注意第三个实参：`useEventListener` 内部是 `removeEventListener(type, handler, native)`，
		// `native` 未传时为 `undefined`。vitest 的 `toHaveBeenCalledWith` 比对**完整实参表**，
		// 只写两个实参匹配不上（旧实现是组件自己调的，恰好只传两个，故原断言是两参形式）。
		expect(removeListener).toHaveBeenCalledWith('pointerup', expect.any(Function), undefined);
		vi.restoreAllMocks();
	});
});
