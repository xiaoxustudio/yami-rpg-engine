import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import { pinia } from './pinia';

export const autoTileStateKeys = [
	'state',
	'target',
	'templates',
	'template',
	'nodeIndex',
	'frameIndex',
	'offsetX',
	'offsetY',
	'imageId',
	'changed',
	'ruleBits'
] as const;

export const useAutoTileStore = defineStore('autoTile', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<unknown>(null);
	// oxlint-disable-next-line no-explicit-any
	const templates = shallowRef<any>(null);
	// oxlint-disable-next-line no-explicit-any
	const template = shallowRef<any>(null);
	// oxlint-disable-next-line no-explicit-any
	const nodeIndex = shallowRef<any>(null);
	// oxlint-disable-next-line no-explicit-any
	const frameIndex = shallowRef<any>(null);
	// oxlint-disable-next-line no-explicit-any
	const offsetX = shallowRef<any>(null);
	// oxlint-disable-next-line no-explicit-any
	const offsetY = shallowRef<any>(null);
	const imageId = shallowRef<string | null>(null);
	const changed = shallowRef<boolean>(false);
	const ruleBits = ref([0, 0, 0, 0, 0, 0, 0, 0]);

	return {
		state,
		target,
		templates,
		template,
		nodeIndex,
		frameIndex,
		offsetX,
		offsetY,
		imageId,
		changed,
		ruleBits
	};
});

export function getAutoTileStore() {
	return useAutoTileStore(pinia);
}
