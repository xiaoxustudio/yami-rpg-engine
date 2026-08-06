import { defineStore } from 'pinia';
import { shallowReactive } from 'vue';
import { pinia } from './pinia';

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
