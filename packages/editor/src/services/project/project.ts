import { Data } from '@app/data/data-object.ts';
import { FSP } from '@app/services/file-system/fs-bridge.ts';
import { Editor } from './editor.ts';
import { Sprite } from '@app/engine/sprite/sprite.ts';
import { getAnimationStore } from '@app/stores/animation.ts';
import { getPaletteStore } from '@app/stores/palette.ts';
import { getSceneStore } from '@app/stores/scene.ts';
import { getTitleStore } from '@app/stores/title.ts';
import { useBrowserStore } from '@app/stores/browser.ts';
import { useLogStore } from '@app/stores/log.ts';
import { useParticleStore } from '@app/stores/particle.ts';
import { usePluginStore } from '@app/stores/plugin.ts';
import { useSelectorStore } from '@app/stores/selector.ts';
import { useUIStore } from '@app/stores/ui.ts';

function saveProject(this: typeof Editor) {
	const { project } = this;
	if (!project) {
		return;
	}
	try {
		getSceneStore().saveToProject(project);
		useUIStore().saveToProject(project as { ui: { zoom?: number }; uiPrefabs?: string[] });
		getAnimationStore().saveToProject(project);
		useParticleStore().saveToProject(project);
		getPaletteStore().saveToProject(project);
		Sprite.saveToProject(project);
		useBrowserStore().saveToProject(
			project as { browser: { view?: number; folders?: string[] } }
		);
		useSelectorStore().saveToProject(project);
		usePluginStore().saveToProject(project);
		getTitleStore().saveToProject(project);

		const json = JSON.stringify(project, null, 2);
		const last = project.code;
		if (json && json !== last) {
			const path = this.config!.project;
			FSP.writeFile!(path, json).catch((error: unknown) => {
				useLogStore().logThrow(error);
			});
		}
	} catch (error: unknown) {
		useLogStore().logThrow(error);
		return console.error(error);
	}
}

function loadProject(this: typeof Editor) {
	const project = this.project!;
	getSceneStore().loadFromProject(project);
	useUIStore().loadFromProject(project as { ui: { zoom: number } });
	getAnimationStore().loadFromProject(project);
	useParticleStore().loadFromProject(project);
	getPaletteStore().loadFromProject(project);
	Sprite.loadFromProject(project);
	useBrowserStore().loadFromProject(project as { browser: { view: number; folders: string[] } });
	useSelectorStore().loadFromProject(project);
	Editor.hooks.onPluginLoad(project);
	getTitleStore().loadFromProject(project);
}

function saveManifest(this: typeof Editor) {
	return Data.saveManifest!();
}

export function initProjectProject(): void {
	Editor.saveProject = saveProject;
	Editor.loadProject = loadProject;
	Editor.saveManifest = saveManifest;
}
