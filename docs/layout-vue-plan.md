# Layout / PageManager 页面组织 Vue 化设计方案

- 状态：实施中（M1 摸底 / M2 数据层+反序列化 / M3a 骨架 / M3b-1 叶子宿主 / M3b-2a 引擎双路 / M3b-2b 引擎 Teleport 模式 + LayoutPanel 12 页整壳接线均已交付并提交；**F.5 真机冒烟核心项已于 2026-09-09 自动验证通过**（见附录 F.5 验收记录）；**M4-1 已交付**：navDrop 金标准 4 用例 + Teleport 模式同组 drop 数据化（moveTabWithin/applyTabDropWithin，默认关）；下一步 M4-2 交互数据化剩余项）
- 日期：2026-09-03
- 范围：`packages/editor/src/components/layout/LayoutPanel.vue`、`engine/layout/layout.ts`（M3b-2 后 ~1815 行，文内行号多为早期快照、随代码漂移，判定以函数名为准）、`stores/layout.ts`、`components/layout/LayoutTreeView/LayoutPalettePage/LayoutPaletteHost/PaletteNode.vue`、`ui-kit` 的 `YMPageManager`/`YMNavBar`（命令式 api 与 .vue 双实现）
- 来源：vue3-migration-plan.md「阶段 5（调整后）」首项 —— tree v-for 化回滚（revert `648773f0`）暴露的**前置架构障碍**

---

## 0. 为什么必须先做这一步

tree v-for 化第 2 步回滚根因（vue3-migration-plan.md L32-34）：

> layout 系统在首次 `loadLayoutScheme` 的 `createGroups`（layout.ts:243-244）把 Vue 渲染的 PageManager（`#workspace-page-manager`/`#layout-page-manager`，LayoutPanel.vue 内 `<PageManager>`）子页命令式 `appendChild` 搬运进新建 group，Vue vnode 仍持旧父子关系；v-for 化 TreeList 的同步 flushRender 频繁触发 patch，与搬运交错即 vnode/DOM 失配。

即：**同一批 page-frame / nav-item DOM 节点，Vue 认为它挂在 `#layout-page-manager` / `#layout-nav` 的插槽下，实际却被命令式搬进了 group 的 manager/nav 中**。只要布局层还在做这种"偷偷 reparent"，任何让 Vue 频繁 patch 的改动（v-for 行渲染、响应式表单）都会在首次点击页签时崩溃（`insertBefore null` / `__vnode null`）。

本方案的目标不是美化代码，而是**让布局层的 DOM 归属回归 Vue 的 vnode 认知**（要么 Teleport 显式搬家、要么数据驱动渲染），从而解锁 tree v-for 化及其后所有 Vue 化改造。

---

## 1. 现状模型（必须原样理解的运行结构）

### 1.1 两级 PageManager + 两处 "palette"

LayoutPanel.vue 模板（Vue 渲染、插槽托管）中存在**一级宿主 + 两级 palette**：

```
#workspace-page-manager (PageManager, YMPageManager 命令式双实现)
 ├─ page-frame[value=home]                  （首页，永不被搬）
 ├─ page-frame[value=directory]             （「项目工作区」宿主页）
 │   └─ #layout-content
 │        ├─ NavBar#layout-nav              ★ palette ①：全部 nav-item（12 个 tab 按钮）
 │        └─ PageManager#layout-page-manager★ palette ②：全部 page-frame（页面内容，12 页）
 ├─ page-frame[value=scene/ui/animation/particle]  （其余工作区宿主页，空壳，用作 scheme 容器）
```

- `nav-item`：`.nav-icon + .nav-text`，`value` 即 tab key（project/scene/scene-object/ui/ui-element/animation/…/inspector）。
- `page-frame`：页面内容容器；`scene/ui/animation/particle` 四页内含 `#xxx-body` + MarqueeArea + TreeList 等 Vue 组件与引擎画布。
- inspector 页内部还有第三级 `#inspector-page-manager`（嵌套 PageManager），其子页通过 `Inspector.switch()` 切换、**从不被搬**，不在本方案范围内。

### 1.2 Layout 单例的职责（layout.ts）

| 入口 | 行为 | 问题 |
| --- | --- | --- |
| `initialize`（L153） | 登记 `items`（读 palette①/②，`item.page` 互指）；`this.manager` = workspace manager；挂 window/pageSwitch 监听 | — |
| `pageSwitch`（L874） | workspace manager `switch` 事件 → saveNavStates → 插 GL.canvas → `loadLayoutScheme(value)` | — |
| `loadLayoutScheme`（L810） | `clear(page)` **清空宿主页**（连带摧毁两个 palette 的 DOM 挂载！）→ `createGroups(scheme, page)` → `updateGroups` → 激活各 group 首 tab | **第一次构建就把 Vue 插槽子树与文档树拆散** |
| `createGroups`（L221） | 用 `renderElement(h('group'))` 命令式建 group 树；叶子 `createGroupContent`（nav+manager）+ **`nav.appendChild(item)` / `manager.appendChild(item.page)`** 把 palette 里的节点**物理搬入** | ★ vnode/DOM 失配根源（L243-244） |
| 二次同 scheme | else 分支（L828）：把 item/page 再 append 回 group（幂等恢复） | 搬运动作随每次加载重复 |
| `navWrite`（L982） | nav `write` 事件 → `parentNode.manager.switch(index)` | — |
| `saveNavStates`/`lastValue`（L775） | 离开工作区时把各 group 当前 tab 存到 `nav.lastValue`，返回时恢复 | — |
| 拖拽/缩放 | nav drag 跨 group 移动、region 分割、border 缩放，全部**命令式改 DOM**（appendChild/replaceChild/insertBefore） | M4 需数据化 |
| `saveLayoutScheme`/`saveToConfig`（L785/L846） | 遍历现 DOM 树反序列化成 scheme（end/tabs/children） | M5 改为读数据 |

### 1.3 scheme 数据结构（LayoutScheme）

```ts
type LayoutScheme = {
	end: number;                 // 相对父级的分割比例终点（根=1）
	split?: 'horizontal' | 'vertical';
	children?: LayoutScheme[];   // 容器节点
	tabs?: string[];             // 叶子节点：本 group 的 tab key 顺序
};
```

