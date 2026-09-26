import { elementDataOf } from '@ui-kit';
import { uiEls } from '@app/engine/ui/element-registry';
import { hide } from '@app/utils/element-utils.ts';
import { EventBus } from '@app/utils/event-bus.ts';
import { Scene } from '@app/scene/scene-window.ts';
// ④-2c（第 114 轮）后本文件不再**用** UIEngine（21 行镜像已退役），但这条**副作用 import 必须留着**：
// 它保证 `ui-engine.ts` 的模块体（末尾会 `registerUIEngine(UIEngine)`）在本文件**之前**求值。
// 少了它，就可能出现「UI 对象已存在、但 `uiEngineRef` 还是 null」的窗口，而 store 的 7 个引擎转发
// 在那种状态下会**静默返回 undefined**（`makeEngineForwarder` 的回退分支取不到任何函数）。
// 见 `xr.md` 第 113 轮里那条等价性论证 —— 它的前提正是「读 UI 必先求值 UIEngine」。
import '@app/engine/ui/ui-engine.ts';
import { getUIStore } from '@app/stores/ui';

import type { UINodeShape } from '@app/engine/ui/element-classes.ts';
import type { HoverNode } from './ui-facade.ts';
import type { ImageTexture } from '@app/engine/webgl/image-texture.ts';
import type { Timer } from '@app/utils/timer';
import type { History } from '@app/tools/history.ts';
import type { StageColor } from '@app/utils/stage-color';
import type { Matrix } from '@app/engine/webgl/matrix2.ts';
import type { YamiElement } from '@app/types/element-api';
import type { YamiMouseEvent } from '@app/types/editor-event';

export interface ControlPoint {
	x: number;
	y: number;
	angle: number;
}

export interface UIControlPoints {
	rotate: Record<'TL' | 'TR' | 'BL' | 'BR', ControlPoint>;
	resize: Record<'T' | 'L' | 'R' | 'B' | 'TL' | 'TR' | 'BL' | 'BR', ControlPoint>;
	list: ControlPoint[];
}

export interface UIShape {
	page: YamiElement;
	head: YamiElement;
	body: YamiElement;
	screen: YamiElement;
	history: History | null;
	controlPoints: UIControlPoints | null;
	controlPointActive: ControlPoint | null;
	controlPointRotation: number;
	translationKey: number;
	translationTimer: Timer | null;
	zoomTimer: Timer | null;
	background: StageColor;
	foreground: StageColor;
	matrix: Matrix;
	scale: number;
	scaleX: number;
	scaleY: number;
	outerWidth: number;
	outerHeight: number;
	scrollLeft: number;
	scrollTop: number;
	scrollRight: number;
	scrollBottom: number;
	centerX: number;
	centerY: number;
	centerOffsetX: number;
	centerOffsetY: number;
	padding: number;
	paddingLeft: number;
	paddingTop: number;
	inspectorTypeMap: Record<string, string>;

