# 迁移文档索引

> 最后更新：2026-09-11。本目录承载 **Phase 15（DOM / 反模式清理）** 的规划与进度；Phase 0–14 的架构迁移史在仓库根的 `xr.md`（已被 `.gitignore` 忽略，仅本地维护）。
> 原则：**代码是唯一事实源**——文档里的数值、文件名、符号名都必须可在代码中检索到，并标注测量日期与命令。

## 文档地图

| 文档 | 作用 | 何时改 |
| --- | --- | --- |
| [vue3-migration-plan.md](./vue3-migration-plan.md) | 总规划：反模式清单 P1–P8 + 阶段 1–6 方案 + 优先级 + 度量与防回归；**进展记录**为追加式日志 | 每次阶段性交付/修复后追加一条；指标变化时同步「一、现状总览」 |
| [dom-migration-tracker.md](./dom-migration-tracker.md) | 扫描矩阵（**自动生成，禁止手改**）：每文件命中数 + 待迁移豁免 | `pnpm dom:guard:tracker` |
| [layout-vue-plan.md](./layout-vue-plan.md) | Layout / PageManager 页面组织 Vue 化（M1–M5 已交付，Teleport 为唯一装载路径） | 布局相关交付/修复后更新状态行与「剩余」 |
| [tree-list-vfor-plan.md](./tree-list-vfor-plan.md) | YMTreeList 行渲染 v-for 化（步骤 1–5 已交付，步骤 5b 待收口） | tree 相关交付后更新步骤进度 |
| [remaining-work.md](./remaining-work.md) | **收尾工作清单 + 计划条目对照 + 风险登记 + 执行批次计划 + 覆盖面审计结论**：可执行条目（现状证据 → 验收标准 → 验证命令 → 依赖）、"阶段/里程碑 → 状态与出处"对照、R-1…R-11 风险、B0–B7 批次与预期指标变化、24 个 DOM 耦合轴的判定 | 任一剩余项推进/关闭后同步 |
| [monolith-render-plan.md](./monolith-render-plan.md) | **巨石渲染层数据化方案**（P6：`YMCommandList` / `YMFileBodyPane`，设计稿 M1–M5） | 该两块改造推进后更新状态行与步骤进度 |

**门禁**：`pnpm docs:check`（`scripts/docs-check.mjs`）把下面「维护约定」里可自动化的部分变成退出码——断链、引用的路径/spec 不存在、文档口径与当前代码或 tracker 不一致都会失败。

## 当前快照（2026-09-11 实测）

