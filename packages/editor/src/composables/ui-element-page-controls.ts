/**
 * UI 元素页（`UIImagePage` 及其 section）交给 `inspector/element-page.ts` 的**控件表**。
 *
 * 这一族的特殊性：单例要驱动**跨组件**的一批控件（页面自己的 5 个 + general section 3 个 +
 * transform section 17 个），而且会在生命周期里反复读写。所以用「页持有表、section 往里填、
 * 单例按 key 读」：
 *
 *   - `UIImagePage.vue`：建表 + `provide(UI_ELEMENT_CONTROLS_KEY, table)` + 登记给单例；
 *   - 各 section：`inject` 同一张表，挂载时把自己那一半填进去；
 *   - `element-page.ts`：`getUiElementControls()?.['uiElement-name']`，不再按 id 找注册表。
 *
 * 表里的值仍是 `ControlApi`（组件实例 / 元素皆可），P3 收口时逐 key 换成实例能力即可。
 */
import type { InjectionKey } from 'vue';
import { createFormBridge } from './form-bridge';
import type { ControlApi } from './control-refs';

export type UiElementControlTable = Partial<Record<string, ControlApi | null>>;

/** section 用：`inject` 这张表，挂载时把自己那一半填进去。 */
export const UI_ELEMENT_CONTROLS_KEY: InjectionKey<UiElementControlTable> =
	Symbol('uiElementControls');

const bridge = createFormBridge<UiElementControlTable>('uiElementPage');

/** 页面挂载时把表交给单例。 */
export const provideUiElementControls = (table: UiElementControlTable): void =>
	bridge.provide(table);
/** 页面卸载时注销。 */
export const resetUiElementControls = (table: UiElementControlTable): void => bridge.reset(table);
/** 单例侧读取；页面未挂载时返回 null。 */
export const getUiElementControls = (): UiElementControlTable | null => bridge.get();

/** 把模板 ref 的目标解析成控件（组件实例优先，退回元素）。 */
export const controlOf = (target: unknown): ControlApi | null => {
	if (target == null) return null;
	if (target instanceof HTMLElement) return target as ControlApi;
	return target as ControlApi;
};

/** 生成 `:ref` 绑定函数：`bind('uiElement-name')` 把控件写进表里。 */
export const createControlBinder =
	(table: UiElementControlTable) =>
	(id: string) =>
	(target: unknown): void => {
		table[id] = controlOf(target);
	};
