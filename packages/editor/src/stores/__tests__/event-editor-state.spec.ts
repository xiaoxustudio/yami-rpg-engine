import { describe, expect, it } from 'vitest';
import { eventEditorStateKeys, getEventEditorStore } from '@app/stores/eventEditor';

describe('useEventEditorStore（EventEditor 编辑会话状态桥接）', () => {
	it('初始状态默认值', () => {
		const store = getEventEditorStore();
		expect(store.closing).toBe(false);
	});

	it('状态键完整（1 项）', () => {
		const store = getEventEditorStore();
		expect(eventEditorStateKeys).toHaveLength(1);
		for (const key of eventEditorStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('closing 直接赋值读回', () => {
		const store = getEventEditorStore();
		store.closing = true;
		expect(store.closing).toBe(true);
		store.closing = false;
		expect(store.closing).toBe(false);
	});

	it('无 EventEditor 时 syncState 兜底默认值', () => {
		const store = getEventEditorStore();
		store.syncState();
		expect(store.closing).toBe(false);
	});
});