	// —— 引擎契约（`ui-facade.ts` 的 `UIFacadeShape`）要求、而上面那 35 条没有的 3 个（第 217 轮补） ——
	//
	// ⚠️ 为什么要补：`ui-engine.ts` 的成员表给 `this` 加了类型之后，「域模块的 `this`（单例）交给
	// 引擎成员（要 `UIFacadeShape`）」这一步**第一次被检查**。原因是实打实的：
	// `[k: string]: any` 只提供「**任意键可读**」，**不满足目标类型里具名的必填字段**
	// —— 与第 211 轮 `createPrefab` 是同一条（索引签名在这里第二次不够用）。
	//
	// 三个都**在单例上真实存在、都有写入方**（不是为了"让它编过"才补的谎）。
	/**
	 * 框选元素（`ui-initialize.ts:39` 登记；`ui-pointer` 在它上面挂拖拽状态）。
	 *
	 * 两个扩展字段按**兄弟引擎的既有约定**处理（`scene-window.ts:88` 那段注释：marquee 运行时挂载
	 * 大量扩展、"避免穷举"）—— 但这里**两处都刻意不抄**：既不抄它的 `[k: string]: any`
	 * （会让 `any-hatches` 上升），也**不加索引签名**：UI 侧的扩展只有下面这两个、是可枚举的，
	 * 而带索引签名的目标类型会让字面量那处 `satisfies Partial<UIShape>` **不可比**
	 * （"neither type sufficiently overlaps"，第 216 轮同一条教训的第三次现形）。
	 */
	marquee: YamiElement & {
		/**
		 * 框选元素的「重算」钩子（引擎与域共 14 处调用）。
		 *
		 * 声明为**非空**：它由 `ui-list.ts` 在模块加载期装上（`UI.marquee.resize = function …`），
		 * 而所有调用点都在那之后（用户交互路径）⇒ 与 `this.planToSave!()` 同类，是**既有不变式**。
		 * ⚠️ 也正因为它是"真声明"，下面字面量里那句 `UI.marquee.resize = null` 的占位已冗余、随本轮删除。
		 */
		resize: () => void;
		/** `ui-pointer.ts` 拖拽期间挂的原始指针事件（读方只问"当前是否在拖"）。 */
		pointerevent?: UIPointerEvent | null;
	};
	/** 被 hover 的节点（`ui-transform.ts` 的 `setHover` 写）。类型见 `UIFacadeShape.hover` 的说明。 */
	hover: HoverNode | null;
	/** 控制点贴图（`ui-initialize.ts:97` 载图后写）。 */
	controlPointTexture: ImageTexture | null;

	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
}

export type { UINodeShape };

export interface UIContextShape {
	meta: { guid: string; path: string };
	ui?: { width: number; height: number; nodes: UINodeShape[] } & Record<string, unknown>;
	editor?: {
		target: UINodeShape | null;
		root: UINodeShape | null;
		history: History;
		centerX: number;
		centerY: number;
	} & Record<string, unknown>;
	fontChanged?: boolean;
	languageChanged?: boolean;
	scalingChanged?: boolean;
}

export type UIPointerEvent = YamiMouseEvent & {
	dragKey?: boolean;
	absoluteAnchorX?: number;
	absoluteAnchorY?: number;
	lastAngle?: number;
	rotationRadians?: number;
	startRotation?: number;
	startWidth?: number;
	startHeight?: number;
	node?: UINodeShape;
	enabled?: boolean;
	startX?: number;
	startY?: number;
};