每个工作区宿主页（directory/scene/ui/animation/particle）独立缓存一份 `page.scheme`（L820），并对应 `config.layout` 中一个 key。

### 1.4 关键语义清单（摸底测试锁定对象）

1. 首次加载某工作区：`clear(page)` 摧毁 palette 挂载；页面/页签节点被搬进命令式 group 树；每个 group 首 tab 被激活（nav-item `selected` + manager 内 page-frame `visible`）。
2. group 叶子 = `nav-bar`（命令式 api）+ `page-manager.group-manager` + `group-border`；容器节点带 `split` class。
3. tab 点击：nav-item `pointerdown` → `nav.write` → `write` 事件 → `Layout.navWrite` → `group.manager.switch` → `visible` class 迁移 + resize 事件。
4. 二次同 scheme 加载（返回工作区）：幂等恢复 + `nav.lastValue` 恢复上次 tab。
5. 跨工作区（directory↔scene）：同一批 page-frame / nav-item **节点对象不变**，只是 parentNode 在 group 之间搬移；旧 group 变空但不消失。
6. `saveLayoutScheme` → 结构 equals 输入 scheme（end/tabs 保序）。
7. 每页宽高/dpr 记录在 page-frame 上，`updateGroups` 在尺寸变化时才 dispatch resize。

---

## 2. 目标模型与方案路线对比

### 目标

- 页/页签 DOM 的唯一所有者回归 Vue；布局树的增删改走**数据**，渲染走 **v-for/Teleport**。
- 引擎/编辑器模块对 DOM 的既有假设（页面**常驻挂载**、靠 `visible` 显隐、`item.page`/`group.manager.active` 读节点）在过渡期尽量不破。
- 对外命令式入口（`Layout.*`、store 转发）在过渡期保持兼容，按里程碑逐批切换调用方。

### 方案 A：Teleport 显式搬家（推荐起步）

保留「页面物理上位于其所属 group 的 manager 内」的现状布局形态，但把搬家从命令式 `appendChild` 改为 Vue `<Teleport :to="group.managerEl">`：vnode 父链留在 LayoutPanel，DOM 归 group 管 —— 恰好消除失配，且**不动内容组件的常驻挂载语义**。

- 前置：scheme 必须成为**响应式数据**（决定每个 value 当前属于哪个 group、group 的 manager/nav 元素引用），group 树本身先由 Vue 渲染。
- 挑战：Teleport target 必须先于内容存在（group 是后建的）→ 需要 `:disabled` + 挂载后注册时序；拖拽/缩放期间命令式 insertBefore 仍会与 Vue 在目标容器内的 diff 竞争（tab 顺序变化必须同步到数据）。
- 收尾：Teleport 本身在 M5 后逐步被「active 页组件化」取代或保留为长期形态，二选一，见 M6。

### 方案 B：页面组件化 + active 渲染（最终态候选）

不搬 DOM：每页内容是 `value → 组件` 注册表，叶子 group 的 manager 只渲染 `active` 页的 `<component :is>`。
- 优点：彻底消灭搬运，拖拽/缩放纯数据化最简单。
- 致命伤：**切换 tab = 卸载/重建页面**。scene/ui/animation/particle 的引擎模块依赖 DOM 常驻（GL.canvas 手动 insert、监听器、dpr 记录、Timeline 等），历史上所有重挂载尝试都出过 null 事故（见 vue3-migration-plan 的 AppShell `@vue:mounted` bug）。需先把每页拆成无副作用可重建的纯 Vue 组件，工程量大、风险高。

### 方案 C：维持命令式 + 只"假装"稳定

清空 palette 前先整体摘除 Vue 管理（`render(null)` 显式卸载）再命令式重建。
- 等于放弃 Vue 化，与计划目标冲突，仅作回退参考。

### 推荐：**A 起步，B 远期**，理由

1. A 直接命中根因（vnode/DOM 归属），对既有页面常驻假设零破坏，风险面最小；
2. A 的中间产物（响应式 scheme、Vue 渲染 group 树、数据化 tabs）是 B 的必经之路，不浪费；
3. 拖拽/缩放改造（M4）在 A 的数据模型上做，之后切 B 只换叶子渲染层。

---

## 3. 分阶段实施计划（每步独立可验证、可回滚）

### M1：补齐行为金标准测试（已扩全）

jsdom 结构级（`engine/layout/__tests__/`，共享 fixture 在 `layout-spec-utils.ts`）：
- `layout-scheme-baseline.spec.ts`（6）：palette 首载消耗/清理、group 递归结构、首 tab 激活、点击切换、跨工作区搬移、二次加载恢复 lastValue、scheme 往返。
- `layout-lifecycle.spec.ts`（5）：saveNavStates 全路径（selected→lastValue + write(null) 清空激活）；同页二次加载 else 分支 lastValue 恢复；updateGroupTabs 读 nav 子序重建 group.tabs 并进入 saveLayoutScheme 往返；mergeGroups 同向嵌套 split 平铺合并 + end 重算；navDragstart/dragend 生命周期（store.dragging、region 挂卸、head 指针屏蔽还原）。
- `layout-scheme.spec.ts`（19）：M2 数据层纯函数。

集成级（需跑真实 Electron，不进 jsdom）：首次进入任意工作区 → 切 tab → 拖 tab 跨 group → 分割/缩放 → 切工作区往返，冒烟清单逐项手测（几何与拖拽竞争依赖真机）。

### M2：scheme 数据化（不动渲染）

