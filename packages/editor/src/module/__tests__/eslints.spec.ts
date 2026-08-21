import { describe, expect, it } from 'vitest';
import { CommandList } from '@app/components/command-list.ts';
import { updateCommandElement } from '@app/module/eslints.ts';

type CommandItemElement = Parameters<typeof updateCommandElement>[0];

const createElement = (dataIndent: number): CommandItemElement => {
	const element = document.createElement('div') as unknown as CommandItemElement;
	element.dataIndent = dataIndent;
	element.pre = document.createElement('div');
	element.lines = [];
	return element;
};

const createFakeThis = (): typeof CommandList & {
	computeTextIndent: (indent: number) => string;
	elements: { count: number; findIndex: (cb: (v: unknown) => boolean) => number };
} => ({
	alphabetCode: /a/,
	highlightedTexts: [],
	highlightTexts: () => {},
	unhighlightTexts: () => {},
	textPointerenter: () => {},
	textPointerleave: () => {},
	prototype: {},
	computeTextIndent: (indent: number) => `${indent * 8}px`,
	elements: { count: 0, findIndex: () => -1 }
});

describe('eslints updateCommandElement Vue 渲染（command-mark-major / command-line 回归保护）', () => {
	it('经 Vue 渲染 command-mark-major 与 command-line 缩进线', () => {
		const element = createElement(3);
		const fakeThis = createFakeThis();
		updateCommandElement.call(fakeThis, element);

		const marks = element.querySelectorAll('command-mark-major');
		expect(marks.length).toBe(1);
		expect(marks[0].classList.contains('command-mark-major')).toBe(true);
		expect(element.pre).toBe(marks[0]);

		const lines = element.querySelectorAll('command-line');
		expect(lines.length).toBe(4);
		expect(element.lines.length).toBe(4);
		lines.forEach((line, i) => {
			expect(line.classList.contains('command-line')).toBe(true);
			expect(element.lines[i]).toBe(line);
			expect((line as HTMLElement).style.marginLeft).toBe(`${i * 8}px`);
		});

		expect(element.children[0]).toBe(element.lines[0]);
		expect(element.children[1]).toBe(element.lines[1]);
		expect(element.children[2]).toBe(element.lines[2]);
		expect(element.children[3]).toBe(element.lines[3]);
		expect(element.children[4]).toBe(marks[0]);
	});

	it('dataIndent 为 0 时仅渲染单条缩进线', () => {
		const element = createElement(0);
		const fakeThis = createFakeThis();
		updateCommandElement.call(fakeThis, element);

		expect(element.querySelectorAll('command-line').length).toBe(1);
		expect(element.children[0]).toBe(element.lines[0]);
		expect(element.children[1]).toBe(element.pre);
	});

	it('重复更新时 command-mark-major 移除重建、command-line 行为与原实现一致', () => {
		const element = createElement(2);
		const fakeThis = createFakeThis();
		updateCommandElement.call(fakeThis, element);
		const oldLines = [...element.lines];
		const oldPre = element.pre;
		element.dataIndent = 1;
		updateCommandElement.call(fakeThis, element);

		expect(element.querySelectorAll('command-mark-major').length).toBe(1);
		expect(element.pre).not.toBe(oldPre);
		expect(element.lines.length).toBe(2);
		element.lines.forEach((line, i) => {
			expect(line.classList.contains('command-line')).toBe(true);
			expect((line as HTMLElement).style.marginLeft).toBe(`${i * 8}px`);
		});
		expect(oldLines.every((line) => line.parentNode === element)).toBe(true);
		expect(element.children[0]).toBe(element.lines[0]);
		expect(element.children[1]).toBe(element.lines[1]);
		expect(element.children[2]).toBe(element.pre);
	});
});