/**
 * UI 单例本体（**装配式**：这里只有它自己真正持有的成员，成员函数由 `uiWindowReady` 注入）。
 *
 * ## 阶段 1c 第 ④-4 步（2026-09-25 第 212 轮）：**123 行 `null` 占位表已退役**
 *
 * 此前这里跟着 134 个条目，其中 **123 个是 `initialize: null` / `open: null` / … 这类占位**
 * ——它们的用途是「给域模块先声明、后填充」（那时域模块逐个 `UI.x = …` **自我绑定**）。
 * 而第 ④-3 步（第 167–183 轮）之后，**全部 8 个域改为提供成员对象、由 `ui-members.ts` 汇总、
 * 在 `uiWindowReady` 里 `Object.assign(UI, …)` 装配** ⇒ 占位表**没有任何写入方需要用**，
 * 它剩下的作用只是「让 `UI.x` 在读到时是 `null` 而不是 `undefined`」＋「喂契约生成器」。
 *
 * 删掉它的依据（都是**实测**，不是推理）：
 * 1. **全仓没有任何地方枚举单例**（`Object.keys/entries/getOwnPropertyNames(UI)` / `...UI` /
 *    `for (const k in UI)` 命中 **0** 处，第 185 轮）⇒ 「表里有几条」对外不可观测；
 * 2. **134 个声明槽位全部另有提供者**（`declaredWithoutProvider()` **缺口 = 0**，第 187 轮）
 *    ⇒ 删掉字面量不会丢成员；
 * 3. 读侧一律是 `UI?.x?.()` / `this.x!`：`undefined` 与 `null` 在这两种写法下**行为相同**
 *    （都是 falsy、都不进 `?.` 的调用分支）。
 *
 * ## 还留着什么，以及为什么不一起删
 *
 * 下面 11 个是**真值**，各有明确的写入方/读取方，不是占位：
 * - 7 个 DOM 引用（`uiEls.get(…)`）：`ui-initialize.ts` 会读 `this.marquee` / `this.list`
 *   **作为"旧值"去 merge**（`Object.assign(this.marquee, oldMarquee)`）⇒ 模块加载期挂在这些元素上的
 *   成员（本文件下面那几行 `UI.list.copy = …`、`UI.marquee.resize = …`）必须在这里就位；
 * - `dragging` / `hover`：被 store 的 computed 与引擎读（`UI.dragging === null` 是 ui-events 的判断）；
 * - `translationKey`：位标志，初值 `0b0000`。
 *
 * ⚠️ **本文件现在就在 `engine/ui/` 下**（第 212 轮第二段：从 `legacy/` 搬出来，`legacy/` 整个删掉）。
 * 剩下的只有**真机走查**（画布渲染 / 平移缩放 / 点选 / 打开保存撤销 / 预制体）——
 * 这一类缺陷只有真机能发现（附录四/六/七/八/九记的全是这种）。
 *
 * ## 跨域调用为什么还走这个对象（路线 A，刻意为之）
 *
 * 5 个域模块体内仍有 ~70 处 `UI.<x>`（ui-list 46 · ui-events 12 · ui-pointer 7 · ui-transform 4 ·
 * ui-file 1）。它们**不能**一律改成 `this.x`：第 173/184 轮实测，其中一部分函数是**双接收者**
 * ——`this` 是元素（经 `on(list, 'keydown', …)` 注册的处理器）、`UI` 才是单例。
 * ⇒ 保留「UI 形状的 facade」并让域模块引用它，是附录十三 §三 的**路线 A**（推荐）；
 * 真要把这些依赖也去掉 = **路线 B**（成员全部改成显式接收 state 参数），属独立且更大的改动。
 */
export const UI = {
	page: uiEls.get('ui') as YamiElement,
	head: uiEls.get('ui-head') as YamiElement,
	body: hide(uiEls.get('ui-body') as YamiElement),
	screen: uiEls.get('ui-screen') as YamiElement,
	// `|| ({} as YamiElement)`：兜底对象**不是**元素，但它承重 —— 元素尚未登记时也要能加载，
	// 而下面的挂载（`elementDataOf(UI.list).…`）需要它非空。
	// 末尾那处断言是**单次** `as`（目标类型 = 源类型 & 两个扩展 ⇒ 向下断言，合法）：
	// `YamiElement` 本身不含 `resize`/`pointerevent`，第 217 轮起 `UIShape.marquee` 声明了它们。
	marquee: ((uiEls.get('ui-marquee') as YamiElement) ||
		({} as YamiElement)) as UIShape['marquee'],
	searcher: uiEls.get('ui-searcher') as YamiElement,
	list: (uiEls.get('ui-list') as YamiElement) || {},
	dragging: null as UIPointerEvent | null,
	// 类型取 `HoverNode`（含**必填**的 `instance`）而不是 `UINodeShape`：引擎的 `drawHoverWireframe`
	// **不判空就解引用** `hover.instance.visible`（缺 instance 会每帧抛）⇒「被 hover 的节点必有实例」
	// 是既有不变式，写在类型里；写入方 `ui-transform.ts` 的 `setHover` 有对应说明与单次断言。
	hover: null as HoverNode | null,
	translationKey: 0b0000,
	translationTimer: null as Timer | null,
	zoomTimer: null as Timer | null
} satisfies Partial<UIShape> as Partial<UIShape> as UIShape;

