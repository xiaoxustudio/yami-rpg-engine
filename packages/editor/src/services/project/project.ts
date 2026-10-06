import { Data } from '@app/data/data-object.ts';
import { FSP } from '@app/services/file-system/fs-bridge.ts';
import { Editor } from './editor.ts';
import { getLazyWindow } from '@app/tools/window-registry';
import { getAnimationStore } from '@app/stores/animation.ts';
import { getPaletteStore } from '@app/stores/palette.ts';
import { getSceneStore } from '@app/stores/scene.ts';
import { getTitleStore } from '@app/stores/title.ts';
import { getBrowserStore } from '@app/stores/browser.ts';
import { getLogStore } from '@app/stores/log.ts';
import { getParticleStore } from '@app/stores/particle.ts';
import { getPluginStore } from '@app/stores/plugin.ts';
import { getSelectorStore } from '@app/stores/selector.ts';
import { getUIStore } from '@app/stores/ui.ts';

const Sprite = getLazyWindow('sprite', () =>
	import('@app/tools/window-cluster').then((m) => m.Sprite)
);

function saveProject(this: typeof Editor) {
	const { project } = this;
	if (!project) {
		return;
	}
	try {
		getSceneStore().saveToProject(project);
		getUIStore().saveToProject(project as { ui: { zoom?: number }; uiPrefabs?: string[] });
		getAnimationStore().saveToProject(project);
		getParticleStore().saveToProject(project);
		getPaletteStore().saveToProject(project);
		Sprite.saveToProject(project);
		getBrowserStore().saveToProject(
			project as { browser: { view?: number; folders?: string[] } }
		);
		getSelectorStore().saveToProject(project);
		getPluginStore().saveToProject(project);
		getTitleStore().saveToProject(project);

		const json = JSON.stringify(project, null, 2);
		const last = project.code;
		if (json && json !== last) {
			// `config.project` 在「已打开工程」这条路径上必然有值（本函数开头已按 `this.project` 早退），
			// `!` 只是把这条既有不变式写明；`FSP.writeFile` 现在有签名，不能再靠 `any` 蒙过。
			const path = this.config!.project!;
			FSP.writeFile(path, json).catch((error: unknown) => {
				getLogStore().logThrow(error);
			});
		}
	} catch (error: unknown) {
		getLogStore().logThrow(error);
		return console.error(error);
	}
}

function loadProject(this: typeof Editor) {
	const project = this.project!;
	getSceneStore().loadFromProject(project);
	getUIStore().loadFromProject(project as { ui: { zoom: number } });
	getAnimationStore().loadFromProject(project);
	getParticleStore().loadFromProject(project);
	getPaletteStore().loadFromProject(project);
	Sprite.loadFromProject(project);
	getBrowserStore().loadFromProject(project as { browser: { view: number; folders: string[] } });
	getSelectorStore().loadFromProject(project);
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
