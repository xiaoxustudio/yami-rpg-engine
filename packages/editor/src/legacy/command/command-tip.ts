import { getListConfig } from '@ui-kit';
import { $ } from '@app/utils/dom';
import { Window } from '@app/legacy/tools/window-object.ts';
import {
	addClass,
	dispatchUpdateEvent,
	getFocus,
	hasClass,
	hide,
	on,
	read,
	setTooltip,
	show
} from '@app/utils/element-utils.ts';
import { Command } from './command-object.ts';
import { File } from '@app/legacy/file/file-system-core.ts';
import { t, createGetter } from '@app/i18n';
import { parseLocalTip } from '@app/legacy/localize/dom-localizer';

export interface CommandSuggestionItem {
	value: string;
	name?: string;
	desc?: string;
	unspacedName?: string;
	class: string;
	keywords?: string;
	expanded?: boolean;
	children?: CommandSuggestionItem[] | null;
	// 列表渲染时挂载的 DOM 元素
	element?: HTMLElement & { item: CommandSuggestionItem };
	item?: CommandSuggestionItem;
}

type ListMethod = ((...args: any[]) => any) | null;

interface CommandSuggestionList {
	searchNodesAlgorithm: ListMethod;
	updateCommandNames: ListMethod;
	createCommandTip: ListMethod;
	selectDefaultCommand: ListMethod;
	creators: ListMethod[];
	elements: Array<{ item?: CommandSuggestionItem }> & { count: number };
	initialized: boolean;
	selection: CommandSuggestionItem | null;
	pressing: ((event: PointerEvent) => void) | null;
	bind(getter: () => CommandSuggestionItem[] | Promise<CommandSuggestionItem[]> | null): void;
	scrollAndResize(): void;
	getSelectionPosition(): { x: number; y: number } | null;
	update(): void;
	dispatchUpdateEvent(): void;
	resize(): void;
	hide(): HTMLElement | void;
	show(): HTMLElement | void;
	scrollToSelection(mode?: string): void;
	deleteNodeElements(
		data: CommandSuggestionItem[] | Promise<CommandSuggestionItem[]> | null
	): void;
	searchNodes(text: string): void;
	selectRelative(direction: string): void;
	pageUp(select: boolean): void;
	pageDown(select: boolean): void;
	scrollToHome(): void;
	scrollToEnd(): void;
	read(): CommandSuggestionItem | null;
	hasClass(name: string): boolean;
	open(item: CommandSuggestionItem): void;
	select(item: CommandSuggestionItem): void;
	appendChild<T extends Node>(node: T): T;
	insertBefore<T extends Node>(node: T, ref: T | null): T;
	contains(node: Node | null): boolean;
	on(...args: unknown[]): unknown;
	textContent: string;
	style: CSSStyleDeclaration;
	data: CommandSuggestionItem[] | Promise<CommandSuggestionItem[]> | null;
	item: CommandSuggestionItem;
	class: string;
	parentNode: Node & { item?: CommandSuggestionItem };
}

interface CommandSuggestionWidget extends HTMLElement {
	enableAmbient: boolean;
	x: number;
	y: number;
}

interface CommandSuggestionSearcher extends HTMLElement {
	input: HTMLInputElement & { id: string };
	addCloseButton(): void;
	deleteInputContent(): void;
	on(...args: unknown[]): unknown;
	getFocus(...args: unknown[]): unknown;
	read(...args: unknown[]): unknown;
}

interface CommandSuggestionShape {
	widget: CommandSuggestionWidget;
	searcher: CommandSuggestionSearcher;
	list: HTMLElement & CommandSuggestionList;
	data: CommandSuggestionItem[] | Promise<CommandSuggestionItem[]> | null;
	initialize: (() => void) | null;
	open: (() => void) | null;
	select: ((item: CommandSuggestionItem) => void) | null;
	windowLocalize: ((event: Event) => void) | null;
	windowClose: ((event: Event) => void) | null;
	pointerdown: ((event: PointerEvent) => void) | null;
	searcherKeydown: ((event: KeyboardEvent) => void) | null;
	searcherInput: ((event: InputEvent) => void) | null;
	listKeydown: ((this: CommandSuggestionList, event: KeyboardEvent) => void) | null;
	listPointerdown: ((this: CommandSuggestionList, event: PointerEvent) => void) | null;
	listUpdate: ((this: HTMLElement & CommandSuggestionList, event: Event) => void) | null;
	listOpen:
		| ((this: CommandSuggestionList, event: Event & { value: CommandSuggestionItem }) => void)
		| null;
}

export const CommandSuggestion: CommandSuggestionShape = {
	widget: null as unknown as CommandSuggestionWidget,
	searcher: null as unknown as CommandSuggestionSearcher,
	list: null as unknown as HTMLElement & CommandSuggestionList,
	data: null,
	initialize: null,
	open: null,
	select: null,
	windowLocalize: null,
	windowClose: null,
	pointerdown: null,
	searcherKeydown: null,
	searcherInput: null,
	listKeydown: null,
	listPointerdown: null,
	listUpdate: null,
	listOpen: null
};

