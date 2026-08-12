import { defineStore } from 'pinia';
import type { DataEntryShape } from './data';
import { shallowReactive } from 'vue';
import { pinia } from './pinia';

export interface VariableItemShape {
	id: string;
	[k: string]: unknown;
}

export interface VariableWindowState {
	target: { [k: string]: unknown } | null;
	data: VariableItemShape[] | null;
	idMap: Record<string, DataEntryShape> | null;
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

	return { state };
});

export function getVariableStore() {
	return useVariableStore(pinia);
}
