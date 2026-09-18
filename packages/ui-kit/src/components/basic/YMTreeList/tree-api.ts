import { h, render } from 'vue';
import { attachApi } from '../../../utils/attach-api';
import { type YamiElementApi } from '../../../utils/element-contract';
import { elementDataOf, getElementData } from '../../../utils/element-data';
import { getListConfig } from '../../../utils/list-config';
import {
	hideDragImage,
	clamp,
	addClass,
	removeClass,
	hasClass,
	hide,
	show,
	seek,
	rect,
	hasScrollBar,
	debounce,
	dispatchChangeEvent,
	dispatchUpdateEvent,
	attachDoubleclick
} from '../../../utils/dom';
import { Timer } from '../../../utils/timer';
import { type CommonListLike, commonListUpdateHeadAndFoot } from '../../../utils/common-list';
import {
	createDragAndDropHintElement,
	type DragAndDropHintApi
} from '../../business/YMDragAndDropHint/drag-and-drop-hint-api';
import { createTreeCore, type NodeElement, type TreeItem } from './tree-core';
import {
	createTreeRenderState,
	flattenRows,
	computeWindow,
	setItemClass,
	setItemText,
	isItemRendered,
	bindRowElement,
	rowElementOf,
	stateOfItem,
	ROW_HEIGHT,
	type TreeRenderState
} from './tree-render';

const treeCore = createTreeCore();

/**
 * P4b：树列表自身的可变状态（`keyword` 等）从"元素上的原型访问器"改成**显式元素数据**。
 * 这里给一个类型化视图，避免 `getElementData(el).x` 的 `unknown` 参与运算
 * （P4b 第五刀试过在 `command-api` 直接换写法的负结果：访问器天生无类型，
 * 一旦换成 `unknown` 就要处处收窄；**按字段给出准确类型**才是可做的那条路）。
 */
interface TreeListElementData {
	keyword: RegExp | null;
	/** P4b：重命名用的计时器（`timer` 已从 DATA_FIELDS 摘除） */
	timer: Timer;
	/** P4b：拖拽中的 dragstart 事件；`dragging.target` 是事件目标（行元素），不是元素数据 */
	dragging: TreeListDragEvent | null;
	/** P4b：当前选中项（列表元素自身的元素数据） */
	selections: TreeItem[];
}
const treeData = (el: unknown): TreeListElementData =>
	getElementData(el as HTMLElement) as unknown as TreeListElementData;

/** 行元素（`NodeElement`）上的字段同样走元素数据（P4b：`nodeIcon`/`textNode` 已从 DATA_FIELDS 摘除） */
const rowData = (el: unknown): NodeElement => elementDataOf<NodeElement>(el);

/** P4b：`?.` 兼容视图——null/undefined 时返回 undefined（`elementDataOf` 遇到 null 会抛 WeakMap key 错） */
const rowDataOrUndefined = (el: unknown): NodeElement | undefined =>
	el == null ? undefined : rowData(el);

/**
 * 行点击目标归一：把事件目标收窄成「它所属的行元素」。
 *
 * 步骤 5 的 v-for 行渲染把标签文本包进了 `.node-text`（legacy 是直接 append 到行上的**裸文本节点**，
 * 点文字时 `event.target` 就是行元素本身），于是 `event.target` 不再等于行——按住标签文字点选
 * 带子节点的组件时一直没有反应。
 *
 * 列元素里的按钮（`.tree-node-extras` 下的显隐/锁定图标、重命名输入框）**不**归一：
 * legacy 里它们同样是行内独立元素，点击不应改变选中。
 */
const rowTargetOf = (target: EventTarget | null | undefined): NodeElement | null => {
	const element = target as Element | null | undefined;
	if (element == null || typeof element.closest !== 'function') return null;
	if (element.closest('.tree-node-extras') !== null) return null;
	return (element.closest('.node-item') as NodeElement | null) ?? null;
};

/** 拖拽指示器（`DragAndDropHintApi` 本身就是 HTMLElement）的元素数据：`target` 指向当前命中行 */
const hintData = (el: unknown): { target: HTMLElement | null } =>
	elementDataOf<{ target: HTMLElement | null }>(el);

// 步骤 5：渲染路径唯一（数据派生 + v-for），命令式渲染与开关已删除。
const renderStateOf = (list: TreeListHost | null | undefined): TreeRenderState | undefined =>
	list?.renderState;

/**
 * 消费方 API（步骤 4）：按 item 直接操作行状态，无需触碰 DOM。
 * - setTreeItemClass：行 class（selected/weak/related-event 等）注册到派生层；
 * - setTreeItemText：覆盖行显示文本（不再直写 textNode）；恢复由重派生负责（`clearItemText` 内部态）；
 * - isTreeItemRendered：该行当前是否在虚拟窗口内物化（步骤 5b 后由渲染状态判定）；
 * - treeListOfItem：按 item 反查所属列表（窗口外 item 亦可）。
 */
export interface TreeListRowApi<T = unknown> {
	/** 行总数（全部数据行，与虚拟窗口无关） */
	rowCount(): number;
	/** 第 index 行对应的 item（窗口外同样可取） */
	rowItemAt(index: number): T | undefined;
	/** item 的行号（不在列表内返回 -1） */
	rowIndexOf(item: T): number;
}

export const setTreeItemClass = (item: unknown, className: string, on = true): void => {
	const state = stateOfItem(item as TreeItem);
	if (state !== undefined) setItemClass(state, item as TreeItem, className, on);
};

export const setTreeItemText = (item: unknown, text: string): void => {
	const state = stateOfItem(item as TreeItem);
	if (state !== undefined) setItemText(state, item as TreeItem, text);
};

export const isTreeItemRendered = (item: unknown): boolean => {
	const state = stateOfItem(item as TreeItem);
	if (state === undefined) return false;
	return isItemRendered(state, item as TreeItem);
};

/**
 * 消费方 API（步骤 5b）：取某 item 当前**已物化**的行元素；窗口外 / 未渲染返回 undefined。
 * 取代旧的 `item.element` 桥——需要挂 DOM 的场景（行 tooltip 等）用它。
 */
export const treeRowElement = (item: unknown): HTMLElement | undefined =>
	rowElementOf(item as TreeItem);

/**
 * 消费方 API（步骤 5b）：把**事件目标或行内任意后代节点**归一成它所属行的 item。
 *
 * 它是 `treeRowElement` 的**反向**入口，取代旧的 `element.item` 反向桥：P4b 起 item 只存在
 * 元素数据里（`tree-render.bindRowElement` 写的 `data.item`），DOM 元素上不再挂 expando，
 * 因此 `event.target.item` 一律是 `undefined`（实机表现为 `Cannot read properties of undefined
 * (reading 'class')`）。顺带把 `event.target` 归一成行——行文本在 `.node-text` 里，
 * 点击标签时 target 不是行元素本身。
 *
 * 非行节点返回 `undefined`：`.tree-node-extras` 下的按钮/输入框（显隐、锁定、重命名）不是行内容，
 * 语义与 `doubleclick` 的归一保持一致；不在任何行内（或元素已卸载）同样是 `undefined`。
 */
export const treeItemOf = <T = unknown>(target: unknown): T | undefined => {
	const element = rowTargetOf(target as EventTarget | null);
	if (element === null) return undefined;
	return rowData(element).item as T | undefined;
};

export const treeListOfItem = (item: unknown): unknown => stateOfItem(item as TreeItem)?.owner;

/**
 * 渲染模式无关的行 API（步骤 5b 后只有派生行一条路径）：走 `rowCount/rowItemAt/rowIndexOf`，
 * 覆盖窗口外行；`elements` shim 已删除。
 */
export const treeRowCount = (list: unknown): number => {
	const target = list as { rowCount?: () => number };
	return typeof target.rowCount === 'function' ? target.rowCount() : 0;
};

export const treeRowItemAt = <T>(list: unknown, index: number): T | undefined => {
	const target = list as { rowItemAt?: (i: number) => T | undefined };
	return typeof target.rowItemAt === 'function' ? target.rowItemAt(index) : undefined;
};

