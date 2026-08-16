import { ipcRenderer } from 'electron';
import { getSelectorInstance } from '@app/stores/selector.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { Window } from '@/tools/window-object.ts';
import { Data } from '@/data/data-object.ts';
import { AudioManager } from '@/audio/audio-manager.ts';
import { Project } from '@/data/project-settings-window.ts';
import { Directory } from '@/file/directory-object.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Layout } from '@app/engine/layout/layout.ts';
import { Editor } from './editor.ts';
import { WebServer } from '@/module/webserver.ts';
import { Printer } from '@/printer/printer.ts';
import { Scene } from '@/scene/scene-window.ts';
import { Title } from '@/title/title-bar.ts';

import { UI } from '@/ui/ui-window.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';

Editor.close = function (this: typeof Editor, save = true) {
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
		Window.closeAll!();
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
		Title.updateTitleName!();
		GL.textureManager.clear();
		WebServer.stop();
	}
};

Editor.quit = function (this: typeof Editor) {
	this.saveConfig!();
	this.saveProject!();
	this.saveManifest!();
	WebServer.stop();
	ipcRenderer.send('force-close-window');
};
