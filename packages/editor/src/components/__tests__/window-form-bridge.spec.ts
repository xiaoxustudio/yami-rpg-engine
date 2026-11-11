import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import Choice from '@app/components/tools/Choice.vue';
import RegionGetter from '@app/components/tools/RegionGetter.vue';
import ExportLanguage from '@app/components/tools/ExportLanguage.vue';
import { useChoicesSchema } from '@app/composables/useChoicesSchema';
import { useRegionGetterWindow } from '@app/composables/useRegionGetterWindow';
import { getExportLanguageBridge } from '@app/composables/export-language-bridge';
import { controlApi } from '@app/__tests__/control-api';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() }),
	getLocalStore: () => ({ syncState: vi.fn() })
}));

interface ControlEl extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
}

const getControl = (id: string): ControlEl => controlApi(id) as unknown as ControlEl;

describe('低频窗口表单桥接（choice/regionGetter/exportLanguage 回归保护）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('choice 经共享 form 填充与读回', async () => {
		const wrapper = mount(Choice, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useChoicesSchema();
		form.content = 'hello';
		await wrapper.vm.$nextTick();
		expect(form.content).toBe('hello');
		wrapper.unmount();
	});

	it('choice 控件变更通过 v-model 更新 form', async () => {
		const wrapper = mount(Choice, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useChoicesSchema();
		form.content = 'world';
		await wrapper.vm.$nextTick();
		expect(form.content).toBe('world');
		wrapper.unmount();
	});

	it('regionGetter 经共享 form 填充与读回', async () => {
		const wrapper = mount(RegionGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const region = useRegionGetterWindow();
		region.form.type = 'by-id';
		region.form.presetId = 'r1';
		await wrapper.vm.$nextTick();
		expect(region.form.type).toBe('by-id');
		expect(region.form.presetId).toBe('r1');
		wrapper.unmount();
	});

	it('regionGetter 控件变更通过 v-model 更新 form', async () => {
		const wrapper = mount(RegionGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const region = useRegionGetterWindow();
		region.form.type = 'trigger';
		region.form.presetId = 'r2';
		await wrapper.vm.$nextTick();
		expect(region.form.type).toBe('trigger');
		expect(region.form.presetId).toBe('r2');
		wrapper.unmount();
	});

	it('exportLanguage 模块桥登记 setForm/getForm，setForm 写入控件 DOM', async () => {
		const wrapper = mount(ExportLanguage, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getExportLanguageBridge();
		if (!frame) throw new Error('exportLanguage 桥未登记');
		expect(typeof frame.setForm).toBe('function');
		expect(typeof frame.getForm).toBe('function');
		frame.setForm({ first: 'en', second: '' });
		await wrapper.vm.$nextTick();
		expect(frame.getForm().first).toBe('en');
		expect(frame.getForm().second).toBe('');
		expect(getControl('exportLanguage-first').read()).toBe('en');
		wrapper.unmount();
	});

	it('exportLanguage 控件值变更在 getForm 时读回', async () => {
		const wrapper = mount(ExportLanguage, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getExportLanguageBridge();
		if (!frame) throw new Error('exportLanguage 桥未登记');
		getControl('exportLanguage-first').write('zh');
		getControl('exportLanguage-second').write('en');
		await wrapper.vm.$nextTick();
		expect(frame.getForm().first).toBe('zh');
		expect(frame.getForm().second).toBe('en');
		wrapper.unmount();
	});
});