- 状态：**数据层已交付** + **M2b 反序列化器已接入**：
  - 纯数据模型 `LayoutTreeNode = SplitNode | GroupNode`（带稳定 id；`end/split/children` 或 `end/tabs/active`）；
  - `parseLayoutScheme/toLayoutScheme` 往返保真、`leavesOf/findGroup`、`activateLayoutTab`、`moveLayoutTab`（同组重排/跨组插入/源组清空折叠）；`active` 用页签 value；
  - `engine/layout/layout-deserialize.ts`（附录 D 契约实现）：`deserializeGroupElement(groupEl)` / `deserializePage(pageEl)`（空/未物化页返回 null，active 读 manager.index、undefined→null）；
  - **`Layout.saveLayoutScheme` 已替换为 `toLayoutScheme(deserializeGroupElement(root))`**（原 L785-808 手写递归序列化删除；基线往返 + updateGroupTabs 往返 + merge 后重算均有测试钉死，行为零变化）。
  - 阶段说明：本轮未引入 mirror 状态（无死代码），saveLayoutScheme 走「实时 DOM→树→落盘」即收敛了序列化逻辑；M3 渲染换源前再决定是否加运行期镜像。
- 待办：
  - M2b 已收尾（`saveToConfig` 实时经 saveLayoutScheme 走数据模型；config 生命周期金标准 `layout-config.spec.ts` 5 用例：saveToConfig 回写已物化页/未物化页保持、switchLayout 缓存失效重建、loadFromConfig 接管、default 兜底、双缺不构建）。M3 渲染换源前无需再做镜像；
  - 之后 M3 渲染：group 树 Vue 渲染 + 页/页签 Teleport（消费 `leavesOf/active` 数据、`deserializePage`、`pageTargets`）。
- 验证：M1 摸底测试仍绿（行为不变），layout __tests__ 全绿（40→M3a 后 45），lint 0 警告。

### M3：group/nav/manager 骨架 Vue 渲染 + 页/页签 Teleport（核心里程碑）

**M3a（已交付）**：递归数据渲染组件 `components/layout/LayoutTreeView.vue`（输入 `LayoutTreeNode|null`，输出与命令式一致的 `.group`/`horizontal|vertical`/叶子 `.nav-bar`+`.page-manager.group-manager`/`.group-border` 结构；split 含子递归，`v-for :key=node.id` 稳定；node=null 渲染空）+ `layout-tree-view.spec.ts`（5 用例：4 个 scheme 与命令式 createGroups 的结构签名/叶子数/叶子宿主等价 + 空树）。vue-tsc 门禁 0 新增错误。

**M3b（分两步交付）**：

**M3b-1（已交付）叶子宿主 Vue 化（C.5#1）**：
- `LayoutTreeView.vue` 叶子改由 `YMNavBar`/`YMPageManager`(.vue) 渲染——组件 onMounted 把 `read/write/unselect/on` 与 `switch/on/index/active` 等命令式 API 直接挂到 root 元素，命令式消费方零改动；保持 `.nav-bar`/`.page-manager.group-manager`/`.group-border` 结构与类（M3a 结构等价断言继续绿）。
- 新增 `engine/layout/layout-vue-tree.ts` 水合层：`mountVueGroupTree(host, scheme, handlers)`——`parseLayoutScheme` → `render(h(LayoutTreeView))` → `await nextTick`（等 .vue onMounted 挂 API）→ 按先序把 `end/split/tabs/nav/manager/border` expando 绑到 Vue DOM、并做与 `createGroupContent`/`createGroupBorder` 一致的 nav/border 事件接线；`unmount()` 只卸载组树（幂等），宿主可再次挂载。
- 金标准 `layout-vue-leaf.spec.ts`（6 用例）：Vue 宿主 vs 命令式 `loadLayoutScheme` 的结构签名/叶子宿主类/首载激活/页签点击切换双路等价 + 水合 expando 与数据树一致 + unmount/重挂。layout __tests__ 58→64 全绿、oxlint 0、editor typecheck 过、vue-tsc 门禁 0 新增。
- 接线所需前置组件均在册：`layout-page-targets.ts` + store `pageTargets`（Teleport :to 输入）、`LayoutPalettePage.vue`（页面 Teleport 组件）、`layout-teleport-probe.spec.ts`（风险 R1/R2 jsdom 试验台）。

**M3b-2（分两半交付）**：

**M3b-2a（已交付）引擎双路分支（默认关）**：
- 双路开关落地：`layout.ts` 模块级 `YM_LAYOUT_VUE_RENDER`（localStorage，默认关；`isLayoutVueRenderEnabled`/`setLayoutVueRenderEnabled`/`awaitVueLayoutLoad` 供测试/时序方使用）。
- `loadLayoutScheme` 首载分支：开关开时改走异步 `Layout.loadLayoutSchemeVue`（fire-and-forget + `.catch`，`lastVueSchemeLoad` 记录供等待）——先 unmount 该宿主 page 上旧的 Vue 组树（`vueTreeHandles` WeakMap），`clear(page)` 后 `mountVueGroupTree(page, scheme, {navWrite/navPointerdown/navDragstart/navDragend/borderPointerdown})` 渲染+水合，再把 palette 页/页签搬进叶子宿主、激活首 tab、`updateGroups`、`syncPageTargets`——尾部与命令式首载逐点等价；**命令式分支一字未动**（开关关时零时序变化）。
- 二次同 scheme 加载（else 分支）与命令式共用同一恢复逻辑（不重建组树）；重载（先删 `page.scheme`）会先卸载旧树再重建单根。
- 金标准 `layout-vue-scheme-load.spec.ts`（6 用例）：Vue 首载 vs 命令式首载逐叶状态/叶子宿主类/激活/palette 清空一致；默认关仍走命令式；点击+二次加载 lastValue 恢复且组树不重建；重载卸载重建单根；跨工作区 pageTargets 归属；双路快照等价。layout __tests__ 64→70 全绿、oxlint 0、editor typecheck 过、vue-tsc 门禁 0 新增。

