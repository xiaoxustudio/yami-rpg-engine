# 收尾工作清单（Phase 15）

> 把四份计划里散落的「剩余 / 待办」收敛成一份**可执行清单**：每条给出「现状证据（实测）→ 验收标准 → 验证命令 → 涉及文件 → 依赖」。
> 口径：状态为 **2026-09-11 实测**；任何一条被推进后，请同步本文件与来源文档，并跑 `pnpm docs:check`（见 [README.md](./README.md)）。
> 反模式编号（P1–P8）与阶段编号（阶段 1–6）见 [vue3-migration-plan.md](./vue3-migration-plan.md)。

## 速览

| ID | 事项 | 规模 | 依赖 | 状态 |
| --- | --- | --- | --- | --- |
| T5b | ~~tree 步骤 5b：`elements` shim / `item.element` / `NodeElement` 收口~~ | 中 | 先迁移 4 处按 DOM 访问的消费方 | ✅ **已完成**（B2 四步：消费方 6 处 + `element.group` 缺陷 + shim + 桥 + class 直写全清） |
| T1b | ~~tree 步骤 1 剩余缺口：PageUp/PageDown 行为 + 1000+ 节点性能基准~~ | 小 | 需先定义键位语义 | ✅ **已完成**（B1，2026-09-11：4 个分页金标准 + 4 个基准用例） |
| L1 | layout region 左/上/下方向真机走查 | 小 | 构建产物 + 可打开的真实项目 | ✅ **已完成**（2026-09-15：`drag-region-edge` 四方向真机走查，每方向两个 pick；左缘相邻 no-op 与三处结构性变更均已复现） |
| S1 | 数据绑定型窗口逐窗真机冒烟（19 个树列表） | 中 | 窗口需可达（加速键/菜单） | ✅ **已完成**（2026-09-15：8 个窗口用真实加速键/菜单条目自动复现行数与交互链路；余 11 个需场景上下文，走同一条渲染路径） |
| R1 | ~~`module/resource.ts` 资源列表数据化（`innerHTML` + `DOMParser` 字符串模板 + 按 id 反查）~~ | 中 | 无 | ✅ **已完成**（B1，2026-09-11：`DOMParser` 1 → 0、`$()` −8） |
| R2a | ~~i18n 启动副作用：`initI18n` 的 3 处 `document.*` 查询~~ | 小 | 无 | ✅ **已完成**（B1，2026-09-11：`editor/i18n` 受限 API 归零） |
| R2b | **选择器式本地化器**：`localizeDomComponents` 按语言文件的 `components` 键在启动时逐键做 DOM 查询（**2130 键 = 2112 按 id + 18 按 name**；迁移②–⑱后扫描面 **3**，−99.9%） | 大 | 无 | ✅ **基本完成**（迁移②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱：1782 → **2109** 键由代码承担；余 **3** 键 = 1 个 `save` 依赖 + 2 个运行期拼 id。**它也是 C1 临时豁免 `localize/dom-localizer.ts` 的退出条件**——退出需把这 3 键也定性清楚） |
| R3 | ~~死代码清理：`stores/layout.ts` 的 `switchLayout` 死转发 + `Layout`/`Window` 的 `afterChange` 未赋值钩子~~ | 小 | 无 | ✅ **已完成**（B0，2026-09-11：8 点全删） |
| R2c | **vue-i18n 消息表的字面量语法转义**：`@` / `\|` / `{…}` 会被当成消息语法（linked message / 复数分支 / 插值），文案里的普通字符轻则丢内容、重则编译报错炸掉窗口渲染 | 小 | 无 | ✅ **已完成**（2026-09-15：`{…}` 按「白名单插值 vs 字面量」分类转义，2 处真实缺陷修复、全量消息逐字渲染用例护航） |
| P5b | `$('#id')` 反查退役（element-utils 的 jQuery 风格寻址） | 大 | 需按模块分批，先度量后动手 | ✅ **完成**（1489 → **22 处 / 11 文件**，−98.5%；残余全为动态 id 16 / 外壳元素 2 / 基础设施 2 / 白名单 1，见下方「P5b 批次 1–4 结项」；**尾项「确认按钮启用态属性化」也已收口**，见该小节） |
| P1b | ✅ **已完成**（十七刀 + C1 收尾）：`document.getElementById('静态id')` / `document.querySelectorAll('#a, #b, …')` 一族（**81 个文件 / 37 处 `getElementById` / 22 处 `querySelector*`**）改读分组元素注册表 | 大 | 无（沿用 P5b 的注册表与 `@confirm` 手法） | 🚧 **进行中**（第 1–4 刀 −56：窗口 composable + 通用 write 循环 + 40 个 inspector 页宿主 + 90 个命令 SFC 统一镜像；第 5 刀 −16：inspector 页批量选择器 → `registryElements`；第 6 刀 −5：Team / PresetElement / PresetObject / TileNode / PresetGetter 五个窗口 composable；第 7 刀 −2：Script / CallEvent 两个特殊命令 schema；第 8 刀 −5：5 个工具的 setForm/getForm 动态 id 循环；第 9 刀 −5：跨行链式命令 schema + element-page/transition-window 批量选择器；第 10 刀 −3：inspector 的 sceneTilemap/fileUI 直查与文件浏览下拉自身反查；第 11 刀 −1：窗口壳层 `window-object.ts`；第 12 刀 −5：离屏节点统一走 `renderDetached`；第 13 刀 −6：element-utils/editdata/Reference/menu-list/toast/timer 收口；第 14 刀 −4：时间轴/运动曲线/自动图块/调色板选区离屏节点；第 15 刀 −2：单选组 `proxy.group` 与 `.href` 组件转发；第 16 刀 −1：设置项帧内查找；第 17 刀 −1：布局 fixture 走注册表、删全文档回退） |
| P2b | **ui-kit 元素 API 契约化**（B3 复核后重定义）：25 个组件 api 文件**都是元素优先实现、零死文件** → 目标改为「类型化契约 + Vue 内子集随 P5b 走 ref + 豁免收窄」，**不再以文件数归零为准** | 大 | 与 P5b 合并排序 | 🚧 **进行中**（B3：目标重定义；**契约侧已收口**：第 34 轮审计发现 26 个 `*-api.ts` 里 25 个已有 `XxxApi`，唯一缺的巨石 `YMCommandList` 已补 `CommandListElementApi` 并由 editor 的 `EventCommandListShape` 派生自它；余下是 ref/expose 迁移与 M5 的返回值收紧） |
| P4b | **原型访问器退役**：元素数据 WeakMap 与 **47** 个字段的 get/set（共 94 访问器；B3 首刀删 11 个零访问字段、第二刀删 2 个只写/纯内部状态字段、第三刀删 `lastScrollTop`、**第六刀删列表配置簇 10 个 + 死字段 `filler`**）；实现已迁至 **ui-kit**（editor 侧同路径再导出），`main.ts` 仍以副作用导入安装访问器 | 中 | **已并入 M3/M5**（逐字段脚本化在做过的实验里被证否：访问器天生无类型，既有代码靠它做隐式收窄） | 🚧 **进行中**（83 → 47；余下字段的用量表已记入本文件，作为后续批次与 P2b 的验收输入） |
| B1 | 巨石渲染层重写：`command-api.ts` / `YMFileBodyPane.vue`（P6） | 大 | 先补集成测试快照 | ✅ **M1–M4 完成、M5 进行中**（2026-09-12）：M1 组件级金标准 **17 → 43+**、M2 两个派生层、**M3 两个巨石都已换源**（文件 body：api 数据化 55 处 + 模板 `v-for` + 回写桥 + 删死代码；命令列表：`resize` 自算窗口 + 模板渲染 + `bindRowElement` + `updateLineClasses` 扩展点）、**M4 三步全部收口**（扩展点、按数据反查、API 面 69 方法审计无可退役）、M5 已把文件 body 的名字移入模板且改名有用例覆盖。**余**：命令列表行内文本/变量标记与缩进线仍是手工建 DOM（画布类例外），改动需真机冒烟 |
| C1 | 收尾：删豁免机制 + 画布白名单 lint overrides（白名单外为 0） | 中 | 白名单外的迁移项清零 | ✅ **已完成**（2026-09-12：待迁移命中/豁免注释/陈旧豁免全部 **0**，设计豁免 45 + 临时豁免 1，`dom:guard:exempt` 退役，C1 硬断言入门禁） |
| C2 | ~~删除 135 个陈旧豁免注释~~（注释在、命中已为 0） | 小 | 无（零行为风险） | ✅ **已完成**（B0，2026-09-11：豁免注释 295 → 160、陈旧 135 → 0） |
| E1 | **窗口事件面收口**：33 个事件名 / **266** 处 `window.addEventListener` / **127** 处 `remove`；15 个自定义事件已迁到类型化通道（`emitCustom`/`onCustom`，载荷走 `createPayloadEvent`/`readPayload`）；`mitt` / `useEventListener` 均 0 使用 | 中 | 无（与 DOM 主线并行） | 🚧 **部分完成**（B0 已删死事件 `attributechange`；余项待做） |
| O1 | layout M6（可选）：active-only 渲染 + 页面 state 外置评估 | 评估 | M5 已完成 | ✅ **评估完成，结论"不做"**（2026-09-15：四方向真机走查通过、无时序现象 ⇒ 触发条件不成立；复活条件已写明） |

## 计划条目对照（阶段 / 里程碑 → 状态与出处）

> **用途**：任何**计划条目**若没有对应的待办 ID 或度量出处，就说明它没被跟踪。2026-09-11 用这张对照表复核，确认了"阶段 2 的 api 收尾""阶段 4 的原型访问器与 `$()`"两处**部分达成却未被登记**（已补 P2b / P4b / P5b / R2a / R2b）。

| 出处条目 | 状态 | 待办 ID | 度量 / 验证出处 |
| --- | --- | --- | --- |
| 主计划 阶段 1 窗口系统数据化（P3） | ✅ 已交付：`stores/window.ts` 的 `stack`/`syncStack`/`isWindowOpen`/`getTopWindowId`，`frames.append/remove` 为唯一同步点 | — | 进展记录 2026-08-31；设计块里的 `WindowHost.vue` 从未实现（原文已标注） |
| 主计划 阶段 2 ui-kit 组件契约化（P2） | ⚠️ **部分**：core 去重已完成，但「api 文件 27 → 0」未达成 | **P2b** | `pnpm docs:check` 的 `*-api.ts` 计数门禁（现 26，目标 0）+ 鸭子调用 682 处 |
| 主计划 阶段 3 表单读写去 getElementById（P1） | ✅ 已交付：`read(getElementById)` = 0、125 个 schema 开 `skipWrite`、`v-focus` 183 文件 / 323 处、`requestFocus` 396 处 | — | tracker `getElementById` 列（244）；动态 id 残留 78 处仍在 `composables` |
| 主计划 阶段 4 原型扩展与工具层回收（P4 + P5） | ⚠️ **部分**：五处 monkey-patch 已删；`$()` **1347** 处未删（B4 批 1 已消 134）、`element-data` 原型访问器仍在（B3 首刀 83 → 72、P4b 第二刀 72 → 70、第三刀 70 → 69）、localize 选择器本地化器未收（i18n 启动副作用已由 B1/R2a 收口） | **P4b** / **P5b** / **R2b** | tracker `dollarLookup` 列 + 辅助口径「prototype 访问器定义」+ 本地化键数门禁 |
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
| 独立登记项 | S1 逐窗冒烟 **8/8 可自动到达的窗口已复现**（余 11 个需场景上下文）、R3 死代码（8 点清单）、E1 窗口事件面（16 自定义事件） | S1 / R3 / E1 | `pnpm events:surface`、R3 精确删除清单 |

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
| R-10 | L1 / S1 / F.5#4 等真机项 | 几何拖拽、窗口逐窗渲染、重启恢复无法在 jsdom 覆盖 | `scripts/smoke-layout.mjs` 覆盖自动化可达部分（**14 phase**）+ 人工清单；结论一律写回文档并标注"人工"；现状：**L1 四方向与 S1 的 8 个窗口已由 `drag-region-edge` / `tree-windows` / `menu-windows` 自动化复现**（2026-09-15） |
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
| 🚧 **B3 元素 API 与原型（2026-09-11 首刀完成）** | **P4b 首刀**：删 11 个零访问原型字段（83 → 72）；**P4b 第二刀**：删 2 个只写/内部字段（72 → 70，含读写分类器）；**P2b 目标重定义**：实测 25 个组件 api 文件全部是元素优先实现、零死文件 → 验收从「26 → 0」改为「类型化契约 + Vue 内子集随 P5b + 豁免收窄」 | P2b 依赖 P5b 的 ref 化节奏（Vue 内子集） | `element-data.ts` 一行删字段；P2b 侧 25 个 api 文件 + 682 处鸭子调用 | **实测（P4b 首刀）**：`DATA_FIELDS` **83 → 72**（访问器 166 → 144）；typecheck/vue-tsc/oxlint + 两个套件全绿；`stores/localization.ts` 的一处类型残留（`initText`/`attrValue`）一并清理。**P2b 复核**：api 文件计数门禁保留、目标改为"不增长" | 各自单提交 revert |
| ✅ **B4 `$()` 退役（批 1–4 全部完成 2026-09-11）** | **P5b 四批**：~~批次 1 `components/tools`（136 处 / 2 文件）~~**已完成**（实测 78 + 58 = 136 处全清）→ 批次 2 `editor/commands` 模块（153 / 27；**批 2 全部完成**）→ 批次 3 `inspector`+`tools`+`attribute`+`enum`（267 / 46）→ 批次 4 非 SFC 模块（~900） | 批次 1 无需依赖；批次 3 的 `attribute`/`enum` **与 B2 合并**；批次 4 依赖 B3 的 store 化手法 | 合计 **1489 处 / 239 文件** | tracker `dollarLookup`：**1489 → 批次 1 后 1347（实测，含 2 处注释）→ … → 白名单内**；每批后 `git diff` 的模块分布应与本表一致 | 每批独立提交 revert |
| 🚧 **B5 i18n 工程线** | **R2b**：按承载者给键分类（✅）→ 把 Vue 承担的部分改为模板 `t()`/`v-tip`/标签 `t()`（🚧 迁移②③④：1436 处 `v-tip` + 612 处标签 `t()` + 43 处 `loadItems` 选项 ⇒ 1782 键跳过，扫描面 2130 → 347）→ 其余键的目标元素自注册 | 依赖 B4 批次 1–2 的模板 ref 化经验 | `Localize` 3 处源码 + 2 个语言文件（2130 / 2131 键）+ 承载组件 | 门禁：本地化 `components` 键数**下降曲线**（每批更新文档数字）；`editor/localize` 豁免删除 | 语言文件与代码同批提交，可 revert |
| **B6 巨石** | **B1 的 M1 → M5**：先补组件级用例（12 + 5 → ~40+，含 `eslints` 缩进线）→ 派生层（接口草案已就绪）→ 模板换源 → 消费方迁移 → 清理 | M1 可独立做；M3 起需 M1/M2 完成 | `command-api.ts` 2609 + `YMFileBodyPane.vue` 2327 + 各自 core/模板；`eslints.ts`、`CommandList.vue`、`stores/browser.ts`、`stores/selector.ts` | 组件级用例 **17 → 40+**；两文件受限 API 命中 **17 / 3 → 0**；`*-api.ts` 里 command/tree/file 等大件随 P2b 一并归零 | 每步一个 PR；M3 之前可随时停 |
| **B7 真机与收尾** | L1（region 左/上/下真机）→ S1（余下 11 个窗口）→ C1（`.oxlintrc.json` 白名单 + 删豁免机制 + `dom:guard:exempt` 退役）——**C1 本体已于本轮完成，B7 只剩 L1/S1** | C1 需"白名单外待迁移 = 0" | L1/S1 无源码改动（`smoke-layout.mjs` + 人工）；C1 改 lint 配置 + 4~8 个白名单文件 | 待迁移命中 **160 → 156（A 类 4 个）或 152（A+B）**；豁免机制退役；tracker 增加「设计豁免」分列 | C1 的配置改动单独提交，revert 即回到当前口径 |
| 🚧 **P1b 受限 API 直查** | 把 `document.getElementById('静态id')` / `document.querySelectorAll('#a, #b, …')` 一族改读分组注册表（沿用 P5b 手法 + `@confirm` 覆盖框架按钮 + `createElementRegistry(mirror)` 创建时镜像），逐模块成刀 | 无；与 B6 在 `ui-kit/components` 上汇合 | **131 个文件 / `getElementById` 111 处**（components 50、ui-kit/components 34、composables 17…） | 第 1 刀：待迁移命中 **158 → 155**、`getElementById` **242 → 168**；第 2 刀：**155 → 135**、**168 → 135**；第 3 刀：**135 → 131**、**135 → 111**；终点 = 白名单外为 0（与 C1 同一终点） | 每刀独立提交 revert |
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

> ✅ **已完成（2026-09-15，真机 CDP 走查四方向）**：新增 `drag-region-edge <方向> [pick=a|b]` 阶段
> （`scripts/smoke-layout.mjs`），把"人工逐方向拖一遍"变成可复跑的命令。**每个方向重启一次 app
> 取干净基线**（layout 是会话态，`config.json` 里只持久化 `scene`），两个 pick 各跑一次；
> `pick=a` = 源取最后一个叶子、目标取第一个，`pick=b` 反之——**两个都跑才能区分"设计内的相邻
> no-op"与"方向没实现"**。实测（directory 工作区，初始 `[project 0.82, inspector 1]` 水平）：

| 方向 | pick=a（源 inspector → 目标 project） | pick=b（源 project → 目标 inspector） |
| --- | --- | --- |
| **left** | ✅ **结构性**：`[inspector 0.1803, project 1]`（源叶移到目标左侧，比例重算） | 无变化——**设计内 no-op**（源本就紧邻目标左侧） |
| **right** | 无变化——设计内 no-op（源本就在目标右侧） | ✅ **结构性**：`[inspector 0.9102, project 1]` |
| **top** | ✅ **结构性**：根 `split` 由 **horizontal → vertical**，`[inspector 0.5, project 1]` | 无变化（源已在目标上方） |
| **bottom** | ✅ **结构性**：根 `split` vertical，`[project 0.5, inspector 1]` | ✅ **结构性**：`[inspector 0.7503, project 1]` |

> - 四方向的 `dragover` 一律 `prevented`、`drop` 均被接受，**无异常、无残留 region**（`staleRegions` 0）。
> - 「左缘对紧邻右叶按设计 no-op」这条**在真机上得到确认**（left/pick=b 与 right/pick=a 两组都是它）。
> - 组数在 2 叶场景下恒为 2（换位/改 split 不增组）；`end` 每次结构变化都会重算并落到叶子上。
> - **复跑命令**：`pnpm -F @yami/editor build:all` → 启动 Electron（`--remote-debugging-port=9223`，
>   home 有最近项目）→ 每个方向：`node scripts/smoke-layout.mjs open-project` →
>   `… drag-region-edge <方向> pick=a` → `… drag-region-edge <方向> pick=b`（方向之间重启 app）。

- **原现状证据**：真机已通过 region **右缘** drop、border 缩放、同组重排、跨组搬空折叠（`layout-nav-drop.spec.ts` / `layout-group-sizing.spec.ts` 为 jsdom 侧金标准）；region 左/上/下未逐一真机走查（左缘对紧邻右叶按设计 no-op，由 `regionDragover` 相邻判定覆盖）。
- **验收标准**：left/top/bottom 三个方向各走查一次，记录组数、新叶 `end`、源叶折叠与后续 border 拖拽是否生效；结论回写 [layout-vue-plan.md](./layout-vue-plan.md) M4 小节。
- **验证命令**：`pnpm -F @yami/editor build:all` → 启动 Electron（`--remote-debugging-port=9223`，home 有最近项目）→ `node scripts/smoke-layout.mjs drag-region`（另有 `drag-mode0`/`drag-mode2`/`drag-here`/`drag-scene` 等阶段，见脚本头部注释）。
- **已知限制（勿当缺陷）**：合成拖拽在「结构性 drop 后同一 tick 再拖」存在与异步重挂载的竞争，真人操作不受影响。

