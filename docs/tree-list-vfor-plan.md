# YMTreeList tree-api.ts 行渲染 v-for 化设计方案

- 状态：设计稿（未实施）
- 日期：2026-09-02
- 范围：`packages/ui-kit/src/components/basic/YMTreeList/`（tree-api.ts、YMTreeList.vue），及 editor 侧消费方迁移路径
- 原则：**纯渲染层重构**。对外命令式 API（`bind/update/select/unselect/drop/...` 约 136 处直调）、事件协议（select/record/popup/open/change/update）、`getListConfig`（creators/updaters/renamable/...）全部保持兼容

---

## 0. 背景与现状

### 0.1 渲染管线现状（tree-api.ts，1666 行）

| 环节 | 实现 | 位置 |
| --- | --- | --- |
| 行创建 | `createNodeElement(item, indent)`：`document.createElement('div')` + `Object.defineProperty(item, 'element', ...)` 缓存复用 | L370-392 |
| 行填充 | `updateNodeElement`：folderMark（懒建、visibility 切换）/ nodeIcon（`createIcon` 或 `renderNodeIcon` 回调）/ textNode（`createText` + `parseName`）/ extras 容器 / text-indent 计算（`markIndent + indent * 12`） | L395-495 |
| 挂载 | `update()` → `createIndentedItems`（normal，递归展开态）或 `createFlatItems`（search，扁平）→ `commonListClearElements` → `resize()` | L243-269 |
| 虚拟滚动 | `common-list.ts`：`resize()` 按scrollTop/clientHeight 计算 [start,end) 窗口，head/foot 元素用 marginTop/marginBottom 占位，DOM 手工 insertBefore/remove | 全文件 |
| 重命名 | 模块级单例 `treeListStatics.textBox`，直接 append 进行元素，隐藏其他子节点 | L76-195、L1139-1165 |
| 拖拽 | HTML5 原生：`dragstart`（hint 元素插入 list 外侧）+ `dragover` 三态（before 2px 线 / into 框选 + 行加 `hint` class / after 2px 线）+ `append` 尾部态 + `drop` 分派 `removeItemTo/removeItemToInsert` | L1396-1571 |
| 键盘/分页 | `keydown`（Enter/Arrow/F2/Ctrl+Arrow）、`selectRelative`、`pageUp/pageDown`、`scrollToSelection`（20px 行高硬编码） | L1246-1304、L985-1136 |
| 滚动锚定 | `insertPaddingAndClear`：拖拽移动前插入 padding div 保持 scrollHeight，再清空全部行 DOM 等待 update 重建 | L1178-1193 |
| undo/redo | record 事件（rename/create/delete/remove 四类）+ `restore()` | L787-904 |

### 0.2 数据层

`tree-core.ts` 已抽离纯数据算法：`createParents`/`deleteCaches`/`cloneNode`/`searchNodesAlgorithm`/`generateUniqueName`/`findItemByProperties`/`containsItem`。**本次不改动 tree-core**。

TreeItem 通过 `Object.defineProperty` 挂两类非数据缓存：`parent`（链）与 `element`（行 DOM）。

### 0.3 消费方现状（grep 统计，2026-09-02，editor/src，排除 `__tests__`）

**(a) 命令式 API 直调（`list.update()/select()/read()/...`）**：约 136 处（任务背景口径）；按文件聚合的热点：`attribute-window.ts`(26)、`enum-window.ts`(21)、`variable.ts`(16)、`local-window.ts`(14)、`event-editor-open.ts`(14)、`ui-list.ts`(13)、`scene-events-list.ts`(10)、`scene-window.ts`(10)、`usePresetElementWindow/usePresetObjectWindow`(各 10) 等，合计约 60+ 文件。

**(b) `item.element` 读取**：约 30 处，分布 18 个文件，按用途分类：

| 用途 | 位置（代表） | 典型代码 |
| --- | --- | --- |
| ① textNode 直写 | `plugin/plugin-list.ts:246`、`data/transition-window.ts:1328`、`commands/command-tip.ts:215`（updaters 内） | `item.element.textNode.nodeValue = text` |
| ② 行 class 修饰 | `commands/event-editor-commands.ts:17-28`、`event-editor-open.ts:106`、`event-editor-events.ts:180`（`related-event` 等）；`script-list.ts:113`、`event-list.ts:121`、`condition-list.ts` 的 `addClass(elements[i], 'weak')`；`LayoutPanel.vue:929-935`（extras 回调里对 `container.parentNode` 加 `reference/highlight`） | `addClass(item.element, 'related-event')` |
| ③ 反查所属 list | `tools/script-list.ts:122-127`、`tools/event-list.ts:130-135`、`tools/condition-list.ts:122`（`element.parentNode` + `classList.contains('tree-list')` → `list.update()`）；`LayoutPanel.vue` **7 处** `container.closest('.tree-list')`（L890/909/1058/1084/1191/1211/1263，scene 可见性/锁定/scene-list extras） | `element.parentNode.classList.contains('tree-list')` |
| ④ 兄弟遍历 | `module/tree-utils.ts:14`（`find_dItem`） | `cur?.element?.nextSibling?.item` |
| ⑤ 可见性判断 | `commands/command-tip.ts:440`、`commands/text-tip.ts:326` | `item.element!.parentNode`（节点当前已渲染） |
| ⑥ extras 容器上下文 | `LayoutPanel.vue:926`（renderNodeExtras 回调） | `container.parentNode as HTMLElement` |

