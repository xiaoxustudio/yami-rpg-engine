import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import UIButtonPage from '@app/components/inspector/UIButtonPage.vue';
import { Local } from '@/tools/localization.ts';
import { Inspector } from '@/inspector/inspector.ts';

describe('UIButtonPage normalImage CustomBox None 显示（真实场景）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.spyOn(Local, 'get').mockReturnValue('None');
	});

	it('默认（无 target）挂载后 normalImage 显示 None', async () => {
		const wrapper = mount(UIButtonPage, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		const info = document.getElementById('uiButton-normalImage')?.querySelector('.custom-box-text');
		expect(info?.textContent).toBe('None');
		wrapper.unmount();
	});

	it('sync 后 target 无图片时 normalImage 显示 None', async () => {
		const wrapper = mount(UIButtonPage, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Inspector.uiElement = {
			target: ({
	normalImage: '',
	display: ''
})
		} as never;
		(document.getElementById('uiButton-vue-mount') as unknown as { sync?: () => void })?.sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		const info = document.getElementById('uiButton-normalImage')?.querySelector('.custom-box-text');
		expect(info?.textContent).toBe('None');
		wrapper.unmount();
	});
});
