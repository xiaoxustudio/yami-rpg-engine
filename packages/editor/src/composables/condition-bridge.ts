/**
 * 条件窗口交给 `ConditionListInterface` 的桥（模块级强类型）。
 *
 * 条件窗口是懒挂载的：`ConditionListInterface.initialize()` / `write(Type)` 需要给 8 个控件
 * 灌选项、挂「类型 → 显示哪几行」的关系、改 `key` 的过滤器。以前都是按 id 从
 * `conditionEls` 取元素；现在窗口交出「按逻辑名取控件」与「按逻辑名挂关系」。
 */
import { createFormBridge } from './form-bridge';
import type { ControlApi } from './control-refs';

/** 条件窗口里 8 个控件的逻辑名（与模板一一对应）。 */
export type ConditionControlKey =
	| 'type'
	| 'key'
	| 'booleanOperation'
	| 'booleanValue'
	| 'numberOperation'
	| 'numberValue'
	| 'stringOperation'
	| 'stringValue';

export interface ConditionApi {
	/** 取控件（未挂载时返回 null）。 */
	control(key: ConditionControlKey): ControlApi | null;
	/** 按逻辑名挂「类型 → 目标行」的显隐关系（`relate` 需要 DOM，由窗口解析）。 */
	relateGroups(groups: Array<{ case: string; targets: ConditionControlKey[] }>): void;
}

const bridge = createFormBridge<ConditionApi>('conditionWindow');

export const provideCondition = (api: ConditionApi): void => bridge.provide(api);
export const resetCondition = (api: ConditionApi): void => bridge.reset(api);
export const getCondition = (): ConditionApi | null => bridge.get();
