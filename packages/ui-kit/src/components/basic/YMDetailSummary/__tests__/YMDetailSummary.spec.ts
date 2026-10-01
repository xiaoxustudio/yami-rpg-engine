import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMDetailBox from '../../YMDetailBox/YMDetailBox.vue';
import YMDetailSummary from '../YMDetailSummary.vue';

const pointerdown = (el: Element) =>
	el.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));

const slotsWithSummary = () =>
	({
		default: {
			template: '<YMDetailSummary>Title</YMDetailSummary><div class="content">Body</div>',
			components: { YMDetailSummary }
		}
	}) as unknown as NonNullable<Parameters<typeof mount>[1]>['slots'];

describe('YMDetailSummary', () => {
	it('toggles parent detail box on click', async () => {
		const wrapper = mount(YMDetailBox, {
			props: { open: true },
			slots: slotsWithSummary()
		});
		expect(wrapper.find('.content').classes()).not.toContain('hidden');
		pointerdown(wrapper.find('.detail-summary').element);
		await wrapper.vm.$nextTick();
		expect(wrapper.attributes('open')).toBeUndefined();
		expect(wrapper.find('.content').classes()).toContain('hidden');
	});

	it('toggles via Enter key', async () => {
		const wrapper = mount(YMDetailBox, {
			props: { open: false },
			slots: slotsWithSummary()
		});
		await wrapper.find('.detail-summary').trigger('keydown', { code: 'Enter' });
		await wrapper.vm.$nextTick();
		expect(wrapper.attributes('open')).toBeDefined();
	});

	it('折叠标题可聚焦并暴露 aria-expanded', async () => {
		// `trigger()` 直接派发事件、绕开「能不能真的拿到焦点」，所以必须显式断言 tabindex：
		// 修复前根 div 没有 tabindex，上面那个 Enter 测试能过，但真实键盘用户按不到它。
		const wrapper = mount(YMDetailBox, {
			props: { open: false },
			slots: slotsWithSummary()
		});
		const summary = wrapper.find('.detail-summary');
		expect(summary.attributes('tabindex')).toBe('0');
		expect(summary.attributes('role')).toBe('button');
		expect(summary.attributes('aria-expanded')).toBe('false');
		await wrapper.setProps({ open: true });
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.detail-summary').attributes('aria-expanded')).toBe('true');
	});

	it('toggles via Space key and blocks the default scroll', async () => {
		const wrapper = mount(YMDetailBox, {
			props: { open: false },
			slots: slotsWithSummary()
		});
		const event = new KeyboardEvent('keydown', {
			code: 'Space',
			bubbles: true,
			cancelable: true
		});
		wrapper.find('.detail-summary').element.dispatchEvent(event);
		await wrapper.vm.$nextTick();
		expect(wrapper.attributes('open')).toBeDefined();
		expect(event.defaultPrevented).toBe(true);
	});

	it('falls back to DOM lookup when injected context is missing', async () => {
		let toggled = false;
		const host = document.createElement('div');
		host.className = 'detail-box';
		(host as HTMLElement & { toggle?: () => void }).toggle = () => {
			toggled = true;
		};
		document.body.appendChild(host);
		const wrapper = mount(YMDetailSummary, { attachTo: host });
		pointerdown(wrapper.element);
		await wrapper.vm.$nextTick();
		expect(toggled).toBe(true);
		host.remove();
	});

	it('renders slot content', () => {
		const wrapper = mount(YMDetailSummary, { slots: { default: 'Title' } });
		expect(wrapper.text()).toBe('Title');
	});
});
