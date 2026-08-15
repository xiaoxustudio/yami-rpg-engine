import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useFileFontPage } from '@app/composables/useFileFontPage';

const fileFont = vi.hoisted(() => ({
	textInput: vi.fn()
}));

vi.mock('@/inspector/inspector.ts', () => ({
	Inspector: {
		fileFont
	}
}));

const Host = defineComponent({
	setup() {
		return useFileFontPage();
	},
	render: () => null
});

describe('useFileFontPage（fileFont inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		fileFont.textInput.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useFileFontPage>
		};
	};

	it('onTextInput 桥接 Inspector.fileFont.textInput', () => {
		const { wrapper, page } = mountPage();
		const el = document.createElement('input');
		el.value = 'Hello';
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onTextInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileFont.textInput).toHaveBeenCalledWith({ target: el });
		wrapper.unmount();
	});
});
