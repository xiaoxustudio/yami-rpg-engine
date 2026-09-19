export interface EventCommandShape {
	id: string;
	params: { type: string; eventId?: string; [k: string]: unknown };
	[k: string]: unknown;
}

export interface EventCommands extends Array<EventCommandShape> {
	symbol?: symbol;
	eventId?: string;
	history: {
		saveState(): void;
		restoreState(): boolean;
		stack: { commands: EventCommands }[];
	};
}

export interface EventEditorEventShape {
	type: string;
	enabled: boolean;
	commands: EventCommands;
	[k: string]: unknown;
}

export interface EventListItem {
	id: string;
	name: string;
	class: string;
	type: string;
	filter: string;
	commands: EventCommands | null;
	meta: unknown;
	event: EventEditorEventShape;
	callback: (() => void) | null;
	changed: boolean;
	inserting: boolean;
	element: HTMLElement & {
		item?: EventListItem;
	};
}

export interface EventRelatedContext {
	filter: string;
	id?: string;
	name?: string;
	event?: EventEditorEventShape;
}

export interface EventEditorList {
	unselect(): void;
	addNodeTo(item: EventListItem, parent: EventListItem | null): void;
	initialize(): void;
	expandToSelection(focus?: boolean): void;
	deleteNode(data: EventListItem): void;
	lastScrollTop: number;
	selectIndex: ((index: number) => void) | null;
	close: ((item?: EventListItem) => void) | null;
	closeMultiple: ((items: EventListItem[], callback?: () => void) => void) | null;
	closeBelow: ((item: EventListItem) => void) | null;
	closeOthers: ((item: EventListItem) => void) | null;
	closeAll: (() => void) | null;
	saveScroll: (() => void) | null;
	restoreScroll: (() => void) | null;
	defineProperties: ((item: { id: string }) => EventListItem) | null;
	createLocalEventItem:
		| ((
				inserting: boolean,
				filter: string,
				name: string,
				event: EventEditorEventShape,
				callback: (() => void) | null
		  ) => EventListItem)
		| null;
	createGlobalEventItem: ((guid: string) => EventListItem) | null;
	updateItemName: ((item: EventListItem) => void) | null;
	removable: boolean;
	foldable: boolean;
	creators: unknown[];
	updaters: unknown[];
	bind(getter: () => EventListItem[] | null): void;
	on(type: string, listener: (event: Event) => void, options?: AddEventListenerOptions): void;
	off(type: string, listener: (event: Event) => void, options?: EventListenerOptions): void;
	resize(): void;
	update(): void;
	hide(): HTMLElement | void;
	show(): HTMLElement | void;
	hasClass(name: string): boolean;
	addClass(name: string): void;
	removeClass(name: string): void;
	getFocus(): void;
	read(): unknown;
	select(item: EventListItem): void;
	scrollToSelection(mode?: string): void;
	deleteNodeParameters(data: EventListItem): void;
	scrollToHome(): void;
	scrollToEnd(): void;
	style: CSSStyleDeclaration;
	textContent: string;
	parentNode: Node & { item?: EventListItem };
	contains(node: Node | null): boolean;
	data: EventListItem[];
	item?: EventListItem;
	class: string;
	filter: string;
	type: string;
	name: string;
	meta?: unknown;
	event?: EventEditorEventShape;
	callback?: (() => void) | null;
	inserting?: boolean;
	changed?: boolean;
	active: number | null;
	varList?: unknown[];
	commandList?: unknown;
}

/**
 * P2b-1：命令列表的形状现在**派生自 ui-kit 的元素 API 契约**（`CommandListElementApi`），
 * 只额外补上 editor 侧才关心的字段（如 `elements.count` 这种渲染簿记）。
 * 这样"元素上有哪些方法"只有一份定义，拼写错误会在编译期暴露。
 */
export type EventCommandListShape = HTMLElement &
	CommandListElementApi & {
		innerHeight?: number;
		resize(): void;
		elements: unknown[] & { count: number };
		deleteCommandBuffers(commands: EventCommands): void;
	};

// oxlint-disable-next-line no-explicit-any
export type EventEditorMethod = ((...args: any[]) => any) | null;

