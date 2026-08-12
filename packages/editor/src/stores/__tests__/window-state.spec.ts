import { describe, expect, it } from 'vitest';
import { getAttributeStore, attributeStateKeys } from '@app/stores/attribute';
import { getEnumStore, enumStateKeys } from '@app/stores/enum';
import { getVariableStore, variableStateKeys } from '@app/stores/variable';

describe('useAttributeStore（Attribute 窗口状态桥接）', () => {
	it('初始状态默认值', () => {
		const store = getAttributeStore();
		expect(store.state.mode).toBe(null);
		expect(store.state.target).toBe(null);
		expect(store.state.changed).toBe(false);
		expect(store.state.selected).toBe(null);
	});

	it('状态键完整（9 项）', () => {
		const store = getAttributeStore();
		expect(attributeStateKeys).toHaveLength(9);
		for (const key of attributeStateKeys) {
			expect(key in store.state, String(key)).toBe(true);
		}
	});

	it('赋值可读回（模式/目标/数据）', () => {
		const store = getAttributeStore();
		store.state.mode = 'normal';
		store.state.target = { id: 't1' };
		store.state.changed = true;
		expect(store.state.mode).toBe('normal');
		expect(store.state.target.id).toBe('t1');
		expect(store.state.changed).toBe(true);
	});
});

describe('useEnumStore（Enum 窗口状态桥接）', () => {
	it('初始状态默认值', () => {
		const store = getEnumStore();
		expect(store.state.mode).toBe(null);
		expect(store.state.changed).toBe(false);
		expect(store.state.selected).toBe(null);
	});

	it('赋值可读回（模式/数据/idMap）', () => {
		const store = getEnumStore();
		store.state.mode = 'normal';
		store.state.data = [{ id: 'e1' }];
		store.state.idMap = { e1: { id: 'e1' } };
		expect(store.state.data[0].id).toBe('e1');
		expect(store.state.idMap.e1.id).toBe('e1');
	});

	it('状态键完整（9 项）', () => {
		const store = getEnumStore();
		expect(enumStateKeys).toHaveLength(9);
		for (const key of enumStateKeys) {
			expect(key in store.state, String(key)).toBe(true);
		}
	});
});

describe('useVariableStore（Variable 窗口状态桥接）', () => {
	it('初始状态默认值', () => {
		const store = getVariableStore();
		expect(store.state.target).toBe(null);
		expect(store.state.data).toBe(null);
		expect(store.state.changed).toBe(false);
		expect(store.state.selected).toBe(null);
	});

	it('状态键完整（6 项）', () => {
		const store = getVariableStore();
		expect(variableStateKeys).toHaveLength(6);
		for (const key of variableStateKeys) {
			expect(key in store.state, String(key)).toBe(true);
		}
	});

	it('赋值可读回（目标/数据/idMap/history）', () => {
		const store = getVariableStore();
		store.state.target = { id: 'v1' };
		store.state.data = [{ id: 'v1' }];
		store.state.idMap = { v1: { id: 'v1' } };
		store.state.history = { save: () => undefined };
		store.state.changed = true;
		expect(store.state.target.id).toBe('v1');
		expect(store.state.data[0].id).toBe('v1');
		expect(store.state.idMap.v1.id).toBe('v1');
		expect(typeof store.state.history.save).toBe('function');
		expect(store.state.changed).toBe(true);
	});
});
