import { h } from 'vue';
import {
	relate,
	addClass,
	attachDoubleclick,
	clamp,
	cmdOrCtrlKey,
	css,
	dispatchChangeEvent,
	dispatchRowModelEvent,
	dispatchUpdateEvent,
	hasClass,
	isInContent,
	macRedoKey,
	read,
	rect,
	removeClass,
	getRelativeCoords
} from '../../../utils/dom';
import { commonListClearElements, commonListUpdateHeadAndFoot } from '../../../utils/common-list';
import { attachScrollListener, type ScrollListenerApi } from '../YMParamList/scroll-listener';
import { renderDetached, renderDetachedDiv } from '../../../utils/detached';
import { createCommandCore } from './command-core';
import * as commandRender from './command-render';
import { elementDataOf } from '../../../utils/element-data';
import { getListConfig } from '../../../utils/list-config';

const commandCore = createCommandCore();

const renderElement = (vnode: ReturnType<typeof h>): HTMLElement => renderDetached(vnode);

const arrayAppend = (arr: unknown[], item: unknown): void => {
	arr[arr.length] = item;
};

const alphabetCode = /^Key[A-Z]$/;

interface CommandAdapter {
	parse(item: Record<string, unknown>, varMap: Record<string, unknown>): CommandContent[];
	fetchVariables(data: Record<string, unknown>): VariableItem[];
	insert(list: HTMLElement, id?: string): void;
	edit(list: HTMLElement, command?: CommandData): void;
	parseUnlinkedId(id: string): string;
	colorizeCodeLines(items: HTMLElement[], code: string): void;
}

interface DataLookupAdapter {
	attribute(id: string): { name: string } | null | undefined;
	enumString(id: string): { name: string } | null | undefined;
	gameLocalReplace(text: string): string;
	guidMap?: Record<string, unknown> | (() => Record<string, unknown>);
	scenePresets?: Record<string, unknown> | (() => Record<string, unknown>);
	uiPresets?: Record<string, unknown> | (() => Record<string, unknown>);
}

interface LocalizeAdapter {
	language: string | (() => string);
	get(key: string): string;
	createGetter(key: string): (key: string) => string;
}

type CommandBuffer = (CommandItemElement | CommandData[])[] & { enabled?: boolean };

type CommandData = {
	id: string;
	params: { type?: string; eventId?: string } & Record<string, unknown>;
	commands?: CommandData[];
	folded?: boolean;
	buffer?: CommandBuffer;
	history?: unknown;
	[k: string]: unknown;
};

type CommandList = CommandData[] & { blank?: CommandItemElement };

interface CommandListShape {
	count: number;
	start?: number;
	end?: number;
	[i: number]: CommandItemElement | undefined;
}

type CommandContent = {
	text?: string;
	color?: string;
	textId?: string;
	tooltip?: string;
	class?: string;
	break?: boolean;
	fold?: boolean;
	children?: CommandData[];
	script?: string;
};

type CommandItemElement = HTMLElement & {
	rowKey?: string;
	dataValue?: number;
	contents: CommandContent[] | null;
	dataKey: boolean;
	dataParent: CommandData | null;
	dataList: CommandList;
	dataItem: CommandData | null;
	dataIndex: number;
	dataIndent: number;
	enabled?: boolean;
	fold?: HTMLElement;
	folded?: boolean;
	ellipsis?: HTMLElement | null;
};

export interface CommandRowAttachData {
	rowKey: string;
	command: CommandData | null;
	list: CommandList;
	index: number;
	indent: number;
	dataKey: boolean;
	parent?: CommandData | null;
	contents?: CommandContent[] | null;
}

/**
 * 把一行数据按**与建行代码相同的方式**挂成元素上的闭包。
 *
 * 为什么单独有这个函数：换源后行元素由模板渲染，`createCommandBuffer` 里那套
 * `Object.defineProperty(element, 'dataItem', …)` 不会再跑，而行内渲染
 * （`updateCommandElement`）与整条逻辑链都依赖这些 getter ⇒ 回写桥需要一个等价的挂载入口。
 *
 * **刻意不改动** `createCommandBuffer` 里原有的定义（那些捕获构建期局部变量，合并会改语义）；
 * 这里只是"同一套定义"的第二个入口，并有自己的用例逐项核对语义一致。
 */
export function attachRowData(element: HTMLElement, row: CommandRowAttachData): void {
	const node = element as CommandItemElement;
	let contents: CommandContent[] | null = row.contents === undefined ? [] : row.contents;
	node.rowKey = row.rowKey;
	Object.defineProperty(node, 'contents', {
		configurable: true,
		get: () => contents,
		set: (value) => {
			contents = value;
		}
	});
	Object.defineProperty(node, 'dataKey', {
		configurable: true,
		get: () => row.dataKey
	});
	Object.defineProperty(node, 'dataList', {
		configurable: true,
		get: () => row.list
	});
	Object.defineProperty(node, 'dataItem', {
		configurable: true,
		get: () => row.command
	});
	Object.defineProperty(node, 'dataIndex', {
		configurable: true,
		get: () => row.index
	});
	Object.defineProperty(node, 'dataIndent', {
		configurable: true,
		get: () => row.indent
	});
	if (row.parent !== undefined) {
		Object.defineProperty(node, 'dataParent', {
			configurable: true,
			get: () => row.parent
		});
	}
}

type VariableItem = {
	name: string;
	type: string;
	class?: string;
	refCount: number;
	evIndex?: number;
	isLeftValue?: boolean;
};

type CommandHistory = {
	save(data: unknown): void;
	restore(mode: string): void;
	canUndo(): boolean;
	canRedo(): boolean;
};

type ListPointerEvent = PointerEvent & {
	mode?: 'select';
	itemIndex?: number;
	itemHeight?: number;
	latest?: PointerEvent;
};

type FindSearchMode = {
	caseInsensitive: boolean;
	regex: boolean;
	matchLine: boolean;
};

type FindResult = {
	node: HTMLElement;
	index: number;
	sub: HTMLElement | null;
};

interface ClipboardAdapter {
	write(type: string, data: unknown): void;
	read(type: string): CommandData[];
	has(type: string): boolean;
}

export interface CommandListApiOptions {
	command?: CommandAdapter | null;
	dataLookup?: DataLookupAdapter | null;
	commandHistory?: new (list: never) => CommandHistory;
	clipboard?: ClipboardAdapter | null;
	settingConfig?: { config: { other: { copyAsTextKeepEmptyLine: boolean } } } | null;
	localize?: LocalizeAdapter | null;
	commandSuggestion?: {
		searcher: { input: HTMLInputElement } | (() => { input: HTMLInputElement });
	} | null;
	eventEditor?: { openGlobalEvent(id: string): void } | null;
	searchString?: { open(list: HTMLElement): void } | null;
	menuPopup?: (options: { x: number; y: number }, items: unknown[]) => void;
	getVariable?: (key: string) => { name: string } | null | undefined;
	ctrl?: (key: string) => string;
	setTooltip?: (el: HTMLElement, tip: string) => void;
}

/** 按变量文本的 `name`（`local-number-speed` 这类 id）在**已渲染**的行里找文本元素 */
const findVariableTexts = (...ids: string[]): HTMLElement[] =>
	Array.from(document.querySelectorAll<HTMLElement>('.command-text')).filter((el) =>
		ids.includes((el as { name?: string }).name ?? '')
	);

export const commandListStatics = {
	alphabetCode,
	highlightedTexts: [] as HTMLElement[],
	textPointerenter: function (this: VariableTextElement): void {
		commandListStatics.unhighlightTexts();
		commandListStatics.highlightTexts(this);
	},
	textPointerleave: function (): void {
		commandListStatics.unhighlightTexts();
	},
	highlightTexts({
		varSpace,
		varType,
		varKey
	}: {
		varSpace: string;
		varType: string;
		varKey: string;
	}): void {
		switch (varType) {
			case 'boolean':
			case 'number':
			case 'string':
			case 'object':
				commandListStatics.highlightedTexts = [
					...findVariableTexts(
						`${varSpace}-${varType}-${varKey}`,
						`${varSpace}-any-${varKey}`
					)
				];
				break;
			case 'any':
				commandListStatics.highlightedTexts = [
					...findVariableTexts(
						`${varSpace}-${varType}-${varKey}`,
						`${varSpace}-boolean-${varKey}`,
						`${varSpace}-number-${varKey}`,
						`${varSpace}-string-${varKey}`,
						`${varSpace}-object-${varKey}`
					)
				];
				break;
		}
		for (const text of commandListStatics.highlightedTexts) {
			addClass(text, 'command-text-highlight');
		}
	},
	unhighlightTexts(): void {
		if (commandListStatics.highlightedTexts.length !== 0) {
			for (const text of commandListStatics.highlightedTexts) {
				removeClass(text, 'command-text-highlight');
			}
			commandListStatics.highlightedTexts = [];
		}
	}
};

export interface CommandListElementApi {
	read(): CommandData | null;
	write(data: CommandData): void;
	update(): void;
	resize(): void;
	select(start: number, end?: number): void;
	selectAll(): void;
	unselect(): void;
	selectMultiple(index: number): void;
	selectMultipleTo(index: number): void;
	insert(id?: string): void;
	edit(data?: CommandData): void;
	copy(): void;
	paste(): void;
	delete(): void;
	undo(): void;
	redo(): void;
	save(command: CommandData): void;
	toggle(): void;
	clear(): HTMLElement;
	fold(element?: CommandItemElement): void;
	unfoldCommand(command: CommandData | null): void;
	scrollToRow(targetIndex: number, position?: string): void;
	scrollToSelection(mode?: string): void;
	computeTextIndent(indent: number): string;
	findString(
		str: string | RegExp,
		elements: CommandItemElement[],
		searchMode?: FindSearchMode
	): FindResult[];
	deleteCommandBuffers(commands: CommandData[]): void;
	getRangeByIndex(index: number): number[];
	getRangeByData(data: CommandData): number[];
	createBlankElement(
		commands: CommandList,
		length: number,
		indent: number,
		parent: CommandData | null
	): CommandItemElement;
	[k: string]: unknown;
}

interface CommandListElements extends Array<CommandItemElement> {
	versionId: number;
	count: number;
	start: number;
	end: number;
	head: CommandItemElement | null;
	foot: CommandItemElement | null;
}

/**
 * 命令列表元素的**宿主契约**——`commandListPrototype` 各方法里 `this` 的真实成员面，
 * 外加装配代码（`createCommandListApi`）挂到元素上的字段。
 *
 * 这些方法过去一律把 `this` 声明成 `any`，于是每条都要配一句 `oxlint-disable-next-line no-explicit-any`
 * （本文件原有的 `no-explicit-any` 里 50 条正是这么来的）。成员逐个写出来后：成员拼错、签名用错
 * 都会当场被 tsc 抓到，"命令列表元素上到底有什么"也第一次留在类型里。
 * 写法与同包 `YMTreeList/tree-api.ts` 的 `TreeListHost` 一致。
 *
 * **刻意不继承 `CommandListElementApi`**：那个对外契约带 `[k: string]: unknown` 索引签名
 * （消费方要的宽松兜底），继承它等于让"没声明的成员"继续静默通过——那份宽松正是这里要收窄掉的东西。
 * 公开方法契约仍只有 `CommandListElementApi` 一份，本接口只描述"被访问到的成员"。
 */
