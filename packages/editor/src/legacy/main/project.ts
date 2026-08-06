import { Data } from '@/data/data-object.ts';
import { Animation } from '@/animation/animation-window.ts';
import { FSP } from '@/file/file-system.ts';
import { Log } from '@/log/log-window.ts';
import { Editor } from './editor.ts';
import { Palette } from '@/palette/palette.ts';
import { Particle } from '@/particle/particle-window.ts';
import { PluginManager } from '@/plugin/plugin.ts';
import { Scene } from '@/scene/scene-window.ts';
import { Sprite } from '@/sprite/sprite.ts';
import { Title } from '@/title/title-bar.ts';
import { UI } from '@/ui/ui-window.ts';
import { useBrowserStore } from '@app/stores/browser.ts';
import { useSelectorStore } from '@app/stores/selector.ts';

Editor.saveProject = function (this: any) {
	const { project } = this;
	if (!project) {
		return;
	}
	try {
		Scene.saveToProject!(project);
		(UI.saveToProject as any)(project);
		Animation.saveToProject!(project);
		(Particle.saveToProject as any)(project);
		(Palette.saveToProject as any)(project);
		Sprite.saveToProject(project);
		useBrowserStore().saveToProject(project);
		useSelectorStore().saveToProject(project);
		(PluginManager.saveToProject as any)(project);
		(Title.saveToProject as any)(project);

		const json = JSON.stringify(project, null, 2);
		const last = project.code;
		if (json && json !== last) {
			const path = this.config.project;
			FSP.writeFile!(path, json).catch((error: any) => {
				(Log.throw as any)(error);
			});
		}
	} catch (error: any) {
		(Log.throw as any)(error);
		return console.error(error);
	}
};

Editor.loadProject = function (this: any) {
	const { project } = this;
	Scene.loadFromProject!(project);
	(UI.loadFromProject as any)(project);
	Animation.loadFromProject!(project);
	(Particle.loadFromProject as any)(project);
	(Palette.loadFromProject as any)(project);
	Sprite.loadFromProject(project);
	useBrowserStore().loadFromProject(project);
	useSelectorStore().loadFromProject(project);
	(PluginManager.loadFromProject as any)(project);
	(Title.loadFromProject as any)(project);
};

Editor.saveManifest = function (this: any) {
	return Data.saveManifest!();
};
