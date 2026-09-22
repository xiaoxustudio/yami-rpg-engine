# Yami RPG Editor 重构方案：迁移至 Vue 3 + Pinia + Vite + TS

> 本文档基于对现有代码库的静态分析 + 各阶段实施经验，给出从「无框架 + CustomElements + 单例对象字面量」架构平滑迁移到 Vue 3 全家桶的详细设计。

---

## 实施进度追踪

| 阶段                    | 状态      | 关键产物                                                                                                                                                                                                                                                                   | 验收结果                                                                                                                                                                        |
| ----------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 0 准备            | ✅ 已完成 | `vite.config.ts` + `Project/src/` 骨架 + 依赖安装                                                                                                                                                                                                                          | dev server 双入口 200                                                                                                                                                           |
| Phase 1 骨架            | ✅ 已完成 | `AppShell.vue` + `useEditorStore` + 事件桥接                                                                                                                                                                                                                               | Electron 启动无报错，标题栏 Vue 渲染                                                                                                                                            |
| Phase 2 布局            | ✅ 已完成 | `useLayoutStore` + `LayoutPanel.vue` + 拖拽 composable                                                                                                                                                                                                                     | 工作区 Vue 渲染                                                                                                                                                                 |
| Phase 3 面板            | ✅ 已完成 | Inspector 42 SFC + 文件浏览器 + 工具弹窗 ~100 + 指令编辑器 ~150 + 核心编辑面板                                                                                                                                                                                             | 批次 3.1-3.5 全部完成                                                                                                                                                           |
| Phase 4 CE 内化         | ✅ 已完成 | 39/43 CE 替换为 Vue 组件，白名单 65 标签                                                                                                                                                                                                                                   | Electron 启动无 CE 规范错误                                                                                                                                                     |
| Phase 5 状态净化        | ✅ 已完成 | 27 桥接 store + 42 SFC 响应式本地化 + strict 隔离                                                                                                                                                                                                                          | typecheck:strict 0 错误                                                                                                                                                         |
| Phase 6 构建优化        | ✅ 已完成 | 构建链路静态化 + Script→src/legacy 迁移 + chunk 懒加载                                                                                                                                                                                                                     | 静态验证/构建/dev 全通过                                                                                                                                                        |
| Phase 7 新路线图        | ✅ 已完成 | D1 CE 全量 Vue 化（白名单 65→0）+ D2 事件原生化 + D3 浏览器可运行 + D4 strict 全覆盖 + D5 module-init 校验                                                                                                                                                                 | 全部方向收尾完成                                                                                                                                                                |
| Phase 8 组件库抽离      | ✅ 已完成 | ui-kit monorepo 分包，30 个通用组件（M0-M14）                                                                                                                                                                                                                              | ui-kit test 全绿 / 编辑器全通过                                                                                                                                                 |
| Phase 9 业务组件抽离    | ✅ 已完成 | B1-B9 业务组件 + H1-H6 + F1-F4 FileBrowser 家族 + 结构组件                                                                                                                                                                                                                 | 使用方零改动                                                                                                                                                                    |
| Phase 10 DOM Vue 化     | ✅ 已完成 | 状态 store 化 + 面板/列表/输入事件 Vue 化 + 原型函数式化 + 全局挂载移除                                                                                                                                                                                                    | 25/25 目录 strict                                                                                                                                                               |
| Phase 11 窗口收敛       | ✅ 已完成 | window 挂载清除 + panel 状态进 store + 列表装饰 Vue 化 + 窗口按钮事件化                                                                                                                                                                                                    | el.on 可迁移项清零                                                                                                                                                              |
| Phase 12 Vue 3.6        | ✅ 已完成 | vue 3.5.40 → 3.6.0-rc.3                                                                                                                                                                                                                                                    | 全量测试通过无回归                                                                                                                                                              |
| Phase 13 DOM 清理       | ✅ 已完成 | 表单读写→Vue 双向                                                                                                                                                                                                                                                          | 事件 -38% / createElement -59%                                                                                                                                                  |
| Phase 14 legacy 移除    | ✅ 已完成 | legacy 486 文件/9.7 万行完全移除，平移到 src/                                                                                                                                                                                                                              | editor 1727 tests / ui-kit 450 tests                                                                                                                                            |
| Phase 15 DOM 迁移阶段 5 | ✅ 已完成 | tree 行渲染 v-for 化（已成默认路径）+ layout/PageManager Vue 化（M1–M5 已交付）+ 巨石纯数据 core 抽取                                                                                                                                                                      | **待迁移命中 0**（2026-09-17 实测，曾为 155）                                                                                                                                   |
| Phase 16 迁移收尾       | 🚧 进行中 | 统一迁移台账（`scripts/migration-ledger.mjs`）+ 棘轮门禁 + CI + 白名单单一真源；第 38–89 轮逐接口枚举类型逃生口；第 62 轮补 `ui-singleton-members` 替代轴；**第 90 轮（2026-09-21）修好两条「恒为假 0」的仪器轴并补 `1c-store-slot-gaps`**；第 91 轮 `scripts/` 清洁度收口 | **15 轴持平**；`any-hatches` 52 处、`unknown-casts` 89 处（会话起点 764）；`1c 遗留层`：`ui-singleton-members` 103 / `legacy-ui-lines` 2859 行 / 实现只在遗留层的 store 槽位 41 |

## 当前口径（2026-09-17 起，请以此为准）

> **`docs/` 已在 Phase 15 按收尾流程有意删除**（`scripts/dom-guard.mjs` 源码里专门写了「不要再 mkdirSync」）。
> 因此本文不再指向 `docs/` 下的任何文件——那些链接已经失效。当前唯一的度量真源是**台账脚本本身**：

| 想知道什么                                             | 跑什么                                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| 迁移还差什么（**跨轴总账 + 棘轮**）                    | `pnpm migration:ledger`                                            |
| 任一轴是否变差（CI 门禁，只许变小）                    | `pnpm migration:check`                                             |
| 台账口径的自测（零依赖、零子进程）                     | `pnpm migration:selftest`                                          |
| DOM 迁移矩阵（人读明细）                               | `pnpm dom:guard:tracker` → `scripts/dom-migration-tracker.md`      |
| 数字基线（棘轮比对目标）                               | `scripts/migration-ledger-baseline.json`                           |
| 事件面（自定义事件 / 内联匿名监听）                    | `pnpm events:surface`                                              |
| 文本污染（控制字符 / 注释被写坏）                      | `pnpm text:check`（口径与理由见 `scripts/lib/text-integrity.mjs`） |
| 文档一致性（文档里的包脚本 / 链接 / `node scripts/x`） | `pnpm docs:check`                                                  |
| `global.d.ts` 全局类型增强残留                         | `node scripts/global-types-audit.mjs`                              |

**DOM 轴已收口**：`node scripts/dom-guard.mjs tracker` 实测 **1146 文件 / 待迁移命中 0 / 设计豁免 84**（原口径 1111 文件 / 待迁移 155）。
设计豁免白名单的**单一真源是 `.oxlintrc.json`**（`overrides` 里关掉 `eslint/no-restricted-properties` 的那些 `files`），
脚本侧不再持有副本；`migration:check` 的 `dom-whitelist-drift` 轴守住这条。

**仍在办的轴**（数字为 **2026-09-21 第 90 轮**实测；**以 `pnpm migration:ledger` 输出为准，本节只是快照**）：

> ⚠️ 本节的数字被抄错过一次（`engineBacked=70`，真值 7 —— 成因是台账表格列宽不足时两列会**粘连**
> 成一串，现已给每列加尾随空格修复）。**任何数字都请跑脚本复核，不要从本文转录。**
>
> ⚠️ **第 90 轮修掉了两条「恒为假 0」的轴**（详见文末「第 90 轮」一节）：`legacy-ui-lines` 与
> `legacy-ui-refs` 在 P5-B 纯搬运之后一直读 0，而 `ui-singleton-members` 同时报 103 ——
> **两条轴自相矛盾时先怀疑仪器**。下表已按修正后的口径刷新。

| 轴                     | 现值                                  | 终态 | 说明                                                                                                                                                                                                                                                 |
| ---------------------- | ------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `any-hatches`          | **52 处 / 26 文件**                   | 归零 | 逃生口 `[k\|key: string]: any` + `Record<string, any>`（口径 2026-09-20 扩展，故比旧口径的 32 高；会话起点 67）                                                                                                                                      |
| `unknown-casts`        | **89 处 / 76 文件**                   | 归零 | 双重断言 `as unknown as`（会话起点 764 处 / 262 文件；第 91 轮的 12 处用「修声明 / 收窄集中 / `Reflect.set`」三条手法拿下）                                                                                                                          |
| `ui-singleton-members` | **103 处 / 8 文件**（`declared=134`） | 归零 | `UI.<name> = ` 挂载点，**不受目录影响** —— 因为 `legacy-ui-lines` 是目录口径，阶段 1c 第 ② 步「原样搬运」就会让它变 0 而遗留代码一行没少                                                                                                             |
| `1c-store-slot-gaps`   | **41 个槽位**（`storeRefs=49`）       | 归零 | **第 90 轮新增**：store 引用了、但**实现只在遗留目录里**的槽位 = 1c 第 ③ 步的工作单。与 PHASE-1C 附录三手工数出的 41 一致                                                                                                                            |
| `legacy-ui-lines`      | **2859 行 / 9 文件**                  | 归零 | 遗留单例层（`engine/ui/legacy/`，阶段 1c，高危）。**必须与 `ui-singleton-members` 同时归零**才算收口                                                                                                                                                 |
| `legacy-ui-refs`       | **2 处 / 1 文件**（runtime=2）        | 归零 | 全部落在 `tools/window-cluster.ts`（`export { UI }` + `import { uiWindowReady }`）。⚠️ 本轴只抓**静态依赖**，**数不到** `getLazyWindow('ui', …m.UI)` 那 2 处（`file/file-system-core.ts`、`components/layout/LayoutPanel.vue`），1c 收尾时须手工核对 |
| `format:check`         | **0**（已入 CI）                      | —    | 存量格式债已于第 91 轮用一次 `pnpm format` 收口（305 文件，独立提交），并接进 CI 的 `gates` job。扫描面与 `lint` 对齐（editor + ui-kit）                                                                                                             |

**已归零的轴**：`dom-pending`、`null-casts`（遗留单例形状 `null as unknown as`，曾 689 处 / 52 文件）、
`dom-whitelist-drift`、`dom-whitelist-unjustified`、`stale-exemptions`、`ui-slot-coverage`。

**只需「不增」的轴**：`dom-on-exempted`（120 / 46，设计豁免在用）、`dom-whitelist-size`（14 条）、
`unremovable-listeners`（9 处 / 8 文件，进程级常驻监听，不构成泄漏）。

**口径缺口已关闭**：`Record<string, any>`（35 处 / 31 文件）已于 2026-09-20 并入 `any-hatches`。
它和索引签名是**同一个逃生的两种写法**，只数一种的话改个写法就能凭空「归零」。

---

## 一、现状架构画像

### 1.1 技术栈

- 构建：Vite 8（实测 8.2.2）+ Rolldown，`vite.config.ts` 配置 `electron-renderer-resolve` 插件（把 `electron` / `node:fs` 等裸说明符桥接到 `window.__nodeRequire`）+ `vite-plugin-electron` + Vue 插件（`isCustomElement` 白名单已在 Phase 7 清零，配置中不再出现）
- 语言：TypeScript 6.0.3（catalog；strict 但关闭 `strictNullChecks` / `strictFunctionTypes` / `noImplicitAny`）
- 规范：oxlint + oxfmt，另有 `oxlint-tsgolint` 与 `typecheck:vue`（vue-tsc 增量门禁）
- 宿主：Electron 43.2.0（catalog），`nodeIntegration: true`，`contextIsolation: false`
- 框架：Vue 3.6.0-rc.7（实测解析版；编辑器 `^3.6.0-rc.3`）+ Pinia 4.0.3

> **版本口径（2026-09-11 实测刷新）**：本节原文为 Phase 1 时期快照（Vue 3.5.40 / Pinia 4.0.2 / TypeScript 7.1 / Electron 20），现按 `package.json` + 实际解析版本更新；Phase 12 的 Vue 3.6 升级已生效。

### 1.2 启动链路（Phase 1 后）

```
main/main.ts (Electron 主进程)
  └─ BrowserWindow.loadURL(VITE_DEV_URL | dist/index.html)
       └─ index.html  (手写静态文件, 含 importmap 桥接 + module-init 引用)
            ├─ <script>window.__SKIP_AUTO_INIT__ = true;</script>  ← Phase 1 新增
            ├─ <div id="app"></div>                                ← Vue 挂载点
            ├─ <script type="module" src="/src/main.ts">           ← Vue 入口
            └─ src/main.ts: mount Vue → dispatch 'vue-app-mounted' → 旧 main.ts 调用 Editor.initialize()
                 └─ Editor.initialize() (main/initialize.ts) → Kahn 拓扑排序初始化 40+ 单例
```

