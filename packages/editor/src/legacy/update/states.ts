import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Updater } from './updater.ts';

Updater.updateStates = function (verNum: any) {
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		const states = Data.states;
		const keys = Object.keys((Inspector.fileState as any).create());
		for (const [guid, sState] of Object.entries(states)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const dState = (Inspector.fileState as any).create();
			for (const key of keys) {
				if (key in (sState as any)) {
					dState[key] = (sState as any)[key];
				}
			}
			states[guid] = dState;
			(File.planToSave as any)(meta);
		}
	}
};
