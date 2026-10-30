/**
 * setNumber-operand 窗口的表单桥（模块级强类型，取代 DOM 属性上的 `setForm` / `getForm`）。
 *
 * 与 `if-condition-bridge.ts` 同一套做法：命令 schema 需要在窗口懒挂载完成后把值灌进去，
 * 而窗口是懒挂载的、schema 拿不到组件实例 —— 中间人从「窗口根元素上的方法」换成一个模块。
 * 生产代码只认模块；真机 E2E 走 `utils/debug-bridges.ts` 的 debug 通道。
 */
import type { NumberOperandForm } from './useNumberOperandSchema';
import { exposeDebugBridge } from '@app/utils/debug-bridges';

export interface SetNumberOperandBridge {
	setForm(data: Partial<NumberOperandForm>): void;
	getForm(): NumberOperandForm;
}

const BRIDGE_ID = 'setNumber-operand';

let bridge: SetNumberOperandBridge | null = null;

/** 组件挂载时登记（重复挂载以最后一次为准）。 */
export function provideSetNumberOperandBridge(api: SetNumberOperandBridge): void {
	bridge = api;
	exposeDebugBridge(BRIDGE_ID, api);
}

/** 组件卸载时注销；只清理自己登记的那一份。 */
export function resetSetNumberOperandBridge(api: SetNumberOperandBridge): void {
	if (bridge !== api) return;
	bridge = null;
	exposeDebugBridge(BRIDGE_ID, null);
}

/** schema 侧读取；窗口未挂载时返回 null（与原 `?.setForm` 语义一致）。 */
export function getSetNumberOperandBridge(): SetNumberOperandBridge | null {
	return bridge;
}