interface VariableTextElement extends HTMLDivElement {
	[k: string]: unknown;
	varSpace: string;
	varType: string;
	varKey: string;
}

interface CommandListHost extends HTMLElement {
	__options: CommandListApiOptions;
	data: CommandData | null;
	elements: CommandListElements;
	/**
	 * 行元素「重新物化」钩子（原型上的 `updateOnResize` 提供）。
	 * 共享助手 `commonListResize`（`utils/common-list.ts`）会调用它，所以宿主契约里必须声明 ——
	 * 之前漏了它，于是每次把 `this` 交给共享助手都得写一次 `as unknown as CommonListLike`。
	 */
	updateOnResize(element: HTMLElement): void;
	varList: VariableItem[] | null;
	varMap: Record<string, VariableItem> | null;
	history: CommandHistory;
	innerHeight: number;
	_paddingTop?: number;
	paddingTop: number;
	_checkVariablesScheduled: boolean;
	scrollListener: ScrollListenerApi;

	read(): CommandData | null;
	update(): void;
	select(start: number, end?: number): void;
	selectMultiple(active: number): void;
	selectAll(): void;
	unselect(): void;
	reselect(): void;
	selectUp(): void;
	selectDown(): void;
	selectMultipleUp(): void;
	selectMultipleDown(): void;
	selectMultipleTo(index: number): void;
	pageUp(select: boolean): void;
	pageDown(select: boolean): void;
	/** 折叠后重算选区（`fold` 里调用） */
	reselectAfterFolding(): void;
	scrollToSelection(mode?: string): void;
	insert(id?: string): void;
	/** 实现忽略这个参数；`doubleclick` 会传 `null`（公开契约仍是 `edit(data?: CommandData)`） */
	edit(data?: CommandData | null): void;
	fold(element?: CommandItemElement): void;
	toggle(): void;
	copy(): void;
	copyAsText(): void;
	copyAsJSCode(): void;
	paste(): void;
	delete(): void;
	undo(): void;
	redo(): void;
	/** "编辑数据"入口：ui-kit 未实现，由编辑器侧的 `monkey-patches` 覆写挂上（与原先一样必存在） */
	openEdit(): void;

	analyzeVariables(): { varList: VariableItem[]; varMap: Record<string, VariableItem> };
	checkVariables(): void;
	scheduleCheckVariables(): void;
	computeTextIndent(indent: number): string;
	createCommandBuffer(
		commands: CommandList,
		index: number,
		indent: number,
		parent: CommandData | null
	): CommandBuffer;
	createFoldedCommandBuffer(
		buffer: CommandBuffer,
		indent: number,
		parent: CommandData | null
	): void;
	createItems(commands: CommandList, indent: number, parent?: CommandData | null): void;
	createBlankElement(
		commands: CommandList,
		index: number,
		indent: number,
		parent: CommandData | null
	): CommandItemElement;
	deleteCommandBuffers(commands: CommandData[]): void;
	updateCommandElement(element: CommandItemElement): void;
	/** `element` 允许 `undefined`：`unfoldCommand` 取自 `command.buffer?.[0]`，实现自身按 `element?.fold` 兜底 */
	updateCommandElementFold(element: CommandItemElement | undefined): void;
	updateHeadAndFoot(): void;
	enableItems(commands: CommandData[]): void;
	disableItems(commands: CommandData[]): void;
	generateExecutableCode(commands: CommandData[]): string;
	getRangeByIndex(index: number): number[];
	isParentEnabled(element: CommandItemElement): boolean;
	tryGetEventId(data: CommandData | null | undefined): string | undefined;
	findString(
		str: string | RegExp,
		elements: CommandItemElement[],
		searchMode?: FindSearchMode
	): FindResult[];

	resize: (..._args: unknown[]) => void;
	listFocus: (event: FocusEvent) => void;
	listBlur: (event: FocusEvent) => void;
	keydown: (event: KeyboardEvent) => void;
	pointerdown: (event: ListPointerEvent) => void;
	pointerup: (event: ListPointerEvent) => void;
	doubleclick: (event: MouseEvent) => void;
	windowPointerup: (event: PointerEvent) => void;
	windowPointermove: (event: PointerEvent) => void;
	windowVariableChange: (event: Event) => void;
}

/** 选区变化后刷新行模型并通知模板（行元素归模板，`selected` 由模型驱动） */
function refreshRowsAfterSelection(list: {
	elements: { count: number } & Record<number, unknown>;
	padded?: boolean;
	dispatchEvent?: (event: Event) => unknown;
}): void {
	rebuildCommandRowModel(list, { padded: getListConfig(list).padded === true });
	dispatchUpdateEvent(list as never);
}

export interface CommandRowDescriptor {
	key: string;
	index: number;
	indent: number;
	folded: boolean;
	dataKey: boolean;
	selected: boolean;
	disabled: boolean;
	contents: CommandContent[];
	fold: boolean;
	marginTop: number;
	marginBottom: number;
}

export interface CommandRowModel {
	start: number;
	end: number;
	keys: string[];
	rows: CommandRowDescriptor[];
}

const commandRowModel: CommandRowModel = { start: 0, end: 0, keys: [], rows: [] };

export interface CommandRowData {
	command: CommandData;
	list: CommandList;
	indent: number;
	dataKey: boolean;
	parent: CommandData | null;
	index: number;
}

const rowData: CommandRowData[] = [];

function rowOf(element: CommandItemElement): CommandRowData {
	const elData = rowElementData(element);
	const index = typeof elData.dataValue === 'number' ? elData.dataValue : -1;
	return (
		rowData[index] ?? {
			command: element.dataItem as CommandData,
			list: element.dataList,
			indent: element.dataIndent,
			dataKey: element.dataKey === true,
			parent: element.dataParent,
			index: element.dataIndex
		}
	);
}

/**
 * 按行下标取行数据（与 `elements[]` 同序）。取不到时返回 `undefined`，调用方按可空处理。
 */
function rowAt(index: number | null | undefined): CommandRowData | undefined {
	if (index === null || index === undefined) return undefined;
	return rowData[index];
}

/** 从 `elements[]` 重建行数据（在 `update()` 写完 `dataValue` 之后调用） */
function rebuildCommandRowData(elements: CommandListShape): void {
	rowData.length = 0;
	const count = elements.count;
	for (let i = 0; i < count; i++) {
		const element = elements[i];
		if (element === undefined) continue;
		rowData[i] = {
			command: element.dataItem as CommandData,
			list: element.dataList,
			indent: element.dataIndent,
			dataKey: element.dataKey === true,
			parent: element.dataParent,
			index: element.dataIndex
		};
	}
}

interface CommandElementsView {
	count: number;
	start?: number;
	end?: number;
	[i: number]: unknown;
}

/**
 * **可见窗口**（行高 `ROW_HEIGHT`）—— `resize()` 与 `update()` 共用同一份公式。
 *
 * 为什么要有它：`update()` 也要按当前窗口重建行模型（否则会拿上一次的 `end` 建出一段错窗口），
 * 而 `resize()` 的窗口重算发生在 `update` 事件**之后**（editor 侧的 `mark` 依赖事件先到）。
 * 两处必须同口径，故收成这一个纯函数。
 *
 * 调用方自己保留「列表隐藏（`clientHeight === 0`）时不重算」的语义：本函数只做算术。
 */
function commandVisibleRange(list: {
	scrollTop: number;
	clientHeight: number;
	elements: { count: number };
}): { start: number; end: number } {
	const count = list.elements.count;
	const start = Math.min(Math.floor(list.scrollTop / commandRender.ROW_HEIGHT), count - 1);
	const length = Math.ceil(list.clientHeight / commandRender.ROW_HEIGHT) + 1;
	return { start, end: Math.min(start + length, count) };
}

/** 从 `elements[]` 重建行模型（在 `update`/`resize` 之后调用） */
function rebuildCommandRowModel(
	list: { elements: CommandElementsView },
	options: { padded?: boolean } = {}
): void {
	const elements = list.elements;
	const rows: CommandRowDescriptor[] = [];
	const keys: string[] = [];
	const count = elements.count;
	const start = elements.start ?? 0;
	const end = elements.end ?? count;
	const pad = options.padded === true ? 1 : 0;
	const selection = commandListData(list);
	const hasSelection = selection.start !== null && selection.end !== null;
	const marginTop = count === 0 ? 0 : start * commandRender.ROW_HEIGHT;
	const marginBottom = count === 0 ? 0 : (count - end + pad) * commandRender.ROW_HEIGHT;
	for (let i = start; i < end; i++) {
		const element = elements[i] as CommandItemElement | undefined;
		if (element === undefined) continue;
		const key = element.rowKey ?? '';
		keys.push(key);
		rows.push({
			key,
			index: i,
			indent: element.dataIndent,
			folded: element.folded === true,
			dataKey: element.dataKey === true,
			selected: hasSelection && i >= selection.start! && i <= selection.end!,
			disabled: element.classList.contains('disabled'),
			contents: element.contents ?? [],
			fold: element.fold !== undefined,
			marginTop: i === start ? marginTop : 0,
			marginBottom: i === end - 1 ? marginBottom : 0
		});
	}
	commandRowModel.start = start;
	commandRowModel.end = end;
	commandRowModel.keys = keys;
	commandRowModel.rows = rows;
}

interface CommandListData {
	dragging: ListPointerEvent | null;
	start: number | null;
	end: number | null;
	selections: CommandSelections;
	origin: number | null;
	active: number | null;
	anchor: number | null;
	inserting: boolean;
	focusing: boolean;
}

type CommandSelections = (CommandItemElement | undefined)[] & { count: number };

const commandListData = (el: unknown): CommandListData => elementDataOf<CommandListData>(el);

/** 行元素上的 `dataValue`（= 行下标，`update()` 里统一写过）也走显式元素数据 */
const rowElementData = (el: unknown): { dataValue?: number; renderedSignature?: string } =>
	elementDataOf<{ dataValue?: number; renderedSignature?: string }>(el);

/**
 * 行内容的**渲染签名**（`bindRowElement` 用来判断"这一行的行内 DOM 是否已经是对的"）。
 *
 * 为什么要它：回写桥会在挂载 / `update` / `scroll` / `:ref` 多处被调用，而 `updateCommandElement`
 * 是"先清空再追加"的语义。内容没变时重复重建有两个害处：
 *
 * 1. 纯浪费——滚动、改选区都会把可见行的行内节点全部丢掉重建；
 * 2. **行内文本节点的对象身份随之改变**，而 `utils/doubleclick.ts` 判双击用的是
 *    `event.target === last.target`（**同一个节点**）⇒ 第二次按下落在新建的节点上，判不出双击
 *    ⇒ 用户看到"双击**文本**打不开指令窗口，双击该行**空白处**可以"（行元素本身由 Vue 复用、
 *    身份稳定，所以空白处一直好使）。
 *
 * 签名只需覆盖"会影响行内 DOM 的东西"：行下标、行 key、缩进、是否有折叠加减号（`dataKey` 决定
 * `command-mark-major` 还是 `command-mark-minor`）、以及 `contents` 里所有会被渲染的字段。
 * 行数据的刷新（`attachRowData`）**不在**签名保护范围内——它每次都必须执行。
 */
