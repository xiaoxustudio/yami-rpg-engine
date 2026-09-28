/**
 * 「UI 形状的 facade」契约 —— 阶段 1c 第 ④ 步（对象字面量退役）的类型底座。
 *
 * ## 为什么要有这个文件
 *
 * `ui-engine.ts` 以 `this` 为接收者读一批 UI 成员（这正是 `ui-singleton.ts` 里
 * `UI.x = UIEngine.x` 那 21 行镜像的用途：**把 UI 侧状态喂给引擎**）。今天这些读点能编译，
 * 不是因为有契约，而是因为对象字面量末尾写着
 * `} satisfies Partial<UIShape> as Partial<UIShape> as UIShape;` 且 `UIShape` 带
 * `[k: string]: any` —— **任何成员读写都通过编译，拼错也一样**。
 *
 * 本文件把那份契约**抽出来、共享、命名**（原先它只是 `ui-engine.ts` 里的一个局部 interface），
 * 于是 ④ 的目标可以一个个数：见台账轴 `ui-facade-gaps`（首轮实测 **19**）。
 *
 * ## 两个「原来漏掉、靠 `any` 蒙过去」的成员
 *
 * 抽的时候对照引擎的读点逐个核，发现原局部 interface **少声明了两个**：
 * `marquee`（`ui-transform.ts` 的 `UI.marquee.resize()` 与引擎读的 `this.marquee`）
 * 与 `planToSave`（`ui-engine.ts` 四处 `this.planToSave!()`；实现在 `ui-events.ts:20`）。
 * 它们一直只是「索引签名兜着」—— **这正是 ④ 要消灭的那类静默**。
 *
 * ## 过渡状态（写给下一个人，别以为已经收口）
 *
 * ⚠️ 本接口**目前还没有真正的强制力**：`ui-engine.ts` 仍以
 * `interface UIShape extends UIFacadeShape { [k: string]: any }` 使用它，索引签名还在，
 * 所以漏声明仍然只表现为运行期 `undefined`。**下一步（④-1b）是把那个索引签名删掉**，
 * 让 `tsc` 逐个点名 —— 那才是这份契约开始干活的时候。
 * 在那之前，本文件的价值是：契约**只有一个真源**、且引擎读到的成员**全部显式在案**。
 */
import type { YamiElement } from '@app/types/element-api';
import type { History } from '@app/tools/history.ts';
import type { Matrix } from '@app/engine/webgl/matrix2.ts';
import type { ImageTexture } from '@app/engine/webgl/image-texture.ts';
import type { StageColor } from '@app/utils/stage-color';
import type { Timer } from '@app/utils/timer';
import type { UIElementInstance, UINodeShape } from '@app/engine/ui/element-classes.ts';

/**
 * `UIFacadeShape.hover` 的形状：**已建实例的节点**。
 *
 * 「节点 + **必填** `instance`」——同一条不变式，但**与 `getUIStore().target` 是同族类型**。
 *
 * 为什么必须同族：`ui-engine.ts` 的 `drawHoverWireframe` 要判 `this.hover !== getUIStore().target`
 * （两者是同一个节点时不再画悬停框）。两份互不相干的局部形状会让这个比较报 TS2367
 * 「两个类型没有重叠」，而它们描述的本来就是同一个对象。
 *
 * `instance` 声明为**必填**：这是引擎依赖的不变式 —— 能被 hover 的节点必然是
 * 「已建实例的主节点」（`ui-prefab.ts` 的 `createElement(node, true)` 会给它挂 `instance`）。
 * `drawHoverWireframe` 原本就没有守卫（缺 instance 一样会抛），声明必填只是把这条既有前提
 * 写进类型，**运行期行为逐字不变**；`ui-transform.ts:60` 的 `setHover` 仍用那处已记录的
 * 单次 `as` 把这条前提落到类型上（`ui-pointer.ts` 的形参口径没动）。
 */