> **现状（2026-09-11，含 2026-09-11 复核修正）**：Phase 14 之后 `Project/src/legacy/**` 已不存在，上图为 Phase 1 时期形态。当前链路：`packages/editor/index.html` → `packages/editor/src/main.ts`（挂载 Vue）→ `packages/editor/src/main/initialize.ts`。⚠️ **修正**：该文件现在**不是 Kahn 拓扑排序**（那是 Phase 1/legacy 的机制），而是 150 行的**显式分簇顺序**初始化——`initCore(cluster)` / `initEditors(cluster)` / `initTools(cluster)` 依次调用 `initSingleton(name, singleton)`，单例集合来自 `@app/tools/window-cluster`（`ClusterShape`），并与 `window-registry` 的 `primeWindows()`、`tool-registry` 的 `registerTool()` 配合。Electron 主进程入口为 `packages/editor/main/main.ts`（构建入口见 `vite.config.ts` 的 `electron()` 块）。`isCustomElement` 白名单已清零（Phase 7 D1），`type="module"` 入口由 Vite 处理。

### 1.3 核心架构模式

| 模式           | 现状                                                                                        | 规模             |
| -------------- | ------------------------------------------------------------------------------------------- | ---------------- |
| 单例对象字面量 | `Editor` / `Layout` / `Scene` / `UI` / `Animation` 等 `export const X = {...}` + 后挂载方法 | 40+ 个           |
| CustomElements | 全部 `extends HTMLElement`，`customElements.define` 注册                                    | 43 个            |
| HTML 片段      | `Project/html/**` 下的 partial，通过 SSI 指令拼接                                           | 200+ 个          |
| 事件总线       | 真正的总线是挂在 `window` / `EventTarget` 上的 `on/off/emit` 自定义 shim                    | 480 处 / 93 文件 |
| 全局原型扩展   | `global.d.ts` augment 大量方法                                                              | 400+ 行声明      |
| 模块加载       | dev 下 `head.html` 列出 480+ `<script defer>`；build 靠 `module-init.ts` 全量 import        | 480+ 文件        |

> 上表为 **迁移前（Phase 0）快照**，用于说明重构起点。这些结构在 Phase 4（CE 内化）、Phase 7（CE 清零 + 事件原生化）、Phase 10（DOM Vue 化 + 全局挂载移除）、Phase 14（legacy 移除）中已全部拆除：`customElements.define` = 0、`window.on/off` 可迁移项清零、`src/legacy/**` 删除。当前反模式存量与迁移进度见 `docs/`。

### 1.4 关键文件定位

**历史路径（Phase 1 快照；Phase 14 legacy 移除后已不存在，仅作对照）**：

- 渲染入口（新）：`Project/src/main.ts`（Vue 应用）
- 渲染入口（旧）：`Project/src/legacy/main/main.ts`
- 单例编排：`Project/src/legacy/main/initialize.ts`（Kahn 拓扑排序 `singletonMap`）
- Editor 形状：`Project/src/legacy/main/editor.ts`
- 布局单例：`Project/src/legacy/layout/layout.ts`
- 模块清单：`Project/src/legacy/main/module-init.js`
- 全局类型：`Project/global.d.ts`
- 主进程：`main/main.ts`

**现状路径（2026-09-11 实测）**：

- 渲染入口：`packages/editor/src/main.ts`；应用壳：`packages/editor/src/AppShell.vue` / `App.vue`
- 单例编排：`packages/editor/src/main/initialize.ts`（同目录 `startup.ts` / `register.ts` / `editor-hooks.ts`）
- 主进程：`packages/editor/main/main.ts`（另见 `preload.ts` / `apk.ts` / `ipc-handlers.ts` / `window-manager.ts`；构建入口见 `vite.config.ts` 的 `electron()` 块）
- 页面与静态资源：`packages/editor/index.html`、`packages/editor/Project/**`（`css/layout.css`、`jsons/`、`Templates/`）
- 布局引擎：`packages/editor/src/engine/layout/layout.ts`；ui-kit：`packages/ui-kit/src/components/{basic,business}/**`
- 迁移护栏：`scripts/dom-guard.mjs`（扫描矩阵）、`scripts/check-vue-types.mjs`（vue-tsc 增量门禁）

---

## 二、重构总目标与原则

### 2.1 目标

1. **零功能回退**：重构期间编辑器对外行为完全一致
2. **渐进迁移**：旧代码与新代码可并存运行，避免 big-bang 重写
3. **保留资产**：200+ HTML 片段、43 个 CustomElements、CSS 样式资产最大化复用
4. **引入响应式**：消除手写 DOM 操作，用 Vue 响应式 + 模板驱动 UI
5. **类型安全**：逐步打开 strict 系列开关，单例方法不再后挂载

### 2.2 原则

- **能搬不重写**：HTML partial 几乎 1:1 进 `<template>`，CustomElements 包成 wrapper 即用
- **先壳后芯**：先把应用骨架换成 Vue 应用，内部逻辑逐步替换
- **桥接优先**：旧单例先通过 `window.X` 桥接到 Pinia store，再逐方法内化
- **不破坏 prototype 扩展**：迁移期内保留扩展，新代码不再依赖
- **单分支策略**：所有改动在主分支上进行，靠 `__SKIP_AUTO_INIT__` flag 控制新旧渲染路径

---

## 三、技术选型确认

| 层                  | 选型                                   | 理由                                                                  |
| ------------------- | -------------------------------------- | --------------------------------------------------------------------- |
| 视图框架            | Vue 3                                  | 模板语法最接近现有 HTML partial；`isCustomElement` 平滑过渡自定义标签 |
| 状态管理            | Pinia                                  | 单例对象 → store 的自然映射；devtools 友好                            |
| 构建工具            | Vite 8                                 | `vite.config.ts` 已含 Vue 插件 + 双入口                               |
| 语言                | TypeScript 7.1                         | 逐步打开 strict 开关                                                  |
| 路由                | 不引入 vue-router                      | 编辑器是单页多面板应用，页面切换由 `Layout.manager` 控制              |
| 事件总线            | `mitt`（仅桥接）                       | `window.on` 大部分场景将被响应式替换                                  |
| Electron 集成       | `vite-plugin-electron`（Phase 6）      | 替换手写 resolve 插件                                                 |
| CustomElements 适配 | `@vueuse/core` + `defineCustomElement` | 旧 CE 继续裸用，新组件用 Vue SFC                                      |
| **alias**           | **`@app`（非 `@vue`）**                | 避免与 `@vue/runtime-dom` 包子路径冲突                                |

### 3.1 已安装依赖

```
dependencies:
  vue 3.6.0-rc.7 / pinia 4.0.3 / @vueuse/core 14.3.0 / mitt 3.0.1
devDependencies:
  vite 8.2.2 / @vitejs/plugin-vue 6.0.8 / vue-tsc 3.3.11 / vue 3.6.0-rc.7
  vitest 4.1.11 / jsdom 30.0.1 / electron 43.2.0（catalog）/ vite-plugin-electron 1.1.0
（渲染进程裸说明符桥接已改为仓库内插件 vite/plugins/electron-renderer-resolve.mts，不再依赖 vite-plugin-electron-renderer）
```

### 3.2 事件桥接策略（Phase 1 实施总结）

**问题**：`src/main.ts` 若直接 import 旧单例，在 Vite dev 模式下会与 `module-init.js` 加载的实例产生不同 ES module 实例（URL 解析不一致）。

**解决方案**：

1. 旧 `editor.ts` 末尾挂载 `(window as any).Editor = Editor`
2. `src/main.ts` 不 import 旧模块，mount 后 `window.dispatchEvent(new Event('vue-app-mounted'))`
3. 旧 `main.ts` 检测 `__SKIP_AUTO_INIT__`，监听 `vue-app-mounted` 事件触发 `Editor.initialize()`

**后续单例迁移同样适用**：每个被 Vue 侧访问的旧单例，需在定义文件末尾加 `window.X = X`，Vue 侧通过 `window.X` 桥接，避免 import 实例重复。

---

## 四、目标架构设计

### 4.1 新目录结构（Phase 0/1 已部分建立）

```
yami-rpg-editor/
├── electron/                    # 原 main/ → electron/
│   ├── main.ts
│   └── preload.ts
├── Project/
│   ├── src/                     # ✅ Phase 0/1 已创建
│   │   ├── main.ts              # Vue 应用入口
│   │   ├── App.vue / AppShell.vue / shims-vue.d.ts
│   │   ├── stores/              # editor.ts → useEditorStore
│   │   ├── components/          # layout / inspector / tools / wrappers
│   │   ├── composables/
│   │   └── legacy/              # ✅ Phase 6：旧代码由 Script/ 迁入
│   └── index.html               # ✅ 手写静态
├── vite.config.ts
└── tsconfig.json
```

### 4.2 分层模型

```
┌─────────────────────────────────────────────┐
│  Vue 视图层（SFC + <template>）              │  ← 200+ HTML partial 1:1 迁入
├─────────────────────────────────────────────┤
│  Pinia Stores（响应式状态 + actions）        │  ← 40+ 单例映射（window.X 桥接）
├─────────────────────────────────────────────┤
│  Composables（可复用逻辑）                   │  ← util/** 抽出
├─────────────────────────────────────────────┤
│  Services（无状态 IO / IPC / 文件系统）      │
├─────────────────────────────────────────────┤
│  渲染层（WebGL / Canvas，不变）              │
├─────────────────────────────────────────────┤
│  Legacy 兼容层（原型扩展 + 旧单例 + 旧 CE）  │  ← 迁移期保留，逐步消除
└─────────────────────────────────────────────┘
```

---

## 五、关键映射策略

### 5.1 HTML partial → Vue SFC `<template>`

HTML partial 与 SFC 模板几乎 1:1（`<page-frame>` / `<detail-box>` 等标签原样保留，仅自闭合处理），`id` 属性保留作为桥接锚点，一个 HTML partial 对应一个 SFC，目录结构镜像 `html/` 树。

**`isCustomElement` 白名单**：包含 43 个 `customElements.define` 注册的 + 12 个 HTML partial 伪元素。每替换一个 CE 就从白名单移除。

### 5.2 CustomElements 保留与包装

- **策略 A：保留裸用（迁移期）**——43 个已注册 CE 继续原样加载，靠 `isCustomElement` 让 Vue 不解析内部
- **策略 B：Vue 包装组件（逐步替换）**——SFC `<command-list ref>` + `defineExpose({ getElement })`，旧 CE 仍靠 data 属性驱动
- **策略 C：`defineCustomElement`（新组件）**——跨框架使用的新组件用此导出

### 5.3 单例 → Pinia Store（window.X 桥接模式）

**关键**：不 `import` 旧单例（避免 ES module 实例重复），通过 `window.X` 桥接。每个旧单例需在定义文件末尾加 `(window as any).X = X`。

**迁移映射表**（40+ 单例 → store）：

| 旧单例                                                | 新 store                                  | 备注                    |
| ----------------------------------------------------- | ----------------------------------------- | ----------------------- |
| `Editor`                                              | `useEditorStore` ✅                       | state/config/project    |
| `Title`                                               | （AppShell 内联）                         | 标题栏                  |
| `Layout`                                              | `useLayoutStore` ✅                       | 面板布局                |
| `Local`                                               | `useLocalStore` ✅                        | 本地化                  |
| `AudioManager` / `Menubar` / `Home` / `Timer`         | `useAudioStore` 等 ✅                     |                         |
| `Scene` / `UI` / `Animation` / `Particle`             | 各自 store ✅                             | 场景/界面/动画/粒子编辑 |
| `Window` / `Inspector` / `Command` / `Project`        | 各自 store ✅                             |                         |
| `Easing` / `Team` / `PluginManager` / `CustomCommand` | 各自 store ✅                             |                         |
| `Log` / `UpdateLog` / `Reference`                     | `useLogStore` ✅                          | 日志                    |
| `Directory` / `Browser` / `Selector`                  | `useBrowserStore` / `useSelectorStore` ✅ |                         |
| `Printer`                                             | `usePrinterStore` ✅                      |                         |
| `Color` / `ImageClip` 等工具弹窗                      | `useToolStore` ✅                         |                         |
| `Variable` / `Attribute` / `Enum` / `Localization`    | 各自 store ✅                             | 数据管理                |

**初始化策略**：保留 `initialize.ts` 的 Kahn 拓扑排序作为 legacy 入口；Pinia store 用 `onMounted` + 显式 await 替代拓扑；迁移期不改动 `initialize.ts`，直到 Phase 5 全部单例迁移完毕。

### 5.4 事件总线 → 响应式 + provide/inject + mitt

| 场景           | 旧方式                          | 新方式                              |
| -------------- | ------------------------------- | ----------------------------------- |
| 全局状态变化   | `window.emit('localize', data)` | Pinia store + `watch` / `subscribe` |
| 跨组件共享状态 | `window.on('variablechange')`   | `provide` / `inject` 响应式 ref     |
| DOM 原生事件   | `el.on('pointerdown', fn)`      | Vue `@pointerdown="fn"`             |
| 自定义业务事件 | `EventBus.emit(...)`            | `mitt` 实例                         |
| 生命周期钩子   | `window.on('resize', fn)`       | `useEventListener`（@vueuse）       |

**mitt 桥接层**（Phase 5 引入）：`export const bus = mitt()`，迁移期把旧 `window.emit/on/off` 转发到 mitt。

### 5.5 全局原型扩展 → Composable / 工具函数