**(c) `list.elements` 直接读取**：`event-list.ts:113`、`script-list.ts:105`、`list-clipboard-methods.ts:81`（按索引取行元素）；ui-kit 内部 `selectRelative`/`scrollToSelection`/`pageUp/pageDown`/`drop` 也依赖 `elements` 的 `count/indexOf/[i].item` 契约。

**(d) 测试基线**：29 个（YMTreeList.spec 13 + tree-core.spec 14 + tree-list-null-data.spec 2），另 editor 侧有 tree-list-bridge/icons/extras 等 spec 依赖 `item.element` 行为。

---

## 1. 目标数据模型

### 1.1 核心思路

TreeItem 树是**非响应式外部数据**（editor 全局 store 直接持有，不能整树 reactive 化，否则破坏 136 处命令式调用与序列化）。因此采用 **"版本号驱动 + computed 派生"** 模式：

- `renderVersion: ref(0)` —— 所有走 `update()` / `updateItemName()` / `select()` / `unselect()` 的变更统一 bump（现有代码里所有结构变更最终都汇聚到 `update()`，是天然的单一汇聚点）。
- `visibleNodes: computed<VisibleRow[]>` —— 依赖 `renderVersion`、`displayMode`、`searchResults`、滚动窗口 `[start, end)`，内部调用纯函数 `flatten(data, expandedState)`。

```
TreeItem[] ──(flatten: 递归 + expanded 判断)──> VisibleRow[] ──(slice)──> 窗口内行 ──v-for──> DOM
                    ▲                                       ▲
        renderVersion bump                          scrollTop ref（窗口）
```

### 1.2 行数据结构

```ts
interface VisibleRow {
	key: string;            // 见 1.3
	item: TreeItem;         // 原始引用，事件回传保持同一性
	indent: number;         // 0 起
	textIndent: number;     // markIndent + indent * 12（沿用现公式，foldable=false 时 markIndent=0）
	markVisible: boolean;   // children instanceof Array && children.length !== 0
	expanded: boolean;      // markVisible && !!item.expanded
	name: string;           // parseName(item) —— 保留解析钩子
	iconClass: string[];    // ['node-icon', class==='folder'?'icon-folder':'icon-file'] 或 renderNodeIcon 占位
	rowClass: string[];     // 受控 class，见 1.4
}
```

派生函数与 `createIndentedItems`（tree-api.ts L303-323）逐行等价：normal 模式按 `item.expanded && children.length` 递归；search 模式直接平铺 `searchResults`（indent=0）。`item.parent === undefined` 时抛 `'No parent!'` 的防御保留。

### 1.3 key 设计（关键）

**不能用 `item.id`**：script-list / event-list 允许重复 id 项（重复项靠 `weak` class 标记，见 script-list.ts L109-117），id 冲突会导致 Vue 复用错行。采用 **WeakMap 发号**：

```ts
const keyMap = new WeakMap<TreeItem, string>(); // 模块级，随 item 生命周期
let keySeq = 0;
const rowKey = (item: TreeItem) => {
	let k = keyMap.get(item);
	if (!k) keyMap.set(item, (k = `n${++keySeq}`));
	return k;
};
```

同一 item 在多次 flatten 之间 key 稳定 → Vue patch 只移动/复用 DOM，不销毁重建 → **行 DOM 复用语义与现有 `item.element` 缓存一致**，这是 element 回写桥（第 2 节）成立的前提。

### 1.4 模板与绑定

```vue
<template>
	<div ref="root" class="tree-list" :id="props.id" tabindex="0">
		<div class="scroll-spacer-top" :style="{ height: start * 20 + 'px' }" />
		<div
			v-for="row in windowRows"
			:key="row.key"
			:ref="el => bindRowEl(row.item, el)"
			class="node-item"
			:class="rowClass(row)"
			:style="{ textIndent: row.textIndent + 'px' }"
			draggable="true"
		>
			<span v-if="row.hasChildrenMark" class="folder-mark" :class="{ expanded: row.expanded }" />
			<span :class="row.iconClass" :class="{ expanded: row.expanded && row.item.class === 'folder' }" />
			{{ row.name }}
			<!-- extras/icon 由 :ref 回调命令式填充，见第 3 节 -->
		</div>
		<div class="scroll-spacer-bottom" :style="{ height: (rows.length - end) * 20 + 'px' }" />
	</div>
</template>
```

