/// <reference types="vite/client" />

// 鍏ㄥ眬绫诲瀷鎵╁睍澹版槑 鏈枃浠堕泦涓０鏄?src/utils/ 鍚勬ā鍧楀鍐呯疆瀵硅薄 / window 鐨勬柊澧炴垚鍛樼被鍨? 閬垮厤 TS2339 / TS2551 鎶ラ敊銆傛墍鏈夋墿灞曞潎鏉ヨ嚜 utils/*.ts 鐨勫疄闄呰繍琛屾椂鎸傝浇銆?

// 娉細鏈枃浠朵繚鎸?ambient script锛堟棤椤跺眰 import/export锛夛紝interface 澹版槑鎵嶈兘鑷姩鍚堝苟鍒板叏灞€銆傛晠 EditorEvent 鍒悕鍦ㄦ鍐呰仈锛屼笉 import types/editor-event.ts锛堥《灞?import 浼氱牬鍧?ambient 璇箟锛夈€?
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
	// ScrollBar / CommandList 鍏辩敤鐨勬粴鍔ㄧ洃鍚柟娉曪紙scroll-listener.ts 涓寕杞藉埌 HTMLElement.prototype锛?
	addScrollListener: (...args: any[]) => any;
	removeScrollListener: (...args: any[]) => any;
	// element-utils.ts 涓?read/write 璁块棶 dataValue锛沘ddScrollbars / listenDraggingScrollbarEvent 杩愯鏃惰祴鍊间笅鍒楀疄渚嬫垚鍛?
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
	// scroll-bar.ts 涓?ScrollBar 绫绘柟娉曪紙addScrollbars 鍐?hBar/vBar 璋冪敤锛?
	bind(...args: unknown[]): unknown;
	updateHorizontalBar(): void;
	updateVerticalBar(): void;
	// file-body-pane.ts 涓眬浣跨敤
	isImageChanged: () => boolean;
	content: HTMLElement;
	// parameter-pane.ts 涓眬浣跨敤锛坈ontainer/row 鍏冪礌灞炴€э級
	parameters: any;
	key: any;
	wraps: any[];
	// tab-bar.ts 涓眬浣跨敤锛坕tems[i].item / popup menu 鍏冪礌灞炴€э級
	item: Record<string, any> | null;
	value: any;
	clientX: number;
	clientY: number;
	// file-head-pane.ts 涓眬浣跨敤锛坋lFolder/elArrow/head 鍏冪礌灞炴€э級
	file: any;
	folders: any[];
	target: any;
	links: any;
	// toast.ts 涓眬浣跨敤锛坋l._timer 鎸傝浇 setTimeout 鍙ユ焺锛?
	_timer: any;
	// file-browser.ts 涓眬浣跨敤锛坰File.stats.ino 鍙栨枃浠?inode锛?
	stats: { ino: number };
	// ---- legacy 鍛戒护寮忕粍浠舵墿灞曪紙types/element-extensions.ts 鍚堝苟锛?---
	// ---- 鏁版嵁鎸傝浇锛堝彲閫夆€斺€旇繍琛屾椂鍔ㄦ€侊級----
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
	// module/resource.ts 涓眬浣跨敤锛坱extbox.input.readOnly 璁块棶鍐呴儴 input 鍏冪礌锛?
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
	// file-body-pane.ts 涓眬浣跨敤锛坧opup menu 鐨勫師濮嬩簨浠讹級
	raw: any;
	// param-list.ts 涓眬浣跨敤锛坋vent.latest锛?
	latest: any;
	value: any;
	// select-box.ts 涓眬浣跨敤锛坕nput 浜嬩欢鎸傝浇 .last锛?
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
	contents: { text?: string; color?: string; fold?: boolean }[];
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
	elements: any[] & {
		versionId?: number;
		count?: number;
		start?: number;
		end?: number;
		head?: unknown;
		foot?: unknown;
	};
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
	// parameter-pane.ts 涓眬浣跨敤锛坮owsEl.children 杩唬涓?Element锛岄渶璁块棶 .wraps锛?
	wraps: any[];
	// transition-window.ts 涓眬浣跨敤锛坘eyTextNode = createElement('text') 涓?Element锛岄渶璁块棶 .key锛?
	key: any;
}

interface ParentNode {
	rect: any;
	read(...args: any[]): any;
	directory: any;
	activeWheel: any;
	inputCode(code: any): void;
	// file-head-pane.ts 涓眬浣跨敤锛坔ead = this.parentNode 涓?ParentNode锛岄渶璁块棶 .links锛?
	links: any;
	textNode: any;
}

interface ChildNode {
	querySelector(selectors: string): HTMLElement | null;
	tagName: string;
	getAttribute(name: string): string | null;
	dataValue: any;
	// tab-bar.ts 涓眬浣跨敤锛坕tems[i] 涓?ChildNode锛岄渶璁块棶 .item锛?
	item: any;
	// menu-list.ts 涓眬浣跨敤锛坙i 涓?ChildNode锛岄渶璁块棶 .label/.accelerator锛?
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
	// tab-bar.ts 涓眬浣跨敤锛坱his.childNodes 瑙ｆ瀯 { item }锛?
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
	timers: unknown[];
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
