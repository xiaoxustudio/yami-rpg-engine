/**
 * 文件场景页的接缝（模块级强类型）。
 *
 * 1. `sync` 桥：`inspector/file-scene-page.ts` 原来按 id 取 `fileScene-vue-mount` 元素调 `.sync()`；
 * 2. `FileSceneControls` + `FILE_SCENE_CONTROLS_KEY`：页面建表、`FileScenePropertiesSection`
 *    往里填自己那一半，页面再用表里的实例做 `bindInput` / `bindSliders`。
 */
import type { InjectionKey } from 'vue';
import { createFormBridge } from './form-bridge';
import type { ControlApi } from './control-refs';

export interface FileScenePageApi {
	/** 让页面按最新数据重渲染。 */
	sync(): void;
}

export type FileSceneControls = Partial<Record<string, ControlApi | null>>;

/** section 用：`inject` 这张表，挂载时把自己那一半填进去。 */
export const FILE_SCENE_CONTROLS_KEY: InjectionKey<FileSceneControls> = Symbol('fileSceneControls');

const bridge = createFormBridge<FileScenePageApi>('fileScenePage');

export const provideFileScenePage = (api: FileScenePageApi): void => bridge.provide(api);
export const resetFileScenePage = (api: FileScenePageApi): void => bridge.reset(api);
export const getFileScenePage = (): FileScenePageApi | null => bridge.get();
