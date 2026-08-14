import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import UIButtonPage from '@app/components/inspector/UIButtonPage.vue';

interface ButtonData {
	display: string;
	normalImage: string;
	normalClip: number[];
	hoverImage: string;
	hoverClip: number[];
	activeImage: string;
	activeClip: number[];
	flip: string;
	border: number;
	imagePadding: number;
	imageOpacity: number;
	imageEffect: string;
	normalTint: number[];
	hoverTint: number[];
	activeTint: number[];
	direction: string;
	horizontalAlign: string;
	verticalAlign: string;
	content: string;
	size: number;
	letterSpacing: number;
	textPadding: number;
	font: string;
	typeface: string;
	textEffect: {
		type: string;
		shadowOffsetX?: number;
		shadowOffsetY?: number;
		strokeWidth?: number;
		color?: string;
	};
	normalColor: string;
	hoverColor: string;
	activeColor: string;
	hoverSound: string;
	clickSound: string;
}

const uiButton = vi.hoisted(() => ({
	target: null as ButtonData | null,
	paramInput: vi.fn()
}));

vi.mock('@/inspector/inspector.ts', () => ({
	Inspector: { uiButton }
}));

vi.mock('@app/stores/ui', () => ({
	useUIStore: () => ({ syncState: vi.fn() })
}));

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

type SyncEl = HTMLElement & { sync?: () => void };

describe('UIButtonPage（uiButton inspector 响应式双向绑定桥接）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		uiButton.target = null;
		uiButton.paramInput.mockClear();
	});

	const mountPage = async () => {
		const host = document.createElement('div');
		host.id = 'uiButton-vue-mount';
		document.body.appendChild(host);
		const wrapper = mount(UIButtonPage, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		return wrapper;
	};

	const makeButton = (overrides: Partial<ButtonData> = {}): ButtonData => ({
		display: 'stretch',
		normalImage: '',
		normalClip: [0, 0, 32, 32],
		hoverImage: '',
		hoverClip: [0, 0, 32, 32],
		activeImage: '',
		activeClip: [0, 0, 32, 32],
		flip: 'none',
		border: 1,
		imagePadding: 0,
		imageOpacity: 1,
		imageEffect: 'none',
		normalTint: [0, 0, 0, 0],
		hoverTint: [0, 0, 0, 0],
		activeTint: [0, 0, 0, 0],
		direction: 'horizontal-tb',
		horizontalAlign: 'center',
		verticalAlign: 'middle',
		content: 'New Button',
		size: 16,
		letterSpacing: 0,
		textPadding: 0,
		font: '',
		typeface: 'regular',
		textEffect: {
			type: 'shadow',
			shadowOffsetX: 2,
			shadowOffsetY: 2,
			strokeWidth: 1,
			color: '000000ff'
		},
		normalColor: 'ffffffff',
		hoverColor: 'ff0000ff',
		activeColor: 'ffffffff',
		hoverSound: '',
		clickSound: '',
		...overrides
	});

	const read = (id: string) =>
		(document.getElementById(id) as (HTMLElement & { read?: () => unknown }) | null)?.read?.();

	it('onMounted 挂载 sync 桥接到 #uiButton-vue-mount 容器', async () => {
		const wrapper = await mountPage();
		const el = document.getElementById('uiButton-vue-mount') as SyncEl;
		expect(typeof el.sync).toBe('function');
		wrapper.unmount();
	});

	it('sync 桥接把 legacy target 渲染到控件（open 后初始化）', async () => {
		const wrapper = await mountPage();
		uiButton.target = makeButton();
		(document.getElementById('uiButton-vue-mount') as SyncEl).sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		expect(read('uiButton-display')).toBe('stretch');
		expect(read('uiButton-flip')).toBe('none');
		expect(read('uiButton-border')).toBe(1);
		expect(read('uiButton-imagePadding')).toBe(0);
		expect(read('uiButton-imageOpacity')).toBe(1);
		expect(read('uiButton-imageEffect')).toBe('none');
		expect(read('uiButton-normalTint-0')).toBe(0);
		expect(read('uiButton-normalTint-3')).toBe(0);
		expect(read('uiButton-direction')).toBe('horizontal-tb');
		expect(read('uiButton-content')).toBe('New Button');
		expect(read('uiButton-size')).toBe(16);
		expect(read('uiButton-letterSpacing')).toBe(0);
		expect(read('uiButton-textPadding')).toBe(0);
		expect(read('uiButton-font')).toBe('');
		expect(read('uiButton-typeface')).toBe('regular');
		expect(read('uiButton-textEffect-type')).toBe('shadow');
		expect(read('uiButton-textEffect-shadowOffsetX')).toBe(2);
		expect(read('uiButton-textEffect-shadowOffsetY')).toBe(2);
		expect(read('uiButton-textEffect-strokeWidth')).toBe(1);
		expect(read('uiButton-textEffect-color')).toBe('000000ff');
		expect(read('uiButton-normalColor')).toBe('ffffffff');
		expect(read('uiButton-hoverColor')).toBe('ff0000ff');
		expect(read('uiButton-activeColor')).toBe('ffffffff');
		expect(read('uiButton-hoverSound')).toBe('');
		expect(read('uiButton-clickSound')).toBe('');
		wrapper.unmount();
	});

	it('切换 target 后再次 sync 更新控件显示（含 tint 数组与 textEffect 默认值）', async () => {
		const wrapper = await mountPage();
		const el = document.getElementById('uiButton-vue-mount') as SyncEl;
		uiButton.target = makeButton();
		el.sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		uiButton.target = makeButton({
			display: 'clip',
			normalTint: [-50, 60, 0, 255],
			content: 'Button 2',
			textEffect: { type: 'none' }
		});
		el.sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		expect(read('uiButton-display')).toBe('clip');
		expect(read('uiButton-normalTint-0')).toBe(-50);
		expect(read('uiButton-normalTint-1')).toBe(60);
		expect(read('uiButton-normalTint-3')).toBe(255);
		expect(read('uiButton-content')).toBe('Button 2');
		expect(read('uiButton-textEffect-type')).toBe('none');
		expect(read('uiButton-textEffect-shadowOffsetX')).toBe(1);
		expect(read('uiButton-textEffect-color')).toBe('000000ff');
		wrapper.unmount();
	});

	it('控件 input 转发 paramInput 并保持 form 与 target 同步', async () => {
		const wrapper = await mountPage();
		const el = document.getElementById('uiButton-vue-mount') as SyncEl;
		uiButton.target = makeButton();
		el.sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		uiButton.paramInput.mockImplementation(() => {
			if (uiButton.target) {
				uiButton.target.size = 24;
			}
		});
		const input = document.getElementById('uiButton-size')?.querySelector('input');
		expect(input).toBeTruthy();
		input!.value = '24';
		input!.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiButton.paramInput).toHaveBeenCalled();
		await wrapper.vm.$nextTick();
		expect(read('uiButton-size')).toBe(24);
		wrapper.unmount();
	});
});
