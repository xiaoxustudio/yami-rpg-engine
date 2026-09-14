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

### M1：行为金标准补齐（在现命令式实现上写）——**✅ 已完成（2026-09-12）**

**结果**：组件级用例 **17 → 43**（`YMCommandList.spec.ts` 12 + `YMCommandList.m1.spec.ts` 12 + `YMFileBodyPane.spec.ts` 4 + `YMFileBodyPane.m1.spec.ts` 15），另有既有 core 用例 27 + 16 作底 ⇒ 达到本步「~40+」的目标。逐项落点：

| 覆盖项 | 落点 |
| --- | --- |
| 缩进公式与层级 | `computeTextIndent` 精确值（zh `indent*2+'em'`、en `indent*4+'ch'`）、嵌套子行 `dataIndent` 更深 |
| 嵌套渲染协议 | `parse` 描述符里的 `{ children: [子命令] }`（四种「返回值里直接放数组」的写法实测无效） |
| 折叠 | `{ fold: true }` → `li.fold` 把手；父行 `dataKey === true` |
| 空白行 | 每层末尾 `createBlankElement` ⇒ `elements.count = 命令数 + 1` |
| 选区与多选 | `selectAll`（需 `focusing`）、`selectMultipleTo`、`selectByPath`、`unselect` |
| 翻页与滚动 | `pageUp`/`pageDown`（含 `select=true` 带走选区，需 stub `el.scroll`）、`scrollToRow`、`scrollToSelection` |
| 命中搜索 | `findString(str, elements, searchMode)` 返回带 `index` 的命中 |
| 文件 body 度量 | 列表/网格两种视图的 `countPerLine`/`visibleLines`/`itemSize` |
| 文件 body 窗口迁移 | 列表按 `scrollLeft`、网格按 `scrollTop`；`content.range` 与渲染行随之变化；`updateContentOffset` 写 transform |
| 文件 body 行契约 | 行 = `file-body-item` + `file-item`，内含 `.file-body-name`（文本为 basename） |
| 空输入 | 空目录、`updateFiles`（normal 无文件）都不建行 |

**未覆盖（明确留给 M2–M5，不算 M1 缺口）**：`highlightTexts` 的静态高亮集、`clear`/`deleteCommandBuffers` 后的元素回收、`eslints` 缩进线扩展点的锁定（属编辑器侧，另有 `event-editor` 系列用例覆盖）。

**这些用例在改造后不允许改语义，只允许改断言方式**（同 tree 步骤 1 的约定）。实现细节事实（选中需 `focusing`、indent 是等长字符串、空白行、`el.scroll` 由 SFC 注入、`parse` 第二参是 `varMap` 且业务字段在 `item.params`、编辑器形态 fixture 五要点）已分别记在各批补测段落中。

### M1 原始目标（存档）

目标：把组件级用例从「12 + 5」提到与 tree 改造前同量级（~40+），至少覆盖：

- **命令列表**：行创建/缩进（`computeTextIndent`）/折叠（`fold`/`unfoldCommand`/`toggle`）/空白行（`createBlankElement`）/选区与多选（`select`/`selectMultipleTo`/`selectAll`）/翻页（`pageUp`/`pageDown`）/滚动到选中与到行（`scrollToSelection`/`scrollToRow`）/命中搜索与高亮（`findString` + `highlightTexts`）/`clear` 与 `deleteCommandBuffers` 后的元素回收；另加**缩进线扩展点**（`eslints` 覆写被调用、行 class/子节点结构）的锁定用例。
- **文件body**：normal/tile 两种视图（`setViewIndex`/`updateViewMode`）/网格度量与窗口迁移（`computeListGridMetrics`/`computeTileGridMetrics` + `computeStartAndEnd`）/内容尺寸与偏移（`updateContentSize`/`updateContentOffset`）/行元素契约（`createFileElement`/`updateFileElement` 的 icon+name 结构）/滚动与空目录。

**M1 第二批补测（2026-09-12，文件 body 组）：14 例**

