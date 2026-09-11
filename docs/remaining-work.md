# 收尾工作清单（Phase 15）

> 把四份计划里散落的「剩余 / 待办」收敛成一份**可执行清单**：每条给出「现状证据（实测）→ 验收标准 → 验证命令 → 涉及文件 → 依赖」。
> 口径：状态为 **2026-09-11 实测**；任何一条被推进后，请同步本文件与来源文档，并跑 `pnpm docs:check`（见 [README.md](./README.md)）。
> 反模式编号（P1–P8）与阶段编号（阶段 1–6）见 [vue3-migration-plan.md](./vue3-migration-plan.md)。

## 速览

| ID | 事项 | 规模 | 依赖 | 状态 |
| --- | --- | --- | --- | --- |
| T5b | tree 步骤 5b：`elements` shim / `item.element` / `NodeElement` 收口 | 中 | 先迁移 4 处按 DOM 访问的消费方 | 未开始 |
| T1b | tree 步骤 1 剩余缺口：PageUp/PageDown 行为 + 1000+ 节点性能基准 | 小 | 需先定义键位语义 | 未开始 |
| L1 | layout region 左/上/下方向真机走查 | 小 | 构建产物 + 可打开的真实项目 | 部分完成（右缘已过） |
| S1 | 数据绑定型窗口逐窗真机冒烟（19 个树列表） | 中 | 窗口需可达（加速键/菜单） | 部分完成（8/19 已核对） |
| R1 | `module/resource.ts` 资源列表数据化（`innerHTML` + `DOMParser` 字符串模板 + 按 id 反查） | 中 | 无 | 未开始（规模由小改判） |
| R2a | i18n 启动副作用：`initI18n` 的 3 处 `document.*` 查询（`[name=confirm/cancel]` 写 hotkey、`#menu` 加 `.visible`） | 小 | 无 | 未开始 |
| R2b | **选择器式本地化器**：`localizeDomComponents` 按语言文件的 **2130** 个键在启动时逐键做 DOM 查询（2112 按 id + 18 按 name） | 大 | 需先确认 i18n 迁移口径（`t()` / props） | 未开始（**此前被记为"小"**） |
| R3 | ~~死代码清理：`stores/layout.ts` 的 `switchLayout` 死转发 + `Layout`/`Window` 的 `afterChange` 未赋值钩子~~ | 小 | 无 | ✅ **已完成**（B0，2026-09-11：8 点全删） |
| P5b | `$('#id')` 反查退役（element-utils 的 jQuery 风格寻址，**1489 处 / 252 文件**） | 大 | 需按模块分批，先度量后动手 | 未开始（**此前不在任何报表内**） |
| P2b | **ui-kit 元素 API 收尾**：`*-api.ts` 文件 **26** 个（21 个调用 `attachApi`）+ `utils/attach-api.ts` 退役，调用方改用类型化组件 API | 大 | 与 P5b 的「组件 API」桶合并排序 | 未开始（**此前不在任何报表内**） |
| P4b | **原型访问器退役**：`utils/element-data.ts` 在 `HTMLElement.prototype` 上定义 **83** 个字段的 get/set（共 166 访问器），由 `main.ts` 副作用导入 | 中 | 与 P2b 同批（同属 ui-kit 元素 API） | 未开始（**此前不在任何报表内**） |
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
| 主计划 阶段 4 原型扩展与工具层回收（P4 + P5） | ⚠️ **部分**：五处 monkey-patch 已删；`$()` 1489 处未删、`element-data` 83 个原型访问器仍在、i18n/localize 未收 | **P4b** / **P5b** / **R2a** / **R2b** | tracker `dollarLookup` 列 + 辅助口径「prototype 访问器定义」+ 本地化键数门禁 |
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
| **B1 小收口** | R1（资源列表数据化）→ R2a（i18n 启动副作用）→ T1b（PageUp/PageDown 行为 + 1000+ 基准） | 无 | R1 `resource.ts` 667 行 + `Resource.vue`；R2a `i18n/index.ts` 3 处；T1b keydown + 基准脚本 | `editor/module` 的 `innerHTML` **1 → 0**、`DOMParser` **1 → 0**；`editor/i18n` 查询 **3 → 0**；tree 用例 **+2~4**（含基准数据） | 各自单提交 revert |
| **B2 tree 收口** | **T5b**：4 组消费方迁移 → 删 `elements` shim / `item.element` / `NodeElement` / `clearTreeItemText` → 收口 class 直写；**顺带修 `element.group` 幽灵属性** | 无（方案含实测行号） | ~12 个源文件 + 3 个 spec（17 处断言改写） | `ui-kit/components` 与 `editor/tools` 命中下降；`item.element` 引用 **17 → 0**；**1 处行为变更**（菜单勾选开始显示） | 4 步各自 revert；渲染路径与数据层未动 |
| **B3 元素 API 与原型** | **P2b + P4b 合并**：按组件把鸭子调用收敛为类型化 expose + props/emits → 删 `*-api.ts` → 删 `attach-api.ts`；随后删 `DATA_FIELDS` 原型访问器（先删 11 个死字段） | 依赖 B2 的 expose 手法经验；与 **P5b 批次 1–3 同批评审**（R-11） | `*-api.ts` **26 文件**（41 个 importer）；`element-data.ts` **83 字段 / 166 访问器**（`this.<字段>` 近似 **774 处 / 123 文件**） | 门禁：`*-api.ts` **26 → 0**、`DATA_FIELDS` **83 → 0**；鸭子调用 **682 → 0**；tracker 辅助口径「prototype 访问器定义」**1 → 0** | 按组件粒度 revert；先删死字段那一刀可单独回滚 |
| **B4 `$()` 退役** | **P5b 四批**：批次 1 `components/tools`（136 处 / 2 文件）→ 批次 2 `components/commands`（153 / 27）→ 批次 3 `inspector`+`tools`+`attribute`+`enum`（267 / 46）→ 批次 4 非 SFC 模块（~900） | 批次 1 无需依赖；批次 3 的 `attribute`/`enum` **与 B2 合并**；批次 4 依赖 B3 的 store 化手法 | 合计 **1489 处 / 239 文件** | tracker `dollarLookup`：**1489 → 批次 1 后 1353 → … → 白名单内**；每批后 `git diff` 的模块分布应与本表一致 | 每批独立提交 revert |
| **B5 i18n 工程线** | **R2b**：按承载者给 2130 个键分类 → 先迁 Vue 承担部分 → 目标元素自注册 → 语言文件不再以选择器为键 | 依赖 B4 批次 1–2 的模板 ref 化经验 | `Localize` 3 处源码 + 2 个语言文件（2130 / 2131 键）+ 承载组件 | 门禁：本地化 `components` 键数**下降曲线**（每批更新文档数字）；`editor/localize` 豁免删除 | 语言文件与代码同批提交，可 revert |
| **B6 巨石** | **B1 的 M1 → M5**：先补组件级用例（12 + 5 → ~40+，含 `eslints` 缩进线）→ 派生层（接口草案已就绪）→ 模板换源 → 消费方迁移 → 清理 | M1 可独立做；M3 起需 M1/M2 完成 | `command-api.ts` 2609 + `YMFileBodyPane.vue` 2327 + 各自 core/模板；`eslints.ts`、`CommandList.vue`、`stores/browser.ts`、`stores/selector.ts` | 组件级用例 **17 → 40+**；两文件受限 API 命中 **17 / 3 → 0**；`*-api.ts` 里 command/tree/file 等大件随 P2b 一并归零 | 每步一个 PR；M3 之前可随时停 |
| **B7 真机与收尾** | L1（region 左/上/下真机）→ S1（余下 11 个窗口）→ C1（`.oxlintrc.json` 白名单 + 删豁免机制 + `dom:guard:exempt` 退役） | C1 需"白名单外待迁移 = 0" | L1/S1 无源码改动（`smoke-layout.mjs` + 人工）；C1 改 lint 配置 + 4~8 个白名单文件 | 待迁移命中 **160 → 156（A 类 4 个）或 152（A+B）**；豁免机制退役；tracker 增加「设计豁免」分列 | C1 的配置改动单独提交，revert 即回到当前口径 |
| **并行/旁路** | E1 余项（自定义事件改强类型通道、`.vue` 监听配对、`mitt` 去留）、O1（layout M6 评估） | 不阻塞主线 | E1：16 个自定义事件 + 5 个 `.vue` + 13 处内联匿名 | `pnpm events:surface` 的"单侧事件""未配对 .vue"归零 | 按事件逐个提交 |