// ⚠️ 第 217 轮删除：原先这里是 `UI.marquee.resize = null;`（占位）。
// 现在 `UIShape.marquee` **真的声明了** `resize: () => void`（见接口里那段），
// 于是这行占位既编不过、也不再需要 —— 它是"用占位代替声明"那个年代的遗留写法。
// 行为不变：真正的赋值点在 `ui-list.ts` 的 `UI.marquee.resize = function …`，
// 而所有调用点都在其之后（用户交互路径），与 `this.planToSave!()` 是同一类既有不变式。

// P4b：`page` 走显式元素数据（字段已从 DATA_FIELDS 摘除）
elementDataOf<{ page?: HTMLElement | null }>(UI.list).page = uiEls.get('ui-element') as YamiElement;
elementDataOf<{ head: HTMLElement }>(UI.list).head = uiEls.get('ui-list-head') as YamiElement;
UI.list.copy = null;
UI.list.paste = null;
UI.list.delete = null;
UI.list.toggle = null;
UI.list.cancelSearch = null;
EventBus.once('editor_loaded', () => {
	UI.list.restoreRecursiveStates = Scene.list.restoreRecursiveStates;
	UI.list.setRecursiveStates = Scene.list.setRecursiveStates;
	// Scene.list.* 真定义（scene-list.ts）在 editor_loaded 时才确定，提前赋值会固化拿 null
});
UI.list.updateHead = null;

const uiBridgeKeys = ['state', 'target', 'zoom', 'width', 'height', 'mode'] as const;

for (const key of uiBridgeKeys) {
	Object.defineProperty(UI, key, {
		get: () => getUIStore()[key],
		set: (value: unknown) => {
			Reflect.set(getUIStore(), key, value);
		},
		configurable: true
	});
}

// 阶段 1c 第 ④-2c 步（第 114 轮）：把引擎的 21 个方法镜像到 UI 上的那些行已退役 ——
// 调用点直连 `UIEngine`、store 的 7 个转发改走注册进来的引擎（理由见 `xr.md` 第 112–114 轮）。

/**
 * 域模块的**加载顺序** —— 原 `legacy/register.ts` 的职责（第 212 轮第二段并进这里，那个文件已删）。
 *
 * ⚠️ 顺序有意义：`ui-initialize` 先建 DOM 引用与定时器、`ui-file` 挂文档生命周期；
 * 其余域只做赋值，彼此不依赖加载顺序。
 *
 * ⚠️ **必须动态 import**：这些域模块静态 import 本模块的 `UI`，静态引入会先于本模块体求值、踩 TDZ。
 * 原来的 `register.ts` 用的是**静态** import（被 `uiWindowReady` 动态引入，于是也晚于本模块体）——
 * 改成顺序 await 之后，"先 initialize 后其余"这条约定**第一次真的被强制**了（原先与并行的
 * `ui-members.ts` 分支存在竞争：那个模块静态 import 全部域模块）。行为上两者等价（域模块只做赋值）。
 */
const loadUiDomains = async () => {
	await import('@app/engine/ui/ui-initialize.ts');
	await import('@app/engine/ui/ui-file.ts');
	await import('@app/engine/ui/ui-transform.ts');
	await import('@app/engine/ui/ui-prefab.ts');
	await import('@app/engine/ui/ui-events.ts');
	await import('@app/engine/ui/ui-pointer.ts');
	await import('@app/engine/ui/ui-list.ts');
};

export const uiWindowReady = Promise.all([
	import('@app/engine/ui/element-register.ts'),
	loadUiDomains(),
	// 阶段 1c 第 ③/④-3 步：槽位模块。**必须动态 import**（静态会先于本模块体求值、踩 TDZ）。
	// ④-3（第 167 轮）起改成 **facade 装配**：域模块只**提供**成员对象，由这里把它挂上去。
	// 装配时机与「在域模块里自我绑定」等价 —— 两者都在 `uiWindowReady` 上、都在 `UI` 建好之后
	// （⚠️ 第 110 轮更正：primeWindows 那条短路已在第 ① 步断掉，真机与 vitest 同走 loadUI）。
	import('@app/engine/ui/ui-members.ts').then((m) => Object.assign(UI, m.uiMembers))
])
	.then(() => undefined)
	.catch(() => undefined);