要点：

- `rowClass(row)` = `['node-item', item.class 相关类, selected, expanded(folderMark/nodeIcon 语义), plain, weak, invalid, highlight, hint]`。**selected 等运行态从受控状态（selections + selectionVersion、dragHint 状态、itemClasses 注册表）计算**，不再由 select/unselect 直接 addClass。
- `folder-mark` / `node-icon` 从"懒建 + 手工 visibility 切换"变为 `v-if`/`:class`，删除 `element.markVisible/markIndent/textIndent/expanded` 等字段式 diff 逻辑。
- 事件监听（scroll/keydown/pointerdown/pointerup/dblclick/dragstart/dragend）仍挂 root，通过 `seek(event.target, '.node-item')` 找行——**行内 DOM 结构不变**，事件分发代码零改动。

---

## 2. element 缓存语义迁移方案（核心难点）

### 2.1 问题本质

`item.element` 是渲染层的 DOM 逃逸口：editor 约 30 处 + ui-kit 测试直接读它。v-for 化后 DOM 归 Vue 管，若 Vue patch 时销毁/替换行元素而 `item.element` 仍指旧节点，所有 ② class 修饰、③ 反查、④ 兄弟遍历、⑤ 可见性判断会静默失效或操作游离节点。

### 2.2 迁移策略对比

**方案 A：一步到位删除 element 依赖**——v-for 化同时把 editor 30 处 + LayoutPanel 7 处 closest + 3 个工具窗口反查全部改成新 API（事件上抛/props 传递/`list.getNextVisibleItem`）。
缺点：单次变更面 ≈ 80+ 文件；`item.element` 已渗入 undo/redo（command-tip 在 record 恢复后重挂 tooltip）、extras 回调上下文（`container.parentNode`）；无金标准测试兜底前风险不可控。**否决**。

**方案 B（推荐）：分阶段——先 v-for + 桥接回写，后逐类消解消费方依赖**：

**阶段桥 1：`:ref` 回写 element（保持引用稳定）**

```ts
const bindRowEl = (item: TreeItem, el: unknown) => {
	if (el instanceof HTMLElement) {
		if (item.element !== el) {
			Object.defineProperty(item, 'element', { configurable: true, value: el }); // 沿用 defineProperty 语义
			attachRowInternals(item, el); // element.item / textNode / folderMark / nodeIcon / extras 桥字段
		}
	} else if (item.element && !item.element.isConnected) {
		delete item.element; // 行被销毁（item 移出树/窗口外），与 deleteNodeElements 语义对齐
	}
};
```

- 因 1.3 的稳定 key，Vue 只移动/复用行，`item.element` 引用在 item 生命周期内不变 → 消费方 ①②③④⑤ 全部照常工作。
- **textNode 桥**：模板中 `{{ row.name }}` 由 Vue 生成文本节点，`bindRowEl` 时 `element.textNode = el.lastChild`（或渲染一个显式 `<span class="node-text">`，取其 firstChild 保持 `textNode` 是 Text 节点）——plugin-list/transition-window 的 `textNode.nodeValue` 直写继续生效，但**必须同时 bump renderVersion**，否则下次 patch 会用旧 name 覆盖（见 2.4）。
- **elements 数组 shim**：flatten 后（`watchEffect`）同步 `list.elements = rows.map(r => r.item.element)` 并维护 `count/start/end`。event-list:113、script-list:105、list-clipboard-methods:81 的索引访问、ui-kit 内部 `elements.indexOf(...)` 契约不变。

**阶段桥 2：class 受控化（防 Vue patch 覆盖命令式 class）**

Vue 的 class patch：绑定值**不变**时不触碰 DOM，但**一旦变化**会整体重写 `className`，把 editor 命令式加的 `related-event/weak/highlight` 抹掉。这是桥 1 最大的暗坑。对策：

- ui-kit 提供 **itemClasses 注册表**：`setItemClass(item, cls, on?: boolean)`（WeakMap<TreeItem, Set<string>>），`rowClass(row)` 把注册表并入绑定值 → patch 值与 DOM 始终一致。
- ui-kit 内部先行迁移：`select/unselect`（selected）、`dragover`（hint）、`script/event-list 的 weak`（由消费方改调 `setItemClass`）。
- 桥 1 阶段允许 editor 暂时继续 addClass（只要该行绑定值不同时变化就不触发覆盖——例如 `related-event` 通常在非选中行上），但**列为已知过渡风险**，阶段 3 必须清零。

