import { defineStore } from 'pinia';
import '@app/data/data-object.ts';
import { Easing } from '@app/data/transition-window.ts';
import type { EditorProjectShape } from './editor';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

export const easingStateKeys = ['state', 'target', 'data'] as const;

type EasingDataShape = {
	id: string;
	key: string;
	name: string;
	points: { x: number; y: number }[];
	[k: string]: unknown;
};

export const useEasingStore = defineStore('easing', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<Record<string, unknown> | null>(null);
	const data = shallowRef<EasingDataShape[] | null>(null);

	function open(target?: unknown) {
		Easing?.open?.(target);
	}

	function close() {
		Easing?.close?.();
	}

	function load(easing: EasingDataShape) {
		Easing?.load?.(easing);
	}

	function insert(dItem: EasingDataShape) {
		Easing?.insert?.(dItem);
	}

	function copy(item: EasingDataShape) {
		Easing?.copy?.(item);
	}

	function paste(dItem: EasingDataShape) {
		Easing?.paste?.(dItem);
	}

	function delete_(item: EasingDataShape) {
		Easing?.delete?.(item);
	}

	function createId() {
		return Easing?.createId?.();
	}

	function createData() {
		return Easing?.createData?.();
	}

	function setEasingKey(item: EasingDataShape) {
		return Easing?.setEasingKey?.(item);
	}

	function getItemById(id: string) {
		return Easing?.getItemById?.(id);
	}

	function updateMaps() {
		Easing?.updateMaps?.();
	}

	function requestRendering() {
		Easing?.requestRendering?.();
	}

	function saveToProject(project: EditorProjectShape) {
		Easing?.saveToProject?.(project);
	}

	function loadFromProject(project: EditorProjectShape) {
		Easing?.loadFromProject?.(project);
	}

	return {
		state,
		target,
		data,
		open,
		close,
		load,
		insert,
		copy,
		paste,
		delete: delete_,
		createId,
		createData,
		setEasingKey,
		getItemById,
		updateMaps,
		requestRendering,
		saveToProject,
		loadFromProject
	};
});

export function getEasingStore() {
	return useEasingStore(pinia);
}
