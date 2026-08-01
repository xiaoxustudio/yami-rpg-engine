import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useLocalizationStore = defineStore('localization', () => {
	const state = shallowRef<string>('closed');
	const strings = shallowRef<Record<string, any>>({});

	function syncState() {
		const Localization = (window as any).Localization;
		state.value = Localization?.state ?? 'closed';
		strings.value = Localization?.strings ?? {};
	}

	function initialize() {
		(window as any).Localization?.initialize?.();
	}

	function open(target?: any) {
		(window as any).Localization?.open?.(target);
	}

	function close() {
		(window as any).Localization?.close?.();
	}

	function undo() {
		(window as any).Localization?.undo?.();
	}

	function redo() {
		(window as any).Localization?.redo?.();
	}

	function createId() {
		return (window as any).Localization?.createId?.();
	}

	function register(item: any) {
		(window as any).Localization?.register?.(item);
	}

	function unregister(item: any) {
		(window as any).Localization?.unregister?.(item);
	}

	function openContentPanel(item: any) {
		(window as any).Localization?.openContentPanel?.(item);
	}

	function closeContentPanel() {
		(window as any).Localization?.closeContentPanel?.();
	}

	function confirm(event?: any) {
		(window as any).Localization?.confirm?.(event);
	}

	function apply(event?: any) {
		(window as any).Localization?.apply?.(event);
	}

	function toExcel(event?: any) {
		(window as any).Localization?.toExcel?.(event);
	}

	function saveToProject(project: any) {
		(window as any).Localization?.saveToProject?.(project);
	}

	function loadFromProject(project: any) {
		(window as any).Localization?.loadFromProject?.(project);
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
