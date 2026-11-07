/**
 * 编辑数据 / 事件编辑器两个窗口的骨架节点表。
 *
 * - `EditData.vue`：编辑数据窗口（容器 / 当前项 / 标记）
 * - `Event.vue`：事件编辑器窗口（窗口 / 命令区 / 两侧行号槽 / 打开列表 / 类型）
 *
 * 两个模块（`module/editdata.ts`、`commands/event-editor-initialize.ts`）读表，`pick` 带 id 兜底。
 */
import { createSkeletonTable } from './skeleton-table';

export type EditDataNodeKey = 'root' | 'current' | 'mark';

export const editDataNodes = createSkeletonTable<EditDataNodeKey>({
	root: 'edit-data',
	current: 'edit-data-current',
	mark: 'edit-data-mark'
});

export type EventEditorNodeKey =
	| 'root'
	| 'commands'
	| 'gutterInner'
	| 'gutterOuter'
	| 'openList'
	| 'type';

export const eventEditorNodes = createSkeletonTable<EventEditorNodeKey>({
	root: 'event',
	commands: 'event-commands',
	gutterInner: 'event-commands-gutter-inner',
	gutterOuter: 'event-commands-gutter-outer',
	openList: 'event-open-list',
	type: 'event-type'
});
