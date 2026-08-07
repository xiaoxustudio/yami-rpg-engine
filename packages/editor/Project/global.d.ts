/// <reference types="vite/client" />

// 全局类型扩展声明 本文件集中声明 src/legacy/util/ 各模块对内置对象 / window 的新增成员类型, 避免 TS2339 / TS2551 报错。所有扩展均来自 util/*.ts 的实际运行时挂载。

// 注：本文件保持 ambient script（无顶层 import/export），interface 声明才能自动合并到全局。故 EditorEvent 别名在此内联，不 import types/editor-event.ts（顶层 import 会破坏 ambient 语义）。
type EditorEvent =
	| KeyboardEvent
	| MouseEvent
	| PointerEvent
	| DragEvent
	| WheelEvent
	| InputEvent
	| Event;

interface Clipboard {
	has(format: string): boolean;
	read(format: string): any;
	write(format: string, object: any): void;
}

interface Math {
	clamp(number: number, minimum: number, maximum: number): number;
	roundTo(number: number, decimalPlaces: number): number;
	dist(x1: number, y1: number, x2: number, y2: number): number;
	randomBetween(value1: number, value2: number): number;
	radians(degrees: number): number;
	degrees(radians: number): number;
	modDegrees(degrees: number, period?: number): number;
	modRadians(radians: number, period?: number): number;
}

interface ArrayConstructor {
	empty: any[];
	subtract<T>(a: T[], b: T[]): T[];
}

interface Array<T> {
	append(value: T): boolean;
	remove(value: T): boolean;
	set(array: Array<T>): void;
}

interface StringConstructor {
	compress(string: string): string;
}

interface NumberConstructor {
	computeIndexDigits(length: number): number;
	padZero(number: number, length: number, padString?: string): string;
}

interface ObjectConstructor {
	empty: Record<string, never>;
	clone<T>(object: T): T;
}

interface RegExpConstructor {
	number: RegExp;
}

interface MouseEvent {
	getRelativeCoords(element: HTMLElement): { x: number; y: number };
}

interface PointerEvent {
	relate(event: PointerEvent): boolean;
}

interface NodeList {
	enable(): void;
	disable(): void;
}

interface FunctionConstructor {
	empty: () => void;
}

declare namespace CSS {
	function encodeURL(url: string): string;
	function rasterize(...args: any[]): any;
	function getDevicePixelContentBoxSize(element: HTMLElement): {
		width: number;
		height: number;
	};
}

interface CanvasRenderingContext2D {
	drawAndFitImage(
		image: CanvasImageSource,
		sx: number,
		sy: number,
		sw: number,
		sh: number,
		dx: number,
		dy: number,
		dw: number,
		dh: number
	): void;
	resize(width: number, height: number): void;
}

interface DataTransfer {
	hideDragImage(): void;
}

