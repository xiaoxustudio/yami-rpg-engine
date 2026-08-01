import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Updater } from './updater.ts';

Updater.updateTriggers = function (verNum: any) {
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		const triggers = Data.triggers;
		const keys = Object.keys((Inspector.fileTrigger as any).create());
		for (const [guid, sTrigger] of Object.entries(triggers)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const dTrigger = (Inspector.fileTrigger as any).create();
			for (const key of keys) {
				if (key in (sTrigger as any)) {
					dTrigger[key] = (sTrigger as any)[key];
				}
			}
			triggers[guid] = dTrigger;
			(File.planToSave as any)(meta);
		}
	}
};
