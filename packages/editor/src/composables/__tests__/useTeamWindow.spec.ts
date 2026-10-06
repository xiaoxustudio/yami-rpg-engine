import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import Team from '@app/components/tools/Team.vue';
import { useTeamWindow } from '@app/composables/useTeamWindow';
import { getTeamStore } from '@app/stores/team';
import { Window } from '@app/tools/window-object.ts';
import { Codec } from '@app/engine/codec/codec.ts';
import { File } from '@app/file/file-system-core.ts';
import { Data } from '@app/data/data-object.ts';
import { Menu } from '@app/components/menu-list.ts';
import { elementDataOf } from '@ui-kit';
import type { TeamData } from '@app/composables/useTeamWindow';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() }),
	getLocalStore: () => ({ syncState: vi.fn() })
}));

vi.mock('@app/engine/webgl/webgl-init.ts', () => ({
	GL: {
		arrays: [{ uint8: new Uint8Array(4096) }, { uint8: new Uint8Array(4096) }]
	}
}));

vi.mock('@app/file/file-system-core.ts', () => ({
	File: { planToSave: vi.fn() }
}));

vi.mock('@app/i18n', () => ({
	getYamiI18n: () => ({ global: { t: () => '' } })
}));

vi.mock('@app/tools/color-picker-window.ts', () => ({
	Color: { open: vi.fn() }
}));

vi.mock('@app/components/menu-list.ts', () => ({
	Menu: { popup: vi.fn() }
}));

vi.mock('@app/utils/clipboard', () => ({
	GlobalClipboard: {
		has: () => false,
		read: () => undefined,
		write: vi.fn()
	}
}));

vi.mock('@app/data/data-object.ts', () => ({
	Data: {
		teams: { list: [], relations: '', collisions: '', map: {}, selection: '' },
		manifest: { project: { teams: 'Data/teams.json' } },
		createTeamMap: vi.fn()
	}
}));

type TeamListElement = HTMLElement & {
	read(): TeamData | null;
	select(item: TeamData): void;
};

const makeTeamsData = () => ({
	list: [
		{ id: 't1', name: 'Team A', color: 'ff0000ff' },
		{ id: 't2', name: 'Team B', color: '00ff00ff' }
	],
	relations: Codec.encodeTeamData!(new Uint8Array([1, 0, 1])),
	collisions: Codec.encodeTeamData!(new Uint8Array([1, 1, 1])),
	map: {},
	selection: ''
});

const mountAndInit = async (): Promise<{
	wrapper: ReturnType<typeof mount>;
	team: ReturnType<typeof useTeamWindow>;
}> => {
	const wrapper = mount(Team, { attachTo: document.body });
	await wrapper.vm.$nextTick();
	const team = useTeamWindow();
	team.initialize();
	return { wrapper, team };
};