### 2.3 推荐结论

**采用方案 B**。理由：
1. 渲染层替换（ui-kit 包内，约 5 文件）与消费方迁移（editor，80+ 处）解耦成独立 PR，各自可验证可回滚；
2. 桥接期 136 处 API 调用、7 处 closest 反查、`elements` 契约零改动，15 个工具窗口可逐个冒烟；
3. 最终态（阶段 4）element 依赖清零后，可整体删除 `element`/`parent` defineProperty 缓存，TreeItem 回归纯数据。

---

## 3. 拖拽 / 键盘 / 重命名 / 搜索高亮的保留策略

| 能力 | 处置 | 说明 |
| --- | --- | --- |
| 拖拽指示器（hint 元素、三态定位） | **保留命令式** | hint 是插在 list 外侧、按 `measure()` 绝对定位的浮层，与行 DOM 归属无关；`dragstart/dragover/drop/dragend` 全链路零改动 |
| 拖拽行 `hint` class | **改 Vue 绑定** | `dragover` 里 `addClass(element,'hint')` 改写 `dragHintTarget/dragHintPosition` 响应式状态，`rowClass` 计算；否则被 class patch 覆盖 |
| 拖拽期间滚动锚定 `insertPaddingAndClear` | **删除** | v-for 原地 patch，不存在"先清空再重建"的 scrollHeight 塌陷，padding hack（L1178-1193）连同 `treeListStatics.padding` 一并移除；行为锁定测试确认拖拽跨屏时 scrollTop 不跳变 |
| 键盘导航（selectRelative/pageUp/pageDown/scrollToSelection） | **保留命令式实现，数据源换 rows** | 20px 行高算法不动；`elements.indexOf(selection.element)` 由 shim 继续满足 |
| 重命名 textBox 单例 | **保留命令式** | append 进行元素不影响 Vue（Vue 子节点 patch 基于锚点插入，不清空容器；blur 后 name 变更只走 setText 更新既有 text 节点，textBox 已 remove）。`element.textNode` 桥字段保证 `textBox.blur` 里 `element.textNode.nodeValue = this.lastText` 路径（L190）可用 |
| F2/Enter/Arrow 键位、500ms Timer 慢双击重命名 | **保留命令式** | 全在 keydown/pointerdown，不涉及行渲染 |
| 搜索 | **改 Vue** | `display/searchResults` 变为响应式；search 模式 rows 直接平铺，不再走 createFlatItems；`searchNodesDebounced` 不变 |
| 搜索结果无高亮标记 | **维持现状** | 现实现仅过滤不高亮，不新增 |
| weak/invalid/reference/highlight 等业务 class | **阶段 3 改 `setItemClass`** | 见 2.2 桥 2 |
| renderNodeExtras / renderNodeIcon | **保留命令式容器填充** | 行模板渲染空 `.tree-node-extras` / `.tree-node-icon` 容器，`:ref`/`onUpdated` 时调用回调填充；editor TreeList.vue 的 vnode bridge（render into container）零改动；`container.parentNode` 上下文（用途⑥）照常有效 |

---

## 4. 折叠动画与虚拟滚动

**折叠动画**：现实现为瞬时折叠（无过渡）。本次**不引入**动画——TransitionGroup 与虚拟窗口（固定 20px 行高的 slice 渲染）叠加复杂度高、收益存疑。若后续需要，路径是：展开/折叠时对被移除/插入的行区间做 CSS `max-height` 过渡或 FLIP，属独立需求。

**虚拟滚动**：`common-list.ts` 的手工窗口（head/foot margin 占位 + 手动 insertBefore/remove）整体废弃，替换为：

- `scrollTop: ref(0)`（scroll 监听写入，节流 rAF）；
- `windowRows = computed(() => rows.slice(start, end))`，`start/end` 按现公式：`start = min(floor(st/20), count-1)`，`length = ceil(ch/20) + 1`；
- 占位改为模板内两个 spacer div（高度 = `start*20` / `(count-end)*20`）。

语义等价性：现有 `updateOnResize`（changed 标记 + 懒 updateNodeElement）不再需要——所有行字段都是 computed 派生；`padded` 模式（底部多 1 行占位）在 bottom spacer 高度上加 20px。**大数据（1000+ 节点，scene/ui 层级）性能必须有基准测试**（见第 5 节步骤 1）。

---

## 5. 分步实施计划（每步独立可验证）

### 步骤 1：行为锁定测试补齐（在**现有命令式实现**上写，作为金标准）

