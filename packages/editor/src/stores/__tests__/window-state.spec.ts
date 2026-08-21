import { describe, expect, it } from 'vitest';
import { getAttributeStore, attributeStateKeys } from '@app/stores/attribute';
import { getEnumStore, enumStateKeys } from '@app/stores/enum';
import { getVariableStore, variableStateKeys } from '@app/stores/variable';
import { getWindowStore, windowStateKeys } from '@app/stores/window';
import { Attribute } from '@app/attribute/attribute-window.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { Variable } from '@app/variable/variable.ts';
import { Window } from '@app/tools/window-object';

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

	it('legacy 写入经 store 生效（store 为源）', () => {
		const store = getAttributeStore();
		Attribute.mode = 'group';
		expect(store.state.mode).toBe('group');
		Attribute.data = [{ id: 'a1' }];
		expect(store.state.data?.[0]?.id).toBe('a1');
		Attribute.changed = true;
		expect(store.state.changed).toBe(true);
		store.state.mode = 'normal';
		store.state.data = null;
		store.state.changed = false;
		expect(Attribute.mode).toBe('normal');
		expect(Attribute.data).toBe(null);
		expect(Attribute.changed).toBe(false);
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

	it('legacy 写入经 store 生效（store 为源）', () => {
		const store = getEnumStore();
		Enum.mode = 'string';
		expect(store.state.mode).toBe('string');
		Enum.data = [{ id: 'e1' }];
		expect(store.state.data?.[0]?.id).toBe('e1');
		Enum.changed = true;
		expect(store.state.changed).toBe(true);
		store.state.mode = 'normal';
		store.state.data = null;
		store.state.changed = false;
		expect(Enum.mode).toBe('normal');
		expect(Enum.data).toBe(null);
		expect(Enum.changed).toBe(false);
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
		store.state.history = { save: () => undefined } as any;
		store.state.changed = true;
		expect(store.state.target.id).toBe('v1');
		expect(store.state.data[0].id).toBe('v1');
		expect(store.state.idMap.v1).toBe(true);
		expect(typeof store.state.history!.save).toBe('function');
		expect(store.state.changed).toBe(true);
	});

	it('legacy 写入经 store 生效（store 为源）', () => {
		const store = getVariableStore();
		Variable.data = [{ id: 'v1' }];
		expect(store.state.data?.[0]?.id).toBe('v1');
		Variable.changed = true;
		expect(store.state.changed).toBe(true);
		store.state.data = null;
		store.state.changed = false;
		expect(Variable.data).toBe(null);
		expect(Variable.changed).toBe(false);
	});
});

describe('useWindowStore（Window 状态反转：store 为源）', () => {
	it('初始状态默认值', () => {
		const store = getWindowStore();
		expect(store.positionMode).toBe('center');
		expect(store.absolutePos).toEqual({ x: 0, y: 0 });
		expect(store.overlapRoot).toBe(null);
		expect(store.activeElement).toBe(null);
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

	it('桥接：legacy 写入经 store 生效（store 为源）', () => {
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

	it('legacy setPositionMode 写入经 store 生效', () => {
		const store = getWindowStore();
		const frame = document.createElement('div');
		frame.id = 'overlap-window';
		document.body.appendChild(frame);
		Window.frames.push(frame);
		Window.setPositionMode!('absolute');
		expect(store.positionMode).toBe('absolute');
		Window.setPositionMode!('overlap');
		expect(store.positionMode).toBe('overlap');
		expect(store.overlapRoot).toBe(frame);
		Window.setPositionMode!('center');
		expect(store.positionMode).toBe('center');
		expect(store.overlapRoot).toBe(null);
		Window.frames.length = 0;
		frame.remove();
	});

	it('legacy saveActiveElement/restoreActiveElement 写入经 store 生效', () => {
		const store = getWindowStore();
		const input = document.createElement('input');
		document.body.appendChild(input);
		input.focus();
		Window.saveActiveElement!();
		expect(store.activeElement).toBe(input);
		Window.restoreActiveElement!();
		expect(store.activeElement).toBe(null);
		input.remove();
	});
});
