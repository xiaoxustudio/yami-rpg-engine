import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Updater } from './updater.ts';

Updater.updateEquipments = function (verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		const equipments = Data.equipments;
		const keys = Object.keys(Updater.hooks.createInspectorSchema('fileEquipment'));
		for (const [guid, sEquipment] of Object.entries<any>(equipments)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const dEquipment = Updater.hooks.createInspectorSchema('fileEquipment');
			for (const key of keys) {
				if (key in sEquipment) {
					dEquipment[key] = sEquipment[key];
				}
			}
			equipments[guid] = dEquipment;
			File.planToSave!(meta);
		}
	}
};
