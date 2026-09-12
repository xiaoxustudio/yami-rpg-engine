# 收尾工作清单（Phase 15）

> 把四份计划里散落的「剩余 / 待办」收敛成一份**可执行清单**：每条给出「现状证据（实测）→ 验收标准 → 验证命令 → 涉及文件 → 依赖」。
> 口径：状态为 **2026-09-11 实测**；任何一条被推进后，请同步本文件与来源文档，并跑 `pnpm docs:check`（见 [README.md](./README.md)）。
> 反模式编号（P1–P8）与阶段编号（阶段 1–6）见 [vue3-migration-plan.md](./vue3-migration-plan.md)。

## 速览

| ID | 事项 | 规模 | 依赖 | 状态 |
| --- | --- | --- | --- | --- |
| T5b | ~~tree 步骤 5b：`elements` shim / `item.element` / `NodeElement` 收口~~ | 中 | 先迁移 4 处按 DOM 访问的消费方 | ✅ **已完成**（B2 四步：消费方 6 处 + `element.group` 缺陷 + shim + 桥 + class 直写全清） |
| T1b | ~~tree 步骤 1 剩余缺口：PageUp/PageDown 行为 + 1000+ 节点性能基准~~ | 小 | 需先定义键位语义 | ✅ **已完成**（B1，2026-09-11：4 个分页金标准 + 4 个基准用例） |
| L1 | layout region 左/上/下方向真机走查 | 小 | 构建产物 + 可打开的真实项目 | 部分完成（右缘已过） |
| S1 | 数据绑定型窗口逐窗真机冒烟（19 个树列表） | 中 | 窗口需可达（加速键/菜单） | 部分完成（8/19 已核对） |
| R1 | ~~`module/resource.ts` 资源列表数据化（`innerHTML` + `DOMParser` 字符串模板 + 按 id 反查）~~ | 中 | 无 | ✅ **已完成**（B1，2026-09-11：`DOMParser` 1 → 0、`$()` −8） |
| R2a | ~~i18n 启动副作用：`initI18n` 的 3 处 `document.*` 查询~~ | 小 | 无 | ✅ **已完成**（B1，2026-09-11：`editor/i18n` 受限 API 归零） |
| R2b | **选择器式本地化器**：`localizeDomComponents` 按语言文件的 **2130** 个键在启动时逐键做 DOM 查询（2112 按 id + 18 按 name） | 大 | 需先确认 i18n 迁移口径（`t()` / props） | 未开始（**此前被记为"小"**） |
| R3 | ~~死代码清理：`stores/layout.ts` 的 `switchLayout` 死转发 + `Layout`/`Window` 的 `afterChange` 未赋值钩子~~ | 小 | 无 | ✅ **已完成**（B0，2026-09-11：8 点全删） |
| P5b | `$('#id')` 反查退役（element-utils 的 jQuery 风格寻址，**1489 处 / 252 文件**） | 大 | 需按模块分批，先度量后动手 | 未开始（**此前不在任何报表内**） |
| P2b | **ui-kit 元素 API 契约化**（B3 复核后重定义）：25 个组件 api 文件**都是元素优先实现、零死文件** → 目标改为「类型化契约 + Vue 内子集随 P5b 走 ref + 豁免收窄」，**不再以文件数归零为准** | 大 | 与 P5b 合并排序 | 🚧 **进行中**（B3：目标重定义，见下方复核块） |
| P4b | **原型访问器退役**：`utils/element-data.ts` 在 `HTMLElement.prototype` 上定义 **72** 个字段的 get/set（共 144 访问器；B3 已先删 11 个零访问字段），由 `main.ts` 副作用导入 | 中 | 与 P2b 同批（同属 ui-kit 元素 API） | 🚧 **进行中**（B3 首刀：11 个死字段已删，83 → 72） |
| B1 | 巨石渲染层重写：`command-api.ts` / `YMFileBodyPane.vue`（P6） | 大 | 先补集成测试快照 | 未开始 |
| C1 | 收尾：删豁免机制 + 画布白名单 lint overrides（白名单外为 0） | 中 | 白名单外的迁移项清零 | 未开始 |
| C2 | ~~删除 135 个陈旧豁免注释~~（注释在、命中已为 0） | 小 | 无（零行为风险） | ✅ **已完成**（B0，2026-09-11：豁免注释 295 → 160、陈旧 135 → 0） |
| E1 | **窗口事件面收口**：34 个事件名 / **265** 处 `window.addEventListener`；16 个自定义事件靠"往 Event 挂字段"传载荷；1 个死事件；`mitt` / `useEventListener` 均 0 使用 | 中 | 无（与 DOM 主线并行） | 🚧 **部分完成**（B0 已删死事件 `attributechange`；余项待做） |
| O1 | layout M6（可选）：active-only 渲染 + 页面 state 外置评估 | 评估 | M5 已完成 | 可选 |

## 计划条目对照（阶段 / 里程碑 → 状态与出处）

> **用途**：任何**计划条目**若没有对应的待办 ID 或度量出处，就说明它没被跟踪。2026-09-11 用这张对照表复核，确认了"阶段 2 的 api 收尾""阶段 4 的原型访问器与 `$()`"两处**部分达成却未被登记**（已补 P2b / P4b / P5b / R2a / R2b）。

| 出处条目 | 状态 | 待办 ID | 度量 / 验证出处 |
| --- | --- | --- | --- |
| 主计划 阶段 1 窗口系统数据化（P3） | ✅ 已交付：`stores/window.ts` 的 `stack`/`syncStack`/`isWindowOpen`/`getTopWindowId`，`frames.append/remove` 为唯一同步点 | — | 进展记录 2026-08-31；设计块里的 `WindowHost.vue` 从未实现（原文已标注） |
| 主计划 阶段 2 ui-kit 组件契约化（P2） | ⚠️ **部分**：core 去重已完成，但「api 文件 27 → 0」未达成 | **P2b** | `pnpm docs:check` 的 `*-api.ts` 计数门禁（现 26，目标 0）+ 鸭子调用 682 处 |
| 主计划 阶段 3 表单读写去 getElementById（P1） | ✅ 已交付：`read(getElementById)` = 0、125 个 schema 开 `skipWrite`、`v-focus` 183 文件 / 323 处、`requestFocus` 396 处 | — | tracker `getElementById` 列（244）；动态 id 残留 78 处仍在 `composables` |
| 主计划 阶段 4 原型扩展与工具层回收（P4 + P5） | ⚠️ **部分**：五处 monkey-patch 已删；`$()` **1347** 处未删（B4 批 1 已消 134）、`element-data` 原型访问器仍在（B3 首刀 83 → 72）、localize 选择器本地化器未收（i18n 启动副作用已由 B1/R2a 收口） | **P4b** / **P5b** / **R2b** | tracker `dollarLookup` 列 + 辅助口径「prototype 访问器定义」+ 本地化键数门禁 |
| 主计划 阶段 5 大型命令式渲染重写（P6 + P7） | ⚠️ **部分**：tree 已成默认 v-for（剩 5b）；`command-api` / `FileBodyPane` 只抽了 core | **T5b** / **B1** / **R1** | tracker 每模块列 + 三份计划文档 |
| 主计划 收尾：拆除脚手架 | ⬜ 未开始（机制与执行器已就绪） | **C1** / **C2** | `pnpm stale-exemptions --check`（现退出码 1）+ tracker 口径区 |
| layout M1 金标准 / M2 数据层 / M3 系列 | ✅ 已交付（M5-b 后 Teleport 为唯一装载路径） | — | layout **tests** 17 个 spec + 共享 fixture |
| layout M4 交互数据化 | ✅ 右缘 region / border 缩放 / 跨组 / 同组已真机通过 | **L1**（左/上/下未走查） | `node scripts/smoke-layout.mjs drag-region` |
| layout M5 清脚手架 | ✅ M5-a / M5-b / M5-c 已交付 | **T5b**（联动） | 附录 B–F 阅读提示 |
| layout M6 B 路线评估 | ⬜ 未启动（可选） | **O1** | — |
| tree 步骤 1 金标准 | ✅ 80 用例 | **T1b**（PageUp/PageDown 行为、1000+ 节点基准） | tree 目录测试 + 步骤间回归闸门 |
| tree 步骤 2 地基 + 翻默认 | ✅ 已交付（v-for 为唯一渲染路径） | — | `tree-render.ts` + 金标准用例 |
| tree 步骤 3 class 收口 | ✅ 主体（残留直写 class 并入 5b） | T5b | 步骤 3 进度块 |
| tree 步骤 4 消费方迁移 | ✅ 61 个调用点 / 15 文件 | — | 步骤 4 覆盖度量 |
| tree 步骤 5 清理 | ✅ 主体（命令式渲染已删） | — | 进展记录 2026-09-09 |
| tree 步骤 5b 兼容层收口 | ⬜ 未开始（方案含实测行号已定稿） | **T5b** | 步骤 5b 实施方案 |
| monolith M1–M5 | ⬜ 全部未开始（M1 补测清单 + M2 接口草案已就绪） | **B1** | `docs/monolith-render-plan.md` |
| 独立登记项 | S1 逐窗冒烟 **8/19 已核对**、R3 死代码（8 点清单）、E1 窗口事件面（16 自定义事件） | S1 / R3 / E1 | `pnpm events:surface`、R3 精确删除清单 |

---

## 风险登记（执行前必读）

> 把三份计划各自的风险表（`tree-list-vfor-plan.md` §6、`layout-vue-plan.md` §4、`monolith-render-plan.md` §4）与**度量/流程侧**的风险汇到一处；"现状"列为 2026-09-11 判定。

| ID | 触发条件 | 影响 | 缓解 / 现状 |
| --- | --- | --- | --- |
| R-1 | P5b 批次 4（非 SFC 窗口/单例模块 ~900 处 `$('#id')` 换成 store / 组件实例引用） | 单例初始化顺序与 store 生命周期耦合：`main/initialize.ts` 是**显式分簇顺序**（`initCore` → `initEditors` → `initTools`，非拓扑排序），改引用方式可能踩初始化时序 | 逐模块隔离成一个提交；每批真机冒烟该模块窗口；`$` 工具函数**最后才删**；现状：未开始 |
| R-2 | T5b 删除 `elements` shim / `item.element` 桥 | `scrollToSelection`/`pageUp`/`pageDown` 的遗留回退分支、3 个 spec 共 17 处断言、`rename` 依赖 `element.folderMark/nodeIcon` | 先按 5b 清单迁移 4 组消费方，再删桥；保留 `rowItemAt/rowCount/rowIndexOf` 同义 API；金标准用例护航；现状：方案已定稿（含实测行号） |
| R-3 | T5b 顺带修 `element.group` 幽灵属性 → 改数据面读取 | **行为变更**：attribute/enum 右键菜单的勾选会"突然"开始显示，易被误判为回归 | 先写"当前恒 false"的失败用例，再改读取方式使其转绿；提交信息用 `fix` 而非 `refactor`；真机核对菜单；现状：缺陷已定位（该属性从无写入方） |
| R-4 | B1 的 M3 换渲染源（命令列表 67 方法 / editor 约 259 处调用） | 事件编辑器全线；契约面远大于测试面（组件级仅 12 用例） | 先做 M1 补测到 ~40+（含 `eslints` 缩进线）→ M2 纯数据层与现行实现逐点对拍 → M3 只换渲染源、不动 API 门面；现状：M1 清单与 M2 接口草案已就绪 |
| R-5 | B1 中 `eslints.ts` 对 `CommandList.prototype.updateCommandElement` 的猴补丁失效 | 命令行缩进线消失——**视觉回归，测试不易发现** | M1 先把缩进线写进用例；M4 第一步把该覆写正式化为扩展点（对标 tree 的 extras 容器）；现状：耦合点已定位（`eslints.ts` L174-180） |
| R-6 | C1 给 `.oxlintrc.json` 加画布白名单时写得太宽（如整个 `engine/**`） | 把真实债务洗成"设计豁免"，"白名单外为 0"失去意义 | **文件级**白名单；明确排除 `engine/layout/layout.ts`（属债）；tracker 把"设计豁免"与"待迁移"分列后再销账；现状：候选分 A/B/C 三类已定 |
| R-7 | C2 的"陈旧"判定回退到正则 | 误删仍在使用的豁免注释 → `pnpm lint` 报错（历史上已踩过一次：`document.querySelector<T>(...)` 漏计导致误判） | 判定**必须**来自 `oxlint --report-unused-disable-directives`；执行器带 `--simulate`（预演删行）/`--check`（门禁）/自动复跑 lint + 一键回滚；现状：执行器已就绪（干跑 = 135 文件 / 135 行） |
| R-8 | 出现第三种未被计数的 DOM 访问形式（`Element.append`、`replaceChildren`、框架 ref、新写法…） | 再次出现"以为做完了"的误判（`$('#id')` 就是这样漏掉 **1489 处**的） | tracker 的「辅助口径」区每轮登记；`replaceChildren`/`insertAdjacentHTML`/`matches()` 当前为 **0**，一旦非零即评估纳入门禁；现状：已建"三档口径"制度 |
| R-9 | 文档门禁规则过宽 → 误报 | 有人为了让门禁变绿去改写历史进展条目，破坏"只增不改" | 误报优先改**规则**而不是改历史（已有三次先例：spec 用例数、提交-文档耦合、裸文件名存在性——均评估后不加）；新规则明确排除 `- 2026-…` 历史条目；现状：门禁 7 项，均有负向测试 |
| R-10 | L1 / S1 / F.5#4 等真机项 | 几何拖拽、窗口逐窗渲染、重启恢复无法在 jsdom 覆盖 | `scripts/smoke-layout.mjs` 覆盖自动化可达部分（10 phase）+ 人工清单；结论一律写回文档并标注"人工"；现状：部分完成（L1 右缘已过、S1 8/19 窗口） |
| R-11 | P2b 与 P5b 分头推进 | 若只做 P5b 的"模板 ref 化"而不动元素 API，调用点会从 `$('#x')?.loadItems?.()` 变成 `ref.value?.loadItems?.()`——**鸭子调用照旧**，等于把 682 处契约面的债往后推 | 两线合并排序：先按组件把它们统一的调用面（`loadItems`/`read`/`write`/`enable`…）收敛为**类型化 expose + props/emits**，再删 `*-api.ts`；现状：已登记 P2b，建议与 P5b 同批评审 |

**执行顺序与每步门禁**：C2 → R3 → R1/R2 → T5b → P5b 批次 1（`components/tools` 2 文件 136 处）→ B1。每步统一验证链：改动范围的测试 → `pnpm lint` →（涉及类型时）`pnpm typecheck` → `pnpm dom:guard:tracker`（口径变化必须与文档同步）→ `pnpm docs:check` → 按范围真机冒烟；**tracker 三档口径不该变却变了 = 误删信号**。

---

## 执行批次计划（依赖顺序与预期指标）

