import { ipcRenderer } from 'electron';
import { getSelectorInstance } from '@app/stores/selector.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { Window } from '@/tools/window-object.ts';
import { Data } from '@/data/data-object.ts';
import { AudioManager } from '@/audio/audio-manager.ts';
import { Project } from '@/data/project-settings-window.ts';
import { Directory } from '@/file/directory-object.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Layout } from '@/layout/layout.ts';
import { Editor } from './editor.ts';
import { WebServer } from '@/module/webserver.ts';
import { Printer } from '@/printer/printer.ts';
import { Scene } from '@/scene/scene-window.ts';
import { Title } from '@/title/title-bar.ts';

import { UI } from '@/ui/ui-window.ts';
import { GL } from '@/webgl/webgl-init.ts';

Editor.close = function (this: any, save = true) {
	(Layout.manager as any).switch(null);
	if (this.state === 'open') {
		this.state = 'closed';
		if (save) {
			this.saveProject();
			this.saveManifest();
		}
		this.switchHotkey(false);
		this.config.project = '';
		this.project = null;
		(Window.closeAll as any)();
		Scene.close!();
		(UI.close as any)();
		(Directory.close as any)();
		(Inspector.close as any)();
		getBrowserInstance()?.close?.();
		getSelectorInstance()?.close?.();
		Data.close!();
		(AudioManager.close as any)();
		Printer.clearFonts();
		(Project.stopTSC as any)();
		(Title.updateTitleName as any)();
		GL.textureManager.clear();
		WebServer.stop();
	}
};

Editor.quit = function (this: any) {
	this.saveConfig();
	this.saveProject();
	this.saveManifest();
	WebServer.stop();
	ipcRenderer.send('force-close-window');
};
