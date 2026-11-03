/**
 * logMessage 窗口的**控件级能力桥**（模块级强类型）。
 *
 * `Log` 单例需要在日志变化后让窗口重渲染。旧做法是把 `update` 方法挂在窗口根元素上
 * （`attachElementApi`）+ 把根元素登记进 `logEls`，单例再按 id 取元素调 `.update()`；
 * 现在改由窗口实现、经模块桥交出 —— 单例不再知道控件 id，也不用判空元素。
 *
 * 实现收口在 `composables/form-bridge.ts`（同一把 id 只留一份当前实例，卸载即注销）。
 */
import { createFormBridge } from './form-bridge';

export interface LogMessageBridge {
	/** 让日志窗口按 store 里的最新内容重渲染。 */
	update(): void;
}

const bridge = createFormBridge<LogMessageBridge>('logMessage');

/** 组件挂载时登记。 */
export const provideLogMessageBridge = (api: LogMessageBridge): void => bridge.provide(api);
/** 组件卸载时注销（只清理自己登记的那一份）。 */
export const resetLogMessageBridge = (api: LogMessageBridge): void => bridge.reset(api);
/** 单例侧读取；窗口未挂载时返回 null（等价于原来的「元素不存在就静默跳过」）。 */
export const getLogMessageBridge = (): LogMessageBridge | null => bridge.get();