> 目的：把 18 条待办排成**可逐个开工的批次**，每批给出前置依赖、涉及面与**预期的指标变化**——这样"做完了没有"不靠感觉，靠 tracker 与门禁的数字。所有基线均为 2026-09-11 实测值。

| 批次 | 内容 | 前置 / 并行 | 涉及面 | 预期指标变化 | 回滚 |
| --- | --- | --- | --- | --- | --- |
| ✅ **B0 零风险（已完成 2026-09-11）** | C2（删陈旧豁免注释）→ R3（死代码 8 点）→ E1①（删 `attributechange`） | 无；可与任何批并行 | C2 **135 文件 / 135 行**；R3 **6 文件 8 点**；E1① 1 处派发 | **实测结果**：豁免注释 **295 → 160**、陈旧豁免 **135 → 0**（`stale-exemptions --check` 退出 0）；死事件 **1 → 0**（事件名 34 → 33、自定义 16 → 15、单侧事件 0）；tracker 其它口径未变（待迁移命中仍 **160**） | `git revert` 单个提交 |
| ✅ **B1 小收口（已完成 2026-09-11）** | R2a（i18n 启动副作用）→ T1b（分页键 + 1000+ 基准）→ R1（资源列表数据化） | 无 | R2a `i18n/index.ts` + `YMFormButtons.vue` + `stores/local.ts`；T1b `tree-api.ts` + 2 个 spec；R1 `resource.ts` 667 → 569 行 + 新 store + 新组件 + `Resource.vue` | **实测**：`editor/i18n` 受限 API **3 → 0**（待迁移命中 160 → **159**、`getElementById` 244 → **243**）；tree 用例 **+8**（ui-kit 659 → 667）；**R1**：`editor/module` 的 `innerHTML` **1 → 0**、`DOMParser` **全仓 1 → 0**、`$('#…')` **1489 → 1481** 处 / 239 → **238** 文件；editor 新增 5 个 store 用例 | ✅ 各提交独立 revert |
| ✅ **B2 tree 收口（已完成 2026-09-11）** | **T5b**：消费方迁移（含方案漏列的 `command-tip.ts` 两处）→ 删 `elements` shim → 删 `item.element` 写回桥 / `TreeItem.element` / `clearTreeItemText` / `deleteNodeElements`（+ 新增 `treeRowElement` 公开 API）→ 收口 class 直写（**select/unselect/pointer 判断/hint 全清**）；**`element.group` 幽灵属性已修** | 无（方案含实测行号） | 步 1–2：5 个消费方文件 + `utils/folder-group.ts` + 2 个新 spec；步 3a：`tree-api.ts` 内部 7 点 + shim/`syncElementsShim`/`clearElements` + 4 个 spec 20 处；步 3b：`tree-render`/`tree-core`/`tree-api`/`index.ts`/`command-tip.ts` + **9 个 spec 71 处断言**；步 4：4 支 dragover + `dragend` + `hintItem` 限定 + 2 处断言 | **实测**：`tree-api.ts` **1726 → 1637 行**（−89）；tracker `parentNode` **130 → 127**、`dispatchEvent` **172 → 171**；待迁移命中/豁免注释/陈旧豁免 **159 / 159 / 0** 与 `$('#…')` **1481** 不变；**行为变更 1 处**（菜单勾选由"恒 false"→正确，先失败后转绿）；**顺带修复 3 处**（`windowLocalize` 手清 vnode、pointer 选中判断耦合 DOM class、`rename` 对窗口外行抛错） | 4 步各自 revert（已分别提交） |
| 🚧 **B3 元素 API 与原型（2026-09-11 首刀完成）** | **P4b 首刀**：删 11 个零访问原型字段（83 → 72）；**P2b 目标重定义**：实测 25 个组件 api 文件全部是元素优先实现、零死文件 → 验收从「26 → 0」改为「类型化契约 + Vue 内子集随 P5b + 豁免收窄」 | P2b 依赖 P5b 的 ref 化节奏（Vue 内子集） | `element-data.ts` 一行删字段；P2b 侧 25 个 api 文件 + 682 处鸭子调用 | **实测（P4b 首刀）**：`DATA_FIELDS` **83 → 72**（访问器 166 → 144）；typecheck/vue-tsc/oxlint + 两个套件全绿；`stores/localization.ts` 的一处类型残留（`initText`/`attrValue`）一并清理。**P2b 复核**：api 文件计数门禁保留、目标改为"不增长" | 各自单提交 revert |
| 🚧 **B4 `$()` 退役（批 1 已完成 2026-09-11）** | **P5b 四批**：~~批次 1 `components/tools`（136 处 / 2 文件）~~**已完成**（实测 78 + 58 = 136 处全清）→ 批次 2 `editor/commands` 模块（153 / 27；**批 2 全部完成**）→ 批次 3 `inspector`+`tools`+`attribute`+`enum`（267 / 46）→ 批次 4 非 SFC 模块（~900） | 批次 1 无需依赖；批次 3 的 `attribute`/`enum` **与 B2 合并**；批次 4 依赖 B3 的 store 化手法 | 合计 **1489 处 / 239 文件** | tracker `dollarLookup`：**1489 → 批次 1 后 1347（实测，含 2 处注释）→ … → 白名单内**；每批后 `git diff` 的模块分布应与本表一致 | 每批独立提交 revert |
| **B5 i18n 工程线** | **R2b**：按承载者给 2130 个键分类 → 先迁 Vue 承担部分 → 目标元素自注册 → 语言文件不再以选择器为键 | 依赖 B4 批次 1–2 的模板 ref 化经验 | `Localize` 3 处源码 + 2 个语言文件（2130 / 2131 键）+ 承载组件 | 门禁：本地化 `components` 键数**下降曲线**（每批更新文档数字）；`editor/localize` 豁免删除 | 语言文件与代码同批提交，可 revert |
| **B6 巨石** | **B1 的 M1 → M5**：先补组件级用例（12 + 5 → ~40+，含 `eslints` 缩进线）→ 派生层（接口草案已就绪）→ 模板换源 → 消费方迁移 → 清理 | M1 可独立做；M3 起需 M1/M2 完成 | `command-api.ts` 2609 + `YMFileBodyPane.vue` 2327 + 各自 core/模板；`eslints.ts`、`CommandList.vue`、`stores/browser.ts`、`stores/selector.ts` | 组件级用例 **17 → 40+**；两文件受限 API 命中 **17 / 3 → 0**；`*-api.ts` 里 command/tree/file 等大件随 P2b 一并归零 | 每步一个 PR；M3 之前可随时停 |
| **B7 真机与收尾** | L1（region 左/上/下真机）→ S1（余下 11 个窗口）→ C1（`.oxlintrc.json` 白名单 + 删豁免机制 + `dom:guard:exempt` 退役） | C1 需"白名单外待迁移 = 0" | L1/S1 无源码改动（`smoke-layout.mjs` + 人工）；C1 改 lint 配置 + 4~8 个白名单文件 | 待迁移命中 **160 → 156（A 类 4 个）或 152（A+B）**；豁免机制退役；tracker 增加「设计豁免」分列 | C1 的配置改动单独提交，revert 即回到当前口径 |
| **并行/旁路** | E1 余项（自定义事件改强类型通道、`.vue` 监听配对、`mitt` 去留）、O1（layout M6 评估） | 不阻塞主线 | E1：16 个自定义事件 + 5 个 `.vue` + 13 处内联匿名 | `pnpm events:surface` 的"单侧事件""未配对 .vue"归零 | 按事件逐个提交 |

**批次纪律**：① 每批开工前跑一次 `pnpm dom:guard:tracker` 与 `pnpm docs:check` 记录基线；② 收尾时把该批的指标变化**写回本表与 README 快照**（门禁会拦数字不一致）；③ 任何一批若让 tracker 出现"本不该变"的口径变化，先当误删处理。

---

## T5b — tree 步骤 5b：`elements` shim / `item.element` / `NodeElement` 收口

> 🚧 **部分完成（2026-09-11，B2）**——按定稿方案的 4 步执行，**步 1–2 已完成**：
>
> **步 1（#3 + #4：ui-kit 外部的纯替换）**：`commands/text-tip.ts` 的 `this.elements.count` / `this.elements[0].item.name` → `treeRowCount(this)` / `treeRowItemAt<TextSuggestionItem>(this, 0)?.name`；`title/title-bar.ts`（恢复页签时按 guid 找活动页签）与 `title/menu-bar.ts`（Alt+1..9 切页签）的 `tabBar.childNodes[i].item` → `treeRowCount(tabBar)` 循环 + `treeRowItemAt<TitleTabItem>(tabBar, i)`（`TitleTabItem` 顺带从 `title-bar.ts` 导出供 menu-bar 使用）。
>
> **步 2（#1 + #2 + 缺陷修复）**：新增 `utils/folder-group.ts` 的 `folderGroupOf(settings, id)`（与 `setFolderGroup` 里的 `oldGroup` 同式），attribute/enum 两个右键菜单的「set-as」勾选改由**数据面**读取；同时把两处 `setFolderGroup` 也换成该 helper。
> **行为变更（有意为之）**：旧写法 `item.element?.group` 恒为 `undefined`（全仓无任何代码写行元素的 `group`），故菜单勾选**从来不显示**；改数据面后按 `state.settings` 正确勾选。证据链：先写 `attribute/__tests__/attribute-folder-group-menu.spec.ts`（stub `Menu.popup` 捕获菜单项）→ 运行 **2 例失败**（`expected false to be true`，即"恒不勾选"）→ 改数据面读取 → **2 例转绿**；另加 `utils/__tests__/folder-group.spec.ts` 4 例覆盖命中/空槽位/空 settings/异常重复。
>
> **步 3a（删 `elements` shim）已完成**：`tree-api.ts` 内部 7 处消费点全部改走派生行——`selectRelative`（`rows.length` / `rowIndexOf` / `rows[index].item`）、`scrollToSelection`（同 + 窗口同步）、`scrollToHome`/`scrollToEnd`（`rowItemAt(0)` / `rowItemAt(rowCount()-1)`）、`rowItemAt`/`rowCount`/`getElementIndexOfSelection`（去掉 `elements` 回退分支）、拖拽的"最后一行"与"hint 下一行"（改查 `state.rowElements`）。`shim` 构造（`elements` 数组 + `file/head/foot` 元数据 + `list.elements`）、`syncElementsShim`、`clearElements` 原型方法与 `clear()` 的 legacy 分支一并删除；原 `syncElementsShim` 里**唯一必需的那部分**（`computeWindow` → `state.start/end`）保留为新的 `syncRenderWindow`（调用点不变：`syncRenderRows` / `resize()` / `scrollToSelection` / `YMTreeList.vue` 的 `onUpdated`）。`treeRowCount/treeRowItemAt/treeRowIndexOf/treeOwnerListOf` 去掉 `elements` 回退（只认行 API）。`tree-api.ts` **1726 → 1659 行**。
> **方案漏列的消费方（本轮补上）**：`commands/command-tip.ts` 的 `CommandSuggestion.listUpdate` 同样读 `this.elements.count`（`CommandSuggestion.list` 就是挂了 tree API 的元素）——已改为 `treeRowCount(this)`。检索确认另外两处 `.elements.count`（`event-editor-commands.ts`、`particle-engine.ts`）作用在**命令列表/粒子引擎自身**的 elements 上，与 tree shim 无关。
> **改写的 spec 断言（20 处 → 行 API / DOM）**：`tree-list-golden.spec.ts`（4 处 `elements.count` + 2 个虚拟窗口用例改为 `renderState.start/end.value` + `.node-item` 渲染数）、`tree-list-interactions.spec.ts`（2）、`tree-list-vue-rows.spec.ts`（2 + 4 处 start/end）、`YMTreeList.spec.ts`（4 + `elements[i].textIndent` 改为 `.node-item` 的 `textIndent`）；4 个 spec 的本地 `TreeListElement` 类型删除 `elements` 字段。
>
> **步 3b（删 `item.element` 写回桥）已完成**：① `tree-render.bindRowElement` 不再给 item 挂 `element`（保留行元素上的 `item` 反查指针与 `textNode/folderMark/nodeIcon/extras/indent/...` 内部字段），并新增导出 **`rowElementOf(item)`**（item → 当前已物化的行元素）；② `tree-core` 的 `TreeItem.element` 字段与 `deleteCaches` 的 element 分支删除（`cloneNode` 不再需要跳过 element）；③ ui-kit 内 8 处消费点改为 `rowElementOf`：`select`/`unselect` 的直写 class（删除，改由派生行渲染）、`expandSelection` 的物化判断、`rename` 取行元素（窗口外行不再抛错而是安全 no-op）、重命名计时器的 `contains` 判定、`bindNodeIcon`/`bindNodeExtras` 写行元素；④ 删除 `clearTreeItemText`（公开 API，editor 侧 0 调用）与 `deleteNodeElements`（`command-tip.ts` 的 `windowLocalize` 改用 `syncRenderRows()`——原实现 `list.textContent = ''` 会炸掉 v-for 的 vnode，属顺带修掉的隐患）；⑤ 新增公开 API **`treeRowElement(item)`**（`@ui-kit` 导出）供仍需挂 DOM 的消费方（行 tooltip）使用。
> **顺带修掉的时序问题（属步骤 4 的"class 当状态"收口）**：`pointerdown`（左键/右键）与 `pointerup` 原先用 `hasClass(element,'selected')` 判断选中态——直写 class 移除后派生 class 要等一次 patch，同 tick 的 `pointerup` 读不到，于是"右键未选中行"会派发 `value: null`；已改为按**数据**判断（`this.read() === item`），语义不变且不依赖 DOM 状态。
> **spec 断言迁移（方案估 17 处，实测 71 处 / 9 个 spec 文件）**：`tree-list-golden`（28）、`tree-list-interactions`（26）、`tree-list-vue-rows`（8）、`YMTreeList.spec`（4）、editor 侧 `easing-extras`/`edit-icon-extras`/`native-extras`/`scene-extras`/`tree-list-extras` 各 1；`tree-core.spec` 两条用例改为只断言 `parent` 缓存。
> **指标**：`tree-api.ts` **1656 → 1638 行**；tracker 合计 `parentNode` **130 → 127**、`dispatchEvent` **172 → 171**（其余口径不变）。
>
> **步 4（class 直写收口）已完成 → T5b 全部完成**：① 拖拽路径的 `addClass(element,'hint')` / `removeClass(hint.target,'hint')`（dragover 的 into/before/after/append 四支与 `dragend`）全部删除，改为在 `hint.target`/`hint.position` 变化后调用 `syncRenderRows()`，由派生行渲染 `hint` class；② 为保持与旧实现一致的**视觉语义**，`syncRenderRows` 的 `hintItem` 只在 `dragging.hint.position === 'into'` 时取值（旧代码也只对 into 目标加 class）；③ 两处 spec 断言（`.node-item.hint` 存在/消失）补 `await nextTick()`——派生 class 随 patch 落地。
> **T5b 收口验收对照**：`elements` shim 已删 ✓、`item.element` 写回桥已删 ✓、`TreeItem.element` 字段已删 ✓、`clearTreeItemText`/`deleteNodeElements` 已删 ✓、行 class 直写（select/unselect/hint）已清零 ✓；`tree-api.ts` **1726 → 1637 行**；ui-kit **667/667**、editor **1897/1897**、`tsc`/`vue-tsc`/`oxlint` 全绿。
>
> **本步门禁**：editor **213 文件 1897/1897**（新增 2 个 spec / 6 例）、`pnpm lint` 0/0、`tsc` strict 与 `vue-tsc` 0 新增错误、tracker 重跑一致（扫描文件 1113 → 1114，来自新 helper）。

