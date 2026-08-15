import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import Choice from '@app/components/tools/Choice.vue';
import RegionGetter from '@app/components/tools/RegionGetter.vue';
import ExportLanguage from '@app/components/tools/ExportLanguage.vue';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface FormFrame extends HTMLElement {
	setForm(data: Record<string, unknown>): void;
	getForm(): Record<string, unknown>;
}

interface ControlEl extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
}

const getFrame = (id: string): FormFrame => document.getElementById(id) as unknown as FormFrame;

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

describe('P3 低频窗口表单桥接（choice/regionGetter/exportLanguage 回归保护）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('choice 根元素暴露 setForm/getForm，setForm 写入控件 DOM', async () => {
		const wrapper = mount(Choice, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame('choice');
		expect(typeof frame.setForm).toBe('function');
		expect(typeof frame.getForm).toBe('function');
		frame.setForm({ content: 'hello' });
		await wrapper.vm.$nextTick();
		expect(frame.getForm().content).toBe('hello');
		expect(getControl('choice-content').read()).toBe('hello');
		wrapper.unmount();
	});

	it('choice 控件值变更在 getForm 时读回', async () => {
		const wrapper = mount(Choice, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame('choice');
		getControl('choice-content').write('world');
		await wrapper.vm.$nextTick();
		expect(frame.getForm().content).toBe('world');
		wrapper.unmount();
	});

	it('regionGetter 根元素暴露 setForm/getForm，setForm 写入控件 DOM', async () => {
		const wrapper = mount(RegionGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame('regionGetter');
		expect(typeof frame.setForm).toBe('function');
		expect(typeof frame.getForm).toBe('function');
		frame.setForm({ type: 'by-id', presetId: 'r1' });
		await wrapper.vm.$nextTick();
		expect(frame.getForm().type).toBe('by-id');
		expect(frame.getForm().presetId).toBe('r1');
		expect(getControl('regionGetter-type').read()).toBe('by-id');
		wrapper.unmount();
	});

	it('regionGetter 控件值变更在 getForm 时读回', async () => {
		const wrapper = mount(RegionGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame('regionGetter');
		getControl('regionGetter-type').write('trigger');
		getControl('regionGetter-presetId').write('r2');
		await wrapper.vm.$nextTick();
		expect(frame.getForm().type).toBe('trigger');
		expect(frame.getForm().presetId).toBe('r2');
		wrapper.unmount();
	});

	it('exportLanguage 根元素暴露 setForm/getForm，setForm 写入控件 DOM', async () => {
		const wrapper = mount(ExportLanguage, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame('exportLanguage');
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
		const frame = getFrame('exportLanguage');
		getControl('exportLanguage-first').write('zh');
		getControl('exportLanguage-second').write('en');
		await wrapper.vm.$nextTick();
		expect(frame.getForm().first).toBe('zh');
		expect(frame.getForm().second).toBe('en');
		wrapper.unmount();
	});
});
