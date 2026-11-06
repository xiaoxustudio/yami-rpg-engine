import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { radioProxyMap, type RadioProxyElement } from '@ui-kit';
import ColorWindow from '@app/components/tools/Color.vue';
import { Color } from '../color-picker-window.ts';
import { colorNodes } from '@app/composables/color-nodes';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} }),
	getLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

describe('取色窗口注册表', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('Color.vue 把全部控件元素交出到 colorNodes（键的 id 与元素 id 一致）', async () => {
		const wrapper = mount(ColorWindow, { attachTo: document.body });
		await nextTick();

		const missing: string[] = [];
		const mismatched: string[] = [];
		for (const key of Object.keys(colorNodes.ids) as Array<keyof typeof colorNodes.ids>) {
			const el = colorNodes.get(key);
			const id = colorNodes.ids[key];
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

	it('表为空时（未挂载）initialize 提前返回且不抛错', () => {
		expect(() => Color.initialize!()).not.toThrow();
	});

	it('canvas 元素按 HTMLCanvasElement 交出（2d 上下文可用）', async () => {
		const wrapper = mount(ColorWindow, { attachTo: document.body });
		await nextTick();

		for (const key of ['paletteCanvas', 'pillarCanvas'] as const) {
			const canvas = colorNodes.get(key) as HTMLCanvasElement | null;
			expect(canvas, `${key} 应是 canvas`).toBeInstanceOf(HTMLCanvasElement);
			expect(canvas?.getContext('2d'), `${key} 应有 2d 上下文`).toBeTruthy();
		}

		wrapper.unmount();
	});
});