**批次纪律**：① 每批开工前跑一次 `pnpm dom:guard:tracker` 与 `pnpm docs:check` 记录基线；② 收尾时把该批的指标变化**写回本表与 README 快照**（门禁会拦数字不一致）；③ 任何一批若让 tracker 出现"本不该变"的口径变化，先当误删处理。

---

## T5b — tree 步骤 5b：`elements` shim / `item.element` / `NodeElement` 收口

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

- **现状证据（2026-09-11 复核后升级）**：`packages/editor/src/module/resource.ts`（667 行）的**整段资源列表是字符串模板命令式构建**——`load()`（L653-660）先 `this.content.innerHTML = ''`（`content` 是 `$('#resource-content')`，见 L34-35），再对每个资源调 `temp(val)`（L421 起）：`new DOMParser().parseFromString(...)`（L442）解析一段 HTML、`this.content.append(boxDom)`（L465）、随后按 **动态 id/class 反查**（10 处 `querySelector`，如 `#resource-item-${value}-download`）并直接调元素 API（`write`/`disable`/`enable`/`on`）。宿主是 Vue 页 `Resource.vue` 的 `<div class="box" id="resource-content">`（L38）。所以这不是"删一行 `innerHTML`"，而是一次**小型列表数据化**（规模由「小」改判为「中」）。
- **验收标准**：资源列表改为数据驱动（`v-for` + 行数据），行内交互走组件 props/emits 或 expose API；删除 `innerHTML = ''` 与按 id 反查，移除该文件的 `oxlint-disable` 豁免；tracker 中 `editor/module` 的 `innerHTML` / `domParser` 列归零。
- **验证命令**：`pnpm -F @yami/editor test`、`pnpm dom:guard:tracker`、`pnpm docs:check`；真机打开资源窗口核对列表渲染与下载/删除按钮。
- **来源**：[vue3-migration-plan.md](./vue3-migration-plan.md) 阶段 5 表；2026-09-11 第十二轮复核（发现 `DOMParser` 构建路径不在原度量内）。

