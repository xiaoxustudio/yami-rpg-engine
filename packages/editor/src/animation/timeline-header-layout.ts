/**
 * 时间轴头部（`#animation-timeline-head`）与「内容列」的版式口径。
 *
 * 三个量必须自洽，否则实机上会出现「刻度尺被播放栏挡住」或「刻度和帧格对不齐」：
 *
 * 1. **内容列左缘**（`timelineContentLeft`）：帧网格 / 指针区 / 刻度尺共用的起点；
 * 2. head 左缘（`timelineHeadLeft`）：贴着分组最后一个页签的右缘；
 * 3. 刻度尺相对 head 的偏移（`timelineRulerLeft`）：把 1 与 2 相减。
 *
 * 刻度尺的刻度对齐**不是**按左缘定的，而是靠 `outerRuler.scrollLeft` 镜像帧网格的滚动
 * （见 `Animation.outerTimelineListScroll`），所以刻度尺盒子的左缘必须**精确等于**内容列左缘
 * ——既不右移（会与帧格整条错开），也不左移（会伸到页签条底下）。
 */

/** 内容列默认占比（= `#animation-layer-list` 的图层列宽，CSS 里的 18% 兜底） */
export const TIMELINE_CONTENT_RATIO = 0.18;

/**
 * 内容列左缘（视口坐标，绝对值）：默认取 `naturalLeft`（页面 18% 处），但**不允许落在播放栏
 * 下面** —— 播放栏在 head 左缘起、宽度由内容撑开，页签条 + 6 个按钮经常超过 18%，此时帧网格
 * 与刻度尺整体右移到「播放栏右缘之后」，这样刻度尺既不被挡住、又仍与帧格严格对齐。
 *
 * 面板窄到连播放栏都放不下时退到 `frameRight - 1`（内容列贴住页面右缘）：这时只能让播放栏
 * （被 head 的 `overflow: hidden` 裁切）压住刻度尺，但绝不把内容列推出页面。
 *
 * @param naturalLeft 默认内容列左缘（视口坐标）
 * @param toolbarRight 播放栏右缘（视口坐标）；**null = 拿不到播放栏**（不施加约束）
 * @param frameRight 页面框右缘（视口坐标）
 */
export const timelineContentLeft = (
	naturalLeft: number,
	toolbarRight: number | null,
	frameRight: number
): number => {
	// 期望值：不低于默认列；有播放栏时还要越过它 1px
	const wanted = toolbarRight === null ? naturalLeft : Math.max(naturalLeft, toolbarRight + 1);
	// 上限：贴住页面右缘，但绝不低于默认列（面板极窄时宁可让播放栏压住刻度尺）
	const limit = Math.max(naturalLeft, frameRight - 1);
	return Math.min(wanted, limit);
};

/**
 * head 相对**页面框**（`#animation-timeline`）的左偏移。
 *
 * 旧实现只有「贴住分组 nav 最后一项右缘」一条路，而 `headNavOf()` 在分组没有页签时返回 null、
 * `lastNavItemOf()` 也因此为 null —— 老代码此时直接 `return`，`head.style.left` 永远不写：
 * CSS 是 `position:absolute; right:0`（**没有 left**），head 于是按内容收窄成 **0 宽**，
 * 里面的绝对定位子元素全被挤出可视区 —— 实机「刻度尺还在、底部播放按钮整条不见」。
 *
 * @param navItemRight 分组 nav 最后一项的右缘（视口坐标）；没有页签时为 null
 * @param frameLeft 页面框左缘（视口坐标）
 */
export const timelineHeadLeft = (navItemRight: number | null, frameLeft: number): number =>
	navItemRight === null ? 0 : navItemRight - frameLeft;

/**
 * 刻度尺（`#animation-timeline-ruler-outer`）相对 head 左缘的偏移
 * = 内容列左缘 − head 左缘。
 *
 * 空隙为负时（页签条压过内容列）归零：负值会让刻度尺向左伸到页签条上，配合 head 的
 * `z-index` 就会反过来盖住页签，所以宁可让刻度尺从 head 左缘起画。
 *
 * @param gap head 左缘到时间轴内容列左缘的空隙；页签过宽时 ≤ 0
 */
export const timelineRulerLeft = (gap: number): number => Math.max(gap, 0);
