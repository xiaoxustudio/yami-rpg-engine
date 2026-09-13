# 巨石渲染层数据化方案（P6：`YMCommandList` / `YMFileBodyPane`）

- 状态：**设计稿（未实施）**；本轮只落地方案与现状实测（2026-09-11）
- 日期：2026-09-11
- 范围：`packages/ui-kit/src/components/business/YMCommandList/**`（`command-api.ts` 2609 行、`YMCommandList.vue` 372 行、`command-core.ts` 269 行）与 `packages/ui-kit/src/components/business/YMFileBodyPane/**`（`YMFileBodyPane.vue` 2327 行、`file-body-core.ts` 154 行）
- 来源：[vue3-migration-plan.md](./vue3-migration-plan.md) 阶段 5（P6）+ [remaining-work.md](./remaining-work.md) B1
- 前置经验：[tree-list-vfor-plan.md](./tree-list-vfor-plan.md)（同构改造已完成并翻默认）、[layout-vue-plan.md](./layout-vue-plan.md)（Teleport/命令式 reparent 的教训）
- 索引：文档地图与维护约定见 [README.md](./README.md)

## 0. 为什么这两块放最后

它们是 P6「Vue 组件内命令式渲染」的两个最大残留：列表行由 `document.createElement` + `appendChild` 手工建、虚拟滚动靠手写 DOM 差量、对外 API 挂在元素实例上。tree 的同类改造（步骤 2–5）已验证路线可行，并沉淀了三条可直接复用的结论：

1. **先有金标准测试，再动渲染层**（tree 在改造前补到 80 用例）；
2. **派生层与 API 门面分离**：新增 `xxx-render.ts` 做纯数据派生，命令式 API 保留为门面（tree 的 `tree-render.ts` / `tree-api.ts` 分工）；
3. **用「渲染模式无关」的消费方 API 做过渡**（tree 的 `treeRowItemAt` / `setTreeItemClass` 一类），避免一次性改 100+ 处调用点。

## 1. 现状实测（2026-09-11）

| 指标 | `YMCommandList` | `YMFileBodyPane` |
| --- | --- | --- |
| 主体行数 | `command-api.ts` **2609**（`.vue` 仅 372 行，是薄壳） | `YMFileBodyPane.vue` **2327**（业务全在 SFC 内） |
| 已抽纯数据层 | `command-core.ts` 269 行（parse/搜索/选区区间等，27 用例） | `file-body-core.ts` 154 行（窗口/网格度量、键盘索引，16 用例） |
| DOM 命中 | `createElement` 10、`appendChild` 4、`removeChild` 1、`insertBefore` 2、`addEventListener` 9、`parentNode` 4 | `createElement` 3、`appendChild` 6、`removeChild` 1、`insertBefore` 1、`addEventListener` 18、`parentNode` 9 |
| 命令式渲染集中区 | `createFoldedCommandBuffer`(L294) / `createItems`(L315) / `createCommandBuffer`(L346–624) / `updateCommandElement`(L625) / `updateCommandElementFold`(L741) / `deleteCommandBuffers`(L770) / `createBlankElement`(L783) / `computeTextIndent`(L855) | `createFlatItems`(L653) / `createFolderElement`(L670) / `updateFolderElement`(L689) / `createFileElement`(L704) / `updateFileElement`(L720) / `resize`(L473) / `computeStartAndEnd`(L574) / `updateContentSize`(L594) |
| 交互面 | 选区/多选/翻页/滚动（L865–1150）、插入/编辑/折叠（L1177–1360）、复制粘贴删除撤销重做（L1375–1633）、变量分析（L1634–1899）、搜索（L1940–2046）、滚动到行（L2047）、键盘（L2077）、指针（L2219/2300/2466/2478） | 视图模式（L381/L391）、文件/文件夹行、虚拟滚动窗口、拖拽与右键菜单（经 props 注入的 `browser`/`selector` 等外部 API） |
| 现有测试 | `YMCommandList.spec.ts` **12 用例**、`command-core.spec.ts` 27 用例；editor 侧 `command-components-render.spec.ts` 3 用例 | `file-body-pane.spec.ts` **5 用例**、`file-body-core.spec.ts` 16 用例；editor 侧 `file-body-popup.spec.ts` 2 用例 |

