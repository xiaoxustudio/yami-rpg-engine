import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import PageManager from '../common/PageManager.vue';

/**
 * `common/PageManager.vue` 的事件桥回归。
 *
 * 背景：该组件原先在 `onMounted` 里对 `root.value` 做
 * `addEventListener('switch', (e) => emit('switch', e.last, e.value))`。改为模板
 * `@switch="onSwitch"` 后，依赖的是**内层 `YMPageManager` 的 Vue emit**
 * （它自己把元素上的原生 `switch` 用 `@switch` 收成 `emit('switch', last, value)`）。
 *
 * 这条链子有两跳，任一跳写错都会让「页面切换」静默失效，而
 * `PageManager` 被 `InspectorPanel` / `LayoutPanel` / `WorkspacePages` 等核心布局使用
 * ——所以这里用「派发原生事件 → 内层 emit → 外层 emit」的整链断言把它钉住。
 */
describe('common/PageManager 事件桥', () => {
	it('内层元素的原生 switch 事件最终转发成外层 switch（两个参数不丢）', () => {
		const wrapper = mount(PageManager, { props: { id: 'pm' } });

		// `wrapper.element` 就是内层 YMPageManager 的根 div（单根组件链）。
		const event = new Event('switch');
		Object.assign(event, { last: { key: 'a' }, value: { key: 'b' } });
		wrapper.element.dispatchEvent(event);

		expect(wrapper.emitted('switch')).toEqual([[{ key: 'a' }, { key: 'b' }]]);
	});
});
