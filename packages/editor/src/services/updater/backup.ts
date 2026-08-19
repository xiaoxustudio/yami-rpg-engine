import { Path } from '@app/utils/config';
import { File } from '@app/legacy/file/file-system-core.ts';
import { FS } from '@app/services/file-system/fs-bridge.ts';
import { Updater } from './updater.ts';

function backupProject() {
	const projectPath = File.root;
	const folderName = Path.basename(projectPath);
	const backupPath = Path.resolve(projectPath, `../${folderName}.bak`);
	FS.cpSync(projectPath, backupPath, { recursive: true });
}

export function initUpdaterBackup(): void {
	Updater.backupProject = backupProject;
}