`YMFileBodyPane/__tests__/YMFileBodyPane.m1.spec.ts` 锁住：**行渲染**（列表视图按文件成行、文本含文件名；文件夹与文件都能成行；空目录不产生行）、**选区**（`selectAll` 出 `selected` 类且 `selections` 非空、`selectByPath` 只选中匹配行、`unselect` 清空）、**网格度量**（列表视图的 `countPerLine`/`visibleLines`/`itemSize` 均 > 0；网格视图 `viewIndex=2` 的 `countPerLine` 与列表视图不同）、**内容尺寸**（`updateContentSize` 给内容元素写上尺寸）、**窗口迁移**（列表视图按 `scrollLeft` 右移后 `content.range[0]` 变大、渲染行切到后面的文件；网格视图按 `scrollTop` 计算；`updateContentOffset` 写 transform）、**`updateFiles`** 在 normal 且无目录文件时不建行。

**编辑器形态 fixture 配方（五条，缺一条都会静默失败）**：

1. 元素 API 挂在**面板元素**上（`attachApi(el.value, …)`），而度量字段写在 `.file-body-content` 上——两者要分别取。
2. jsdom 必须给 `getBoundingClientRect` 打尺寸桩，否则 `computeGridProperties()` 开头 `if (rect(node).width <= 0) return;` 直接返回（`rect()` 就是读它）。
3. `viewMode` 由 **`setViewIndex(0..4)`** 决定（0=list、1=small、2=medium…）；不设序号，`switch (viewMode)` 落空、度量字段一个都不写。
4. **`setViewIndex` 会写 `props.links.head.view`**——fixture 里少这个桩会直接抛错（本文件曾因此 9 例全红，是本轮定位时间最久的一处）。
5. 渲染链固定为 `setViewIndex → updateViewMode → createFlatItems → computeGridProperties → updateContentSize → resize`，少一步就没有行。

**M1 第一批补测（2026-09-12，命令列表组）：`YMCommandList/__tests__/YMCommandList.m1.spec.ts` 新增 9 例**

在**现命令式实现**上锁死以下行为（重写期间只许改断言方式）：`computeTextIndent` 的**精确值**（中文 `indent * 2 + 'em'`、英文 `indent * 4 + 'ch'`）、`selectAll` / `selectMultipleTo` 的选中结果、`pageDown/pageUp`（含 `select=true` 时把选区带过头/带回来；滚动实现由 SFC 注入，故用例把 `el.scroll` 换成 spy，只断言"请求了滚动"）、`scrollToRow` / `scrollToSelection` 的 `scrollTop` 变化、`update` 幂等、空白行契约（`elements.count = 命令数 + 1`，末尾那行由 `createBlankElement` 生成）。

写作过程中发现并记入本文件的事实（都属于"实现细节决定断言方式"）：

- **选中类 API 需要 `focusing = true`** 才会落到 DOM 的 `selected` 类上（`selectAll` 内部就是 `select(0, Infinity)` + 定位 `active`）。
- **`computeTextIndent` 的返回值是等长字符串**（`'0em'` / `'4em'`），先前"长度递增"的直觉断言是错的——必须断言取值。
- **空白行是渲染协议的一部分**：每层命令列表末尾都会追加一个 `createBlankElement`，因此 `elements.count` 不是命令数。
- **`pageUp/pageDown` 依赖 `this.scroll`**（由 `YMCommandList.vue` 注入的滚动实现），纯元素态用例必须自备 stub。
- **嵌套渲染：入口是 `parse` 描述符里的 `{ children: [子命令] }`**（`createCommandBuffer` 里 `buffer.push(content.children)` → `createItems(target, indent + 1, commands[i])`）。**"返回值里直接放数组"不行**——实测四种写法（`[节点,节点,[子命令]]`、`{commands:[子命令]}`、裸子命令、`[[子命令]]`）都只渲染父命令（`elements.count = 2` = 父行 + 空白行、`dataIndent` 全 0）。用例已补，子行 `dataIndent` 更深。
- **fold 把手也由描述符决定**：`{ fold: true }` 才会给该行挂 `.command-fold` 元素（`li.fold`）；不写就没有把手，与"有没有子命令"无关。
- 另需注意：`parse` 的第二个参数是 `varMap`，命令自身的业务字段在 `item.params` 里（用例里判 `item.params.child`，写成 `item.child` 会静默不生效）。

