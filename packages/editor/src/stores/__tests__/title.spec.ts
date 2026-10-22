import { describe, expect, it } from 'vitest';
import { getTitleStore, titleStateKeys } from '@app/stores/title';
import { Title } from '@app/title/title-bar.ts';

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

describe('Title.saveToProject（标题栏未就绪时的防御）', () => {
	type Project = { openTabs?: string[]; activeTab?: string };
	const saveToProject = Title.saveToProject!;

	it('tabBar 不存在时不抛错，也不覆盖工程里已有的标签页状态', () => {
		const project: Project = { openTabs: ['a', 'b'], activeTab: 'b' };
		// 关闭工程时 `Editor.saveProject` 会走到这里；标题栏未初始化曾是
		// `Cannot read properties of undefined (reading 'data')` 的来源。
		expect(() => saveToProject.call({} as never, project as never)).not.toThrow();
		// 早退而非写空数组：没有标题栏就没有"当前标签页"的信息，不该抹掉已有值
		expect(project.openTabs).toEqual(['a', 'b']);
		expect(project.activeTab).toBe('b');
	});

	it('tabBar 正常时把标签页写入工程', () => {
		const tabBar = {
			data: [{ meta: { guid: 'g1' } }, { meta: { guid: 'g2' } }],
			read: () => ({ meta: { guid: 'g2' } })
		};
		const project: Project = {};
		saveToProject.call({ tabBar } as never, project as never);
		expect(project.openTabs).toEqual(['g1', 'g2']);
		expect(project.activeTab).toBe('g2');
	});
});
