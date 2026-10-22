import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

export const useSelectionStore = defineStore('selection', () => {
	const inserting = shallowRef<boolean>(false);
	const context = shallowRef<{ target: unknown; inserting: boolean } | null>(null);

	return { inserting, context };
});

export function getSelectionStore() {
	return useSelectionStore(pinia);
}