describe('useTeamWindow（队伍窗口 composable：数据加载 + 列表编辑 + 保存）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
		Window.confirm = vi.fn();
		vi.mocked(Data).teams = {
			list: [],
			relations: '',
			collisions: '',
			map: {},
			selection: ''
		};
		vi.mocked(File.planToSave!).mockClear();
		vi.mocked(Data.createTeamMap).mockClear();
		vi.mocked(Menu.popup).mockClear();
	});

	it('open 解码队伍数据、填充 store 并打开窗口', async () => {
		const { wrapper, team } = await mountAndInit();
		vi.mocked(Data).teams = makeTeamsData() as unknown as typeof Data.teams;
		team.open();
		expect(Window.open).toHaveBeenCalledWith('team');
		const store = getTeamStore();
		expect(store.state).toBe('open');
		expect(store.teams).toBe(vi.mocked(Data).teams.map);
		expect(store.data).toHaveLength(2);
		expect(store.data?.[0].relations).toEqual({ t1: 1, t2: 0 });
		expect(store.data?.[0].collisions).toEqual({ t1: 1, t2: 1 });
		expect(store.data?.[1].relations).toEqual({ t1: 0, t2: 1 });
		wrapper.unmount();
	});

	it('confirm 打包变更数据、计划保存并关闭窗口', async () => {
		const { wrapper, team } = await mountAndInit();
		vi.mocked(Data).teams = makeTeamsData() as unknown as typeof Data.teams;
		team.open();
		const store = getTeamStore();
		store.data![0].relations.t2 = 1;
		team.listChange();
		expect(team.changed).toBe(true);
		const onDataChange = vi.fn();
		window.addEventListener('datachange', onDataChange);
		team.confirm();
		expect(team.changed).toBe(false);
		expect(File.planToSave).toHaveBeenCalledWith('Data/teams.json');
		expect(onDataChange).toHaveBeenCalled();
		expect(Data.createTeamMap).toHaveBeenCalled();
		expect(Window.close).toHaveBeenCalledWith('team');
		expect(vi.mocked(Data).teams.list).toHaveLength(2);
		const decoded = Codec.decodeTeamData!(vi.mocked(Data).teams.relations, 2);
		expect(Array.from(decoded)).toEqual([1, 1, 1]);
		wrapper.unmount();
	});

	it('confirm 无变更时仅关闭窗口', async () => {
		const { wrapper, team } = await mountAndInit();
		vi.mocked(Data).teams = makeTeamsData() as unknown as typeof Data.teams;
		team.open();
		team.confirm();
		expect(File.planToSave).not.toHaveBeenCalled();
		expect(Window.close).toHaveBeenCalledWith('team');
		wrapper.unmount();
	});

	it('windowClose 有未保存变更时阻止关闭并弹确认', async () => {
		const { wrapper, team } = await mountAndInit();
		vi.mocked(Data).teams = makeTeamsData() as unknown as typeof Data.teams;
		team.open();
		team.listChange();
		const event = new Event('close', { cancelable: true });
		team.windowClose(event);
		expect(event.defaultPrevented).toBe(true);
		expect(Window.confirm).toHaveBeenCalled();
		const items = (Window.confirm as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1];
		items[0].click();
		expect(Window.close).toHaveBeenCalledWith('team');
		wrapper.unmount();
	});

	it('windowClosed 清空 store 状态与列表', async () => {
		const { wrapper, team } = await mountAndInit();
		vi.mocked(Data).teams = makeTeamsData() as unknown as typeof Data.teams;
		team.open();
		team.windowClosed(new Event('closed'));
		const store = getTeamStore();
		expect(store.state).toBe('closed');
		expect(store.teams).toBe(null);
		expect(store.data).toBe(null);
		wrapper.unmount();
	});

	it('createId/createData 生成唯一 id 并初始化关系矩阵', async () => {
		const { wrapper, team } = await mountAndInit();
		vi.mocked(Data).teams = makeTeamsData() as unknown as typeof Data.teams;
		team.open();
		const id = team.createId();
		expect(id).toBeTruthy();
		expect(team.getItemById('t1')?.name).toBe('Team A');
		expect(team.getItemById('missing')).toBeNull();
		const data = team.createData();
		expect(data.name).toBe('');
		expect(data.color).toBe('000000ff');
		expect(data.relations.t1).toBe(1);
		expect(data.relations.t2).toBe(1);
		expect(data.relations[data.id]).toBe(1);
		expect(data.collisions.t1).toBe(1);
		expect(data.collisions.t2).toBe(1);
		expect(data.collisions[data.id]).toBe(1);
		wrapper.unmount();
	});

	it('pointerdown 点击关系标记双向翻转并标记变更', async () => {
		const { wrapper, team } = await mountAndInit();
		vi.mocked(Data).teams = makeTeamsData() as unknown as typeof Data.teams;
		team.open();
		const store = getTeamStore();
		const teamA = store.data![0];
		const teamB = store.data![1];
		const listEl = document.getElementById('team-list') as unknown as TeamListElement;
		vi.spyOn(listEl, 'read').mockReturnValue(teamA);
		const nodeItem = document.createElement('div');
		nodeItem.classList.add('node-item');
		// 行 item 存**元素数据**（`nodeItem.item` 这个 expando 已退役）
		elementDataOf<{ item?: TeamData }>(nodeItem).item = teamB;
		const mark = document.createElement('div');
		mark.className = 'team-relation-mark';
		nodeItem.appendChild(mark);
		document.body.appendChild(nodeItem);
		const event = { button: 0, target: mark } as unknown as PointerEvent;
		team.listPointerdown.call(listEl, event);
		expect(teamA.relations.t2).toBe(1);
		expect(teamB.relations.t1).toBe(1);
		expect(team.changed).toBe(true);
		nodeItem.remove();
		wrapper.unmount();
	});

	it('listPopup 弹出队伍菜单（insert/copy/paste/delete/rename）', async () => {
		const { wrapper, team } = await mountAndInit();
		vi.mocked(Data).teams = makeTeamsData() as unknown as typeof Data.teams;
		team.open();
		team.listPopup({
			clientX: 10,
			clientY: 20,
			value: getTeamStore().data![0]
		} as unknown as PointerEvent & {
			value?: TeamData | null;
		});
		expect(vi.mocked(Menu.popup)).toHaveBeenCalled();
		const items = vi.mocked(Menu.popup).mock.calls[0][1];
		expect(items.map((item) => item.accelerator)).toEqual([
			'Insert',
			'Ctrl+C',
			'Ctrl+V',
			'Delete',
			'F2'
		]);
		wrapper.unmount();
	});

	it('legacy Team 入口 open/confirm/listChange 转发 composable', async () => {
		const { Team: TeamController } = await import('@app/data/team-window.ts');
		const { wrapper } = await mountAndInit();
		vi.mocked(Data).teams = makeTeamsData() as unknown as typeof Data.teams;
		TeamController.initialize();
		TeamController.open();
		expect(Window.open).toHaveBeenCalledWith('team');
		expect(getTeamStore().state).toBe('open');
		TeamController.listChange();
		expect(TeamController.changed).toBe(true);
		TeamController.confirm(new Event('click'));
		expect(Window.close).toHaveBeenCalledWith('team');
		wrapper.unmount();
	});
});
