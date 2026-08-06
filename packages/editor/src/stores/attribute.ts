import { defineStore } from 'pinia';
import { shallowReactive } from 'vue';
import { pinia } from './pinia';

// Phase 10——Attribute 窗口状态（数据经 Pinia 承载——类型随迁移逐步补齐）
export interface AttributeWindowState {
	mode: string | null;
	target: any | null;
	data: any | null;
	idMap: Record<string, any> | null;
	settings: any | null;
	settingKeys: any | null;
	history: any | null;
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
