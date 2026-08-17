import { Data } from '@app/legacy/data/data-object.ts';
import { File } from '@app/legacy/file/file-system-core.ts';
import { Updater } from './updater.ts';

Updater.updateSkills = function (verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		const skills = Data.skills;
		const keys = Object.keys(Updater.hooks.createInspectorSchema('fileSkill'));
		for (const [guid, sSkill] of Object.entries<any>(skills)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const dSkill = Updater.hooks.createInspectorSchema('fileSkill');
			for (const key of keys) {
				if (key in sSkill) {
					dSkill[key] = sSkill[key];
				}
			}
			skills[guid] = dSkill;
			File.planToSave!(meta);
		}
	}
};
