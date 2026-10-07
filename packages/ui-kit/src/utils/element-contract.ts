// oxlint-disable-next-line no-explicit-any
type Loose = any;

export interface YamiElementApi {
	item?: Loose;
	read(...args: unknown[]): Loose;
	update(...args: unknown[]): Loose;
	refresh(...args: unknown[]): Loose;
	resize(...args: unknown[]): Loose;
	reload(...args: unknown[]): Loose;
	select(...args: unknown[]): Loose;
	unselect(...args: unknown[]): Loose;
	clear(...args: unknown[]): unknown;
	insert(...args: unknown[]): Loose;
	delete(...args: unknown[]): Loose;
	copy(...args: unknown[]): Loose;
	paste(...args: unknown[]): Loose;
	cut(...args: unknown[]): Loose;
	edit(...args: unknown[]): Loose;
	toggle(...args: unknown[]): Loose;
	duplicate(...args: unknown[]): Loose;
	create(...args: unknown[]): Loose;
	rename(...args: unknown[]): Loose;
	sort(...args: unknown[]): Loose;
	initialize(...args: unknown[]): Loose;
	reset(...args: unknown[]): Loose;
	restore(...args: unknown[]): Loose;
	load(...args: unknown[]): Loose;
	save(...args: unknown[]): Loose;
	on(...args: unknown[]): Loose;
	bind(...args: unknown[]): unknown;
	synchronize(...args: unknown[]): Loose;
	parseName(...args: unknown[]): Loose;
	cancelSearch(...args: unknown[]): Loose;
	searchNodesDebounced(...args: unknown[]): Loose;
	createFolder(...args: unknown[]): Loose;
	/**
	 * 列表元素上运行期挂载的「新建变量」（`variable.ts` 里
	 * `Variable.list.createVariable = Variable.list_createVariable`）。
	 *
	 * 与 `createFolder` 紧挨着，是因为**它此前漏了声明**：同一次挂载里
	 * `saveScroll` / `restoreScroll` / `cancelSearch` / `createFolder` 四条都能直接赋值，
	 * 只有 `createVariable` 要在调用点写 `as unknown as { createVariable: … }`
	 * —— 缺的不是断言，是这一行声明（第 121 轮「声明缺成员」的同类，方向相反：那次是多余字段，
	 * 这次是漏字段）。补上之后 `variable.ts` 与 `list-events.ts` 两处断言**整条消失**。
	 */
	createVariable(...args: unknown[]): Loose;
	createAttribute(...args: unknown[]): Loose;
	createItem(...args: unknown[]): Loose;
	addNodeTo(...args: unknown[]): Loose;
	getItemByProperties(...args: unknown[]): Loose;
	updateItemName: (item: unknown) => unknown;
	updateIcon: (item: unknown) => unknown;
	updateTextNode(...args: unknown[]): Loose;
	updateNodeElement(...args: unknown[]): Loose;
	updateHead: () => unknown;
	createIcon: (item: unknown) => unknown;
	createComment: (item: unknown) => unknown;
	saveSelection(...args: unknown[]): Loose;
	restoreSelection(...args: unknown[]): Loose;
	selectIndex: (index: number) => unknown;
	selectDefaultCommand(...args: unknown[]): Loose;
	expandToSelection(...args: unknown[]): Loose;
	scrollToSelection(...args: unknown[]): Loose;
	saveScroll(...args: unknown[]): Loose;
	restoreScroll(...args: unknown[]): Loose;
	restoreRecursiveStates(...args: unknown[]): Loose;
	setRecursiveStates(...args: unknown[]): Loose;

	addScrollListener(...args: Loose[]): Loose;
	removeScrollListener(...args: Loose[]): Loose;
	beginScrolling(): void;
	endScrolling(): void;
	setScroll(left: number, top: number): void;
	setScrollLeft(left: number): void;
	setScrollTop(top: number): void;
	updateScrollbars(): void;
	updateHorizontalBar(): void;
	updateVerticalBar(): void;
	scrollPointerup: (event: Event) => void;
	scrollPointermove: (event: Event) => void;
	scrollPointerdown?: (event: Event) => void;

	write?(value: Loose): Loose;
	write2(...args: unknown[]): Loose;
	writeDefault(...args: unknown[]): Loose;
	loadItems(...args: unknown[]): Loose;
	setItemNames(...args: unknown[]): Loose;
	setMaxLength(...args: unknown[]): Loose;
	setPlaceholder(...args: unknown[]): Loose;
	setTitle(...args: unknown[]): Loose;
	enableHiddenMode(...args: unknown[]): Loose;
	enable(): void;
	disable(): void;
	relate(...args: unknown[]): Loose;
	addCloseButton(...args: unknown[]): Loose;
	deleteInputContent(...args: unknown[]): Loose;
	getFocus(...args: unknown[]): Loose;

	getContext(...args: unknown[]): Loose;
	createTooltip(...args: unknown[]): Loose;
	test(name: string): RegExp;
	isImageChanged: () => boolean;
	windowVariableChange: (event: Event) => void;

	content: HTMLElement;
	wraps: Loose[];
	value: Loose;
	clientX: number;
	clientY: number;
	file: Loose;
	folders: Loose[];
	stats: { ino: number };
	activeFile?: Record<string, Loose> | null;
	selectionIndex?: number;
	src?: string;
	input?: HTMLElement | Record<string, Loose> | null;
	_paddingTop: number;
	innerHeight: number;
	dataIndex: Loose;
	dataKey: Loose;
	dataParent: Loose;
	dataList: Loose;
	dataItem: Loose;
	dataIndent: Loose;
	contents: { text?: string; color?: string; fold?: boolean }[];
	varType: Loose;
	varKey: Loose;
	varId: Loose;
	varMap: Loose;
	varList: Loose;
	currentType: Loose;
	script: Loose;
	rect: Loose;
	path: Loose;
	data: Loose;
	name: string;
	fileBox: Loose;
	history: Loose;
	submenu: Loose;
	restoring: boolean;
	speedX: number;
	speedY: number;
	complete: boolean;
	back: Loose;
	elements: Loose[] & {
		versionId?: number;
		count?: number;
		start?: number;
		end?: number;
		head?: unknown;
		foot?: unknown;
	};
}

export type YamiElement = HTMLElement & YamiElementApi;

export type YamiListElement = YamiElement;
