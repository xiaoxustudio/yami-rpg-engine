import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import Zoom from '@app/components/tools/Zoom.vue';
import { useZoomWindow } from '@app/composables/useZoomWindow';
import { Window } from '@app/tools/window-object.ts';
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

	it('open 打开窗口、以当前因子填充 form 并通过 v-model 填充控件', async () => {
		const wrapper = mount(Zoom, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const zoom = useZoomWindow();
		zoom.open();
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('zoom');
		expect(zoom.form.factor).toBe(1.25);
		wrapper.unmount();
	});

	it('confirm 保存因子到配置并应用 webFrame 缩放后关闭窗口', async () => {
		const wrapper = mount(Zoom, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const zoom = useZoomWindow();
		zoom.open();
		zoom.form.factor = 1.75;
		await wrapper.vm.$nextTick();
		zoom.confirm();
		expect(Editor.config!.zoom).toBe(1.75);
		expect(webFrame.setZoomFactor).toHaveBeenCalledWith(1.75);
		expect(Window.close).toHaveBeenCalledWith('zoom');
		wrapper.unmount();
	});

	it('legacy 入口 Zoom.open/confirm 转发 composable', async () => {
		const { Zoom: ZoomController } = await import('@app/composables/useZoomWindow');
		const wrapper = mount(Zoom, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const zoom = useZoomWindow();
		ZoomController.open();
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('zoom');
		expect(zoom.form.factor).toBe(1.25);
		zoom.form.factor = 1.5;
		await wrapper.vm.$nextTick();
		ZoomController.confirm();
		expect(Editor.config!.zoom).toBe(1.5);
		expect(webFrame.setZoomFactor).toHaveBeenCalledWith(1.5);
		expect(Window.close).toHaveBeenCalledWith('zoom');
		wrapper.unmount();
	});
});