**结论**：测试覆盖与 API 面严重不匹配——命令列表对外暴露 **67 个方法**（见下），editor 侧有 **约 259 处**列表方法调用（按 `list.`/`list?.` + 常用方法名粗计），但组件级只锁了 12 个用例。**M1 必须先把行为锁住**。

## 2. 对外契约（改造期间不得破坏）

- **`YMCommandList`**：`packages/editor/src/components/common/CommandList.vue` 用 `method('name')` 逐个桥接了 **67 个方法**（`read/write/update/resize/select*/insert/edit/fold/toggle/copy/paste/delete/undo/redo/save/analyzeVariables/checkVariables/findString/scrollToRow/keydown/pointerdown/pointerup/...`），事件协议在 `commandListOptions`（`@app/components/command-list`）里定义；消费方以事件编辑器（`Event.vue`）为主。
- **编辑器对行渲染的猴补丁**：`packages/editor/src/module/eslints.ts`（274 行）覆盖 `CommandList.prototype.updateCommandElement`（L174–180）为命令行生成**缩进线**（`pre`/`lines`），并有实例级覆盖 `applyCommandListInstanceOverride`（L189）。这是命令列表版的「行扩展点」，等价于 tree 当年的 `updateNodeElement` 覆写——**必须保留为正式扩展点**（建议照 tree 的做法收敛为 `renderNodeExtras` 式回调或 class 注册表）。
- **`YMFileBodyPane`**：由 `packages/ui-kit/src/components/business/YMFileBrowser/YMFileBrowser.vue` 通过 **15 个 props/API** 注入（`links`/`directoryApi`/`fileSystemApi`/`menuState`/`clipboardApi`/`referenceApi`/`editorApi`…）；editor 侧 `packages/editor/src/stores/browser.ts`（L236/L242）与 `packages/editor/src/stores/selector.ts`（L317/L320）用 `closest('.file-body-item')` / `closest('.file-body-pane')` 判定「点在行上 / 点在空白区」来决定右键菜单——属 DOM 反查，需在 M4 换成数据查询（保留 class 作为纯样式钩子）。

## 3. 分步计划（每步独立可验证、可回滚）

### M1：行为金标准补齐（在现命令式实现上写）

目标：把组件级用例从「12 + 5」提到与 tree 改造前同量级（~40+），至少覆盖：

- **命令列表**：行创建/缩进（`computeTextIndent`）/折叠（`fold`/`unfoldCommand`/`toggle`）/空白行（`createBlankElement`）/选区与多选（`select`/`selectMultipleTo`/`selectAll`）/翻页（`pageUp`/`pageDown`）/滚动到选中与到行（`scrollToSelection`/`scrollToRow`）/命中搜索与高亮（`findString` + `highlightTexts`）/`clear` 与 `deleteCommandBuffers` 后的元素回收；另加**缩进线扩展点**（`eslints` 覆写被调用、行 class/子节点结构）的锁定用例。
- **文件body**：normal/tile 两种视图（`setViewIndex`/`updateViewMode`）/网格度量与窗口迁移（`computeListGridMetrics`/`computeTileGridMetrics` + `computeStartAndEnd`）/内容尺寸与偏移（`updateContentSize`/`updateContentOffset`）/行元素契约（`createFileElement`/`updateFileElement` 的 icon+name 结构）/滚动与空目录。

**M1 第一批补测（2026-09-12）：`YMCommandList/__tests__/YMCommandList.m1.spec.ts` 新增 9 例**

在**现命令式实现**上锁死以下行为（重写期间只许改断言方式）：`computeTextIndent` 的**精确值**（中文 `indent * 2 + 'em'`、英文 `indent * 4 + 'ch'`）、`selectAll` / `selectMultipleTo` 的选中结果、`pageDown/pageUp`（含 `select=true` 时把选区带过头/带回来；滚动实现由 SFC 注入，故用例把 `el.scroll` 换成 spy，只断言"请求了滚动"）、`scrollToRow` / `scrollToSelection` 的 `scrollTop` 变化、`update` 幂等、空白行契约（`elements.count = 命令数 + 1`，末尾那行由 `createBlankElement` 生成）。

写作过程中发现并记入本文件的事实（都属于"实现细节决定断言方式"）：

