import { GlobalPath, Path } from '@app/utils/config';
import { FSP } from '@app/services/file-system/fs-bridge.ts';
import { getLazyWindow } from '@app/tools/window-registry';
import { Editor } from './editor.ts';
import { getAnimationStore } from '@app/stores/animation.ts';
import { getSceneStore } from '@app/stores/scene.ts';
import { getTitleStore } from '@app/stores/title.ts';
import { getLogStore } from '@app/stores/log.ts';
import { getParticleStore } from '@app/stores/particle.ts';
import { getUIStore } from '@app/stores/ui.ts';

const Layout = getLazyWindow('layout', () =>
	import('@app/tools/window-cluster').then((m) => m.Layout)
);

type LayoutConfigShape = Parameters<NonNullable<typeof Layout.saveToConfig>>[0];

function saveConfig(this: typeof Editor) {
	const { config } = this;
	if (!config) {
		return;
	}
	try {
		getTitleStore().saveToConfig(config);
		Layout.saveToConfig!(config as LayoutConfigShape);
		getSceneStore().saveToConfig(config);
		getUIStore().saveToConfig(config as { colors: Record<string, unknown> });
		getAnimationStore().saveToConfig(config);
		getParticleStore().saveToConfig(config as { colors: Record<string, string> });

		const json = JSON.stringify(config, null, 2);
		const last = config.code;
		if (json && json !== last) {
			const path = Path.resolve!(GlobalPath, 'config.json');
			FSP.writeFile!(path, json).catch((error: unknown) => {
				getLogStore().logThrow(error);
			});
		}
	} catch (error: unknown) {
		getLogStore().logThrow(error);
	}
}

function loadConfig(this: typeof Editor) {
	const { config } = this;
	if (config) {
		const colors = (config.colors ??= {});
		const colorDefaults: Record<string, string> = {
			sceneBackground: '00000000',
			uiBackground: '00000000',
			uiForeground: '000000ff',
			animationBackground: '203660ff',
			particleBackground: '203660ff'
		};
		for (const key in colorDefaults) {
			if ((colors as Record<string, string>)[key] === undefined)
				(colors as Record<string, string>)[key] = colorDefaults[key];
		}
		const dialogs = (config.dialogs ??= {});
		const dialogDefaults: Record<string, string> = {
			new: '',
			open: '',
			deploy: '',
			import: '',
			export: ''
		};
		for (const key in dialogDefaults) {
			if ((dialogs as Record<string, string>)[key] === undefined)
				(dialogs as Record<string, string>)[key] = dialogDefaults[key];
		}
		if (!config.scriptEditor) {
			config.scriptEditor = { mode: 'by-file-extension', path: '' };
		} else {
			config.scriptEditor.mode ??= 'by-file-extension';
			config.scriptEditor.path ??= '';
		}
		if (config.theme === undefined) config.theme = 'dark';
		if (config.language === undefined) config.language = '';
		if (config.project === undefined) config.project = '';
		if (!Array.isArray(config.recent)) config.recent = [];
		if (config.zoom === undefined) config.zoom = 1;
	}
	getTitleStore().loadFromConfig(config!);
	Layout.loadFromConfig!(config! as LayoutConfigShape);
	getSceneStore().loadFromConfig(config!);
	getUIStore().loadFromConfig(config! as { colors: Record<string, unknown> });
	getAnimationStore().loadFromConfig(config!);
	getParticleStore().loadFromConfig(config! as { colors: Record<string, string> });
}

export function initProjectConfig(): void {
	Editor.saveConfig = saveConfig;
	Editor.loadConfig = loadConfig;
}
