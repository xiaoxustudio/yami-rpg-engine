/**
 * 命令窗口族（自定义命令面板 / 脚本指令面板）的骨架节点表。
 *
 * 两个面板各自只有**一个主人**（`custom-command-window.ts` / `command-custom.ts`），
 * 以前各自建一份 `createElementRegistry()` 再按 id 摸元素；现在由 `Command.vue` /
 * `ScriptCommand.vue` 挂载时交出，模块读表（`pick` 带 id 兜底）。
 */
import { createSkeletonTable } from './skeleton-table';

export type CustomCommandNodeKey = 'frame' | 'list' | 'overviewPane' | 'overview' | 'settingsPane';

export const customCommandNodes = createSkeletonTable<CustomCommandNodeKey>({
	frame: 'command',
	list: 'command-list',
	overviewPane: 'command-overview-detail',
	overview: 'command-overview',
	settingsPane: 'command-settings-detail'
});

export type ScriptCommandNodeKey = 'frame' | 'parameterPane' | 'parameterDetail' | 'parameterGrid';

export const scriptCommandNodes = createSkeletonTable<ScriptCommandNodeKey>({
	frame: 'scriptCommand',
	parameterPane: 'scriptCommand-parameter-pane',
	parameterDetail: 'scriptCommand-parameter-detail',
	parameterGrid: 'scriptCommand-parameter-grid'
});
