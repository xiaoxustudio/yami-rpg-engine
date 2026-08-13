import { defineStore } from 'pinia';
import { AutoTile } from '@/palette/auto-tile.ts';
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
	const templates = shallowRef<unknown[] | null>(null);
	const template = shallowRef<unknown>(null);
	const nodeIndex = shallowRef<number | null>(null);
	const frameIndex = shallowRef<number | null>(null);
	const offsetX = shallowRef<number | null>(null);
	const offsetY = shallowRef<number | null>(null);
	const imageId = shallowRef<string | null>(null);
	const changed = shallowRef<boolean>(false);

	function syncState() {
		state.value = AutoTile?.state ?? 'closed';
		target.value = AutoTile?.target ?? null;
		templates.value = AutoTile?.templates ?? null;
		template.value = AutoTile?.template ?? null;
		nodeIndex.value = AutoTile?.nodeIndex ?? null;
		frameIndex.value = AutoTile?.frameIndex ?? null;
		offsetX.value = AutoTile?.offsetX ?? null;
		offsetY.value = AutoTile?.offsetY ?? null;
		imageId.value = AutoTile?.imageId ?? null;
		changed.value = AutoTile?.changed ?? false;
	}

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
		syncState
	};
});

export function getAutoTileStore() {
	return useAutoTileStore(pinia);
}