**现有覆盖盘点与补测清单（2026-09-11 实测，逐条对过用例标题）**

| 组件 | 已覆盖（现有 12 + 5 例） | 需补（M1 目标） |
| --- | --- | --- |
| `YMCommandList`（12） | mount 类/id、`createCommandListElement`、`write`/`read`、`select` 高亮、`delete`+history、`undo`、`copy`、`paste`、`toggle`（disable）、`save` 替换、`clear` 重置、`fold` 行结构 + pointerdown 折叠切换 | 缩进/`computeTextIndent` 层级公式；`updateCommandElementFold` 折叠标题行与 `unfoldCommand`；`createBlankElement` 尾部空白行；多选（`selectMultiple`/`selectMultipleTo`/`selectAll`/`selectMultipleUp`/`selectMultipleDown`）；翻页（`pageUp`/`pageDown` 选中 + 滚动量）；滚动定位（`scrollToSelection` active/middle、`scrollToRow`）；搜索（`findString` + `highlightTexts`/`unhighlightTexts`）；变量分析（`analyzeVariables`/`checkVariables`/`scheduleCheckVariables`）；键盘映射（Enter/Arrow/Ctrl+A/Ctrl+C/V/Z/Y + `alphabetCode` 跳转）；指针（`pointerdown` 选区、`doubleclick` 编辑、`pointerup`）；`copyAsText`/`copyAsJSCode` 文本；`enableItems`/`disableItems`/`isParentEnabled`；`clearElements`/`deleteCommandBuffers` 后元素回收；事件协议派发（select/record/popup/open/change/update）；**`eslints` 缩进线扩展点**（覆写被调用 + `pre`/`lines` 结构） |
| `YMFileBodyPane`（5） | mount + core api、`select`/`unselect`、`setViewIndex` 写 head、`updateFiles` 建行、`keydown Delete` 删除流；editor 侧另有右键菜单 2 例（`file-body-popup.spec.ts`） | normal↔tile 切换后的度量与 `countPerLine` 变化；窗口迁移（`computeStartAndEnd`/`updateContentSize`/`updateContentOffset` 的内容高度与偏移）；行元素契约（icon + name 结构、folder/file 两类）；空目录与滚动边界；末行/padded 占位；拖拽（若有）与 `popup` 的坐标透传 |

验证：`pnpm -F @yami/ui-kit test` 全绿且用例数达标；这些用例**在改造后不允许改语义，只允许改断言方式**（同 tree 步骤 1 的约定）。

### M2：派生层（不动渲染）——**🚧 起步（2026-09-12）**

**已落地（切片 1，2026-09-12）**：`YMCommandList/command-render.ts` + `__tests__/command-render.spec.ts`（9 例），**渲染一行没动**（调用方仍是老实现，M3 才接线）：

| 计划名 | 实现名 | 说明 |
| --- | --- | --- |
| 行 key（`WeakMap` 稳定键，同 tree `rowKeyOf`） | `rowKeyOf(command)` | `command.id` 可能重复（脚本/事件列表），故用 WeakMap 发号；同一 command 跨多次派生 key 不变 |
| 扁平化可见行 | `deriveCommandRows(commands, { selection, hits })` | 深度优先；返回 `{ key, command, list, index, indent, folded, selected, disabled, hit }` |
| 缩进层级 | `CommandRowDescriptor.indent`（+ `rowIndents(rows)`） | 顶层 0、子行 = 父 + 1；缩进**宽度**仍由 `computeTextIndent` 给（与语言相关） |
| 折叠态 | `CommandRowDescriptor.folded` | `有子命令 && folded === true`；折叠时子行**不进可见集**（只出父行） |
| 选区 / 搜索命中 / 禁用 | `selected` / `hit` / `disabled` | 选区按**可见行下标**区间（含首尾）；命中集接受 `Set` 或数组 |