function ensureDomBound() {
	if (CommandSuggestion.widget) return;
	const widget = $('#command-widget');
	if (!widget) return;
	CommandSuggestion.widget = widget as unknown as CommandSuggestionWidget;
	CommandSuggestion.searcher = $('#command-searcher') as unknown as CommandSuggestionSearcher;
	CommandSuggestion.list = $('#command-suggestions') as unknown as HTMLElement &
		CommandSuggestionList;
	bindListMethods();
}

function bindListMethods() {
	const list = CommandSuggestion.list!;
	list.searchNodesAlgorithm = function (
		data: CommandSuggestionItem[],
		keyword: RegExp,
		list: CommandSuggestionItem[]
	): void {
		const length = data.length;
		for (let i = 0; i < length; i++) {
			const item = data[i];
			switch (item.class) {
				default: {
					if (
						keyword.test(item.unspacedName ?? '') ||
						keyword.test(item.class) ||
						keyword.test(item.value) ||
						keyword.test(item.keywords ?? '')
					) {
						list.push(item);
					}
					const children = item.children;
					if (children instanceof Array) {
						this.searchNodesAlgorithm!(children, keyword, list);
					}
					continue;
				}
				case 'custom':
					if (
						keyword.test(item.unspacedName ?? '') ||
						keyword.test(item.class) ||
						keyword.test(item.keywords ?? '')
					) {
						list.push(item);
					}
					continue;
			}
		}
	};

	list.updateCommandNames = (function IIFE() {
		const update = (data: CommandSuggestionItem[], get: (key: string) => string): void => {
			const length = data.length;
			for (let i = 0; i < length; i++) {
				const item = data[i];
				const key = item.value;
				const name = get(key);
				const desc = get(key + '.desc');
				item.name = name;
				item.desc = desc;
				item.unspacedName = String.compress(name);
				const children = item.children;
				if (children instanceof Array && key !== 'custom') {
					update(children, get);
				}
			}
		};
		return function (this: CommandSuggestionList): void {
			update(this.data as CommandSuggestionItem[], createGetter('command'));
		};
	})();

	list.createCommandTip = (function IIFE() {
		const separator = /\s*,\s*/;
		return function (item: CommandSuggestionItem): void {
			const element = item.element!;
			const words = Command.words as unknown as {
				push(s: string): number;
				join(j?: string): string;
			} & Array<string>;
			words.push(item.class);
			if (item.class !== 'custom') {
				words.push(item.value);
			}
			if (item.keywords) {
				for (const keyword of item.keywords.split(separator)) {
					words.push(keyword);
				}
			}
			const tip1 = item.class === 'folder' ? '' : `$${item.name}\n${item.desc ?? ''}\n`;
			const tip2 = `$${t('command.keywords')}\n${words.join(', ')}`;
			addClass(element, 'command-suggestion-item');
			setTooltip(element, parseLocalTip(tip1 + tip2, ''));
		};
	})();

	list.selectDefaultCommand = function (this: CommandSuggestionList): void {
		const { selection, elements } = this;
		const { count } = elements;
		if (selection && selection.class !== 'folder') {
			for (let i = 0; i < count; i++) {
				if (elements[i].item === selection) {
					this.scrollToSelection('middle');
					return;
				}
			}
		}
	};
}

CommandSuggestion.initialize = function (): void {
	ensureDomBound();
	if (!this.widget) return;
	this.widget.enableAmbient = false;

	this.searcher.addCloseButton();
	const input = this.searcher.input;
	input.id = 'command-searcher-input';

	const { list } = this;
	list.bind(() => this.data);

	// 挂载列表项创建器/更新器 ——
	// 此前这些方法定义了却未挂进 creators/updaters，导致新版 DOM 丢失 class 与 tooltip 元素。
	getListConfig(list).creators.push(list.createCommandTip!);

	this.data = File.get!({
		local: 'commands.json',
		type: 'json'
	}).then((data: CommandSuggestionItem[]) => {
		this.data = data;
	});

	window.addEventListener('localize', this.windowLocalize!);
	on(this.widget, 'close', this.windowClose!);
	on(this.searcher, 'keydown', this.searcherKeydown!);
	on(this.searcher, 'input', this.searcherInput!);
	on(this.searcher, 'compositionend', this.searcherInput!);
	on(list, 'keydown', this.listKeydown!);
	on(list, 'pointerdown', this.listPointerdown!);
	on(list, 'update', this.listUpdate!);
	on(list, 'open', this.listOpen!);
};

