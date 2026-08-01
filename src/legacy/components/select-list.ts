function getWindow() {
	return (window as any).Window;
}
import {
	on,
	off,
	addClass,
	removeClass,
	hasClass,
	seek,
	rect,
	setTooltip,
	hasScrollBar,
	listenDraggingScrollbarEvent
} from '@/util/element-utils.ts';
import { CommonList } from './common-list.ts';

// 下拉列表的宿主元素（SelectBox 等）需提供的契约
interface SelectTarget extends HTMLElement {
	dataItems: Array<{ value: any; name: string; tip?: string }>;
	dataValue: any;
	input(value: any): void;
	selectList?: SelectList | null;
}

interface SelectItemElement extends HTMLElement {
	dataValue: any;
}

export class SelectList extends HTMLElement {
	state: 'open' | 'closed';
	target: SelectTarget | null;
	elements: SelectItemElement[] & {
		versionId: number;
		count: number;
		start: number;
		end: number;
		head: HTMLElement | null;
		foot: HTMLElement | null;
	};
	selection: HTMLElement | null;

	constructor() {
		super();

		this.state = 'closed';
		this.target = null;
		this.elements = [] as unknown as SelectItemElement[] & {
			versionId: number;
			count: number;
			start: number;
			end: number;
			head: HTMLElement | null;
			foot: HTMLElement | null;
		};
		this.elements.versionId = 0;
		this.elements.count = 0;
		this.elements.start = -1;
		this.elements.end = -1;
		this.elements.head = null;
		this.elements.foot = null;
		this.selection = null;
		this.windowKeydown = this.windowKeydown.bind(this);
		this.windowPointerdown = this.windowPointerdown.bind(this);
		this.windowResize = this.windowResize.bind(this);
		this.windowBlur = this.windowBlur.bind(this);
		listenDraggingScrollbarEvent(this);

		on(this, 'scroll', this.resize);
	}

	read(): any {
		return (this.selection as SelectItemElement | null)?.dataValue;
	}

	write(value: any): void {
		const elements = this.elements;
		const count = elements.count;
		if (count !== 0) {
			let target = elements[0];
			for (let i = 0; i < count; i++) {
				if (elements[i].dataValue === value) {
					target = elements[i];
					break;
				}
			}
			this.select(target);
		}
	}

	select(element: HTMLElement): void {
		if (element instanceof HTMLElement && this.selection !== element) {
			this.unselect();
			this.selection = element;
			addClass(element, 'selected');
		}
	}

	unselect(): void {
		if (this.selection) {
			removeClass(this.selection, 'selected');
			this.selection = null;
		}
	}

	reselect(offset: number): void {
		const elements = this.elements;
		const selection = this.selection!;
		const index = elements.indexOf(selection) + offset;
		if (index >= 0 && index < elements.count) {
			this.select(elements[index]);
		}
	}

	open(target: SelectTarget): void {
		this.close();
		this.state = 'open';

		this.target = target;

		this.createItems(target.dataItems);

		this.windowResize();

		document.body.appendChild(this);

		this.resize();

		this.write(target.dataValue);
		this.scrollToSelection();

		on(this, 'pointermove', this.pointermove as (event: EditorEvent) => void);
		on(window as any, 'keydown', this.windowKeydown as (event: EditorEvent) => void, {
			capture: true
		});
		on(window as any, 'pointerdown', this.windowPointerdown as (event: EditorEvent) => void, {
			capture: true
		});
		on(window as any, 'resize', this.windowResize as (event: EditorEvent) => void);
		on(window as any, 'blur', this.windowBlur as (event: EditorEvent) => void);
	}

	close(): void {
		if (this.state === 'closed') {
			return;
		}

		this.state = 'closed';
		this.target = null;
		this.clear();
		document.body.removeChild(this);

		off(this, 'pointermove', this.pointermove as (event: EditorEvent) => void);
		off(window as any, 'keydown', this.windowKeydown as (event: EditorEvent) => void, {
			capture: true
		});
		off(window as any, 'pointerdown', this.windowPointerdown as (event: EditorEvent) => void, {
			capture: true
		});
		off(window as any, 'resize', this.windowResize as (event: EditorEvent) => void);
		off(window as any, 'blur', this.windowBlur as (event: EditorEvent) => void);
	}

	resize(): void {
		CommonList.resize(this as unknown as CommonList);
	}

	updateHeadAndFoot(): void {
		CommonList.updateHeadAndFoot(this as unknown as CommonList);
	}

	updateOnResize(): void {}

	createItems(items: Array<{ value: any; name: string; tip?: string }>): void {
		const { elements } = this;
		elements.start = -1;
		elements.count = 0;

		for (const item of items) {
			const li = document.createElement('select-item') as any;
			li.dataValue = item.value;
			li.textContent = item.name;
			if (item.tip) {
				setTooltip(li, item.tip);
			}
			elements[elements.count++] = li;
		}

		this.clearElements(elements.count);
	}

