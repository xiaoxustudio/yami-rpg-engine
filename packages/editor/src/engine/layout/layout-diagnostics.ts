export interface LayoutRect {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

export interface LayoutGeometryProbe {
	path: string;
	label: string;
	rect: LayoutRect;
}

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
