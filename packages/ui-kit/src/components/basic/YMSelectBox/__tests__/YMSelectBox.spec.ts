import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMSelectBox from '../YMSelectBox.vue';
import type { SelectBoxApi } from '../select-box-api';

const items = [
	{ value: 'a', name: 'Alpha' },
	{ value: 'b', name: 'Beta' }
];

describe('YMSelectBox', () => {
	it('read/write roundtrip and update text', () => {
		const wrapper = mount(YMSelectBox, { props: { items } });
		const vm = wrapper.vm as unknown as SelectBoxApi;
		vm.write('b');
		expect(vm.read()).toBe('b');
		expect(wrapper.find('.select-box-text').text()).toBe('Beta');
	});

	it('write2 falls back to default when value missing', () => {
		const wrapper = mount(YMSelectBox, { props: { items } });
		const vm = wrapper.vm as unknown as SelectBoxApi;
		vm.write2('zzz');
		expect(vm.read()).toBe('a');
	});

	it('input emits change and input events', async () => {
		const wrapper = mount(YMSelectBox, { props: { items } });
		const vm = wrapper.vm as unknown as SelectBoxApi;
		const el = wrapper.element as unknown as SelectBoxApi;
		const changes: unknown[] = [];
		el.addEventListener('change', () => changes.push(1));
		vm.input('b');
		await wrapper.vm.$nextTick();
		expect(changes).toHaveLength(1);
		expect(wrapper.emitted('input')).toBeDefined();
	});

	it('reselect moves between items', () => {
		const wrapper = mount(YMSelectBox, { props: { items } });
		const vm = wrapper.vm as unknown as SelectBoxApi;
		vm.write('a');
		vm.reselect(1);
		expect(vm.read()).toBe('b');
		vm.reselect(-1);
		expect(vm.read()).toBe('a');
	});

	it('opens builtin popup on pointerdown and picks item', async () => {
		const wrapper = mount(YMSelectBox, { props: { items } });
		wrapper.element.dispatchEvent(
			new PointerEvent('pointerdown', { button: 0, bubbles: true })
		);
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.select-popup').exists()).toBe(true);
		const itemsInPopup = wrapper.findAll('.select-item');
		expect(itemsInPopup).toHaveLength(2);
		await itemsInPopup[1].trigger('pointerdown');
		await wrapper.vm.$nextTick();
		expect((wrapper.vm as unknown as SelectBoxApi).read()).toBe('b');
		expect(wrapper.find('.select-popup').exists()).toBe(false);
	});

	it('emits open event when popup disabled', async () => {
		const wrapper = mount(YMSelectBox, { props: { items, popup: false } });
		wrapper.element.dispatchEvent(
			new PointerEvent('pointerdown', { button: 0, bubbles: true })
		);
		await wrapper.vm.$nextTick();
		expect(wrapper.emitted('open')).toHaveLength(1);
		expect(wrapper.find('.select-popup').exists()).toBe(false);
	});

	it('exposes bridge functions on root element', () => {
		const wrapper = mount(YMSelectBox, { props: { items } });
		const el = wrapper.element as unknown as SelectBoxApi;
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.loadItems).toBe('function');
		expect(typeof el.on).toBe('function');
	});

	it('save/restore roundtrip', () => {
		const wrapper = mount(YMSelectBox, { props: { items } });
		const vm = wrapper.vm as unknown as SelectBoxApi;
		vm.write('a');
		vm.save();
		vm.write('b');
		vm.restore();
		expect(vm.read()).toBe('a');
	});
});
