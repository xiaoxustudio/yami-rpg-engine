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

- **扫描口径**（`pnpm dom:guard:tracker`，命中判定来源 oxlint `--report-unused-disable-directives`）：文件 **1134**；待迁移命中 **158**（初始 299；B1/R2a 后 −1，B4 批 2 后 −1）；豁免注释 **158**；陈旧豁免 **0**；`getElementById` 242；`createElement` 138；`appendChild` 122；`addEventListener` 568。恒等式：**待迁移命中 + 陈旧豁免 = 豁免注释**（158 + 0 = 158）。（扫描文件数较 B0 的 1111 增 3：B1/R1 的 store 与列表组件、B2 的 `utils/folder-group.ts`。）
- **第二条债轴（P5，不在 lint 规则内）**：`$('#id')` 反查 **22 处 / 11 文件**（element-utils 的 jQuery 风格寻址；**P5b 批次 1–4 完成后的残余 = 动态 id 16 / 外壳元素 2 / 基础设施 2 / 白名单 1**；B4 起点 1481，最初 1489）；`new DOMParser()` **0 处**（B1/R1 前 1 处——字符串模板建 DOM 的最后一处已随资源列表数据化下线）。它不进入「待迁移命中」，故单列——见 [remaining-work.md](./remaining-work.md) P5b。
- **度量覆盖范围（重要）**：lint 门禁只覆盖 `document.*` 的 7 个成员（= 待迁移命中 160）；tracker 另有**每模块列**（`appendChild`/`insertBefore`/`parentNode`/`innerHTML`/`addEventListener`…）、**P5 轴**（`$('#id')`/`DOMParser`）与 **`## 辅助口径`** 一节（`style.*` 336、`.children` 229、`hasClass()` 215、`textContent=` 145、`classList` 134、`get/set/removeAttribute` 87、`scrollTop=` 84 …）。**24 个轴的完整判定表**（哪些已登记为待办、哪些属合法用法、哪些为 0）见 [remaining-work.md](./remaining-work.md) 的「覆盖面审计结论」。引用任何"还剩多少"之前先确认它属于哪一档——2026-09-11 多次度量审计都因"漏档"修正过结论。
- **按"源码处数"会低估的第三种情形（运行期放大 / 写法变体）**：`localize/dom-localizer.ts` 源码里只有 3 处字面查询，但它按语言文件的 `components` **2130** 个键在启动时逐键查 DOM（R2b 迁移②后 **1241 键改为模板承担、扫描面降到 889**）（2112 按 id + 18 按 name）；`utils/element-data.ts` 只写了一次 `Object.defineProperty(HTMLElement.prototype, field, …)`，实际在原型上定义了 **72** 个字段的 get/set（144 访问器；B3 前 83/166）——而 tracker 原 `protoExt` 列要求 `prototype.` 跟点，**逗号形式**看不见，现已单列在「辅助口径」。同类还有 `$('#id')`（1489 处）与 `DOMParser` 字符串模板。详见 [remaining-work.md](./remaining-work.md) R2b / P4b。
- **测试基线**（实跑）：ui-kit **97 文件 667/667**；editor **223 文件 1934/1934**。
- **基线时效**：2026-09-11 执行 **B0/B1/B2** 时已改动源码并已重跑套件（B1 后 ui-kit 659 → **667**、editor 1884 → **1891**；B2 步 1–2 后 editor → **1897**：新增 `folder-group.spec.ts` 4 例 + `attribute-folder-group-menu.spec.ts` 2 例）；**下次改动源码后同样需要重跑并同步本行与 `remaining-work.md`**——`pnpm docs:check` 会拦"两处基线数字不一致"（历史进展条目里的旧数字不受影响）。
- **已交付里程碑**：阶段 1（窗口栈数据化）、阶段 2（ui-kit 契约化 + core 去重）、阶段 3（命令表单去 DOM，`read(getElementById)` = 0、125 个 schema 开 `skipWrite`）、阶段 4（inspector/工具层/原型回收）、layout M1–M5、tree 行渲染 v-for 翻默认、**B0（C2 + R3 + E1①）**、**B1（R2a + T1b + R1）**、**B2（T5b 四步：消费方迁移 + `element.group` 缺陷 + `elements` shim + `item.element` 桥 + class 直写收口）**。
- **在办 / 待办**（逐条验收标准与验证命令见 [remaining-work.md](./remaining-work.md)）：B3（P2b `*-api.ts` 退役 + P4b 原型访问器）、B4（P5b 四批）、B5（R2b 本地化器）、B6（巨石 B1）、B7（L1/S1/C1），另 E1 余项与 O1 可并行。

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
| `scripts/element-registry-migrate.mjs` | `node scripts/element-registry-migrate.mjs audit <src 子目录…>` / `… migrate --registry=… --registry-file=… --sfcs=… --modules=… [--apply]` | **P5b 分组迁移工具**：`audit` 列出某目录各模块用到的 `$('#id')` 及其渲染 SFC；`migrate` 生成分组注册表、改写模块侧读取、给渲染 SFC 补 `:ref`/命令式登记（默认干跑，`--apply` 才写）。文件头写明判据约定（只看 import 语句 / 不做 import 合并 / 清理前剥离注释与正则字面量） |

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
