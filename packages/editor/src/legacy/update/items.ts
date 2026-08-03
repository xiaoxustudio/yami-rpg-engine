import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Updater } from './updater.ts';

Updater.updateItems = function (verNum: any) {
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		const items = Data.items;
		const keys = Object.keys((Inspector.fileItem as any).create());
		for (const [guid, sItem] of Object.entries(items)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const dItem = (Inspector.fileItem as any).create();
			for (const key of keys) {
				if (key in (sItem as any)) {
					dItem[key] = (sItem as any)[key];
				}
			}
			items[guid] = dItem;
			(File.planToSave as any)(meta);
		}
	}
};
