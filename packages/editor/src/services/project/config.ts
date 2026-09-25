import { GlobalPath, Path } from '@app/utils/config';
import { FSP } from '@app/services/file-system/fs-bridge.ts';
import { getLazyWindow } from '@app/tools/window-registry';
import { Editor } from './editor.ts';
import { getAnimationStore } from '@app/stores/animation.ts';
import { getSceneStore } from '@app/stores/scene.ts';
import { getTitleStore } from '@app/stores/title.ts';
import { useLogStore } from '@app/stores/log.ts';
import { useParticleStore } from '@app/stores/particle.ts';
import { useUIStore } from '@app/stores/ui.ts';

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
		// `colors` 已由本函数的 `config.colors ??= {}` 兜底成对象，但**值仍是不可信的 JSON**：
		// UI 侧契约收 `Record<string, unknown>`（消费方 `safeHex` 自己判类型），所以这里只断言"在"。
		useUIStore().saveToConfig(config as { colors: Record<string, unknown> });
		getAnimationStore().saveToConfig(config);
		useParticleStore().saveToConfig(config as { colors: Record<string, string> });

		const json = JSON.stringify(config, null, 2);
		const last = config.code;
		if (json && json !== last) {
			const path = Path.resolve!(GlobalPath, 'config.json');
			FSP.writeFile!(path, json).catch((error: unknown) => {
				useLogStore().logThrow(error);
			});
		}
	} catch (error: unknown) {
		useLogStore().logThrow(error);
	}
}

function loadConfig(this: typeof Editor) {
	const { config } = this;
	// schema 兜底：旧配置或首次启动可能缺字段，缺失则用默认值 （与 Project/default.json 保持一致），避免下游直取炸
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
		// scriptEditor：脚本编辑器模式与路径
		if (!config.scriptEditor) {
			config.scriptEditor = { mode: 'by-file-extension', path: '' };
		} else {
			config.scriptEditor.mode ??= 'by-file-extension';
			config.scriptEditor.path ??= '';
		}
		if (config.theme === undefined) config.theme = 'dark';
		if (config.language === undefined) config.language = '';
		if (config.project === undefined) config.project = '';
		// recent 必须是数组：旧配置可能存了 null/对象/字符串等非数组值，下游 Editor.updatePath 会调 items.find/remove/unshift，非数组会炸
		if (!Array.isArray(config.recent)) config.recent = [];
		if (config.zoom === undefined) config.zoom = 1;
	}
	getTitleStore().loadFromConfig(config!);
	Layout.loadFromConfig!(config! as LayoutConfigShape);
	getSceneStore().loadFromConfig(config!);
	useUIStore().loadFromConfig(config! as { colors: Record<string, unknown> });
	getAnimationStore().loadFromConfig(config!);
	useParticleStore().loadFromConfig(config! as { colors: Record<string, string> });
}

export function initProjectConfig(): void {
	Editor.saveConfig = saveConfig;
	Editor.loadConfig = loadConfig;
}
