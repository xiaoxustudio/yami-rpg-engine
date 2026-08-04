import { describe, expect, it, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import YMCommonList from '../YMCommonList.vue';

const createItem = (value: any): HTMLElement => {
	const el = document.createElement('common-item');
	el.className = 'common-item';
	(el as any).dataValue = value;
	el.textContent = String(value);
	return el;
};

describe('YMCommonList', () => {
	let wrapper: ReturnType<typeof mount>;

	beforeEach(() => {
		wrapper = mount(YMCommonList);
		Object.defineProperty(wrapper.element, 'clientHeight', { value: 100, configurable: true });
	});

	it('appends elements and reads selection', () => {
		const vm = wrapper.vm as any;
		vm.appendElement(createItem('a'));
		vm.appendElement(createItem('b'));
		vm.resize();
		vm.write('a');
		expect(vm.read()).toBe('a');
		expect(wrapper.find('.common-item').classes()).toContain('selected');
	});

	it('write emits write event with value', () => {
		const vm = wrapper.vm as any;
		const el = wrapper.element as any;
		const events: any[] = [];
		el.on('write', (e: any) => events.push(e.value));
		vm.appendElement(createItem('x'));
		vm.resize();
		vm.write('x');
		expect(events).toEqual(['x']);
	});

	it('unselect clears selection', () => {
		const vm = wrapper.vm as any;
		vm.appendElement(createItem('a'));
		vm.resize();
		vm.write('a');
		vm.unselect();
		expect(vm.read()).toBeUndefined();
	});

	it('selectRelative moves selection', () => {
		const vm = wrapper.vm as any;
		vm.appendElement(createItem('a'));
		vm.appendElement(createItem('b'));
		vm.appendElement(createItem('c'));
		vm.resize();
		vm.write('a');
		vm.selectRelative('down');
		expect(vm.read()).toBe('b');
		vm.selectRelative('down');
		expect(vm.read()).toBe('c');
		vm.selectRelative('up');
		expect(vm.read()).toBe('b');
	});

	it('clear empties the list', () => {
		const vm = wrapper.vm as any;
		vm.appendElement(createItem('a'));
		vm.resize();
		vm.clear();
		expect(vm.read()).toBeUndefined();
		expect(wrapper.element.children.length).toBe(0);
	});

	it('exposes bridge functions on root element', () => {
		const el = wrapper.element as any;
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.appendElement).toBe('function');
		expect(typeof el.clear).toBe('function');
		expect(typeof el.on).toBe('function');
	});

	it('keyboard selectRelative via ArrowDown', async () => {
		const vm = wrapper.vm as any;
		vm.appendElement(createItem('a'));
		vm.appendElement(createItem('b'));
		vm.resize();
		await wrapper.trigger('keydown', { code: 'ArrowDown' });
		expect(vm.read()).toBe('a');
		await wrapper.trigger('keydown', { code: 'ArrowDown' });
		expect(vm.read()).toBe('b');
	});
});
