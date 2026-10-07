import { PluginManager } from './plugin.ts';
import { pluginEls } from '@app/plugin/element-registry';
import type { PluginItemShape } from './plugin.ts';
import { getListConfig } from '@ui-kit';
import { clear, getFocus, hide, on, show } from '@app/utils/element-utils.ts';
import { Data } from '@app/data/data-object.ts';
import { Easing } from '@app/data/transition-window.ts';
import { Window } from '@app/tools/window-object.ts';
import type { TreeListElement } from '@app/components/tree-list.ts';
import type { YamiElement } from '@app/types/element-api';
import { clone as deepClone } from '@app/utils/object';

function ensureDomBound() {
	if (PluginManager.list) return;
	const list = pluginEls.get('plugin-list') as YamiElement;
	if (!list) return;
	PluginManager.list = list;
	PluginManager.overviewPane = pluginEls.get('plugin-overview-detail') as YamiElement;
	hide(PluginManager.overviewPane);
	PluginManager.overview = pluginEls.get('plugin-overview') as YamiElement;
	PluginManager.parameterPane = pluginEls.get('plugin-parameter-pane') as YamiElement;
	hide(PluginManager.parameterPane);
	list.updateTextNode = PluginManager.list_updateTextNode as (
		...args: unknown[]
		// oxlint-disable-next-line no-explicit-any
	) => any;
	// oxlint-disable-next-line no-explicit-any
	list.edit = PluginManager.list_edit as (...args: unknown[]) => any;
	// oxlint-disable-next-line no-explicit-any
	list.insert = PluginManager.list_insert as (...args: unknown[]) => any;
	// oxlint-disable-next-line no-explicit-any
	list.toggle = PluginManager.list_toggle as (...args: unknown[]) => any;
	// oxlint-disable-next-line no-explicit-any
	list.copy = PluginManager.list_copy as (...args: unknown[]) => any;
	// oxlint-disable-next-line no-explicit-any
	list.paste = PluginManager.list_paste as (...args: unknown[]) => any;
	// oxlint-disable-next-line no-explicit-any
	list.delete = PluginManager.list_delete as (...args: unknown[]) => any;
	// oxlint-disable-next-line no-explicit-any
	list.saveSelection = PluginManager.list_saveSelection as (...args: unknown[]) => any;
	list.restoreSelection = PluginManager.list_restoreSelection as (
		...args: unknown[]
		// oxlint-disable-next-line no-explicit-any
	) => any;
}

PluginManager.initialize = function (this: typeof PluginManager) {
	ensureDomBound();
	const list = this.list as TreeListElement | null;
	if (!list) return;
	getListConfig(list).removable = true;
	getListConfig(list).foldable = false;
	list.bind(() => this.data);
	// oxlint-disable-next-line unbound-method
	getListConfig(list).updaters.push(list.updateTextNode);

	if (this.parameterPane) {
		(this.parameterPane as TreeListElement).bind(list);
	}

	on(pluginEls.get('plugin') as YamiElement, 'close', this.windowClose!);
	on(pluginEls.get('plugin') as YamiElement, 'closed', this.windowClosed!);
	on(list, 'keydown', this.listKeydown!);
	on(list, 'unselect', this.listUnselect!);
	on(this.overview, 'pointerdown', this.overviewPointerdown!);
	on(this.parameterPane, 'update', this.parameterPaneUpdate!);
};

PluginManager.open = function (this: typeof PluginManager) {
	Window.open!('plugin');

	this.data = deepClone(Data.plugins);

	(this.list as TreeListElement).restoreSelection();

	getFocus(this.list);

	window.addEventListener('keydown', this.keydown!);
	window.addEventListener('pointerdown', this.pointerdown!);
	window.addEventListener('script-change', this.scriptChange!);
};

PluginManager.load = async function (this: typeof PluginManager, item?: PluginItemShape) {
	const symbol = (this.symbol = Symbol());
	const meta = await Data.scripts[item!.id];
	if (this.symbol === symbol) {
		this.symbol = null;
		this.meta = meta;
		this.loadOverview!();
		(this.parameterPane as TreeListElement).update();
	}
};

PluginManager.unload = function (this: typeof PluginManager) {
	this.meta = null;
	this.symbol = null;
	hide(this.overviewPane);
	hide(this.parameterPane);
	clear(this.parameterPane);
	this.overview?.dispatchEvent(new Event('update'));
};

PluginManager.loadOverview = function (this: typeof PluginManager) {
	if (!this.meta) return;
	show(this.overviewPane);
	this.overview?.dispatchEvent(new Event('update'));
};

PluginManager.createData = function (this: typeof PluginManager, id?: string) {
	return {
		id: id ?? '',
		enabled: true,
		parameters: {}
	};
} as (...args: unknown[]) => PluginItemShape;

PluginManager.getItemById = Easing.getItemById as (
	...args: unknown[]
) => ReturnType<typeof Easing.getItemById>;

PluginManager.switchOverviewMode = function (this: typeof PluginManager) {
	if (this.meta) {
		this.detailed = !this.detailed;
		this.loadOverview!();
	}
};
