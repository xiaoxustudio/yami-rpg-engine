import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, withDirectives } from 'vue';
import { mount } from '@vue/test-utils';
import { vTip } from '../tip.ts';

/**
 * R2b 回归：`v-tip` 指令把 i18n 文案挂到元素 tooltip 上（替代本地化器的逐键 DOM 扫描）。
 * 断言三点：① 挂载后调用 setTooltip 且文案含 label 与 tip；② 空串不挂；
 * ③ 绑定值变化时（语言切换）重新挂载。
 */
const setTooltipMock = vi.hoisted(() => vi.fn());
vi.mock('@app/utils/element-utils', () => ({
	setTooltip: setTooltipMock
}));

const Host = defineComponent({
	props: { tip: { type: String, default: '' } },
	setup(props) {
		return () =>
			h('div', [
				h('div', { class: 'text' }, 'My Label'),
				withDirectives(h('input', { id: 'widget' }), [[vTip, props.tip]])
			]);
	}
});

describe('v-tip 指令（R2b）', () => {
	beforeEach(() => {
		setTooltipMock.mockClear();
	});

	it('挂载后按绑定值挂 tooltip，title 取前一个兄弟元素文本', async () => {
		const wrapper = mount(Host, { props: { tip: 'Some tip' } });
		await nextTick();
		await nextTick();

		expect(setTooltipMock).toHaveBeenCalled();
		const [el, text] = setTooltipMock.mock.calls.at(-1) as [HTMLElement, string];
		expect((el as HTMLElement).id).toBe('widget');
		// parseLocalTip(tip, title)：非 $ 前缀 → "<b>title</b>\n tip"
		expect(String(text)).toContain('My Label');
		expect(String(text)).toContain('Some tip');

		wrapper.unmount();
	});

	it('空字符串不挂 tooltip', async () => {
		const wrapper = mount(Host, { props: { tip: '' } });
		await nextTick();
		await nextTick();
		expect(setTooltipMock).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('绑定值变化时（语言切换）重新挂载', async () => {
		const wrapper = mount(Host, { props: { tip: 'First' } });
		await nextTick();
		await nextTick();
		const before = setTooltipMock.mock.calls.length;

		await wrapper.setProps({ tip: 'Second' });
		await nextTick();
		expect(setTooltipMock.mock.calls.length).toBeGreaterThan(before);
		expect(String(setTooltipMock.mock.calls.at(-1)?.[1])).toContain('Second');

		wrapper.unmount();
	});
});