**M3b-2b（引擎 Teleport 模式 + LayoutPanel 整壳接线已交付；F.5 真机冒烟核心项已自动验证通过，见 F.5 验收记录）**：
- 整壳 Teleport 机制已探针验证（`layout-shell-teleport.spec.ts` 4 用例）：①整壳 `.page-frame`（壳+内容）经 LayoutPalettePage 进 YMPageManager(group-manager) 后 manager.switch/index/active/visible 语义正常、换归属只搬家不重建（挂载计数恒 1）、`collectPageTargets` DOM walk 仍能发现归属；②nav-item Teleport 顺序 = palette 声明序，引擎「nav 排序 pass」（按 group.tabs appendChild）任意时刻可收敛到 tabs 序且幂等、nav.write 选中不受影响；③visible 类随节点搬家——真实序列依赖离开工作区前 `saveNavStates → write(nav,null) → switch(null)` 先清 visible，探针已按此前置模拟并收敛。
- **引擎 Teleport 模式已落地（默认关，`YM_LAYOUT_VUE_RENDER=2|teleport`）**：新增 `Layout.loadLayoutSchemeVueTeleport`——宿主 page 只渲染/挂载 Vue 组树（不做 clear），按叶子发布归属（页→manager、页签→nav，store `pageTargets`/`tabTargets`，新增 `removePageTargets`/`removeTabTargets` 供卸载前收回），等 Teleport 落位后按 group.tabs 排序收敛每个叶子 nav/manager、激活首 tab（首载）或 `nav.lastValue`（二次进入）；组树重载时先收回旧树归属再卸载。端到端金标准 `layout-vue-teleport-load.spec.ts`（4 用例）：palette 复刻（整壳 page/nav wrappers）+ 真实引擎入口——首载落位激活、跨工作区只搬家不重建 + 返回 lastValue 恢复组树不重建、重载收回再发布节点身份不变、默认关命令式对照组。layout __tests__ 76→80 全绿、oxlint 0、editor typecheck 过、vue-tsc 门禁 0 新增。
- 接线设计见**附录 F**：整壳 Teleport 模型、归属源、排序 pass、clear 终版语义；**LayoutPanel 12 页/12 nav-item 整壳接线已落地（工作区未提交）**——`LayoutPaletteHost`（纯模板实现，无 DOM API）包裹 `#layout-content` 内 NavBar/PageManager 子树，`PaletteNode`（source=page/tab）分别包 12 `.page-frame`/12 `.nav-item`；默认关透传 DOM 与现状一致（`layout-palette-wrappers.spec.ts` 护栏：单/多节点无额外元素、host 不产生 body 容器），teleport 模式把 palette 搬入 body 隐藏容器供引擎挂 Vue 组树；真机冒烟验收见 F.5。layout __tests__ 85→86（新增空 value 透传用例）。
- **注意**：Vue 叶子 API 在 mount（nextTick 后）才可用 → Vue 分支 loadLayoutScheme/pageSwitch 异步时序首次进入各工作区须真机验证（附录 E.2）。
- 验证：M1/M3a/M3b-1/M3b-2a 断言双路径跑 + LayoutPanel 接线后真机冒烟清单（附录 E.3/F.5）；全程默认关、独立 PR 可回滚。

### M4：交互数据化

- **前置金标准（部分落地，2026-09-09）**：新增 `layout-nav-drop.spec.ts`（4 用例）锁定 navDrop 生效动作——①同组 drop 到 nav 空白（append）：页签/页移到底部、group.tabs 同步、saveLayoutScheme 往返保真；②同组 drop 到指定页签前（insert-before）；③跨组搬入：页签/页迁入目标组、源组剩余项重新激活、双方 tabs 同步；④源组被搬空：源组移除 + `prev.end=1`、同向根收敛为单组（含 flatten）。几何无关的 DOM/数据语义全部钉死，供 navDrop 数据化改造对照。
- 剩余 jsdom 不可覆盖（几何依赖，留真机冒烟）：region 落点方向（left/right/top/bottom/center 阈值与相邻组判定）、border 缩放（computeSizes/setGroupSize/pointermove）、navDragenter 的 location 计算。
- **真机拖拽冒烟（2026-09-09，`scripts/smoke-layout.mjs` drag-mode0/drag-mode2，合成 DragEvent 序列）**：
  - mode0 跨组搬入（project → inspector 组）：源组搬空 → 组移除 + `prev.end=1` + 根 flatten 为单组 [inspector, project]，与 `layout-nav-drop.spec.ts` 第 4 例 jsdom 语义逐点一致（几何真实路径验证通过）。
  - mode2（Teleport）同组重排：`[inspector, project] → [project, inspector]`，group.tabs 同步；随后页签 pointerdown 往返切换与 scene↔directory 往返均正常，节点身份不变、渲染日志仅预存 CSP 提示。**结论：当前命令式 navDrop 在 Teleport 模式下无即时 vnode/DOM 失配**；M4 数据化定位为一致性加固（消除命令式 insertBefore 与 Vue patch 的潜在竞争），非救火。
  - 仍缺真机用例：region 分割（左/右/上/下）与 border 缩放（几何最重），留 M4 改造后补。
- **M4-1（2026-09-09 已交付）Teleport 模式同组 drop 数据化（默认关）**：layout-scheme.ts 新增纯函数 `moveTabWithin(tabs, tab, anchor)`（与 navDrop 命令式 insert-before/append 语义逐点等价，+4 单测）；layout.ts 新增 `applyTabDropWithin`（moveTabWithin 推导 tabs → 按 tabs 序做 nav/manager 排序 pass 收敛，复用附录 F.2 语义，无 insertBefore 差量）；`navDrop` 在 `vueRenderMode === 2` 且同组 inside 时走该数据路径，**命令式路径（模式 0/1）一字未动（保留到 M5）**。`layout-nav-drop.spec.ts` +2（mode2 开关下 append/insert-before 与命令式结果一致），layout __tests__ 90→96。**M4-2 待办（真机探针定位，2026-09-09）**：mode2 跨组搬空 → 命令式折叠发生在 Vue 组树上，折叠后单叶内再拖拽失效（region/监听不挂）；需把跨组「源组清空」收敛改为数据更新 + 整页 scheme 重挂载（复用 loadLayoutSchemeVueTeleport 重载路径），再以 mode2 真机拖拽复核。mode0 折叠后单叶重排同一前提待复核。
- nav 拖拽 drop：`removeItemTo` 落点计算保留命令式（测坐标/邻居），但**生效动作**改为更新 tabs 数据 + `list.updateGroupTabs` 读数据；region 分割/合并、border 缩放改 `updateGroups` 读数据重排，移除命令式 replaceChild/insertBefore 路径。
- 验证：nav-drop 金标准 + M1 拖拽/缩放缺口用例 + 真机冒烟清单。

