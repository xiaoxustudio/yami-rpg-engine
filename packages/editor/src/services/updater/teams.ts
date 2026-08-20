import { getDataStore } from '@app/stores/data';
import { Codec } from '@app/engine/codec/codec.ts';
import { append } from '@app/utils/array';
import { Updater } from './updater.ts';

function updateTeams(verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.68')) {
		const { manifest, teams } = getDataStore().data;
		teams!.collisions = Codec.encodeTeamData!(
			Codec.decodeTeamData!(teams!.relations!, teams!.list.length).fill(1)
		);
		append(getDataStore().data.manifest!.changes as unknown[], manifest!.project.teams);
	}
}

export function initUpdaterTeams(): void {
	Updater.updateTeams = updateTeams;
}
