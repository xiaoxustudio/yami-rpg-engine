import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ImageClip from '@app/components/tools/ImageClip.vue';
import { useImageClipWindow } from '@app/composables/useImageClipWindow';
import { Window } from '@app/legacy/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface FormFrame extends HTMLElement {
	setForm(data: Record<string, unknown>): void;
	getForm(): Record<string, unknown>;
}

interface ControlEl extends HTMLElement {
	write(value: unknown): void;
	read(): unknown;
}

const getFrame = (id: string): FormFrame => document.getElementById(id) as unknown as FormFrame;

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

describe('useImageClipWindow（裁剪窗口 composable：form 状态 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 打开窗口、填充 form 与控件 DOM 并写入回调', async () => {
		const wrapper = mount(ImageClip, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const imageClip = useImageClipWindow();
		const callback = vi.fn();
		imageClip.open({ x: 10, y: 20, width: 64, height: 32 }, callback);
		expect(Window.open).toHaveBeenCalledWith('imageClip');
		expect(imageClip.form.x).toBe(10);
		expect(imageClip.form.height).toBe(32);
		expect(getFrame('imageClip').getForm()).toEqual({ x: 10, y: 20, width: 64, height: 32 });
		expect(getControl('imageClip-x').read()).toBe(10);
		expect(getControl('imageClip-width').read()).toBe(64);
		wrapper.unmount();
	});

	it('confirm 经 getForm 读回控件以数组回调并关闭窗口', async () => {
		const wrapper = mount(ImageClip, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const imageClip = useImageClipWindow();
		const callback = vi.fn();
		imageClip.open({ x: 0, y: 0, width: 64, height: 64 }, callback);
		getControl('imageClip-x').write(5);
		getControl('imageClip-y').write(6);
		getControl('imageClip-width').write(16);
		getControl('imageClip-height').write(8);
		imageClip.confirm();
		expect(callback).toHaveBeenCalledWith([5, 6, 16, 8]);
		expect(Window.close).toHaveBeenCalledWith('imageClip');
		wrapper.unmount();
	});

	it('closed 事件清除回调，后续 confirm 不再触发', async () => {
		const wrapper = mount(ImageClip, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const imageClip = useImageClipWindow();
		const callback = vi.fn();
		imageClip.open({ x: 0, y: 0, width: 64, height: 64 }, callback);
		getFrame('imageClip').dispatchEvent(new CustomEvent('closed'));
		imageClip.confirm();
		expect(callback).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