| 原型方法                                | Vue 等价物               |
| --------------------------------------- | ------------------------ |
| `el.addClass('x')` / `removeClass('x')` | `:class="{ x: cond }"`   |
| `el.show()` / `hide()`                  | `v-show` / `v-if`        |
| `el.css('color', 'red')`                | `:style`                 |
| `el.on('click', fn)`                    | `@click="fn"`            |
| `el.read()` / `write(v)`                | `v-model` / store action |
| `el.dispatchResizeEvent()`              | `useResizeObserver`      |
| `el.seek('tag')`                        | `ref` + `template ref`   |
| `el.setTooltip('x')`                    | `<Tooltip>` 组件         |

纯函数逻辑迁到 `src/utils/`，新代码 import 使用；迁移期原型扩展原样保留。

---

## 六、分阶段迁移路线图

### 阶段 0：准备 ✅ 已完成

**目标**：Vite + Vue 骨架落地，双入口共存。
**已实施**：依赖安装、`vite.config.ts`（Vue 插件 + `isCustomElement` 55 标签白名单 + 双入口 + `@app` alias）、`Project/src/main.ts` + `App.vue`、`tsconfig` paths。
**验收**：dev server 双入口均 200；旧编辑器照常运行。

### 阶段 1：应用骨架替换 ✅ 已完成

**目标**：标题栏 Vue 化 + `useEditorStore` + 事件桥接。
**关键决策**：`#window-ambient`/`#tooltip`/`#cursor-region` 保留静态（被闭包捕获）；alias 用 `@app`；事件桥接用 `window.Editor` + `vue-app-mounted`。
**验收**：Electron 启动无报错，标题栏由 Vue 渲染，进程稳定。

### 阶段 2：布局系统迁移 ✅ 已完成

**目标**：`Layout` → `useLayoutStore`，工作区面板 Vue 化。
**验收**：工作区面板切换、拖拽分栏、尺寸调整功能正常。

### 阶段 3：面板内容迁移 ✅ 已完成

**目标**：逐面板 Vue 化。

- 批次 3.1 Inspector（45 partial）→ SFC
- 批次 3.2 文件浏览器
- 批次 3.3 工具弹窗（80+）
- 批次 3.4 指令编辑器（160+）
- 批次 3.5 核心编辑面板（scene/ui/animation/particle 外壳 Vue 化，WebGL 不动）

每批次迁移完毕后从 `module-init.ts` 删除对应 import。
**验收**：每面板迁移后，该面板所有交互功能与旧版一致。

### 阶段 4：CustomElements 内化 ✅ 已完成

**目标**：43 个 CE 逐步替换为原生 Vue 组件。
**分类**：表单类 12 / 列表类 8 / 容器类 10 / 辅助类 13。
**每替换一个 CE**：删除 `customElements.define` → 白名单移除 → 删除 legacy 文件 → 更新使用处模板。
**验收**：`isCustomElement` 白名单为空，所有 UI 由 Vue 原生渲染。

### 阶段 5：状态层净化 ✅ 已完成

**目标**：消除单例字面量，全部走 Pinia；移除原型扩展。

1. 剩余单例全部映射为 store
2. 删除 `src/legacy/singletons/` 目录
3. 原型扩展改为 `src/utils/` 纯函数
4. 删除 `global.d.ts` 中的 augment，改为精确类型
5. 分步打开 `strictNullChecks` → `strictFunctionTypes` → `noImplicitAny`
6. 删除 mitt 桥接层，事件全部走响应式
7. 删除 `initialize.ts` 拓扑排序，store 初始化改 Vue 启动流程

**验收**：`window.on` / 原型扩展全部消除；`vue-tsc --noEmit` 通过。

### 阶段 6：构建与打包优化 ✅ 已完成

**目标**：清理迁移期遗留，优化产物。
**已实施**：删除 HTML 拼接与全量 import 脚本；`Project/Script/` 迁入 `src/legacy/`；`index.html` 手写静态化；chunk 拆分懒加载（42 inspector 页面 + monaco 独立 chunk）；合并 `vite.electron.config.js` 至 `vite-plugin-electron`。
**验收**：`pnpm typecheck` / `typecheck:strict` / `lint` 零新增错误；`build:vite` 产出 `dist/` + `dist-electron/`。

---

## 七、风险与对策

| 风险                                              | 影响 | 对策                                                 | 状态      |
| ------------------------------------------------- | ---- | ---------------------------------------------------- | --------- |
| 344KB `index.html` 拆分后旧 include 路径断裂      | 高   | 保留 `build-html.js` 过渡，旧 partial 逐步迁出后才删 | ✅ 已规避 |
| 43 个 CE 内部依赖原型扩展，Vue 包装后失效         | 高   | 迁移期原型扩展原样保留，包装组件只做桥接             | ✅ 已规避 |
| `window.on/off/emit` 480 处使用，全量替换工作量大 | 高   | mitt 桥接层先接管，新代码用响应式                    | ✅ 已解决 |
| 40+ 单例拓扑排序初始化，迁移顺序错乱会崩溃        | 高   | 保留 `initialize.ts` Kahn 拓扑排序                   | ✅ 已规避 |
| ES module 实例重复                                | 高   | 通过 `window.X` 桥接，Vue 侧不 import 旧单例         | ✅ 已解决 |
| alias `@vue` 冲突                                 | 高   | 改用 `@app` alias                                    | ✅ 已解决 |
| 闭包捕获 DOM 元素                                 | 中   | 保留静态 HTML 或改惰性 getter                        | ✅ 已规避 |
| WebGL 渲染层与 Vue 响应式冲突                     | 中   | canvas 用 `shallowRef` 持有，渲染循环不进响应式      | ✅ 已处理 |
| `tsconfig` strict 打开后大量类型错误              | 中   | 分模块逐步打开，每打开一个修复一轮                   | ✅ 已处理 |
| `window.Window` 命名冲突                          | 中   | 挂载时确认覆盖安全或重命名                           | ✅ 已评估 |

---

## 八、验收标准

### 8.1 功能验收

- 所有 200+ HTML partial 对应界面元素均存在且可交互
- 43 个 CustomElements 功能在新组件中 1:1 还原
- 40+ 单例核心流程（打开项目 / 编辑场景 / 保存 / 导出）正常
- 撤销重做、快捷键、拖拽、剪贴板等交互无回退

### 8.2 非功能验收

- `pnpm dev` 启动时间 ≤ 3s
- `pnpm build:vite` 产物体积 ≤ 当前 70%
- `vue-tsc --noEmit` 零错误，`strictNullChecks: true`
- `oxlint` 零 error
- 主/渲染进程 IPC 无回归

### 8.3 代码质量

- 无 `// @ts-ignore` / `as any` 滥用
- `src/legacy/` 目录已清空（最终完成）
- `global.d.ts` 不再 augment 全局原型
- `isCustomElement` 白名单为空

---

## 阶段 7：新迁移路线图（2026-08 规划）

> 在 Phase 0-6 全部完成后，对迁移现状做盘点，提出 Phase 7+ 迁移方向。主方向为**自定义元素（CE）全量 Vue 化**（D1），另有事件 API 原生化（D2）、浏览器可运行性修复（D3）、strict TS 覆盖扩大（D4）、module-init 自动化校验（D5）。

### 7.0 现状盘点（Phase 7 开工时快照；**当前口径见本文开头「当前口径」一节**）

**已完成**：全部 480+ 模块 ESM/Vite 化；UI 全页面 Vue 化（layout + 42 inspector + 100+ 工具窗口，共 200+ SFC）；28 个 pinia stores；`window.emit()` = 0；全局扩展清空。

**剩余可迁移点**：CE 类 0 个（`customElements.define` = 0）；isCustomElement 白名单 32 个结构伪元素；`window.on/off(` 62 处；原型扩展 2 个；strict 排除整个 legacy；浏览器启动阻塞 2 处。

**关键结论**：CE 全量 Vue 化现实可行且规模有限（39 个文件 / 12,061 行），可分波完成。

### 7.1 方向 D1：自定义元素全量 Vue 化（主路线）✅ 已完成

- **目标**：CE 内部逻辑全部改为真 Vue 组件 → 删除 `customElements.define` 与 legacy CE 文件 → 白名单 65 → 0。
- **公共 API 兼容**：保持 `read/write/enable/disable/on/input/relate` 等（Vue 侧 `defineExpose` 不变）。
- **分波计划**：
    - Wave 1（轻量 16 个 / 1,828 行）：switch-item、marquee-area、empty-state、loading-overlay、drag-and-drop-hint、detail-box、detail-summary、window-frame、title-bar、toast、page-manager、nav-bar、scroll-bar、filter-box、keyboard-box、gamepad-box
    - Wave 2（输入控件 14 个 / 2,602 行）：check-box、radio-box、radio-proxy、color-box、slider-box、number-box、text-box、text-area、custom-box、number-var、string-var、textarea-var、select-var、file-var
    - Wave 3（复合/重型 9 个 / 7,631 行）：tab-bar、menu-list、select-box、select-list、param-list、parameter-pane、tree-list、common-list、command-list

- **完成状态**：Wave 1-3 全部完成，`customElements.define` 39 → **0**；D1 收尾 Batch 1-6 完成：白名单 65 → **0**，所有结构伪元素（group/box/item/text/file-*/page-frame 等）转标准 HTML + class，vite.config.ts 白名单清空，typecheck 基线错误归零。
- **关键决策**：DOM bridge 保持命令式 API（`onMounted` 以 `Object.setPrototypeOf` + `attachXxxApi` 承接 legacy 调用）；Menu/Select 单例保留；`TreeList.prototype.call` 兼容；CSS 标签选择器 → 类选择器。

### 7.2 方向 D2：事件 API 原生化 ✅ 已完成（2026-08-02）

- 实测 `window.on(/off(` 共 310 处 / 54 文件，全部替换为原生 `addEventListener/removeEventListener`；元素/CE/NodeList 的 `.on/off(` 同样替换。
- `doubleclick` 特例迁入 `util/doubleclick.ts`。
- 删除 `util/event-target.ts`、`util/node-list.ts` 及相关全局声明。
- **完成标准**：`window.on/off(` grep = 0；无原型扩展；typecheck 零新增 / lint 0 / build:vite 成功。
- 范围外保留：自定义类自身的 `on/off` 与挂载实例的 `on` 属性。

### 7.3 方向 D3：浏览器可运行性修复 ✅ 已完成（2026-08-03）

- `config.ts` / `global.ts` 顶层 `os.homedir()` 加浏览器 fallback；迭代消除 10+ 顶层/初始化链 node 副作用阻塞点（全部 `typeof`/可选链守卫，Electron 下行为不变）。
- **收益**：纯浏览器可启动 → 解锁 browser_use 自动化回归验证（不再依赖 Electron CDP）。
- **完成标准**：浏览器 http://localhost:5173 可到达 home 页，控制台无未捕获 TypeError。

### 7.4 方向 D4：strict TS 覆盖扩大 ✅ 已完成（2026-08-03）

- **根因**：`tsconfig.strict.json` 的 exclude 不阻断 import 链，动态导入把整个 legacy 依赖图拉回编译（~6000 错误）。
- **方案（legacy 隔离）**：动态导入改 `@/main/module-init`（运行时等价）；新增 ambient wildcard（已迁移层 `@/` 视为 any，迁出即恢复精确类型）；strict paths 仅留 `@app/*`。
- **完成标准**：`pnpm -F @yami/editor typecheck`（strict 配置）**0 errors**（6287 → 0）；typecheck / lint / build:vite 全部通过。

### 7.5 方向 D5：module-init.ts 维护自动化 ✅ 已完成（2026-08-03）

- 新建 `scripts/check-module-init.js` 双向校验——校验 A 防漏（磁盘 − module-init import − EXCLUDE 白名单非空即报错）；校验 B 路径有效性；EXCLUDE 白名单 40 个（纯类型/工具/工厂/无副作用模块，带原因注释）。
- `check:module-init` 集成到 `build:vite` 前置。
- **完成标准**：漏 import 即报错（负向验证退出码 1）；基线通过（445 模块 + 白名单 40）。

### 7.6 优先级与执行顺序

```
D1-Wave1 → D2 → D1-Wave2 → D1-Wave3 → D3 → D4 → D5
```

（D2/D3 可并行；D4 后 typecheck:strict 0 错误；D5 后漏 import 即报错——**Phase 7 全部方向收尾完成**）

### 7.7 验收标准与验证方式

- 每波完成即验证：`typecheck` 零新增、`lint` 0 error、`build:vite` 成功、dev 启动无渲染报错。
- 运行时验证沿用 Electron CDP 自动化 + 浏览器回归（D3 后）。

---

## 阶段 8：通用组件库抽离（Phase 8）

> 在 Phase 7 全部方向收尾后，将编辑器通用组件抽离为独立组件库，采用 pnpm workspace monorepo 双分包。完整方案文档：`.trae/documents/ui-kit-monorepo-component-library-plan.md`。

### 8.1 Monorepo 结构与决策

**三大既定决策**：① 组件库纯 Vue 契约（`defineModel` + props/emits）+ 编辑器侧桥接层保留 legacy DOM 契约；② CSS Module（`<style module>`）+ 全局 design tokens；③ vitest + @vue/test-utils 单元测试 + Playground 开发/文档工作台。

**结构调整**：编辑器整体迁入 `packages/editor`（@yami/editor），根目录变为纯 workspace 根（脚本转发 + husky/commitlint + pnpm overrides）。

