import { $ } from '@/util/dom.ts';
import { addClass, hasClass, hide, rect, show } from '@/util/element-utils';
function getWindow() {
	return (window as any).Window;
}

interface TextSuggestionItem {
	name: string;
	icon?: string;
	class?: string;
	comment?: string;
	refCount?: number;
	// 列表渲染时挂载的 DOM 元素
	element?: HTMLElement & { item: TextSuggestionItem };
}

type ListMethod = ((...args: any[]) => any) | null;

interface TextSuggestionList {
	createIcon: ListMethod;
	createText: ListMethod;
	createRefCount: ListMethod;
	createComment: ListMethod;
	selectDefaultCommand: ListMethod;
	updateNodeElement: ListMethod;
	elements: any[] & { count: number };
	selection: TextSuggestionItem | null;
	pressing: ((event: PointerEvent) => void) | null;
	style: CSSStyleDeclaration;
	bind(getter: () => any): void;
	addEventListener(type: string, listener: (event: any) => void, options?: any): void;
	removeEventListener(type: string, listener: (event: any) => void, options?: any): void;
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

interface TextSuggestionTarget {
	generator: () => TextSuggestionItem[];
	input: { select(): void };
	insert(name: string): void;
	rect(): { left: number; top: number; bottom: number; width: number };
	read(): string;
	contains(node: Node | null): boolean;
	addEventListener(type: string, listener: (event: any) => void, options?: any): void;
	removeEventListener(type: string, listener: (event: any) => void, options?: any): void;
}

type TextBoxMethod = ((this: TextSuggestionTarget, event: any) => void) | null;

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
	listPointerdown: ((this: TextSuggestionList, event: PointerEvent) => void) | null;
	listUpdate: ((this: TextSuggestionList, event: Event) => void) | null;
	listOpen:
		| ((this: TextSuggestionList, event: Event & { value: TextSuggestionItem }) => void)
		| null;
}