- **扫描口径**（`pnpm dom:guard:tracker`，命中判定来源 oxlint `--report-unused-disable-directives`）：文件 **1135**；待迁移命中 **0**（初始 299；P1b 十七刀共 −112 后余 46，再由 **C1 白名单**（设计豁免 45 + 临时豁免 1）归零——`pnpm lint` 已无需任何豁免注释）；豁免注释 **0**；陈旧豁免 **0**；`getElementById` 10（含注释提及）；`createElement` 132（含 P1b 各刀留下的注释提及）；`appendChild` 122；`addEventListener` 567。恒等式：**待迁移命中 + 陈旧豁免 = 豁免注释**（0 + 0 = 0）。（扫描文件数较 B0 的 1111 增 3：B1/R1 的 store 与列表组件、B2 的 `utils/folder-group.ts`。）
- **第二条债轴（P5，不在 lint 规则内）**：`$('#id')` 反查 **20 处 / 11 文件**（element-utils 的 jQuery 风格寻址；**P5b 批次 1–4 完成后的残余 = 动态 id 16 / 外壳元素 2 / 基础设施 2 / 白名单 1**；B4 起点 1481，最初 1489）；`new DOMParser()` **0 处**（B1/R1 前 1 处——字符串模板建 DOM 的最后一处已随资源列表数据化下线）。它不进入「待迁移命中」，故单列——见 [remaining-work.md](./remaining-work.md) P5b。
- **度量覆盖范围（重要）**：lint 门禁只覆盖 `document.*` 的 7 个成员（= 待迁移命中 160）；tracker 另有**每模块列**（`appendChild`/`insertBefore`/`parentNode`/`innerHTML`/`addEventListener`…）、**P5 轴**（`$('#id')`/`DOMParser`）与 **`## 辅助口径`** 一节（`style.*` 336、`.children` 229、`hasClass()` 215、`textContent=` 145、`classList` 134、`get/set/removeAttribute` 87、`scrollTop=` 84 …）。**24 个轴的完整判定表**（哪些已登记为待办、哪些属合法用法、哪些为 0）见 [remaining-work.md](./remaining-work.md) 的「覆盖面审计结论」。引用任何"还剩多少"之前先确认它属于哪一档——2026-09-11 多次度量审计都因"漏档"修正过结论。
- **按"源码处数"会低估的第三种情形（运行期放大 / 写法变体）**：`localize/dom-localizer.ts` 源码里只有 3 处字面查询，但它按语言文件的 `components` **2130** 个键在启动时逐键查 DOM（R2b 迁移②③④⑤⑥⑦⑧⑨⑩⑪后 **1998 键改为模板承担、扫描面降到 131**）（2112 按 id + 18 按 name）；`utils/element-data.ts` 只写了一次 `Object.defineProperty(HTMLElement.prototype, field, …)`，实际在原型上定义了 **72** 个字段的 get/set（144 访问器；B3 前 83/166）——而 tracker 原 `protoExt` 列要求 `prototype.` 跟点，**逗号形式**看不见，现已单列在「辅助口径」。同类还有 `$('#id')`（1489 处）与 `DOMParser` 字符串模板。详见 [remaining-work.md](./remaining-work.md) R2b / P4b。
- **测试基线**（实跑）：ui-kit **99 文件 680/680（另有 7 条 it.todo 记录待补用例）**；editor **235 文件 1983/1983**（口径：排除并发进行的 i18n 实验 spec `dsh-probe` / `locale-messages`——它们不属于本轮改动，且当时处于半应用状态）。
- **基线时效**：2026-09-11 执行 **B0/B1/B2**、2026-09-12 执行 **B4/B5 与 P1b 第 1–5 刀** 时均已改动源码并重跑套件（B1 后 ui-kit 659 → **667**、editor 1884 → **1891**；B2 步 1–2 后 editor → **1897**；P1b 第 1 刀 1934 → **1945**、第 2 刀 → **1955**、第 3 刀 → **1960**、第 4 刀 → **1964**、第 5 刀 → **1968**、第 6 刀 → **1973**、第 7 刀 → **1983**：新增 `script-change-wiring.spec.ts` 1 例 + `call-event-labels.spec.ts` 2 例（其余为并发进行中的 i18n 实验 spec）；**下次改动源码后同样需要重跑并同步本行与 `remaining-work.md`**——`pnpm docs:check` 会拦"两处基线数字不一致"（历史进展条目里的旧数字不受影响）。
- **已交付里程碑**：阶段 1（窗口栈数据化）、阶段 2（ui-kit 契约化 + core 去重）、阶段 3（命令表单去 DOM，`read(getElementById)` = 0、125 个 schema 开 `skipWrite`）、阶段 4（inspector/工具层/原型回收）、layout M1–M5、tree 行渲染 v-for 翻默认、**B0（C2 + R3 + E1①）**、**B1（R2a + T1b + R1）**、**B2（T5b 四步：消费方迁移 + `element.group` 缺陷 + `elements` shim + `item.element` 桥 + class 直写收口）**、**B3 首刀（P4b 删 11 个零访问原型字段 + P2b 目标重定义）**、**B4（P5b 批次 1–4：`$('#…')` 1489 → 20 处 / 239 → 11 文件）**、**B5 迁移②③④（`v-tip` 指令 + 模板 `t()` 承担 1782 键，本地化器扫描面 2130 → 347）**、**P5b 后续第 1 刀（P1b：两个窗口 composable 71 处 `document.getElementById` → 0）**、**P1b 第 2 刀（命令表单线：21 个 schema composable 44 处 → 0，`createElementRegistry(mirror)` 创建时镜像）**、**P1b 第 3 刀（`components/tools` 分支/条件表单：4 个 schema 22 处 → 0，并修复 `if-branch-conditions`/`switch-branch-conditions` 自批 4 起被静默跳过的 `bind`）**、**P1b 第 4 刀（窗口 composable 与通用 write 循环：`useCommandSchema`/`useCurveWindow`/`useTextCaptureWindow`/`useFileImagePage` 改读注册表 + 40 个 inspector 页宿主 + 90 个命令 SFC 统一镜像、231 个控件补登记）**、**P1b 第 5 刀（inspector 页的批量选择器退役：16 个页面的 `document.querySelectorAll('#a, #b, …')` → `registryElements(inspectorEls, […])`，357 个控件补登记）**、**P1b 第 6 刀（5 个窗口 composable：Team / PresetElement / PresetObject / TileNode 与 PresetGetter 工厂改读 `composableEls`，`team-confirm` 改由 SFC `@confirm`）**、**P1b 第 7 刀（`Script` / `CallEvent` 两个"特殊"命令 schema：monaco 宿主与窗口事件改读注册表、按类名反查改为数据面驱动、离屏节点改模板 clone；并修复 Script 的 TS/JS 切换按钮一直是 no-op）**、**P1b 第 8 刀（5 个工具的 setForm/getForm 动态 id 循环改读注册表，`editor/components` 的 `getElementById` 归零）**、**P1b 第 9 刀（跨行链式 `document\n.getElementById(...)` 的 4 个命令 schema + `element-page`/`transition-window` 的批量选择器）**、**P1b 第 10 刀（inspector 的 `sceneTilemap`/`fileUI` 直查与文件浏览下拉的自身反查）**、**P1b 第 11 刀（`Window.open` 改读 `windowShellEls`、「取消」接线下沉到 `WindowFrame.vue`、确认/应用快捷键改帧内查找）**、**P1b 第 12 刀（离屏节点统一走 `utils/dom.renderDetached` 唯一创建缝隙，5 个模块的 `createElement` 样板归零）**、**P1b 第 13 刀（`renderElement`/`editdata`/`Reference`/`menu-list`/`toast`/`timer` 六处收口到同一缝隙与注册表）**、**P1b 第 14 刀（时间轴/运动曲线/自动图块/调色板选区的离屏节点收口）**、**P1b 第 15 刀（单选组改读 ui-kit `proxy.group`；`.href` 链接点击改由 About/ExportApk 组件转发）**、**P1b 第 16 刀（设置项改在 `#setting` 帧内查找；布局侧第三份 `renderElement` 合并、`#project-browser` 进注册表）**、**P1b 第 17 刀（`engine/layout/layout.ts` 归零：palette 容器子树内兜底）**、**C1（画布/外壳白名单 lint overrides + 删除全部 46 个豁免注释 + `dom:guard:exempt`（**C1 已退役**） 退役 + 白名单口径入 tracker）**。
- **在办 / 待办**（逐条验收标准与验证命令见 [remaining-work.md](./remaining-work.md)）：**P1b**（受限 API 直查收尾，48 个文件——C1 的前置；其中 **9 个已是 C1 白名单候选**：6 个画布上下文 + 应用挂载点 + 基础设施缝隙 + index.html 外壳元素；编辑器侧只剩 11 个：9 个白名单候选 + 2 个（`dom-localizer` 属 R2b、`transition-window` 的 canvas 随白名单））、P2b（元素 API 类型化契约）、P4b（原型访问器 72 字段）、R2b 余项（扫描面 347 → 白名单）、B6（巨石渲染层 B1 的 M1–M5）、B7（L1/S1 真机 + C1 拆脚手架），另 E1 余项与 O1 可并行。

