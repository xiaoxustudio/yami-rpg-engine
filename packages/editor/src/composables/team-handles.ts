/**
 * team 窗口交给 `useTeamWindow` 的**句柄表**（模块级强类型）。
 *
 * 这个 composable 会长期持有列表元素（挂 `mountListMethods` / `getListConfig` / `bind`），
 * 还要在列表上挂 `keydown` / `pointerdown` —— 属于「长期持有元素」的形状，按句柄表交接。
 */
import { createFormBridge } from './form-bridge';

export interface TeamHandles {
	/** 窗口根元素（`close` / `closed` 事件来源）。 */
	root: HTMLElement;
	/** 队伍列表（ui-kit TreeList 元素）。 */
	list: HTMLElement;
}

const bridge = createFormBridge<TeamHandles>('teamWindow');

export const provideTeamHandles = (handles: TeamHandles): void => bridge.provide(handles);
export const resetTeamHandles = (handles: TeamHandles): void => bridge.reset(handles);
export const getTeamHandles = (): TeamHandles | null => bridge.get();
