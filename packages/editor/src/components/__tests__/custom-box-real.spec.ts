import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import { Local } from '@/tools/localization.ts';

describe('editor CustomBox 空值显示 None（真实链路）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.spyOn(Local as unknown as { get: (key: string) => string }, 'get').mockReturnValue(
			'None'
		);
	});

	it('type=file 空串 modelValue → None', async () => {
		const wrapper = mount(CustomBox, {
			props: { id: 'cb-file-empty', type: 'file', modelValue: '' },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		const info = document.getElementById('cb-file-empty')?.querySelector('.custom-box-text');
		expect(info?.textContent).toBe('None');
		wrapper.unmount();
	});

	it('type=file null modelValue → None', async () => {
		const wrapper = mount(CustomBox, {
			props: { id: 'cb-file-null', type: 'file', modelValue: null },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		const info = document.getElementById('cb-file-null')?.querySelector('.custom-box-text');
		expect(info?.textContent).toBe('None');
		wrapper.unmount();
	});

	it('type=file 有值 → 正常显示', async () => {
		const wrapper = mount(CustomBox, {
			props: { id: 'cb-file-val', type: 'dialog-dir', modelValue: 'Assets/dir' },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		const info = document.getElementById('cb-file-val')?.querySelector('.custom-box-text');
		expect(info?.textContent).toBe('Assets/dir');
		wrapper.unmount();
	});
});
