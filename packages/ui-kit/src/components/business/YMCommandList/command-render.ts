/**
 * P6/M2 派生层（`YMCommandList`）：把「命令树 → 可见行」这一步抽成**纯数据**推导。
 *
 * 为什么要有它：现在这段逻辑长在 `command-api.ts` 的 `createCommandBuffer` / `createItems` /
 * `computeStartAndEnd` 里，和**直接建 DOM 节点**、`li.contents`、`dataIndent` 存取器缠在一起，
 * 所以既没法单独验证，也没法换渲染方式。M2 只做**抽派生**（**不动渲染**）：调用方暂时仍是老实现，
 * M3 再把模板 `v-for` 接到这里的输出上。
 *
 * 与 tree 改造对齐的三点（见 `YMTreeList/tree-render.ts`）：
 *   ①行 key 用 **WeakMap 发号**——不能直接用 `command.id`（脚本/事件列表允许重复 id），
 *     同一 command 多次派生 key 稳定 ⇒ Vue 只移动/复用行；
 *   ②折叠态决定子行是否进入可见集（折叠时子命令不出现，只是"收起"）；
 *   ③缩进层级（`dataIndent`）由深度决定，与语言无关（缩进**宽度**另由 `computeTextIndent` 给）。
 */

/** 派生层看到的命令形状：只需要树结构 + 折叠态 + 禁用态 */
export interface CommandRenderCommand {
	id?: string;
	params?: Record<string, unknown>;
	commands?: CommandRenderCommand[];
	folded?: boolean;
	disabled?: boolean;
	[k: string]: unknown;
}

export interface CommandRowDescriptor {
	/** 稳定行 key（同 tree 的 `rowKeyOf`：WeakMap 发号，跨多次派生不变） */
	key: string;
	/** 该行对应的命令；**列表末尾的空白行为 `null`** */
	command: CommandRenderCommand | null;
	/** 所属列表（子命令所属的是父命令的 `commands`） */
	list: CommandRenderCommand[];
	/** 在其所属列表中的下标 */
	index: number;
	/** 缩进层级（顶层 0） */
	indent: number;
	/** 有子命令且已折叠 */
	folded: boolean;
	selected: boolean;
	disabled: boolean;
	hit: boolean;
	/** M3 换源：是否为列表末尾的**空白行**（无命令、点击即在该层级插入） */
	blank: boolean;
}

export interface DeriveCommandRowsOptions {
	/** 选中区间（行下标，含首尾；`null` 表示无选中） */
	selection?: readonly [number, number] | null;
	/** 搜索命中的行下标集合 */
	hits?: ReadonlySet<number> | readonly number[];
}

const rowKeys = new WeakMap<object, string>();
let rowKeySeq = 0;

/** 稳定行 key：`command.id` 可能重复，故用 WeakMap 发号（同 tree `rowKeyOf`） */
export const rowKeyOf = (command: object): string => {
	let key = rowKeys.get(command);
	if (key === undefined) {
		key = `c${++rowKeySeq}`;
		rowKeys.set(command, key);
	}
	return key;
};

const hasChildren = (command: CommandRenderCommand): boolean =>
	Array.isArray(command.commands) && command.commands.length > 0;

const listKeys = new WeakMap<object, string>();
let listKeySeq = 0;

/** 列表身份 key：同一个数组跨多次派生稳定（同 `rowKeyOf` 的 WeakMap 发号） */
export const listKeyOf = (list: object): string => {
	let key = listKeys.get(list);
	if (key === undefined) {
		key = `l${++listKeySeq}`;
		listKeys.set(list, key);
	}
	return key;
};

/**
 * 空白行的稳定 key。**与 `command-api.ts` 的 `createBlankElement` 共用这一个函数**，
 * 保证"派生层算出的行"与"api 建出的行"key 一致（换源前后要靠它逐项比对）。
 *
 * key 必须带**所属列表的身份**：`parse` 可以为**同一条命令**产出**多个 `children`**
 * （`if` / `showChoices` / `switch` 每个分支一个子列表，见 `useIfCommandSchema`），
 * 此时"父命令 + 层级 + 列表下标"三者完全相同 —— 两个分支各 1 条命令就会撞成同一个 `:key`，
 * Vue 的 patch 随即抛 `insertBefore of null`（实机：打开含 `if` 的事件）。
 */
export const blankRowKeyOf = (list: object, indent: number, index: number): string =>
	`blank-${listKeyOf(list)}-${indent}-${index}`;

