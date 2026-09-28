/**
 * UI 画布元素**类注册表**——把元素类从遗留单例 `UI.*` 上搬下来的落点。
 *
 * ## 为什么要这个文件
 *
 * 迁移前，13 个元素类都是这样交付的：
 *
 * ```ts
 * // engine/ui/element-base.ts
 * UI.Element = class UIElement { … };
 * // engine/ui/image-element.ts —— 甚至靠 `extends UI.Element` 拿基类
 * UI.Image = class ImageElement extends UI.Element { … };
 * ```
 *
 * 也就是：**类的定义其实就在引擎目录里**，只是「寄存」在 `ui-window.ts` 的 `UI` 单例上。
 * 于是 14 个引擎文件为了拿到彼此（以及自己的基类），都得 `import { UI } from '@app/ui/ui-window.ts'`
 * （该文件已平移到 `@app/engine/ui/ui-singleton.ts`）——
 * 遗留层的最大一块引用面就是这么来的。
 *
 * 本模块把落点换成一个**引擎自己的**注册表：定义留在原文件，登记到这里，
 * 消费方按名字取用。`ui-window.ts` 继续把这些名字镜像到 `UI.*` 上（兼容尚未迁移的调用方），
 * 所以这是一次**可增量推进、随时可回退**的搬迁，而不是一次性大爆炸重写。
 *
 * ## 顺序约束（重要）
 *
 * `element-register.ts` 按固定顺序 import 各元素文件，而每个文件在模块顶层登记自己。
 * 因此：
 *   - `element-base.ts` **必须最先**登记 `Element`（其余 12 个类都 `extends` 它）；
 *   - 想拿某个类，前提是它已被登记。**在函数体内取用是安全的**（那时全部模块早已求值完），
 *     这也是元素代码的既有形态（`instanceof` 判定、`create()` 工厂都在方法里）。
 */
import type { UIInstanceList } from '@app/engine/ui/element-instance-list.ts';
import type { Matrix } from '@app/engine/webgl/matrix2.ts';

/**
 * 元素实例的最小形状。
 *
 * 为什么带索引签名（历史，保留）：这些元素本来就是**带动态成员**的载体——`element-base.ts` 自己的
 * `UIElementShape` / `UIParentShape`，以及 `data/transition-window.ts` 等处都有同类签名；
 * 元素会因为 class 不同而挂上 `image` / `text` / `color` … 等成员。
 * 当时刻意与既有约定保持一致，**不新造一套更严的类型体系**——那时的目标是拆掉遗留层的引用面，
 * 而不是重做 WebGL 元素系统的类型（那是独立的一件事）。
 *
 * 第 155 轮复核（代价扫描表里这一处是 **7 条**）：那行索引签名实际只被四个成员用到 ——
 * `draw` / `resize`（`element-base.ts:201` / `:209` 按 `children` 循环调用，均**无参**），
 * 以及 `addReference` / `tryUpdateReferenceElements`（**只有根元素有**：`root-element.ts:42` / `:59`）。
 * ⇒ 四个成员写出来、索引签名去掉（这一处在 `any-hatches` 口径里归零）；其它动态成员
 * （`image` / `text` / `color` …）不在本视图的读点里，故不必兜着。
 *
 * 本轮（`UINodeShape` 摘掉索引签名时）又补齐了引擎在实例上读到的另一半成员：
 * `node` / `isPointIn` / `appendChild` / `appendChildTo` / `remove` / `destroy` / `drawWireframe` /
 * `matrix`（原写成可空、与实现不符）/ `transform`，以及文本类元素的公共面
 * （`font` / `_font` / `shadowText` / `printer` / `content` / `updateTextContent` / `updatePrinter`）。
 * 前者是实例自己的行为（全部是 `element-base.ts` 的基类方法 ⇒ 非可选），
 * 后者是**数据成员在实例上的镜像**（`ui-transform.ts` 在 `instanceof Text/TextBox/DialogBox/Button`
 * 之后直接读写它们，故两份视图都要有）。
 */
