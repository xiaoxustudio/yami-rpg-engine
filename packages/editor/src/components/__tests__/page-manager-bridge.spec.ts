import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import PageManager from '../common/PageManager.vue';

describe('common/PageManager 事件桥', () => {
	it('内层元素的原生 switch 事件最终转发成外层 switch（两个参数不丢）', () => {
		const wrapper = mount(PageManager, { props: { id: 'pm' } });

		const event = new Event('switch');
		Object.assign(event, { last: { key: 'a' }, value: { key: 'b' } });
		wrapper.element.dispatchEvent(event);

		expect(wrapper.emitted('switch')).toEqual([[{ key: 'a' }, { key: 'b' }]]);
	});
});
