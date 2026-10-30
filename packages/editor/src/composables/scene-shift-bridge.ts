/**
 * scene-shift 窗口的表单桥（模块级强类型，取代 DOM 属性上的 `setForm` / `getForm`）。
 *
 * 实现收口在 `composables/form-bridge.ts`；这里只声明这扇窗口的桥实例。
 */
import type { SceneShiftForm } from '@app/scene/move-scene.ts';
import { createFormBridge } from '@app/composables/form-bridge';

export interface SceneShiftBridge {
	setForm(data: Partial<SceneShiftForm>): void;
	getForm(): SceneShiftForm;
}

const bridge = createFormBridge<SceneShiftForm>('scene-shift');

/** 组件挂载时登记。 */
export const provideSceneShiftBridge = (api: SceneShiftBridge): void => bridge.provide(api);
/** 组件卸载时注销（只清理自己登记的那一份）。 */
export const resetSceneShiftBridge = (api: SceneShiftBridge): void => bridge.reset(api);
/** schema 侧读取；窗口未挂载时返回 null。 */
export const getSceneShiftBridge = (): SceneShiftBridge | null => bridge.get();
