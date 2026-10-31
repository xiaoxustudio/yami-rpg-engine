/**
 * exportLanguage 窗口的表单 + 控件桥（模块级强类型）。
 *
 * 取代两样东西：
 *   1. DOM 属性上的 `setForm` / `getForm`（表单桥）；
 *   2. `localEls.get('exportLanguage-first')?.loadItems(...)` 这类**按 id 取元素**的控件访问。
 *
 * 关键点：`loadItems` 是控件级能力，窗口自己持有两个 SelectBox 的模板 ref（defineExpose），
 * 所以由组件实现、经桥暴露给单例（`local/export-language-window.ts`）—— 单例不再需要知道
 * 控件 id，也不再有「窗口未挂载」的元素判空。
 *
 * 实现收口在 `composables/form-bridge.ts`；这里只声明这扇窗口的桥实例。
 */
import type { ExportLanguageForm } from '@app/local/export-language-window.ts';
import { createFormBridge } from '@app/composables/form-bridge';

export interface ExportLanguageBridge {
	setForm(data: Partial<ExportLanguageForm>): void;
	getForm(): ExportLanguageForm;
	/** 灌入两个下拉的候选项（第一个：语言；第二个：可选语言，含「不导出」等占位项）。 */
	loadItems(first: unknown[], second: unknown[]): void;
}

const bridge = createFormBridge<ExportLanguageBridge>('exportLanguage');

/** 组件挂载时登记。 */
export const provideExportLanguageBridge = (api: ExportLanguageBridge): void => bridge.provide(api);
/** 组件卸载时注销（只清理自己登记的那一份）。 */
export const resetExportLanguageBridge = (api: ExportLanguageBridge): void => bridge.reset(api);
/** 单例侧读取；窗口未挂载时返回 null（等价于原来的 `localEls.get(...)` 空守卫）。 */
export const getExportLanguageBridge = (): ExportLanguageBridge | null => bridge.get();