**刻意保持纯函数**：不碰 DOM、不读组件状态，同一输入多次调用结果一致（含 key 稳定性）——这样 M3 换渲染时，"行数据"本身有独立的对照物。**下一步（切片 2）**：把 `computeStartAndEnd` 的窗口计算抽成 `computeVisibleRows(rows, { scroll, viewport })`，再由 `command-api.ts` 改调它（此时才第一次改调用方，仍不改渲染输出）。

**已落地（切片 2，2026-09-12）：翻页数学抽出并接线**。`pageUp`/`pageDown` 里内联的滚动数学搬进 `command-render.ts` 的纯函数，`command-api.ts` 改调它们——**这是 M2 第一次改调用方**，行为逐字保持不变（由 M1 的 `pageUp/pageDown` 用例 + M2 新增 6 例双向盯住）：

| 计划名 | 实现名 | 原实现（逐字对照） |
| --- | --- | --- |
| 行高常量 | `ROW_HEIGHT = 20` | 原实现里反复出现的字面量 `20` |
| 一页行数 | `pageScrollLines(viewportHeight)` | `Math.floor(innerHeight / 20) - 1`（加了 0 下限） |
| 上翻滚动位置 | `computePageUpScrollTop(ctx)` | `Math.max(scrollTop - scrollLines * 20, 0)` |
| 上翻目标行 | `computePageUpTargetIndex(ctx)` | `Math.min(anchor, floor((scrollTop + innerHeight)/20) - 1) - scrollLines` |
| 下翻滚动位置 | `computePageDownScrollTop(ctx, clamped)` | `top + scrollLines * 20`，夹取时再 `Math.min(next, rowCount*20 - innerHeight)` 并 `Math.max(top, …)` |
| 下翻目标行 | `computePageDownTargetIndex(ctx)` | `Math.max(anchor, floor(top/20)) + scrollLines` |

**下一步（切片 3）**：同样的办法处理 `scrollToRow`/`scrollToSelection` 的定位数学，然后才是 `file-body-render.ts`（复用 `file-body-core` 的 `compute*Metrics`）。

**已落地（切片 3，2026-09-12）：定位数学抽出并接线**。`scrollToSelection`（三种模式）与 `scrollToRow` 的夹取/定位数学同样搬进 `command-render.ts`，`command-api.ts` 改调：

| 计划名 | 实现名 | 原实现（逐字对照） |
| --- | --- | --- |
| 选区定位（三模式） | `computeScrollToSelection(mode, ctx)` | `active`：`active <= origin ? min(max(top, min), max) : max(min(top, max), min)`（`min/max` 由 active 行所属区间算）；`alter`：按 active 单行；`restore`：按 `start`/`end` 区间；**未知模式返回 `null`**（调用方原样返回、不滚动） |
| 行下标夹取 | `clampRowIndex(index, rowCount)` | `< 0 → 0`、`>= count → count - 1`；行数为 0 时返回 `-1`（新增的保护） |
| 行定位 | `computeScrollToRowScrollTop(index, rowCount, viewport, position)` | `top` → 行顶；`bottom` → 行底 − 视口；否则居中；最后夹到 `[0, count*20 - viewport]` |

**一处形参不窄化的理由**（写进代码注释）：`mode`/`position` 是组件元素 API 的运行期字符串，原实现用 `switch` 的 `default` 兜底；把它们写成 `'active' | string` 会被 lint 判为"字面量联合被 string 覆盖"，故形参保持 `string` 并在注释里列明已知取值。

**下一步（切片 4）**：`file-body-render.ts`——复用 `file-body-core` 的 `compute*Metrics`，输出行数据 + 行 key（对接 M1 已锁定的两种视图度量与窗口迁移）。

**已落地（切片 4，2026-09-12）：文件 body 派生层 `file-body-render.ts`（+9 例）**。度量数学**本来就在** `file-body-core.ts`，缺的是「视图模式 → 度量」的映射与行数据推导（原先分别长在 SFC 的 `computeGridProperties`/`updateViewMode` 的 `switch` 与 `createFlatItems`/`createFileElement` 里）：

