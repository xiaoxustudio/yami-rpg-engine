import { describe, expect, it } from 'vitest';
import { getProjectStore, projectStateKeys } from '@app/stores/project';
import { Project } from '@app/legacy/data/project-settings-window.ts';

describe('useProjectStore（Project 窗口状态反转：store 为源）', () => {
	it('初始状态默认值', () => {
		const store = getProjectStore();
		expect(store.state).toBe('closed');
		expect(store.target).toBe(null);
		expect(store.data).toBe(null);
	});

	it('状态键完整（3 项）', () => {
		const store = getProjectStore();
		expect(projectStateKeys).toHaveLength(3);
		for (const key of projectStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('data 赋值读回', () => {
		const store = getProjectStore();
		store.data = {
			window: { title: 'YAMI' },
			localization: { languages: [{ name: 'zh', font: '', scale: 1 }] }
		};
		expect(store.data?.window.title).toBe('YAMI');
		expect(store.data?.localization.languages[0].name).toBe('zh');
		store.data = null;
		expect(store.data).toBe(null);
	});

	it('legacy 写入经 store 生效（store 为源）', () => {
		const store = getProjectStore();
		const legacy = Project as unknown as Record<string, any>;
		legacy.state = 'open';
		expect(store.state).toBe('open');
		legacy.target = { window: { title: 'YAMI' } };
		expect(store.target).toEqual({ window: { title: 'YAMI' } });
		legacy.data = {
			window: { title: 'YAMI' },
			localization: { languages: [{ name: 'zh', font: '', scale: 1 }] }
		};
		expect(store.data?.window.title).toBe('YAMI');
		expect(store.data?.localization.languages[0].name).toBe('zh');
		legacy.state = 'closed';
		legacy.target = null;
		legacy.data = null;
		expect(store.state).toBe('closed');
		expect(store.target).toBe(null);
		expect(store.data).toBe(null);
	});

	it('store 写入经桥反向可读（外部 legacy 读取兼容）', () => {
		const store = getProjectStore();
		const legacy = Project as unknown as Record<string, any>;
		store.state = 'open';
		expect(legacy.state).toBe('open');
		store.data = { window: { title: 'X' }, localization: { languages: [] } };
		expect(legacy.data?.window.title).toBe('X');
		store.state = 'closed';
		store.data = null;
		expect(legacy.state).toBe('closed');
		expect(legacy.data).toBe(null);
	});
});
