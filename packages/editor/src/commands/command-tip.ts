import {
	getListConfig,
	isTreeItemRendered,
	setTreeItemClass,
	treeItemOf,
	treeRowCount,
	treeRowElement,
	treeRowIndexOf,
	type TreeListRowApi
} from '@ui-kit';
import { elementDataOf } from '@ui-kit';
import { createElementRegistry, registryElement } from '@app/utils/element-registry';
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
import { compress } from '@app/utils/string';

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
	initialized: boolean;
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

export const CommandSuggestion = {
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
} satisfies Partial<CommandSuggestionShape> as CommandSuggestionShape;

/** P5b 批次 2：控件元素注册表——由 `CommandWidget.vue` / `CommandSuggestions.vue` 在模板里登记 */
export const commandSuggestionEls = createElementRegistry();

function ensureDomBound() {
	if (CommandSuggestion.widget) return;
	const widget = registryElement<CommandSuggestionWidget>(commandSuggestionEls, 'command-widget');
	if (!widget) return;
	CommandSuggestion.widget = widget;
	CommandSuggestion.searcher = registryElement<CommandSuggestionSearcher>(
		commandSuggestionEls,
		'command-searcher'
	)!;
	CommandSuggestion.list = registryElement<HTMLElement & CommandSuggestionList>(
		commandSuggestionEls,
		'command-suggestions'
	)!;
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
				item.unspacedName = compress(name);
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
			// `Command.words` 的真实类型本来就带 `push`/`join` ⇒ 直接读，无需断言形状
			// （与第 83 轮在 command-custom.ts 删掉的 `WordListInstance` 是同一个多余别名）。
			const words = Command.words;
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
		// P4b：当前项经 `read()` 取——`list.selection` 是已退役的旧属性（无人写入，恒为 null）
		const selection = this.read();
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
	// 定位点拿不到（活动行尚未物化 / 列表刚被清空）时**不能静默不打开**——那正是"双击没反应"。
	// 退回列表自身位置：窗口位置只是观感，打开与否才是功能。
	// 单次断言即可：`CommandTargetShape` 与 `HTMLElement` 是**可比较**的，tsc 会检查这一点；
	// 原来的 `as unknown as` 会把这条检查一并绕掉（第 116 轮实测）。
	const rect = (Command.target as HTMLElement).getBoundingClientRect?.();
	const x = (point?.x ?? rect?.x ?? 0) - 5;
	const y = point?.y ?? rect?.y ?? 0;
	Window.open!('command-widget');
	const { widget, list: suggestionList, searcher } = this;
	widget.x = x;
	widget.y = y;
	widget.style.left = `${x}px`;
	widget.style.top = `${y}px`;
	if (!elementDataOf<{ initialized?: boolean }>(suggestionList).initialized) {
		elementDataOf<{ initialized?: boolean }>(suggestionList).initialized = true;
		suggestionList.updateCommandNames!();
		suggestionList.update();
		suggestionList.selectDefaultCommand!();
	} else {
		dispatchUpdateEvent(suggestionList);
		suggestionList.resize();
	}
	getFocus(searcher);
	window.addEventListener('pointerdown', this.pointerdown!, { capture: true });
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
		const text = compress(read(this));
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
	// P4b：行 → item 经行 API 取（`element.item` expando 已退役，直接读会抛
	// `Cannot read properties of undefined (reading 'class')`）；顺带把标签文字
	// （`.node-text`）上的点击归一成行，点名字也能选中。
	const item = treeItemOf<CommandSuggestionItem>(event.target);
	if (item === undefined || item.class === 'folder') return;
	const element = treeRowElement(item);
	if (element === undefined) return;
	const pointerup = (event: PointerEvent) => {
		if (this.pressing === pointerup) {
			this.pressing = null;
			if (element.contains(event.target as Node)) {
				CommandSuggestion.select!(item);
			}
		}
	};
	this.pressing = pointerup;
	window.addEventListener('pointerup', pointerup, { once: true });
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
