import { defineStore } from 'pinia';
import { shallowReactive } from 'vue';
import { pinia } from './pinia';
import { GUID } from '@app/services/file-system/guid';

export interface AttributeItemShape {
	id: string;
	name?: string;
	class?: string;
	children?: AttributeItemShape[];
	[k: string]: unknown;
}

export interface AttributeWindowState {
	mode: string | null;
	target: { input?: (id: string) => void; [k: string]: unknown } | null;
	data: AttributeItemShape[] | null;
	idMap: Record<string, boolean> | null;
	settings: Record<string, string> | null;
	settingKeys: string[] | null;
	history: unknown;
	changed: boolean;
	selected: AttributeItemShape | null;
}

export const attributeStateKeys: (keyof AttributeWindowState)[] = [
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

export const useAttributeStore = defineStore('attribute', () => {
	const state = shallowReactive<AttributeWindowState>({
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

	function register(item: AttributeItemShape): void {
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

	function unregister(item: AttributeItemShape): void {
		if (!state.idMap) return;
		delete state.idMap[item.id];
		if (item.class === 'folder') {
			for (const child of item.children ?? []) {
				unregister(child);
			}
		}
	}

	function getItemById(id: string): AttributeItemShape | undefined {
		const find = (
			items: AttributeItemShape[] | null | undefined
		): AttributeItemShape | undefined => {
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

	return { state, createId, register, unregister, getItemById };
});

export function getAttributeStore() {
	return useAttributeStore(pinia);
}