interface HTMLElement {
	count: number;
	test(name: string): RegExp;
	direction: number;
	// ScrollBar / CommandList 共用的滚动监听方法（scroll-listener.ts 中挂载到 HTMLElement.prototype）
	addScrollListener: (...args: any[]) => any;
	removeScrollListener: (...args: any[]) => any;
	// element-utils.ts 中 read/write 访问 dataValue；addScrollbars / listenDraggingScrollbarEvent 运行时赋值下列实例成员
	dataValue: boolean | string | number | Record<string, any> | null;
	seekUp(tagName: string, count?: number): HTMLElement | null;
	beginScrolling(): void;
	endScrolling(): void;
	setScroll(left: number, top: number): void;
	setScrollLeft(left: number): void;
	setScrollTop(top: number): void;
	updateScrollbars(): void;
	scrollPointerup: (event: EditorEvent) => void;
	scrollPointermove: (event: EditorEvent) => void;
	scrollPointerdown?: (event: EditorEvent) => void;
	dragging: Record<string, any> | null;
	// scroll-bar.ts 中 ScrollBar 类方法（addScrollbars 内 hBar/vBar 调用）
	bind(...args: unknown[]): unknown;
	updateHorizontalBar(): void;
	updateVerticalBar(): void;
	// file-body-pane.ts 中局使用
	isImageChanged: () => boolean;
	content: HTMLElement;
	// parameter-pane.ts 中局使用（container/row 元素属性）
	parameters: any;
	key: any;
	wraps: any[];
	// tab-bar.ts 中局使用（items[i].item / popup menu 元素属性）
	item: Record<string, any> | null;
	value: any;
	clientX: number;
	clientY: number;
	// file-head-pane.ts 中局使用（elFolder/elArrow/head 元素属性）
	file: any;
	folders: any[];
	target: any;
	links: any;
	// toast.ts 中局使用（el._timer 挂载 setTimeout 句柄）
	_timer: any;
	// file-browser.ts 中局使用（sFile.stats.ino 取文件 inode）
	stats: { ino: number };
	// ---- legacy 命令式组件扩展（types/element-extensions.ts 合并）----
	// ---- 数据挂载（可选——运行时动态）----
	start?: number;
	selection?: HTMLElement | Record<string, any> | null;
	activeFile?: Record<string, any> | null;
	selectionIndex?: number;
	lastScrollTop?: number;
	decimals?: number;
	initialized?: boolean;
	src?: string;
	filter?: string | null;
	input?: HTMLElement | Record<string, any> | null;
	page?: Record<string, any> | null;
	creators?: unknown[];
	updaters?: unknown[];
	dataItems?: unknown[] | null;
	head?: HTMLElement | Record<string, any> | null;
	strBox?: HTMLElement | null;
	create(...args: unknown[]): any;
	rename(...args: unknown[]): any;
	sort(...args: unknown[]): any;
	removable?: boolean;
	renamable?: boolean;
	togglable?: boolean;
	onCreate?: unknown;
	onDelete?: unknown;
	onRemove?: unknown;
	onResume?: unknown;
	saveSelection(...args: unknown[]): any;
	restoreSelection(...args: unknown[]): any;
	updateNodeElement(...args: unknown[]): any;
	addElementClass(...args: unknown[]): any;
	updateTextNode(...args: unknown[]): any;
	createKeyTextNode(...args: unknown[]): any;
	updateKeyTextNode(...args: unknown[]): any;
	createIcon: (item: unknown) => unknown;
	createText: (item: unknown) => unknown;
	createRefCount(...args: unknown[]): any;
	createComment: (item: unknown) => unknown;
	updateToggleStyle(...args: unknown[]): any;
	createEditIcon(...args: unknown[]): any;
	updateHead: () => unknown;
	updateItemName: (item: unknown) => unknown;
	updateIcon: (item: unknown) => unknown;
	updateVisibilityIcon(...args: unknown[]): any;
	updateLockIcon(...args: unknown[]): any;
	createItem(...args: unknown[]): any;
	deleteItem(...args: unknown[]): any;
	getItemByProperties(...args: unknown[]): any;
	addNodeTo(...args: unknown[]): any;
	cancelSearch(...args: unknown[]): any;
	searchNodesDebounced(...args: unknown[]): any;
	createFolder(...args: unknown[]): any;
	createMarks(...args: unknown[]): any;
	updateMarks(...args: unknown[]): any;
	createInitText(...args: unknown[]): any;
	updateInitText(...args: unknown[]): any;
	createGroupText(...args: unknown[]): any;
	updateGroupText(...args: unknown[]): any;
	createConditionIcon(...args: unknown[]): any;
	updateConditionIcon(...args: unknown[]): any;
	createEventIcon(...args: unknown[]): any;
	updateEventIcon(...args: unknown[]): any;
	createNoteIcon(...args: unknown[]): any;
	updateNoteIcon(...args: unknown[]): any;
	createScriptIcon(...args: unknown[]): any;
	updateScriptIcon(...args: unknown[]): any;
	createLockIcon(...args: unknown[]): any;
	createVisibilityIcon(...args: unknown[]): any;
	createAttribute(...args: unknown[]): any;
	parseName(...args: unknown[]): any;
	synchronize(...args: unknown[]): any;
	setMaxLength(...args: unknown[]): any;
	updateItem(...args: unknown[]): any;
	updateItemClass(...args: unknown[]): any;
	update(...args: unknown[]): any;
	write2(...args: unknown[]): any;
	write?(value: any): any;
	writeDefault(...args: unknown[]): any;
	on(...args: unknown[]): any;
	loadItems(...args: unknown[]): any;
	setItemNames(...args: unknown[]): any;
	setPlaceholder(...args: unknown[]): any;
	setTitle(...args: unknown[]): any;
	enableHiddenMode(...args: unknown[]): any;
	relate(...args: unknown[]): any;
	addCloseButton(...args: unknown[]): any;
	deleteInputContent(...args: unknown[]): any;
	getFocus(...args: unknown[]): any;
	getContext(...args: unknown[]): any;
	createTooltip(...args: unknown[]): any;
	selectDefaultCommand(...args: unknown[]): any;
	save(...args: unknown[]): any;
	load(...args: unknown[]): any;
	reset(...args: unknown[]): any;
	resize(...args: unknown[]): any;
	reload(...args: unknown[]): any;
	duplicate(...args: unknown[]): any;
	copy(...args: unknown[]): any;
	paste(...args: unknown[]): any;
	cut(...args: unknown[]): any;
	delete(...args: unknown[]): any;
	edit(...args: unknown[]): any;
	toggle(...args: unknown[]): any;
	insert(...args: unknown[]): any;
	unselect(...args: unknown[]): any;
	initialize(...args: unknown[]): any;
	clear(...args: unknown[]): unknown;
	select(...args: unknown[]): any;
	selectIndex: (index: number) => unknown;
	scrollToSelection(...args: unknown[]): any;
	expandToSelection(...args: unknown[]): any;
	restoreScroll(...args: unknown[]): any;
	saveScroll(...args: unknown[]): any;
	restore(...args: unknown[]): any;
	restoreRecursiveStates(...args: unknown[]): any;
	setRecursiveStates(...args: unknown[]): any;
}

