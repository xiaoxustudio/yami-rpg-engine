import { h } from 'vue';
import {
	relate,
	addClass,
	attachDoubleclick,
	clamp,
	css,
	dispatchChangeEvent,
	dispatchUpdateEvent,
	hasClass,
	isInContent,
	read,
	rect,
	removeClass,
	getRelativeCoords
} from '../../../utils/dom';
import {
	type CommonListLike,
	commonListClearElements,
	commonListResize,
	commonListUpdateHeadAndFoot
} from '../../../utils/common-list';
import { attachScrollListener } from '../YMParamList/scroll-listener';
import { renderDetached, renderDetachedDiv } from '../../../utils/detached';
import { createCommandCore } from './command-core';
import * as commandRender from './command-render';

const commandCore = createCommandCore();

// M3 切片 3：离屏建元素统一走 ui-kit 的 detached 接缝（本文件内不再直接建 DOM 节点）
const renderElement = (vnode: ReturnType<typeof h>): HTMLElement => renderDetached(vnode);

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const cmdOrCtrlKey = (event: KeyboardEvent): boolean => (isMac ? event.metaKey : event.ctrlKey);

const macRedoKey = (event: KeyboardEvent): boolean =>
	isMac ? event.metaKey && event.shiftKey && event.code === 'KeyZ' : false;

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
	// oxlint-disable-next-line no-explicit-any
	guidMap?: Record<string, any> | (() => Record<string, any>);
	// oxlint-disable-next-line no-explicit-any
	scenePresets?: Record<string, any> | (() => Record<string, any>);
	// oxlint-disable-next-line no-explicit-any
	uiPresets?: Record<string, any> | (() => Record<string, any>);
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
	/** M3 切片 1：派生层发的稳定行 key（M3 换 `v-for` 后直接当 `:key`） */
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

