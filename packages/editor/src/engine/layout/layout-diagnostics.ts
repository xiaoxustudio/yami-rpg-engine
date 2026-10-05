/**
 * 布局几何自检（纯数据、无 DOM）。
 *
 * 背景：`Layout.logDiagnostics` 原先只查「页框高度超出 group-manager / 底部超出窗口」这类
 * 单元素溢出，**组与组之间的压盖是盲区** —— 实机「两个面板内容叠在一起」时它照样报
 * 「发现 0 个问题」，等于没诊断到点上（组元素是 `position: absolute` + 引擎写死的内联
 * `left/width`，一旦某个 `end` 缺失/非单调，宽度会退化成 `NaNpx` 被浏览器忽略而保留旧值，
 * 于是同层两个组互相压住）。
 *
 * 这里只做一件事：把每个组元素的「唯一路径 + 标签 + 矩形」交给 `findGroupOverlaps`，
 * 报出**非祖先关系**的相互压盖。祖先-后代天然包含（容器的矩形必然压住自己的子组），不算问题。
 */

export interface LayoutRect {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

export interface LayoutGeometryProbe {
	/** 唯一路径（如 `0/1/0`，按组元素在父内的下标拼接），用于判定祖先关系 */
	path: string;
	/** 人类可读标签（叶组给页签列表，容器给轴） */
	label: string;
	rect: LayoutRect;
}

/** 亚像素容差：相邻组的浏览器取整常有 ±1px 交叠，不算压盖 */
const TOLERANCE = 1;

const overlapOf = (a: LayoutRect, b: LayoutRect): boolean =>
	a.left < b.right - TOLERANCE &&
	b.left < a.right - TOLERANCE &&
	a.top < b.bottom - TOLERANCE &&
	b.top < a.bottom - TOLERANCE;

/** 路径型的祖先判定：`a` 是 `b` 的祖先（或反之）时二者不是「互相压盖」 */
const isAncestorPair = (a: string, b: string): boolean =>
	b.startsWith(`${a}/`) || a.startsWith(`${b}/`);

/** 退化矩形（隐藏/未物化/`clientRect` 全 0，jsdom 里天然如此）不参与判定，避免满屏误报 */
const measurable = (probe: LayoutGeometryProbe): boolean =>
	probe.rect.right - probe.rect.left > TOLERANCE &&
	probe.rect.bottom - probe.rect.top > TOLERANCE;

const describe = (rect: LayoutRect): string =>
	`[${Math.round(rect.left)},${Math.round(rect.top)} ${Math.round(rect.right - rect.left)}x${Math.round(
		rect.bottom - rect.top
	)}]`;

export function findGroupOverlaps(probes: readonly LayoutGeometryProbe[]): string[] {
	const problems: string[] = [];
	const list = probes.filter(measurable);
	for (let i = 0; i < list.length; i++) {
		for (let j = i + 1; j < list.length; j++) {
			const a = list[i];
			const b = list[j];
			if (isAncestorPair(a.path, b.path)) continue;
			if (!overlapOf(a.rect, b.rect)) continue;
			problems.push(
				`组「${a.label}」与组「${b.label}」几何压盖：${describe(a.rect)} × ${describe(b.rect)}`
			);
		}
	}
	return problems;
}
