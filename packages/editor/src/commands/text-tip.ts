import {
	isTreeItemRendered,
	setTreeItemClass,
	treeItemOf,
	treeRowCount,
	treeRowElement,
	treeRowIndexOf,
	treeRowItemAt,
	type TreeListRowApi
} from '@ui-kit';
import { elementDataOf } from '@ui-kit';
import { createElementRegistry } from '@app/utils/element-registry';
import { getWindowStore } from '@app/stores/window';
import { hasClass, hide, on, rect, show } from '@app/utils/element-utils';
import { createDetachedElement } from '@app/utils/dom';
import { Fragment, h, render, type VNode } from 'vue';

interface TextSuggestionItem {
	name: string;
	icon?: string;
	class?: string;
	comment?: string;
	refCount?: number;
	// 列表渲染时挂载的 DOM 元素
	element?: HTMLElement & { item: TextSuggestionItem };
}

// oxlint-disable-next-line no-explicit-any
type ListMethod = ((...args: any[]) => any) | null;

interface TextSuggestionList extends Partial<TreeListRowApi<TextSuggestionItem>> {
	selectDefaultCommand: ListMethod;
	updateNodeElement: ListMethod;
	pressing: ((event: PointerEvent) => void) | null;
	style: CSSStyleDeclaration;
	bind(getter: () => TextSuggestionItem[] | null): void;
	addEventListener(
		type: string,
		listener: (event: Event) => void,
		options?: Record<string, unknown>
	): void;
	on(type: string, listener: (event: Event) => void): void;
	removeEventListener(
		type: string,
		listener: (event: Event) => void,
		options?: Record<string, unknown>
	): void;
	update(): HTMLElement | void;
	clear(): void;
	hide(): HTMLElement | void;
	show(): HTMLElement | void;
	hasClass(name: string): boolean;
	searchNodes(text: string): void;
	selectRelative(direction: string): void;
	pageUp(select: boolean): void;
	pageDown(select: boolean): void;
	read(): TextSuggestionItem | null;
	scrollToSelection(mode?: string): void;
	select(item: TextSuggestionItem): void;
	open(item: TextSuggestionItem): void;
	textContent: string;
}

export interface TextSuggestionTarget {
	generator?: () => TextSuggestionItem[];
	input?: { select(): void };
	insert?(name: string): void;
	rect?(): { left: number; top: number; bottom: number; width: number };
	read?(): string;
	contains(node: Node | null): boolean;
	addEventListener(
		type: string,
		listener: (event: Event) => void,
		options?: Record<string, unknown>
	): void;
	removeEventListener(
		type: string,
		listener: (event: Event) => void,
		options?: Record<string, unknown>
	): void;
}

type TextBoxMethod = ((this: TextSuggestionTarget, event: Event) => void) | null;

interface TextSuggestionShape {
	list: TextSuggestionList;
	inserting: boolean;
	target: TextSuggestionTarget | null;
	data: TextSuggestionItem[] | null;
	initialize: (() => void) | null;
	listen: ((textBox: TextSuggestionTarget, generator: () => TextSuggestionItem[]) => void) | null;
	open: ((target: TextSuggestionTarget) => void) | null;
	close: (() => void) | null;
	select: ((item: TextSuggestionItem) => void) | null;
	createData: (() => void) | null;
	textBoxFocus: TextBoxMethod;
	textBoxBlur: TextBoxMethod;
	textBoxKeydown: TextBoxMethod;
	textBoxInput: TextBoxMethod;
	listPointerdown: ((this: TextSuggestionList, event: Event) => void) | null;
	listUpdate: ((this: TextSuggestionList, event: Event) => void) | null;
	listOpen:
		| ((this: TextSuggestionList, event: Event & { value: TextSuggestionItem }) => void)
		| null;
}

function createEmptyList(): TextSuggestionList {
	const noop = () => {};
	return {
		selectDefaultCommand: null,
		updateNodeElement: null,
		pressing: null,
		// P1b：空列表的样式宿主走 utils/dom 的唯一创建缝隙（原先 document.createElement('div').style）
		style: createDetachedElement().style,
		bind: noop,
		addEventListener: noop,
		on: noop,
		removeEventListener: noop,
		update: () => {},
		clear: noop,
		hide: () => {},
		show: () => {},
		hasClass: () => false,
		searchNodes: noop,
		selectRelative: noop,
		pageUp: noop,
		pageDown: noop,
		read: () => null,
		scrollToSelection: noop,
		select: noop,
		open: noop,
		textContent: ''
	};
}

