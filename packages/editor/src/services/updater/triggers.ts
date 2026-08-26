import { getDataStore } from '@app/stores/data';
import { append } from '@app/utils/array';
import { Updater } from './updater.ts';

function updateTriggers(verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		const { manifest, triggers } = getDataStore().data;
		const keys = Object.keys(Updater.hooks.createInspectorSchema('fileTrigger'));
		for (const [guid, sTrigger] of Object.entries(triggers!)) {
			const meta = manifest!.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const dTrigger = Updater.hooks.createInspectorSchema('fileTrigger');
			for (const key of keys) {
				if (key in sTrigger) {
					dTrigger[key] = sTrigger[key];
				}
			}
			triggers![guid] = dTrigger;
			append(getDataStore().data.manifest!.changes as unknown[], meta);
		}
	}
}

export function initUpdaterTriggers(): void {
	Updater.updateTriggers = updateTriggers;
}