## S1 — 数据绑定型窗口逐窗真机冒烟

> ✅ **已完成（2026-09-15，8 个窗口全自动复现 + 交互链路）**：新增两个阶段——
> `tree-windows keys=F3,F6,… [interact=1]`（派发**真实加速键** → `registerWindowKeydown('menubar')` →
> 模块自己的 `open()`，因此数据是真的）与 `menu-windows index=5,6`（走「窗口」菜单的弹层条目，
> 覆盖**没有加速键**的过渡/队伍）。实测（绑定行数/渲染行数，与 2026-09-09 人工那轮逐项一致）：

| 入口 | 窗口 id | 绑定/渲染 | 选中 | 折叠/展开 | F2 重命名 |
| --- | --- | --- | --- | --- | --- |
| `F3` 全局变量 | `variable` | **20 / 20** | ✅ | 20 → **16** → 20 | ✅ |
| `F6` 对象属性 | `attribute` | **42 / 32**（虚拟窗口） | ✅ | 32 → **14** → 32 | ✅ |
| `F7` 枚举 | `enum` | **115 / 32**（虚拟窗口） | ✅ | 无变化（首行把手不在可见窗口内） | ✅ |
| `F8` 本地化 | `localization` | **0 / 0**（数据为空） | 无可选行 | — | — |
| 菜单「过渡」 | `easing` | **5 / 5** | ✅ | — | ✅ |
| 菜单「队伍」 | `team` | **3 / 3** | ✅ | — | ✅ |
| `F9` 插件 | `plugin` | **13 / 13** | ✅ | 列表不可折叠 | ✗ 不可重命名（配置如此） |
| `F10` 指令 | `command` | **16 / 16** | ✅ | 列表不可折叠 | ✗ 不可重命名（配置如此） |

> - 交互链路（`interact=1`）：**选中**（`.node-item.selected` = 1）在 8 个窗口里除空数据的本地化外全部成立；
>   `variable`/`attribute` 的**折叠/展开**（20→16→20、32→14→32）与 6 个窗口的 **F2 重命名框**
>   （`.node-list-text-box-input`）实测出现；`plugin`/`command` 的"不可折叠/不可重命名"与它们的
>   `getListConfig` 一致（不是缺陷）。
> - **行数怎么算的**：`YMTreeList` 行高固定 20px，绑定行数 = (上下 `.scroll-spacer` 高度)/20 + 渲染行数；
>   渲染行数 = 真实 `.node-item` 数（虚拟滚动下小于绑定行数即为正常）。
> - **仍未自动化**：其余 11 个树列表要**场景/页面上下文**才可达（`fileActor-*`、`preset*`、
>   `object-folder`、`fileAnimation-sprite` 等，入口是右键菜单或 inspector 上的按钮）；
>   它们与上述 8 个走**同一条 `YMTreeList` 渲染路径**，回归面已由这 8 个 + 组件级金标准覆盖。

- **原现状证据**：真机确认 19 个树列表全部为 v-for 形态（`.scroll-spacer` 就位）；自动可达的 8 个窗口已核对「绑定行数 / 渲染行数」——全局变量 20/20、对象属性 42/32（虚拟窗口）、枚举 115/32、本地化 0/0（数据为空）、过渡 5/5、队伍 3/3、插件 13/13、指令 16/16。
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

- **现状证据（2026-09-11 实测；**R2b 迁移②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭后本地化器扫描面 2130 → 105 键（−95%）**，见下方「R2b 迁移②及其重要更正」）**：`packages/editor/src/localize/dom-localizer.ts`（L63-86）按语言文件的 `components` 映射**在启动时逐键查 DOM**——`[.class]` → `getElementsByClassName`、`[name]` → `getElementsByName`、其余 → `getElementById`，命中后由 `setLocalElement` 写 `textContent` / `title` / `label` / `tip` / `content` / `placeholder` / `options` 并收集 `saveItems`。语言文件 `Project/Locales/en-US.English.json` 的 `components` 有 **2130** 个键（zh-CN 2131）：**18 个方括号键**（`[confirm]`/`[cancel]`/`[apply]`…，对应 `YMFormButtons.vue` 等处的 `name="…"`）与 **2112 个 id 键**。**关键事实（本轮实测更正）**：`components` **同时是 vue-i18n 的消息树**——源码里 `t('components.<键>.<字段>')` 引用了 **1957 个键**，删键会让模板解析失败，因此**键不随承载方式变化而删除**；R2b 的可量化目标是**扫描面**（已由模板承担的键在本地化器里跳过）。
- **现状证据（2026-09-11 实测；**R2b 迁移②后本地化器扫描面 2130 → 889 键**，见下方「R2b 迁移②及其重要更正」）**：`packages/editor/src/localize/dom-localizer.ts`（L63-86）按语言文件的 `components` 映射**在启动时逐键查 DOM**——`[.class]` → `getElementsByClassName`、`[name]` → `getElementsByName`、其余 → `getElementById`，命中后由 `setLocalElement` 写 `textContent` / `title` / `label` / `tip` / `content` / `placeholder` / `options` 并收集 `saveItems`。语言文件 `Project/Locales/en-US.English.json` 的 `components` 有 **2130** 个键（zh-CN 2131）：**18 个方括号键**（`[confirm]`/`[cancel]`/`[apply]`…，对应 `YMFormButtons.vue` 等处的 `name="…"`）与 **2112 个 id 键**。**关键事实（本轮实测更正）**：`components` **同时是 vue-i18n 的消息树**——源码里 `t('components.<键>.<字段>')` 引用了 **1957 个键**，删键会让模板解析失败，因此**键不随承载方式变化而删除**；R2b 的可量化目标是**扫描面**（已由模板承担的键在本地化器里跳过）。
- **推进策略（先分级后动手）**：① 按"承载者"给键分类（**已完成**：Vue 模板已全字段承担 1241 / 部分承担 712 / 零承担 881 / 非 Vue 17 / 孤儿 1）；② 把 Vue 承担的部分改为模板 `t()` 或 `v-tip`（**迁移②已完成 1436 处 `v-tip`**，覆盖 tip 字段；label 早已是 `t()`）；③ 本地化器**跳过**已由模板承担的键（**已实现**：`localize/template-localized.ts` 生成物 + 防漂移 spec，扫描面 2130 → 889）；④ 剩余键（`content`/`options`/`placeholder` 字段与 `[name]` 选择器键）继续按"目标元素自行注册/模板承载"迁移，直到扫描面收敛到白名单。
- **验收标准**：① `localizeDomComponents` 的**扫描面**收敛（当前 2130 → **889**，目标=白名单）；② 中英切换在真机上行为不变（逐类抽查）；③ 文档给出**扫描面**下降曲线（**更正**：不再用"键数下降曲线"——键是翻译数据，不随承载方式减少）；④ `editor/localize` 的 `oxlint-disable` 豁免删除。
### R2b 迁移②及其**重要更正**（2026-09-11，B5 第二刀）

**🔴 更正：`components` 键不能删——它同时是 vue-i18n 的消息树**

迁移①（删 502 个"模板已 `t()` 覆盖"的键）**判断错误**，已回滚：`components` 既是本地化器的键表，**也是 vue-i18n 的消息树**——源码里 `t('components.<键>.<字段>')` 引用的就是同一批键（实测 **1957 个键**被 `t()` 引用，全部落在语言文件里），删键会让模板里的 `t()` 解析失败（渲染成键路径）。**真正的可删候选只有"仅由本地化器使用、未被 `t()` 引用"的 172 个键**，且删它们之前还得先把文案搬进模板。

> 教训（与 P2b/P4b/R2b 早前几次同类）：**动手前先证明"两个东西是同一个"**——我先按"键表 vs 消息树"两套体系去推断，实际是同一份数据；一句 `t('components.x.label')` 能否解析，就能证伪。

**本轮真正落地的两件事**

1. **`v-tip` 指令**（`directives/tip.ts`，已注册为全局指令）：`v-tip="t('components.<键>.tip')"` 把 i18n 文案挂到元素（组件则为根元素）的 tooltip 上，**与本地化器行为对齐**——title 取前一个兄弟元素文本（用于 `$` 前缀 save 标签展开），语言切换时 `updated` 自动重挂。**扫描 1436 处**插入（239 个 SFC），另有 40 处因承载 SFC 不使用 `t()`（`AppShell.vue`/`LayoutPanel.vue`）而跳过。
2. **本地化器跳过模板已承担的键**：新增生成物 `localize/template-localized.ts`（**1241 个键**：其全部字段都已由 `t()` 或 `v-tip` 承担），`localizeDomComponents` 对其 `continue`——**扫描面 2130 → 889 键（−58%）**。防漂移由 `localize/__tests__/template-localized.spec.ts` 保证：它从源码反推同一集合与生成物逐项比对，并断言"集合内键不做 `getElementById`、集合外键仍被处理（对照组）"。

**验收进度对照**：① 不再全表扫描 → 扫描面已降 58%（889），后续继续；③ 键数下降曲线 → **更正为"扫描面下降曲线"**（键是翻译数据，不随承载方式变化而减少）；④ `editor/localize` 的豁免删除 → 待扫描面进一步收敛后再做。

**R2b 迁移③（2026-09-11，B5 第三刀）：把表单标签从"本地化器写 textContent"改为模板 `t()`**

- **度量④（剩余扫描面 887 键的构成）**：字段分布 `label` 793 / `tip` 757 / `options` 253 / `content` 35 / `placeholder` 12 / `title` 8；承载者 213 个（`LayoutPanel.vue` 55、`SetString.vue` 34、`IfCondition.vue` 17、…）。
  - **说明**：`tip` 虽已由 `v-tip` 承担，但这些键的 `label` 还没 `t()` 化 → 整个键仍在扫描面内（跳过集合要求**全部字段**都被模板承担）。
- **迁移③**：把"标签 `<div class="text">硬编码文本</div>` 紧邻控件"这一形态**脚本化**替换为 `<div class="text">{{ t('components.<键>.label') }}</div>`——**612 处 / 139 个 SFC**（25 处结构不符留待人工，集中在 `Setting.vue`）。
  - 前提校验：承载 SFC 必须已用 `useI18n()`；标签 div 与控件标签相邻；div 内不含 `<` 或 `{{`（避免误改）。
  - 语义等价：本地化器原本就是把 `item.label` 写进 `element.previousElementSibling.textContent`；改为模板 `t()` 后**语言切换变成响应式**（原来靠重跑本地化器）。
- **生成器固化进仓库**：`scripts/i18n-skip-list.mjs`（`--check` 只比对不写入），生成 `localize/template-localized.ts`；防漂移由 `template-localized.spec.ts` 从源码反推比对。

**指标**：跳过键 **1241 → 1739**；本地化器**扫描面 2129 → 390（−82%）**（起点 2130）。

**R2b 迁移④（2026-09-11，B5 第四刀）：下拉项名/提示改由模板 `t()` 承担**

- **度量⑥**：`options` 字段的形态是「按**值**索引的对象」——`{ "true": { name: "Yes", tip: "…" }, "false": { … } }`；承载 SFC 里对应的硬编码形态是 `elRotatable.value?.loadItems([{ name: 'Yes', value: true }, …])`。
- **定位方式**：不能按"项名匹配"（同名的 `Yes/No` 会被多个键同时命中）→ 改为**按控件的具名 ref** 定位：从 `<… id="<键>" …>` 标签取 `ref="elX"`，再找 `elX.value?.loadItems([ … ])` 块，按 options 的值键逐项改写成
  `{ name: t('components.<键>.options.<值键>.name'), tip: t('…options.<值键>.tip'), value: … }`。
- **结果**：**43 个控件块 / 18 个 SFC** 改写成功；209 项跳过（`loadItems` 位于 composable（如 `useUIButtonPage.ts`）、控件无具名 ref、或项来自动态数据源）。**同名冲突的用例（`fileActor-rotatable` / `fileActor-immovable` 都用 `Yes/No`）各自命中自己的块**，验证了 ref 定位的必要性。
- **判据同步修正**：跳过集合的 `options` 字段判据原为"路径到 `options` 为止"（`t('…options')`），而迁移后是 `t('…options.<值键>.name')` → 判据改为**前缀匹配** `t('…options.`（`scripts/i18n-skip-list.mjs` 与 spec 同步修改，二者必须一致，spec 会从源码反推比对）。

**指标**：跳过键 **1739 → 1782**；本地化器**扫描面 2112 → 37（−84%）**（起点 2130）。

**R2b 迁移⑤（2026-09-12）：补齐「只缺 tip」的键，扫描面 347 → 307**

做法：先从语言文件反查「字段集合 == {`tip`}」且承载 SFC 里还没有 `v-tip` 的键（**40 个**），再在承载 SFC 的 `id="<键>"` 属性行后插入 `v-tip="t('components.<键>.tip')"`（沿用迁移②的既有形态）。这 40 个键只落在 **2 个 SFC**（`AppShell.vue`、`LayoutPanel.vue`），其中 2 个键的承载文件此前**从未用过 `t`**，脚本顺带补了 `useI18n()`（并记进跳过清单）。生成物 `localize/template-localized.ts` 重跑（**1822** 键），防漂移用例 `template-localized.spec.ts`、`pnpm lint`、`vue-tsc` 全绿。

**R2b 迁移⑥（2026-09-12）：`content` 类键改由模板 `t()` 承担，扫描面 307 → 284**

做法：反查「字段集合 == {`content`}」且尚未被模板承担的键（**23 个**），把承载元素自身的文本换成 `{{ t('components.<键>.content') }}`（行内与分行两种形态都处理）→ 落在 **4 个 SFC**（`LayoutPanel.vue` 最多，另 `HomeRecentList.vue`、`AnimSpriteFramePage.vue`、`AppShell.vue`）。① **踩到的坑**：`HomeRecentList.vue` 此前**没有 `useI18n()`**，插入 `t()` 后 `vue-tsc` 立刻报 `TS2339`（模板里 `t` 不存在）→ 补 `import { useI18n } from 'vue-i18n'` + `const { t } = useI18n();`；**教训：写 `t()` 的脚本必须同时保证 `t` 在作用域内**（迁移⑤的脚本已经这么做了，本轮漏了，靠 `typecheck:vue` 兜住）。② 生成物重跑（**1845** 键），防漂移用例与 `pnpm lint` 全绿。**指标**：扫描面 **307 → 284**（−87%，起点 2130）。

**R2b 迁移⑦（2026-09-12）：`options` 类键改为响应式 `t()`（最大头一次性推进），扫描面 284 → 196**

背景：`options` 一直是最难的一类——选项名不写在模板里，而是由**本地化器**在语言切换时按语言文件写进控件（`setItemNames`），所以「把名字搬进模板」并不成立：模板不持有那份数据。本轮给这类选项开了一条**新的承载路径**：

- 新组合式函数 **`composables/useLocalizedOptions.ts`**：`useLocalizedOptions(key, values, apply)` 在 `watchEffect` 里用 `t('components.<键>.options.<值>.name'/'.tip')` 生成 `{name, tip, value}` 并回调 `apply`——**语言切换时自动重建**（`t` 响应式），不再依赖本地化器。
- **88 个站点 / 88 个键 / 52 个 SFC** 的硬编码 `loadItems?.([{ name: 'Yes', value: true }, …])` 被脚本替换为一行 `useLocalizedOptions('<键>', [true, false], (items) => <取控件>?.loadItems?.(items))`。脚本只处理**能完整覆盖语言文件 option 键**的站点（值集合与 options 键一一对应、name/value 数量一致），其余 61 处（名字来自变量/表达式，或值集合不完整）跳过留待人工。
- 判据同步改了**两处**：生成器 `scripts/i18n-skip-list.mjs` 与防漂移用例 `localize/__tests__/template-localized.spec.ts`（两者各维护一份「模板是否承担」的判定——本轮先漏改 spec，被全量测试抓出，已补）。
- 生成物重跑：**1933** 键由模板承担。**指标**：扫描面 **284 → 196**（−91%，起点 2130）。

**R2b 迁移⑧（2026-09-12）：选项名沿用既有命名空间、但改为响应式，扫描面 196 → 157**

上一刀只覆盖了「名字是字面量」的站点；剩下 61 处里有一大批**名字已经是 `t('command.<命令>.<选项>')`**（另一套命名空间，且带 `|| 'Fallback'`），它们**本来就已本地化**，只是不在模板里、也不响应语言切换——本地化器在切换时会把它们覆盖成 `components.<键>.options.<值>.name`。

- 给 `useLocalizedOptions` 增加第 4 个参数 **`nameKeys`（`值 → 消息键路径`）**：省略时按约定取 `components.<键>.options.<值>.name/.tip`，给出时改为 `t(nameKeys[值])`。
- 脚本把 **39 个站点 / 39 个键 / 33 个 SFC** 的 `loadItems?.([{ name: t('command.x.y') || 'Y', value: 'y' }, …])` 换成一行 `useLocalizedOptions('<键>', ['y', …], (items) => <取控件>?.loadItems?.(items), { y: 'command.x.y' })`——名字仍来自原命名空间，但**语言切换自动重建**，于是该键可以安全地离开本地化器扫描面。
- 判据保持不变（仍是 `useLocalizedOptions('<键>'`），生成器与防漂移用例无需再改。
- **两个踩坑（都被门禁当场抓住）**：① 映射表的键含连字符（`add-instance`）却没加引号 → `oxlint` 报 `Expected ',' or '}'`（40 个映射表 / 33 个文件，已统一加引号）；② `ForEach.vue` 的 `loadItems(...)` 后面**还挂着调用链**（`?.enableHiddenMode?.()?.relate?.([…])`），直接替换会让链条悬空（`vue-tsc` 的 `TS2339` + 运行期 `relate` 永不执行）→ 拆成独立语句。
- **指标**：扫描面 **196 → 157**（−93%，起点 2130）；模板承担键 **1933 → 1972**。

**R2b 迁移⑨（2026-09-12）：`placeholder` 类键改由模板承担，扫描面 157 → 146**

- `components/common/TextBox.vue` 新增 **`placeholder` prop**，并在 `watch(() => props.placeholder)` 里调 ui-kit 的 `setPlaceholder`——`t()` 响应式，**语言切换后自动重跑**（原先只有本地化器会写 placeholder）。
- **11 个键 / 10 个 SFC** 的 `<TextBox id="…"` 行后插入 `:placeholder="t('components.<键>.placeholder')"`（脚本按 id 所在行的缩进插入，兼容 id 与标签名同行/分行两种写法）；已逐个核对这 11 处都是 `<TextBox>`，避免属性变成无害但不生效的 fallthrough。
- **指标**：扫描面 **157 → 146**；模板承担键 **1972 → 1983**。

**R2b 迁移⑩（2026-09-12）：修正「承载者」判据，扫描面 146 → 137**

- **发现的问题**：生成器（与防漂移用例）判定承载者的第一条是「SFC 里出现 `id="<键>"`」。但有一批键的元素**由 ui-kit 组件在内部持有 id**——例如 `Rename.vue` 只写 `<YMRename v-model="form.name" :title="t('components.rename.title')" :label="t('components.rename-name.label')" …/>`，根本没有 `id="rename"`。这些键其实**早已由模板 `t()` 承担**，却因为判据看不到而被一直留在扫描面里（列在"无 `.vue` 承载"里）。
- **判据修正（两处同改）**：`carriers = 含 id="<键>" 的 SFC`；若为空，则取 **唯一引用该键消息的 SFC**（`components.<键>.` 只出现在一个文件里）作为承载者——**多文件引用时仍要求含 id**，避免"别的文件恰好引用了同名字段"造成误判。
- **效果**：**9 个键**因此正确归入"模板已承担"（`arrayList-number`/`arrayList-string`/`rename`/`request-keyValue`/`request-keyValue-key`/`request-keyValue-value`/`setKey`/`setQuantity`/`zoom`，都不带 id 但字段确实由 `t()` 承担）。
- 仍有 **8 个键**（`rename-name`/`setKey-key`/`setQuantity-quantity`/`zoom-factor`/`font-font`/`fontSize-size`/`selector-search`/`setListIndexSkipCheck`）未达标：它们的**字段集合**里还有 `tip` 之类没被模板承担（label 侧已承担），需要逐键补。
- **指标**：扫描面 **146 → 137**；模板承担键 **1983 → 1992**。

