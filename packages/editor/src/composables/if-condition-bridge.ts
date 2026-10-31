/**
 * if-condition 窗口的表单桥（模块级强类型，取代 DOM 属性上的 `setForm` / `getForm`）。
 *
 * 实现收口在 `composables/form-bridge.ts`；这里只声明这扇窗口的桥实例。
 * 为什么要有这一层：命令 schema 需要在窗口懒挂载完成后把值灌进去，而窗口拿不到组件实例 ——
 * 中间人从「窗口根元素上的方法」换成一个模块（生产代码只认模块；E2E 走 debug 通道）。
 */
import type { IfConditionForm } from './useIfConditionSchema';
import { createFormBridge } from './form-bridge';

export interface IfConditionBridge {
	setForm(data: Partial<IfConditionForm>): void;
	getForm(): IfConditionForm;
}

const bridge = createFormBridge<IfConditionBridge>('if-condition');

/** 组件挂载时登记。 */
export const provideIfConditionBridge = (api: IfConditionBridge): void => bridge.provide(api);
/** 组件卸载时注销（只清理自己登记的那一份）。 */
export const resetIfConditionBridge = (api: IfConditionBridge): void => bridge.reset(api);
/** schema 侧读取；窗口未挂载时返回 null。 */
export const getIfConditionBridge = (): IfConditionBridge | null => bridge.get();
