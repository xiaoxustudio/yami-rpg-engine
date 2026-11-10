/**
 * 三个图形化窗口（数组列表 / 预设元素 / 预设对象）的节点表。
 *
 * 三者的模块单例都要「窗口根 + 一两个控件」：给窗口挂 `closed`、按列表/搜索框驱动。
 * 以前按 id 从 `composableEls` 取，现在由窗口挂载时交出（`pick` 带 id 兜底）。
 */
import { createSkeletonTable } from './skeleton-table';

export type ArrayListNodeKey = 'frame' | 'list';

export const arrayListNodes = createSkeletonTable<ArrayListNodeKey>({
	frame: 'arrayList',
	list: 'arrayList-list'
});

export type PresetElementNodeKey = 'frame' | 'list' | 'ui' | 'searcher';

export const presetElementNodes = createSkeletonTable<PresetElementNodeKey>({
	frame: 'presetElement',
	list: 'presetElement-list',
	ui: 'presetElement-uiId',
	searcher: 'presetElement-searcher'
});

export type PresetObjectNodeKey = 'frame' | 'list' | 'scene' | 'searcher';

export const presetObjectNodes = createSkeletonTable<PresetObjectNodeKey>({
	frame: 'presetObject',
	list: 'presetObject-list',
	scene: 'presetObject-sceneId',
	searcher: 'presetObject-searcher'
});

/** 场景位移窗口（`scene-shift`）：`move-scene` 只挂 open/closed 监听。 */
export type SceneShiftNodeKey = 'frame';

export const sceneShiftNodes = createSkeletonTable<SceneShiftNodeKey>({
	frame: 'scene-shift'
});

/** APK 导出窗口里的内容区：`apkbuilder` 只调它的 `update`。 */
export type ExportApkNodeKey = 'content';

export const exportApkNodes = createSkeletonTable<ExportApkNodeKey>({
	content: 'export-apk-content'
});
