import {
	getListConfig,
	isTreeItemRendered,
	setTreeItemClass,
	treeRowCount,
	treeRowElement,
	treeRowIndexOf,
	type TreeListRowApi
} from '@ui-kit';
import { elementDataOf } from '@ui-kit';
import { createElementRegistry } from '@app/utils/element-registry';
import { Window } from '@app/tools/window-object.ts';
import { getWindowStore } from '@app/stores/window';
import {
	dispatchUpdateEvent,
	getFocus,
	hasClass,
	hide,
	on,
	read,
	setTooltip,
	show
} from '@app/utils/element-utils.ts';
import { Command } from '@app/commands/command-object.ts';
import { File } from '@app/file/file-system-core.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { parseLocalTip } from '@app/localize/dom-localizer';

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

// oxlint-disable-next-line no-explicit-any
type ListMethod = ((...args: any[]) => any) | null;

interface CommandSuggestionList extends TreeListRowApi<CommandSuggestionItem> {
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
	/** 步骤 5b：重派生行（替代旧的「手清 DOM + deleteNodeElements」本地化刷新） */
	syncRenderRows(): void;
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

/** P5b 批次 2：控件元素注册表——由 `CommandWidget.vue` / `CommandSuggestions.vue` 在模板里登记 */
export const commandSuggestionEls = createElementRegistry();

function ensureDomBound() {
	if (CommandSuggestion.widget) return;
	const widget = commandSuggestionEls.get('command-widget');
	if (!widget) return;
	CommandSuggestion.widget = widget as unknown as CommandSuggestionWidget;
	CommandSuggestion.searcher = commandSuggestionEls.get(
		'command-searcher'
	) as unknown as CommandSuggestionSearcher;
	CommandSuggestion.list = commandSuggestionEls.get(
		'command-suggestions'
	) as unknown as HTMLElement & CommandSuggestionList;
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
			update(this.data as CommandSuggestionItem[], (key: string) => t('command.' + key));
		};
	})();

	list.createCommandTip = (function IIFE() {
		const separator = /\s*,\s*/;
		return function (item: CommandSuggestionItem): void {
			// 步骤 5b：行元素改由行 API 取（creator 在 bindRow 之后调用，正常必有元素）
			const element = treeRowElement(item);
			if (element === undefined) return;
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
			// 步骤 4：行 class 经派生层注册（跨重挂载保持）；tooltip 仍挂当前行元素
			setTreeItemClass(item, 'command-suggestion-item', true);
			setTooltip(element, parseLocalTip(tip1 + tip2, ''));
		};
	})();

	list.selectDefaultCommand = function (this: CommandSuggestionList): void {
		const { selection } = this;
		if (selection && selection.class !== 'folder') {
			// 步骤 4：按行号判断选中项是否在列表内（渲染模式无关）
			if (treeRowIndexOf(this, selection) !== -1) {
				this.scrollToSelection('middle');
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
		if (!elementDataOf<{ initialized?: boolean }>(list).initialized) {
			elementDataOf<{ initialized?: boolean }>(list).initialized = true;
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

CommandSuggestion.windowLocalize = function (_event: Event): void {
	// 步骤 5b：行由 v-for 渲染，不能再手清 DOM（会炸掉 vnode）；改为重派生以刷新本地化文本
	const { list } = CommandSuggestion;
	if (elementDataOf<{ initialized?: boolean }>(list).initialized) {
		elementDataOf<{ initialized?: boolean }>(list).initialized = false;
		list.syncRenderRows();
	}
};

CommandSuggestion.windowClose = function (_event: Event): void {
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
	if (hasClass(element, 'node-item') && element.item.class !== 'folder') {
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

CommandSuggestion.listUpdate = function (_event: Event): void {
	const MAX_LINES = 30;
	const { x, y } = CommandSuggestion.widget;
	const space = window.innerHeight - y - 20;
	const below = space >= 200;
	const capacity = below ? Math.floor(space / 20) : Math.floor(y / 20);
	const lines = Math.min(treeRowCount(this), capacity, MAX_LINES);
	const top = below ? y + 20 : y - lines * 20;
	if (lines !== 0) {
		this.style.left = `${x}px`;
		this.style.top = `${top}px`;
		this.style.height = `${lines * 20}px`;
		this.style.zIndex = (getWindowStore().stack.length + 1).toString();
		show(this);
	} else {
		hide(this);
	}
};

CommandSuggestion.listOpen = function (event: Event & { value: CommandSuggestionItem }): void {
	const item = event.value;
	// 步骤 4：可见性改为「该行是否在窗口内物化」，不再读 element.parentNode
	if (item.class !== 'folder' && isTreeItemRendered(item)) {
		CommandSuggestion.select!(item);
	}
};
