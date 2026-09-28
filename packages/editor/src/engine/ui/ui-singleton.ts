import { elementDataOf } from '@ui-kit';
import { uiEls } from '@app/engine/ui/element-registry';
import { hide } from '@app/utils/element-utils.ts';
import { registryElement } from '@app/utils/element-registry.ts';
import { EventBus } from '@app/utils/event-bus.ts';
import { Scene } from '@app/scene/scene-window.ts';
// 它保证 `ui-engine.ts` 的模块体（末尾会 `registerUIEngine(UIEngine)`）在本文件**之前**求值。
// 少了它，就可能出现「UI 对象已存在、但 `uiEngineRef` 还是 null」的窗口，而 store 的 7 个引擎转发
// 在那种状态下会**静默返回 undefined**（`makeEngineForwarder` 的回退分支取不到任何函数）。
import '@app/engine/ui/ui-engine.ts';
import { getUIStore } from '@app/stores/ui';

import type { UIElementInstance, UINodeShape } from '@app/engine/ui/element-classes.ts';
import type { TreeListElement } from '@app/components/tree-list.ts';
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

	//
	// ⚠️ 为什么要补：`ui-engine.ts` 的成员表给 `this` 加了类型之后，「域模块的 `this`（单例）交给
	// 引擎成员（要 `UIFacadeShape`）」这一步**第一次被检查**。原因是实打实的：
	// `[k: string]: any` 只提供「**任意键可读**」，**不满足目标类型里具名的必填字段**
	//
	// 三个都**在单例上真实存在、都有写入方**（不是为了"让它编过"才补的谎）。
	/**
	 * 框选元素（`ui-initialize.ts:39` 登记；`ui-pointer` 在它上面挂拖拽状态）。
	 *
	 * 两个扩展字段按**兄弟引擎的既有约定**处理（`scene-window.ts:88` 那段注释：marquee 运行时挂载
	 * 大量扩展、"避免穷举"）—— 但这里**两处都刻意不抄**：既不抄它的 `[k: string]: any`
	 * （会让 `any-hatches` 上升），也**不加索引签名**：UI 侧的扩展只有下面这两个、是可枚举的，
	 * 而带索引签名的目标类型会让字面量那处 `satisfies Partial<UIShape>` **不可比**
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

	//
	// 这 6 个都有明确的写入方（见 `UI` 字面量与 `ui-file.ts` 的赋值），此前只是**没写在类型里**：
	// 读侧一律走索引签名拿到 `any`/`unknown`，于是「拼错成员名」与「成员不存在」都编译通过。
	/**
	 * 节点树列表元素（`uiEls.get('ui-list')`）。
	 *
	 * 类型取编辑器侧那份具名契约 `TreeListElement`（`components/tree-list.ts`）——
	 * 它 = `HTMLElement & TreeListElementApi & { createString() }`，含 `data` / `display` /
	 * `update()` / `deleteNode()` / `addNodeTo()` / `expandToSelection()` / `scrollToSelection()`…
	 * ⚠️ 这里**不能**用 `YamiElement`：`ui-list.ts` 下面那 6 个挂在列表上的实现（`copy` / `paste` /
	 * `delete` / `toggle` / `cancelSearch` / `updateHead`）读的是**列表元素**的 `this`
	 * （`this.data` / `this.deleteNode!` / `this.display`…），而 `YamiElement` 上没有它们。
	 */
	list: UIListNodeShape;
	/**
	 * 搜索框元素（`uiEls.get('ui-searcher')`；`TextBox` 那一族）。
	 *
	 * 两处按读点补的具名成员：
	 * - `addKeydownFilter?()`：`ui-initialize.ts:190` 调它。**全仓没有它的类型声明**（`ui-kit` 的
	 *   元素契约里也没有），所以按 `scene-window.ts:44` / `stores/browser.ts:60` 的**既有写法**
	 *   声明成可选、调用点配 `?.`（那两个文件对同一成员就是这么处理的）。
	 * - `input`：内部 `<input>`（`components/common/TextBox.vue` 的 `input: HTMLInputElement`），
	 *   `ui-list.ts` 的 `searcherInput` 读 `this.input!.value`。契约里那个 `input?: HTMLElement | …`
	 *   太宽（`HTMLElement` 没有 `value`）⇒ 用 `Omit` 换掉再给具名类型。
	 */
	searcher: Omit<YamiElement, 'input'> & {
		addKeydownFilter?(): void;
		input?: HTMLInputElement | null;
	};
	/**
	 * 拖拽中的指针事件（`ui-pointer.ts` 写；`ui-events.ts` 用 `=== null` 判"当前是否在拖"）。
	 * 拖拽期间会在**同一个事件对象**上挂 `mode` / `scrollLeft` / `absoluteAnchorX`… —— 那正是
	 * `UIPointerEvent` 的扩展字段（本文件已声明），这里按**写入之后**的口径收紧成 `UIDragEvent`。
	 */
	dragging: UIDragEvent | null;
	/** 当前文档的节点数组（`ui-file.ts` 从 `context.ui.nodes` 取出；与列表 `bind` 的是**同一个数组实例**）。 */
	nodes: UINodeShape[] | null;
	/** 当前打开的文档上下文（`ui-file.ts` 写；`ui-file.ts:161` 用 `this.context === context` 判当前页）。 */
	context: UIContextShape | null;
	/**
	 * 根元素**实例**（`ui-file.ts` 从 `context.editor.root` 取出后写）。
	 * 与 `getUIStore().root` 是同一个对象；类型同样是实例视图。
	 */
	root: UIElementInstance | null;
	/** 当前文档的 `meta`（`ui-file.ts:33` 写；`ui-events.ts` 的 `planToSave` 读）。 */
	meta: { guid: string; path: string } | null;
	/**
	 * 打开一份 UI 文档（`ui-file.ts` 的实现；`open()` 的最后一步就是 `this.load!(context)`）。
	 * 注意它**不在** `UIDomainMembers` 的生成清单里（生成器跳过的 7 条之一）。
	 */
	load: ((context: UIContextShape) => void) | null;
	/** 打开（`ui-file.ts:17` 的实现，`stores/ui.ts` 的 `open()` 调它）。生成清单同样没有它。 */
	open: ((context: UIContextShape) => void) | null;
	/** 销毁（`ui-file.ts:159` 的实现；`stores/ui.ts` 的 `destroy()` 调它）。 */
	destroy: ((context: UIContextShape) => void) | null;
	/** 列表的 keydown 处理器（`ui-list.ts` 的 `listKeydown`；`ui-initialize.ts:365` 注册到列表上）。 */
	listKeydown: ((event: KeyboardEvent) => void) | null;
	/**
	 * `ui-events.ts` 提供的两个槽位 —— `UIDomainMembers` 的生成清单里**漏了**它们
	 * （生成器跳过的 7 条），但两侧都在用：`LayoutPanel.vue` 转发给它们，store 的
	 * `uiForwardKeys` 也把这两个键列进去了。
	 */
	switchPointerdown: ((event: PointerEvent) => void) | null;
	screenKeydown: ((event: KeyboardEvent) => void) | null;
	/** 装配工厂：按节点 class 造元素实例（`ui-prefab.ts:115` 调 `this.createElement!(node, true)`）。 */
	createElement: ((node: UINodeShape, main?: boolean) => UIElementInstance) | null;

	// —— 桥接到 `stores/ui.ts` 的 6 个字段（本文件末尾的 `Object.defineProperty` 装 get/set）——
	//
	// 类型取 store 那一侧的口径（`uiStateKeys` 里的前 6 项，与 `auto-tile.ts` 的桥接字段同一写法）：
	// `stores/__tests__/ui-state.spec.ts` 会直接对 `UI.state` / `UI.target` / `UI.zoom`… 赋值再读回，
	// 那些写法此前靠索引签名成立。
	state: string;
	target: UINodeShape | null;
	zoom: number | null;
	width: number | null;
	height: number | null;
	mode: string | null;
}

