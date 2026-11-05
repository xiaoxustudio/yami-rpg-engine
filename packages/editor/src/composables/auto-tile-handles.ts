/**
 * autoTile / autoTile-selectNode 两个窗口交给单例的**句柄表**（模块级强类型）。
 *
 * `palette/auto-tile.ts` 缓存 canvas / templates / nodes / frames 并长期驱动它们；
 * `composables/useTileNodeWindow.ts` 用 getCanvas/getScreen/getMarquee 按需取。两者都是
 * 「长期持有元素」的形状 → 窗口挂载时一次交出句柄表，卸载注销。
 */
import { createFormBridge } from './form-bridge';
import type { YamiElement } from '@app/types/element-api';

/** `autoTile` 窗口（模板 / 节点 / 帧三张列表 + 画布）。 */
export interface AutoTileHandles {
	root: YamiElement;
	canvas: HTMLCanvasElement;
	templates: YamiElement;
	nodes: YamiElement;
	frames: YamiElement;
}

/** `autoTile-selectNode` 窗口（画布 + 容器 + 选框）。 */
export interface TileNodeHandles {
	root: HTMLElement;
	canvas: HTMLCanvasElement;
	screen: HTMLElement;
	marquee: YamiElement;
}

const autoTileBridge = createFormBridge<AutoTileHandles>('autoTile');
const tileNodeBridge = createFormBridge<TileNodeHandles>('autoTileSelectNode');

/** `autoTile` 窗口挂载时登记。 */
export const provideAutoTileHandles = (handles: AutoTileHandles): void =>
	autoTileBridge.provide(handles);
/** `autoTile` 窗口卸载时注销。 */
export const resetAutoTileHandles = (handles: AutoTileHandles): void =>
	autoTileBridge.reset(handles);
/** `autoTile` 单例侧读取。 */
export const getAutoTileHandles = (): AutoTileHandles | null => autoTileBridge.get();

/** `autoTile-selectNode` 窗口挂载时登记。 */
export const provideTileNodeHandles = (handles: TileNodeHandles): void =>
	tileNodeBridge.provide(handles);
/** `autoTile-selectNode` 窗口卸载时注销。 */
export const resetTileNodeHandles = (handles: TileNodeHandles): void =>
	tileNodeBridge.reset(handles);
/** `useTileNodeWindow` 侧读取。 */
export const getTileNodeHandles = (): TileNodeHandles | null => tileNodeBridge.get();
