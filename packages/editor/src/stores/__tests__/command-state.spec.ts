import { describe, expect, it } from 'vitest';
import { getCommandStore, commandStateKeys } from '@app/stores/command';

describe('useCommandStore（EventEditor 状态反转：store 为源）', () => {
	it('初始状态默认值', () => {
		const store = getCommandStore();
		expect(store.state).toBe('closed');
		expect(store.target).toBe(null);
	});

	it('状态键完整（2 项）', () => {
		const store = getCommandStore();
		expect(commandStateKeys).toHaveLength(2);
		for (const key of commandStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('字段直接赋值读回', () => {
		const store = getCommandStore();
		store.state = 'open';
		expect(store.state).toBe('open');
		store.target = { id: 'e1' };
		expect(store.target).toEqual({ id: 'e1' });
		store.state = 'closed';
		store.target = null;
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