- **现状证据**：v-for 派生行是唯一渲染路径，但三样兼容层仍在——`tree-core.ts` 定义 `NodeElement` 类型（L13）与 `deleteCaches` 的 `delete item.element` 分支（L65）；`tree-api.ts` 仍写回 `item.element`（L403–404、L814–815、L920、L1061 的 `elements.indexOf(item.element)`）；`clearTreeItemText` 在 editor 侧**零调用**（仅定义 + `index.ts` 导出）。
- **仍按 DOM 访问的消费方（2026-09-11 实测，4 处）**：
  - `packages/editor/src/attribute/attribute-window.ts`（`item.element?.group`）
  - `packages/editor/src/enum/enum-window.ts`（`item.element?.group`）
  - `packages/editor/src/commands/text-tip.ts`（`this.elements.count` / `this.elements[0].item`）
  - `packages/editor/src/title/title-bar.ts` + `packages/editor/src/title/menu-bar.ts`（`tabBar.childNodes[i].item` 直接在 DOM 子节点上读 expando）
  - 注：`module/eslints.ts` 与 `composables/useVariableGetterWindow.ts` 已在步骤 4 迁移完毕，**不再是**本条的阻塞项（早期文档口径需按此更正）。
- **⚠️ 顺带修复的潜在缺陷**：#1/#2 读的 `item.element?.group` 是**幽灵属性**——全仓检索确认没有任何代码写行元素的 `group`（仅 layout 拖拽事件对象有 `event.group`），因此 attribute/enum 右键菜单里「设为分组 / 设为无分组」的 `checked` **恒为 false**，从来不显示勾选。改成数据面读取（与 `Attribute.setFolderGroup` 内部同式的 `oldGroup` 计算）会修好它 → 属**行为变更**，需先补断言、提交信息写 `fix`。
- **详细实施方案**：[tree-list-vfor-plan.md](./tree-list-vfor-plan.md) 步骤 5b（含待删清单实测行号、4 组替换方案、4 个独立可回滚步骤、测试策略与风险）。
- **验收标准**：① 4 处消费方改用行 API / 数据面读取；② `elements` shim、`item.element` 写回、`NodeElement` 类型、`clearTreeItemText`、行 class 直写全部删除后，ui-kit + editor 全量测试全绿（含 3 个 spec 内共 17 处 `item.element`/`elements[` 断言改写）；③ attribute/enum 菜单勾选的新行为有断言锁定；④ 真机 `open-project` + `drag-here` 与逐窗口行数核对通过；⑤ tracker 中 `ui-kit/components`、`editor/tools` 行数下降并刷新矩阵。
- **验证命令**：`pnpm -F @yami/ui-kit test`、`pnpm -F @yami/editor test`、`pnpm lint`、`pnpm dom:guard:tracker`、`pnpm docs:check`。
- **涉及文件**：`packages/ui-kit/src/components/basic/YMTreeList/{tree-api.ts,tree-core.ts,YMTreeList.vue}`、上列 4 个 editor 文件。
- **来源**：[tree-list-vfor-plan.md](./tree-list-vfor-plan.md) 步骤 3 遗留 + 步骤 5 / 5b。

## T1b — tree 步骤 1 剩余缺口

> ✅ **已完成（2026-09-11，B1）**：① **PageUp/PageDown 键位语义**＝「选中随页移动 + 滚动联动」，与搜索框的 `searcherKeydown` 既有语义一致（搜索框早就把这两个键转发给列表，只有焦点在列表本身时无映射）；实现于 `tree-api.ts` 的 `keydown`（`pageUp(true)` / `pageDown(true)` + `preventDefault` 抑制浏览器自身翻页 + 沿用末尾的 `stopImmediatePropagation`）。
> ② **金标准用例 4 个**（`tree-list-golden.spec.ts`）：PageDown 下移一页（clientHeight 400 → 19 行）与 `scrollTop` 联动、PageUp 上移一页、两端边界（末行/首行停住）、以及「事件被列表消费（`defaultPrevented = true`）且不改动数据」。
> ③ **1000 节点性能基准 4 项**（新增 `tree-list-perf.spec.ts`，10 个 folder × 99 子项 + 10 顶层文件）：首次 `update()` **47.7 ms**（窗口内 21 行）、20 次 `update()` **6.2 ms**（0.31 ms/次）、200 次 `selectRelative` **106.8 ms**（0.53 ms/次）、20 次滚动窗口迁移 **8.4 ms**（0.42 ms/次）。口径：循环内不再 `await nextTick()`——Vue 调度器会把 patch 合并成一次 flush，量的是「bump + 重派生」同步开销；阈值取观测值 5~10 倍，只拦数量级回退。
> ④ 顺带修掉一个**测试环境盲区**：`pageUp/pageDown` 原先用 `this.scrollBy(0, ±delta)`，而 **jsdom 未实现 `Element.scrollBy`**（真实浏览器有）→ 分页路径在 jsdom 下会抛 `TypeError`，因此此前没有任何用例覆盖它；已改为等价的 `this.scrollTop ±= delta`（浏览器语义相同，jsdom 可运行）。同类写法在 `select-list-api.ts`（L220/L233）仍存在，属同一根因，留给其所在批次处理。

- **现状证据**：`tree-api.ts` 有 `pageUp`/`pageDown` 方法（L1026/L1040），但 keydown 未映射 `'PageUp'`/`'PageDown'`（浏览器默认滚动仍会触发）；1000+ 节点性能基准未做（步骤间回归闸门要求「不劣于现状 10%」）。
- **验收标准**：① 定义 PageUp/PageDown 语义（选中 + 滚动联动）并补金标准用例（`packages/ui-kit/src/components/basic/YMTreeList/__tests__/tree-list-golden.spec.ts` 同批）；② 给出 1000 节点展开/折叠/滚动的帧时间数据并写入步骤 2/5 记录。
- **验证命令**：`pnpm -F @yami/ui-kit test`。
- **来源**：[tree-list-vfor-plan.md](./tree-list-vfor-plan.md) 步骤 1「仍未覆盖」+ 步骤间回归闸门。

## L1 — layout region 拖拽方向真机走查

- **现状证据**：真机已通过 region **右缘** drop、border 缩放、同组重排、跨组搬空折叠（`layout-nav-drop.spec.ts` / `layout-group-sizing.spec.ts` 为 jsdom 侧金标准）；region 左/上/下未逐一真机走查（左缘对紧邻右叶按设计 no-op，由 `regionDragover` 相邻判定覆盖）。
- **验收标准**：left/top/bottom 三个方向各走查一次，记录组数、新叶 `end`、源叶折叠与后续 border 拖拽是否生效；结论回写 [layout-vue-plan.md](./layout-vue-plan.md) M4 小节。
- **验证命令**：`pnpm -F @yami/editor build:all` → 启动 Electron（`--remote-debugging-port=9223`，home 有最近项目）→ `node scripts/smoke-layout.mjs drag-region`（另有 `drag-mode0`/`drag-mode2`/`drag-here`/`drag-scene` 等阶段，见脚本头部注释）。
- **已知限制（勿当缺陷）**：合成拖拽在「结构性 drop 后同一 tick 再拖」存在与异步重挂载的竞争，真人操作不受影响。

## S1 — 数据绑定型窗口逐窗真机冒烟

- **现状证据**：真机确认 19 个树列表全部为 v-for 形态（`.scroll-spacer` 就位）；自动可达的 8 个窗口已核对「绑定行数 / 渲染行数」——全局变量 20/20、对象属性 42/32（虚拟窗口）、枚举 115/32、本地化 0/0（数据为空）、过渡 5/5、队伍 3/3、插件 13/13、指令 16/16。
- **验收标准**：其余窗口（缺加速键或需场景/页面上下文）人工逐窗核对行数与交互链路（选中 → 折叠 → 展开 → F2 重命名 → 文本/class 注册即时反映）。
- **验证命令**：手工冒烟 + `pnpm -F @yami/editor test`（回归）。
- **来源**：[tree-list-vfor-plan.md](./tree-list-vfor-plan.md) 步骤 5 记录。

## R1 — `module/resource.ts` 的 `innerHTML = ''`（P7）

> ✅ **已完成（2026-09-11，B1）**：整条「命令式建表」链路拆成数据 + 组件两层——
> ① 新增 `stores/resource.ts`（`ResourceRow` 模型：`key`/`value`/`version`/`installed`/`hasTemp`/`sizeText`/`speedText`/`progress`/`phase`，配 `setRows`/`patchRow`/`setNodeText`/`setPing`）；
> ② 新增 `components/tools/resource/ResourceList.vue`（v-for 渲染行、进度条/速度/大小/版本框，交互用 `emit('download'|'pause'|'remove')` 上抛；**放在 `resource/` 子目录**，避免被 AppShell 的 `import.meta.glob('./components/tools/*.vue')` 当成窗口组件）；
> ③ `Resource.vue` 改为绑定 store（节点信息 + `:style` 描边色）并把两个按钮改成 `@click`，标签用 `t()`；
> ④ `module/resource.ts` 从此**不碰 DOM**：`temp(val)` → `blankRow()/refreshRow()/fillSize()/download()/pause()/remove()`，`load()` 只负责把行数据写进 store；删掉 5 个 `$('#…')` getter、`initialize()` 里的 3 处查询与 `attachElementApi(root, { update })`（唯一调用方就是它自己）。
> **行为保真说明**：旧的 `disable()/enable()` 只是加/删 `disabled` 类，而全仓没有对应的 `.disabled` 规则（已核对），故按钮禁用态本来就没有视觉差异——改造后保留同样的类绑定，真正的门禁仍在点击处理里；`.resource-item` 等类名、全部 DOM id、内联样式与进度条配色都原样保留。
> **指标**：tracker `editor/module` 的 `innerHTML` **1 → 0**、`domParser` **1 → 0**（P5 轴 `new DOMParser()` 全仓 **1 → 0**）、该模块 `dollarLookup` **25 → 17**（全仓 `$('#…')` **1489 → 1481** 处 / 239 → **238** 文件）；新增 `stores/__tests__/resource.spec.ts` 5 个用例（状态键/补丁语义/no-op/节点信息）。

- **现状证据（2026-09-11 复核后升级）**：`packages/editor/src/module/resource.ts`（667 行）的**整段资源列表是字符串模板命令式构建**——`load()`（L653-660）先 `this.content.innerHTML = ''`（`content` 是 `$('#resource-content')`，见 L34-35），再对每个资源调 `temp(val)`（L421 起）：`new DOMParser().parseFromString(...)`（L442）解析一段 HTML、`this.content.append(boxDom)`（L465）、随后按 **动态 id/class 反查**（10 处 `querySelector`，如 `#resource-item-${value}-download`）并直接调元素 API（`write`/`disable`/`enable`/`on`）。宿主是 Vue 页 `Resource.vue` 的 `<div class="box" id="resource-content">`（L38）。所以这不是"删一行 `innerHTML`"，而是一次**小型列表数据化**（规模由「小」改判为「中」）。
- **验收标准**：资源列表改为数据驱动（`v-for` + 行数据），行内交互走组件 props/emits 或 expose API；删除 `innerHTML = ''` 与按 id 反查，移除该文件的 `oxlint-disable` 豁免；tracker 中 `editor/module` 的 `innerHTML` / `domParser` 列归零。
- **验证命令**：`pnpm -F @yami/editor test`、`pnpm dom:guard:tracker`、`pnpm docs:check`；真机打开资源窗口核对列表渲染与下载/删除按钮。
- **来源**：[vue3-migration-plan.md](./vue3-migration-plan.md) 阶段 5 表；2026-09-11 第十二轮复核（发现 `DOMParser` 构建路径不在原度量内）。

## R2a — i18n 启动副作用（3 处 DOM 查询）

> ✅ **已完成（2026-09-11，B1）**：① confirm/cancel 的 `hotkey` 改为在 `YMFormButtons.vue` 模板里声明（`hotkey="Ctrl+Enter"` / `hotkey="Escape"`）——该属性只被 `element-utils.ts` 的 tooltip 逻辑读取，语义不变；② 主菜单可见性改由 `stores/local.ts` 新增的 `ready` 状态 + `AppShell.vue` 的 `:class="{ visible: local.ready }"` 驱动（`initI18n` 加载完成后 `setReady(true)`），CSS `#menu.visible` 规则不变；③ `editor/i18n` 的受限 API 归零（tracker 该模块「待迁移命中」1 → **0**），并且它那条豁免注释随即变成陈旧豁免——用 `pnpm stale-exemptions --apply` 顺带清掉（1 个文件），整体「待迁移命中」**160 → 159**、「豁免注释」**160 → 159**、「陈旧豁免」维持 **0**；④ `stores/__tests__/local.spec.ts` 同步为 4 个状态键并覆盖 `setReady`。

- **现状证据**：`packages/editor/src/i18n/index.ts` 的 `initI18n`（L141-153）——`document.getElementsByName('confirm')`（L143）逐个写 `hotkey="Ctrl+Enter"`、`document.getElementsByName('cancel')`（L146）写 `hotkey="Escape"`、`document.getElementById('menu')`（L150）加 `.visible` 类。
- **替换方向**：① hotkey 应来自 `YMFormButtons.vue` 的 props/常量（该组件正是渲染 `name="confirm"|"apply"|"cancel"` 的地方，L26/L33/L39），或由 `YMWindowFrame` 统一注入；② 主菜单可见性改 store 状态（如 title store 的 `menuVisible`）+ 模板 `:class`，而不是启动时改 DOM 类。
- **验收标准**：三处查询消失、`i18n` 模块的 `oxlint-disable` 豁免删除；确认/取消按钮的快捷键提示与主菜单显隐行为不变（真机核对）。
- **验证命令**：`pnpm -F @yami/editor test`、`pnpm lint`、`pnpm dom:guard:tracker`、`pnpm docs:check`。
- **来源**：tracker `editor/i18n` 行（P1 尾巴）。

## R2b — 选择器式本地化器（`localizeDomComponents`）