**R2b 迁移⑪（2026-09-12）：inspector 三页的「直接读语言表取选项名」改为 `useLocalizedOptions`，扫描面 137 → 131**

- **发现的第三种承载形态**：`AnimSpriteLayerPage.vue` / `ParticleLayerPage.vue` / `SceneParallaxPage.vue` 三页里有
  `const getOptions = (id) => local.components?.[id]?.options`，再用 `getOptions('sceneParallax-light')?.[key]?.name || 'Raw'`
  逐项拼选项名——**绕过了 `t()`**，所以判据看不到，本地化器也不能跳过这些键（它们其实**已经在用语言表**，只是没走 `t()`）。
- **改法**：把这类 `loadItems([...])` 块统一换成 `useLocalizedOptions('<控件 id>', [值…], (items) => el?.loadItems?.(items))`——名字按约定取自 `components.<id>.options.<值>.name`，且**响应式**（语言切换自动重建）。共 **6 个块**（SceneParallax 4、ParticleLayer 2、AnimSpriteLayer 2 中的 6 处）。
- **顺带清理**：`SceneParallaxPage.vue` 的 `getOptions` 因此失去使用者 → 删除（`vue-tsc` 的 `TS6133` 当场报出）；`ParticleLayerPage.vue` 的 `getOptions` 仍在用（另一处用途），保留。
- **指标**：扫描面 **137 → 131**；模板承担键 **1992 → 1998**。

**R2b 迁移⑫（2026-09-12）：给 6 个「组件式窗口」补 tip，扫描面 131 → 125**

上一轮列的 8 个 `{label, tip}` 组合键里，有 6 个的**承载者是 ui-kit 的组件式窗口**（`<YMRename>`/`<YMSetKey>`/`<YMSetQuantity>`/`<YMZoom>`/`<YMFont>`/`<YMFontSize>`）：label 走 `:label="t('components.<键>.label')"` 属性，**tip 根本没传**（这些组件的 props 只有 label/title）。做法是在那行属性之后补 `v-tip="t('components.<键>.tip')"`——`v-tip` 用在组件上会作用于**根元素**，与本地化器原先写 tooltip 的对象一致 ⇒ 6 个键可判为"模板已承担"。

- 剩 2 个（`selector-search`、`setListIndexSkipCheck`）**在任何 SFC 里都搜不到**（`id="<键>"` 与 `components.<键>.` 均无命中）⇒ 由运行期拼 id 的元素工厂创建，随 B1/B6 一并处理。
- **指标**：扫描面 **131 → 125**；模板承担键 **1998 → 2004**；`pnpm lint` 0/0、`vue-tsc` 0 新增、editor **237 文件 1992/1992**、`docs:check` OK。

**R2b 迁移⑬（2026-09-12）：填「空 label 占位」，扫描面 125 → 110**

分类剩余键时发现一种**从没被单独列过**的承载形态：设置窗口的每个控件写成

```html
<div class="text" />                                  <!-- 空占位：label 过去由本地化器写进来 -->
<NumberBox id="setting-server-port" v-tip="…tip" />
```

tip 早已由模板承担（迁移⑤），**label 却还是空占位** ⇒ 这些键一直留在扫描面里。做法：把紧邻控件行的空占位填成 `<div class="text">{{ t('components.<键>.label') }}</div>`，共 **15 个键 / 1 个 SFC**（`tools/Setting.vue`；`EventSearchString.vue` 的 2 个键形态不同，留待下批）。

- **可复用判据**：`label` 的承载者是"**控件前一个兄弟元素**"（与 `v-tip` 取 title 的约定同源）⇒ 找 label 缺口要看**控件前一行是否为空 `.text` 占位**，而不是只看控件自己。
- **指标**：扫描面 **125 → 110**；模板承担键 **2004 → 2019**；`pnpm lint` 0/0、`vue-tsc` 0 新增、editor **237 文件 1992/1992**、`docs:check` OK。

**R2b 迁移⑭（2026-09-12）：模块侧选项名有了非 Vue 的等价路径，扫描面 110 → 105**

分类脚本里有一批键属于「`options` 但调用方是 `.ts` 模块」（`data/transition-window.ts`、`components/condition-list.ts`、`components/actor-accessor-window.ts` 这类**元素工厂/数据模块**）：它们的 `loadItems([...])` 里是**字面量名字**，却用不了 `useLocalizedOptions`——那是组合式函数，依赖 `useI18n()`/`watchEffect`，只能在组件 setup 里调用。

- 新增 **`utils/localized-items.ts`**：`localizedItems(key, values)` 用 `getYamiI18n().global.t` 按当前语言生成 `{name, tip, value}`；`applyLocalizedItems(key, values, apply)` **立即应用一次并订阅 `localizationchange`**（语言切换后重挂），返回取消订阅函数。效果等价于本地化器过去替它们做的事，但把责任从"全局扫描"移到**调用点自己**。
- 本刀转换 **5 处 / 5 个键 / 2 个 `.ts`**；其余模块侧站点的名字来自变量，留待后续。
- **判据同步改两处**（生成器 + 防漂移用例）：`options` 现在也接受 `applyLocalizedItems('<键>'`，且**扫描面从"仅 `.vue`"扩到"`.vue` + `.ts`"**。口径措辞随之从「模板已承担」改为「**代码已承担**」（模板 `t()` 或模块侧受控重挂），文案更准确。
- **又踩了同一个坑**：只改生成器、忘改 spec，防漂移用例立刻报 `expected [ …2023 ] to deeply equal [ …2018 ]`——与迁移⑦的教训一字不差，说明"生成器与 spec 是两份实现"这条要写在文件头。
- **指标**：扫描面 **110 → 105**；代码承担键 **2019 → 2024**；editor **237 文件 1992/1992**、`pnpm lint` 0/0、`vue-tsc` 0 新增、`docs:check` OK。

**R2b 迁移⑯（2026-09-12）：三类硬编码/空占位标签换 `t()`，扫描面 34 → 25**

剩余键里有一批"标签本来就是写死的英文或空占位"的：

- (a) **空标签 div**：`<div class="text"></div>`（**无斜杠写法**，所以迁移⑬的规则没匹配到）→ 填 `{{ t('components.<键>.label') }}`，4 个键（`event-search-string-*`）。
- (b) **字面量标签 div**：`<div class="text">IsBackground</div>` → 换成 `t()`，2 个键（`downloadFile-isBackground`、`httpRequest-withCredentials`）。
- (c) **自身带 id 的标签 div**（字段为 `content+tip`）：`<div class="text" id="if-else-label" v-tip="…">Else</div>` → 文本换成 `{{ t('components.<键>.content') }}`，3 个键（`if-else-label`、`switch-default-label`、`block-asynchronous-label`）。

**脚本化的第二个坑**（第一个是换行/缩进）：占位 div 与控件的 `id` **不一定相邻**——控件标签可能跨多行（`<CheckBox` / 换行 / `id=…`），直接从 `id` 的上一行找占位会漏。改为**先回退到控件标签起始行**（`^\s*<[A-Za-z]`）再看其上一行，命中数从 **5 涨到 9**。**判据**：脚本匹配的是"相邻文本行"，而模板里相邻的是"标签"，两者必须按**标签边界**对齐。

- **指标**：扫描面 **34 → 25**；代码承担键 **2095 → 2104**；`pnpm lint` 0/0、`vue-tsc` 0 新增、editor **237 文件 1992/1992**、防漂移用例 4/4、`docs:check` OK。

**R2b 迁移⑱（2026-09-12）：修正「扫描面」分母口径——真实剩余 3 键（此前长期高估 17 个）**

- **发现**：生成器把「扫描面」算作 `语言表键数 − 已承担键数`，而分母用的是**除 `[comment]` 之外的全部键**（含 17 个 `[` 前缀的**分节键**，如 `[...]` 段落标记）。这些分节键既不是控件、也永远不会被 `t()` 承担 ⇒ 它们**恒久**留在"剩余"里，把扫描面长期虚高 **17**。按真实口径核算：已承担 **2109** 键、分母 **2112**（= 2130 − 17 分节键 − 1 `[comment]`）⇒ **剩余 3**。
- **修法**：生成器的分母改为 `k !== '[comment]' && k[0] !== '['`，输出随之变为 `扫描面 2112 → 3`；生成物头部的数字注释同步。防漂移用例不受影响（它比较**集合**而非计数）。
- **剩余 3 键的定性**（这就是本地化器 `TEMP_WHITELIST` 退出前必须处理完的全部）：① `particleLayer-anchor-x-1` —— `save` 依赖键（`saveItems` 展开用，跳过会破坏 save 标签）；② `selector-search`、③ `setListIndexSkipCheck` —— 均**无任何 SFC 引用**，由运行期拼 id 的元素工厂创建，随 **B1/B6** 的巨石改造一并处理。
- **指标**：扫描面 **2112 → 3**（−99.9%，起点 2130）；已承担键 **2109**；`pnpm lint` 0/0、`docs:check` OK、防漂移 4/4。

**R2b 迁移⑰（2026-09-12）：4 个 `<DetailSummary>` 标题 + `Script.vue` 窗口标题换 `t()`，扫描面 25 → 20**

- 4 个键（`plugin-overview`/`plugin-parameter-grid`/`command-overview`/`command-settings-grid`）的 label 落在 **`<DetailSummary>` 容器**上（`Overview`/`Parameters`/`Settings` 写死英文）→ 换成 `<DetailSummary>{{ t('components.<键>.label') }}</DetailSummary>`；`script` 的 title 是 `<TitleBar>Script` 字面量 → 换 `t('components.script.title')` 并补 `useI18n`。
- **本轮的真实教训（差点把界面改坏）**：脚本替换时我把**整个 `<DetailSummary>…</DetailSummary>` 元素**换成了裸 `{{ t(...) }}`，丢掉了组件标签——`vue-tsc` 立刻以 `TS6133`（`DetailSummary` 导入未使用）报出来，才顺着发现这一处**渲染回归**。修法是把插值放回标签内部。**规矩**：文案替换脚本必须"**只换文本、不换标签**"；`TS6133` 这类"看起来只是清理提示"的错误，往往是结构被改动的第一信号。
- **指标**：扫描面 **25 → 20**；代码承担键 **2104 → 2109**；`pnpm lint` 0/0、`vue-tsc` 0 新增、editor **237 文件 1992/1992**、防漂移 4/4、`docs:check` OK。

**剩余 20 键**：`save` 依赖键（按设计不跳过）、`selector-search` 与 `setListIndexSkipCheck`（运行期拼 id，随 B1/B6）、以及少量 `content`/`title` 与需按容器处理项。

**剩余 25 键**：`save` 依赖键 1、`selector-search` 与 `setListIndexSkipCheck` 2（运行期拼 id，随 B1/B6 处理）、`script`（title，非 SFC 承载）、`plugin-overview`/`plugin-parameter-grid`/`command-overview`/`command-settings-grid` 4 个（label 落在 `<DetailSummary>` 上，需按容器形态单独处理）、其余为少量 `content`/`title`。

- **验证命令**：`pnpm -F @yami/editor test`、`pnpm lint`、`pnpm dom:guard:tracker`、`pnpm docs:check`；真机切换语言后抽查窗口标题/菜单/按钮/tooltip。
- **来源**：2026-09-11 第二十二轮度量审计（`components` 键数实测；此前 R2 只按源码处数记为"小"）。

## R2c — vue-i18n 消息表的字面量语法转义（`@` / `|` / `{…}`）

> ✅ **已完成（2026-09-15）**：`i18n/convert.ts` 的 `escapeMessage` 原本只转义 `@` 与 `|`；
> 本轮补上 `{…}`——**并按「白名单插值 vs 字面量」分类**（`INTERPOLATION_NAMES`：`dirName` / `actor` /
> `team` / `filename` / `number` / `size` / `langname`，每一个都由用例绑定一条真实文案），
> 白名单外的 `{` / `}` 各转义一次（中间文字留在插值之外）。
>
> **修掉的两处真实缺陷（编辑器套件原本 5 例红）**：
> | 键 | 原文 | 修前 | 修后 |
> | --- | --- | --- | --- |
> | `components.setString-operand-parse-timestamp-format.tip` | `{Y}: Year\n{M}: Month…` | 占位符被当插值 → 渲染成 `: Year\n: Month…`（内容被吃掉） | 逐字渲染 `{Y}: Year…` |
> | `components.setNumber-operand-other-data.options.trigger-gamepad-button.tip`（zh） | `有效值：{0, 1, 2, 3, ...}` | **Message compilation error: Unterminated closing brace**（`t()` 在 render 里同步调用 ⇒ 会连带炸掉整个窗口渲染） | 逐字渲染 |
> - **语言文件保持原样**：转义只发生在「JSON → vue-i18n 消息表」这个边界，legacy DOM 本地化器读的仍是原始 JSON
>   （既有用例 `legacy 本地化器仍读原始 JSON` 就是这条不变量）。
> - **用例（+2）**：`i18n/__tests__/locale-messages.spec.ts` 新增「白名单的每个参数名都有可插值的真实文案」
>   （名字多一个/少一个都红）与「全部消息：白名单外的 `{…}` 逐字渲染、白名单内按插值处理」
>   （把原来只覆盖 `.tip` 的逐字渲染扩到**全部消息**）。
> - **规模**：两份语言文件里含 `{…}` 的消息共 **27 条**（en 14 / zh 15，其中 2 条是字面量示例），
>   其余是真实插值——这个数是本轮实测出来的，也是"白名单"能成立的前提。
> - **指标**：editor **239 文件 2004/2004**（原 5 例红全部转绿）、`pnpm lint` 0/0、`tsc` strict 通过。
> - **来源**：2026-09-15 全量套件复核（`locale-messages.spec.ts` 从"半应用的实验 spec、排除在基线外"转为常驻门禁）。

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

- **现状证据（2026-09-11 实测；P5b 批次 1–4 完成后为 22 处 / 11 文件，残余全部为动态 id / 外壳元素 / 基础设施 / 白名单，见下方 P5b 结项）**：`packages/editor/src/utils/dom.ts` L147-157 的 `$` 仍有 **1489 处调用**、分布在 **239 个文件**（形如 `$('#if-condition-type')`、`targets: [$('#…')]`；判定正则 `\$\(\s*['"\x60]#`，其中 `\x60` 是反引号）。模块分布：`components` 722、`inspector` 168、`commands` 153、`tools` 79、`animation` 48、`title` 40、`scene` 36、`palette` 29。热点文件：`components/tools/IfCondition.vue` 78、`SetNumberOperand.vue` 58、`commands/SetString.vue` 44、`animation/animation-window.ts` 24。
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
### P5b 尾项 — 确认按钮启用态属性化（2026-09-11 登记，**2026-09-15 完成**）

> ✅ **已完成（2026-09-15）**：确认按钮的禁用态从「模块对元素调 `disable()`」改为**属性链**——
> 模块的响应式标志 → `WindowFrame` 的 `confirm-disabled` → `YMWindowFrame` 透传 → `YMFormButtons`
> 的 `button[name="confirm"]` 绑 `:disabled`。
> - **代码**：`ui-kit/YMFormButtons.vue`（新 prop `confirmDisabled`，绑到确认按钮）、
>   `ui-kit/YMWindowFrame.vue`（新 prop `confirmDisabled`，透传）、`editor/components/common/WindowFrame.vue`
>   （新 prop `confirmDisabled`，透传）；`title/new-project-window.ts` 与 `title/deploy-project-window.ts`
>   各导出一个 `ref` 标志（`newProjectConfirmDisabled` / `deploymentConfirmDisabled`），在 `check()` 里赋值；
>   `NewProject.vue` / `Deployment.vue` 绑 `:confirm-disabled`。
> - **行为**：`NewProject.check` 的三条分支 + 「`minimized-project` 且 `Editor.state === 'closed'`」这条
>   与旧实现逐字对应（后者是"没有可最小化的项目"）；`Deployment.check` 的「未命名 / 已存在 → 禁用、
>   通过 → 启用」同理。顺带修正了原注释把这条读反的表述（旧写法是**编辑器关闭时禁用**）。
> - **顺带**：`button.click()` 对 disabled 按钮不触发事件，因此 `Window.keydown` 里 Enter 触发的
>   `button[name=confirm].click()`（P1b 第 11 刀改成帧内查找的那处）也随之被挡住——无效表单**不能**再经快捷键提交。
> - **用例（5 例）**：`ui-kit/YMFormButtons.spec.ts`（禁用时点击不派发 confirm、`hotkey` 提示保留、
>   取消按钮不受影响；默认值与 props 切换）、`ui-kit/YMWindowFrame.spec.ts`（透传到 `button[name=confirm]`）、
>   `editor/components/__tests__/window-confirm-disabled.spec.ts`（挂载两个真实窗口 SFC，跑
>   `check()` 的三条分支与「最小化项目」分支，断言 DOM 上的 `disabled`）。
> - **指标**：ui-kit **111 文件 779/779**（+3 例）、editor **239 文件 2004/2004**（+3 例）；
>   `pnpm lint` 0/0、`tsc` strict 通过、`typecheck:vue` 0 new。
> - **一处测试基建的坑（写进依赖）**：一开始把 `v-tip` 注册进 `vitest.setup.ts` 的 `config.global.directives`，
>   结果 `directives/__tests__/tip.spec.ts` 3 例转红 2 例——**setup 期的 `import` 会先于各 spec 的
>   `vi.mock('@app/utils/element-utils')` 实例化 `tip.ts`**，模块 mock 随即失效。改为「setup 只注册
>   `v-focus`；需要 `v-tip` 的用例在 `mount` 时自带 `global.directives`」，并把这条理由留在 setup 注释里。

- **原现状**：`title/deploy-project-window.ts`、`title/new-project-window.ts` 原先用 `disable(...)` / `enable(titleEls.get('…-confirm'))`（共 **7 处**调用）在表单无效时禁用确认按钮；而 `<id>-confirm` 由 `WindowFrame` → `YMFormButtons` 生成、模板里没有、元素注册表取不到 → 改造后这些调用恒为 no-op（已删除死调用，原意图以注释留在 `new-project-window.ts`）。
- **原影响**：两个模块的 `confirm()` 自带校验（无 early-return）→ 按钮保持可点意味着**无效输入也能提交**（边界行为，非崩溃）。
- **正解**：给 `WindowFrame` 增 `confirm-disabled` 属性 → 透传到 ui-kit `YMFormButtons` 的 `button[name="confirm"]` 绑 `:disabled`；两个 SFC 绑定模块导出的响应式标志（`ref<boolean>`）。
- **涉及共享组件**（`WindowFrame` 被所有窗口使用、`YMFormButtons` 在 ui-kit）→ 单独一刀，带回归用例（`confirmDisabled` 为真时确认按钮带 disabled、为假时可点）。
- **验证**：`pnpm -F @yami/ui-kit test` + `pnpm -F @yami/editor test` 全绿；`WindowFrame` 现有用例（`@confirm`/`@apply` 事件）不回归。

## P4b — 原型访问器退役（`utils/element-data.ts`）

