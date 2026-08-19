import { initProjectHotkey } from './hotkey.ts';
import { initProjectOpen } from './open.ts';
import { initProjectClose } from './close.ts';
import { initProjectPath } from './path.ts';
import { initProjectConfig } from './config.ts';
import { initProjectProject } from './project.ts';
import { initProjectVersion } from './version.ts';

export function initEditorService(): void {
	initProjectHotkey();
	initProjectOpen();
	initProjectClose();
	initProjectPath();
	initProjectConfig();
	initProjectProject();
	initProjectVersion();
}