const rowRenderSignatureOf = (
	source: CommandItemElement,
	row: CommandRowData,
	index: number
): string => {
	const contents = source.contents ?? null;
	return JSON.stringify([
		index,
		source.rowKey ?? '',
		row.indent,
		row.dataKey === true,
		source.fold !== undefined,
		contents === null
			? null
			: contents.map((content) => [
					content.text,
					content.color,
					content.textId,
					content.tooltip,
					content.class,
					content.break,
					content.fold
				])
	]);
};

export const commandListPrototype: Record<
	string,
	(this: CommandListHost, ...args: never[]) => unknown
> = {
	read: function (this: CommandListHost): CommandData | null {
		return this.data as CommandData | null;
	},

	write: function (this: CommandListHost, data: CommandData): void {
		const options = this.__options;
		this.data = data;
		this.update();
		if (!data.history) {
			const HistoryCtor = options.commandHistory as new (
				list: CommandListHost
			) => CommandHistory;
			Object.defineProperty(data, 'history', {
				configurable: true,
				value: options.commandHistory ? new HistoryCtor(this) : null
			});
		}
		void Promise.resolve().then(() => {
			this.scrollTop = 0;
		});
	},

	update: function (this: CommandListHost): void {
		this.analyzeVariables();

		const { elements } = this;
		elements.start = -1;
		elements.count = 0;

		this.createItems((this.data as (CommandData & CommandList) | null)!, 0);

		const { count } = elements;
		for (let i = 0; i < count; i++) {
			rowElementData(elements[i]).dataValue = i;
		}

		commonListClearElements(this, elements.count);

		const range = commandVisibleRange(this);
		elements.start = range.start;
		elements.end = range.end;

		rebuildCommandRowData(elements);
		rebuildCommandRowModel(this, { padded: getListConfig(this).padded === true });

		dispatchUpdateEvent(this);

		this.resize();
	},

	getRowModel: function (): CommandRowModel {
		const rows: CommandRowDescriptor[] = [];
		for (const row of commandRowModel.rows) rows.push({ ...row });
		return {
			start: commandRowModel.start,
			end: commandRowModel.end,
			keys: [...commandRowModel.keys],
			rows
		};
	},

	bindRowElement: function (this: CommandListHost, element: HTMLElement, index: number): void {
		const node = element as CommandItemElement;
		rowElementData(node).dataValue = index;
		const source = this.elements[index] as CommandItemElement | undefined;
		const row = rowData[index];
		if (source === undefined || row === undefined) return;
		attachRowData(node, {
			rowKey: source.rowKey ?? '',
			command: row.command,
			list: row.list,
			index: row.index,
			indent: row.indent,
			dataKey: row.dataKey,
			parent: row.parent,
			contents: source.contents ?? []
		});
		if (source.fold !== undefined) {
			if (node.fold === undefined) {
				const fold = renderElement(h('span', { class: 'command-fold' }));
				addClass(fold, 'command-fold');
				node.fold = fold;
				node.appendChild(fold);
			}
		} else if (node.fold !== undefined) {
			node.fold.remove();
			node.fold = undefined;
		}
		const signature = rowRenderSignatureOf(source, row, index);
		const elData = rowElementData(node);
		if (elData.renderedSignature === signature) return;
		elData.renderedSignature = signature;
		for (const child of Array.from(node.children)) {
			if (!child.classList.contains('command-fold')) child.remove();
		}
		this.updateCommandElement(node);
	},

	updateLineClasses: function (): void {},

	resize: function (this: CommandListHost, ..._args: unknown[]): void {
		const els = this.elements;
		const ch = this.clientHeight;
		if (ch === 0) return;
		if (els.count === 0) {
			els.start = 0;
			els.end = 0;
			rebuildCommandRowModel(this, { padded: getListConfig(this).padded === true });
			this.scheduleCheckVariables();
			return;
		}
		const { start, end } = commandVisibleRange(this);
		if (els.start !== start || els.end !== end) {
			els.start = start;
			els.end = end;
			rebuildCommandRowModel(this, { padded: getListConfig(this).padded === true });
			dispatchRowModelEvent(this);
		}

		this.scheduleCheckVariables();
	},

	updateHeadAndFoot: function (this: CommandListHost): void {
		return commonListUpdateHeadAndFoot(this);
	},

	updateOnResize: function (this: CommandListHost, element: CommandItemElement): void {
		if (element.contents !== null) {
			this.updateCommandElement(element);
		}
	},

	createFoldedCommandBuffer: function (
		this: CommandListHost,
		buffer: CommandBuffer,
		indent: number,
		parent: CommandData | null
	): void {
		for (const commands of buffer) {
			if (commands instanceof Array) {
				const length = commands.length;
				for (let i = 0; i < length; i++) {
					this.createFoldedCommandBuffer(
						this.createCommandBuffer(commands, i, indent, parent),
						indent + 1,
						commands[i]
					);
				}
			}
		}
	},

	createItems: function (
		this: CommandListHost,
		commands: CommandList,
		indent: number,
		parent: CommandData | null = null
	): void {
		const elements = this.elements;
		const length = commands.length;
		for (let i = 0; i < length; i++) {
			const buffer = this.createCommandBuffer(commands, i, indent, parent);
			if ((buffer[0] as CommandItemElement).dataItem?.folded) {
				elements[elements.count++] = buffer[0] as CommandItemElement;
				this.createFoldedCommandBuffer(buffer, indent + 1, commands[i]);
				continue;
			}
			for (const target of buffer) {
				if (target instanceof HTMLElement) {
					elements[elements.count++] = target;
					continue;
				}
				if (target instanceof Array) {
					this.createItems(target, indent + 1, commands[i]);
					continue;
				}
			}
		}

		elements[elements.count++] = this.createBlankElement(commands, length, indent, parent);
	},

	createCommandBuffer: function (
		this: CommandListHost,
		commands: CommandList,
		index: number,
		indent: number,
		parent: CommandData | null
	): CommandBuffer {
		const options = this.__options as CommandListApiOptions;
		const command = commands[index];
		let buffer = command.buffer;
		if (buffer === undefined || (buffer[0] as CommandItemElement)?.contents === null) {
			if (buffer !== undefined) {
				delete command.buffer;
				buffer = undefined;
			}
			buffer = [];
			buffer.enabled = true;
			Object.defineProperty(command, 'buffer', {
				configurable: true,
				value: buffer
			});

			let li: CommandItemElement;
			let textId = '';
			let tooltip = '';
			let className = '';
			let color = '';
			let mainColor = 'normal';
			li = renderDetachedDiv('command-item') as CommandItemElement;
			li.rowKey = commandRender.rowKeyOf(command);
			let liContents: CommandContent[] | null = [];
			Object.defineProperty(li, 'contents', {
				configurable: true,
				get: () => liContents,
				set: (value) => {
					liContents = value;
				}
			});
			Object.defineProperty(li, 'dataKey', {
				configurable: true,
				get: () => true
			});
			Object.defineProperty(li, 'dataParent', {
				configurable: true,
				get: () => parent
			});
			Object.defineProperty(li, 'dataList', {
				configurable: true,
				get: () => commands
			});
			Object.defineProperty(li, 'dataItem', {
				configurable: true,
				get: () => command
			});
			Object.defineProperty(li, 'dataIndex', {
				configurable: true,
				get: () => index
			});
			Object.defineProperty(li, 'dataIndent', {
				configurable: true,
				get: () => indent
			});
			buffer.push(li);

			const contents = options.command
				? options.command.parse(command, this.varMap as Record<string, unknown>)
				: [];
			const length = contents.length;
			for (let i = 0; i < length; i++) {
				const content = contents[i];

				if (content.text !== undefined) {
					content.color = color;
					content.textId = textId;
					content.tooltip = tooltip;
					content.class = className;
					li.contents!.push(content);
					if (textId) textId = '';
					if (tooltip) tooltip = '';
					if (className) className = '';
				}

				if (content.color !== undefined) {
					switch (content.color) {
						case 'restore':
							color = mainColor;
							continue;
						case 'save':
							mainColor = color;
							continue;
						default:
							color = content.color;
							continue;
					}
				}

				if (content.textId !== undefined) {
					textId = content.textId;
				}

				if (content.tooltip !== undefined) {
					tooltip = content.tooltip;
				}

				if (content.class !== undefined) {
					className = content.class;
				}

				if (content.break !== undefined) {
					li = renderDetachedDiv('command-item') as CommandItemElement;
					let breakContents: CommandContent[] | null = [];
					Object.defineProperty(li, 'contents', {
						configurable: true,
						get: () => breakContents,
						set: (value) => {
							breakContents = value;
						}
					});
					Object.defineProperty(li, 'dataKey', {
						configurable: true,
						get: () => false
					});
					Object.defineProperty(li, 'dataList', {
						configurable: true,
						get: () => commands
					});
					Object.defineProperty(li, 'dataItem', {
						configurable: true,
						get: () => command
					});
					Object.defineProperty(li, 'dataIndex', {
						configurable: true,
						get: () => index
					});
					Object.defineProperty(li, 'dataIndent', {
						configurable: true,
						get: () => indent
					});
					li.rowKey = `${commandRender.rowKeyOf(command)}-b${buffer.length}`;
					buffer.push(li);
					continue;
				}

				if (content.fold !== undefined) {
					(li as CommandItemElement).fold = renderElement(
						h('span', { class: 'command-fold' })
					);
					addClass((li as CommandItemElement).fold!, 'command-fold');
					li.appendChild((li as CommandItemElement).fold!);
				}

				if (content.children !== undefined) {
					buffer.push(content.children);

					if (i < length) {
						li = renderDetachedDiv('command-item') as CommandItemElement;
						let childContents: CommandContent[] | null = [];
						Object.defineProperty(li, 'contents', {
							configurable: true,
							get: () => childContents,
							set: (value) => {
								childContents = value;
							}
						});
						Object.defineProperty(li, 'dataKey', {
							configurable: true,
							get: () => false
						});
						Object.defineProperty(li, 'dataList', {
							configurable: true,
							get: () => commands
						});
						Object.defineProperty(li, 'dataItem', {
							configurable: true,
							get: () => command
						});
						Object.defineProperty(li, 'dataIndex', {
							configurable: true,
							get: () => index
						});
						Object.defineProperty(li, 'dataIndent', {
							configurable: true,
							get: () => indent
						});
						li.rowKey = `${commandRender.rowKeyOf(command)}-c${buffer.length}`;
						buffer.push(li);
						continue;
					}
				}

				if (content.script !== undefined) {
					const MAX_LINES = 20;
					const { code, lines, visibleLines } = commandCore.truncateScript(
						content.script,
						MAX_LINES
					);
					const slength = visibleLines;
					const items = Array.from<CommandItemElement>({ length: slength });
					items[0] = li;
					for (let i = 1; i < slength; i++) {
						li = renderDetachedDiv('command-item') as CommandItemElement;
						let scriptContents: CommandContent[] | null = [];
						Object.defineProperty(li, 'contents', {
							configurable: true,
							get: () => scriptContents,
							set: (value) => {
								scriptContents = value;
							}
						});
						Object.defineProperty(li, 'dataKey', {
							configurable: true,
							get: () => false
						});
						Object.defineProperty(li, 'dataList', {
							configurable: true,
							get: () => commands
						});
						Object.defineProperty(li, 'dataItem', {
							configurable: true,
							get: () => command
						});
						Object.defineProperty(li, 'dataIndex', {
							configurable: true,
							get: () => index
						});
						Object.defineProperty(li, 'dataIndent', {
							configurable: true,
							get: () => indent
						});
						li.rowKey = `${commandRender.rowKeyOf(command)}-s${i}`;
						buffer.push(li);
						items[i] = li;
					}
					if (lines > MAX_LINES) {
						const text = renderDetachedDiv(['text', 'gray']);
						text.textContent = `... ${lines} lines`;
						li.appendChild(text);
					}
					options.command?.colorizeCodeLines(items, code);
				}
			}
		}

		if ((buffer[0] as CommandItemElement).dataIndex !== index) {
			for (const target of buffer) {
				if (target instanceof HTMLElement) {
					Object.defineProperty(target, 'dataIndex', {
						configurable: true,
						get: () => index
					});
				}
			}
		}

		const enabled = command.id[0] !== '!';
		if (buffer.enabled !== enabled) {
			buffer.enabled = enabled;
			if (enabled) {
				for (const target of buffer) {
					if (target instanceof HTMLElement) {
						removeClass(target, 'disabled');
					}
				}
			} else {
				for (const target of buffer) {
					if (target instanceof HTMLElement) {
						addClass(target, 'disabled');
					}
				}
			}
		}

		return buffer;
	},

	updateCommandElement: function (this: CommandListHost, element: CommandItemElement): void {
		const options = this.__options;
		element.style.textIndent = this.computeTextIndent(rowOf(element).indent);

		if (rowOf(element).dataKey) {
			const mark = renderElement(h('span', { class: 'command-mark-major' }));
			addClass(mark, 'command-mark-major');
			mark.textContent = '>';
			element.insertBefore(mark, element.firstElementChild);
		} else {
			const mark = renderElement(h('span', { class: 'command-mark-minor' }));
			addClass(mark, 'command-mark-minor');
			mark.textContent = ':';
			element.insertBefore(mark, element.firstElementChild);
		}

		for (const content of element.contents!) {
			if (content.text !== undefined) {
				const text = renderDetachedDiv('command-text') as VariableTextElement;
				text.textContent = content.text;
				addClass(text, content.color!);
				if (content.textId) {
					let id = content.textId;
					const i = id.indexOf('-');
					const j = id.indexOf('-', i + 1);
					let varSpace = id.slice(0, i);
					let varType = id.slice(i + 1, j);
					let varKey = id.slice(j + 1);
					Object.defineProperty(text, 'varSpace', {
						configurable: true,
						get: () => varSpace
					});
					Object.defineProperty(text, 'varType', {
						configurable: true,
						get: () => varType
					});
					Object.defineProperty(text, 'varKey', {
						configurable: true,
						get: () => varKey
					});
					let currentType = '';
					Object.defineProperty(text, 'currentType', {
						configurable: true,
						get: () => currentType,
						set: (value) => {
							currentType = value;
						}
					});
					switch (varSpace) {
						case 'local':
							currentType = varType;
							addClass(text, 'local-variable-identifier');
							break;
						case 'global':
							addClass(text, 'global-variable-identifier');
							break;
						case 'attribute':
						case 'enum': {
							const string = varKey;
							const i = string.lastIndexOf('-');
							varKey = string.slice(0, i);
							let varId = string.slice(i + 1);
							Object.defineProperty(text, 'varId', {
								configurable: true,
								get: () => varId
							});
							addClass(text, `${varSpace}-identifier`);
							id = id.slice(0, id.lastIndexOf('-'));
							break;
						}
						case 'file':
							addClass(text, 'file-identifier');
							break;
						case 'scene':
							addClass(text, 'scene-identifier');
							break;
						case 'ui':
							addClass(text, 'ui-identifier');
							break;
					}
					text.name = id;
					addClass(text, varType + '-type');
					addClass(text, 'command-text-identifier');
					text.onpointerenter = () => {
						commandListStatics.textPointerenter.call(text);
					};
					text.onpointerleave = () => {
						commandListStatics.textPointerleave();
					};
				}
				if (content.tooltip) {
					options.setTooltip?.(text, content.tooltip);
					addClass(text, 'plugin-link');
				}
				if (content.class) {
					if (content.class.indexOf('parent:') === 0) {
						addClass(element, content.class.replace('parent:', ''));
					} else {
						addClass(text, content.class);
					}
				}
				element.appendChild(text);
				continue;
			}
		}
		element.contents = null;

		this.updateCommandElementFold(element);
	},

	updateCommandElementFold: function (
		this: CommandListHost,
		element: CommandItemElement | undefined
	): void {
		if (element?.fold) {
			const command = rowOf(element).command;
			if (!command) return;
			const folded = !!command.folded;
			if (element.folded !== folded) {
				element.folded = folded;
				if (folded) {
					element.fold.textContent = '+';
					if (!element.ellipsis) {
						element.ellipsis = renderDetachedDiv('command-text');
						element.ellipsis.textContent = ' ......';
						element.appendChild(element.ellipsis!);
					}
				} else {
					element.fold.textContent = '-';
					if (element.ellipsis) {
						element.ellipsis.remove();
						element.ellipsis = null;
					}
				}
			}
		}
	},

	deleteCommandBuffers: function (this: CommandListHost, commands: CommandData[]): void {
		for (const command of commands) {
			const { buffer } = command;
			if (!buffer) continue;
			for (const item of buffer) {
				if (item instanceof Array) {
					this.deleteCommandBuffers(item);
				}
			}
			delete command.buffer;
		}
	},

	createBlankElement: function (
		this: CommandListHost,
		commands: CommandList,
		index: number,
		indent: number,
		parent: CommandData | null
	): CommandItemElement {
		let blank = commands.blank;
		if (blank === undefined) {
			blank = renderDetachedDiv('command-item') as CommandItemElement;

			blank.rowKey = commandRender.blankRowKeyOf(commands, indent, index);

			let blankContents: CommandContent[] | null = [];
			Object.defineProperty(blank, 'contents', {
				configurable: true,
				get: () => blankContents,
				set: (value) => {
					blankContents = value;
				}
			});
			blank.enabled = true;
			Object.defineProperty(blank, 'dataKey', {
				configurable: true,
				get: () => true
			});
			Object.defineProperty(blank, 'dataParent', {
				configurable: true,
				get: () => parent
			});
			Object.defineProperty(blank, 'dataList', {
				configurable: true,
				get: () => commands
			});
			Object.defineProperty(blank, 'dataItem', {
				configurable: true,
				get: () => null
			});
			Object.defineProperty(blank, 'dataIndex', {
				configurable: true,
				get: () => index
			});
			Object.defineProperty(blank, 'dataIndent', {
				configurable: true,
				get: () => indent
			});
			Object.defineProperty(commands, 'blank', {
				value: blank
			});
		}

		if (blank.dataIndex !== index) {
			Object.defineProperty(blank, 'dataIndex', {
				configurable: true,
				get: () => index
			});
		}

		if (parent) {
			const { enabled } = parent.buffer!;
			if (blank.enabled !== enabled) {
				blank.enabled = enabled;
				if (enabled) {
					removeClass(blank, 'disabled');
				} else {
					addClass(blank, 'disabled');
				}
			}
		}

		return blank;
	},

	computeTextIndent: function (this: CommandListHost, indent: number): string {
		const lang = (this.__options as CommandListApiOptions).localize?.language;
		const langText = typeof lang === 'function' ? lang() : lang;
		return commandCore.computeTextIndent(indent, langText);
	},

	select: function (this: CommandListHost, start: number, end: number = start): void {
		const listData = commandListData(this);
		[start, end] = commandCore.computeSelectRange(this.elements, start, end);

		this.unselect();

		listData.start = start;
		listData.end = end;
		listData.origin = start;
		listData.active = start;
		listData.anchor = null;

		this.reselect();

		refreshRowsAfterSelection(this);
	},

	selectMultiple: function (this: CommandListHost, active: number): void {
		const listData = commandListData(this);
		const origin = listData.origin;
		this.select(origin!, active);
		listData.origin = origin;
		listData.active = clamp(active, listData.start!, listData.end!);
	},

	selectAll: function (this: CommandListHost): void {
		const listData = commandListData(this);
		this.select(0, Infinity);
		listData.active = this.getRangeByIndex(listData.end!)[0];
	},

	unselect: function (this: CommandListHost): void {
		const listData = commandListData(this);
		if (listData.start !== null) {
			const { selections } = listData;
			const { count } = selections;
			for (let i = 0; i < count; i++) {
				removeClass(selections[i], 'selected');
				selections[i] = undefined;
			}
			selections.count = 0;
			if (count > 256) {
				selections.length = 0;
			}
		}
	},

	reselect: function (this: CommandListHost): void {
		const listData = commandListData(this);
		if (listData.focusing && listData.start !== null && listData.end !== null) {
			const { selections } = listData;
			const elements = this.elements;
			const start = listData.start;
			const end = listData.end;
			let count = 0;
			for (let i = start; i <= end; i++) {
				const element = elements[i];
				selections[count++] = element;
				addClass(element, 'selected');
			}
			selections.count = count;
		}
	},

	selectUp: function (this: CommandListHost): void {
		const listData = commandListData(this);
		if (listData.start !== null && listData.end !== null) {
			const i = commandCore.getSelectUpIndex(this.elements, listData.start, listData.end);
			this.select(i);
			this.scrollToSelection();
		}
	},

	selectDown: function (this: CommandListHost): void {
		const listData = commandListData(this);
		if (listData.start !== null && listData.end !== null) {
			const i = commandCore.getSelectDownIndex(this.elements, listData.start, listData.end);
			this.select(i);
			this.scrollToSelection();
		}
	},

	pageUp: function (this: CommandListHost, select: boolean): void {
		const listData = commandListData(this);
		let anchor = listData.anchor;
		if (anchor === null) {
			anchor = listData.active;
		}
		if (anchor !== null) {
			const context = {
				scrollTop: this.scrollTop,
				viewportHeight: this.innerHeight,
				rowCount: this.elements.count,
				anchor
			};
			const nextScrollTop = commandRender.computePageUpScrollTop(context);
			if (select) {
				const targetIndex = commandRender.computePageUpTargetIndex(context);
				this.select(targetIndex);
				listData.anchor = Math.max(targetIndex, listData.start!);
			}
			this.scroll(0, nextScrollTop);
		}
	},

	pageDown: function (this: CommandListHost, select: boolean): void {
		const listData = commandListData(this);
		let anchor = listData.anchor;
		if (anchor === null) {
			anchor = listData.active;
		}
		if (anchor !== null) {
			const context = {
				scrollTop: this.scrollTop,
				viewportHeight: this.innerHeight,
				rowCount: this.elements.count,
				anchor
			};
			const nextScrollTop = commandRender.computePageDownScrollTop(context, select);
			if (select) {
				const targetIndex = commandRender.computePageDownTargetIndex(context);
				this.select(targetIndex);
				listData.anchor = Math.min(targetIndex, listData.end!);
			}
			this.scroll(0, Math.max(context.scrollTop, nextScrollTop));
		}
	},

	selectMultipleTo: function (this: CommandListHost, index: number): void {
		const listData = commandListData(this);
		if (listData.start !== null && listData.origin !== null && listData.active !== null) {
			this.selectMultiple(index);
			const elements = this.elements;
			const sElement = elements[listData.start];
			const aElement = elements[listData.active];
			const sIndent = rowOf(sElement).indent;
			const aIndent = rowOf(aElement).indent;
			let n = listData.active;
			if (sIndent < aIndent) {
				for (let i = n - 1; i >= 0; i--) {
					const element = elements[i];
					if (rowOf(element).indent === sIndent && rowOf(element).dataKey === true) {
						n = i;
						break;
					}
				}
			}
			const range = this.getRangeByIndex(n);
			const origin = listData.origin;
			const active = listData.active;
			if (origin < active && origin > range[0] && origin < range[1]) {
				listData.active = range[1];
			} else {
				listData.active = range[0];
			}
		}
	},

	selectMultipleUp: function (this: CommandListHost): void {
		const listData = commandListData(this);
		if (
			listData.start !== null &&
			listData.end !== null &&
			listData.origin !== null &&
			listData.active !== null
		) {
			const elements = this.elements;
			if (listData.active <= listData.origin) {
				const sElement = elements[listData.start];
				const indent = rowOf(sElement).indent;
				let i = listData.start;
				while (--i >= 0) {
					const element = elements[i];
					if (rowOf(element).indent <= indent && rowOf(element).dataKey === true) {
						this.selectMultiple(i);
						break;
					}
				}
			} else {
				const eElement = elements[listData.end];
				const data = rowOf(eElement).command;
				const end = listData.end;
				let indent = Infinity;
				let n = listData.origin;
				for (let i = n; i < end; i++) {
					const element = elements[i];
					if (rowOf(element).indent < indent) {
						indent = rowOf(element).indent;
					}
					if (
						rowOf(element).indent === indent &&
						rowOf(element).command !== data &&
						rowOf(element).command !== null
					) {
						n = i;
					}
				}
				const range = this.getRangeByIndex(n);
				if (
					listData.origin < n &&
					listData.origin > range[0] &&
					listData.origin < range[1]
				) {
					n = range[1];
				} else {
					n = range[0];
				}
				this.selectMultiple(n);
			}
			this.scrollToSelection();
		}
	},

	selectMultipleDown: function (this: CommandListHost): void {
		const listData = commandListData(this);
		if (
			listData.start !== null &&
			listData.end !== null &&
			listData.origin !== null &&
			listData.active !== null
		) {
			const elements = this.elements;
			if (listData.active >= listData.origin) {
				const eElement = elements[listData.end];
				const indent = rowOf(eElement).indent;
				const count = elements.count;
				let i = listData.end;
				while (++i < count) {
					const element = elements[i];
					if (rowOf(element).indent < indent) {
						i = this.getRangeByIndex(i)[1];
						break;
					}
					if (
						rowOf(element).indent === indent &&
						rowOf(element).dataKey === true &&
						rowOf(element).command !== null
					) {
						break;
					}
				}
				this.selectMultiple(i);
			} else {
				const start = listData.start;
				let indent = Infinity;
				let n = listData.origin;
				for (let i = n; i > start; i--) {
					const element = elements[i];
					if (rowOf(element).indent < indent) {
						indent = rowOf(element).indent;
					}
					if (rowOf(element).indent === indent && rowOf(element).dataKey === true) {
						n = i;
					}
				}
				this.selectMultiple(n);
			}
			this.scrollToSelection();
		}
	},

	scrollToSelection: function (this: CommandListHost, mode = 'active'): void {
		const listData = commandListData(this);
		if (
			listData.start !== null &&
			listData.end !== null &&
			listData.origin !== null &&
			listData.active !== null
		) {
			const range = this.getRangeByIndex(listData.active) as [number, number];
			const scrollTop = commandRender.computeScrollToSelection(mode, {
				scrollTop: this.scrollTop,
				viewportHeight: this.innerHeight,
				rowCount: this.elements.count,
				anchor: listData.anchor ?? 0,
				active: listData.active,
				origin: listData.origin,
				start: listData.start,
				end: listData.end,
				activeRange: range
			});
			if (scrollTop === null) return;
			if (this.scrollTop !== scrollTop) {
				this.scrollTop = scrollTop;
			}
		}
	},

	scrollAndResize: function (this: CommandListHost): void {
		const scrolltop = this.scrollTop;
		this.scrollToSelection('active');
		if (this.scrollTop !== scrolltop) {
			this.resize();
		}
	},

	getRangeByIndex: function (this: CommandListHost, index: number): number[] {
		const elements = this.elements as CommandItemElement[] & { count: number };
		return commandCore.getRangeByIndex(elements, index);
	},

	getRangeByData: function (this: CommandListHost, data: CommandData): number[] {
		const elements = this.elements as CommandItemElement[] & { count: number };
		return commandCore.getRangeByData(elements, data);
	},

	isParentEnabled: function (this: CommandListHost, element: CommandItemElement): boolean {
		return rowOf(element).parent?.buffer?.enabled ?? true;
	},

	insert: function (this: CommandListHost, id = ''): void {
		const listData = commandListData(this);
		const options = this.__options;
		if (listData.start !== null) {
			const elements = this.elements;
			const element = elements[listData.start];
			if (!this.isParentEnabled(element)) {
				return;
			}
			listData.inserting = true;
			options.command?.insert(this, id);
		}
	},

	edit: function (this: CommandListHost, _data?: CommandData): void {
		const listData = commandListData(this);
		const options = this.__options;
		if (listData.start !== null) {
			const elements = this.elements;
			const element = elements[listData.start];
			if (!this.isParentEnabled(element)) {
				return;
			}
			listData.inserting = rowOf(element).command === null;
			switch (listData.inserting) {
				case true:
					options.command?.insert(this, '');
					break;
				case false: {
					const command = rowOf(element).command;
					if (command!.buffer!.enabled) {
						options.command?.edit(this, command);
					}
					break;
				}
			}
		}
	},

	fold: function (this: CommandListHost, element?: CommandItemElement): void {
		const listData = commandListData(this);
		if (element === undefined && listData.start !== null) {
			const elements = this.elements;
			const startItem = rowAt(listData.start)?.command ?? null;
			const endItem = rowAt(listData.end)?.command ?? null;
			if (startItem === endItem) {
				element = elements[listData.start];
			}
		}
		if (element && element.fold) {
			const command = rowOf(element).command;
			if (rowOf(element).dataKey && command) {
				if (command.folded) {
					delete command.folded;
				} else {
					command.folded = true;
				}
				this.update();
				this.updateCommandElementFold(element);
				this.reselectAfterFolding();
				dispatchChangeEvent(this);
			}
		}
	},

	unfoldCommand: function (this: CommandListHost, command: CommandData | null): void {
		let changed = false;
		const commands: CommandData[] = [];
		while (command && !commands.includes(command)) {
			commands.push(command);
			const element = command.buffer?.[0] as CommandItemElement | undefined;
			if (command.folded) {
				delete command.folded;
				this.updateCommandElementFold(element);
				changed = true;
			}
			if (element) {
				command = rowOf(element).parent;
			}
		}
		if (changed) {
			this.update();
		}
	},

	reselectAfterFolding: function (this: CommandListHost): void {
		const listData = commandListData(this);
		let head;
		let foot;
		const { selections } = listData;
		const { count } = selections;
		for (let i = 0; i < count; i++) {
			const element = selections[i];
			if (element!.parentNode) {
				if (head === undefined) {
					head = element;
				}
				foot = element;
			}
		}
		if (head) {
			const start = this.elements.indexOf(head);
			const end = this.elements.indexOf(foot!);
			this.select(start, end);
		} else {
			this.unselect();
			listData.start = null;
			listData.end = null;
		}
	},

	toggle: function (this: CommandListHost): void {
		const listData = commandListData(this);
		if (listData.start !== null && listData.end !== null) {
			const { elements } = this;
			const start = listData.start;
			const end = listData.end;
			const element = elements[start];
			if (!this.isParentEnabled(element)) {
				return;
			}
			let method = 'disable';
			const commands: CommandData[] = [];
			const append = (element: CommandItemElement) => {
				if (rowOf(element).dataKey && rowOf(element).command) {
					const command = rowOf(element).command;
					const enabled = command.id[0] !== '!';
					switch (method) {
						case 'disable':
							if (!enabled) {
								method = 'enable';
								commands.length = 0;
							}
							arrayAppend(commands, command);
							break;
						case 'enable':
							if (!enabled) {
								arrayAppend(commands, command);
							}
							break;
					}
					if (command.folded) {
						for (const object of command.buffer!) {
							if (!Array.isArray(object)) continue;
							for (const child of object) {
								if (!child.buffer) continue;
								for (const element of child.buffer) {
									if (element instanceof HTMLElement) {
										append(element as CommandItemElement);
									}
								}
							}
						}
					}
				}
			};
			for (let i = start; i <= end; i++) {
				append(elements[i]);
			}
			if (commands.length !== 0) {
				this.history.save({
					type: 'toggle',
					parent: rowOf(element).parent,
					method: method,
					commands: commands
				});
				switch (method) {
					case 'enable':
						this.enableItems(commands);
						break;
					case 'disable':
						this.disableItems(commands);
						break;
				}
				this.update();
				if (!listData.focusing) {
					listData.focusing = true;
				}
				this.select(listData.start);
				this.scrollToSelection('alter');
				dispatchChangeEvent(this);
			}
		}
	},

	enableItems: function (this: CommandListHost, commands: CommandData[]): void {
		commandCore.enableItems(commands);
	},

	disableItems: function (this: CommandListHost, commands: CommandData[]): void {
		commandCore.disableItems(commands);
	},

	copy: function (this: CommandListHost): void {
		const listData = commandListData(this);
		const clipboard = this.__options.clipboard;
		if (!clipboard) return;
		if (listData.start !== null && listData.end !== null) {
			const elements = this.elements;
			const sElement = elements[listData.start];
			const eElement = elements[listData.end];
			const list = rowOf(sElement).list;
			const start = sElement.dataIndex;
			const end = eElement.dataIndex + 1;
			const copies = list.slice(start, end);
			if (copies.length > 0) {
				clipboard.write('yami.commands', copies);
			}
		}
	},

	copyAsText: function (this: CommandListHost): void {
		const listData = commandListData(this);
		const options = this.__options;
		if (listData.start !== null && listData.end !== null) {
			let string = '';
			let lastIndent;
			const { elements } = this;
			const start = listData.start;
			const end = listData.end;
			for (let i = start; i <= end; i++) {
				const element = elements[i];
				if (element.contents !== null) {
					this.updateCommandElement(element);
				}
				let indent = rowOf(element).indent;
				if (rowOf(element).command === null && lastIndent === indent) {
					if (options.settingConfig?.config.other.copyAsTextKeepEmptyLine) string += '\n';
					continue;
				}
				lastIndent = indent;
				while (indent-- > 0) string += '　　';
				for (const node of element.children) {
					if (hasClass(node, 'command-fold')) {
						continue;
					}
					if (hasClass(node, 'transparent')) {
						string += ''.padStart(
							node.textContent.length,
							options.localize?.get('command.blankCommandChar') ?? ''
						);
					} else if (hasClass(node, 'comment')) {
						string += '#' + node.textContent;
					} else {
						string += node.textContent;
					}
				}
				string += '\n';
			}
			void navigator.clipboard.writeText(string.trim());
		}
	},

	copyAsJSCode: function (this: CommandListHost): void {
		const listData = commandListData(this);
		if (listData.start !== null && listData.end !== null) {
			const { elements } = this;
			const start = listData.start;
			const end = listData.end;
			const commands = [];

			for (let i = start; i <= end; i++) {
				const element = elements[i];
				if (element.contents !== null) {
					this.updateCommandElement(element);
				}

				const dataItem = rowOf(element).command;
				if (dataItem === null) continue;

				const command = {
					id: dataItem.id,
					params: dataItem.params
				};

				if (dataItem.commands) {
					(command as { commands?: CommandData[] }).commands = dataItem.commands;
				}

				commands.push(command);
			}

			let jsCode = this.generateExecutableCode(commands);
			void navigator.clipboard.writeText(jsCode);
		}
	},

	generateExecutableCode: function (this: CommandListHost, commands: CommandData[]): string {
		return commandCore.generateExecutableCode(commands);
	},

	paste: function (this: CommandListHost): void {
		const listData = commandListData(this);
		const clipboard = this.__options.clipboard;
		if (!clipboard) return;
		if (listData.start !== null) {
			const elements = this.elements;
			const element = elements[listData.start];
			if (!this.isParentEnabled(element)) {
				return;
			}
			const copies = clipboard.read('yami.commands');
			if (copies) {
				const parent = rowOf(element).parent;
				const list = rowOf(element).list;
				const start = element.dataIndex;
				const count = elements.count;
				this.history.save({
					type: 'insert',
					parent: parent,
					array: list,
					index: start,
					commands: copies
				});
				list.splice(start, 0, ...copies);
				this.update();
				this.select(listData.start + elements.count - count);
				this.scrollToSelection('alter');
				dispatchChangeEvent(this);
			}
		}
	},

	delete: function (this: CommandListHost): void {
		const listData = commandListData(this);
		if (listData.start !== null && listData.end !== null) {
			const elements = this.elements;
			const sElement = elements[listData.start];
			const eElement = elements[listData.end];
			const parent = rowOf(sElement).parent;
			const list = rowOf(sElement).list;
			const start = sElement.dataIndex;
			const end = eElement.dataIndex + 1;
			const commands = list.slice(start, end);
			if (commands.length > 0) {
				this.history.save({
					type: 'delete',
					parent: parent,
					array: list,
					index: start,
					commands: commands
				});
				list.splice(start, end - start);
				this.update();
				if (!listData.focusing) {
					listData.focusing = true;
				}
				this.select(listData.start);
				this.scrollToSelection('alter');
				dispatchChangeEvent(this);
			}
		}
	},

	undo: function (this: CommandListHost): void {
		const listData = commandListData(this);
		if (!listData.dragging && this.history.canUndo()) {
			this.history.restore('undo');
		}
	},

	redo: function (this: CommandListHost): void {
		const listData = commandListData(this);
		if (!listData.dragging && this.history.canRedo()) {
			this.history.restore('redo');
		}
	},

	save: function (this: CommandListHost, command: CommandData): void {
		const listData = commandListData(this);
		if (listData.start !== null) {
			const elements = this.elements;
			const element = elements[listData.start];
			const parent = rowOf(element).parent;
			const list = rowOf(element).list;
			const index = element.dataIndex;
			switch (listData.inserting) {
				case true:
					this.history.save({
						type: 'insert',
						parent: parent,
						array: list,
						index: index,
						commands: [command]
					});
					listData.end = listData.start;
					list.splice(index, 0, command);
					this.update();
					this.selectDown();
					break;
				case false:
					this.history.save({
						type: 'replace',
						parent: parent,
						array: list,
						index: index,
						commands: [list[index], command]
					});
					list[index] = command;
					this.update();
					this.select(listData.start);
					break;
			}
			this.scrollToSelection('alter');
			dispatchChangeEvent(this);
		}
	},

	getSelectionPosition: function (this: CommandListHost): { x: number; y: number } | null {
		const listData = commandListData(this);
		if (listData.start === null) {
			return null;
		}
		const elements = this.elements as CommandItemElement[];
		const element = elements[listData.start];
		if (!element.parentNode) {
			return null;
		}
		let x = rect(element.childNodes[0]).left;
		let y = rect(element).top;
		if (hasClass(document.body, 'border')) {
			const dpx = 1 / window.devicePixelRatio;
			x -= dpx;
			y -= dpx;
		}
		return { x, y };
	},

	clearElements: function (this: CommandListHost, start: number): void {
		commonListClearElements(this, start);
	},

	clear: function (this: CommandListHost): HTMLElement {
		const listData = commandListData(this);
		this.unselect();
		this.data = null;
		this.varList = null;
		this.varMap = null;
		listData.start = null;
		listData.end = null;
		listData.origin = null;
		listData.active = null;
		listData.anchor = null;
		commonListClearElements(this, 0);
		this.elements.count = 0;
		this.elements.start = -1;
		this.elements.end = -1;
		this.updateHeadAndFoot();
		rebuildCommandRowData(this.elements);
		rebuildCommandRowModel(this, { padded: getListConfig(this).padded === true });
		dispatchUpdateEvent(this);
		return this;
	},

	analyzeVariables: function (this: CommandListHost): {
		varList: VariableItem[];
		varMap: Record<string, VariableItem>;
	} {
		const options = this.__options;
		const data = this.read();
		function checkLeftValue(
			variable: VariableItem,
			varMap: Record<string, VariableItem>,
			varList: VariableItem[],
			flags: Record<string, boolean>
		): void {
			const { name, type } = variable;
			if (flags[name]) {
				let varItem = varMap[name + type];
				if (varItem === undefined) {
					if (type !== 'any') {
						varItem = varMap[name + 'any'];
						if (varItem) varItem.type = type;
					} else {
						varItem =
							varMap[name + 'boolean'] ??
							varMap[name + 'number'] ??
							varMap[name + 'string'] ??
							varMap[name + 'object'];
					}
				}
				if (varItem) varItem.refCount++;
			} else {
				flags[name] = true;
				varMap[name + type] = variable;
				varList.push(variable);
			}
		}

		function checkOperator(
			variable: VariableItem,
			varMap: Record<string, VariableItem>,
			varList: VariableItem[],
			flags: Record<string, boolean>
		): void {
			const { name, type } = variable;
			if (flags[name]) {
				const varItem =
					type !== 'any'
						? (varMap[name + type] ?? varMap[name + 'any'])
						: (varMap[name + type] ??
							varMap[name + 'boolean'] ??
							varMap[name + 'number'] ??
							varMap[name + 'string'] ??
							varMap[name + 'object']);
				if (varItem) varItem.refCount++;
			} else {
				flags[name] = true;
				varMap[name + type] = variable;
				varList.push(variable);
				variable.class = 'error';
				variable.refCount++;
			}
		}

		const varMap: Record<string, VariableItem> = {};
		const varList: (VariableItem & { icon?: string })[] = [];
		const leftValues: VariableItem[] = [];
		const operators: VariableItem[] = [];
		const flags: Record<string, boolean> = { '': true };

		for (const variable of options.command?.fetchVariables(data!) ?? []) {
			(variable.isLeftValue ? leftValues : operators).push(variable);
		}

		for (const variable of leftValues) {
			checkLeftValue(variable, varMap, varList, flags);
		}

		for (const variable of operators) {
			checkOperator(variable, varMap, varList, flags);
		}

		for (const variable of varList) {
			variable.icon = `icon-${variable.type}`;
		}

		const orders: Record<string, number> = {
			boolean: 0,
			number: 1,
			string: 2,
			object: 3,
			any: 4
		};
		varList.sort((a, b) => {
			if (a.evIndex !== b.evIndex) {
				return a.evIndex! - b.evIndex!;
			}
			if (a.type !== b.type) {
				return orders[a.type] - orders[b.type];
			}
			return a.name.localeCompare(b.name);
		});
		this.varList = varList;
		this.varMap = varMap;
		return { varList, varMap };
	},

	scheduleCheckVariables: function (this: CommandListHost): void {
		if (this._checkVariablesScheduled) return;
		this._checkVariablesScheduled = true;
		requestAnimationFrame(() => {
			this._checkVariablesScheduled = false;
			this.checkVariables();
		});
	},

	checkVariables: function (this: CommandListHost): void {
		const options = this.__options as CommandListApiOptions;
		const varMap = this.varMap as Record<string, VariableItem>;
		const varTypes = ['boolean', 'number', 'string', 'object', 'any'];
		for (const text of this.getElementsByClassName(
			'local-variable-identifier'
		) as HTMLCollectionOf<HTMLElement & { [k: string]: unknown }>) {
			const type = text.varType as string;
			const key = text.varKey as string;
			if (!key) continue;
			let varItem;
			if (type !== 'any') {
				varItem = varMap[key + type] ?? varMap[key + 'any'];
			} else {
				for (const varType of varTypes) {
					if ((varItem = varMap[key + varType])) {
						if (text.currentType !== varType) {
							removeClass(text, (text.currentType as string) + '-type');
							text.currentType = varType;
							addClass(text, varType + '-type');
						}
						break;
					}
				}
			}
			if (varItem ? varItem.isLeftValue && varItem.refCount === 0 : false) {
				addClass(text, 'no-ref');
			} else {
				removeClass(text, 'no-ref');
			}
			if (varItem ? varItem.class !== 'error' : false) {
				removeClass(text, 'invalid');
			} else {
				addClass(text, 'invalid');
			}
		}

		const lookup = options.dataLookup;
		for (const text of this.getElementsByClassName(
			'global-variable-identifier'
		) as HTMLCollectionOf<HTMLElement & { [k: string]: unknown }>) {
			const key = text.varKey as string;
			if (key === '') continue;
			const variable = options.getVariable ? options.getVariable(key) : null;
			if (variable) {
				removeClass(text, 'invalid');
			} else {
				addClass(text, 'invalid');
			}
			const varName = variable
				? variable.name
				: (options.command?.parseUnlinkedId(key) ?? key);
			if (text.textContent !== varName) {
				text.textContent = varName;
			}
		}

		for (const text of this.getElementsByClassName('attribute-identifier') as HTMLCollectionOf<
			HTMLElement & { [k: string]: unknown }
		>) {
			const id = text.varId as string;
			const attr = lookup?.attribute(id);
			if (attr) {
				removeClass(text, 'invalid');
			} else {
				addClass(text, 'invalid');
			}
			const attrName = commandCore.compress(
				attr
					? (lookup?.gameLocalReplace(attr.name) ?? attr.name)
					: (options.command?.parseUnlinkedId(id) ?? id)
			);
			if (text.textContent !== attrName) {
				text.textContent = attrName;
			}
		}

		for (const text of this.getElementsByClassName('enum-identifier') as HTMLCollectionOf<
			HTMLElement & { [k: string]: unknown }
		>) {
			const id = text.varId as string;
			const string = lookup?.enumString(id);
			if (string) {
				removeClass(text, 'invalid');
			} else {
				addClass(text, 'invalid');
			}
			const stringName = string
				? (lookup?.gameLocalReplace(string.name) ?? string.name)
				: (options.command?.parseUnlinkedId(id) ?? id);
			if (text.textContent !== stringName) {
				text.textContent = stringName;
			}
		}

		for (const text of this.getElementsByClassName('file-identifier') as HTMLCollectionOf<
			HTMLElement & { [k: string]: unknown }
		>) {
			const fileId = text.varKey as string;
			if (fileId === '') continue;
			const guidMap =
				typeof lookup?.guidMap === 'function' ? lookup.guidMap() : (lookup?.guidMap ?? {});
			const meta = guidMap[fileId] as { file: { basename: string } } | undefined;
			if (meta) {
				removeClass(text, 'invalid');
			} else {
				addClass(text, 'invalid');
			}
			const fileName = meta
				? meta.file.basename
				: (options.command?.parseUnlinkedId(fileId) ?? fileId);
			if (text.textContent !== fileName) {
				text.textContent = fileName;
			}
		}

		for (const text of this.getElementsByClassName('scene-identifier') as HTMLCollectionOf<
			HTMLElement & { [k: string]: unknown }
		>) {
			const presetId = text.varKey as string;
			if (presetId === '') continue;
			const scenePresets =
				typeof lookup?.scenePresets === 'function'
					? lookup.scenePresets()
					: (lookup?.scenePresets ?? {});
			const preset = scenePresets[presetId];
			if (preset) {
				removeClass(text, 'invalid');
			} else {
				addClass(text, 'invalid');
			}
		}

		for (const text of this.getElementsByClassName('ui-identifier') as HTMLCollectionOf<
			HTMLElement & { [k: string]: unknown }
		>) {
			const presetId = text.varKey as string;
			if (presetId === '') continue;
			const uiPresets =
				typeof lookup?.uiPresets === 'function'
					? lookup.uiPresets()
					: (lookup?.uiPresets ?? {});
			const preset = uiPresets[presetId];
			if (preset) {
				removeClass(text, 'invalid');
			} else {
				addClass(text, 'invalid');
			}
		}
	},

	tryGetEventId: function (
		this: CommandListHost,
		data: CommandData | null | undefined
	): string | undefined {
		return commandCore.tryGetEventId(data);
	},

	listFocus: function (this: CommandListHost, _event: FocusEvent): void {
		const listData = commandListData(this);
		if (!listData.focusing) {
			listData.focusing = true;
			if (listData.start !== null) this.reselect();
			else this.select(0);
		}
	},

	listBlur: function (this: CommandListHost, _event: FocusEvent): void {
		const listData = commandListData(this);
		if (listData.dragging) {
			this.windowPointerup(listData.dragging);
		}
		if (listData.focusing) {
			let node: Node | null = this.parentNode;
			while (node !== null) {
				if (node.nodeType === Node.ELEMENT_NODE) {
					const frame = node as HTMLElement;
					if (frame.classList.contains('window-frame')) {
						if (hasClass(frame, 'blur')) {
							return;
						} else {
							break;
						}
					}
				}
				node = node.parentNode;
			}
			listData.focusing = false;
			this.unselect();
		}
	},

	findString: function (
		this: CommandListHost,
		str: string | RegExp,
		elements: CommandItemElement[],
		searchMode: FindSearchMode = { caseInsensitive: false, regex: false, matchLine: false }
	): FindResult[] {
		if (searchMode.regex) {
			const parsed = commandCore.parseSearchRegExp(str as string);
			if (parsed !== null) {
				str = parsed;
			}
		}
		const findList: FindResult[] = [];
		for (let i = 0; i < elements.length; i++) {
			const element = elements[i];
			if (!element) continue;
			if (searchMode.matchLine) {
				if (hasClass(element, 'command-fold') || hasClass(element, 'command-container')) {
					continue;
				}
				if (searchMode.regex && str instanceof RegExp) {
					if (str.test(element.textContent ?? ''))
						findList.push({
							node: element,
							index: i,
							sub: element
						});
				} else if (
					searchMode.caseInsensitive &&
					element.textContent!.toLowerCase().includes((str as string).toLowerCase())
				)
					findList.push({
						node: element,
						index: i,
						sub: null
					});
				else if (element.textContent!.includes(str as string))
					findList.push({
						node: element,
						index: i,
						sub: null
					});
				continue;
			}
			if (element?.dataItem && rowOf(element).command.folded) {
				const { buffer } = rowOf(element).command;
				if (!buffer) continue;
				for (const item of buffer) {
					if (item instanceof Array) {
						const realNode = item.map(
							(v: CommandData) => v.buffer![0] as CommandItemElement
						);
						const _subfind = this.findString(str, realNode, searchMode).map(
							(v: FindResult): FindResult => ({
								node: v.node,
								index: v.index,
								sub: element
							})
						);
						findList.push(..._subfind);
					} else if (searchMode.regex && str instanceof RegExp) {
						if (str.test(item.textContent))
							findList.push({
								node: item,
								index: i,
								sub: element
							});
					} else if (
						item.textContent.includes(str as string) ||
						(searchMode.caseInsensitive &&
							item.textContent.toLowerCase().includes((str as string).toLowerCase()))
					) {
						findList.push({ node: item, index: i, sub: element });
					}
				}
			}

			if (element.contents !== null) {
				this.updateCommandElement(element);
			}

			if (element?.children)
				for (const node of element.children) {
					if (hasClass(node, 'command-fold')) {
						continue;
					}
					if (searchMode.regex && str instanceof RegExp) {
						if (str.test(node.textContent ?? ''))
							findList.push({
								node: node as HTMLElement,
								index: i,
								sub: element
							});
					} else if (
						node.textContent!.includes(str as string) ||
						(searchMode.caseInsensitive &&
							node.textContent!.toLowerCase().includes((str as string).toLowerCase()))
					) {
						findList.push({ node: node as HTMLElement, index: i, sub: null });
					}
				}
		}
		return findList;
	},

	scrollToRow: function (
		this: CommandListHost,
		targetIndex: number,
		position: string = 'center'
	): void {
		this.scrollTop = commandRender.computeScrollToRowScrollTop(
			targetIndex,
			this.elements.count,
			this.innerHeight,
			position
		);
		this.resize(this);
	},

	keydown: function (this: CommandListHost, event: KeyboardEvent): void {
		const listData = commandListData(this);
		const options = this.__options;
		if (cmdOrCtrlKey(event)) {
			switch (event.code) {
				case 'KeyF':
					options.searchString?.open(this);
					break;
				case 'KeyX':
					this.copy();
					this.delete();
					break;
				case 'KeyC':
					this.copy();
					break;
				case 'KeyV':
					this.paste();
					break;
				case 'KeyA':
					this.selectAll();
					break;
				case 'KeyZ':
					if (!macRedoKey(event)) {
						this.undo();
						break;
					}
				case 'KeyY':
					this.redo();
					break;
				case 'ArrowUp':
					this.scrollTop -= commandRender.ROW_HEIGHT;
					break;
				case 'ArrowDown':
					this.scrollTop += commandRender.ROW_HEIGHT;
					break;
				case 'Home':
					event.preventDefault();
					this.scroll(0, 0);
					break;
				case 'End':
					event.preventDefault();
					this.scroll(0, this.scrollHeight);
					break;
				case 'PageUp':
					this.pageUp(false);
					break;
				case 'PageDown':
					this.pageDown(false);
					break;
			}
		} else if (event.altKey) {
			return;
		} else if (event.shiftKey) {
			switch (event.code) {
				case 'ArrowUp':
					this.selectMultipleUp();
					break;
				case 'ArrowDown':
					this.selectMultipleDown();
					break;
				case 'Home':
					this.selectMultipleTo(0);
					this.scrollToSelection();
					break;
				case 'End':
					this.selectMultipleTo(Infinity);
					this.scrollToSelection();
					break;
			}
		} else {
			switch (event.code) {
				case 'Space':
					event.preventDefault();
					this.insert();
					return;
				case 'Enter':
				case 'NumpadEnter':
					if (listData.start !== null) {
						event.stopPropagation();
						const sData = rowAt(listData.start)?.command ?? null;
						const eData = rowAt(listData.end)?.command ?? null;
						if (sData === eData) {
							this.edit();
						}
					}
					break;
				case 'Insert':
					this.insert();
					break;
				case 'Slash':
					this.toggle();
					break;
				case 'Backslash':
					this.insert('script');
					break;
				case 'Delete':
					this.delete();
					break;
				case 'ArrowUp':
					event.preventDefault();
					this.selectUp();
					break;
				case 'ArrowDown':
					event.preventDefault();
					this.selectDown();
					break;
				case 'ArrowRight':
					this.fold();
					break;
				case 'Home':
					event.preventDefault();
					this.scroll(0, 0);
					this.select(0);
					break;
				case 'End': {
					event.preventDefault();
					const scrollBottom = this.elements.count * commandRender.ROW_HEIGHT;
					const scrollTop = scrollBottom - this.innerHeight;
					this.scroll(0, Math.max(this.scrollTop, scrollTop));
					this.select(Infinity);
					break;
				}
				case 'PageUp':
					event.preventDefault();
					this.pageUp(true);
					break;
				case 'PageDown':
					event.preventDefault();
					this.pageDown(true);
					break;
				default:
					if (alphabetCode.test(event.code)) {
						this.insert();
						const searcher = options.commandSuggestion?.searcher;
						(typeof searcher === 'function' ? searcher() : searcher)?.input.focus();
					}
					break;
			}
		}
	},

	pointerdown: function (this: CommandListHost, event: ListPointerEvent): void {
		const listData = commandListData(this);
		const options = this.__options;
		if (listData.dragging) {
			return;
		}
		switch (event.button) {
			case 0: {
				let element: CommandItemElement | null = null;
				element = event.target as CommandItemElement | null;
				let row: CommandItemElement | null = null;
				let index = -1;
				if ((element as HTMLElement | null) === this) {
					if (isInContent(element as HTMLElement, event)) {
						index = this.elements.count - 1;
					}
				} else if (hasClass(element, 'command-fold')) {
					this.fold((element as HTMLElement).parentNode as CommandItemElement);
					break;
				} else {
					row = (element as HTMLElement)?.closest?.(
						'.command-item'
					) as CommandItemElement | null;
					if (row && hasClass(row, 'command-item')) {
						index = read(row) as number;
					}
				}
				if (index >= 0) {
					element = this.elements[index] as CommandItemElement;
					if (event.shiftKey && listData.start !== null) {
						this.selectMultipleTo(index);
					} else {
						this.select(index);
						if (event.altKey) {
							const eventId = this.tryGetEventId(element!.dataItem);
							if (eventId) {
								options.eventEditor?.openGlobalEvent(eventId);
								event.preventDefault();
								event.stopImmediatePropagation();
								return;
							}
						}
					}
					listData.dragging = event;
					event.mode = 'select';
					event.itemIndex = index;
					event.itemHeight = row?.clientHeight || commandRender.ROW_HEIGHT;
					window.addEventListener('pointerup', this.windowPointerup);
					window.addEventListener('pointermove', this.windowPointermove);
					this.scrollListener.addScrollListener('vertical', 2, true, () => {
						this.windowPointermove(event.latest!);
					});
				}
				break;
			}
			case 2: {
				let element: CommandItemElement | null = null;
				element = event.target as CommandItemElement | null;
				let index = -1;
				if ((element as HTMLElement | null) === this) {
					if (isInContent(element as HTMLElement, event)) {
						index = this.elements.count - 1;
					}
				} else {
					element = (element as HTMLElement)?.closest?.(
						'.command-item'
					) as CommandItemElement | null;
					if (element && hasClass(element, 'command-item')) {
						index = read(element) as number;
					}
				}
				if (index >= 0) {
					const element = this.elements[index];
					if (!hasClass(element, 'selected')) {
						this.select(index);
					}
				}
				break;
			}
		}
	},

	pointerup: function (this: CommandListHost, event: ListPointerEvent): void {
		const listData = commandListData(this);
		const options = this.__options;
		if (listData.dragging) {
			return;
		}
		switch (event.button) {
			case 2:
				if (
					listData.start !== null &&
					listData.end !== null &&
					document.activeElement === this
				) {
					const elements = this.elements;
					const sElement = elements[listData.start];
					const dElement = elements[listData.end];
					const sData = rowOf(sElement).command;
					const eData = rowOf(dElement).command;
					const valid = !!sData;
					const pEnabled = this.isParentEnabled(sElement);
					const sEnabled = valid ? sData.buffer!.enabled : pEnabled;
					const editable = sEnabled && sData === eData;
					const pastable = pEnabled && !!options.clipboard?.has('yami.commands');
					const allSelectable =
						(this.data as (CommandData & CommandList) | null)!.length > 0;
					const undoable = this.history.canUndo();
					const redoable = this.history.canRedo();
					const get =
						options.localize?.createGetter('menuCommandList') ?? ((key: string) => key);
					const ctrl = options.ctrl ?? ((key: string) => 'Ctrl+' + key);
					const menuItems: unknown[] = [
						{
							label: get('edit'),
							accelerator: 'Enter',
							enabled: editable,
							click: () => {
								this.edit();
							}
						},
						{
							label: get('insert'),
							accelerator: 'Insert',
							enabled: pEnabled,
							click: () => {
								this.insert();
							}
						},
						{
							label: get('toggle'),
							accelerator: '/',
							enabled: pEnabled && valid,
							click: () => {
								this.toggle();
							}
						},
						{
							label: get('script'),
							accelerator: '\\',
							enabled: pEnabled,
							click: () => {
								this.insert('script');
							}
						},
						{
							type: 'separator'
						},
						{
							label: get('cut'),
							accelerator: ctrl('X'),
							enabled: valid,
							click: () => {
								this.copy();
								this.delete();
							}
						},
						{
							label: get('copy'),
							accelerator: ctrl('C'),
							enabled: valid,
							click: () => {
								this.copy();
							}
						},
						{
							label: get('paste'),
							accelerator: ctrl('V'),
							enabled: pastable,
							click: () => {
								this.paste();
							}
						},
						{
							label: get('delete'),
							accelerator: 'Delete',
							enabled: valid,
							click: () => {
								this.delete();
							}
						},
						{
							label: get('selectAll'),
							accelerator: ctrl('A'),
							enabled: allSelectable,
							click: () => {
								this.select(0, Infinity);
							}
						},
						{
							label: get('undo'),
							accelerator: ctrl('Z'),
							enabled: undoable,
							click: () => {
								this.undo();
							}
						},
						{
							label: get('redo'),
							accelerator: ctrl('Y'),
							enabled: redoable,
							click: () => {
								this.redo();
							}
						}
					];
					if (sData === eData) {
						const eventId = this.tryGetEventId(sData);
						if (eventId) {
							menuItems.push({
								label: get('open-event'),
								accelerator: 'Alt+LB',
								click: () => {
									options.eventEditor?.openGlobalEvent(eventId);
								}
							});
						}
					}
					menuItems.push(
						{
							label: get('copy-as-text'),
							enabled: valid,
							click: () => {
								this.copyAsText();
							}
						},
						{
							label: get('copy-as-js'),
							enabled: valid,
							click: () => {
								this.copyAsJSCode();
							}
						},
						{
							label: get('edit-data'),
							enabled: valid,
							click: () => {
								this.openEdit();
							}
						}
					);
					options.menuPopup?.(
						{
							x: event.clientX,
							y: event.clientY
						},
						menuItems
					);
				}
				break;
		}
	},

	doubleclick: function (this: CommandListHost, event: MouseEvent): void {
		const listData = commandListData(this);
		if (
			listData.start !== null &&
			!hasClass(event.target as HTMLElement | null, 'command-fold')
		) {
			const sData = rowAt(listData.start)?.command ?? null;
			const eData = rowAt(listData.end)?.command ?? null;
			if (sData === eData) {
				this.edit(sData);
			}
		}
	},

	windowPointerup: function (this: CommandListHost, event: PointerEvent): void {
		const listData = commandListData(this);
		const dragging = listData.dragging!;
		if (relate(dragging, event)) {
			switch (dragging.mode) {
				case 'select':
					this.scrollListener.removeScrollListener();
					break;
			}
			listData.dragging = null;
			window.removeEventListener('pointerup', this.windowPointerup);
			window.removeEventListener('pointermove', this.windowPointermove);
		}
	},

	windowPointermove: function (this: CommandListHost, event: PointerEvent): void {
		const listData = commandListData(this);
		const dragging = listData.dragging!;
		if (relate(dragging, event)) {
			switch (dragging.mode) {
				case 'select': {
					dragging.latest = event;
					const elements = this.elements;
					const count = elements.count;
					if (count > 0) {
						const pt = this.paddingTop;
						const { itemHeight } = dragging;
						const { y } = getRelativeCoords(event, this);
						const line = Math.floor((y - pt) / itemHeight!);
						const index = clamp(line, 0, count - 1);
						if (dragging.itemIndex !== index) {
							dragging.itemIndex = index;
							this.selectMultipleTo(index);
						}
					}
					break;
				}
			}
		}
	},

	windowVariableChange: function (this: CommandListHost, _event: Event): void {
		if (this.read()) {
			this.scheduleCheckVariables();
		}
	}
};