/** P5b 批次 2：控件元素注册表——由 `TextSuggestions.vue` 在模板里登记 */
export const textSuggestionEls = createElementRegistry();

export const TextSuggestion: TextSuggestionShape = {
	list:
		(textSuggestionEls.get('text-suggestions') as unknown as TextSuggestionList) ??
		createEmptyList(),
	inserting: false,
	target: null,
	data: null,
	initialize: null,
	listen: null,
	open: null,
	close: null,
	select: null,
	createData: null,
	textBoxFocus: null,
	textBoxBlur: null,
	textBoxKeydown: null,
	textBoxInput: null,
	listPointerdown: null,
	listUpdate: null,
	listOpen: null
};

TextSuggestion.list.updateNodeElement = null;
TextSuggestion.list.selectDefaultCommand = null;

TextSuggestion.initialize = function (this: TextSuggestionShape): void {
	const element = textSuggestionEls.get('text-suggestions');
	if (element && element !== (this.list as unknown as HTMLElement)) {
		element.updateNodeElement = this.list.updateNodeElement as (item: unknown) => unknown;
		element.selectDefaultCommand = this.list.selectDefaultCommand as (item: unknown) => unknown;
		this.list = element as unknown as TextSuggestionList;
	}
	const { list } = this;
	list.bind(() => this.data);

	on(list, 'pointerdown', this.listPointerdown!);
	on(list, 'update', this.listUpdate!);
	on(list, 'open', this.listOpen!);
};

TextSuggestion.listen = function (
	this: TextSuggestionShape,
	textBox: TextSuggestionTarget,
	generator: () => TextSuggestionItem[]
): void {
	textBox.generator = generator;
	textBox.addEventListener('focus', this.textBoxFocus!);
	textBox.addEventListener('blur', this.textBoxBlur!);
	textBox.addEventListener('keydown', this.textBoxKeydown!);
	textBox.addEventListener('input', this.textBoxInput!);
	textBox.addEventListener('compositionend', this.textBoxInput!);
};

TextSuggestion.open = function (this: TextSuggestionShape, target: TextSuggestionTarget): void {
	if (this.target !== target) {
		this.target = target;
		this.createData!();
		this.list.update();
		this.list.selectDefaultCommand!();
	}
};

TextSuggestion.close = function (this: TextSuggestionShape): void {
	this.target = null;
	this.data = null;
	this.list.clear();
	hide(this.list);
};

TextSuggestion.select = function (this: TextSuggestionShape, item: TextSuggestionItem): void {
	this.inserting = true;
	let target: TextSuggestionTarget | { input: { select(): void }; insert(name: string): void } =
		this.target!;
	// P4b：strBox 现在是元素数据（字段已从 DATA_FIELDS 摘除）
	const strBox = elementDataOf<{ strBox?: TextSuggestionTarget }>(target).strBox;
	if (strBox) {
		target = strBox;
	}
	target.input!.select();
	target?.insert?.(item.name);
	this.inserting = false;
	this.close!();
};

TextSuggestion.createData = function (this: TextSuggestionShape): void {
	if (!this.data) {
		this.data = this.target!.generator?.() ?? null;
	}
};

TextSuggestion.textBoxFocus = function (this: TextSuggestionTarget, _event: Event): void {
	const text = this.read?.().trim() ?? '';
	TextSuggestion.open!(this);
	TextSuggestion.list.searchNodes(text);
	TextSuggestion.list.selectDefaultCommand!();
};

TextSuggestion.textBoxBlur = function (this: TextSuggestionTarget, _event: Event): void {
	TextSuggestion.close!();
};

TextSuggestion.textBoxKeydown = function (this: TextSuggestionTarget, event: KeyboardEvent): void {
	if (!hasClass(TextSuggestion.list, 'hidden')) {
		switch (event.code) {
			case 'ArrowUp':
			case 'ArrowDown':
				event.preventDefault();
				TextSuggestion.list.selectRelative(event.code.slice(5).toLowerCase());
				break;
			case 'PageUp':
				TextSuggestion.list.pageUp(true);
				break;
			case 'PageDown':
				TextSuggestion.list.pageDown(true);
				break;
			case 'Enter':
			case 'NumpadEnter': {
				const item = TextSuggestion.list.read();
				if (item) {
					event.stopPropagation();
					TextSuggestion.list.open(item);
				}
				break;
			}
			case 'Escape':
				event.stopPropagation();
				TextSuggestion.close!();
				break;
		}
	}
} as TextBoxMethod;