interface TextBox extends HTMLElement {
	lastText: string;
	hiddenNodes: any[];
	// module/resource.ts 中局使用（textbox.input.readOnly 访问内部 input 元素）
	input: HTMLInputElement;
}

interface PlatformPath {
	slash: (path: string) => string;
}

interface Window {
	config: any;
	on: (
		eventName: string,
		handler: (event: EditorEvent) => void,
		options?: boolean | AddEventListenerOptions
	) => void;
	off: (
		eventName: string,
		handler: (event: EditorEvent) => void,
		options?: boolean | EventListenerOptions
	) => void;
	spaceKey: boolean;
}

interface Event {
	spaceKey: boolean;
	cmdOrCtrlKey: boolean;
	doubleclickProcessed: boolean;
	// file-body-pane.ts 中局使用（popup menu 的原始事件）
	raw: any;
	// param-list.ts 中局使用（event.latest）
	latest: any;
	value: any;
	// select-box.ts 中局使用（input 事件挂载 .last）
	last: any;
}

interface HTMLElement {
	_paddingTop: number;
	innerHeight: number;
	dataValue: any;
	dataIndex: any;
	dataKey: any;
	dataParent: any;
	dataList: any;
	dataItem: any;
	dataIndent: any;
	contents: any[];
	varSpace: any;
	varType: any;
	varKey: any;
	varId: any;
	varMap: any;
	varList: any;
	currentType: any;
	script: any;
	rect: any;
	path: any;
	data: any;
	value: any;
	name: string;
	fileBox: any;
	history: any;
	links: any;
	submenu: any;
	dragging: any;
	restoring: boolean;
	_built: boolean;
	_initialized: boolean;
	_checkVariablesScheduled: boolean;
	windowVariableChange: (event: EditorEvent) => void;
	speedX: number;
	speedY: number;
	complete: boolean;
	start: number;
	back: any;
	item: any;
	elements: any[];
}

