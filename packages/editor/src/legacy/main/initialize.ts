import { Timer } from '@app/utils/timer';
import { lazyComponentsReady } from '@app/bootstrap';
import { loadConfigPromise } from '@app/utils/config';
import { registerTool, type ToolInstance } from '@app/legacy/tools/tool-registry';
import { Window } from '@app/legacy/tools/window-object.ts';
import '../variable/initialize.js';

import { Attribute } from '@app/legacy/attribute/attribute-window.ts';
import { AudioManager } from '@app/legacy/audio/audio-manager.ts';
import { Command } from '@app/commands/command-object.ts';
import { CustomCommand } from '@app/legacy/command/custom-command-window.ts';
import { EventEditor } from '@app/legacy/command/event-editor.ts';
import { Project } from '@app/legacy/data/project-settings-window.ts';
import { Team } from '@app/legacy/data/team-window.ts';
import { Easing } from '@app/legacy/data/transition-window.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';
import { Directory } from '@app/legacy/file/directory-object.ts';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { Layout } from '@app/engine/layout/layout.ts';
import { Localization } from '@app/legacy/local/local-window.ts';
import { Log } from '@app/legacy/log/log-window.ts';
import { Reference } from '@app/legacy/log/related-references.ts';
import { UpdateLog } from '@app/legacy/log/update-log-window.ts';
import { Editor } from '@app/services/project/editor.ts';
import { EventBus } from '@app/legacy/module/eventbus.ts';
import { SetTileTag } from '@app/legacy/module/global.ts';
import { initI18n } from '@app/i18n';
import { PluginManager } from '@app/legacy/plugin/plugin.ts';
import { Printer } from '@app/legacy/printer/printer.ts';
import { Home } from '@app/legacy/title/home-page.ts';
import { Menubar } from '@app/legacy/title/menu-bar.ts';
import { Title } from '@app/legacy/title/title-bar.ts';
import { ArrayList } from '@app/legacy/tools/array-window.ts';
import { Color } from '@app/legacy/tools/color-picker-window.ts';
import { ConditionListInterface } from '@app/legacy/tools/condition-list.ts';
import { ImageClip } from '@app/legacy/tools/image-crop-window.ts';
import { PresetElement } from '@app/legacy/tools/preset-element-window.ts';
import { AttributeListInterface } from '@app/legacy/tools/property-list.ts';
import { Rename } from '@app/legacy/tools/rename-window.ts';
import { PresetObject } from '@app/legacy/tools/scene-preset-window.ts';
import { SetKey } from '@app/legacy/tools/set-key-window.ts';
import { SetQuantity } from '@app/legacy/tools/set-number-window.ts';
import { Selection } from '@app/legacy/tools/text-capture.ts';
import { Zoom } from '@app/legacy/tools/zoom-window.ts';

interface SingletonShape {
	initialize?: (() => void) | null;
}

registerTool('ArrayList', ArrayList as unknown as ToolInstance);
registerTool('Color', Color as unknown as ToolInstance);
registerTool('ImageClip', ImageClip as unknown as ToolInstance);
registerTool('Rename', Rename as unknown as ToolInstance);
registerTool('SetKey', SetKey as unknown as ToolInstance);
registerTool('SetQuantity', SetQuantity as unknown as ToolInstance);
registerTool('Zoom', Zoom as unknown as ToolInstance);
registerTool('PresetObject', PresetObject as unknown as ToolInstance);
registerTool('PresetElement', PresetElement as unknown as ToolInstance);
registerTool('Selection', Selection as unknown as ToolInstance);

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

function initCore(): void {
	initSingleton('AudioManager', AudioManager);
	initSingleton('Menubar', Menubar);
	initSingleton('Layout', Layout);
	initSingleton('Home', Home);
	initSingleton('Timer', Timer);
	initSingleton('Window', Window);
}

function initEditors(): void {
	initSingleton('EventEditor', EventEditor);
	initSingleton('Inspector', Inspector);
	initSingleton('Command', Command);
	initSingleton('Project', Project);
	initSingleton('Easing', Easing);
	initSingleton('Team', Team);
	initSingleton('PluginManager', PluginManager);
	initSingleton('CustomCommand', CustomCommand);
	initSingleton('Log', Log);
	initSingleton('UpdateLog', UpdateLog);
	initSingleton('Reference', Reference);
	initSingleton('Directory', Directory);
	initSingleton('Printer', Printer);
}

function initTools(): void {
	initSingleton('Color', Color);
	initSingleton('Attribute', Attribute);
	initSingleton('Enum', Enum);
	initSingleton('Localization', Localization);
	initSingleton('ImageClip', ImageClip);
	initSingleton('Selection', Selection);
	initSingleton('SetQuantity', SetQuantity);
	initSingleton('SetTileTag', SetTileTag);
	initSingleton('PresetObject', PresetObject);
	initSingleton('PresetElement', PresetElement);
	initSingleton('ArrayList', ArrayList);
	initSingleton('AttributeListInterface', AttributeListInterface);
	initSingleton('ConditionListInterface', ConditionListInterface);
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
		Title.initialize!();
		const data = await loadConfigPromise;
		const code = JSON.stringify(data);
		this.config = data ?? {};
		if (this.config) this.checkForEditorUpdates!();
		Object.defineProperty(this.config, 'code', { value: code });
		void initI18n();

		initCore();
		initEditors();
		initTools();

		this.loadConfig!();
		Layout.manager.switch('home');
	} catch (error: unknown) {
		Log.throw!(error);
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
