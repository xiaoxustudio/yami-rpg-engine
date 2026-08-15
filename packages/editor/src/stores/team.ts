import { defineStore } from 'pinia';
import { Team } from '@/data/team-window.ts';
import type { TeamShape } from './data';
import type { EditorProjectShape } from './editor';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

export const teamStateKeys = ['state', 'teams', 'data'] as const;

type TeamDataShape = {
	id: string;
	name: string;
	color: string;
	relations: Record<string, number>;
	collisions: Record<string, number>;
	[k: string]: unknown;
};

export const useTeamStore = defineStore('team', () => {
	const state = shallowRef<string>('closed');
	const teams = shallowRef<TeamShape[] | Record<string, TeamShape> | null>([]);
	const data = shallowRef<TeamDataShape[] | null>(null);

	function initialize() {
		Team?.initialize?.();
	}

	function open(data?: unknown) {
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

	function getItemById(id: string) {
		return Team?.getItemById?.(id);
	}

	function unpackTeams() {
		return Team?.unpackTeams?.();
	}

	function packTeams() {
		return Team?.packTeams?.();
	}

	function confirm(event?: Event) {
		Team?.confirm?.(event as Event);
	}

	function saveToProject(project: EditorProjectShape) {
		Team?.saveToProject?.(project);
	}

	function loadFromProject(project: EditorProjectShape) {
		Team?.loadFromProject?.(project);
	}

	return {
		state,
		teams,
		data,
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

export function getTeamStore() {
	return useTeamStore(pinia);
}
