import { Path } from '@app/legacy/util/config.ts';
import { File } from '@app/legacy/file/file-system-core.ts';
import { FS } from '@app/services/file-system/fs-bridge.ts';
import { Updater } from './updater.ts';

Updater.backupProject = function () {
	const projectPath = File.root;
	const folderName = Path.basename(projectPath);
	const backupPath = Path.resolve(projectPath, `../${folderName}.bak`);
	FS.cpSync(projectPath, backupPath, { recursive: true });
};
