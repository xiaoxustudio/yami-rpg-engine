import { describe, expect, it } from 'vitest';
import { getEnumStore } from '@app/stores/enum';

describe('useEnumStore（逻辑 action 迁移）', () => {
	it('createId 生成唯一 id 且避开已注册 id', () => {
		const store = getEnumStore();
		store.state.idMap = {};
		const id = store.createId();
		expect(typeof id).toBe('string');
		store.state.idMap[id] = true;
		expect(store.createId()).not.toBe(id);
	});

	it('register 递归注册文件夹自身与子项', () => {
		const store = getEnumStore();
		store.state.idMap = {};
		store.register({
			id: 'f1',
			class: 'folder',
			children: [{ id: 'c1' }, { id: 'c2' }]
		});
		expect(store.state.idMap?.['f1']).toBe(true);
		expect(store.state.idMap?.['c1']).toBe(true);
		expect(store.state.idMap?.['c2']).toBe(true);
	});

	it('unregister 递归注销文件夹子项', () => {
		const store = getEnumStore();
		store.state.idMap = { f1: true, c1: true, c2: true };
		store.unregister({ id: 'f1', class: 'folder', children: [{ id: 'c1' }, { id: 'c2' }] });
		expect(store.state.idMap?.['f1']).toBeUndefined();
		expect(store.state.idMap?.['c1']).toBeUndefined();
		expect(store.state.idMap?.['c2']).toBeUndefined();
	});

	it('getItemById 递归查找嵌套项', () => {
		const store = getEnumStore();
		store.state.data = [{ id: 'f1', class: 'folder', children: [{ id: 'c1', name: 'Child' }] }];
		expect(store.getItemById('c1')?.name).toBe('Child');
		expect(store.getItemById('nope')).toBeUndefined();
	});

	it('undo/redo 委托历史（history 为 null 安全）', () => {
		const store = getEnumStore();
		store.state.history = null;
		expect(() => store.undo()).not.toThrow();
		expect(() => store.redo()).not.toThrow();
	});

	it('saveHistory 合并相邻同 item 同 type 记录', () => {
		const store = getEnumStore();
		const item = { id: 'a1' };
		const saves: unknown[] = [];
		const history: { index: number; length: number; save: (data: unknown) => void } = {
			index: 0,
			length: 0,
			save: (data: unknown) => {
				saves.push(data);
				(history as unknown as Record<number, unknown>)[history.index] = data;
				history.length = history.index + 1;
			}
		};
		store.state.history = history as never;
		store.saveHistory(item, 'name', 'A');
		store.saveHistory(item, 'name', 'B');
		expect(saves).toHaveLength(1);
		store.saveHistory({ id: 'a2' }, 'name', 'C');
		expect(saves).toHaveLength(2);
	});
});
