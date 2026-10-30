/**
 * if-condition 窗口的表单桥（模块级强类型，取代 DOM 属性上的 `setForm` / `getForm`）。
 *
 * 为什么要有这一层：
 *   - 命令 schema（`useIfConditionSchema`）需要在窗口懒挂载完成后把值灌进去；
 *   - 窗口是懒挂载的，schema 拿不到组件实例，只能用「某个中间人」交接；
 *   - 旧实现把方法挂到窗口根元素上（`attachElementApi(el, { setForm, getForm })`），
 *     于是「元素 API」成了业务契约的一部分 —— 这正是元素契约收尾要拆的东西。
 *
 * 现在中间人是一个模块：组件挂载时 `provide`，schema 读取时 `get`，卸载时 `reset`。
 * 生产代码只认模块；真机 E2E 另有一条 debug 通道（`utils/debug-bridges.ts`）。
 */
import type { IfConditionForm } from './useIfConditionSchema';
import { exposeDebugBridge } from '@app/utils/debug-bridges';

export interface IfConditionBridge {
	setForm(data: Partial<IfConditionForm>): void;
	getForm(): IfConditionForm;
}

const BRIDGE_ID = 'if-condition';

let bridge: IfConditionBridge | null = null;

/** 组件挂载时登记（重复挂载以最后一次为准）。 */
export function provideIfConditionBridge(api: IfConditionBridge): void {
	bridge = api;
	exposeDebugBridge(BRIDGE_ID, api);
}

/** 组件卸载时注销；只清理自己登记的那一份，避免误删后挂载的实例。 */
export function resetIfConditionBridge(api: IfConditionBridge): void {
	if (bridge !== api) return;
	bridge = null;
	exposeDebugBridge(BRIDGE_ID, null);
}

/** schema 侧读取；窗口未挂载时返回 null（与原 `?.setForm` 语义一致）。 */
export function getIfConditionBridge(): IfConditionBridge | null {
	return bridge;
}
