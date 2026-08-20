import { getDataStore } from '@app/stores/data';
import { append } from '@app/utils/array';
import { Updater } from './updater.ts';

function updateStates(verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		const { manifest, states } = getDataStore().data;
		const keys = Object.keys(Updater.hooks.createInspectorSchema('fileState'));
		for (const [guid, sState] of Object.entries<any>(states!)) {
			const meta = manifest!.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const dState = Updater.hooks.createInspectorSchema('fileState');
			for (const key of keys) {
				if (key in sState) {
					dState[key] = sState[key];
				}
			}
			states![guid] = dState;
			append(getDataStore().data.manifest!.changes as unknown[], meta);
		}
	}
}

export function initUpdaterStates(): void {
	Updater.updateStates = updateStates;
}
