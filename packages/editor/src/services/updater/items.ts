import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Updater } from './updater.ts';

Updater.updateItems = function (verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		const items = Data.items;
		const keys = Object.keys(Updater.hooks.createInspectorSchema('fileItem'));
		for (const [guid, sItem] of Object.entries<any>(items)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const dItem = Updater.hooks.createInspectorSchema('fileItem');
			for (const key of keys) {
				if (key in sItem) {
					dItem[key] = sItem[key];
				}
			}
			items[guid] = dItem;
			File.planToSave!(meta);
		}
	}
};
