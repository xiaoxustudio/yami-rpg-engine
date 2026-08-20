import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useFileScriptPage } from '@app/composables/useFileScriptPage';

const fileScript = vi.hoisted(() => ({
	info: null as { name: string; size: string } | null
}));

vi.mock('@app/legacy/inspector/inspector.ts', () => ({
	Inspector: {
		fileScript
	}
}));

const Host = defineComponent({
	setup() {
		return useFileScriptPage();
	},
	render: () => null
});

describe('useFileScriptPage（fileScript inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		fileScript.info = null;
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useFileScriptPage>
		};
	};

	it('sync 从 Inspector.fileScript.info 读取文件信息', () => {
		const { wrapper, page } = mountPage();
		fileScript.info = { name: 'plugin.js', size: '3.4 KB' };
		page.sync();
		expect(page.form.name).toBe('plugin.js');
		expect(page.form.size).toBe('3.4 KB');
		wrapper.unmount();
	});

	it('sync 在 info 为空时保持表单不变', () => {
		const { wrapper, page } = mountPage();
		page.sync();
		expect(page.form.name).toBe('');
		expect(page.form.size).toBe('');
		wrapper.unmount();
	});
});
