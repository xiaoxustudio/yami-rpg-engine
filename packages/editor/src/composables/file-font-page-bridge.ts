/**
 * fileFont 页的**页面能力桥**（模块级强类型）。
 *
 * `inspector/file-font-page.ts` 是文件字体页的单例：它需要「让页面重渲染」和「按 dpr 调预览字号」。
 * 旧做法是按 id 从 `inspectorEls` 取元素 —— 根元素调 `.update()`、网格节点写 `style.fontSize`。
 * 页面迁成模板 ref 后这两件事由页面自己实现，经本桥交出：单例不再知道控件 id，也不用判空元素。
 *
 * 实现收口在 `composables/form-bridge.ts`（同一把 id 只留一份当前实例，卸载即注销）。
 */
import { createFormBridge } from './form-bridge';

export interface FileFontPageBridge {
	/** 让页面按最新数据重渲染。 */
	update(): void;
	/** 按 devicePixelRatio 调整预览区字号（12 / dpr px）。 */
	setPreviewFontSize(size: number): void;
}

const bridge = createFormBridge<FileFontPageBridge>('fileFontPage');

/** 页面挂载时登记。 */
export const provideFileFontPageBridge = (api: FileFontPageBridge): void => bridge.provide(api);
/** 页面卸载时注销（只清理自己登记的那一份）。 */
export const resetFileFontPageBridge = (api: FileFontPageBridge): void => bridge.reset(api);
/** 单例侧读取；页面未挂载时返回 null（等价于原来的「元素不存在就静默跳过」）。 */
export const getFileFontPageBridge = (): FileFontPageBridge | null => bridge.get();
