/**
 * 动画引擎的骨架节点表（左右两侧面板 + 时间轴 + 缓动面板共 29 个节点）。
 *
 * `animation-initialize.ts` / `animation-window.ts` 长期驱动这些节点；以前登记进
 * `engine/animation` 的注册表再按 id 取。现在由各面板交出、引擎读表（`pick` 带 id 兜底）。
 */
import { createSkeletonTable } from './skeleton-table';

export type AnimationNodeKey =
	| 'dirList'
	| 'animation'
	| 'head'
	| 'body'
	| 'screen'
	| 'marquee'
	| 'timeline'
	| 'timelineHead'
	| 'timelineToolbar'
	| 'timelineRulerOuter'
	| 'timelineRulerInner'
	| 'layerList'
	| 'timelineListOuter'
	| 'timelineListInner'
	| 'timelineCursor'
	| 'timelineMarquee'
	| 'timelineMarqueeShift'
	| 'timelinePointerAreaOuter'
	| 'timelinePointerAreaInner'
	| 'timelinePointer'
	| 'motion'
	| 'listHead'
	| 'searcher'
	| 'list'
	| 'easing'
	| 'easingHead'
	| 'easingSettings'
	| 'easingId'
	| 'easingCanvas'
	| 'switchSettings';

export const animationNodes = createSkeletonTable<AnimationNodeKey>({
	dirList: 'animation-dirList',
	animation: 'animation',
	head: 'animation-head',
	body: 'animation-body',
	screen: 'animation-screen',
	marquee: 'animation-marquee',
	timeline: 'animation-timeline',
	timelineHead: 'animation-timeline-head',
	timelineToolbar: 'animation-timeline-toolbar',
	timelineRulerOuter: 'animation-timeline-ruler-outer',
	timelineRulerInner: 'animation-timeline-ruler-inner',
	layerList: 'animation-layer-list',
	timelineListOuter: 'animation-timeline-list-outer',
	timelineListInner: 'animation-timeline-list-inner',
	timelineCursor: 'animation-timeline-cursor',
	timelineMarquee: 'animation-timeline-marquee',
	timelineMarqueeShift: 'animation-timeline-marquee-shift',
	timelinePointerAreaOuter: 'animation-timeline-pointer-area-outer',
	timelinePointerAreaInner: 'animation-timeline-pointer-area-inner',
	timelinePointer: 'animation-timeline-pointer',
	motion: 'animation-motion',
	listHead: 'animation-list-head',
	searcher: 'animation-searcher',
	list: 'animation-list',
	easing: 'animation-easing',
	easingHead: 'animation-easing-head',
	easingSettings: 'animation-easing-settings',
	easingId: 'animation-easing-id',
	easingCanvas: 'animation-easing-canvas',
	switchSettings: 'animation-switch-settings'
});

/**
 * 方向列表的**能力句柄**。
 *
 * 它和表里的元素是两份东西：元素用于读元素数据（`dirListData`），方法（`setDirItems` /
 * `setDirDirection`）只有组件实例能提供。以前两者都挂在同一个元素上，现在分开交。
 */
export interface AnimationDirListHandle {
	root: HTMLElement | null;
	setDirItems?(items: string[], selected: number): void;
	setDirDirection?(selected: number): void;
}

let dirListHandle: AnimationDirListHandle | null = null;

export const setAnimationDirList = (handle: AnimationDirListHandle | null): void => {
	dirListHandle = handle;
};

export const getAnimationDirList = (): AnimationDirListHandle | null => dirListHandle;
