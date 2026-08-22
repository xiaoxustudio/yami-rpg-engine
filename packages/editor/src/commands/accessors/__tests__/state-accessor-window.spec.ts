import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import StateGetterWindow from '@app/components/tools/StateGetter.vue';
import { useStateGetterWindow } from '@app/composables/useStateGetterWindow';
import { StateGetter } from '@app/commands/accessors/state-accessor-window.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

const makeTarget = (read?: () => unknown) => ({
	dataValue: undefined,
	read,
	input: vi.fn()
});

describe('StateGetter（状态访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(StateGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'by-id', stateId: 'st1' }));
		StateGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('stateGetter');
		expect(useStateGetterWindow().form.type).toBe('by-id');
		expect(useStateGetterWindow().form.stateId).toBe('st1');
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(StateGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'trigger' }));
		StateGetter.open!(target as never);
		const stateGetter = useStateGetterWindow();
		stateGetter.form.type = 'by-id';
		stateGetter.form.stateId = 'st2';
		StateGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'by-id',
			actor: { type: 'trigger' },
			stateId: 'st2'
		});
		expect(Window.close).toHaveBeenCalledWith('stateGetter');
		wrapper.unmount();
	});

	it('checkDataForPlugin 匹配 getter=state', () => {
		expect(StateGetter.checkDataForPlugin!({ getter: 'state' })).toBe(true);
		expect(StateGetter.checkDataForPlugin!({ getter: 'skill' })).toBe(false);
	});

	it('createDefaultForPlugin 返回默认结构', () => {
		expect(StateGetter.createDefaultForPlugin!()).toEqual({ getter: 'state', type: 'trigger' });
	});
});