## R2a — i18n 启动副作用（3 处 DOM 查询）

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

- **现状证据（2026-09-11 实测）**：`packages/editor/src/utils/dom.ts` L147-157 的 `$` 仍有 **1489 处调用**、分布在 **239 个文件**（形如 `$('#if-condition-type')`、`targets: [$('#…')]`；判定正则 `\$\(\s*['"\x60]#`，其中 `\x60` 是反引号）。模块分布：`components` 722、`inspector` 168、`commands` 153、`tools` 79、`animation` 48、`title` 40、`scene` 36、`palette` 29。热点文件：`components/tools/IfCondition.vue` 78、`SetNumberOperand.vue` 58、`commands/SetString.vue` 44、`animation/animation-window.ts` 24。
- **为什么单列**：`$` 走的是 `document.querySelector/getElementById` 包装，但**不在 lint 规则内**（规则只限 `document.*` 的 7 个成员），所以既不计入「待迁移命中 160」，也不会被 C1 的"白名单外为 0"覆盖——**这是与 160 并行的第二条债轴（P5）**，此前在任何报表里都看不到。`vue3-migration-plan.md` 阶段 4 的改造清单里明确写了「`$()` 选择器删除」，但阶段 4 记为完成时并未清零此项。
- **同轴的其他未门禁耦合（2026-09-11 全类审计，见 tracker `## 辅助口径`）**：`style.*` 赋值 336 处 / 78 文件、`.children` 遍历 229/73、`textContent=` 145/45、`clientWidth/Height` 读取 139/40、`classList.add/remove/toggle` 134/43、`scrollTop=` 84/39、`parentElement` 47/46、`closest()` 28/13、`next/prevElementSibling` 22/7、`append/prepend` 20/15、`nodeValue=` 6/3；而 `replaceChildren`、`insertAdjacentHTML`、`matches()`、`customElements.define`、`attachShadow`、原型扩展均为 **0**（阶段 4/7 的结论得到复核）。
- **推进策略（先度量后动手，按模块分批）**：① 以 tracker 新增的 `dollarLookup` 列逐模块销账（components → inspector → commands → tools → animation/title/scene/palette）；② 每处替换为四类之一——模板 `ref`、组件 `expose` API、store 数据查询、树/列表行 API（阶段 3/4 已有成套先例）；③ 终态删除 `dom.ts` 的 `$`（并评估同文件 `show/hide/css/addClass` 等 jQuery 风格工具）。**注**：其中"组件 `expose` API"那一类（约 247 行）需要 **P2b**（元素 API 退役）先给出类型化组件 API，否则只是把 `$('#x')` 换成 `ref.value`，鸭子调用不变——两线应同批评审。
- **验收标准**：① `pnpm dom:guard:tracker` 的 `dollarLookup` 列从 **1489** 降到画布白名单内；② 每批替换后 `pnpm -F @yami/editor test` + `pnpm lint` 全绿；③ 文档口径三方一致（tracker / README / 计划）。
- **验证命令**：`pnpm dom:guard:tracker`、`pnpm -F @yami/editor test`、`pnpm lint`、`pnpm docs:check`。
- **来源**：2026-09-11 第十二轮度量审计（此前该轴完全不在报表内；已并入 tracker 的「口径」区）。

