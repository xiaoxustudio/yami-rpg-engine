import { defineStore } from 'pinia';
import { History } from '@app/tools/history.ts';
import { UndoManager } from '@app/tools/undo-manager.ts';
import { shallowReactive } from 'vue';
import { pinia } from './pinia';
import { GUID } from '@app/services/file-system/guid';

export interface EnumItemShape {
	id: string;
	name?: string;
	class?: string;
	children?: EnumItemShape[];
	[k: string]: unknown;
}

export interface EnumWindowState {
	mode: string | null;
	target: { input?: (id: string) => void } | null;
	data: EnumItemShape[] | null;
	idMap: Record<string, boolean> | null;
	settings: Record<string, string> | null;
	settingKeys: string[] | null;
	history: History | null;
	changed: boolean;
	selected: EnumItemShape | null;
}

export const enumStateKeys: (keyof EnumWindowState)[] = [
	'mode',
	'target',
	'data',
	'idMap',
	'settings',
	'settingKeys',
	'history',
	'changed',
	'selected'
];

export const useEnumStore = defineStore('enum', () => {
	const state = shallowReactive<EnumWindowState>({
		mode: null,
		target: null,
		data: null,
		idMap: null,
		settings: null,
		settingKeys: null,
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

	function register(item: EnumItemShape): void {
		if (!state.idMap) {
			state.idMap = {};
		}
		state.idMap[item.id] = true;
		if (item.class === 'folder') {
			for (const child of item.children ?? []) {
				register(child);
			}
		}
	}

	function unregister(item: EnumItemShape): void {
		if (!state.idMap) return;
		delete state.idMap[item.id];
		if (item.class === 'folder') {
			for (const child of item.children ?? []) {
				unregister(child);
			}
		}
	}

	function getItemById(id: string): EnumItemShape | undefined {
		const find = (items: EnumItemShape[] | null | undefined): EnumItemShape | undefined => {
			const length = items?.length ?? 0;
			for (let i = 0; i < length; i++) {
				const item = items![i];
				if (item.id === id) {
					return item;
				}
				if (item.class === 'folder') {
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

	function open(
		target: { input?: (id: string) => void; [k: string]: unknown } | null = null,
		mode: string | null = 'normal'
	): void {
		state.mode = mode;
		state.target = target as EnumWindowState['target'];
		_previousActive = UndoManager.getActive();
		state.history = new History(100);
		UndoManager.setActive(activeEditor);
	}

	function close(): void {
		state.data = null;
		state.idMap = null;
		state.settings = null;
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

	function saveHistory(item: EnumItemShape, key: string, value?: string): void {
		const history = state.history;
		if (!history) return;
		const type = `enum-${key}-change`;
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

	return {
		state,
		createId,
		register,
		unregister,
		getItemById,
		open,
		close,
		undo,
		redo,
		saveHistory
	};
});

export function getEnumStore() {
	return useEnumStore(pinia);
}
