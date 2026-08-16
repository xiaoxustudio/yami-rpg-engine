import { Data } from '@/data/data-object.ts';
import { Animation } from '@/animation/animation-window.ts';
import { FSP } from '@/file/file-system.ts';
import { Log } from '@/log/log-window.ts';
import { Editor } from './editor.ts';
import { Palette } from '@/palette/palette.ts';
import { Particle } from '@/particle/particle-window.ts';
import { PluginManager } from '@/plugin/plugin.ts';
import { Scene } from '@/scene/scene-window.ts';
import { Sprite } from '@app/engine/sprite/sprite.ts';
import { Title } from '@/title/title-bar.ts';
import { UI } from '@/ui/ui-window.ts';
import { useBrowserStore } from '@app/stores/browser.ts';
import { useSelectorStore } from '@app/stores/selector.ts';

Editor.saveProject = function (this: typeof Editor) {
	const { project } = this;
	if (!project) {
		return;
	}
	try {
		Scene.saveToProject!(project);
		UI.saveToProject(project);
		Animation.saveToProject!(project);
		Particle.saveToProject!(project);
		Palette.saveToProject(project);
		Sprite.saveToProject(project);
		useBrowserStore().saveToProject(
			project as { browser: { view?: number; folders?: string[] } }
		);
		useSelectorStore().saveToProject(project);
		PluginManager.saveToProject!(project);
		Title.saveToProject!(project);

		const json = JSON.stringify(project, null, 2);
		const last = project.code;
		if (json && json !== last) {
			const path = this.config!.project;
			FSP.writeFile!(path, json).catch((error: unknown) => {
				Log.throw!(error);
			});
		}
	} catch (error: unknown) {
		Log.throw!(error);
		return console.error(error);
	}
};

Editor.loadProject = function (this: typeof Editor) {
	const project = this.project!;
	Scene.loadFromProject!(project);
	UI.loadFromProject(project);
	Animation.loadFromProject!(project);
	Particle.loadFromProject!(project);
	Palette.loadFromProject(project);
	Sprite.loadFromProject(project);
	useBrowserStore().loadFromProject(project as { browser: { view: number; folders: string[] } });
	useSelectorStore().loadFromProject(project);
	PluginManager.loadFromProject!(project);
	Title.loadFromProject!(project);
};

Editor.saveManifest = function (this: typeof Editor) {
	return Data.saveManifest!();
};
