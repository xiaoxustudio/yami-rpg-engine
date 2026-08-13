import { describe, expect, it } from 'vitest';
import { getVariableStore } from '@app/stores/variable';

describe('useVariableStore（逻辑 action 迁移）', () => {
	it('createId 生成唯一 id 且避开已注册 id', () => {
		const store = getVariableStore();
		store.state.idMap = {};
		const id = store.createId();
		expect(typeof id).toBe('string');
		store.state.idMap[id] = true;
		expect(store.createId()).not.toBe(id);
	});

	it('register 文件夹不登记自身（仅子项）', () => {
		const store = getVariableStore();
		store.state.idMap = {};
		store.register({
			id: 'f1',
			class: 'folder',
			children: [{ id: 'c1' }, { id: 'c2' }]
		});
		expect(store.state.idMap?.['f1']).toBeUndefined();
		expect(store.state.idMap?.['c1']).toBe(true);
		expect(store.state.idMap?.['c2']).toBe(true);
	});

	it('unregister 递归注销', () => {
		const store = getVariableStore();
		store.state.idMap = { c1: true, c2: true };
		store.unregister({ id: 'f1', class: 'folder', children: [{ id: 'c1' }, { id: 'c2' }] });
		expect(store.state.idMap?.['c1']).toBeUndefined();
		expect(store.state.idMap?.['c2']).toBeUndefined();
	});

	it('getVariableById 跳过 folder 自身查找', () => {
		const store = getVariableStore();
		store.state.data = [
			{
				id: 'f1',
				class: 'folder',
				children: [{ id: 'c1', name: 'Child' }]
			}
		];
		expect(store.getVariableById('c1')?.name).toBe('Child');
		expect(store.getVariableById('f1')).toBeUndefined();
	});

	it('undo/redo 委托历史（history 为 null 安全）', () => {
		const store = getVariableStore();
		store.state.history = null;
		expect(() => store.undo()).not.toThrow();
		expect(() => store.redo()).not.toThrow();
	});

	it('createFolder/createVariable 返回结构', () => {
		const store = getVariableStore();
		const folder = store.createFolder();
		expect(folder.class).toBe('folder');
		expect(folder.children).toEqual([]);
		const variable = store.createVariable();
		expect(typeof variable.id).toBe('string');
		expect(variable.name).toBe('Variable');
	});
});