> **进度（2026-09-09）**：金标准测试已补齐至 **80 用例**（YMTreeList.spec 13 + tree-list-interactions.spec 26 + **tree-list-golden.spec 新增 25** + tree-core.spec 14 + null-data 2），ui-kit 全量 627→652 绿、oxlint 0 警告。本次 `tree-list-golden.spec.ts` 覆盖的缺口：
>
> | 缺口 | 覆盖用例 |
> | --- | --- |
> | dragend 清理 | 取消路径复位 dragging/hint/监听；进入目标后取消清除 hint class |
> | F2 重命名 | F2 入口→textBox 挂载→提交改名→rename record 派发；未聚焦不进入 |
> | 删除级联 | 删除含选中子孙的 folder：unselect 事件携带被移除项、选中清空；不影响子树外选中 |
> | undo/redo（restore 全类型） | rename/delete/remove × undo+redo（create 的 undo→redo 循环） |
> | element 契约 | update 后窗口内行连接；refresh 后 element 重建为新节点（旧节点断开）；折叠→展开引用不变 |
> | duplicate 唯一名 | 连续 duplicate 生成 `Actor N` 递增序列、插位相邻、选中副本、folder 副本展开收集 |
> | 虚拟滚动窗口 | 200 行窗口 [0,21) 只挂载窗口行 + 首尾 margin 占位；scroll→resize 窗口迁移 [150,171) 且滚动锚点正确 |
> | scrollToSelection | active/middle 定位公式、滚动位置不变不重写、无滚动条时 no-op |
> | Ctrl+Arrow 纯滚动 | ArrowUp/Down 各 ±20px 不改变选中；Ctrl+ 其它键不滚动不改选中 |
> | 快/慢双击 | 慢双击（500ms Timer）进入重命名并提交改名；快双击文件 → open、不进入重命名；快双击 folder → 切换展开态 |
>
> **仍未覆盖（当前实现无对应键位映射，待步骤 2 定义行为后补测）**：PageUp/PageDown（keydown 未映射）；大数据（1000+ 节点）性能基准（步骤 2 前置）。

现有 29 个测试缺口（全部先于任何重构落地，重构期间只允许改断言方式不允许改断言语义）：

| 缺口 | 用例（预计） |
| --- | --- |
| 拖拽全链路 | dragstart 建立拖拽态/hint 插入；dragover 三态切换（before/into/after 阈值 4/16px 与无子节点 10px）；contain 自包含拒绝；append 尾部态；drop → removeItemTo/removeItemToInsert 的落点；dragend 清理；lockDirectory 限制 |
| 键盘导航 | ArrowUp/Down 边界（首尾循环到 last/0）、ArrowRight 展开、Enter open、F2 重命名、Ctrl+Arrow 纯滚动、PageUp/PageDown 选中+滚动联动 |
| unselectIn | 删除/折叠包含选中项的文件夹时，子孙选中被清除且 unselect 事件携带目标数组 |
| duplicate | 唯一名生成（`name N` 序列）、插入到紧邻兄弟后、选中并滚动到位 |
| popup | 右键已选行（value=item）、右键未选行（先 select 再 popup）、空白处（value=null）、坐标透传 |
| 滚动 | scrollToSelection active/middle 两模式、scrollTop 不变时不写、hasScrollBar=false 时跳过 |
| undo/redo | restore 四类（rename/create/delete/remove）× undo/redo 8 组合（现仅覆盖 create） |
| element 契约 | update 后 `item.element.isConnected`、折叠→展开后 element 引用**不变**、deleteNodeElements/refresh 后 element 被删 |
| 虚拟滚动 | 200 节点 + 模拟 clientHeight，验证任意 scrollTop 下窗口内行数与 marginTop/marginBottom 占位 |
| null/边界 | 现有 2 个空数据用例外：data 为 null 时 update/keydown/pointerdown 全部安全 |

预计 +18~22 个，总量约 50 个。

### 步骤 2：YMTreeList.vue 模板 v-for 化（ui-kit 包内，对外零感知）