### P5b 模块级进度表（2026-09-11 基线，合计 1489 处 / 239 文件）

| 模块 | 处数 | 文件数 | 批次 | 状态 |
| --- | --- | --- | --- | --- |
| `editor/components` | 722 | 111 | 批次 1–2 | 未开始 |
| `editor/inspector` | 168 | 38 | 批次 3 | 未开始 |
| `editor/commands` | 153 | 27 | 批次 2 | 未开始 |
| `editor/tools` | 79 | 6 | 批次 3 | 未开始 |
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
| `editor/attribute` | 11 | 1 | 批次 3（与 T5b 的 #1/#2 同文件，建议合并做） | 未开始 |
| `editor/enum` | 9 | 1 | 批次 3（同上） | 未开始 |
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
- **验收标准**：① `*-api.ts` 由 **26 → 0**；② `attach-api.ts` 删除、其 41 个 import 清零；③ 鸭子调用从 **682 处**归零（或降到有白名单说明的少量）；④ `pnpm -F @yami/ui-kit test` + `pnpm -F @yami/editor test` + `pnpm lint` + typecheck 全绿；⑤ 文档口径（现状总览的 api 文件数）同步为 **0**。
- **验证命令**：`pnpm -F @yami/ui-kit test`、`pnpm -F @yami/editor test`、`pnpm lint`、`pnpm dom:guard:tracker`、`pnpm docs:check`。
- **来源**：2026-09-11 第二十三轮度量审计（阶段 2 验收条件未达成且未登记；`docs/vue3-migration-plan.md` 阶段 2 段已补完成度更正）。

## P4b — 原型访问器退役（`utils/element-data.ts`）

