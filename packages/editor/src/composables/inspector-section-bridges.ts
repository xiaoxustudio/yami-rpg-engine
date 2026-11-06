/**
 * sceneActor / fileTrigger 两页的 section 桥（模块级强类型）。
 *
 * - `SceneActorMetaSection.vue` 交出 `clearLists()`（清 conditions / events / scripts /
 *   parameter-pane）与 `setScriptsDetailVisible(bool)`（本地/全局脚本切换时显隐）；
 * - `FileTriggerAnimationSection.vue` 交出 `reloadMotions(items)`（换动画后重灌动作下拉并回写）。
 */
import { createFormBridge } from './form-bridge';

export interface SceneActorMetaApi {
	clearLists(): void;
	setScriptsDetailVisible(visible: boolean): void;
}

export interface FileTriggerAnimationApi {
	reloadMotions(items: unknown[]): void;
}

const sceneActorMetaBridge = createFormBridge<SceneActorMetaApi>('sceneActorMeta');
const fileTriggerAnimationBridge =
	createFormBridge<FileTriggerAnimationApi>('fileTriggerAnimation');

export const provideSceneActorMeta = (api: SceneActorMetaApi): void =>
	sceneActorMetaBridge.provide(api);
export const resetSceneActorMeta = (api: SceneActorMetaApi): void =>
	sceneActorMetaBridge.reset(api);
export const getSceneActorMeta = (): SceneActorMetaApi | null => sceneActorMetaBridge.get();

export const provideFileTriggerAnimation = (api: FileTriggerAnimationApi): void =>
	fileTriggerAnimationBridge.provide(api);
export const resetFileTriggerAnimation = (api: FileTriggerAnimationApi): void =>
	fileTriggerAnimationBridge.reset(api);
export const getFileTriggerAnimation = (): FileTriggerAnimationApi | null =>
	fileTriggerAnimationBridge.get();
