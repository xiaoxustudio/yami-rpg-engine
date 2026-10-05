/**
 * 时间轴头部（`#animation-timeline-head`）的布局：head 自己的横向位置，以及刻度尺相对 head 的左偏移。
 *
 * 播放栏（`#animation-timeline-toolbar`）**不在此列** —— 它已由 `AnimationTimelinePanel.vue`
 * 用 `<Teleport>` 送进分组页签条（`.nav-bar`，本身是 flex 行）并贴最右侧，见
 * `Project/css/animation.css` 里的 `#animation-timeline-toolbar`。
 * 留在 head 里时它与页签条同处那条 24px 带子，页签条叠放更高就会整条盖住它
 * （实机「动画底部看不到播放栏」）。
 */

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
 * = 「head 左缘 → 时间轴内容列」的空隙。
 *
 * ⚠️ 这里**只按空隙**算，绝不能把播放栏宽度也减掉：刻度尺的刻度是靠
 * `outerRuler.scrollLeft` 镜像帧网格的滚动来对齐的（见 `outerTimelineListScroll`），
 * 所以刻度尺**盒子的左缘必须精确落在内容列左缘**（帧网格起点）。把盒子右移 = 整条刻度
 * 偏移相同的像素、和下面的帧格再也对不上（实机反馈）。播放栏与它的关系是「压在它上面」：
 * 播放栏底板不透明（见 `animation.css`），因此落在按钮下面的那一段刻度不可见，
 * 但露出来的部分仍然与帧网格严格对齐。
 *
 * 空隙为负时（页签条压过内容列）归零：负值会让刻度尺向左伸到页签条上，配合 head 的
 * `z-index` 就会反过来盖住页签，所以宁可让刻度尺从 head 左缘起画。
 *
 * @param gap head 左缘到时间轴内容列左缘的空隙；页签过宽时 ≤ 0
 */
export const timelineRulerLeft = (gap: number): number => Math.max(gap, 0);
