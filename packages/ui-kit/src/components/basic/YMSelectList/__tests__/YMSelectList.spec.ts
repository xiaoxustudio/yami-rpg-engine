import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMSelectList from '../YMSelectList.vue';
import { createSelectListApi } from '../select-list-api';

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 200, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 200, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 200, configurable: true });
};

const makeTarget = (value = 'b'): any => {
	const target: any = document.createElement('div');
	target.classList.add('select-box');
	const rect = { left: 10, top: 100, bottom: 120, width: 150, height: 20 };
	Object.defineProperty(target, 'getBoundingClientRect', {
		value: () => rect,
		configurable: true
	});
	target.dataItems = [
		{ value: 'a', name: 'Alpha' },
		{ value: 'b', name: 'Beta', tip: 'beta tip' },
		{ value: 'c', name: 'Gamma' }
	];
	target.dataValue = value;
	target.input = () => {};
	return target;
};

describe('YMSelectList', () => {
	it('open renders items and positions', () => {
		const wrapper = mount(YMSelectList, { attachTo: document.body });
		const vm = wrapper.vm as any;
		mockHeight(wrapper.element);
		const target = makeTarget();
		vm.open(target);
		const el = wrapper.element;
		expect(el.classList.contains('select-list')).toBe(true);
		expect(document.body.contains(el)).toBe(true);
		const labels = Array.from(el.querySelectorAll('.select-item')).map(
			(n) => (n as HTMLElement).textContent
		);
		expect(labels).toEqual(['Alpha', 'Beta', 'Gamma']);
		expect(el.style.left).toBe('10px');
		expect(el.style.top).toBe('120px');
		expect(el.style.zIndex).not.toBe('');
		vm.close();
	});

	it('open selects current value', () => {
		const wrapper = mount(YMSelectList, { attachTo: document.body });
		const vm = wrapper.vm as any;
		mockHeight(wrapper.element);
		const target = makeTarget('b');
		vm.open(target);
		const items = Array.from(wrapper.element.querySelectorAll('.select-item')) as HTMLElement[];
		expect(items[1].classList.contains('selected')).toBe(true);
		expect(vm.read()).toBe('b');
		vm.close();
	});

	it('write selects matching item', () => {
		const wrapper = mount(YMSelectList, { attachTo: document.body });
		const vm = wrapper.vm as any;
		mockHeight(wrapper.element);
		vm.open(makeTarget('a'));
		vm.write('c');
		const items = Array.from(wrapper.element.querySelectorAll('.select-item')) as HTMLElement[];
		expect(items[2].classList.contains('selected')).toBe(true);
		expect(vm.read()).toBe('c');
		vm.close();
	});

	it('keyboard Enter commits value to target', () => {
		const wrapper = mount(YMSelectList, { attachTo: document.body });
		const vm = wrapper.vm as any;
		mockHeight(wrapper.element);
		const target = makeTarget('a');
		let inputted = null;
		target.input = (v: any) => (inputted = v);
		vm.open(target);
		vm.write('b');
		window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', bubbles: true }));
		expect(inputted).toBe('b');
		expect(document.body.contains(wrapper.element)).toBe(false);
	});

	it('Escape closes', () => {
		const wrapper = mount(YMSelectList, { attachTo: document.body });
		const vm = wrapper.vm as any;
		mockHeight(wrapper.element);
		vm.open(makeTarget());
		window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true }));
		expect(document.body.contains(wrapper.element)).toBe(false);
	});

	it('arrow keys navigate selection', () => {
		const wrapper = mount(YMSelectList, { attachTo: document.body });
		const vm = wrapper.vm as any;
		mockHeight(wrapper.element);
		vm.open(makeTarget('a'));
		window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true }));
		expect(vm.read()).toBe('b');
		window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp', bubbles: true }));
		expect(vm.read()).toBe('a');
		vm.close();
	});

	it('pointerdown on item commits and closes', () => {
		const wrapper = mount(YMSelectList, { attachTo: document.body });
		const vm = wrapper.vm as any;
		mockHeight(wrapper.element);
		const target = makeTarget('a');
		let inputted = null;
		target.input = (v: any) => (inputted = v);
		vm.open(target);
		const items = Array.from(wrapper.element.querySelectorAll('.select-item')) as HTMLElement[];
		items[1].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		expect(inputted).toBe('b');
		expect(document.body.contains(wrapper.element)).toBe(false);
	});

	it('external pointerdown closes', () => {
		const wrapper = mount(YMSelectList, { attachTo: document.body });
		const vm = wrapper.vm as any;
		mockHeight(wrapper.element);
		vm.open(makeTarget());
		const outside = document.createElement('div');
		document.body.appendChild(outside);
		outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		expect(document.body.contains(wrapper.element)).toBe(false);
		outside.remove();
	});

	it('createItems renders with tooltip injection', () => {
		let tipReceived = null;
		const host = document.createElement('div');
		document.body.appendChild(host);
		mockHeight(host);
		const api = createSelectListApi(host, {
			setTooltip: (el: HTMLElement, tip: string) => (tipReceived = tip)
		});
		api.createItems([{ value: 'x', name: 'X', tip: 'x tip' }]);
		api.resize();
		expect(host.querySelector('.select-item')?.textContent).toBe('X');
		expect(tipReceived).toBe('x tip');
		host.remove();
	});

	it('exposes api through component instance', () => {
		const wrapper = mount(YMSelectList);
		const vm = wrapper.vm as any;
		for (const name of ['open', 'close', 'read', 'write', 'select', 'unselect', 'reselect']) {
			expect(typeof vm[name], name).toBe('function');
		}
	});
});
