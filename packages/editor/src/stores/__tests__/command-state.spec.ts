import { describe, expect, it } from 'vitest';
import { getCommandStore } from '@app/stores/command';

describe('useCommandStore（EventEditor 状态反转 / 指令解析态为真源）', () => {
	it('初始状态默认值（解析态）', () => {
		const store = getCommandStore();
		expect(store.parse.id).toBeNull();
		expect(store.parse.target).toBeNull();
		expect(store.parse.invalid).toBe(false);
		expect(store.parse.eventIndex).toBe(0);
	});

	it('解析态字段直接赋值读回', () => {
		const store = getCommandStore();
		store.parse.id = 'e1';
		store.parse.invalid = true;
		expect(store.parse.id).toBe('e1');
		expect(store.parse.invalid).toBe(true);
		store.parse.id = null;
		store.parse.invalid = false;
	});

	it('桥方法存在且惰性可调用（jsdom 下 EventEditor 未挂载，可选链安全）', () => {
		const store = getCommandStore();
		for (const method of [
			'initialize',
			'open',
			'close',
			'planToSave',
			'openLocalEvent',
			'openGlobalEvent',
			'openRelatedEvents',
			'findRelatedEvents',
			'getAllLocalEvents',
			'clearAllEventClasses',
			'clearRelatedEventClasses',
			'save',
			'isChanged',
			'getItemById',
			'getItemByEvent',
			'openCommandList',
			'closeCommandList',
			'unpackOpenEvents',
			'packOpenEvents',
			'getGlobalEventName',
			'confirm',
			'apply'
		]) {
			expect(typeof store[method as keyof typeof store]).toBe('function');
		}
		expect(() => store.open('e1')).not.toThrow();
		expect(() => store.close()).not.toThrow();
	});
});
