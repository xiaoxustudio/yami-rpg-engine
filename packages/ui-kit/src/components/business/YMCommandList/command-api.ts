import { h, render } from 'vue';
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

const renderElement = (vnode: ReturnType<typeof h>): HTMLElement => {
	const host = document.createElement('div');
	render(vnode, host);
	const element = host.firstElementChild as HTMLElement;
	host.removeChild(element);
	return element;
};

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const cmdOrCtrlKey = (event: KeyboardEvent): boolean => (isMac ? event.metaKey : event.ctrlKey);

const macRedoKey = (event: KeyboardEvent): boolean =>
	isMac ? event.metaKey && event.shiftKey && event.code === 'KeyZ' : false;

const arrayAppend = (arr: unknown[], item: unknown): void => {
	arr[arr.length] = item;
};

const compress = (str: string): string => str.replace(/\s+/g, ' ').trim();

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
	guidMap?: Record<string, any> | (() => Record<string, any>);
	scenePresets?: Record<string, any> | (() => Record<string, any>);
	uiPresets?: Record<string, any> | (() => Record<string, any>);
}

interface LocalizeAdapter {
	language: string;
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
	commandHistory?: new (list: HTMLElement) => CommandHistory;
	clipboard?: ClipboardAdapter | null;
	settingConfig?: { config: { other: { copyAsTextKeepEmptyLine: boolean } } } | null;
	localize?: LocalizeAdapter | null;
	commandSuggestion?: { searcher: { input: HTMLInputElement } } | null;
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

export const commandListPrototype: Record<string, (...args: any[]) => any> = {
	read: function (this: HTMLElement & { [k: string]: unknown }): CommandData | null {
		return this.data as CommandData | null;
	},

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
		Promise.resolve().then(() => {
			this.scrollTop = 0;
		});
	},

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
	},

	resize: function (this: any, ...args: unknown[]): void {
		commonListResize(this);

		this.scheduleCheckVariables();
	},

	updateHeadAndFoot: function (this: HTMLElement & { [k: string]: unknown }): void {
		return commonListUpdateHeadAndFoot(this as unknown as CommonListLike);
	},

	updateOnResize: function (this: any, element: CommandItemElement): void {
		if (element.contents !== null) {
			this.updateCommandElement(element);
		}
	},

	createFoldedCommandBuffer: function (
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
			li = document.createElement('div') as unknown as CommandItemElement;
			addClass(li, 'command-item');
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
					li = document.createElement('div') as unknown as CommandItemElement;
					addClass(li, 'command-item');
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
					(li as CommandItemElement).fold = renderElement(h('command-fold'));
					addClass((li as CommandItemElement).fold!, 'command-fold');
					li.appendChild((li as CommandItemElement).fold!);
				}

				if (content.children !== undefined) {
					buffer.push(content.children);

					if (i < length) {
						li = document.createElement('div') as unknown as CommandItemElement;
						addClass(li, 'command-item');
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
					let code = content.script;
					const matches = code.match(/\n/g);
					const lines = (matches?.length ?? 0) + 1;
					if (lines > MAX_LINES) {
						let count = 0;
						const chars = code;
						const clen = chars.length;
						for (let i = 0; i < clen; i++) {
							if (chars[i] === '\n' && ++count === MAX_LINES) {
								code = chars.slice(0, i);
								break;
							}
						}
					}
					const slength = Math.min(lines, MAX_LINES + 1);
					const items = new Array(slength);
					items[0] = li;
					for (let i = 1; i < slength; i++) {
						li = document.createElement('div') as unknown as CommandItemElement;
						addClass(li, 'command-item');
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
						const text = document.createElement('div');
						addClass(text, 'text');
						text.textContent = `... ${lines} lines`;
						addClass(text, 'gray');
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

	updateCommandElement: function (this: any, element: CommandItemElement): void {
		const options = this.__options;
		element.style.textIndent = this.computeTextIndent(element.dataIndent);

		if (element.dataKey) {
			const mark = renderElement(h('command-mark-major'));
			addClass(mark, 'command-mark-major');
			mark.textContent = '>';
			element.insertBefore(mark, element.firstElementChild);
		} else {
			const mark = renderElement(h('command-mark-minor'));
			addClass(mark, 'command-mark-minor');
			mark.textContent = ':';
			element.insertBefore(mark, element.firstElementChild);
		}

		for (const content of element.contents!) {
			if (content.text !== undefined) {
				const text = document.createElement('div') as HTMLDivElement & {
					[k: string]: unknown;
				};
				addClass(text, 'command-text');
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
					text.onpointerenter = commandListStatics.textPointerenter as unknown as (
						this: GlobalEventHandlers,
						ev: PointerEvent
					) => any;
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
			const command = element.dataItem;
			const folded = !!command!.folded;
			if (element.folded !== folded) {
				element.folded = folded;
				if (folded) {
					element.fold.textContent = '+';
					if (!element.ellipsis) {
						element.ellipsis = document.createElement('div');
						addClass(element.ellipsis, 'command-text');
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
			blank = document.createElement('div') as unknown as CommandItemElement;
			addClass(blank, 'command-item');

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
		switch (lang) {
			case 'en-US':
				return indent * 4 + 'ch';
			default:
				return indent * 2 + 'em';
		}
	},

	select: function (this: any, start: number, end: number = start): void {
		if (start > end) {
			[start, end] = [end, start];
		}

		const elements = this.elements;
		const count = elements.count;
		start = clamp(start, 0, count - 1);
		end = clamp(end, 0, count - 1);
		let indent = Infinity;
		for (let i = start; i <= end; i++) {
			const { dataIndent } = elements[i];
			if (dataIndent < indent) {
				indent = dataIndent;
			}
		}
		for (let i = start; i >= 0; i--) {
			const element = elements[i];
			if (element.dataIndent === indent && element.dataKey === true) {
				start = i;
				break;
			}
		}
		for (let i = end + 1; i < count; i++) {
			const element = elements[i];
			if (
				element.dataIndent < indent ||
				(element.dataIndent === indent && element.dataKey === true)
			) {
				end = i - 1;
				break;
			}
		}
		if (start !== end) {
			const element = elements[end];
			if (!element.dataItem) {
				end--;
			}
		}

		this.unselect();

		this.start = start;
		this.end = end;
		this.origin = start;
		this.active = start;
		this.anchor = null;

		this.reselect();
	},

	selectMultiple: function (this: any, active: number): void {
		const origin = this.origin;
		this.select(origin, active);
		this.origin = origin;
		this.active = clamp(active, this.start, this.end);
	},

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

	selectUp: function (this: any): void {
		if (this.start !== null) {
			const elements = this.elements;
			const sData = elements[this.start].dataItem;
			const eData = elements[this.end].dataItem;
			let i = this.start;
			if (sData === eData) {
				while (--i >= 0) {
					if (elements[i].dataKey) {
						break;
					}
				}
			}
			this.select(i);
			this.scrollToSelection();
		}
	},

	selectDown: function (this: any): void {
		if (this.start !== null) {
			const elements = this.elements;
			const sData = elements[this.start].dataItem;
			const eData = elements[this.end].dataItem;
			let i = this.end;
			if (sData === eData) {
				const eElement = elements[i];
				if (!eElement.dataKey) {
					const data = eElement.dataItem;
					while (--i >= 0) {
						const element = elements[i];
						if (element.dataItem === data && element.dataKey === true) {
							break;
						}
					}
				}
				const { count } = elements;
				while (++i < count) {
					if (elements[i].dataKey) {
						break;
					}
				}
			}
			this.select(i);
			this.scrollToSelection();
		}
	},

	pageUp: function (this: any, select: boolean): void {
		let anchor = this.anchor;
		if (anchor === null) {
			anchor = this.active;
		}
		if (anchor !== null) {
			const scrollLines = Math.floor(this.innerHeight / 20) - 1;
			const scrollTop = Math.max(this.scrollTop - scrollLines * 20, 0);
			if (select) {
				const bottom = this.scrollTop + this.innerHeight;
				const bottomIndex = Math.floor(bottom / 20) - 1;
				const targetIndex = Math.min(anchor, bottomIndex) - scrollLines;
				this.select(targetIndex);
				this.anchor = Math.max(targetIndex, this.start);
			}
			this.scroll(0, scrollTop);
		}
	},

	pageDown: function (this: any, select: boolean): void {
		let anchor = this.anchor;
		if (anchor === null) {
			anchor = this.active;
		}
		if (anchor !== null) {
			const top = this.scrollTop;
			const scrollLines = Math.floor(this.innerHeight / 20) - 1;
			let scrollTop = top + scrollLines * 20;
			if (select) {
				const topIndex = Math.floor(top / 20);
				const targetIndex = Math.max(anchor, topIndex) + scrollLines;
				const scrollBottom = this.elements.count * 20;
				const scrollTopMax = scrollBottom - this.innerHeight;
				this.select(targetIndex);
				this.anchor = Math.min(targetIndex, this.end);
				scrollTop = Math.min(scrollTop, scrollTopMax);
			}
			this.scroll(0, Math.max(top, scrollTop));
		}
	},

	selectMultipleTo: function (this: any, index: number): void {
		if (this.start !== null) {
			this.selectMultiple(index);
			const elements = this.elements;
			const sElement = elements[this.start];
			const aElement = elements[this.active];
			const sIndent = sElement.dataIndent;
			const aIndent = aElement.dataIndent;
			let n = this.active;
			if (sIndent < aIndent) {
				for (let i = n - 1; i >= 0; i--) {
					const element = elements[i];
					if (element.dataIndent === sIndent && element.dataKey === true) {
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

	selectMultipleUp: function (this: any): void {
		if (this.start !== null) {
			const elements = this.elements;
			if (this.active <= this.origin) {
				const sElement = elements[this.start];
				const indent = sElement.dataIndent;
				let i = this.start;
				while (--i >= 0) {
					const element = elements[i];
					if (element.dataIndent <= indent && element.dataKey === true) {
						this.selectMultiple(i);
						break;
					}
				}
			} else {
				const eElement = elements[this.end];
				const data = eElement.dataItem;
				const end = this.end;
				let indent = Infinity;
				let n = this.origin;
				for (let i = n; i < end; i++) {
					const element = elements[i];
					if (element.dataIndent < indent) {
						indent = element.dataIndent;
					}
					if (
						element.dataIndent === indent &&
						element.dataItem !== data &&
						element.dataItem !== null
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

	selectMultipleDown: function (this: any): void {
		if (this.start !== null) {
			const elements = this.elements;
			if (this.active >= this.origin) {
				const eElement = elements[this.end];
				const indent = eElement.dataIndent;
				const count = elements.count;
				let i = this.end;
				while (++i < count) {
					const element = elements[i];
					if (element.dataIndent < indent) {
						i = this.getRangeByIndex(i)[1];
						break;
					}
					if (
						element.dataIndent === indent &&
						element.dataKey === true &&
						element.dataItem !== null
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
					if (element.dataIndent < indent) {
						indent = element.dataIndent;
					}
					if (element.dataIndent === indent && element.dataKey === true) {
						n = i;
					}
				}
				this.selectMultiple(n);
			}
			this.scrollToSelection();
		}
	},

	scrollToSelection: function (this: any, mode = 'active'): void {
		if (this.start !== null) {
			let scrollTop;
			switch (mode) {
				case 'active': {
					const range = this.getRangeByIndex(this.active);
					const top = this.scrollTop;
					const max = range[0] * 20;
					const min = range[1] * 20 + 20 - this.innerHeight;
					scrollTop =
						this.active <= this.origin
							? Math.min(Math.max(top, min), max)
							: Math.max(Math.min(top, max), min);
					break;
				}
				case 'alter': {
					const top = this.scrollTop;
					const max = this.active * 20;
					const min = this.active * 20 + 20 - this.innerHeight;
					scrollTop = Math.max(Math.min(top, max), min);
					break;
				}
				case 'restore': {
					const top = this.scrollTop;
					const max = this.start * 20;
					const min = this.end * 20 + 20 - this.innerHeight;
					scrollTop = Math.min(Math.max(top, min), max);
					break;
				}
				default:
					return;
			}
			if (this.scrollTop !== scrollTop) {
				this.scrollTop = scrollTop;
			}
		}
	},

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
		const count = elements.count;
		const element = elements[index];
		const data = element.dataItem;
		const indent = element.dataIndent;
		let start = index;
		let end = index;
		for (let i = index; i >= 0; i--) {
			const element = elements[i];
			if (element.dataItem === data && element.dataKey === true) {
				start = i;
				break;
			}
		}
		for (let i = index + 1; i < count; i++) {
			const element = elements[i];
			if (
				element.dataIndent < indent ||
				(element.dataIndent === indent && element.dataKey === true)
			) {
				end = i - 1;
				break;
			}
		}
		return [start, end];
	},

	getRangeByData: function (
		this: HTMLElement & { [k: string]: unknown },
		data: CommandData
	): number[] {
		const elements = this.elements as CommandItemElement[] & { count: number };
		const count = elements.count;
		let indent: number;
		let start = 0;
		let end = 0;
		for (let i = 0; i < count; i++) {
			const element = elements[i];
			if (element.dataItem === data) {
				indent = element.dataIndent;
				start = i;
				break;
			}
		}
		for (let i = start + 1; i < count; i++) {
			const element = elements[i];
			if (
				element.dataIndent < indent! ||
				(element.dataIndent === indent! && element.dataKey === true)
			) {
				end = i - 1;
				break;
			}
		}
		return [start, end];
	},

	isParentEnabled: function (
		this: HTMLElement & { [k: string]: unknown },
		element: CommandItemElement
	): boolean {
		return element.dataParent?.buffer?.enabled ?? true;
	},

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

	edit: function (this: any, data?: CommandData): void {
		const options = this.__options;
		if (this.start !== null) {
			const elements = this.elements;
			const element = elements[this.start];
			if (!this.isParentEnabled(element)) {
				return;
			}
			this.inserting = element.dataItem === null;
			switch (this.inserting) {
				case true:
					options.command?.insert(this, '');
					break;
				case false: {
					const command = element.dataItem;
					if (command!.buffer!.enabled) {
						options.command?.edit(this, command);
					}
					break;
				}
			}
		}
	},

	fold: function (this: any, element?: CommandItemElement): void {
		if (element === undefined && this.start !== null) {
			const elements = this.elements;
			const startItem = elements[this.start].dataItem;
			const endItem = elements[this.end].dataItem;
			if (startItem === endItem) {
				element = elements[this.start];
			}
		}
		if (element && element.fold) {
			const command = element.dataItem;
			if (element.dataKey && command) {
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
				command = element.dataParent;
			}
		}
		if (changed) {
			this.update();
		}
	},

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
				if (element.dataKey && element.dataItem) {
					const command = element.dataItem;
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
					parent: element.dataParent,
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
		for (const command of commands) {
			if (command.id[0] === '!') {
				command.id = command.id.slice(1);
			}
		}
	},

	disableItems: function (
		this: HTMLElement & { [k: string]: unknown },
		commands: CommandData[]
	): void {
		for (const command of commands) {
			if (command.id[0] !== '!') {
				command.id = '!' + command.id;
			}
		}
	},

	copy: function (this: any): void {
		const clipboard = this.__options.clipboard;
		if (!clipboard) return;
		if (this.start !== null) {
			const elements = this.elements;
			const sElement = elements[this.start];
			const eElement = elements[this.end];
			const list = sElement.dataList;
			const start = sElement.dataIndex;
			const end = eElement.dataIndex + 1;
			const copies = list.slice(start, end);
			if (copies.length > 0) {
				clipboard.write('yami.commands', copies);
			}
		}
	},

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
				let indent = element.dataIndent;
				if (element.dataItem === null && lastIndent === indent) {
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
			navigator.clipboard.writeText(string.trim());
		}
	},

	copyAsJSCode: function (this: any): void {
		if (this.start !== null) {
			const { start, end, elements } = this;
			const commands = [];

			for (let i = start; i <= end; i++) {
				const element = elements[i];
				if (element.contents !== null) {
					this.updateCommandElement(element);
				}

				const dataItem = element.dataItem;
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
			navigator.clipboard.writeText(jsCode);
		}
	},

	generateExecutableCode: function (
		this: HTMLElement & { [k: string]: unknown },
		commands: CommandData[]
	): string {
		const commandsJson = JSON.stringify(commands, null, 2);

		const code = `const commands = ${commandsJson};
try {
	if (typeof Command === 'undefined' || typeof EventHandler === 'undefined') {
		throw new Error('运行环境不完整');
	}
	const event = new EventHandler(Command.compile(commands));
	EventHandler.call(event);
	console.log('✓ 指令执行完成');
} catch (err) {
	console.error('✗ 执行出错:', err.message);
}`;
		return code;
	},

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
				const parent = element.dataParent;
				const list = element.dataList;
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

	delete: function (this: any): void {
		if (this.start !== null) {
			const elements = this.elements;
			const sElement = elements[this.start];
			const eElement = elements[this.end];
			const parent = sElement.dataParent;
			const list = sElement.dataList;
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

	undo: function (this: any): void {
		if (!this.dragging && this.history.canUndo()) {
			this.history.restore('undo');
		}
	},

	redo: function (this: any): void {
		if (!this.dragging && this.history.canRedo()) {
			this.history.restore('redo');
		}
	},

	save: function (this: any, command: CommandData): void {
		if (this.start !== null) {
			const elements = this.elements;
			const element = elements[this.start];
			const parent = element.dataParent;
			const list = element.dataList;
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
			const attrName = compress(
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
		const id = data?.id;
		if (id === 'callEvent' || id === '!callEvent') {
			if (data!.params.type === 'global') {
				return data!.params.eventId;
			}
		}
		return undefined;
	},

	listFocus: function (this: any, event: FocusEvent): void {
		if (!this.focusing) {
			this.focusing = true;
			this.start !== null ? this.reselect() : this.select(0);
		}
	},

	listBlur: function (this: any, event: FocusEvent): void {
		if (this.dragging) {
			this.windowPointerup(this.dragging);
		}
		if (this.focusing) {
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
		this: any,
		str: string | RegExp,
		elements: CommandItemElement[],
		searchMode: FindSearchMode = { caseInsensitive: false, regex: false, matchLine: false }
	): FindResult[] {
		if (searchMode.regex) {
			const strOri = (str as string).trim();
			try {
				str = new RegExp(
					strOri.substring(strOri.indexOf('/') + 1, strOri.lastIndexOf('/')),
					strOri.substring(strOri.lastIndexOf('/') + 1)
				);
			} catch {}
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
			if (element?.dataItem && element.dataItem.folded) {
				const { buffer } = element.dataItem;
				if (!buffer) continue;
				for (const item of buffer) {
					if (item instanceof Array) {
						const realNode = item.map(
							(v: CommandData) => v.buffer![0] as CommandItemElement
						);
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

	scrollToRow: function (this: any, targetIndex: number, position: string = 'center'): void {
		const count = this.elements.count;
		const rowHeight = 20;

		if (targetIndex < 0) targetIndex = 0;
		if (targetIndex >= count) targetIndex = count - 1;

		const ch = this.innerHeight;
		const targetRowTop = targetIndex * rowHeight;

		let targetScrollTop;
		switch (position) {
			case 'top':
				targetScrollTop = targetRowTop;
				break;
			case 'bottom':
				targetScrollTop = targetRowTop + rowHeight - ch;
				break;
			default:
				targetScrollTop = targetRowTop - ch / 2 + rowHeight / 2;
		}

		const maxScrollTop = count * rowHeight - ch;
		targetScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));

		this.scrollTop = targetScrollTop;
		this.resize(this);
	},

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
						const elements = this.elements;
						const sData = elements[this.start].dataItem;
						const eData = elements[this.end].dataItem;
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
						options.commandSuggestion?.searcher.input.focus();
					}
					break;
			}
		}
	},

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
					const sData = sElement.dataItem;
					const eData = dElement.dataItem;
					const valid = !!sData;
					const pEnabled = this.isParentEnabled(sElement);
					const sEnabled = valid ? sData.buffer.enabled : pEnabled;
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

	doubleclick: function (this: any, event: MouseEvent): void {
		if (this.start !== null && !hasClass(event.target as HTMLElement | null, 'command-fold')) {
			const elements = this.elements;
			const sData = elements[this.start].dataItem;
			const eData = elements[this.end].dataItem;
			if (sData === eData) {
				this.edit(sData);
			}
		}
	},

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

	windowVariableChange: function (this: any, event: Event): void {
		if (this.read()) {
			this.scheduleCheckVariables();
		}
	}
};

export function createCommandListApi(
	el: HTMLElement,
	options: CommandListApiOptions = {}
): HTMLElement {
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

export function createCommandListElement(options: CommandListApiOptions = {}): HTMLElement {
	const el = document.createElement('div');
	el.classList.add('command-list');
	createCommandListApi(el, options);
	return el;
}
