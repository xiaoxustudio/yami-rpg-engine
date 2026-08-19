import { defineStore } from 'pinia';
import { shallowReactive, shallowRef } from 'vue';
import { pinia } from './pinia';
import { GUID } from '@app/services/file-system/guid';
import { History } from '@app/legacy/tools/history.ts';
import { UndoManager } from '@app/legacy/tools/undo-manager.ts';

export interface VariableItemShape {
	id?: string;
	class?: string;
	children?: VariableItemShape[];
	[k: string]: unknown;
}

export interface VariableWindowState {
	target: { [k: string]: unknown } | null;
	data: VariableItemShape[] | null;
	idMap: Record<string, boolean> | null;
	history: History | null;
	changed: boolean;
	selected: VariableItemShape | null;
}

export const variableStateKeys: (keyof VariableWindowState)[] = [
	'target',
	'data',
	'idMap',
	'history',
	'changed',
	'selected'
];

export const useVariableStore = defineStore('variable', () => {
	const state = shallowReactive<VariableWindowState>({
		target: null,
		data: null,
		idMap: null,
		history: null,
		changed: false,
		selected: null
	});

	const initialized = shallowRef(false);

	async function initialize(): Promise<void> {
		if (initialized.value) return;
		const { Variable } = await import('@app/legacy/variable/variable.ts');
		if (initialized.value) return;
		Variable?.initialize?.();
		initialized.value = true;
	}

	function createId(): string {
		let id: string;
		do {
			id = GUID.generate64bit();
		} while (state.idMap?.[id]);
		return id;
	}

	function register(item: VariableItemShape): void {
		if (item.class === 'folder') {
			for (const child of item.children ?? []) {
				register(child);
			}
		} else {
			if (!state.idMap) {
				state.idMap = {};
			}
			state.idMap[item.id!] = true;
		}
	}

	function unregister(item: VariableItemShape): void {
		if (item.class === 'folder') {
			for (const child of item.children ?? []) {
				unregister(child);
			}
		} else {
			if (!state.idMap) return;
			delete state.idMap[item.id!];
		}
	}

	function getVariableById(id: string): VariableItemShape | undefined {
		const find = (
			items: VariableItemShape[] | null | undefined
		): VariableItemShape | undefined => {
			const length = items?.length ?? 0;
			for (let i = 0; i < length; i++) {
				const item = items![i];
				if (item.class !== 'folder') {
					if (item.id === id) {
						return item;
					}
				} else {
					const result = find(item.children);
					if (result !== undefined) {
						return result;
					}
				}
			}
			return undefined;
		};
		return find(state.data);
	}

	let _previousActive: ReturnType<typeof UndoManager.getActive> = null;

	const activeEditor = {
		undo,
		redo,
		get history() {
			return state.history;
		}
	};

	function open(target: { [k: string]: unknown } | null = null): void {
		state.target = target;
		_previousActive = UndoManager.getActive();
		state.history = new History(100);
		UndoManager.setActive(activeEditor);
	}

	function close(): void {
		state.target = null;
		state.data = null;
		state.idMap = null;
		state.history = null;
		UndoManager.setActive(_previousActive);
		_previousActive = null;
	}

	function undo(): void {
		if (state.history?.canUndo()) {
			state.history.restore('undo');
		}
	}

	function redo(): void {
		if (state.history?.canRedo()) {
			state.history.restore('redo');
		}
	}

	function saveHistory(item: VariableItemShape, key: string, value: unknown): void {
		const history = state.history;
		if (!history) return;
		const type = `variable-${key}-change`;
		const index = history.index;
		const length = history.length;
		const record = history[index];
		if (
			index !== length - 1 ||
			record === undefined ||
			record.type !== type ||
			record.item !== item
		) {
			history.save({
				type: type,
				item: item,
				value: value
			});
		}
	}

	function createFolder(): VariableItemShape {
		return {
			class: 'folder',
			name: 'New Folder',
			expanded: false,
			children: []
		};
	}

	function createVariable(): VariableItemShape {
		return {
			id: createId(),
			name: 'Variable',
			value: false,
			sort: 0,
			note: ''
		};
	}

	return {
		state,
		initialized,
		initialize,
		createId,
		register,
		unregister,
		getVariableById,
		open,
		close,
		undo,
		redo,
		saveHistory,
		createFolder,
		createVariable
	};
});

export function getVariableStore() {
	return useVariableStore(pinia);
}
