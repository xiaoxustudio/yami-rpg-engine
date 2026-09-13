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
	command: CommandRenderCommand;
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

/**
 * 命令树 → 可见行（深度优先；折叠的命令**只出自己那一行**，子行不进可见集）。
 * 纯函数：不读写 DOM、不依赖组件状态，同一输入多次调用结果一致（key 亦稳定）。
 */
export function deriveCommandRows(
	commands: CommandRenderCommand[] = [],
	options: DeriveCommandRowsOptions = {}
): CommandRowDescriptor[] {
	const rows: CommandRowDescriptor[] = [];
	const hitSet =
		options.hits instanceof Set ? (options.hits as ReadonlySet<number>) : new Set(options.hits ?? []);
	const selection = options.selection ?? null;

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
				hit: hitSet.has(rowIndex)
			});
			if (!folded && hasChildren(command)) {
				walk(command.commands as CommandRenderCommand[], indent + 1);
			}
		}
	};

	walk(commands, 0);
	return rows;
}

/** 可见行的缩进层级序列（给缩进线扩展点/调试用） */
export const rowIndents = (rows: CommandRowDescriptor[]): number[] => rows.map((row) => row.indent);
