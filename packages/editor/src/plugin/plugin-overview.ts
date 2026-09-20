import { PluginManager } from './plugin.ts';
import { Menu } from '@app/components/menu-list.ts';
import { TreeList } from '@app/components/tree-list.ts';
import type { TreeListElement } from '@app/components/tree-list.ts';
import { Data } from '@app/data/data-object.ts';
import { File } from '@app/file/file-system-core.ts';
import { Window } from '@app/tools/window-object.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { ctrl } from '@app/utils/event-accessors';
import { show, hide } from '@app/utils/element-utils.ts';
import { clone as deepClone } from '@app/utils/object';

PluginManager.overviewPointerdown = (function IIFE() {
	const once = { once: true };
	const pointerup = (event: PointerEvent) => {
		if (PluginManager.overview!.contains(event.target as Node)) {
			Menu.popup(
				{
					x: event.clientX,
					y: event.clientY
				},
				[
					{
						label: t('menuPluginOverview.detail'),
						accelerator: ctrl('D'),
						checked: PluginManager.detailed,
						click: () => {
							PluginManager.switchOverviewMode!();
						}
					}
				]
			);
		}
	};
	return function (this: typeof PluginManager, event: PointerEvent) {
		switch (event.button) {
			case 2:
				window.addEventListener('pointerup', pointerup, once);
				break;
		}
	};
})() as ((...args: unknown[]) => void) | null;

PluginManager.parameterPaneUpdate = function (this: TreeListElement, _event: Event) {
	if (this.wraps.length !== 0) {
		show(this);
	} else {
		hide(this);
	}
} as ((...args: unknown[]) => void) | null;

PluginManager.confirm = function (this: typeof PluginManager, _event: Event) {
	this.apply!();
	Window.close!('plugin');
}.bind(PluginManager) as ((...args: unknown[]) => void) | null;

PluginManager.apply = function (this: typeof PluginManager, event: Event) {
	if (this.changed) {
		this.changed = false;

		let plugins = this.data;
		if (event instanceof Event) {
			plugins = deepClone(plugins);
		} else {
			TreeList.deleteCaches(plugins!);
		}
		Data.plugins = plugins;
		File.planToSave!(Data.manifest.project.plugins);
	}
}.bind(PluginManager) as ((...args: unknown[]) => void) | null;
