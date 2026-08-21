import { ipcRenderer } from 'electron';
import { CHANNELS } from '@app/services/ipc/channels.ts';
import { getAudioStore } from '@app/stores/audio.ts';
import { getSelectorInstance } from '@app/stores/selector.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { getInspectorStore } from '@app/stores/inspector.ts';
import { getProjectStore } from '@app/stores/project.ts';
import { getUIStore } from '@app/stores/ui.ts';
import { Data } from '@app/data/data-object.ts';
import { getDirectoryTree } from '@app/services/file-system/directory-tree.ts';
import { Layout } from '@app/engine/layout/layout.ts';
import { Editor } from './editor.ts';
import { WebServer } from '@app/services/ipc/webserver.ts';
import { Printer } from '@app/printer/printer.ts';
import { Scene } from '@app/scene/scene-window.ts';
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
		getUIStore().close();
		getDirectoryTree()?.close();
		getInspectorStore().close();
		getBrowserInstance()?.close?.();
		getSelectorInstance()?.close?.();
		Data.close!();
		getAudioStore().close();
		Printer.clearFonts();
		getProjectStore().stopTSC();
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