interface Element {
	addClass(name: string): boolean;
	removeClass(name: string): boolean;
	hasClass(name: string): boolean;
	varType: any;
	varKey: any;
	varId: any;
	varSpace: any;
	currentType: any;
	focus(): void;
	blur(): void;
	show(...args: any[]): any;
	hide(...args: any[]): any;
	// parameter-pane.ts 中局使用（rowsEl.children 迭代为 Element，需访问 .wraps）
	wraps: any[];
	// transition-window.ts 中局使用（keyTextNode = createElement('text') 为 Element，需访问 .key）
	key: any;
}

interface ParentNode {
	rect: any;
	read(...args: any[]): any;
	directory: any;
	activeWheel: any;
	inputCode(code: any): void;
	// file-head-pane.ts 中局使用（head = this.parentNode 为 ParentNode，需访问 .links）
	links: any;
	textNode: any;
}

interface ChildNode {
	querySelector(selectors: string): HTMLElement | null;
	tagName: string;
	getAttribute(name: string): string | null;
	dataValue: any;
	// tab-bar.ts 中局使用（items[i] 为 ChildNode，需访问 .item）
	item: any;
	// menu-list.ts 中局使用（li 为 ChildNode，需访问 .label/.accelerator）
	label: any;
	accelerator: any;
}

interface Event {
	target: HTMLElement;
	cmdOrCtrlKey: boolean;
	doubleclickProcessed: boolean;
	value: any;
	clientX: number;
	clientY: number;
	lastValue: any;
	key: any;
	last: any;
	button: number;
	altKey: boolean;
	mode: any;
	scrollLeft: number;
	scrollTop: number;
}

interface KeyboardEvent {
	cmdOrCtrlKey: boolean;
}

interface NodeList {
	// tab-bar.ts 中局使用（this.childNodes 解构 { item }）
	item: any;
}

interface MouseEvent {
	getRelativeCoords(element: HTMLElement): { x: number; y: number };
}

interface PointerEvent {
	relate(event: PointerEvent): boolean;
}

interface String {
	test(name: string): RegExp;
}

interface StringConstructor {
	compress(string: string): string;
}

interface RegExpConstructor {
	number: RegExp;
}

interface NumberConstructor {
	computeIndexDigits(length: number): number;
	padZero(number: number, length: number, padString?: string): string;
}

interface ObjectConstructor {
	empty: Record<string, never>;
	clone<T>(object: T): T;
}

interface HTMLButtonElement {
	enable(): void;
	disable(): void;
}

interface HTMLInputElement {
	getFocus(mode?: string): HTMLInputElement;
}

interface TimerStatic {
	timers: any[];
	updaters: {
		stageAnimation: ((deltaTime: number) => void) | null;
		stageRendering: ((deltaTime: number) => void) | null;
		sharedAnimation: ((deltaTime: number) => void) | null;
		sharedRendering: ((deltaTime: number) => void) | null;
		sharedRendering2: ((deltaTime: number) => void) | null;
	};
	timestamp: number;
	deltaTime: number;
	frameCount: number;
	frameTime: number;
	tpf: number;
	animationIndex: number;
	animationWaiting: number;
	initialize: ((this: TimerStatic) => void) | null;
	start: ((timestamp: number) => void) | null;
	update: ((timestamp: number) => void) | null;
	play: ((this: TimerStatic) => void) | null;
	appendUpdater: ((key: string, updater: (deltaTime: number) => void) => void) | null;
	removeUpdater: ((key: string, updater: (deltaTime: number) => void) => void) | null;
}

declare module 'xml2js';
declare module 'koa';
declare module 'mime-types';
declare module 'qrcode';
declare module 'yauzl';
declare module 'markdown-it';
