import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMMenuList from '../YMMenuList.vue';
import type { MenuApi } from '../menu-api';

const items = [
	{ label: 'Open', accelerator: 'Ctrl+O', click: () => {} },
	{ type: 'separator' },
	{ label: 'Disabled', enabled: false },
	{ label: 'Sub', submenu: [{ label: 'Inner' }] },
	{ label: 'Checked', checked: true }
];

const selectedItem = (wrapper: ReturnType<typeof mount>): HTMLElement | null =>
	wrapper.element.querySelector('.menu-item.selected') as HTMLElement | null;

describe('YMMenuList', () => {
	it('popup renders items', () => {
		const wrapper = mount(YMMenuList);
		const vm = wrapper.vm as unknown as MenuApi;
		vm.popup({ x: 10, y: 20 }, items);
		const el = wrapper.element;
		expect(el.classList.contains('menu-list')).toBe(true);
		const labels = Array.from(el.querySelectorAll('.menu-label')).map(
			(n) => (n as HTMLElement).textContent
		);
		expect(labels).toEqual(['Open', 'Disabled', 'Sub', 'Checked']);
		expect(el.querySelector('.menu-separator')).toBeTruthy();
		expect(el.querySelector('.menu-checked')).toBeTruthy();
		expect(el.querySelector('.menu-sub-mark')).toBeTruthy();
		expect(document.body.contains(el)).toBe(true);
		expect(el.style.left).not.toBe('');
		expect(el.style.top).not.toBe('');
	});

	it('close removes items and detaches from body', () => {
		const wrapper = mount(YMMenuList);
		const vm = wrapper.vm as unknown as MenuApi;
		vm.popup({}, items);
		expect(document.body.contains(wrapper.element)).toBe(true);
		vm.close();
		expect(document.body.contains(wrapper.element)).toBe(false);
		expect(wrapper.element.querySelector('.menu-item')).toBeFalsy();
	});

	it('close invokes callback', () => {
		const wrapper = mount(YMMenuList);
		const vm = wrapper.vm as unknown as MenuApi;
		let called = false;
		vm.popup({ close: () => (called = true) }, items);
		vm.close();
		expect(called).toBe(true);
	});

	it('select and unselect toggle class', () => {
		const wrapper = mount(YMMenuList);
		const vm = wrapper.vm as unknown as MenuApi;
		vm.popup({}, items);
		const first = wrapper.element.querySelector('.menu-item') as HTMLElement;
		vm.select(first);
		expect(first.classList.contains('selected')).toBe(true);
		vm.unselect();
		expect(first.classList.contains('selected')).toBe(false);
	});

	it('reselect skips disabled and separators', () => {
		const wrapper = mount(YMMenuList);
		const vm = wrapper.vm as unknown as MenuApi;
		vm.popup({}, items);
		const enabled = Array.from(wrapper.element.querySelectorAll('.menu-item')).filter(
			(n) => !(n as HTMLElement).classList.contains('disabled')
		);
		vm.reselect(1);
		expect(selectedItem(wrapper)).toBe(enabled[0]);
		vm.reselect(1);
		expect(selectedItem(wrapper)).toBe(enabled[1]);
		vm.reselect(-1);
		vm.reselect(-1);
		expect(selectedItem(wrapper)).toBe(enabled[enabled.length - 1]);
	});

	it('keydown Enter clicks selected item and closes', () => {
		const wrapper = mount(YMMenuList);
		const vm = wrapper.vm as unknown as MenuApi;
		let clicked = false;
		vm.popup({}, [{ label: 'Open', click: () => (clicked = true) }]);
		const first = wrapper.element.querySelector('.menu-item') as HTMLElement;
		vm.select(first);
		window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', bubbles: true }));
		expect(clicked).toBe(true);
		expect(document.body.contains(wrapper.element)).toBe(false);
	});

	it('keydown Escape closes', () => {
		const wrapper = mount(YMMenuList);
		const vm = wrapper.vm as unknown as MenuApi;
		vm.popup({}, items);
		window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true }));
		expect(document.body.contains(wrapper.element)).toBe(false);
	});

	it('external pointerdown closes menu', () => {
		const wrapper = mount(YMMenuList);
		const vm = wrapper.vm as unknown as MenuApi;
		vm.popup({}, items);
		const outside = document.createElement('div');
		document.body.appendChild(outside);
		outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		expect(document.body.contains(wrapper.element)).toBe(false);
		outside.remove();
	});

	it('pointerup on menu item triggers click and closes', () => {
		const wrapper = mount(YMMenuList);
		const vm = wrapper.vm as unknown as MenuApi;
		let clicked = false;
		vm.popup({}, [{ label: 'Open', click: () => (clicked = true) }]);
		const item = wrapper.element.querySelector('.menu-item') as HTMLElement;
		item.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		item.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0 }));
		expect(clicked).toBe(true);
		expect(document.body.contains(wrapper.element)).toBe(false);
	});

	it('exposes api through component instance', () => {
		const wrapper = mount(YMMenuList);
		const vm = wrapper.vm as unknown as MenuApi;
		expect(typeof vm.popup).toBe('function');
		expect(typeof vm.close).toBe('function');
		expect(typeof vm.clear).toBe('function');
		expect(typeof vm.createItem).toBe('function');
		expect(typeof vm.select).toBe('function');
		expect(typeof vm.unselect).toBe('function');
		expect(typeof vm.reselect).toBe('function');
		expect(typeof vm.popupSubmenu).toBe('function');
		expect(typeof vm.closeSubmenu).toBe('function');
	});
});
