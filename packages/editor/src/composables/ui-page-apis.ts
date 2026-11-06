/**
 * UI 元素页的 `sync` 桥（按页一份，模块级强类型）。
 *
 * 这些页原来把 `{ sync }`（有的还带 `form`）用 `attachElementApi` 挂到页面根元素上，
 * 单例再按 id 取元素调用 —— 那正是「元素 API」入口。现在页面自己交出，单例按页取 api。
 */
import { createFormBridge } from './form-bridge';

export interface UiPageApi {
	/** 让页面按最新数据重渲染。 */
	sync(): void;
}

const progressBridge = createFormBridge<UiPageApi>('uiProgressBarPage');
const dialogBridge = createFormBridge<UiPageApi>('uiDialogBoxPage');

export const provideUiProgressBarPage = (api: UiPageApi): void => progressBridge.provide(api);
export const resetUiProgressBarPage = (api: UiPageApi): void => progressBridge.reset(api);
export const getUiProgressBarPage = (): UiPageApi | null => progressBridge.get();

export const provideUiDialogBoxPage = (api: UiPageApi): void => dialogBridge.provide(api);
export const resetUiDialogBoxPage = (api: UiPageApi): void => dialogBridge.reset(api);
export const getUiDialogBoxPage = (): UiPageApi | null => dialogBridge.get();
