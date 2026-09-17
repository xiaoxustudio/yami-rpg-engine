import { EventBus } from '@app/utils/event-bus.ts';
import { on } from '@app/utils/element-utils.ts';
import { CommandList } from '@app/components/command-list.ts';
import { h } from 'vue';
import { renderDetached } from '@app/utils/dom';
import type { YamiElement } from '@app/types/element-api';
import { clamp } from '@app/utils/math';

let _origUpdateCommandElement:
	| ((this: typeof CommandList, element: CommandItemElement) => unknown)
	| undefined;
let _origResize: ((...args: unknown[]) => unknown) | undefined;
let _origUpdateLineClasses: (() => void) | undefined;
// 缩进线生成后（updateCommandElement 内）批量重算显示状态，避免滚动新渲染行没有样式
const lineClassesScheduled = new WeakSet<object>();
// command-list 内 command-item 元素运行时挂载的扩展字段
interface CommandItemElement extends YamiElement {
	pre: HTMLElement;
	lines: HTMLElement[];
	dataIndent: number;
	eventBinding?: boolean;
}

interface CommandListShape {
	count: number;
	findIndex: (cb: (v: unknown) => boolean) => number;
	[i: number]: CommandItemElement & { fold?: boolean; mark?: unknown; buffer?: unknown };
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

	// P1b：离屏节点统一走 utils/dom 的 renderDetached（原先 document.createElement + render）
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

	const list = ((this as unknown as { elements?: CommandListShape }).elements ??
		(CommandList.prototype.elements as unknown as
			| CommandListShape
			| undefined)) as CommandListShape;
	if (!element?.eventBinding) {
		on(element, 'mouseenter', function () {
			let indent: number | null = null;
			const { start, end } = range(
				list,
				list.findIndex((v: unknown) => v === element)
			);
			for (let i = start; i <= end; i++) {
				const element = list[i];
				// 步骤 4：虚拟窗口外行未物化（elements[i] 为空），跳过
				if (!element) continue;
				if (indent === null) {
					indent = element.dataIndent;
				}
				const needNode = element.lines?.[indent];
				if (needNode && (needNode as unknown as { mark?: string }).mark !== 'header')
					needNode.classList.add('hover');
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
				if (needNode && (needNode as unknown as { mark?: string }).mark !== 'header')
					needNode.classList.remove('hover');
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

// 计算每条缩进线的显示状态：折叠块 header 短竖线、块结束标记（footer）L 形收尾、其余内容行隐藏
function applyLineClasses(list: CommandListShape): void {
	if (!(list as { lineClassEnabled?: boolean }).lineClassEnabled) return;
	// 反向遍历：每条竖线「延续 / 收尾」取决于其后是否还有同层/更深内容；
	// 块结束标记（footer）做 L 形收尾；顶层不可折叠指令与普通内容行不显示折叠线
	let nextIndent = Infinity;
	for (let i = list.count - 1; i >= 0; i--) {
		const e = list[i];
		if (!e?.lines) continue;
		const d = e.dataIndent;
		const isReal = e.dataItem != null;
		// 最深线（行自身的折叠线）
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
				// mark === 'option'：折叠区块内部行（如 else），保留竖线（不添加任何类）
			} else {
				deepest.classList.add('line-hide');
			}
		}
		// 父级线（i < d）：表示第 i 层块的存续线
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
 * M3-5b′（命令列表换源）：行元素已由模板渲染，而 api 侧的 `elements` 是**离屏元素**
 * （跨行判定如 `buffer[buffer.length-1] == e` 仍以 `elements` 为准，语义不变）。
 * 因此折叠线相关处理分两步：**照旧在 `elements` 上计算**，再把结果**同步到渲染出来的行**上。
 * 取不到渲染行时返回 `null`（未换源用法不受影响）。
 */
function renderedRowsOf(list: {
	querySelectorAll?: (selector: string) => NodeListOf<Element>;
}): (CommandListShape & { lineClassEnabled?: boolean }) | null {
	const rendered = list.querySelectorAll?.('.command-item');
	if (!rendered || rendered.length === 0) return null;
	return Object.assign(Array.from(rendered), {
		count: rendered.length,
		lineClassEnabled: true
	}) as unknown as CommandListShape & { lineClassEnabled?: boolean };
}

function resize(this: { elements: CommandListShape } & HTMLElement, ...args: unknown[]): unknown {
	const ret = _origResize?.apply(this, args);
	// 折叠线要同时作用在**渲染出来的行**上（用户看到的是它们）
	const rendered = renderedRowsOf(this);
	if (rendered) applyLineClasses(rendered);
	else applyLineClasses(this.elements);
	return ret;
}

/**
 * M3-5b′：模板挂完一批行后由组件调用的钩子（见 ui-kit 的 `updateLineClasses`）。
 * 在这里做"渲染出来后才能做"的跨行处理：把 `elements` 上算好的 `mark` 同步到渲染行，
 * 再对渲染行跑折叠线分类（line-start/line-end）。
 */
function updateLineClasses(this: HTMLElement & { elements: CommandListShape }): void {
	const rendered = renderedRowsOf(this);
	if (!rendered) return;
	const list = this.elements;
	for (let i = 0; i < rendered.count; i++) {
		const row = rendered[i] as unknown as { classList: DOMTokenList; mark?: string };
		const source = list[i] as unknown as { mark?: string } | undefined;
		if (!source?.mark) continue;
		// `mark` 既是类名也是**属性**：`applyLineClasses` 里按 footer/header 分支时读的是属性
		row.mark = source.mark;
		row.classList.add(source.mark);
	}
	// 真正要分类的是**渲染出来的行**（只有它们有 `updateCommandElement` 生成的 `lines`）：
	// api 侧的 `elements` 是离屏元素，换源后不再走行内渲染，`lines` 为空。
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

export function initEslints(): void {
	EventBus.once('editor_loaded', () => {
		// 必须在覆盖之前捕获原方法，否则新方法首次调用时取到的 prototype.updateCommandElement 已是新方法自己，_origUpdateCommandElement.call(this, ...) 会无限递归调自己
		ensureUpdateCommandElementOverride();
	});
}

export function applyCommandListInstanceOverride(
	commandList: typeof CommandList | HTMLElement
): void {
	if (!commandList) return;
	const prototype =
		'prototype' in commandList && commandList.prototype
			? (commandList as typeof CommandList).prototype
			: (commandList as HTMLElement);
	// oxlint-disable-next-line no-explicit-any
	(prototype as HTMLElement & Record<string, any>).getSelectionPosition = function (this: {
		elements: { pre: HTMLElement }[];
		active: number;
	}) {
		return this.elements[this.active].pre.getBoundingClientRect();
	};
	on(commandList, 'update', function (this: { elements: { dataIndent: number }[] }) {
		const list = this.elements as unknown as CommandListShape;
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
			e.classList.add(e.mark as unknown as string);
		}
		applyLineClasses(list);
		// M3-5b′：把同一套结果同步到**渲染出来的行**（模板行才是用户看到的那些）
		const rendered = renderedRowsOf(this as unknown as HTMLElement);
		if (rendered) {
			for (let i = 0; i < rendered.count; i++) {
				const row = rendered[i] as unknown as { classList: DOMTokenList };
				const source = list[i] as unknown as { mark?: string };
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
		// 步骤 4：窗口外行未物化，跳过（elements[i] 为空）
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
