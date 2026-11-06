/**
 * 布局骨架节点（`engine/layout/layout.ts` 用）的交接表。
 *
 * 这三个节点由 `LayoutPanel.vue` 独占渲染：工作区页管理器 / 布局导航 / 布局页管理器。
 * 之前它们被登记进 `engineEls`，引擎再按 id 取。现在改成**类型化的小表**：
 *
 *   - `LayoutPanel.vue` 挂载时 `setLayoutNode(key, el)`，卸载时清；
 *   - `layout.ts` 用 `getLayoutNode(key)` 取。
 *
 * 取不到时调用方可以退回 `queryElementsByIds([...])` 兜底（引擎初始化时序可能早于挂载）。
 */
export type LayoutNodeKey = 'workspace' | 'nav' | 'pageManager';

/** 键 → 稳定的 DOM id（兜底查询与排查用）。 */
export const LAYOUT_NODE_IDS: Record<LayoutNodeKey, string> = {
	workspace: 'workspace-page-manager',
	nav: 'layout-nav',
	pageManager: 'layout-page-manager'
};

const nodes: Partial<Record<LayoutNodeKey, HTMLElement>> = {};

/** 组件挂载时登记自己拥有的节点。 */
export const setLayoutNode = (key: LayoutNodeKey, element: HTMLElement | null): void => {
	if (element) nodes[key] = element;
	else delete nodes[key];
};

/** 组件卸载时注销（只在仍是自己那一份时清）。 */
export const clearLayoutNode = (key: LayoutNodeKey, element: HTMLElement | null): void => {
	if (element && nodes[key] === element) delete nodes[key];
};

/** 引擎侧读取。 */
export const getLayoutNode = (key: LayoutNodeKey): HTMLElement | null => nodes[key] ?? null;