- **现状证据（2026-09-11 实测，本条此前被低估）**：`packages/editor/src/localize/dom-localizer.ts`（L63-86）按语言文件的 `components` 映射**在启动时逐键查 DOM**——`[.class]` → `getElementsByClassName`、`[name]` → `getElementsByName`、其余 → `getElementById`，命中后由 `setLocalElement` 写 `textContent` / `title` / `label` / `tip` / `content` 并收集 `saveItems`。语言文件 `packages/editor/Project/Locales/en-US.English.json` 的 `components` 有 **2130** 个键（zh-CN 2131 个）：其中 **18 个方括号键**（`[confirm]`/`[cancel]`/`[apply]`/`[start-qr-code]`…，对应 `YMFormButtons.vue` 等处的 `name="…"`）与 **2112 个 id 键**（`menu-file`、`nav-project`、`title-play`…）。抽样比对：这些键**几乎全部能在当前源码里找到同名 id/name**（2111/2130 命中，剩下的 19 个就是那批方括号键）→ 即**运行期有 2130 次 DOM 寻址**，是当前应用里最大的 DOM 寻址面。
- **为什么单列**：源码里只有 3 处字面查询（`document.getElementById` 1 + `getElementsByClassName` 1 + `getElementsByName` 1），因此 tracker 的"处数"口径完全看不到这个放大——同 `$('#id')` 那次一样属**度量盲区**；而它的替换意味着把 2130 条文案搬进 Vue i18n（`t()` / props），是**独立于 DOM 迁移的一条 i18n 工程线**。
- **推进策略（先分级后动手）**：① 按"承载者"给 2130 个键分类（窗口标题 / 菜单项 / 按钮 / 表单标签 / tooltip…）并统计每类的键数；② 优先迁移 **Vue 组件承担的部分**（模板里改 `t()`，删掉对应键）；③ 保留确实由非 Vue 生成的 DOM 所需的键，但把**逐键全表扫描**改为"目标元素自行注册"的数据驱动方式（`setLocalElement` 已具备按元素应用的能力）；④ 终态：语言文件不再以选择器为键。
- **验收标准**：① `localizeDomComponents` 不再全表扫描（或整体退役）；② 中英切换在真机上行为不变（逐类抽查）；③ 文档给出 2130 → 迁移后键数的下降曲线；④ `editor/localize` 的 `oxlint-disable` 豁免删除。
- **验证命令**：`pnpm -F @yami/editor test`、`pnpm lint`、`pnpm dom:guard:tracker`、`pnpm docs:check`；真机切换语言后抽查窗口标题/菜单/按钮/tooltip。
- **来源**：2026-09-11 第二十二轮度量审计（`components` 键数实测；此前 R2 只按源码处数记为"小"）。

## R3 — 死代码清理（layout 死转发 + 未赋值钩子）

> ✅ **已完成（2026-09-11，B0）**：8 个删除点全部执行——`stores/layout.ts` 的 `switchLayout` 函数与其导出项；`engine/layout/layout.ts` 的 `afterChange` 成员与 `pageSwitch` 末尾调用；`tools/window-object.ts` 的接口成员、初始化与两处调用；两个 spec 里的 `Window.afterChange = null;`。**tracker 三类口径未变**（符合"误删探测器"预期）；editor 全量 **1884/1884**、`tsc` strict 与 `vue-tsc` 门禁全过。

- **现状证据（2026-09-11 实测）**：① `packages/editor/src/stores/layout.ts` 的 `switchLayout(name)`（L113）只是 `Layout?.switchLayout?.(name)` 的转发，导出在 L283，但**全仓无调用方**——唯一的 `Layout.switchLayout` 调用在 `packages/editor/src/title/menu-bar.ts`（L519，直接走引擎）；② `packages/editor/src/engine/layout/layout.ts` 的 `afterChange`（L364 声明、L1407 `?.()` 调用）与 `packages/editor/src/tools/window-object.ts` 的 `afterChange`（L29 声明、L58 置 null、L141/L185 调用）**声明后从无任何赋值**（仅测试里被置 null）→ 永远不会触发。
- **验收标准**：① 删除 store 的 `switchLayout` 转发与其导出（若有消费方则改为直接调引擎并同步文档）；② 删除两处 `afterChange` 成员与调用点，并清理 `packages/editor/src/tools/__tests__/window-command-modal.spec.ts`（L43）与 `window-object.spec.ts`（L83）里对它的置空语句；③ `pnpm -F @yami/editor test`、`pnpm lint`、`pnpm typecheck` 全绿。
- **精确删除清单（2026-09-11 复核，行号已逐个读过上下文）**：

  | 文件 | 位置 | 动作 |
  | --- | --- | --- |
  | `packages/editor/src/stores/layout.ts` | L113-115 `function switchLayout(name) { Layout?.switchLayout?.(name); }` | 删函数 |
  | 同上 | L283 返回对象里的 `switchLayout,` | 删导出项 |
  | `packages/editor/src/engine/layout/layout.ts` | L364 `afterChange: null as (() => void) \| null,` | 删成员 |
  | 同上 | L1407 `this.afterChange?.();`（`pageSwitch` 末尾、`catch` 之后） | 删调用 |
  | `packages/editor/src/tools/window-object.ts` | L29 接口成员 / L58 `afterChange: null,` | 删成员与初始化 |
  | 同上 | L141（`open` 路径尾）、L185（`close` 路径尾）的 `this.afterChange?.();` | 删调用 |
  | `packages/editor/src/tools/__tests__/window-command-modal.spec.ts` | L43 `Window.afterChange = null;` | 删（成员没了会变类型错误） |
  | `packages/editor/src/tools/__tests__/window-object.spec.ts` | L83 `Window.afterChange = null;` | 删（同上） |

- **验证链**：`pnpm -F @yami/editor test`（改动过的 2 个 spec 必须绿）→ `pnpm lint` → `pnpm typecheck` → `pnpm docs:check`；tracker 三类口径**不应变化**（未触及任何 DOM API），若变化说明误删。
- **回滚**：单文件 `git checkout -- <file>` 或整体 `git revert`（纯删除，无数据/状态副作用）。
- **注意**：`Layout.layout` 与 editor store `config.layout` 仍指向同一对象（附录 B 的线索仍成立），**不在本条范围内**，不要顺手改。
- **来源**：2026-09-11 第十轮附录复核（`layout-vue-plan.md` 附录 B 阅读提示）。

## P5b — `$('#id')` 反查退役（element-utils 的 jQuery 风格寻址）

- **现状证据（2026-09-11 实测；B4 批 4 完成 animation/scene/palette 三组后为 245 处 / 53 文件，批 1–批 4 见下方执行清单）**：`packages/editor/src/utils/dom.ts` L147-157 的 `$` 仍有 **1489 处调用**、分布在 **239 个文件**（形如 `$('#if-condition-type')`、`targets: [$('#…')]`；判定正则 `\$\(\s*['"\x60]#`，其中 `\x60` 是反引号）。模块分布：`components` 722、`inspector` 168、`commands` 153、`tools` 79、`animation` 48、`title` 40、`scene` 36、`palette` 29。热点文件：`components/tools/IfCondition.vue` 78、`SetNumberOperand.vue` 58、`commands/SetString.vue` 44、`animation/animation-window.ts` 24。
- **为什么单列**：`$` 走的是 `document.querySelector/getElementById` 包装，但**不在 lint 规则内**（规则只限 `document.*` 的 7 个成员），所以既不计入「待迁移命中 160」，也不会被 C1 的"白名单外为 0"覆盖——**这是与 160 并行的第二条债轴（P5）**，此前在任何报表里都看不到。`vue3-migration-plan.md` 阶段 4 的改造清单里明确写了「`$()` 选择器删除」，但阶段 4 记为完成时并未清零此项。
- **同轴的其他未门禁耦合（2026-09-11 全类审计，见 tracker `## 辅助口径`）**：`style.*` 赋值 336 处 / 78 文件、`.children` 遍历 229/73、`textContent=` 145/45、`clientWidth/Height` 读取 139/40、`classList.add/remove/toggle` 134/43、`scrollTop=` 84/39、`parentElement` 47/46、`closest()` 28/13、`next/prevElementSibling` 22/7、`append/prepend` 20/15、`nodeValue=` 6/3；而 `replaceChildren`、`insertAdjacentHTML`、`matches()`、`customElements.define`、`attachShadow`、原型扩展均为 **0**（阶段 4/7 的结论得到复核）。
- **推进策略（先度量后动手，按模块分批）**：① 以 tracker 新增的 `dollarLookup` 列逐模块销账（components → inspector → commands → tools → animation/title/scene/palette）；② 每处替换为四类之一——模板 `ref`、组件 `expose` API、store 数据查询、树/列表行 API（阶段 3/4 已有成套先例）；③ 终态删除 `dom.ts` 的 `$`（并评估同文件 `show/hide/css/addClass` 等 jQuery 风格工具）。**注**：其中"组件 `expose` API"那一类（约 247 行）需要 **P2b**（元素 API 退役）先给出类型化组件 API，否则只是把 `$('#x')` 换成 `ref.value`，鸭子调用不变——两线应同批评审。
- **验收标准**：① `pnpm dom:guard:tracker` 的 `dollarLookup` 列从 **1489** 降到画布白名单内；② 每批替换后 `pnpm -F @yami/editor test` + `pnpm lint` 全绿；③ 文档口径三方一致（tracker / README / 计划）。
- **验证命令**：`pnpm dom:guard:tracker`、`pnpm -F @yami/editor test`、`pnpm lint`、`pnpm docs:check`。
- **来源**：2026-09-11 第十二轮度量审计（此前该轴完全不在报表内；已并入 tracker 的「口径」区）。

### P5b 模块级进度表（2026-09-11 基线，合计 1489 处 / 239 文件）

| 模块 | 处数 | 文件数 | 批次 | 状态 |
| --- | --- | --- | --- | --- |
| `editor/components` | 722（批 1 已消 134：IfCondition 78 + SetNumberOperand 58） | 111 | 批次 1–2 | 🚧 批 1 完成 |
| `editor/inspector` | **0**（163 处全部改为读共享注册表 `inspectorEls`；另 5 处在 `inspector.ts`） | 38 | 批次 3 | ✅ **已完成** |
| `editor/commands` | **0**（批 2 全部完成：accessor 12 个 + 属性窗口族 + tips 2 个 + 自定义命令窗口 + 事件编辑器族） | 27 | 批次 2 | ✅ **已完成** |
| `editor/tools` | 78 → **2**（均为白名单：`image-crop-window` 的动态 id、`window-object` 的 `#window-ambient` 外壳元素） | 6 | 批次 3 | ✅ **已完成** |
| `editor/animation` | 48 | 2 | 批次 4 | 未开始 |
| `editor/title` | 40 | 5 | 批次 4 | 未开始 |
| `editor/scene` | 36 | 6 | 批次 4 | 未开始 |
| `editor/palette` | 29 | 4 | 批次 4 | 未开始 |
| `editor/module` | 25 | 5 | 批次 4 | 未开始 |
| `editor/particle` | 22 | 4 | 批次 4 | 未开始 |
| `editor/stores` | 21 | 3 | 批次 4 | 未开始 |
| `editor/local` | 18 | 3 | 批次 4 | 未开始 |
| `editor/ui` | 18 | 2 | 批次 4 | 未开始 |
| `editor/composables` | 16 | 4 | 批次 4 | 未开始 |
| `editor/data` | 15 | 1 | 批次 4 | 未开始 |
| `editor/engine` | 15 | 4 | 批次 4（画布区需与白名单口径对齐） | 未开始 |
| `editor/variable` | 15 | 3 | 批次 4 | 未开始 |
| `editor/services` | 14 | 3 | 批次 4 | 未开始 |
| `editor/attribute` | **0**（批 3：`attribute-window.ts` 改读 `attributeEls`） | 1 | 批次 3 | ✅ **已完成** |
| `editor/enum` | **0**（批 3：`enum-window.ts` 改读 `enumEls`） | 1 | 批次 3 | ✅ **已完成** |
| `editor/plugin` | 7 | 1 | 批次 4 | 未开始 |
| `editor/log` | 5 | 3 | 批次 4 | 未开始 |
| `editor/utils` | 3 | 2 | 批次 4 | 未开始 |

### 使用形态分布（按行互斥归类，2026-09-11）

| 形态 | 行数 | 文件数 | 替换手法 |
| --- | --- | --- | --- |
| 句柄捕获 `const x = $('#id')` | 115 | 62 | SFC 内 → 模板 `ref`；非 SFC → 组件实例引用或 store 查询 |
| 直接方法调用 `$('#id')?.m()` | 93 | 37 | 组件 `defineExpose` API（`loadItems`/`read`/`write`…）或数据查询 |
| 作为实参/数组元素 `f($('#id'))` | 561 | 156 | 改为传「数据 + 回调」，或由提供方 expose 后传引用 |
| 其它（模板串/属性赋值/比较/多行） | 641 | 179 | 逐个判定，优先并入上面三类 |

> 口径说明：分类以「行」为单位、互斥（优先级 句柄捕获 > 直接调用 > 实参 > 其它），故各行数之和（1410）小于处数（1489，同一行可能多处）。

### 分批推进与验收

| 批次 | 范围 | 规模 | 关键手法 |
| --- | --- | --- | --- |
| 1 | `components/tools/IfCondition.vue`(78) + `SetNumberOperand.vue`(58) | 136 处 / 2 文件 | 纯 SFC：句柄捕获改模板 `ref`、`$('#…')?.loadItems` 改 `ref.value.loadItems` |
| 2 | `components/commands/*` | 153 处 / 27 文件 | 多为阶段 3 遗留残余，与 `useCommandSchema` 的 v-model 范式对齐 |
| 3 | `inspector`(168) + `tools`(79) + `attribute`(11) + `enum`(9) | 267 处 / 46 文件 | 页面 SFC 用 `ref`；`attribute`/`enum` 与 T5b #1/#2 合并（同一批改动） |
| 4 | 非 SFC 窗口/单例模块（animation/title/scene/palette/module/particle/stores/local/ui/composables/data/engine/variable/services/plugin/log/utils） | ~900 处 | window 模块 → store 化 + 组件实例引用；画布区需与 C1 白名单口径对齐 |

- **每批验收**：`pnpm dom:guard:tracker` 的 `dollarLookup` 列按批次下降（并与本文档表格同步）→ `pnpm -F @yami/editor test` → `pnpm lint` → `pnpm docs:check`；真机按批次范围冒烟（批次 1 打开条件/数值操作数控件所在面板核对联动）。
- **回滚**：每批独立提交，`git revert` 即可（纯引用替换，不涉及数据层）。

## P2b — ui-kit 元素 API 收尾（`*-api.ts` + `attachApi` 退役）

