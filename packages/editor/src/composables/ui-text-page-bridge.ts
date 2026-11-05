/**
 * uiText 页的接缝（模块级强类型）。
 *
 * `inspector/element-text-page.ts` 原来按 id 取 `uiText-vue-mount` 元素，用 `attachElementApi`
 * 挂 `{ sync, form }` 后调用。现在页面自己交出这两样：`sync()` 让它重渲染，`form` 是页面表单真源
 * （单例按 `effect.type` 分支时要读它）。
 */
import { createFormBridge } from './form-bridge';

export interface UiTextPageApi {
	sync(): void;
	form: Record<string, unknown>;
}

const bridge = createFormBridge<UiTextPageApi>('uiTextPage');

export const provideUiTextPage = (api: UiTextPageApi): void => bridge.provide(api);
export const resetUiTextPage = (api: UiTextPageApi): void => bridge.reset(api);
export const getUiTextPage = (): UiTextPageApi | null => bridge.get();
