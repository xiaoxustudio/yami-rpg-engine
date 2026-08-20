import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useFileFontPage } from '@app/composables/useFileFontPage';

const fileFont = vi.hoisted(() => ({
	info: null as { name: string; size: string } | null
}));

vi.mock('@app/legacy/inspector/inspector.ts', () => ({
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
		fileFont.info = null;
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useFileFontPage>
		};
	};

	it('sync 从 Inspector.fileFont.info 读取文件信息', () => {
		const { wrapper, page } = mountPage();
		fileFont.info = { name: 'font.ttf', size: '1.2 KB' };
		page.sync();
		expect(page.form.name).toBe('font.ttf');
		expect(page.form.size).toBe('1.2 KB');
		wrapper.unmount();
	});

	it('sync 在 info 为空时保持表单不变', () => {
		const { wrapper, page } = mountPage();
		page.sync();
		expect(page.form.name).toBe('');
		expect(page.form.size).toBe('');
		wrapper.unmount();
	});

	it('预览文本默认为 Yami RPG Editor', () => {
		const { wrapper, page } = mountPage();
		expect(page.form.text).toBe('Yami RPG Editor');
		wrapper.unmount();
	});
});
