import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import SetButtonProperty from '@app/components/tools/SetButtonProperty.vue';
import { ButtonProperty } from '../set-button-property-window';
import { Window } from '@app/tools/window-object';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

describe('属性窗口懒挂载初始化（ensureSetup）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('挂载即补齐 key 下拉选项，open 后按 key 只显示对应字段组', async () => {
		const wrapper = mount(SetButtonProperty, { attachTo: document.body });
		await wrapper.vm.$nextTick();

		// 关键回归点：属性窗口是懒挂载的，ParamList.bind 时的 initialize 早退后，
		// 组件 onMounted 的 ensureSetup 必须补齐 key 选项与字段显隐联动
		const keyEl = document.getElementById('setButton-property-key') as unknown as {
			dataItems?: Array<{ value: string }>;
		};
		expect(keyEl.dataItems?.length).toBeGreaterThan(0);

		ButtonProperty.open!({ key: 'normalClip', value: [1, 2, 3, 4] });
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();

		const clipBox = document.getElementById('setButton-property-clip-box') as HTMLElement;
		const image = document.getElementById('setButton-property-image') as HTMLElement;
		const tintBox = document.getElementById('setButton-property-tint-box') as HTMLElement;
		// 当前 key=normalClip：只显示裁剪组，图片/染色组应被隐藏模式收起
		expect(clipBox.style.display).not.toBe('none');
		expect(image.style.display).toBe('none');
		expect(tintBox.style.display).toBe('none');

		wrapper.unmount();
	});
});
