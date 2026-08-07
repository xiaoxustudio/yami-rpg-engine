import { defineStore } from 'pinia';
import { Easing } from '@/data/transition-window.ts';
import { shallowRef } from 'vue';

export const useEasingStore = defineStore('easing', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<any>(null);

	function syncState() {
		state.value = Easing?.state ?? 'closed';
		target.value = Easing?.target ?? null;
	}

	function open(target?: any) {
		Easing?.open?.(target);
	}

	function close() {
		Easing?.close?.();
	}

	function load(easing: any) {
		Easing?.load?.(easing);
	}

	function insert(dItem: any) {
		Easing?.insert?.(dItem);
	}

	function copy(item: any) {
		Easing?.copy?.(item);
	}

	function paste(dItem: any) {
		Easing?.paste?.(dItem);
	}

	function delete_(item: any) {
		Easing?.delete?.(item);
	}

	function createId() {
		return Easing?.createId?.();
	}

	function createData() {
		return Easing?.createData?.();
	}

	function setEasingKey(item: any) {
		return Easing?.setEasingKey?.(item);
	}

	function getItemById(id: any) {
		return Easing?.getItemById?.(id);
	}

	function updateMaps() {
		Easing?.updateMaps?.();
	}

	function requestRendering() {
		Easing?.requestRendering?.();
	}

	function saveToProject(project: any) {
		Easing?.saveToProject?.(project);
	}

	function loadFromProject(project: any) {
		Easing?.loadFromProject?.(project);
	}

	return {
		state,
		target,
		syncState,
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
