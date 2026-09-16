import { beforeEach, describe, expect, it } from 'vitest';
import { elementDataOf } from '@ui-kit';
import { Layout } from '@app/engine/layout/layout.ts';
import '@app/utils/math';

// 回归：组容器的兄弟遍历必须按「组元素」——Vue 组树在容器内留注释/文本锚点，
// 旧实现用 previousSibling/childNodes 取兄弟会拿到锚点（end undefined）
// → setGroupSize/computeSizes* 的比例算成 NaN → 序列化兜底成 1
// → 兄弟叶子重叠（新叶占满、目标被压到 0）→ 边界线不可命中、无法拖拽缩放。

interface SizedElement extends HTMLElement {
	split?: string;
}

// P4b：`end` 是元素数据（原型访问器即将退役），规格改走显式视图
interface SizedElementData {
	end: number;
}

const sizedData = (el: unknown): SizedElementData => elementDataOf<SizedElementData>(el);

const createGroup = (end: number | undefined): SizedElement => {
	const group = document.createElement('group') as SizedElement;
	group.className = 'group';
	if (end !== undefined) sizedData(group).end = end;
	return group;
};

const setWidth = (el: HTMLElement, width: number): void => {
	Object.defineProperty(el, 'clientWidth', { value: width, configurable: true });
	Object.defineProperty(el, 'clientHeight', { value: width, configurable: true });
};

describe('Layout.setGroupSize / computeSizes（锚点安全）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('兄弟之间夹注释锚点：end 仍为有限值，新组按前一组比例收敛', () => {
		const parent = document.createElement('group') as SizedElement;
		parent.className = 'group horizontal';
		parent.split = 'horizontal';
		sizedData(parent).end = 1;
		setWidth(parent, 1000);
		const g1 = createGroup(0.5);
		const g3 = createGroup(1);
		const border = document.createElement('group-border');
		border.className = 'group-border';
		parent.append(
			g1,
			document.createComment('vue-anchor'),
			g3,
			document.createComment('vue-anchor'),
			border
		);
		document.body.append(parent);
		const g2 = createGroup(undefined);
		// 插到 g1 与 g3 之间（前后都是注释锚点）：previousElementSibling=g1、nextElementSibling=g3
		parent.insertBefore(g2, g3);

		Layout.setGroupSize!(g2 as never, { width: 200, height: 200 }, 'forward');

		expect(Number.isFinite(sizedData(g2).end)).toBe(true);
		expect(Number.isFinite(sizedData(g1).end)).toBe(true);
		expect(Number.isFinite(sizedData(g3).end)).toBe(true);
		// 新组 = 前一组 end + 自身宽度比例；后继组存在时 size 额外 +1px（边框留白）
		expect(sizedData(g2).end).toBeCloseTo(0.701, 5);
	});

	it('末尾组（其后仅有锚点与 border）在 forward 下取整段跨度', () => {
		const parent = document.createElement('group') as SizedElement;
		parent.className = 'group horizontal';
		parent.split = 'horizontal';
		sizedData(parent).end = 1;
		setWidth(parent, 800);
		const g1 = createGroup(0.4);
		const g2 = createGroup(0.9);
		const border = document.createElement('group-border');
		border.className = 'group-border';
		parent.append(g1, document.createComment('a'), g2, document.createComment('b'), border);
		document.body.append(parent);

		Layout.setGroupSize!(g2 as never, { width: 100, height: 100 }, 'forward');

		expect(Number.isFinite(sizedData(g2).end)).toBe(true);
		expect(Number.isFinite(sizedData(g1).end)).toBe(true);
		expect(sizedData(g1).end).toBeLessThanOrEqual(sizedData(g2).end);
		expect(sizedData(g2).end).toBe(1);
	});
});