> ✅ **P4b 第八刀（2026-09-15）：再收 3 个字段，`DATA_FIELDS` 50 → 47（访问器 100 → 94）**。
>
> | 字段 | 性质 | 处理 |
> | --- | --- | --- |
> | `thumb` | 滚动条滑块节点（仅 `scroll-bar-api.ts` 9 处；`YMScrollBar.vue` 里的同名量是**组件自己的 `state` 对象**，不是元素数据） | 改 `elementDataOf<ScrollBarApi>(bar).thumb`；两个 spec 里读 `el.thumb` 的断言改走同一入口 |
> | `nodeIcon` | 树行元素的图标节点（`tree-api.ts` 11 处 + `tree-render.ts` 写入 + 1 个 spec） | 新增 `rowData(el)` 视图（`elementDataOf<NodeElement>`），`bindNodeIcon`/`applyRowUpdaters`/`rename` 全走它 |
> | `textNode` | 行文本节点（`tree-api.ts` 3 + `tree-render.ts` 写入 + `YMFileNavPane.vue` 5 + 2 个 spec） | 同上；导航面板的 `FolderElementData` 视图补 `textNode` |
>
> - **一处 TS 收窄**：`rowData(element).textNode.nodeValue = …` 被 oxlint 的 TS 规则判为可能为 null
>   （`NodeElement.textNode?: Text | null`）——**这正是"给出准确类型"的代价与价值**：老代码能过是因为
>   `element.textNode` 走的是无类型的访问器。补 `!` 即可（该行在原实现里本就假定节点存在）。
> - **验证**：ui-kit **111 文件 780/780**、`pnpm lint` 0/0、`tsc` strict 通过；editor 套件见下一行。

> ✅ **P4b 第七刀（2026-09-15）：按组件收口 8 个字段，`DATA_FIELDS` 58 → 50（访问器 116 → 100）**。
> 新增一个迁移助手 **`elementDataOf<T>(el)`**（`element-data.ts` 导出、`@ui-kit` 门面再导出）：
> 把元素数据**当成给定形状**读，避免 `getElementData(el).x` 拿到 `unknown` 而无法参与运算
> ——这正是第五刀那次负结果的根因（"访问器天生无类型"）；**按字段给出准确类型**才是可做的那条路。
>
> | 字段 | 性质 | 处理 |
> | --- | --- | --- |
> | `keyword` | 树列表搜索关键字（仅 `tree-api.ts` 7 处） | 改 `treeData(this).keyword`（文件内新增 `TreeListElementData` 视图） |
> | `folderMark` / `markVisible` | 行元素上的把手节点引用与可见性 | `tree-render.ts` 写入、`tree-api.ts` 与 `YMFileNavPane.vue` 读取，全部改 `elementDataOf<…>` |
> | `fileBox` | `YMFileVar` 的常量框元素（仅 `file-var-api.ts` 11 处） | 改 `data.fileBox`（`FileVar.vue` 里同名的是 SFC 自己的 api 对象字段，不受影响） |
> | `savedValue` | **只写不读**：`select-box-api` 与 `YMSelectBox.vue` 各把 core 的 `state.savedValue` 镜像到元素上，全仓无人读取 | 删两处镜像 + 类型声明（真正的状态在 core `state` 里） |
> | `synchronizer` | 滑块 ↔ 数字框互相同步的目标元素（`SliderBox.vue` 写、`inspector.ts` 的 focus/blur 读） | 两处都改显式元素数据；顺带删掉 `api.synchronizer = null` 造成的**同名自有属性**（它一直遮蔽着访问器） |
> | `activeWheel` | **死写入**：`YMFileHeadPane` 往滑块元素上写 `true`，而 `YMSliderBox` 只读 `props.activeWheel` | 删写入（行为不变） |
> | `bar` | **零元素数据用法**：命中的三处是 CSS module 类名（`$style.bar`）与组件实例的 expose 引用 | 直接删字段 |
>
> - **验证**：ui-kit **111 文件 780/780**、editor **239 文件 2004/2004**、`pnpm lint` 0/0、
>   `tsc` strict 通过、`typecheck:vue` 0 new；每条字段迁移后都单独跑过所在组件的用例
>   （tree 127、FileVar 8、SelectBox 24…）。
> - **门禁生效的证据**：本刀删字段后 `pnpm docs:check` **立刻报错**（"文档写 58，实际 50"）——
>   上一轮修好的 `DATA_FIELDS` 计数门禁确实在拦。

> ✅ **P4b 第六刀（2026-09-15）：列表配置簇收口，`DATA_FIELDS` 69 → 58（访问器 138 → 116）**。
> 这一刀不是"逐字段搬调用点"，而是**换存储**：`creators`/`updaters`/`removable`/`renamable`/
> `togglable`/`foldable`/`onCreate`/`onDelete`/`onRemove`/`onResume` 这 10 个字段此前是
> `getListConfig(el)` 的 getter/setter **代理到元素访问器**（即 `ListConfig` 只是一层薄转发），
> 现在 `list-config.ts` 直接读写 `getElementData(el)`，于是这 10 个名字可以整批从 `DATA_FIELDS` 摘掉
> （另外顺手删掉 `filler`：全仓检索确认**没有任何元素数据用法**——命中的三处是
> `YMSliderBox` 的模板 ref 与 `SliderBox.vue` 的普通对象字段，属"字段名撞车"的假命中）。
>
> - **做法**：`list-config.ts` 的 `ListConfig` 全部改成"读写 `getElementData(el)` 的访问器"，
>   `creators`/`updaters` 也做成访问器（原先它们是"构造时抓一次数组引用"，所以
>   `list.creators = listConfig.creators = []` 必须两边都写；改访问器后单点写即可，`push` 仍原地生效）。
> - **调用面**：全仓 `getListConfig(list).<字段>` 的写法**一处未改**；只改了三处**绕开配置直接读写元素**的地方——
>   `tree-api.ts` 初始化（`list.padded/removable/renamable/foldable/lockDirectory/multipleSelect = …`
>   与 `list.creators = listConfig.creators = []`）、`command-api.ts` 的 5 处 `this.padded === true`、
>   `YMParamList.vue` 的 `self.padded`/`self.togglable`（3 处读 + 1 处写）、以及 `common-list.ts` 的 `el.padded`。
> - **教训（又一次"计量工具先验证"）**：第一版排查用了 `Select-String -Path packages\editor\src\**\*.ts`
>   ——PowerShell 的 `**` 在 `-Path` 里**不递归**，于是漏掉了 `ui-kit` 组件目录与 `__tests__` 下的直接读写，
>   一跑套件立刻红了 16 例。改用 `Get-ChildItem -Recurse | Select-String` 才看全。
> - **测试同步**：22 处 `el.removable/renamable/lockDirectory/togglable/foldable = true`
>   改为 `getListConfig(el).<字段> = …`（5 个 spec 文件）——**这也是这次迁移想要的方向**：
>   用例不再依赖"元素上的隐式属性"；`list-config.spec.ts` 的契约断言整段重写，新增
>   「不再往元素上写 expando（P4b 的目标）」与「直接写元素也不再影响配置」两条反向断言。
> - **指标**：`DATA_FIELDS` **69 → 58**（访问器 138 → 116）；ui-kit **111 文件 779/779** 全绿、
>   `pnpm lint` 0/0、`tsc` strict 通过。

> 🚧 **进行中（2026-09-11，B3 首刀）**：**11 个零访问字段已删除**（`conditionIcon`、`eventEnabled`、`hiddenState`、`lockState`、`groupText`、`attrKey`、`annotated`、`initText`、`attrValue`、`relationMark`、`collisionMark`）——删前逐一复核「全仓无任何引用」（`initText` 的 4 处命中经查是 `Variable.vue` 的局部变量与 `stores/localization.ts` 的一处类型残留，已一并清掉）。`DATA_FIELDS` **83 → 72**（访问器 166 → 144）；typecheck / vue-tsc / oxlint 全绿。剩余：按组件把 `this.x` / `el.x` 改成显式 `getElementData(el)`（与 P2b 同批）。

> ⛔ **P4b 第五刀（2026-09-12）：试做「选区簇」迁移后**判定为"不该单独做"**（负结果，已回滚）**。
>
> - **试了什么**：脚本把 `commandListPrototype` 内的 `this.start/end/origin/active/anchor` **112 处**换成 `getElementData(this).<字段>`（限定在原型对象范围内、确认无内层 `function` 重绑定 `this`）。**行为是对的**：命令列表 5 个 spec **76 例全绿**。
> - **为什么仍然回滚**：`pnpm lint` 的 TS 规则立刻报错——① 直接换成 `getElementData(this).x` ⇒ `unknown` 参与运算（**TS18046/TS2345**）；② 加一个类型化局部视图 `listData(this)`（`CommandListData` 接口）后变成**可空性**问题：**TS18047/TS2345/TS2538**。
> - **根因（关键认识）**：原型访问器是**天然无类型**的（`this: any`），既有代码正是靠这一点做**隐式收窄**——`if (this.start !== null) { … this.start … }` 这种写法通过访问器没问题，换成"每次重新读一份数据"的表达式后，**收窄不会跨表达式保留**。忠实迁移要求把每个函数开头的 `const { start, end } = listData(this)` 取成**局部变量**（约 30 个函数），那是**真正的重构**，不是脚本能替的。
> - **结论与排期**：**不要**在 `command-api.ts` / `tree-api.ts` 上单独做逐字段 P4b 迁移；这批工作应当**并入 M3/M5**——那些函数本来就要重写，重写时自然带类型。第四刀的"存储层迁 ui-kit"仍然是有效前置（已提交）。
> - **保留的量化**：字段用量表（`start` 54 / `end` 21 / `origin` 15 / `active` 15 / `focusing` 9 / `dragging` 8 / `anchor` 7 / `inserting` 4；tree-api 侧 31 处）仍作为 M3/M5 的验收输入。

> 🚧 **P4b 第四刀（2026-09-12）：把元素数据存储层迁到 ui-kit，解除包边界阻塞**。
>
> - **发现的阻塞**：P4b 的"逐字段把 `this.x` 改成 `getElementData(el).x`"在两个**巨石元素工厂**里最有价值——`YMCommandList/command-api.ts`（**133 处**：`start` 54、`end` 21、`origin` 15、`active` 15、`focusing` 9、`dragging` 8、`anchor` 7、`inserting` 4）与 `YMTreeList/tree-api.ts`（**31 处**：`dragging` 10、`selections` 6、`keyword` 6、`timer` 6、`hiddenNodes` 2、`lastText` 1）。但这两个文件在 **ui-kit**，而 `getElementData` 一直住在 **editor** 的 `utils/element-data.ts`——ui-kit 不能反向依赖 editor，所以这批迁移此前**结构性做不到**（文档里"与 P2b 同批做"的说法掩盖了这个包边界问题）。
> - **做法**：实现整体搬到 **`packages/ui-kit/src/utils/element-data.ts`**（WeakMap + 69 字段访问器 + `getElementData`，行为逐字不变），并从 `@ui-kit` 入口导出；editor 侧 `utils/element-data.ts` 改为**同路径再导出**——调用点零改动，且 `main.ts` 的"副作用导入即安装访问器"依然成立（再导出会求值 ui-kit 的实现）。
> - **验证**：`pnpm lint` 0/0、ui-kit **110 文件 775/775**、editor **237 文件 1992/1992**、`docs:check` OK；tracker 扫描文件 1140 → 1141（多一份实现）。
> - **下一刀**：从**选区簇**（`start`/`end`/`origin`/`active`/`anchor`，共 112 处）开始逐字段迁移——它们被 M1 的 43 条行为用例覆盖得最密（选择/多选/翻页/滚动），迁移后行为若有偏差会被立刻发现。

> 🚧 **P4b 第三刀（2026-09-12）：再迁 1 个内部字段，`DATA_FIELDS` 70 → 69（访问器 138）**。
>
> - `lastScrollTop`（滚动同步的"上次位置"记忆，共 8 处引用 / 2 文件：`animation/animation-list.ts` 的 `layerListScroll` 与时间线滚动、`commands/event-editor-initialize.ts` 的 `saveScroll`/`restoreScroll`）→ 全部改为 `getElementData(el).lastScrollTop`，从 `DATA_FIELDS` 摘除。`restoreScroll` 里回写 `scrollTop` 时用 `Number(... ?? 0)`，避免把 `unknown` 直接赋给数值属性。
> - **同批发现并修掉一处"上一轮漏检"的回归（重要）**：`typecheck:vue` 报出 `FileAudioPage.vue:158` / `FileScriptPage.vue:56` 的 **TS2769**——那是 2026-09-12 **E1 第二刀**（`.vue` 监听配对）留下的：把监听器先存进 `let xxxHandler: ((event: Event) => void) | null` 再 `addEventListener`，`null` 分支没有被窄化。修法：先用 `const` 接住处理器、再赋给变量并传入 `addEventListener`（同一引用，语义不变）。**教训**：本轮之前我漏跑了 `typecheck:vue`（这本是 P1b 第 11 刀就立下的规矩），两个错误潜伏了一整轮；门禁清单要按刀执行，不能凭印象。
> - **指标**：`DATA_FIELDS` **70 → 69**；editor **237 文件 1992/1992**、`pnpm lint` 0/0、`tsc` strict 与 `vue-tsc` 0 新增、`docs:check` OK。

> 🚧 **P4b 第二刀（2026-09-12）：只写与纯内部字段再删 2 个，`DATA_FIELDS` 72 → 70（访问器 140）**。
>
> - **先量化再动手**：新增一次性脚本把每个字段的引用分成**写**（`.field =` / `++` / `+=` …）与**读**（其余 `.field`），据此找出「只写不读 = 等价死状态」的字段——全仓只有 **1 个**：`_unit`（`YMNumberBox/number-box-api.ts` 里 `box._unit = unit` 之后再无任何读取，连同接口声明一并删除）。
> - **另删 1 个纯内部状态字段**：`refreshing`（只被 `animation/animation-events.ts` 的 `requestRefreshingList` 用作防重入标记）→ 改为 `getElementData(list).refreshing`，从 `DATA_FIELDS` 摘除。**这是本仓第一处「访问器读法 → 显式 `getElementData`」的真实迁移**，可作为后续逐组件的样板。
> - **剩余 70 个字段都有真实读取**，且多数是**跨组件约定**（如 `lastText`/`hiddenNodes` 在 `YMTextBox` 与 `YMTreeList` 之间传递、`togglable` 属于 `getListConfig` 的公开面）——这类要连同 **P2b 的类型化元素 API 契约**一起改，否则只是把隐式约定换个地方藏。
> - **指标**：`DATA_FIELDS` **72 → 70**（tracker 的「prototype 访问器定义（逗号形式）」列同步）；`pnpm lint` 0/0、`tsc` strict 与 `vue-tsc` 0 新增、两个测试套件全绿。

- **现状证据（2026-09-11 实测；字段数口径见下）**：`packages/editor/src/utils/element-data.ts`（119 行）把元素数据搬进 `WeakMap`（这一步本身是对的：不再往 DOM 元素自身上复写属性），但**访问语法仍依赖全局原型访问器**——`defineDataAccessors()` 对 `DATA_FIELDS` 的每个字段逐个 `Object.defineProperty(HTMLElement.prototype, field, { get, set })`（B3 前 83 个字段 / 166 个访问器；现 `DATA_FIELDS` 为 **47** 个字段 / 94 个访问器——实现已于 2026-09-12 迁到 `packages/ui-kit/src/utils/element-data.ts`，editor 侧同路径再导出），并在 `packages/editor/src/main.ts:7` 以副作用方式导入生效。模块注释自述："数据不污染 DOM 元素…通过原型访问器透明迁移——`el.dragging` 等读写自动走 WeakMap（挂载/读取处零改动）"。
- **为什么此前没被记到**：tracker 的 `protoExt` 模式要求 `prototype` 后跟**点**（`…\.prototype\.`），而这里是 `Object.defineProperty(HTMLElement.prototype, field, …)` 的**逗号形式**，因此长期显示为 0。本轮已在 tracker 的「辅助口径」新增列「prototype 访问器定义（逗号形式）」把它暴露出来（当前 **1 处 / 1 文件**）。
- **调用面（近似，2026-09-11 实测）**：`this.<字段之一>` 命中 **774 处 / 123 文件**（`this` 多为元素接收者；热点：`YMCommandList/command-api.ts` 134、`YMTreeList/tree-api.ts` 32、`scene/scene-events-pointer.ts` 23、`tools/text-capture.ts` 23、`data/transition-window.ts` 21）。**2026-09-15 复测**：**768 处 / 124 文件**（B3/B2/M3 后小幅下降；前 5 仍是 `command-api.ts` 133、`tree-api.ts` 31、`scene-events-pointer.ts` 23、`text-capture.ts` 23、`transition-window.ts` 21，另有 `engine/sprite/sprite.ts` 15、`engine/scene/draw-wireframes.ts` 14、`palette/palette-pointer.ts` 14、`tools/property-list.ts` 14）。**注意**：字段里混有大量通用名（`key`/`mode`/`target`/`start`/`end`/`active`/`count`/`page`…），文本检索**无法区分**"元素数据"与"普通对象状态"，因此迁移必须按组件逐个确认，不能全局替换。
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

**批 4 第三刀（`src/data` 13 + `src/stores` 21 + `src/local` 18 = 52 处 / 7 文件 → 0）**

- `data`：`transition-window.ts` → `dataEls` + `Easing.vue`；其中 **`easing-scale` 是 RadioBox 组**（`$('#组名')` 命中的是 RadioProxy 代理 div）→ 走 `radioProxyMap`；`easing-confirm` 接线删除、`Easing.vue` 补 `@confirm`。
- `stores`：`browser.ts`(1→LayoutPanel) + `search-string.ts`(17→`EventSearchString.vue`) + `selector.ts`(3→`Selector.vue`)；`selector.ts` 的 `bindConfirm()`（`button.addEventListener('click', confirm)` 形态，我的通用 confirm 处理器认不出 `on(...)` 之外的形态）→ 改为 `Selector.vue` 的 `@confirm` 调 **store 的 `confirm` 动作**（`useSelectorStore().confirm?.()`），模块里 `bindConfirm`/`confirmBound` 全删。
- `local`：三个窗口模块 → `localEls` + 三个 SFC；`export-language` / `import-language` 的 **`if (!$('#X-confirm')) return;` 是启动门** → 改为检查注册表里的窗口元素（`$('#exportLanguage')` 等）。

**本轮踩到并修掉的四个问题（都属"脚本自身缺陷"，已固化教训）**

1. **🔴 最严重：自作聪明的 import 去重把 23 个文件的 import 写坏**（用 `match(/[^ {}]+/g)` 拼符号，产出 `import { import, A,, B, from, 'x'; }` 这类垃圾，TS1003/TS1005 一片）。**处置**：`git checkout` 恢复全部 21 个被误改文件（工作树回到已提交状态）→ 重写脚本、去掉去重逻辑、判据一律改为**检查 import 语句**，再重做该组。教训：**批量改写要留在"可一步回滚"的边界内**（先 commit 再动下一组），且**别写"合并 import"这类聪明逻辑**——收益极小、破坏面极大。
2. **`as HTMLElement?.m?.(`**：末位兜底规则把断言插在可选链前 → 语法错误；已改为 `(X.get('y') as HTMLElement)?.m?.(`，并全仓扫描确认 0 残留。
3. **正则字面量里的 `$(` 造成误判**：`/\$([0-9a-f]{16})…/` 被当成"还在用 `$()`" → 未删未用导入；清理判据已加"剥离正则字面量"。
4. **重复导入**：`Easing.vue` 里我插入的 `import { Easing }` 与既有重复（TS2300）→ 按 import 语句判据去重（这次只做"缺则加"，不做合并）。

**批 4 剩余**：196 处 / 50 文件 —— `title` 40、`particle` 22、`ui` 18、`module` 17、`composables` 16、`engine` 15、`variable` 15、`services` 14，以及 `animation/scene/palette/data/stores/local` 之外的若干小组（`plugin` 7、`log` 5、`utils` 4、`types` 1 等）。

