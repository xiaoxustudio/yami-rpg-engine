import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMNavBar from '../YMNavBar.vue';
import type { NavBarApi } from '../nav-bar-api';

const mountNav = () =>
	mount(YMNavBar, {
		slots: {
			default:
				'<div class="nav-item" value="a">A</div>' +
				'<div class="nav-item" value="b">B</div>' +
				'<span>Junk</span>'
		}
	});

const pointerdown = (el: Element) =>
	el.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));

describe('YMNavBar', () => {
	it('removes non nav-item children on mount', () => {
		const wrapper = mountNav();
		const items = wrapper.findAll('.nav-item');
		expect(items).toHaveLength(2);
		expect(wrapper.text()).not.toContain('Junk');
	});

	it('write selects matching nav-item and emits write', async () => {
		const wrapper = mountNav();
		const vm = wrapper.vm as unknown as NavBarApi;
		const el = wrapper.element as unknown as NavBarApi;
		el.on('write', () => {});
		vm.write('b');
		await wrapper.vm.$nextTick();
		const items = wrapper.findAll('.nav-item');
		expect(items[1].classes()).toContain('selected');
		expect(items[0].classes()).not.toContain('selected');
	});

	it('read returns selected value', () => {
		const wrapper = mountNav();
		const vm = wrapper.vm as unknown as NavBarApi;
		vm.write('a');
		expect(vm.read()).toBe('a');
	});

	it('selects nav-item on pointerdown and emits select', async () => {
		const wrapper = mountNav();
		const _vm = wrapper.vm as unknown as NavBarApi;
		const el = wrapper.element as unknown as NavBarApi;
		el.on('select', () => {});
		pointerdown(wrapper.findAll('.nav-item')[1].element);
		await wrapper.vm.$nextTick();
		expect(wrapper.findAll('.nav-item')[1].classes()).toContain('selected');
	});

	it('unselect clears selection', () => {
		const wrapper = mountNav();
		const vm = wrapper.vm as unknown as NavBarApi;
		vm.write('a');
		vm.unselect();
		expect(vm.read()).toBeUndefined();
	});

	it('unselect 清掉全部 selected（不只第一个）', () => {
		const wrapper = mountNav();
		const vm = wrapper.vm as unknown as NavBarApi;
		const items = wrapper.findAll('.nav-item');
		vm.write('a');
		items[1].element.classList.add('selected');

		vm.unselect();

		expect(wrapper.element.querySelectorAll('.selected')).toHaveLength(0);
	});

	it('页签晚于 write 到达（Teleport）：按当前值重放选中，残留被清掉', async () => {
		const wrapper = mountNav();
		const vm = wrapper.vm as unknown as NavBarApi;
		vm.write('a');

		const stale = document.createElement('div');
		stale.className = 'nav-item selected';
		stale.setAttribute('value', 'b');
		wrapper.element.appendChild(stale);
		await Promise.resolve();

		expect(wrapper.element.querySelectorAll('.selected')).toHaveLength(1);
		expect(wrapper.findAll('.nav-item')[0].classes()).toContain('selected');
		expect(stale.classList.contains('selected')).toBe(false);
	});
});