export type HoverNode = UINodeShape & { instance: UIElementInstance };

/** 控制点（旋转/缩放手柄）的几何描述。 */
export interface ControlPoint {
	x: number;
	y: number;
	angle: number;
}

/** UI 画布上的全部控制点。 */
export interface UIControlPoints {
	rotate: Record<'TL' | 'TR' | 'BL' | 'BR', ControlPoint>;
	resize: Record<'T' | 'L' | 'R' | 'B' | 'TL' | 'TR' | 'BL' | 'BR', ControlPoint>;
	list: ControlPoint[];
}

/**
 * 引擎以 `this` 读取的 UI 成员契约。
 *
 * 字段的**类型**取自它们真实的写入方（例如 `background` / `foreground` 是 `StageColor`
 * 实例、`matrix` 由 `ui-initialize.ts` 赋 `new Matrix()`），不是猜的。
 */
export interface UIFacadeShape {
	// —— DOM 引用（`ui-initialize.ts` 从 `uiEls` 登记） ——
	page: HTMLElement;
	head: HTMLElement;
	body: HTMLElement;
	screen: YamiElement;
	/** 画布上的框选元素；引擎与 `ui-transform` 会调它的 `resize()`。 */
	marquee: YamiElement;

	// —— 文档 / 历史 ——
	/**
	 * 当前文档的历史栈。
	 *
	 * （`ui-file.ts:147` 关闭文档时**真的会写 `null`**）⇒ 两个类型对不上，且**单例那一侧才是如实的**。
	 * 引擎有 4 处以 `this.history` 读它（`shiftTarget` / `shiftAnchor` / `resizeTarget` / `rotateTarget`），
	 * 这些函数只在「文档已打开」之后才跑到 ⇒ 那条不变式现在写在**一处**（`historyOf()` 里的 `!`），
	 * 不再要求调用方宣称一个运行期不成立的非空类型。
	 */
	history: History | null;
	/** 计划保存（实现在 `ui-events.ts`）；四处 `this.planToSave!()` 调用它。 */
	planToSave: (() => void) | null;

	// —— 控制点 ——
	controlPoints: UIControlPoints | null;
	controlPointActive: ControlPoint | null;
	controlPointRotation: number;

	// —— 定时器 ——
	translationKey: number;
	translationTimer: Timer | null;
	zoomTimer: Timer | null;

	// —— 颜色 ——
	background: StageColor;
	foreground: StageColor;

	// —— 摄像机 / 变换 ——
	matrix: Matrix;
	scale: number;
	scaleX: number;
	scaleY: number;
	centerX: number;
	centerY: number;
	centerOffsetX: number;
	centerOffsetY: number;

	// —— 视口尺寸与内边距 ——
	outerWidth: number;
	outerHeight: number;
	scrollLeft: number;
	scrollTop: number;
	scrollRight: number;
	scrollBottom: number;
	padding: number;
	paddingLeft: number;
	paddingTop: number;

	// —— 检查器 ——
	inspectorTypeMap: Record<string, string>;

	// —— ④-1b 由 `tsc` 点名后补上的成员 ——
	//
	// （`requestRendering` / `updateControlPoints` / `renderingFunction`）—— 它们**已删除**：
	// `ui-engine.ts` 里 `this.requestRendering` / `this.updateControlPoints` /
	// `this.renderingFunction` 的读取**一处都不剩** ⇒ 它们成了**没有依据的契约条目**。
	//
	// 留着它们的代价是实的：引擎成员表一旦给 `this` 加上本契约（`any-hatches` 那一轮），
	// 单例接口就必须声明这 3 个**运行期并不存在**的成员（`UI.requestRendering` 在 ④-2c
	// 退役 21 行镜像之后就没有了）—— 那是让类型替运行期说谎。⇒ 本契约只写
	// 「引擎**真的**以 `this` 读的成员」。
	hover: HoverNode | null;
	controlPointTexture: ImageTexture | null;
}
