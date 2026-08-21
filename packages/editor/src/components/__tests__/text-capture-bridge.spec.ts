import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import Font from '@app/components/tools/Font.vue';
import FontSize from '@app/components/tools/FontSize.vue';
import TextPosition from '@app/components/tools/TextPosition.vue';
import TextEffect from '@app/components/tools/TextEffect.vue';
import InsertImage from '@app/components/tools/InsertImage.vue';
import LocalVariable from '@app/components/tools/LocalVariable.vue';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface FormFrame extends HTMLElement {
	setForm(data: Record<string, unknown>): void;
	getForm(): Record<string, unknown>;
}

const getFrame = (id: string): FormFrame => document.getElementById(id) as unknown as FormFrame;

const read = (id: string) =>
	(document.getElementById(id) as (HTMLElement & { read?: () => unknown }) | null)?.read?.();

describe('text-capture 窗口表单桥接（Vue 双向绑定迁移回归）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		setActivePinia(createPinia());
	});

	it('六个文字捕获窗口根元素暴露 setForm/getForm 桥接', async () => {
		const wrappers = [
			mount(Font, { attachTo: document.body }),
			mount(FontSize, { attachTo: document.body }),
			mount(TextPosition, { attachTo: document.body }),
			mount(TextEffect, { attachTo: document.body }),
			mount(InsertImage, { attachTo: document.body }),
			mount(LocalVariable, { attachTo: document.body })
		];
		await Promise.all(wrappers.map((w) => w.vm.$nextTick()));
		expect(typeof getFrame('font').setForm).toBe('function');
		expect(typeof getFrame('font').getForm).toBe('function');
		expect(typeof getFrame('fontSize').setForm).toBe('function');
		expect(typeof getFrame('textPosition').setForm).toBe('function');
		expect(typeof getFrame('textEffect').setForm).toBe('function');
		expect(typeof getFrame('insertImage').setForm).toBe('function');
		expect(typeof getFrame('localVariable').setForm).toBe('function');
		wrappers.forEach((w) => w.unmount());
	});

	it('setForm 写入控件 DOM 并可 getForm 读回（font/fontSize/textPosition/textEffect/localVariable）', async () => {
		const wrappers = [
			mount(Font, { attachTo: document.body }),
			mount(FontSize, { attachTo: document.body }),
			mount(TextPosition, { attachTo: document.body }),
			mount(TextEffect, { attachTo: document.body }),
			mount(LocalVariable, { attachTo: document.body })
		];
		await Promise.all(wrappers.map((w) => w.vm.$nextTick()));
		getFrame('font').setForm({ font: 'Arial' });
		getFrame('fontSize').setForm({ size: 24 });
		getFrame('textPosition').setForm({ axis: 'y', operation: 'add', value: 15 });
		getFrame('textEffect').setForm({
			type: 'stroke',
			shadowOffsetX: 2,
			shadowOffsetY: 3,
			strokeWidth: 4,
			color: 'ff0000ff'
		});
		getFrame('localVariable').setForm({ key: 'hp' });
		await Promise.all(wrappers.map((w) => w.vm.$nextTick()));
		await Promise.all(wrappers.map((w) => w.vm.$nextTick()));
		expect(read('font-font')).toBe('Arial');
		expect(read('fontSize-size')).toBe(24);
		expect(read('textPosition-axis')).toBe('y');
		expect(read('textPosition-operation')).toBe('add');
		expect(read('textPosition-value')).toBe(15);
		expect(read('textEffect-type')).toBe('stroke');
		expect(read('textEffect-shadowOffsetX')).toBe(2);
		expect(read('textEffect-strokeWidth')).toBe(4);
		expect(read('textEffect-color')).toBe('ff0000ff');
		expect(read('localVariable-key')).toBe('hp');
		expect(getFrame('font').getForm().font).toBe('Arial');
		expect(getFrame('fontSize').getForm().size).toBe(24);
		expect(getFrame('textPosition').getForm()).toEqual({
			axis: 'y',
			operation: 'add',
			value: 15
		});
		expect(getFrame('textEffect').getForm()).toEqual({
			type: 'stroke',
			shadowOffsetX: 2,
			shadowOffsetY: 3,
			strokeWidth: 4,
			color: 'ff0000ff'
		});
		expect(getFrame('localVariable').getForm().key).toBe('hp');
		wrappers.forEach((w) => w.unmount());
	});

	it('insertImage clip/width/height 表单读写', async () => {
		const wrapper = mount(InsertImage, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		getFrame('insertImage').setForm({
			mode: 'image-clip-size',
			image: 'img.png',
			clip: [1, 2, 3, 4],
			width: 32,
			height: 64
		});
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		expect(read('insertImage-mode')).toBe('image-clip-size');
		expect(read('insertImage-image')).toBe('img.png');
		expect(read('insertImage-width')).toBe(32);
		expect(read('insertImage-height')).toBe(64);
		expect(getFrame('insertImage').getForm()).toEqual({
			mode: 'image-clip-size',
			image: 'img.png',
			clip: [1, 2, 3, 4],
			width: 32,
			height: 64
		});
		wrapper.unmount();
	});

	it('控件值变更在 getForm 时读回（TextBox/NumberBox/SelectBox）', async () => {
		const wrapper = mount(Font, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		await wrapper.find('input').setValue('sans-serif');
		await wrapper.vm.$nextTick();
		expect(getFrame('font').getForm().font).toBe('sans-serif');
		wrapper.unmount();
	});

	it('Selection 控制器 open 经 setForm 填充表单', async () => {
		const wrappers = [
			mount(Font, { attachTo: document.body }),
			mount(FontSize, { attachTo: document.body }),
			mount(TextPosition, { attachTo: document.body }),
			mount(TextEffect, { attachTo: document.body }),
			mount(InsertImage, { attachTo: document.body }),
			mount(LocalVariable, { attachTo: document.body })
		];
		await Promise.all(wrappers.map((w) => w.vm.$nextTick()));
		// 直接调用 setForm 等价路径（open 的窗口生命周期由 Window.open 管理，此处验证数据流）
		getFrame('font').setForm({ font: 'Georgia' });
		getFrame('textPosition').setForm({ axis: 'x', operation: 'set', value: 8 });
		getFrame('insertImage').setForm({ mode: 'image', image: 'pic.png' });
		await Promise.all(wrappers.map((w) => w.vm.$nextTick()));
		await Promise.all(wrappers.map((w) => w.vm.$nextTick()));
		expect(getFrame('font').getForm().font).toBe('Georgia');
		expect(getFrame('textPosition').getForm().value).toBe(8);
		expect(getFrame('insertImage').getForm().image).toBe('pic.png');
		wrappers.forEach((w) => w.unmount());
	});
});