export const treeRowIndexOf = (list: unknown, item: unknown): number => {
	const target = list as { rowIndexOf?: (i: unknown) => number };
	return typeof target.rowIndexOf === 'function' ? target.rowIndexOf(item) : -1;
};

/** 列表归属反查：行归属登记（`stateOfItem(item).owner`） */
export const treeOwnerListOf = (item: unknown): unknown => treeListOfItem(item);

const isSSR = typeof document === 'undefined';

const renderElement = (vnode: ReturnType<typeof h>): HTMLElement => {
	const host = isSSR ? (null as unknown as HTMLDivElement) : document.createElement('div');
	render(vnode, host);
	const element = host.firstElementChild as HTMLElement;
	host.removeChild(element);
	return element;
};

type TextBox = HTMLDivElement & {
	input: HTMLInputElement;
	hiddenNodes: HTMLElement[] | null;
	lastText: string;
	read: () => string;
	write: (value: string) => void;
	getFocus: (mode: string | null) => HTMLInputElement;
	fitContent: () => void;
};

export const treeListStatics = {
	createParents: (items: TreeItem[], parent: TreeItem | null): void => {
		treeCore.createParents(items, parent);
	},

	deleteCaches: (data: TreeItem[] & { initialized?: unknown }): void => {
		treeCore.deleteCaches(data);
	},

	textBox: (function IIFE() {
		if (isSSR) {
			return null as unknown as TextBox;
		}
		const textBox = document.createElement('div') as TextBox;
		addClass(textBox, 'text-box');
		addClass(textBox, 'node-list-text-box');
		const input = document.createElement('input');
		addClass(input, 'text-box-input');
		addClass(input, 'node-list-text-box-input');
		input.type = 'text';
		textBox.appendChild(input);
		textBox.input = input;
		const textBoxData = elementDataOf<{ hiddenNodes: HTMLElement[] | null; lastText: string }>(
			textBox
		);
		textBoxData.hiddenNodes = null;
		textBoxData.lastText = '';

		textBox.read = function (): string {
			return input.value;
		};

		textBox.write = function (value: string): void {
			input.value = value;
		};

		textBox.getFocus = function (mode: string | null): HTMLInputElement {
			input.focus();
			switch (mode) {
				case 'all':
					input.select();
					input.scrollLeft = 0;
					break;
				case 'end':
					input.setSelectionRange(input.value.length, input.value.length);
					input.scrollLeft = input.scrollWidth;
					break;
			}
			return input;
		};

		textBox.fitContent = function (): void {
			const value = input.value;
			const span = document.createElement('span');
			span.style.position = 'absolute';
			span.style.visibility = 'hidden';
			span.style.whiteSpace = 'pre';
			span.textContent = value || ' ';
			document.body.appendChild(span);
			const width = span.getBoundingClientRect().width + 8;
			span.remove();
			input.style.width = `${width}px`;
		};

		textBox.addEventListener('keydown', function (this: HTMLElement, event: KeyboardEvent) {
			event.stopPropagation();
			switch (event.code) {
				case 'Enter':
				case 'NumpadEnter':
				case 'Escape': {
					const item = this.parentNode as HTMLElement & { parentNode: HTMLElement };
					const list = item.parentNode;
					(this as HTMLDivElement & { input: HTMLInputElement }).input.blur();
					list.focus();
					break;
				}
			}
		});

		textBox.addEventListener(
			'input',
			function (this: HTMLDivElement & { fitContent: () => void }) {
				this.fitContent();
			}
		);

		textBox.addEventListener('select', (event: Event) => {
			event.stopPropagation();
		});

		textBox.addEventListener('change', (event: Event) => {
			event.stopPropagation();
		});

		input.addEventListener('blur', () => {
			textBox.dispatchEvent(new FocusEvent('blur'));
		});

		textBox.addEventListener('blur', function (this: TextBox) {
			// P2b-3：这里 `this` 是重命名文本框本身，父节点是当前行元素、再上一级是列表元素
			// （结构由 `rename()` 保证：文本框会被挂到行元素下）。类型上按这条链显式写出来。
			const element = this.parentNode as HTMLElement;
			const list = element.parentNode as TreeListHost;
			// 重命名框的父节点就是行元素（`bindRowElement` 必定写过 item），与原 `element.item` 同义
			const item = rowData(element).item!;
			const name = this.read().trim();
			const boxData = elementDataOf<{ hiddenNodes: HTMLElement[] | null; lastText: string }>(
				this
			);
			for (const node of boxData.hiddenNodes ?? []) {
				removeClass(node, 'hidden');
			}
			boxData.hiddenNodes = null;
			this.remove();
			const last = item.name;
			if (last !== name) {
				item.name = name;
				list.updateItemName(item);
				if (list.recordEventEnabled) {
					const record: ValueEvent = new Event('record') as ValueEvent;
					const response = {
						type: 'rename',
						item: item,
						oldValue: last,
						newValue: name
					};
					record.value = response;
					list.dispatchEvent(record);
				}
				dispatchChangeEvent(list);
			} else {
				rowData(element).textNode!.nodeValue = boxData.lastText;
			}
		});

		return textBox;
	})()
};

export interface TreeListApiOptions {
	getMenuState?: () => string;
	renderNodeExtras?: (item: TreeItem, container: HTMLElement) => void;
	renderNodeIcon?: (item: TreeItem, container: HTMLElement) => void;
}

/**
 * tree 列表元素的**元素 API 契约**（P2b-1）。
 *
 * 与命令列表的 `CommandListElementApi` 同一套约定：**消费方实际使用的方法写精确签名**，其余用
 * `[k: string]: unknown` 兜底（"其余内部/较少使用的方法保留松散签名，保证既有调用点不因类型化而报错"）。
 *
 * **它替掉了编辑器侧原来的逃生口**：`@app/components/tree-list.ts` 过去写
 * `interface TreeListElement extends HTMLElement { [k: string]: any }`——那是**没有任何类型安全**的写法，
 * 任何拼错的方法名、任何根本不存在的成员都能通过编译（这类"假绿"本仓库已踩过多次）。
 * 实测把它换掉只需补 3 个成员（`display` / `deleteNode` / `createString`）。
 *
 * 同时它也是 `attachApi` 的键集合校验依据：`attachApi<TreeListElementApi>(list, { getMenuState })`。
 */
export interface TreeListElementApi extends YamiElementApi {
	/** 当前行数据（虚拟滚动下是**全量**行，不是可见窗口内的那些） */
	read<T = unknown>(): T | null;
	update(): void;
	refresh(): void;
	resize(): void;
	select(...args: unknown[]): void;
	insert(...args: unknown[]): unknown;
	delete(...args: unknown[]): unknown;
	clear(): unknown;
	on(...args: unknown[]): unknown;
	rename(...args: unknown[]): unknown;
	parseName(...args: unknown[]): unknown;
	deleteNode(...args: unknown[]): unknown;
	/** 列表显示模式：搜索时切到 `'search'`，否则 `'normal'`（编辑器各窗口读它判断当前是否在搜索结果视图） */
	display: string;
	/** 菜单状态查询——由宿主经选项注入，树列表在弹右键菜单前据此避让 */
	getMenuState(): string;
	// —— 其余内部/较少使用的方法（保留松散签名，保证既有调用点不因类型化而报错）——
	[k: string]: unknown;
}

type ValueEvent = Event & { value: unknown };

type PopupEvent = Event & { value: unknown; clientX: number; clientY: number };

type TreeListDragEvent = DragEvent & {
	offsetY?: number;
	hint?: DragAndDropHintApi;
};

