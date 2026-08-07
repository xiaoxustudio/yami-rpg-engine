import { defineStore } from 'pinia';
import { Team } from '@/data/team-window.ts';
import { shallowRef } from 'vue';

export const useTeamStore = defineStore('team', () => {
	const state = shallowRef<string>('closed');
	const teams = shallowRef<any[] | Record<string, any>>([]);

	function syncState() {
		state.value = Team?.state ?? 'closed';
		teams.value = Team?.teams ?? [];
	}

	function initialize() {
		Team?.initialize?.();
	}

	function open(data?: any) {
		Team?.open?.(data);
	}

	function close() {
		Team?.close?.();
	}

	function createId() {
		return Team?.createId?.();
	}

	function createData() {
		return Team?.createData?.();
	}

	function getItemById(id: any) {
		return Team?.getItemById?.(id);
	}

	function unpackTeams() {
		return Team?.unpackTeams?.();
	}

	function packTeams() {
		return Team?.packTeams?.();
	}

	function confirm(event?: any) {
		Team?.confirm?.(event);
	}

	function saveToProject(project: any) {
		Team?.saveToProject?.(project);
	}

	function loadFromProject(project: any) {
		Team?.loadFromProject?.(project);
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
