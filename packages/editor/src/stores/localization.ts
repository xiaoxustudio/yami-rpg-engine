import { defineStore } from 'pinia';
import { Localization } from '@/local/local-window.ts';
import { shallowRef } from 'vue';

export const useLocalizationStore = defineStore('localization', () => {
	const state = shallowRef<string>('closed');
	const strings = shallowRef<Record<string, any>>({});

	function syncState() {
		state.value = Localization?.state ?? 'closed';
		strings.value = Localization?.strings ?? {};
	}

	function initialize() {
		Localization?.initialize?.();
	}

	function open(target?: any) {
		Localization?.open?.(target);
	}

	function close() {
		Localization?.close?.();
	}

	function undo() {
		Localization?.undo?.();
	}

	function redo() {
		Localization?.redo?.();
	}

	function createId() {
		return Localization?.createId?.();
	}

	function register(item: any) {
		Localization?.register?.(item);
	}

	function unregister(item: any) {
		Localization?.unregister?.(item);
	}

	function openContentPanel(item: any) {
		Localization?.openContentPanel?.(item);
	}

	function closeContentPanel() {
		Localization?.closeContentPanel?.();
	}

	function confirm(event?: any) {
		Localization?.confirm?.(event);
	}

	function apply(event?: any) {
		Localization?.apply?.(event);
	}

	function toExcel(event?: any) {
		Localization?.toExcel?.(event);
	}

	function saveToProject(project: any) {
		Localization?.saveToProject?.(project);
	}

	function loadFromProject(project: any) {
		Localization?.loadFromProject?.(project);
	}

	return {
		state,
		strings,
		syncState,
		initialize,
		open,
		close,
		undo,
		redo,
		createId,
		register,
		unregister,
		openContentPanel,
		closeContentPanel,
		confirm,
		apply,
		toExcel,
		saveToProject,
		loadFromProject
	};
});