function createEmptyList(): TextSuggestionList {
	const noop = () => {};
	return {
		createIcon: null,
		createText: null,
		createRefCount: null,
		createComment: null,
		selectDefaultCommand: null,
		updateNodeElement: null,
		elements: Object.assign([], { count: 0 }),
		selection: null,
		pressing: null,
		style: document.createElement('div').style,
		bind: noop,
		addEventListener: noop,
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

export const TextSuggestion: TextSuggestionShape = {
	list: $('#text-suggestions') ?? createEmptyList(),
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
TextSuggestion.list.createIcon = null;
TextSuggestion.list.createText = null;
TextSuggestion.list.createRefCount = null;
TextSuggestion.list.createComment = null;
TextSuggestion.list.selectDefaultCommand = null;

TextSuggestion.initialize = function (this: TextSuggestionShape): void {
	const element = $('#text-suggestions');
	if (element && element !== this.list) {
		element.updateNodeElement = this.list.updateNodeElement;
		element.createIcon = this.list.createIcon;
		element.createText = this.list.createText;
		element.createRefCount = this.list.createRefCount;
		element.createComment = this.list.createComment;
		element.selectDefaultCommand = this.list.selectDefaultCommand;
		this.list = element;
	}
	const { list } = this;
	list.bind(() => this.data);

	list.on('pointerdown', this.listPointerdown!);
	list.on('update', this.listUpdate!);
	list.on('open', this.listOpen!);
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
	if ((target as unknown as { strBox: TextSuggestionTarget }).strBox) {
		target = (target as unknown as { strBox: TextSuggestionTarget }).strBox;
	}
	target.input.select();
	target.insert(item.name);
	this.inserting = false;
	this.close!();
};

TextSuggestion.createData = function (this: TextSuggestionShape): void {
	if (!this.data) {
		this.data = this.target!.generator();
	}
};

TextSuggestion.textBoxFocus = function (this: TextSuggestionTarget, event: Event): void {
	const text = this.read().trim();
	TextSuggestion.open(this);
	TextSuggestion.list.searchNodes(text);
	TextSuggestion.list.selectDefaultCommand!();
};

TextSuggestion.textBoxBlur = function (this: TextSuggestionTarget, event: Event): void {
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
};

TextSuggestion.textBoxInput = function (this: TextSuggestionTarget, event: InputEvent): void {
	if (
		this.contains(document.activeElement as Node | null) &&
		TextSuggestion.inserting === false &&
		event.inputType !== 'insertCompositionText'
	) {
		const text = this.read().trim();
		TextSuggestion.open(this);
		TextSuggestion.list.searchNodes(text);
		TextSuggestion.list.selectDefaultCommand!();
	}
};

TextSuggestion.listPointerdown = function (this: TextSuggestionList, event: PointerEvent): void {
	const element = event.target as HTMLElement & {
		item: TextSuggestionItem;
		tagName: string;
	};
	if (element.tagName === 'NODE-ITEM') {
		event.preventDefault();
		const pressing = this.pressing;
		const pointerup = (event: PointerEvent): void => {
			if (pressing === pointerup) {
				this.pressing = null;
				if (element.contains(event.target as Node)) {
					TextSuggestion.select(element.item);
				}
			}
		};
		this.pressing = pointerup;
		window.addEventListener('pointerup', pointerup, { once: true });
	}
};

TextSuggestion.listUpdate = function (this: TextSuggestionList, event: Event): void {
	const MAX_LINES = 30;
	const r = rect(TextSuggestion.target!);
	const rl = r.left;
	const rt = r.top;
	const rb = r.bottom;
	const rw = r.width;
	const space = window.innerHeight - rb;
	const below = space >= 200;
	const capacity = below ? Math.floor(space / 20) : Math.floor(rt / 20);
	const lines = Math.min(this.elements.count, capacity, MAX_LINES);
	const top = below ? rb : rt - lines * 20;
	if (
		lines !== 0 &&
		!(lines === 1 && this.elements[0].item.name === TextSuggestion.target!.read())
	) {
		this.style.left = `${rl}px`;
		this.style.top = `${top}px`;
		this.style.width = `calc(${rw}px - var(--2dpx))`;
		this.style.height = `${lines * 20}px`;
		this.style.zIndex = ((getWindow().frames?.length ?? 0) + 1).toString();
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
	if (item.element!.parentNode) {
		TextSuggestion.select(item);
	}
};

TextSuggestion.list.updateNodeElement = function (
	this: TextSuggestionList,
	element: HTMLElement & { item: TextSuggestionItem; initialized?: boolean }
): void {
	if (!element.initialized) {
		(element as any).initialized = true;
		(this as any).createIcon(element);
		(this as any).createText(element);
		(this as any).createRefCount(element);
		(this as any).createComment(element);
		addClass(element, 'text-suggestion-item');
	}
};

TextSuggestion.list.createIcon = function (
	this: TextSuggestionList,
	element: HTMLElement & { item: TextSuggestionItem }
): void {
	if (element.item.icon) {
		const icon = document.createElement('node-icon') as HTMLElement;
		addClass(icon, element.item.icon);
		element.appendChild(icon);
	}
};

TextSuggestion.list.createText = function (
	this: TextSuggestionList,
	element: HTMLElement & { item: TextSuggestionItem }
): void {
	const item = element.item;
	const text = document.createElement('div');
	addClass(text, 'text-suggestion-content');
	addClass(text, 'text');
	if (item.class) addClass(text, item.class);
	text.textContent = item.name;
	element.appendChild(text);
};

TextSuggestion.list.createRefCount = function (
	this: TextSuggestionList,
	element: HTMLElement & { item: TextSuggestionItem }
): void {
	if (element.item.refCount) {
		const comment = document.createElement('div');
		addClass(comment, 'text-suggestion-ref-count');
		addClass(comment, 'text');
		comment.textContent = String(element.item.refCount);
		element.appendChild(comment);
	}
};

TextSuggestion.list.createComment = function (
	this: TextSuggestionList,
	element: HTMLElement & { item: TextSuggestionItem }
): void {
	if (element.item.comment) {
		const comment = document.createElement('div');
		addClass(comment, 'text-suggestion-comment');
		addClass(comment, 'text');
		comment.textContent = element.item.comment;
		element.appendChild(comment);
	}
};

TextSuggestion.list.selectDefaultCommand = function (this: TextSuggestionList): void {
	const { selection, elements } = this;
	const { count } = elements;
	if (selection) {
		for (let i = 0; i < count; i++) {
			if (elements[i].item === selection) {
				this.scrollToSelection('middle');
				return;
			}
		}
	}
	for (let i = 0; i < count; i++) {
		this.select(elements[i].item);
		this.scrollToSelection('middle');
		return;
	}
};
