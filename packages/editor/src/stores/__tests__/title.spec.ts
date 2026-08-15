import { describe, expect, it } from 'vitest';
import { getTitleStore, titleStateKeys } from '@app/stores/title';
import { Title } from '@/title/title-bar.ts';

describe('useTitleStore（Title 状态反转：store 为源）', () => {
	it('初始状态默认值', () => {
		const store = getTitleStore();
		expect(store.theme).toBe(null);
		expect(store.playing).toBe(false);
		expect(store.maximized).toBe(false);
		expect(store.fullscreen).toBe(false);
	});

	it('状态键完整（4 项）', () => {
		const store = getTitleStore();
		expect(titleStateKeys).toHaveLength(4);
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

	it('maximized/fullscreen 直接赋值读回', () => {
		const store = getTitleStore();
		store.maximized = true;
		expect(store.maximized).toBe(true);
		store.fullscreen = true;
		expect(store.fullscreen).toBe(true);
		store.maximized = false;
		store.fullscreen = false;
	});

	it('legacy 写入经 store 生效（store 为源）', () => {
		const store = getTitleStore();
		Title.windowMaximize!(new Event('maximize'));
		expect(store.maximized).toBe(true);
		Title.windowUnmaximize!(new Event('unmaximize'));
		expect(store.maximized).toBe(false);
		Title.windowEnterFullScreen!(new Event('enter-full-screen'));
		expect(store.fullscreen).toBe(true);
		Title.windowLeaveFullScreen!(new Event('leave-full-screen'));
		expect(store.fullscreen).toBe(false);
		Title.dispatchThemechangeEvent!('dark');
		expect(store.theme).toBe('dark');
		Title.dispatchThemechangeEvent!('light');
		expect(store.theme).toBe('light');
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
