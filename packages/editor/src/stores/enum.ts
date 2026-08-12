import { defineStore } from 'pinia';
import type { DataEntryShape } from './data';
import type { History } from '@/tools/history.ts';
import { shallowReactive } from 'vue';
import { pinia } from './pinia';

export interface EnumItemShape {
	id: string;
	name?: string;
	children?: EnumItemShape[];
	[k: string]: unknown;
}

export interface EnumWindowState {
	mode: string | null;
	target: { input?: (id: string) => void } | null;
	data: EnumItemShape[] | null;
	idMap: Record<string, DataEntryShape> | null;
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

	return { state };
});

export function getEnumStore() {
	return useEnumStore(pinia);
}