| 计划名 | 实现名 | 原实现（逐字对照） |
| --- | --- | --- |
| 视图序号 → 模式 | `viewModeOfIndex(idx)` / `VIEW_MODE_BY_INDEX` | `updateViewMode` 的 `switch`：0=list、1=small、2=medium、3=large、4=huge（越界按边界夹取） |
| 平铺单元尺寸 | `TILE_SIZE_BY_VIEW_MODE` | `computeGridProperties` 里的字面量：small `40×72`、medium `72×104`、large `136×168`、huge `264×296` |
| 模式 → 网格度量 | `computeViewMetrics(mode, core, viewport)` | `computeGridProperties` 的分派（list 走 `computeListGridMetrics`，其余走 `computeTileGridMetrics`） |
| 行 key | `fileRowKeyOf(item)` | 新抽（同 `command-render`/tree 的 WeakMap 发号） |
| 文件列表 → 行数据 | `deriveFileRows(files, isFolderOf?)` | `createFlatItems` 的遍历 + `updateFileElement` 的 `file.basename` 取名；`isFolder` 默认按类名 `FolderItem` 判定，可注入 |

**两处刻意的设计选择**（都被门禁逼出来的）：①`FileRowDescriptor`/`deriveFileRows` 对元素类型**泛型化**、`FileRenderItem` **不加索引签名**——否则消费方传自己的 `FileItem`/`FolderItem` 类实例会被 TS 拒（`TS2322`/`TS2353` 各踩一次）；②取名/取路径只接受字符串或数字（`asText`），不用裸 `String(...)`——否则 lint 的 `no-base-to-string` 会警告对象被串成 `[object Object]`。

**下一步（切片 5）**：把 `command-api.ts`/`YMFileBodyPane.vue` 的调用方接到派生层（前者接 `deriveCommandRows`，后者接 `computeViewMetrics`/`deriveFileRows`），此时仍**不改渲染输出**，M3 才换成模板 `v-for`。

**已落地（切片 5，2026-09-12）：文件 body 的度量调用方接到派生层**。`YMFileBodyPane.vue` 里原本有**三个**度量函数（`computeGridProperties` 的模式 `switch` + `computeListGridProperties` + `computeTileGridProperties`，后两者各自把 6 个字段抄一遍），现在合并成：

```ts
function applyGridMetrics(metrics: GridMetrics): void { /* 统一写 6 个度量字段 */ }
function computeGridProperties(): void {
	if (rect(node).width <= 0) return;
	content.count = -1; elements.start = -1; elements.end = -1;
	if (!VIEW_MODE_BY_INDEX.includes(viewMode)) return;   // 与原 switch 一样：未知模式什么都不设
	applyGridMetrics(computeViewMetrics(viewMode, core, { width, height }));
}
```

行为等价性由 M1 用例盯住（列表/网格两种视图的 `countPerLine`/`visibleLines`/`itemSize`、以及"两种视图每行数量不同"），且**渲染输出一字未改**。附带收益：原先"新增一种视图模式要在两处 `switch` 同步"的耦合消失了——模式表只有 `VIEW_MODE_BY_INDEX` + `TILE_SIZE_BY_VIEW_MODE` 一份。

**切片 5 未做的部分（留给 M3）**：`deriveFileRows` 与 `deriveCommandRows` 还没有被渲染循环消费——行数据接进 `createFlatItems`/`createItems` 就等于改渲染结构，属 M3 的 `v-for` 换源。

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

### M3：模板 v-for 化（渲染换源，API 门面不动）——**✅ 文件 body 换源完成（切片 1：行 key；2/3：受限 API 收口；4：行模型 ↔ DOM 等价；5a：api 数据化；5b：模板换源）**

**✅ 已落地（切片 5b，模板换源）**：`YMFileBodyPane.vue` 的行不再由 api 建：

