/**
 * autoTile-frameIndex 窗口交给单例的**句柄表**（模块级强类型）。
 *
 * `palette/tile-frame-index.ts` 用 7 个 getter 按需从 `paletteEls` 取元素（window / screen /
 * clip / mask / image / marquee / info）。改成一次交出句柄表后，getter 只读这份表，
 * 注册表不再参与；窗口卸载即注销。
 *
 * 与 `image-crop-handles.ts` / `enum-handles.ts` 同一个模式。
 */
import { createFormBridge } from './form-bridge';
import type { YamiElement } from '@app/types/element-api';

export interface FrameIndexHandles {
	win: YamiElement;
	screen: YamiElement;
	clip: YamiElement;
	mask: YamiElement;
	image: YamiElement;
	marquee: YamiElement;
	info: YamiElement;
}

const bridge = createFormBridge<FrameIndexHandles>('autoTileFrameIndex');

/** 窗口挂载时登记。 */
export const provideFrameIndexHandles = (handles: FrameIndexHandles): void =>
	bridge.provide(handles);
/** 窗口卸载时注销（只清理自己登记的那一份）。 */
export const resetFrameIndexHandles = (handles: FrameIndexHandles): void => bridge.reset(handles);
/** 单例侧读取；窗口未挂载时返回 null（等价于原来的「元素不存在就静默跳过」）。 */
export const getFrameIndexHandles = (): FrameIndexHandles | null => bridge.get();
