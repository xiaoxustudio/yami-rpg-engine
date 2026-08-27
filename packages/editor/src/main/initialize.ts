import { Timer } from '@app/utils/timer';
import { lazyComponentsReady } from '@app/bootstrap';
import { loadConfigPromise } from '@app/utils/config';
import { registerTool, type ToolInstance } from '@app/tools/tool-registry';
import { primeWindows } from '@app/tools/window-registry';
import { Window } from '@app/tools/window-object.ts';
import '@app/variable/initialize.ts';

import { Editor } from '@app/services/project/editor.ts';
import { EventBus } from '@app/utils/event-bus.ts';
import { initI18n } from '@app/i18n';

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

	// 等待 AppShell 懒加载的命令/工具弹窗组件挂载完成，保证 initAll 能拿到 DOM
	// 首次冷启动时 145+ 个异步组件编译较慢，8s 超时太短会提前 initAll 导致元素缺失，放宽到 60s
	await Promise.race([
		lazyComponentsReady,
		new Promise((resolve: (val: unknown) => void) => setTimeout(resolve, 60000))
	]);

	try {
		clusterRef = await import('@app/tools/window-cluster');
		await clusterRef.clusterReady;
		primeWindows(clusterRef as unknown as Record<string, unknown>);
		const cluster = clusterRef;
		const { Title, Layout } = cluster;
		Title.initialize!();
		const data = await loadConfigPromise;
		const code = JSON.stringify(data);
		this.config = data ?? {};
		if (this.config) this.checkForEditorUpdates!();
		Object.defineProperty(this.config, 'code', { value: code });
		void initI18n();

		initCore(cluster);
		initEditors(cluster);
		initTools(cluster);

		registerTool('ArrayList', cluster.ArrayList as unknown as ToolInstance);
		registerTool('Color', cluster.Color as unknown as ToolInstance);
		registerTool('ImageClip', cluster.ImageClip as unknown as ToolInstance);
		registerTool('Rename', cluster.Rename as unknown as ToolInstance);
		registerTool('SetKey', cluster.SetKey as unknown as ToolInstance);
		registerTool('SetQuantity', cluster.SetQuantity as unknown as ToolInstance);
		registerTool('Zoom', cluster.Zoom as unknown as ToolInstance);
		registerTool('PresetObject', cluster.PresetObject as unknown as ToolInstance);
		registerTool('PresetElement', cluster.PresetElement as unknown as ToolInstance);
		registerTool('Selection', cluster.Selection as unknown as ToolInstance);

		this.loadConfig!();
		Layout.manager.switch('home');
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
	EventBus.emit('editor_loaded');
};
