import { Data } from '@app/legacy/data/data-object.ts';
import { File } from '@app/legacy/file/file-system-core.ts';
import { Updater } from './updater.ts';

function updateActors(verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		const actors = Data.actors;
		const keys = Object.keys(Updater.hooks.createInspectorSchema('fileActor'));
		for (const [guid, sActor] of Object.entries<any>(actors)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const dActor = Updater.hooks.createInspectorSchema('fileActor');
			for (const key of keys) {
				if (key in sActor) {
					dActor[key] = sActor[key];
					continue;
				}
				switch (key) {
					case 'immovable':
						dActor[key] = false;
						continue;
				}
			}
			actors[guid] = dActor;
			File.planToSave!(meta);
		}
	}
}

export function initUpdaterActors(): void {
	Updater.updateActors = updateActors;
}
