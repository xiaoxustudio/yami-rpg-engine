/**
 * copyProgress 窗口的**控件级能力桥**（模块级强类型）。
 *
 * 打包（deployment）过程中由单例驱动进度条。旧做法是按 id 从 `titleEls` 取进度条与信息两个
 * 元素、直接改 `style.width` / `textContent`；窗口改成响应式渲染后，这段渲染归窗口自己，
 * 单例只调用 `reset()` / `update(percent, text)` —— 单例不再知道控件 id，也不用判空元素。
 *
 * 实现收口在 `composables/form-bridge.ts`（同一把 id 只留一份当前实例，卸载即注销）。
 */
import { createFormBridge } from './form-bridge';

export interface CopyProgressBridge {
	/** 复位到 0% 并清空信息（打开窗口后立刻调用）。 */
	reset(): void;
	/** 百分比 + 一行信息文本。 */
	update(percent: number, text: string): void;
}

const bridge = createFormBridge<CopyProgressBridge>('copyProgress');

/** 组件挂载时登记。 */
export const provideCopyProgressBridge = (api: CopyProgressBridge): void => bridge.provide(api);
/** 组件卸载时注销（只清理自己登记的那一份）。 */
export const resetCopyProgressBridge = (api: CopyProgressBridge): void => bridge.reset(api);
/** 单例侧读取；窗口未挂载时返回 null。 */
export const getCopyProgressBridge = (): CopyProgressBridge | null => bridge.get();