export interface UIElementInstance {
	x: number;
	y: number;
	width: number;
	height: number;
	opacity: number;
	/**
	 * 世界变换矩阵。**非空**：`element-base.ts:110` 构造时 `this.matrix = new Matrix()`，
	 * 全仓再没有把它赋成 `null` 的地方（`calculatePosition` 只 `set()` 它）。
	 * 原先这里写的是 `Matrix | null` —— 与 `element-base.ts:87` 的 `matrix: Matrix` 不符，
	 * 于是 `ui-engine` / `ui-transform` / `ui-pointer` 的 13 处 `instance.matrix[0]`… 读点
	 * 被误判为可空。本轮按实现收紧（**没有加任何 `!`**）。
	 */
	matrix: Matrix;
	/**
	 * 元素自己的变换数据（`element-base.ts:98` 的 `transform`）。
	 * 引擎沿父链累加旋转（`ui-engine.ts` 的 `updateControlPoints`）时读它，
	 * `ui-pointer.ts` 的缩放路径也要 `instance.transform.scaleX`。
	 */
	transform: UIElementTransform;
	parent: UIElementInstance | null;
	children: UIElementInstance[];
	visible: boolean;
	connected: boolean;
	/** 子元素重绘 / 重算尺寸（`element-base.ts` 的 `children` 循环，均无参） */
	draw(): void;
	resize(): void;
	/**
	 * 画选中/悬停虚线框（`element-base.ts:119`）。实参是**颜色数值**：
	 * 实现把它写进 `colors[i]`（`gl.arrays[0].uint32` 视图）—— 那个 uint32 槽位就是它的口径。
	 * ⚠️ `element-base.ts` 自己的声明写的是 `Array<number> | string`，比实现宽（写进 uint32 槽
	 * 会得到 NaN）；两处调用点（`ui-engine.ts:585` / `:594`）传的都是 `0x…` 数值，本轮把
	 * 实现侧的声明也一并改成 `number`。
	 */
	drawWireframe(color: number): void;
	/** 从父元素的 `children` 里摘掉自己（`element-base.ts:287`，基类方法）。 */
	remove(): void;
	/** 挂子元素（`element-base.ts:250` 的基类方法；`ui-prefab.ts` 装配时调）。 */
	appendChild(element: UIElementInstance | null): void;
	/**
	 * 按索引插入到自己名下（`element-base.ts:266` 的基类方法，`ui-transform.ts` 的移动节点用）。
	 * 首参允许 `null`：实现第一句就是 `element instanceof uiElClasses.Element` 判定 ⇒
	 * 传 `null` 与传 `undefined` 行为完全相同（都什么都不做）。
	 */
	appendChildTo(element: UIElementInstance | null, index: number): void;
	/**
	 * 命中判定（`element-base.ts:350`，基类方法）：`ui-pointer.ts` 的点选路径直接调。
	 * 参数是**元素本地坐标**里的点（调用方已用 `getRelativeCoords` 换算）。
	 */
	isPointIn(x: number, y: number): boolean;
	/**
	 * 只有根元素有这两个方法（`root-element.ts:42 addReference` / `:59 tryUpdateReferenceElements`）；
	 * `UIElementInstance` 是根与普通元素的**共同视图** ⇒ 声明为可选。
	 * 参数类型写成 `unknown`：各个调用点传的是**各自的局部形状**（`PrefabElementShape` 在两个文件里
	 * 各有一份），收窄任何一支都会拒绝另外两支。
	 */
	addReference?(prefabElement: unknown): void;
	tryUpdateReferenceElements?(element: unknown): void;
	// —— 引擎在实例上读到的其余成员（本轮按 `UINodeShape` 摘掉索引签名后的读点清单补齐）——
	/** 该实例对应的**节点数据**（`element-base.ts` 的 `declare node`） */
	node?: UINodeShape | null;
	/** 摧毁自身（`element-base.ts:241` 的基类方法；`ui-file.ts` 关窗时调 `root.destroy()`） */
	destroy(): void;
	/** 文本类元素的公共面：`ui-transform.ts` 在 `instanceof Text/TextBox/DialogBox/Button` 之后读它们 */
	font?: string;
	_font?: string;
	shadowText?: UIElementInstance;
	printer?: { reset(): void } | null;
	content?: string;
	updateTextContent?(): void;
	updatePrinter?(): void;
	/**
	 * 引用元素的「重算引用内容」（`reference-element.ts:127`）。
	 * **只有引用类元素有** ⇒ 可选；调用点（`ui-transform.ts` 的 `updateAllReferences`）
	 * 前面刚做过 `instanceof uiElClasses.Reference` 判定，故那里用 `!`。
	 */
	update?(): void;
}

