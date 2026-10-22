import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { initYamiI18n } from '@app/i18n';
import UIAnimationPage from '@app/components/inspector/UIAnimationPage.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const uiAnimation = vi.hoisted(() => ({
	animationIdWrite: vi.fn(),
	target: null as Record<string, unknown> | null,
	update: vi.fn()
}));

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: { uiAnimation }
}));

vi.mock('@app/inspector/element-animation-page.ts', () => ({}));

vi.mock('@app/stores/ui', () => ({
	getUIStore: () => ({ planToSave: vi.fn(), updateTarget: vi.fn() })
}));

vi.mock('@app/composables/useInspectorInput', () => ({
	useInspectorInput: () => ({ bindInput: vi.fn(), syncInput: vi.fn() })
}));

describe('UIAnimationPage 的 write 接线时机', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		uiAnimation.animationIdWrite.mockClear();
	});

	const mountPage = async () => {
		const wrapper = mount(UIAnimationPage, {
			attachTo: document.body,
			global: { plugins: [initYamiI18n()] }
		});
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		return wrapper;
	};

	it('挂载期 CustomBox 的初始化写值不会打到 animationIdWrite（注册表尚未就绪）', async () => {
		await mountPage();
		expect(document.body.querySelector('#uiAnimation-animation')).not.toBeNull();
		expect(uiAnimation.animationIdWrite).not.toHaveBeenCalled();
	});

	it('挂载完成后由 CustomBox 触发的 write 会透传，载荷重新包成 { value }', async () => {
		const wrapper = await mountPage();
		const customBox = wrapper.findComponent(CustomBox);
		expect(customBox.exists()).toBe(true);

		customBox.vm.$emit('write', 'SomeAnimation');
		await wrapper.vm.$nextTick();

		expect(uiAnimation.animationIdWrite).toHaveBeenCalledTimes(1);
		expect(uiAnimation.animationIdWrite).toHaveBeenCalledWith({ value: 'SomeAnimation' });
	});
});
