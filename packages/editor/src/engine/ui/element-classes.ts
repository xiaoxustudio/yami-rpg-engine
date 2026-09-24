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
 * （该文件已平移到 `@app/engine/ui/legacy/ui-window.ts`，见 PHASE-1C 第 66 轮）——
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
 */
export interface UIElementInstance {
	x: number;
	y: number;
	width: number;
	height: number;
	opacity: number;
	matrix: Matrix | null;
	parent: UIElementInstance | null;
	children: UIElementInstance[];
	visible: boolean;
	connected: boolean;
	/** 子元素重绘 / 重算尺寸（`element-base.ts` 的 `children` 循环，均无参） */
	draw(): void;
	resize(): void;
	/**
	 * 只有根元素有这两个方法（`root-element.ts:42 addReference` / `:59 tryUpdateReferenceElements`）；
	 * `UIElementInstance` 是根与普通元素的**共同视图** ⇒ 声明为可选。
	 * 参数类型写成 `unknown`：各个调用点传的是**各自的局部形状**（`PrefabElementShape` 在两个文件里
	 * 各有一份），收窄任何一支都会拒绝另外两支。
	 */
	addReference?(prefabElement: unknown): void;
	tryUpdateReferenceElements?(element: unknown): void;
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
 * 2026-09-21 第 109 轮：**合并了两份同名声明**。此前 `legacy/ui-window.ts` 与 `stores/ui.ts`
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
 */
export type UINodeShape = {
	class: string;
	children: UINodeShape[];
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
};

/**
 * 元素类的构造签名。
 *
 * `data` 用 `any` 而不是精确形状：13 个类的构造参数各不相同（`{ transform?, hidden? }`、
 * `{ image, clip, tint, transform }`、无参…），而它们**都要登记进同一张表**。
 * 这里若收窄成联合类型，每次新增元素类都要回来改这一处——正是记录里 P2b-1 批评过的
 * 「为了类型漂亮而制造长期维护点」。返回类型同样放到 `any`，理由与上面 `UIElementInstance`
 * 的索引签名一致：本轮不重做元素系统的类型。
 */
// oxlint-disable-next-line no-explicit-any
export type UIElementCtor = (new (data?: any) => any) & Record<string, any>;

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
