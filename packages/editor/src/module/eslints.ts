import { EventBus } from '@app/utils/event-bus.ts';
import { on } from '@app/utils/element-utils.ts';
import { CommandList } from '@app/components/command-list.ts';
import { h } from 'vue';
import { renderDetached } from '@app/utils/dom';

let _origUpdateCommandElement:
	| ((this: typeof CommandList, element: CommandItemElement) => unknown)
	| undefined;
let _origResize: ((...args: unknown[]) => unknown) | undefined;
// 缩进线生成后（updateCommandElement 内）批量重算显示状态，避免滚动新渲染行没有样式
const lineClassesScheduled = new WeakSet<object>();
// command-list 内 command-item 元素运行时挂载的扩展字段
interface CommandItemElement extends HTMLElement {
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

function resize(
	this: { elements: CommandListShape } & HTMLElement,
	...args: unknown[]
): unknown {
	const ret = _origResize?.apply(this, args);
	// M3-5b′（命令列表换源）：行元素已由模板渲染，api 侧的 `elements` 是**离屏元素**，
	// 折叠线必须作用在**渲染出来的行**上；取不到渲染行时回退到 `elements`（兼容未换源的用法）。
	const rendered = this.querySelectorAll?.('.command-item');
	const target =
		rendered && rendered.length > 0
			? (Object.assign(Array.from(rendered), {
					count: rendered.length,
					// 契约：`applyLineClasses` 只在这面旗打开时才画线（与 `elements` 上的同名标记一致）
					lineClassEnabled: (this as { lineClassEnabled?: boolean }).lineClassEnabled
				}) as unknown as CommandListShape)
			: this.elements;
	applyLineClasses(target);
	return ret;
}

export function ensureResizeOverride(): void {
	if (_origResize) return;
	_origResize = CommandList.prototype.resize;
	CommandList.prototype.resize = resize;
}

export function ensureUpdateCommandElementOverride(): void {
	if (!_origUpdateCommandElement) {
		_origUpdateCommandElement = CommandList.prototype.updateCommandElement;
		CommandList.prototype.updateCommandElement = updateCommandElement;
	}
	ensureResizeOverride();
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
	});
}

export function range(
	elements: CommandListShape,
	start: number,
	end: number = start
): { start: number; end: number; indent?: number } {
	const count = elements.count;
	start = Math.clamp(start, 0, count - 1);
	end = Math.clamp(end, 0, count - 1);
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
