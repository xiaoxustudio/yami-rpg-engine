/**
 * 标题栏「导出 APK」与进度窗口交给 `title/menu-bar.ts` 的桥（模块级强类型）。
 *
 * menu-bar 原来按 id 从 `titleEls` 取三个节点：窗口根（挂 closed）、图标输入（挂 mouseenter 提示）、
 * 导出按钮（挂 click / disable / enable），以及进度窗口的 `windowProgress-info` 写文案。
 * 现在两个窗口各自交出能力。
 */
import { createFormBridge } from './form-bridge';

export interface ExportApkApi {
	/** 窗口关闭时回调（menu-bar 用来复位表单监听与 ApkBuilder）。 */
	onClosed(handler: () => void): void;
	/** 鼠标移到图标输入上时回调（用于显示路径提示）。 */
	onIconHover(handler: () => void): void;
	/** 图标提示文案（窗口自己调 setTooltip）。 */
	setIconTooltip?(text: string): void;
	/** 点「导出」按钮时回调。 */
	onBuildClick(handler: () => void): void;
	/** 导出进行中禁用按钮、结束后恢复。 */
	setButtonEnabled(enabled: boolean): void;
}

export interface WindowProgressApi {
	/** 写进度窗口的提示文案。 */
	setInfo(text: string): void;
}

const exportBridge = createFormBridge<ExportApkApi>('exportApk');
const progressBridge = createFormBridge<WindowProgressApi>('windowProgress');

export const provideExportApk = (api: ExportApkApi): void => exportBridge.provide(api);
export const resetExportApk = (api: ExportApkApi): void => exportBridge.reset(api);
export const getExportApk = (): ExportApkApi | null => exportBridge.get();

export const provideWindowProgress = (api: WindowProgressApi): void => progressBridge.provide(api);
export const resetWindowProgress = (api: WindowProgressApi): void => progressBridge.reset(api);
export const getWindowProgress = (): WindowProgressApi | null => progressBridge.get();