- **现状证据（2026-09-11 实测）**：`packages/ui-kit/src/**/*-api.ts` **26** 个文件（其中 **21** 个调用 `attachApi`）；`packages/ui-kit/src/utils/attach-api.ts` 本体仅 8 行，却被 **41** 个文件 import；editor + ui-kit 侧的**鸭子式可选链 API 调用**（`?.loadItems?.(` / `?.write?.(` / `?.enable?.(` / `?.relate?.(` …）合计 **682 处 / 246 文件**。也就是说：**阶段 2 的"去重"（core 抽取）已完成，但其验收条件「`-api.ts` 文件数从 27 → 0」远未达成，且从未登记为待办**。
- **为什么单列**：这是 P2「ui-kit 组件契约化」的**另一半**——把 `read/write/enable/disable/loadItems/relate/…` 从"挂在元素实例上的鸭子方法"改为**类型化组件 API**（props/emits + `defineExpose`）。它与 P5b **同源**：P5b 里那 247 行「组件 API」桶（`$('#id')?.loadItems?.()`）正是元素 API 的调用面——不退役元素 API，调用点只会从 `$('#x')` 变成 `ref.value`，鸭子调用照旧。
- **推进策略（与 P5b 合并排序，按组件逐个收口）**：① 盘点 26 个 api 文件的**调用面**（哪些方法、被谁以鸭子方式调用、对应组件是否已有 expose）；② 选一个高频组件（`YMSelectBox` / `YMNumberBox` 之类）做样板：`defineExpose` 补类型 + 调用方改用模板 ref（SFC）或注入实例（非 SFC）；③ 每完成一个组件就删它的 `*-api.ts` 并清掉调用方可选链；④ 26 个全部退役后删 `attach-api.ts`、更新 playground demo 与文档口径。
- **验收标准**：① 「`*-api.ts` 归零」**已作废**（见上方 B3 复核）；② 改为：**P2b-1** 每个被鸭子调用的组件都有消费方可直接 import 的 `XxxApi` 类型、`attachApi` 泛型化并在编译期校验键集合；**P2b-2** Vue 内使用的组件随 P5b 走 ref/expose、Vue 外的元素工厂保留；**P2b-3** 25 个 api 文件的 `oxlint-disable` 面随类型化收窄；③ 鸭子调用（现 **682 处**）在完成 P2b-1/P2b-2 后**显著下降**（不追求归零，Canvas/引擎侧属合理用法）；④ `pnpm -F @yami/ui-kit test` + `pnpm -F @yami/editor test` + `pnpm lint` + typecheck 全绿；⑤ `*-api.ts` 计数门禁保留，目标改为**不增长**。
- **验证命令**：`pnpm -F @yami/ui-kit test`、`pnpm -F @yami/editor test`、`pnpm lint`、`pnpm dom:guard:tracker`、`pnpm docs:check`。
- **来源**：2026-09-11 第二十三轮度量审计（阶段 2 验收条件未达成且未登记；`docs/vue3-migration-plan.md` 阶段 2 段已补完成度更正）。


> **⚠️ 2026-09-11 B3 复核：P2b 的目标需要重新定义（原「26 → 0」不成立）**
>
> **实测（本轮）**：`packages/ui-kit/src/components/**/*-api.ts` 共 **25** 个（第 26 个是 `utils/attach-api.ts` 自身，即门禁在数的那个集合）。逐个核查后确认——
> ① **全部 25 个都是「元素优先实现」**：每个都自己 `export function createXxxElement(...)` 并调用 `attachApi(...)` 把方法挂到元素上，**不是**临时的兼容桥；
> ② **零死文件**：每个 api 的导出都被真实引用（消费方是 editor 侧的工厂文件——`components/check-box.ts`、`select-box.ts`、`var-factories.ts`、`command-list.ts`、`select-list.ts`、`tree-list.ts`、`menu-list.ts`、`detail-box.ts`、`color-box.ts`、`number-var.ts`、`toast.ts`、`keyboard-box.ts` 等——以及 `ui-kit/src/index.ts` 的对外导出）；
> ③ **不存在 SFC/元素 双实现**：`YMSelectBox`/`YMTextBox`/`YMNumberBox` 的 SFC 与 api **共享同一个 `*-core.ts`**（阶段 2 的去重成立），`YMSelectList.vue` 则直接 import 自己的 api。
>
> **∴ 结论**：把「`*-api.ts` 归零」当作验收，等于要求删掉 ui-kit 的对外元素 API 架构，与"ui-kit 供 editor 以元素/工厂方式使用"的现实冲突。真实的技术债是另外三条：
> - **P2b-1（类型化契约）**：`attachApi` 目前是 `Record<string, unknown>` 式无类型挂载 → 消费方只能靠 `?.` 兜底（鸭子调用 682 处 / 246 文件）；应让每个组件的 `XxxApi` 接口成为消费方的**唯一入口**（多个已存在：`ScrollBarApi`/`DetailSummaryApi`/`TreeListApi`…），并让 `attachApi` 泛型化、编译期校验键集合。
> - **P2b-2（元素 API 留在 Vue 内使用的子集）**：Vue 内使用的组件（选择/文本框/数字框…）随 **P5b** 一起走模板 ref + `defineExpose`；Vue 外（Canvas/引擎/命令模块）继续用元素工厂——**不强行统一**。
> - **P2b-3（豁免收窄）**：25 个 api 文件都带 `oxlint-disable eslint/no-restricted-properties`；类型化后逐步把其中的 `document.createElement` 等收敛到 `create*Element` 少数几处，缩小豁免面。
>
> **门禁相应调整**：`pnpm docs:check` 的 `*-api.ts` 计数仍与磁盘核对，但**目标由「0」改为「不增长」**（数字本身只作趋势）；P2b 的验收改为上述三条，不再以文件数归零为准。
## P4b — 原型访问器退役（`utils/element-data.ts`）

> 🚧 **进行中（2026-09-11，B3 首刀）**：**11 个零访问字段已删除**（`conditionIcon`、`eventEnabled`、`hiddenState`、`lockState`、`groupText`、`attrKey`、`annotated`、`initText`、`attrValue`、`relationMark`、`collisionMark`）——删前逐一复核「全仓无任何引用」（`initText` 的 4 处命中经查是 `Variable.vue` 的局部变量与 `stores/localization.ts` 的一处类型残留，已一并清掉）。`DATA_FIELDS` **83 → 72**（访问器 166 → 144）；typecheck / vue-tsc / oxlint 全绿。剩余：按组件把 `this.x` / `el.x` 改成显式 `getElementData(el)`（与 P2b 同批）。

- **现状证据（2026-09-11 实测）**：`packages/editor/src/utils/element-data.ts`（119 行）把元素数据搬进 `WeakMap`（这一步本身是对的：不再往 DOM 元素自身上复写属性），但**访问语法仍依赖全局原型访问器**——`defineDataAccessors()` 对 `DATA_FIELDS` 的每个字段逐个 `Object.defineProperty(HTMLElement.prototype, field, { get, set })`（B3 前 **83** 个字段 / **166** 个访问器；现 **72 / 144**），并在 `packages/editor/src/main.ts:7` 以副作用方式导入生效。模块注释自述："数据不污染 DOM 元素…通过原型访问器透明迁移——`el.dragging` 等读写自动走 WeakMap（挂载/读取处零改动）"。
- **为什么此前没被记到**：tracker 的 `protoExt` 模式要求 `prototype` 后跟**点**（`…\.prototype\.`），而这里是 `Object.defineProperty(HTMLElement.prototype, field, …)` 的**逗号形式**，因此长期显示为 0。本轮已在 tracker 的「辅助口径」新增列「prototype 访问器定义（逗号形式）」把它暴露出来（当前 **1 处 / 1 文件**）。
- **调用面（近似，2026-09-11 实测）**：`this.<字段之一>` 命中 **774 处 / 123 文件**（`this` 多为元素接收者；热点：`YMCommandList/command-api.ts` 134、`YMTreeList/tree-api.ts` 32、`scene/scene-events-pointer.ts` 23、`tools/text-capture.ts` 23、`data/transition-window.ts` 21）。**注意**：字段里混有大量通用名（`key`/`mode`/`target`/`start`/`end`/`active`/`count`/`page`…），文本检索**无法区分**"元素数据"与"普通对象状态"，因此迁移必须按组件逐个确认，不能全局替换。
- **推进策略**：① ~~先删 11 个死字段~~（已完成）；② 按组件把 `this.x` / `el.x` 改为显式 API（模块已导出 `getElementData(el)`；与 **P2b** 的元素 API 收尾同批做最省事）；③ 每组件一个提交 + 真机冒烟；④ 终态删除 `defineDataAccessors()` 与 `main.ts` 的副作用导入——届时 P4 的验收「全仓无 `HTMLElement.prototype` 扩展」才真正成立。
- **验收标准**：① `DATA_FIELDS` 与 `defineDataAccessors` 消失，tracker 新列「prototype 访问器定义（逗号形式）」= **0**；② `pnpm -F @yami/ui-kit test` + `pnpm -F @yami/editor test` + `pnpm lint` + typecheck 全绿；③ 真机冒烟覆盖依赖"元素上存状态"的交互：树列表拖拽/多选、命令行折叠与选区、场景指针、文本捕获。
- **验证命令**：`pnpm -F @yami/ui-kit test`、`pnpm -F @yami/editor test`、`pnpm lint`、`pnpm dom:guard:tracker`、`pnpm docs:check`。
- **来源**：2026-09-11 第二十四轮度量审计（P4 的"改头换面"形态；`docs/vue3-migration-plan.md` 阶段 4 的验收表述同步更正）。

### 批次 1 执行清单（`components/tools` 两文件，136 处）——**✅ 已执行（2026-09-11，B3/B4-批 1）**

> **执行结果**：两个文件**全部迁移完成**，`$('#…')` 只在各自的注释说明里保留 1 处；tracker 的 `dollarLookup` 全仓 **1481 → 1347**（−134，其中 IfCondition 78 → 1、SetNumberOperand 58 → 1）。实施细节与方案预估的差异：
> - **句柄捕获**：两个文件都改成 `fieldEls.get(id)` 取**实例**（不是元素），并给其方法调用补可选链（`typeEl.loadItems?.()`、`opEl.enableHiddenMode?.()?.relate?.()`）。
> - **`targets` 实参**：`$('#a')` → `fieldEls.get('a')?.root`（共 49+59 处，含数组续行）。
> - **方案未列的第 2 种形态（跨行链式）**：`$('#x')` 单独一行、后接 `.enableHiddenMode()` / `.relate()` 的写法共 **6 处**（IfCondition 6、SetNumberOperand 1）——这些是**组件 API 调用**而不是元素实参，必须取实例（`fieldEls.get('x')?.enableHiddenMode?.()?.relate?.(...)`），否则会得到"元素上没有该方法"的静默 no-op。
> - **方案未列的第 3 种形态（窗口元素）**：`SetNumberOperand` 里有两处 `$('#setNumber-operand')` 指的是 **WindowFrame 本身**（不是控件）→ 改为既有的 `frame.value?.root`；给 WindowFrame 挂 `:ref="fieldRef(...)"` 是错的。
> - `SetNumberOperand` 按方案补了 ref 注册表：模板 **33 个控件**加 `:ref="fieldRef(id)"`（第 34 个 id 就是上面的窗口）。
> - `FieldControl` 类型从 `{read,write}` 扩为含 `loadItems` / `enableHiddenMode().relate` / `root`（两文件同形），**因此这批同时兑现了 P2b-1 的消费方侧**（调用从"元素上的 any-ish 方法"变成"类型化实例方法"）。

**站点分布（2026-09-11 实测，按形态互斥归类）**

| 文件 | 处数 | 组件 API 调用 `$('#x')?.m(` | 作为实参 `targets: [$('#x')]` | 句柄捕获 `const x = $('#x')` | 其它（多为数组换行续行） |
| --- | --- | --- | --- | --- | --- |
| `packages/editor/src/components/tools/IfCondition.vue`（原 811 行 → 819） | **78** | 18 | 32 | 1 | 19（+6 处跨行链式） |
| `packages/editor/src/components/tools/SetNumberOperand.vue`（原 ~799 行 → 819） | **58** | 9 | 22 | 1 | 25（+1 处跨行链式 +2 处窗口元素） |

**关键事实（决定改造难度）**

- `IfCondition.vue` **已经有 ref 注册表**：`fieldEls: Map<string, FieldControl \| null>` + `fieldRef(id)`（L434-438），模板里每个控件都挂了 `:ref="fieldRef('if-condition-x')"`（L15/22/30/36/…）——但脚本里仍用 `$('#if-condition-x')` 取元素，**注册表实际未被消费**。所以这个文件的最小改造是"把 78 处 `$()` 换成读注册表"，无需新增模板改动。
- `SetNumberOperand.vue` **没有注册表**（0 处 `fieldRef`，模板是 `<SelectBox id="setNumber-operation" v-focus />`）→ 已照 `IfCondition.vue` 的形态补 `fieldRef` + `:ref`（33 个控件），再替换 58 处。
- 目标组件侧**不需要等 P2b**：`YMSelectBox.vue` 的 `defineExpose` 已包含 `loadItems`、`setItemNames`、`enableHiddenMode`、`relate`、`toggleRelatedElements`、`enableElement`、`disableElement`、`on`、`root`、`initializeApi`（L172-196）。

**替换配方（逐形态，已按此执行）**

1. **句柄捕获**：`const opEl = $('#setNumber-operation')` → `const opEl = fieldEls.get('setNumber-operation')`（取实例），其方法调用补 `?.`。
2. **组件 API 调用**：`$('#x')?.loadItems([...])` → `fieldEls.get('x')?.loadItems?.([...])`；跨行链式同上（取实例）。
3. **作为实参**：`targets: [$('#a'), $('#b')]` → `targets: [fieldEls.get('a')?.root, fieldEls.get('b')?.root]`——`relate`/`toggleRelatedElements` 按**元素**切 `display`，所以这里仍要元素；**终态**（并入 P2b）是让这些目标控件改收 `hidden`/`enabled` props，由数据驱动显隐，彻底去掉"传元素"。
4. **窗口元素**：`$('#<窗口 id>')` → `frame.value?.root`（不要给 WindowFrame 挂 fieldRef）。

**验收与复现**

- 复现清单：`grep -n "\$('#" packages/editor/src/components/tools/IfCondition.vue` 与同命令作用于 `SetNumberOperand.vue`——现在**各只剩 1 处注释说明**。
- 验收：① `pnpm dom:guard:tracker` 的 `dollarLookup` 全仓 **1481 → 1347**；② `pnpm -F @yami/editor test` **1897/1897**、`pnpm -F @yami/ui-kit test` **667/667**；③ `tsc` strict 与 `vue-tsc` **0 新增错误**、`oxlint` 0/0；④ **待真机核对**：切换 If 条件类型（boolean/number/string/object/actor/…）时"操作数/操作/常量"控件的显隐与启用态、SetNumber 的 operand 切换同理（jsdom 无法覆盖真实显隐）。
- **注意**：这批之后鸭子调用仍在（`fieldEls.get('x')?.loadItems?.()`），但**已从"元素上的无类型方法"变成"类型化实例方法"**；P2b-1 剩余的消费方侧（另 ~180 处元素查找式调用）随后续批次继续。

