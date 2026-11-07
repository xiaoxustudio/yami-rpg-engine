/**
 * 语言包 / 插件两个工具窗口的骨架节点表。
 *
 * - `Localization.vue`：窗口 / 列表 / 搜索框 / 检查器 / 导入导出按钮
 * - `Plugin.vue`：窗口 / 列表 / 概览 / 概览详情 / 参数面板
 *
 * `local/local-window.ts` 与 `plugin/plugin-initialize.ts` 读表，`pick` 带 id 兜底。
 */
import { createSkeletonTable } from './skeleton-table';

export type LocalizationNodeKey =
	| 'root'
	| 'list'
	| 'searcher'
	| 'inspector'
	| 'fromExcel'
	| 'toExcel';

export const localizationNodes = createSkeletonTable<LocalizationNodeKey>({
	root: 'localization',
	list: 'localization-list',
	searcher: 'localization-searcher',
	inspector: 'localization-inspector',
	fromExcel: 'localization-from-excel',
	toExcel: 'localization-to-excel'
});

export type PluginNodeKey = 'root' | 'list' | 'overview' | 'overviewDetail' | 'parameterPane';

export const pluginNodes = createSkeletonTable<PluginNodeKey>({
	root: 'plugin',
	list: 'plugin-list',
	overview: 'plugin-overview',
	overviewDetail: 'plugin-overview-detail',
	parameterPane: 'plugin-parameter-pane'
});
