import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useEasingStore = defineStore('easing', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<any>(null);

	function syncState() {
		const Easing = (window as any).Easing;
		state.value = Easing?.state ?? 'closed';
		target.value = Easing?.target ?? null;
	}

	function open(target?: any) {
		(window as any).Easing?.open?.(target);
	}

	function close() {
		(window as any).Easing?.close?.();
	}

	function load(easing: any) {
		(window as any).Easing?.load?.(easing);
	}

	function insert(dItem: any) {
		(window as any).Easing?.insert?.(dItem);
	}

	function copy(item: any) {
		(window as any).Easing?.copy?.(item);
	}

	function paste(dItem: any) {
		(window as any).Easing?.paste?.(dItem);
	}

	function delete_(item: any) {
		(window as any).Easing?.delete?.(item);
	}

	function createId() {
		return (window as any).Easing?.createId?.();
	}

	function createData() {
		return (window as any).Easing?.createData?.();
	}

	function setEasingKey(item: any) {
		return (window as any).Easing?.setEasingKey?.(item);
	}

	function getItemById(id: any) {
		return (window as any).Easing?.getItemById?.(id);
	}

	function updateMaps() {
		(window as any).Easing?.updateMaps?.();
	}

	function requestRendering() {
		(window as any).Easing?.requestRendering?.();
	}

	function saveToProject(project: any) {
		(window as any).Easing?.saveToProject?.(project);
	}

	function loadFromProject(project: any) {
		(window as any).Easing?.loadFromProject?.(project);
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
