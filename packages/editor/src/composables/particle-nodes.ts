/**
 * 粒子引擎骨架节点表（页 / 头 / 体 / 信息 / 屏幕 / 选框 / 速度 / 缩放 / 视图开关）。
 *
 * 节点由 `ParticlePanel.vue` 渲染；`particle-initialize.ts` 读表，`pick` 带 id 兜底。
 */
import { createSkeletonTable } from './skeleton-table';

export type ParticleNodeKey =
	| 'page'
	| 'head'
	| 'body'
	| 'info'
	| 'screen'
	| 'marquee'
	| 'speed'
	| 'zoom'
	| 'viewWireframe'
	| 'viewAnchor'
	| 'controlPause'
	| 'controlRestart';

export const particlePanelNodes = createSkeletonTable<ParticleNodeKey>({
	page: 'particle',
	head: 'particle-head',
	body: 'particle-body',
	info: 'particle-info',
	screen: 'particle-screen',
	marquee: 'particle-marquee',
	speed: 'particle-speed',
	zoom: 'particle-zoom',
	viewWireframe: 'particle-view-wireframe',
	viewAnchor: 'particle-view-anchor',
	controlPause: 'particle-control-pause',
	controlRestart: 'particle-control-restart'
});
