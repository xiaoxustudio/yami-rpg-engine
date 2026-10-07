import { beforeEach, describe, expect, it } from 'vitest';
import { elementDataOf } from '@ui-kit';
import { Layout } from '@app/engine/layout/layout.ts';
import '@app/utils/math';

interface SizedElement extends HTMLElement {
	split?: string;
}

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
		parent.insertBefore(g2, g3);

		Layout.setGroupSize!(g2 as never, { width: 200, height: 200 }, 'forward');

		expect(Number.isFinite(sizedData(g2).end)).toBe(true);
		expect(Number.isFinite(sizedData(g1).end)).toBe(true);
		expect(Number.isFinite(sizedData(g3).end)).toBe(true);
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

	it('父节点不是 split（无分割轴）：不写 NaN 到 end，直接放弃像素收敛', () => {
		const page = document.createElement('div') as SizedElement;
		page.className = 'page-frame';
		setWidth(page, 1000);
		const g1 = createGroup(1);
		const g2 = createGroup(1);
		page.append(g1, g2);
		document.body.append(page);

		Layout.setGroupSize!(g1 as never, { width: 200, height: 200 }, 'forward');
		expect(Number.isFinite(sizedData(g1).end)).toBe(true);
		expect(sizedData(g1).end).toBe(1);

		Layout.setGroupSize!(g2 as never, { width: 200, height: 200 }, 'backward');
		expect(Number.isFinite(sizedData(g2).end)).toBe(true);
		expect(sizedData(g2).end).toBe(1);
		expect(Number.isFinite(sizedData(g1).end)).toBe(true);
	});
});
