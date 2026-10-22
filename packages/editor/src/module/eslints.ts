import { EventBus } from '@app/utils/event-bus.ts';
import { on } from '@app/utils/element-utils.ts';
import { CommandList } from '@app/components/command-list.ts';
import { h } from 'vue';
import { renderDetached } from '@app/utils/dom';
import { elementDataOf } from '@app/utils/element-data';
import type { YamiElement } from '@app/types/element-api';
import { clamp } from '@app/utils/math';

let _origUpdateCommandElement:
	| ((this: typeof CommandList, element: CommandItemElement) => unknown)
	| undefined;
let _origResize: ((...args: unknown[]) => unknown) | undefined;
let _origUpdateLineClasses: (() => void) | undefined;
const lineClassesScheduled = new WeakSet<object>();
interface CommandItemElement extends YamiElement {
	pre: HTMLElement;
	lines: (HTMLElement & { mark?: string })[];
	dataIndent: number;
	eventBinding?: boolean;
}

interface CommandListShape {
	count: number;
	findIndex: (cb: (v: unknown) => boolean) => number;
	[i: number]: CommandItemElement & { fold?: boolean; mark?: string; buffer?: unknown };
}

interface CommandLineRow {
	classList: DOMTokenList;
	lines?: (HTMLElement & { mark?: string })[];
	dataIndent?: number;
	dataItem?: unknown;
	fold?: boolean;
	mark?: string;
}

interface CommandLineRows {
	count: number;
	lineClassEnabled?: boolean;
	[i: number]: CommandLineRow;
}
export function updateCommandElement(
	this: typeof CommandList & { computeTextIndent: (indent: number) => string },
	element: CommandItemElement
): unknown {
	const ret = _origUpdateCommandElement?.call(this, element);

	element.querySelectorAll('.command-mark-major').forEach((e: Element) => {
		e.remove();
	});

	element.querySelectorAll('.command-mark-minor').forEach((e: Element) => {
		e.remove();
	});

	const pre = renderDetached(h('span', { class: 'command-mark-major' }));
	element.insertBefore(pre, element.firstElementChild);
	element.pre = pre;

	element.lines = [];
	for (let i = element.dataIndent; i >= 0; i--) {
		const line = renderDetached(
			h('span', {
				class: 'command-line',
				style: { marginLeft: this.computeTextIndent!(i) }
			})
		);
		element.insertBefore(line, element.firstElementChild);
		element.lines[i] = line;
	}

	const list = (this as { elements?: CommandListShape }).elements as CommandListShape;
	if (!element?.eventBinding) {
		on(element, 'mouseenter', function () {
			let indent: number | null = null;
			const { start, end } = range(
				list,
				list.findIndex((v: unknown) => v === element)
			);
			for (let i = start; i <= end; i++) {
				const element = list[i];
				if (!element) continue;
				if (indent === null) {
					indent = element.dataIndent;
				}
				const needNode = element.lines?.[indent];
				if (needNode && needNode.mark !== 'header') needNode.classList.add('hover');
			}
		});
		on(element, 'mouseleave', function () {
			let indent: number | null = null;
			const { start, end } = range(
				list,
				list.findIndex((v: unknown) => v === element)
			);
			for (let i = start; i <= end; i++) {
				const element = list[i];
				if (!element) continue;
				if (indent === null) {
					indent = element.dataIndent;
				}
				const needNode = element.lines?.[indent];
				if (needNode && needNode.mark !== 'header') needNode.classList.remove('hover');
			}
		});
		element.eventBinding = true;
	}

	if (list && !lineClassesScheduled.has(list)) {
		lineClassesScheduled.add(list);
		queueMicrotask(() => {
			lineClassesScheduled.delete(list);
			applyLineClasses(list);
		});
	}

	return ret;
}

