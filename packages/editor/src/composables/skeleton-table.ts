import { queryElementsByIds } from '@app/utils/dom';

/**
 * 「引擎骨架节点」小表的通用实现。
 *
 * 背景：一批**长期存在、单实例**的骨架节点（布局骨架、UI 引擎、精灵面板……）原本登记进
 * 共享注册表，引擎再按 id 去摸。它们其实各自只有一个主人，所以换成这种**类型化小表**：
 *
 *   - 组件挂载时 `set(key, el)`、卸载时 `clear(key, el)`；
 *   - 引擎侧 `get(key)`；`pick(key)` 还会按稳定 id 兜底 —— 引擎初始化可能早于组件挂载，
 *     这条兜底是刻意的，不要删（删了会变成竞态 bug）。
 *
 * 用 `createSkeletonTable` 生成，键集合写死在类型里，拼错编译期就红。
 */
export interface SkeletonTable<K extends string> {
	/** 键 → 稳定 DOM id（兜底查询与排查用）。 */
	readonly ids: Record<K, string>;
	/** 组件挂载时登记自己拥有的节点。 */
	set(key: K, element: HTMLElement | null): void;
	/** 组件卸载时注销（只在仍是自己那一份时清）。 */
	clear(key: K, element: HTMLElement | null): void;
	/** 引擎侧读取（可能为 null：还没挂载）。 */
	get(key: K): HTMLElement | null;
	/** 读取，取不到时按 id 兜底查询。 */
	pick(key: K): HTMLElement | null;
}

/** 建一张骨架节点表。 */
export const createSkeletonTable = <K extends string>(ids: Record<K, string>): SkeletonTable<K> => {
	const nodes: Partial<Record<K, HTMLElement>> = {};
	return {
		ids,
		set: (key, element) => {
			if (element) nodes[key] = element;
			else delete nodes[key];
		},
		clear: (key, element) => {
			if (element && nodes[key] === element) delete nodes[key];
		},
		get: (key) => nodes[key] ?? null,
		pick: (key) => nodes[key] ?? queryElementsByIds([ids[key]])[0] ?? null
	};
};
