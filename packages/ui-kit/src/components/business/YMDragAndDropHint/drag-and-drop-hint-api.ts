import { css, rect } from '../../../utils/dom';
export interface DragAndDropHintCoords {
	left: number;
	top: number;
	width: number;
	height: number;
}

export interface DragAndDropHintApi extends HTMLElement {
	left: number;
	top: number;
	width: number;
	height: number;
	upper: boolean;
	target: HTMLElement | null;
	position: string | null;
	measure(item: HTMLElement): DragAndDropHintCoords;
	moveUp(): DragAndDropHintApi;
	moveDown(): DragAndDropHintApi;
	set(coords: DragAndDropHintCoords): void;
}

export function attachDragAndDropHintApi(el: HTMLElement): DragAndDropHintApi {
	const hint = el as DragAndDropHintApi;

	hint.left = 0;
	hint.top = 0;
	hint.width = 0;
	hint.height = 0;
	hint.upper = false;
	hint.target = null;
	hint.position = null;

	hint.measure = function (item: HTMLElement): DragAndDropHintCoords {
		const parent = hint.parentNode as HTMLElement & { borderLeft?: number; borderTop?: number };
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

	hint.moveUp = function (): DragAndDropHintApi {
		if (!hint.upper) {
			hint.upper = true;
			hint.style.zIndex = '1';
		}
		return hint;
	};

	hint.moveDown = function (): DragAndDropHintApi {
		if (hint.upper) {
			hint.upper = false;
			hint.style.zIndex = '';
		}
		return hint;
	};

	hint.set = function ({ left, top, width, height }: DragAndDropHintCoords): void {
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

	return hint;
}

export function createDragAndDropHintElement(): DragAndDropHintApi {
	const el = document.createElement('div');
	el.classList.add('drag-and-drop-hint');
	return attachDragAndDropHintApi(el);
}
