import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';

import { controlRoot, useControlRefs } from '../control-refs';

/** 最小控件：只暴露迁移用到的成员（模拟包装组件的 `defineExpose`）。 */
const Leaf = defineComponent({
	name: 'LeafControl',
	setup(_props, { expose }) {
		const root = ref<HTMLElement | null>(null);
		const loaded = ref<string[]>([]);
		expose({
			loadItems: (items: unknown[]) => {
				loaded.value = items as string[];
				return loaded.value;
			},
			read: () => 'leaf-value',
			write: () => {},
			relate: () => {},
			enableHiddenMode: () => {
				throw new Error('链式调用不应再被用到');
			},
			root,
			loaded
		});
		return () => h('div', { ref: root, class: 'leaf' }, 'leaf');
	}
});

const Harness = defineComponent({
	setup() {
		const { controls, controlRef, controlOf } = useControlRefs<'leaf' | 'plain'>();
		return { controls, controlRef, controlOf };
	},
	render() {
		return h('div', [
			h(Leaf, { ref: this.controlRef('leaf') }),
			h('div', { ref: this.controlRef('plain'), class: 'plain' }, 'plain')
		]);
	}
});

describe('useControlRefs（控件：组件实例而不是裸元素）', () => {
	it('组件 ref 收到的是实例，defineExpose 的方法可直接调用', () => {
		const wrapper = mount(Harness);
		const leaf = wrapper.vm.controls.leaf;
		expect(leaf?.read?.()).toBe('leaf-value');
		expect(leaf?.loadItems?.(['a', 'b'])).toEqual(['a', 'b']);
		wrapper.unmount();
	});

	it('普通 DOM 节点保留元素本身（relate 的 targets / tooltip 需要它）', () => {
		const wrapper = mount(Harness);
		const plain = wrapper.vm.controls.plain;
		expect(plain).toBeInstanceOf(HTMLElement);
		expect((plain as HTMLElement).className).toBe('plain');
		wrapper.unmount();
	});

	it('controlRoot 对实例取根元素，对元素原样返回', () => {
		const wrapper = mount(Harness);
		expect(controlRoot(wrapper.vm.controls.leaf)).toBe(wrapper.vm.controls.leaf?.root);
		expect(controlRoot(wrapper.vm.controls.leaf)?.className).toBe('leaf');
		expect(controlRoot(wrapper.vm.controls.plain)).toBe(wrapper.vm.controls.plain);
		expect(controlRoot(null)).toBeNull();
		expect(controlRoot(undefined)).toBeNull();
		wrapper.unmount();
	});

	it('controlOf 适配 setFormFields 的解析器：未知 id 返回 null', () => {
		const wrapper = mount(Harness);
		expect(wrapper.vm.controlOf('leaf')?.read?.()).toBe('leaf-value');
		expect(wrapper.vm.controlOf('nope')).toBeNull();
		wrapper.unmount();
	});

	it('卸载后清空，避免持有已销毁的实例', () => {
		const wrapper = mount(Harness);
		expect(wrapper.vm.controls.leaf).not.toBeNull();
		wrapper.unmount();
		expect(wrapper.vm.controls.leaf).toBeNull();
		expect(wrapper.vm.controls.plain).toBeNull();
	});
});
