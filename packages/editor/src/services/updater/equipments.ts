import { getDataStore } from '@app/stores/data';
import { append } from '@app/utils/array';
import { Updater } from './updater.ts';

function updateEquipments(verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		const { manifest, equipments } = getDataStore().data;
		const keys = Object.keys(Updater.hooks.createInspectorSchema('fileEquipment'));
		for (const [guid, sEquipment] of Object.entries(equipments!)) {
			const meta = manifest!.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const dEquipment = Updater.hooks.createInspectorSchema('fileEquipment');
			for (const key of keys) {
				if (key in sEquipment) {
					dEquipment[key] = sEquipment[key];
				}
			}
			equipments![guid] = dEquipment;
			append(getDataStore().data.manifest!.changes as unknown[], meta);
		}
	}
}

export function initUpdaterEquipments(): void {
	Updater.updateEquipments = updateEquipments;
}