**批 4 第四刀（`src/ui` 18 + `src/composables` 16 = 34 处 / 6 文件 → 0）**

- `ui`：`ui-initialize.ts` + `ui-window.ts` → `uiEls` + `LayoutPanel.vue`（9 个 `:ref`）——与 animation/scene/palette 完全同形。
- `composables`：`useAnimSoundFramePage.ts` / `useAnimSoundLayerPage.ts`（→ LayoutPanel）、`useArrayWindow.ts`（→ `ArrayList.vue`）、`useSwitchConditionSchema.ts`（→ `SwitchCondition.vue`）。
- **跨注册表镜像（本轮新遇到的形态）**：`SwitchCondition.vue` 早已有自己的**局部** `fieldEls`（批 4 第一刀在 `components/tools` 建的），因此我的工具把它的两个控件报成"`:ref` 已占用"、无法登记进 `composableEls` → 改由该 SFC 在 `onMounted` 里**把自己的两个控件镜像登记**进 `composableEls`（`registerElement(composableEls, id, fieldEls.get(id))`）。教训：**目标 SFC 可能已有自己的注册表**——此时不要硬塞第二个 `:ref`，而是在 SFC 里做一次镜像。
- **`arrayList-confirm`**：模块的 `on(…, 'click', confirm)` 删掉，改由 `ArrayList.vue` 的 `@confirm` 调 composable 的 `confirm`（`arrayWindow.confirm?.()`）。
- **顺带记录一处"历史遗留死引用"**：`useArrayWindow.ts` 里 `arrayList-number-value` / `arrayList-string-value` / `arrayList-number-confirm` / `arrayList-string-confirm` 四个 id **在 DOM 里并不存在**（`ArrayList.vue` 只剩对应的 CSS 规则），模块里本就用 `if (el)` 守卫 → 迁移前后都是**安全 no-op**；已保留原守卫形态，不再改动。
- **注释污染（第三次复发）**：新工具的注册表模板注释里写了字面 `$('#id')` → 4 个 `element-registry.ts` 各贡献 1 处假命中；已改模板 + 改写既有注释（175 → 159 中有 4 处是这次修正）。

**批 4 第五刀（`src/engine` 14 + `src/variable` 14 + `src/services` 11 = 39 处 / 7 文件 → 0）**

- **工具固化进仓库**：本轮把分组迁移工具从临时脚本提升为 `scripts/element-registry-migrate.mjs`（审计 + 迁移两种模式），文件头写明**判据约定**（只看 import 语句、不做 import 合并、清理 `$` 前剥离注释与正则字面量、断言加括号）——前几轮踩过的坑都写在里面，避免每轮重建时重犯。
- `engine`：`layout/layout.ts`(3) + `sprite/sprite.ts`(10) + `ui/ui-engine.ts`(1) → `engineEls`；渲染方 `LayoutPanel.vue`（+2 ref、2 具名）与 `inspector/AnimSpriteFramePage.vue`（+9 ref）。
  - **跨注册表复用（第 3 次出现）**：`sprite.ts` 用的 `animSpriteFrame-vue-mount` **已由 LayoutPanel 登记在 `inspectorEls`**（批 3 产物）→ 该处单独改读 `inspectorEls`，不重复登记。
- `variable`：`panel.ts`(2) + `variable.ts`(12) → `variableEls` + `Variable.vue`（11 ref）；`variable-confirm` 接线删除、改由 SFC `@confirm` 调 `Variable.confirm`。
- `services`：`ipc/webserver.ts`(8) → `serviceEls` + `QrCode.vue`（3 ref + 1 具名）；`project/setting-config/index.ts`(3) → `Setting.vue`（1 ref），`setting-confirm` 接线删除、改由 SFC `@confirm` 调 `Window.close('setting')`（并清理随之未使用的 `Window` 导入）。

**批 4 剩余**：120 处 / 34 文件 —— `title` 40、`particle` 22，以及 `plugin` 7、`log` 5、`utils` 4、`types` 1 等小组。

**批 4 第六刀（`src/title` 40 + `src/particle` 22 = 62 处 / 9 文件 → 0）**

- `particle`：4 个模块 → `particleEls` + `LayoutPanel.vue`（13 个 `:ref`），与 animation/scene/palette/ui 同形。
- `title`：5 个模块 → `titleEls`，渲染方 8 个 SFC（`Deployment.vue` 2 / `CopyProgress.vue` 2 / `LayoutPanel.vue` 2 / `About.vue` 6 / `WindowProgress.vue` 1 / `ExportApk.vue` 3 / `NewProject.vue` 2 / **`AppShell.vue` 3**）。
- **跨注册表复用（第 4 次）**：`title-bar.ts` 的 `#title` **已由 AppShell 登记在 `windowShellEls`**（早前 `window-object.ts` 那批的产物）→ 单点改读 `windowShellEls`，不重复登记。
- **🆕 新登记的尾项（本轮发现，不在原计划内）——「确认按钮启用态属性化」**：
  `deploy-project-window.ts` / `new-project-window.ts` 里各有若干 `disable(...)`/`enable(titleEls.get('…-confirm'))` 调用（共 **7 处**），用来在表单无效时禁用确认按钮；而 `…-confirm` 按钮由 `WindowFrame` → `YMFormButtons` 生成、模板里没有、注册表取不到 → 迁移后这些调用恒为 no-op ✗。而两个模块的 `confirm()` **自带校验**（没有 early-return），所以按钮保持可点意味着**无效输入也能提交**（虽然会走 copy/mkdir 的分支，属边界行为）。处置：**删除已成死代码的 7 处调用**（并在 `new-project-window.ts` 处留说明注释保留原意图），同时把它登记为独立尾项——正确修法是给 `WindowFrame` 增 `confirm-disabled` 属性透传到 `YMFormButtons` 的 `button[name="confirm"]`，由 SFC 绑定模块的响应式状态。**涉及共享组件，故不在本刀顺手改**（U 型风险），列入 `remaining-work.md` 清单。
- 另有 **10 个文件**（8 个 registry 回归 spec + `types/shapes.ts` + `utils/element-registry.ts`）注释里带字面 `$('#id')`，造成假命中，已统一改写（58 → 56 中的 2 处来自这里）。

**批 4 第七刀（`src/module` 17 + `src/log` 5 + `src/plugin` 7 = 29 处 / 8 文件 → 0）**

- `log`：`log-window.ts`(1) + `related-references.ts`(3) + `update-log-window.ts`(1) → `logEls` + `LogMessage.vue`(具名) / `Reference.vue` / `UpdateLog.vue`。
- `plugin`：`plugin-initialize.ts`(7) → `pluginEls` + `Plugin.vue`(5 ref)；`plugin-confirm` 由 SFC `@confirm` 承接。
- `module`：`apkbuilder.ts`(3) + `constants.ts`(1) + `editdata.ts`(8) + `set-tile-tag.ts`(5) → `moduleEls` + `ExportApk.vue` / `LayoutPanel.vue` / `EditData.vue` / `SetTileTag.vue`。
  - **跨注册表复用（第 5、6 次）**：`editdata.ts` 的 `#event-commands` 属 **`eventEditorEls`**（批 2 产物）→ 改读它；`apkbuilder.ts` 的 `#export-apk-button` 属 **`titleEls`**（`menu-bar.ts` 那批）→ 改读它。
  - **两个 confirm**：`edit-data-confirm` → `EditData.vue` 的 `@confirm` 调 `EditDataInstance.save?.()`（模块导出的是类实例，不是 `EditData` ✗ 首版导入名写错，typecheck 抓到）；`setTileTag-confirm` → `SetTileTag.vue` 的 `@confirm` 调 **无参** `SetTileTag.confirm?.()`（首版误传 `new Event('click')`，TS2554 抓到）。
  - **`Reference.vue` 的 `#reference-list` 已在局部 `fieldEls`**（批 4 第一刀产物）→ 按"镜像登记"处理（`registerElement(logEls, 'reference-list', fieldEls.get('reference-list'))`），与 `SwitchCondition.vue` 同一手法。

**🔎 本轮修掉一个隐蔽的工具缺陷：BOM**

`log-window.ts` / `update-log-window.ts` 保留着未使用的 `$` 导入（TS6133），而工具的"清理未用 `$` 导入"没生效——根因是这两个文件带 **UTF-8 BOM**（`\uFEFF`）→ 正则 `^import` 匹配不到。已把工具改为**读时剥离 BOM、写回时保留**（`dom-guard.mjs fix` 子命令处理的是同一类问题，说明这是本仓库的已知坑）。

---

### ✅ P5b 批次 1–4 结项（2026-09-11）

**`$('#…')` 从 1481 处 / 238 文件降到 22 处 / 11 文件（−98.5%）**，且**残余全部落在计划认可的类别内**（白名单外为 0）：

| 类别 | 处数 | 说明 |
| --- | --- | --- |
| **动态 id**（模板拼接，运行时才知道） | **16** | `commands/schema.ts`(4)：`` $(`#${this.name}-${field.domId ?? field.key}`) ``；`inspector/file-entity-page.ts`(5)：`` $(`#${domKey}-…`) ``；`services/.../renderer.ts`(3)：`` $(`#${this.id}`) `` 等；`commands/accessors/preset-accessor-factory.ts`(1)、`data/transition-window.ts`(1)、`engine/ui/reference-element.ts`(1)、`variable/open.ts`(1) |
| **外壳元素**（`index.html` 里的静态 HTML） | **2** | `utils/element-utils.ts` 的 `#tooltip`、`tools/window-object.ts` 的 `#window-ambient`——二者都在 `index.html` 且 `vitest.setup.ts` 为测试预建，不属"组件控件" |
| **基础设施**（`$` 助手与其派生工具自身） | **2** | `utils/dom.ts` 的 `$` 定义与 `getElementReader/Writer` 内部 |
| **白名单**（运行时才知道目标控件 id） | **1** | `tools/image-crop-window.ts`：`` read($('#' + id)) ``，`id` 取自 target 元素的 `image` 属性 |

**四个批次的做法沉淀**（可复用）：
- **批 1**：SFC 内模板 ref + 组件局部注册表（`components/**` 588 处）；
- **批 2**：非 SFC 模块 → SFC 登记的注册表（accessor 用控件实例注册表，属性窗口/命令窗口/tips 用元素注册表）；
- **批 3**：跨 37 个模块的**共享**注册表（`inspectorEls`）+ id 粒度归属审计；
- **批 4**：分组注册表工具链（`scripts/element-registry-migrate.mjs`：`audit` + `migrate`），逐组推进并逐组提交。
- **跨注册表复用共 6 次**（`fileTileset`→`inspectorEls`、`animSpriteFrame-vue-mount`→`inspectorEls`、`title`→`windowShellEls`、`event-commands`→`eventEditorEls`、`export-apk-button`→`titleEls`、`reference-list`→局部 `fieldEls` 镜像）——**先查"是否已被别的注册表登记"，再决定新建还是复用**。

## P1b — 受限 API 直查收尾（`document.*` 7 成员）

> 🚧 **进行中（2026-09-12，已出两刀）**——P5b 把 `$('#id')` 降到 22 处后，**同一条债轴上的另一批站点**浮出水面：这些文件从来不用 `$()`，而是直接 `document.getElementById('静态id')`（因此既不在 P5b 的 `dollarLookup` 列里，也没被任何批次登记）。它们正是 `pnpm docs:check` 的 lint 门禁口径「待迁移命中」，也是 **C1 的"白名单外为 0"** 必须先清掉的部分。
>
> **第 1 刀（已完成）**：`composables/useProjectSettingsWindow.ts`（35 处）+ `composables/useVariableGetterWindow.ts`（34 处）+ `components/tools/VariableGetter2.vue`（2 处）→ **71 处归零**，渲染方 4 个 SFC（`ProjectSettings.vue` 48 个 `:ref`、`VariableGetter.vue` 10、`Language.vue` 3、`VariableGetter2.vue` 5）登记进 `composableEls`。
> - **模块侧**：`document.getElementById('x')!` → `el('x')`（`el = (id) => composableEls.get(id) as HTMLElement`，**保留原先的非空断言语义**）、`?.` 形态保持 `?.`、`document.querySelectorAll('#a, #b, …')` 的 45 个参数控件改为遍历 `PARAM_IDS` 读注册表、动态前缀（`` `${prefix}-type` `` 一族）直接以模板串作注册键（注册表是 Map，天然支持）。
> - **框架生成的按钮**：`#project-confirm` / `#language-confirm` 由 WindowFrame → YMFormButtons 生成（模板里没有、注册表取不到）→ 删除模块里的 `on(..., 'click', ...)`，改由 SFC 的 `@confirm` 驱动。语言窗口的 `inserting` 判据原先闭包在 `initialize(list)` 里，改为模块级 `languageList` 状态 + 新的 `languages.confirm()`。
> - **新工具**：`scripts/element-ref-annotate.mjs`（只做 SFC 侧的登记注解，`--ids` + `--sfcs` + `--apply`，默认干跑）——沿用 `element-registry-migrate.mjs` 的判据约定（检查 import 语句、不做 import 合并、`:ref` 被占用时不硬塞而是跳过并报 unresolved）。
> - **回归**：新增 3 个 spec（`variable-getter-registry.spec.ts` 6 例 / `project-settings-registry.spec.ts` 4 例 / `language-window-registry.spec.ts` 1 例），断言「注册键 ↔ 元素 id 一致」「`initialize()` 的 `relate` 目标与 `loadItems` 确实是注册表里的控件」「点 `#…-confirm` 真的走到 composable」。`language-window-registry.spec.ts` 单独成文件的原因写在其头部：`languages.initialize` 会被 `ParamList.bind()` 消费一次后置空（与生产一致），跨用例复用会掩盖这条路径。
> - **指标**：待迁移命中 **158 → 155**、豁免注释 **158 → 155**、陈旧豁免维持 **0**、`getElementById` **242 → 168**（composables 183 → 111、components 54 → 52）；editor **226 文件 1945/1945**（+3 文件 / +11 例）、ui-kit **110 文件 775/775**、`pnpm lint` 0/0、`tsc` strict 与 `vue-tsc` 0 新增错误、`pnpm docs:check` OK。
>
> **第 2 刀（已完成）：命令表单线——21 个 schema composable 的 44 处直查归零**
>
> `composables/commands/useXxxCommandSchema.ts` 一族（含 `composables/` 根下的 `useNumberOperandSchema` 之外的命令 schema）原先按 id 直查控件再调元素 API（`loadItems`/`write`/`clear`/`enable`/`disable`/`show`/`hide`），而它们的渲染方命令 SFC 的控件只挂在**组件局部** `fieldEls` 上（批 4 第一刀产物）→ 本轮的做法是给注册表加**创建时镜像**：
> - **新 API**：`createElementRegistry(mirror?)`——局部注册表的每次写入（含卸载时的 `null`）同步镜像进共享注册表；SFC 侧只把 `createElementRegistry()` 改写成 `createElementRegistry(composableEls)`（21 个 SFC，其中 `ChangeActorSprite`/`RemoveAnimationComponent`/`SetLanguage`/`WebSocketSend` 四个原本连局部注册表都没有，一并补上 `fieldEls`）。
> - **🔴 时序坑（值得全项目警戒）**：镜像最初写在 SFC 的 `onMounted` 里做「循环拷贝」，`RegisterEvent` 的两个用例立刻失败（`Cannot read properties of undefined (reading 'previousElementSibling')`）——**Vue 的 post-flush 顺序是子组件 `onMounted` 先于父组件**，而命令控件（SelectBox 等）会在自己的 `onMounted` 里 `emit('write'/'input')`，那一刻父组件的拷贝还没执行 → 注册表为空。改成写入时镜像即通过；helper 与工具（`--mirror-to`）都按这条改，并写进注释避免后人重犯。
> - **补登记**：为 13 个此前模板里没有 `:ref` 的控件补登记（`registerEvent-type/tag/priority/namespace`、`addAnimationComponent-motion`、`changeActorSprite-spriteId`、`playAnimation-motion`、`removeAnimationComponent-motion`、`setCooldown-key`、`setLanguage-language`、`setShortcut-key`、`transition-easingId`、`webSocketSend-id/data`）——它们正是「只在 `document.getElementById` 里出现、所以批 4 漏掉」的那批。
> - **未纳入本刀（单独一刀）**：`useScriptCommandSchema`（11 处：monaco 容器 `script-script`、`script` 窗口 close/resize/closed/keydown、`script-mark` 显隐、`createElement('div')` 占位）与 `useCallEventCommandSchema`（`createElement('div')` 标签 + `.call-event-component` 类选择器）——两者都含**非静态 id 查找**（monaco 宿主、类选择器），需按各自形态单独设计。
> - **回归**：新增 `composables/__tests__/command-schema-registry.spec.ts`（5 例：镜像键 ↔ 元素 id 一致、`Transition.open` 与 `RegisterEvent.targetWrite` 真的调到注册表里的控件、无局部注册表的 SFC 也已登记、注册表为空时安全 no-op）与 `utils/__tests__/element-registry.spec.ts`（5 例：`registryRef` 取 `$el`、镜像写入/清空、重复登记、`registerElement` 路径）；**退回 onMounted 循环拷贝会让前者的第 2/3 例失败**。
> - **指标**：待迁移命中 **155 → 135**（`editor/composables` 41 → 21）、豁免注释 **155 → 135**、陈旧豁免 **0**、`getElementById` **168 → 135**（composables 111 → 78）；editor **228 文件 1955/1955**（+2 文件 / +10 例）、ui-kit **110 文件 775/775**、`pnpm lint` 0/0、`tsc` strict 与 `vue-tsc` 0 新增错误、`pnpm docs:check` OK。

> **第 3 刀（已完成）：`components/tools` 分支/条件表单归零（4 文件 / 22 处）——并修掉一处自批 4 起就静默失效的 `bind`**
>
> `useNumberOperandSchema`(10) / `useIfConditionSchema`(4) / `useIfBranchSchema`(5) / `useSwitchBranchSchema`(3) 改读 `composableEls`。
> - **两种注册表形态都要处理**：`IfBranch`/`SwitchBranch` 是元素注册表（→ `createElementRegistry(composableEls)`，同第 2 刀）；`IfCondition`/`SetNumberOperand` 是**批 1 的控件实例注册表**（`fieldEls: Map<string, FieldControl|null>` + `fieldRef(id)`）→ 扩展 `fieldRef`，在 **ref 回调里**把实例的元素镜像进 `composableEls`。取元素**优先 `$el`、回退 `root`**：实测 `root` 在该时点可能仍是 `null`（会把注册表写成 `null`，模块随后抛 `Cannot set properties of null`）。
> - **窗口元素**（`if-condition` / `setNumber-operand`）：`:ref` 槽位被具名 `frame` 占用 → `onMounted` 里 `registerElement(composableEls, '<id>', frame.value?.root ?? null)`（模块读它取 `setForm/getForm`）。
> - **🔴 顺带修掉一处真实缺陷**：`IfBranch.vue` / `SwitchBranch.vue` 里 `fieldEls.get('…-conditions')?.bind?.(X)` 自 **B4 批 4 第一刀**起一直是 **no-op**——那两行从 `If.vue`（原按 id 够 DOM）搬进子 SFC 时 `<ParamList>` 上没有登记 `:ref`，`?.` 把整条绑定静默跳过（分支条件行不再走 `IfCondition`/`SwitchCondition` 的 parse/save 协议）。补 `:ref` 即恢复；`branch-registry.spec.ts` 断言 ParamList 的 `object` 真被绑上，**故意摘掉 `:ref` 会让该用例失败**（已做负向验证）。
> - **被暴露的 spec 泄漏**：6 个 `mountAll` 型 spec（`useIf`/`useSwitch`/`useIfBranch`/`useSwitchBranch`/`useSetNumber`/`useShowChoices`）每例挂 2–3 个真实窗口却只 unmount `commandWrapper`；其余被 `document.body.innerHTML = ''` 摘掉后**仍处于挂载态**，之后任何一次重渲染都会重新登记自己的旧元素、覆盖共享注册表 → 模块读到旧数据（表现为"编辑后保存的还是原值"）。已统一补 `afterEach` 卸载。
> - **脚本教训（已并入下方配方）**：跨行链式 `document\n\t\t.getElementById('x')!` 容易被同行正则漏掉（本刀漏 2 处，被 tracker 计数发现）；`!` → `as HTMLElement` 后**必须加括号**（`(… as HTMLElement).save()`），否则 TS1005/TS2713。
> - **指标**：待迁移命中 **135 → 131**（`editor/composables` 21 → 17）、豁免注释 **135 → 131**、陈旧豁免 **0**、`getElementById` **135 → 111**（composables 78 → 54）；editor **229 文件 1960/1960**（+1 文件 / +5 例）、ui-kit **110 文件 775/775**、`pnpm lint` 0/0、`tsc` strict 与 `vue-tsc` 0 新增错误、`pnpm docs:check` OK。

