import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
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

	it('pointerdown on close mark triggers close on pointerup', () => {
		const wrapper = mount(YMTabBar, { attachTo: document.body });
		const el = wrapper.element as unknown as TabBarElement;
		const data = makeData();
		el.data = data;
		el.update();
		const tab = el.querySelectorAll('.tab-item')[0] as HTMLElement;
		const closeMark = tab.querySelector('.tab-close') as HTMLElement;
		closeMark.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		expect(listData(el).dragging).toBeTruthy();
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
		// close / popup 两条路径构造出的 dragging 没有拖拽提示元素（hint === null）
		closeMark.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		expect(listData(el).dragging).toBeTruthy();
		// 第二次 pointerdown 会先跑 dragend()：修复前 hint.remove() 抛错并使 dragend 中断 ⇒ dragging 残留
		tab.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 2 }));
		expect(listData(el).dragging).toBe(null);
	});
});
