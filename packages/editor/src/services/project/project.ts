import { Data } from '@app/legacy/data/data-object.ts';
import { Animation } from '@app/legacy/animation/animation-window.ts';
import { FSP } from '@app/services/file-system/fs-bridge.ts';
import { Log } from '@app/legacy/log/log-window.ts';
import { Editor } from './editor.ts';
import { Palette } from '@app/legacy/palette/palette.ts';
import { Particle } from '@app/legacy/particle/particle-window.ts';
import { PluginManager } from '@app/legacy/plugin/plugin.ts';
import { Scene } from '@app/legacy/scene/scene-window.ts';
import { Sprite } from '@app/engine/sprite/sprite.ts';
import { Title } from '@app/legacy/title/title-bar.ts';
import { UI } from '@app/legacy/ui/ui-window.ts';
import { useBrowserStore } from '@app/stores/browser.ts';
import { useSelectorStore } from '@app/stores/selector.ts';

function saveProject(this: typeof Editor) {
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
}

function loadProject(this: typeof Editor) {
	const project = this.project!;
	Scene.loadFromProject!(project);
	UI.loadFromProject(project);
	Animation.loadFromProject!(project);
	Particle.loadFromProject!(project);
	Palette.loadFromProject(project);
	Sprite.loadFromProject(project);
	useBrowserStore().loadFromProject(project as { browser: { view: number; folders: string[] } });
	useSelectorStore().loadFromProject(project);
	Editor.hooks.onPluginLoad(project);
	Title.loadFromProject!(project);
}

function saveManifest(this: typeof Editor) {
	return Data.saveManifest!();
}

export function initProjectProject(): void {
	Editor.saveProject = saveProject;
	Editor.loadProject = loadProject;
	Editor.saveManifest = saveManifest;
}
