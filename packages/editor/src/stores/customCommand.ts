import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useCustomCommandStore = defineStore('customCommand', () => {
	const state = shallowRef<string>('closed');
	const commands = shallowRef<any[]>([]);

	function syncState() {
		const CustomCommand = (window as any).CustomCommand;
		state.value = CustomCommand?.state ?? 'closed';
		commands.value = CustomCommand?.commands ?? [];
	}

	function initialize() {
		(window as any).CustomCommand?.initialize?.();
	}

	function open() {
		(window as any).CustomCommand?.open?.();
	}

	function close() {
		(window as any).CustomCommand?.close?.();
	}

	function unload() {
		(window as any).CustomCommand?.unload?.();
	}

	function loadOverview() {
		(window as any).CustomCommand?.loadOverview?.();
	}

	function createData(id: string) {
		return (window as any).CustomCommand?.createData?.(id);
	}

	function confirm(event?: any) {
		(window as any).CustomCommand?.confirm?.(event);
	}

	function apply(event?: any) {
		(window as any).CustomCommand?.apply?.(event);
	}

	function saveToProject(project: any) {
		(window as any).CustomCommand?.saveToProject?.(project);
	}

	function loadFromProject(project: any) {
		(window as any).CustomCommand?.loadFromProject?.(project);
	}

	return {
		state,
		commands,
		syncState,
		initialize,
		open,
		close,
		unload,
		loadOverview,
		createData,
		confirm,
		apply,
		saveToProject,
		loadFromProject
	};
});
