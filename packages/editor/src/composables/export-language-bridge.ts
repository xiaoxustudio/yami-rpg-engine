/**
 * exportLanguage 窗口的表单桥（模块级强类型，取代 DOM 属性上的 `setForm` / `getForm`）。
 *
 * 实现收口在 `composables/form-bridge.ts`；这里只声明这扇窗口的桥实例。
 */
import type { ExportLanguageForm } from '@app/local/export-language-window.ts';
import { createFormBridge } from '@app/composables/form-bridge';

export interface ExportLanguageBridge {
	setForm(data: Partial<ExportLanguageForm>): void;
	getForm(): ExportLanguageForm;
}

const bridge = createFormBridge<ExportLanguageForm>('exportLanguage');

/** 组件挂载时登记。 */
export const provideExportLanguageBridge = (api: ExportLanguageBridge): void => bridge.provide(api);
/** 组件卸载时注销（只清理自己登记的那一份）。 */
export const resetExportLanguageBridge = (api: ExportLanguageBridge): void => bridge.reset(api);
/** schema 侧读取；窗口未挂载时返回 null。 */
export const getExportLanguageBridge = (): ExportLanguageBridge | null => bridge.get();
