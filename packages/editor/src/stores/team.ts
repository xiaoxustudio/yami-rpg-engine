import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useTeamStore = defineStore('team', () => {
	const state = shallowRef<string>('closed');
	const teams = shallowRef<any[]>([]);

	function syncState() {
		const Team = (window as any).Team;
		state.value = Team?.state ?? 'closed';
		teams.value = Team?.teams ?? [];
	}

	function initialize() {
		(window as any).Team?.initialize?.();
	}

	function open(data?: any) {
		(window as any).Team?.open?.(data);
	}

	function close() {
		(window as any).Team?.close?.();
	}

	function createId() {
		return (window as any).Team?.createId?.();
	}

	function createData() {
		return (window as any).Team?.createData?.();
	}

	function getItemById(id: any) {
		return (window as any).Team?.getItemById?.(id);
	}

	function unpackTeams() {
		return (window as any).Team?.unpackTeams?.();
	}

	function packTeams() {
		return (window as any).Team?.packTeams?.();
	}

	function confirm(event?: any) {
		(window as any).Team?.confirm?.(event);
	}

	function saveToProject(project: any) {
		(window as any).Team?.saveToProject?.(project);
	}

	function loadFromProject(project: any) {
		(window as any).Team?.loadFromProject?.(project);
	}

	return {
		state,
		teams,
		syncState,
		initialize,
		open,
		close,
		createId,
		createData,
		getItemById,
		unpackTeams,
		packTeams,
		confirm,
		saveToProject,
		loadFromProject
	};
});
