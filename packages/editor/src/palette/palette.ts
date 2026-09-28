import { PaletteEngine } from '@app/engine/palette/palette-engine.ts';
import type { MarkCanvasShape, MarkPosition } from '@app/engine/palette/palette-engine.ts';
import type { YamiElement } from '@app/types/element-api';
import type { YamiEvent } from '@app/types/editor-event';
import type { Timer } from '@app/utils/timer';
import type { FileMeta } from '@app/data/metadata-manifest.ts';
import type { EditorProjectShape } from '@app/stores/editor';
import type { PaletteMode, PaletteState, PaletteTilesetShape } from '@app/stores/palette';

/**
 * 「调色板当前的拖拽事件」—— `Palette.dragging` 存的就是那个**就地加字段**的指针事件。
 *
 * 形状取自 `palette-pointer.ts:16`（`marqueePointerdown` 的形参）与各读点
 * （`dragging.mode` / `.active` / `.startX` / `.startY` / `.startIndex` / `.latest` /
 * `.scrollLeft` / `.scrollTop` / `.priorities`，另有三处 `dragging === null` 判断）。
 * 写法沿用第 10 轮 `UIDragEvent`：字段列全并**设为必填**，写入点用一句 `as` 说明
 * 「这一刻它已被就地补全」（不同 mode 分支补的是不同字段），免得每个读点都写 `!`。
 */
export interface PaletteDragEvent extends PointerEvent {
	mode: string;
	active: boolean;
	startX: number;
	startY: number;
	startIndex: number;
	/** 拖拽过程中被就地更新的最新事件（`palette-pointer.ts:407` 赋值、`:484` 读）。 */
	latest: PointerEvent;
	scrollLeft: number;
	scrollTop: number;
	priorities: number[];
	tags: number[];
	tiles: number[];
}

/**
 * `Palette.marquee` 上挂的扩展（组件 `YMMarqueeArea.vue` 的通用面 + 本域另挂的那些）。
 *
 * 与第 12 轮 `SceneMarqueeExtensions` 同一手法：`visible` / `x` / `y` / `width` / `height` /
 * `scaleX` / `scaleY` / `select` / `resize` 来自组件；`originX` / `originY`（`palette-engine.ts`
 * 的绘制读）、`customSelect`（`palette-initialize.ts:71`）、`customUnselect`、
 * `customShiftAutoTile` 是本域挂的。
 */
export interface PaletteMarqueeExtensions {
	visible: boolean;
	x: number;
	y: number;
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
	originX: number;
	originY: number;
	/**
	 * `palette-initialize.ts:75` 挂的选择器。**两个调用形态**都真实存在：
	 * 带坐标画框（`customSelect('source', x, y)`，测试与拖拽主路径）与只给一侧
	 * （`palette-pointer.ts:451` 的 `customSelect('source')`）⇒ 坐标声明为可选；
	 * 实现侧缺省值是 `NaN`，与原来那次 `undefined * scaleX` **逐字等价**。
	 */
	customSelect: (key: 'source' | 'destination', x?: number, y?: number) => void;
	/** `palette-initialize.ts:100` 挂的「取消选中」：形参是要清掉的那一侧。 */
	customUnselect: (key: 'source' | 'destination') => void;
	/** `palette-initialize.ts:104` 挂的双选区交换（无参）。 */
	customShiftAutoTile: () => void;
	select: (x?: number, y?: number, width?: number, height?: number) => void;
	resize: () => void;
}

/**
 * 调色板那块 `<canvas>`（`palette-canvas`）。
 *
 * 除了标准属性，运行期还在它上面挂了一个 `dpr`（`palette-image.ts:267/271` 缓存
 * 上次设置过的 `devicePixelRatio`，用来避免重复设宽高）⇒ 具名扩展类型。
 */
export interface PaletteCanvasElement extends HTMLCanvasElement {
	dpr?: number;
}

/**
 * 调色板单例（`Palette`）的形状。
 *
 * **第 238 轮收口**：此前是一行 `export const Palette: Record<string, any>` + 87 个 `null` 占位。
 * 成员分四类，逐条对齐来源：
 * 1. **DOM 元素**（`palette-initialize.ts:16-31` 的 `initialize` 逐个 `paletteEls.get(...)`）；
 * 2. **数据 / 数值字段**（同一处赋初值、`resize` 与各绘制函数读写）；
 * 3. **本域方法**（`palette-initialize/-file/-image/-events/-pointer/-selection/-autotile.ts`
 *    里的 `Palette.x = function …`，签名逐条按实现给的形参写）；
 * 4. **引擎方法与桥键**：`PaletteEngine` 的 20 条镜像（本文件下方）+ 7 个
 *    `Object.defineProperty` 转发到 `stores/palette.ts` 的桥键（类型直接引用那边的公开类型）。
 *
 * **非空 vs 可空**的口径（这是把 314 条错误降到个位数的关键一步）：DOM/数值字段声明为**非空** ——
 * `initialize`/`resize` 赋值，运行期只有 `meta` / `symbol` / `dragging` 会被写回 `null`
 * （`palette-file.ts:59/68`），`markCanvas` 则是**首次用时才建**，所以这四个保持可空；
 * `dragging` 的初值 `null` 还必须留在字面量里（`palette-events.ts:184` 等处 `=== null` 判等）。
 * 方法一律非空，字面量因此改用单例惯用式 `satisfies Partial<PaletteShape> as … as PaletteShape`。
 *
 * 字面量里原有的 `priorities` / `terrains` 两个字段已删：全仓既无写入也无读取
 * （同名成员只出现在 Scene 单例上）。
 */