/**
 * P2b-3：树列表元素的**宿主契约**——`treeListPrototype` 的方法与装配代码里 `this` 的真实成员面。
 *
 * 这些方法过去一律写 `this: any`，于是每条都要配一句 `oxlint-disable-next-line no-explicit-any`
 * （本文件原有 48 处禁用，其中 40 余处正是这么来的）。把成员逐个写出来后：成员拼错、签名用错都会
 * 当场被 tsc 抓到，而"树列表元素上到底有什么"也第一次留在类型里。
 *
 * **刻意不继承 `TreeListElementApi`**：那个对外契约带 `[k: string]: unknown` 索引签名（消费方要的宽松兜底），
 * 继承它等于让"没声明的成员"继续静默通过——那份宽松正是这里要收窄掉的东西。
 */
export interface TreeListHost extends HTMLElement {
	// —— 数据与视图状态 ——
	/** 行数据（虚拟滚动下是**全量**行）。根节点就是本数组本身，历史语义见 `addNodeTo` */
	data: TreeItem[] | null;
	/** 根"节点"：`bind` 里用 `Object.defineProperty` 造出的 `{ children: get data }` */
	root: TreeItem | null;
	/** `'normal' | 'search'`（对外契约里是 `string`，保持宽松比较） */
	display: string;
	searchResults: TreeItem[] | null;
	renderState: TreeRenderState;
	rowHeight: number;
	/** 元素上的可视高度（`scrollToSelection` 用；不是 `HTMLElement` 成员） */
	innerHeight: number;
	/** `searchNodesDebounced` 的防抖缓存 */
	_searchNodesDebounced?: (keyword: string | RegExp) => void;

	// —— 事件开关（`on()` 按事件名置位，各方法体里读） ——
	recordEventEnabled: boolean;
	selectEventEnabled: boolean;
	unselectEventEnabled: boolean;
	popupEventEnabled: boolean;
	openEventEnabled: boolean;
	updateEventEnabled: boolean;

	// —— 列表读写（消费方 API） ——
	read(): TreeItem | null;
	update(): void;
	refresh(): void;
	resize(): void;
	select(item: TreeItem | null | undefined): void;
	selectWithNoEvent(item: TreeItem | null | undefined): void;
	unselect(item?: TreeItem): void;
	unselectIn(item: TreeItem): void;
	selectRelative(direction: string): void;
	expandSelection(): void;
	expandToSelection(update?: boolean): void;
	expandToItem(item: TreeItem | null | undefined, update?: boolean): void;
	open(item: TreeItem | null | undefined): void;
	clear(): HTMLElement;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;

	// —— 节点增删改 ——
	addNodeTo(sItem: TreeItem, dItem: TreeItem | null | undefined, insertBefore?: boolean): void;
	deleteNode(item: TreeItem): void;
	removeItemTo(sItem: TreeItem, dItem: TreeItem | null | undefined): void;
	removeItemToInsert(sItem: TreeItem, dItem: TreeItem | null | undefined): void;
	contain(node: unknown, target: TreeItem | null | undefined): boolean;
	getItemByProperties(properties: object): TreeItem | undefined;
	generateUniqueName(item: TreeItem): string;
	generateCopyName(item: TreeItem): string;
	updateItemName(item: TreeItem): void;
	updateNodeElement(...args: unknown[]): unknown;
	updateHeadAndFoot(): void;
	initialize(): void;

	// —— 重命名 / 行渲染入口 ——
	rename(item: TreeItem): void;
	cancelRenaming(): void;
	parseName(item: TreeItem): string;
	createIcon(item: TreeItem): HTMLElement;

	// —— 搜索 ——
	searchNodes(keyword: string | RegExp): void;
	searchNodesAlgorithm(data: TreeItem[], keyword: RegExp, list: TreeItem[]): void;

	// —— 虚拟滚动 / 行查询 ——
	syncRenderRows(overrideRows?: unknown): void;
	syncRenderWindow(): void;
	rowCount(): number;
	rowItemAt(index: number): TreeItem | undefined;
	rowIndexOf(item: TreeItem): number;
	scrollToSelection(mode?: string): void;
	scrollToHome(): void;
	scrollToEnd(): void;
	pageUp(select: boolean): void;
	pageDown(select: boolean): void;
	getElementIndexOfSelection(defIndex: number): number;

	// —— 行元素绑定（模板 :ref 回调 → 派生层） ——
	setItemClass(item: TreeItem, className: string, on?: boolean): void;
	bindRow(item: TreeItem, el: unknown): void;
	bindNodeIcon(item: TreeItem, el: HTMLElement): void;
	bindNodeExtras(item: TreeItem, el: HTMLElement): void;
	applyRowUpdaters(): void;

	// —— 事件处理器（原型上的同名成员，也是注册到 DOM 的监听器） ——
	// DOM 边界上一律按标准事件类型声明（`cmdOrCtrlKey` 之类扩展字段是实现内部的事，见各实现签名）
	keydown(event: KeyboardEvent): void;
	pointerdown(event: PointerEvent): void;
	pointerup(event: PointerEvent): void;
	doubleclick(event: MouseEvent): void;
	dragstart(event: TreeListDragEvent): void;
	dragend(event?: DragEvent): void;
	dragenter(event: DragEvent): void;
	dragleave(event: DragEvent): void;
	dragover(event: DragEvent): void;
	drop(event: DragEvent): void;
	dataChange(event: Event): void;
	/** 拖拽期间的临时监听器：`dragstart` 装、`dragend` 拆，必须共用同一函数引用 */
	dragListeners: {
		dragenter: (event: DragEvent) => void;
		dragleave: (event: DragEvent) => void;
		dragover: (event: DragEvent) => void;
		drop: (event: DragEvent) => void;
	};

	// —— 宿主（消费方）注入 / 覆写的钩子 ——
	renderNodeExtras?: (item: TreeItem, container: HTMLElement) => void;
	renderNodeIcon?: (item: TreeItem, container: HTMLElement) => void;
	/** 由宿主经选项注入（`attachApi`），弹右键菜单前据此避让 */
	getMenuState(): string;
}

