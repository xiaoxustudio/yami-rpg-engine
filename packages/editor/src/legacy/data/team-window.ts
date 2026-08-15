import { useTeamWindow, type TeamData } from '@app/composables/useTeamWindow';
import { getTeamStore } from '@app/stores/team';
import type { EditorProjectShape } from '@app/stores/editor';

export type { TeamData };

export const Team = {
	get list() {
		return useTeamWindow().list;
	},
	get maximum() {
		return useTeamWindow().maximum;
	},
	get changed() {
		return useTeamWindow().changed;
	},
	set changed(value: boolean) {
		useTeamWindow().setChanged(value);
	},
	get initialize() {
		return useTeamWindow().initialize;
	},
	get open() {
		return useTeamWindow().open;
	},
	get createId() {
		return useTeamWindow().createId;
	},
	get createData() {
		return useTeamWindow().createData;
	},
	get getItemById() {
		return useTeamWindow().getItemById;
	},
	get unpackTeams() {
		return useTeamWindow().unpackTeams;
	},
	get packTeams() {
		return useTeamWindow().packTeams;
	},
	get windowClose() {
		return useTeamWindow().windowClose;
	},
	get windowClosed() {
		return useTeamWindow().windowClosed;
	},
	get listKeydown() {
		return useTeamWindow().listKeydown;
	},
	get listPointerdown() {
		return useTeamWindow().listPointerdown;
	},
	get listSelect() {
		return useTeamWindow().listSelect;
	},
	get listChange() {
		return useTeamWindow().listChange;
	},
	get listPopup() {
		return useTeamWindow().listPopup;
	},
	get confirm() {
		return useTeamWindow().confirm;
	},
	get list_insert() {
		return useTeamWindow().list_insert;
	},
	get list_copy() {
		return useTeamWindow().list_copy;
	},
	get list_paste() {
		return useTeamWindow().list_paste;
	},
	get list_delete() {
		return useTeamWindow().list_delete;
	},
	get list_saveSelection() {
		return useTeamWindow().list_saveSelection;
	},
	get list_restoreSelection() {
		return useTeamWindow().list_restoreSelection;
	},
	get list_updateItemName() {
		return useTeamWindow().list_updateItemName;
	},
	saveToProject: null as ((project: EditorProjectShape) => void) | null,
	loadFromProject: null as ((project: EditorProjectShape) => void) | null,
	close: null as (() => void) | null
};

const teamStateKeys = ['state', 'teams', 'data'] as const;

for (const key of teamStateKeys) {
	Object.defineProperty(Team, key, {
		get: () => getTeamStore()[key],
		set: (value: unknown) => {
			(getTeamStore() as unknown as Record<(typeof teamStateKeys)[number], unknown>)[key] =
				value;
		},
		configurable: true
	});
}