function applyLineClasses(list: CommandLineRows): void {
	if (!(list as { lineClassEnabled?: boolean }).lineClassEnabled) return;
	let nextIndent = Infinity;
	for (let i = list.count - 1; i >= 0; i--) {
		const e = list[i];
		if (!e?.lines) continue;
		const d = e.dataIndent ?? -1;
		const isReal = e.dataItem != null;
		const deepest = e.lines[d];
		if (deepest) {
			deepest.classList.remove('line-start', 'line-end', 'line-hide');
			if (isReal) {
				if (e.fold) {
					deepest.classList.add('line-start');
				} else if (e.mark === 'footer') {
					deepest.classList.add('line-end');
				} else if (e.mark !== 'option') {
					deepest.classList.add('line-hide');
				}
			} else {
				deepest.classList.add('line-hide');
			}
		}
		for (let indent = 0; indent < d; indent++) {
			const line = e.lines[indent];
			if (!line) continue;
			line.classList.remove('line-start', 'line-end', 'line-hide');
			if (!isReal) continue;
			if (nextIndent !== Infinity && nextIndent >= indent) {
				continue;
			}
			line.classList.add('line-end');
		}
		if (isReal) {
			nextIndent = d;
		}
	}
}

/**
 * 取模板渲染出来的行元素；未渲染时返回 `null`。
 */
function renderedRowsOf(list: {
	querySelectorAll?: (selector: string) => NodeListOf<Element>;
}): CommandLineRows | null {
	const rendered = list.querySelectorAll?.('.command-item');
	if (!rendered || rendered.length === 0) return null;
	return Object.assign(Array.from(rendered), {
		count: rendered.length,
		lineClassEnabled: true
	});
}

function resize(this: { elements: CommandListShape } & HTMLElement, ...args: unknown[]): unknown {
	const ret = _origResize?.apply(this, args);
	const rendered = renderedRowsOf(this);
	if (rendered) applyLineClasses(rendered);
	else applyLineClasses(this.elements);
	return ret;
}

/**
 * 模板挂完一批行后由组件调用的钩子（见 ui-kit 的 `updateLineClasses`）。
 * 在这里做"渲染出来后才能做"的跨行处理：把 `elements` 上算好的 `mark` 同步到渲染行，
 * 再对渲染行跑折叠线分类（line-start/line-end）。
 */
function updateLineClasses(this: HTMLElement & { elements: CommandListShape }): void {
	const rendered = renderedRowsOf(this);
	if (!rendered) return;
	const list = this.elements;
	for (let i = 0; i < rendered.count; i++) {
		const row = rendered[i];
		const source = list[i];
		if (!source?.mark) continue;
		row.mark = source.mark;
		row.classList.add(source.mark);
	}
	applyLineClasses(rendered);
}

export function ensureResizeOverride(): void {
	if (_origResize) return;
	_origResize = CommandList.prototype.resize;
	CommandList.prototype.resize = resize;
}

export function ensureLineClassesOverride(): void {
	if (_origUpdateLineClasses) return;
	_origUpdateLineClasses = CommandList.prototype.updateLineClasses;
	CommandList.prototype.updateLineClasses = updateLineClasses;
}

export function ensureUpdateCommandElementOverride(): void {
	if (!_origUpdateCommandElement) {
		_origUpdateCommandElement = CommandList.prototype.updateCommandElement;
		CommandList.prototype.updateCommandElement = updateCommandElement;
	}
	ensureResizeOverride();
	ensureLineClassesOverride();
}

/**
 * 选区里的「活动行」下标。
 */
const activeIndexOf = (list: unknown): number | null => {
	const { active } = elementDataOf<{ active?: number | null }>(list as HTMLElement);
	return typeof active === 'number' ? active : null;
};

/**
 * 活动行的屏幕位置。优先取**渲染出来的那一行**（api 侧 `elements[]` 是离屏元素，
 * `getBoundingClientRect()` 恒为 0），行下标取元素数据 `dataValue`（见 `bindRowElement`）。
 *
 * 活动行可能还没物化：`scrollAndResize()` 会改 `scrollTop`，而模板补丁要等 Vue 的一拍，
 * 此刻同步读 DOM 只能拿到旧窗口。这时按渲染行的**实测行距**外推（`.command-item` 固定 20px
 * 行高），让"插入到列表底部"这类需要滚动的流程也能定位命令控件。
 */