export const commandListStatics = {
	alphabetCode,
	highlightedTexts: [] as HTMLElement[],
	textPointerenter: function (this: GlobalEventHandlers & { [k: string]: unknown }): void {
		commandListStatics.unhighlightTexts();
		commandListStatics.highlightTexts(
			this as unknown as { varSpace: string; varType: string; varKey: string }
		);
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
					...document.getElementsByName(`${varSpace}-${varType}-${varKey}`),
					...document.getElementsByName(`${varSpace}-any-${varKey}`)
				];
				break;
			case 'any':
				commandListStatics.highlightedTexts = [
					...document.getElementsByName(`${varSpace}-${varType}-${varKey}`),
					...document.getElementsByName(`${varSpace}-boolean-${varKey}`),
					...document.getElementsByName(`${varSpace}-number-${varKey}`),
					...document.getElementsByName(`${varSpace}-string-${varKey}`),
					...document.getElementsByName(`${varSpace}-object-${varKey}`)
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
 * P2b-1：命令列表的**元素 API 契约**。此前消费方只能拿 `HTMLElement` 再自己写 `as HTMLElement & { … }`
 * （editor 侧就有一份 `EventCommandListShape`）；这里把「元素上有哪些方法」定成可 import 的类型。
 *
 * 说明：`commandListPrototype` 本体仍是 `Record<string, (...args) => any>`（运行时不变），
 * 本接口是对**同一个对象**的静态描述——消费方用 `HTMLElement & CommandListElementApi` 即可获得补全与拼写检查。
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
	findString(str: string | RegExp, elements: CommandItemElement[], searchMode?: FindSearchMode): FindResult[];
	deleteCommandBuffers(commands: CommandData[]): void;
	getRangeByIndex(index: number): number[];
	getRangeByData(data: CommandData): number[];
	createBlankElement(commands: CommandList, length: number, indent: number, parent: CommandData | null): CommandItemElement;
	// —— 其余内部/较少使用的方法（保留松散签名，保证既有调用点不因类型化而报错）——
	[k: string]: unknown;
}

/**
 * P6/M3（命令列表侧）：行的**数据模型**——与文件 body 的 `FileBodyRowModel` 同形，
 * 供换源前的等价性验证与后续模板化使用。
 *
 * 说明：这里**从 `elements[]` 反读**（`key` 用切片 1 写进元素的 `rowKey`、缩进用 `dataIndent`、
 * 折叠/禁用/选中从类名与字段取），因此它不是"另一份真相"，而是"当前真相的快照"——
 * 用途是让换源前后**同一段行序列**逐项可比对（文件 body 的切片 4 就是这么做的）。
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
}

export interface CommandRowModel {
	start: number;
	end: number;
	keys: string[];
	rows: CommandRowDescriptor[];
}

const commandRowModel: CommandRowModel = { start: 0, end: 0, keys: [], rows: [] };

/**
 * P6/M3（数据化）：与 `elements[]` **同序同长**的行数据。
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
	const index = typeof element.dataValue === 'number' ? element.dataValue : -1;
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

/** 从 `elements[]` 重建行模型（在 `update` 之后调用） */
function rebuildCommandRowModel(elements: {
	count: number;
	start?: number;
	end?: number;
	[i: number]: CommandItemElement | undefined;
}): void {
	const rows: CommandRowDescriptor[] = [];
	const keys: string[] = [];
	const count = elements.count;
	for (let i = 0; i < count; i++) {
		const element = elements[i];
		if (element === undefined) continue;
		const key = element.rowKey ?? '';
		keys.push(key);
		rows.push({
			key,
			index: i,
			indent: element.dataIndent,
			folded: element.folded === true,
			dataKey: element.dataKey === true,
			selected: element.classList.contains('selected'),
			disabled: element.classList.contains('disabled'),
			contents: element.contents ?? []
		});
	}
	commandRowModel.start = elements.start ?? 0;
	commandRowModel.end = elements.end ?? count;
	commandRowModel.keys = keys;
	commandRowModel.rows = rows;
}

// oxlint-disable-next-line no-explicit-any
export const commandListPrototype: Record<string, (...args: any[]) => any> = {
	read: function (this: HTMLElement & { [k: string]: unknown }): CommandData | null {
		return this.data as CommandData | null;
	},

	// oxlint-disable-next-line no-explicit-any
	write: function (this: any, data: CommandData): void {
		const options = this.__options;
		this.data = data;
		this.textContent = '';
		this.update();
		if (!data.history) {
			Object.defineProperty(data, 'history', {
				configurable: true,
				value: options.commandHistory ? new options.commandHistory(this) : null
			});
		}
		void Promise.resolve().then(() => {
			this.scrollTop = 0;
		});
	},

	// oxlint-disable-next-line no-explicit-any
	update: function (this: any): void {
		this.analyzeVariables();

		const { elements } = this;
		elements.start = -1;
		elements.count = 0;

		this.createItems(this.data, 0);

		const { count } = elements;
		for (let i = 0; i < count; i++) {
			elements[i].dataValue = i;
		}

		commonListClearElements(this, elements.count);

		dispatchUpdateEvent(this);

		this.resize();

		// M3（命令列表）：重建行模型快照与行数据——换源前后用它逐项比对"行序列"是否一致
		rebuildCommandRowData(elements);
		rebuildCommandRowModel(elements);
	},

	/** M3：读取行模型（只读副本） */
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

	// oxlint-disable-next-line no-explicit-any
	resize: function (this: any, ..._args: unknown[]): void {
		commonListResize(this);

		this.scheduleCheckVariables();
	},

	updateHeadAndFoot: function (this: HTMLElement & { [k: string]: unknown }): void {
		return commonListUpdateHeadAndFoot(this as unknown as CommonListLike);
	},

	// oxlint-disable-next-line no-explicit-any
	updateOnResize: function (this: any, element: CommandItemElement): void {
		if (element.contents !== null) {
			this.updateCommandElement(element);
		}
	},

	createFoldedCommandBuffer: function (
		// oxlint-disable-next-line no-explicit-any
		this: any,
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
		// oxlint-disable-next-line no-explicit-any
		this: any,
		commands: CommandList,
		indent: number,
		parent: CommandData | null = null
	): void {
		const elements = this.elements;
		const length = commands.length;
		for (let i = 0; i < length; i++) {
			const buffer = this.createCommandBuffer(commands, i, indent, parent);
			if ((buffer[0] as CommandItemElement).dataItem?.folded) {
				elements[elements.count++] = buffer[0];
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
		this: HTMLElement & { [k: string]: unknown },
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
			li = renderDetachedDiv('command-item') as unknown as CommandItemElement;
			// M3 切片 1：行 key 由派生层发号（同一 command 跨多次渲染稳定 ⇒ M3 换 `v-for` 时可直接当 `:key`）
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
					li = renderDetachedDiv('command-item') as unknown as CommandItemElement;
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
						li = renderDetachedDiv('command-item') as unknown as CommandItemElement;
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
						li = renderDetachedDiv('command-item') as unknown as CommandItemElement;
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

	// oxlint-disable-next-line no-explicit-any
	updateCommandElement: function (this: any, element: CommandItemElement): void {
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
				const text = renderDetachedDiv('command-text') as HTMLDivElement & {
					[k: string]: unknown;
				};
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
					// oxlint-disable-next-line unbound-method
					text.onpointerenter = commandListStatics.textPointerenter as unknown as (
						this: GlobalEventHandlers,
						ev: PointerEvent
						// oxlint-disable-next-line no-explicit-any
					) => any;
					// oxlint-disable-next-line unbound-method
					text.onpointerleave = commandListStatics.textPointerleave;
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
		element.contents = null as unknown as { text?: string; color?: string; fold?: boolean }[] &
			CommandContent[];

		this.updateCommandElementFold(element);
	},

	updateCommandElementFold: function (
		this: HTMLElement & { [k: string]: unknown },
		element: CommandItemElement
	): void {
		if (element?.fold) {
			const command = rowOf(element).command;
			const folded = !!command!.folded;
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

	// oxlint-disable-next-line no-explicit-any
	deleteCommandBuffers: function (this: any, commands: CommandData[]): void {
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
		this: HTMLElement & { [k: string]: unknown },
		commands: CommandList,
		index: number,
		indent: number,
		parent: CommandData | null
	): CommandItemElement {
		let blank = commands.blank;
		if (blank === undefined) {
			blank = renderDetachedDiv('command-item') as unknown as CommandItemElement;

			// M3 换源前置：空白行同样需要**稳定行 key**（`v-for` 的每一行都要 `:key`）。
			// 它没有 `command` 对象可用，故按"父命令 + 层级 + 所属列表下标"派生：
			// 同一层列表的空白行唯一，且跨多次 `update` 不变（父命令对象与下标都稳定）。
			blank.rowKey = parent === null ? `blank-root-${indent}` : `blank-${commandRender.rowKeyOf(parent)}-${indent}-${index}`;

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

	computeTextIndent: function (
		this: HTMLElement & { [k: string]: unknown },
		indent: number
	): string {
		const lang = (this.__options as CommandListApiOptions).localize?.language;
		const langText = typeof lang === 'function' ? lang() : lang;
		return commandCore.computeTextIndent(indent, langText);
	},

	// oxlint-disable-next-line no-explicit-any
	select: function (this: any, start: number, end: number = start): void {
		[start, end] = commandCore.computeSelectRange(this.elements, start, end);

		this.unselect();

		this.start = start;
		this.end = end;
		this.origin = start;
		this.active = start;
		this.anchor = null;

		this.reselect();
	},

	// oxlint-disable-next-line no-explicit-any
	selectMultiple: function (this: any, active: number): void {
		const origin = this.origin;
		this.select(origin, active);
		this.origin = origin;
		this.active = clamp(active, this.start, this.end);
	},

	// oxlint-disable-next-line no-explicit-any
	selectAll: function (this: any): void {
		this.select(0, Infinity);
		this.active = this.getRangeByIndex(this.end)[0];
	},

	unselect: function (this: HTMLElement & { [k: string]: unknown }): void {
		if (this.start !== null) {
			const { selections } = this as unknown as {
				selections: (CommandItemElement | undefined)[] & { count: number };
			};
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

	// oxlint-disable-next-line no-explicit-any
	reselect: function (this: any): void {
		if (this.focusing && this.start !== null) {
			const { selections } = this;
			const elements = this.elements;
			const start = this.start;
			const end = this.end;
			let count = 0;
			for (let i = start; i <= end; i++) {
				const element = elements[i];
				selections[count++] = element;
				addClass(element, 'selected');
			}
			selections.count = count;
		}
	},

	// oxlint-disable-next-line no-explicit-any
	selectUp: function (this: any): void {
		if (this.start !== null) {
			const i = commandCore.getSelectUpIndex(this.elements, this.start, this.end);
			this.select(i);
			this.scrollToSelection();
		}
	},

	// oxlint-disable-next-line no-explicit-any
	selectDown: function (this: any): void {
		if (this.start !== null) {
			const i = commandCore.getSelectDownIndex(this.elements, this.start, this.end);
			this.select(i);
			this.scrollToSelection();
		}
	},

	// oxlint-disable-next-line no-explicit-any
	pageUp: function (this: any, select: boolean): void {
		let anchor = this.anchor;
		if (anchor === null) {
			anchor = this.active;
		}
		if (anchor !== null) {
			// M2 切片 2：翻页数学抽到 command-render.ts 的纯函数（行为与原先逐字一致）
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
				this.anchor = Math.max(targetIndex, this.start);
			}
			this.scroll(0, nextScrollTop);
		}
	},

	// oxlint-disable-next-line no-explicit-any
	pageDown: function (this: any, select: boolean): void {
		let anchor = this.anchor;
		if (anchor === null) {
			anchor = this.active;
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
				this.anchor = Math.min(targetIndex, this.end);
			}
			this.scroll(0, Math.max(context.scrollTop, nextScrollTop));
		}
	},

	// oxlint-disable-next-line no-explicit-any
	selectMultipleTo: function (this: any, index: number): void {
		if (this.start !== null) {
			this.selectMultiple(index);
			const elements = this.elements;
			const sElement = elements[this.start];
			const aElement = elements[this.active];
			const sIndent = rowOf(sElement).indent;
			const aIndent = rowOf(aElement).indent;
			let n = this.active;
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
			if (this.origin < this.active && this.origin > range[0] && this.origin < range[1]) {
				this.active = range[1];
			} else {
				this.active = range[0];
			}
		}
	},

	// oxlint-disable-next-line no-explicit-any
	selectMultipleUp: function (this: any): void {
		if (this.start !== null) {
			const elements = this.elements;
			if (this.active <= this.origin) {
				const sElement = elements[this.start];
				const indent = rowOf(sElement).indent;
				let i = this.start;
				while (--i >= 0) {
					const element = elements[i];
					if (rowOf(element).indent <= indent && rowOf(element).dataKey === true) {
						this.selectMultiple(i);
						break;
					}
				}
			} else {
				const eElement = elements[this.end];
				const data = rowOf(eElement).command;
				const end = this.end;
				let indent = Infinity;
				let n = this.origin;
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
				if (this.origin < n && this.origin > range[0] && this.origin < range[1]) {
					n = range[1];
				} else {
					n = range[0];
				}
				this.selectMultiple(n);
			}
			this.scrollToSelection();
		}
	},

	// oxlint-disable-next-line no-explicit-any
	selectMultipleDown: function (this: any): void {
		if (this.start !== null) {
			const elements = this.elements;
			if (this.active >= this.origin) {
				const eElement = elements[this.end];
				const indent = rowOf(eElement).indent;
				const count = elements.count;
				let i = this.end;
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
				const start = this.start;
				let indent = Infinity;
				let n = this.origin;
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

	// oxlint-disable-next-line no-explicit-any
	scrollToSelection: function (this: any, mode = 'active'): void {
		if (this.start !== null) {
			// M2 切片 3：三个分支的夹取数学抽到 command-render.ts（行为与原先逐字一致）
			const range = this.getRangeByIndex(this.active) as [number, number];
			const scrollTop = commandRender.computeScrollToSelection(mode, {
				scrollTop: this.scrollTop,
				viewportHeight: this.innerHeight,
				rowCount: this.elements.count,
				anchor: this.anchor,
				active: this.active,
				origin: this.origin,
				start: this.start,
				end: this.end,
				activeRange: range
			});
			if (scrollTop === null) return;
			if (this.scrollTop !== scrollTop) {
				this.scrollTop = scrollTop;
			}
		}
	},

	// oxlint-disable-next-line no-explicit-any
	scrollAndResize: function (this: any): void {
		const scrolltop = this.scrollTop;
		this.scrollToSelection('active');
		if (this.scrollTop !== scrolltop) {
			this.resize();
		}
	},

	getRangeByIndex: function (
		this: HTMLElement & { [k: string]: unknown },
		index: number
	): number[] {
		const elements = this.elements as CommandItemElement[] & { count: number };
		return commandCore.getRangeByIndex(elements, index);
	},

	getRangeByData: function (
		this: HTMLElement & { [k: string]: unknown },
		data: CommandData
	): number[] {
		const elements = this.elements as CommandItemElement[] & { count: number };
		return commandCore.getRangeByData(elements, data);
	},

	isParentEnabled: function (
		this: HTMLElement & { [k: string]: unknown },
		element: CommandItemElement
	): boolean {
		return rowOf(element).parent?.buffer?.enabled ?? true;
	},

	// oxlint-disable-next-line no-explicit-any
	insert: function (this: any, id = ''): void {
		const options = this.__options;
		if (this.start !== null) {
			const elements = this.elements;
			const element = elements[this.start];
			if (!this.isParentEnabled(element)) {
				return;
			}
			this.inserting = true;
			options.command?.insert(this, id);
		}
	},

	// oxlint-disable-next-line no-explicit-any
	edit: function (this: any, _data?: CommandData): void {
		const options = this.__options;
		if (this.start !== null) {
			const elements = this.elements;
			const element = elements[this.start];
			if (!this.isParentEnabled(element)) {
				return;
			}
			this.inserting = rowOf(element).command === null;
			switch (this.inserting) {
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

	// oxlint-disable-next-line no-explicit-any
	fold: function (this: any, element?: CommandItemElement): void {
		if (element === undefined && this.start !== null) {
			const elements = this.elements;
			const startItem = (rowAt(this.start)?.command ?? null);
			const endItem = (rowAt(this.end)?.command ?? null);
			if (startItem === endItem) {
				element = elements[this.start];
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

	// oxlint-disable-next-line no-explicit-any
	unfoldCommand: function (this: any, command: CommandData | null): void {
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

	// oxlint-disable-next-line no-explicit-any
	reselectAfterFolding: function (this: any): void {
		let head;
		let foot;
		const { selections } = this;
		const { count } = selections;
		for (let i = 0; i < count; i++) {
			const element = selections[i];
			if (element.parentNode) {
				if (head === undefined) {
					head = element;
				}
				foot = element;
			}
		}
		if (head) {
			const start = this.elements.indexOf(head);
			const end = this.elements.indexOf(foot);
			this.select(start, end);
		} else {
			this.unselect();
			this.start = null;
			this.end = null;
		}
	},

	// oxlint-disable-next-line no-explicit-any
	toggle: function (this: any): void {
		if (this.start !== null) {
			const { elements, start, end } = this;
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
				if (!this.focusing) {
					this.focusing = true;
				}
				this.select(this.start);
				this.scrollToSelection('alter');
				dispatchChangeEvent(this);
			}
		}
	},

	enableItems: function (
		this: HTMLElement & { [k: string]: unknown },
		commands: CommandData[]
	): void {
		commandCore.enableItems(commands);
	},

	disableItems: function (
		this: HTMLElement & { [k: string]: unknown },
		commands: CommandData[]
	): void {
		commandCore.disableItems(commands);
	},

	// oxlint-disable-next-line no-explicit-any
	copy: function (this: any): void {
		const clipboard = this.__options.clipboard;
		if (!clipboard) return;
		if (this.start !== null) {
			const elements = this.elements;
			const sElement = elements[this.start];
			const eElement = elements[this.end];
			const list = rowOf(sElement).list;
			const start = sElement.dataIndex;
			const end = eElement.dataIndex + 1;
			const copies = list.slice(start, end);
			if (copies.length > 0) {
				clipboard.write('yami.commands', copies);
			}
		}
	},

	// oxlint-disable-next-line no-explicit-any
	copyAsText: function (this: any): void {
		const options = this.__options;
		if (this.start !== null) {
			let string = '';
			let lastIndent;
			const { start, end, elements } = this;
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

	// oxlint-disable-next-line no-explicit-any
	copyAsJSCode: function (this: any): void {
		if (this.start !== null) {
			const { start, end, elements } = this;
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

	generateExecutableCode: function (
		this: HTMLElement & { [k: string]: unknown },
		commands: CommandData[]
	): string {
		return commandCore.generateExecutableCode(commands);
	},

	// oxlint-disable-next-line no-explicit-any
	paste: function (this: any): void {
		const clipboard = this.__options.clipboard;
		if (!clipboard) return;
		if (this.start !== null) {
			const elements = this.elements;
			const element = elements[this.start];
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
				this.select(this.start + elements.count - count);
				this.scrollToSelection('alter');
				dispatchChangeEvent(this);
			}
		}
	},

	// oxlint-disable-next-line no-explicit-any
	delete: function (this: any): void {
		if (this.start !== null) {
			const elements = this.elements;
			const sElement = elements[this.start];
			const eElement = elements[this.end];
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
				if (!this.focusing) {
					this.focusing = true;
				}
				this.select(this.start);
				this.scrollToSelection('alter');
				dispatchChangeEvent(this);
			}
		}
	},

	// oxlint-disable-next-line no-explicit-any
	undo: function (this: any): void {
		if (!this.dragging && this.history.canUndo()) {
			this.history.restore('undo');
		}
	},

	// oxlint-disable-next-line no-explicit-any
	redo: function (this: any): void {
		if (!this.dragging && this.history.canRedo()) {
			this.history.restore('redo');
		}
	},

	// oxlint-disable-next-line no-explicit-any
	save: function (this: any, command: CommandData): void {
		if (this.start !== null) {
			const elements = this.elements;
			const element = elements[this.start];
			const parent = rowOf(element).parent;
			const list = rowOf(element).list;
			const index = element.dataIndex;
			switch (this.inserting) {
				case true:
					this.history.save({
						type: 'insert',
						parent: parent,
						array: list,
						index: index,
						commands: [command]
					});
					this.end = this.start;
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
					this.select(this.start);
					break;
			}
			this.scrollToSelection('alter');
			dispatchChangeEvent(this);
		}
	},

	getSelectionPosition: function (
		this: HTMLElement & { [k: string]: unknown }
	): { x: number; y: number } | null {
		if (this.start === null) {
			return null;
		}
		const elements = this.elements as CommandItemElement[];
		const element = elements[this.start as number];
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

	clearElements: function (this: HTMLElement & { [k: string]: unknown }, start: number): void {
		commonListClearElements(this as unknown as CommonListLike, start);
	},

	// oxlint-disable-next-line no-explicit-any
	clear: function (this: any): HTMLElement {
		this.unselect();
		this.textContent = '';
		this.data = null;
		this.varList = null;
		this.varMap = null;
		this.start = null;
		this.end = null;
		this.origin = null;
		this.active = null;
		this.anchor = null;
		commonListClearElements(this, 0);
		this.elements.count = 0;
		this.elements.start = -1;
		this.elements.end = -1;
		this.updateHeadAndFoot();
		return this;
	},

	// oxlint-disable-next-line no-explicit-any
	analyzeVariables: function (this: any): {
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

	// oxlint-disable-next-line no-explicit-any
	scheduleCheckVariables: function (this: any): void {
		if (this._checkVariablesScheduled) return;
		this._checkVariablesScheduled = true;
		requestAnimationFrame(() => {
			this._checkVariablesScheduled = false;
			this.checkVariables();
		});
	},

	checkVariables: function (this: HTMLElement & { [k: string]: unknown }): void {
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
			const meta = guidMap[fileId];
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
		this: HTMLElement & { [k: string]: unknown },
		data: CommandData | null | undefined
	): string | undefined {
		return commandCore.tryGetEventId(data);
	},

	// oxlint-disable-next-line no-explicit-any
	listFocus: function (this: any, _event: FocusEvent): void {
		if (!this.focusing) {
			this.focusing = true;
			if (this.start !== null) this.reselect();
			else this.select(0);
		}
	},

	// oxlint-disable-next-line no-explicit-any
	listBlur: function (this: any, _event: FocusEvent): void {
		if (this.dragging) {
			this.windowPointerup(this.dragging);
		}
		if (this.focusing) {
			// oxlint-disable-next-line no-this-alias
			let element = this;
			while ((element = element.parentNode)) {
				if (element.nodeType !== Node.ELEMENT_NODE) {
					continue;
				}
				if ((element as HTMLElement).classList.contains('window-frame')) {
					if (hasClass(element, 'blur')) {
						return;
					} else {
						break;
					}
				}
			}
			this.focusing = false;
			this.unselect();
		}
	},

	findString: function (
		// oxlint-disable-next-line no-explicit-any
		this: any,
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
		const findList = [];
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
						// oxlint-disable-next-line no-map-spread
						const _subfind = this.findString(str, realNode, searchMode).map(
							(v: FindResult) => ({
								...v,
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
								node,
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

	// oxlint-disable-next-line no-explicit-any
	scrollToRow: function (this: any, targetIndex: number, position: string = 'center'): void {
		// M2 切片 3：下标夹取与居中/贴边数学抽到 command-render.ts（行为与原先逐字一致）
		this.scrollTop = commandRender.computeScrollToRowScrollTop(
			targetIndex,
			this.elements.count,
			this.innerHeight,
			position
		);
		this.resize(this);
	},

	// oxlint-disable-next-line no-explicit-any
	keydown: function (this: any, event: KeyboardEvent): void {
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
					this.scrollTop -= 20;
					break;
				case 'ArrowDown':
					this.scrollTop += 20;
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
					if (this.start !== null) {
						event.stopPropagation();
						const sData = (rowAt(this.start)?.command ?? null);
						const eData = (rowAt(this.end)?.command ?? null);
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
					const scrollBottom = this.elements.count * 20;
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

	// oxlint-disable-next-line no-explicit-any
	pointerdown: function (this: any, event: ListPointerEvent): void {
		const options = this.__options;
		if (this.dragging) {
			return;
		}
		switch (event.button) {
			case 0: {
				let element: CommandItemElement | null = null;
				element = event.target as CommandItemElement | null;
				let index = -1;
				if (element === this) {
					if (isInContent(element as HTMLElement, event)) {
						index = this.elements.count - 1;
					}
				} else if (hasClass(element, 'command-fold')) {
					this.fold((element as HTMLElement).parentNode as unknown as CommandItemElement);
					break;
				} else {
					element = (element as HTMLElement)?.closest?.(
						'.command-item'
					) as CommandItemElement | null;
					if (element && hasClass(element, 'command-item')) {
						index = read(element) as number;
					}
				}
				if (index >= 0) {
					element = this.elements[index] as CommandItemElement;
					if (event.shiftKey && this.start !== null) {
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
					this.dragging = event;
					event.mode = 'select';
					event.itemIndex = index;
					event.itemHeight = element!.clientHeight;
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
				if (element === this) {
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

	// oxlint-disable-next-line no-explicit-any
	pointerup: function (this: any, event: ListPointerEvent): void {
		const options = this.__options;
		if (this.dragging) {
			return;
		}
		switch (event.button) {
			case 2:
				if (this.start !== null && document.activeElement === this) {
					const elements = this.elements;
					const sElement = elements[this.start];
					const dElement = elements[this.end];
					const sData = rowOf(sElement).command;
					const eData = rowOf(dElement).command;
					const valid = !!sData;
					const pEnabled = this.isParentEnabled(sElement);
					// `valid` 已保证 `sData` 非空；`buffer` 在类型上是可选的（运行期读缓冲区前必已建好）
					const sEnabled = valid ? sData.buffer!.enabled : pEnabled;
					const editable = sEnabled && sData === eData;
					const pastable = pEnabled && !!options.clipboard?.has('yami.commands');
					const allSelectable = this.data.length > 0;
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

	// oxlint-disable-next-line no-explicit-any
	doubleclick: function (this: any, event: MouseEvent): void {
		if (this.start !== null && !hasClass(event.target as HTMLElement | null, 'command-fold')) {
			const sData = (rowAt(this.start)?.command ?? null);
			const eData = (rowAt(this.end)?.command ?? null);
			if (sData === eData) {
				this.edit(sData);
			}
		}
	},

	// oxlint-disable-next-line no-explicit-any
	windowPointerup: function (this: any, event: PointerEvent): void {
		const { dragging } = this;
		if (relate(dragging, event)) {
			switch (dragging.mode) {
				case 'select':
					this.scrollListener.removeScrollListener();
					break;
			}
			this.dragging = null;
			window.removeEventListener('pointerup', this.windowPointerup);
			window.removeEventListener('pointermove', this.windowPointermove);
		}
	},

	// oxlint-disable-next-line no-explicit-any
	windowPointermove: function (this: any, event: PointerEvent): void {
		const { dragging } = this;
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
						const line = Math.floor((y - pt) / itemHeight);
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

	// oxlint-disable-next-line no-explicit-any
	windowVariableChange: function (this: any, _event: Event): void {
		if (this.read()) {
			this.scheduleCheckVariables();
		}
	}
};

export function createCommandListApi(
	el: HTMLElement,
	options: CommandListApiOptions = {}
): HTMLElement {
	// oxlint-disable-next-line no-explicit-any
	const list = el as HTMLElement & { [k: string]: any };
	list.__options = options;

	if (Object.getPrototypeOf(commandListPrototype) !== HTMLElement.prototype) {
		Object.setPrototypeOf(commandListPrototype, HTMLElement.prototype);
	}
	Object.setPrototypeOf(list, commandListPrototype);

	list._initialized = false;
	list._paddingTop = 0;
	list.data = null;
	list.varList = null;
	list.varMap = null;
	list.elements = [] as unknown as unknown[] & {
		versionId: number;
		count: number;
		start: number;
		end: number;
		head: unknown;
		foot: unknown;
	};
	list.elements.versionId = 0;
	list.elements.count = 0;
	list.elements.start = -1;
	list.elements.end = -1;
	list.elements.head = null;
	list.elements.foot = null;
	list.selections = [];
	list.selections.count = 0;
	list.start = null as unknown as number;
	list.end = null as unknown as number;
	list.origin = null;
	list.active = null;
	list.anchor = null;
	list.inserting = false;
	list.focusing = false;
	list.dragging = null;
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
 * 说明：返回类型仍写 `HTMLElement`（运行时对象上确实挂着 `CommandListElementApi` 的方法）。
 * 暂不改成 `HTMLElement & CommandListElementApi`：若干既有用例会把返回值断言成**自己的、更丰富的本地形状**，
 * 精确返回类型会让那些断言变成"不可比"（TS2352）——那属于 M5 收尾时连同用例一起改的事。
 * 消费方若想要类型，直接 `HTMLElement & CommandListElementApi` 即可（见 editor 的 `EventCommandListShape`）。
 */
export function createCommandListElement(options: CommandListApiOptions = {}): HTMLElement {
	const el = renderDetachedDiv('command-list');
	createCommandListApi(el, options);
	return el;
}
