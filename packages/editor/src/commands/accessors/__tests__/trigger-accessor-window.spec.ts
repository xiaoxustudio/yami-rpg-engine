import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import TriggerGetterWindow from '@app/components/tools/TriggerGetter.vue';
import { useTriggerGetterWindow } from '@app/composables/useTriggerGetterWindow';
import { TriggerGetter } from '@app/commands/accessors/trigger-accessor-window.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

const makeTarget = (read?: () => unknown) => ({
	dataValue: undefined,
	read,
	input: vi.fn()
});

describe('TriggerGetter（触发器访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(TriggerGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({
			type: 'variable',
			variable: { type: 'local', key: 'v1' }
		}));
		TriggerGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('triggerGetter');
		expect(useTriggerGetterWindow().form.type).toBe('variable');
		expect(useTriggerGetterWindow().form.variable).toEqual({ type: 'local', key: 'v1' });
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(TriggerGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		TriggerGetter.open!(target as never);
		const triggerGetter = useTriggerGetterWindow();
		triggerGetter.form.type = 'variable';
		triggerGetter.form.variable = { type: 'local', key: 'v2' };
		TriggerGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'variable',
			variable: { type: 'local', key: 'v2' }
		});
		expect(Window.close).toHaveBeenCalledWith('triggerGetter');
		wrapper.unmount();
	});
});
