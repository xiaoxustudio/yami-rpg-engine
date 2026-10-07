import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { radioProxyMap, type RadioProxyElement } from '@ui-kit';
import ColorWindow from '@app/components/tools/Color.vue';
import { Color, colorEls } from '../color-picker-window.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} }),
	getLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

const REGISTERED_IDS = [
	'color',
	'color-hex',
	'color-palette-frame',
	'color-pillar-frame',
	'color-palette-canvas',
	'color-pillar-canvas',
	'color-viewer',
	'color-palette-cursor',
	'color-pillar-cursor'
];

describe('取色窗口注册表', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		colorEls.clear();
	});

	it('Color.vue 登记全部控件元素（元素 id 与注册键一致）', async () => {
		const wrapper = mount(ColorWindow, { attachTo: document.body });
		await nextTick();

		const missing: string[] = [];
		const mismatched: string[] = [];
		for (const id of REGISTERED_IDS) {
			const el = colorEls.get(id);
			if (!(el instanceof HTMLElement)) {
				missing.push(id);
				continue;
			}
			if (el.id !== id) mismatched.push(`${id} → ${el.id}`);
		}
		expect({ missing, mismatched }).toEqual({ missing: [], mismatched: [] });

		wrapper.unmount();
	});

	it('initialize 从注册表校验 color-hex，并把 radioProxy 设为 cancelable', async () => {
		const wrapper = mount(ColorWindow, { attachTo: document.body });
		await nextTick();

		const proxy = radioProxyMap['color-index'] as RadioProxyElement | undefined;
		expect(proxy, 'radioProxyMap 应有 color-index 组').toBeTruthy();
		proxy!.cancelable = false;

		expect(() => Color.initialize!()).not.toThrow();
		expect(proxy!.cancelable).toBe(true);

		wrapper.unmount();
	});

	it('注册表为空时（未挂载）initialize 提前返回且不抛错', () => {
		colorEls.clear();
		expect(() => Color.initialize!()).not.toThrow();
	});

	it('canvas 元素按 HTMLCanvasElement 取值（2d 上下文可用）', async () => {
		const wrapper = mount(ColorWindow, { attachTo: document.body });
		await nextTick();

		const canvas = colorEls.get('color-palette-canvas') as unknown as HTMLCanvasElement;
		expect(canvas).toBeInstanceOf(HTMLCanvasElement);
		expect(canvas.getContext('2d')).toBeTruthy();

		wrapper.unmount();
	});
});
