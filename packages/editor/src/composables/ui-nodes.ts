/**
 * UI 引擎骨架节点（`ui-head` / `ui-list` / `ui-body`）的交接表。
 *
 * 与 `layout-nodes.ts` 同一模式：节点由 `UiPanel.vue` / `UiElementPanel.vue` 独占渲染，
 * 之前登记进 `uiEls`，引擎按 id 取（`ui-initialize` / `ui-singleton` / `layout` / `stores/ui`）。
 * 现在改成类型化小表；取不到时调用方按 `UI_NODE_IDS` 兜底（引擎初始化时序可能早于挂载）。
 */
export type UiNodeKey = 'head' | 'list' | 'body';

/** 键 → 稳定的 DOM id（兜底查询与排查用）。 */
export const UI_NODE_IDS: Record<UiNodeKey, string> = {
	head: 'ui-head',
	list: 'ui-list',
	body: 'ui-body'
};

const nodes: Partial<Record<UiNodeKey, HTMLElement>> = {};

/** 组件挂载时登记自己拥有的节点。 */
export const setUiNode = (key: UiNodeKey, element: HTMLElement | null): void => {
	if (element) nodes[key] = element;
	else delete nodes[key];
};

/** 组件卸载时注销（只在仍是自己那一份时清）。 */
export const clearUiNode = (key: UiNodeKey, element: HTMLElement | null): void => {
	if (element && nodes[key] === element) delete nodes[key];
};

/** 引擎侧读取。 */
export const getUiNode = (key: UiNodeKey): HTMLElement | null => nodes[key] ?? null;