- **现状证据（2026-09-11 实测）**：`packages/editor/src/utils/element-data.ts`（119 行）把元素数据搬进 `WeakMap`（这一步本身是对的：不再往 DOM 元素自身上复写属性），但**访问语法仍依赖全局原型访问器**——`defineDataAccessors()` 对 `DATA_FIELDS` 的 **83** 个字段逐个 `Object.defineProperty(HTMLElement.prototype, field, { get, set })`（合计 **166 个访问器**），并在 `packages/editor/src/main.ts:7` 以副作用方式导入生效。模块注释自述："数据不污染 DOM 元素…通过原型访问器透明迁移——`el.dragging` 等读写自动走 WeakMap（挂载/读取处零改动）"。
- **为什么此前没被记到**：tracker 的 `protoExt` 模式要求 `prototype` 后跟**点**（`…\.prototype\.`），而这里是 `Object.defineProperty(HTMLElement.prototype, field, …)` 的**逗号形式**，因此长期显示为 0。本轮已在 tracker 的「辅助口径」新增列「prototype 访问器定义（逗号形式）」把它暴露出来（当前 **1 处 / 1 文件**）。
- **调用面（近似，2026-09-11 实测）**：`this.<83 字段之一>` 命中 **774 处 / 123 文件**（`this` 多为元素接收者；热点：`YMCommandList/command-api.ts` 134、`YMTreeList/tree-api.ts` 32、`scene/scene-events-pointer.ts` 23、`tools/text-capture.ts` 23、`data/transition-window.ts` 21）。**注意**：83 个字段里混有大量通用名（`key`/`mode`/`target`/`start`/`end`/`active`/`count`/`page`…），文本检索**无法区分**"元素数据"与"普通对象状态"，因此迁移必须按组件逐个确认，不能全局替换。
- **可立即做的第一步**：**11 个字段零访问**——`conditionIcon`、`eventEnabled`、`hiddenState`、`lockState`、`groupText`、`attrKey`、`annotated`、`initText`、`attrValue`、`relationMark`、`collisionMark`——可直接从 `DATA_FIELDS` 删除（纯删定义、零风险），跑测试确认即可。
- **推进策略**：① 先删 11 个死字段；② 按组件把 `this.x` / `el.x` 改为显式 API（模块已导出 `getElementData(el)`；与 **P2b** 的元素 API 收尾同批做最省事）；③ 每组件一个提交 + 真机冒烟；④ 终态删除 `defineDataAccessors()` 与 `main.ts` 的副作用导入——届时 P4 的验收「全仓无 `HTMLElement.prototype` 扩展」才真正成立。
- **验收标准**：① `DATA_FIELDS` 与 `defineDataAccessors` 消失，tracker 新列「prototype 访问器定义（逗号形式）」= **0**；② `pnpm -F @yami/ui-kit test` + `pnpm -F @yami/editor test` + `pnpm lint` + typecheck 全绿；③ 真机冒烟覆盖依赖"元素上存状态"的交互：树列表拖拽/多选、命令行折叠与选区、场景指针、文本捕获。
- **验证命令**：`pnpm -F @yami/ui-kit test`、`pnpm -F @yami/editor test`、`pnpm lint`、`pnpm dom:guard:tracker`、`pnpm docs:check`。
- **来源**：2026-09-11 第二十四轮度量审计（P4 的"改头换面"形态；`docs/vue3-migration-plan.md` 阶段 4 的验收表述同步更正）。

### 批次 1 执行清单（`components/tools` 两文件，136 处）

**站点分布（2026-09-11 实测，按形态互斥归类）**

| 文件 | 处数 | 组件 API 调用 `$('#x')?.m(` | 作为实参 `targets: [$('#x')]` | 句柄捕获 `const x = $('#x')` | 其它（多为数组换行续行） |
| --- | --- | --- | --- | --- | --- |
| `packages/editor/src/components/tools/IfCondition.vue`（811 行） | **78** | 18 | 32 | 1 | 19 |
| `packages/editor/src/components/tools/SetNumberOperand.vue` | **58** | 9 | 22 | 1 | 25 |

