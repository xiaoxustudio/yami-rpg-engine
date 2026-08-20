import { Path } from '@app/utils/config';
import { FS } from '@app/services/file-system/fs-bridge.ts';
import { Editor } from '@app/services/project/editor.ts';
import { Updater } from './updater.ts';

function backupProject() {
	const projectPath = Path.dirname!(Editor.config!.project!);
	const folderName = Path.basename(projectPath);
	const backupPath = Path.resolve(projectPath, `../${folderName}.bak`);
	FS.cpSync(projectPath, backupPath, { recursive: true });
}

export function initUpdaterBackup(): void {
	Updater.backupProject = backupProject;
}
