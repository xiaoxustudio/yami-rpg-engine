import { describe, expect, it } from 'vitest';
import { getAttributeStore, attributeStateKeys } from '@app/stores/attribute';
import { getEnumStore, enumStateKeys } from '@app/stores/enum';
import { getVariableStore, variableStateKeys } from '@app/stores/variable';
import { getWindowStore, windowStateKeys } from '@app/stores/window';
import { Window } from '@/tools/window-object';

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
		store.state.idMap = { e1: true };
		expect(store.state.data[0].id).toBe('e1');
		expect(store.state.idMap.e1).toBe(true);
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
		store.state.idMap = { v1: true };
		store.state.history = { save: () => undefined };
		store.state.changed = true;
		expect(store.state.target.id).toBe('v1');
		expect(store.state.data[0].id).toBe('v1');
		expect(store.state.idMap.v1).toBe(true);
		expect(typeof store.state.history.save).toBe('function');
		expect(store.state.changed).toBe(true);
	});
});

describe('useWindowStore（Window 窗口状态桥接）', () => {
	it('初始状态默认值', () => {
		const store = getWindowStore();
		expect(store.positionMode).toBe('center');
		expect(store.absolutePos).toEqual({ x: 0, y: 0 });
		expect(store.overlapRoot).toBe(null);
		expect(store.activeElement).toBe(null);
		expect(store.topWindow).toBe(null);
	});

	it('状态键完整（4 项）', () => {
		const store = getWindowStore();
		expect(windowStateKeys).toHaveLength(4);
		for (const key of windowStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('字段直接赋值读回（定位/焦点）', () => {
		const store = getWindowStore();
		const frame = document.createElement('div');
		store.positionMode = 'absolute';
		store.absolutePos = { x: 120, y: 240 };
		store.overlapRoot = frame;
		store.activeElement = document.body;
		expect(store.positionMode).toBe('absolute');
		expect(store.absolutePos).toEqual({ x: 120, y: 240 });
		expect(store.overlapRoot).toBe(frame);
		expect(store.activeElement).toBe(document.body);
		store.positionMode = 'center';
		store.absolutePos = { x: 0, y: 0 };
		store.overlapRoot = null;
		store.activeElement = null;
	});

	it('桥接：Window 与 store 双向读写一致', () => {
		const store = getWindowStore();
		Window.positionMode = 'overlap';
		expect(store.positionMode).toBe('overlap');
		store.positionMode = 'center';
		expect(Window.positionMode).toBe('center');
		Window.activeElement = document.body;
		expect(store.activeElement).toBe(document.body);
		Window.activeElement = null;
		expect(store.activeElement).toBe(null);
	});

	it('syncState 拉取 Window 状态（帧栈/定位）', () => {
		const store = getWindowStore();
		Window.frames.length = 0;
		const frame = document.createElement('div');
		frame.id = 'sync-window';
		document.body.appendChild(frame);
		Window.frames.push(frame);
		Window.positionMode = 'overlap';
		Window.overlapRoot = frame;
		store.syncState();
		expect(store.windows).toEqual([frame]);
		expect(store.topWindow).toBe(frame);
		expect(store.positionMode).toBe('overlap');
		expect(store.overlapRoot).toBe(frame);
		Window.frames.length = 0;
		Window.positionMode = 'center';
		Window.overlapRoot = null;
		frame.remove();
	});
});
