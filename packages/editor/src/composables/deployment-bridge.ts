/**
 * deployment 窗口的**控件级能力桥**（模块级强类型）。
 *
 * 单例（`title/deploy-project-window.ts`）需要在打包前把校验提示写到窗口里。旧做法是按 id
 * 从 `titleEls` 取元素再改 `textContent`；窗口迁成模板 ref 后元素不再进注册表，
 * 于是这个能力由窗口实现（写成自己的响应式文案）、经模块桥交给单例 —— 单例不再知道控件 id。
 *
 * 实现收口在 `composables/form-bridge.ts`（同一把 id 只留一份当前实例，卸载即注销）。
 */
import { createFormBridge } from './form-bridge';

export interface DeploymentBridge {
	/** 写窗口底部的校验提示（空串表示清空）。 */
	setWarning(text: string): void;
}

const bridge = createFormBridge<DeploymentBridge>('deployment');

/** 组件挂载时登记。 */
export const provideDeploymentBridge = (api: DeploymentBridge): void => bridge.provide(api);
/** 组件卸载时注销（只清理自己登记的那一份）。 */
export const resetDeploymentBridge = (api: DeploymentBridge): void => bridge.reset(api);
/** 单例侧读取；窗口未挂载时返回 null（等价于原来的 `titleEls.get(...)` 空守卫）。 */
export const getDeploymentBridge = (): DeploymentBridge | null => bridge.get();
