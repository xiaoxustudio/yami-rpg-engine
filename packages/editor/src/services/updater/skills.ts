import { getDataStore } from '@app/stores/data';
import { append } from '@app/utils/array';
import { Updater } from './updater.ts';

function updateSkills(verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		const { manifest, skills } = getDataStore().data;
		const keys = Object.keys(Updater.hooks.createInspectorSchema('fileSkill'));
		for (const [guid, sSkill] of Object.entries<any>(skills!)) {
			const meta = manifest!.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const dSkill = Updater.hooks.createInspectorSchema('fileSkill');
			for (const key of keys) {
				if (key in sSkill) {
					dSkill[key] = sSkill[key];
				}
			}
			skills![guid] = dSkill;
			append(getDataStore().data.manifest!.changes as unknown[], meta);
		}
	}
}

export function initUpdaterSkills(): void {
	Updater.updateSkills = updateSkills;
}
