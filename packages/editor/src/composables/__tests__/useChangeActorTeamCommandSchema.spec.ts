import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ChangeActorTeam from '@app/components/commands/ChangeActorTeam.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Data } from '@app/data/data-object.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface ControlEl extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
	input(value: unknown): void;
}

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

describe('useChangeActorTeamCommandSchema（changeActorTeam 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Data.teams = { list: [{ id: 'team0', name: 'Team 0' }] } as never;
		Data.createTeamItems = vi.fn(() => [{ name: 'Team 0', value: 'team0' }]) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(ChangeActorTeam, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'changeActorTeam');
		expect(Window.open).toHaveBeenCalledWith('changeActorTeam');
		expect(getControl('changeActorTeam-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('changeActorTeam-teamId').read()).toBe('team0');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(ChangeActorTeam, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'changeActorTeam',
			params: { actor: { type: 'trigger' }, teamId: 'team1' }
		});
		expect(Window.open).toHaveBeenCalledWith('changeActorTeam');
		expect(getControl('changeActorTeam-teamId').read()).toBe('team1');
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.changeActorTeam.save 保存', async () => {
		const wrapper = mount(ChangeActorTeam, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.changeActorTeam.customLoad!({
			actor: { type: 'trigger' },
			teamId: 'team0'
		});
		getControl('changeActorTeam-teamId').input('team2');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.changeActorTeam.save!();
		expect(saved).toHaveBeenCalledWith({ actor: { type: 'trigger' }, teamId: 'team2' });
		wrapper.unmount();
	});
});