### M5：清除脚手架 & 解锁 tree v-for

- 删除 `page.scheme`/`nav.lastValue`/`items.page` 的 DOM 耦合读法、`renderElement(h('group'))` 渲染路径、palette 双实现同步点；`saveToConfig` 读数据。
- `clear(page)` 销毁 palette 的行为删除（palette 退化为纯 Vue 组件模板，不再被清）。
- 在 M5 全量绿后，重做 `docs/tree-list-vfor-plan.md` 步骤 2（渲染层 v-for）。

### M6：B 路线评估（可选）

若 M4 后仍觉 Teleport 拖拽竞争脆弱，再评估叶子组件的「active-only 渲染 + 页面 state 外置」，逐页灰度（先非引擎页，scene/ui/animation/particle 最后）。

---

## 4. 风险清单与回滚

| # | 风险 | 概率 | 缓解 |
| --- | --- | --- | --- |
| R1 | Teleport target 时序（group 后建，页先挂） | 高 | `:disabled` + 数据归属先于 DOM 建立；挂载后统一 flush。**jsdom 试验台已绿**（`layout-teleport-probe.spec.ts`：动态 :to 在命令式 manager 间搬家不重建、disabled 兜底回宿主不重建），剩余真机拖拽压测 |
| R2 | 拖拽期间命令式改序 vs Vue 在 target 容器 diff | 中 | **jsdom 试验台已绿**：manager 内命令式插入的外部兄弟节点在 teleport 子树 patch 期间不被吞掉；drop/顺序变更仍应先写 tabs 数据再触发 patch，M4 收口 |
| R3 | 页面常驻挂载被破坏（切 tab 卸载） | 中 | 方案 A 全程不卸载；B 路线逐页灰度 |
| R4 | `clear()` 销毁 palette 的现存副作用被外部依赖（item 引用、事件） | 中 | M2/M3 保留兼容读；M5 前不删命令式兜底 |
| R5 | jsdom 无几何（clientWidth=0），几何类行为无法回归 | 高 | 结构断言 + 集成冒烟清单双轨 |
| R6 | inspector 嵌套 manager / 引擎页 DOM 常驻被误伤 | 中 | 范围外声明；冒烟清单覆盖 |

回滚策略：
1. M2-M4 各为独立可 revert 的 commit；M3 若失控，回到命令式 `createGroups`（**保留到 M5 才删**）。
2. M1 摸底测试在任何时刻都是旧行为基线，切换失败立刻暴露。
3. tree v-for 化保持回滚态，不在 M3 绿之前重试。

---

## 附录 A：涉及文件

- editor：`components/layout/LayoutPanel.vue`（两级 palette + 宿主页 + 整壳接线）、`components/layout/LayoutTreeView.vue`（M3a 递归渲染）、`LayoutPalettePage.vue`（M3b Teleport 归属）、`LayoutPaletteHost.vue`/`PaletteNode.vue`（M3b-2b LayoutPanel 接线件）、`engine/layout/layout.ts`、`layout-scheme.ts`（M2 数据层）、`layout-deserialize.ts`、`layout-page-targets.ts`、`layout-vue-tree.ts`（水合层）、`stores/layout.ts`（pageTargets/tabTargets）、`utils/element-utils.ts`（clear/write/read）、`title/title-bar.ts`（workspace 切换源）、`scene/ui/animation/particle` 各 window 模块（`Layout.manager.switch('directory')` 消费方，M5 改 store）
- tests：`engine/layout/__tests__/`（layout-scheme/layout-deserialize/layout-config/layout-lifecycle/layout-page-targets/layout-tree-view/layout-vue-leaf/layout-vue-scheme-load/layout-shell-teleport/layout-palette-page/layout-palette-wrappers/layout-vue-teleport-load/layout-group-render + layout-spec-utils 共享 fixture；用例数为循环展开的运行时口径）
- ui-kit：`YMPageManager/`、`YMNavBar/`（命令式 api 与 .vue 双实现，M3 后决定收敛）
- docs：`vue3-migration-plan.md`（进展记录）、`tree-list-vfor-plan.md`（解锁后重做）

## 附录 B：布局状态读写面盘点（sub-agent，2026-09-03）

路径简称：LAY=`engine/layout/layout.ts`、LST=`stores/layout.ts`、CFG=`services/project/config.ts`、OPEN=`services/project/open.ts`、CLOSE=`services/project/close.ts`、TITLE=`title/title-bar.ts`、MENU=`title/menu-bar.ts`、INIT=`main/initialize.ts`、UCFG=`utils/config.ts`、PMA=`ui-kit/YMPageManager/page-manager-api.ts`、NBA=`ui-kit/YMNavBar/nav-bar-api.ts`、PMV/NBV=对应 .vue、LPV=`components/layout/LayoutPanel.vue`。

> 行号口径说明：下文 LAY/LPV 行号为早期快照（layout.ts 由 ~1555 增至 ~1815，M3b 双路/Teleport 逻辑插桩后），附录 C/D/E/F 的 L 引用同理会漂移；核对实现请以函数名/符号为准。

### B.1 `Layout.layout` / `Layout.default`
- LAY:188-193 `initialize` 载入 `default.json` → `Layout.default`（write）。
- LAY:207-219 `switchLayout(layout)`：`layout=…` + 遍历子页 `delete page.scheme`。
- LAY:810-816 `loadLayoutScheme` 读 `layout ?? {}`，缺失回落 `default`。
- LAY:846-856 `saveToConfig` 以 `page.scheme===layout[key]` 守卫回写 `layout[key]` 后 `config.layout=layout`。
- LAY:858-860 `loadFromConfig`：`layout = config.layout ?? {}`。
- MENU:519 重置布局 `Layout.switchLayout(Layout.default)`；LST:45 `switchLayout(name)` 无调用方（死转发，可删）。
- 驻留：内存里 `Layout.layout` 与 editor store `config.layout` 指向同一对象（EST `config` shallowRef），磁盘在 quit 时经 CFG:34-35 落 `~/.openyami/config.json`。

