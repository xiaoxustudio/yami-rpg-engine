import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import StateGetter from '@app/components/tools/StateGetter.vue';
import { useStateGetterWindow } from '@app/composables/useStateGetterWindow';
import { Window } from '@app/tools/window-object.ts';
import { StateGetter as StateGetterController } from '@app/commands/accessors/state-accessor-window.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() })
}));

const getFrame = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;

const makeTarget = (read?: () => unknown) => ({
	dataValue: undefined,
	read,
	input: vi.fn()
});

describe('useStateGetterWindow（状态访问器窗口 composable：form 状态 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 打开窗口、解析 read 数据填充 form', async () => {
		const wrapper = mount(StateGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const stateGetter = useStateGetterWindow();
		const target = makeTarget(() => ({
			type: 'by-id',
			actor: { type: 'trigger' },
			stateId: 'state-1'
		}));
		stateGetter.open(target as never);
		expect(Window.open).toHaveBeenCalledWith('stateGetter');
		expect(stateGetter.form.type).toBe('by-id');
		expect(stateGetter.form.stateId).toBe('state-1');
		wrapper.unmount();
	});

	it('confirm 经 form 读回值回调并关闭窗口', async () => {
		const wrapper = mount(StateGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const stateGetter = useStateGetterWindow();
		const target = makeTarget(() => ({
			type: 'by-id',
			actor: { type: 'trigger' },
			stateId: 'state-1'
		}));
		stateGetter.open(target as never);
		stateGetter.form.type = 'by-id';
		stateGetter.form.actor = { type: 'actor', key: 'a1' } as { type: string; key?: string };
		stateGetter.form.stateId = 'state-2';
		stateGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({
			type: 'by-id',
			actor: { type: 'actor', key: 'a1' },
			stateId: 'state-2'
		});
		expect(Window.close).toHaveBeenCalledWith('stateGetter');
		wrapper.unmount();
	});

	it('confirm 校验失败（by-id 未选状态）聚焦控件且不回调不关闭', async () => {
		const wrapper = mount(StateGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const stateGetter = useStateGetterWindow();
		const target = makeTarget(() => ({
			type: 'by-id',
			actor: { type: 'trigger' },
			stateId: 'state-1'
		}));
		stateGetter.open(target as never);
		stateGetter.form.type = 'by-id';
		stateGetter.form.stateId = '';
		stateGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('plugin 输入在回调前包裹 getter 标识', async () => {
		const wrapper = mount(StateGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const stateGetter = useStateGetterWindow();
		const target = makeTarget(() => ({ type: 'trigger' }));
		(target as { isPluginInput?: boolean }).isPluginInput = true;
		stateGetter.open(target as never);
		stateGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({ getter: 'state', type: 'trigger' });
		expect(Window.close).toHaveBeenCalledWith('stateGetter');
		wrapper.unmount();
	});

	it('closed 事件清除回调，后续 confirm 不再触发', async () => {
		const wrapper = mount(StateGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const stateGetter = useStateGetterWindow();
		const target = makeTarget(() => ({ type: 'trigger' }));
		stateGetter.open(target as never);
		getFrame('stateGetter').dispatchEvent(new CustomEvent('closed'));
		stateGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('legacy StateGetter.open/confirm 转发 composable 并回调 target.input', async () => {
		const wrapper = mount(StateGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const stateGetter = useStateGetterWindow();
		const target = makeTarget(() => ({
			type: 'by-id',
			actor: { type: 'trigger' },
			stateId: 'state-1'
		}));
		StateGetterController.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('stateGetter');
		expect(stateGetter.form.type).toBe('by-id');
		expect(stateGetter.form.stateId).toBe('state-1');
		stateGetter.form.stateId = 'state-2';
		StateGetterController.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({
			type: 'by-id',
			actor: { type: 'trigger' },
			stateId: 'state-2'
		});
		expect(Window.close).toHaveBeenCalledWith('stateGetter');
		wrapper.unmount();
	});
});
