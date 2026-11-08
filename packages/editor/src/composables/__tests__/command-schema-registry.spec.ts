import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import RegisterEvent from '@app/components/commands/RegisterEvent.vue';
import Transition from '@app/components/commands/Transition.vue';
import WebSocketSend from '@app/components/commands/WebSocketSend.vue';
import { composableEls } from '@app/composables/element-registry';
import { useTransitionCommandSchema } from '@app/composables/commands/useTransitionCommandSchema';
import { getTransitionBridge } from '@app/composables/transition-bridge';
import { getWebSocketSendBridge } from '@app/composables/web-socket-send-bridge';
import { Command } from '@app/commands/command-object.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { EventEditor } from '@app/commands/event-editor.ts';
import { Data } from '@app/data/data-object.ts';
import { dataItemsOf } from '@app/__tests__/element-data-read';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} }),
	getLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

const mountAndSettle = async (component: Parameters<typeof mount>[0]) => {
	const wrapper = mount(component, { attachTo: document.body });
	await wrapper.vm.$nextTick();
	await wrapper.vm.$nextTick();
	return wrapper;
};

describe('命令表单 composable 注册表', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		document.body.innerHTML = '';
	});

	it('RegisterEvent：控件不再进注册表，目标/操作写盘走窗口自己的控件表', async () => {
		const wrapper = await mountAndSettle(RegisterEvent);

		// 迁移后控件只走模板 ref：注册表里没有它们，但 DOM 里当然还在
		for (const id of [
			'registerEvent-type',
			'registerEvent-tag',
			'registerEvent-priority',
			'registerEvent-namespace',
			'registerEvent-target',
			'registerEvent-operation'
		]) {
			expect(composableEls.get(id), `${id} 不该再进注册表`).toBeFalsy();
			expect(document.getElementById(id), `${id} 模板里应存在`).toBeTruthy();
		}

		wrapper.unmount();
	});

	it('Transition：open 经**模块桥**把缓动选项交给窗口（链路有效，不是静默 no-op）', async () => {
		const wrapper = await mountAndSettle(Transition);

		const bridge = getTransitionBridge();
		expect(bridge, '窗口挂载后应登记桥').toBeTruthy();
		const loadItems = vi.spyOn(bridge!, 'loadItems');
		Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'linear' }]) as never;

		useTransitionCommandSchema().open();
		expect(loadItems).toHaveBeenCalledTimes(1);
		expect(loadItems.mock.calls[0][0]).toEqual([{ name: 'Linear', value: 'linear' }]);

		wrapper.unmount();
		expect(getTransitionBridge(), '卸载后桥应注销').toBeNull();
	});

	it('RegisterEvent：targetWrite 经控件表刷新 type 控件的候选项（模块侧真的调到了控件）', async () => {
		const wrapper = await mountAndSettle(RegisterEvent);

		Enum.getMergedItems = vi.fn(() => [
			{ name: 'Key Down', value: 'keydown' },
			{ name: 'Key Up', value: 'keyup' }
		]) as never;
		EventEditor.types = { all: [{ name: 'Autorun', value: 'autorun' }] } as never;

		Command.cases.registerEvent.targetWrite!({ value: 'global' });

		// 结果落在控件的 DOM 数据上（`select-box-api` 把下拉项写进元素数据）
		const items = dataItemsOf(document.getElementById('registerEvent-type'));
		expect(items?.length).toBeGreaterThan(0);

		wrapper.unmount();
	});

	it('WebSocketSend：控件不再进注册表，改成挂载时登记控件桥', async () => {
		const wrapper = await mountAndSettle(WebSocketSend);

		// 迁移后控件只走模板 ref：注册表里没有它们，能力经模块桥交出
		expect(composableEls.get('webSocketSend-id')).toBeFalsy();
		expect(composableEls.get('webSocketSend-data')).toBeFalsy();
		const bridge = getWebSocketSendBridge();
		expect(bridge, '窗口挂载后应登记桥').toBeTruthy();
		expect(typeof bridge?.getId).toBe('function');

		wrapper.unmount();
		expect(getWebSocketSendBridge(), '卸载后桥应注销').toBeNull();
	});

	it('注册表为空时模块侧安全 no-op（不再有按 id 的隐式回退）', () => {
		for (const id of ['transition-easingId', 'getActor-attribute', 'webSocketSend-id']) {
			composableEls.set(id, null);
		}
		expect(() => useTransitionCommandSchema().open()).not.toThrow();
		expect(() => useTransitionCommandSchema().windowClosed(new Event('closed'))).not.toThrow();
	});
});
