import { describe, expect, it } from 'vitest';
import { getTeamStore, teamStateKeys } from '@app/stores/team';

describe('useTeamStore（Team 窗口状态桥接）', () => {
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

	it('无 Team 时 syncState 兜底默认值', () => {
		const store = getTeamStore();
		store.syncState();
		expect(store.state).toBe('closed');
		expect(store.teams).toEqual([]);
		expect(store.data).toBe(null);
	});
});