export const treeListPrototype: Record<string, (this: TreeListHost, ...args: never[]) => unknown> =
	{
		bind: function (this: TreeListHost, getter: () => TreeItem[]): HTMLElement {
			return Object.defineProperty(this, 'data', { get: getter });
		},

		read: function (this: TreeListHost): TreeItem | null {
			const selections = treeData(this).selections;
			return selections.length === 1 ? selections[0] : null;
		},

		initialize: function (this: TreeListHost): void {
			const data = this.data as TreeItem[] & { initialized?: unknown };
			if (data && !data.initialized) {
				treeListStatics.createParents(data, this.root as TreeItem | null);
				Object.defineProperty(data, 'initialized', {
					configurable: true,
					value: true
				});
			}
		},

		// 步骤 5：唯一渲染路径 = 数据派生（v-for），命令式差量渲染实现已删除
		update: function (this: TreeListHost): void {
			this.syncRenderRows();
			if (this.updateEventEnabled) {
				dispatchUpdateEvent(this);
			}
		},

		refresh: function (this: TreeListHost): void {
			this.update();
		},

		resize: function (this: TreeListHost): void {
			(this as unknown as { syncRenderWindow: () => void }).syncRenderWindow();
		},

		updateHeadAndFoot: function (this: TreeListHost): void {
			return commonListUpdateHeadAndFoot(this as unknown as CommonListLike);
		},

		searchNodes: function (this: TreeListHost, keyword: string | RegExp): void {
			const { data } = this;
			if (!data) return;
			if (keyword instanceof RegExp || (keyword as string).length !== 0) {
				if (this.display === 'normal') {
					this.display = 'search';
				}
				if (typeof keyword === 'string') {
					keyword = keyword.replace(/[(){}\\^$*+?.|[\]]/g, '\\$&');
					keyword = new RegExp(keyword, 'i');
				}
				this.searchNodesAlgorithm(
					data,
					(treeData(this).keyword = keyword as RegExp),
					(this.searchResults = [])
				);
			} else {
				if (this.display === 'search') {
					this.display = 'normal';
					treeData(this).keyword = null;
					this.searchResults = [];
				}
			}
			this.update();
		},

		searchNodesDebounced: function (this: TreeListHost, keyword: string | RegExp): void {
			(this._searchNodesDebounced ??= debounce(
				(kw: string | RegExp) => this.searchNodes(kw),
				150
			))(keyword);
		},

		searchNodesAlgorithm: function (
			this: TreeListHost,
			data: TreeItem[],
			keyword: RegExp,
			list: TreeItem[]
		): void {
			treeCore.searchNodesAlgorithm(data, keyword, list);
		},

		createIcon: function (this: TreeListHost, item: TreeItem): HTMLElement {
			const icon = renderElement(
				h('span', {
					class: ['node-icon', item.class === 'folder' ? 'icon-folder' : 'icon-file']
				})
			);
			return icon;
		},

		createText: function (this: TreeListHost, item: TreeItem): Text {
			return document.createTextNode(this.parseName(item));
		},

		parseName: function (this: TreeListHost, item: TreeItem): string {
			return item.name;
		},

		updateItemName: function (this: TreeListHost, item: TreeItem): void {
			// 步骤 5：行文本由派生层渲染 —— 名称变更触发重派生（直写 textNode 会被 patch 覆盖）
			const last = item?.name;
			this.syncRenderRows();
			if (this.display === 'search') {
				const keyword = treeData(this).keyword;
				const name = this.parseName(item);
				if (keyword!.test(last) || keyword!.test(name)) {
					// 进入本分支即 `display === 'search'`，此时 keyword 必已由 `searchNodes` 写入
					this.searchNodes(treeData(this).keyword!);
				}
			}
		},

		getItemByProperties: function (
			this: TreeListHost,
			properties: object
		): TreeItem | undefined {
			return treeCore.findItemByProperties(this.data as TreeItem[], properties);
		},

		contain: function (
			this: TreeListHost,
			node: unknown,
			target: TreeItem | null | undefined
		): boolean {
			return treeCore.containsItem(node, target);
		},

		renameNode: function (this: TreeListHost, item: TreeItem | null, newName: string): void {
			if (item) {
				item.name = newName;
				this.updateItemName(item);
			}
		},

		resetItemName: function (this: TreeListHost, item: TreeItem | null): void {
			if (item) {
				item.name = this.generateCopyName(item);
				this.updateItemName(item);
			}
		},

		generateUniqueName: function (this: TreeListHost, item: TreeItem): string {
			return treeCore.generateUniqueName(item);
		},

		duplicate: function (this: TreeListHost, item: TreeItem): void {
			const copy = treeCore.cloneNode(item);
			copy.name = this.generateUniqueName(item);
			const index = item.parent!.children!.indexOf(item);
			const next = item.parent!.children![index + 1];
			if (next) {
				this.addNodeTo(copy, next, true);
			} else {
				this.addNodeTo(copy, item.parent);
			}
		},

		addNodeTo: function (
			this: TreeListHost,
			sItem: TreeItem,
			dItem: TreeItem | null | undefined,
			insertBefore: boolean = false
		): void {
			if (!sItem) {
				return;
			}

			// P2b-3：把原先靠 `this: any` 兜住的两个局部变量显式类型化（`dList` 可能为 null）
			let dList: TreeItem[] | null | undefined;
			let dIndex = 0;

			const { data } = this;
			if (!dItem) {
				// 根"节点"就是 `data` 数组本身（历史语义，见 `bind` 里对该元素的 `data` 定义）
				dItem = data as unknown as TreeItem;
			}
			if ((dItem as unknown) === data) {
				dList = data;
				dIndex = data?.length ?? 0;
			} else if (dItem!.children && !insertBefore) {
				dList = dItem!.children;
				dIndex = dList.length;
			} else {
				dList = dItem!.parent!.children;
				if (dList instanceof Array) {
					dIndex = dList.indexOf(dItem!);
				}
			}
			if (dList) {
				dList.splice(dIndex, 0, sItem);
				// 步骤 2：unselect() 会触发派生重算，新节点必须先把 parent 建好（否则派生抛 No parent!）
				if (sItem.parent === undefined) {
					treeListStatics.createParents([sItem], null);
				}
				this.unselect();

				let item = dItem!;
				while (item.parent !== undefined) {
					if (item.expanded === false) {
						item.expanded = true;
					}
					item = item.parent!;
				}

				if (this.recordEventEnabled) {
					const record: ValueEvent = new Event('record') as ValueEvent;
					const response = {
						type: 'create',
						sItem: sItem,
						dItem: dItem,
						insertBefore: insertBefore
					};
					record.value = response;
					this.dispatchEvent(record);
				}

				if (!sItem.parent) getListConfig(this).onCreate?.(sItem);
				this.update();
				this.select(sItem);
				this.scrollToSelection();
				dispatchChangeEvent(this);
			}
		},

		deleteNode: function (this: TreeListHost, item: TreeItem): void {
			const items = item.parent!.children!;
			if (items instanceof Array) {
				const index = items.indexOf(item);
				items.splice(index, 1);

				if (this.recordEventEnabled) {
					const record: ValueEvent = new Event('record') as ValueEvent;
					const response = {
						type: 'delete',
						items: items,
						index: index,
						item: item
					};
					record.value = response;
					this.dispatchEvent(record);
				}

				this.unselectIn(item);
				getListConfig(this).onDelete?.(item);
				this.update();
				dispatchChangeEvent(this);
			}
		},

		removeItemTo: function (
			this: TreeListHost,
			sItem: TreeItem,
			dItem: TreeItem | null | undefined
		): void {
			if (sItem === dItem || (getListConfig(this).lockDirectory && dItem === this.root)) {
				return;
			}
			const sParent = sItem.parent;
			if (sParent && dItem) {
				const sList = sParent.children!;
				const dList = dItem.children!;
				const sIndex = sList.indexOf(sItem);
				sList.splice(sIndex, 1);
				const dIndex = dList.length;
				dList.splice(dIndex, 0, sItem);
				if (sList === dList && sIndex === dIndex) {
					return;
				}
				if (dItem.expanded === false) {
					dItem.expanded = true;
				}

				if (this.recordEventEnabled) {
					const record: ValueEvent = new Event('record') as ValueEvent;
					const response = {
						type: 'remove',
						item: sItem,
						source: {
							parent: sParent,
							index: sIndex
						},
						destination: {
							parent: dItem,
							index: dIndex
						}
					};
					record.value = response;
					this.dispatchEvent(record);
				}
				this.update();
				getListConfig(this).onRemove?.(sItem);
				this.scrollToSelection();
				dispatchChangeEvent(this);
			}
		},

		removeItemToInsert: function (
			this: TreeListHost,
			sItem: TreeItem,
			dItem: TreeItem | null | undefined
		): void {
			if (
				sItem === dItem ||
				(getListConfig(this).lockDirectory && dItem!.parent === this.root)
			) {
				return;
			}
			const sParent = sItem.parent;
			const dParent = dItem!.parent;
			if (sParent && dParent) {
				const sList = sParent.children!;
				const dList = dParent.children!;
				const sIndex = sList.indexOf(sItem);
				sList.splice(sIndex, 1);
				const dIndex = dList.indexOf(dItem!);
				dList.splice(dIndex, 0, sItem);
				if (sList === dList && sIndex === dIndex) {
					return;
				}

				if (this.recordEventEnabled) {
					const record: ValueEvent = new Event('record') as ValueEvent;
					const response = {
						type: 'remove',
						item: sItem,
						source: {
							parent: sParent,
							index: sIndex
						},
						destination: {
							parent: dParent,
							index: dIndex
						}
					};
					record.value = response;
					this.dispatchEvent(record);
				}
				this.update();
				getListConfig(this).onRemove?.(sItem);
				this.scrollToSelection();
				dispatchChangeEvent(this);
			}
		},

		restore: function (
			this: TreeListHost,
			operation: string,
			response: { type: string; [k: string]: unknown }
		): void {
			if (this.display === 'search') {
				this.searchResults = [];
			}
			switch (response.type) {
				case 'rename': {
					const { item, oldValue, newValue } = response as unknown as {
						item: TreeItem;
						oldValue: string;
						newValue: string;
					};
					if (operation === 'undo') {
						item.name = oldValue;
					} else {
						item.name = newValue;
					}
					this.updateItemName(item);
					this.expandToItem(item);
					if (!this.textContent) {
						this.update();
					}
					this.select(item);
					this.scrollToSelection();
					dispatchChangeEvent(this);
					break;
				}
				case 'create': {
					const { sItem, dItem, insertBefore } = response as unknown as {
						sItem: TreeItem;
						dItem: TreeItem | null | undefined;
						insertBefore: boolean;
					};
					if (operation === 'undo') {
						const enabled = this.recordEventEnabled;
						this.recordEventEnabled = false;
						this.deleteNode(sItem);
						this.recordEventEnabled = enabled;
					} else {
						const enabled = this.recordEventEnabled;
						this.recordEventEnabled = false;
						this.addNodeTo(sItem, dItem, insertBefore);
						this.recordEventEnabled = enabled;
						getListConfig(this).onResume?.(sItem);
					}
					break;
				}
				case 'delete': {
					const { items, index, item } = response as unknown as {
						items: TreeItem[];
						index: number;
						item: TreeItem;
					};
					if (operation === 'undo') {
						if (index <= items.length) {
							items.splice(index, 0, item);
							this.unselect();
							this.expandToItem(item, false);
							getListConfig(this).onResume?.(item);
						}
					} else {
						if (index < items.length) {
							items.splice(index, 1);
							this.unselectIn(item);
							getListConfig(this).onDelete?.(item);
						}
					}

					this.update();
					if (operation === 'undo') this.select(item);
					this.scrollToSelection();
					dispatchChangeEvent(this);
					break;
				}
				case 'remove': {
					const { item, source, destination } = response as unknown as {
						item: TreeItem;
						source: { parent: TreeItem; index: number };
						destination: { parent: TreeItem; index: number };
					};
					const { parent: sParent, index: sIndex } = source;
					const { parent: dParent, index: dIndex } = destination;
					const sList = sParent.children!;
					const dList = dParent.children!;
					if (operation === 'undo') {
						if (item.parent !== undefined) {
							item.parent = sParent;
						}
						if (sIndex <= sList.length && dIndex < dList.length) {
							dList.splice(dIndex, 1);
							sList.splice(sIndex, 0, item);
							this.expandToItem(item, false);
						}
					} else {
						if (item.parent !== undefined) {
							item.parent = dParent;
						}
						if (dIndex <= dList.length && sIndex < sList.length) {
							sList.splice(sIndex, 1);
							dList.splice(dIndex, 0, item);
							this.expandToItem(item, false);
						}
					}
					this.update();
					this.select(item);
					getListConfig(this).onRemove?.(item);
					this.scrollToSelection();
					dispatchChangeEvent(this);
					break;
				}
			}
		},

		open: function (this: TreeListHost, item: TreeItem | null | undefined): void {
			if (item && this.openEventEnabled) {
				const open: ValueEvent = new Event('open') as ValueEvent;
				open.value = item;
				this.dispatchEvent(open);
			}
		},

		select: function (this: TreeListHost, item: TreeItem | null | undefined): void {
			if (item instanceof Object && this.read() !== item) {
				this.unselect();
				treeData(this).selections.push(item);
				// 步骤 5b：不再直写行元素 class——选中态由派生行（row.selected）渲染，下面 syncRenderRows 即刷新
				this.syncRenderRows();
				if (this.selectEventEnabled) {
					const select: ValueEvent = new Event('select') as ValueEvent;
					select.value = this.read();
					this.dispatchEvent(select);
				}
			}
		},

		selectWithNoEvent: function (this: TreeListHost, item: TreeItem | null | undefined): void {
			const enabled = this.selectEventEnabled;
			this.selectEventEnabled = false;
			this.select(item);
			this.selectEventEnabled = enabled;
		},

		unselect: function (this: TreeListHost, item?: TreeItem): void {
			const data = treeData(this);
			let selections: TreeItem[] = [];
			if (item === undefined) {
				selections = data.selections;
			}
			if ((data.selections as (TreeItem | undefined)[]).includes(item)) {
				selections = [item!];
			}
			if (selections.length !== 0) {
				treeListStatics.textBox.input.blur();
				// 步骤 5b：不再直写行元素 class——取消选中由派生行（row.selected）渲染，末尾 syncRenderRows 即刷新
				if (this.unselectEventEnabled) {
					const select: ValueEvent = new Event('unselect') as ValueEvent;
					select.value = selections;
					this.dispatchEvent(select);
				}
				data.selections = [];
				if (this.renderState !== undefined) {
					(this as unknown as { syncRenderRows: () => void }).syncRenderRows();
				}
			}
		},

		unselectIn: function (this: TreeListHost, item: TreeItem): void {
			const targets = [];
			for (let target of treeData(this).selections) {
				let node: TreeItem | null | undefined = target;
				while (node) {
					if (node === item) {
						targets.push(target);
						break;
					}
					node = node.parent;
				}
			}
			for (const target of targets) {
				this.unselect(target);
			}
		},

		selectRelative: function (this: TreeListHost, direction: string): void {
			const rows: { item: TreeItem }[] = this.renderState.rows.value;
			const count = rows.length;
			if (count > 0) {
				let index = -1;
				const last = count - 1;
				const selection = this.read();
				if (selection) {
					index = this.rowIndexOf(selection);
				}
				switch (direction) {
					case 'up':
						if (index !== -1) {
							index = Math.max(index - 1, 0);
						} else {
							index = last;
						}
						break;
					case 'down':
						if (index !== -1) {
							index = Math.min(index + 1, last);
						} else {
							index = 0;
						}
						break;
				}
				this.select(rows[index]?.item);
				this.scrollToSelection();
			}
		},

		expandSelection: function (this: TreeListHost): void {
			const item = this.read();
			if (item !== null && item.expanded !== undefined && rowElementOf(item) !== undefined) {
				item.expanded = !item.expanded;
				this.update();
				dispatchChangeEvent(this);
			}
		},

		expandToSelection: function (this: TreeListHost, update = true): void {
			const item = this.read();
			if (item !== null) {
				this.expandToItem(item, update);
			}
		},

		expandToItem: function (
			this: TreeListHost,
			item: TreeItem | null | undefined,
			update = true
		): void {
			item = item!.parent!;
			if (!item) return;
			let changed = false;
			while (item.expanded !== undefined) {
				if (!item.expanded) {
					item.expanded = true;
					changed = true;
				}
				item = item.parent!;
			}
			if (changed && update) {
				this.update();
				dispatchChangeEvent(this);
			}
		},

		scrollToSelection: function (this: TreeListHost, mode = 'active'): void {
			const selection = this.read();
			if (selection && hasScrollBar(this)) {
				const rows: { item: TreeItem }[] = this.renderState.rows.value;
				for (let i = 0; i < rows.length; i++) {
					const item = rows[i]?.item;
					if (item === selection) {
						let scrollTop;
						switch (mode) {
							case 'active':
								scrollTop = clamp(
									this.scrollTop,
									i * 20 + 20 - this.innerHeight,
									i * 20
								);
								break;
							case 'middle':
								scrollTop =
									Math.round((i * 20 + 10 - this.innerHeight / 2) / 20) * 20;
								break;
							default:
								return;
						}
						if (this.scrollTop !== scrollTop) {
							this.scrollTop = scrollTop;
							this.syncRenderWindow();
						}
						break;
					}
				}
			}
		},

		scrollToHome: function (this: TreeListHost): void {
			const item = this.rowItemAt(0);
			if (item !== undefined) {
				this.select(item);
			}
			this.scroll(0, 0);
		},

		scrollToEnd: function (this: TreeListHost): void {
			const item = this.rowItemAt(this.rowCount() - 1);
			if (item !== undefined) {
				this.select(item);
			}
			this.scroll(0, this.scrollHeight);
		},

		rowItemAt: function (this: TreeListHost, index: number): TreeItem | undefined {
			return this.renderState.rows.value[index]?.item;
		},

		rowCount: function (this: TreeListHost): number {
			return this.renderState.rows.value.length;
		},

		pageUp: function (this: TreeListHost, select: boolean): void {
			const scrollLines = Math.floor(this.clientHeight / 20) - 1;
			if (select) {
				const bottom = this.scrollTop + this.clientHeight;
				const bottomIndex = Math.floor(bottom / 20) - 1;
				let index = this.getElementIndexOfSelection(Infinity);
				index = Math.min(index, bottomIndex) - scrollLines;
				index = Math.max(index, 0);
				this.select(this.rowItemAt(index));
			}
			// 等价于 scrollBy(0, -delta) 且 jsdom 也支持（jsdom 未实现 Element.scrollBy）
			this.scrollTop -= scrollLines * 20;
		},

		pageDown: function (this: TreeListHost, select: boolean): void {
			const scrollLines = Math.floor(this.clientHeight / 20) - 1;
			if (select) {
				const count = this.rowCount();
				const topIndex = Math.floor(this.scrollTop / 20);
				let index = this.getElementIndexOfSelection(0);
				index = Math.max(index, topIndex) + scrollLines;
				index = Math.min(index, count - 1);
				this.select(this.rowItemAt(index));
			}
			// 等价于 scrollBy(0, +delta) 且 jsdom 也支持（jsdom 未实现 Element.scrollBy）
			this.scrollTop += scrollLines * 20;
		},

		getElementIndexOfSelection: function (this: TreeListHost, defIndex: number): number {
			const item = this.read();
			if (!item) return defIndex;
			const index = this.rowIndexOf(item);
			return index === -1 ? defIndex : index;
		},

		rename: function (this: TreeListHost, item: TreeItem): void {
			if (getListConfig(this).renamable) {
				// 步骤 5b：行元素由渲染状态持有（窗口外的行未物化 → 直接不进入重命名）
				const element = rowElementOf(item);
				const { textBox } = treeListStatics;
				if (
					element !== undefined &&
					document.activeElement === this &&
					!textBox.parentNode &&
					element.parentNode
				) {
					const nodes = [];
					const { folderMark, nodeIcon } = elementDataOf<NodeElement>(element);
					for (const node of element.childNodes) {
						if (
							node instanceof HTMLElement &&
							node !== folderMark &&
							node !== nodeIcon &&
							addClass(node, 'hidden')
						) {
							nodes.push(node);
						}
					}
					elementDataOf<{ lastText: string }>(textBox).lastText = rowData(element)
						.textNode!.nodeValue as string;
					rowData(element).textNode!.nodeValue = '';
					element.appendChild(textBox);
					elementDataOf<{ hiddenNodes: HTMLElement[] | null }>(textBox).hiddenNodes =
						nodes;
					textBox.write(item.name);
					textBox.getFocus('all');
					textBox.fitContent();
				}
			}
		},

		cancelRenaming: function (this: TreeListHost): void {
			// P4b：`timer` 走显式元素数据（字段已从 DATA_FIELDS 摘除）
			const timer = treeData(this).timer;
			if (timer.target) {
				timer.target = null;
			}
			if (timer.running) {
				timer.running = false;
				timer.remove();
			}
		},

		clear: function (this: TreeListHost): HTMLElement {
			if (this.display === 'search') {
				this.display = 'normal';
				treeData(this).keyword = null;
				this.searchResults = [];
			}
			this.unselect();
			// 步骤 5b：只有派生行一条路径——Vue 管理的行不能手清 DOM（会炸掉 vnode），只清数据 + bump
			this.syncRenderRows([]);
			return this;
		},

		on: function (
			this: TreeListHost,
			type: string,
			listener: (event: Event) => void,
			options?: boolean | AddEventListenerOptions
		): void {
			this.addEventListener(type, listener, options);
			switch (type) {
				case 'select':
					this.selectEventEnabled = true;
					break;
				case 'unselect':
					this.unselectEventEnabled = true;
					break;
				case 'record':
					this.recordEventEnabled = true;
					break;
				case 'popup':
					this.popupEventEnabled = true;
					break;
				case 'open':
					this.openEventEnabled = true;
					break;
				case 'update':
					this.updateEventEnabled = true;
					break;
			}
		},

		keydown: function (
			this: TreeListHost,
			event: KeyboardEvent & { cmdOrCtrlKey: boolean }
		): void {
			if (!this.data) {
				return;
			}
			if (event.cmdOrCtrlKey) {
				switch (event.code) {
					case 'ArrowUp':
						this.scrollTop -= 20;
						break;
					case 'ArrowDown':
						this.scrollTop += 20;
						break;
					default:
						return;
				}
				event.stopImmediatePropagation();
			} else if (event.altKey) {
				return;
			} else {
				switch (event.code) {
					case 'Enter':
					case 'NumpadEnter': {
						const item = this.read();
						if (item) {
							event.preventDefault();
							event.stopPropagation();
							this.open(item);
						}
						break;
					}
					case 'Space':
						event.preventDefault();
						return;
					case 'ArrowRight':
						event.preventDefault();
						this.expandSelection();
						break;
					case 'ArrowUp':
						event.preventDefault();
						this.selectRelative('up');
						break;
					case 'ArrowDown':
						event.preventDefault();
						this.selectRelative('down');
						break;
					// 分页键（步骤 1 缺口收口）：与搜索框的 searcherKeydown 语义一致——
					// 选中随页移动 + 滚动联动；preventDefault 抑制浏览器自身的 PageUp/PageDown 滚动。
					case 'PageUp':
						event.preventDefault();
						this.pageUp(true);
						break;
					case 'PageDown':
						event.preventDefault();
						this.pageDown(true);
						break;
					case 'F2': {
						const item = this.read();
						if (item) {
							this.cancelRenaming();
							this.rename(item);
						}
						break;
					}
					default:
						return;
				}
				event.stopImmediatePropagation();
			}
		},

		pointerdown: function (this: TreeListHost, event: PointerEvent): void {
			this.dragend();
			this.cancelRenaming();
			switch (event.button) {
				case 0: {
					const target = event.target as NodeElement;
					if (hasClass(target, 'folder-mark')) {
						event.preventDefault();
						const { item } = rowData(target.parentNode);
						item!.expanded = !item!.expanded;
						this.update();
						dispatchChangeEvent(this);
					} else {
						// 目标归一：点在标签文字/图标上时取所属行（legacy 的裸文本节点等价物）
						const element = rowTargetOf(event.target);
						if (element !== null) {
							// 步骤 5b：选中态按数据判断（不再依赖行元素上的 selected class 是否已 patch）
							const item = rowData(element).item;
							if (item !== undefined && this.read() !== item) {
								this.select(item);
							} else if (
								getListConfig(this).renamable &&
								this.getMenuState() === 'closed' &&
								document.activeElement === this &&
								event.clientX > (rect(rowData(element).nodeIcon)?.right ?? 0)
							) {
								treeData(this).timer.target = event.target;
							}
						}
					}
					break;
				}
				case 2: {
					const element = seek(event.target, '.node-item');
					const item = rowData(element).item;
					if (
						hasClass(element, 'node-item') &&
						item !== undefined &&
						this.read() !== item
					) {
						this.select(item);
					}
					break;
				}
			}
		},

		pointerup: function (this: TreeListHost, event: PointerEvent): void {
			if (treeData(this).dragging || !this.data) {
				return;
			}
			switch (event.button) {
				case 0:
					if (document.activeElement === this) {
						const timer = treeData(this).timer;
						if (timer.target === event.target) {
							timer.running = true;
							timer.elapsed = 0;
							timer.add();
						}
					}
					break;
				case 2:
					if (this.popupEventEnabled && document.activeElement === this) {
						const element = seek(event.target, '.node-item');
						const item = rowData(element).item;
						// 步骤 5b：是否已选中按数据判断（pointerdown 选中后派生 class 要等一次 patch）
						const isSelected = item !== undefined && this.read() === item;
						const popup: PopupEvent = new Event('popup') as PopupEvent;
						popup.value = hasClass(element, 'node-item') && isSelected ? item : null;
						popup.clientX = event.clientX;
						popup.clientY = event.clientY;
						this.dispatchEvent(popup);
					}
					break;
			}
		},

		doubleclick: function (this: TreeListHost, event: MouseEvent): void {
			// 目标归一：双击标签文字时 target 是 `.node-text`，legacy 里它是行上的裸文本节点
			const element = rowTargetOf(event.target);
			if (element !== null) {
				this.cancelRenaming();
				const item = rowData(element).item!;
				if (item.class === 'folder') {
					item.expanded = !item.expanded;
					this.update();
					dispatchChangeEvent(this);
				} else {
					this.open(item);
				}
			}
		},

		dragstart: function (this: TreeListHost, event: TreeListDragEvent): void {
			if (
				getListConfig(this).removable &&
				!treeData(this).dragging &&
				this.display === 'normal' &&
				this.read() !== null &&
				!treeListStatics.textBox.parentNode &&
				(getListConfig(this).lockDirectory === false || this.read()!.class !== 'folder')
			) {
				treeData(this).dragging = event;
				Object.defineProperty(event, 'offsetY', { writable: true });
				event.preventDefault = () => {};
				hideDragImage(event.dataTransfer);
				event.hint = createDragAndDropHintElement();
				addClass(event.hint, 'for-list');
				this.parentNode!.insertBefore(hide(event.hint), this);
				addClass(this, 'dragging');
				// P2b-3：拖拽期间的临时监听器取自 `dragListeners`（`dragend` 要按**同一函数引用**拆掉，
				// 所以不能在两处各写一个箭头），这里不再直接传 `this.dragenter` 这类方法引用。
				const listeners = this.dragListeners;
				this.addEventListener('dragenter', listeners.dragenter);
				this.addEventListener('dragleave', listeners.dragleave);
				this.addEventListener('dragover', listeners.dragover);
				this.addEventListener('drop', listeners.drop);
			}
		},

		dragend: function (this: TreeListHost, _event?: DragEvent): void {
			const data = treeData(this);
			if (data.dragging) {
				removeClass(this, 'dragging');
				// 拖拽起于本列表（`dragstart` 里 `parentNode.insertBefore` 装过 hint），故两者都必定存在
				this.parentNode!.removeChild(data.dragging.hint!);
				data.dragging = null;
				// 步骤 4：hint 行 class 由派生行渲染，拖拽结束需重派生清除
				this.syncRenderRows();
				const listeners = this.dragListeners;
				this.removeEventListener('dragenter', listeners.dragenter);
				this.removeEventListener('dragleave', listeners.dragleave);
				this.removeEventListener('dragover', listeners.dragover);
				this.removeEventListener('drop', listeners.drop);
			}
		},

		dragenter: function (this: TreeListHost, event: DragEvent): void {
			if (treeData(this).dragging) {
				event.preventDefault();
				event.dataTransfer!.dropEffect = 'move';
			}
		},

		dragleave: function (this: TreeListHost, event: DragEvent): void {
			const data = treeData(this);
			if (data.dragging && !this.contains(event.relatedTarget as Node)) {
				data.dragging.offsetY = -1;
				hide(data.dragging.hint);
			}
		},

		dragover: function (this: TreeListHost, event: TreeListDragEvent): void {
			const { dragging } = treeData(this);
			if (dragging) {
				event.preventDefault();
				event.dataTransfer!.dropEffect = 'move';
				if (dragging.offsetY === event.offsetY) {
					return;
				}
				dragging.offsetY = event.offsetY;
				const element = seek(event.target, '.node-item');
				const hint = show(dragging.hint) as DragAndDropHintApi;
				const hintState = hintData(hint);
				if (hasClass(element, 'node-item')) {
					const sItem = rowData(dragging.target).item;
					const dItem = rowData(element).item!;
					if (this.contain(sItem, dItem)) {
						{
							hide(hint);
							return;
						}
					}

					const offsetY = event.offsetY!;
					const position = dItem!.children
						? offsetY < 4
							? 'before'
							: offsetY < 16
								? 'into'
								: 'after'
						: offsetY < 10
							? 'before'
							: 'after';
					switch (position) {
						case 'into':
							if (hintState.target !== element || hint.position !== position) {
								const r = hint.measure(element);
								hintState.target = element;
								hint.position = position;
								hint.moveDown().set(r);
								// 步骤 4：行 hint class 由派生行渲染（position 变化需重派生）
								this.syncRenderRows();
							}
							break;
						case 'before':
							if (hintState.target !== element || hint.position !== position) {
								const r = hint.measure(element);
								r.top -= 1;
								r.height = 2;
								hintState.target = element;
								hint.position = position;
								hint.moveUp().set(r);
								this.syncRenderRows();
							}
							break;
						case 'after':
							if (hintState.target !== element || hint.position !== position) {
								const r = hint.measure(element);
								r.top += r.height - 1;
								r.height = 2;
								hintState.target = element;
								hint.position = position;
								hint.moveUp().set(r);
								this.syncRenderRows();
							}
							break;
					}
				} else {
					// 步骤 5b：取"最后一行"的已物化元素（窗口外行同样为空 ⇒ 与旧 `elements[count-1]` 语义一致）
					const state = renderStateOf(this) as TreeRenderState;
					const rows = state.rows.value;
					const lastRow = rows[rows.length - 1];
					const element =
						lastRow === undefined ? undefined : state.rowElements.get(lastRow.key);
					if (
						element !== undefined &&
						(hintState.target !== element || hint.position !== 'append')
					) {
						const r = hint.measure(element);
						r.top += r.height - 1;
						r.height = 2;
						hintState.target = element;
						hint.position = 'append';
						hint.moveUp().set(r);
						this.syncRenderRows();
					}
				}
			}
		},

		drop: function (this: TreeListHost, event: DragEvent): void {
			const { dragging } = treeData(this);
			if (!dragging) {
				return;
			}
			event.stopPropagation();
			// drop 只在 dragstart 装配的拖拽流程里触发，此时 hint 必定存在（原 `dragging.hint` 同义）
			const hint = dragging.hint!;
			const hintState = hintData(hint);
			if (!hasClass(hint, 'hidden')) {
				// 拖拽源与 hint 指向的目标行都必定是已物化行（`dragover` 才会给 hint 定 target）
				const sItem = rowData(dragging.target).item!;
				const dItem = rowData(hintState.target).item!;
				if (hint.position !== 'append' && this.contain(sItem, dItem)) {
					return;
				}
				switch (hint.position) {
					case 'into':
						this.removeItemTo(sItem, dItem);
						break;
					case 'before':
						this.removeItemToInsert(sItem, dItem);
						break;
					case 'after':
					case 'append': {
						// 步骤 5b：先定位 hint.target 所在行，再取下一行的 item（语义同旧 `elements.indexOf` + 1）
						const state = renderStateOf(this) as TreeRenderState;
						const rows = state.rows.value;
						const index = rows.findIndex(
							(row) => state.rowElements.get(row.key) === hintState.target
						);
						const next = rows[index + 1]?.item;
						if (next) {
							this.removeItemToInsert(sItem, next);
						} else {
							this.removeItemTo(sItem, this.root);
						}
						break;
					}
				}
			}

			this.dragend();
		},

		dataChange: function (this: TreeListHost, _event: Event): void {
			if (this.display === 'search') {
				// `display === 'search'` 时 keyword 必已写入（与 `updateItemName` 同一不变式）
				this.searchNodes(treeData(this).keyword!);
			}
		}
	};

