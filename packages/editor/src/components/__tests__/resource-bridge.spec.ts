import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import Resource from '@app/components/tools/Resource.vue';

const resources = vi.hoisted(() => ({
	checkVersionText: '',
	openDirText: ''
}));

vi.mock('@/module/resource', () => ({
	Resources: resources
}));

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

type UpdateEl = HTMLElement & { update?: () => void };

describe('Resource（资源窗口按钮文本响应式渲染桥接）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		resources.checkVersionText = '';
		resources.openDirText = '';
	});

	const mountPage = async () => {
		const wrapper = mount(Resource, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		return wrapper;
	};

	it('onMounted 挂载 update 桥接并渲染默认文本', async () => {
		const wrapper = await mountPage();
		const el = document.getElementById('resource') as UpdateEl;
		expect(el).toBeTruthy();
		expect(typeof el.update).toBe('function');
		expect(document.getElementById('resource-check-version')?.textContent).toBe(
			'check version'
		);
		expect(document.getElementById('resource-open-dir')?.textContent).toBe('open dir');
		wrapper.unmount();
	});

	it('update 桥接响应式渲染 legacy 本地化文本', async () => {
		const wrapper = await mountPage();
		resources.checkVersionText = '检查更新';
		resources.openDirText = '打开目录';
		(document.getElementById('resource') as UpdateEl).update?.();
		await wrapper.vm.$nextTick();
		expect(document.getElementById('resource-check-version')?.textContent).toBe('检查更新');
		expect(document.getElementById('resource-open-dir')?.textContent).toBe('打开目录');
		wrapper.unmount();
	});
});