**关键事实（决定改造难度）**

- `IfCondition.vue` **已经有 ref 注册表**：`fieldEls: Map<string, FieldControl \| null>` + `fieldRef(id)`（L434-438），模板里每个控件都挂了 `:ref="fieldRef('if-condition-x')"`（L15/22/30/36/…）——但脚本里仍用 `$('#if-condition-x')` 取元素，**注册表实际未被消费**。所以这个文件的最小改造是"把 78 处 `$()` 换成读注册表"，无需新增模板改动。
- `SetNumberOperand.vue` **没有注册表**（0 处 `fieldRef`，模板是 `<SelectBox id="setNumber-operation" v-focus />`）→ 需先照 `IfCondition.vue` 的形态补 `fieldRef` + `:ref`（约 11 个控件），再替换 58 处。
- 目标组件侧**不需要等 P2b**：`YMSelectBox.vue` 的 `defineExpose` 已包含 `loadItems`、`setItemNames`、`enableHiddenMode`、`relate`、`toggleRelatedElements`、`enableElement`、`disableElement`、`on`、`root`、`initializeApi`（L172-196）。

**替换配方（逐形态）**

1. **句柄捕获**：`const typeEl = $('#if-condition-type')` → `const typeEl = fieldEls.get('if-condition-type')`（IfCondition）/ 新增 `ref`（SetNumberOperand）；类型从 `FieldControl` 扩为"组件实例 + `root`"（过渡期可 `as unknown as`，最终由 P2b 给类型化接口）。
2. **组件 API 调用**：`typeEl.loadItems([...])`、`typeEl.enableHiddenMode().relate([...])` → 实例方法直调（已 expose）；保留可选链语义（窗口未挂载时原 `$()` 返回 `null`，改造后 `fieldEls.get()` 同样可能为 `undefined`）。
3. **作为实参**：`targets: [$('#a'), $('#b')]` → `targets: [fieldEls.get('a')?.root, fieldEls.get('b')?.root]`——`relate`/`toggleRelatedElements` 按**元素**切 `display`，所以这里仍要元素；**终态**（并入 P2b）是让这些目标控件改收 `hidden`/`enabled` props，由数据驱动显隐，彻底去掉"传元素"。
4. **其它（数组续行）**：随所属 `targets` 数组一并处理。

**验收与复现**

- 复现清单：`grep -n "\$('#" packages/editor/src/components/tools/IfCondition.vue`（78 处）与同命令作用于 `SetNumberOperand.vue`（58 处）。
- 验收：① `pnpm dom:guard:tracker` 的 `dollarLookup` 在 `components/tools` 归零（模块表 `editor/components` 处数下降）；② `pnpm -F @yami/editor test` 全绿；③ **真机核对联动**：切换 If 条件类型（boolean/number/string/object/actor/…）时对应"操作数/操作/常量"控件的显隐与启用态与改造前一致；SetNumber 的 operand 切换同理。
- **注意**：这批改造后鸭子调用仍在（变成 `fieldEls.get('x')?.loadItems?.()` 或 `ref.value?.loadItems?.()`），**682 处的清零仍属 P2b**——见风险 R-11，两批建议连续做。

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
| `$('#id')` 反查 | **1489 处 / 239 文件** | ⚠️ **新登记** → P5b（此前不在报表内） |
| 本地化器选择器键（运行期放大） | `components` **2130** 键（2112 id + 18 name） | ⚠️ **新登记** → R2b（门禁已核对键数） |
| 鸭子式元素 API 调用 | **682 处 / 246 文件** | ⚠️ **新登记** → P2b（`*-api.ts` 26 件门禁） |
| 原型访问器（逗号形式） | **83 字段 / 166 访问器** | ⚠️ **新登记** → P4b（门禁已核对字段数） |
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
- 测试基线（2026-09-11 实跑）：ui-kit 96 文件 659/659；editor 210 文件 1884/1884。
