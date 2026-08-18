import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { initYamiI18n } from '@app/i18n';
import UIButtonPage from '@app/components/inspector/UIButtonPage.vue';
import { Inspector } from '@app/legacy/inspector/inspector.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

vi.mock('@app/i18n', async (importOriginal) => {
	const mod = await importOriginal<typeof import('@app/i18n')>();
	return { ...mod, t: () => 'None', createGetter: () => () => 'None' };
});

describe('UIButtonPage normalImage CustomBox None 显示（真实场景）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('默认（无 target）挂载后 normalImage 显示 None', async () => {
		const wrapper = mount(UIButtonPage, {
			attachTo: document.body,
			global: { plugins: [initYamiI18n()] }
		});
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		const info = document
			.getElementById('uiButton-normalImage')
			?.querySelector('.custom-box-text');
		expect(info?.textContent).toBe('None');
		wrapper.unmount();
	});

	it('sync 后 target 无图片时 normalImage 显示 None', async () => {
		const wrapper = mount(UIButtonPage, {
			attachTo: document.body,
			global: { plugins: [initYamiI18n()] }
		});
		await wrapper.vm.$nextTick();
		Inspector.uiElement = {
			target: {
				normalImage: '',
				display: ''
			}
		} as never;
		(
			document.getElementById('uiButton-vue-mount') as unknown as { sync?: () => void }
		)?.sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		const info = document
			.getElementById('uiButton-normalImage')
			?.querySelector('.custom-box-text');
		expect(info?.textContent).toBe('None');
		wrapper.unmount();
	});
});
