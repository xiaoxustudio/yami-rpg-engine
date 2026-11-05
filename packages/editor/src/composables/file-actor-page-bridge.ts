/**
 * fileActor 页的两份小桥（模块级强类型）。
 *
 * - `sync` 由页面提供：以前是 `attachElementApi(fileActor-vue-mount, { sync })`，属于元素 API；
 * - `reloadMotions` 由 `fileActor/FileActorPropertiesSection.vue` 提供：动画切换后要给
 *   「待机 / 移动动作」两个下拉换候选项并回写旧值。
 *
 * 其余 `fileActor-*` 控件分布在别的窗口里，还没迁 —— 本文件只管这两处，按最小步子走。
 */
import { createFormBridge } from './form-bridge';

export interface FileActorPageApi {
	/** 让页面按最新数据重渲染。 */
	sync(): void;
}

export interface FileActorMotionApi {
	/** 换动画后重新灌「待机 / 移动动作」候选项并回写旧值。 */
	reloadMotions(items: unknown[]): void;
}

export interface FileActorMetaApi {
	/** 清空元信息页的 8 张列表（sprites / attributes / skills / equipments / inventory / events / scripts / parameter pane）。 */
	clearLists(): void;
}

const pageBridge = createFormBridge<FileActorPageApi>('fileActorPage');
const metaBridge = createFormBridge<FileActorMetaApi>('fileActorMeta');
const motionBridge = createFormBridge<FileActorMotionApi>('fileActorMotion');

/** 页面挂载时登记。 */
export const provideFileActorPage = (api: FileActorPageApi): void => pageBridge.provide(api);
/** 页面卸载时注销。 */
export const resetFileActorPage = (api: FileActorPageApi): void => pageBridge.reset(api);
/** 单例侧读取。 */
export const getFileActorPage = (): FileActorPageApi | null => pageBridge.get();

/** 动作用属性 section 挂载时登记。 */
export const provideFileActorMotion = (api: FileActorMotionApi): void => motionBridge.provide(api);
/** 动作用属性 section 卸载时注销。 */
export const resetFileActorMotion = (api: FileActorMotionApi): void => motionBridge.reset(api);
/** 单例侧读取。 */
export const getFileActorMotion = (): FileActorMotionApi | null => motionBridge.get();

/** 元信息 section 挂载时登记。 */
export const provideFileActorMeta = (api: FileActorMetaApi): void => metaBridge.provide(api);
/** 元信息 section 卸载时注销。 */
export const resetFileActorMeta = (api: FileActorMetaApi): void => metaBridge.reset(api);
/** 单例侧读取。 */
export const getFileActorMeta = (): FileActorMetaApi | null => metaBridge.get();