### 批次 2 执行清单（`editor/commands` 模块，153 处 / 27 文件）——**🚧 accessor 部分已完成（2026-09-11）**

> **本批引入的第二种配方（非 SFC 模块 → SFC 登记注册表）**：`commands/accessors/*.ts` 是**薄模块**——`createAccessor({ initialize, open, confirm })` 由 `schema.ts` 的 `initAll()` 统一调用（`subMap[name].initialize!()`，**不是死代码**），initialize 里原本用 `$('#<prefix>-<field>')` 接线。改造方式：
> 1. **基础设施**：`types/shapes.ts` 新增 `AccessorFieldControl` / `AccessorFields`，`AccessorBaseShape` 加 `fields?`；`accessor-factory.ts` 新增 **`createAccessorFields()`**（返回 `{ fields, fieldRef }`）。
> 2. **SFC 侧**：`const { fields, fieldRef } = createAccessorFields(); <Accessor>.fields = fields;` + 模板控件挂 `:ref="fieldRef('<id>')"`（共 12 个 accessor、46 个控件）。赋值发生在 setup 期，早于 `initAll()`（AppShell 在所有弹窗挂载后才调 `Editor.initialize`）。
> 3. **模块侧**：`$('#x')` → **`this.fields?.get('x')`**（统一用 `this.fields`：`initialize()` 与 `open()` 都由 factory 以访问器为 `this` 调用，避免把注册表声明成局部常量后在 `open()` 里作用域失效）。
> 4. **`*-confirm` 按钮**：`on($('#skillGetter-confirm'), 'click', this.confirm!)` 这类接线**必须改走 SFC 的 `@confirm`**——`<prefix>-confirm` 是 `WindowFrame` 生成的按钮，模板里没有、注册表取不到（5 个 accessor 属于此种：ancestor/skill/state/tilemap/trigger，其 SFC 原先没有 `@confirm`，本次补上 `@confirm="onConfirm"` + `onConfirm = () => X?.confirm?.(new Event('click'))`）。
>
> **实测**：`editor/commands` 模块 **153 → 60 处**（余 15 文件：`command-custom`/`custom-command-window`/`event-editor-*`/`property-window/*`/`schema.ts`/`text-tip` 等，属批 2 的剩余部分）；全仓 `$('#…')` **1347 → 1255**、文件 **238 → 227**。
> **回归保护（本批新增）**：`commands/accessors/__tests__/accessor-fields.spec.ts`（3 例）——挂载真实 SFC 后断言"注册表已登记 → `initialize()` 真的调到控件的 `loadItems`、`relate` 的 targets 是注册表里的根元素"，并覆盖"注册表缺失时安全 no-op"。此前这条链路**没有任何 spec 覆盖**。

> **属性窗口族（同批第二批）也已完成（2026-09-11）**：`commands/property-window/property-window-factory.ts`（9 个属性窗口共用）+ 6 个 `set-*-property-window.ts` + 9 个 `Set*Property.vue`。
> ① **工厂**：`$(\`#${prefix}-property-key\`)`、动态 targets（`k.targets` / `uiName`）、`subRelates`（`selector` + cases）、`getFocus` 全部改为从 **`PropertyWindow.fields`**（SFC 登记）取值；`on($(\`#${prefix}-property-confirm\`), 'click', …)` 删除，改由 SFC 的 `@confirm` 驱动——与 accessor 族同一个发现：**`*-confirm` 按钮由 WindowFrame 生成，模板里没有、注册表取不到**。
> ② **两种注册形态的坑（既有 spec 当场抓到）**：控件注册进来是**组件实例**（元素在 `.root`），而普通容器 div 注册进来**就是元素本身**（`.root` 为 undefined）。初版解析函数只取 `.root`，导致 `relate` 的目标容器拿不到元素、`property-window-mount.spec.ts` 断言"字段被隐藏"失败（`expected '' to be 'none'`）；已改为 `control instanceof HTMLElement ? control : control.root`。accessor 族的 relate 目标经核查**全是控件**，不受影响。
> ③ 9 个 SFC 全部登记注册表（其中 Animation/Button/Window 三个模块本身没有 `$()`，但**共用同一工厂**，因此也必须登记——否则它们的 key 下拉与字段联动会失效）。
> **实测**：`editor/commands` 模块 **153 → 40 处**（余 12 文件：`event-editor-*`、`command-custom`、`custom-command-window`、`command-tip`、`text-tip`、`schema.ts` 等）；全仓 `$('#…')` **1347 → 1235**、文件 **238 → 220**；顺手删掉工厂那条已陈旧的 `oxlint-disable`（受限 API 归零）→ **待迁移命中 159 → 158**、`getElementById` **243 → 242**。

> **事件编辑器族（同批第五批，2026-09-11）——`editor/commands` 模块归零**：`commands/event-editor-initialize.ts`（10 处）+ `commands/event-editor-commands.ts`（6 处）+ `Event.vue`。
> - 新增 `eventEditorEls` 元素注册表（导出在 `event-editor-initialize.ts`），`Event.vue` 登记 7 个元素：`event`（WindowFrame）、`event-open-list`（TreeList）、`event-commands`（CommandList）、`event-commands-fieldset`／`event-commands-gutter-outer`／`event-commands-gutter-inner`（div）、`event-type`（SelectBox）。
> - `ensureDomBound()` 的 list/commandList/两侧 gutter、`initialize()` 里 `#event` 的 close/closed/resize 监听、`#event-type` 的 input 监听、`#event-commands` 的 change 监听全部改读注册表；`on($('#event-confirm'),'click',…)` 删除，改由 `Event.vue` 的 `@confirm` 驱动。
> - `event-editor-commands.ts` 的 `show`/`hide`/`loadItems`/`createTooltip` 四处改读注册表元素（这些是元素 API 与 DOM 操作，注册元素即可，无需组件实例）。
> - `EventEditor.outerGutter`／`innerGutter` 的类型是非空 `HTMLElement`：注册表在挂载前为 `undefined`，因此沿用原先 `$()` 的**非空断言语义**（`as HTMLElement`）而不是 `?? null`。
>
> **批 2 收口（五个子批合计）**：`editor/commands` 模块 **153 处 / 27 文件 → 0 处 / 0 文件**；全仓 `$('#…')` **1347 → 1201 处**（−146）、文件 **238 → 215**（−23）。新基建三件：控件实例注册表 `createAccessorFields()`（accessor 族）、元素注册表 `createElementRegistry()`／`registryRef()`（tips、自定义命令窗口、事件编辑器、属性窗口）、`AccessorFieldControl`／`AccessorFields` 类型。**尚未覆盖**：`createElementRegistry` 目前依赖各模块自行导出注册表，命名与放置位置各不相同（`commandSuggestionEls`／`textSuggestionEls`／`customCommandEls`／`scriptCommandEls`／`eventEditorEls`）——统一命名规范留待 C1 收尾或后续批次。

### 批次 3 执行清单（`src/inspector` 168 + `src/tools` 78 + `attribute` 11 + `enum` 9 = 267 处 / 46 文件）——**🚧 进行中（attribute / enum 已完成）**

> **口径澄清（本轮踩过的坑，2026-09-11）**：计划表的模块名按 **`packages/editor/src/` 下的顶层目录**分组。我一开始按 `packages/editor/src/components/inspector` 去量，得到「inspector = 0 处」，据此怀疑计划表有误；改用顶层目录分组后复测确认计划表**无误**——`src/inspector/**`（37 个 `.ts` 页面模块）确实 163 处、`src/tools/**` 78 处，而 `components/inspector/*.vue` 侧是 **0 处**（页面 SFC 是纯模板，DOM 查找全在模块里）。教训：**度量脚本的路径口径必须与计划表一致**，否则会得出"计划错了"的假结论。

**本批已完成的部分（2026-09-11）**

| 子族 | 模块 | SFC | 处数 | 做法 |
| --- | --- | --- | --- | --- |
| 属性窗口 | `attribute/attribute-window.ts` | `Attribute.vue`（登记 9 个元素） | 11 → 0 | 新增 `attributeEls` 元素注册表；`ensureDomBound()` 的 list/panel/searcher/inputs×5 与 `initialize()` 的 `#attribute` close/closed 改读注册表；`on($('#attribute-confirm'),'click',…)` 删除，改由 `@confirm` 驱动 |
| 枚举窗口 | `enum/enum-window.ts` | `Enum.vue`（登记 7 个元素） | 9 → 0 | 同上（`enumEls`）；`#enum-confirm` 同理 |

- **新增回归**：`attribute/__tests__/attribute-enum-registry.spec.ts`（4 例）——挂载真实 SFC 后断言"注册表 9/7 项、元素 id 与注册键一致"，`Attribute.initialize()` 绑定 list/panel/searcher/inputs 且 panel 被 `hide()`（`hidden` class），`Enum.initialize()` 同理，以及"注册表为空时安全 no-op"。此前这两窗的 DOM 绑定**无任何 spec 覆盖**。
- **注意**：`Attribute.panel` 等字段类型是非空 `HTMLElement`，注册表在挂载前为 `undefined`，因此沿用原先 `$()` 的**非空断言语义**（`as HTMLElement`）。

**批 3 剩余（下一轮起）**

- `src/inspector/**`（163 处 / 37 页面模块）：全部是**元素用法**（104 处作为元素实参传给 `read`/`write`/`enable`/`disable`/`show`/`hide`，25 处 `const el = $(…)`，9 处 `this.x = $(…)`，5 处 `.loadItems(…)`，2 处存在性判断，其余为 `return $(…)` 与 `*-vue-mount` 动态挂载点）→ 适用元素注册表；需按页面前缀（`uiElement-`/`fileActor-`/`animMotion-`…）为每个页面 SFC 建立注册表。
- `src/tools/**`（78 处 / 6 模块）：`text-capture`(22)、`color-picker-window`(21)、`condition-list`(21)、`property-list`(8)、`image-crop-window`(4)、`window-object`(2)。其中 `property-list.ts` 的 `#object-attribute-*` 属 `ObjectAttribute.vue`，`window-object.ts` 的 `#window-ambient`/`#title` 属窗口对象 API。

**批 3 的第二刀（src/tools 三个模块，2026-09-11）**

| 模块 | SFC | 处数 | 做法 |
| --- | --- | --- | --- |
| `tools/condition-list.ts` | `Condition.vue`（登记 8 个元素） | 21 → 0 | `conditionEls`；`static initialize()` 的 type/key/operation/value 控件与 `relate` targets 改读注册表；`static typeWrite()` 里 `$('#condition-key').filter = …` 改为"先取元素再守空赋值" |
| `tools/property-list.ts` | `ObjectAttribute.vue`（登记 5 个元素） | 8 → 0 | `objectAttributeEls`；`loadItems` 与 `relate` targets 改读注册表（取值处补 `?.`） |
| `tools/image-crop-window.ts` | `ImageClip.vue`（登记 3 个元素） | 4 → **1** | `imageClipEls`；window/screen/image/marquee 改读注册表 |

- **保留 1 处（动态 id 白名单）**：`tools/image-crop-window.ts:106` 的 `read($('#' + id))`——`id` 来自 **target 元素的 `image` 属性**（运行时才知道目标控件 id），不是静态控件查找，属计划中预留的"动态 id 类残余"，已在代码处加注释说明。
- **一条通用判据（差点重犯批 2 的错）**：**不要用 `grep '<X>.initialize'` 判定 `initialize` 是死代码**——`main/initialize.ts` 的 `initSingleton(name)` 会从 `window-cluster` 动态取单例再 `shape.initialize.call(singleton)`（`ConditionListInterface` 就在 cluster 里）；`Schema.initAll` 的 `subMap[name].initialize!()` 同理。批 2 的 accessor 与本次的 condition-list 都属此类。

**批 3 的第三刀（`tools/color-picker-window.ts`，21 处 → 0）**

- **radio 组不建新注册表**：`$('#color-index')` 命中的其实是 **RadioProxy 生成的代理 div**（16 个 `<RadioBox name="color-index">` 的元素 API 载体）。ui-kit 早已有 `radioProxyMap`（键 = 组名，值 = `RadioProxyElement` 类型化接口，带 `reset()`/`cancelable`/`relate()`）→ 8 处 `.reset()` 与 1 处 `cancelable = true` 直接改读 `radioProxyMap['color-index']`，**比元素注册表更贴切**（这正是 P2b"把元素 API 换成类型化契约"的方向）。
- 其余 12 处（`color-hex`/`color`/palette 与 pillar 的 frame、canvas、cursor、viewer）走新的 `colorEls` 元素注册表，`Color.vue` 登记这些元素；canvas 处按 `HTMLCanvasElement` 取值，`getContext()` 结果补非空断言（沿用原先 `$()` 的非空类型语义）。

**🔴 本轮抓到一个会静默失效的坑（值得全项目警戒）**

`<WindowFrame ref="frame" id="color">` **已经占用了 `:ref` 槽位**，因此脚本无法再挂 `registryRef(...)` → `color` 没被登记 → 模块里 `colorEls.get('color')?.addEventListener('closed', …)` 变成**静默 no-op**（窗口关闭回调不再执行）。

- 用一条审计脚本扫出**同类共 2 处**：`Color.vue`（`color`）与 `ImageClip.vue`（`imageClip`）——后者更严重：`ensureDomBound()` 里 `const win = imageClipEls.get('imageClip'); if (!win) return;` 会**直接早退**，整套绑定静默失效。
- 修法：`element-registry.ts` 新增 **`registerElement(registry, id, el)`**（命令式登记），两个 SFC 在 `onMounted` 里 `registerElement(reg, '<windowId>', frame.value?.root ?? null)`。
- **警戒线**：`:ref` 被占用时脚本会"跳过已有 ref 的标签"，**跳过是静默的**——凡做此类迁移，必须用审计脚本（对比"模块用到的 id"与"模板已登记的 id"）复核，而不是只看脚本输出的 refs 计数。
- 两个新回归 spec 正好锁住这条链路：`color-picker-registry.spec.ts`（4 例，含"initialize 把 radioProxy 设为 cancelable"）与 `image-crop-registry.spec.ts`（3 例，含"initialize 从注册表绑定 window/screen/image/marquee"）——**没有它们，这两个静默失效不会被任何测试发现**。

**批 3 的第四刀（`tools/text-capture.ts` 22 处 + `tools/window-object.ts` 2 处）——`src/tools` 归零**

| 模块 | SFC | 处数 | 做法 |
| --- | --- | --- | --- |
| `tools/text-capture.ts` | **五个** SFC 共享一个注册表：`Font.vue`(1)、`TextPosition.vue`(2)、`TextEffect.vue`(5)、`InsertImage.vue`(5)、`LocalVariable.vue`(1) | 22 → 0 | 新增 `textCaptureEls`（跨 SFC 共享，同批 2 的 `commandSuggestionEls`）；**启动门改写**：原先用 `if (!$('#font-confirm')) return;` 判断"窗口已挂载"，改为 `if (!textCaptureEls.get('font')) return;`（`Font.vue` 登记 `font`）。四个 SFC 早已有 `@confirm`，故无按钮迁移 |
| `tools/window-object.ts` | `AppShell.vue` 登记 `title` | 2 → **1** | `Title.target` 改读 `windowShellEls`（新增外壳元素注册表）；`#window-ambient` **保留为白名单**——它是 **`index.html` 里的静态外壳元素**（不在任何组件模板里，`vitest.setup.ts` 也为测试预建它），不属"组件控件查找" |

