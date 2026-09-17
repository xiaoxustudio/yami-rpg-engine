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
	// oxlint-disable-next-line no-explicit-any
	list.insert = null as unknown as (...args: unknown[]) => any;
	// oxlint-disable-next-line no-explicit-any
	list.toggle = null as unknown as (...args: unknown[]) => any;
	// oxlint-disable-next-line no-explicit-any
	list.copy = null as unknown as (...args: unknown[]) => any;
	// oxlint-disable-next-line no-explicit-any
	list.paste = null as unknown as (...args: unknown[]) => any;
	// oxlint-disable-next-line no-explicit-any
	list.delete = null as unknown as (...args: unknown[]) => any;
	// oxlint-disable-next-line no-explicit-any
	list.saveSelection = null as unknown as (...args: unknown[]) => any;
	// oxlint-disable-next-line no-explicit-any
	list.restoreSelection = null as unknown as (...args: unknown[]) => any;
	list.updateTextNode = PluginManager.list_updateTextNode as unknown as (
		...args: unknown[]
		// oxlint-disable-next-line no-explicit-any
	) => any;
	// oxlint-disable-next-line no-explicit-any
	list.edit = PluginManager.list_edit as unknown as (...args: unknown[]) => any;
	// oxlint-disable-next-line no-explicit-any
	list.insert = PluginManager.list_insert as unknown as (...args: unknown[]) => any;
	// oxlint-disable-next-line no-explicit-any
	list.toggle = PluginManager.list_toggle as unknown as (...args: unknown[]) => any;
	// oxlint-disable-next-line no-explicit-any
	list.copy = PluginManager.list_copy as unknown as (...args: unknown[]) => any;
	// oxlint-disable-next-line no-explicit-any
	list.paste = PluginManager.list_paste as unknown as (...args: unknown[]) => any;
	// oxlint-disable-next-line no-explicit-any
	list.delete = PluginManager.list_delete as unknown as (...args: unknown[]) => any;
	// oxlint-disable-next-line no-explicit-any
	list.saveSelection = PluginManager.list_saveSelection as unknown as (...args: unknown[]) => any;
	list.restoreSelection = PluginManager.list_restoreSelection as unknown as (
		...args: unknown[]
		// oxlint-disable-next-line no-explicit-any
	) => any;
}

// pane methods 注意：不再重写 ParameterPane.createDetailBox / clear，因为它们在 ParameterPane.initialize 中被重写

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
	// list select/popup/open 经 Vue 模板转发（Plugin.vue @select/@popup/@open → PluginManager.list*）
	on(list, 'unselect', this.listUnselect!);
	// list change 经 Vue 模板转发（Plugin.vue @change → PluginManager.listChange）
	on(this.overview, 'pointerdown', this.overviewPointerdown!);
	on(this.parameterPane, 'update', this.parameterPaneUpdate!);
	// confirm 按钮由 `WindowFrame`/`YMFormButtons` 生成、注册表里没有它 ⇒ 不能在这里按 id 绑定
	// （`pluginEls.get('plugin-confirm')` 恒为 null，过去会打一行 `[on] el is null/undefined` 并让
	// 确认按钮失效）。改由 `Plugin.vue` 的 `@confirm` 转发 —— 与其它窗口同一手法。
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
} as unknown as (...args: unknown[]) => PluginItemShape;

PluginManager.getItemById = Easing.getItemById as unknown as (
	...args: unknown[]
) => ReturnType<typeof Easing.getItemById>;

PluginManager.switchOverviewMode = function (this: typeof PluginManager) {
	if (this.meta) {
		this.detailed = !this.detailed;
		this.loadOverview!();
	}
};