TextSuggestion.textBoxInput = function (this: TextSuggestionTarget, event: InputEvent): void {
	if (
		this.contains(document.activeElement as Node | null) &&
		TextSuggestion.inserting === false &&
		event.inputType !== 'insertCompositionText'
	) {
		const text = this.read?.().trim() ?? '';
		TextSuggestion.open!(this);
		TextSuggestion.list.searchNodes(text);
		TextSuggestion.list.selectDefaultCommand!();
	}
} as TextBoxMethod;

TextSuggestion.listPointerdown = function (this: TextSuggestionList, event: Event): void {
	// P4b：行 → item 经行 API 取（`element.item` expando 已退役）；标签文字上的点击同样归一成行
	const item = treeItemOf<TextSuggestionItem>(event.target);
	if (item === undefined) return;
	const element = treeRowElement(item);
	if (element === undefined) return;
	event.preventDefault();
	const pressing = this.pressing;
	const pointerup = (event: PointerEvent): void => {
		if (pressing === pointerup) {
			this.pressing = null;
			if (element.contains(event.target as Node)) {
				TextSuggestion.select!(item);
			}
		}
	};
	this.pressing = pointerup;
	window.addEventListener('pointerup', pointerup, { once: true });
};

TextSuggestion.listUpdate = function (this: TextSuggestionList, _event: Event): void {
	const MAX_LINES = 30;
	const r = rect(TextSuggestion.target!);
	const rl = r.left;
	const rt = r.top;
	const rb = r.bottom;
	const rw = r.width;
	const space = window.innerHeight - rb;
	const below = space >= 200;
	const capacity = below ? Math.floor(space / 20) : Math.floor(rt / 20);
	const lines = Math.min(treeRowCount(this), capacity, MAX_LINES);
	const top = below ? rb : rt - lines * 20;
	if (
		lines !== 0 &&
		!(
			lines === 1 &&
			treeRowItemAt<TextSuggestionItem>(this, 0)?.name === TextSuggestion.target!.read?.()
		)
	) {
		this.style.left = `${rl}px`;
		this.style.top = `${top}px`;
		this.style.width = `calc(${rw}px - var(--2dpx))`;
		this.style.height = `${lines * 20}px`;
		this.style.zIndex = (getWindowStore().stack.length + 1).toString();
		show(this);
	} else {
		hide(this);
	}
};

TextSuggestion.listOpen = function (
	this: TextSuggestionList,
	event: Event & { value: TextSuggestionItem }
): void {
	const item = event.value;
	// 步骤 4：可见性改为「该行是否在窗口内物化」，不再读 element.parentNode
	if (isTreeItemRendered(item)) {
		TextSuggestion.select!(item);
	}
};

TextSuggestion.list.updateNodeElement = function (
	this: TextSuggestionList,
	element: HTMLElement
): void {
	if (elementDataOf<{ initialized?: boolean }>(element).initialized) return;
	// P4b：item 存元素数据（`element.item` 已退役）——取不到就不算渲染过，下一拍再试
	const item = treeItemOf<TextSuggestionItem>(element);
	if (item === undefined) return;
	elementDataOf<{ initialized?: boolean }>(element).initialized = true;
	const nodes: VNode[] = [];
	const classList = ['text-suggestion-content', 'text'];
	if (item.class) classList.push(item.class);
	nodes.push(h('div', { class: classList }, item.name));
	if (item.refCount) {
		nodes.push(h('div', { class: 'text-suggestion-ref-count text' }, String(item.refCount)));
	}
	if (item.comment) {
		nodes.push(h('div', { class: 'text-suggestion-comment text' }, item.comment));
	}
	render(h(Fragment, nodes), element);
	setTreeItemClass(item, 'text-suggestion-item', true);
};

TextSuggestion.list.selectDefaultCommand = function (this: TextSuggestionList): void {
	// P4b：当前项经 `read()` 取——`list.selection` 是已退役的旧属性（无人写入，恒为 null）
	const selection = this.read();
	// 步骤 4：行号/行项经渲染模式无关的行 API 取得（窗口外行无 element）
	const count = treeRowCount(this);
	if (selection && treeRowIndexOf(this, selection) !== -1) {
		this.scrollToSelection('middle');
		return;
	}
	if (count !== 0) {
		const first = treeRowItemAt<TextSuggestionItem>(this, 0);
		if (first !== undefined) {
			this.select(first);
			this.scrollToSelection('middle');
		}
	}
};