- **`#window-ambient` 的定性依据**：全仓检索后确认它只出现在 `index.html`、`Project/css/layout.css` 与 `vitest.setup.ts`（测试预置），没有组件渲染它 → 属外壳骨架，改造无收益（把查找挪进 AppShell 仍是 DOM 查找）。
- **既有 spec 抓到契约变化**：`window-object.spec.ts` 断言"打开首个窗口后焦点让给 `#title`"，改造后 `Title.target` 只在注册表里有值时才被赋值 → 用例失败。已按新契约更新（在 `beforeEach` 里 `registerElement(windowShellEls, 'title', …)`，并重置 `titleMock.target`），21 例全绿。这正是"注册表化"应有的可见性：**没有默认回退**。
- **新增回归**：`text-capture-registry.spec.ts`（6 例）——逐个 SFC 断言其登记的 id 与元素 id 一致，并断言"五个 SFC 全挂载后 14 个 id 都在注册表里（启动门可放行）"。
- **另修一处脚本通病**：早期脚本用"标识符是否出现"判断是否需要补导入，而模板里的 `registryRef(reg, …)` 会让判断为真 → 漏导入（TS2339）。已写**通用修复器**扫全仓 SFC，凡用 `registryRef`/`registerElement` 者都校验"① 助手已导入 ② 注册表已从其定义模块导入"，本次修复 5 个 SFC；该修复器留在工具脚本口径里供后续批次复用。

**批 3 进度**：`src/attribute` ✅、`src/enum` ✅、`src/tools` ✅（余 2 处白名单）、`src/inspector` 168 处 / 38 个页面模块 🚧 待做。

**批 3 的第五刀（`src/inspector` 全族，163 处 / 37 个页面模块 + `inspector.ts` 5 处）——`src/inspector` 归零**

**关键事实（决定了做法）**：先按 **id 粒度**做归属审计（而不是按模块的并集，后者会误判），结论是——**123 个 id 各有唯一渲染者**（`LayoutPanel.vue` 40 个、`UIImagePage.vue` 15 个、`FileActorPage.vue` 10 个…），**0 个 id 有多渲染者**，**4 个 id 无渲染者**（`uiButton-horizontalAlign` 等，实为 RadioBox 组的 `name`，走 `radioProxyMap`）。因此可以为整族建**一个共享注册表** `src/inspector/element-registry.ts` 的 `inspectorEls`。

| 侧 | 改动 |
| --- | --- |
| 模块侧（37 个 `src/inspector/*-page.ts` + `inspector.ts`） | `$('#id')` → `inspectorEls.get('id')`（含存在性门 `if (!$('#x')) return;`、`this.x = $('#x')`、`(as T)` 断言、直接方法调用、元素实参、`clear(...)`）；4 个 radio 组改用 `radioProxyMap` |
| SFC 侧（25 个 SFC） | **两种登记机制**：① 74 个控件补 `:ref="registryRef(inspectorEls, 'id')"`；② **49 个已有具名 ref**（`ref="elSprites"` 等）的控件在 `onMounted` 里 `registerElement(inspectorEls, 'id', <ref>.value)` |

**本轮踩到并修掉的三个问题（都已固化进脚本/文档）**

1. **正则截断类型**：`($('#x') as A & { f?: () => void })` 这类断言里含 `()`，`[^)]+` 会在第一个 `)` 处截断 → 产出 `{ sync?: ( | null) => void }` 这样的坏代码（50 处，vue-tsc 报 TS1005）。已按形态精确修复（`sync?`/`updateImage?` 一参函数、多行联合类型断言三种）。
2. **未用导入**：`$` 不再使用但导入还在（35 个文件 TS6133）→ 删除（含与前一行其它符号共存的形态）。
3. **又是"标识符出现即判定已导入"**：`radioProxyMap` 在**代码**里出现、但**import 语句**没有 → 漏导入（TS2304）。修复判据统一改为"检查 import 语句"。

**既有 spec 抓到契约变化（两处，均按新契约更新）**

- `inspector-history.spec.ts`：用例手工创建 `#inspector-page-manager` / `#inspector` 后调 `Inspector.initialize()`，而 `initialize` 现在从注册表取 manager → 早退、`History.processors['inspector-change']` 未注册 ✗ → 用例补 `registerElement(...)`。
- `particle-layer-page-form.spec.ts`：用例手工创建 `#particleLayer-vue-mount` 宿主 → 页面模块现在从注册表取它 → 表单值为 `undefined` ✗ → 同样补登记。

**新增回归**：`inspector/__tests__/inspector-registry.spec.ts`（4 例）——分别锁住"模板 `:ref` 登记"（UIImagePage 9 个 id）与"具名 ref 命令式登记"（FileActorPage 8 个 id）两条机制，另断言"登记的是元素本身（id 与注册键一致）"与"卸载后项被清空（`registryRef` 收到 null）"。

### 批次 4 执行清单（非 SFC 模块与其余 SFC，943 处 / 173 文件）——**🚧 进行中（`components` 组已完成）**

> **批 4 第一刀（`src/components/**`，588 处 / 111 文件 → 0）**
>
> 这批是**命令表单 SFC**（`components/commands/**` 566 处 / 104 文件）+ `components/tools/**` 剩余（22 处 / 7 文件）。形态与批 1 的 `IfCondition.vue` 同源：站点**全部在 `<script>` 段**（104/104 文件），且**没有任何文件已有注册表** → 统一改造为**组件局部**注册表：
> - `const fieldEls = createElementRegistry();` + 模板控件 `:ref="registryRef(fieldEls, id)"`（新补 **409** 个）；
> - 已有具名 ref 的 1 处（`ForEach.vue` 的 `WindowFrame ref="frame"`）在 `onMounted` 里 `registerElement(...)`（并补了缺失的 `const frame = ref(...)` 声明——模板 ref 未声明时脚本里没有变量可用）；
> - 脚本段替换规则同 inspector（存在性门、`this.x =`、`(as T)`、直接方法调用、元素实参）✓。
>
> **两处跨组件 DOM 查找被顺手消灭**：`If.vue` 过去用 `$('#if-branch-conditions')?.bind?.(IfCondition)` 去够**子组件** `tools/IfBranch.vue` 渲染的元素、`Switch.vue` 同理 → 改为由子 SFC 在自己的 `onMounted` 里绑定自己的元素（父 SFC 里已无用的实例与导入一并清理）。这是 P5b 想根治的"跨组件按 id 够 DOM"形态。
>
> **3 处重复接线删除**：`Choice.vue` / `IfBranch.vue` / `SwitchBranch.vue` 里 `on($('#x-confirm'), 'click', …)` 与各自的 `@confirm="onConfirm"` 是**同一件事的双份接线**（处理器内核都是 `X.confirm?.(new Event('click'))`）→ 删除 click 版。
>
> **注释污染计数（老问题复发并已修）**：脚本插入的注释含字面 `$('#id')`，使 109 个文件各贡献 1 处假命中（tracker 从 943 直降到 464 看着很好，其实是 **464 里含 109 处注释**）→ 统一改写为"按 id 查 DOM"，指标校正为 **355 处 / 62 文件**。教训：**插入注释时就避免写出与被统计的语法相同的字面量**。
>
> **新增回归**：`components/__tests__/command-form-registry.spec.ts`（3 例，端到端）——挂载 `SetString` / `ChangeActorEquipment` / `JumpTo` 后断言"控件确实拿到了 `dataItems`"，即 `onMounted` 里经注册表的 `loadItems` 真的执行了；**若注册表链路断（如 ref 未登记），这些断言会失败而不是静默不加载**。
>
> **批 4 剩余**：355 处 / 62 文件，分布在 21 个目录组——`animation` 48、`title` 40、`scene` 36、`palette` 29、`particle` 22、`stores` 21、`local` 18、`ui` 18、`module` 17、`composables` 16、`data` 15、`engine` 15、`variable` 15、`services` 14、其余 7 组共 9 处。

**批 4 第二刀（`src/animation` 48 + `src/scene` 36 + `src/palette` 29 = 113 处 / 12 文件 → 0）**

这三组的共同形态：**模块持有窗口元素**（`this.page = $('#animation')`、`page: $('#scene')` 等 21+24 处属性赋值），元素全部由 **`LayoutPanel.vue`** 渲染（唯一拥有者 ✓），少量由各自窗口 SFC 渲染（`SceneShift.vue`、`AutoTile*.vue`、`FileTilesetPage.vue`）。

- 新增三个分组注册表：`animationEls` / `sceneEls` / `paletteEls`（各自 `element-registry.ts`）。
- `LayoutPanel.vue` 一次性补 **57** 个 `:ref`（animation 23 + 1 具名 `dirListEl` 命令式、scene 22 + `SceneShift.vue` 1、palette 的 13 在 `FileTilesetPage.vue`、`AutoTile*.vue` 13 个）。
- **顺带把两个脚本升级成可复用工具**（`--registry/--registry-file/--sfcs/--modules`）：批 4 后面 19 组都靠它，避免每次手写脚本。
- **两个"按钮在框架里"的收尾**：`object-folder-confirm`（`ObjectFolder.vue` 补 `@confirm`）、`autoTile-generateFrames-confirm`（`AutoTileGenerateFrames.vue` 补 `@confirm`）——两者的模块侧接线删除；前者删掉后 `default-object-folder.ts` 的 `$`/`on` 导入一并清理。
- **一个跨注册表的复用点**：`palette-initialize.ts` 的 `#fileTileset` 其实**已由 LayoutPanel 登记在 `inspectorEls`**（批 3 的产物）→ 直接改读 `inspectorEls`，不重复登记。
- **既有 spec 第 5 次抓到契约变化**：`palette-selection-render.spec.ts` 手工创建 `palette-*` 元素后调 `Palette.initialize()`，而模块现在从注册表取元素 → `marquee.customSelect is not a function` ✗；已按新契约在 `append()` 里 `registerElement(paletteEls, id, el)`（并单独登记 `inspectorEls` 的 `fileTileset`），5 例恢复全绿。

**工具与教训**：脚本给 SFC 补 import 时曾把 `createElementRegistry` 一起塞进去（SFC 只需 `registryRef`/`registerElement`）→ TS6133；已修工具并统一"**只补真正缺失的助手**"。

## B1 — 巨石渲染层重写

- **现状证据**：`packages/ui-kit/src/components/business/YMCommandList/command-api.ts` 2609 行（纯数据层已抽 `command-core.ts` 269 行）、`packages/ui-kit/src/components/business/YMFileBodyPane/YMFileBodyPane.vue` 2327 行（已抽 `file-body-core.ts` 154 行）；DOM 渲染层仍命令式。**契约面远大于测试面**：命令列表经 `packages/editor/src/components/common/CommandList.vue` 暴露 **67 个方法**、editor 侧约 **259 处**列表方法调用，而组件级只有 **12 个用例**；文件body 组件级 **5 个用例**（另有 editor 侧 2 个 / 3 个）。
- **实施方案（已定稿）**：[monolith-render-plan.md](./monolith-render-plan.md) —— M1 行为金标准补齐（把组件级用例提到 ~40+，含 `eslints` 缩进线扩展点）→ M2 派生层（`command-render.ts` / `file-body-render.ts`，与 tree 的 `tree-render.ts` 同构）→ M3 模板 v-for 换源（保 API 门面）→ M4 消费方迁移（缩进线扩展点正式化、`stores/browser.ts`/`stores/selector.ts` 的 `closest('.file-body-item')` 改数据查询）→ M5 清理与删除豁免。
- **验收标准**：① M1 用例全部保留语义（只允许改断言方式）；② ①后的每一步都保持 editor/ui-kit 全量绿；③ 完成后 tracker 中两文件的受限 API 命中（`command-api.ts` 17 处 / `YMFileBodyPane.vue` 3 处）归零、豁免注释删除；④ 真机事件编辑器（折叠/搜索/复制粘贴）与文件浏览器（normal/tile 视图）冒烟通过。
- **验证命令**：`pnpm -F @yami/ui-kit test`、`pnpm -F @yami/editor test`、`pnpm lint`、`pnpm dom:guard:tracker`、`pnpm docs:check`；真机 `open-project` + `drag-here`。
- **来源**：[vue3-migration-plan.md](./vue3-migration-plan.md) 阶段 5 表。

## C1 — 收尾：拆除脚手架（白名单外为 0）

- **现状证据（2026-09-11 实测，判定来源 oxlint）**：三个口径先分清——**待迁移命中 160** 个文件（豁免指令仍在使用 = 真用了受限 API）、**豁免注释 295** 个文件、**陈旧豁免 135** 个（见 C2）；`.oxlintrc.json` **尚无**画布白名单 overrides（P8 目前只是文字约定）。
- **画布区实况（决定白名单范围的关键事实）**：`engine`/`scene`/`palette`/`particle`/`ui`/`animation` 共 **29 个文件**有 DOM 操作，但只有 **10 个**带豁免注释（其中 9 个仍命中、1 个已陈旧）；另外 **19 个**（如 `palette/palette-pointer.ts`、`scene/scene-events-pointer.ts`、`ui/ui-pointer.ts`、`animation/animation-pointer.ts`）只用 `appendChild`/`addEventListener`/`parentNode` 等**不在 lint 规则内**的 API，无需豁免，也不影响"白名单外为 0"。
- **白名单候选（10 个带注释文件逐个人工分级）**：
  - ✅ **A 类·真画布上下文（建议白名单，4 个）**：`engine/webgl/webgl-init.ts`、`engine/webgl/webgl-methods.ts`、`engine/palette/palette-engine.ts`、`engine/scene/draw-start-position.ts`（文本测量 canvas）——都是 `document.createElement('canvas')` 取上下文/像素读回，模板无法替代。
  - 🧹 **已陈旧（1 个，走 C2）**：`engine/webgl/texture.ts`——它的 `document.createElement('canvas')` 位于**被注释掉的**调试 `view()` 实现里，oxlint 判定豁免指令未被使用；删注释即可，若恢复该调试能力再评估白名单。
  - ❓ **B 类·画布式交互区的命令式 DOM（需二次确认，4 个）**：`animation/animation-timeline.ts`（时间轴刻度）、`animation/animation-motion.ts`（运动曲线节点）、`palette/palette-initialize.ts`（画布选区标记，`renderElement` 模式）、`palette/auto-tile.ts`（自动图块列表行，`renderElement` 模式）。它们的 DOM 是可数据化的，但改造成本与收益需单独评估。
  - ❌ **C 类·不纳入白名单（属迁移债，1 个）**：`engine/layout/layout.ts`——`renderElement` 宿主、`document.querySelectorAll('.nav-item[value]')` / `('.page-frame[value]')`（palette 发现兜底）、`document.getElementById('project-browser')` 共 4 处，应继续按布局迁移推进。
