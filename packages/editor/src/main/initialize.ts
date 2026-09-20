import { Timer } from '@app/utils/timer';
import { lazyComponentsReady } from '@app/bootstrap';
import { loadConfigPromise } from '@app/utils/config';
import { registerTool, type ToolInstance } from '@app/tools/tool-registry';
import { primeWindows } from '@app/tools/window-registry';
import { Window } from '@app/tools/window-object.ts';
import '@app/variable/initialize.ts';

import { Editor } from '@app/services/project/editor.ts';
import { EventBus } from '@app/utils/event-bus.ts';
import { initI18n, loadI18n } from '@app/i18n';

type ClusterShape = typeof import('@app/tools/window-cluster');

interface SingletonShape {
	initialize?: (() => void) | null;
}

let clusterRef: ClusterShape | null = null;

const initializedSet = new Set<string>();

function initSingleton(name: string, singleton: unknown): void {
	if (initializedSet.has(name)) return;
	initializedSet.add(name);
	const shape = singleton as SingletonShape;
	if (!singleton || typeof shape.initialize !== 'function') {
		return;
	}
	try {
		shape.initialize.call(singleton);
	} catch (e: unknown) {
		console.warn(`[init] ${name} initialize failed:`, (e as Error)?.message);
		console.warn(`[init] ${name} stack:`, (e as Error)?.stack);
	}
}

function initCore(cluster: ClusterShape): void {
	initSingleton('AudioManager', cluster.AudioManager);
	initSingleton('Menubar', cluster.Menubar);
	initSingleton('Layout', cluster.Layout);
	initSingleton('Home', cluster.Home);
	initSingleton('Timer', Timer);
	initSingleton('Window', Window);
}

function initEditors(cluster: ClusterShape): void {
	initSingleton('EventEditor', cluster.EventEditor);
	initSingleton('Inspector', cluster.Inspector);
	initSingleton('Command', cluster.Command);
	initSingleton('Project', cluster.Project);
	initSingleton('Easing', cluster.Easing);
	initSingleton('Team', cluster.Team);
	initSingleton('PluginManager', cluster.PluginManager);
	initSingleton('CustomCommand', cluster.CustomCommand);
	initSingleton('Log', cluster.Log);
	initSingleton('UpdateLog', cluster.UpdateLog);
	initSingleton('Reference', cluster.Reference);
	initSingleton('Directory', cluster.Directory);
	initSingleton('Printer', cluster.Printer);
}

function initTools(cluster: ClusterShape): void {
	initSingleton('Color', cluster.Color);
	initSingleton('Attribute', cluster.Attribute);
	initSingleton('Enum', cluster.Enum);
	initSingleton('Localization', cluster.Localization);
	initSingleton('ImageClip', cluster.ImageClip);
	initSingleton('Selection', cluster.Selection);
	initSingleton('SetQuantity', cluster.SetQuantity);
	initSingleton('SetTileTag', cluster.SetTileTag);
	initSingleton('PresetObject', cluster.PresetObject);
	initSingleton('PresetElement', cluster.PresetElement);
	initSingleton('ArrayList', cluster.ArrayList);
	initSingleton('AttributeListInterface', cluster.AttributeListInterface);
	initSingleton('ConditionListInterface', cluster.ConditionListInterface);
}

Editor.initialize = async function (this: typeof Editor) {
	this.switchHotkey!(false);

	try {
		const data = await loadConfigPromise;
		const code = JSON.stringify(data);
		this.config = data ?? {};
		Object.defineProperty(this.config, 'code', { value: code });
		// 尽早加载语言（与窗口簇加载并行），使异步组件挂载时语言已就绪，避免本地化缺失
		await initI18n().catch(() => undefined);

		clusterRef = await import('@app/tools/window-cluster');
		await clusterRef.clusterReady;
		primeWindows(clusterRef as Record<string, unknown>);
		const cluster = clusterRef;
		const { Layout } = cluster;
		if (this.config) this.checkForEditorUpdates!();

		// 核心布局先就绪并立即显示 Home，不等待 145+ 个命令/工具弹窗组件挂载
		initCore(cluster);
		this.loadConfig!();
		Layout.manager.switch('home');

		// 后台：等待弹窗组件挂载后，再初始化标题栏事件、编辑器与工具
		void Promise.resolve()
			.then(() =>
				Promise.race([
					lazyComponentsReady,
					new Promise((resolve: (val: unknown) => void) => setTimeout(resolve, 60000))
				])
			)
			.then(async () => {
				// 组件已挂载，重放本地化（首次 initI18n 在组件挂载前，延后窗口错过 localize）
				await loadI18n(Editor.config?.language ?? '').catch(() => undefined);
				cluster.Title.initialize!();
				initEditors(cluster);
				initTools(cluster);

				registerTool('ArrayList', cluster.ArrayList as ToolInstance);
				registerTool('Color', cluster.Color as ToolInstance);
				registerTool('ImageClip', cluster.ImageClip as ToolInstance);
				registerTool('Rename', cluster.Rename as ToolInstance);
				registerTool('SetKey', cluster.SetKey as ToolInstance);
				registerTool('SetQuantity', cluster.SetQuantity as ToolInstance);
				registerTool('Zoom', cluster.Zoom as ToolInstance);
				registerTool('PresetObject', cluster.PresetObject as ToolInstance);
				registerTool('PresetElement', cluster.PresetElement as ToolInstance);
				registerTool('Selection', cluster.Selection as ToolInstance);

				EventBus.emit('editor_loaded');
			})
			.catch((error: unknown) => {
				console.error('[init] editor initialize failed:', error);
			});
	} catch (error: unknown) {
		clusterRef?.Log?.throw?.(error);
		Window.confirm!(
			{
				message: `Failed to initialize\n${(error as Error).message}`,
				close: () => {
					this.config = null;
					this.quit!();
				}
			},
			[
				{
					label: 'Confirm'
				}
			]
		);
	}
};