### B.2 `page.scheme`（外层 page-frame 缓存）
- LAY:211-213 `switchLayout` 删除；LAY:820-821 首载写入（幂等判据）；LAY:850-852 `saveToConfig` 守卫读。
- 载体：`#workspace-page-manager` 直接子 page-frame（home/directory/scene/ui/animation/particle）。

### B.3 `nav.lastValue`
- LAY:775-783 `saveNavStates` 写（selected→lastValue + `write(nav,null)`）；LAY:840-842 二次加载恢复读。
- 纯 LAY 私有 expando（NBA 无此字段）。

### B.4 `Layout.items` / `items.list` / `item.page`
- LAY:157-174 `initialize` 构建映射（palette①的 nav-item × palette②的 page-frame，value 配对）；`items.list` 经 defineProperty。
- 消费：createGroups(L238-248)、saveNavStates(L776)、loadLayoutScheme 幂等分支(L829-838)、navPointerdown 焦点(L997-1008)、navDrop(L1192-1206，含 `page.width/height=null` 擦除)。
- layout 体系内**无 `item.element`**（命中均为 tree/各类 list）。

### B.5 持久化调用链
- quit(CLOSE:48)→`Editor.quit`→CFG `saveConfig`(Layout.saveToConfig@25)→JSON→`FSP.writeFile`(34-35)。
- 启动(INIT:83-100)：`Editor.config=data`→`Layout.initialize`→`loadConfig`(Layout.loadFromConfig@CFG:87)→`manager.switch('home')`。
- UCFG:22-35：全局 config.json 读 + 缺省回落模板 `default.json` 种子。
- SCFG(setting-config renderer) 只写自身 host.config，**不涉及 layout**。

### B.6 workspace 顶层切换源（均走 `Layout.manager.switch(...)` → PMA:switch → `pageSwitch` LAY:874-980）
- INIT:100 home；OPEN:28/37/58/76/101/135/165/179；CLOSE:21 `switch(null)`；TITLE:251/507/631-649/685；NPW:336；animation-file/ui-file/particle-file/scene-window 的打开失败回落 directory。
- `pageSwitch` 内：按 event.last 关旧窗口/saveNavStates(905)，按 event.value `loadLayoutScheme`(954-971)。

### B.7 几何/group 度量
- group 元素 expando：`end/split/tabs/nav/manager/border`（LAY:225-235,728-741）。
- updateGroups(L254-342) 重排 + root/active `dpr/width/height` 缓存与 resize 派发；setGroupSize/computeSizesBefore/After(L509-620) 写 `end`；pointermove(L1508-1537) 缩放写 end；updateGroupInfo(L352-357) 写 `info.textContent`。
- group manager `index/active`（PMA:25-61，navDrop 跨组时直写 L1184-1190 绕过 switch）；nav `.selected`/`dataValue`（NBA:57-89）。PMV/NBV 顶层 Vue 版用 reactive 桥接。

### 状态归属汇总
- **DOM expando/类**：page-frame `scheme`；PageManager `index/active/switchEventEnabled`；group `end/split/tabs/nav/manager/border`；nav `.selected`/`dataValue`/`lastValue`；尺寸 `dpr/width/height`；`.visible`/`.ready-to-focus`。
- **Layout 单例**：`layout/default/items/manager/heads`（`afterChange` 死代码）。
- **pinia**：layout store 仅 dragging/resizing/focusableSelector/focusableElements（双向桥）。
- **磁盘**：`config.json` 的 `config.layout`；模板 `Project/default.json` 为 `Layout.default`。

## 附录 C：M3 接线调研（sub-agent A，2026-09-03）

### C.1 页面成分（#layout-page-manager 12 页）
- 纯空容器（低难，先不动）：`project`（#project-browser 由 AppShell Teleport 注入 FileBrowser）、`particle-layer`（仅 TreeList #particle-list）。
- 列表页（中难）：`scene-object`/`ui-element`/`animation-motion`（TextBox+TreeList）、`animation-easing`（SelectBox+canvas）。
- 引擎画布页（高难，先整包对待不拆内部）：`scene`/`ui`/`animation`/`particle`（toolbar-item 空 div + MarqueeArea + GL.canvas 由 pageSwitch insertBefore 进 #xxx-body）；`animation-timeline`（TreeList + 多空容器由引擎填）。
- `inspector` 页整页不动：内层 `#inspector-page-manager`（约 40 个 #xxx-vue-mount 页）不被 createGroups 搬运，天然兼容 AppShell Teleport。

### C.2 ui-kit 双实现（group 内渲染换 .vue 的可行性）
- YMPageManager/YMNavBar 的 `.vue` 在 onMounted 后已把 switch/on/write/read/index/active 桥到 root → 现有 `group.manager.switch(...)`、`group.manager.index/active=`、`write(nav,…)` 在 mount 后可继续工作。
- 差异：`.vue` 版 switchEventEnabled 恒 true（事件更吵）；无 dataValue 缓存；childNodes 清理在 onMounted 而非 attach。勿对 Vue root 再调 attach api（会重复挂监听/二次清理）。
- 建议：M3 叶子 group 组件用 YMPageManager.vue/YMNavBar.vue，命令式侧持 `{nav,manager}` 指向其 root。

### C.3 Teleport
- vue 实际 3.6.0-rc.5；AppShell.vue 已有 `<Teleport v-for :to>` 动态先例。
- 只认 element/string selector，不支持 function；用 computed 包。
- target 切换/disabled→false 都走 moveTeleport，**只搬不重建**（子组件实例保留）。
- 坑：disabled=true 期间改 `to` 会被运行时忽略 → 归属未定时 `:to=null + disabled`，归属确定时同次更新 `to=managerEl + disabled=false`；后续换组保持 disabled=false 仅改 to。
- 待真机压测：命令式 insertBefore 与 Vue 对 manager 内子节点 diff 的竞争（R1）。