- **模板**：`.file-body-content` 内 `v-for="row in visibleRows"` + `:key="row.key"` + `:class="{ 'file-item': !row.isFolder, selected: row.selected }"` + `:style="row.style"` + `:ref="(el) => bindRowElement(row, el)"`。
- **api**：`createFlatItems` 只记数据（`flatFiles` + `elements.count`）；`resize()` 只算窗口与**行描述**（`start/end/countPerLine/viewMode/keys/rows`），不再建/挂/摘元素；`bindRowElement` 把模板建出的元素登记回 `elements[]` 与 `file.context.element`，并沿用既有 `updateOnResize` ⇒ **图标、名称、拖拽属性的实现一行没改**。
- **用例**：行元素在下一个微任务才挂上，故 4 个 spec 的渲染助手改 `async` 并 `await nextTick()`；动作类断言（`selectAll`/`unselect`/`selectByPath`/`resize`）后同样补一拍。**56 例全绿**。

**换源过程中踩到并修好的两处**（都属于"换源特有"的错误）：

| 现象 | 原因 | 修法 |
| --- | --- | --- |
| `Unhandled error during execution of ref function`（每次挂行都抛） | `bindRowElement` 里写 `target instanceof ComponentPublicInstance`——而 `ComponentPublicInstance` 是**类型**，运行时不存在，`instanceof undefined` 直接抛 | 改成 `if (!(target instanceof HTMLElement)) return;`（行元素一定是 HTMLElement） |
| 文件夹行的名称在描述里是空串（DOM 里却是 `sub`） | 描述统一取 `basename`，而命令式实现里**文件用 `basename`、文件夹用 `name`** | 描述按类型分别取，与 `updateFileElement`/`updateFolderElement` 对齐 |

**🧹 换源后清理（M5 先做的一小块，2026-09-12）**：`createFolderElement` / `createFileElement` 随切片 5b 变成死代码（行元素改由模板渲染、登记交给 `bindRowElement`），已删除；组件从 2249 行降到 **2221 行**（净 −28，`5 insertions / 33 deletions`）。`elements.versionId` 的三处簿记也失去了用途（版本回收被 Vue 生命周期取代），留待 M5 与其它收尾一起处理。

**🔒 换源前置加固（命令列表，2026-09-12）**：命令列表的换源比文件 body **大一个量级**——它的行元素同时就是数据载体（`element.dataItem`/`dataIndent`/`fold`），选区、折叠、导航全部直接读元素，所以"数据化"这一刀要动的是核心逻辑本身。因此先加 **4 例**跨行行为金标准（`YMCommandList.lifecycle.spec.ts`）：`clear` 让行数归零且 `start/end/active/origin` **复位为 `null`**；`write` 为每条命令建立 `command.buffer`；**`deleteCommandBuffers` 回收的是命令对象上的渲染缓冲，不是行元素**（按直觉写会写错，本轮实测纠正并写进注释）；`clear → write` 往返能重建行数与缓冲。这 4 例的作用是：换源若把行生命周期弄错，用例会直接指出是哪一类。

**真机冒烟清单（5b 落地后请过一遍）**：① 打开项目 → 文件浏览器列出文件/文件夹；② 单击选中、Ctrl 多选、框选；③ 拖拽文件到画布/目录（`draggable` 由 `updateFileElement` 设置）；④ 右键菜单（重命名/删除）与双击打开；⑤ 切换视图（列表/小/中/大/图标）与滚动；⑥ 空目录、搜索态。

**⛔ 切片 5 第一次尝试（2026-09-12）：直接换源**不可行**，需要先做「api 数据化」（已回滚）。**

| 方法 | 改动 | 收益 |
| --- | --- | --- |
| `selectAll` | `els[i].file` → `flatFiles.slice()` | **顺带修掉一个潜在缺陷**：窗口外的行在 `elements[]` 里是 `undefined`，原先"全选"只能选到**当前渲染出的一段** |
| `selectByPath` | 遍历 `flatFiles` | 窗口外的文件也能被按路径选中 |
| `selectDefault` | `els[0].file` → `flatFiles[0]` | 同上 |
| `selectRelativeInGridMode` | `els.indexOf(element)` / `els[index]?.file` → `flatFiles.indexOf(file)` / `flatFiles[index]` | 下标即**数据下标**，不再依赖"元素是否已渲染" |

