# Pinia 迁移 · 后续任务清单（待审核）

> 状态：**等待用户审核**，未开始执行。
> 依据：本次会话内的实测结果 + 已提交的 27 个提交；背景与判定标准见
> [pinia-migration-analysis.md](pinia-migration-analysis.md)。
> 基线：最后一次代码提交 `c9a2a622` 后全量 `vitest run --project src` = **272 文件 / 2159 例全绿**，
> `tsc -p tsconfig.strict.json` 0 错，`oxlint` 0 警告；其后仅有 `.md` 改动。

---

## 一、确定要做的收尾小活（建议先做）

### T1 —— 清理组件层无参 `useXStore()`

- **为什么**：本仓约定是用 `getXStore()`（显式传 `stores/pinia.ts` 的实例）。无参形式依赖
  `app.use(pinia)` 设的 active pinia，在「先 import 后 `use(pinia)`」或测试 `setActivePinia` 场景下会拿错实例。
  上一轮只清了 `services/project/*` 的 **17 处**，**组件层一直没动**。
- **实测**：`packages/editor/src/components` 下 `useXStore(` 命中 **10 处**，其中混着注释与
  显式 `useXStore(pinia)`（后者与 `getXStore()` 等价，可不改）。已确认的**真·无参**：
  - `components/inspector/file-tileset/FileTilesetPaletteSection.vue:108` → `usePaletteStore()`
  - `components/inspector/scene-tilemap/SceneTilemapPropertiesSection.vue:216` → `useLocalStore()`
- **工作内容**：逐条甄别 10 处 → 替换真·无参者为对应 `getXStore()`（需确认 `getPaletteStore` / `getLocalStore`
  已存在，服务模块那一批已证明这些 getter 在）；顺手把「显式传 pinia」的写法统一成 `getXStore()`（**待你定**）。
- **验收**：`tsc` 0 错 + `oxlint` 0 警告 + `src/components` 与 `src/stores` 及全量套件全绿。
- **规模/风险**：小；低（纯访问方式替换，行为等价）。

### T2 —— 清理 `stores/command.ts` 的两个死镜像

- **为什么**：`stores/command.ts` 自己的注释（`:21`）写明 `state` / `target` 是「**没有 writer** 的浅引用，
  真状态反而在 composable 里」；同文件 `:7` 还导出一个只含这两个键的 `commandStateKeys`。
  这是「双源」残留（真源早已是 `parse` 切片）。
- **实测**：`:7` `export const commandStateKeys = ['state','target'] as const;`、`:56`/`:57` 两个 `shallowRef`。
- **工作内容**：删除这两个浅引用与旧白名单；**同步更新引用它们的既有 spec**（当时正是为了不破坏该 spec
  才保留的，需一并改断言）。
- **验收**：相关 spec 更新后全量绿；确认无生产代码读 `getCommandStore().state/target`（`useCommandState`
  已改为访问 `parse`）。
- **规模/风险**：小；低-中（牵动既有 spec，需确认没有外部读取者）。

---

## 二、需要你裁决的 5 个判定（我倾向「不做」，但请你确认或否决）

| 编号 | 项 | 现状 / 我的判定 | 若你要做，代价 |
|---|---|---|---|
| **D1** | `stores/data.ts:271/:275` 的 manifest 双 ref | 判定**不做**：去重需给 `data` 加**可枚举** getter，否则 `JSON.stringify(data)` 漏字段 | 小改动，但影响项目数据序列化，需补序列化回归测试 |
| **D2** | `ui` 域 15 个 promoted 键未桥 | 属**有意差异**（这些键不需要 store 为源），非缺陷 | 需逐个确认是否真有 UI 侧写入者 |
| **D3** | `autoTile` 导出白名单比桥多 3 键 | 同上，属有意差异 | 极小（对齐两份数组 + 更新 spec 期望） |
| **D4** | `window.stack` 单例镜像 | 判定**保留**：store 已是真源（`stores/window.ts` 的 `shallowReactive` + `syncStack`），单例那份供 ui-kit/测试读 | 需给 ui-kit 注入只读端口（跨包改动，中等） |
| **D5** | `usePresetGetterWindow`（工厂内）、`useFileTilesetPage`（composable 函数体内） | 判定**不迁**：按本次确立标准「模块级=单例可迁；工厂/组件/composable 内=每实例私有不可迁」，迁进去会让多个调用者共享同一份表单 | 不该做（会引入 bug） |

