import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { CommandList } from '@app/components/command-list.ts';
import {
	applyCommandListInstanceOverride,
	ensureUpdateCommandElementOverride,
	updateCommandElement
} from '@app/module/eslints.ts';
import { YMCommandList, type CommandListApiOptions } from '@ui-kit';

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


/** 取渲染出来的行元素（换源后行归模板渲染；api 侧 elements 是离屏元素） */
const renderedRows = (el: HTMLElement): (HTMLElement & { lines?: HTMLElement[] })[] =>
	Array.from(el.querySelectorAll<HTMLElement & { lines?: HTMLElement[] }>('.command-item'));

/** 挂载命令列表组件（换源后必须走组件，行元素才会被渲染） */
const mountCommandList = async (options: CommandListApiOptions): Promise<HTMLElement> => {
	const wrapper = mount(YMCommandList, { props: { options } });
	const el = wrapper.element as unknown as HTMLElement;
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	(el as unknown as { scroll: unknown }).scroll = (): void => {};
	await nextTick();
	return el;
};

describe('eslints updateCommandElement Vue 渲染（command-mark-major / command-line 回归保护）', () => {
	it('经 Vue 渲染 command-mark-major 与 command-line 缩进线', () => {
		const element = createElement(3);
		const fakeThis = createFakeThis();
		updateCommandElement.call(fakeThis, element);

		const marks = element.querySelectorAll('.command-mark-major');
		expect(marks.length).toBe(1);
		expect(marks[0].classList.contains('command-mark-major')).toBe(true);
		expect(element.pre).toBe(marks[0]);

		const lines = element.querySelectorAll('.command-line');
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

		expect(element.querySelectorAll('.command-line').length).toBe(1);
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

		expect(element.querySelectorAll('.command-mark-major').length).toBe(1);
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

describe('eslints 折叠线显示（区块竖线收尾）', () => {
	const makeLine = (): HTMLElement => {
		const line = document.createElement('span');
		line.className = 'command-line';
		return line;
	};
	const makeItem = (dataIndent: number, opts: { fold?: boolean } = {}) => {
		const e = document.createElement('div') as unknown as {
			dataIndent: number;
			lines: HTMLElement[];
			fold?: boolean;
			dataItem?: object | null;
			dataKey?: boolean;
			classList: DOMTokenList;
		};
		e.dataIndent = dataIndent;
		e.dataItem = {};
		e.lines = [];
		for (let i = dataIndent; i >= 0; i--) {
			e.lines[i] = makeLine();
		}
		if (opts.fold) {
			e.fold = true;
		}
		return e;
	};
	const dispatchUpdate = (items: unknown[]) => {
		const el = document.createElement('div') as unknown as HTMLElement & {
			elements: unknown[];
		};
		(items as unknown as { count: number }).count = items.length;
		el.elements = items;
		applyCommandListInstanceOverride(el as never);
		el.dispatchEvent(new Event('update'));
	};

	it('顶层块 header line-start；顶层普通行（含最后一行）不显示折叠线', () => {
		const header = makeItem(0, { fold: true });
		const wait = makeItem(0);
		const last = makeItem(0);
		dispatchUpdate([header, wait, last]);
		expect(header.lines[0].classList.contains('line-start')).toBe(true);
		expect(header.lines[0].classList.contains('line-hide')).toBe(false);
		// 顶层普通行（等待，非最后）→ 不显示折叠线
		expect(wait.lines[0].classList.contains('line-hide')).toBe(true);
		expect(wait.lines[0].classList.contains('line-end')).toBe(false);
		// 顶层最后一行（不可折叠）→ 同样不显示折叠线
		expect(last.lines[0].classList.contains('line-hide')).toBe(true);
		expect(last.lines[0].classList.contains('line-end')).toBe(false);
	});

	it('子块最后一行（indent 2，后面回顶层）最深线隐藏且父线收尾', () => {
		const header = makeItem(0, { fold: true });
		const last = makeItem(2);
		const top = makeItem(0);
		dispatchUpdate([header, last, top]);
		// last 为普通内容行 → 最深线隐藏（不绘制自身层级折叠线）
		expect(last.lines[2].classList.contains('line-hide')).toBe(true);
		expect(last.lines[2].classList.contains('line-end')).toBe(false);
		// 父线（indent 1）在 last 行结束
		expect(last.lines[1].classList.contains('line-end')).toBe(true);
		// 顶层线（indent 0）延续至 top
		expect(last.lines[0].classList.contains('line-end')).toBe(false);
	});

	it('块内中间行最深线隐藏、父线竖线延续；块末行最深线隐藏但父线保留；顶层普通行不显示', () => {
		const header = makeItem(0, { fold: true });
		const mid = makeItem(1);
		const tail = makeItem(1);
		const nextTop = makeItem(0);
		dispatchUpdate([header, mid, tail, nextTop]);
		// mid（数值）后面有同层 tail → 普通行最深线隐藏，父线竖线延续
		expect(mid.lines[1].classList.contains('line-hide')).toBe(true);
		expect(mid.lines[0].classList.contains('line-end')).toBe(false);
		// tail 为普通内容行 → 最深线隐藏，顶层线保留（nextTop 仍存在）
		expect(tail.lines[1].classList.contains('line-hide')).toBe(true);
		expect(tail.lines[1].classList.contains('line-end')).toBe(false);
		expect(tail.lines[0].classList.contains('line-end')).toBe(false);
		// nextTop（顶层最后一行）→ 不显示折叠线
		expect(nextTop.lines[0].classList.contains('line-hide')).toBe(true);
		expect(nextTop.lines[0].classList.contains('line-end')).toBe(false);
	});

	it('列表末尾为顶层普通项时不显示折叠线', () => {
		const a = makeItem(0);
		const b = makeItem(0);
		dispatchUpdate([a, b]);
		expect(a.lines[0].classList.contains('line-hide')).toBe(true);
		expect(b.lines[0].classList.contains('line-hide')).toBe(true);
		expect(b.lines[0].classList.contains('line-end')).toBe(false);
	});
});

describe('eslints + CommandList 集成（Block 块最后一行折叠线）', () => {
	const makeOptions = (): CommandListApiOptions => ({
		command: {
			parse: (item: Record<string, unknown>) => {
				const cmds = item.commands as unknown[] | undefined;
				if (cmds && cmds.length) {
					// 真实 Block 结构：children 后还有「区块结束」文本行
					return [
						{ fold: true },
						{ color: 'normal' },
						// oxlint-disable-next-line no-base-to-string
						{ text: String(item.id) },
						{ children: cmds },
						{ color: 'normal' },
						// oxlint-disable-next-line no-base-to-string
						{ text: String(item.id) + '.end' }
					];
				}
				// oxlint-disable-next-line no-base-to-string
				return [{ color: 'normal' }, { text: String(item.id) }];
			},
			fetchVariables: () => [],
			insert: vi.fn(),
			edit: vi.fn(),
			parseUnlinkedId: (id: string) => id,
			colorizeCodeLines: vi.fn()
		} as CommandListApiOptions['command'],
		clipboard: { write: vi.fn(), read: () => [], has: () => false },
		commandHistory: class {
			save(): void {}
			restore(): void {}
			canUndo(): boolean {
				return false;
			}
			canRedo(): boolean {
				return false;
			}
		} as unknown as CommandListApiOptions['commandHistory'],
		localize: {
			language: 'zh-CN',
			get: (key: string) => key,
			createGetter: () => (key: string) => key
		}
	});

	it('循环块 + 顶层等待 + 最后一行：块 header line-start、块结束行（footer）line-end、顶层普通行隐藏', async () => {
		ensureUpdateCommandElementOverride();
		const el = await mountCommandList(makeOptions()) as unknown as HTMLElement & {
			write: (data: unknown[]) => void;
			update: () => void;
			elements: {
				count: number;
				[i: number]: HTMLElement & {
					dataIndent: number;
					lines: HTMLElement[];
					dataItem: unknown;
				};
			};
		};
		Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
		Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
		applyCommandListInstanceOverride(el);
		el.write([
			{
				id: 'loop',
				params: {},
				commands: [
					{ id: 'st1', params: {} },
					{ id: 'st2', params: {} }
				]
			},
			{ id: 'wait', params: {} },
			{ id: 'repeat', params: {} }
		]);
		el.update();
		el.dispatchEvent(new Event('update'));

		await nextTick();
		await nextTick();
		const realRows: Array<{ dataIndent: number; lines: HTMLElement[] }> = [];
		for (let i = 0; i < el.elements.count; i++) {
			const row = renderedRows(el)[i];
			if (row && row.dataItem !== null && row.lines) {
				realRows.push({ dataIndent: row.dataIndent, lines: row.lines });
			}
		}
		// 期望结构：loop(0 fold) / st1(1) / st2(1) / loop.end(0 footer) / wait(0) / repeat(0)
		expect(realRows.length).toBe(6);
		const loop = realRows[0];
		const st1 = realRows[1];
		const st2 = realRows[2];
		const loopEnd = realRows[3];
		const wait = realRows[4];
		const repeat = realRows[5];
		// 循环块 header → 短竖线
		expect(loop.dataIndent).toBe(0);
		expect(loop.lines[0].classList.contains('line-start')).toBe(true);
		// 子块中间行（st1）→ 最深线隐藏，父线（循环线）竖线延续
		expect(st1.dataIndent).toBe(1);
		expect(st1.lines[1].classList.contains('line-hide')).toBe(true);
		expect(st1.lines[0].classList.contains('line-end')).toBe(false);
		expect(st1.lines[0].classList.contains('line-hide')).toBe(false);
		// 子块普通行（st2）→ 最深线隐藏，循环父线竖线延续
		expect(st2.lines[1].classList.contains('line-hide')).toBe(true);
		expect(st2.lines[1].classList.contains('line-end')).toBe(false);
		expect(st2.lines[0].classList.contains('line-end')).toBe(false);
		// 循环「结束」标记行（footer）→ L 形收尾
		expect(loopEnd.lines[0].classList.contains('line-end')).toBe(true);
		expect(loopEnd.lines[0].classList.contains('line-hide')).toBe(false);
		// 顶层等待（非最后）→ 不显示折叠线
		expect(wait.lines[0].classList.contains('line-hide')).toBe(true);
		// 顶层最后一行（repeat）→ 不显示折叠线
		expect(repeat.lines[0].classList.contains('line-hide')).toBe(true);
		expect(repeat.lines[0].classList.contains('line-end')).toBe(false);
	});

	it('write 后立即经 resize 应用折叠线（不依赖额外 update 派发）', async () => {
		ensureUpdateCommandElementOverride();
		const el = await mountCommandList(makeOptions()) as unknown as HTMLElement & {
			write: (data: unknown[]) => void;
			elements: {
				count: number;
				[i: number]: HTMLElement & {
					dataIndent: number;
					lines: HTMLElement[];
					dataItem: unknown;
				};
			};
		};
		Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
		Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
		applyCommandListInstanceOverride(el);
		el.write([
			{
				id: 'loop',
				params: {},
				commands: [{ id: 'st1', params: {} }]
			},
			{ id: 'wait', params: {} }
		]);

		const rows: Array<{ dataIndent: number; lines: HTMLElement[] }> = [];
		for (let i = 0; i < el.elements.count; i++) {
			const row = renderedRows(el)[i];
			if (row && row.dataItem !== null && row.lines) {
				rows.push({ dataIndent: row.dataIndent, lines: row.lines });
			}
		}
		expect(rows.length).toBe(4); // loop / st1 / loop.end / wait
		// 折叠块 header 折叠线生效
		expect(rows[0].lines[0].classList.contains('line-start')).toBe(true);
		// 块结束行 footer L 形收尾
		expect(rows[2].lines[0].classList.contains('line-end')).toBe(true);
		// 顶层普通行不显示折叠线
		expect(rows[3].lines[0].classList.contains('line-hide')).toBe(true);
		expect(rows[3].lines[0].classList.contains('line-end')).toBe(false);
	});
});
