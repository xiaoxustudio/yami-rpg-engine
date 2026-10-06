import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

/**
 * 文本采集（`tools/text-capture.ts` 的 `Selection`）窗口状态。
 *
 * 原先这两个字段只在 `Selection` 单例上（`inserting` 是「插入」态标志，`context` 是
 * `saveContext`/`restoreContext` 成对使用的快照）。`regexps` 是常量，不迁。
 *
 * 桥接循环装在单例模块里（`text-capture.ts` 的 `selectionBridgeKeys`），跟本仓其它 20 个域一致：
 * 单例模块 import 本 store ⇒ 谁加载单例谁就完成接线，不会出现「store 建好了但没人用」的孤儿 store。
 * 注意**不要**在这里导出一份 `selectionStateKeys` 白名单去给单例 import —— 单例侧那种数组是
 * 模块求值期读的，两边互相 import 会踩 TDZ（见 pinia-migration-analysis.md 第 1.1 节的漂移说明），
 * 所以这里索性只留单例侧那一份，从根上避免出现第二份。
 */
export const useSelectionStore = defineStore('selection', () => {
	/** 是否处于「插入」态（`Selection.inserting`） */
	const inserting = shallowRef<boolean>(false);
	/** 上下文快照（结构见 `SelectionShape.context`；target 类型来自 element-api，这里不复制它） */
	const context = shallowRef<{ target: unknown; inserting: boolean } | null>(null);

	return { inserting, context };
});

export function getSelectionStore() {
	return useSelectionStore(pinia);
}
