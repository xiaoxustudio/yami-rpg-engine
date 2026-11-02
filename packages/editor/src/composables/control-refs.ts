/**
 * 控件模板 ref 表 —— 「元素 API → 组件 `defineExpose`」迁移的单一接缝。
 *
 * 旧契约：控件把方法挂到自己的根元素上（`attachElementApi`），消费方按 id 从 `ElementRegistry`
 * 取**裸元素**再调 `.loadItems()` / `.read()`。新契约：消费方持有**组件实例**，调用
 * `defineExpose` 暴露的同一批方法；控件寻址不再经过全局注册表。
 *
 * 为什么按 id 建表而不是每个控件一个具名 ref：命令窗口常有 5～20 个控件，具名 ref 会把
 * 批处理退化成手写。`useControlRefs<Id>()` 用**字面量联合**收 id，拼错在 `tsc` / `vue-tsc`
 * 就红 —— 注册表时代拼错只在运行期静默 no-op。
 *
 * 少数确实需要 DOM 的站点（`clear(el)`、`TextSuggestion.listen(el)`、`TextSuggestionTarget`）
 * 用 `controlRoot()` 取根元素；**不要**退回去存裸元素，那样 `element-api-attach` 永远不会下降。
 */
import type { FormFieldControl } from './form-fields';

/**
 * 控件实例对外暴露的能力（`defineExpose` 成员集合，全部可选：按批次需要增补）。
 *
 * 返回 `unknown` 而不是 `ControlApi` 的方法（`enableHiddenMode` 等）刻意不参与链式调用：
 * 链式写法（`el.enableHiddenMode()?.relate(...)`）依赖「返回值是挂了元素 API 的元素」，
 * 那正是要拆掉的契约，拆成两句即可。
 */
export interface ControlApi extends FormFieldControl {
	loadItems?: (items: unknown[]) => unknown;
	bind?: (value: unknown) => unknown;
	relate?: (entries: unknown) => void;
	/** 只改值不派发 input 事件（换候选项后回写旧值时用）。 */
	write2?: (value: unknown) => void;
	enableHiddenMode?: () => unknown;
	toggleRelatedElements?: () => void;
	enable?: () => void;
	disable?: () => void;
	getFocus?: (mode?: string) => void;
	input?: (...args: unknown[]) => unknown;
	update?: (...args: unknown[]) => unknown;
	on?: (
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	) => void;
	/** 组件根元素（`WindowFrame` / `SelectBox` 等把它一并 expose）。 */
	root?: HTMLElement | null;
}

type ControlTarget = ControlApi & { $el?: unknown };

/**
 * `defineExpose` 是双向的：普通 DOM 节点（模板里的 `<div class="text">` 也会挂 ref）
 * 保留元素本身 —— `relate` 的 targets、tooltip 位置都需要它；组件则保留实例。
 */
const toControl = (target: unknown): ControlApi | null => {
	if (target == null) return null;
	if (target instanceof HTMLElement) return target as ControlApi;
	return target as ControlTarget;
};

export interface ControlRefs<Id extends string> {
	controls: Partial<Record<Id, ControlApi | null>>;
	controlRef: (id: Id) => (target: unknown) => void;
	/** 适配 `setFormFields` / `getFormFields` 的控件解析器（表单读写不再经过注册表）。 */
	controlOf: (id: string) => ControlApi | null;
}

export function useControlRefs<Id extends string = string>(): ControlRefs<Id> {
	const controls: Partial<Record<Id, ControlApi | null>> = {};
	const controlRef =
		(id: Id) =>
		(target: unknown): void => {
			controls[id] = toControl(target);
		};
	const controlOf = (id: string): ControlApi | null => controls[id as Id] ?? null;
	return { controls, controlRef, controlOf };
}

/** 取控件根元素（确实需要 DOM 的站点用；其余一律走实例方法）。 */
export const controlRoot = (control?: ControlApi | null): HTMLElement | null => {
	if (!control) return null;
	if (control instanceof HTMLElement) return control;
	const target = control as ControlTarget;
	const root = target.root ?? target.$el ?? null;
	return root instanceof HTMLElement ? root : null;
};
