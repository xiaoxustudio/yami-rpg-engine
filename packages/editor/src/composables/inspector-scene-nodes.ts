/**
 * inspector「场景类页面」的节点表（文件场景 / 场景灯光 / 场景瓦片 / 场景动画）。
 *
 * 每个页面的列表控件（条件 / 事件 / 脚本 / 参数面板）由该页的 section 组件渲染，页面模块
 * 只在切换对象时 `clear(...)` 它们。以前按 id 从 `inspectorEls` 取；现在 section 挂载时
 * `set(...)` 交出、页面 `pick(...)` 读取（`pick` 带 id 兜底：页面初始化可能早于 section 挂载）。
 */
import { createSkeletonTable } from './skeleton-table';

export type FileSceneNodeKey = 'events' | 'scripts' | 'parameterPane';

export const fileSceneNodes = createSkeletonTable<FileSceneNodeKey>({
	events: 'fileScene-events',
	scripts: 'fileScene-scripts',
	parameterPane: 'fileScene-parameter-pane'
});

export type SceneLightNodeKey = 'conditions' | 'events' | 'scripts' | 'parameterPane';

export const sceneLightNodes = createSkeletonTable<SceneLightNodeKey>({
	conditions: 'sceneLight-conditions',
	events: 'sceneLight-events',
	scripts: 'sceneLight-scripts',
	parameterPane: 'sceneLight-parameter-pane'
});

export type SceneTilemapNodeKey = 'conditions' | 'events' | 'scripts' | 'parameterPane' | 'light';

export const sceneTilemapNodes = createSkeletonTable<SceneTilemapNodeKey>({
	conditions: 'sceneTilemap-conditions',
	events: 'sceneTilemap-events',
	scripts: 'sceneTilemap-scripts',
	parameterPane: 'sceneTilemap-parameter-pane',
	light: 'sceneTilemap-light'
});

export type SceneAnimationNodeKey =
	| 'conditions'
	| 'events'
	| 'scripts'
	| 'parameterPane'
	| 'motion';

export const sceneAnimationNodes = createSkeletonTable<SceneAnimationNodeKey>({
	conditions: 'sceneAnimation-conditions',
	events: 'sceneAnimation-events',
	scripts: 'sceneAnimation-scripts',
	parameterPane: 'sceneAnimation-parameter-pane',
	motion: 'sceneAnimation-motion'
});