```
yami-rpg-editor/
├── pnpm-workspace.yaml          # packages: ["packages/*"]
├── package.json                 # workspace 根：脚本转发 + commitlint + overrides
├── .oxlintrc.json/.oxfmtrc.json
└── packages/
    ├── editor/                  # @yami/editor
    └── ui-kit/                  # @yami/ui-kit 组件库分包
        ├── package.json         # peerDependencies: vue ^3.5.0
        ├── vite.config.ts       # lib mode
        ├── tsconfig.build.json  # vue-tsc --emitDeclarationOnly
        ├── vitest.config.ts     # jsdom
        ├── playground/          # 独立 vite dev 应用（端口 5199）
        └── src/
            ├── index.ts         # 公共导出
            ├── components/basic/
            ├── composables/
            ├── theme/           # tokens.css + ThemeProvider + theme.ts
            └── styles/index.css
```

**集成方式**：编辑器经 vite alias `@ui-kit` 直接引用组件库源码，无需每次构建 lib；组件库独立 `vite build` 产出 dist 供外部消费。

**版本兼容实证**：vitest 4.1.10 peerDeps 支持 vite ^8；`defineModel`/`:deep()` 等经 context7 验证；**vue-tsc 3.3.8 不兼容 TS 7.1-dev → ui-kit 单独使用 TS 5.9.3 生成 d.ts**（编辑器仍用 TS 7.1）。

### 8.2 M1-M14 组件抽离实施（全部完成）

**基建**：theme tokens 统一 `--ym-*` 前缀（亮/暗双主题）；`index.ts` 导出统一 YM 前缀；命名规范（YM 前缀 + `components/basic/<Name>/` + `<style module>` + 全局类 `:global()` 组合）。

**抽离组件**（30 个通用组件）：

- M1：YMButton / YMCheckBox / YMSwitchItem / YMEmptyState / YMLoadingOverlay + ThemeProvider/useTheme
- M2：YMDetailBox / YMDetailSummary / YMSliderBox / YMRadioBox（+ group 状态抽离）
- M3：YMToastManager / YMPageManager / YMNavBar / YMFilterBox
- M4：YMKeyboardBox / YMGamepadBox
- M5：YMTextBox / YMNumberBox / YMTextArea（+ history 桥接）
- M6：YMCommonList（虚拟列表）/ YMScrollBar（自定义滚动条）
- M7：YMSelectBox（popup 内建弹层，可关闭走编辑器 Select）
- M8：YMColorBox（内建色板弹层）
- M9：YMNumberVar（constant/variable 双模式 + 插槽渲染）
- M10：YMStringVar / YMTextAreaVar / YMSelectVar
- M11：YMFileVar（file/variable 双模式 + 插槽渲染）
- M12：YMMenuList（菜单弹层全套交互，menu-api 工厂）
- M13：YMTreeList（1601 行完整移植，tree-api 工厂 + prototype 兼容）
- M14：YMSelectList（下拉弹层，Select 单例薄转发）

**编辑器集成统一模式**：包装层（`CheckBox.vue` 等）+ legacy DOM bridge（`read/write/on` 等 el API 不变），使用方零改动；样式兜底统一用 `:global(:where(...))`（特异性归零 → 编辑器 CSS 永远胜出）；依赖全局类名的组件（ScrollBar/NumberBox）用普通 `<style>` 而非 module。

**验证**：ui-kit test 全绿 / vue-tsc 0 errors / 编辑器 typecheck/strict/lint/build:vite 全通过 / CDP 运行时逐组件验证。

---

## 阶段 9：业务组件抽离（Phase 9）

> Phase 8 通用组件（30 个）全部抽离完成后，剩余组件判定为**编辑器业务组件**（与 Command/插件/窗口/文件系统耦合 50%+）。本阶段方案：ui-kit 新增 `components/business/` 分类，业务组件通过**选项注入**模式托管进 ui-kit，编辑器保留薄转发层，使用方零改动。

### 9.1 分类与盘点

**已抽离（Phase 8，basic/）**：30 个通用组件。

**待抽离（业务组件候选）**：

| #   | 组件            | legacy 行数            | 使用数      | 说明                          |
| --- | --------------- | ---------------------- | ----------- | ----------------------------- |
| B1  | MarqueeArea     | 125（Vue）             | 13          | 选区选框，business 目录样板   |
| B2  | DragAndDropHint | 101                    | 程序化      | 拖拽指示线，TabBar 前置依赖   |
| B3  | TitleBar        | 167 + title-bar.ts 692 | 246         | 窗口标题栏                    |
| B4  | WindowFrame     | 381（Vue）             | 251         | 窗口框架                      |
| B5  | TabBar          | 607（Vue）             | 1           | 标签页栏                      |
| B6  | ParamList       | 1118（Vue）            | 31          | 参数列表，性价比最高大件      |
| B7  | ParameterPane   | 871（Vue）             | 17          | 参数面板                      |
| B8  | CommandList     | 2324                   | 1 + eslints | 指令列表，最后攻坚            |
| B9  | CustomBox       | 475+588                | 310         | 数据选择器，getter 注册表抽象 |

**本轮不做**：FileBrowser 家族（3103 行，独立阶段）；history 工具类（可作 basic 补充）；原型补丁类（保留）。

### 9.2 关键技术

1. **选项注入模式**（先例：createMenuApi / createTreeListApi / createSelectListApi）：ui-kit 工厂接受 `options` 注入编辑器业务函数（命令解析/变量分析/窗口打开/本地化等），默认值 no-op/兜底，编辑器薄转发层组装真实依赖。
2. **YM 工厂适配器**：ParameterPane 内建控件改用 ui-kit 的 YM 系列。
3. **getter 注册表抽象**：CustomBox 的 14 个 Getter 窗口归并为 `getterRegistry` 注入。
4. **原型补丁兼容**：eslints.ts 对 `CommandList.prototype` 的运行时补丁经 ui-kit 导出的 prototype 对象转发。

### 9.3 验证标准

每个 B 组件：ui-kit 测试通过 + vue-tsc 0 errors + 编辑器 typecheck/strict/lint/build:vite 全过 + CDP 运行时验证 + 使用方零改动。

### 9.4 实施结果（全部完成）