- **选中类 API 需要 `focusing = true`** 才会落到 DOM 的 `selected` 类上（`selectAll` 内部就是 `select(0, Infinity)` + 定位 `active`）。
- **`computeTextIndent` 的返回值是等长字符串**（`'0em'` / `'4em'`），先前"长度递增"的直觉断言是错的——必须断言取值。
- **空白行是渲染协议的一部分**：每层命令列表末尾都会追加一个 `createBlankElement`，因此 `elements.count` 不是命令数。
- **`pageUp/pageDown` 依赖 `this.scroll`**（由 `YMCommandList.vue` 注入的滚动实现），纯元素态用例必须自备 stub。
- **import 尚未打通**：嵌套渲染（`parse` 返回值里的嵌套数组 = 子命令列表 → `createItems(target, indent + 1, …)`）需要一个专门的用例，但得先弄清 `createCommandBuffer` 的 buffer 协议；已在文件里留 TODO(M1)，缩进的**计算**已由上面的用例锁定。

**现有覆盖盘点与补测清单（2026-09-11 实测，逐条对过用例标题）**

| 组件 | 已覆盖（现有 12 + 5 例） | 需补（M1 目标） |
| --- | --- | --- |
| `YMCommandList`（12） | mount 类/id、`createCommandListElement`、`write`/`read`、`select` 高亮、`delete`+history、`undo`、`copy`、`paste`、`toggle`（disable）、`save` 替换、`clear` 重置、`fold` 行结构 + pointerdown 折叠切换 | 缩进/`computeTextIndent` 层级公式；`updateCommandElementFold` 折叠标题行与 `unfoldCommand`；`createBlankElement` 尾部空白行；多选（`selectMultiple`/`selectMultipleTo`/`selectAll`/`selectMultipleUp`/`selectMultipleDown`）；翻页（`pageUp`/`pageDown` 选中 + 滚动量）；滚动定位（`scrollToSelection` active/middle、`scrollToRow`）；搜索（`findString` + `highlightTexts`/`unhighlightTexts`）；变量分析（`analyzeVariables`/`checkVariables`/`scheduleCheckVariables`）；键盘映射（Enter/Arrow/Ctrl+A/Ctrl+C/V/Z/Y + `alphabetCode` 跳转）；指针（`pointerdown` 选区、`doubleclick` 编辑、`pointerup`）；`copyAsText`/`copyAsJSCode` 文本；`enableItems`/`disableItems`/`isParentEnabled`；`clearElements`/`deleteCommandBuffers` 后元素回收；事件协议派发（select/record/popup/open/change/update）；**`eslints` 缩进线扩展点**（覆写被调用 + `pre`/`lines` 结构） |
| `YMFileBodyPane`（5） | mount + core api、`select`/`unselect`、`setViewIndex` 写 head、`updateFiles` 建行、`keydown Delete` 删除流；editor 侧另有右键菜单 2 例（`file-body-popup.spec.ts`） | normal↔tile 切换后的度量与 `countPerLine` 变化；窗口迁移（`computeStartAndEnd`/`updateContentSize`/`updateContentOffset` 的内容高度与偏移）；行元素契约（icon + name 结构、folder/file 两类）；空目录与滚动边界；末行/padded 占位；拖拽（若有）与 `popup` 的坐标透传 |

验证：`pnpm -F @yami/ui-kit test` 全绿且用例数达标；这些用例**在改造后不允许改语义，只允许改断言方式**（同 tree 步骤 1 的约定）。

### M2：派生层（不动渲染）

新增 `YMCommandList/command-render.ts`：把 `createCommandBuffer`/`computeTextIndent` 里的**纯数据部分**抽出来——扁平化可见行（含折叠态、缩进层级、选区态、搜索命中、disabled）、行 key（`WeakMap` 稳定键，同 tree `rowKeyOf`）、窗口计算；`YMFileBodyPane/file-body-render.ts`：复用 `file-body-core` 的 `compute*Metrics`，输出行数据 + 行 key。

**接口草案（2026-09-11，照 tree `tree-render.ts` 的形状；落地时以实现为准，并补一份 1.5 式「计划名→实现名」对照表）**

