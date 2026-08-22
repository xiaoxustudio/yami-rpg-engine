import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ActorGetterWindow from '@app/components/tools/ActorGetter.vue';
import { useActorGetterWindow } from '@app/composables/useActorGetterWindow';
import { ActorGetter } from '@app/commands/accessors/actor-accessor-window.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

const makeTarget = (read?: () => unknown) => ({
	dataValue: undefined,
	read,
	input: vi.fn()
});

describe('ActorGetter（角色访问器窗口转发契约）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 转发 composable 并解析 read 数据填充 form', async () => {
		const wrapper = mount(ActorGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'member', memberId: 3 }));
		ActorGetter.open!(target as never);
		expect(Window.open).toHaveBeenCalledWith('actorGetter');
		expect(useActorGetterWindow().form.type).toBe('member');
		expect(useActorGetterWindow().form.memberId).toBe(3);
		wrapper.unmount();
	});

	it('confirm 转发 composable 并经 form 回调 target.input', async () => {
		const wrapper = mount(ActorGetterWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const target = makeTarget(() => ({ type: 'by-id', presetId: 'preset-1' }));
		ActorGetter.open!(target as never);
		const actorGetter = useActorGetterWindow();
		actorGetter.form.type = 'by-id';
		actorGetter.form.presetId = 'preset-9';
		ActorGetter.confirm!({} as Event);
		expect(target.input).toHaveBeenCalledWith({ type: 'by-id', presetId: 'preset-9' });
		expect(Window.close).toHaveBeenCalledWith('actorGetter');
		wrapper.unmount();
	});

	it('checkDataForPlugin 匹配 getter=actor', () => {
		expect(ActorGetter.checkDataForPlugin!({ getter: 'actor' })).toBe(true);
		expect(ActorGetter.checkDataForPlugin!({ getter: 'skill' })).toBe(false);
		expect(ActorGetter.checkDataForPlugin!(null)).toBe(false);
	});

	it('createDefaultForPlugin 返回默认结构', () => {
		expect(ActorGetter.createDefaultForPlugin!()).toEqual({ getter: 'actor', type: 'trigger' });
	});
});
