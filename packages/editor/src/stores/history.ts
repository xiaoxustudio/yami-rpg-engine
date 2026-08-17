import { defineStore } from 'pinia';
import { UndoManager } from '@app/legacy/tools/undo-manager';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

export const historyStateKeys = ['active', 'canUndo', 'canRedo'] as const;

export const useHistoryStore = defineStore('history', () => {
	const active = shallowRef<unknown>(null);
	const canUndo = shallowRef<boolean>(false);
	const canRedo = shallowRef<boolean>(false);

	function syncState() {
		active.value = UndoManager?.getActive?.() ?? null;
		canUndo.value = UndoManager?.canUndo?.() ?? false;
		canRedo.value = UndoManager?.canRedo?.() ?? false;
	}

	function undo() {
		UndoManager?.undo?.();
		syncState();
	}

	function redo() {
		UndoManager?.redo?.();
		syncState();
	}

	return {
		active,
		canUndo,
		canRedo,
		syncState,
		undo,
		redo
	};
});

export function getHistoryStore() {
	return useHistoryStore(pinia);
}

UndoManager.onActiveChange = () => getHistoryStore().syncState();
