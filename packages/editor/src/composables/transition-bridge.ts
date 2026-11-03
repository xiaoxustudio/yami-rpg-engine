/**
 * transition 窗口的**控件级能力桥**（模块级强类型）。
 *
 * schema 在打开/关闭窗口时要给缓动下拉灌候选项、并在关闭时清空它。旧做法是按 id 从
 * `composableEls` 取元素再调 `loadItems` / `clear`；窗口迁成模板 ref 后控件不再进注册表，
 * 于是这两件事由窗口实现、经模块桥交出 —— schema 不再知道控件 id。
 *
 * 实现收口在 `composables/form-bridge.ts`（同一把 id 只留一份当前实例，卸载即注销）。
 */
import { createFormBridge } from './form-bridge';

export interface TransitionBridge {
	/** 灌入缓动候选项。 */
	loadItems(easingItems: unknown[]): void;
	/** 清空缓动下拉（窗口关闭时）。 */
	clear(): void;
}

const bridge = createFormBridge<TransitionBridge>('transition');

/** 组件挂载时登记。 */
export const provideTransitionBridge = (api: TransitionBridge): void => bridge.provide(api);
/** 组件卸载时注销（只清理自己登记的那一份）。 */
export const resetTransitionBridge = (api: TransitionBridge): void => bridge.reset(api);
/** schema 侧读取；窗口未挂载时返回 null（等价于原来的 `composableEls.get(...)`）。 */
export const getTransitionBridge = (): TransitionBridge | null => bridge.get();
