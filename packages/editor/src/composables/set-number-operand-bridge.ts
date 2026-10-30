/**
 * setNumber-operand 窗口的表单桥（模块级强类型，取代 DOM 属性上的 `setForm` / `getForm`）。
 *
 * 实现收口在 `composables/form-bridge.ts`；这里只声明这扇窗口的桥实例。
 */
import type { NumberOperandForm } from './useNumberOperandSchema';
import { createFormBridge } from './form-bridge';

export interface SetNumberOperandBridge {
	setForm(data: Partial<NumberOperandForm>): void;
	getForm(): NumberOperandForm;
}

const bridge = createFormBridge<NumberOperandForm>('setNumber-operand');

/** 组件挂载时登记。 */
export const provideSetNumberOperandBridge = (api: SetNumberOperandBridge): void =>
	bridge.provide(api);
/** 组件卸载时注销（只清理自己登记的那一份）。 */
export const resetSetNumberOperandBridge = (api: SetNumberOperandBridge): void => bridge.reset(api);
/** schema 侧读取；窗口未挂载时返回 null。 */
export const getSetNumberOperandBridge = (): SetNumberOperandBridge | null => bridge.get();
