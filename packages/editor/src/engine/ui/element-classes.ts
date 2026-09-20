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
 * 为什么带索引签名：这些元素本来就是**带动态成员**的载体——`element-base.ts` 自己的
 * `UIElementShape` / `UIParentShape`，以及 `data/transition-window.ts` 等处都有同类签名；
 * 元素会因为 class 不同而挂上 `image` / `text` / `color` … 等成员。
 * 这里刻意与既有约定保持一致，**不新造一套更严的类型体系**——本轮的目标是拆掉遗留层的
 * 引用面，而不是重做 WebGL 元素系统的类型（那是独立的一件事）。
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
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
}

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
