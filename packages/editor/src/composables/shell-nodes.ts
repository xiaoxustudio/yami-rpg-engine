/**
 * 应用外壳（标题栏 / 菜单 / 标签栏 / 播放按钮）的节点表。
 *
 * `AppShell.vue` 是编辑器最外层的壳：`title-bar.ts` 要拿它做窗口拖拽与玩家视角，
 * `tools/window-object.ts` 要它做无窗口时的焦点落点。以前分别登记进 `windowShellEls` /
 * `titleEls` 两张自建表，现在由外壳 `bind` 交出、模块 `pick` 读取（`pick` 带 id 兜底）。
 */
import { createSkeletonTable } from './skeleton-table';

export type ShellNodeKey = 'title' | 'tabBar' | 'play' | 'appRegion';

export const shellNodes = createSkeletonTable<ShellNodeKey>({
	title: 'title',
	tabBar: 'title-tabBar',
	play: 'title-play',
	appRegion: 'title-app-region'
});
