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

	it('relate hides unrelated fields after mount when modelValue pre-set', async () => {
		const wrapper = mount(YMSelectBox, {
			props: { items, modelValue: 'b' },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as SelectBoxApi;
		const la = document.createElement('div');
		la.className = 'text';
		la.textContent = 'A';
		document.body.appendChild(la);
		const ta = document.createElement('div');
		document.body.appendChild(ta);
		const lb = document.createElement('div');
		lb.className = 'text';
		lb.textContent = 'B';
		document.body.appendChild(lb);
		const tb = document.createElement('div');
		document.body.appendChild(tb);
		el.enableHiddenMode();
		el.relate([
			{ case: 'a', targets: [ta] },
			{ case: 'b', targets: [tb] }
		]);
		await wrapper.vm.$nextTick();
		expect(tb.style.display).not.toBe('none');
		expect(lb.style.display).not.toBe('none');
		expect(ta.style.display).toBe('none');
		expect(la.style.display).toBe('none');
		el.input('a');
		await wrapper.vm.$nextTick();
		expect(ta.style.display).not.toBe('none');
		expect(la.style.display).not.toBe('none');
		expect(tb.style.display).toBe('none');
		expect(lb.style.display).toBe('none');
		la.remove();
		ta.remove();
		lb.remove();
		tb.remove();
		wrapper.unmount();
	});

	it('relate hides/shows targets by current value after setup', () => {
		const wrapper = mount(YMSelectBox, { props: { items } });
		const el = wrapper.element as unknown as SelectBoxApi;
		const makeLabel = (text: string) => {
			const label = document.createElement('div');
			label.className = 'text';
			label.textContent = text;
			document.body.appendChild(label);
			return label;
		};
		const la = makeLabel('A');
		const ta = document.createElement('div');
		document.body.appendChild(ta);
		const lb = makeLabel('B');
		const tb = document.createElement('div');
		document.body.appendChild(tb);
		el.enableHiddenMode();
		el.write('b');
		el.relate([
			{ case: 'a', targets: [ta] },
			{ case: 'b', targets: [tb] }
		]);
		expect(tb.style.display).not.toBe('none');
		expect(ta.style.display).toBe('none');
		expect(la.style.display).toBe('none');
		expect(lb.style.display).not.toBe('none');
		el.write('a');
		expect(ta.style.display).not.toBe('none');
		expect(tb.style.display).toBe('none');
		expect(la.style.display).not.toBe('none');
		expect(lb.style.display).toBe('none');
		la.remove();
		ta.remove();
		lb.remove();
		tb.remove();
	});
});
