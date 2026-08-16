import { defineStore } from 'pinia';
import { shallowReactive } from 'vue';
import { pinia } from './pinia';
import { GUID } from '@app/services/file-system/guid';

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
	history: { save: (data: unknown) => void } | null;
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

	function undo(): void {
		const history = state.history as {
			canUndo?: () => boolean;
			restore?: (mode: string) => void;
		} | null;
		if (history?.canUndo?.()) {
			history.restore?.('undo');
		}
	}

	function redo(): void {
		const history = state.history as {
			canRedo?: () => boolean;
			restore?: (mode: string) => void;
		} | null;
		if (history?.canRedo?.()) {
			history.restore?.('redo');
		}
	}

	function saveHistory(item: VariableItemShape, key: string, value: unknown): void {
		const history = state.history as {
			index?: number;
			length?: number;
			save: (data: unknown) => void;
			[index: number]: unknown;
		} | null;
		if (!history) return;
		const type = `variable-${key}-change`;
		const index = history.index ?? 0;
		const length = history.length ?? 0;
		const record = history[index] as { type?: string; item?: unknown } | undefined;
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
		createId,
		register,
		unregister,
		getVariableById,
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