	pageUp(select: boolean): void {
		const scrollLines = Math.floor(this.clientHeight / 20) - 1;
		if (select) {
			const bottom = this.scrollTop + this.clientHeight;
			const bottomIndex = Math.floor(bottom / 20) - 1;
			let index = this.getElementIndexOfSelection(Infinity);
			index = Math.min(index, bottomIndex) - scrollLines;
			index = Math.max(index, 0);
			this.select(this.elements[index]);
		}
		this.scrollBy(0, -scrollLines * 20);
	}

	pageDown(select: boolean): void {
		const scrollLines = Math.floor(this.clientHeight / 20) - 1;
		if (select) {
			const count = this.elements.count;
			const topIndex = Math.floor(this.scrollTop / 20);
			let index = this.getElementIndexOfSelection(0);
			index = Math.max(index, topIndex) + scrollLines;
			index = Math.min(index, count - 1);
			this.select(this.elements[index]);
		}
		this.scrollBy(0, +scrollLines * 20);
	}

	getElementIndexOfSelection(defIndex: number): number {
		const selection = this.selection;
		if (selection instanceof HTMLElement) {
			return this.elements.indexOf(selection);
		}
		return defIndex;
	}

	scrollToSelection(): void {
		if (hasScrollBar(this)) {
			const elements = this.elements;
			const selection = this.selection!;
			const index = elements.indexOf(selection);
			if (index !== -1) {
				const scrollTop = Math.clamp(
					this.scrollTop,
					index * 20 + 20 - this.innerHeight,
					index * 20
				);
				if (this.scrollTop !== scrollTop) {
					this.scrollTop = scrollTop;
				}
			}
		}
	}

	clearElements(start: number): void {
		CommonList.clearElements(this as unknown as CommonList, start);
	}

	clear(): this {
		this.unselect();
		this.textContent = '';
		this.clearElements(0);
		this.elements.count = 0;
		this.elements.start = -1;
		this.elements.end = -1;
		this.updateHeadAndFoot();
		return this;
	}

	pointermove(event: PointerEvent): void {
		const element = seek(event.target as HTMLElement, 'select-item') as SelectItemElement;
		if (element.tagName === 'SELECT-ITEM' && !hasClass(element, 'selected')) {
			this.write(element.dataValue);
		}
	}

	windowKeydown(event: KeyboardEvent): void {
		event.preventDefault();
		event.stopPropagation();
		switch (event.code) {
			case 'Escape':
				this.close();
				break;
			case 'Enter':
			case 'NumpadEnter': {
				const value = this.read();
				if (value !== undefined) {
					this.target!.input(value);
				}
				this.close();
				break;
			}
			case 'ArrowUp':
				this.reselect(-1);
				this.scrollToSelection();
				break;
			case 'ArrowDown':
				this.reselect(1);
				this.scrollToSelection();
				break;
			case 'Home': {
				const elements = this.elements;
				this.scroll(0, 0);
				this.select(elements[0]);
				break;
			}
			case 'End': {
				const elements = this.elements;
				const last = elements.count - 1;
				this.scroll(0, this.scrollHeight);
				this.select(elements[last]);
				break;
			}
			case 'PageUp':
				this.pageUp(true);
				break;
			case 'PageDown':
				this.pageDown(true);
				break;
		}
	}

	windowPointerdown(event: PointerEvent): void {
		switch (event.button) {
			case 0: {
				const target = this.target!;
				let element = event.target as HTMLElement;
				if (element instanceof SelectList) {
					event.preventDefault();
					return;
				}
				if (seek(element, 'select-box') === target) {
					event.stopImmediatePropagation();
					this.close();
					return;
				}
				element = seek(element, 'select-item') as SelectItemElement;
				if (element.tagName === 'SELECT-ITEM' && element.parentNode === this) {
					event.preventDefault();
					if (event.altKey) {
						return;
					}
					target.input(element.dataValue);
				}
				this.close();
				return;
			}
			case 2:
				this.close();
				return;
		}
	}

	windowResize(event?: Event): void {
		const MAX_LINES = 30;
		const r = rect(this.target!);
		const rl = r.left;
		const rt = r.top;
		const rb = r.bottom;
		const rw = r.width;
		const count = this.elements.count;
		const space = window.innerHeight - rb;
		const below = space >= Math.min(count, 10) * 20;
		const capacity = below ? Math.floor(space / 20) : Math.floor(rt / 20);
		const lines = Math.min(count, capacity, MAX_LINES);
		const top = below ? rb : rt - lines * 20;
		this.style.left = `${rl}px`;
		this.style.top = `${top}px`;
		this.style.width = `calc(${rw}px - var(--2dpx))`;
		this.style.height = `${lines * 20}px`;
		this.style.zIndex = `${(getWindow().frames?.length ?? 0) + 1}`;
	}

	windowBlur(event: Event): void {
		this.close();
	}
}

customElements.define('select-list', SelectList);

// 注：Select 必须是真实的 SelectList 实例（继承其 windowPointerdown/windowKeydown/ resize/createItems 等所有类方法）。此前类型化时误改为简化对象字面量 {target,open,close}，导致所有 Select.windowPointerdown 等调用失效 —— 下拉列表点击行为全部断裂。
export const Select = new SelectList();