const selectionPointOf = (list: HTMLElement, index: number): { x: number; y: number } | null => {
	const rendered: { index: number; rect: DOMRect }[] = [];
	for (const row of list.querySelectorAll<HTMLElement>('.command-item')) {
		const rowIndex = elementDataOf<{ dataValue?: number }>(row).dataValue;
		if (typeof rowIndex !== 'number') continue;
		const marker = (row as CommandItemElement).pre ?? row;
		rendered.push({ index: rowIndex, rect: marker.getBoundingClientRect() });
	}
	if (rendered.length === 0) return null;
	rendered.sort((a, b) => a.index - b.index);
	const exact = rendered.find((row) => row.index === index);
	if (exact) return { x: exact.rect.x, y: exact.rect.y };
	const first = rendered[0];
	const last = rendered[rendered.length - 1];
	const span = last.index - first.index;
	const step = span > 0 ? (last.rect.y - first.rect.y) / span : first.rect.height || 20;
	const anchor = index < first.index ? first : last;
	return { x: anchor.rect.x, y: anchor.rect.y + (index - anchor.index) * step };
};

export function initEslints(): void {
	EventBus.once('editor_loaded', () => {
		ensureUpdateCommandElementOverride();
	});
}

type SelectionPositionHost = HTMLElement & {
	getSelectionPosition: (this: HTMLElement) => { x: number; y: number } | null;
};

export function applyCommandListInstanceOverride(
	commandList: typeof CommandList | HTMLElement
): void {
	if (!commandList) return;
	const prototype =
		'prototype' in commandList && commandList.prototype
			? (commandList as typeof CommandList).prototype
			: (commandList as HTMLElement);
	(prototype as SelectionPositionHost).getSelectionPosition = function (
		this: HTMLElement
	): { x: number; y: number } | null {
		const index = activeIndexOf(this);
		return index === null ? null : selectionPointOf(this, index);
	};
	on(commandList, 'update', function (this: { elements: CommandListShape } & HTMLElement) {
		const list = this.elements;
		(list as { lineClassEnabled?: boolean }).lineClassEnabled = true;
		for (let i = 0; i < list.count; i++) {
			const e = list[i];
			if (e.fold) {
				e.mark = 'header';
			} else {
				e.mark = 'item';
				const buffer = e.dataItem?.buffer;
				if (buffer && buffer.length > 1) {
					e.mark = 'option';
					if (buffer[buffer.length - 1] == e) {
						e.mark = 'footer';
					}
				}
			}
			e.classList.add(e.mark!);
		}
		applyLineClasses(list);
		const rendered = renderedRowsOf(this);
		if (rendered) {
			for (let i = 0; i < rendered.count; i++) {
				const row = rendered[i];
				const source = list[i];
				if (source?.mark) row.classList.add(source.mark);
			}
			applyLineClasses(rendered);
		}
	});
}

export function range(
	elements: CommandListShape,
	start: number,
	end: number = start
): { start: number; end: number; indent?: number } {
	const count = elements.count;
	start = clamp(start, 0, count - 1);
	end = clamp(end, 0, count - 1);
	let indent = Infinity;
	for (let i = start; i <= end; i++) {
		const element = elements[i];
		if (!element) continue;
		const { dataIndent } = element;
		if (dataIndent < indent) {
			indent = dataIndent;
		}
	}
	for (let i = start; i >= 0; i--) {
		const element = elements[i];
		if (element && element.dataIndent === indent && element.dataKey === true) {
			start = i;
			break;
		}
	}
	for (let i = end + 1; i < count; i++) {
		const element = elements[i];
		if (
			element &&
			(element.dataIndent < indent ||
				(element.dataIndent === indent && element.dataKey === true))
		) {
			end = i - 1;
			break;
		}
	}
	if (start !== end) {
		const element = elements[end];
		if (element && !element.dataItem) {
			end--;
		}
	}
	return {
		start,
		end,
		indent
	};
}
