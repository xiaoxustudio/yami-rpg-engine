/**
 * downloadFile 窗口的**控件级能力桥**（模块级强类型）。
 *
 * schema 载入时要按 `isBackground` 开关「写入路径」控件。旧做法是按 id 从 `composableEls` 取元素
 * 再 `enable` / `disable`；窗口迁成模板 ref 后控件不再进注册表，于是开关能力由窗口实现、
 * 经模块桥交出 —— schema 不再知道控件 id。
 *
 * 实现收口在 `composables/form-bridge.ts`（同一把 id 只留一份当前实例，卸载即注销）。
 */
import { createFormBridge } from './form-bridge';

export interface DownloadFileBridge {
	/** 开关「写入路径」控件（false 时置灰）。 */
	setPathEnabled(enabled: boolean): void;
}

const bridge = createFormBridge<DownloadFileBridge>('downloadFile');

/** 组件挂载时登记。 */
export const provideDownloadFileBridge = (api: DownloadFileBridge): void => bridge.provide(api);
/** 组件卸载时注销（只清理自己登记的那一份）。 */
export const resetDownloadFileBridge = (api: DownloadFileBridge): void => bridge.reset(api);
/** schema 侧读取；窗口未挂载时返回 null。 */
export const getDownloadFileBridge = (): DownloadFileBridge | null => bridge.get();