## 维护约定（避免再次漂移）

1. **数值必须可复现**：标注日期 + 生成命令；`dom-migration-tracker.md` 只由脚本产出。
2. **进展记录只增不改**：新条目追加到「进展记录」末尾；历史结论被推翻时用新条目更正并互相引用（例：`getFocus` 处数 830 → 352）。
3. **交付即同步**：代码提交后跑一次 tracker 与 `pnpm docs:check`，并更新对应计划的「状态 / 剩余」；状态行不得停留在「未实施」。
4. **声明审计（已自动化）**：`pnpm docs:check` 会校验「相对链接目标存在」「文档引用的 `packages/` `scripts/` `docs/` 路径存在」「提到的 `*.spec.ts` 存在」「文档里的扫描口径 == 当前代码 == tracker（含 P5 轴与辅助口径）」「`remaining-work.md` 速览表条目 ID ↔ 明细小节一一对应」「同文档章节引用（`见 2.4` / `见第 3 节` / `见附录 B`）必须落到标题上（含 `.md` 的行按跨文档引用放行）」「**测试基线跨文档一致**（README ↔ `remaining-work.md`；`- 2026-…` 开头的历史进展条目不参与）」「**本地化 `components` 键数**与语言文件一致」「**ui-kit `*-api.ts` 文件数**与磁盘一致（阶段 2 验收目标 0，见 P2b）」「**`DATA_FIELDS` 字段数**与 `element-data.ts` 一致（P4b）」「**计划条目覆盖率**：三份计划的每个「阶段 N / MN / 步骤 N」都必须出现在 `remaining-work.md` 的「计划条目对照」表里」。被明确标注为删除的历史引用（如 M5-b 删掉的 3 个命令式专项 spec）按 note 放行。（计数口径：`docs-check.mjs` 里有 **7 个 `checkXxx` 函数**，另加 `main()` 中的"口径三方对账"逻辑。）

## 工具与门禁说明

