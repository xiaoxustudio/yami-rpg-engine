import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Updater } from './updater.ts';

Updater.updateSkills = function (verNum: any) {
	if (verNum < Updater.getVersionNumber('1.0.122')) {
		const skills = Data.skills;
		const keys = Object.keys((Inspector.fileSkill as any).create());
		for (const [guid, sSkill] of Object.entries(skills)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			const dSkill = (Inspector.fileSkill as any).create();
			for (const key of keys) {
				if (key in (sSkill as any)) {
					dSkill[key] = (sSkill as any)[key];
				}
			}
			skills[guid] = dSkill;
			(File.planToSave as any)(meta);
		}
	}
};
