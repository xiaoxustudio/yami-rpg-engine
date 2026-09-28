// 编辑器操作历史共用接口。 项目中 CommandHistory / NumberHistory / TextHistory / ParamListHistory 等 History 类重复实现同一组栈式 undo/redo 契约： stack / index / reset / save / restore / canUndo / canRedo 此处提取为 IEditableHistory，供各 History 类 implements 复用， 消除字段重复声明与散落的 `history: any` / `owner.history: any` 耦合断言。 说明：未引入泛型化基类（避免改动 6 个已稳定运行的类继承链）， 仅以 interface 收敛类型契约，渐进式类型化下安全保守。
//
// 它是**委托型适配器** —— 自己不持栈，转发给 `this.owner.history`（`extends Array`，栈即数组自身），
// 因此**没有也不该有** `stack` / `index`。它满足的是下面那个更窄的 `IUndoRedoHistory`。
// 消费方（script-list / property-list / event-list / condition-list / list-interface）也已同步收窄。
export type HistoryOperation = 'undo' | 'redo';

// 操作历史基础契约（栈式 undo/redo）
export interface IEditableHistory extends IUndoRedoHistory {
	stack: HistoryData[];
	// 当前指针（-1 表示空）
	index: number;
}

/**
 * 「只需要撤销/重做**操作**」的窄契约 —— 比 `IEditableHistory` 少了 `stack` / `index`。
 *
 *
 * 而 `ParamHistory` 结构上**不满足**它（缺 `stack` / `index`），只能写
 * `as unknown as IEditableHistory` 硬跨过去，于是被记成「待用户决策的类型设计债务」。
 *
 * 把它量到底得到的结论是：**`IEditableHistory` 对这批消费方偏宽**，不是 `ParamHistory` 缺东西。
 *
 * - `ParamHistory` 是**委托型适配器**：它不自己持栈，而是转发给 `this.owner.history`
 *   （`History extends Array`，栈就是数组自身）—— 所以它**本就不该**有独立的 `stack` / `index`；
 * - 全仓把这类 history 当 `IEditableHistory` 用的地方（`script-list` / `property-list` /
 *   `event-list` / `condition-list` / `list-interface`），**只调用方法**
 *   （`save` / `restore` / `canUndo` / `canRedo` / `reset`）；
 * - 实测 `history.index` / `history.stack` 的读取点**没有一处**是经由这些字段的
 *   （命中的全是数组型 `History` 自己的 `history.index`，以及 `ParamHistory` 内部读它 owner 的那个）。
 *
 * 所以正确的对齐方式是把**消费方**的类型收窄到它真正需要的契约，而不是给 `ParamHistory`
 * 硬加两个假的 `stack` / `index`。改完之后那 4 处 `as unknown as` 直接消失。
 */
export interface IUndoRedoHistory {
	reset(): void;

	save(data: HistoryData): void;
	// 恢复数据（undo/redo）
	restore(operation: HistoryOperation): void;

	canUndo(): boolean;

	canRedo(): boolean;
}

// 带容量上限的历史契约
export interface ICapacityHistory extends IEditableHistory {
	capacity: number;
}

// 数组型历史契约（History extends Array，无独立 stack 字段，用 this[index] 直接访问）。 与 ICapacityHistory 区别：不要求 stack 字段（Array 子类自身即栈）， 供 tools/history.ts 的 History implements 复用。
export interface IArrayHistory {
	// 当前指针（-1 表示空）
	index: number;

	capacity: number;

	reset(): void;

	save(data: HistoryData): void;
	// 恢复数据（undo/redo）
	restore(operation: HistoryOperation): void;

	canUndo(): boolean;

	canRedo(): boolean;
}

// 带 owner 反向引用的历史契约（condition-list/event-list/property-list/script-list 共用）
export interface IOwnedHistory extends IEditableHistory {
	// 所属对象（反向引用，多数为 Editor/Window 子类）
	owner: { history?: unknown } | null;
}

// 历史数据基础契约。 各 History 类的 stack 元素都至少含 type 字段（'insert'/'replace'/'delete'/'toggle'/'custom'）， 用于 restore 分支判断。其余字段（array/index/items/commands/value 等）按场景扩展。
export interface HistoryData {
	type: string;
	/**
	 * 各 History 的 stack 元素是**异质载荷**：写侧各编辑器往里塞自己的
	 * `editor` / `item` / `settings` / `response` / `swap` …，读侧按 `type` 分派后再取。
	 * 所以保留索引签名（写侧全放行），但值类型是 `unknown` 而不是 `any`：
	 * 读侧必须先收窄/断言，拼错键也不会静默变成 `any`。
	 */
	[key: string]: unknown;
}

export type HistoryToggleMethod = 'enable' | 'disable';

// toggle 类历史数据契约
export interface HistoryToggleData extends HistoryData {
	type: 'toggle';
	method: HistoryToggleMethod;
	items: unknown[];
}

export type HistoryListOperation = 'insert' | 'replace' | 'delete' | 'toggle';