- **B1-B9 全部迁入 ui-kit business/**：MarqueeArea / DragAndDropHint / TitleBar / WindowFrame / TabBar / ParamList / ParameterPane / CommandList / CustomBox——使用方全部零改动。
- **H1 history 工具类**：HistoryTimer / NumberHistory / TextHistory / CommandHistory（5 个 legacy 转发层 re-export，使用方零改动）。
- **H2-H4 纯工具**：scroll-listener / tree-data-context / color-utils。
- **H5-H6 业务逻辑**：type-registry（38 类型注册表）/ radio-proxy。
- **F1-F4 FileBrowser 家族**（~3103 行全部迁移 ui-kit business/）：FileHeadPane（2 注入点）→ FileNavPane（5）→ FileBodyPane（13）→ FileBrowser（12）——editor 4 个包装层共 ~560 行，使用方（AppShell/Selector）零改动。
- **结构组件**：FormButtons + WindowContent 批量替换（按钮组 237 处 + content-frame 250 处重复消除）——随后 content-frame 与按钮组**内置 WindowFrame**（`<WindowFrame id="x" [show-apply] [buttons-id-prefix="y"]><template #title><TitleBar/></template><内容></WindowFrame>`），窗口 = 纯内容描述；14 个无按钮窗口加 `no-buttons` 标记。
- **高频三项命令式 api**（9.31）：CustomBox / SelectBox / TextBox 纯命令式 api 文件（组件薄壳方案在 vite dev 独立挂载不生效，改纯 DOM 实现），转发层薄化（475/426/273 → 15/15/20 行），53 个命令式调用点零改动。
- **低频命令式工厂抽离**：19 个中 18 个统一（批次 1-4，7+3+6+2），common-list 无使用方维持原样——editor 转发层全部薄化（~3400 行 legacy → ~350 行转发）。
- **editor 回归测试基础设施**：vitest 配置 + 首个回归测试（scrollbars.spec）→ 逐步扩展至 100+ 测试。

### 9.5 收官总结

**全部抽离任务完成**（basic 30 + business 13 + 工具模块 6 + FileBrowser 4 + history 4）——编辑器业务组件库化完成，使用方零改动。剩余评估后保留：legacy 命令式工厂双模式统一（暂缓）、D 类 editor 专属（commands/tools/inspector/layout/stores/module、element-utils 原型扩展、原型补丁类）。

---

## Phase 10：DOM 全面 Vue 化迁移

> 用户方向「全部 DOM 操作迁移到 Vue 状态管理」。

### 10.1 现状分析（数据）

| 区域                           | DOM 操作               | 特征                   |
| ------------------------------ | ---------------------- | ---------------------- |
| legacy module（命令/插件）     | 362                    | 最大头                 |
| legacy inspector               | 219                    | 属性面板               |
| legacy palette/animation/title | 107/96/94              | 高密度小文件，试点首选 |
| ui-kit 命令式 api              | 326 监听 / 191 创建    | 双模式遗留             |
| window 全局                    | initialize.ts 40+ 注册 | 状态散落               |
| prototype 扩展                 | 28 处                  | 非标准                 |

### 10.2 目标架构（四层）

- 视图层：Vue 组件（模板/指令——DOM 收敛）
- 状态层：Pinia stores（业务状态——替代 window 全局/DOM 属性）
- 事件层：Vue emit + store actions（替代 el.on）
- 兼容层：桥接（迁移期 legacy 通过薄封装访问 Vue 状态）

### 10.3 迁移阶段

- **Phase A 状态先行**：window 全局数据 → Pinia stores（legacy getter 代理桥接，零改动过渡）
- **Phase B 控件层**：el API 控件 → Vue 组件 + composables，api 退役
- **Phase C 高密度模块**：palette/animation/title 逐模块迁移
- **Phase D 窗口/列表**：命令式交互 → emit/响应式
- **Phase E 事件系统**：el.on → emit/actions
- **Phase F 清理**：prototype 扩展 → composables；window 全局 → store

### 10.4 实施结果（全部完成）

- **状态 store 化（8 组）**：Editor/Data/Attribute/Enum/Variable/Local/Palette/Title（defineProperty 桥接 + syncState + stateKeys 模式）。
- **面板事件 Vue 化（14 模块）**：Palette/Title/Menubar/Scene/UI/Animation/Particle/Sprite/Curve/列表（TreeList 包装层转发）等全部模板化。
- **列表事件（15 窗口）**：attribute/enum/variable/localization/team/plugin/easing/autoTile/customCommand/scene/ui/animation 等 TreeList select/record/open/popup/change 转发。
- **输入/控件事件**：命令窗口 8 + inspector 8 页面 + 6 页批量 + element 7 页。
- **事件迁移收尾**：CallEvent/RegisterEvent/TintImage 等命令窗口控件事件；list* handler this 上下文全面修复。
- **原型函数式化**：cmdOrCtrlKey / relate / getRelativeCoords / macRedoKey / hideDragImage / drawAndFitImage / spaceKey 等。
- **strict 25/25 目录**：legacy 全部 25 个子目录纳入 strict（as any 断言清零，type 位置 any 收窄 23 批 3431→2299）。
- **全局 Window 挂载移除（Vue 3 规范化）**：getWindow 函数 71 文件删除 + 34 全局名 import 化 + Browser/Selector 组件桥 Pinia 化 + DOM 挂载 WeakMap 化 + 窗口/布局状态同步接通 + Clipboard stub 复原。

---

## Phase 11：全局挂载清除 + 窗口状态收敛

> 用户方向「改善 Window 上挂载对象、DOM 元素挂载数据、直接操作 DOM 元素」。全部完成：

- **window/globalThis 挂载清除**：config / globalThis.Clipboard / **lazyComponentsReady** / EditorGlobals / 工具注册表——审计测试固化（global-mounting.spec 禁止 window.xxx = 写入）。
- **窗口 panel 选择状态 → Pinia store**：attribute / enum / variable 的 selected 状态。
- **组件挂载规范化 + provide/inject 示范**：9 个组件 el 裸挂载 → attachElementApi；useMenuService / useToastService provide/inject。
- **窗口列表装饰 Vue 化**：ui-kit tree-api 新增 renderNodeExtras / renderNodeIcon 注入点，15 个窗口 nodeExtras / nodeIcon 全量 Vue 化（32 处 node-icon）。
- **visibility/lock 图标交互 Vue 化**。
- **数据窗口逻辑进 store**：attribute/enum/variable 的 createId/register/unregister/getItemById/undo/redo/saveHistory actions。
- **reader/writer dataValue 兜底废弃** + DOM 挂载残留终盘清理。
- **窗口按钮 click 挂接 Vue 化（124+14 处）**：YMFormButtons dispatch confirm/apply/cancel → WindowFrame emit → @confirm 桥接；cancel 由 Window 系统全局处理。
- **createEditIcon 交互 Vue 化**（plugin/custom-command）。
- **el.on 终盘审计**：可迁移项清零（inspector 批量 ~130 + tools/title/animation 批量），剩余均为合理保留（窗口生命周期/快捷键/滚动/拖拽/广播/动态/this 依赖）。
- **Window.confirm 迁 Pinia store**（30+ 调用点零改动）。
- **ui-kit 渲染引擎 Vue 化**（P1-P3）：tree-api / YMFileNavPane / YMFileHeadPane / YMFileBodyPane / YMCommandList 节点内部元素 renderElement 化——标签名全部保持，样式契约与 seek/tagName 交互零影响。
- **残留自定义元素全量迁移**：scroll-corner / no-drag-image / command-line / layout group / common-item / tooltip-line 等。

**多轮运行时 bug 修复链**（用户反馈）：UI 图标遗漏 / 插件文字偏移 / tree-api null 崩溃 / 场景选中黑字（GL color 数组）/ 窗口模态失效 / electron import 崩溃（Vue 组件禁止直接 import electron）/ 自定义元素警告 / 图标重叠 / 初始化时序 / Teleport 目标缺失 / webSocket 命令 initAll 崩溃（parsers 判空）/ 命令组件渲染崩溃链（循环依赖 + 判空）。

**最终状态**：Pinia stores 33 个 + Vue 组件 354 个（tools 102/commands 153/inspector 42/layout 15/common 37/file-browser 5）+ editor 211 tests / ui-kit 378 tests；残留命令式 DOM 全部为合理保留（canvas 8、layout group 7、滚动/拖拽、时间轴增量渲染）。

---

## 阶段 12：Vue 3.6 迁移

**背景**：Vue 3.6.0-rc.1（2026-07-18）发布（feature-complete）。项目当前 vue 3.5.40 + pinia 4.0.2 + @vitejs/plugin-vue 6.0.8。

**3.6 核心变更**：

- ① **@vue/reactivity 基于 alien-signals 重构**：响应式性能/内存大幅改进，同 API 行为兼容但边缘时序可能有差异——**本项目最大影响面**（33 stores + 354 组件）。
- ② **Vapor Mode 完成**（无 VDOM 编译模式）：100% opt-in。
- ③ 大量 runtime-vapor bug 修复（VDOM 模式不受影响）。

**Vapor Mode 采用评估：不采用**。理由：大量命令式 render(h())；模板 ref 依赖 $el/$props；性能敏感区已是命令式/虚拟滚动；354 组件全量迁移不现实。

**迁移阶段计划**：

- P1 预检（plugin-vue/pinia/vue-tsc/test-utils/@vueuse 兼容核对 + CHANGELOG breaking changes 审查 + 升级前基线）
- P2 升级（editor + ui-kit 双包同步 vue → 3.6.0-rc.x）
- P3 全量验证（typecheck/strict/test/build:vite/lint + dev 冒烟）
- P4 响应式专项回归（shallowRef/shallowReactive/computed/watch 时序/命令式 render(h()) 交互/defineModel/useTemplateRef）
- P5 稳定版跟进（3.6.0 正式发布后切换）

**执行结果（P1-P5）**：P2 升级 vue ^3.6.0-rc.3 + vue-tsc 3.3.9；P3/P4 全量验证通过无行为回归（editor 211/211 + ui-kit 378/378）；待办：3.6.0 正式版切换 + dev 冒烟手测。后续完成 dev 冒烟发现的修复（TabBar 拖拽 / initAll confirm 缺失重试 / sourcemap 噪音请求 stub / wheel passive 监听清理）。

---

## 阶段 13：DOM 清理迁移方案

**现状基线**：$ 调用 2875 次 / 281 文件；DOM 操作：事件绑定 ~783、classList/style 写入 ~555、createElement 82、textContent 89；遗留状态：Layout/Window/SearchString/EventEditor 0 store 引用。

**迁移方案**（分类：可迁移/保留/桥梁）：

- **P1 高频低风险**：ui-kit 8 个「Vue 壳」组件模板化（YMParameterPane/YMFileBodyPane/YMParamList/YMTextBox/YMFileNavPane/YMFileBrowser/YMTabBar/YMFileHeadPane）——消 ~250 处 DOM 操作。
- **P2 中频**：legacy window 类 top10（conditional-condition/set-value-operand/text-capture/setString/animation-window 等）——$ 读写换 defineModel/props 事件；getElementReader/Writer 退役。
- **P3 低频/复杂**：状态 store 化（Layout/Window/SearchString/EventEditor 进 pinia——Layout 最高优先）；剩余散点 $。
- **保留层**：tree-api/command-api renderElement 引擎、webgl/particle/palette 画布渲染、进程/文件/插件契约、虚拟滚动基础设施。

**完成预期**：$ 2875 → <500（仅引擎契约）；事件 ~783 → <150；style/classList ~555 → <100。

**实施结果（全部完成）**：

- P1：ui-kit 壳组件模板化（TextBox/NumberBox/CustomBox/ParameterPane/ParamList/HeadPane；YMTabBar 评估后零改动保留）。
- P2：10 个目标窗口/页全部完成——命令窗口用「窗口表单桥接模式」（setForm/getForm），inspector 页用「组件持数据 + v-model + sync」模式；**setForm 必须显式 write**（Vue modelValue 初始渲染不触发控件 write/relate）。
- P3：状态 store 化核心完成（0 store 引用模块清零）；低频表单型 6 个；最终基线 $ 2875→2856（read/write 纯操作类清零）、事件 783→484（-38%）、createElement 82→34（-59%）、classList/style 555→336。
- **CustomBox None 显示链**：parsers 判空 + ui-kit write 无条件渲染 + 解析结果空兜底 + onMounted 归一 write + Local 时序（localize 事件重渲染）+ expose update——三层兜底齐备。

---

## 阶段 14：legacy 移除迁移方案

**终极目标：删除 legacy 文件夹。**

**基线**：legacy 486 个 .ts / 96,986 行；398 文件内部 `@/` 互引；358/474 外部文件 import `@/`；巨型 SCC 78 模块；module-init.js 副作用加载序是唯一环解法。

**分类**（迁移目标）：

- A 状态层 20/4.5k → pinia store（补 undo/history/searchstring/data；标杆：stores/browser.ts——业务逻辑整体迁入，legacy/browser/ 已空目录）
- B 逻辑层 195/33k → composables（inspector 44 页 + command 42 + tools 14 + title/local/data/log + module/command 153 注册表——setString 模式 = CommandSchema + Vue 表单桥接）
- C 渲染引擎 63/33.5k → engine/（scene/animation/ui/particle/palette/webgl/layout——保留命令式）
- D 进程/文件 46/8.5k → services/（main 11/file 7/update 21/plugin/printer/webserver）
- E 工具 45/4k → utils/（与 @app/utils 合并去重）
- F 桥接壳 40/1.2k → 合并到 Vue 组件

**依赖顺序**：B0 util/types/file（叶子）→ B1 webgl/codec → B2 data 纯数据层 → B3 引擎集群（事件/注入断环）→ B4 tools+window-object 基座 → B5 command 系统 → B6 inspector 控制器 → B7 服务层 → B8 壳删除。

**硬障碍**（处理方式）：①78 模块 SCC（断环三件套：共享形状抽 types/、单例协作改 EventBus、module-init 副作用 → 显式 init()）；②命令式 DOM 算法（迁 engine/）；③进程/IPC（services/ + data-URL 垫片沿用）；④DOM id + setForm/getForm 契约（id 冻结为接口）；⑤副作用注册（集中注册点）；⑥双 HTML 入口 + module-init.js + packmeta.json 路径（收口期改）；⑦358 处 `@/` 引用（codemod）。

**分阶段**：

- P1 状态补全（1.5-2 周）：A 类全部反转 store 为源——里程碑：store 可独立于 legacy 存活
- P2 窗口逻辑 → composables（3-4 周）：inspector 44 + tools 14 + title/local/data/log
- P3 引擎 → engine/（3-4 周）：C 类 63 文件 + 断环编译
- P4 命令系统（4-5 周）：module/command 153 + command/ 42
- P5 进程/文件 → services/（1.5-2 周）：D 类
- P6 收尾（1-1.5 周）：E/F 合并、module-init 删除、@/ 别名移除、双入口收口、**legacy/ 删除**

**验证**：每阶段 tsc + 全量 vitest + dev 冒烟；P6 grep @/ 零残留 + 全量 + 打包 e2e。

### 14.1-14.112 实施结果（全部完成）

- **P1 状态反转**：25 个单例 store 为源（title/window/layout/scene/ui/animation/particle + 18 批量反转），stores 删 syncState + 兼容桥保留。
- **P2 composable 迁移**：inspector 页（useXxxPage：form/sync/onParamInput）+ 工具窗口（useXxxWindow：单例 + open/confirm）+ accessor 窗口 + 命令窗口（setForm/getForm 桥接），legacy 瘦身为转发层。
- **P3 引擎迁移**：webgl/codec/sprite/layout/palette/scene/particle/animation/ui 全部引擎域迁入 src/engine/（palette 混合文件拆分模板），内容零改动 + 挂接块。
- **P4 命令系统**：useCommandSchema 通用引擎，B 类 68 + A 类 73 + N 类 11 + accessor 10 + 条件分支 5 + variable/preset 全部 composable 化——命令系统 composable 化完成。
- **P5 服务层**：file-system 纯函数 / DirectoryTree / IPC 通道 / updater / file-item / 主进程拆分 / store 解耦 / Editor 辅助服务化（services/project/）。
- **P6 收口**：
    - module-init.ts 完全删除（→ main/register.ts 52 行替代）+ check-module-init.js 删除
    - `@/` codemod 3728 token/1077 文件 → `@app/legacy/` + `@` 别名退役 + legacy-ambient.d.ts 删除
    - Editor 编排迁移（services/project/）+ ambient 清理
    - command 拆解（module/command 153→0，注册块移入 composable 顶层）
    - 转发 shim / 死代码 / 假产物批量清理（14.84/14.86/14.88/14.89）
    - 纯搬策略（scene/inspector/command/tools/components 整组平移，SCC 整组搬）
    - **legacy 文件夹 486 文件/9.7 万行 → 完全移除**——全部平移到 src/（stores/components/composables/engine/services/utils/commands/scene/tools/inspector/animation/ui/plugin/palette 等合理结构）
- **i18n 迁移**：vue-i18n 唯一真源 + 兼容层（Local.get/createGetter/getLabel 转发）+ loader 独立 + DOM 本地化器 + **legacy Local 完全移除**；组件层 getLabel→useI18n().t 全量（511→0）；切语言不更新/窗口标题文本 t() 化等修复。
- **Vue 3.6 后续修复**：TabBar 拖拽 / initAll confirm 缺失延迟重试 / sourcemap 噪音 stub / wheel passive 清理。
- **自定义元素全量迁移（14.111）**：运行时残留的非标准标签（node-item/file-* /command-* 等）全部转标准 HTML + class，vite 白名单恒 false，CSS 标签选择器残留 = 0。
- **窗口模态残留修复（14.112）**：frames.append/remove 对称下沉焦点管理 + 事件编辑器折叠线（command-line）L 形收尾规则。

**最终里程碑**：

- editor 1727 tests（+ ui-kit 450 tests）
- typecheck 0 / typecheck:strict 仅基线 2 / lint 0 errors / build:vite 成功
- legacy 目录删除完成，`@app/legacy` 零残留

---

## 最终总结

### 核心成果

| 阶段        | 关键成果                                                                         |
| ----------- | -------------------------------------------------------------------------------- |
| Phase 0-6   | 架构迁移（Vue 3 + Pinia + Vite + TS）、面板/CE/状态/构建全部完成                 |
| Phase 7     | CE 全量 Vue 化 + 事件原生化 + 浏览器可运行 + strict 全覆盖 + module-init 自动化  |
| Phase 8-9   | ui-kit 组件库（30 basic + 13 business + FileBrowser 4 + 工具模块），使用方零改动 |
| Phase 10-11 | DOM 全面 Vue 化 + 全局挂载清除 + 窗口状态收敛                                    |
| Phase 12-13 | Vue 3.6 升级 + DOM 清理（事件 -38% / createElement -59%）                        |
| Phase 14    | legacy 486 文件/9.7 万行完全移除，i18n 迁移完成                                  |

### 最终验证

- **editor**（Phase 14 当时）：1727 tests / typecheck 0 / strict 0（仅基线 2）/ lint 0 errors / build:vite 成功
- **ui-kit**（Phase 14 当时）：450 tests / vue-tsc 0 errors
- **架构**：Pinia stores 33+ / Vue 组件 354 / engine / services / composables / i18n 分层清晰
- **最新基线（2026-09-11 实跑）**：**editor 210 文件 1884/1884**、**ui-kit 96 文件 659/659** 全绿；`oxlint` 0 警告，`tsc` / `vue-tsc` 门禁 0 新增；SFC 计数 editor 338 + ui-kit 55（不含测试）、`stores/` 37 个文件。

> ⚠️ **上面这段的 DOM 口径已失效**，保留原文仅为记录当时的判断：它写的是「`docs/dom-migration-tracker.md`（1111 文件 / 待迁移 155 / `getElementById` 232）」与「Phase 15 仍在办，进度以 `docs/vue3-migration-plan.md` 为准」——`docs/` 已删，Phase 15 已收尾。
>
> **2026-09-17 实测**：DOM 待迁移命中 **0**（1146 文件 / 设计豁免 84）；`tsc --noEmit -p tsconfig.strict.json` **0 错误**；`vue-tsc` 棘轮 baseline `[]`（0 新增）；`global.d.ts` 接口块 **0**；`oxlint` 1597 文件 **0 warning / 0 error**。跨轴总账见 `pnpm migration:ledger`，数字基线见 `scripts/migration-ledger-baseline.json`。
>
> **2026-09-21 实测（第 90 轮）**：**editor 250 文件 / 2057 通过**、**ui-kit 115 文件 / 811 通过**、`oxlint` 1597 文件 0/0、`tsc` strict 0、`vue-tsc` 0 新增、`migration:selftest` 51/51、`text:check` 0 命中、`docs:check` OK。

---

## 第 90 轮（2026-09-21）：台账仪器修正 + 文本污染门禁 + 死代码移除

这一轮**没有推进任何一个迁移轴的业务进度**（`ui-singleton-members` 仍是 103、`unknown-casts` 只从 102 降到 101）。
它做的是三件「让后续每一轮都可信」的事 —— 按本仓的规矩，这类改动必须留下理由，否则下一个人会顺手改回去。

### 一、修掉两条**恒为假 0** 的仪器轴（本仓最危险的一类缺陷）

`ui-singleton-members` 报 **103 处挂载 / `declared=134`**，而同一张表里：

| 轴                | 旧读数            | 真相                       | 根因                                                                                                                                                      |
| ----------------- | ----------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `legacy-ui-lines` | **0 行 / 0 文件** | 2859 行 / 9 文件           | 目录**写死** `packages/editor/src/ui`，而 P5-B 纯搬运已把它搬到 `engine/ui/legacy/`；`collectFiles()` 对不存在的目录返回 `[]` 且**不抛错**                |
| `legacy-ui-refs`  | **0 处**          | 2 处 / 1 文件（runtime=2） | ① 前缀还写着 `^@app/ui/`；② `collectImports()` 只认 `import … from`，而真实引用是 `export { UI } from '@app/engine/ui/legacy/ui-window.ts'`（**再导出**） |

**为什么危险**：两条轴都「✓ 已完成」，而报表里同时有一行说着 103 —— 只看其中一行就会得出完全相反的结论。
更糟的是**仪器瞎了不会有任何信号**：`collectFiles` / `importRefs` 永不报错，`migration:check` 也永远绿。
（同轮修 `ui-slots.mjs` / `self-test.mjs` 时已经踩过一次同样的坑，注释里专门写了「抄了副本的地方当场全瞎」，**只有 `migration-ledger.mjs` 漏了**。）

修法：① 目录改为 `dirname(uiWindowRel())` 动态定位；② 前缀改为 `^@app/engine/ui/legacy/`；③ 给
`collectImports()` 补 `export … from`（它确实是静态运行时依赖）；④ `self-test.mjs` 增一条
**「遗留层还在 ⟹ 三条轴必须非 0」** 的用例，并断言台账源码不得回退到那两个硬编码口径。

> 附一条实测到的次级坑：写 `REEXPORT_RE` 时少写一个捕获组，`specifier` 会是 `undefined`，
> 于是再导出被 `filter` **静默丢弃** —— 数字还是 0，且不报错。自证用例因此连 `specifier` 一起钉。

### 二、补 `1c-store-slot-gaps`（1c 第 ③ 步的工作单）

`ui-slot-coverage.total` **恒为 0**：`assignedSlots()` 把遗留目录里的 `UI.x = …` 也算成「已赋值」，
于是「删掉遗留层会让多少动作静默失效」在台账上**完全不可见** —— 只有 PHASE-1C 附录三**手工数**的
「store 尚缺 41 个槽位」记着，而文档会过时、轴不会。

新轴数的是「**实现只在遗留目录里**」的 store 引用槽位（`legacyOnlyStoreSlots()`），终态 0。
**首轮实测 41，与附录三手工数出的 41 一致** —— 口径自证。搬走一个降 1，与 `ui-singleton-members` 同生共死。

### 三、新增「文本污染」门禁（`pnpm text:check`）

实测到一族**语法合法**的写坏，`tsc` / `oxlint` / `oxfmt` / vitest **全都看不见**：

| 形态                         | 实例                                                                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 单词首字母被换成控制字符     | `各写一遍 as unknown as` → `各写一遍 ␇s unknown as`（`\a`=0x07）；`bindInput` → `␈indInput`（`\b`）；`editor` → `␛ditor`（`\e`）   |
| 首字母被换成 TAB             | `内部 textarea` → `内部<TAB>extarea`                                                                                               |
| 两条语句被吞进 `//` 注释     | `…（如 scrollLeft/hover）\n\tfor (const m of …)` 里的 `\n` 成了**字面量**（`scripts/audit-ui-slots.mjs:64`，那段代码从此永不执行） |
| 注释体里又开块注释，整段重复 | `src/inspector/element-registry.ts`（`cdfc80e9` 批量改写 `$('#…')` 时引入，9 行注释被复制进自己）                                  |

共修 7 个文件（含 2 个已提交的存量）；新增 `scripts/lib/text-integrity.mjs`（6 条规则，每条都实测过
**零误报**，理由与取舍写在文件头）+ `scripts/check-text-integrity.mjs`（CLI，纯文本扫描、零子进程）+
**11 条自证用例**（每条规则都用「故意写坏」的样本证明它抓得到，同时证明合法写法不被误报）。

### 四、死代码移除（全部经全仓引用确认）

| 目标                                              | 证据                                                                                                                                                                                                                                                        |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stores/tool.ts`（253 行）+ 其 spec               | 唯一 importer 是它自己的 spec ⇒ `bindShortcutStore` / `bindToolRegistry` 在生产里**从未被调用**                                                                                                                                                             |
| `tools/tool-registry.ts` + 其 spec                | `getToolInstance` 全仓**零生产调用**；`registerTool` 只被 `initialize.ts` 写入过一个没人读的 Map                                                                                                                                                            |
| `ShortcutRegistry` / `bindShortcutStore`          | 唯一调用者是上面的 spec ⇒ `register()` 实为 **no-op**（spec 自证循环：它 import store 才触发了绑定）                                                                                                                                                        |
| `main/initialize.ts` 的 10 行 `registerTool(...)` | 与 `initTools(cluster)` 重复的写-only 死状态                                                                                                                                                                                                                |
| `composables/useUIContainerPage.ts` + spec        | 唯一 importer 是它自己的 spec；且核实**从来没有** `UIContainerPage.vue` —— 原始 `index.html` 里容器页就是空的 `<page-frame value='uiContainer'></page-frame>`（容器元素没有页面专属属性，复用的是通用分组），所以那个 composable 从诞生起就没被任何页面用过 |
| `src/legacy-ambient.d.ts`                         | `@` 别名已在 Phase 14 退役，全仓 `from '@/` 命中 0                                                                                                                                                                                                          |
| `packages/editor/packmeta.json`                   | 与 `src/module/packmeta.json` **哈希相同**，而只有后者的被 import / 被 vite 插件拷贝                                                                                                                                                                        |
| `scan.mjs` 的 4 个零引用导出                      | `filesMatching` / `countByFile` / `countAll` / `escapeRegExp` 全仓只有定义行                                                                                                                                                                                |
| `NATIVE_EVENTS`                                   | 由「死导出」改为**唯一真源**：`event-surface.mjs` 自带的那份与之逐字相同，已合并                                                                                                                                                                            |

### 五、门禁补强（两个「永远绿」的门禁）

- **`docs:check` 重写**：它原来只扫 `docs/*.md`（Phase 15 已删），退化成「目录不存在 → 打印一行 → `exit 0`」；
  且它的 `checkC1Whitelist()` 还在找 `dom-guard.mjs` 里早已删除的 `WHITELIST` 常量 —— **只要 `docs/` 回来就会立刻红**。
  现按**现有 6 份文档**重定检查面：文档里写的包脚本必须存在（按 `-F <pkg>` 定位到具体 package.json）·
  相对链接目标存在 · `node scripts/x` 引用存在。三条都实测过零误报，并已接入 CI。
  **刻意删掉**「文档里的 `packages/…` 路径存在」这一条：本仓计划文档是沿革记录，会合法地提到已删除/已平移的文件
  （实测 34 条引用里 6 条报红、**没有一条是真缺陷**）—— 宁可少一条轴，也不要一条没人看的红轴。
  它第一次跑就抓到 **README 的 `pnpm run start` / `build:runtime` / `build:runtime:mac` 三个不存在的脚本**（已修）。
- **`.gitignore` 去掉 `pnpm-lock.yaml`**：lockfile 一直**未入库**，而 CI 三个 job 全部执行
  `pnpm install --frozen-lockfile` ⇒ fresh clone 上会直接失败（或退化为完全不固定的依赖），
  **门禁/测试/构建一个都不会跑**。已入库（10073 行）。
- `lint-staged` 的 glob 补 `.vue` / `.mjs`（原来 `*.{js,ts,css}` 漏掉了 350+ 个 SFC 与 `scripts/` 本身，
  而 `.oxlintrc.json` 对这两类都有专门规则）；`format` / `format:check` 的扫描面补 `packages/ui-kit`
  （原口径只扫 editor，与 `lint` 不一致）。
    > ⚠️ 由此暴露一个**已知不一致**：`pnpm lint` 的扫描面是 `packages/editor packages/ui-kit`，
    > **不含 `scripts/`**，而 `lint-staged` 会对**改动过的** `.mjs` 跑 oxlint（`maxWarnings: 0`）。
    > 这造成「碰到的脚本必须当场清零」，而没碰到的仍带着 warning —— 门禁与钩子口径不一致。
    > **已收口**：把 `scripts/` 的 37 条 warning 全部清零（10 条是真实小问题：未用导入 4、
    > `new Array(n)` 1、无用转义 1、正则 `$` 改 `endsWith` 3、`await` 非 Promise 1；
    > 余下 27 条是 `smoke-layout.mjs` 的 `no-await-in-loop` —— 见下），
    > 并把 `scripts` 加进 `pnpm lint` 的扫描面（现 **1623 文件 0/0**）。
    > 一次性 codemod / 探针**留在原地**（它们被 `PHASE-1C` 大量按名字引用），
    > 「是否移进 `scripts/oneoff/`」独立于清洁度，不再阻塞。
    > `no-await-in-loop` 只对 `scripts/smoke-layout.mjs` 用 override 关掉，理由写在文件头：
    > 该规则抓的是「本可并行却被误写成串行」，而这是**真机 UI 自动化驱动**，
    > 每步都必须等上一步生效 —— 用 `Promise.all` 会直接测出错误结果。
    > 其余规则**没有**关掉（不把问题藏起来）。
- ui-kit 的 `"create": "node scripts/create-component.js"` 指向**不存在**的文件 ⇒ 删除。
- 新增 `.gitattributes`（`* text=auto eol=lf` + 二进制白名单）：仓库此前没有它，而 Windows `core.autocrlf=true`
  导致工作树 398/400 文件是 LF、少数 CRLF，`git diff` 每次警告，`oxfmt`/`oxlint` 结果会因行尾抖动。

### 六、本轮之后「还没做」的（按优先级）

1. **1c 第 ①③④ 步**（`ui-singleton-members` 103 → 0、`1c-store-slot-gaps` 41 → 0）——
   **运行时高危区，必须先按 PHASE-1C 的 9 条实机回归清单点一遍**。
2. `unknown-casts` ／ `any-hatches` 的继续收敛（手法库见 PHASE-1C §3；进度见「第 91 轮」）。
3. 4 项待用户决策：`TextCommandShape.color` 真实类型 / `ParamHistory` vs `IEditableHistory` /
   第 45 轮两处行为缺陷（清单见 PHASE-1C 交接 §5⑥；原先此处只写「P6 三处」，那个标签全仓查无内容）/ 1c ③④ 是否开工。
4. `format:check` 321 个文件（editor 249 + ui-kit 72）的处置：跑 `pnpm format` 收口并入 CI，或降级为非门禁。
5. 「迁移分段注释」清理（`P4b` 204 处 / `P5b` 213 / `P1b` 111 / `P2b` 54，横跨约 400 文件）——
   **必须在 1c 之后做**：1c 会把 `engine/ui/legacy/*` 整个重写，先做等于白做。
   规则：承重理由（「为什么不能退回 `null`」这类）保留；只去掉阶段代号。
6. `scripts/` 的一次性 codemod / 探针是否移进 `scripts/oneoff/`（**已不阻塞**：清洁度已在第 91 轮收口）。

> **〔本节的状态更新，2026-09-21 第 93 轮补注 —— 上面的条目是第 90 轮当时的写法，按「沿革只增不改」保留〕**
>
> - 第 1 条：**闸门已放行，且第 ① 步已落地**。用户按 PHASE-1C 的 9 条实机回归清单跑完并确认
>   **全部通过** ⇒ 1c 可以开工；① 已按「直连遗留窗口模块、保留 `clusterReady`」完成
>   （见第 94 轮）。⚠️ 计划里 ① 的原写法「改直连 `ui-engine.ts`」**不能执行**：
>   `ui-engine.ts:2` 本身就 import `loadUI`（循环），且 `loadUI` 返回的是模块命名空间、
>   不是 `UI` 实例 ⇒ `UI.drawBackground` 恒 `undefined`，渲染被静默打碎。
> - 第 3 条：**4 项 → 3 项**。第 45 轮那两处行为缺陷已在第 93 轮修掉（见该轮），
>   剩下 `TextCommandShape.color` 真实类型 / `ParamHistory` vs `IEditableHistory` /
>   P5-C/D 开工（属 1c 之后的事）。
> - 第 4 条：**已关闭（第 91 轮）**：`format:check` 已收口为 0 并接进 CI。

### 七、一条**已知但本轮故意不动**的残留（附理由，避免下一个人重复探查）

**`LayoutPanel.vue` 里 `#uiContainer-vue-mount` 是个死 id**：第 90 轮核实「全仓没有任何 SFC / 代码读它」
（`AppShell.vue` 的 `inspectorPages` 只对**存在的** `components/inspector/*.vue` 生成 Teleport 目标，
而容器页本来就没有 SFC），也核实原始 `index.html` 里那一帧**本来就没有 id**（是后来被误加的）。
**没有删**：`LayoutPanel.vue`（2109 行）带着**存量格式债**，`oxfmt --write` 一次会产生
**+1251 / −985 行**的机械改写，与本次改动无关的 churn 会淹没真正的变更。按本仓第 37 轮的教训，
这种大面积机械改写必须**单独一轮**做（与待决策项 ④「`format:check` 321 个文件怎么收口」是同一件事）。
届时顺手删掉这个 id 即可。

> 顺带记一条**本轮的自我纠错**：起草这段时我先写了「`Project/global.d.ts` 已无内容、只剩说明注释」——
> **是错的**。它确实 `interface` 块为 0（审计轴的名字容易让人以为整份文件都空了），但仍持有
> 6 条 `declare module 'xml2js' / 'koa' / …` 的**第三方依赖 ambient 声明**，是**在用**的文件。
> 这正是本仓反复强调的那件事：**轴的标签只描述它量的那一件事，不要外推成全文件的结论。**

---

## 第 91 轮（2026-09-21）：`unknown-casts` 101 → 89，`scripts/` 清洁度收口

### 一、类型债：12 处，三条手法各用一次

| 手法                        | 站点                                                                                                                                                                                                                        | 结果 |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| **修声明**                  | `Variable.apply` 形参改可选（它本就有「带事件 / 不带事件」两条调用路径；兄弟单例 `Attribute`/`Enum`/`Localization`/`PluginManager` 一直是 `x?.apply?.()` 无参调用）                                                         | −2   |
| **修声明**                  | `EditData.eventListDom` 声明 TreeList 的选中游标 `start`/`end`（原来两个读点各写一遍 `as unknown as { start: unknown }`：同一个事实、两份解释）                                                                             | −2   |
| **修声明**                  | `FileEventPage.parameters` 改可空 —— 它是「先占 `null`、稍后整体赋值」的形状；写成非空就得把整个 9 成员单例一起 `as unknown as FileEventPage`（**一次断言换全单例失检**）                                                   | −1   |
| **收窄集中**                | `event-editor-initialize`（`EventEditor.list`）、`text-tip`（`TextSuggestion.list`）改走 `registryElement<T>`；后者顺带删掉两处形参断言（比较与赋值两边类型一致了）                                                         | −5   |
| **`Reflect.set`**（手法 5） | `webgl-init` 把 `WebGLRenderingContext.prototype.bufferData` 的**重载补丁**改用 `Reflect.set`：这个补丁换了同名方法的签名，类型系统无法表达（单次 `as` 也会被 TS2352 挡住），而函数自身已写明参数类型，存储这一步不需要断言 | −2   |

**留着的三类（已记理由，不是写法问题）**：`printer.ts` 3（`typeof Printer` 是类类型、无隐式索引签名；另有 2 处占位值待决策）、
`eslints.ts` 3（要先动 `CommandListShape` 的类型设计）、`scene-context.ts` 的 `Light`/`Parallax` 构造参数
（`SceneLight` 与真实 `LightData` **漂移**且 `LightData` 未导出 —— 属「类与接口漂移」的真债务，要连承重形状一起动）。

> 手法上的一个复现结论：**「先看报错码」比「先看写法」省事**。`Variable.apply` 与 `FileEventPage.parameters`
> 两处都是 TS 直接指向声明（TS2559 / TS2322 家族），改声明就一次性消掉多处断言；
> 而 `webgl-init` 那处无论怎么改声明都会被 TS2352 挡住 —— 它才是真正需要「换机制（`Reflect.set`）」的。

### 二、文本污染：新增第 7 条规则，修掉 15 处存量 U+FFFD

上一轮的控制字符规则**看不见** U+FFFD（一个中文字被解不出来 → `�`，常带一个多余的 `?`）。
补 `replacement-char` 规则后一次抓出 **15 处**，全部只在注释里（`printer.ts` 11、`apk.ts` 1、
两个 `.vue` 的 `缝隙` 2、`related-references.ts` 1）。

**11 处从污染前的历史版本逐字恢复**（`b9752365^:Project/Script/printer/printer.js`、`7d2405c7^:Project/index.css`、
`e56b7133^:…related-references.ts`）—— 这条线索顺带定位了事故引入点：`b9752365` / `c880e6d8`
（「migrate `Project/Script/**/*.js` to `.ts`」）。其余 4 处历史里没有干净原文（注释写于事故之后），按代码事实重写。

### 三、`scripts/` 清洁度：37 条 warning → 0，并把 `scripts` 加进 `pnpm lint`

第 90 轮把 `.mjs` 加进 `lint-staged` 后，钩子会 lint `scripts/`，而 `pnpm lint` 不扫它 —— 门禁与钩子口径不一致
（碰到就要清零、没碰到的一直带着 warning）。本轮收口：10 条真实小问题逐个修（未用导入 4、
`new Array(n)` 1、无用转义 1、正则 `$` 改 `endsWith` 3、`await` 非 Promise 1），
余下 27 条是 `smoke-layout.mjs` 的 `no-await-in-loop` —— 那是**真机 UI 自动化驱动**，
每步都必须等上一步生效，用 `Promise.all` 会直接测出错误结果，故只对这一个文件用 override 关掉（理由写在文件头）。
现在 `pnpm lint` = **editor + ui-kit + scripts，1623 文件 0/0**。

### 四、验证

- `unknown-casts` **89 处 / 76 文件**（本轮起点 101/82）、15 轴持平
- `migration:selftest` 52/52、`text:check` 0 命中、`docs:check` OK、`events:surface` 报表数字与改前一致
- `lint` 1623 文件 0/0、`tsc` strict 0、`vue-tsc` 0 新增、ui-kit `build:types` 0
- editor **250 文件 / 2057 通过**

### 五、格式债收口（待决策 ① 选 (a)）+ 一个环境坑

- 一次 `pnpm format` 收口 **305 个文件**（+7836 / −4359），独立成一次提交（大面积机械改写按第 37 轮的
  教训**避开任何并行写入者**，也是唯一一次动到 288 个 `.vue`）。`format:check` 从此 **0**，
  并接进 CI 的 `gates` job（扫描面与 `lint` 对齐：editor + ui-kit）。
- 实测体量参考：`LayoutPanel.vue` 单文件重排就是 **+1251 / −985 行** —— 所以第 90 轮「顺手删
  `#uiContainer-vue-mount` 那个死 id」被推迟到这一轮最划算（本轮仍留作下次同类清理的顺手项）。
