import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { initYamiI18n } from '@app/i18n';
import UIAnimationPage from '@app/components/inspector/UIAnimationPage.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

/**
 * 回归：`UIAnimationPage` 的 `@write` 必须在元素注册表就绪之后才生效。
 *
 * 曾经的 bug（2026-10-22 实测）：把元素优先的 `elAnimation.on('write', …)` 改成模板
 * `@write="onAnimationIdWrite"` 之后，时机变了 ——
 * `CustomBox` 在**自己的** `onMounted` 里会 `write(modelValue)` 一次，而
 * `YMCustomBox.write()` **无条件** `emit('write')`；子组件先挂，模板 `@` 又从首次渲染就生效。
 * 于是这次初始化写值会在父组件 `onMounted` 里
 * `registerElement(inspectorEls, 'uiAnimation-motion', …)` **之前**打到
 * `UIAnimation.animationIdWrite`，那里 `inspectorEls.get('uiAnimation-motion')` 还是
 * `undefined`，抛 `Cannot read properties of undefined (reading 'loadItems')`。
 *
 * 旧的命令式写法把监听挂在父 `onMounted` 里（且在所有 `registerElement` 之后），天然早退，
 * 所以这个坑是"改成模板 `@`"才出现的 —— 这类"挂载期就会 emit"的组件必须加 ready 闸门。
 */
const uiAnimation = vi.hoisted(() => ({
	animationIdWrite: vi.fn(),
	target: null as Record<string, unknown> | null,
	update: vi.fn()
}));

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: { uiAnimation }
}));

// 该模块在导入时会把 `Inspector.uiAnimation` 换成真实实现，那样会覆盖上面的 spy
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
		// CustomBox 确实存在，说明"挂载期写值"这条路径是活的
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
