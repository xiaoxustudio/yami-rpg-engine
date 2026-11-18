import { describe, expect, it, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import YMCommonList from '../YMCommonList.vue';
import { elementDataOf } from '../../../../utils/element-data';

interface CommonListElement extends HTMLElement {
	[k: string]: unknown;
	read: () => unknown;
	write: (v: unknown) => void;
	reload: () => HTMLElement;
	unselect: () => void;
	selectRelative: (dir: string) => void;
	clear: () => void;
	appendElement: (el: HTMLElement) => void;
	resize: () => void;
	on: (name: string, cb: (e: Event & { value: unknown }) => void) => void;
}

const createItem = (value: unknown): HTMLElement => {
	const el = document.createElement('div');
	el.className = 'common-item';
	elementDataOf<{ dataValue?: unknown }>(el).dataValue = value;
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
		const vm = wrapper.vm as unknown as CommonListElement;
		vm.appendElement(createItem('a'));
		vm.appendElement(createItem('b'));
		vm.resize();
		vm.write('a');
		expect(vm.read()).toBe('a');
		expect(wrapper.find('.common-item').classes()).toContain('selected');
	});

	it('write emits write event with value', () => {
		const vm = wrapper.vm as unknown as CommonListElement;
		const events: unknown[] = [];
		vm.on('write', (e: Event & { value: unknown }) => events.push(e.value));
		vm.appendElement(createItem('x'));
		vm.resize();
		vm.write('x');
		expect(events).toEqual(['x']);
	});

	it('unselect clears selection', () => {
		const vm = wrapper.vm as unknown as CommonListElement;
		vm.appendElement(createItem('a'));
		vm.resize();
		vm.write('a');
		vm.unselect();
		expect(vm.read()).toBeUndefined();
	});

	it('selectRelative moves selection', () => {
		const vm = wrapper.vm as unknown as CommonListElement;
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
		const vm = wrapper.vm as unknown as CommonListElement;
		vm.appendElement(createItem('a'));
		vm.resize();
		vm.clear();
		expect(vm.read()).toBeUndefined();
		expect(wrapper.element.children.length).toBe(0);
	});

	// 契约锁：能力只在实例上，元素上不再挂方法（`attachApi` 已从组件里删除）
	it('能力只在组件实例上，元素上不再挂方法', () => {
		const el = wrapper.element as unknown as Record<string, unknown>;
		expect(el.read).toBeUndefined();
		expect(el.write).toBeUndefined();
		expect(el.reload).toBeUndefined();
		expect(el.appendElement).toBeUndefined();
		expect(el.clear).toBeUndefined();
		expect(el.on).toBeUndefined();

		const vm = wrapper.vm as unknown as CommonListElement;
		expect(typeof vm.read).toBe('function');
		expect(typeof vm.write).toBe('function');
		expect(typeof vm.reload).toBe('function');
		expect(typeof vm.appendElement).toBe('function');
		expect(typeof vm.clear).toBe('function');
		expect(typeof vm.on).toBe('function');
		// `reload()` 保持「返回宿主元素」的语义：DOM 站点仍能拿到根元素
		expect(vm.reload()).toBe(wrapper.element);
	});

	it('keyboard selectRelative via ArrowDown', async () => {
		const vm = wrapper.vm as unknown as CommonListElement;
		vm.appendElement(createItem('a'));
		vm.appendElement(createItem('b'));
		vm.resize();
		await wrapper.trigger('keydown', { code: 'ArrowDown' });
		expect(vm.read()).toBe('a');
		await wrapper.trigger('keydown', { code: 'ArrowDown' });
		expect(vm.read()).toBe('b');
	});
});
