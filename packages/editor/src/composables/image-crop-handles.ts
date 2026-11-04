/**
 * imageClip 窗口交给单例的**句柄表**（模块级强类型）。
 *
 * `tools/image-crop-window.ts` 是长期持有 DOM 的单例（`window` / `screen` / `image` / `marquee`
 * 都存成字段，跨 open/close 复用），所以它不是「每次调用取一次元素」的形状 —— 换成一次性把
 * 句柄交出来最合适：窗口在挂载时登记自己的四个节点，卸载时注销，单例不再按 id 去注册表摸。
 *
 * 这是「长期持有元素」类单例的样板（`enum-window.ts` 那类同理）。P3 收口时这些句柄会逐项
 * 换成组件实例能力，届时只改本文件与窗口。
 */
import { createFormBridge } from './form-bridge';

/** 裁剪框（`MarqueeArea` 挂在元素上的那套 api）。 */
export interface CropMarquee extends HTMLElement {
	select(x: number, y: number, width: number, height: number): void;
	scaleX: number;
	scaleY: number;
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface ImageCropHandles {
	/** 窗口根元素（`resize` / `closed` 事件的来源）。 */
	win: HTMLElement;
	/** 图像容器（键盘事件、尺寸计算）。 */
	screen: HTMLElement;
	image: HTMLImageElement;
	marquee: CropMarquee;
}

const bridge = createFormBridge<ImageCropHandles>('imageCrop');

/** 窗口挂载时登记。 */
export const provideImageCropHandles = (handles: ImageCropHandles): void => bridge.provide(handles);
/** 窗口卸载时注销（只清理自己登记的那一份）。 */
export const resetImageCropHandles = (handles: ImageCropHandles): void => bridge.reset(handles);
/** 单例侧读取；窗口未挂载时返回 null（等价于原来的「元素不存在就静默跳过」）。 */
export const getImageCropHandles = (): ImageCropHandles | null => bridge.get();