- **踩到的环境坑（值得写进 CONTRIBUTING）**：收口后跑 editor 全量套件，**137 个文件 0 用例失败**，
  报 `Error: Electron failed to install correctly`。根因不在改动：`electron@43.2.0` 的 `index.js`
  在**被 require 时**检查 `dist/` 二进制，缺失就当场 `install.js` 下载；本机下不到该版本
  （electron 缓存里只有 18/20/29/35），于是一切**间接 import 了 `electron`** 的 spec 整文件失败。
  判定方法写进了 CONTRIBUTING：**同一个 spec 在 `git stash` 前后都失败 ⇒ 与改动无关**。
  绕过办法：`ELECTRON_OVERRIDE_DIST_PATH`（`index.js:30` 会短路，不下载、不校验），
  设了之后 editor **250/2057**、ui-kit **115/811** 全绿 —— 也就是说这次格式化**没有**任何行为回归。
- **又一个「别当成自己弄坏的」现象**：跑完测试后 `src/module/packmeta.json` 会变成已修改 ——
  `src/module/constants.ts` 在**模块加载期**就把版本号写回该文件（单行 `JSON.stringify`）。
  于是它**不能**受 `format:check` 约束（否则「跑一次测试」就把门禁弄红），
  已加入 `.oxfmtrc.json` 的 `ignorePatterns`，理由同时写进 `CONTRIBUTING.md`（含
  「提交前 `git checkout --` 它」的提醒）。
