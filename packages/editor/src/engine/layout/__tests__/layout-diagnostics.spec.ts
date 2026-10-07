import { describe, expect, it } from 'vitest';
import { findGroupOverlaps, type LayoutGeometryProbe } from '../layout-diagnostics';

const probe = (
	path: string,
	label: string,
	left: number,
	top: number,
	width: number,
	height: number
): LayoutGeometryProbe => ({
	path,
	label,
	rect: { left, top, right: left + width, bottom: top + height }
});

describe('findGroupOverlaps', () => {
	it('同层两个组相互压盖：报出双方标签与矩形', () => {
		const problems = findGroupOverlaps([
			probe('0/0', 'animation-motion', 0, 60, 600, 800),
			probe('0/1', 'animation-timeline', 0, 60, 300, 800)
		]);
		expect(problems).toHaveLength(1);
		expect(problems[0]).toContain('animation-motion');
		expect(problems[0]).toContain('animation-timeline');
		expect(problems[0]).toContain('几何压盖');
		expect(problems[0]).toContain('600x800');
	});

	it('首尾相接（含 1px 取整误差）不算压盖', () => {
		expect(
			findGroupOverlaps([
				probe('0/0', 'a', 0, 60, 300, 800),
				probe('0/1', 'b', 300, 60, 300, 800)
			])
		).toEqual([]);
		expect(
			findGroupOverlaps([
				probe('0/0', 'a', 0, 60, 300, 800),
				probe('0/1', 'b', 299, 60, 300, 800)
			])
		).toEqual([]);
	});

	it('祖先-后代（容器的矩形必然包含子组）不误报', () => {
		expect(
			findGroupOverlaps([
				probe('0', '容器(vertical)', 0, 60, 600, 800),
				probe('0/0', 'animation-motion', 0, 60, 600, 400),
				probe('0/1', 'animation-timeline', 0, 460, 600, 400)
			])
		).toEqual([]);
	});

	it('退化矩形（宽高为 0，隐藏/未物化的组）不参与判定', () => {
		expect(
			findGroupOverlaps([probe('0/0', 'a', 0, 60, 0, 0), probe('0/1', 'b', 0, 60, 300, 800)])
		).toEqual([]);
	});

	it('多组交叉：只报真正压盖的那些对（不做 O(n²) 噪音）', () => {
		const problems = findGroupOverlaps([
			probe('0/0', 'a', 0, 60, 100, 800),
			probe('0/1', 'b', 100, 60, 100, 800),
			probe('0/2', 'c', 50, 60, 100, 800)
		]);
		expect(problems).toHaveLength(2);
		expect(problems.every((line) => line.includes('c'))).toBe(true);
	});
});