export function createCommandListApi(
	el: HTMLElement,
	options: CommandListApiOptions = {}
): HTMLElement {
	const list = el as CommandListHost;
	const listData = commandListData(list);
	list.__options = options;

	if (Object.getPrototypeOf(commandListPrototype) !== HTMLElement.prototype) {
		Object.setPrototypeOf(commandListPrototype, HTMLElement.prototype);
	}
	Object.setPrototypeOf(list, commandListPrototype);

	elementDataOf<{ _initialized?: boolean }>(list)._initialized = false;
	list._paddingTop = 0;
	list.data = null;
	list.varList = null;
	list.varMap = null;
	list.elements = Object.assign([], {
		versionId: 0,
		count: 0,
		start: -1,
		end: -1,
		head: null,
		foot: null
	});
	listData.selections = Object.assign([], { count: 0 });
	listData.start = null;
	listData.end = null;
	listData.origin = null;
	listData.active = null;
	listData.anchor = null;
	listData.inserting = false;
	listData.focusing = false;
	listData.dragging = null;
	list._checkVariablesScheduled = false;
	list.windowPointerup = list.windowPointerup.bind(list);
	list.windowPointermove = list.windowPointermove.bind(list);
	list.windowVariableChange = list.windowVariableChange.bind(list);
	list.scrollListener = attachScrollListener(list);
	list.tabIndex = 0;

	Object.defineProperty(list, 'history', {
		configurable: true,
		get() {
			return this.data?.history;
		}
	});
	Object.defineProperty(list, 'paddingTop', {
		configurable: true,
		get() {
			let pt = list._paddingTop;
			if (pt === undefined) {
				pt = list._paddingTop = parseInt(css(list).paddingTop);
			}
			return pt;
		}
	});

	list.addEventListener('scroll', list.resize);
	list.addEventListener('focus', list.listFocus);
	list.addEventListener('blur', list.listBlur);
	list.addEventListener('keydown', list.keydown);
	list.addEventListener('pointerdown', list.pointerdown);
	list.addEventListener('pointerup', list.pointerup);
	attachDoubleclick(list, list.doubleclick);
	window.addEventListener('variablechange', list.windowVariableChange);

	return el;
}

/**
 * 返回类型是 `HTMLElement & CommandListElementApi`。
 *
 * 刻意不留成裸 `HTMLElement`：**"元素上有哪些方法"只有 `CommandListElementApi` 一份定义**，
 * 拼错方法名在编译期就会报错（裸 `HTMLElement` 会让用例里的 `as HTMLElement & { … }` 断言
 * 变得"不可比"，TS2352）。需要额外形状的调用方请用 `as unknown as <形状>` 显式跨越。
 */
export function createCommandListElement(
	options: CommandListApiOptions = {}
): HTMLElement & CommandListElementApi {
	const el = renderDetachedDiv('command-list');
	createCommandListApi(el, options);
	return el as HTMLElement & CommandListElementApi;
}
