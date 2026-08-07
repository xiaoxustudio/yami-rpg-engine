import { defineStore } from 'pinia';
import { CustomCommand } from '@/command/custom-command-window.ts';
import { shallowRef } from 'vue';

export const useCustomCommandStore = defineStore('customCommand', () => {
	const state = shallowRef<string>('closed');
	const commands = shallowRef<any[] | Record<string, any>>([]);

	function syncState() {
		state.value = CustomCommand?.state ?? 'closed';
		commands.value = CustomCommand?.commands ?? [];
	}

	function initialize() {
		CustomCommand?.initialize?.();
	}

	function open() {
		CustomCommand?.open?.();
	}

	function close() {
		CustomCommand?.close?.();
	}

	function unload() {
		CustomCommand?.unload?.();
	}

	function loadOverview() {
		CustomCommand?.loadOverview?.();
	}

	function createData(id: string) {
		return CustomCommand?.createData?.(id);
	}

	function confirm(event?: any) {
		CustomCommand?.confirm?.(event);
	}

	function apply(event?: any) {
		CustomCommand?.apply?.(event);
	}

	function saveToProject(project: any) {
		CustomCommand?.saveToProject?.(project);
	}

	function loadFromProject(project: any) {
		CustomCommand?.loadFromProject?.(project);
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
