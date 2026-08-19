import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import Zoom from '@app/components/tools/Zoom.vue';
import { useZoomWindow } from '@app/composables/useZoomWindow';
import { Window } from '@app/legacy/tools/window-object.ts';
import { Editor } from '@app/services/project/editor.ts';
import { webFrame } from 'electron';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

vi.mock('electron', () => ({
	ipcRenderer: {},
	shell: {},
	webFrame: { getZoomFactor: vi.fn(() => 1.25), setZoomFactor: vi.fn() }
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

describe('useZoomWindow（缩放窗口 composable：form 状态 + getFactor/open/confirm）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
		Editor.config = { zoom: 1 };
		vi.mocked(webFrame.getZoomFactor).mockClear();
		vi.mocked(webFrame.setZoomFactor).mockClear();
	});

	it('getFactor 读取 webFrame 缩放因子', () => {
		expect(useZoomWindow().getFactor()).toBe(1.25);
	});

	it('open 打开窗口、以当前因子填充 form 与控件 DOM', async () => {
		const wrapper = mount(Zoom, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const zoom = useZoomWindow();
		zoom.open();
		expect(Window.open).toHaveBeenCalledWith('zoom');
		expect(zoom.form.factor).toBe(1.25);
		expect(getFrame('zoom').getForm().factor).toBe(1.25);
		expect(getControl('zoom-factor').read()).toBe(1.25);
		wrapper.unmount();
	});

	it('confirm 保存因子到配置并应用 webFrame 缩放后关闭窗口', async () => {
		const wrapper = mount(Zoom, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const zoom = useZoomWindow();
		zoom.open();
		getControl('zoom-factor').write(1.75);
		zoom.confirm();
		expect(Editor.config!.zoom).toBe(1.75);
		expect(webFrame.setZoomFactor).toHaveBeenCalledWith(1.75);
		expect(Window.close).toHaveBeenCalledWith('zoom');
		wrapper.unmount();
	});

	it('confirm 无表单值时沿用当前配置因子', async () => {
		const wrapper = mount(Zoom, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const zoom = useZoomWindow();
		getFrame('zoom').getForm = () => ({ factor: undefined });
		zoom.confirm();
		expect(Editor.config!.zoom).toBe(1);
		expect(webFrame.setZoomFactor).toHaveBeenCalledWith(1);
		wrapper.unmount();
	});

	it('legacy 入口 Zoom.open/confirm 转发 composable', async () => {
		const { Zoom: ZoomController } = await import('@app/legacy/tools/zoom-window.ts');
		const wrapper = mount(Zoom, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		ZoomController.open();
		expect(Window.open).toHaveBeenCalledWith('zoom');
		expect(getFrame('zoom').getForm().factor).toBe(1.25);
		getControl('zoom-factor').write(1.5);
		ZoomController.confirm();
		expect(Editor.config!.zoom).toBe(1.5);
		expect(webFrame.setZoomFactor).toHaveBeenCalledWith(1.5);
		expect(Window.close).toHaveBeenCalledWith('zoom');
		wrapper.unmount();
	});
});
