import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import RegisterEvent from '@app/components/commands/RegisterEvent.vue';
import Transition from '@app/components/commands/Transition.vue';
import WebSocketSend from '@app/components/commands/WebSocketSend.vue';
import { composableEls } from '@app/composables/element-registry';
import { useTransitionCommandSchema } from '@app/composables/commands/useTransitionCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { EventEditor } from '@app/commands/event-editor.ts';
import { Data } from '@app/data/data-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn(), components: {} }),
	getLocalStore: () => ({ syncState: vi.fn(), components: {} })
}));

type LoadableEl = HTMLElement & { loadItems?: (items: unknown[]) => void };

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

	it('命令 SFC 的局部注册表镜像进 composableEls（注册键 ↔ 元素 id 一致）', async () => {
		const wrapper = await mountAndSettle(RegisterEvent);

		for (const id of [
			'registerEvent-type',
			'registerEvent-tag',
			'registerEvent-priority',
			'registerEvent-namespace',
			'registerEvent-target',
			'registerEvent-operation'
		]) {
			const el = composableEls.get(id);
			expect(el, `${id} 未镜像`).toBeTruthy();
			expect(el?.id).toBe(id);
			expect(el).toBe(document.getElementById(id));
		}

		wrapper.unmount();
	});

	it('Transition：open 经注册表把缓动选项写进控件（链路有效，不是静默 no-op）', async () => {
		const wrapper = await mountAndSettle(Transition);

		const el = composableEls.get('transition-easingId') as unknown as LoadableEl;
		expect(el?.id).toBe('transition-easingId');
		const loadItems = vi.fn();
		el.loadItems = loadItems;
		Data.createEasingItems = vi.fn(() => [{ name: 'Linear', value: 'linear' }]) as never;

		useTransitionCommandSchema().open();
		expect(loadItems).toHaveBeenCalledTimes(1);
		expect(loadItems.mock.calls[0][0]).toEqual([{ name: 'Linear', value: 'linear' }]);

		wrapper.unmount();
	});

	it('RegisterEvent：targetWrite 经注册表刷新 type 控件（模块侧真的调到了控件）', async () => {
		const wrapper = await mountAndSettle(RegisterEvent);

		const typeEl = composableEls.get('registerEvent-type') as unknown as LoadableEl;
		expect(typeEl?.id).toBe('registerEvent-type');
		const loadItems = vi.fn();
		typeEl.loadItems = loadItems;
		Enum.getMergedItems = vi.fn(() => [
			{ name: 'Key Down', value: 'keydown' },
			{ name: 'Key Up', value: 'keyup' }
		]) as never;
		EventEditor.types = { all: [{ name: 'Autorun', value: 'autorun' }] } as never;

		Command.cases.registerEvent.targetWrite!({ value: 'global' });

		expect(loadItems).toHaveBeenCalled();
		const lastItems = loadItems.mock.calls[loadItems.mock.calls.length - 1][0] as unknown[];
		expect(lastItems.length).toBeGreaterThan(0);

		wrapper.unmount();
	});

	it('WebSocketSend：无局部注册表的 SFC 也会登记（本批补的 fieldEls）', async () => {
		const wrapper = await mountAndSettle(WebSocketSend);

		expect(composableEls.get('webSocketSend-id')?.id).toBe('webSocketSend-id');
		expect(composableEls.get('webSocketSend-data')?.id).toBe('webSocketSend-data');

		wrapper.unmount();
	});

	it('注册表为空时模块侧安全 no-op（不再有按 id 的隐式回退）', () => {
		for (const id of ['transition-easingId', 'getActor-attribute', 'webSocketSend-id']) {
			composableEls.set(id, null);
		}
		expect(() => useTransitionCommandSchema().open()).not.toThrow();
		expect(() => useTransitionCommandSchema().windowClosed(new Event('closed'))).not.toThrow();
	});
});
