import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useVariableStore = defineStore('variable', () => {
	const variables = shallowRef<any[]>([]);
	const target = shallowRef<any>(null);
	const changed = shallowRef<boolean>(false);

	function syncState() {
		const Variable = (window as any).Variable;
		variables.value = Variable?.variables ?? [];
		target.value = Variable?.target ?? null;
		changed.value = Variable?.changed ?? false;
	}

	function initialize() {
		(window as any).Variable?.initialize?.();
	}

	function open(target?: any) {
		(window as any).Variable?.open?.(target);
	}

	function close() {
		(window as any).Variable?.close?.();
	}

	function undo() {
		(window as any).Variable?.undo?.();
	}

	function redo() {
		(window as any).Variable?.redo?.();
	}

	function createId() {
		return (window as any).Variable?.createId?.();
	}

	function register(item: any) {
		(window as any).Variable?.register?.(item);
	}

	function unregister(item: any) {
		(window as any).Variable?.unregister?.(item);
	}

	function getVariableById(id: any) {
		return (window as any).Variable?.getVariableById?.(id);
	}

	function openPropertyPanel(variable: any) {
		(window as any).Variable?.openPropertyPanel?.(variable);
	}

	function closePropertyPanel() {
		(window as any).Variable?.closePropertyPanel?.();
	}

	function unpackVariables() {
		return (window as any).Variable?.unpackVariables?.();
	}

	function packVariables() {
		return (window as any).Variable?.packVariables?.();
	}

	function saveHistory(item: any, key: any, value: any) {
		(window as any).Variable?.saveHistory?.(item, key, value);
	}

	function saveToProject(project: any) {
		(window as any).Variable?.saveToProject?.(project);
	}

	function loadFromProject(project: any) {
		(window as any).Variable?.loadFromProject?.(project);
	}

	return {
		variables,
		target,
		changed,
		syncState,
		initialize,
		open,
		close,
		undo,
		redo,
		createId,
		register,
		unregister,
		getVariableById,
		openPropertyPanel,
		closePropertyPanel,
		unpackVariables,
		packVariables,
		saveHistory,
		saveToProject,
		loadFromProject
	};
});
