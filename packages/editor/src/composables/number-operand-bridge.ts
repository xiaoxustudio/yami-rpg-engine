/**
 * 数字操作数窗口（SetNumberOperand）交给 `useNumberOperandSchema` 的桥。
 *
 * schema 要：读/保存 operation、按状态显隐 operation 与 operand-operation 两行、
 * 给 common-variable 设 filter。以前全按 id 从 `composableEls` 取（窗口用 fieldRef 登记）。
 */
import { createFormBridge } from './form-bridge';
import type { ControlApi } from './control-refs';

export type NumberOperandFieldKey =
	| 'operation'
	| 'operandOperation'
	| 'commonVariable'
	| 'cooldownKey';

export interface NumberOperandApi {
	control(name: NumberOperandFieldKey): ControlApi | null;
}

const bridge = createFormBridge<NumberOperandApi>('setNumberOperand');

export const provideNumberOperand = (api: NumberOperandApi): void => bridge.provide(api);
export const resetNumberOperand = (api: NumberOperandApi): void => bridge.reset(api);
export const getNumberOperand = (): NumberOperandApi | null => bridge.get();
