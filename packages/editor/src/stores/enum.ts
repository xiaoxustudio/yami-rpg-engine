import { defineStore } from 'pinia';
import { shallowReactive } from 'vue';
import { pinia } from './pinia';

// Phase 10——Enum 窗口状态（数据经 Pinia 承载——类型随迁移逐步补齐）
export interface EnumWindowState {
	mode: string | null;
	target: any | null;
	data: any | null;
	idMap: Record<string, any> | null;
	settings: any | null;
	settingKeys: any | null;
	history: any | null;
	changed: boolean;
}

export const enumStateKeys: (keyof EnumWindowState)[] = [
	'mode',
	'target',
	'data',
	'idMap',
	'settings',
	'settingKeys',
	'history',
	'changed'
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
		changed: false
	});

	return { state };
});

export function getEnumStore() {
	return useEnumStore(pinia);
}
