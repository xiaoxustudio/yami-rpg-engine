import { defineStore } from 'pinia';
import { shallowReactive } from 'vue';
import { pinia } from './pinia';

// Phase 10——Variable 窗口状态（数据经 Pinia 承载——类型随迁移逐步补齐）
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
