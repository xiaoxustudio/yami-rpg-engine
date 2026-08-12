import { defineStore } from 'pinia';
import type { DataEntryShape } from './data';
import type { History } from '@/tools/history.ts';
import { shallowReactive } from 'vue';
import { pinia } from './pinia';

export interface AttributeItemShape {
	id: string;
	name?: string;
	children?: AttributeItemShape[];
	[k: string]: unknown;
}

export interface AttributeWindowState {
	mode: string | null;
	target: { input?: (id: string) => void; [k: string]: unknown } | null;
	data: AttributeItemShape[] | null;
	idMap: Record<string, DataEntryShape> | null;
	settings: Record<string, string> | null;
	settingKeys: string[] | null;
	history: History | null;
	changed: boolean;
}

export const attributeStateKeys: (keyof AttributeWindowState)[] = [
	'mode',
	'target',
	'data',
	'idMap',
	'settings',
	'settingKeys',
	'history',
	'changed'
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
		changed: false
	});

	return { state };
});

export function getAttributeStore() {
	return useAttributeStore(pinia);
}
