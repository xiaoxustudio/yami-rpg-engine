import { defineStore } from 'pinia';
import { shallowReactive } from 'vue';
import { pinia } from './pinia';

export interface VariableWindowState {
	target: any | null;
	data: any | null;
	idMap: Record<string, any> | null;
	history: any | null;
	changed: boolean;
}

export const variableStateKeys: (keyof VariableWindowState)[] = [
	'target',
	'data',
	'idMap',
	'history',
	'changed'
];

export const useVariableStore = defineStore('variable', () => {
	const state = shallowReactive<VariableWindowState>({
		target: null,
		data: null,
		idMap: null,
		history: null,
		changed: false
	});

	return { state };
});

export function getVariableStore() {
	return useVariableStore(pinia);
}
