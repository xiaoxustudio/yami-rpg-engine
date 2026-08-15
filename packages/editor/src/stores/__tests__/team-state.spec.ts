import { describe, expect, it } from 'vitest';
import { getTeamStore, teamStateKeys } from '@app/stores/team';
import { Team } from '@/data/team-window.ts';

describe('useTeamStore（Team 窗口状态反转：store 为源）', () => {
	it('初始状态默认值', () => {
		const store = getTeamStore();
		expect(store.state).toBe('closed');
		expect(store.teams).toEqual([]);
		expect(store.data).toBe(null);
	});

	it('状态键完整（3 项）', () => {
		const store = getTeamStore();
		expect(teamStateKeys).toHaveLength(3);
		for (const key of teamStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('data 赋值读回', () => {
		const store = getTeamStore();
		store.data = [
			{ id: 't1', name: 'TeamA', color: '000000ff', relations: {}, collisions: {} }
		];
		expect(store.data?.[0].id).toBe('t1');
		expect(store.data?.[0].name).toBe('TeamA');
		expect(store.data?.[0].color).toBe('000000ff');
		store.data = null;
		expect(store.data).toBe(null);
	});

	it('legacy 写入经 store 生效（store 为源）', () => {
		const store = getTeamStore();
		const legacy = Team as unknown as Record<string, any>;
		legacy.state = 'open';
		expect(store.state).toBe('open');
		legacy.teams = { t1: { id: 't1' } };
		expect((store.teams as Record<string, unknown>).t1).toEqual({ id: 't1' });
		legacy.data = [
			{ id: 't1', name: 'TeamA', color: '000000ff', relations: {}, collisions: {} }
		];
		expect(store.data?.[0].name).toBe('TeamA');
		legacy.state = 'closed';
		legacy.teams = null;
		legacy.data = null;
		expect(store.state).toBe('closed');
		expect(store.teams).toBe(null);
		expect(store.data).toBe(null);
	});

	it('store 写入经桥反向可读（外部 legacy 读取兼容）', () => {
		const store = getTeamStore();
		const legacy = Team as unknown as Record<string, any>;
		store.state = 'open';
		expect(legacy.state).toBe('open');
		store.data = [
			{ id: 't2', name: 'TeamB', color: 'ff0000ff', relations: {}, collisions: {} }
		];
		expect(legacy.data?.[0].name).toBe('TeamB');
		store.state = 'closed';
		store.data = null;
		expect(legacy.state).toBe('closed');
		expect(legacy.data).toBe(null);
	});
});
