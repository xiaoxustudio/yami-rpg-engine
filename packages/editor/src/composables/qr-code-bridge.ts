/**
 * `qr-code` 窗口的交接：内容更新 + 三颗按钮的根元素。
 *
 * `WebServer` 是**非 Vue 单例**（服务层），它要的是元素语义：给按钮挂 `click`、按服务状态
 * `enable` / `disable`。窗口是懒挂载的，所以按钮不能按 id 去全局注册表找，而是窗口挂载时
 * 把「按 id 取根元素」这件事交出来（收尾方式：模块桥 + 根元素句柄）。
 */
import { createFormBridge } from './form-bridge';

export type QrCodeButtonId = 'qr-close-button' | 'qr-start-button' | 'qr-update-button';

export interface QrCodeApi {
	/** 写入二维码内容（地址 + base64 图片）。 */
	update(details: { url: string; img: string }): void;
	/** 按钮根元素；窗口未挂载时返回 null。 */
	control(id: QrCodeButtonId): HTMLElement | null;
}

const bridge = createFormBridge<QrCodeApi>('qr-code');

/** 组件挂载时登记。 */
export const provideQrCodeBridge = (api: QrCodeApi): void => bridge.provide(api);
/** 组件卸载时注销（只清理自己登记的那一份）。 */
export const resetQrCodeBridge = (api: QrCodeApi): void => bridge.reset(api);
/** 服务层读取；窗口未挂载时返回 null。 */
export const getQrCodeBridge = (): QrCodeApi | null => bridge.get();
