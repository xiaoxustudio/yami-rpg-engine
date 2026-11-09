/**
 * 事件搜索窗（`event-search-string`）的节点表。
 *
 * `stores/search-string.ts` 是**非 Vue 单例**：它要在窗口上挂 keydown/closed、在按钮上挂 click、
 * 在搜索框上挂 input，并直接改 log 的文案。以前按 id 从 `storesEls` 取，现在窗口挂载时交出
 * （`pick` 带 id 兜底：搜索动作可能早于窗口挂载）。
 */
import { createSkeletonTable } from './skeleton-table';

export type SearchStringNodeKey = 'frame' | 'log' | 'search' | 'previous' | 'next';

export const searchStringNodes = createSkeletonTable<SearchStringNodeKey>({
	frame: 'event-search-string',
	log: 'event-search-string-log',
	search: 'event-search-string-search',
	previous: 'event-search-string-previous',
	next: 'event-search-string-next'
});
