import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
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
	'changed'
] as const;

export const useAutoTileStore = defineStore('autoTile', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<unknown>(null);
	const templates = shallowRef<any>(null);
	const template = shallowRef<any>(null);
	const nodeIndex = shallowRef<any>(null);
	const frameIndex = shallowRef<any>(null);
	const offsetX = shallowRef<any>(null);
	const offsetY = shallowRef<any>(null);
	const imageId = shallowRef<string | null>(null);
	const changed = shallowRef<boolean>(false);

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
		changed
	};
});

export function getAutoTileStore() {
	return useAutoTileStore(pinia);
}