```ts
// ── YMCommandList/command-render.ts ──────────────────────────────
export const ROW_HEIGHT = 20;

export interface CommandRenderRow {
	key: string;                 // WeakMap 稳定键（rowKeyOf）
	item: CommandData | null;    // blank 行为 null
	index: number;               // 扁平序列序号（选区 / 键盘 / 翻页用）
	kind: 'command' | 'fold' | 'blank';
	indent: number;              // 缩进层级
	textIndent: number;          // 沿用 computeTextIndent 公式
	name: string;                // 已过 parseName / 变量替换的显示文本
	hasChildrenMark: boolean;    // 折叠标记容器是否渲染
	expanded: boolean;
	enabled: boolean;
	selected: boolean;
	extraClasses: string[];      // 业务注册 class（eslints 的缩进线走 extras 容器，不走这条）
}

export interface CommandRenderState {
	version: ShallowRef<number>;
	rows: ShallowRef<CommandRenderRow[]>;
	start: Ref<number>;
	end: Ref<number>;
	itemClasses: WeakMap<CommandData, Set<string>>;
	rowElements: Map<string, CommandItemElement>;   // 行元素回写桥（保 67 方法契约）
	rowData: Map<string, CommandRenderRow>;
	textOverrides: WeakMap<CommandData, string>;
	bump: () => void;
}

export const createCommandRenderState: (owner?: unknown) => CommandRenderState;
export const rowKeyOf: (item: CommandData) => string;
export const flattenCommandRows: (
	state: CommandRenderState,
	options: {
		data: CommandData[];
		selections: CommandData[];
		searchResults?: CommandData[];              // 命中搜索时的扁平化来源
		parseName: (item: CommandData) => string;
		isEnabled?: (item: CommandData) => boolean;
		hasChildren?: (item: CommandData) => boolean; // 决定折叠标记
	}
) => CommandRenderRow[];
export const computeWindow: (scrollTop: number, clientHeight: number, count: number) => { start: number; end: number };
export const windowRowsOf: (state: CommandRenderState) => ComputedRef<CommandRenderRow[]>;
export const bindCommandRowElement: (state: CommandRenderState, item: CommandData, el: unknown) => void;
export const setItemClass: (state: CommandRenderState, item: CommandData, className: string, on?: boolean) => void;
export const setItemText: (state: CommandRenderState, item: CommandData, text: string) => void;

// ── YMFileBodyPane/file-body-render.ts ───────────────────────────
export interface FileBodyRenderRow {
	key: string;                 // 稳定键（file 对象 → WeakMap）
	file: FileBodyFile;
	index: number;               // 0 起（键盘网格导航的索引语义不变）
	selected: boolean;
	name: string;
	iconClass: string[];         // 自定义图标仍由消费方 createIcon 覆写提供
	extraClasses: string[];
}

export interface FileBodyRenderState {
	version: ShallowRef<number>;
	rows: ShallowRef<FileBodyRenderRow[]>;
	start: Ref<number>;
	end: Ref<number>;
	countPerLine: Ref<number>;               // normal / tile 两态由 file-body-core 度量给出
	viewMode: Ref<'normal' | 'tile'>;
	rowElements: Map<string, FileBodyItemApi>;
	bump: () => void;
}

export const createFileBodyRenderState: (owner?: unknown) => FileBodyRenderState;
export const rowKeyOf: (file: FileBodyFile) => string;
export const computeRange: (
	state: FileBodyRenderState,
	metrics: { scrollTop: number; width: number; height: number; itemWidth?: number; itemHeight?: number }
) => { start: number; end: number };   // 内部调 file-body-core 的 computeList/TileGridMetrics + computeVisibleRange
export const bindFileBodyRowElement: (state: FileBodyRenderState, file: FileBodyFile, el: unknown) => void;
export const setRowClass: (state: FileBodyRenderState, file: FileBodyFile, className: string, on?: boolean) => void;
```

> 约定：① 两个派生层都不 import 任何 DOM API（只做数据），`createElement`/`appendChild` 留在 M3 的模板与桥里；② `rowElements`/`rowData` 是**过渡桥**，其删除属于收尾（对标 tree 步骤 5b）；③ 单测下沉到派生层：`flattenCommandRows` 与现行 `createCommandBuffer` 逐点对拍（行数/顺序/缩进/文本/类名集合），`computeRange` 与 `file-body-core` 现有 16 个用例的公式对齐。

验证：新增派生层单测（对拍现行 DOM 结果：行数/顺序/缩进/类名集合逐点相等），组件行为零变化。

### M3：模板 v-for 化（渲染换源，API 门面不动）

