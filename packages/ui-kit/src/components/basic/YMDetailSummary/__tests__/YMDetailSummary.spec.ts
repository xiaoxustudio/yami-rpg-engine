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
	}) as any;

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

	it('falls back to DOM lookup when injected context is missing', async () => {
		let toggled = false;
		const host = document.createElement('div');
		host.className = 'detail-box';
		(host as any).toggle = () => {
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
