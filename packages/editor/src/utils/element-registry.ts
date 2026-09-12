/**
 * 元素注册表（P5b 批次 2/4）：SFC 用 `:ref="registryRef(reg, id)"` 把**元素**登记进模块导出的
 * Map，模块侧据此取用——替代 `$('#id')` 的 DOM 查找。
 *
 * 与 `createAccessorFields()`（控件实例注册表）的区别：这里登记的是元素本身
 * （组件 ref 取 `$el`，裸元素直接用），适用于模块把这些元素当作**命令式 API 对象**使用的场景
 * （tree list / text box / window frame 等）。
 */
export type ElementRegistry = Map<string, HTMLElement | null>;

export const createElementRegistry = (): ElementRegistry => new Map();

/** 生成模板 ref 回调：组件实例取 `$el`，元素直接用；卸载（null）时清空该项 */
export const registryRef =
	(registry: ElementRegistry, id: string) =>
	(el: unknown): void => {
		if (el === null || el === undefined) {
			registry.set(id, null);
			return;
		}
		const element =
			el instanceof HTMLElement ? el : ((el as { $el?: HTMLElement }).$el ?? null);
		registry.set(id, element);
	};