/**
 * **UI 图片元素实例**的形状（打印时嵌进文本里的那种图）。
 *
 * 2026-09-22 第 118 轮：**合并了两份「各写一半」的局部形状**。此前同一个运行期对象
 * （`new uiElClasses.Image!(…)`）被两处各描述了一个**子集**：
 *
 * - `printer/printer.ts` 的 `ImageElementShape` —— `image` / `display` / `clip` / `destroy`；
 * - `engine/ui/text-element.ts` 的 `EmbeddedImageShape` —— `parent` / `connected` / `draw` / `resize`。
 *
 * 两处都「对」，但谁也用不上另一半 ⇒ 读侧只能 `as unknown as` 跳到**对方的名字**上
 * （`text-element.ts:402` / `:452`）。合并成一份**具名**形状之后，那两处断言**直接消失**
 * （不是缩短成单次 `as`）——因为 `printer.images` 的声明与读侧现在是同一个类型。
 *
 * ⚠️ 刻意**不**写成 `extends UIElementInstance`：那个接口带 `[k: string]: any`，
 * 继承它等于把这些成员的检查全部交还给索引签名 —— 那只是把索引签名换个写法保留下来。
 * 这里的成员全是具名的，**拼错键会当场报错**。
 */
export interface UIImageElementShape {
	startX: number;
	startY: number;
	transform: { x: number; y: number; width: number; height: number };
	image: string;
	display?: string;
	clip: { set(clip: number[]): void };
	/** 父元素。类型沿用原声明的 `unknown` —— 收紧它是独立的一件事，本轮不夹带。 */
	parent: unknown;
	connected: boolean;
	draw(): void;
	resize(): void;
	destroy(): void;
}

/**
 * UI 元素的**变换数据**（画布上可拖拽的那组属性）。
 *
 * 2026-09-21 第 108 轮从 `inspector/element-page.ts` 的**局部** interface 提上来共享。
 * 为什么必须共享：`stores/ui.ts` 的 `UINodeShape.transform` 与引擎的读点
 * （`ui-engine.ts` 的 `transform.anchorX` / `ui-pointer.ts` 的 `transform.x` …）
 * 都指向同一个对象，而局部类型拿不到 ⇒ 只能退回索引签名。提上来之后，
 * `UINodeShape` 才可能把 `[key: string]: any` 换成**具名字段**。
 *
 * 字段照抄原处（15 个），末尾保留 `[k: string]: unknown`：元素类型各有扩展字段，
 * 但值类型是 `unknown` 而不是 `any` —— 读侧必须先收窄，拼错键也不会静默变成 `any`。
 */
export interface UIElementTransform {
	anchorX: number;
	anchorY: number;
	x: number;
	x2: number;
	y: number;
	y2: number;
	width: number;
	width2: number;
	height: number;
	height2: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
	skewX: number;
	skewY: number;
	opacity: number;
	[k: string]: unknown;
}

/**
 * 画布 **UI 树节点**（序列化形态：`class` + `children` + 各类扩展字段）。
 *
 * 2026-09-21 第 109 轮：**合并了两份同名声明**。此前 `ui-singleton.ts` 与 `stores/ui.ts`
 * 各写一份 `UINodeShape`，靠各自的 `[k: string]: any` 索引签名「碰巧结构兼容」——
 * 也就是说两边可以各自漂移而无人发现。第 108 轮把 store 那份改成具名字段后，
 * `ui-transform.ts:59` 当场报「两者不兼容」，那是这个隐患第一次显形。
 * 现在全仓只有这一处声明：`ui-window.ts` 只做再导出，`stores/ui.ts` 直接 import。
 *
 * ⚠️ 索引签名**暂时保留**：第 108 轮实测，把它换成具名字段后 `tsc` 会露出 31 处问题，
 * 其中 **14 处是 `matrix` / `parent` 可空却被直接解引用**（`ui-engine` 6 + `ui-pointer` 8），
 * 另有 `instance` 到底可不可空（`ui-engine.ts:363` 会把 `null` 赋给它）。
 * 那些是**行为问题**（要么证明不变式、要么加守卫），必须实机判定，
 * 不能靠补一批 `!` 蒙过去 —— 那正是本仓反复记的静默失效制造机。
 *
 * ## 第 232 轮：按上面的口径逐个判定后，索引签名**已退役**
 *
 * - **`matrix` 可空是不成立的**：`element-base.ts:110` 构造时就是 `new Matrix()`，
 *   全仓没有第二处赋值 ⇒ 把 `UIElementInstance.matrix` 改成非空，13 处读点**不加任何 `!`** 即通过。
 * - **`parent` 可空是成立的**（根元素/根节点就是 `null`），所以它保留可空，读侧在
 *   「只可能在已装配的树上」的位置用 `!`（`ui-pointer.ts` 的缩放、`ui-file.ts` 的 `createShortcut`）。
 * - **`instance` / `instances` 是装配期挂上的运行期成员**，数据里**没有**它们：
 *   `ui-prefab.ts:96` / `:101` 用 `Object.defineProperty` 挂成**不可枚举**（否则会被序列化进 JSON），
 *   且 `element-base.ts:245` 会 `delete node.instance` ⇒ 数据形状里必须是**可选**。
 *   引擎在画布上读到的节点（当前目标 / 历史记录里的目标 / 树的兄弟列表）都是**已装配**的
 *   —— 这条不变式在 `ui-facade.ts` 的 `HoverNode` 里已有先例（该处注释写着「能被 hover 的节点
 *   必然是已建实例的主节点」）⇒ 那些读点用 `!` 表达同一条前提，运行期一行未改。
 */
