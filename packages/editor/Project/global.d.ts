/// <reference types="vite/client" />

// 全局类型增强声明。
//
// 本文件把"本仓库在**内置对象 / 宿主对象**上加的成员"集中声明出来，
// 供 `src/utils/*.ts` 等模块的运行期挂载使用，避免 TS2339 / TS2551。
//
// ⚠️ 本文件是**全局兜底**，也是最容易掩盖真实缺陷的地方：
// P4b 删掉 `HTMLElement.prototype` 上的元素数据访问器之后，正是这里的
// 同名声明让 `el.<已退役字段>` **依旧编译通过、运行期静默 undefined**。
// 因此遵循三条规矩：
//
//   1. **只有确有运行期实现的成员才允许出现在这里**，且每条的出处见其下方
//      `// → <文件>:<行>` 注释（由 `scripts/global-types-audit.mjs` 生成）。
//   2. 新增声明前先跑 `node scripts/global-types-audit.mjs`——它会报出
//      `dead`（0 引用）/ `dup`（重复声明）/ `testonly`（只在测试里被实现）
//      三类不该留的项。
//   3. 删声明时**用 `tsc` 当审计器**：`.d.ts` 零运行期影响，所以编译错误
//      逐条都是"仍在依赖全局兜底"的真实站点，必须逐条定性再改。
//
// 现状（2026-09-17 实测）：24 个接口块 / 220 条声明；其中 73 条已标注实现出处。
// 把这份兜底彻底拆掉需改动 **596 个类型站点**（2026-09-17 复核，原记 591；口径：把 DOM
// 接口块——`HTMLElement`×2/`Element`/`ParentNode`/`ChildNode`/`Event`×2/`Window`/`TextBox`/
// `PointerEvent`/`KeyboardEvent`/`HTMLButtonElement`/`HTMLInputElement`——整体注释掉后
// `tsc` strict 报出的错误行数；连内建构造器块一起注释则为 1001），属 P2b（元素 API
// 契约化）的范围，不在本轮。
//
// 注：本文件保持 ambient script（无顶层 import/export），interface 声明才能自动
// 合并到全局。故 EditorEvent 别名在此内联，不 import types/editor-event.ts
// （顶层 import 会破坏 ambient 语义）。
type EditorEvent =
	| KeyboardEvent
	| MouseEvent
	| PointerEvent
	| DragEvent
	| WheelEvent
	| InputEvent
	| Event;

interface Math {
	clamp(number: number, minimum: number, maximum: number): number;
	// → packages/editor/src/utils/math.ts:36
	roundTo(number: number, decimalPlaces: number): number;
	// → packages/editor/src/utils/math.ts:37
	dist(x1: number, y1: number, x2: number, y2: number): number;
	// → packages/editor/src/utils/math.ts:38
	randomBetween(value1: number, value2: number): number;
	// → packages/editor/src/utils/math.ts:39
	radians(degrees: number): number;
	// → packages/editor/src/utils/math.ts:40
	degrees(radians: number): number;
	// → packages/editor/src/utils/math.ts:41
	modDegrees(degrees: number, period?: number): number;
	// → packages/editor/src/utils/math.ts:42
	modRadians(radians: number, period?: number): number;
	// → packages/editor/src/utils/math.ts:43
}

interface ArrayConstructor {
	empty: any[];
	// → packages/editor/src/utils/array.ts:31
	subtract<T>(a: T[], b: T[]): T[];
}

interface Array<T> {
	append(value: T): boolean;
	// → packages/editor/src/utils/array.ts:34
	remove(value: T): boolean;
	// → packages/editor/src/utils/array.ts:45
	set(array: Array<T>): void;
	// → packages/editor/src/utils/array.ts:57
}

interface StringConstructor {
	compress(string: string): string;
	// → packages/editor/src/utils/string.ts:1
}

interface NumberConstructor {
	computeIndexDigits(length: number): number;
	// → packages/editor/src/utils/number.ts:1
	padZero(number: number, length: number, padString?: string): string;
	// → packages/editor/src/utils/number.ts:5
}

interface ObjectConstructor {
	empty: Record<string, never>;
	// → packages/editor/src/utils/object.ts:20
	clone<T>(object: T): T;
}

interface RegExpConstructor {
	number: RegExp;
	// → packages/editor/src/utils/regexp.ts:1
}

interface PointerEvent {
	relate(event: PointerEvent): boolean;
}

