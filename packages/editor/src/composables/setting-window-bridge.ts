/**
 * `setting` 窗口的交接：只交出**帧根元素**。
 *
 * 设置项是数据驱动的（`setting-config` 按 schema 渲染），所以没有「一批固定控件」可交；
 * 服务层真正需要的是「在设置窗口帧内查找」——`byId` 用 `querySelector` 在帧里找，
 * 窗口开关监听也挂在帧上。这两件事都只要根元素，不要注册表。
 */
import { createFormBridge } from './form-bridge';

export interface SettingWindowApi {
	/** 窗口帧根元素；窗口未挂载时返回 null。 */
	frame(): HTMLElement | null;
}

const bridge = createFormBridge<SettingWindowApi>('setting');

/** 组件挂载时登记。 */
export const provideSettingWindowBridge = (api: SettingWindowApi): void => bridge.provide(api);
/** 组件卸载时注销（只清理自己登记的那一份）。 */
export const resetSettingWindowBridge = (api: SettingWindowApi): void => bridge.reset(api);
/** 服务层读取；窗口未挂载时返回 null。 */
export const getSettingWindowBridge = (): SettingWindowApi | null => bridge.get();