export function createTreeListApi(el: HTMLElement, options?: TreeListApiOptions): HTMLElement {
	const list = el as TreeListHost;
	const getMenuState = options?.getMenuState ?? (() => 'closed');
	list.renderNodeExtras = options?.renderNodeExtras;
	list.renderNodeIcon = options?.renderNodeIcon;
	// 步骤 5：渲染状态恒存在（数据派生 + v-for）
	list.renderState = createTreeRenderState(list);
	attachApi<TreeListElementApi>(list, { getMenuState });

	// 原型表是动态键集合（`Object.keys` 驱动），这里显式落到索引访问上；
	// 其余成员访问一律走 `TreeListHost` 的逐项声明。
	const prototypeSink = list as unknown as Record<string, unknown>;
	for (const name of Object.keys(treeListPrototype)) {
		prototypeSink[name] = (treeListPrototype as Record<string, unknown>)[name];
	}

	// P4b: the attach guard now lives in element data (helper in element-data.ts)
	elementDataOf<{ _initialized?: boolean }>(list)._initialized = false;
	list.display = 'normal';
	treeData(list).keyword = null;
	list.searchResults = [];
	const listConfig = getListConfig(list);
	listConfig.creators = [];
	listConfig.updaters = [];
	list.syncRenderRows = function (this: TreeListHost, overrideRows?: unknown): void {
		const state = renderStateOf(this) as TreeRenderState;
		this.initialize();
		// P4b：`selections` / `dragging` 走显式元素数据；`?.` 链一律保留（hint/target 可能为空）
		const listOwnerData = treeData(this);
		const draggingHint = listOwnerData.dragging?.hint;
		const hintItem =
			draggingHint?.position === 'into'
				? (rowDataOrUndefined(hintData(draggingHint).target)?.item ?? null)
				: null;
		const rows =
			overrideRows !== undefined
				? (overrideRows as ReturnType<typeof flattenRows>)
				: flattenRows(state, {
						display: this.display,
						data: this.data ?? null,
						searchResults: this.searchResults ?? [],
						foldable: getListConfig(this).foldable === true,
						parseName: (item: TreeItem) => this.parseName(item),
						selections: listOwnerData.selections ?? [],
						// 步骤 4：与旧实现一致——只有 'into' 位置才给目标行加 hint class
						hintItem,
						root: (this.root ?? null) as TreeItem | null
					});
		state.rows.value = rows;
		state.bump();
		this.syncRenderWindow();
	};
	/** 同步虚拟窗口（start/end）——步骤 5b 后 `elements` shim 已删，这里只剩窗口计算 */
	list.syncRenderWindow = function (this: TreeListHost): void {
		const state = renderStateOf(this) as TreeRenderState;
		const rows = state.rows.value;
		const { start, end } = computeWindow(
			this.scrollTop ?? 0,
			this.clientHeight ?? 0,
			rows.length
		);
		state.start.value = start;
		state.end.value = end;
	};
	list.rowIndexOf = function (this: TreeListHost, item: TreeItem): number {
		const state = renderStateOf(this) as TreeRenderState;
		const rows = state.rows.value;
		for (let i = 0; i < rows.length; i++) {
			if (rows[i].item === item) return i;
		}
		return -1;
	};
	list.setItemClass = function (
		this: TreeListHost,
		item: TreeItem,
		className: string,
		on = true
	): void {
		const state = renderStateOf(this) as TreeRenderState;
		setItemClass(state, item, className, on);
	};
	list.rowHeight = ROW_HEIGHT;
	// 行元素绑定（模板 :ref 回调）：维护行元素上的内部字段，并跑 creators/updaters 钩子
	list.bindRow = function (this: TreeListHost, item: TreeItem, el: unknown): void {
		const state = renderStateOf(this);
		if (state === undefined) return;
		const firstBind = el instanceof HTMLElement && rowElementOf(item) !== el;
		bindRowElement(state, item, el);
		if (firstBind) {
			for (const creator of getListConfig(this).creators) creator(item);
		}
	};
	list.bindNodeIcon = function (this: TreeListHost, item: TreeItem, el: HTMLElement): void {
		const row = rowElementOf(item);
		if (row !== undefined) rowData(row).nodeIcon = el;
	};
	list.bindNodeExtras = function (this: TreeListHost, item: TreeItem, el: HTMLElement): void {
		const row = rowElementOf(item);
		if (row !== undefined) row.extras = el;
	};
	list.applyRowUpdaters = function (this: TreeListHost): void {
		const state = renderStateOf(this);
		if (state === undefined) return;
		const updaters = getListConfig(this).updaters as ((item: TreeItem) => void)[];
		for (const el of state.rowElements.values()) {
			// P4b：行元素的 item / nodeIcon 走显式元素数据
			const elData = rowData(el);
			const item = elData.item;
			if (item === undefined) continue;
			// 图标：提供 renderNodeIcon 时交给回调填充；否则回退 createIcon（编辑器可覆写该原型方法）
			if (typeof this.renderNodeIcon === 'function') {
				if (elData.nodeIcon) this.renderNodeIcon(item, elData.nodeIcon);
			} else if (
				elData.nodeIcon === undefined ||
				elData.nodeIcon === null ||
				elData.nodeIcon.classList?.contains('tree-node-icon-placeholder')
			) {
				const created = this.createIcon(item);
				if (elData.nodeIcon != null && elData.nodeIcon.parentNode === el) {
					elData.nodeIcon.replaceWith(created);
				} else {
					el.appendChild(created);
				}
				elData.nodeIcon = created;
			}
			for (const updater of updaters) updater(item);
			if (typeof this.renderNodeExtras === 'function' && el.extras) {
				this.renderNodeExtras(item, el.extras);
			}
			// 兼容扩展点：消费方实例级覆写 updateNodeElement（如 text-tip 的富行内容）
			// 时按其语义调用；默认实现已在步骤 5 删除，故此处不会触发内置渲染。
			if (typeof this.updateNodeElement === 'function') {
				this.updateNodeElement(el);
			}
		}
	};
	// 根"节点"：`{ children: data }` 的惰性视图（历史语义），显式断言成 `TreeItem`
	list.root = Object.defineProperty({}, 'children', {
		get: () => list.data
	}) as TreeItem;
	treeData(list).timer = new Timer({
		duration: 500,
		callback: (timer: Timer) => {
			const item = list.read();
			if (item instanceof Object) {
				const target = timer.target;
				const element = rowElementOf(item);
				if (element !== undefined && element.contains(target as Node | null)) {
					list.rename(item);
				}
			}
			timer.target = null;
			timer.running = false;
		}
	});
	treeData(list).selections = [];
	treeData(list).dragging = null;
	// P4b：列表配置不再是元素上的属性，统一经 getListConfig 落到元素数据（WeakMap）
	listConfig.padded = el.hasAttribute('padded');
	listConfig.removable = false;
	listConfig.renamable = false;
	listConfig.foldable = true;
	listConfig.lockDirectory = false;
	listConfig.multipleSelect = false;
	list.selectEventEnabled = false;
	list.unselectEventEnabled = false;
	list.recordEventEnabled = false;
	list.popupEventEnabled = false;
	list.openEventEnabled = false;
	list.updateEventEnabled = false;
	list.tabIndex = 0;

	// P2b-3：拖拽临时监听器一次生成（箭头包装把接收者写死为本元素），
	// 这样 `dragstart` 装、`dragend` 拆拿到的必然是同一个函数对象。
	list.dragListeners = {
		dragenter: (event) => list.dragenter(event),
		dragleave: (event) => list.dragleave(event),
		dragover: (event) => list.dragover(event),
		drop: (event) => list.drop(event)
	};

	list.addEventListener('scroll', () => list.resize());
	list.addEventListener('keydown', (event) => list.keydown(event));
	list.addEventListener('pointerdown', (event) => list.pointerdown(event));
	list.addEventListener('pointerup', (event) => list.pointerup(event));
	attachDoubleclick(list, (event) => list.doubleclick(event));
	list.addEventListener('dragstart', (event) => list.dragstart(event as TreeListDragEvent));
	list.addEventListener('dragend', (event) => list.dragend(event));
	list.addEventListener('change', (event) => list.dataChange(event));

	return el;
}

export function createTreeListElement(options?: TreeListApiOptions): HTMLElement {
	const el = document.createElement('div');
	el.classList.add('tree-list');
	createTreeListApi(el, options);
	return el;
}