> **进度（2026-09-09，地基已落地）**：新增 `tree-render.ts`（数据派生层：`flattenRows` 与旧 `createIndentedItems/createFlatItems` 逐点等价、`rowKeyOf` WeakMap 稳定 key、`computeWindow` 虚拟窗口公式、`bindRowElement` element 回写桥、`itemClasses` 注册表、`ROW_HEIGHT`）＋ `YMTreeList.vue` 模板 v-for（windowRows + 上下 spacer + folder-mark/node-icon/node-text/extras 容器 + `:ref` 回写桥）＋ tree-api 实例钩子（`syncRenderRows`/`syncElementsShim`/`bindRow`/`bindNodeIcon`/`bindNodeExtras`/`applyRowUpdaters`/`rowIndexOf`/`rowItemAt`/`rowCount`/`setItemClass`）＋ 导航/滚动/翻页数据源切到 rows（`selectRelative`/`scrollToSelection`/`pageUp`/`pageDown`/`getElementIndexOfSelection`）＋ `clear()` 不再手清 DOM。开关 `setVueRowRenderEnabled()`（`isVueRowRenderEnabled()`）双路可选，**当前默认仍为旧命令式路径**（保证仓库全绿），新路径由 `tree-list-vue-rows.spec.ts`（4 用例）覆盖：派生行/折叠标记/元素桥、选中与折叠刷新 + element 引用稳定、虚拟窗口 + spacer 迁移、搜索平铺。
> **翻默认前的实测差距**：把默认切到新路径后，ui-kit 树用例 84 → 56 通过（28 处失败），全部属两类**机制差异**、非语义差异：① 断言紧接 `update()` 同步读 DOM（Vue patch 异步，需补 `await nextTick()`）；② `elements[i]` 语义——新路径只为「窗口内行」物化元素（计划 2.2 桥 1 明确认可），旧断言（如 `elements[21].parentNode === null`、`scrollToElement` 类）需按窗口语义改写；另 margin 占位断言需改为 spacer 高度（语义不变）。
> **翻默认已完成（2026-09-09）**：`vueRowRender` 默认改为 **true**（v-for 为唯一默认渲染路径，开关仅留给测试/回滚）。适配结果：ui-kit 树用例 **84/84**、editor 侧 bridge/icons/extras **19/19**、**ui-kit 全量 656/656**、**editor 全量 1868/1868**、oxlint 0、`tsc`/`vue-tsc` 0。
> 适配清单（均为机制差异，语义保留）：① 断言前补 `await nextTick()`（Vue patch 异步）；② `elements[i]` 仅物化窗口内行（`elements[21] === undefined`），占位改由 `.scroll-spacer` 高度断言（累计偏移语义不变）；③ 折叠/窗口外行卸载 → `item.element` 回收，展开后回填新行；④ `refresh()` 后按 key 复用同一行元素（不再“重建新节点”）；⑤ search 模式先取行元素再切 display；⑥ 图标：未提供 `renderNodeIcon` 时回退 `this.createIcon(item)`（编辑器覆写 `createIcon` 的自定义图标路径保持）。
> **新增修复**：`addNodeTo` 中 parent 初始化提前到 `unselect()` 之前（unselect 现在会触发重派生，避免 `No parent!`）；`insertPaddingAndClear` 在 v-for 路径 no-op；`nodeIcon` 可能为 null 的空值判断。
> **剩余**：删除 `insertPaddingAndClear`/`treeListStatics.padding`（命令式路径保留到步骤 5 一并删）；真机「数据绑定型窗口」逐窗冒烟（本轮真机确认 19 个树列表已全部是 v-for 形态、spacer 就位，行渲染需打开对应窗口逐窗验证）。

- 引入 renderVersion/rows/windowRows/rowKey/bindRowEl/itemClasses/elements shim；
- 删除 createNodeElement/updateNodeElement/createIndentedItems/createFlatItems/updateOnResize 调用路径（treeListPrototype 对应方法保留为 API 门面，内部改为 bump version）；
- `update()` 语义 = bump renderVersion（触发 computed 重算 + Vue patch），对 136 处调用方完全透明；
- `clear()` 的 `textContent = ''` 改为清 data 引用 + bump（绝不能直接清 DOM，会炸掉 Vue 管理的节点）；
- 删除 insertPaddingAndClear 与 treeListStatics.padding；
- **验证**：步骤 1 全部测试通过 + editor 侧 29 个 + bridge/icons/extras spec 通过 + 15 个工具窗口手动冒烟清单（scene/ui/animation/variable/attribute/enum/local/plugin/particle/easing/transition/team/array/presetElement/presetObject）。

### 步骤 3：class 受控化收口

- selected/hint/weak/dragging 全部经 rowClass；导出 `setItemClass`；
- ui-kit 测试从 `data[1].element!.classList.contains('selected')` 改为读 API（`el.read()` + class 断言保留——DOM 断言依然有效且应保留）。

### 步骤 4：editor 消费方逐类迁移（按用途①→⑤分五个小 PR）