- **落地步骤**：① `.oxlintrc.json` 的 `overrides` 增加白名单文件（`eslint/no-restricted-properties: "off"`）；② 删除这些文件的 `/* oxlint-disable eslint/no-restricted-properties */`；③ `scripts/dom-guard.mjs` 增 `WHITELIST` 常量，tracker 把「设计豁免」与「待迁移」分列；④ `scripts/docs-check.mjs` 增断言「白名单外待迁移命中 = 0」；⑤ 同步 README/计划口径。
- **验收标准**：① 白名单外待迁移命中归零；② `pnpm dom:guard:exempt` 退役（`tracker` 保留为报表）；③ `pnpm lint` 在无豁免注释下 0 警告 0 错误；④ 文档口径三方一致（tracker / README / 计划）。
- **预期目标数字**：A 类 4 个进白名单 → 待迁移命中 160 → 156；A + B（8 个）→ 152；`engine/layout/layout.ts` 保持为债。
- **验证命令**：`pnpm lint`、`pnpm dom:guard:tracker`、`pnpm docs:check`。
- **来源**：[vue3-migration-plan.md](./vue3-migration-plan.md)「收尾：拆除脚手架」。

## C2 — 删除 135 个陈旧豁免注释

> ✅ **已完成（2026-09-11，B0）**：`pnpm stale-exemptions --apply` 删除 **135 个文件 / 135 行**（跳过 0），随即自动复跑 oxlint → 0 警告 0 错误；tracker 口径区变为「待迁移命中 **160** / 豁免注释 **160** / 陈旧豁免 **0**」，`pnpm stale-exemptions --check` 退出码 **0**；两个测试套件复跑仍全绿（editor **1884/1884**、ui-kit **659/659**）。

- **现状证据（2026-09-11 实测，判定来源 oxlint）**：**295** 个文件带 `/* oxlint-disable eslint/no-restricted-properties */`，其中 **160** 个文件的豁免指令仍在使用（真命中），**135 个已无命中**（`oxlint --report-unused-disable-directives` 直接报告 "Unused oxlint-disable directive"）。分布上 `composables` 最集中（177 个带注释、其中仅 43 个仍命中 → ~134 处陈旧，多为一轮轮迁移后遗留的命令表单）；样例：`packages/editor/src/composables/commands/useBlockCommandSchema.ts`、`packages/editor/src/composables/useAngleGetterWindow.ts`、`packages/editor/src/composables/commands/useSetAngleCommandSchema.ts` 等。
- **为什么先做这条**：这是**纯注释删除、零运行时行为风险**，且能把"豁免面"从 295 收敛到 160，让 C1 的收尾口径真正可信（否则无法判断哪些注释是必要的）。
- **操作要点**：只删文件顶部那一行/那一块 `/* oxlint-disable eslint/no-restricted-properties */`，**不要误删**行内的 `// oxlint-disable-next-line <其它规则>`（例如 `no-explicit-any`、`no-unused-vars`）；权威待删清单直接用 `node node_modules/oxlint/bin/oxlint -c .oxlintrc.json --report-unused-disable-directives packages/editor packages/ui-kit` 生成（只取报告行文本含 `no-restricted-properties` 的条目，另有 ~31 个文件是**其它规则**的未使用指令，可顺带清理）。
- **执行器（已就绪，默认不改文件）**：`scripts/stale-exemptions.mjs` ——
  - 干跑：`pnpm stale-exemptions`（当前输出 **135 个文件**，与 tracker 口径一致）；
  - 预演：`pnpm stale-exemptions --simulate`（用与 `--apply` 同一套 strip 逻辑算出"将删几行"，不写盘；当前结果：**删 135 行 / 覆盖 135 个文件 / 跳过 0**）；
  - 门禁：`pnpm stale-exemptions --check`（仍有陈旧豁免 → 退出码 1；C2 完成后应为 0，可作为收尾校验）；
  - 执行：`pnpm stale-exemptions --apply`（删完**自动复跑 oxlint**；若有 error 则提示用 `git checkout -- packages` 回滚）；
  - 安全约束（已逐文件验证）：只删「独占一行」的块注释；这些文件内 **214 条其它规则的豁免指令**原样保留；**152 个文件带 BOM**，删除首行时 BOM 会让给新的首行；指令不在独占行时**跳过并报 SKIP**交人工处理。
- **验收标准**：① `pnpm dom:guard:tracker` 的口径区变为「待迁移命中 **160** / 豁免注释 **160** / 陈旧豁免 **0**」；② `pnpm lint` 仍 0 警告 0 错误（证明删的都是无命中的陈旧注释）；③ `pnpm stale-exemptions --check` 退出码 0；④ README/计划的三个数字同步为（160 / 160 / 0）。
- **验证命令**：`pnpm stale-exemptions --check`、`pnpm lint`、`pnpm dom:guard:tracker`、`pnpm docs:check`；建议顺带跑 `pnpm -F @yami/editor test` 与 `pnpm -F @yami/ui-kit test`。
- **回滚**：`git checkout -- packages`（纯注释删除，无运行时语义）。
- **来源**：2026-09-11 第七轮口径审计新登记（本轮先修了度量本身：正则漏计带类型实参的 `document.querySelector<T>(...)`，已改为「属性访问」计数并把命中判定改为 oxlint 权威口径）。

## E1 — 窗口事件面收口（34 事件名 / 265 监听点 / 16 自定义事件）

> 🚧 **部分完成（2026-09-11，B0）**：① 死事件 `attributechange` 已删（`attribute/attribute-window.ts` 的派发点）。`pnpm events:surface` 复测：事件名 **34 → 33**、自定义 **16 → 15**、**单侧事件「(无)」**（此前唯一的就是它）。余项 ②（自定义事件改强类型通道）③（`.vue` 监听配对）④（`mitt` 去留）待做。

- **复现命令**：`pnpm events:surface`（`scripts/event-surface.mjs`；只统计落在 `window` 上的监听与派发，且**含"变量形式"派发**——`const e = new Event('x'); window.dispatchEvent(e)`，这是纯按名字做正则最容易漏的一类）。
- **现状证据（2026-09-11 实测）**：`window.addEventListener` **265 处 / 92 文件**、`window.removeEventListener` **122 处**；事件名 **34 个**，其中**自定义 16 个**——`attributechange`、`datachange`、`dirchange`、`dprchange`、`enumchange`、`home-recent-update`、`localizationchange`、`localize`、`os-dragend`、`os-dragstart`、`script-change`、`themechange`、`update-log-update`、`variablechange`、`vue-app-mounted`、`yami:error`。载荷普遍靠**往 Event 对象上挂字段**传递（`datachange.key = 'teams'`、`themechange.value = theme`；见 `composables/useTeamWindow.ts:422`、`data/transition-window.ts:1201`、`title/title-bar.ts:387`）——无类型、无契约，监听方只能自己断言形状。
- **死事件 1 个**：`attributechange`——`attribute/attribute-window.ts:967` 有派发、全仓**无监听**，可直接删（`script-change` 一度被误判为死事件，实为 `plugin/plugin-parse-meta.ts:20` 以变量形式派发，仍在用）。
- **监听生命周期风险点**：**13 处**用内联匿名函数（无法 `remove`；11 文件，多数是 app 生命周期的单例，但 `components/toast.ts`、`ui-kit/.../YMFileHeadPane.vue` 属 UI 侧）；**5 个 `.vue`** 添加 window 监听却无 `remove`（`FileAudioPage`/`FileScriptPage`/`FileVideoPage`/`SceneActorPage`/`YMFileHeadPane`）——页面重挂时可能叠加监听。
- **替代品均未启用**：`mitt`（依赖里存在）**0 使用**、`@vueuse` 的 `useEventListener` **0 使用**、`window.on(` **0 处**——即计划 5.4「事件总线 → 响应式 + provide/inject + mitt」的映射**尚未开工**。
- **推进策略**：① 删 `attributechange`；② 16 个自定义事件改强类型通道（store action / mitt 事件表），去掉"往 Event 挂字段"；③ 5 个 `.vue` 的监听按 `onMounted`/`onBeforeUnmount` 配对（或统一 `useEventListener`）；④ 决定 `mitt` 去留（启用或从 `package.json` 移除）。
- **验收标准**：① `attributechange` 归零；② 自定义事件不再往 Event 挂字段；③ `.vue` 中"add 有、remove 无"归零；④ `pnpm lint` + `pnpm -F @yami/editor test` + `pnpm -F @yami/ui-kit test` 全绿；⑤ 真机冒烟：切主题、切语言、目录切换、文件 inspector 页面进出。
- **规模**：中（架构卫生，不属 DOM 迁移主线）；**优先级**：低-中。
- **来源**：2026-09-11 第二十五轮事件面审计（新脚本 + 新登记）。

## O1 — layout M6（可选）

- 若 Teleport 路径的拖拽竞争在更多真机场景下显脆弱，再评估「active-only 渲染 + 页面 state 外置」，逐页灰度（先非引擎页，scene/ui/animation/particle 最后）。见 [layout-vue-plan.md](./layout-vue-plan.md) M6。

---

## 覆盖面审计结论（2026-09-11）

> 2026-09-11 共核查 **24 个 DOM 耦合轴**，目的是回答"还有没有像 `$('#id')` 那样没进报表的债"。结论：**本轮未发现新类别**——新发现的四处（`$('#id')`、本地化器、元素 API、原型访问器）已分别登记为 P5b / R2b / P2b / P4b，其余轴或属已登记项的症状，或属合法用法，或已为 0。**新增写法请先加进这张表**（对应风险 R-8）。

| 轴 | 实测 | 判定 |
| --- | --- | --- |
| 受限 API（`document.*` 7 成员） | `getElementById` 244 处 / 待迁移命中 **160** 文件 | ✅ 唯一被 lint 门禁的轴 → C1 / C2 |
| `$('#id')` 反查 | **1489 处 / 239 文件**（B1/R1 后 1481；B4 批 1 后 **1347 / 238**） | ⚠️ **新登记** → P5b（此前不在报表内） |
| 本地化器选择器键（运行期放大） | `components` **2130** 键（2112 id + 18 name） | ⚠️ **新登记** → R2b（门禁已核对键数） |
| 鸭子式元素 API 调用 | **682 处 / 246 文件** | ⚠️ **新登记** → P2b（`*-api.ts` 26 件门禁） |
| 原型访问器（逗号形式） | **72 字段 / 144 访问器**（B3 前 83/166） | ⚠️ **新登记** → P4b（门禁已核对字段数） |
| 窗口事件面 | 265 add / 16 自定义事件 / 1 死事件 | ⚠️ **新登记** → E1（`pnpm events:surface`） |
| `style.*` 赋值 | 336 处 / 78 文件 | 计数（辅助口径）；多为画布/布局测量，属 C1 白名单讨论范围 |
| `.children` 遍历 | 229 / 73 | 计数；随 P5b / B1 下降 |
| `hasClass()` 读 class 当状态 | 215 / 51 | 计数；class-as-state 的症状 → C1 / P5 与 tree 步骤 5b 的 class 收口 |
| `textContent` 赋值 | 145 / 45 | 计数；随 P6 / B1 渲染层改造下降 |
| `classList.add/remove/toggle` | 134 / 43 | 计数；tree 5b 已收口一部分 |
| `clientWidth/Height`·`scrollTop=`·`offsetWidth/Height`·`getComputedStyle`·`rect()` | 139 / 84 / 6 / 6 / 73 | **合法优先**（画布与虚拟滚动必须测量）；仅在组件内出现时随改造下降 |
| `get/set/removeAttribute` | 87 / 36（属性名 top：`value` 45） | 计数；`value` 是布局/页签契约（附录 D 明确），其余为零散用法 |
| `parentElement`·`closest()`·`next/prevElementSibling` | 47 / 28 / 22 | 计数；DOM 反查类，随 P5b 消费方迁移下降 |
| `element.append/prepend` | 20 / 15 | 计数；主要来自 R1 的字符串模板列表 |
| `nodeValue` 赋值 | 6 / 3 | 计数；文本直写残迹（tree 文本桥已覆盖大部分） |
| `innerHTML` 赋值 | 2 / 2 | 计数 → R1 |
| 动态 id（模板串 `$(\`#${…}\`)`） | 78 处 / 24 文件 | 计数；阶段 3 有意保留的动态 id |
| `dataset.*` 当状态 | **0** | ✅ 无（R-8 监测位，保持 0） |
| `localStorage` / `sessionStorage` | **0** | ✅ 无（布局门控 `YM_LAYOUT_VUE_RENDER` 已删） |
| CSS 变量内联写入（`style.setProperty`） | **0** | ✅ 主题走 class 而非内联变量 |
| `window.__*` 源码内全局挂载 | **0** | ✅（`index.html` 的引导变量不在扫描范围，且受 `global-mounting.spec.ts` 审计） |
| `customElements.define` / `attachShadow` / `replaceChildren` / `insertAdjacentHTML` / `matches()` | **0** | ✅ 与阶段 4 / 阶段 7 结论一致 |
| `Element.prototype` 全局扩展 | 1 处（`element-data.ts`，即 P4b） | ⚠️ 已登记 |

---

## 口径与刷新

- 扫描矩阵：`pnpm dom:guard:tracker` → [dom-migration-tracker.md](./dom-migration-tracker.md)（自动生成，禁止手改）。
- 文档门禁：`pnpm docs:check`（10 项：断链 / 路径 / spec / 口径三方一致 / 清单结构 / 章节引用 / 测试基线 / 本地化键数 / `*-api.ts` 数 / `DATA_FIELDS` 数 / 计划覆盖）。
- 专项报表：`pnpm events:surface`（E1 窗口事件面）、`pnpm stale-exemptions --check`（C2 门禁，完成后应退出 0）。
- 一次性扫描（口径写在对应条目里，便于复核）：P2b 的鸭子调用 = `/\?\.\s*(?:loadItems|setItemNames|write|read|enable|disable|relate|bind|update|select|unselect|focus|getFocus|refresh|setTitle|open|close|insert|toggle)\?*\.?\(/g`；P4b 的 `this.<字段>` = `/\bthis\.(字段1|字段2|…)\b/g`（字段表取 `element-data.ts` 的 `DATA_FIELDS`）。
- 测试基线（2026-09-11 实跑）：ui-kit **97 文件 667/667**；editor **221 文件 1927/1927**（B0–B4 批 4 改动后的最新实跑值；B4 批 2/3/4 共新增 8 个 registry 回归 spec，最新为 `command-form-registry`——它断言「挂载后控件确实拿到了选项」，直接证明注册表链路有效）。