export interface EventEditorShape {
	state: string | null;
	target: Record<string, unknown> | null;
	planToSave: ((meta?: Record<string, unknown>) => void) | null;
	open: ((id: string) => void) | null;
	close: ((id?: string) => void) | null;

	list: HTMLElement & EventEditorList;
	commandList: EventCommandListShape;
	outerGutter: HTMLElement;
	innerGutter: HTMLElement;
	closing: boolean;
	data: EventListItem[] | null;
	caches: EventCommands[];
	// oxlint-disable-next-line no-explicit-any
	types: Record<string, any[]>;
	_initialized?: boolean;
	initialize: (() => void) | null;
	openLocalEvent: EventEditorMethod;
	openGlobalEvent: EventEditorMethod;
	openRelatedEvents: EventEditorMethod;
	findRelatedEvents: EventEditorMethod;
	getAllLocalEvents: EventEditorMethod;
	clearAllEventClasses: EventEditorMethod;
	clearRelatedEventClasses: EventEditorMethod;
	save: EventEditorMethod;
	isChanged: EventEditorMethod;
	getItemById: EventEditorMethod;
	getItemByEvent: EventEditorMethod;
	openCommandList: EventEditorMethod;
	closeCommandList: EventEditorMethod;
	unpackOpenEvents: EventEditorMethod;
	packOpenEvents: EventEditorMethod;
	resizeGutter: EventEditorMethod;
	updateGutter: EventEditorMethod;
	appendCommandsToCaches: EventEditorMethod;
	fetchCommandBuffer: EventEditorMethod;
	clearCommandBuffers: EventEditorMethod;
	getGlobalEventName: EventEditorMethod;
	windowLocalize: EventEditorMethod;
	windowClose: EventEditorMethod;
	windowClosed: EventEditorMethod;
	windowResize: EventEditorMethod;
	windowKeydown: EventEditorMethod;
	windowKeyup: EventEditorMethod;
	windowPointermove: EventEditorMethod;
	listPointerdown: EventEditorMethod;
	listSelect: EventEditorMethod;
	listPopup: EventEditorMethod;
	typeInput: EventEditorMethod;
	commandListChange: EventEditorMethod;
	commandListUpdate: EventEditorMethod;
	commandListScroll: EventEditorMethod;
	confirm: EventEditorMethod;
	apply: EventEditorMethod;
}

export const EventEditor = {
	closing: false,
	data: null,
	caches: [],
	initialize: null,
	openLocalEvent: null,
	openGlobalEvent: null,
	openRelatedEvents: null,
	findRelatedEvents: null,
	getAllLocalEvents: null,
	clearAllEventClasses: null,
	clearRelatedEventClasses: null,
	save: null,
	isChanged: null,
	getItemById: null,
	getItemByEvent: null,
	openCommandList: null,
	closeCommandList: null,
	unpackOpenEvents: null,
	packOpenEvents: null,
	resizeGutter: null,
	updateGutter: null,
	appendCommandsToCaches: null,
	fetchCommandBuffer: null,
	clearCommandBuffers: null,
	getGlobalEventName: null,
	windowLocalize: null,
	windowClose: null,
	windowClosed: null,
	windowResize: null,
	windowKeydown: null,
	windowKeyup: null,
	windowPointermove: null,
	listPointerdown: null,
	listSelect: null,
	listPopup: null,
	typeInput: null,
	commandListChange: null,
	commandListUpdate: null,
	commandListScroll: null,
	confirm: null,
	apply: null,
	state: null as string | null,
	target: null as Record<string, unknown> | null,
	planToSave: null as ((meta?: Record<string, unknown>) => void) | null,
	open: null as ((id: string) => void) | null,
	close: null as ((id?: string) => void) | null
} satisfies Partial<EventEditorShape> as Partial<EventEditorShape> as EventEditorShape;

const eventEditorBridgeKeys = ['closing'] as const;
import { getEventEditorStore } from '@app/stores/event-editor';
// P2b-1：类型化元素 API 契约（与文件末尾的 import 同批，避免循环依赖）
import type { CommandListElementApi } from '@ui-kit';

for (const key of eventEditorBridgeKeys) {
	Object.defineProperty(EventEditor, key, {
		get: () => getEventEditorStore()[key],
		set: (value: unknown) => {
			(getEventEditorStore() as unknown as Record<string, unknown>)[key] = value;
		},
		configurable: true
	});
}
