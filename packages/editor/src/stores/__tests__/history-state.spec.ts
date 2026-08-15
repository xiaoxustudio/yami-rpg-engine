import { describe, expect, it } from 'vitest';
import { getHistoryStore, historyStateKeys } from '@app/stores/history';
import { UndoManager } from '@/tools/undo-manager';

describe('useHistoryStore（undo/redo 状态桥接）', () => {
	it('初始状态默认值', () => {
		const store = getHistoryStore();
		expect(store.active).toBe(null);
		expect(store.canUndo).toBe(false);
		expect(store.canRedo).toBe(false);
	});

	it('状态键完整（3 项）', () => {
		const store = getHistoryStore();
		expect(historyStateKeys).toHaveLength(3);
		for (const key of historyStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('无 UndoManager 时 syncState 兜底默认值', () => {
		const store = getHistoryStore();
		store.syncState();
		expect(store.active).toBe(null);
		expect(store.canUndo).toBe(false);
		expect(store.canRedo).toBe(false);
	});

	it('setActive 后同步 canUndo/canRedo', () => {
		const store = getHistoryStore();
		const editor = {
			history: {
				canUndo: () => true,
				canRedo: () => true
			}
		};
		UndoManager.setActive(editor as never);
		expect(store.active).toBe(editor);
		expect(store.canUndo).toBe(true);
		expect(store.canRedo).toBe(true);
		UndoManager.setActive(null);
		expect(store.active).toBe(null);
		expect(store.canUndo).toBe(false);
		expect(store.canRedo).toBe(false);
	});

	it('undo/redo 转发并刷新状态', () => {
		const store = getHistoryStore();
		let undid = 0;
		let redid = 0;
		UndoManager.setActive({
			undo: () => {
				undid++;
			},
			redo: () => {
				redid++;
			},
			history: {
				canUndo: () => undid > 0,
				canRedo: () => false
			}
		} as never);
		store.undo();
		expect(undid).toBe(1);
		expect(store.canUndo).toBe(true);
		store.redo();
		expect(redid).toBe(1);
		UndoManager.setActive(null);
	});
});