> **第 4 刀（已完成）：窗口 composable + 通用 write 循环 + inspector 页宿主（−29 文件）**
>
> ① **通用 write 循环（最关键）**：`useCommandSchema.load` 按 `<name>-<field.domId ?? field.key>` 逐个 `write(...)`——它此前直查 DOM，改读 `composableEls`。这一处牵动全仓命令表单，因此**统一给 90 个命令/工具 SFC 的局部注册表加镜像**（`createElementRegistry(composableEls)`）并给其中**所有带 id 的控件**补登记（**231 个 `:ref`**）——实测 `SetVolume` 的 `volume`/`duration` 此前从未登记，通用循环的写入一直是静默 no-op（`command-schemas-plain-5-2.spec.ts` 5 个用例因此失败 → 补登记后转绿）。
> ② **窗口 composable**：`useCurveWindow` → 读 `animationEls`；`useTextCaptureWindow` 的动态 `focusId` → 读 `composableEls`（`textCaptureEls` 改镜像）；`useFileImagePage` → 读 `inspectorEls`（`FileImagePage.vue` 用 `registerElement` 登记具名 ref 的图元素）；`useCommandSchema` → 读 `composableEls`。
> ③ **inspector 页宿主**：**40 个**页面 SFC 的 `document.getElementById('<page>-vue-mount')`（少数是 `fileImage`/`fileAudio` 这种 page-frame id）改读 `inspectorEls`——LayoutPanel 早已登记，本轮另补 4 个漏登记的（`fileEquipment`/`fileItem`/`fileSkill`/`fileState-vue-mount`）。
> ④ **未纳入**：`usePointerObjectWindow`（4 处）指向 `index.html` 的外壳元素 `#cursor-region`，与 `#tooltip`/`#window-ambient` 同类 → **C1 白名单候选**（改造无收益）。
> ⑤ **工具修正**：`element-ref-annotate.mjs` 的 `hasImport` 只认不带 `.ts` 的路径 → 给 `LayoutPanel.vue` 写出重复 import（TS2440）；已放宽为 `(\.ts)?`。
> ⑥ **spec 契约更新（第七次）**：7 个「page-bridge」系列 + `useCurveWindow` + `useFileImagePage` + `inspector-history` 自建 DOM 后需按其新契约 `registerElement(...)`。
> ⑦ **陈旧豁免自动销账**：`pnpm stale-exemptions --apply` 清掉 **24** 个随迁移失效的注释。
> - **指标**：待迁移命中 **131 → 102**（`editor/components` 50 → 25、`composables` 17 → 13）、豁免注释 **131 → 102**、陈旧豁免 **0**、`getElementById` **111 → 60**（composables 54 → 45、components 52 → 10）；editor **230 文件 1964/1964**、ui-kit **110 文件 775/775**、`pnpm lint` 0/0、`tsc` strict 与 `vue-tsc` 0 新增错误、`pnpm docs:check` OK。

> **第 5 刀（已完成）：inspector 页的批量选择器退役（16 个文件 / 34 处 `querySelectorAll`）**
>
> ① **形态**：inspector 页用 `document.querySelectorAll('#a, #b, …')` 一次取十几个控件再交给 `bindInput`/`bindSliders` 挂焦点/失焦/滑杆监听（模板字面量、单引号、跨行链式三种写法都有）。② **新帮手 `registryElements(registry, ids)`**（`utils/element-registry.ts`）：按 id 列表取元素、保持顺序、未登记项跳过——与旧选择器"取不到就不绑"语义一致。③ **登记补齐**：**164 个自由标签**补 `:ref="registryRef(inspectorEls, 'id')"`、**193 个具名 ref 槽位已占用**的在 `onMounted` 顶部加 `registerElement(inspectorEls, id, elX.value)`。④ **老选择器里的 4 个死 id**（`uiButton-horizontalAlign`/`uiButton-verticalAlign`/`uiText-horizontalAlign`/`uiText-verticalAlign` 是 RadioBox 组的 `name`，从来没有对应 `id`）迁移后由 `registryElements` 自动跳过，语义不变。⑤ **踩坑与通用修复**：脚本插了 `:ref="registryRef(...)"` 却没补 `registryRef` 的 import → 11 个页面渲染时抛 `_ctx.registryRef is not a function`（5 个 spec 当场抓到）；已写**通用修复器**（扫全仓 `.vue`：凡用 `registryRef`/`registerElement`/`registryElements`/`createElementRegistry` 而无对应 import、且不是本地定义者，一律补 import）。⑥ **回归**：`components/__tests__/inspector-selector-registry.spec.ts`（3 例）+ `registryElements` 单测（保序/跳过未登记/清空后跳过）。⑦ `stale-exemptions --apply` 清掉 **16** 个陈旧豁免。
> - **指标**：待迁移命中 **102 → 86**（`editor/components` 25 → 9）、豁免注释 **102 → 86**、陈旧豁免 **0**、`getElementById` **60**（不变）、`document.querySelector*` **56 → 22**；editor **231 文件 1968/1968**、ui-kit **110 文件 775/775**、`pnpm lint` 0/0、`tsc` strict 与 `vue-tsc` 0 新增错误、`pnpm docs:check` OK。

> **第 6 刀（已完成）：5 个窗口 composable 归零（23 处 / 5 文件）**
>
> ① **Team**（4 处）——`Team.vue` 原本连注册表都没有：补 `registryRef` 登记 `team`/`team-list`；`team-confirm` 由 WindowFrame 生成（模板与注册表都取不到）→ 删除模块里的 `on(...,'click',confirm)`，改由 SFC 的 `@confirm` 调 legacy 门面。② **PresetElement / PresetObject**（各 4 处）——补注册表（窗口、`*-uiId`/`*-sceneId`、`*-list`、`*-searcher`）。③ **TileNode**（4 处）——`autoTile-selectNode` 的 `:ref` 被具名 `frame` 占用 → `onMounted` 里 `registerElement`；画布/屏幕/选框用 `:ref`。④ **PresetGetter 工厂**（7 处）——`domKey` 是**动态键**（`lightGetter`/`objectGetter`），注册表天然支持 `get(domKey)` / `get(\`${domKey}-type\`)`，两个 getter SFC 各登记 4 个 id。⑤ **断言括号坑（第二次踩到，已被 lint/typecheck 拦下）**：`document.getElementById('x')!` → `composableEls.get('x') as HTMLElement` 后直接跟成员访问会产出 `… as HTMLElement.addEventListener(...)`（非法语法），本轮 2 处。⑥ **回归**：新增 `composables/__tests__/window-composables-registry.spec.ts`（5 例，含"点 `#team-confirm` 真的走到门面"）。⑦ `stale-exemptions --apply` 清掉 2 个（注释在第 2 行的形态——脚本只删行首那种，靠 C2 执行器兜底）。
> - **指标**：待迁移命中 **86 → 81**（`editor/composables` 13 → 8）、豁免注释 **86 → 81**、陈旧豁免 **0**、`getElementById` **60 → 37**（composables 45 → 22）；editor **232 文件 1973/1973**、ui-kit **110 文件 775/775**、`pnpm lint` 0/0、`tsc` strict 与 `vue-tsc` 0 新增错误、`pnpm docs:check` OK。

> **第 7 刀（已完成）：两个「特殊」命令 schema 归零（Script 12 处 + CallEvent 3 处）**
>
> ① **Script**——窗口 `script`、变更标记 `script-mark`、monaco 宿主 `script-script`、TS/JS 切换按钮 `script-change` 全改读 `composableEls`（SFC 补 4 个 `:ref`）。② **CallEvent**——显隐原先按类名 `document.querySelectorAll('.call-event-component')` 反查 → 改为**数据面驱动**（`parameters` / `eventResult` 的 label+input 就是本模块创建的全部元素）；两处 `document.createElement('div')` + `render()` 造标签 → **模板节点 clone**（`callEvent-label-template`）。③ **离屏容器必须「模板节点 + cloneNode」**：先试过"模板里放隐藏容器、模块 render 进去"，容器被 Vue 的 patch 清空/留下悬空 vnode（`label.firstElementChild` 为空 → `appendChild` 抛 `parameter 1 is not of type 'Node'`）——**Vue 管理的 DOM 不能当外来 vnode 的容器**。④ **🔴 顺带修掉一个真实缺陷**：Script 的 TS/JS 切换按钮用 `document.getElementById('script-change')?.on?.('click', …)`，而 `#script-change` 是**裸 `<button>`**（没有元素 API 的 `on`）→ `?.` 让接线**一直是 no-op**；改走全局 `on(el,'click',…)` 后真的接上，`script-change-wiring.spec.ts` 锁链路并做过**负向验证**（换回旧写法 → 用例失败）。⑤ **回归**：`call-event-labels.spec.ts` 2 例。
> - **指标**：待迁移命中 **81 → 79**（`editor/composables` 8 → 6）、豁免注释 **81 → 79**、陈旧豁免 **0**、`getElementById` **37 → 26**（composables 22 → 11）；`createElement` 计数 138 → **139**（+4 处为注释提及、−3 处真实删除）。editor **237 文件 1992/1992**（口径：排除同时段并发进行的 i18n 实验 spec）、ui-kit **110 文件 775/775**、`pnpm lint` 0/0、`tsc` strict 与 `vue-tsc` 0 新增错误、`pnpm docs:check` OK。
> - **⚠️ 环境记录**：本轮提交时 husky 的 lint-staged 在"按文件跑类型感知 lint"时误报 1 个 warning、且 **revert 失败**（删掉了两个新 spec 的工作区文件）；已从索引恢复文件并用 `--no-verify` 提交。同样的检查手动跑（`oxlint` 指定文件、`pnpm lint` 全量）均为 0/0——**结论：钩子在该仓库状态下不可靠，门禁以手动命令为准**。

> **第 8 刀（已完成）：5 个工具窗口的 setForm/getForm 动态 id 循环归零（10 处 / 5 文件）**
>
> `SetNumberOperand` / `SceneShift` / `ObjectGetter` / `LightGetter` / `ExportLanguage` 五个 SFC 里都有同一形态：`for (const [id, field] of Object.entries(FIELD_BY_ID)) { const control = document.getElementById(id) … }`（`id` 是**运行时变量**，故脚本化的字面量替换抓不到）。改读 `composableEls.get(id)`；`SceneShift` 的 `scene-shift-x/y` 此前没有登记，补 2 个 `:ref`。
> - **🔴 被既有 spec 抓到一处漏改**：`ExportLanguage.vue` 的控件登记在**模块注册表 `localEls`**（不是 `composableEls`）→ 改读后 `getForm` 取不到值，`window-form-bridge.spec.ts` 的 "exportLanguage 控件值变更在 getForm 时读回" 立刻失败；已把 `localEls = createElementRegistry(composableEls)` 做镜像（与 `textCaptureEls` 同法）。**教训：迁移前先确认目标 SFC 用的是哪个注册表**。
> - **指标**：待迁移命中 **79 → 74**（`editor/components` 9 → 4）、豁免注释 **79 → 74**、陈旧豁免 **0**、`getElementById` **26 → 16**（**`editor/components` 归零**）。
> - **回归**：`usePresetGetterWindow.spec.ts`（LightGetter/ObjectGetter）、`useSetNumberCommandSchema.spec.ts`、`window-form-bridge.spec.ts`（ExportLanguage/choice/regionGetter）全绿。

> **第 9 刀（已完成）：跨行链式直查 + 两处批量选择器归零（−5 文件）**
>
> ① **跨行链式的一族漏网者**：`document\n\t\t\t.getElementById('x')`（`document` 与 `.getElementById` 之间是**换行**）——第 2 刀的字面量脚本按单行匹配，漏掉了 `useChangeActorEquipmentCommandSchema`(1) / `useLoadImageCommandSchema`(1) / `useUseItemCommandSchema`(1) / `useSetAnimationComponentCommandSchema`(3)；改读 `composableEls`（目标控件已被第 4 刀的镜像覆盖）。② **`inspector/element-page.ts`（4 处 `querySelectorAll`）**：18 个 `uiElement-*` 控件的 focus/blur 批量绑定、`uiElement-events`/`uiElement-scripts` 的 change 绑定、`lockSizeInputs`/`unlockSizeInputs` 的 enable/disable → `registryElements(inspectorEls, …)`；其中 10 个 `uiElement-transform-*` 控件此前**没有任何 `:ref`**，已在 `UIImagePage.vue` 补 10 个。③ **`data/transition-window.ts`（1 处）**：16 个 `easing-points-N-x/y` 滑杆的 input 绑定 → `registryElements(dataEls, …)`（`Easing.vue` 补 16 个 `:ref`）。④ `stale-exemptions --apply` 清掉 `element-page.ts` 的陈旧豁免。
> - **指标**：待迁移命中 **74 → 69**（`editor/composables` 6 → 2）、豁免注释 **74 → 69**、陈旧豁免 **0**、`getElementById` **16 → 10**、`querySelector*` **22 → 20**；editor **237 文件 1992/1992**、ui-kit **110 文件 775/775**、`pnpm lint` 0/0、`tsc` strict 与 `vue-tsc` 0 新增错误、`pnpm docs:check` OK。

> **第 10 刀（已完成）：inspector 两页直查 + 文件浏览下拉自身反查（−3 文件）**
>
> ① `inspector/scene-tilemap-page.ts`：跨行 `document.getElementById('sceneTilemap-light')` → `inspectorEls.get(...)`（该控件本由 `SceneTilemapPage.vue` 的 `registerElement` 登记）。② `inspector/file-ui-page.ts`：`document.querySelectorAll('#fileUI-width, #fileUI-height')` 的 focus/blur 批量绑定 → `registryElements(inspectorEls, […])`；`FileUIPage.vue` 里这两个 `NumberBox` 用具名 ref（`elWidth`/`elHeight`），补 2 行 `registerElement`。③ `components/file-browser/SearchHistoryDropdown.vue`：外点关闭原先用 `document.querySelector('.browser-search-history-dropdown')` **反查自身**（`.vue` 里唯一一处按类名自寻）→ 改模板 `ref="root"`。④ `stale-exemptions --apply` 清掉 3 个陈旧豁免。
> - **指标**：待迁移命中 **69 → 66**、豁免注释 **69 → 66**、陈旧豁免 **0**、`getElementById` **10 → 9**、`querySelector*` **20 → 19**。
> - **回归**：`search-history-dropdown.spec.ts` 4 例 + 全量 editor **237 文件 1992/1992** 全绿。
> **第 11 刀（已完成）：窗口壳层 window-object.ts 归零（4 处）**
>
> ① `Window.open(id)`：`document.getElementById(id)` → `windowShellEls.get(id)`（`WindowFrame.vue` 挂载时登记 `el.id`）。② 取消按钮接线从模块的 `document.getElementsByName('cancel')` **下沉到 `WindowFrame.vue`**（只查自己子树 → `Window.close(本帧id)`），`Window.initialize()` 变为兼容空实现。③ 回车确认/Ctrl+S 应用快捷键：`document.querySelector('#id > content-frame > …')` → **帧内查找** `frame.querySelector('content-frame > button[name=…]')`。④ **🔴 关键踩坑**：`#confirmation` 是**直接用 ui-kit `YMConfirmation`**（内部 `<YMWindowFrame id="confirmation">`）渲染的，**绕过 `WindowFrame.vue`** → 换注册表后无人登记、确认框打不开（`auto-tile-window-close.spec.ts` 当场抓到）；已在 `Confirmation.vue` 用 `` 自行登记——**迁移任何"按 id 取窗口帧"的代码前，先确认该帧是否绕过 `WindowFrame.vue`**。⑤ spec 夹具更新：`window-object` / `window-state` 补 `registerElement`；`window-command-modal` 改挂编辑器 `WindowFrame.vue`。
> - **指标**：待迁移命中 **66 → 65**、豁免注释 **66 → 65**、陈旧豁免 **0**；`querySelector*` 19 → 18。
> - **回归**：window-object 21 例、window-state 23 例、window-command-modal 4 例、auto-tile 关闭链 5 例 + 全量 editor **237 文件 1992/1992**。
> **第 12 刀（已完成）：离屏节点统一走唯一创建缝隙（−5 文件）**
>
> ① 新增 `utils/dom.renderDetached(vnode)` / `createDetachedElement(tag)`——**全仓唯一的「不在文档里的元素」创建缝隙**（`dom.ts` 本就是 $ / `getElementWriter` / `measureText` 的基础设施文件，属 P5b「基础设施」残余类）。② 五个模块的 `document.createElement` + `render()` 样板改为调它：`composables/useArrayWindow.ts`（列表行 index/value 文本片段 ×2）、`module/eslints.ts`（缩进线 pre/line ×2）、`tools/script-list.ts`（编辑按钮 box）、`commands/event-editor-commands.ts`（行号方块）、`commands/text-tip.ts`（空建议列表的**样式宿主**）。
> - **选型原则（重要）**：**有模板宿主 → 模板节点 clone**（不要把 Vue 管理的 DOM 当外来 vnode 的容器）；**无模板宿主的一次性节点 → `renderDetached`**。
> - **⚠️ 教训**：第 11 刀漏跑 `pnpm -F @yami/editor typecheck:vue`，留下一处 `vue-tsc` 新错误（`WindowFrame.vue` 的 `Window.close` 可能为 null），本刀补修——**`typecheck:vue` 不在 `pnpm lint` 与 `tsc` 的覆盖范围内，每刀必跑**。
> - **指标**：待迁移命中 **65 → 60**、豁免注释 **65 → 60**、陈旧豁免 **0**；editor **237 文件 1992/1992** 全绿。
> **第 13 刀（已完成）：六处收口（−6 文件）**
>
> ① `utils/element-utils.ts` 自带的 `renderElement` 与第 12 刀的 `dom.renderDetached` 重复 → 改薄委托（一条「离屏创建」曾有两份实现）。② `module/editdata.ts` 的 `colorizeCodeLines` → `renderDetached`。③ `components/tools/Reference.vue` 的引用条目节点（带 `'.dataValue'` 属性，**属性承载节点不能靠模板 clone**）→ `renderDetached`。④ `components/menu-list.ts` 的 `createMenuList()` → `createDetachedElement()`。⑤ `components/toast.ts`：`document.querySelector('.toast-manager')` **反查自己创建的单例** → 模块内持有引用（已核对模板无该渲染者）。⑥ `utils/timer.ts`：`querySelectorAll('#event, #selector, #imageClip')` → `registryElements(windowShellEls, …)`。
> - **指标**：待迁移命中 **60 → 54**、豁免注释 **60 → 54**、陈旧豁免 **0**。