- `YMCommandList.vue` 模板改为 `v-for` 渲染 `windowRows`，`:ref` 回写桥把「行元素 ↔ 数据行」登记进派生层（同 tree `bindRowElement`），`commandListPrototype` 的渲染函数（`create*`/`update*`/`deleteCommandBuffers`）退化为「bump 版本 + 保证 API 语义」；
- `YMFileBodyPane.vue` 同理（含 tile/normal 两态）；
- **保留**：元素实例上的 65 个方法与事件协议、`updateCommandElement` 覆写点（先保留调用时机，M4 再正式化）。

验证：M1 用例全绿（只允许补 `await nextTick()`）；真机打开事件编辑器编辑一段脚本事件（含折叠/搜索/复制粘贴）无异常。

### M4：消费方迁移（逐步、按用途分类，每类独立 PR）

1. `eslints.ts` 的缩进线：从「覆写 `updateCommandElement`」迁移到正式扩展点（行 extras 回调/注册表），锁定用例不变；
2. `stores/browser.ts` / `stores/selector.ts` 的 `closest('.file-body-item')` → 数据查询（新增 `fileBodyItemOf(target)` 一类 helper），class 仅保留样式职责；
3. `CommandList.vue` 的 65 方法桥：逐个确认是否仍需要（可先用「渲染模式无关 API + 兼容回退」过渡，同 tree `setTreeItemClass` 的做法）。

验证：editor 全量测试 + 真机事件编辑器/文件浏览器冒烟。

### M5：清理与收口

删除 `createElement`/`appendChild` 手工建 DOM 的实现与 `renderElement` 临时宿主（仅保留 WebGL/画布类不可替代者）、移除两文件的 `oxlint-disable` 豁免（受限 API 计数：`command-api.ts` **17 处**、`YMFileBodyPane.vue` **3 处**）、`pnpm dom:guard:tracker` 与文档口径刷新。

验证：`pnpm -F @yami/ui-kit test`、`pnpm -F @yami/editor test`、`pnpm lint`、`pnpm dom:guard:tracker`、`pnpm docs:check`；真机 `open-project` + `drag-here` + 事件编辑器/文件浏览器逐项冒烟。

## 4. 风险与回滚

| # | 风险 | 概率 | 缓解 |
| --- | --- | --- | --- |
| R1 | 65 方法 + 259 处调用点的契约面被打破 | 中 | M3 只换渲染源、不动 API 门面；每步前后跑 editor 全量 |
| R2 | `eslints` 猴补丁与新渲染时序冲突（缩进线丢失/重复） | 高 | M1 先锁缩进线用例；M4 第 1 步专门迁移该扩展点 |
| R3 | 虚拟滚动窗口语义变化（`elements` 只物化窗口行） | 中 | M2 对拍 + 复用 tree 的 `elements` shim 迁移套路（步骤 5b 的做法） |
| R4 | 折叠/选区与 Vue patch 交错（tree 步骤 2 当年回滚的同类问题） | 中 | layout 已 Vue 化（vnode/DOM 归属一致），且 tree 已证实路径可行；仍按 M2→M3 顺序小步走 |
| R5 | 文件body 的 tile 布局尺寸依赖真实测量（jsdom 覆盖不到） | 中 | M1 里 tile 相关用参数化纯函数断言 + 真机冒烟补足 |

**回滚**：每步一个 PR；M3 之前（含 M2）不触碰渲染源，随时可停；M3 出问题 revert 单个提交即可回到命令式渲染（同一套 M1 金标准护航）。

## 5. 与 tree 改造的对照（可复用的机械）

| tree（已完成） | 本方案对应 |
| --- | --- |
| `tree-render.ts`（flattenRows/rowKeyOf/computeWindow/bindRowElement） | `command-render.ts` / `file-body-render.ts` |
| `tree-api.ts` 实例钩子（syncRenderRows/bindRow/rowItemAt…） | 命令列表/文件body 的同名钩子 |
| 渲染模式无关消费方 API（`setTreeItemClass`/`treeRowItemAt`…） | 缩进线扩展点 + `fileBodyItemOf` |
| 步骤 5b 兼容层收口（`elements` shim） | M5 的同类收口 |

> 素材来源：本文件所有行号与计数均为 2026-09-11 实测（`wc`/正则扫描 + `oxlint`），可用 `pnpm dom:guard:tracker` 与 `pnpm docs:check` 复核。