---

## 三、系统性可选（收益中等，改动面大，建议你决定是否立项）

### T3 —— 白名单两份数组的归一

- **实测**：导出 `*StateKeys` **26** 个、单例本地 `*BridgeKeys` **18** 个，仍然并存 → 结构性漂移风险仍在
  （本次已修 `animation`，并确认 `autoTile`/`ui` 为有意差异）。
- **障碍（已查清）**：单例侧那份数组是**模块求值期**读取的，而 store 又要 import 单例 ⇒ 两边直接互相
  import 会踩 TDZ。这就是重复存在的根因。
- **建议方案**：把每个域的键表放进**独立叶子模块**（如 `stores/<domain>.keys.ts`），store 与单例各自
  import 它（无环）。建议**先做 1 个域作样板**（例如 localization 或 animation），确认无副作用后再分批铺开。
- **验收**：样板域 + 一个**漂移回归测试**（把「真实被桥接的键」写死，两侧不一致即红）；其余域分批。

### T4 —— `storeToRefs` 规范落地

- **现状（实测）**：`storeToRefs` **0 处**使用；32 处 store 解构**全在 `.ts`** 且**只解构 state**（快照读）
  ⇒ **当前无 bug**。本次已把规则写进 `pinia-migration-analysis.md`。
- **可选动作**：① 仅保留文档规则（我已完成）；② 若你要求代码层统一，则需先定「组件层解构是否一律改
  `storeToRefs`」，再逐组件改。
- **建议**：先不做代码层改动（无 bug 且会扩大 diff）。

---

## 四、长期 / P2（默认不做，仅登记）

| 编号 | 项 | 实测现状 |
|---|---|---|
| T5 | 引入 `createWindowStore` 工厂消除窗口 store 的样板 | 全仓 **0 处**，未引入；属架构演进 |
| T6 | `Layout` 端口化 / ui-kit 只读镜像端口化 | `Layout` 域已有 store（4 键与 spec 一致），残余字段是 DOM/Vue 实例句柄（B 类，不该进 store）；端口化属可选重构 |
| T7 | 复核「`main/startup.ts` 注册移到 `app.use(pinia)` 之后」 | 我在 `startup.ts` 里**没找到** `app.use(pinia)` 的痕迹 ⇒ 该条**疑为过时**，需复核后再决定是否适用 |

---

## 五、验证类（不是代码任务，但你可能需要）

| 编号 | 项 | 说明 |
|---|---|---|
| V1 | 跑 `packages/ui-kit` 测试套件 | 本次改动只涉及 `packages/editor`（`git log --name-only` 可证），**ui-kit 套件我一次都没跑**；若要绝对保险可自行跑一次 |
| V2 | 复核文档统计口径 | `pinia-migration-analysis.md` 附录已标注「立项时快照 + 执行后实测变化」；26/18 等为本次实测口径，未逐域复核 |

---

## 六、建议执行顺序（供审核修改）

1. **T1 + T2**（确定要做的收尾，两批提交，各自跑 tsc/oxlint/全量套件）
2. 你回复 **D1–D5** 的裁决 → 需要做的并入第 1 步之后
3. **T3**：先做 1 个域的样板 + 漂移回归测试，你看过样板再决定是否铺开
4. T4 / T5 / T6 / T7 / V1 按你的意思决定是否进入计划

## 七、审核时请回复

- D1–D5：**同意保持现状** 还是 **要求执行**（逐条）
- T1 里「显式 `useXStore(pinia)` 是否也统一成 `getXStore()`」
- T3 是否立项、样板域选哪个（建议 localization 或 animation）
- T4 是否只保留文档规则
