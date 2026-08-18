import { Timer } from '@app/legacy/util/timer.ts';
import { getSelectorInstance } from '@app/stores/selector.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { lazyComponentsReady } from '@app/bootstrap';
import { loadConfigPromise } from '@app/legacy/util/config.ts';
import { registerTool, type ToolInstance } from '@app/legacy/tools/tool-registry';
import { Window } from '@app/legacy/tools/window-object.ts';
import { Variable } from '@app/legacy/variable/variable.ts';
import '../variable/initialize.js';

import { Animation } from '@app/legacy/animation/animation-window.ts';
import { Attribute } from '@app/legacy/attribute/attribute-window.ts';
import { AudioManager } from '@app/legacy/audio/audio-manager.ts';
import { Command } from '@app/legacy/command/command-object.ts';
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
import { Editor } from './editor.ts';
import { EventBus } from '@app/legacy/module/eventbus.ts';
import { SetTileTag } from '@app/legacy/module/global.ts';
import { Particle } from '@app/legacy/particle/particle-window.ts';
import { PluginManager } from '@app/legacy/plugin/plugin.ts';
import { Printer } from '@app/legacy/printer/printer.ts';
import { Scene } from '@app/legacy/scene/scene-window.ts';
import { Home } from '@app/legacy/title/home-page.ts';
import { Menubar } from '@app/legacy/title/menu-bar.ts';
import { Title } from '@app/legacy/title/title-bar.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { ActorGetter } from '@app/legacy/command/actor-accessor-window.ts';
import { AncestorGetter } from '@app/legacy/command/ancestor-accessor-window.ts';
import { AngleGetter } from '@app/legacy/command/angle-accessor-window.ts';
import { ElementGetter } from '@app/legacy/command/element-accessor-window.ts';
import { EquipmentGetter } from '@app/legacy/command/equipment-accessor-window.ts';
import { ItemGetter } from '@app/legacy/command/item-accessor-window.ts';
import { PositionGetter } from '@app/legacy/command/position-accessor-window.ts';
import { RegionGetter } from '@app/legacy/command/region-accessor-window.ts';
import { SkillGetter } from '@app/legacy/command/skill-accessor-window.ts';
import { StateGetter } from '@app/legacy/command/state-accessor-window.ts';
import { TilemapGetter } from '@app/legacy/command/tilemap-accessor-window.ts';
import { TriggerGetter } from '@app/legacy/command/trigger-accessor-window.ts';
import { LightGetter, ObjectGetter } from '@app/legacy/command/preset-accessor-factory.ts';
import { ArrayList } from '@app/legacy/tools/array-window.ts';
import { Color } from '@app/legacy/tools/color-picker-window.ts';
import { ConditionListInterface } from '@app/legacy/tools/condition-list.ts';
import { ImageClip } from '@app/legacy/tools/image-crop-window.ts';
import { Local } from '@app/legacy/tools/localization.ts';
import { PresetElement } from '@app/legacy/tools/preset-element-window.ts';
import { AttributeListInterface } from '@app/legacy/tools/property-list.ts';
import { Rename } from '@app/legacy/tools/rename-window.ts';
import { PresetObject } from '@app/legacy/tools/scene-preset-window.ts';
import { SetKey } from '@app/legacy/tools/set-key-window.ts';
import { SetQuantity } from '@app/legacy/tools/set-number-window.ts';
import { Selection } from '@app/legacy/tools/text-capture.ts';
import { Zoom } from '@app/legacy/tools/zoom-window.ts';
import { UI } from '@app/legacy/ui/ui-window.ts';

interface SingletonShape {
	initialize?: (() => void) | null;
	dependsOn?: string[];
	[k: string]: unknown;
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

Editor.initialize = async function (this: typeof Editor) {
	this.switchHotkey!(false);

	// 等待 AppShell 懒加载的命令/工具弹窗组件挂载完成，保证 initAll 能拿到 DOM
	// 首次冷启动时 145+ 个异步组件编译较慢，8s 超时太短会提前 initAll 导致元素缺失，放宽到 60s
	await Promise.race([
		lazyComponentsReady,
		new Promise((resolve: (val: unknown) => void) => setTimeout(resolve, 60000))
	]);

	try {
		// Selector 为懒加载 Vue 组件（#selector-browser），须等 __lazyComponentsReady__ 挂载完成后再解析
		const Selector = getSelectorInstance();
		Title.initialize!();
		const data = await loadConfigPromise;
		const code = JSON.stringify(data);
		this.config = data ?? {};
		if (this.config) this.checkForEditorUpdates!();
		Object.defineProperty(this.config, 'code', { value: code });

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
			Browser: getBrowserInstance(),
			Selector,
			Printer,
			Color,
			Variable,
			VariableGetter,
			ActorGetter,
			AncestorGetter,
			AngleGetter,
			ElementGetter,
			EquipmentGetter,
			ItemGetter,
			PositionGetter,
			RegionGetter,
			SkillGetter,
			StateGetter,
			TilemapGetter,
			TriggerGetter,
			LightGetter,
			ObjectGetter,
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
		const singletons = singletonMap as unknown as Record<string, SingletonShape>;
		const initNames = Object.keys(singletons).filter(
			(n: string) => singletons[n] != null && typeof singletons[n].initialize === 'function'
		);
		const graph = new Map<string, string[]>(initNames.map((n: string) => [n, [] as string[]]));
		const inDegree = new Map<string, number>(initNames.map((n: string) => [n, 0]));
		for (const name of initNames) {
			const deps = singletons[name].dependsOn ?? [];
			for (const dep of deps) {
				if (!graph.has(dep)) continue;
				graph.get(dep)!.push(name);
				inDegree.set(name, (inDegree.get(name) ?? 0) + 1);
			}
		}
		const queue = initNames.filter((n: string) => inDegree.get(n) === 0);
		while (queue.length) {
			const node = queue.shift()!;
			const singleton = singletons[node];
			try {
				singleton.initialize!.call(singleton);
			} catch (e: unknown) {
				console.warn(`[init] ${node} initialize failed:`, (e as Error)?.message);
				console.warn(`[init] ${node} stack:`, (e as Error)?.stack);
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
					Log.warn!(`初始化循环依赖：${name} 未被初始化`, singletons[name].dependsOn);
				}
				try {
					singletons[name].initialize!.call(singletons[name]);
				} catch (e) {
					console.warn(`[init] ${name} initialize failed (cyclic):`, e);
				}
				initializedSet.add(name);
			}
		}

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