- **还有一个必须记住的发现：`oxfmt` 会格式化 Markdown 围栏里的代码**（按本项目的 TS 配置）。
  实测它把 `PHASE-1C-TEST-PREREQ.md` 里一段**专门演示「只留单次断言、保留尾逗号」**的样例的
  **尾逗号删掉了** —— 它把「证据」当成「待格式化的源码」改。因此 `**/*.md` 也进了
  `ignorePatterns`：文档是本项目的**记忆**，格式门禁不该替它做决定。
  （本轮收口已把 3 份 `.md` 按 oxfmt 排过一遍：表格补白无害、围栏内的改写属上述副作用；
  下次这类「顺手格式化」不要再带上文档。）

## 第 92 轮（2026-09-21）：交接节里一项**指向不了任何地方**的待决策（纯文档）

### 一、症状：一个列在「唯一准确的现状」里、却查无内容的决策项

交接节 §5 写「仍待决策的 4 项」，其中 ⑥ 是 `P6 三处行为缺陷`。想按它办事时发现**无处可查**：

```bash
# ① 全仓（含全历史）里，这个短语只在两处出现，且两处都只是「引用」
git log --all -S '三处行为缺陷' --oneline      # → 只有 2 个提交，都是交接节的引用
grep -rn 'P6 三处行为缺陷'                     # → 交接节 1 处 + xr.md 1 处，都没有清单
# ② 「P6」在本仓另有定义，而且与这三处无关
grep -n 'P6' xr.md                            # → 阶段 14 的「P6 收口」= 巨石渲染层重写
```

**真正的清单**在「交接（第 62 轮）」§五第 2 条（本文第 4707 行附近）—— 而交接节**开头就写着
「本节取代下面那份『交接（第 62 轮）』」**。⇒ 越是照交接节的指引办事的人，越看不到那个清单。
这是「**声称唯一准确 ⟹ 每个数字/引用都必须当场复核**」的**第三个样本**（前两个：`any-hatches`
的「起点 67」、两条恒为假 0 的 UI 轴）。

### 二、复核：清单本身也过期了 —— 「三处」实际只剩两处

把清单展开后逐条在代码里核（**不能只信文档**）：

| #   | 位置                                    | 复核结果                                                                                          |
| --- | --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1   | `inspector/element-page.ts:216`         | ✅ **仍在**：`(this._openRetry ?? NaN) < 10`，`NaN < 10` 恒假 ⇒ 首次 `open()` 根本不重试        |
| 2   | `inspector/file-audio-page.ts:417-421`  | ✅ **仍在**：`time !== -1` 对 `undefined` 为真 ⇒ 把 `undefined` 交给 `audio.currentTime`          |
| 3   | `inspector/file-audio-page.ts:428`      | ❌ **已不是待办**：第 45 轮当场改成 `this: HTMLElement`（纯类型、产物不变），代码里就是这样      |

⇒ 第 3 处**在写下这份清单的同一轮就修掉了**，清单却照旧写「三处」。**待决策项的条数也是要复核的数字。**

### 三、处置与验证

- 交接节 §5⑥ 就地展开成表（含「真修法的行为变化」一列），并写清上面这两处失真的来龙去脉；
  `xr.md` 的对应引用同步改为指向交接节的清单。
- **不擅自修那两处**：两处都是**行为改动**（首次 `open` 开始重试 / 没移动过就不跳转），
  按计划必须交实机回归判定 ⇒ 当时仍留在待决策清单里（**下一轮用户选了「都修」，见第 93 轮**）。
- 范围：纯文档（2 文件，+22/−2），无运行期改动。

**验证**：`docs:check` OK（6 份文档）· `text:check` 0 命中 · `migration:check` 15 轴全部持平。

## 第 93 轮（2026-09-21）：关闭待决策 ⑥ —— 修掉第 45 轮那两处行为缺陷，各配一条自证用例

用户在「9 条实机回归全过」的同时选了「两处都修」，于是第 45 轮记下、第 92 轮才找回来的那
两处行为缺陷同时收口。（第 3 处「`this` 标注撒谎」早在第 45 轮当场就改成 `HTMLElement` 了。）

### 一、`element-page.ts`：首次 `open()` 的重试路径实际是死的

```ts
// 前：`undefined < 10` ≡ `NaN < 10` 恒假 ⇒ 首次 open 直接跳过重试，可下一行偏偏写 `?? 0`
if ((this._openRetry ?? NaN) < 10) { this._openRetry = (this._openRetry ?? 0) + 1; setTimeout(…); }
// 后：与下一行的意图一致，首次 open 也进入重试（上限 10 次）
if ((this._openRetry ?? 0) < 10)   { … }
```

### 二、`file-audio-page.ts`：还没移动过就点进度条，会把 `undefined` 交给 `currentTime`