export type { UINodeShape };

export interface UIContextShape {
	meta: { guid: string; path: string };
	ui?: { width: number; height: number; nodes: UINodeShape[] } & Record<string, unknown>;
	editor?: {
		target: UINodeShape | null;
		/**
		 * 根节点 —— 是**实例**，不是节点数据：`ui-file.ts:62` 建的就是
		 * `new uiElClasses.Root!()`，而 `ui-file.ts:166` 对它调 `.destroy()`（实例方法，
		 * 节点数据上没有）。原先这里写 `UINodeShape` 是靠索引签名成立的。
		 */
		root: UIElementInstance | null;
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
 * UI 窗口的**列表句柄**：`TreeListElement`（编辑器侧的树列表具名契约）+
 * 本域真的会读、而那份契约里没写明的成员。
 *
 * 为什么要再包一层：`TreeListElementApi` 末尾带 `[k: string]: unknown`（消费方要的宽松兜底），
 * 所以**未声明**的成员读出来是 `unknown` 而不是报错 —— 收成具名成员之后才会被检查。
 * 与 `composables/useTeamWindow.ts` 的 `TeamListElement` 是同一手法（按读点补具名成员）。
 */
export type UIListNodeShape = TreeListElement & {
	/** `ui-file.ts:242` 的 `createShortcut` 用它给引用节点起名（树列表自带的去重命名）。 */
	generateUniqueName(item: UINodeShape): string;
};

/**
 * 拖拽期间的 `UI.dragging` —— `ui-pointer.ts` 的四个 `marqueePointerdown` 分支在**同一个事件对象**上
 * 逐个写入这些字段（`mode` / 起点坐标 / 滚动起点 / 起始旋转角…），随后的 `pointermove` / `pointerup`
 * 一路读它们。与 `UIPointerEvent` 是同一批字段，区别只在于「**赋值之后**必然已写入」⇒ 这里收紧成必有，
 * 让那 20 处 `dragging.startX` 之类的读点不必逐个写 `!`。
 *
 * 写入方在赋值语句之后才逐个赋字段，所以赋值处用一次单次 `as`（与 `ui-transform.ts` 的 `setHover`
 * 同一手法：把「既有前提」写进类型，运行期一行未改）。
 */
export type UIDragEvent = UIPointerEvent & {
	mode: string;
	scrollLeft: number;
	scrollTop: number;
	absoluteAnchorX: number;
	absoluteAnchorY: number;
	lastAngle: number;
	rotationRadians: number;
	startRotation: number;
	startWidth: number;
	startHeight: number;
	startX: number;
	startY: number;
};

/**
 * UI 单例本体（**装配式**：这里只有它自己真正持有的成员，成员函数由 `uiWindowReady` 注入）。
 *
 *
 * 此前这里跟着 134 个条目，其中 **123 个是 `initialize: null` / `open: null` / … 这类占位**
 * ——它们的用途是「给域模块先声明、后填充」（那时域模块逐个 `UI.x = …` **自我绑定**）。
 * 而第 ④-3 步（第 167–183 轮）之后，**全部 8 个域改为提供成员对象、由 `ui-members.ts` 汇总、
 * 在 `uiWindowReady` 里 `Object.assign(UI, …)` 装配** ⇒ 占位表**没有任何写入方需要用**，
 * 它剩下的作用只是「让 `UI.x` 在读到时是 `null` 而不是 `undefined`」＋「喂契约生成器」。
 *
 * 删掉它的依据（都是**实测**，不是推理）：
 * 1. **全仓没有任何地方枚举单例**（`Object.keys/entries/getOwnPropertyNames(UI)` / `...UI` /
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
	marquee: ((uiEls.get('ui-marquee') as YamiElement) ||
		({} as YamiElement)) as UIShape['marquee'],
	searcher: registryElement<UIShape['searcher']>(uiEls, 'ui-searcher')!,
	// 列表句柄走 `registryElement`（`utils/element-registry.ts` 的**单点收窄**）：它返回 `T | null`，
	// 而 `UIShape.list` 是非空成员 ⇒ 这里补一处**可见**的 `!`（与 `color-picker-window.ts` 同一写法）。
	// `?? ({} as TreeListElement)`：兜底对象**不是**元素，但它承重 —— 元素尚未登记时也要能加载，
	// 而下面的挂载（`elementDataOf(UI.list).…`）需要它非空（与上面 `marquee` 的 `|| {}` 同一理由）。
	list: registryElement<UIListNodeShape>(uiEls, 'ui-list') ?? ({} as UIListNodeShape),
	dragging: null as UIDragEvent | null,
	// 类型取 `HoverNode`（含**必填**的 `instance`）而不是 `UINodeShape`：引擎的 `drawHoverWireframe`
	// **不判空就解引用** `hover.instance.visible`（缺 instance 会每帧抛）⇒「被 hover 的节点必有实例」
	// 是既有不变式，写在类型里；写入方 `ui-transform.ts` 的 `setHover` 有对应说明与单次断言。
	hover: null as HoverNode | null,
	translationKey: 0b0000,
	translationTimer: null as Timer | null,
	zoomTimer: null as Timer | null
} satisfies Partial<UIShape> as Partial<UIShape> as UIShape;

// ⚠️ 这里**不能**再放 `UI.marquee.resize = null;` 那样的占位：
// `UIShape.marquee` 真的声明了 `resize: () => void`（见接口里那段），占位既编不过、也不再需要。
// 行为不变：真正的赋值点在 `ui-list.ts` 的 `UI.marquee.resize = function …`，
// 而所有调用点都在其之后（用户交互路径），与 `this.planToSave!()` 是同一类既有不变式。

// page 走显式元素数据（该字段不在 DATA_FIELDS 里）
elementDataOf<{ page?: HTMLElement | null }>(UI.list).page = uiEls.get('ui-element') as YamiElement;
elementDataOf<{ head: HTMLElement }>(UI.list).head = uiEls.get('ui-list-head') as YamiElement;
// 这 6 行占位**已删除**。理由与上面 `UI.marquee.resize` 那处同一条：`TreeListElement` 契约里这些方法
// 是**真声明**（非空），写 `null` 既编不过、也不再需要。
// 行为同样不变：它们的真实实现就在 `ui-list.ts:359-414` 的**模块加载期**赋值（`loadUiDomains()` 里
// `ui-singleton` 之后紧跟 `ui-list`），而唯一能调用它们的是用户交互 —— 都在那之后。
// 顺带说明：删掉 `null` 之后，若 `ui-list` 因故没加载，留下的是**组件自带实现**而不是"调用 null 崩"。
EventBus.once('editor_loaded', () => {
	// 这两条从 `Scene.list` 抄过来的是**方法值**，而 `SceneShape.list` 上的声明是 `… | null`
	// （`SceneListExtensions`），`UI.list`（`TreeListElement`）上则是非空方法。
	// 赋值的时机正是 `editor_loaded` —— 该文件自己的注释就写着「`Scene.list.*` 真定义在
	// `editor_loaded` 时才确定」⇒ 这一刻它们必然已就绪，单次 `as` 表达这条前提（运行期一行未改）。
	UI.list.restoreRecursiveStates = Scene.list
		.restoreRecursiveStates as UIShape['list']['restoreRecursiveStates'];
	UI.list.setRecursiveStates = Scene.list
		.setRecursiveStates as UIShape['list']['setRecursiveStates'];
});

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

// 调用点直连 `UIEngine`、store 的 7 个转发改走注册进来的引擎（理由见 `xr.md` 第 112–114 轮）。

/**
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
	// 装配时机与「在域模块里自我绑定」等价 —— 两者都在 `uiWindowReady` 上、都在 `UI` 建好之后
	import('@app/engine/ui/ui-members.ts').then((m) => Object.assign(UI, m.uiMembers))
])
	.then(() => undefined)
	.catch(() => undefined);
