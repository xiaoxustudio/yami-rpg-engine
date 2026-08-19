import { Data } from '@app/legacy/data/data-object.ts';
import { File } from '@app/legacy/file/file-system-core.ts';
import { Updater } from './updater.ts';

function updateStates(verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		const states = Data.states;
		const keys = Object.keys(Updater.hooks.createInspectorSchema('fileState'));
		for (const [guid, sState] of Object.entries<any>(states)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const dState = Updater.hooks.createInspectorSchema('fileState');
			for (const key of keys) {
				if (key in sState) {
					dState[key] = sState[key];
				}
			}
			states[guid] = dState;
			File.planToSave!(meta);
		}
	}
}

export function initUpdaterStates(): void {
	Updater.updateStates = updateStates;
}