/**
 * 命令树 → 可见行（深度优先；折叠的命令**只出自己那一行**，子行不进可见集）。
 * 纯函数：不读写 DOM、不依赖组件状态；**同一批数组对象**多次调用结果一致（key 亦稳定）。
 * 边界：空白行的 key 带列表身份，所以"内容相同但是新建的数组"会拿到不同的空白行 key
 * （调用方一律传真实命令列表数组，不要现建副本）。
 */
export function deriveCommandRows(
	commands: CommandRenderCommand[] = [],
	options: DeriveCommandRowsOptions = {}
): CommandRowDescriptor[] {
	const rows: CommandRowDescriptor[] = [];
	const hitSet =
		options.hits instanceof Set
			? (options.hits as ReadonlySet<number>)
			: new Set(options.hits ?? []);
	const selection = options.selection ?? null;

	/**
	 * 深度优先遍历一个列表；遍历完该层后补上它的**空白行**（与 `createItems` 的产出顺序一致：
	 * 子层空白行先于本层空白行 —— 因为子层是在父命令那一轮递归进去的）。
	 * 空白行的 key 只认**列表本身**，不再需要父命令（见 `blankRowKeyOf`）。
	 */
	const walk = (list: CommandRenderCommand[], indent: number): void => {
		for (let index = 0; index < list.length; index++) {
			const command = list[index];
			const folded = hasChildren(command) && command.folded === true;
			const rowIndex = rows.length;
			rows.push({
				key: rowKeyOf(command),
				command,
				list,
				index,
				indent,
				folded,
				selected:
					selection !== null && rowIndex >= selection[0] && rowIndex <= selection[1],
				disabled: command.disabled === true,
				hit: hitSet.has(rowIndex),
				blank: false
			});
			if (!folded && hasChildren(command)) {
				walk(command.commands as CommandRenderCommand[], indent + 1);
			}
		}
		// 列表末尾的空白行（无命令、点击即插入）
		const blankIndex = rows.length;
		rows.push({
			key: blankRowKeyOf(list, indent, list.length),
			command: null,
			list,
			index: list.length,
			indent,
			folded: false,
			selected:
				selection !== null && blankIndex >= selection[0] && blankIndex <= selection[1],
			disabled: false,
			hit: hitSet.has(blankIndex),
			blank: true
		});
	};

	walk(commands, 0);
	return rows;
}

/** 可见行的缩进层级序列（给缩进线扩展点/调试用） */
export const rowIndents = (rows: CommandRowDescriptor[]): number[] => rows.map((row) => row.indent);

/** 命令列表行高（px）：与 CSS 一致；翻页/滚动/命中定位都用它 */
export const ROW_HEIGHT = 20;

/** 一次翻页滚动的行数（`innerHeight / 20 - 1`，下限 0） */
export const pageScrollLines = (viewportHeight: number): number =>
	Math.max(Math.floor(viewportHeight / ROW_HEIGHT) - 1, 0);

export interface PageContext {
	/** 当前滚动位置 */
	scrollTop: number;
	/** 视口高度（= `innerHeight`） */
	viewportHeight: number;
	/** 可见行总数（= `elements.count`） */
	rowCount: number;
	/** 翻页锚点行 */
	anchor: number;
}

/** 上翻一页后的 `scrollTop`（不越过顶部） */
export const computePageUpScrollTop = (context: PageContext): number =>
	Math.max(context.scrollTop - pageScrollLines(context.viewportHeight) * ROW_HEIGHT, 0);

/**
 * 上翻一页后要选中的行下标。
 * 原实现：`min(anchor, floor((scrollTop + innerHeight) / 20) - 1) - scrollLines`
 */
export const computePageUpTargetIndex = (context: PageContext): number => {
	const { scrollTop, viewportHeight, anchor } = context;
	const bottomIndex = Math.floor((scrollTop + viewportHeight) / ROW_HEIGHT) - 1;
	return Math.min(anchor, bottomIndex) - pageScrollLines(viewportHeight);
};

/**
 * 下翻一页后的 `scrollTop`。
 * 原实现：无选中时 `top + scrollLines * 20`；选中时再夹到 `rowCount * 20 - innerHeight`。
 */
export const computePageDownScrollTop = (context: PageContext, clamped: boolean): number => {
	const { scrollTop, viewportHeight, rowCount } = context;
	const next = scrollTop + pageScrollLines(viewportHeight) * ROW_HEIGHT;
	if (!clamped) return Math.max(scrollTop, next);
	const scrollTopMax = rowCount * ROW_HEIGHT - viewportHeight;
	return Math.max(scrollTop, Math.min(next, scrollTopMax));
};

