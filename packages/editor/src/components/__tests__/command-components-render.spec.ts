import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ChangeActorSkill from '@app/components/commands/ChangeActorSkill.vue';
import HttpRequest from '@app/components/commands/HttpRequest.vue';
import RequestURL from '@app/components/commands/RequestURL.vue';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

describe('命令组件控件 DOM 完整性（initAll 依赖回归）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('ChangeActorSkill 渲染 actor/operation/skill 控件', async () => {
		const wrapper = mount(ChangeActorSkill, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		expect(document.getElementById('changeActorSkill-actor')).toBeTruthy();
		expect(document.getElementById('changeActorSkill-operation')).toBeTruthy();
		expect(document.getElementById('changeActorSkill-skill')).toBeTruthy();
		wrapper.unmount();
	});

	it('HttpRequest 渲染 method/url/responseType 控件', async () => {
		const wrapper = mount(HttpRequest, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		expect(document.getElementById('httpRequest-method')).toBeTruthy();
		expect(document.getElementById('httpRequest-url')).toBeTruthy();
		expect(document.getElementById('httpRequest-responseType')).toBeTruthy();
		wrapper.unmount();
	});

	it('RequestURL 渲染 url/method 控件', async () => {
		const wrapper = mount(RequestURL, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		expect(document.getElementById('requestURL-url')).toBeTruthy();
		expect(document.getElementById('requestURL-method')).toBeTruthy();
		wrapper.unmount();
	});
});
