import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetTeamRelation from '@app/components/commands/SetTeamRelation.vue';
import { useSetTeamRelationCommandSchema } from '@app/composables/commands/useSetTeamRelationCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Data } from '@app/data/data-object.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

const words: string[] = [];
const setWords = (): void => {
	words.length = 0;
	Command.words = {
		push: (value: string) => {
			words.push(value);
			return Command.words;
		},
		join: (separator?: string) => words.join(separator ?? '')
	} as never;
};

describe('useSetTeamRelationCommandSchema（setTeamRelation 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Data.teams = { list: [{ id: 'team0' }, { id: 'team1' }] } as never;
		Data.createTeamItems = vi.fn(() => [
			{ name: 'Team 0', value: 'team0' },
			{ name: 'Team 1', value: 'team1' }
		]) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(SetTeamRelation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTeamRelationCommandSchema();
		CommandSchema.insert(target, 'setTeamRelation');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setTeamRelation');
		expect(form.teamId1).toBe('team0');
		expect(form.teamId2).toBe('team0');
		expect(form.relation).toBe(0);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(SetTeamRelation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTeamRelationCommandSchema();
		CommandSchema.edit(target, {
			id: 'setTeamRelation',
			params: { teamId1: 'team0', teamId2: 'team1', relation: 1 }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setTeamRelation');
		expect(form.teamId1).toBe('team0');
		expect(form.teamId2).toBe('team1');
		expect(form.relation).toBe(1);
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.setTeamRelation.save 保存', async () => {
		const wrapper = mount(SetTeamRelation, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useSetTeamRelationCommandSchema();
		Command.cases.setTeamRelation.customLoad!({
			teamId1: 'team0',
			teamId2: 'team0',
			relation: 0
		});
		form.teamId2 = 'team1';
		form.relation = 1;
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setTeamRelation.save!();
		expect(saved).toHaveBeenCalledWith({ teamId1: 'team0', teamId2: 'team1', relation: 1 });
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染双方队伍 + 关系文本', () => {
		setWords();
		Command.parseTeam = vi.fn((t: string) => `T:${t}`) as never;
		const contents = Command.cases.setTeamRelation.parse!({
			teamId1: 'team0',
			teamId2: 'team1',
			relation: 0
		});
		const text = (contents[2] as { text: string }).text;
		expect(text).toContain('T:team0');
		expect(text).toContain('T:team1');
		expect(text).toContain('relation.0');
	});
});