- **验收证据**：新增用例「`selectAll` 覆盖**全部**行（含窗口外未渲染的那些）」——400 个文件、列表视图下窗口只渲染一段（断言 `rows < 400`），全选后 `selections.length === 400`。**这正是数据化修掉的缺陷**，也让这条路径有了回归保护。
- **同步契约未破**：渲染仍是命令式，因此**现有 55 例（都不 `await`）继续全绿**——这正是切片 5a 的验收方式（用例不 await 即是"同步可用"的守卫）。
- **仍待做（5b）**：模板 `v-for` + `:ref` 回写桥；届时用例补 `await nextTick()`，同步契约由数据层承担。**5b 是值得真机冒烟的那一刀。**

**⛔ 切片 5 第一次尝试（2026-09-12）：直接换源**不可行**，需要先做「api 数据化」（已回滚）。**

- **试了什么**：模板 `v-for="row in visibleRows"` + `:ref` 回写桥（`bindRowElement` 把 Vue 建的行登记进 `elements[]` 与 `file.context.element`，并沿用既有 `updateOnResize` 生成图标/名称/拖拽属性）；`createFlatItems` 改为只记录数据；`resize()` 只算描述。`pnpm lint` 通过。
- **为什么失败**：**渲染变异步**。Vue 在下一个微任务才挂行，而 api 的公开方法（`selectAll`/`select`/`selectByPath`/键盘导航/`clear`/`delete` 流）**同步读 `elements[i]`**，假设 `createFlatItems()`/`resize()` 之后行立刻存在 ⇒ 出现空洞。测试立刻反映出来：`YMFileBodyPane.m1.spec` 7 例、`keys.spec` 3 例、`row-model.spec` 3 例同时红（它们都不 `await`，正是"同步可用"这条隐含契约的守卫）。
- **正确顺序（新计划）**：
  1. **切片 5a（前置，可独立验证）**：把 api **数据化**——`elements[i]` 的读取改成 `flatFiles[i]`（数据），只在真正需要 DOM 的地方用 `context.element`。**行为不变、渲染仍是命令式**，因此现有用例（不 `await`）继续全绿，正好证明"同步可用"没被破坏。
  2. **切片 5b（换源）**：模板 `v-for` + 回写桥；此时只有用例需要补 `await nextTick()`（渲染本就该异步），api 侧的同步契约已由数据层承担。
- **教训（写进 remaining-work）**：**"渲染换源"的第一个动作不是改模板，而是把 api 从"元素数组"迁到"数据数组"**；否则会用"渲染时机"这个隐藏依赖换掉"渲染方式"。

**已落地（切片 5 前置，行描述双写）**：`FileBodyRowModel` 增加 `rows: FileBodyRowDescriptor[]`——每行带 **`{ key, index, name, isFolder, selected, style }`**，即"模板渲染一行所需的全部数据"；`resize()` 在写元素样式的同时把这些字段写进模型（**双写**，不换源）。

- **试出并补上的一个真实缺口**：`selected` 一开始只在 `resize()` 里写，而**选中/取消选中并不触发 `resize`** ⇒ 描述里的选中态会停旧值。补 `refreshRowSelection()`（只刷 `selected` 一个字段），在 `select()`/`unselect()` 后调用。**这正是"先双写、后换源"的价值**：换源前就把"谁该刷新什么"暴露出来，而不是换完再 debug。
- **新增 3 例**（`YMFileBodyPane.row-model.spec.ts` 共 8 例）：① 行描述与 DOM **逐项一致**（key / 名称 / `isFolder` / `style.left|top`）；② `index` 是全局下标且**窗口迁移后更新为新窗口的首行**；③ 选中态进入描述（选中 → true、取消 → false）。
- **下一刀（真正的换源）**：模板用 `v-for="row in model.rows"` + `:key="row.key"` 渲染行，`:style`/`:class` 直接吃描述；api 侧停掉 `createFileElement`/`createFolderElement` 的元素创建，改由 `:ref` 回写桥把它们登记回 `elements[]` 与 `file.context.element`。**该刀需要真机冒烟**（拖拽/重命名/右键菜单在 jsdom 里测不到）。