```ts
// 前：`undefined !== -1` 为真 ⇒ `audio.currentTime = undefined`（按 NaN 处理，播放头被拉到开头）
if (time !== -1) { audio.currentTime = time as number; }
// 后：`-1` 是 pointerleave 的哨兵，两者都视为「没有有效位置」；收窄后断言自然消失
if (time !== undefined && time !== -1) { audio.currentTime = time; }
```

### 三、两条用例都自证（这一轮的重点，不是「跑绿了」）

**用例必须能证否旧代码**，否则只是摆设。两条都实测过「把判断改回旧写法 ⇒ 用例失败」：

| 用例                                        | 还原成旧写法后的失败信息                                     | 解读                                                     |
| ------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| `element-page-open-before-mount.spec.ts` 第 3 例 | `AssertionError: expected undefined to be 1`                 | `_openRetry` 始终是 `undefined` ⇒ 一次重试都没排         |
| `file-audio-page-progress-down.spec.ts` 第 1 例  | `AssertionError: expected undefined to be 7`                 | `currentTime` 被写成 `undefined`                          |
| 同文件第 2 例（`-1` 哨兵）/ 第 3 例（有效位置）  | **仍通过**                                                   | 证明用例只钉住**新**行为，没有把既有语义一起改掉         |

> 第 2 例原来还覆盖不到「控件尚未登记」那条路径：它在 `open()` 之前就把控件登记好了，
> 于是 `initialize()` 一次成功、根本进不了重试分支 —— **这就是缺陷能活下来的原因**。
> 新用例故意**不**登记 `uiElement-name`，才真正走到那条分支。

### 四、验证

- 两条专项用例 **6/6 通过**；`editor` 全量套件 **251 文件 / 2061 用例全绿、exit 0**
  （改前 250/2057 —— 差额恰是这 4 条新用例，无别的变化）。
- `tsc` strict 0 · `lint` 0/0（1624 文件）· `format:check` 0 · `migration:check` 15 轴持平
  （去掉的 `time as number` 是**单次**断言，不进 `unknown-casts` 口径，故持平是正确读数）。
- 文档同步：PHASE-1C 交接节 §5 的待决策由 **4 项降为 3 项**，⑥ 就地标为已关闭。

## 第 94 轮（2026-09-21）：阶段 1c 第 ① 步落地 —— 但计划里那个写法不能执行，换了形态

用户确认 9 条实机回归全过（1c 闸门放行），并选定 ① 的形态。

### 一、先纠一处**计划本身的自相矛盾**（这才是本轮最值钱的产出）

附录三把 ① 写成「`stores/ui.ts` 的 `loadUI` 从 `window-cluster → m.UI` 改为**直连
`ui-engine.ts`**」，而 ④ 又写「`stores/ui.ts` 改直连 `UIEngine`」—— 同一个目标写了两遍。
去核对代码，发现 ① 那个写法**根本不能执行**：

```txt
ui-engine.ts:2   import { getUIStore, loadUI } from '@app/stores/ui';   ← 它自己就 import loadUI
ui-engine.ts:21  const UI = getLazyWindow('ui', loadUI);
```

把 `loadUI` 指向 `ui-engine.ts` ⇒ ① 循环（动态 import 不报错，但语义成环）；
② `loadUI` resolve 出来的是**模块命名空间对象**，不是 `UI` 实例 ⇒ `UI.drawBackground` 等
恒为 `undefined`，而 store 的转发是 `UI?.x?.()` —— **静默返回、不报错**，正是附录四/六/七/八/九
反复记的那一类「静默失效」，只不过这次会直接打碎渲染。

**判别**：① 只换「**从哪取** UI」，④ 才换「取到的**还是不是遗留对象**」。两者不是同一步。

### 二、① 的正确形态（已落地）

```ts
// stores/ui.ts —— 之前：经桶文件再导出
export const loadUI = () => import('@app/tools/window-cluster').then(async (m) => {
	await m.clusterReady; return m.UI;
});
// 现在：直连遗留窗口模块，**但保留 clusterReady**
export const loadUI = async () => {
	const [uiWindow, cluster] = await Promise.all([
		import('@app/engine/ui/legacy/ui-window.ts'),
		import('@app/tools/window-cluster')
	]);
	await cluster.clusterReady;
	return uiWindow.UI;
};
```

同时改掉另外两个取 `UI` 的点（`file/file-system-core.ts`、`components/layout/LayoutPanel.vue`），
并删掉 `window-cluster.ts` 的 `export { UI } from '@app/engine/ui/legacy/ui-window.ts'`。

**为什么必须保留 `await clusterReady`**：它等的是 Scene / UI / Animation / Particle / Palette
**五个**窗口全部就绪，而 UI 的动作会用到 `Scene.list` 一类。换成只等 `uiWindowReady`
会**缩短就绪契约** —— 那是一条会静默改时序的改动，不属于 ①。

### 三、⚠️ 我自己的一个错误预判（记下来，因为它差点让我放弃一个正确的改动）

动手前我读台账，看到 `legacy-ui-refs` 的棘轮**逐个子字段**都比（`total` / `runtime` / `files`），
基线 `2 / 2 / 1`。我推断：① 会让三处「隐式依赖」变成「显式 `import`」，读数会涨到 `4 / 4 / 4`
⇒ 撞棘轮 ⇒ 于是我先去问用户「是不是该改成先做 ③」。

**实测推翻了这个预判**：① 之后读数是 **`1 / 1 / 1`**，`migration:check` 报
「✓ 2 项指标下降（`legacy-ui-refs.total: 2 → 1`、`runtime: 2 → 1`）」。原因是这条轴
`importRefs(src, /^@app\/engine\/ui\/legacy\//)` **只认静态 `import … from` / `export … from`**，
而我把三处都换成了**内联 `import()`** —— 动态 import **不在它的口径里**。

⇒ **教训**：`legacy-ui-refs` 此后会**少报**三处真实耦合点。已经写进 PHASE-1C §1 的表里：
**「读到 1」不等于「只剩一个耦合点」**，④ 收尾必须按这三处手工核对，别信读数。
（这是本仓第 N 次「仪器口径决定你看见什么」；前几次：假 0 的目录轴、`any-hatches` 的跨行漏洞误判。）

### 四、验证

- `legacy-ui-refs` **2 → 1**（`total` / `runtime` 均下降），其余 14 轴持平；
  按台账提示跑 `--update-baseline` 把进步固化。
- `tsc` strict 0（三处 loader 的返回类型与改前一致，都是同一个 `UI` 对象的类型）。
- 文档同步：PHASE-1C 里 ① 的**所有**出现处（§1 表、第 89 轮小节、第 62 轮小结、文末计划）
  都就地纠偏或加补注，避免下一个人再照着「直连 `ui-engine.ts`」动手。

## 第 95 轮（2026-09-21）：把 ③ 的**机制**问清楚（先量再动），并收一收「死 id」那个结论

这一轮不写运行时代码：③ 是运行时高危区，先把「台账要的到底是什么」量准，比先动手划算。

### 一、③ 的机制：`1c-store-slot-gaps` 到底在数什么

`scripts/lib/ui-slots.mjs` 的 `legacyOnlyStoreSlots()` 对**每个 store 引用到的槽位**做两个豁免，
两个都不成立才计入那 41：

```js
if (/^UIEngine\.<slot>\s*=/m.test(engineSrc)) continue;   // ① 实现在 ui-engine.ts
if (outsideLegacy.has(slot)) continue;                    // ② 遗留目录之外有赋值点
```

而 `outsideLegacy` 是用 `SLOT_ASSIGN_RES` 扫**遗留目录之外**的文件得到的，那四条正则**只认**：

```js
/\bUI\.([A-Za-z_$][\w$]*)\s*=/g          /\buiElClasses\.([A-Za-z_$][\w$]*)\s*=/g
/\bUI\.([A-Za-z_$][\w$]*)\.[A-Za-z_$][\w$]*\s*=/g   /\(\s*UI\.([A-Za-z_$][\w$]*)\s*\)\.…/g
```

⇒ **关键结论（决定了 ③ 能怎么写）**：

1. **把域模块从 `legacy/` 挪到 `engine/ui/` 会让这条轴掉**（它只看**目录**），
   但那是**指标游戏**：文件照样 `UI.registerPreset = …` 地改单例，一行遗留语义都没少。
   第 90 轮的教训（「挪了目录、仪器跟着瞎」）说的就是这一类，**不做**。
2. **让 store「拥有实现」也还不够**：store 现在的写法是**转发**
   （`function hasPrefab(n){ return UI?.hasPrefab?.(n); }`），转发**不产生** `UI.<slot> =` 文本
   ⇒ 计不进去。要让这条轴掉，遗留目录之外必须**真的出现 `UI.<slot> =` 赋值**。
3. 结合 ④ 的终态（`ui-window.ts` 的对象字面量退役），③ 与 ④ **必须是同一条路径上的两段**：
   store 成为这些槽位的**赋值方**，遗留模块里对应的 `UI.x =` 随之删除。
   这也解释了为什么原文写「③④ 需要运行时证据」——它们不能各自独立成立。

**因此 ③ 不能靠「一次纯移动」或「大批转发」收口**，只能逐域做「实现搬进 store + 删掉遗留赋值 +
把 `UI.x =` 的赋值方换成 store」这一个动作，每域一次、每次都能被上述两条轴量到。

#### ⚠️ 而且「把赋值放进 `loadUI`」这条路**在真机上是死的**（本轮量出来的关键约束）

我原本打算这么写：在 `loadUI` 里 `await cluster.clusterReady` 之后同步
`bindStoreOwnedSlots(uiWindow.UI)`，于是「store 的代理一解析，槽位就已经绑好」。
**查了一下，这条在真机上根本不会执行**：

```ts
// main/initialize.ts:89-91
clusterRef = await import('@app/tools/window-cluster');
await clusterRef.clusterReady;
primeWindows(clusterRef as Record<string, unknown>);   // ← 这里

// tools/window-registry.ts:82  按**小写键**直接塞进缓存，绕过 loader
export function primeWindows(instances) { const name = key.toLowerCase(); windows.set(name, value); … }
```

`clusterRef` 里有 `UI` ⇒ `windows.set('ui', <那个对象>)` ⇒ **`loadUI` 与另外两处 loader
全都被跳过**（`getLazyWindow` 的 `get` trap 只在缓存里没有实例时才调 loader）。
所以绑定点必须选在**「UI 对象出现的所有路径」都必经**的位置，而不是 `loadUI`。
可选的三个位置与各自的代价：

| 候选位置                      | 真机会跑到吗 | 代价                                                                        |
| ----------------------------- | ------------ | --------------------------------------------------------------------------- |
| `loadUI` 内（我最初的方案）   | **不会**     | 被 `primeWindows` 短路 ⇒ store 的槽位永不赋值 ⇒ `UI.hasPrefab` 恒 `null` ⇒ 静默失效 |
| `legacy/register.ts` 末尾     | 会           | 赋值文本落在**遗留目录内** ⇒ `1c-store-slot-gaps` **不会下降**（口径只看目录） |
| 新建 `engine/ui/ui-slots.ts`（目录外）并被 `ui-window.ts` 引入 | 会 | 需要一个不产生静态环的接法（它要拿 store 的实现，而 store 又要惰加载 UI 窗口）——**这就是 ③ 真正的设计题** |

⇒ ③ 的**第一步不是写代码，而是定下这个绑定点**。定错就是「静默失效」那一类
（附录四/六/七/八/九记的全是这个形状），而且**测试套件抓不到**：vitest 里走的正是
`loadUI` 路径、不是 `primeWindows` 路径 —— 也就是说**套件会绿着骗你**。

> 这条也是本轮最该记住的方法论：**同一个对象有两条到达路径（惰加载 / 预热缓存）时，
> 「在 loader 里做副作用」是错的。** 先问「它还会从哪来」。

### 二、顺带收一收「`#uiContainer-vue-mount` 是死 id」这个结论（**不改代码**）

第 90 轮判它「是后来被误加的」，本轮复核发现**证据不支持「误加」**：

| 证据                                                     | 含义                                                                       |
| -------------------------------------------------------- | -------------------------------------------------------------------------- |
| 没有 `components/inspector/UIContainerPage.vue`          | ⇒ 今天确实没有任何 Teleport 落进这个 id（第 90 轮这点是对的）              |
| `AppShell.vue:263` `#${value}-vue-mount`，`value` 由**文件名反推** | ⇒ 一旦补上那个 SFC，它要的目标 id **恰好**就是 `#uiContainer-vue-mount`    |
| `inspector.ts:53` 用**后缀**选择器 `[id$="-vue-mount"]`  | ⇒ 全仓对这类 id 的读取本来就是**按约定**、不是按名字                        |
| 它是同组 `page-frame` 里**唯一**没有 `:ref` 的那个       | ⇒ 差异的原因是「没有 SFC 去登记」，不是「多写了一个 id」                    |

⇒ 它是**该页槽位的约定锚点**，删掉属于「今天安全、明天留坑」（补 SFC 的人会拿到一个不存在的目标）。
**决定：不删**，并把理由就地写进 PHASE-1C。这类「清理项」的判据不是「现在有没有人读」，
而是「它是不是某条约定的锚点」。

### 三、本轮产出

- 纯文档（PHASE-1C 一处补注 + 本节）；无运行期改动，台账 15 轴不变。
- ③ 的下一步已经可以照着 §一 的机制逐域做，不需要再猜。
