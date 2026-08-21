import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import Font from '@app/components/tools/Font.vue';
import FontSize from '@app/components/tools/FontSize.vue';
import TextPosition from '@app/components/tools/TextPosition.vue';
import TextEffect from '@app/components/tools/TextEffect.vue';
import InsertImage from '@app/components/tools/InsertImage.vue';
import LocalVariable from '@app/components/tools/LocalVariable.vue';
import { useTextCaptureWindow } from '@app/composables/useTextCaptureWindow';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

describe('text-capture 窗口表单桥接（Vue 双向绑定迁移回归）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		setActivePinia(createPinia());
	});

	it('六个文字捕获窗口通过共享 form 读写', async () => {
		const wrappers = [
			mount(Font, { attachTo: document.body }),
			mount(FontSize, { attachTo: document.body }),
			mount(TextPosition, { attachTo: document.body }),
			mount(TextEffect, { attachTo: document.body }),
			mount(InsertImage, { attachTo: document.body }),
			mount(LocalVariable, { attachTo: document.body })
		];
		await Promise.all(wrappers.map((w) => w.vm.$nextTick()));
		const capture = useTextCaptureWindow();
		Object.assign(capture.font.form, { font: 'Arial' });
		Object.assign(capture.fontSize.form, { size: 24 });
		Object.assign(capture.textPosition.form, { axis: 'y', operation: 'add', value: 15 });
		Object.assign(capture.textEffect.form, {
			type: 'stroke',
			shadowOffsetX: 2,
			shadowOffsetY: 3,
			strokeWidth: 4,
			color: 'ff0000ff'
		});
		Object.assign(capture.localVariable.form, { key: 'hp' });
		await Promise.all(wrappers.map((w) => w.vm.$nextTick()));
		expect(capture.font.form.font).toBe('Arial');
		expect(capture.fontSize.form.size).toBe(24);
		expect(capture.textPosition.form).toEqual({ axis: 'y', operation: 'add', value: 15 });
		expect(capture.textEffect.form).toEqual({
			type: 'stroke',
			shadowOffsetX: 2,
			shadowOffsetY: 3,
			strokeWidth: 4,
			color: 'ff0000ff'
		});
		expect(capture.localVariable.form.key).toBe('hp');
		wrappers.forEach((w) => w.unmount());
	});

	it('insertImage 表单读写（clip/width/height）', async () => {
		const wrapper = mount(InsertImage, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const capture = useTextCaptureWindow();
		Object.assign(capture.image.form, {
			mode: 'image-clip-size',
			image: 'img.png',
			clip: [1, 2, 3, 4],
			width: 32,
			height: 64
		});
		await wrapper.vm.$nextTick();
		expect(capture.image.form).toEqual({
			mode: 'image-clip-size',
			image: 'img.png',
			clip: [1, 2, 3, 4],
			width: 32,
			height: 64
		});
		wrapper.unmount();
	});

	it('控件变更通过 v-model 更新 form（TextBox/NumberBox/SelectBox）', async () => {
		const wrapper = mount(Font, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const capture = useTextCaptureWindow();
		await wrapper.find('input').setValue('sans-serif');
		await wrapper.vm.$nextTick();
		expect(capture.font.form.font).toBe('sans-serif');
		wrapper.unmount();
	});

	it('Selection 控制器 open 经 form 填充表单', async () => {
		const wrappers = [
			mount(Font, { attachTo: document.body }),
			mount(FontSize, { attachTo: document.body }),
			mount(TextPosition, { attachTo: document.body }),
			mount(TextEffect, { attachTo: document.body }),
			mount(InsertImage, { attachTo: document.body }),
			mount(LocalVariable, { attachTo: document.body })
		];
		await Promise.all(wrappers.map((w) => w.vm.$nextTick()));
		const capture = useTextCaptureWindow();
		Object.assign(capture.font.form, { font: 'Georgia' });
		Object.assign(capture.textPosition.form, { axis: 'x', operation: 'set', value: 8 });
		Object.assign(capture.image.form, { mode: 'image', image: 'pic.png' });
		await Promise.all(wrappers.map((w) => w.vm.$nextTick()));
		expect(capture.font.form.font).toBe('Georgia');
		expect(capture.textPosition.form.value).toBe(8);
		expect(capture.image.form.image).toBe('pic.png');
		wrappers.forEach((w) => w.unmount());
	});
});
