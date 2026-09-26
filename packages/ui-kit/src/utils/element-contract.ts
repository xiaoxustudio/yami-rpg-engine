/**
 * 元素 API 契约：把过去挂在**全局** `HTMLElement` 上的成员面，搬成一份**显式命名类型**。
 *
 * ## 为什么必须搬
 *
 * `Project/global.d.ts` 用 `interface HTMLElement { … }` 给**全局**的每个元素都加上了本仓库
 * 运行时装配的方法面。这带来两个真实危害：
 *
 * 1. **掩盖"字段已退役"**：元素数据访问器摘掉之后，正是这层声明让 `el.<已退役字段>`
 *    依旧编译通过、运行期静默 `undefined`。
 * 2. **对第三方元素也说谎**：`document.querySelector('div')` 拿到的普通 `HTMLElement` 也被
 *    宣称有 `write()` / `loadItems()`——拼错的方法名、根本不存在的成员都能通过编译。
 *
 * 因此这里把它降级为**显式契约**：只有**明确经由本仓库的元素来源**（`ElementRegistry`、
 * `$()`、`getElementById` 包装、各模块自己声明的元素字段）拿到的元素才是 `YamiElement`，
 * 普通 DOM 元素不再自动具备这些成员。
 *
 * ## 维护约定
 *
 * - 新增成员前先确认**确有运行期实现**（`scripts/global-types-audit.mjs` 会报 `dead`/`dup`）。
 * - 成员签名尽量精确；确实无法精确的（历史遗留的元素工厂方法）保留 `unknown[]` 宽松签名，
 *   并注明出处文件，方便后续按组件收窄。
 * - **已退役的元素数据字段不得回来**（`lastText` / `hiddenNodes` / `strBox` / `creators` /
 *   `initialized` … 一律走 `elementDataOf()` / `getListConfig()` 显式读写）。
 */

// 历史元素方法签名的宽松别名（**单点豁免**）：与各 `*-api.ts` 的既有做法一致，
// 避免把上百处 `: any` 散落成上百条 lint 警告。
// oxlint-disable-next-line no-explicit-any
type Loose = any;

/** 本仓库装配在**元素**上的方法面（列表族 / 状态条 / 滚动 / 文本框族 / 窗口壳 …）。 */
export interface YamiElementApi {
	// ——————————————————————————————————————————————————————————————
	// 列表族（tree / command / param / file body / file nav / select list / common list / menu）
	// 精确签名见各组件自己的 `XxxApi`；这里保留既有调用点的宽松签名。
	// ——————————————————————————————————————————————————————————————
	/** 行元素上挂的业务数据（树/列表行反查） */
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

	// ——————————————————————————————————————————————————————————————
	// 滚动（`element-utils.ts` / `scroll-listener.ts` / `scroll-bar-api.ts` 装配）
	// ——————————————————————————————————————————————————————————————
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

	// ——————————————————————————————————————————————————————————————
	// 文本框 / 选择框族（`text-box-api.ts` / `select-box-api.ts` / `custom-box-api.ts` …）
	// ——————————————————————————————————————————————————————————————
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

	// ——————————————————————————————————————————————————————————————
	// 画布 / 宿主（`engine/webgl` 与工具层）
	// ——————————————————————————————————————————————————————————————
	getContext(...args: unknown[]): Loose;
	createTooltip(...args: unknown[]): Loose;
	test(name: string): RegExp;
	isImageChanged: () => boolean;
	windowVariableChange: (event: Event) => void;

	// ——————————————————————————————————————————————————————————————
	// 运行时装配的**数据字段**（元素自有属性；不是元素数据 WeakMap）
	// 出处见 `scripts/global-types-audit.mjs` 的 `real` 分类。
	// ——————————————————————————————————————————————————————————————
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

/** 元素句柄：**本仓库来源**的元素（注册表 / `$()` / 各模块声明的元素字段）。 */
export type YamiElement = HTMLElement & YamiElementApi;

/** 列表类元素句柄（tree / command / param / file body / file nav / select list / common list）。 */
export type YamiListElement = YamiElement;
