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
 * = 「head 左缘 → 时间轴内容列」的空隙，**再让过播放栏**（head 里刻度尺前面那个 flex 项）。
 *
 * 它是 `margin-left` 而不是 absolute 的 `left`：两条都是 head 的 flex 项，宽度瓜分、结构上不会
 * 互相压。空隙不足时（面板窄、页签条宽）归零 ⇒ 刻度尺从播放栏右缘起画，刻度会与帧网格错开
 * 一点，但**绝不会滑到按钮底下**（旧实现正好相反：这里 clamp 到 0，刻度尺整条压在播放栏上，
 * 只能靠 `z-index` 遮丑）。
 *
 * @param gap head 左缘到时间轴内容列左缘的空隙；页签过宽时 ≤ 0
 * @param toolbarWidth 播放栏宽度（不传按 0 处理，等价于旧的「只按空隙对齐」口径）
 */
export const timelineRulerLeft = (gap: number, toolbarWidth = 0): number =>
	Math.max(gap - toolbarWidth, 0);
