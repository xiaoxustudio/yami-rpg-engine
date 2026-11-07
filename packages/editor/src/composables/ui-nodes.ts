/**
 * UI 引擎骨架节点表（统一走 skeleton-table）。
 *
 * 节点由 `UiPanel.vue`（页 / 头 / 体 / 屏幕 / 选框）与 `UiElementPanel.vue`（列表 / 列表头 / 搜索框）
 * 渲染；引擎侧（`ui-initialize` / `ui-singleton` / `layout` / `stores/ui`）读表，`pick` 带 id 兜底
 * —— 引擎初始化可能早于组件挂载，这条兜底是刻意的。
 */
import { createSkeletonTable } from './skeleton-table';

export type UiNodeKey =
	| 'head'
	| 'list'
	| 'body'
	| 'page'
	| 'screen'
	| 'marquee'
	| 'searcher'
	| 'listHead';

export const uiNodes = createSkeletonTable<UiNodeKey>({
	head: 'ui-head',
	list: 'ui-list',
	body: 'ui-body',
	page: 'ui',
	screen: 'ui-screen',
	marquee: 'ui-marquee',
	searcher: 'ui-searcher',
	listHead: 'ui-list-head'
});

/** 兼容旧调用点（早先引入的 `getUiNode` / `setUiNode` / `clearUiNode` / `UI_NODE_IDS` 名字）。 */
export const UI_NODE_IDS = uiNodes.ids;
export const getUiNode = (key: UiNodeKey): HTMLElement | null => uiNodes.pick(key);
export const setUiNode = (key: UiNodeKey, element: HTMLElement | null): void =>
	uiNodes.set(key, element);
export const clearUiNode = (key: UiNodeKey, element: HTMLElement | null): void =>
	uiNodes.clear(key, element);
