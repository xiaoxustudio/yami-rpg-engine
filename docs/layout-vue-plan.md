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

### M1：补齐行为金标准测试（Phase 0 已交付摸底版，此处扩全）

jsdom 结构级（`__tests__/layout-scheme-baseline.spec.ts` 已落地）：
- palette 首载消耗/清理、group 结构递归、tab 首激活、点击切换、跨工作区搬移、二次加载恢复 lastValue、scheme 往返。
缺口清单（后续补）：
| 缺口 | 说明 |
| --- | --- |
| saveNavStates 全路径 | 离开工作区时 selected→nav.lastValue + write(null) 清空激活 |
| mergeGroups / setGroupSize | 纯结构断言（几何 0 跳过），锁定合并/比例重算 |
| updateGroupTabs | drop 后 tabs 顺序（把 DOM 序读成数组） |
| clear 语义 | tree-list.clear 委托分支（L135-144）与 `textContent=''` 分支 |
| drag 语义 | navDragstart/dragend 的监听挂卸、updateHint 增删、region 增删 |

集成级（需跑真实 Electron，不进 jsdom）：首次进入任意工作区 → 切 tab → 拖 tab 跨 group → 分割/缩放 → 切工作区往返，冒烟清单逐项手测。

### M2：scheme 数据化（不动渲染）

- `stores/layout.ts` 或新 `engine/layout/scheme-store.ts` 增加响应式宿主模型：
  `workspaceKey → { root: LayoutNode; leaf: { value→tabs 序, active } }`；`loadLayoutScheme` 改为**读数据 + 生成 group 清单**，不再直接写 page DOM。
- `Layout.layout / default / page.scheme / nav.lastValue` 迁移为数据字段（保留读兼容 getter）。
- 验证：M1 摸底测试仍绿（行为不变），全量 editor 测试通过。

### M3：group/nav/manager 骨架 Vue 渲染 + 页/页签 Teleport（核心里程碑）

- LayoutPanel directory 宿主页内替换为 `<LayoutTree :node>` 递归组件；叶子渲染 `<LayoutGroupFrame>`（ref 暴露 navEl/managerEl，类与现状一致：`.group`/`.nav-bar`/`.page-manager.group-manager`/`.group-border`）。
- palette ② 的 page-frame 与 palette ① 的 nav-item 包成 `<LayoutPalettePage value>` / 由 `Teleport` 挂到数据归属 group 的 ref。
- `createGroups/clear` 只保留在**初始化兜底**（jsdom/测试无 Vue 环境），运行时主路径不再触发。
- 验证：M1 全部结构断言改为「最终 DOM 形态等价」（显式搬运或 Teleport 结果相同的部分保留；断言物理移动位置的用例改写为断言 Teleport target 容器）；15 工作区冒烟清单；全量测试。

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
| R1 | Teleport target 时序（group 后建，页先挂） | 高 | `:disabled` + 数据归属先于 DOM 建立；挂载后统一 flush |
| R2 | 拖拽期间命令式改序 vs Vue 在 target 容器 diff | 中 | drop/顺序变更一律先写 tabs 数据再触发 patch；M4 收口 |
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

- editor：`components/layout/LayoutPanel.vue`（两级 palette + 宿主页）、`engine/layout/layout.ts`、`stores/layout.ts`、`utils/element-utils.ts`（clear/write/read）、`title/title-bar.ts`（workspace 切换源）、`scene/ui/animation/particle` 各 window 模块（`Layout.manager.switch('directory')` 消费方，M5 改 store）
- ui-kit：`YMPageManager/`、`YMNavBar/`（命令式 api 与 .vue 双实现，M3 后决定收敛）
- docs：`vue3-migration-plan.md`（进展记录）、`tree-list-vfor-plan.md`（解锁后重做）
