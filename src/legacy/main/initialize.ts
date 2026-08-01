import { Timer } from '@/util/timer.ts';
import { Variable } from '@/variable/variable.ts';
import '../variable/initialize.js';
import '@/browser/browser-bridge.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Attribute } from '@/attribute/attribute-window.ts';
import { AudioManager } from '@/audio/audio-manager.ts';
import { Command } from '@/command/command-object.ts';
import { CustomCommand } from '@/command/custom-command-window.ts';
import { EventEditor } from '@/command/event-editor.ts';
import { Project } from '@/data/project-settings-window.ts';
import { Team } from '@/data/team-window.ts';
import { Easing } from '@/data/transition-window.ts';
import { Enum } from '@/enum/enum-window.ts';
import { Directory } from '@/file/directory-object.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Layout } from '@/layout/layout.ts';
import { Localization } from '@/local/local-window.ts';
import { Log } from '@/log/log-window.ts';
import { Reference } from '@/log/related-references.ts';
import { UpdateLog } from '@/log/update-log-window.ts';
import { Editor } from './editor.ts';
import { EventBus } from '@/module/eventbus.ts';
import { SetTileTag } from '@/module/global.ts';
import { Particle } from '@/particle/particle-window.ts';
import { PluginManager } from '@/plugin/plugin.ts';
import { Printer } from '@/printer/printer.ts';
import { Scene } from '@/scene/scene-window.ts';
import { Home } from '@/title/home-page.ts';
import { Menubar } from '@/title/menu-bar.ts';
import { Title } from '@/title/title-bar.ts';
import { ArrayList } from '@/tools/array-window.ts';
import { Color } from '@/tools/color-picker-window.ts';
import { ConditionListInterface } from '@/tools/condition-list.ts';
import { ImageClip } from '@/tools/image-crop-window.ts';
import { Local } from '@/tools/localization.ts';
import { PresetElement } from '@/tools/preset-element-window.ts';
import { AttributeListInterface } from '@/tools/property-list.ts';
import { Rename } from '@/tools/rename-window.ts';
import { PresetObject } from '@/tools/scene-preset-window.ts';
import { SetKey } from '@/tools/set-key-window.ts';
import { SetQuantity } from '@/tools/set-number-window.ts';
import { Selection } from '@/tools/text-capture.ts';
import { Window } from '@/tools/window-object.ts';
import { Zoom } from '@/tools/zoom-window.ts';
import { UI } from '@/ui/ui-window.ts';

Object.assign(window as any, {
	Timer,
	Variable,
	Animation,
	Attribute,
	AudioManager,
	Command,
	CustomCommand,
	EventEditor,
	Project,
	Team,
	Easing,
	Enum,
	Directory,
	Localization,
	Log,
	Reference,
	UpdateLog,
	SetTileTag,
	Particle,
	PluginManager,
	Printer,
	Scene,
	Home,
	Menubar,
	Title,
	ArrayList,
	Color,
	ConditionListInterface,
	ImageClip,
	Local,
	PresetElement,
	AttributeListInterface,
	Rename,
	PresetObject,
	SetKey,
	SetQuantity,
	Selection,
	Window,
	Zoom,
	UI
});

Editor.initialize = async function () {
	this.switchHotkey(false);

	// 等待 AppShell 懒加载的命令/工具弹窗组件挂载完成，保证 initAll 能拿到 DOM
	await Promise.race([
		(window as any).__lazyComponentsReady__ ?? Promise.resolve(),
		new Promise((resolve) => setTimeout(resolve, 8000))
	]);

	try {
		// Selector 为懒加载 Vue 组件（#selector-browser），须等 __lazyComponentsReady__ 挂载完成后再解析
		const Selector = (window as any).Selector;
		(Title.initialize as any)();
		const data = await (window as any).config;
		const code = JSON.stringify(data);
		this.config = data;
		this.checkForEditorUpdates();
		Object.defineProperty(this.config, 'code', { value: code });
		delete (window as any).config;

		const initializedSet = new Set();
		const singletonMap = {
			Local,
			AudioManager,
			Menubar,
			Home,
			Layout,
			Timer,
			Scene,
			UI,
			Animation,
			Particle,
			Window,
			EventEditor,
			Inspector,
			Command,
			Project,
			Easing,
			Team,
			PluginManager,
			CustomCommand,
			Log,
			UpdateLog,
			Reference,
			Directory,
			Browser: (window as any).Browser,
			Selector,
			Printer,
			Color,
			Variable,
			Attribute,
			Enum,
			Localization,
			ImageClip,
			Selection,
			Zoom,
			Rename,
			SetKey,
			SetQuantity,
			SetTileTag,
			PresetObject,
			PresetElement,
			ArrayList,
			AttributeListInterface,
			ConditionListInterface
		};
		const singletons = singletonMap as Record<string, any>;
		const initNames = Object.keys(singletons).filter(
			(n) => singletons[n] != null && typeof singletons[n].initialize === 'function'
		);
		const graph = new Map<string, string[]>(initNames.map((n) => [n, [] as string[]]));
		const inDegree = new Map<string, number>(initNames.map((n) => [n, 0]));
		for (const name of initNames) {
			const deps = singletons[name].dependsOn ?? [];
			for (const dep of deps) {
				if (!graph.has(dep)) continue;
				graph.get(dep)!.push(name);
				inDegree.set(name, (inDegree.get(name) ?? 0) + 1);
			}
		}
		const queue = initNames.filter((n) => inDegree.get(n) === 0);
		while (queue.length) {
			const node = queue.shift()!;
			const singleton = singletons[node];
			try {
				singleton.initialize.call(singleton);
			} catch (e: any) {
				console.warn(`[init] ${node} initialize failed:`, e?.message);
				console.warn(`[init] ${node} stack:`, e?.stack);
			}
			initializedSet.add(node);
			for (const next of graph.get(node)!) {
				inDegree.set(next, (inDegree.get(next) ?? 0) - 1);
				if (inDegree.get(next) === 0) queue.push(next);
			}
		}
		for (const name of initNames) {
			if (!initializedSet.has(name)) {
				if (typeof Log !== 'undefined' && Log.warn) {
					Log.warn(`初始化循环依赖：${name} 未被初始化`, singletons[name].dependsOn);
				}
				try {
					singletons[name].initialize.call(singletons[name]);
				} catch (e) {
					console.warn(`[init] ${name} initialize failed (cyclic):`, e);
				}
				initializedSet.add(name);
			}
		}

		this.loadConfig();
		(Layout.manager as any).switch('home');
	} catch (error: any) {
		(Log.throw as any)(error);
		(Window.confirm as any)(
			{
				message: `Failed to initialize\n${error.message}`,
				close: () => {
					this.config = null;
					this.quit();
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