export interface PaletteShape {
	// —— 1. DOM 元素 ——
	page: YamiElement;
	head: YamiElement;
	body: YamiElement;
	window: YamiElement;
	canvas: PaletteCanvasElement;
	/**
	 * 2D 上下文。取值点是 `palette-initialize.ts:34` 的 `canvas.getContext('2d', …)` ——
	 * `getContext` 的类型是 `| null`，但那块画布只有这一种用途、后面全程按非空使用，
	 * 故在该赋值点用一次 `!` 说明前提，这里声明为非空。
	 */
	context: CanvasRenderingContext2D;
	screen: YamiElement;
	marquee: YamiElement & PaletteMarqueeExtensions;
	itemScroll: YamiElement;
	itemPriority: YamiElement;
	itemTag: YamiElement;
	itemTerrain: YamiElement;
	itemEdit: YamiElement;
	zoomSlider: YamiElement;
	// —— 2. 数据 / 数值字段 ——
	/** 图块组的元数据（`palette-file.ts:25` 的 `open(meta)` 写入；`palette-engine.ts` 往 `.x/.y` 写值）。 */
	meta: FileMeta | null;
	/** 已解码的图像表；装载中的项用 `symbol` 占位（`palette-image.ts:193-198`）。 */
	images: Record<string, HTMLImageElement | symbol | null>;
	/** 当前装载批次令牌（`palette-image.ts:193` 的 `Symbol()`；`close()` 置 null）。 */
	symbol: symbol | null;
	/** 优先级标记画布（`palette-engine.ts` 的 `createMarkCanvas` **首次用时才建** ⇒ 可空）。 */
	markCanvas: MarkCanvasShape | null;
	/** 拖拽中的指针事件（`close()`/`pointerup` 置 null，三处 `=== null` 判等）。 */
	dragging: PaletteDragEvent | null;
	zoomTimer: Timer;
	openIndex: number;
	gridColor: string;
	tilesetMap: Record<string, string>;
	explicit: boolean;
	scale: number;
	scaleX: number;
	scaleY: number;
	scaledTileWidth: number;
	scaledTileHeight: number;
	outerWidth: number;
	outerHeight: number;
	screenWidth: number;
	screenHeight: number;
	scrollLeft: number;
	scrollTop: number;
	scrollRight: number;
	scrollBottom: number;
	centerOffsetX: number;
	centerOffsetY: number;
	paddingLeft: number;
	paddingTop: number;
	centerX: number;
	centerY: number;
	// —— 3. 本域方法 ——
	initialize: () => void;
	open: (meta: FileMeta | null) => void;
	close: () => void;
	suspend: () => void;
	resume: () => void;
	setZoom: (zoom: number) => void;
	setImage: (image: string) => void;
	setSize: (width: number, height: number) => void;
	setTileSize: (tileWidth: number, tileHeight: number) => void;
	setTerrain: (x: number, y: number, offset: number) => void;
	loadImages: () => Promise<void>;
	updateHead: () => void;
	resize: () => void;
	updateInfo: (index?: number | null) => void;
	editAutoTile: (index: number) => void;
	copyAutoTile: (index: number) => void;
	pasteAutoTile: (index: number) => void;
	deleteAutoTile: (index: number) => void;
	openSelection: () => void;
	editSelection: () => void;
	editTagAt: (x: number, y: number) => void;
	skipScrollEvent: (enabled?: boolean) => void;
	switchScroll: (enabled?: boolean) => void;
	switchPriority: (enabled?: boolean) => void;
	switchTag: (enabled?: boolean) => void;
	switchTerrain: (enabled?: boolean) => void;
	switchEdit: (enabled?: boolean) => void;
	saveToProject: (project: EditorProjectShape) => void;
	loadFromProject: (project: EditorProjectShape) => void;
	windowResize: (event: YamiEvent) => void;
	themechange: (event: YamiEvent) => void;
	screenKeydown: (event: KeyboardEvent) => void;
	screenWheel: (event: WheelEvent) => void;
	screenUserscroll: (event: YamiEvent) => void;
	screenBlur: (event: YamiEvent) => void;
	/**
	 * 入口收的是**普通** `PointerEvent`（DOM 直接派发；`LayoutPanel.vue` 等处的
	 * `Palette?.marqueePointerdown?.(event)` 就是这种调用）；实现内部再往里补
	 * `mode` / `startX` 等字段并落到 `dragging`（类型 `PaletteDragEvent`）上 ——
	 * 那些字段在入口处都是可选的，所以这里按 DOM 的真实形态声明。
	 */
	marqueePointerdown: (event: PointerEvent) => void;
	marqueePointermove: (event: PointerEvent) => void;
	marqueePointerleave: (event: PointerEvent) => void;
	marqueeDoubleclick: (event: PointerEvent) => void;
	marqueePopup: (event: PointerEvent) => void;
	pointerup: (event: PointerEvent) => void;
	pointermove: (event: PointerEvent) => void;
	// —— 4. 引擎镜像（本文件下方 20 行 `Palette.x = PaletteEngine.x`） ——
	getTileCoords: (event: PointerEvent, clamp?: boolean) => { x: number; y: number };
	updateCamera: (x?: number, y?: number) => void;
	updateTransform: () => void;
	updateBackground: () => void;
	createMarkCanvas: () => MarkCanvasShape;
	rebuildMarkCanvas: (canvas: MarkCanvasShape) => void;
	ensureMarkPosition: (canvas: MarkCanvasShape, text: string, key?: string) => MarkPosition;
	drawTileset: () => void;
	drawTiles: () => void;
	drawTileGrid: () => void;
	drawPriorities: () => void;
	drawTags: () => void;
	drawTerrains: () => void;
	selectTiles: (x: number, y: number, width: number, height: number) => void;
	copyTilesFromScene: (x: number, y: number, width: number, height: number) => void;
	flipTiles: () => void;
	scrollToSelection: (shiftKey: boolean) => void;
	requestRendering: () => void;
	renderingFunction: () => void;
	stopRendering: () => void;
	// —— 4b. 桥键（`Object.defineProperty` 转发到 `stores/palette.ts`） ——
	state: PaletteState;
	mode: PaletteMode;
	zoom: number | null;
	showGrid: boolean;
	scrollable: boolean;
	activeIndex: number | null;
	tileset: PaletteTilesetShape | null;
}

