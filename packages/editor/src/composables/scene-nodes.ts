/**
 * 场景引擎骨架节点表（页 / 头 / 体 / 信息 / 屏幕 / 列表 / 搜索框 / 工具栏 / 选框）。
 *
 * `scene/scene-window.ts` 长期持有这些节点；以前按 id 从 `sceneEls` 取。现在由
 * `ScenePanel.vue` 与 `SceneObjectPanel.vue` 交出，`pick` 带 id 兜底。
 */
import { createSkeletonTable } from './skeleton-table';

export type SceneNodeKey =
	| 'page'
	| 'head'
	| 'body'
	| 'info'
	| 'screen'
	| 'marquee'
	| 'list'
	| 'searcher'
	| 'objectPage'
	| 'listHead'
	| 'layerGroup'
	| 'brush'
	| 'switchGrid'
	| 'switchLight'
	| 'switchAnimation'
	| 'switchSettings'
	| 'zoom'
	| 'tilemap1'
	| 'tilemap2'
	| 'tilemap3'
	| 'tilemap4'
	| 'tilemap5'
	| 'tilemap6';

export const sceneNodes = createSkeletonTable<SceneNodeKey>({
	page: 'scene',
	head: 'scene-head',
	body: 'scene-body',
	info: 'scene-info',
	screen: 'scene-screen',
	marquee: 'scene-marquee',
	list: 'scene-list',
	searcher: 'scene-searcher',
	objectPage: 'scene-object',
	listHead: 'scene-list-head',
	layerGroup: 'scene-layer',
	brush: 'scene-brush',
	switchGrid: 'scene-switch-grid',
	switchLight: 'scene-switch-light',
	switchAnimation: 'scene-switch-animation',
	switchSettings: 'scene-switch-settings',
	zoom: 'scene-zoom',
	tilemap1: 'scene-layer-tilemap-1',
	tilemap2: 'scene-layer-tilemap-2',
	tilemap3: 'scene-layer-tilemap-3',
	tilemap4: 'scene-layer-tilemap-4',
	tilemap5: 'scene-layer-tilemap-5',
	tilemap6: 'scene-layer-tilemap-6'
});
