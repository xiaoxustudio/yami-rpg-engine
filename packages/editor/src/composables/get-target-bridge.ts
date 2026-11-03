/**
 * getTarget 窗口的**控件级能力桥**（模块级强类型）。
 *
 * 命令 schema 载入表单时要给窗口里的下拉灌候选项。旧做法是按 id 从 `composableEls` 取元素再调
 * `loadItems`；窗口迁成模板 ref 后控件不再进注册表，于是这个能力由窗口实现、经模块桥交出 ——
 * schema 不再知道控件 id。
 *
 * 实现收口在 `composables/form-bridge.ts`（同一把 id 只留一份当前实例，卸载即注销）。
 */
import { createFormBridge } from './form-bridge';

export interface GetTargetBridge {
	/** 灌入候选项（一次给全部下拉）。 */
	loadItems(items: unknown[]): void;
}

const bridge = createFormBridge<GetTargetBridge>('getTarget');

/** 组件挂载时登记。 */
export const provideGetTargetBridge = (api: GetTargetBridge): void => bridge.provide(api);
/** 组件卸载时注销（只清理自己登记的那一份）。 */
export const resetGetTargetBridge = (api: GetTargetBridge): void => bridge.reset(api);
/** schema 侧读取；窗口未挂载时返回 null（等价于原来的 `composableEls.get(...)`）。 */
export const getGetTargetBridge = (): GetTargetBridge | null => bridge.get();