**已落地（切片 4，文件 body 的可见行模型）**：`YMFileBodyPane.vue` 新增 `FileBodyRowModel`（`{ start, end, countPerLine, viewMode, keys }`）与只读访问 `getRowModel()`——`resize()` 在渲染完可见窗口后，用**同一批元素**的 `rowKey` 填出模型（顺序即 DOM 顺序）。

**为什么这是换源的前置**：M3 要把"行的产生"从 `createFileElement` 搬到模板 `v-for`，搬之前必须先证明**派生层算出的行序列**与**当前真正渲染出的行序列**逐项一致（顺序、key、窗口边界）。新增 `YMFileBodyPane.row-model.spec.ts`（5 例）就做这件事：① 模型的 key 序列与 DOM 行元素**逐项相等**；② 模型窗口切片 == `deriveFileRows(list).slice(start, end)`；③ 模型带出 `start/end/countPerLine/viewMode`；④ 空目录两边都为空；⑤ `getRowModel()` 返回**副本**（改它不影响内部状态）。**5 例全绿 ⇒ 换源有了可对照的"行序列真值"。**

**已落地（切片 3，收口 `command-api.ts` 的建元素调用）**：该文件原本自己有一份 `renderElement`（内含 `document.createElement`）与 **9 处**直接建节点（`li` 行 ×4、`text` ×2、`ellipsis`、`blank`、`createCommandListElement` 的根节点）——全部改走 `utils/detached.ts` 的 `renderDetached`/`renderDetachedDiv`，并把随之冗余的 `addClass(el, …)` 去重（class 直接由 `renderDetachedDiv([...])` 给）、删掉变成死导入的 `render`。⇒ **`command-api.ts` 的 `document.createElement` 10 → 0**（含注释提及也清掉，避免污染口径）。全仓 `createElement` **131 → 121**（ui-kit/components 105 → 95）。

- **仍未动的**：该文件里 7 处 `document.getElementsByName`（变量查找类**查询**，与"建节点"是两回事），随 P2b 的元素 API 契约化一并处理。
- **行为不变**：命令列表 5 个 spec 76 例全绿。

**已落地（切片 2，收口 `YMFileBodyPane.vue` 的受限调用）**：新增 ui-kit 的离屏建元素接缝 `packages/ui-kit/src/utils/detached.ts`（`createDetachedHost` / `renderDetached` / `renderDetachedDiv`，与 editor 的 `utils/dom.ts` 同形），该文件按 **C1 设计豁免**加入 `WHITELIST` 与 `.oxlintrc.json` overrides。`YMFileBodyPane.vue` 自己的 `renderElement` 改为转调 `renderDetached`，两处行元素（`createFileElement`/`createFolderElement`）改用 `renderDetachedDiv([...])` ⇒ **该文件的 `document.createElement` 命中 3 → 0**（B1 验收里"两文件的受限 API 命中归零"的第一半）。

- **顺带**：删除 `render` 的 vue 导入（改由接缝内部使用），避免留死导入。
- **行为不变**：M1 的 14 例文件 body 用例 + 3 例 key 用例全绿，`vue-tsc` 0 新增。

**已落地（切片 1）**：两个组件的渲染行都带上**派生层发的稳定行 key**——`command-api.ts` 在创建 `li` 时写 `li.rowKey = rowKeyOf(command)`（`CommandItemElement` 接口同步加字段）；`YMFileBodyPane.vue` 的 `createFlatItems` 先 `deriveFileRows(dir)` 再把 `key` 传给 `createFileElement`/`createFolderElement`（`FileBodyItemApi` 接口同步加字段）。共 **5 例**新用例（命令列表 2、文件 body 3）盯住：行的 `rowKey` 等于派生层给该对象的 key、重复渲染 key 不变、**路径相同的不同对象 key 必须不同**（说明不能拿路径当 `:key`）。

为什么先做这一步：`v-for` 换源时 `:key` 是"复用行 vs 重建行"的唯一依据；没有稳定 key 就只能退回下标，而命令列表/文件列表都会**插入与删除**，下标 key 会导致 Vue 复用错行（tree 改造里踩过同类问题，故那边也用 WeakMap 发号）。

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
