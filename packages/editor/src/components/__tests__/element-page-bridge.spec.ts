import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import UIImagePage from '@app/components/inspector/UIImagePage.vue';

interface ElementData {
	name: string;
	pointerEvents?: string;
	transform: Partial<Record<string, number>>;
	events: unknown[];
	scripts: unknown[];
}

const uiElement = vi.hoisted(() => ({
	target: null as ElementData | null,
	paramInput: vi.fn()
}));

vi.mock('@/inspector/inspector.ts', () => ({
	Inspector: { uiElement }
}));

vi.mock('@app/stores/ui', () => ({
	useUIStore: () => ({ syncState: vi.fn() })
}));

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

type SyncEl = HTMLElement & { sync?: () => void };

describe('UIImagePage（uiElement inspector 响应式双向绑定桥接）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		uiElement.target = null;
		uiElement.paramInput.mockClear();
	});

	const mountPage = async () => {
		const host = document.createElement('div');
		host.id = 'uiImage-vue-mount';
		document.body.appendChild(host);
		const wrapper = mount(UIImagePage, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		return wrapper;
	};

	const makeElement = (overrides: Partial<ElementData> = {}): ElementData => ({
		name: 'Image 1',
		pointerEvents: 'enabled',
		transform: {
			anchorX: 0.5,
			anchorY: 0.5,
			x: 10,
			x2: 0,
			y: 20,
			y2: 0,
			width: 100,
			width2: 0,
			height: 50,
			height2: 0,
			rotation: 45,
			scaleX: 1,
			scaleY: 1,
			skewX: 0,
			skewY: 0,
			opacity: 1
		},
		events: [],
		scripts: [],
		...overrides
	});

	const read = (id: string) =>
		(document.getElementById(id) as (HTMLElement & { read?: () => unknown }) | null)?.read?.();

	it('onMounted 挂载 sync 桥接到 #uiImage-vue-mount 容器', async () => {
		const wrapper = await mountPage();
		const el = document.getElementById('uiImage-vue-mount') as SyncEl;
		expect(typeof el.sync).toBe('function');
		wrapper.unmount();
	});

	it('sync 桥接把 legacy target 渲染到控件（open 后初始化）', async () => {
		const wrapper = await mountPage();
		uiElement.target = makeElement();
		(document.getElementById('uiImage-vue-mount') as SyncEl).sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		expect(read('uiElement-name')).toBe('Image 1');
		expect(read('uiElement-pointerEvents')).toBe('enabled');
		expect(read('uiElement-transform-anchorX')).toBe(0.5);
		expect(read('uiElement-transform-anchorY')).toBe(0.5);
		expect(read('uiElement-transform-x')).toBe(10);
		expect(read('uiElement-transform-y')).toBe(20);
		expect(read('uiElement-transform-width')).toBe(100);
		expect(read('uiElement-transform-height')).toBe(50);
		expect(read('uiElement-transform-rotation')).toBe(45);
		expect(read('uiElement-transform-opacity')).toBe(1);
		wrapper.unmount();
	});

	it('切换 target 后再次 sync 更新控件显示', async () => {
		const wrapper = await mountPage();
		const el = document.getElementById('uiImage-vue-mount') as SyncEl;
		uiElement.target = makeElement();
		el.sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		uiElement.target = makeElement({ name: 'Image 2', transform: { x: 99, rotation: 0 } });
		el.sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		expect(read('uiElement-name')).toBe('Image 2');
		expect(read('uiElement-transform-x')).toBe(99);
		expect(read('uiElement-transform-rotation')).toBe(0);
		wrapper.unmount();
	});

	it('控件 input 转发 paramInput 并保持 form 与 target 同步', async () => {
		const wrapper = await mountPage();
		const el = document.getElementById('uiImage-vue-mount') as SyncEl;
		uiElement.target = makeElement();
		el.sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		uiElement.paramInput.mockImplementation(() => {
			if (uiElement.target) {
				uiElement.target.name = 'Image 3';
			}
		});
		const input = document.getElementById('uiElement-name')?.querySelector('input');
		expect(input).toBeTruthy();
		input!.value = 'Image 3';
		input!.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiElement.paramInput).toHaveBeenCalled();
		await wrapper.vm.$nextTick();
		expect(read('uiElement-name')).toBe('Image 3');
		wrapper.unmount();
	});
});
