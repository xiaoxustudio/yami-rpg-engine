import { describe, expect, it } from 'vitest';
import { getTitleStore, titleStateKeys } from '@app/stores/title';

describe('useTitleStore（Title 状态桥接）', () => {
	it('初始状态默认值', () => {
		const store = getTitleStore();
		expect(store.theme).toBe(null);
		expect(store.playing).toBe(false);
	});

	it('状态键完整（2 项）', () => {
		const store = getTitleStore();
		expect(titleStateKeys).toHaveLength(2);
		for (const key of titleStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('theme 直接赋值读写', () => {
		const store = getTitleStore();
		store.theme = 'dark';
		expect(store.theme).toBe('dark');
		store.theme = null;
	});

	it('setPlaying 读写', () => {
		const store = getTitleStore();
		store.setPlaying(true);
		expect(store.playing).toBe(true);
		store.setPlaying(false);
		expect(store.playing).toBe(false);
	});

	it('桥方法存在且惰性可调用（jsdom 下 Title 未挂载，可选链安全）', () => {
		const store = getTitleStore();
		for (const method of [
			'playGame',
			'minimizeClick',
			'maximizeClick',
			'closeClick',
			'pointerenter',
			'tabBarSelect',
			'tabBarClosed',
			'tabBarPopup'
		]) {
			expect(typeof store[method as keyof typeof store]).toBe('function');
		}
		expect(() => store.playGame()).not.toThrow();
	});
});