export const Palette = {
	explicit: false,
	tilesetMap: {},
	// ⚠️ 必须保留 `null` 初值：`palette-events.ts:184` / `:318` / `palette-pointer.ts:243`
	// 都用 `dragging === null` 判等（`undefined` 会让这些分支换一条路）。
	dragging: null
} satisfies Partial<PaletteShape> as Partial<PaletteShape> as PaletteShape;

export interface ClipboardShape {
	has(format: string): boolean;
	read(format: string): { tile: unknown; priority: unknown; terrain: unknown } | undefined;
	write(format: string, object: { tile: unknown; priority: unknown; terrain: unknown }): void;
}

Palette.getTileCoords = PaletteEngine.getTileCoords;
Palette.updateCamera = PaletteEngine.updateCamera;
Palette.updateTransform = PaletteEngine.updateTransform;
Palette.updateBackground = PaletteEngine.updateBackground;
Palette.createMarkCanvas = PaletteEngine.createMarkCanvas;
Palette.rebuildMarkCanvas = PaletteEngine.rebuildMarkCanvas;
Palette.ensureMarkPosition = PaletteEngine.ensureMarkPosition;
Palette.drawTileset = PaletteEngine.drawTileset;
Palette.drawTiles = PaletteEngine.drawTiles;
Palette.drawTileGrid = PaletteEngine.drawTileGrid;
Palette.drawPriorities = PaletteEngine.drawPriorities;
Palette.drawTags = PaletteEngine.drawTags;
Palette.drawTerrains = PaletteEngine.drawTerrains;
Palette.selectTiles = PaletteEngine.selectTiles;
Palette.copyTilesFromScene = PaletteEngine.copyTilesFromScene;
Palette.flipTiles = PaletteEngine.flipTiles;
Palette.scrollToSelection = PaletteEngine.scrollToSelection;
Palette.requestRendering = PaletteEngine.requestRendering;
Palette.renderingFunction = PaletteEngine.renderingFunction;
Palette.stopRendering = PaletteEngine.stopRendering;

const paletteBridgeKeys = [
	'state',
	'mode',
	'zoom',
	'showGrid',
	'scrollable',
	'activeIndex',
	'tileset'
] as const;
import { getPaletteStore } from '@app/stores/palette';

for (const key of paletteBridgeKeys) {
	Object.defineProperty(Palette, key, {
		get: () => getPaletteStore()[key],
		set: (value: unknown) => {
			Reflect.set(getPaletteStore(), key, value);
		},
		configurable: true
	});
}

export const paletteReady = import('./register.ts').then(() => undefined).catch(() => undefined);