> **进度（2026-09-09，已交付）**：ui-kit 新增**渲染模式无关**的消费方 API（v-for 路径走派生行，命令式路径回退 `elements`/DOM，保证开关两侧都可用）：`setTreeItemClass(item, cls, on)`、`setTreeItemText(item, text)`、`clearTreeItemText(item)`、`isTreeItemRendered(item)`、`treeOwnerListOf(item)`、`treeRowCount(list)`、`treeRowItemAt(list, i)`、`treeRowIndexOf(list, item)`，类型 `TreeListRowApi<T>` 供 editor 列表接口 extends/Partial。
> 迁移清单（逐类，全部经 API 不再直接摸 DOM）：① textNode 直写 → `plugin-list.list_updateTextNode`、`transition-window`(Easing)、`useTeamWindow` 改 `setTreeItemText`（窗口外行同样生效）；② class 修饰 → `event-editor-commands/events/open`（local/global/related-event）、`script-list`/`event-list`（weak）、`command-tip`（command-suggestion-item）、`text-tip`（text-suggestion-item）改 `setTreeItemClass`；③ 反查 list → `script-list`/`event-list`/`condition-list` 的 `element.parentNode` 改 `treeOwnerListOf`；④ 兄弟遍历 → `module/tree-utils.find_dItem` 改 `treeRowIndexOf`+`treeRowItemAt`（DOM nextSibling 退役）；⑤ 可见性判断 → `command-tip.listOpen`/`text-tip.listOpen` 改 `isTreeItemRendered`；另：`list-clipboard-methods.delete`（行号选中相邻项）、`usePresetObject/ElementWindow.searcherInput`（行遍历）、`useVariableGetterWindow`（命令列表行遍历 + 窗口外行跳过）、`eslints.range`+hover 循环（窗口边界守卫）、`attribute-window`/`enum-window`（`item.element?.group` 按需读）全部迁移。
> 验证：ui-kit 全量 **656/656**、editor 全量 **1868/1868**（206 文件）、oxlint 0、`tsc`/`vue-tsc` 0；**真机**（翻默认后重建）`open-project` + `drag-here` 端到端通过（跨组 drop/折叠/页签完整性），渲染器日志无新增错误。
> 剩余：`LayoutPanel.vue` 7 处 `container.closest('.tree-list')`（extras 回调内 DOM 反查，行为仍正确、属可选优化）+ 真机「数据绑定型窗口」逐窗人工冒烟。

| 用途 | 迁移目标 |
| --- | --- |
| ① textNode 直写 | `list.renameNode(item, text)` / `updateItemName`（已 bump version） |
| ② class 修饰 | `list.setItemClass(item, cls, on)` |
| ③ 反查 list | extras 回调签名扩展第二参传 list 实例（ui-kit 加 backward-compat：仍可 closest，但标记 deprecated）；script/event/condition-list 的 `element.parentNode` 反查改为接口注入 |
| ④ 兄弟遍历 | `list.getNextVisibleItem(item)`（rows 索引查询） |
| ⑤ 可见性判断 | `list.isItemVisible(item)`（rows 二分/缓存查找） |

### 步骤 5：清理与最终态

> **进度（2026-09-09，主体已交付）**：删除命令式行渲染实现与相关脚手架——
> `createNodeElement`、默认 `updateNodeElement`、`createIndentedItems`、`createFlatItems`、`updateOnResize`、`insertPaddingAndClear` + `treeListStatics.padding`（editor `components/tree-list.ts` 同步去掉 padding 暴露）、`vueRowRender` 开关与 `isVueRowRenderEnabled`/`setVueRowRenderEnabled`、`commonListResize` 依赖。`update()`/`clear()`/`resize()`/`select()`/`unselect()`/导航翻页全部只保留派生行路径（`renderState` 恒存在）。
> 兼容扩展点保留：消费方**实例级** `updateNodeElement` 覆写（text-tip 富行内容）由行绑定桥在 patch 后调用（`tree-list-vue-rows.spec` 新增用例锁定）；`createIcon` 覆写、`creators`/`updaters`/`renderNodeIcon`/`renderNodeExtras` 均为正式扩展点。
> 验证：ui-kit **656/656**、editor **1868/1868**、oxlint 0、`tsc`/`vue-tsc` 0；真机翻默认后 `open-project` + `drag-here` 通过。
> **仍保留（步骤 5b，另行评估）**：`elements` shim（现仅作「窗口行视图」，供 eslints 缩进线、`useVariableGetterWindow` 等按行号访问）、`item.element` 回写桥（行就是 DOM，`treeOwnerListOf` 回退用）、`tree-core.deleteCaches` 的 element 分支与 `NodeElement` 类型——它们不再是渲染路径的一部分，删除属纯收口、需一并迁移上述少数按行号访问的消费方。

- 删除 `elements` shim、`item.element` defineProperty、`tree-core.deleteCaches` 中 element 分支、NodeElement 类型；
- TreeItem 回归纯数据（parent 链保留或同样收口为显式 API，另行评估）。