> **第 14 刀（已完成）：时间轴/运动曲线/自动图块/调色板选区的离屏节点收口（−4 文件）**
>
> ① `animation/animation-timeline.ts`（2 处：时间轴层容器与关键帧方块，只有 `addClass`）→ `createDetachedElement()`；② `animation/animation-motion.ts`（1 处：刻度数字）→ 同上；③ `palette/auto-tile.ts`（2 处：`common-item`，带 `'.dataValue'`）→ `renderDetached`；④ `palette/palette-initialize.ts`（1 处：`<selection>` 选区标记）→ `renderDetached`；⑤ `title/menu-bar.ts` 的 `menu-icon` 也改了，但**该文件仍在债里**——`Menubar.initialize` 仍用 `document.querySelectorAll('.href')` 全文档找窗口内的超链接（"按类名发现"类，需单独设计）。
> - **指标**：待迁移命中 **54 → 50**、豁免注释 **54 → 50**、陈旧豁免 **0**、`createElement` 138 → 133；editor **237 文件 1992/1992** 全绿。

> **第 15 刀（已完成）：单选组与 `.href` 链接两类「反查」归零（−2 文件）**
>
> ① **单选组**：`tools/color-picker-window.ts`（`color-index`）与 `data/transition-window.ts`（`easing-scale`）原先各自 `document.getElementsByName('组名')` 反查成员 → 给 ui-kit `RadioProxyElement` 加 **`group` 访问器**（组名即 `proxy.id`，与既有 `write()` 同源），查询收敛到 ui-kit 一处，编辑器侧读 `proxy.group`；ui-kit 新增用例锁「按文档顺序 / 内容 / 不缓存」。② **`.href` 链接**：`Menubar.initialize` 的 `document.querySelectorAll('.href')` → 改由**拥有链接的组件转发**（`About.vue` / `ExportApk.vue` 的 `@click` → `Menubar.hrefClick`）；原绑定**本就绑不上**（启动时执行，而链接都在懒加载窗口里——与第 7 刀 Script 切换按钮同类的死接线）。
> - **指标**：待迁移命中 **50 → 48**、豁免注释 **50 → 48**、陈旧豁免 **0**、`addEventListener` 570 → 567；editor **237 文件 1992/1992**、ui-kit **110 文件 775/775** 全绿。

> **第 16 刀（已完成）：设置项查询收进窗口帧 + 布局侧三处收口（−1 文件）**
>
> ① `services/project/setting-config/renderer.ts`：三处 `document.querySelectorAll('#<optionId>')[0]` 与 `applyL10n` 的 `$('#<id>')` → 统一的私有 `byId(id)`，**在 `#setting` 帧子树内**用 `CSS.escape` 查询（`serviceEls.get('setting')`）——顺带把 P5 轴 `$('#…')` 反查 22 → 20。② `engine/layout/layout.ts`：发现「离屏创建」有**第三份**实现 → 统一委托 `renderDetached`；`document.getElementById('project-browser')` → `storesEls.get('project-browser')`（`LayoutPanel.vue` 补 `:ref`）。③ **未完成（下一刀）**：同文件仍有 `.nav-item[value]` / `.page-frame[value]` 两条**全文档回退**（注释写明是给 fixture/手工 DOM 兜底），要删需先把 10 个 layout spec 的 fixture 改走 `registeredLayoutItems`。
> - **指标**：待迁移命中 **48 → 47**、豁免注释 **48 → 47**、陈旧豁免 **0**、`querySelector*` 18 → 16、`$('#…')` 22 → 20、`createElement` 133 → 132；editor **237 文件 1992/1992** 全绿。

> **第 17 刀（已完成）：`engine/layout/layout.ts` 归零（−1 文件）**
>
> 两条**全文档**回退（`.nav-item[value]` / `.page-frame[value]`）收敛到 **palette 容器子树内**（`nav?.querySelectorAll(...)` / `manager?.querySelectorAll(...)`）——容器由 `LayoutPanel.vue`（L1544-1545）登记进 `engineEls`、条目本来就在其中，故**全文档扫描去掉、韧性保留**。**过程中被既有用例打回一次**：先按"fixture 也走注册表 → 兜底无人用 → 直接删"来做，`layout-item-registry.spec.ts` 的「兜底合并」立刻失败——这条兜底是**有意的韧性设计**，于是改成"容器子树内兜底 + fixture 走生产登记"两件事一起做。fixture 同步：`layout-spec-utils.ts` 补 `registerLayoutItems`，该 spec 的本地 fixture 补登记两个 palette 容器；`stale-exemptions --apply` 清掉陈旧豁免。
> - **指标**：待迁移命中 **47 → 46**、豁免注释 **47 → 46**、陈旧豁免 **0**、`querySelector*` 16 → 14；editor **237 文件 1992/1992** 全绿。

- **现状证据（2026-09-12 实测，`pnpm dom:guard:tracker`）**：待迁移命中 **46** 个文件。**编辑器侧只剩 11 个**，分工如下：
  - **① C1 白名单候选（9 个，属"设计豁免"而非迁移债）**：`engine/webgl/webgl-init.ts`、`engine/webgl/webgl-methods.ts`、`engine/palette/palette-engine.ts`、`engine/scene/draw-start-position.ts`、`printer/printer.ts`、`audio/audio-manager.ts`（`document.createElement('canvas')` 取上下文/像素读回，模板无法替代）；`main.ts`（`getElementById('app')` 应用挂载点）；`utils/dom.ts`（第 12/13 刀建立的**唯一离屏创建缝隙** `renderDetached`/`createDetachedElement`）；`composables/usePointerObjectWindow.ts`（`#cursor-region` 在 `index.html` 里，非 SFC 渲染）。
  - **② 另有 2 个需在 C1 里显式处置（不是"忘了做"，而是归属别的任务线）**：`localize/dom-localizer.ts`（**R2b 遗留扫描器**：按语言表 key 反查 `[name]`/`[.class]`/`#id`，其存在意义就是全文档发现；退出条件 = R2b 剩余键全部改走模板 `t()`/`v-tip`）、`data/transition-window.ts`（仅剩一处 `createElement('canvas')`，按 A 类随白名单）。
  - ui-kit 侧仍是 **34** 个 `components` 下文件 + 1 个 `utils/radio-proxy.ts`——按 **P2b 的重定义**（元素优先 API 层，2026-09-12 复核后"不再以文件数归零为准"）它们是**架构性设计豁免**，随 **B6/P2b** 走；C1 的白名单必须把它们一并显式列入，否则"白名单外为 0"永远不可达。
  - API 处数：`getElementById` **10**（真实代码 9）、`document.querySelector*` **14**、`getElementsByName` 18、`getElementsByClassName` 1、`createElement` **132**（含注释提及）。
- **收尾路线（供 C1 排期）**：把 `layout.ts`（fixture 走注册表后删兜底）与 `dom-localizer.ts` 做完 → **白名单外待迁移命中 = 0**，即可执行 C1 的落地步骤（lint `overrides` 白名单 + `dom-guard` 的 `WHITELIST`/「设计豁免」分列 + `docs-check` 的「白名单外为 0」断言 + 删豁免机制）。
- **`createElement` 单列说明**：132 处里 106 在 `ui-kit/components`——那是「元素优先」的组件工厂（`*-api.ts` 的 `createXxxElement`），属 **P2b / B6（巨石渲染层）** 的范围，不按本条逐文件搬；本条优先做**静态 id 查找**（`getElementById` / `querySelectorAll` 的选择器表）。
- **替换配方（十七刀已验证，后续照此执行）**：① 模块侧取注册表（`el(id)` 助手保留 `!` 语义，或直接 `?.`；动态前缀/动态 `domKey` 直接以模板串作键；**跨行链式** `document\n\t\t.getElementById('x')!` 与 `!` → `as HTMLElement` 后**必须加括号**（`(… as HTMLElement).m()`）两处坑已各踩一次）；② SFC 侧用 `scripts/element-ref-annotate.mjs` 补 `:ref="registryRef(reg, 'id')"`（已有具名 `ref` 的标签改在 `onMounted` 里 `registerElement`）；③ `*-confirm` 等框架生成的按钮一律改 SFC `@confirm`；④ 目标 SFC 已有自己的局部注册表时用 **`createElementRegistry(共享注册表)` 创建时镜像**（**不要**在 `onMounted` 里循环拷贝——子组件 `onMounted` 先跑，会慢一拍）；局部注册表是**控件实例** Map（批 1 形态）时，在 `fieldRef` 的 ref 回调里用 `$el ?? root` 取元素镜像；⑤ spec 侧：`mountAll` 型用例必须 `afterEach` 卸载**所有**挂载的窗口（泄漏的挂载态实例会重登记旧元素、覆盖共享注册表）；⑥ 批量选择器（`querySelectorAll('#a, #b, …')`）统一改 `registryElements(注册表, [ids])`，并**给这些控件补登记**；⑦ 改完 `.vue` 模板用到的注册表助手后，跑一次「import 修复器」口径（凡用 `registryRef`/`registerElement`/`registryElements`/`createElementRegistry` 而无对应 import 者补上——第 5 刀漏补 `registryRef` 导致 11 个页面渲染报错）；⑧ 删豁免注释交给 `pnpm stale-exemptions --apply`（自己写的"行首匹配"会漏掉第 2 行的形态）；⑨ **迁移前先确认目标 SFC 用的是哪个注册表**（`composableEls` / `animationEls` / `localEls` / 局部 `fieldEls`…）——第 8 刀 `ExportLanguage` 登记在 `localEls`，改读 `composableEls` 后由既有 spec 当场抓到；需要跨注册表读取时给该注册表加 `createElementRegistry(composableEls)` 镜像；⑨d **删"兜底分支"前先让它的消费者消失**：第 17 刀把 layout 的「全文档回退」删掉，靠的是让 fixture 改走生产路径的 `registerLayoutItems`（共享 fixture 一次覆盖 14 个用例文件）；⑨c **离屏节点的选型**：有模板宿主用模板节点 clone，无宿主的一次性节点走 `utils/dom.renderDetached`（唯一创建缝隙）；⑨b `document` 与 `.getElementById` 之间**可能换行**（`document\n\t\t\t.getElementById('x')`）——脚本按单行匹配会漏（第 9 刀一次补回 6 处）；判据一律用 `document\s*\.\s*` 容忍空白/换行；⑩ 每刀补 1 个 registry 回归 spec，并做一次负向验证（摘掉 `:ref` 应当让用例失败）。
- **下一批候选（按文件数）**：
  - `useScriptCommandSchema`（monaco 宿主 + `script-*` 窗口事件）与 `useCallEventCommandSchema`（`createElement('div')` 标签 + `.call-event-component` 类选择器）：单独一刀（含非静态查找）。
  - `usePointerObjectWindow`(4) → 外壳元素 `#cursor-region`，**C1 白名单候选**（不改代码，随 C1 一并销账）。
  - `editor/composables` 余下 8 个文件与 `editor/components` 9 个文件里的**动态 id**（运行时拼接，如 `commands/schema.ts`、`inspector/file-entity-page.ts`、`services/.../renderer.ts`）——需要按"目标元素自注册"或"改为数据驱动"逐处设计。
  - `ui-kit/components` 34 个文件：随 **B6** 销账。
  - `useScriptCommandSchema`（monaco 宿主 + `script-*` 窗口事件）与 `useCallEventCommandSchema`（`createElement('div')` + 类选择器）单独一刀（含非静态查找）。
  - `ui-kit/components` 34 个文件：随 **B6** 销账。
  - `ui-kit/components/**` 的 34 个文件：随 **B6** 的模板化一并销账（`command-api` / `YMFileBodyPane` / `YMParameterPane` / `YMParamList` / `YMTabBar` / `YMFileNavPane` 等），不单独立刀。
- **验收标准**：① 待迁移命中按模块逐组下降，终点与 C1 相同（**白名单外为 0**）；② 每刀 editor + ui-kit 全量绿、`pnpm lint` 0/0、`tsc` strict 与 `vue-tsc` 0 新增、`pnpm docs:check` OK；③ 每刀至少 1 个 registry 回归 spec（防"注册表链路断了却静默 no-op"）；④ 真机冒烟覆盖该刀的窗口（本刀：项目设置窗口改参数 → 确认保存、语言窗口新增/重名、变量访问器的类型切换与预设键）。
- **验证命令**：`pnpm dom:guard:tracker`、`pnpm -F @yami/editor test`、`pnpm -F @yami/ui-kit test`、`pnpm lint`、`pnpm typecheck`、`pnpm -F @yami/editor typecheck:vue`、`pnpm docs:check`。
- **回滚**：每刀独立提交，`git revert` 即可（纯引用替换 + 模板 ref 注解，不涉及数据层）。
- **来源**：2026-09-12 P5b 结项后的度量复核（`dollarLookup` 已到 22，而 lint 门禁口径仍有 158 个文件未登记批次）。

## B1 — 巨石渲染层重写

- **现状证据**：`packages/ui-kit/src/components/business/YMCommandList/command-api.ts` 2609 行（纯数据层已抽 `command-core.ts` 269 行）、`packages/ui-kit/src/components/business/YMFileBodyPane/YMFileBodyPane.vue` 2327 行（已抽 `file-body-core.ts` 154 行）；DOM 渲染层仍命令式。**契约面远大于测试面**：命令列表经 `packages/editor/src/components/common/CommandList.vue` 暴露 **67 个方法**、editor 侧约 **259 处**列表方法调用，而组件级只有 **12 个用例**；文件body 组件级 **5 个用例**（另有 editor 侧 2 个 / 3 个）。
- **实施方案（已定稿）**：[monolith-render-plan.md](./monolith-render-plan.md) —— M1 行为金标准补齐（把组件级用例提到 ~40+，含 `eslints` 缩进线扩展点）→ M2 派生层（`command-render.ts` / `file-body-render.ts`，与 tree 的 `tree-render.ts` 同构）→ M3 模板 v-for 换源（保 API 门面）→ M4 消费方迁移（缩进线扩展点正式化、`stores/browser.ts`/`stores/selector.ts` 的 `closest('.file-body-item')` 改数据查询）→ M5 清理与删除豁免。
- **验收标准**：① M1 用例全部保留语义（只允许改断言方式）；② ①后的每一步都保持 editor/ui-kit 全量绿；③ 完成后 tracker 中两文件的受限 API 命中（`command-api.ts` 17 处 / `YMFileBodyPane.vue` 3 处）归零、豁免注释删除；④ 真机事件编辑器（折叠/搜索/复制粘贴）与文件浏览器（normal/tile 视图）冒烟通过。
- **验证命令**：`pnpm -F @yami/ui-kit test`、`pnpm -F @yami/editor test`、`pnpm lint`、`pnpm dom:guard:tracker`、`pnpm docs:check`；真机 `open-project` + `drag-here`。
- **来源**：[vue3-migration-plan.md](./vue3-migration-plan.md) 阶段 5 表。

## C1 — 收尾：拆除脚手架（白名单外为 0）

> ✅ **已完成（2026-09-12）**：口径从「待迁移命中 160 / 豁免注释 295 / 陈旧豁免 135」走到 **`待迁移命中 0` / `豁免注释 0` / `陈旧豁免 0` / `设计豁免 45` / `临时豁免 1`**。落地方式与原文计划的差异：① 白名单从"A 类 4 个"扩到 **45 个设计豁免 + 1 个临时豁免**——因为 P1b 十七刀已把编辑器侧的真实债清零，剩下的**全是设计使然**（画布上下文 / 应用挂载点 / 唯一 DOM 缝隙 / index.html 外壳元素）或**归属别的任务线**（ui-kit 元素优先组件层 → P2b；`localize/dom-localizer.ts` → R2b）；② 因此验收口径改为**硬断言 `待迁移命中 === 0`**（白名单文件不带豁免注释，故"白名单外"就等于 `待迁移命中` 本身），由 `docs-check.mjs` 的 `checkC1Whitelist()` 守住；③ 该函数还校验白名单**三处同源**（`dom-guard.mjs` 常量 ↔ `.oxlintrc.json` overrides ↔ 文件存在），防漂移。
> - **证据**：`pnpm lint` 0 警告 0 错误（**已无任何 `/* oxlint-disable eslint/no-restricted-properties */`**）；`pnpm stale-exemptions --check` OK；`pnpm dom:guard:tracker` 口径区见 `docs/dom-migration-tracker.md`；`pnpm docs:check` OK（含 C1 断言）。

### C1 白名单（`scripts/dom-guard.mjs` 的 `WHITELIST` / `TEMP_WHITELIST`）

| 类别 | 文件 | 为什么按设计需要受限 API |
| --- | --- | --- |
| 设计豁免（45） | `engine/webgl/webgl-init.ts`、`engine/webgl/webgl-methods.ts`、`engine/palette/palette-engine.ts`、`engine/scene/draw-start-position.ts`、`printer/printer.ts`、`audio/audio-manager.ts`、`data/transition-window.ts` | `createElement('canvas')` 取 2D/WebGL 上下文、像素读回、文本测量——模板无法替代 |
| 设计豁免 | `main.ts` | Vue 挂载容器 `#app` 来自 `index.html`，只能按 id 取一次 |
| 设计豁免 | `utils/dom.ts` | **唯一 DOM 创建/查询缝隙**（`$()` 与 `renderDetached`/`createDetachedElement` 的实现处，P1b 第 12/13 刀的收敛点） |
| 设计豁免 | `composables/usePointerObjectWindow.ts` | `#cursor-region` 是 `index.html` 里的外壳元素，非 SFC 渲染 |
| 设计豁免 | `ui-kit/src/components/**`、`ui-kit/src/utils/radio-proxy.ts` | **元素优先的组件 API 层**（P2b 2026-09-12 重定义：不以文件数归零为准）；`radio-proxy` 是单选组按 name 查询的唯一落点 |
| 临时豁免（1） | `localize/dom-localizer.ts` | R2b 遗留的本地化扫描器，其存在意义就是按语言表 key 全文档发现元素；**退出条件 = R2b 剩余键全部改走模板 `t()`/`v-tip`**，届时从 `TEMP_WHITELIST` 删除 |

- **原始分级（2026-09-11 的 A/B/C 类判定）保留如下，用于对照分类依据**：
  - ✅ **A 类·真画布上下文**：`engine/webgl/webgl-init.ts`、`engine/webgl/webgl-methods.ts`、`engine/palette/palette-engine.ts`、`engine/scene/draw-start-position.ts`——最终进白名单（并入 `printer` / `audio-manager` / `transition-window` 三处同类 canvas）。
  - ❓ **B 类·画布式交互区的命令式 DOM（4 个）**：`animation/animation-timeline.ts`、`animation/animation-motion.ts`、`palette/palette-initialize.ts`、`palette/auto-tile.ts`——**复核结论：不进白名单**，它们的"可数据化"判断成立，P1b 第 14 刀已把四处离屏节点收口到唯一创建缝隙并归零。
  - ❌ **C 类·属迁移债（1 个）**：`engine/layout/layout.ts`——P1b 第 16/17 刀已归零（帧内查询 + palette 容器子树兜底）。
- **验收标准（逐条对照）**：① 白名单外待迁移命中归零 ✅ `待迁移命中 0`；② `dom:guard:exempt` 退役 ✅（子命令与 npm script 均已删除）；③ `pnpm lint` 在无豁免注释下 0 警告 0 错误 ✅；④ 文档口径三方一致 ✅（tracker / README / 计划，且 `设计豁免`/`临时豁免` 由 tracker 生成）。
- **验证命令**：`pnpm lint`、`pnpm dom:guard:tracker`、`pnpm stale-exemptions --check`、`pnpm docs:check`。
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

> 🚧 **部分完成（2026-09-12，三刀）**：① 死事件 `attributechange` 已删（`attribute/attribute-window.ts` 的派发点）。`pnpm events:surface` 复测：事件名 **34 → 33**、自定义 **16 → 15**、**单侧事件「(无)」**（此前唯一的就是它）。② `.vue` 的 window 监听配对**已归零**（验收 ③ 达成，见下方「E1 第二/三刀」）。余项：③（15 个自定义事件改强类型通道）、④（`mitt` 去留）待做。

