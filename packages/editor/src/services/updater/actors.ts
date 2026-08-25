import { getDataStore } from '@app/stores/data';
import { append } from '@app/utils/array';
import { Updater } from './updater.ts';

function updateActors(verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		const { manifest, actors } = getDataStore().data;
		const keys = Object.keys(Updater.hooks.createInspectorSchema('fileActor'));
		// oxlint-disable-next-line no-explicit-any
		for (const [guid, sActor] of Object.entries<any>(actors!)) {
			const meta = manifest!.guidMap[guid];
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
			actors![guid] = dActor;
			append(getDataStore().data.manifest!.changes as unknown[], meta);
		}
	}
}

export function initUpdaterActors(): void {
	Updater.updateActors = updateActors;
}