CommandSuggestion.open = function (): void {
	const list = Command.target as CommandSuggestionList;
	list.scrollAndResize();
	const point = list.getSelectionPosition();
	if (point) {
		Window.open!('command-widget');
		const { widget, list, searcher } = this;
		const x = point.x - 5;
		const y = point.y;
		widget.x = x;
		widget.y = y;
		widget.style.left = `${x}px`;
		widget.style.top = `${y}px`;
		if (!list.initialized) {
			list.initialized = true;
			list.updateCommandNames!();
			list.update();
			list.selectDefaultCommand!();
		} else {
			dispatchUpdateEvent(list);
			list.resize();
		}
		getFocus(searcher);
		window.addEventListener('pointerdown', this.pointerdown!, { capture: true });
	}
};

CommandSuggestion.select = function (item: CommandSuggestionItem): void {
	Window.close!('command-widget');
	Command.open!(item.value);
};

CommandSuggestion.windowLocalize = function (event: Event): void {
	// 用重置textContent代替clear来保留选中项
	const { list, data } = CommandSuggestion;
	if (list.initialized) {
		list.initialized = false;
		list.textContent = '';
		list.deleteNodeElements(data);
	}
};

CommandSuggestion.windowClose = function (event: Event): void {
	// 但是异步触发的scroll事件因为列表被隐藏而不会刷新列表项
	CommandSuggestion.searcher.deleteInputContent();
	hide(CommandSuggestion.list);
	window.removeEventListener('pointerdown', CommandSuggestion.pointerdown!, {
		capture: true
	});
};

CommandSuggestion.pointerdown = function (event: PointerEvent): void {
	const { widget, list } = CommandSuggestion;
	if (!widget.contains(event.target as Node) && !list.contains(event.target as Node)) {
		event.preventDefault();
		Window.close!('command-widget');
	}
};

CommandSuggestion.searcherKeydown = function (event: KeyboardEvent): void {
	switch (event.code) {
		case 'ArrowUp':
		case 'ArrowDown':
			event.preventDefault();
			CommandSuggestion.list.selectRelative(event.code.slice(5).toLowerCase());
			break;
		case 'PageUp':
			CommandSuggestion.list.pageUp(true);
			break;
		case 'PageDown':
			CommandSuggestion.list.pageDown(true);
			break;
		case 'Enter':
		case 'NumpadEnter': {
			const item = read(CommandSuggestion.list);
			if (item && !hasClass(CommandSuggestion.list, 'hidden')) {
				event.stopPropagation();
				CommandSuggestion.list.open(item);
			}
			break;
		}
	}
};

CommandSuggestion.searcherInput = function (event: InputEvent): void {
	if (event.inputType !== 'insertCompositionText') {
		const text = String.compress(read(this));
		CommandSuggestion.list.searchNodes(text);
		CommandSuggestion.list.selectDefaultCommand!();
	}
};

CommandSuggestion.listKeydown = function (event: KeyboardEvent): void {
	switch (event.code) {
		case 'Tab':
			event.preventDefault();
			CommandSuggestion.searcher.input!.focus();
			break;
		case 'Home':
			event.preventDefault();
			this.scrollToHome();
			break;
		case 'End':
			event.preventDefault();
			this.scrollToEnd();
			break;
		case 'PageUp':
			event.preventDefault();
			this.pageUp(true);
			break;
		case 'PageDown':
			event.preventDefault();
			this.pageDown(true);
			break;
	}
};

CommandSuggestion.listPointerdown = function (event: PointerEvent): void {
	const element = event.target as HTMLElement & {
		item: CommandSuggestionItem;
	};
	if (element.tagName === 'NODE-ITEM' && element.item.class !== 'folder') {
		const pointerup = (event: PointerEvent) => {
			if (this.pressing === pointerup) {
				this.pressing = null;
				if (element.contains(event.target as Node)) {
					CommandSuggestion.select!(element.item);
				}
			}
		};
		this.pressing = pointerup;
		window.addEventListener('pointerup', pointerup, { once: true });
	}
};

CommandSuggestion.listUpdate = function (event: Event): void {
	const MAX_LINES = 30;
	const { x, y } = CommandSuggestion.widget;
	const space = window.innerHeight - y - 20;
	const below = space >= 200;
	const capacity = below ? Math.floor(space / 20) : Math.floor(y / 20);
	const lines = Math.min(this.elements.count, capacity, MAX_LINES);
	const top = below ? y + 20 : y - lines * 20;
	if (lines !== 0) {
		this.style.left = `${x}px`;
		this.style.top = `${top}px`;
		this.style.height = `${lines * 20}px`;
		this.style.zIndex = ((Window.frames?.length ?? 0) + 1).toString();
		show(this);
	} else {
		hide(this);
	}
};

CommandSuggestion.listOpen = function (event: Event & { value: CommandSuggestionItem }): void {
	const item = event.value;
	if (item.class !== 'folder' && item.element!.parentNode) {
		CommandSuggestion.select!(item);
	}
};
