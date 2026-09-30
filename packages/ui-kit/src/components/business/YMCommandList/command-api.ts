import { h } from 'vue';
import {
	relate,
	addClass,
	attachDoubleclick,
	clamp,
	cmdOrCtrlKey,
	css,
	dispatchChangeEvent,
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

// 离屏建元素统一走 ui-kit 的 detached 接缝（本文件内不再直接建 DOM 节点）
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
	// 这三份"元信息表"由消费方（编辑器）提供，本文件只用其中很少的字段，
	// 故按 `Record<string, unknown>` 声明，用到的地方在本地显式收窄（见 `checkVariables`）——
	// 不再用 `Record<string, any>` 把整张表变成 `any`。
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

/** 行元素数组（`elements`）的最小形状：够 `rebuildCommandRowData` / `rebuildCommandRowModel` 用 */
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
	/** 派生层发的稳定行 key（模板 `v-for` 直接当 `:key`） */
	rowKey?: string;
	/** 行下标（`update()` 里统一写过；`rowOf()` 用它取行数据） */
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

/** 一行数据（换源后由回写桥在挂行时挂到元素上） */
export interface CommandRowAttachData {
	rowKey: string;
	command: CommandData | null;
	list: CommandList;
	index: number;
	indent: number;
	dataKey: boolean;
	parent?: CommandData | null;
	/** 行内容片段；**显式传 `null` 与"不传"不同**（`null` 表示"已清空"，不传表示"暂无内容"） */
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
	// 不传 ⇒ 空数组（"暂无内容"）；显式传 null ⇒ 保持 null（"已清空"，与建行代码的清空语义一致）
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
		// 具名类型 `VariableTextElement` 就是两边共用的那一个 ⇒ 不需要任何断言。
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

/**
 * 命令列表的**元素 API 契约**。此前消费方只能拿 `HTMLElement` 再自己写 `as HTMLElement & { … }`
 * （editor 侧就有一份 `EventCommandListShape`）；这里把「元素上有哪些方法」定成可 import 的类型。
 *
 * 说明：`commandListPrototype` 本体是 `Record<string, (this: CommandListHost, ...args) => unknown>`
 * （不再用 `any` 描述形状），本接口是对**同一个对象**的静态描述——
 * 消费方用 `HTMLElement & CommandListElementApi` 即可获得补全与拼写检查。
 */
export interface CommandListElementApi {
	// —— 消费方实际使用的方法（精确签名）——
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
	// —— 其余内部/较少使用的方法（保留松散签名，保证既有调用点不因类型化而报错）——
	[k: string]: unknown;
}

/**
 * `elements` 的形状——行元素数组本体，另挂 `count/start/end` 窗口游标
 * （与 `createCommandListApi` 的装配一一对应；这些字段原先只能经 `any` 访问）。
 */
interface CommandListElements extends Array<CommandItemElement> {
	versionId: number;
	count: number;
	start: number;
	end: number;
	/** 首/末行（`commonList*` 助手拿它撑滚动高度） */
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
/**
 * 变量标识文本元素：`varSpace`/`varType`/`varKey` 由 `updateCommandElement` 用
 * `Object.defineProperty` 装成 getter，`textPointerenter` 读它们来高亮。
 *
 * 这个具名类型是**读点与注册点共用**的那一个（第 84 轮记的教训）：
 * - 读点 `textPointerenter` 用它当 `this` 注解 ⇒ 不必再断言形状；
 * - 注册点 `text.onpointerenter = () => … .call(text)` 里的 `text` 也用它 ⇒ 两边一致。
 * 之前两端各写一半（读点断言、注册点用 `HTMLDivElement & { [k: string]: unknown }`），
 * 于是「收紧任一端」都会把另一端弄红。
 */
interface VariableTextElement extends HTMLDivElement {
	[k: string]: unknown;
	varSpace: string;
	varType: string;
	varKey: string;
}

interface CommandListHost extends HTMLElement {
	// —— 装配期字段（`createCommandListApi` 逐个挂上）——
	/** 元素 API 选项（装配时写入，之后只读） */
	__options: CommandListApiOptions;
	/**
	 * 命令列表数据。公开契约 `write(data: CommandData)` 与实际用法不一致（内部按**命令行数组**用：
	 * `createItems` 逐行遍历、`data.length`），这里取公开契约那一侧——与 `read()` 原有的
	 * `as CommandData | null` 是同一取舍；两处按数组用的站点各自显式断言（见 `update`/`pointerup`）。
	 */
	data: CommandData | null;
	/** 行元素数组（装配时赋成同一数组，另挂窗口游标；见 `CommandListElements`） */
	elements: CommandListElements;
	/**
	 * 行元素「重新物化」钩子（原型上的 `updateOnResize` 提供）。
	 * 共享助手 `commonListResize`（`utils/common-list.ts`）会调用它，所以宿主契约里必须声明 ——
	 * 之前漏了它，于是每次把 `this` 交给共享助手都得写一次 `as unknown as CommonListLike`。
	 */
	updateOnResize(element: HTMLElement): void;
	/** 变量表（`analyzeVariables` 写、`clear` 清空） */
	varList: VariableItem[] | null;
	/** 变量索引（同上） */
	varMap: Record<string, VariableItem> | null;
	/** 撤销栈：元素上的 `history` 是 getter，代理到 `data.history` */
	history: CommandHistory;
	/** 元素上的可视高度（由上层装配）——不是 `HTMLElement` 成员 */
	innerHeight: number;
	/** 内容区 `padding-top` 的惰性缓存（`paddingTop` getter 读它） */
	_paddingTop?: number;
	/** `paddingTop` getter 暴露出来的值 */
	paddingTop: number;
	/** `scheduleCheckVariables` 的去重标记 */
	_checkVariablesScheduled: boolean;
	/** 拖拽时的自动滚动监听器（`attachScrollListener(list)` 的返回值） */
	scrollListener: ScrollListenerApi;

	// —— 列表读写与选区（内部会互相调用，签名与实现一致）——
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

	// —— 行渲染与数据 ——
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

	// —— 事件处理器 ——
	// 一律写成**函数类型属性**（而不是方法）：`this` 由 DOM 绑成元素本身，方法声明带的隐式 `this`
	// 与 `addEventListener` 期望的 `(this: HTMLElement, ev)` 不兼容（也会被 `unbound-method` 命中）；
	// 函数类型属性没有隐式 `this`，因此可以原样登记/注销（行为不变）。
	/** 对外契约是 `resize()`；实现收 `..._args`（`scrollToRow` 里会多传一个 `this`） */
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

/**
 * 行的**数据模型**——与文件 body 的 `FileBodyRowModel` 同形，
 * 供等价性验证与模板渲染使用。
 *
 * 说明：这里**从 `elements[]` 反读**（`key` 取元素上的 `rowKey`、缩进用 `dataIndent`、
 * 折叠/禁用/选中从类名与字段取），因此它不是"另一份真相"，而是"当前真相的快照"——
 * 用途是让**同一段行序列**逐项可比对（文件 body 的 `FileBodyRowModel` 就是这么做的）。
 */
export interface CommandRowDescriptor {
	key: string;
	index: number;
	indent: number;
	folded: boolean;
	/** 是否为"有数据键"的行（`dataKey`：能承载折叠/选区锚点的行） */
	dataKey: boolean;
	selected: boolean;
	disabled: boolean;
	/**
	 * 行的**内容片段**（`parse` 出来的文本/着色/tooltip 声明，即元素上的 `contents`）。
	 * 换源后模板要照它渲染行内文本，故一并带进模型（与文件 body 的 `name`/`isFolder` 同理）。
	 */
	contents: CommandContent[];
	/** 该行是否需要 `fold` 把手（原由建行代码插入 `<span class="command-fold">`） */
	fold: boolean;
	/** 首行承担的 marginTop（px），用于撑出滚动高度（末行为 0） */
	marginTop: number;
	/** 末行承担的 marginBottom（px）（首行为 0） */
	marginBottom: number;
}

export interface CommandRowModel {
	start: number;
	end: number;
	keys: string[];
	rows: CommandRowDescriptor[];
}

const commandRowModel: CommandRowModel = { start: 0, end: 0, keys: [], rows: [] };

/**
 * 与 `elements[]` **同序同长**的行数据。
 *
 * 为什么要有它：命令列表的逻辑层（选区/折叠/导航/插入）目前通过**元素上的 getter** 读数据
 * （`element.dataItem`/`dataIndent`/`dataKey`/`dataList`/`dataParent`，全文件 50+ 处）。
 * 换源之后（行元素改由模板渲染、异步挂载），"元素"不再是可靠的数据来源，因此先把数据抽出来，
 * 由 `rowOf(element)` 按 `element.dataValue`（= 行下标，`update()` 里统一写过）取。
 *
 * 本步**不改行为**：`rowData[i]` 就是同一批元素的同一批字段；取不到时回退到元素本身。
 */
export interface CommandRowData {
	/**
	 * 行对应的命令。类型与元素 getter `dataItem` 保持一致（非空断言）——空白行运行时确实是 `null`，
	 * 但既有读取方本来就依赖这条断言，本次数据化**不改语义**（否则要连带改 6 处判空，属另一件事）。
	 */
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

/**
 * 行元素数组的**宽松视图**：各调用点传进来的都是 api 侧的离屏元素（形状相同，但
 * `refreshRowsAfterSelection` 之类只声明到 `{ count } & Record<number, unknown>`）。
 * 逐项取用时在函数内收窄成行元素视图。
 */
interface CommandElementsView {
	count: number;
	start?: number;
	end?: number;
	[i: number]: unknown;
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
	// 选中态取**选区窗口**（`CommandListData.start/end`，含首尾），不是 `elements.start/end`——
	// 后者是虚拟滚动窗口，拿它当选中范围会把"当前可见的行"整段标成选中：点一行却选中多行。
	const selection = commandListData(list);
	const hasSelection = selection.start !== null && selection.end !== null;
	// 几何与 `commonListUpdateHeadAndFoot` 一致：首行 marginTop、末行 marginBottom 撑出滚动高度
	const marginTop = count === 0 ? 0 : start * commandRender.ROW_HEIGHT;
	const marginBottom = count === 0 ? 0 : (count - end + pad) * commandRender.ROW_HEIGHT;
	for (let i = 0; i < count; i++) {
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
			// 换源后行的"选中"不再看元素类名（元素归模板），改由选区区间决定
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

/**
 * 命令列表自身的可变状态（选区窗口、拖拽、焦点、插入态）从"元素上的原型访问器"改成**显式元素数据**。
 *
 * 选区窗口的五个字段（`start`/`end`/`origin`/`active`/`anchor`）是**整组**写入的：`select()` 一次写全，
 * `clear()` 与 `reselectAfterFolding()` 一次清空 ⇒ `start !== null` 时 `end`/`origin`/`active` 必为数字
 * （原型访问器天生无类型，原实现正是靠这一点隐式成立）。需要数字的站点因此要么在守卫里一并判空，
 * 要么落在"刚调用过 `select()`"之后。
 */
interface CommandListData {
	/** 拖拽中的指针事件（`pointerdown` 登记、`windowPointerup` 清空） */
	dragging: ListPointerEvent | null;
	start: number | null;
	end: number | null;
	/** 选中行数组；`count` 是数组自身的 own 属性，不是元素数据 */
	selections: CommandSelections;
	origin: number | null;
	active: number | null;
	anchor: number | null;
	inserting: boolean;
	focusing: boolean;
}

/** 选中行数组（`unselect`/`reselect` 按下标填 `undefined`，故元素可空） */
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

/**
 * 原型对象本体：`this` 一律是 `CommandListHost`（见该接口）。
 *
 * 这里的 `Record` 形状原为 `(...args: any[]) => any`（自带一句 `no-explicit-any` 豁免）。
 * 换成 `this: CommandListHost, ...args: never[], => unknown` 后**不再需要 `any`**：
 * 参数位是 `never`（对 `Record` 的属性签名而言，参数反向可比 ⇒ 任何实参签名都收得住），
 * 返回位是 `unknown`（任何返回值都收得住）——形状的宽松度不变，只是不再有 `any`。
 * 与同包 `YMTreeList/tree-api.ts` 的 `treeListPrototype` 写法一致。
 */
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
		// **不再 `this.textContent = ''`**——行元素归模板（Vue）管，api 清空会破坏 Vue 的节点表
		this.update();
		if (!data.history) {
			// `commandHistory` 在对外契约里的构造签名是 `new (list: never)`（"收任何类"的占位，
			// 于是无法直接 `new`）。这里只做一次显式转写——按运行期实情：它就是"拿命令列表元素去构造"。
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

		// `data` 的公开契约是 `CommandData`（`write`），运行期实为**命令行数组**（`createItems` 逐行遍历）；
		// 这两个按数组用的站点各自显式转写一次，行为不变（见 `CommandListHost.data` 的说明）。
		this.createItems((this.data as (CommandData & CommandList) | null)!, 0);

		const { count } = elements;
		for (let i = 0; i < count; i++) {
			rowElementData(elements[i]).dataValue = i;
		}

		// 跨到助手契约的形状 —— 现在**连断言都不需要**：`CommonListHost` 补齐了
		// `updateOnResize` 声明，`CommonListLike.textContent` 也改回 DOM 的 `string | null`。
		commonListClearElements(this, elements.count);

		// 重建行数据与行模型快照
		rebuildCommandRowData(elements);
		rebuildCommandRowModel(this, { padded: getListConfig(this).padded === true });

		// 事件在**模型重建之后**派发（模板要读到最新模型）。
		// 顺序很要紧：上层（editor 的 eslints）在 `update` 监听里计算 `mark`，
		// 而它的 `resize` 覆写要靠这些 mark 做折线分类 ⇒ 必须 **先派发、后 resize**。
		dispatchUpdateEvent(this);

		this.resize();
	},

	/** 读取行模型（只读副本） */
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

	/**
	 * 模板挂出一行后的**回写桥**——把该行的数据挂到元素上（`attachRowData`）、
	 * 补上 `fold` 把手，再交给既有的 `updateCommandElement` 生成行内内容。
	 * 编辑器侧对 `updateCommandElement` 的覆写（`eslints` 的缩进线与标记）因此照旧生效。
	 */
	bindRowElement: function (this: CommandListHost, element: HTMLElement, index: number): void {
		const node = element as CommandItemElement;
		// **先记行下标**：`rowOf`（选区/双击编辑）、editor 的活动行定位都靠它；
		// 行数据暂时缺失（例如列表刚被 clear、模型还没重建）时也不能让整行"没有下标"——
		// 那会让 `getSelectionPosition()` 返回 null，表现为**双击指令毫无反应**。
		rowElementData(node).dataValue = index;
		const source = this.elements[index] as CommandItemElement | undefined;
		const row = rowData[index];
		if (source === undefined || row === undefined) return;
		// 行数据**每次都要刷**（`update` / `scroll` 都会走到这里，行内的 getter 必须指向最新数据）
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
			// ⚠️ 必须**对称地清掉**：行元素会被 Vue 复用，而 `fold` 把手是挂在元素上的
			// expando（下面的行内清理还刻意保留了 `.command-fold` 子节点）。
			// 只加不减 ⇒ 一个"曾经可折叠"的行元素被复用到**不可折叠**的行（例如列表末尾
			// 那行"插入指令"的空白行）时，仍带着 `fold`，`updateCommandElementFold` 便会
			// 去取这条空白行根本不存在的 `command` —— 就是那次
			// `reading 'folded'` 崩溃的来源之一（2026-09-18）。
			node.fold.remove();
			node.fold = undefined;
		}
		// 行内 DOM 已经与内容一致 ⇒ **不重建**。这一步同时保住了行内文本节点的身份
		// （双击靠 `event.target === last.target` 判定，重建会让它失配，见 `rowRenderSignatureOf`）。
		const signature = rowRenderSignatureOf(source, row, index);
		const elData = rowElementData(node);
		if (elData.renderedSignature === signature) return;
		elData.renderedSignature = signature;
		// **先清干净再重建**：`updateCommandElement` 是"追加"语义（往元素里 append 标记与文本），
		// 而回写桥会在挂载、刷新、`:ref` 多处被调用 ⇒ 不清就会把行内文本叠成多份（实测 2 份）。
		// 旧实现只在 `element.changed` 时调用一次，所以没有这个问题。`fold` 把手保留（上面按需补）。
		for (const child of Array.from(node.children)) {
			if (!child.classList.contains('command-fold')) child.remove();
		}
		this.updateCommandElement(node);
	},

	/**
	 * **扩展点**——模板挂完一批行之后调用，供上层（如 editor 的 eslints）对
	 * "渲染出来的行"做跨行处理（折叠线的 line-start/line-end 分类）。
	 * 基础实现为空；editor 侧覆盖它（与 `updateCommandElement` 同一套手法）。
	 */
	updateLineClasses: function (): void {},

	resize: function (this: CommandListHost, ..._args: unknown[]): void {
		// **不再调用 `commonListResize`**——它负责的"把行挂进根元素"
		// 现在归模板（`v-for`）。api 只算可见窗口并更新行模型；几何仍与原实现一致
		// （行高 20、窗口起点 = floor(scrollTop/20)、窗口长度 = ceil(clientHeight/20)+1）。
		const els = this.elements;
		const ch = this.clientHeight;
		const count = els.count;
		if (ch === 0) return;
		if (count === 0) {
			els.start = 0;
			els.end = 0;
			rebuildCommandRowModel(this, { padded: getListConfig(this).padded === true });
			this.scheduleCheckVariables();
			return;
		}
		const st = this.scrollTop;
		const start = Math.min(Math.floor(st / commandRender.ROW_HEIGHT), count - 1);
		const end = Math.min(start + Math.ceil(ch / commandRender.ROW_HEIGHT) + 1, count);
		if (els.start !== start || els.end !== end) {
			els.start = start;
			els.end = end;
			rebuildCommandRowModel(this, { padded: getListConfig(this).padded === true });
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
				// `buffer[0]` 上面已按行元素读过（`.dataItem`），这里与那处同一取舍
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
			// contents 为 null 说明已渲染过但 DOM 可能已被 clear 清空（窗口关闭重开等场景），强制重建避免复用后文本缺失
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
			// 行 key 由派生层发号（同一 command 跨多次渲染稳定 ⇒ 模板 `v-for` 可直接当 `:key`）
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
					// **break 行也要稳定 key**（`parse` 用 `break` 把一条命令拆成多行）。
					// 它和主行同属一条命令，故 key = "命令 key + 在本命令内的行序号"，跨多次 update 稳定。
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
						// **子列表前的续行**也要稳定 key（它和主行同属一条命令）
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
						// 脚本占多行时的第 2..n 行同样要有稳定 key
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
				// 注册点与读点共用同一个具名类型 `VariableTextElement`（见其定义处的说明）。
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
					// 改为箭头包装 + `.call` 显式绑定 `this` 到该文本元素——
					// 之前是直接把方法引用挂上去（`this` 由 DOM 绑成元素本身），行为不变，
					// 但不再需要 `unbound-method` 豁免，也不再需要那处 `(… ) => any` 断言。
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
		// `CommandItemElement.contents` 本来就声明成 `CommandContent[] | null`（readers 一律
		// `?? []` 或 `!== null` 判空），这里直接写 null 即可 ——
		// 原先那个 `{ text?… }[] & CommandContent[]` 的双重断言是纯多余的。
		element.contents = null;

		this.updateCommandElementFold(element);
	},

	updateCommandElementFold: function (
		this: CommandListHost,
		element: CommandItemElement | undefined
	): void {
		if (element?.fold) {
			const command = rowOf(element).command;
			// ⚠️ `rowOf().command` 的类型就是 `CommandData | null` —— **null 是合法值**：
			// 空白行（列表末尾那一行"插入指令"）的 `dataItem` 是 `get: () => null`
			// （见 `createBlankElement`），`rebuildCommandRowData` 于是把它记成
			// `command: null`。空白行天然没有"折叠"概念，直接跳过。
			//
			// 原来的 `!!command!.folded` 用 `!` 把这个分支抹掉了，于是在事件编辑器里
			// **插入指令**、列表重建并重绑行时抛
			// `TypeError: Cannot read properties of null (reading 'folded')`；
			// 异常发生在 Vue 的 `:ref` 回写桥里（`setRef`），会让整棵子树的 patch 中断，
			// 紧接着爆出 `Cannot set properties of null (setting '__vnode')` 这类连锁错（2026-09-18）。
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

			// 空白行同样需要**稳定行 key**（`v-for` 的每一行都要 `:key`）。
			// 派生规则与派生层**共用同一个函数**（`commandRender.blankRowKeyOf`），
			// 这样"派生层算出的行"与"api 建出的行"key 必然一致（换源前后靠它逐项比对）。
			// 第一参数是**列表本身**：一条命令可以有多个子列表（`if` 的每个分支一个），
			// 只靠「父命令 + 层级 + 下标」会让等长的兄弟列表撞 key。
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

		// 行元素归模板 ⇒ 选中态由**行模型的 `selected`** 驱动，
		// 选区一变就要刷新模型并通知模板（等价于旧实现里给元素加 `selected` 类）。
		refreshRowsAfterSelection(this);
	},

	selectMultiple: function (this: CommandListHost, active: number): void {
		const listData = commandListData(this);
		const origin = listData.origin;
		// `origin` 是"窗口整组写入"的五个字段之一（见 `CommandListData`）：调用方保证 `select()` 已经写过
		this.select(origin!, active);
		listData.origin = origin;
		// `select()` 刚把窗口整组写成数字（`computeSelectRange` 返回 `[number, number]`），此处必非空
		listData.active = clamp(active, listData.start!, listData.end!);
	},

	selectAll: function (this: CommandListHost): void {
		const listData = commandListData(this);
		this.select(0, Infinity);
		// `select()` 刚写过 `end`，此处必为数字（同上）
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
			// 翻页数学抽到 command-render.ts 的纯函数（行为与原先逐字一致）
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
				// `select()` 刚写过 `start`，此处必为数字
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
				// `select()` 刚写过 `end`，此处必为数字
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
		// 窗口整组写入：`start` 非空时 `end`/`origin`/`active` 必为数字（见 `CommandListData`）
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
		// 窗口整组写入：`start` 非空时 `end`/`origin`/`active` 必为数字（见 `CommandListData`）
		if (
			listData.start !== null &&
			listData.end !== null &&
			listData.origin !== null &&
			listData.active !== null
		) {
			// 三个分支的夹取数学抽到 command-render.ts（行为与原先逐字一致）
			const range = this.getRangeByIndex(listData.active) as [number, number];
			const scrollTop = commandRender.computeScrollToSelection(mode, {
				scrollTop: this.scrollTop,
				viewportHeight: this.innerHeight,
				rowCount: this.elements.count,
				// `anchor` 可为 `null`（未翻页）；消费方声明为 `number`，`null` 数值上等价于 0
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
			// 0..count-1 恒由 `reselect` 填好（元素数组里该下标的行元素必存在，故这里按非空读）
			if (element!.parentNode) {
				if (head === undefined) {
					head = element;
				}
				foot = element;
			}
		}
		if (head) {
			const start = this.elements.indexOf(head);
			// 与上面 `element!` 同理：`head` 有值时 `head`/`foot` 来自同一轮填值
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
		// 同样不再清空 DOM 文本（行归模板管）；行数由 `elements.count` 归零后经模型反映
		this.data = null;
		this.varList = null;
		this.varMap = null;
		listData.start = null;
		listData.end = null;
		listData.origin = null;
		listData.active = null;
		listData.anchor = null;
		// 同上（宿主契约补全后不再需要断言）
		commonListClearElements(this, 0);
		this.elements.count = 0;
		this.elements.start = -1;
		this.elements.end = -1;
		this.updateHeadAndFoot();
		// 行归模板渲染 ⇒ 清空后必须**重建行模型并通知模板**，
		// 否则书里归零了、屏幕上还是旧的那几行（探针实测：clear 后模型与 DOM 都仍是 6 行）。
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
			// `guidMap` 是 `Record<string, unknown>`（消费方自己那份元信息表），
			// 这里只读 `file.basename` ⇒ 在本站点显式收窄；断言的判据与原来 `any` 时一致（表由编辑器同源提供）。
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
			// 从父节点起沿 `parentNode` 往上找 `window-frame`（原来是把 `this` 起个头再逐级上溯，
			// 于是要 `no-this-alias` 豁免）。改成从 `this.parentNode` 起步后语义逐步等价：
			// 只会检查**父链**上的节点（与原来一样，不含 `this` 自身）、非元素节点跳过、
			// 命中 `window-frame` 时 `blur` 直接 return / 否则 break。
			let node: Node | null = this.parentNode;
			while (node !== null) {
				if (node.nodeType === Node.ELEMENT_NODE) {
					// 上面刚判过是元素节点
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
								// 原来是 `{ ...v, sub: element }`（`no-map-spread` 豁免）。
								// `FindResult` 恰好只有这三个字段，显式构造与原展开**逐键等价**
								// （键序也一样：node/index/sub，`sub` 只是被覆盖）。
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
								// `element.children` 给的是 `Element`；命中的都是行内 `<span>`/`<div>`，
								// 运行期就是 HTML 元素——与下面 `node as HTMLElement` 同一处理。
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
		// 下标夹取与居中/贴边数学抽到 command-render.ts（行为与原先逐字一致）
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
				// 屏幕上的那一行（模板渲染的 `.command-item`）：拖动选择要用**它的**行高，
				// 而 `this.elements[index]` 是 api 侧的离屏元素——`clientHeight` 恒为 0，
				// 用它做 `floor(dy / itemHeight)` 会得到 Infinity，鼠标一动就选到列表末尾（"点一行选中多行"）。
				let row: CommandItemElement | null = null;
				let index = -1;
				// `element` 是 `event.target` 的"行元素视图"、`this` 是列表根元素——同一个 DOM 的两副
				// 类型视图，TS 认为"无可比性"；这里按 `HTMLElement` 视图比较（引用相等，语义不变）。
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
				// 同上（`HTMLElement` 视图比较）
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
					// `valid` 已保证 `sData` 非空；`buffer` 在类型上是可选的（运行期读缓冲区前必已建好）
					const sEnabled = valid ? sData.buffer!.enabled : pEnabled;
					const editable = sEnabled && sData === eData;
					const pastable = pEnabled && !!options.clipboard?.has('yami.commands');
					// 同样按运行期实情读命令行数组（见 `CommandListHost.data`），判定语义不变
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
		// 本函数只在拖拽期间挂在 window 上（`pointerdown` 登记、下面摘掉），故此时必有拖拽
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
		// 同上：`windowPointermove` 也只在拖拽期间挂着
		const dragging = listData.dragging!;
		if (relate(dragging, event)) {
			switch (dragging.mode) {
				case 'select': {
					dragging.latest = event;
					const elements = this.elements;
					const count = elements.count;
					if (count > 0) {
						const pt = this.paddingTop;
						// `itemHeight` 与 `mode: 'select'` 在 `pointerdown` 里一起写，故此处必已定义
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
	// 装配期局部变量按**宿主契约**声明（原为 `HTMLElement & { [k: string]: any }`），
	// 下面每个字段赋值、每个事件处理器注册从此都受类型检查。
	const list = el as CommandListHost;
	const listData = commandListData(list);
	list.__options = options;

	if (Object.getPrototypeOf(commandListPrototype) !== HTMLElement.prototype) {
		Object.setPrototypeOf(commandListPrototype, HTMLElement.prototype);
	}
	Object.setPrototypeOf(list, commandListPrototype);

	// the attach guard now lives in element data (helper in element-data.ts)
	elementDataOf<{ _initialized?: boolean }>(list)._initialized = false;
	list._paddingTop = 0;
	list.data = null;
	list.varList = null;
	list.varMap = null;
	// 断言之后紧跟着把断言里声称的字段逐个写上去 ⇒ 用 `Object.assign` 一次写完，零断言（同第 82 轮）。
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