> **真机验证发现并修复（2026-09-09）**：`updateItemName` 仍按旧语义直写 `element.textNode`，派生行不会重算 → **重命名后行文本不刷新**（jsdom 金标准未覆盖该路径）。已改为「名称变更即 `syncRenderRows()` 重派生」，新增 `tree-list-vue-rows.spec` 回归用例；真机 F3 打开全局变量窗口后重命名，行文本正确变为 `RenamedVar`（数据 `read().name` 同步）。
> **真机窗口冒烟（自动可达部分）**：用 CDP 真实按键（`Input.dispatchKeyEvent`）触发加速键可打开窗口——`F3`（全局变量）已验证：`#variable-list` 渲染 **20 行真实数据**（`.node-text` 真实名称、`tree-node-icon` 自定义图标、4 个折叠标记、spacer 就位）；交互链路验证通过：点击选中（`selected` 落位）→ 点折叠标记 20→16 行（`expanded` 4→3）→ 再展开 20 行且选中项保留 → F2 重命名生效。其余窗口缺少可达加速键（或需场景/页面上下文），仍留人工冒烟。

### 步骤间回归闸门

每步：`pnpm test`（ui-kit + editor 全量）+ 冒烟清单 + 大数据性能对比（1000 节点展开/折叠/滚动帧时间，阈值：不劣于现状 10%）。

---

## 6. 风险清单与回滚策略

| # | 风险 | 概率 | 影响 | 缓解 |
| --- | --- | --- | --- | --- |
| R1 | Vue class patch 覆盖命令式 class（related-event/weak 等被抹） | 高（桥 1 期） | 行状态显示错误 | 步骤 3 尽快收口；桥 1 期冒烟重点覆盖"选中态变化 + 业务 class 共存"场景；itemClasses 注册表在步骤 2 即内置 |
| R2 | `{{ name }}` patch 覆盖 textNode 直写（updaters 先写 nodeValue、后同名 patch） | 中 | 名称闪烁/回退 | updaters 改调 renameNode（步骤 4①）；过渡期 textNode 桥写入同时 bump |
| R3 | key 意外不稳定（WeakMap 被新对象替换，如 cloneNode 后未回写） | 中 | 行重建 → element 引用更换 → 消费方拿到游离节点 | duplicate/restore 已走 cloneNode（不复制 element）；测试覆盖"折叠→展开 element 引用不变" |
| R4 | 虚拟滚动行为差异（margin 占位 vs spacer）导致 scrollToSelection/pageUp 偏移 | 中 | 键盘/分页导航错位 | 步骤 1 滚动金标准测试 + 200 节点用例逐步对拍 scrollTop |
| R5 | `elements` shim 时序（flatten 后才同步，事件处理先于 onUpdated） | 低 | selectRelative 等读到旧数组 | shim 同步在 computed 求值同 tick（watchEffect flush:'sync' 或 flatten 时直接构建） |
| R6 | clear()/textContent 路径残留 | 低 | Vue DOM 树被清空后 patch 崩溃 | 步骤 2 一并改掉 + null-data spec 扩展 |
| R7 | 性能回退（computed 全量 flatten 在超大树频繁 bump） | 低 | 卡顿 | flatten 为 O(n) 纯遍历，与现 createIndentedItems 等价；必要时增量：只对展开区间重算 |
| R8 | editor 侧 hidden spec 依赖旧 DOM 时序（icons/extras spec 56 个断言） | 中 | 测试失败阻塞 | 步骤 2 前跑通基线；断言语义不变，仅等待方式（await nextTick）调整 |

**回滚策略**：

1. 步骤 2-3 各为独立 PR（ui-kit 包内），回滚 = revert 单个 commit，渲染路径回到 createNodeElement 命令实现（**该实现保留到步骤 5 才删**，中间版本可用包内开关 `YM_TREE_LEGACY_RENDER` 环境变量双路切换，默认新路径）；
2. 步骤 4 每类用途独立 PR，任一类出问题单独 revert，不影响其他；
3. 数据层（tree-core/TreeItem 结构）全程不动，任何时刻旧渲染路径可完整恢复；
4. 金标准测试（步骤 1）在旧实现上录制，双路径共用 → 切换/回滚均有同一套行为断言护航。

---

## 附录 A：涉及文件清单

- ui-kit：`YMTreeList.vue`、`tree-api.ts`、`tree-core.ts`（仅类型）、`utils/common-list.ts`（废弃引用）、`utils/dom.ts`（部分）、`__tests__/`
- editor：`components/common/TreeList.vue`（零改动，验证）、`components/layout/LayoutPanel.vue`（7 处 closest + extras）、`tools/{script,event,condition}-list.ts`、`module/tree-utils.ts`、`commands/{command-tip,text-tip,event-editor-*}.ts`、`plugin/plugin-list.ts`、`data/transition-window.ts`、`animation/animation-initialize.ts` 等（步骤 4 全量清单以 grep 基线为准，见 0.3）
