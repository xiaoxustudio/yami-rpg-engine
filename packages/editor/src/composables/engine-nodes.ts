/**
 * 剩余的引擎骨架节点（粒子列表 / 项目面板）的交接表。
 *
 * 与 layout-nodes / ui-nodes / animation-nodes 同一模式，只是这两个域各只有一两个节点，
 * 就合到一个模块里，避免再开一堆文件。
 */
import { createSkeletonTable } from './skeleton-table';

/** 粒子面板的层列表（`particle-initialize` / `particle-window` 长期持有）。 */
export const particleNodes = createSkeletonTable<'list'>({
	list: 'particle-list'
});

/** 项目面板：页框与文件浏览器（`stores/browser` 与 `layout` 用）。 */
export const projectNodes = createSkeletonTable<'page' | 'browser'>({
	page: 'project',
	browser: 'project-browser'
});
