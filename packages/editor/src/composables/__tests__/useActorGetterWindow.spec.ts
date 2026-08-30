import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ActorGetter from '@app/components/tools/ActorGetter.vue';
import { useActorGetterWindow } from '@app/composables/useActorGetterWindow';
import { Window } from '@app/tools/window-object.ts';
import { ActorGetter as ActorGetterController } from '@app/commands/accessors/actor-accessor-window.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() })
}));

const getFrame = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;

const makeTarget = (read?: () => unknown) => ({
	dataValue: undefined,
	read,
	input: vi.fn()
});

describe('useActorGetterWindow（角色访问器窗口 composable：form 状态 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 打开窗口、解析 read 数据填充 form', async () => {
		const wrapper = mount(ActorGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const actorGetter = useActorGetterWindow();
		const target = makeTarget(() => ({ type: 'member', memberId: 3 }));
		actorGetter.open(target as never);
		expect(Window.open).toHaveBeenCalledWith('actorGetter');
		expect(actorGetter.form.type).toBe('member');
		expect(actorGetter.form.memberId).toBe(3);
		wrapper.unmount();
	});

	it('confirm 经 form 读回值回调并关闭窗口（by-id 含 presetId）', async () => {
		const wrapper = mount(ActorGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const actorGetter = useActorGetterWindow();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'preset-1' }));
		actorGetter.open(target as never);
		actorGetter.form.type = 'by-id';
		actorGetter.form.presetId = 'preset-9';
		actorGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({ type: 'by-id', presetId: 'preset-9' });
		expect(Window.close).toHaveBeenCalledWith('actorGetter');
		wrapper.unmount();
	});

	it('confirm 校验失败（global actorId 为空）聚焦控件且不回调不关闭', async () => {
		const wrapper = mount(ActorGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const actorGetter = useActorGetterWindow();
		const target = makeTarget(() => ({ type: 'global', actorId: 'actor-1' }));
		actorGetter.open(target as never);
		actorGetter.form.type = 'global';
		actorGetter.form.actorId = '';
		actorGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('confirm 校验失败（variable 未选）聚焦控件且不回调不关闭', async () => {
		const wrapper = mount(ActorGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const actorGetter = useActorGetterWindow();
		const target = makeTarget(() => ({
			type: 'variable',
			variable: { type: 'local', key: 'v1' }
		}));
		actorGetter.open(target as never);
		actorGetter.form.type = 'variable';
		actorGetter.form.variable = { type: 'local', key: '' };
		actorGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('plugin 输入在回调前包裹 getter 标识', async () => {
		const wrapper = mount(ActorGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const actorGetter = useActorGetterWindow();
		const target = makeTarget(() => ({ type: 'trigger' }));
		(target as { isPluginInput?: boolean }).isPluginInput = true;
		actorGetter.open(target as never);
		actorGetter.confirm();
		expect(target.input).toHaveBeenCalledWith({ getter: 'actor', type: 'trigger' });
		expect(Window.close).toHaveBeenCalledWith('actorGetter');
		wrapper.unmount();
	});

	it('closed 事件清除回调，后续 confirm 不再触发', async () => {
		const wrapper = mount(ActorGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const actorGetter = useActorGetterWindow();
		const target = makeTarget(() => ({ type: 'trigger' }));
		actorGetter.open(target as never);
		getFrame('actorGetter').dispatchEvent(new CustomEvent('closed'));
		actorGetter.confirm();
		expect(target.input).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('legacy ActorGetter.open/confirm 转发 composable 并回调 target.input', async () => {
		const wrapper = mount(ActorGetter, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const actorGetter = useActorGetterWindow();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'preset-1' }));
		ActorGetterController.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('actorGetter');
		expect(actorGetter.form.type).toBe('by-id');
		expect(actorGetter.form.presetId).toBe('preset-1');
		actorGetter.form.presetId = 'preset-2';
		ActorGetterController.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({ type: 'by-id', presetId: 'preset-2' });
		expect(Window.close).toHaveBeenCalledWith('actorGetter');
		wrapper.unmount();
	});
});
