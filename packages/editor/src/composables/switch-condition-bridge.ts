/**
 * 切换条件窗口的桥（模块级强类型）。
 *
 * `useSwitchConditionSchema` 在读写时要用到两个控件（键盘键码 / 手柄按钮），
 * 以前按 id 从 `composableEls` 取。现在窗口按逻辑名交出。
 */
import { createFormBridge } from './form-bridge';
import type { ControlApi } from './control-refs';

export type SwitchConditionKey = 'keyboard' | 'gamepad';

export interface SwitchConditionApi {
	control(name: SwitchConditionKey): ControlApi | null;
}

const bridge = createFormBridge<SwitchConditionApi>('switchCondition');

export const provideSwitchCondition = (api: SwitchConditionApi): void => bridge.provide(api);
export const resetSwitchCondition = (api: SwitchConditionApi): void => bridge.reset(api);
export const getSwitchCondition = (): SwitchConditionApi | null => bridge.get();
