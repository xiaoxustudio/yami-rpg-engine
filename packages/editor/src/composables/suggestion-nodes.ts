/**
 * 两个浮层（命令建议 / 文本建议）的节点表。
 *
 * 它们是**全局单例浮层**：`command-tip.ts` / `text-tip.ts` 长期持有并直接调元素上的能力
 * （`searcher.deleteInputContent()`、`list.searchNodes()`、改 `widget` 的位置）。以前按 id 从
 * 各自建的小注册表取；现在由浮层组件挂载时交出，模块 `pick` 读取。
 */
import { createSkeletonTable } from './skeleton-table';

export type CommandSuggestionNodeKey = 'suggestions' | 'widget' | 'searcher';

export const commandSuggestionNodes = createSkeletonTable<CommandSuggestionNodeKey>({
	suggestions: 'command-suggestions',
	widget: 'command-widget',
	searcher: 'command-searcher'
});

export type TextSuggestionNodeKey = 'suggestions';

export const textSuggestionNodes = createSkeletonTable<TextSuggestionNodeKey>({
	suggestions: 'text-suggestions'
});
