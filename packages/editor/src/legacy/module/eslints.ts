import { EventBus } from './eventbus.ts';
import { on, addClass } from '@/util/element-utils.ts';
import { CommandList } from '@/components/command-list.ts';

let _origUpdateCommandElement:
	| ((this: typeof CommandList, element: CommandItemElement) => unknown)
	| undefined;
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

	let pre = document.createElement('command-mark-major');
	addClass(pre, 'command-mark-major');
	element.insertBefore(pre, element.firstElementChild);
	element.pre = pre;

	element.lines = [];
	for (let i = element.dataIndent; i >= 0; i--) {
		let line = document.createElement('command-line');
		addClass(line, 'command-line');
		line.style.marginLeft = this.computeTextIndent!(i);
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

	return ret;
}

EventBus.once('editor_loaded', () => {
	// 必须在覆盖之前捕获原方法，否则新方法首次调用时取到的 prototype.updateCommandElement 已是新方法自己，_origUpdateCommandElement.call(this, ...) 会无限递归调自己
	ensureUpdateCommandElementOverride();
});

export function ensureUpdateCommandElementOverride(): void {
	if (_origUpdateCommandElement) return;
	_origUpdateCommandElement = CommandList.prototype.updateCommandElement;
	CommandList.prototype.updateCommandElement = updateCommandElement;
}

export function applyCommandListInstanceOverride(
	commandList: typeof CommandList | HTMLElement
): void {
	if (!commandList) return;
	const prototype =
		'prototype' in commandList && commandList.prototype
			? (commandList as typeof CommandList).prototype
			: (commandList as HTMLElement);
	(prototype as HTMLElement & Record<string, any>).getSelectionPosition = function (this: {
		elements: { pre: HTMLElement }[];
		active: number;
	}) {
		return this.elements[this.active].pre.getBoundingClientRect();
	};
	on(commandList, 'update', function (this: { elements: { dataIndent: number }[] }) {
		const list = this.elements as unknown as {
			count: number;
			[i: number]: CommandItemElement & { fold?: boolean; mark?: unknown; buffer?: unknown };
		};
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
		const { dataIndent } = elements[i];
		if (dataIndent < indent) {
			indent = dataIndent;
		}
	}
	for (let i = start; i >= 0; i--) {
		const element = elements[i];
		if (element.dataIndent === indent && element.dataKey === true) {
			start = i;
			break;
		}
	}
	for (let i = end + 1; i < count; i++) {
		const element = elements[i];
		if (
			element.dataIndent < indent ||
			(element.dataIndent === indent && element.dataKey === true)
		) {
			end = i - 1;
			break;
		}
	}
	if (start !== end) {
		const element = elements[end];
		if (!element.dataItem) {
			end--;
		}
	}
	return {
		start,
		end,
		indent
	};
}