### C.4 createGroups/clear/page.scheme 调用面
- createGroups：生产代码仅在 loadLayoutScheme（layout.ts L822）与二次搬回（L830-838）、navDrop（L1184-1199）内部；stores/layout.ts 仅转抛。
- clear(page)（element-utils L135-144）唯一调用点 L822。
- page.scheme 仅 layout.ts L210-213/820-821/850 使用。
- loadLayoutScheme 生产入口仅 workspace manager switch 事件链；switchLayout 外部唯一调用 = menu-bar.ts L519。
- 引导链：main/initialize.ts L41 `Layout.initialize`，L100 switch('home')。

### C.5 M3 建议次序
1. 叶子 group Vue 组件（YMPageManager.vue+YMNavBar.vue 合成，defineExpose root，命令式兼容零改动）。
2. 「归属数据化」替换 loadLayoutScheme 首载与 else 分支（L822/L830-838）——group 树结构/当前 tab 提为数据，渲染 v-for+Teleport（to/disabled 按 C.3）。
3. 核心风险：`clear(page)` 的 `textContent=''` 会摧毁页内 Teleport 锚点/引擎 canvas → 替换为「只卸载 group 树、保留 page-frame 内容」。

## 附录 D：DOM→数据树反序列化契约（sub-agent B，2026-09-03）

### D.1 函数签名建议
```ts
function deserializeLayoutPage(page: HTMLElement): {
  key: string;
  root: LayoutTreeNode | null;              // 含 active（页签 value）
  lastValueOf: (groupId: string) => string | null;
  handles: Record<string, { nav; manager }>;
}
```
根 = `page.childNodes[0]`，非 `.group` 即返回 root:null（home 无布局树；未物化工作区由 config/default 解析而非反序列化空 DOM）。

### D.2 字段契约
| 目标字段 | DOM 读法 |
|---|---|
| kind | expando `el.split !== undefined ? 'split' : 'group'`（权威） |
| id | 按先序分配 `layout-N`（现状 DOM 无 id） |
| end | `el.end`（number，roundTo 6 位精度） |
| split | `el.split` |
| children | 容器：`children` 中 `hasClass('group')` 的元素，文档序递归 |
| tabs | `el.tabs`，兜底 `[...el.nav.childNodes].map(n=>n.getAttribute('value'))` |
| active | `el.manager.index`（string\|null，比 nav.selected 可靠——navDrop 跨组后 selected 缺失） |
| lastValue | `el.nav.lastValue`（会话态不入盘） |

### D.3 一致性钩子（在这些点后快照，勿在读中间态）
loadLayoutScheme if/else 分支尾、navDrop 尾、saveNavStates 尾、switchLayout 尾、pointerup（缩放结束）、navWrite（仅刷对应叶子 active）。禁止：dragstart/dragover/drop 中间、pointermove 帧内、saveNavStates 与 loadLayoutScheme 之间。

### D.4 结论
- 持久层 `config.layout` 无 active/lastValue（saveLayoutScheme 只写 end/split/children/tabs）→ 树模型分「持久 scheme」与「运行时树（含 active/lastValue）」两层。
- **M2b 走 mirror（DOM 为事实源，收敛点后反序列化快照）改动面最小**：layout.ts 实现与时序不动，7 个函数尾部插入快照 + saveToConfig 从镜像树落盘；把数据树当事实源则需重写整个 1555 行写入路径（R 面大）。M3 再把渲染源切到镜像树。

## 附录 E：M3b-2 渲染接线实施要点（2026-09-03；M3b-1 后设计，M3b-2a 已落地）

### E.1 门控与分支
- 开关已落地在 `engine/layout/layout.ts` 顶部：`YM_LAYOUT_VUE_RENDER`（localStorage）取值：`0`/空（默认命令式）、`1|true|on`（M3b-2a 中间态）、`2|teleport`（M3b-2b Teleport 模式）；导出 `isLayoutVueRenderEnabled`/`setLayoutVueRenderEnabled`（→1）/`getLayoutVueRenderMode`/`setLayoutVueRenderMode`/`awaitVueLayoutLoad`。jsdom 无 localStorage 时回退 0。
- `loadLayoutScheme` 首载双路：命令式路径**一字不动**（兜底始终在）；Vue 路径（M3b-2a）仅当开关开：
  1. 宿主 page 上先 `unmount` 掉上一棵 Vue 组树（首载时无）；
  2. `await mountVueGroupTree(page, scheme, handlers)`，handlers 绑定 `Layout.navWrite/navPointerdown/navDragstart/navDragend/borderPointerdown`（与 createGroupContent/createGroupBorder 同接线）；
  3. 按 `handle.leaves` 把 items（palette 页/页签）搬入叶子 nav/manager——M3b-2a 与命令式一致 `clear(page)` 后重建；**M3b-2b 终版语义**：palette 不再被 clear 摧毁，页内容改为经 LayoutPalettePage Teleport 归属（C.5#3）；
  4. 激活首 tab `write(nav, tabs[0])`、`updateGroups`、`syncPageTargets`（与命令式 loadLayoutScheme 尾部一致）。

### E.2 异步时序（真机重点验证）
- M3b-2a 已落地：`loadLayoutScheme` Vue 分支 fire-and-forget 调用 `loadLayoutSchemeVue`（内部 `await mountVueGroupTree`，nextTick 后 API 才可用），并把 promise 记到 `lastVueSchemeLoad`，测试/调用方可 `await awaitVueLayoutLoad()` 等完成。
- `pageSwitch`（layout.ts L869-975）对 loadLayoutScheme 同步调用后还有 GL.canvas insert/`afterChange`，切 Vue 分支时这些后续步骤要等 mount 完成（await 链或排队到 promise 回调）——首次进入每个工作区（directory/scene/ui/animation/particle）、快速往返切换时序真机验证。
- 命令式兜底路径保持同步（开关默认关时零时序变化）。拖拽/缩放期间开关恒关。

### E.3 真机冒烟清单（M3b-2 验收）
1. 默认（关）：现状全量行为回归——五工作区进入/切换/往返、页签点击、拖 tab 跨组、分割、缩放、inspector 嵌套页、GL.canvas 各画布正常。
2. 开：`YM_LAYOUT_VUE_RENDER=1` 启动→首次进入 directory：组树为 Vue 渲染、palette 仍在 DOM（隐藏宿主）、页内容经 Teleport 出现在 group manager；页签点击/拖拽后 DOM 归属与 store.pageTargets 一致；切 scene/ui/animation/particle 往返不重建页面（mounted 计数 1）；saveLayoutScheme 往返保真（M1 基线语义）。
3. 回归护栏：layout __tests__（含 M3b-1/M3b-2a 双路等价 + M3b-2b 探针）在开关两种取值下都跑；editor/ui-kit 全量；lint/typecheck/vue-tsc 门禁。

