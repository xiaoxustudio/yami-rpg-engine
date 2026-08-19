import { ipcRenderer } from 'electron';
import { CHANNELS } from '@app/services/ipc/channels.ts';
import { getSelectorInstance } from '@app/stores/selector.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { AudioManager } from '@app/legacy/audio/audio-manager.ts';
import { Project } from '@app/legacy/data/project-settings-window.ts';
import { Directory } from '@app/legacy/file/directory-object.ts';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { Layout } from '@app/engine/layout/layout.ts';
import { Editor } from './editor.ts';
import { WebServer } from '@app/legacy/module/webserver.ts';
import { Printer } from '@app/legacy/printer/printer.ts';
import { Scene } from '@app/legacy/scene/scene-window.ts';

import { UI } from '@app/legacy/ui/ui-window.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';

function close(this: typeof Editor, save = true) {
	Layout.manager.switch(null);
	if (this.state === 'open') {
		this.state = 'closed';
		if (save) {
			this.saveProject!();
			this.saveManifest!();
		}
		this.switchHotkey!(false);
		this.config!.project = '';
		this.project = null;
		Editor.hooks.onWindowSaveDispatch();
		Scene.close!();
		UI.close();
		Directory.close!();
		Inspector.close();
		getBrowserInstance()?.close?.();
		getSelectorInstance()?.close?.();
		Data.close!();
		AudioManager.close!();
		Printer.clearFonts();
		Project.stopTSC();
		Editor.hooks.onTitleChanged();
		GL.textureManager.clear();
		WebServer.stop();
	}
}

function quit(this: typeof Editor) {
	this.saveConfig!();
	this.saveProject!();
	this.saveManifest!();
	WebServer.stop();
	ipcRenderer.send(CHANNELS.on.forceCloseWindow);
}

export function initProjectClose(): void {
	Editor.close = close;
	Editor.quit = quit;
}