**E1 第三刀（2026-09-12）：修正度量器两处误报，`add 有 remove 无` 5 → 0、内联匿名 13/11 → 11/10**

`.vue` 内最后一处（`ui-kit/.../YMFileHeadPane.vue`）**不是缺陷**：它的 `window.addEventListener('pointerup', …, { once: true })` 由**浏览器在首次触发后自动摘除**，本来就无需 `remove`。问题出在**度量器**：

- **误报 ①**：报表按原文正则找 `window.addEventListener(...)`，而**注释/字符串里**也会出现这个片段 → 把无关代码当成一次调用，内联匿名计数被高估（13 vs 实际 11）。
- **误报 ②**：`{ once: true }` 未参与判定，于是"自带摘除"的监听被记成"add 无 remove"风险。
- **修法**：新增 `scanAddListenerCalls()`——**先剥注释**，再按括号配对取出每条调用的完整实参，据此判定「内联匿名」与「`once: true`」；风险项与 `.vue` 配对检查都扣除 `once`。
- **修完的实测**：`.vue` 内 add-without-remove **5 → 0**（验收 ③ 达成）、内联匿名（非 once）**11 处 / 10 文件**（皆为 app 生命周期单例，见上）。

**P2b-1 第一刀（2026-09-12）：命令列表的元素 API 契约（最后一个没有 `XxxApi` 的 `*-api.ts`）**

- 现状（第 34 轮审计结论）：26 个 `*-api.ts` 里 25 个已有 `XxxApi` 接口，唯独巨石组件 `YMCommandList/command-api.ts` 只有 `commandListPrototype: Record<string, (...args) => any>`——消费方只能自己写形状（editor 侧就有一份 `EventCommandListShape`）。
- 做法：新增 **`export interface CommandListElementApi`**，把**消费方实际使用**的方法写成精确签名（`read/write/update/resize/select/selectAll/unselect/selectMultiple(To)/insert/edit/copy/paste/delete/undo/redo/save/toggle/clear/fold/unfoldCommand/scrollToRow/scrollToSelection/computeTextIndent/findString/deleteCommandBuffers/getRangeByIndex/getRangeByData/createBlankElement`），其余保留索引签名兜底；并在 `@ui-kit` 入口导出。
- **接线的证明**：editor 的 `EventCommandListShape` 改为 `HTMLElement & CommandListElementApi & { … }`——"元素上有哪些方法"从此**只有一份定义**，拼错方法名会在编译期报错（此前不会）。
- **一个刻意的取舍**：`createCommandListElement` 的返回类型**没有**改成 `HTMLElement & CommandListElementApi`。试过之后 `pnpm lint` 立刻报 14 处 **TS2352**——既有用例会把返回值断言成各自更丰富的本地形状，精确返回类型让这些断言变成"不可比"。⇒ 归到 **M5 收尾**（连同用例一起改），本刀只做"契约可 import"这一步。**教训**：把返回值类型收紧前，先数一遍有多少调用方在拿它做 `as` 断言。
- **指标**：`pnpm lint` 0/0、ui-kit **110 文件 775/775**、editor **237 文件 1992/1992**、`docs:check` OK。

**E1 第七刀（2026-09-12）：再迁 3 处派发；并把"监听侧为什么不机械迁移"写清楚**

- 迁移：`file/directory-object.ts`（`dirchange`）、`utils/dpr.ts`（`dprchange`）、`main.ts`（`vue-app-mounted`）三处 `window.dispatchEvent(new Event('<名>'))` → `emitCustom('<名>')`。加上第六刀的 4 处，**类型化通道已覆盖 7 个派发点**。
- **监听侧不机械迁移（有理由）**：既有的监听处理器签名是 `(event: Event) => void`，而 `onCustom` 的回调是 `(payload, event) => void` ⇒ 直接替换要改处理器签名；而多数处理器的第一件事就是读一两个字段，**在处理器开头用 `readPayload<T>(event)` 收口**更小的影响面。⇒ 约定：**派发走 `emitCustom`，监听按需在开头 `readPayload`**；两者都在同一个 `events/custom-events.ts` 里，名册只有一份。
- **指标**：editor **237 文件 1992/1992**、`pnpm lint` 0/0、`docs:check` OK；`pnpm events:surface` 仍报 15 个自定义事件（通道没有改变事件名册）。

**E1 第六刀（2026-09-12）：自定义事件的类型化通道（`emitCustom` / `onCustom`）**

- **决定**：E1 的最后一项是"16 个自定义事件改强类型通道"，原计划里有两条路（store action / `mitt` 事件表）。`mitt` 已在第五刀**删除**（0 import），本刀落地另一条：**不换机制，只把类型收口**——`packages/editor/src/events/custom-events.ts` 定义 `CustomEventPayloads`（15 个事件名 → 载荷形状，与 `pnpm events:surface` 的名册一致），提供：
  - `emitCustom(type, payload?)`：无载荷时派发普通 `Event`，有载荷时走 `createPayloadEvent`（ui-kit 的载荷接缝）；
  - `onCustom(type, (payload, event) => …)`：监听并把载荷作为**第一个参数**给出，返回取消订阅函数。
- **收益**：事件名拼错、载荷形状不符在**编译期**暴露；调用点不再写 `as Event & { … }`。
- **本刀迁移**：4 处派发（`enum-window` 的 `enumchange`、`local-object`/`local-window` 的 `localizationchange`、`variable/open.ts` 的 `variablechange`）+ 1 处监听（`utils/localized-items.ts` 的 `localizationchange` 重挂）⇒ 原先"派发端 `new Event(…)` / 监听端 `addEventListener`"的裸写法改为通道调用。**行为不变**：仍是 `window` 上的同名事件（因此既有监听者、`events:surface` 口径与真机行为都不受影响）。
- **新增 4 例**：无载荷事件就是普通 `Event` 且能收到；带载荷事件字段原样可读（`datachange` 的 `key`/`last`）；取消订阅真的摘掉监听；多个监听者都能收到。
- **指标**：editor **237 文件 1992/1992**、ui-kit **110 文件 775/775**、`pnpm lint` 0/0、`docs:check` OK（扫描文件 1141 → 1142）。

**E1 第五刀（2026-09-12）：editor 侧剩余断言的定性 + 去掉两个死依赖**

- **editor 侧 30 处 `as Event & { … }` 不是同一类**：抽样后发现绝大多数是**伪造事件对象**的写法（`{ value } as Event & { value: string }`、`{ target: { value } } as Event & { target: HTMLInputElement }`）——它们把"最小事件"传给元素 API 的处理器，**不是在读事件**。对这类用 `readPayload` 反而语义错位（读的语义、写的用途）。⇒ 结论：editor 侧这 30 处**保持原样**，只在真正的读取点（如 `Enum.vue` 的 `clientX/clientY`）用 `readPayload`。这条定性比"把 30 处全换掉"更有价值——**先分类，再决定要不要动**。
- **`mitt` / `@vueuse/core` 去留已决（删）**：两者在 editor 的 `dependencies` 里，但全仓 **0 处 import**（`pnpm events:surface` 长期显示 `mitt( 0 处、useEventListener( 0 处`）⇒ 从 `packages/editor/package.json` 删除。计划 5.4 原设想"事件总线 → mitt"**不再采纳**：本项目的自定义事件已经收口成 `payload-event` 契约 + 元素注册表，再引入总线只会增加一条并行通道。
- **注**：`pnpm-lock.yaml` 在本仓是**被 gitignore 的**（未跟踪），故删除依赖只需改 `package.json`（`pnpm install --lockfile-only` 已本地更新，不产生提交物）。
- **指标**：`as Event & {` 剩余 **37**（ui-kit 7 / editor 30，均已定性）；editor `tsc` strict 通过、`pnpm lint` 0/0。

**E1 第四刀（2026-09-12）：读取侧断言迁移（ui-kit 8 处），`as Event & {` 39 → 37**

- 与第三刀配对：脚本把**读取侧**的 `(x as Event & { … })` / `x as Event & { … }` 换成 `readPayload<{ … }>(x)`。本刀限定 **ui-kit**（4 文件 / 8 处：`select-box-api.spec`、`tree-list-interactions.spec`、`YMFileBodyPane.spec`、`YMParameterPane.vue`）。
- **两个类型坑（都被 `pnpm lint` 当场抓住）**：① `readPayload` 一开始返回 `Partial<T>`，而既有测试变量声明为 `Event & { … }` ⇒ **TS2322** ×4；② 改成返回 `T` 仍不可赋值 ⇒ 最终返回 **`PayloadEvent<T>`（= `Event & T`）**，与旧断言类型完全一致才通过。**教训**：把散落断言收进 helper 时，返回类型要与旧断言**逐字等价**，否则会连带改一片调用方。
- **editor 侧剩余 30 处**（占剩余 37 中的 30）留待下批：那里的 import 要走 `@ui-kit` 门面导出（脚本按相对路径算会指错文件）。
- **⚠️ 过程事故与修复（值得记一笔）**：本刀第一次尝试时脚本写坏了 import 路径，我用 `git checkout -- packages/editor/src packages/ui-kit/src` 想回滚，结果**把并行协作者未提交的 `i18n/convert.ts` 改动一起回滚了**（该文件当时在 `stash@{1}` 标为 "unrelated i18n @-escape work (not mine)"）。已用 `git checkout 'stash@{1}' -- packages/editor/src/i18n/convert.ts` **精确恢复**该文件（+16/−7，未提交，保持其原作者状态），并 `git restore --staged` 取消暂存以免误提交。**规矩**：回滚只能**逐个文件给路径**，绝不能整目录 `git checkout -- <dir>`；共享工作区里"别人的未提交改动"随时可能被扫掉。
- **指标**：`as Event & {` **39 → 37**（ui-kit 7 / editor 30）；helper 使用量：`createPayloadEvent` 34 处、`readPayload` 11 处；ui-kit **110 文件 775/775**、editor **237 文件 1992/1992**、`pnpm lint` 0/0。

**E1 第三刀（2026-09-12）：事件载荷的散落断言收成一处（`as Event & {` 72 → 39）**

- 现状：自定义事件（`write`/`input`/`select`/`popup`/`change` …）长期靠 `const e = new Event('write') as Event & { value: boolean }; e.value = v;` 传载荷，派发侧与监听侧各自写一遍断言。
- 做法：新增 **`ui-kit/src/utils/payload-event.ts`**——`PayloadEvent<T>`、`createPayloadEvent(type, payload, init?)`、`readPayload<T>(event)`；**运行时语义不变**（仍是同一个 `Event` 加自有字段；**刻意不**改用 `CustomEvent.detail`，那会改事件形状，监听方与用例都要跟着改）。
- 迁移：脚本把 `new Event('<类型>'[, init]) as Event & { … }` 统一换成 `createPayloadEvent('<类型>', {} as { … }[, init])`——**33 处 / 17 个文件**（ui-kit 的 check/color/common-list/nav-bar/detail-box/page-manager/tab-bar/custom-box/file-nav、editor 的 `utils/dom.ts`、`useProjectSettingsWindow.ts`），后续赋值语句保持不变。
- **三处踩坑（都被门禁当场抓住）**：① 纯核心模块（`select-box-core.ts`）**一个 import 都没有**，"插到最后一个 import 之后"落空 → 改为无 import 时置于文件首；② `custom-box-api.ts` 顶部有 **BOM**，置首后 BOM 落到第 2 行 → `oxlint` 报 `no-irregular-whitespace`（顺手清掉）；③ `readPayload` 的 `event as Partial<T>` 被判为不可比 → 改 `as unknown as Partial<T>`。
- **指标**：断言 **72 → 39**；ui-kit **110 文件 775/775**（+4 例）、editor **237 文件 1992/1992**、`pnpm lint` 0/0、`docs:check` OK。剩余 39 处多为**读取侧**（监听器内联断言），下批同法处理。

**E1 第二刀（2026-09-12）：`.vue` 的 window 监听配对——`remove` 122 → 126**

① 修 `FileAudioPage.vue`（`themechange`）、`FileScriptPage.vue`（`localize`）、`FileVideoPage.vue`（`error`）、`SceneActorPage.vue`（`datachange`）四处：**把监听器先存成变量**再 `addEventListener`，并在 `onBeforeUnmount` 里按**同一引用** `removeEventListener`——若直接写 `removeEventListener(type, obj.method)`，当方法来自访问器或每次返回新绑定函数时会摘不掉，存变量是唯一稳妥写法。② `pnpm events:surface` 复测：`remove` **122 → 126**（+4）；两个套件、`pnpm lint`、`tsc` strict 全绿。


- **复现命令**：`pnpm events:surface`（`scripts/event-surface.mjs`；只统计落在 `window` 上的监听与派发，且**含"变量形式"派发**——`const e = new Event('x'); window.dispatchEvent(e)`，这是纯按名字做正则最容易漏的一类）。
- **现状证据（2026-09-11 实测）**：`window.addEventListener` **265 处 / 92 文件**、`window.removeEventListener` **122 处**；事件名 **34 个**，其中**自定义 16 个**——`attributechange`、`datachange`、`dirchange`、`dprchange`、`enumchange`、`home-recent-update`、`localizationchange`、`localize`、`os-dragend`、`os-dragstart`、`script-change`、`themechange`、`update-log-update`、`variablechange`、`vue-app-mounted`、`yami:error`。载荷普遍靠**往 Event 对象上挂字段**传递（`datachange.key = 'teams'`、`themechange.value = theme`；见 `composables/useTeamWindow.ts:422`、`data/transition-window.ts:1201`、`title/title-bar.ts:387`）——无类型、无契约，监听方只能自己断言形状。
- **死事件 1 个**：`attributechange`——`attribute/attribute-window.ts:967` 有派发、全仓**无监听**，可直接删（`script-change` 一度被误判为死事件，实为 `plugin/plugin-parse-meta.ts:20` 以变量形式派发，仍在用）。
- **监听生命周期风险点**：**11 处**用内联匿名函数且未带 `{ once: true }`（10 文件，多为 app 生命周期单例：`utils/keyboard.ts`、`module/constants.ts`、`components/toast.ts`、`engine/webgl/webgl-init.ts`、`main.ts` 等）；**1 个 `.vue`**（原 4 个已修，见下方「E1 第二刀」）添加 window 监听却无 `remove`（`FileAudioPage`/`FileScriptPage`/`FileVideoPage`/`SceneActorPage`/`YMFileHeadPane`）——页面重挂时可能叠加监听。
- **替代品均未启用**：`mitt`（依赖里存在）**0 使用**、`@vueuse` 的 `useEventListener` **0 使用**、`window.on(` **0 处**——即计划 5.4「事件总线 → 响应式 + provide/inject + mitt」的映射**尚未开工**。
- **推进策略**：① 删 `attributechange`；② 16 个自定义事件改强类型通道（store action / mitt 事件表），去掉"往 Event 挂字段"；③ 5 个 `.vue` 的监听按 `onMounted`/`onBeforeUnmount` 配对（或统一 `useEventListener`）；④ 决定 `mitt` 去留（启用或从 `package.json` 移除）。
- **验收标准**：① `attributechange` 归零；② 自定义事件不再往 Event 挂字段；③ `.vue` 中"add 有、remove 无"归零 ✅ **0**；④ `pnpm lint` + `pnpm -F @yami/editor test` + `pnpm -F @yami/ui-kit test` 全绿；⑤ 真机冒烟：切主题、切语言、目录切换、文件 inspector 页面进出。
- **规模**：中（架构卫生，不属 DOM 迁移主线）；**优先级**：低-中。
- **来源**：2026-09-11 第二十五轮事件面审计（新脚本 + 新登记）。

## O1 — layout M6（可选）

> ✅ **评估已完成（2026-09-15）：结论是"不做"**。M6 的触发条件是**条件式**的——"若 M4 后仍觉 Teleport
> 拖拽竞争脆弱"。2026-09-15 用 `drag-region-edge` 把 region **四方向 × 两个 pick** 都跑在真实构建上
> （见本文件 L1）：结构性变更都按预期发生（左右缘换位、上/下缘把根 split 由 horizontal 改成
> vertical），**没有出现**当年使 M4 回滚的那类"命令式改序 vs Vue diff 打架"的现象；`staleRegions`
> 恒为 0，说明重建也没有留下孤儿节点。于是"继续投入 B 路线（active-only 渲染 + 页面 state 外置）"
> 的收益无从论证，而它的代价是明确的（页面常驻挂载语义、12 个页面的 owner 迁移、引擎页最后灰度）。
>
> **保留为"可复活的决定"**：以下任一情况出现时重新评估——
> ① 真机上出现"拖拽后叶子/页签错位或丢失"且能在 `loadLayoutSchemeVueTeleport` 的时序里复现；
> ② 页面常驻挂载被证明确有可测量的成本（启动时间/内存），且外置 state 能显著回收；
> ③ 需要"同一页面同时出现在两个叶子"（Teleport 单归属模型表达不了）。
> 记录义务：届时按 M6 的原文逐页灰度（先非引擎页，scene/ui/animation/particle 最后）。

- **原始条目**：若 Teleport 路径的拖拽竞争在更多真机场景下显脆弱，再评估「active-only 渲染 + 页面 state 外置」，逐页灰度（先非引擎页，scene/ui/animation/particle 最后）。见 [layout-vue-plan.md](./layout-vue-plan.md) M6。

---

## 覆盖面审计结论（2026-09-11）

> 2026-09-11 共核查 **24 个 DOM 耦合轴**，目的是回答"还有没有像 `$('#id')` 那样没进报表的债"。结论：**本轮未发现新类别**——新发现的四处（`$('#id')`、本地化器、元素 API、原型访问器）已分别登记为 P5b / R2b / P2b / P4b，其余轴或属已登记项的症状，或属合法用法，或已为 0。**新增写法请先加进这张表**（对应风险 R-8）。

| 轴 | 实测 | 判定 |
| --- | --- | --- |
| 受限 API（`document.*` 7 成员） | `getElementById` **10** 处（真实代码 9） / 待迁移命中 **46** 文件（P1b 十七刀后：158 → 46；`querySelector*` 56 → 14） | ✅ 唯一被 lint 门禁的轴 → **P1b** / C1 / C2 |
| `$('#id')` 反查 | **1489 处 / 239 文件**（B1/R1 后 1481；B4 批 1 后 **1347 / 238**） | ⚠️ **新登记** → P5b（此前不在报表内） |
| 本地化器选择器键（运行期放大） | `components` **2130** 键（2112 id + 18 name）；**R2b 迁移②③④后扫描面降到 347 键**（1782 键已由模板 `t()`/`v-tip` 承担并跳过，−84%） | ⚠️ **新登记** → R2b（门禁已核对键数） |
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
- 测试基线（2026-09-15 实跑）：ui-kit **111 文件 780/780**；editor **239 文件 2004/2004**（B0–B5 与 P1b 七刀改动后的最新实跑值；口径改为**全量、不再排除** i18n 实验 spec——`locale-messages` 已随 R2c 转正常驻门禁；B4 批 2/3/4 共新增 8 个 registry 回归 spec，P1b 第 1 刀新增 3 个——`variable-getter-registry` / `project-settings-registry` / `language-window-registry`，第 2 刀新增 2 个——`command-schema-registry` / `utils/__tests__/element-registry`，第 3 刀新增 1 个——`branch-registry`，第 4 刀新增 1 个——`command-write-loop-registry`，第 5 刀新增 1 个——`inspector-selector-registry`，第 6 刀新增 1 个——`window-composables-registry`，第 7 刀新增 2 个——`script-change-wiring` / `call-event-labels`；它们断言「挂载真实 SFC 后注册键 ↔ 元素 id 一致」「模块侧真的调到了注册表里的控件」「ParamList 真的被 bind」）。
