import { File } from '@/file/file-system-core.ts';
import { Directory } from '@/file/directory-object.ts';
import { Editor } from './editor.ts';
import { Updater } from '@/update/updater.ts';

Editor.checkForEditorUpdates = function () {
	const ver1 = Editor.config.version;
	const ver2 = Updater.latestEditorVersion;
	const verNum1 = (Updater.getVersionNumber as any)(ver1);
	const verNum2 = (Updater.getVersionNumber as any)(ver2);
	if (verNum1 < verNum2) {
		Editor.config.version = ver2;
		console.warn(`升级编辑器版本：${ver1} -> ${ver2}`);
	}
};

Editor.checkForProjectUpdates = async function () {
	const ver1 = Editor.project.version;
	const ver2 = Updater.latestProjectVersion;
	const verNum1 = (Updater.getVersionNumber as any)(ver1);
	const verNum2 = (Updater.getVersionNumber as any)(ver2);
	if (verNum1 < verNum2) {
		console.warn(`升级项目版本：${ver1} -> ${ver2}`);
		(Updater.updateProject as any)(verNum1);
		(Updater.updateConfig as any)(verNum1);
		(Updater.updateLocalEvents as any)(verNum1);
		(Updater.updateGlobalEvents as any)(verNum1);
		(Updater.updateActors as any)(verNum1);
		(Updater.updateSkills as any)(verNum1);
		(Updater.updateTriggers as any)(verNum1);
		(Updater.updateItems as any)(verNum1);
		(Updater.updateEquipments as any)(verNum1);
		(Updater.updateStates as any)(verNum1);
		(Updater.updateScenes as any)(verNum1);
		(Updater.updateTilesets as any)(verNum1);
		(Updater.updateElements as any)(verNum1);
		(Updater.updateAnimations as any)(verNum1);
		(Updater.updateParticles as any)(verNum1);
		(Updater.updateTeams as any)(verNum1);
		(Updater.updateToLatest as any)(ver1);

		await (File.save as any)(false);
		Editor.project.version = ver2;

		(Directory.update as any)();
		console.log('项目升级完毕!');
	}
};

Editor.isProjectVersionSupported = function () {
	const ver1 = Editor.project.version;
	const ver2 = Updater.latestProjectVersion;
	const verNum1 = (Updater.getVersionNumber as any)(ver1);
	const verNum2 = (Updater.getVersionNumber as any)(ver2);
	if (verNum1 <= verNum2) {
		return true;
	}
};