export type UINodeShape = {
	class: string;
	children: UINodeShape[];
	/** 节点名（列表显示 / `generateUniqueName`） */
	name: string;
	/** 变换数据 —— 与 `stores/ui.ts` 的读点指向**同一个对象**（见 `UIElementTransform` 的说明） */
	transform: UIElementTransform;
	/** 预制体 guid（`generatePresetId` 写；`hasPrefab` / `ui-file.ts` 读） */
	presetId: string;
	/** 列表开关（`ui-list.ts` 的 toggle 直接翻转） */
	enabled: boolean;
	/** 父节点（根为 `null`）。`ui-file.ts` 的 `createShortcut` 直接解引用 ⇒ 那处带 `!` */
	parent: UINodeShape | null;
	/**
	 * 当前**主**实例（`ui-prefab.ts:96` 用 `Object.defineProperty` 挂的不可枚举成员，
	 * 只在该节点是 `createElement(node, main=true)` 时才有）。
	 * 可选是如实的：`element-base.ts:245` 的 `delete node.instance` 就是在这个成员上操作的。
	 * 引擎读点（`ui-engine.ts` 的控制点/坐标轴/虚线框、`ui-pointer.ts` 的旋转缩放、
	 * `ui-transform.ts` 的删除）都只处理**已装配**的节点 ⇒ 那里用 `!`，见本文件顶部的判定记录。
	 */
	instance?: UIElementInstance;
	/**
	 * 该节点的全部实例（同一个预制体节点可以被实例化多次）。
	 * 同样是 `ui-prefab.ts:104` 挂的不可枚举成员；`element-base.destroy` 从它里面摘掉自己。
	 */
	instances?: UIInstanceList;
	/** 引用型元素的同步标记（`ui-engine.ts` 的 `selectControlPoint` 读） */
	synchronous?: boolean;
	/** 锁定标记（`ui-pointer.ts` 的命中判定读 `element.node.locked`） */
	locked?: boolean;
};

/**
 * 元素类的构造签名。
 *
 * `data` 用 `any` 而不是精确形状：13 个类的构造参数各不相同（`{ transform?, hidden? }`、
 * `{ image, clip, tint, transform }`、无参…），而它们**都要登记进同一张表**。
 * 这里若收窄成联合类型，每次新增元素类都要回来改这一处——正是记录里批评过的
 * 「为了类型漂亮而制造长期维护点」。返回类型同样放到 `any`，理由与上面 `UIElementInstance`
 * 的索引签名一致：本轮不重做元素系统的类型。
 */
// oxlint-disable-next-line no-explicit-any
export type UIElementCtor = new (data?: any) => any;

/**
 * 注册表本体。各元素文件在模块顶层登记：
 *
 * ```ts
 * import { uiElClasses } from './element-classes.ts';
 * uiElClasses.Image = class ImageElement extends uiElClasses.Element { … };
 * ```
 *
 * 用「变量持有 + 可空字段」而不是直接具名导出，是为了**避免循环导入**：
 * 若本模块 `import { ImageElement } from './image-element.ts'`，就会与
 * `image-element.ts → element-base.ts → ui-window.ts` 形成环，初始化顺序将依赖
 * 打包器的求值次序——那是这类重构最经典的翻车点。
 */
export const uiElClasses: {
	Element: UIElementCtor | null;
	Root: UIElementCtor | null;
	Image: UIElementCtor | null;
	Text: UIElementCtor | null;
	TextBox: UIElementCtor | null;
	DialogBox: UIElementCtor | null;
	ProgressBar: UIElementCtor | null;
	Button: UIElementCtor | null;
	Animation: UIElementCtor | null;
	Video: UIElementCtor | null;
	Window: UIElementCtor | null;
	Container: UIElementCtor | null;
	Reference: UIElementCtor | null;
	/** 工厂：按节点的 class 造出对应元素实例；由 `element-prefab`（ui-prefab.ts）登记 */
	// oxlint-disable-next-line no-explicit-any
	createElement: ((node: any, main?: boolean) => any) | null;
} = {
	Element: null,
	Root: null,
	Image: null,
	Text: null,
	TextBox: null,
	DialogBox: null,
	ProgressBar: null,
	Button: null,
	Animation: null,
	Video: null,
	Window: null,
	Container: null,
	Reference: null,
	createElement: null
};
