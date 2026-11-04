/**
 * removeAnimationComponent 窗口的**控件级能力桥**（模块级强类型）。
 *
 * 命令 schema 载入/保存时要读写窗口里的控件。旧做法是按 id 从 `composableEls` 取元素再调
 * `loadItems` / `write` / `read`；窗口迁成模板 ref 后控件不再进注册表，于是这些能力由窗口
 * 实现、经模块桥交出 —— schema 不再知道控件 id。
 *
 * 实现收口在 `composables/form-bridge.ts`（同一把 id 只留一份当前实例，卸载即注销）。
 */
import { createFormBridge } from './form-bridge';

export interface RemoveAnimationComponentBridge {
	reloadMotion(items: unknown[]): void;
}

const bridge = createFormBridge<RemoveAnimationComponentBridge>('removeAnimationComponent');

/** 组件挂载时登记。 */
export const provideRemoveAnimationComponentBridge = (api: RemoveAnimationComponentBridge): void =>
	bridge.provide(api);
/** 组件卸载时注销（只清理自己登记的那一份）。 */
export const resetRemoveAnimationComponentBridge = (api: RemoveAnimationComponentBridge): void =>
	bridge.reset(api);
/** schema 侧读取；窗口未挂载时返回 null（等价于原来的 `composableEls.get(...)`）。 */
export const getRemoveAnimationComponentBridge = (): RemoveAnimationComponentBridge | null =>
	bridge.get();