## 附录 F：M3b-2b LayoutPanel 接线设计定稿（2026-09-03，探针验证后）

### F.0 目标模型：整壳 Teleport（消灭命令式 reparent）
- LayoutPanel 的 12 个 palette 页（`.page-frame` 壳 + 内容）与 12 个 nav-item 的 **vnode 永驻 LayoutPanel palette 子树**；DOM 归属由 LayoutPalettePage（slot = 整壳节点，`:to = store.pageTargets[value]`/`tabTargets[value]`）显式搬家 → Vue 始终知道页/页签的 DOM 去向，命令式 appendChild 搬运消失。
- 页分类沿用 C.1：`inspector` 页整页不动（内层 `#inspector-page-manager` 不被搬）；`scene/ui/animation/particle` 画布页整包对待；列表页/空容器页同机制。

### F.1 归属源
- **页归属**（`store.pageTargets`，value → group-manager）：整壳帧物理进入 manager.children 后 `collectPageTargets` DOM walk 仍成立（探针 A-1），收敛点不变（loadLayoutScheme/navDrop 尾 `syncPageTargets`）。
- **页签归属**（`store.tabTargets`，value → leaf nav）：**已落地**（M3b-2b 前置）——stores/layout.ts 新增 `tabTargets`/`setTabTargets`/`resetTabTargets`（与 pageTargets 同构、共用 targets 工厂）；`LayoutPalettePage` 增加 `source?: 'page' | 'tab'`（默认 'page'，'tab' 读 tabTargets），配套 spec（layout-palette-page.spec.ts +2 用例：tab 归属搬家/换归属不重建/清归属回宿主；page/tab 双通道互不干扰）。
- 跨工作区：归属表按当前激活工作区根树刷新 → Teleport 目标切换 = 页/页签搬到新工作区组（同探针「换归属只搬家」）。

### F.2 nav 排序 pass
- Teleport 内容进入同一 target 的顺序 = palette 声明序，与 group.tabs 可不同 → 在归属收敛后执行 `orderLeafNav(group)`：按 `group.tabs` 顺序对该 leaf nav `appendChild`（探针 B：幂等、任意时刻可收敛、对 Teleport 内容安全、write/selected 不受影响）。
- 调用点：**目前仅 `loadLayoutSchemeVueTeleport`（layout.ts `orderLeafHostChildren(leaf)`）落地 1 处**；`loadLayoutSchemeVue`/`updateGroupTabs`/navDrop 跨组后的排序 pass 待 M4 收口前补上（navDrop 当前命令式搬移 + drop 后 updateGroupTabs，Teleport 模式下 M4 前先用该 pass 兜底）。

### F.3 clear 终版语义
- Vue 分支不再 `clear(page)`（textContent=''）整页摧毁（会杀掉 palette/Telport 锚点/引擎 canvas）；首次/重载 = 仅 `mountVueGroupTree` 前 unmount 旧组树，保留宿主页内其它内容。
- 命令式 else 恢复（append items 回组）在 Vue 分支停用：二次进入 = 仅重算归属 + 刷 targets + 按 `nav.lastValue` 激活；组树不重建（M3b-2a 已证根节点对象不变）。

### F.4 已知点与硬约束
- **visible 随节点搬家**（探针 A-2）：真实工作区切换前引擎经 `saveNavStates → write(nav,null) → navWrite → switch(null)` 清 visible；接线时任何归属变化前须保证已清，或激活首 tab 前先 `switch(null)`。
- 引擎 `Layout.items` 仍以「每 value 一个 nav-item/page」为单位做配对与拖拽——Teleport 只搬 DOM 不改节点身份，配对保持。
- 画布/GL 模块依赖 DOM 常驻：Teleport 不重建即满足（挂载计数恒 1 语义），引擎 canvas insert 逻辑仍走 `pageSwitch`（时序见 E.2）。
- 所有机制先 jsdom 结构断言（layout-shell-teleport.spec.ts 等），LayoutPanel 真机改动独立 PR 默认关。

### F.5 M3b-2b 接线真机验收（增量）

> **验收记录（2026-09-09，自动冒烟）**：以真实项目（E:\17835\Documents\Project1\game.yamirpg）驱动完成，驱动脚本 `scripts/smoke-layout.mjs`（CDP，Node>=22 全局 WebSocket；`pnpm -F @yami/editor build:all` 后 `electron --remote-debugging-port=9223 .` 启动，跑 `mode2-directory`/`roundtrip-scene`/`mode0-control` 各阶段）。结果：渲染进程日志仅一条预存 Electron CSP 提示，无 Vue/TypeError/未捕获异常。

1. ✅ 开关开进入 directory：活动工作区叶子组 project/inspector 的 nav 顺序 = tabs（排序 pass 生效）、首 tab 激活（两帧均 selected/visible）；组 manager 内每叶恰一页帧、无重复壳。
2. ✅ 页/页签 DOM 归属：可见页物理位于 group manager；directory↔scene 往返后同批帧节点 `isConnected` 恒真、父级随工作区迁移，身份不重建。
3. ✅ scene 画布页往返：scene 工作区 7 组、4 个 GL canvas、scene-body/palette-body/sprite-body 存在，返回 directory 后恢复正确；inspector 页（#inspector-page-manager 43 子页）全程不受影响。
4. ⏳ saveLayoutScheme/saveToConfig 往返 + 重启恢复：未覆盖（需驱动真实保存与进程重启），留人工抽查（jsdom 层已有 layout-config.spec 5 用例钉死）。
5. ✅ 关回默认开关：mode0 对照组与 mode2 同构（project/inspector 两叶、首 tab 激活、inManager 4），回归护栏通过。

**M3b-2b 至此完结，下一项 M4 交互数据化。**
