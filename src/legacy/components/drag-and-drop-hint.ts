import { css, rect } from '@/util/element-utils.ts';

interface DragAndDropHintElement extends HTMLElement {
	left: number;
	top: number;
	width: number;
	height: number;
	upper: boolean;
	measure(item: HTMLElement): { left: number; top: number; width: number; height: number };
	moveUp(): DragAndDropHintElement;
	moveDown(): DragAndDropHintElement;
	set(coords: { left: number; top: number; width: number; height: number }): void;
}

export function attachDragAndDropHintApi(el: HTMLElement): void {
	const hint = el as DragAndDropHintElement;

	hint.left = 0;
	hint.top = 0;
	hint.width = 0;
	hint.height = 0;

	hint.measure = function (item: HTMLElement): {
		left: number;
		top: number;
		width: number;
		height: number;
	} {
		const parent = hint.parentNode as HTMLElement & {
			borderLeft?: number;
			borderTop?: number;
		};
		let bl = parent.borderLeft;
		let bt = parent.borderTop;
		if (bl === undefined) {
			const style = css(parent as HTMLElement);
			bl = parseInt(style.borderLeftWidth);
			bt = parseInt(style.borderTopWidth);
			parent.borderLeft = bl;
			parent.borderTop = bt;
		}
		const pRect = rect(parent as HTMLElement);
		const tRect = rect(item);
		const left = tRect.left - pRect.left - bl;
		const top = tRect.top - pRect.top - (bt ?? 0);
		const width = tRect.width;
		const height = tRect.height;
		return { left, top, width, height };
	};

	hint.moveUp = function (): DragAndDropHintElement {
		if (!hint.upper) {
			hint.upper = true;
			hint.style.zIndex = '1';
		}
		return hint;
	};

	hint.moveDown = function (): DragAndDropHintElement {
		if (hint.upper) {
			hint.upper = false;
			hint.style.zIndex = '';
		}
		return hint;
	};

	hint.set = function ({
		left,
		top,
		width,
		height
	}: {
		left: number;
		top: number;
		width: number;
		height: number;
	}): void {
		if (
			hint.left !== left ||
			hint.top !== top ||
			hint.width !== width ||
			hint.height !== height
		) {
			hint.left = left;
			hint.top = top;
			hint.width = width;
			hint.height = height;
			hint.style.left = `${left}px`;
			hint.style.top = `${top}px`;
			hint.style.width = `${width}px`;
			hint.style.height = `${height}px`;
		}
	};
}

export function createDragAndDropHint(): HTMLElement {
	const el = document.createElement('div');
	el.className = 'drag-and-drop-hint';
	attachDragAndDropHintApi(el);
	return el;
}
