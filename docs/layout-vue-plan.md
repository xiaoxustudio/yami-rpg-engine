# Layout / PageManager 页面组织 Vue 化设计方案

- 状态：设计稿（Phase 0 摸底测试已落地，M1-M6 未实施）
- 日期：2026-09-03
- 范围：`packages/editor/src/components/layout/LayoutPanel.vue`、`packages/editor/src/engine/layout/layout.ts`（1555 行）、`packages/editor/src/stores/layout.ts`、`packages/ui-kit` 的 `YMPageManager`/`YMNavBar`（命令式 api 与 .vue 双实现）
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

**M3b（剩余，待真机冒烟阶段实施）**：
- **运行时页面归属源已落地**：`engine/layout/layout-page-targets.ts`（DOM walker：value→归属 manager）+ `stores/layout.ts` 响应式 `pageTargets`/`setPageTargets`/`resetPageTargets`；`loadLayoutScheme`/`navDrop` 收敛点后由 `syncPageTargets` 刷新（layout-page-targets.spec.ts 5 用例）。这是页面 Teleport `:to` 的响应式输入。
- **页面 Teleport 组件已落地**：`components/layout/LayoutPalettePage.vue`（slot 内容经 `<Teleport :to=pageTargets[value] + disabled>` 归属到 group-manager，无归属 disabled 留宿主）＋ `layout-palette-page.spec.ts`（2 用例：纯 store 驱动搬家/清归属不重建；与真实 loadLayoutScheme 联动、跨工作区往返目标一致且不重建）。
- 双路开关（如 `YM_LAYOUT_VUE_RENDER`，默认命令式）：`createGroups/loadLayoutScheme` 结构创建分支换 `LayoutTreeView`，叶子宿主注入逻辑与命令式保留一致；**注意**：.vue 版 YMPageManager/YMNavBar 的 switch/index/active 桥在 onMounted（nextTick 后）才可用 → Vue 叶子换源需异步时序改造（loadLayoutScheme/pageSwitch async 化）或保留命令式叶子宿主仅骨架走 Vue（见附录 C.2/C.5）。LayoutPanel 12 页接入 LayoutPalettePage 时需保持 `.page-frame` 结构与 visible class 驱动（见附录 C.1）。
- `clear(page)` 的 `textContent=''` 替换为「只卸载 group 树、保留 page-frame 内容」（会摧毁已挂 Teleport 锚点/引擎 canvas）。
- **方案 A 前提已验证**（`layout-teleport-probe.spec.ts`，见风险表 R1/R2）：动态 Teleport 挂命令式 manager 元素可行。
- 验证：M1/M3a 断言双路径跑 + 15 工作区真机冒烟清单；M3b 全程默认关、独立 PR 可回滚。

### M4：交互数据化

- nav 拖拽 drop：`removeItemTo` 落点计算保留命令式（测坐标/邻居），但**生效动作**改为更新 tabs 数据 + `list.updateGroupTabs` 读数据；region 分割/合并、border 缩放改 `updateGroups` 读数据重排，移除命令式 replaceChild/insertBefore 路径。
- 验证：M1 拖拽/缩放缺口用例 + 冒烟清单。

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

- editor：`components/layout/LayoutPanel.vue`（两级 palette + 宿主页）、`engine/layout/layout.ts`、`engine/layout/layout-scheme.ts`（M2 数据层）、`stores/layout.ts`、`utils/element-utils.ts`（clear/write/read）、`title/title-bar.ts`（workspace 切换源）、`scene/ui/animation/particle` 各 window 模块（`Layout.manager.switch('directory')` 消费方，M5 改 store）
- ui-kit：`YMPageManager/`、`YMNavBar/`（命令式 api 与 .vue 双实现，M3 后决定收敛）
- docs：`vue3-migration-plan.md`（进展记录）、`tree-list-vfor-plan.md`（解锁后重做）

## 附录 B：布局状态读写面盘点（sub-agent，2026-09-03）

路径简称：LAY=`engine/layout/layout.ts`、LST=`stores/layout.ts`、CFG=`services/project/config.ts`、OPEN=`services/project/open.ts`、CLOSE=`services/project/close.ts`、TITLE=`title/title-bar.ts`、MENU=`title/menu-bar.ts`、INIT=`main/initialize.ts`、UCFG=`utils/config.ts`、PMA=`ui-kit/YMPageManager/page-manager-api.ts`、NBA=`ui-kit/YMNavBar/nav-bar-api.ts`、PMV/NBV=对应 .vue、LPV=`components/layout/LayoutPanel.vue`。

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
