import { describe, expect, it } from 'vitest';
import { getAttributeStore } from '@app/stores/attribute';

describe('useAttributeStore（逻辑 action 迁移）', () => {
	it('createId 生成唯一 id 且避开已注册 id', () => {
		const store = getAttributeStore();
		store.state.idMap = {};
		const id = store.createId();
		expect(typeof id).toBe('string');
		expect(id.length).toBeGreaterThan(0);
		store.state.idMap[id] = true;
		expect(store.createId()).not.toBe(id);
	});

	it('register 递归注册文件夹子项', () => {
		const store = getAttributeStore();
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
		const store = getAttributeStore();
		store.state.idMap = { f1: true, c1: true, c2: true };
		store.unregister({ id: 'f1', class: 'folder', children: [{ id: 'c1' }, { id: 'c2' }] });
		expect(store.state.idMap?.['f1']).toBeUndefined();
		expect(store.state.idMap?.['c1']).toBeUndefined();
		expect(store.state.idMap?.['c2']).toBeUndefined();
	});

	it('getItemById 递归查找嵌套项', () => {
		const store = getAttributeStore();
		store.state.data = [
			{
				id: 'f1',
				class: 'folder',
				children: [{ id: 'c1', name: 'Child' }]
			}
		];
		expect(store.getItemById('c1')?.name).toBe('Child');
		expect(store.getItemById('nope')).toBeUndefined();
	});
});
