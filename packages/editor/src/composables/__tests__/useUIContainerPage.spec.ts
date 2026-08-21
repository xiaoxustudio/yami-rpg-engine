import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useUIContainerPage } from '@app/composables/useUIContainerPage';

const uiContainer = vi.hoisted(() => ({
	target: null as Record<string, unknown> | null
}));

const uiElement = vi.hoisted(() => ({
	target: null as Record<string, unknown> | null,
	update: vi.fn()
}));

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		uiContainer,
		uiElement,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	setup() {
		return useUIContainerPage();
	},
	render: () => null
});

describe('useUIContainerPage（uiContainer inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		uiContainer.target = null;
		uiElement.target = null;
		uiElement.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useUIContainerPage>
		};
	};

	it('sync 在 target 存在与 null 时均安全', () => {
		const { wrapper, page } = mountPage();
		uiContainer.target = { pointerEvents: 'enabled' };
		page.sync();
		uiContainer.target = null;
		page.sync();
		wrapper.unmount();
	});

	it('onParamInput 找不到 uiContainer 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		uiContainer.target = {};
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiElement.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 解析到 uiContainer 控件时委托 uiElement.update', () => {
		const { wrapper, page } = mountPage();
		uiElement.update.mockImplementation(
			(target: Record<string, unknown>, key: string, value: unknown) => {
				target[key] = value;
			}
		);
		uiContainer.target = {};
		uiElement.target = {};
		const el = document.createElement('div') as HTMLElement & { read: () => string };
		el.id = 'uiContainer-pointerEvents';
		el.read = () => 'disabled';
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiElement.update).toHaveBeenCalledWith(
			uiElement.target,
			'pointerEvents',
			'disabled'
		);
		wrapper.unmount();
	});
});
