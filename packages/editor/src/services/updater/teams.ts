import { Data } from '@app/legacy/data/data-object.ts';
import { Codec } from '@app/engine/codec/codec.ts';
import { File } from '@app/legacy/file/file-system-core.ts';
import { Updater } from './updater.ts';

function updateTeams(verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.68')) {
		Data.teams.collisions = Codec.encodeTeamData!(
			Codec.decodeTeamData!(Data.teams.relations, Data.teams.list.length).fill(1)
		);
		File.planToSave!(Data.manifest.project.teams);
	}
}

export function initUpdaterTeams(): void {
	Updater.updateTeams = updateTeams;
}
