import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

export const useColorStore = defineStore('color', () => {
	const paletteX = shallowRef<number>(0);
	const paletteY = shallowRef<number>(0);
	const pillarY = shallowRef<number>(0);
	const indexEnabled = shallowRef<boolean>(false);

	return { paletteX, paletteY, pillarY, indexEnabled };
});

export function getColorStore() {
	return useColorStore(pinia);
}
