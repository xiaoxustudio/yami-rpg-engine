import { getDataStore } from '@app/stores/data';
import { append } from '@app/utils/array';
import { Updater } from './updater.ts';

function updateItems(verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		const { manifest, items } = getDataStore().data;
		const keys = Object.keys(Updater.hooks.createInspectorSchema('fileItem'));
		for (const [guid, sItem] of Object.entries(items!)) {
			const meta = manifest!.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const dItem = Updater.hooks.createInspectorSchema('fileItem');
			for (const key of keys) {
				if (key in sItem) {
					dItem[key] = sItem[key];
				}
			}
			items![guid] = dItem;
			append(getDataStore().data.manifest!.changes as unknown[], meta);
		}
	}
}

export function initUpdaterItems(): void {
	Updater.updateItems = updateItems;
}
