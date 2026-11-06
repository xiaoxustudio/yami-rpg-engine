/**
 * language 窗口交给 `useProjectSettingsWindow` 的桥（模块级强类型）。
 *
 * 项目设置里「新增语言」对话框要读写三个控件（名称下拉 / 字体 / 缩放）。窗口交出这些能力，
 * 单例不再按 id 取元素。
 */
import { createFormBridge } from './form-bridge';

export interface LanguageApi {
	/** 名称下拉的候选项（语言列表）。 */
	loadNameItems(items: unknown[]): void;
	/** 打开时写入当前语言的三项值。 */
	setLanguage(value: { name: string; font: string; scale: number }): void;
	/** 确认时读回三项值。 */
	getLanguage(): { name: string; font: string; scale: number };
}

const bridge = createFormBridge<LanguageApi>('languageWindow');

export const provideLanguage = (api: LanguageApi): void => bridge.provide(api);
export const resetLanguage = (api: LanguageApi): void => bridge.reset(api);
export const getLanguage = (): LanguageApi | null => bridge.get();
