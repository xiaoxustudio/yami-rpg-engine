import { describe, expect, it } from 'vitest';
import { getUIStore, uiStateKeys } from '@app/stores/ui';
import { UI } from '@/ui/ui-window.ts';

describe('useUIStore（UI 状态反转：store 为源）', () => {
	it('初始状态默认值', () => {
		const store = getUIStore();
		expect(store.state).toBe('closed');
		expect(store.target).toBe(null);
		expect(store.zoom).toBe(null);
		expect(store.width).toBe(null);
		expect(store.height).toBe(null);
		expect(store.mode).toBe(null);
	});

	it('状态键完整（6 项）', () => {
		const store = getUIStore();
		expect(uiStateKeys).toHaveLength(6);
		for (const key of uiStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('字段直接赋值读回', () => {
		const store = getUIStore();
		store.state = 'open';
		expect(store.state).toBe('open');
		store.target = { class: 'image', children: [] };
		expect(store.target?.class).toBe('image');
		store.zoom = 2;
		expect(store.zoom).toBe(2);
		store.width = 480;
		expect(store.width).toBe(480);
		store.height = 320;
		expect(store.height).toBe(320);
		store.mode = 'select';
		expect(store.mode).toBe('select');
		store.state = 'closed';
		store.target = null;
		store.zoom = null;
		store.width = null;
		store.height = null;
		store.mode = null;
	});

	it('legacy 写入经 store 生效（store 为源）', () => {
		const store = getUIStore();
		UI.setZoom!(2);
		expect(store.zoom).toBe(2);
		UI.setZoom!(0);
		expect(store.zoom).toBe(0);
		UI.state = 'open';
		expect(store.state).toBe('open');
		UI.state = 'closed';
		expect(store.state).toBe('closed');
		UI.target = { class: 'image', children: [] };
		expect(store.target?.class).toBe('image');
		UI.target = null;
		expect(store.target).toBe(null);
		UI.width = 480;
		expect(store.width).toBe(480);
		UI.height = 320;
		expect(store.height).toBe(320);
		UI.mode = 'select';
		expect(store.mode).toBe('select');
	});

	it('store 写入经桥反向可读（外部 legacy 读取兼容）', () => {
		const store = getUIStore();
		store.state = 'open';
		expect(UI.state).toBe('open');
		store.zoom = 2;
		expect(UI.zoom).toBe(2);
		store.mode = 'select';
		expect(UI.mode).toBe('select');
		store.state = 'closed';
		store.zoom = null;
		store.mode = null;
	});
});
