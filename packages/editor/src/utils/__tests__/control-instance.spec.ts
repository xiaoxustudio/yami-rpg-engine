import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import CheckBox from '@app/components/common/CheckBox.vue';
import { read, write } from '@app/utils/element-utils';
import { controlApiOfElement } from '@app/utils/control-instance';

describe('元素 → 控件实例的 shim 回退', () => {
	it('read(el) / write(el) 在元素没有方法时走组件实例', async () => {
		const wrapper = mount(CheckBox, {
			props: { id: 'shim-check', modelValue: false },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = document.getElementById('shim-check')!;
		// 先确认元素上确实没有 read/write（能力只在实例上）
		expect(typeof (el as unknown as { read?: unknown }).read).toBe('undefined');
		expect(controlApiOfElement(el)).toBeTruthy();
		write(el, true);
		expect(read(el)).toBe(true);
		write(el, false);
		expect(read(el)).toBe(false);
		wrapper.unmount();
	});

	it('非控件元素返回 null，shim 仍回退元素数据', () => {
		const el = document.createElement('div');
		expect(controlApiOfElement(el)).toBeNull();
		expect(() => read(el)).not.toThrow();
	});
});
