/**
 * 首页 / inspector 面板 / 选择器 / 进度条等「面板级单节点」的表。
 *
 * 这些节点各自只有一个主人与一个消费者（`home-page` / `constants` / `inspector` /
 * `selector` / `boot-progress`），以前分别登记进 `titleEls` / `moduleEls` / `inspectorEls` /
 * `storesEls` 等自建表；现在由面板 `bind` 交出、模块 `pick` 读取。
 */
import { createSkeletonTable } from './skeleton-table';

export type HomeNodeKey = 'page' | 'content' | 'version';

export const homeNodes = createSkeletonTable<HomeNodeKey>({
	page: 'home',
	content: 'home-content',
	version: 'home-version'
});

export type InspectorPanelNodeKey = 'panel' | 'pageManager';

export const inspectorPanelNodes = createSkeletonTable<InspectorPanelNodeKey>({
	panel: 'inspector',
	pageManager: 'inspector-page-manager'
});