interface FunctionConstructor {
	empty: () => void;
	// → packages/editor/src/utils/function.ts:1
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
	resize(width: number, height: number): void;
	// → packages/editor/src/engine/webgl/webgl-methods.ts:1739
}

interface HTMLElement {
	test(name: string): RegExp;
	// ScrollBar / CommandList 鍏辩敤鐨勬粴鍔ㄧ洃鍚柟娉曪紙scroll-listener.ts 涓寕杞藉埌 HTMLElement.prototype锛?
	addScrollListener: (...args: any[]) => any;
	removeScrollListener: (...args: any[]) => any;
	// element-utils.ts 涓?read/write 璁块棶 dataValue锛沘ddScrollbars / listenDraggingScrollbarEvent 杩愯鏃惰祴鍊间笅鍒楀疄渚嬫垚鍛?
	beginScrolling(): void;
	endScrolling(): void;
	setScroll(left: number, top: number): void;
	setScrollLeft(left: number): void;
	setScrollTop(top: number): void;
	updateScrollbars(): void;
	scrollPointerup: (event: EditorEvent) => void;
	scrollPointermove: (event: EditorEvent) => void;
	scrollPointerdown?: (event: EditorEvent) => void;
	// scroll-bar.ts 涓?ScrollBar 绫绘柟娉曪紙addScrollbars 鍐?hBar/vBar 璋冪敤锛?
	bind(...args: unknown[]): unknown;
	// → packages/ui-kit/src/components/basic/YMScrollBar/scroll-bar-api.ts:178 packages/ui-kit/src/components/business/YMParameterPane/YMParameterPane.vue:992 packages/ui-kit/src/components/business/YMParamList/YMParamList.vue:1266
	updateHorizontalBar(): void;
	// → packages/ui-kit/src/components/basic/YMScrollBar/scroll-bar-api.ts:178
	updateVerticalBar(): void;
	// → packages/ui-kit/src/components/basic/YMScrollBar/scroll-bar-api.ts:178
	// file-body-pane.ts 涓眬浣跨敤
	isImageChanged: () => boolean;
	content: HTMLElement;
	// parameter-pane.ts 涓眬浣跨敤锛坈ontainer/row 鍏冪礌灞炴€э級
	wraps: any[];
	// tab-bar.ts 涓眬浣跨敤锛坕tems[i].item / popup menu 鍏冪礌灞炴€э級
	value: any;
	clientX: number;
	clientY: number;
	// file-head-pane.ts 涓眬浣跨敤锛坋lFolder/elArrow/head 鍏冪礌灞炴€э級
	file: any;
	folders: any[];
	// toast.ts 涓眬浣跨敤锛坋l._timer 鎸傝浇 setTimeout 鍙ユ焺锛?
	// file-browser.ts 涓眬浣跨敤锛坰File.stats.ino 鍙栨枃浠?inode锛?
	stats: { ino: number };
	// ---- legacy 鍛戒护寮忕粍浠舵墿灞曪紙types/element-extensions.ts 鍚堝苟锛?---
	// ---- 鏁版嵁鎸傝浇锛堝彲閫夆€斺€旇繍琛屾椂鍔ㄦ€侊級----
	activeFile?: Record<string, any> | null;
	selectionIndex?: number;
	lastScrollTop?: number;
	initialized?: boolean;
	src?: string;
	input?: HTMLElement | Record<string, any> | null;
	// → packages/ui-kit/src/components/basic/YMCheckBox/check-box-api.ts:164 packages/ui-kit/src/components/basic/YMColorBox/color-box-api.ts:136 packages/ui-kit/src/components/basic/YMColorBox/YMColorBox.vue:193 packages/ui-kit/src/components/basic/YMRadioBox/radio-box-api.ts:181 packages/ui-kit/src/components/basic/YMSelectBox/select-box-api.ts:230 packages/ui-kit/src/components/basic/YMSelectBox/YMSelectBox.vue:232 packages/ui-kit/src/components/business/YMCustomBox/custom-box-api.ts:263 packages/ui-kit/src/components/business/YMCustomBox/YMCustomBox.vue:265
	creators?: unknown[];
	updaters?: unknown[];
	head?: HTMLElement | Record<string, any> | null;
	strBox?: HTMLElement | null;
	create(...args: unknown[]): any;
	rename(...args: unknown[]): any;
	// → packages/ui-kit/src/components/business/YMFileBodyPane/YMFileBodyPane.vue:1991 packages/ui-kit/src/components/business/YMFileNavPane/YMFileNavPane.vue:799
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
	updateTextNode(...args: unknown[]): any;
	createIcon: (item: unknown) => unknown;
	createComment: (item: unknown) => unknown;
	updateHead: () => unknown;
	updateItemName: (item: unknown) => unknown;
	updateIcon: (item: unknown) => unknown;
	createItem(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMMenuList/menu-api.ts:515
	getItemByProperties(...args: unknown[]): any;
	addNodeTo(...args: unknown[]): any;
	cancelSearch(...args: unknown[]): any;
	searchNodesDebounced(...args: unknown[]): any;
	createFolder(...args: unknown[]): any;
	// → packages/ui-kit/src/components/business/YMFileBodyPane/YMFileBodyPane.vue:1984
	createAttribute(...args: unknown[]): any;
	parseName(...args: unknown[]): any;
	synchronize(...args: unknown[]): any;
	setMaxLength(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMTextBox/text-box-api.ts:136 packages/ui-kit/src/components/basic/YMTextBox/YMTextBox.vue:235
	update(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMCommonList/YMCommonList.vue:353 packages/ui-kit/src/components/basic/YMSelectBox/select-box-api.ts:231 packages/ui-kit/src/components/basic/YMSelectBox/YMSelectBox.vue:233 packages/ui-kit/src/components/business/YMCustomBox/custom-box-api.ts:264 packages/ui-kit/src/components/business/YMCustomBox/YMCustomBox.vue:266 packages/ui-kit/src/components/business/YMFileBrowser/YMFileBrowser.vue:687 packages/ui-kit/src/components/business/YMFileNavPane/YMFileNavPane.vue:790 packages/ui-kit/src/components/business/YMParameterPane/YMParameterPane.vue:994 packages/ui-kit/src/components/business/YMParamList/YMParamList.vue:1269
	write2(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMSelectBox/select-box-api.ts:228 packages/ui-kit/src/components/basic/YMSelectBox/YMSelectBox.vue:230
	write?(value: any): any;
	// → packages/ui-kit/src/components/basic/YMCheckBox/check-box-api.ts:162 packages/ui-kit/src/components/basic/YMColorBox/color-box-api.ts:136 packages/ui-kit/src/components/basic/YMColorBox/YMColorBox.vue:193 packages/ui-kit/src/components/basic/YMCommonList/YMCommonList.vue:350 packages/ui-kit/src/components/basic/YMFileVar/file-var-api.ts:162 packages/ui-kit/src/components/basic/YMFileVar/YMFileVar.vue:183 packages/ui-kit/src/components/basic/YMGamepadBox/YMGamepadBox.vue:167 packages/ui-kit/src/components/basic/YMKeyboardBox/keyboard-box-api.ts:168 packages/ui-kit/src/components/basic/YMKeyboardBox/YMKeyboardBox.vue:133 packages/ui-kit/src/components/basic/YMNumberBox/number-box-api.ts:121 packages/ui-kit/src/components/basic/YMNumberBox/YMNumberBox.vue:128 packages/ui-kit/src/components/basic/YMNumberVar/number-var-api.ts:188 packages/ui-kit/src/components/basic/YMNumberVar/YMNumberVar.vue:221 packages/ui-kit/src/components/basic/YMRadioBox/radio-box-api.ts:181 packages/ui-kit/src/components/basic/YMSelectBox/select-box-api.ts:227 packages/ui-kit/src/components/basic/YMSelectBox/YMSelectBox.vue:229 packages/ui-kit/src/components/basic/YMSelectList/select-list-api.ts:417 packages/ui-kit/src/components/basic/YMSelectVar/select-var-api.ts:172 packages/ui-kit/src/components/basic/YMStringVar/string-var-api.ts:169 packages/ui-kit/src/components/basic/YMTextArea/text-area-api.ts:167 packages/ui-kit/src/components/basic/YMTextArea/YMTextArea.vue:168 packages/ui-kit/src/components/basic/YMTextAreaVar/textarea-var-api.ts:169 packages/ui-kit/src/components/basic/YMTextBox/text-box-api.ts:129 packages/ui-kit/src/components/basic/YMTextBox/YMTextBox.vue:228 packages/ui-kit/src/components/business/YMCustomBox/custom-box-api.ts:262 packages/ui-kit/src/components/business/YMCustomBox/YMCustomBox.vue:264 packages/ui-kit/src/components/business/YMParamList/YMParamList.vue:1268
	writeDefault(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMSelectBox/select-box-api.ts:229 packages/ui-kit/src/components/basic/YMSelectBox/YMSelectBox.vue:231
	on(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMCheckBox/check-box-api.ts:168 packages/ui-kit/src/components/basic/YMColorBox/color-box-api.ts:136 packages/ui-kit/src/components/basic/YMColorBox/YMColorBox.vue:193 packages/ui-kit/src/components/basic/YMDetailBox/detail-box-api.ts:77 packages/ui-kit/src/components/basic/YMDetailSummary/detail-summary-api.ts:56 packages/ui-kit/src/components/basic/YMDetailSummary/YMDetailSummary.vue:63 packages/ui-kit/src/components/basic/YMKeyboardBox/keyboard-box-api.ts:168 packages/ui-kit/src/components/basic/YMKeyboardBox/YMKeyboardBox.vue:133 packages/ui-kit/src/components/basic/YMNumberBox/number-box-api.ts:121 packages/ui-kit/src/components/basic/YMNumberBox/YMNumberBox.vue:128 packages/ui-kit/src/components/basic/YMNumberVar/YMNumberVar.vue:221 packages/ui-kit/src/components/basic/YMRadioBox/radio-box-api.ts:181 packages/ui-kit/src/components/basic/YMSelectBox/select-box-api.ts:245 packages/ui-kit/src/components/basic/YMTextArea/text-area-api.ts:167 packages/ui-kit/src/components/basic/YMTextArea/YMTextArea.vue:168 packages/ui-kit/src/components/business/YMCustomBox/custom-box-api.ts:267 packages/ui-kit/src/components/business/YMCustomBox/YMCustomBox.vue:269 packages/ui-kit/src/components/business/YMParameterPane/YMParameterPane.vue:1011
	loadItems(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMSelectBox/select-box-api.ts:237 packages/ui-kit/src/components/basic/YMSelectBox/YMSelectBox.vue:239 packages/ui-kit/src/components/basic/YMSelectVar/select-var-api.ts:176
	setItemNames(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMSelectBox/select-box-api.ts:238 packages/ui-kit/src/components/basic/YMSelectBox/YMSelectBox.vue:240
	setPlaceholder(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMTextBox/text-box-api.ts:135 packages/ui-kit/src/components/basic/YMTextBox/YMTextBox.vue:234
	setTitle(...args: unknown[]): any;
	// → packages/ui-kit/src/components/business/YMWindowFrame/YMWindowFrame.vue:379
	enableHiddenMode(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMSelectBox/select-box-api.ts:240 packages/ui-kit/src/components/basic/YMSelectBox/YMSelectBox.vue:242
	relate(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMCheckBox/check-box-api.ts:167 packages/ui-kit/src/components/basic/YMRadioBox/radio-box-api.ts:181 packages/ui-kit/src/components/basic/YMSelectBox/select-box-api.ts:241 packages/ui-kit/src/components/basic/YMSelectBox/YMSelectBox.vue:243
	addCloseButton(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMTextBox/text-box-api.ts:139 packages/ui-kit/src/components/basic/YMTextBox/YMTextBox.vue:238
	deleteInputContent(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMTextBox/text-box-api.ts:138 packages/ui-kit/src/components/basic/YMTextBox/YMTextBox.vue:237
	getFocus(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMFileVar/file-var-api.ts:166 packages/ui-kit/src/components/basic/YMFileVar/YMFileVar.vue:187 packages/ui-kit/src/components/basic/YMGamepadBox/YMGamepadBox.vue:167 packages/ui-kit/src/components/basic/YMKeyboardBox/keyboard-box-api.ts:168 packages/ui-kit/src/components/basic/YMKeyboardBox/YMKeyboardBox.vue:133 packages/ui-kit/src/components/basic/YMNumberBox/number-box-api.ts:121 packages/ui-kit/src/components/basic/YMNumberBox/YMNumberBox.vue:128 packages/ui-kit/src/components/basic/YMNumberVar/number-var-api.ts:192 packages/ui-kit/src/components/basic/YMNumberVar/YMNumberVar.vue:221 packages/ui-kit/src/components/basic/YMSelectVar/select-var-api.ts:177 packages/ui-kit/src/components/basic/YMStringVar/string-var-api.ts:173 packages/ui-kit/src/components/basic/YMTextArea/text-area-api.ts:167 packages/ui-kit/src/components/basic/YMTextArea/YMTextArea.vue:168 packages/ui-kit/src/components/basic/YMTextAreaVar/textarea-var-api.ts:173 packages/ui-kit/src/components/basic/YMTextBox/text-box-api.ts:134 packages/ui-kit/src/components/basic/YMTextBox/YMTextBox.vue:233
	getContext(...args: unknown[]): any;
	createTooltip(...args: unknown[]): any;
	selectDefaultCommand(...args: unknown[]): any;
	save(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMSelectBox/select-box-api.ts:233 packages/ui-kit/src/components/basic/YMSelectBox/YMSelectBox.vue:235 packages/ui-kit/src/components/business/YMParamList/YMParamList.vue:1294
	load(...args: unknown[]): any;
	// → packages/ui-kit/src/components/business/YMFileNavPane/YMFileNavPane.vue:789
	reset(...args: unknown[]): any;
	resize(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMCommonList/YMCommonList.vue:354 packages/ui-kit/src/components/basic/YMSelectList/select-list-api.ts:423 packages/ui-kit/src/components/business/YMFileBodyPane/YMFileBodyPane.vue:1969 packages/ui-kit/src/components/business/YMFileNavPane/YMFileNavPane.vue:791 packages/ui-kit/src/components/business/YMParamList/YMParamList.vue:1270
	reload(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMCommonList/YMCommonList.vue:351
	duplicate(...args: unknown[]): any;
	copy(...args: unknown[]): any;
	// → packages/ui-kit/src/components/business/YMParamList/YMParamList.vue:1289
	paste(...args: unknown[]): any;
	// → packages/ui-kit/src/components/business/YMParamList/YMParamList.vue:1290
	cut(...args: unknown[]): any;
	delete(...args: unknown[]): any;
	// → packages/ui-kit/src/components/business/YMParamList/YMParamList.vue:1291
	edit(...args: unknown[]): any;
	// → packages/ui-kit/src/components/business/YMParamList/YMParamList.vue:1285
	toggle(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMDetailBox/detail-box-api.ts:77 packages/ui-kit/src/components/basic/YMDetailSummary/detail-summary-api.ts:55 packages/ui-kit/src/components/basic/YMDetailSummary/YMDetailSummary.vue:63 packages/ui-kit/src/components/business/YMParamList/YMParamList.vue:1286
	insert(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMTextArea/text-area-api.ts:167 packages/ui-kit/src/components/basic/YMTextArea/YMTextArea.vue:168 packages/ui-kit/src/components/basic/YMTextBox/text-box-api.ts:130 packages/ui-kit/src/components/basic/YMTextBox/YMTextBox.vue:229 packages/ui-kit/src/components/business/YMParamList/YMParamList.vue:1284
	unselect(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMCommonList/YMCommonList.vue:358 packages/ui-kit/src/components/basic/YMMenuList/menu-api.ts:517 packages/ui-kit/src/components/basic/YMSelectList/select-list-api.ts:419 packages/ui-kit/src/components/business/YMFileBodyPane/YMFileBodyPane.vue:1979 packages/ui-kit/src/components/business/YMFileNavPane/YMFileNavPane.vue:795 packages/ui-kit/src/components/business/YMParamList/YMParamList.vue:1277
	initialize(...args: unknown[]): any;
	clear(...args: unknown[]): unknown;
	// → packages/ui-kit/src/components/basic/YMCommonList/YMCommonList.vue:362 packages/ui-kit/src/components/basic/YMMenuList/menu-api.ts:514 packages/ui-kit/src/components/basic/YMSelectBox/select-box-api.ts:239 packages/ui-kit/src/components/basic/YMSelectBox/YMSelectBox.vue:241 packages/ui-kit/src/components/basic/YMSelectList/select-list-api.ts:432 packages/ui-kit/src/components/basic/YMSelectVar/select-var-api.ts:178 packages/ui-kit/src/components/business/YMFileBodyPane/YMFileBodyPane.vue:1996 packages/ui-kit/src/components/business/YMParameterPane/YMParameterPane.vue:1010 packages/ui-kit/src/components/business/YMParamList/YMParamList.vue:1296
	select(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMCommonList/YMCommonList.vue:357 packages/ui-kit/src/components/basic/YMMenuList/menu-api.ts:516 packages/ui-kit/src/components/basic/YMSelectList/select-list-api.ts:418 packages/ui-kit/src/components/business/YMFileBodyPane/YMFileBodyPane.vue:1977 packages/ui-kit/src/components/business/YMFileNavPane/YMFileNavPane.vue:794 packages/ui-kit/src/components/business/YMParamList/YMParamList.vue:1274
	selectIndex: (index: number) => unknown;
	scrollToSelection(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMSelectList/select-list-api.ts:430 packages/ui-kit/src/components/business/YMFileNavPane/YMFileNavPane.vue:797 packages/ui-kit/src/components/business/YMParamList/YMParamList.vue:1283
	expandToSelection(...args: unknown[]): any;
	restoreScroll(...args: unknown[]): any;
	saveScroll(...args: unknown[]): any;
	restore(...args: unknown[]): any;
	// → packages/ui-kit/src/components/basic/YMSelectBox/select-box-api.ts:234 packages/ui-kit/src/components/basic/YMSelectBox/YMSelectBox.vue:236
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
	// → packages/editor/src/services/file-system/path-utils.ts:5
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
}

interface Event {
	spaceKey: boolean;
	// → packages/editor/src/utils/keyboard.ts:25 packages/editor/src/utils/keyboard.ts:37
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
	dataIndex: any;
	dataKey: any;
	dataParent: any;
	dataList: any;
	dataItem: any;
	dataIndent: any;
	contents: { text?: string; color?: string; fold?: boolean }[];
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
	name: string;
	fileBox: any;
	history: any;
	submenu: any;
	restoring: boolean;
	_initialized: boolean;
	_checkVariablesScheduled: boolean;
	windowVariableChange: (event: EditorEvent) => void;
	speedX: number;
	speedY: number;
	complete: boolean;
	back: any;
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
	varType: any;
	varKey: any;
	varId: any;
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
	// 注：`links` 声明已随 P4b 退役——`head.links` 走 SFC 自己的实例属性、`Browser.links` / `Selector.links` 是 store 字段，全仓无 `parentNode.links` 用法
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
	clientX: number;
	clientY: number;
	lastValue: any;
	key: any;
	button: number;
	altKey: boolean;
	mode: any;
	scrollLeft: number;
	scrollTop: number;
}

interface KeyboardEvent {
	cmdOrCtrlKey: boolean;
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
	// → packages/editor/src/utils/timer.ts:106
	updaters: {
		// → packages/editor/src/utils/timer.ts:107
		stageAnimation: ((deltaTime: number) => void) | null;
		stageRendering: ((deltaTime: number) => void) | null;
		sharedAnimation: ((deltaTime: number) => void) | null;
		sharedRendering: ((deltaTime: number) => void) | null;
		sharedRendering2: ((deltaTime: number) => void) | null;
	};
	timestamp: number;
	// → packages/editor/src/utils/timer.ts:114 packages/editor/src/utils/timer.ts:160 packages/editor/src/utils/timer.ts:177
	deltaTime: number;
	// → packages/editor/src/utils/timer.ts:115 packages/editor/src/utils/timer.ts:178
	frameCount: number;
	// → packages/editor/src/utils/timer.ts:116 packages/editor/src/utils/timer.ts:171
	frameTime: number;
	// → packages/editor/src/utils/timer.ts:117 packages/editor/src/utils/timer.ts:172
	tpf: number;
	// → packages/editor/src/utils/timer.ts:118 packages/editor/src/utils/timer.ts:170
	animationIndex: number;
	// → packages/editor/src/utils/timer.ts:119 packages/editor/src/utils/timer.ts:212 packages/editor/src/utils/timer.ts:214
	animationWaiting: number;
	// → packages/editor/src/utils/timer.ts:120 packages/editor/src/utils/timer.ts:188 packages/editor/src/utils/timer.ts:197
	initialize: ((this: TimerStatic) => void) | null;
	// → packages/editor/src/utils/timer.ts:121 packages/editor/src/utils/timer.ts:128
	start: ((timestamp: number) => void) | null;
	// → packages/editor/src/utils/timer.ts:122 packages/editor/src/utils/timer.ts:159
	update: ((timestamp: number) => void) | null;
	// → packages/editor/src/utils/timer.ts:123 packages/editor/src/utils/timer.ts:164
	play: ((this: TimerStatic) => void) | null;
	// → packages/editor/src/utils/timer.ts:124 packages/editor/src/utils/timer.ts:218
	appendUpdater: ((key: string, updater: (deltaTime: number) => void) => void) | null;
	// → packages/editor/src/utils/timer.ts:125 packages/editor/src/utils/timer.ts:224
	removeUpdater: ((key: string, updater: (deltaTime: number) => void) => void) | null;
	// → packages/editor/src/utils/timer.ts:126 packages/editor/src/utils/timer.ts:236
}

declare module 'xml2js';
declare module 'koa';
declare module 'mime-types';
declare module 'qrcode';
declare module 'yauzl';
declare module 'markdown-it';