/**
 * 下翻一页后要选中的行下标。
 * 原实现：`max(anchor, floor(top / 20)) + scrollLines`
 */
export const computePageDownTargetIndex = (context: PageContext): number => {
	const { scrollTop, anchor, viewportHeight } = context;
	const topIndex = Math.floor(scrollTop / ROW_HEIGHT);
	return Math.max(anchor, topIndex) + pageScrollLines(viewportHeight);
};

export type ScrollToSelectionMode = 'active' | 'alter' | 'restore';

export interface ScrollToSelectionContext extends PageContext {
	/** 当前活动行 */
	active: number;
	/** 选区原点行 */
	origin: number;
	/** 选中区间首行 */
	start: number;
	/** 选中区间末行 */
	end: number;
	/** `active` 行所属命令的可见区间（折叠命令可能占多行） */
	activeRange: readonly [number, number];
}

/**
 * 把选区滚进视野后的 `scrollTop`；未知模式返回 `null`（调用方原样返回、不滚动）。
 * 三个分支逐字对照原实现：
 *   - `active`：按 **active 所在命令的区间** 夹取；`active <= origin`（向上选）时先取 `min` 侧，否则先取 `max` 侧；
 *   - `alter`：按 active 单行夹取；
 *   - `restore`：按整个选中区间夹取（从头对齐）。
 */
export const computeScrollToSelection = (
	// 实参来自组件元素 API（运行期字符串）；`'active' | 'alter' | 'restore'` 是已知取值，
	// 未知取值按原实现"直接返回、不滚动"处理，故形参不窄化。
	mode: string,
	context: ScrollToSelectionContext
): number | null => {
	const { scrollTop, viewportHeight } = context;
	switch (mode) {
		case 'active': {
			const max = context.activeRange[0] * ROW_HEIGHT;
			const min = context.activeRange[1] * ROW_HEIGHT + ROW_HEIGHT - viewportHeight;
			return context.active <= context.origin
				? Math.min(Math.max(scrollTop, min), max)
				: Math.max(Math.min(scrollTop, max), min);
		}
		case 'alter': {
			const max = context.active * ROW_HEIGHT;
			const min = context.active * ROW_HEIGHT + ROW_HEIGHT - viewportHeight;
			return Math.max(Math.min(scrollTop, max), min);
		}
		case 'restore': {
			const max = context.start * ROW_HEIGHT;
			const min = context.end * ROW_HEIGHT + ROW_HEIGHT - viewportHeight;
			return Math.min(Math.max(scrollTop, min), max);
		}
		default:
			return null;
	}
};

/** `scrollToRow` 的行下标夹取：越界时贴到首/末行（行数为 0 时返回 -1） */
export const clampRowIndex = (targetIndex: number, rowCount: number): number => {
	if (rowCount <= 0) return -1;
	if (targetIndex < 0) return 0;
	if (targetIndex >= rowCount) return rowCount - 1;
	return targetIndex;
};

export type ScrollToRowPosition = 'top' | 'bottom' | 'center';

/**
 * `scrollToRow` 的目标 `scrollTop`。
 * 原实现：`top` → 行顶；`bottom` → 行底 − 视口；否则居中；最后统一夹到 `[0, rowCount*20 - viewport]`。
 */
export const computeScrollToRowScrollTop = (
	targetIndex: number,
	rowCount: number,
	viewportHeight: number,
	// 实参来自组件元素 API（运行期字符串）；`'top' | 'bottom' | 'center'` 是已知取值，未知取值按居中处理
	position: string = 'center'
): number => {
	const index = clampRowIndex(targetIndex, rowCount);
	if (index < 0) return 0;
	const targetRowTop = index * ROW_HEIGHT;
	let targetScrollTop: number;
	switch (position) {
		case 'top':
			targetScrollTop = targetRowTop;
			break;
		case 'bottom':
			targetScrollTop = targetRowTop + ROW_HEIGHT - viewportHeight;
			break;
		default:
			targetScrollTop = targetRowTop - viewportHeight / 2 + ROW_HEIGHT / 2;
	}
	const maxScrollTop = rowCount * ROW_HEIGHT - viewportHeight;
	return Math.max(0, Math.min(targetScrollTop, maxScrollTop));
};