| 脚本 | 命令 | 作用与模式 |
| --- | --- | --- |
| `scripts/dom-guard.mjs` | `pnpm dom:guard:tracker` | **写文件**：生成 `docs/dom-migration-tracker.md`（模块列 + P5 轴 + 辅助口径 + 明细）。另有两个历史子命令：`exempt`（按 oxlint 输出为违规文件加豁免注释）、`fix`（修 BOM 错位） |
| `scripts/docs-check.mjs` | `pnpm docs:check` | **只读门禁**（退出码 0/1）：断链 · 路径存在 · spec 存在 · 口径三方一致（含 P5 轴）· 清单 ID↔小节 · 章节引用可解析；`--verbose` 打印口径明细 |
| `scripts/stale-exemptions.mjs` | `pnpm stale-exemptions` | **C2 执行器**：默认干跑；`--simulate` 预演删行数；`--check` 作门禁（仍有陈旧豁免 → 1）；`--apply` 真删并自动复跑 oxlint |
| `scripts/event-surface.mjs` | `pnpm events:surface` | **只读报表**：窗口事件面清单（事件名 / add-remove 计数 / 自定义事件 / 死事件 / 内联匿名监听 / `.vue` 未配对监听 / `mitt`·`useEventListener` 使用情况），E1 的度量来源 |
| `scripts/smoke-layout.mjs` | `node scripts/smoke-layout.mjs <phase>` | **真机冒烟**（CDP over WebSocket）：phase = `debug` / `open-project` / `mode2-directory` / `roundtrip-scene` / `mode0-control` / `drag-mode0` / `drag-mode2` / `drag-here` / `drag-scene` / `drag-region`；前置：`pnpm -F @yami/editor build:all` + Electron 带 `--remote-debugging-port=9223` |
| `packages/editor/scripts/check-vue-types.mjs` | `pnpm -F @yami/editor typecheck:vue` | **vue-tsc 增量门禁**：baseline 模式只拦新增错误，baseline 存同目录 `vue-types-baseline.json` |
| `scripts/i18n-skip-list.mjs` | `node scripts/i18n-skip-list.mjs [--check]` | **生成器**：写出 `packages/editor/src/localize/template-localized.ts`（「全部字段已由模板 `t()`/`v-tip` 承担」的本地化键集合，本地化器对其跳过 DOM 查询）；`--check` 只比对不写入。防漂移同源：`localize/__tests__/template-localized.spec.ts` |
| `scripts/element-registry-migrate.mjs` | `node scripts/element-registry-migrate.mjs audit <src 子目录…>` / `… migrate --registry=… --registry-file=… --sfcs=… --modules=… [--apply]` | **P5b 分组迁移工具**：`audit` 列出某目录各模块用到的 `$('#id')` 及其渲染 SFC；`migrate` 生成分组注册表、改写模块侧读取、给渲染 SFC 补 `:ref`/命令式登记（默认干跑，`--apply` 才写）。文件头写明判据约定（只看 import 语句 / 不做 import 合并 / 清理前剥离注释与正则字面量） |
| `scripts/element-ref-annotate.mjs` | `node scripts/element-ref-annotate.mjs --registry=… --registry-file=… --ids=… --sfcs=… [--local] [--mirror-to=… --mirror-file=…] [--apply]` | **P1b 登记注解器**：模块侧已改完（`document.getElementById('id')` → `<registry>.get('id')`）后，只补渲染 SFC 的 `:ref`/`registerElement` 登记；`--local` 表示主注册表定义在 SFC 内（不补 import）；`--mirror-to` 把局部注册表改成 `createElementRegistry(共享注册表)` **创建时镜像**（不要用 onMounted 循环拷贝：子组件 onMounted 先跑会慢一拍）；`:ref` 已被占用时**跳过并报 unresolved**（不静默） |

分工原则：**生成器只写自己的产物、门禁只读代码与文档、执行器默认干跑**——任何会改源码的操作都必须显式加 `--apply`。

## 常用命令

```bash
pnpm dom:guard:tracker        # 刷新 docs/dom-migration-tracker.md
pnpm docs:check               # 文档一致性门禁（链接/路径/spec/口径/清单结构/章节引用；--verbose 看明细）
pnpm stale-exemptions         # C2 执行器：干跑列出「已无命中」的豁免注释（--simulate 预演删行数；--apply 才真删；--check 作门禁）
pnpm events:surface           # 窗口事件面报表（事件名/自定义事件/死事件/未配对监听/mitt 使用情况）
pnpm lint                     # oxlint（packages/editor + packages/ui-kit）
pnpm typecheck                # editor tsc --noEmit（strict 配置）
pnpm -F @yami/editor test     # editor 全量 vitest
pnpm -F @yami/ui-kit test     # ui-kit 全量 vitest
```
