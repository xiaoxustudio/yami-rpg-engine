import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Updater } from './updater.ts';

Updater.updateTriggers = function (verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		const triggers = Data.triggers;
		const keys = Object.keys(Updater.hooks.createInspectorSchema('fileTrigger'));
		for (const [guid, sTrigger] of Object.entries<any>(triggers)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const dTrigger = Updater.hooks.createInspectorSchema('fileTrigger');
			for (const key of keys) {
				if (key in sTrigger) {
					dTrigger[key] = sTrigger[key];
				}
			}
			triggers[guid] = dTrigger;
			File.planToSave!(meta);
		}
	}
};
