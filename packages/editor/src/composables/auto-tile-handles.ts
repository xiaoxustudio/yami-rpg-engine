/**
 * autoTile / autoTile-selectNode 两个窗口交给单例的**句柄表**（模块级强类型）。
 *
 * `palette/auto-tile.ts` 缓存 canvas / templates / nodes / frames 并长期驱动它们；
 * `composables/useTileNodeWindow.ts` 用 getCanvas/getScreen/getMarquee 按需取。两者都是
 * 「长期持有句柄」的形状 → 窗口挂载时一次交出句柄表，卸载注销。
 *
 * 句柄的**种类**按控件契约走：`YMCommonList` 已改成「方法与状态只在组件实例上、元素只做 DOM」，
 * 所以节点 / 帧两张普通列表交出的是 editor `CommonList` 包装层实例（见 `AutoTileListHandle`）；
 * 需要 DOM 的地方统一读实例上的 `root`，不再在元素上找方法。
 */
import { createFormBridge } from './form-bridge';
import type { YamiElement } from '@app/types/element-api';

/**
 * autoTile 里两张 `YMCommonList` 列表（节点 / 帧）的句柄 = **组件实例**。
 *
 * 这里按「消费方真正用到的那一份」声明结构类型，而不是 import 包装层的 SFC 类型：
 *  · 句柄表是单例侧与窗口侧之间的模块级契约，写清方法面才能让 `auto-tile.ts` 在 `tsc` 下
 *    拿到真类型（SFC 的 `InstanceType` 在纯 `tsc` 里退化成 `any`，拼错方法名不会红）；
 *  · 包装层将来增删方法时，这里会先红，而不是等运行期 `undefined is not a function`。
 *
 * `reload()` / `clear()` 仍返回宿主元素（ui-kit 的宿主语义），纯 DOM 需求走 `root`。
 */
export interface AutoTileListHandle {
	root: HTMLElement | null;
	read(): unknown;
	write(value: unknown): void;
	reload(): HTMLElement;
	appendElement(element: HTMLElement): void;
	update(): void;
	clear(): HTMLElement;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

/** `autoTile` 窗口（模板 / 节点 / 帧三张列表 + 画布）。 */
export interface AutoTileHandles {
	root: YamiElement;
	canvas: HTMLCanvasElement;
	/**
	 * 模板树仍是**根元素**：`YMTreeList` 尚未迁实例（`bind` / `addNodeTo` / `rename` 都还挂
	 * 在元素上），且 `module/monkey-patches.ts` 要改写它的 `update`。等树列表迁移时随批替换。
	 */
	templates: YamiElement;
	nodes: AutoTileListHandle;
	frames: AutoTileListHandle;
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
