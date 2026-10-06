import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() }),
	getLocalStore: () => ({ syncState: vi.fn() })
}));

beforeEach(() => {
	setActivePinia(createPinia());
});
import WebSocketConnect from '@app/components/commands/WebSocketConnect.vue';
import WebSocketSend from '@app/components/commands/WebSocketSend.vue';
import WebSocketClose from '@app/components/commands/WebSocketClose.vue';

describe('webSocket 命令组件 DOM 完整性', () => {
	it('WebSocketConnect 渲染 url/id/protocols 控件', async () => {
		const wrapper = mount(WebSocketConnect, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		expect(document.getElementById('webSocketConnect-url')).toBeTruthy();
		expect(document.getElementById('webSocketConnect-id')).toBeTruthy();
		expect(document.getElementById('webSocketConnect-protocols')).toBeTruthy();
		wrapper.unmount();
	});
	it('WebSocketSend 渲染 id/data 控件', async () => {
		const wrapper = mount(WebSocketSend, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		expect(document.getElementById('webSocketSend-id')).toBeTruthy();
		expect(document.getElementById('webSocketSend-data')).toBeTruthy();
		wrapper.unmount();
	});
	it('WebSocketClose 渲染 id/code/reason 控件', async () => {
		const wrapper = mount(WebSocketClose, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		expect(document.getElementById('webSocketClose-id')).toBeTruthy();
		expect(document.getElementById('webSocketClose-code')).toBeTruthy();
		expect(document.getElementById('webSocketClose-reason')).toBeTruthy();
		wrapper.unmount();
	});
});
