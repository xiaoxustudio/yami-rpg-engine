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

## 第 96 轮（2026-09-21）：1c ③ 首批切片 —— 绑定点选定 `engine/ui/ui-slots.ts`，prefab 域清空

按第 95 轮量出的机制落地：不再猜，先定绑定点，再搬**无 `this` 依赖**的两个槽位。

### 一、绑定点：为什么是「目录外的新模块 + 动态 import 挂 `uiWindowReady`」

| 要求                                                | 满足方式                                                                     |
| --------------------------------------------------- | ---------------------------------------------------------------------------- |
| **能降低 `1c-store-slot-gaps`**                     | `UI.hasPrefab = …` 的文本出现在 `engine/ui/ui-slots.ts`（`legacy/` 之外）     |
| **真机与测试两条路径都会跑到**                      | 挂在 `uiWindowReady` 上 —— `loadUI` 与 `primeWindows` 都要先 `await clusterReady`，而后者含它 |
| **不踩 TDZ**                                        | 用**动态** `import()`：求值发生在 `ui-window.ts` 模块体之后 ⇒ `UI` 已建好     |
| **不引入静态环**                                    | 查过：全仓**只有** `tools/window-cluster.ts` 一条生产级静态边指向 `ui-window.ts`，且其余地方都是用动态 `import('window-cluster')` |

改动只有三处：新增 `engine/ui/ui-slots.ts`、`ui-window.ts` 的 `uiWindowReady` 多一条动态 import、
`legacy/ui-prefab.ts` 删掉那两个赋值（保留一行注释说明它们去哪了）。**store 一行没动** ——
它原来的转发 `UI?.hasPrefab?.(node)` 现在自然解析到新实现。

### 二、用例必须能证否坏改动（否则只是摆设）

新增 `engine/ui/__tests__/ui-slots.spec.ts`，**故意不 import `ui-slots.ts`** ——
若直接 import，用例会把待验证的链路自己短路掉，变成「证明了它被 import 过」。
三条断言：绑定确实发生（`typeof === 'function'`，而不是字面量的 `null`）、
`hasPrefab` 语义不变、`clearInvalidPrefabs` **就地**改（调用方 `ui-events.ts` 依赖传引用）。

**实测证否**：把 `uiWindowReady` 里那行动态 import 删掉 ⇒ 3 条全红，
`AssertionError: UI.hasPrefab 应已被 ui-slots.ts 绑定: expected 'object' to be 'function'`
（`null` 的 `typeof` 正是 `'object'`）。复原后 3/3 绿。

### 三、落地数字

首批（2 个纯函数槽位）先跑通机制，随后把 `ui-prefab.ts` 里**其余 4 个 store 槽位**
（`registerPreset` / `unregisterPreset` / `setAsPrefab` / `unsetAsPrefab`）一并搬走 ——
它们同样不依赖 `this`（用的是模块级的 `UI.meta` / `UI.list` / `Data` / `Editor`，本模块本来就 import 了 `UI`）。
于是**整个 prefab 域对 store 的贡献清零**。

| 轴                  | 改前   | 首批后 | 第二批后 | 说明                                                         |
| ------------------- | ------ | ------ | -------- | ------------------------------------------------------------ |
| `1c-store-slot-gaps`| 41     | 39     | **35**   | 6 个槽位的实现离开遗留目录（prefab 域已清空）                |
| `legacy-ui-lines`   | 2859   | 2854   | **2807** | `ui-prefab.ts` 从 161 行降到 114 行（两个实现体 + IIFE 搬走） |
| `ui-slot-coverage`  | 0      | **0**  | **0**    | ⚠️**关键安全性质**：没有任何槽位因此变成「全仓都没人赋值」    |
| `legacy-ui-refs`    | 1      | 1      | 1        | 不变                                                         |

`ui-slot-coverage` 三次都为 0 是这一步最该盯的数字 —— 它若上升，说明搬动把某个槽位搬丢了
（那正是第 95 轮警告的「静默读到 undefined」）。基线已固化为最终的 **35 / 2807**。

> `ui-prefab.ts` 现在还留着 `createPrefabItem` / `createElement` / `loadElement` 三个槽位 ——
> 它们**不在** `1c-store-slot-gaps` 的口径里（store 没有引用它们），所以搬它们不降轴；
> 要不要顺手搬到 `ui-slots.ts` 以便整文件删除，属于「删掉一个遗留文件」的独立收益，
> 留到后面按 `ui-singleton-members` 收口时一起做。

### 四、验证

- 专项用例 **5/5**（3 条自证 + 2 条语义钉子：递归登记/注销、列表刷新）；
  证否实验见上（删掉动态 import ⇒ 3 条全红）。
- `editor` 全量套件 **252 文件 / 2066 用例全绿、exit 0**
  （本轮开工前 251/2061 —— 差额恰是本轮新增的 1 文件 5 用例）。
- `tsc` strict 0 · `typecheck:vue` 0 新增 · `lint` 0/0（1626 文件）· `format:check` 0 ·
  `migration:check` 全部轴持平（35 / 2807 已入基线）。

> ⚠️ **仍然要记住第 95 轮那条限制**：CI 跑的是 `loadUI` 路径。本轮的用例把绑定钉在
> `uiWindowReady` 上（两条路径的**唯一汇合点**），所以比「钉在 loadUI 上」强；
> 但**真机的那条 `primeWindows` 路径依然没有任何测试覆盖**。③ 每搬一个域，
> 都应该真机启动确认一次 —— 套件绿**不等于**真机绿。

## 第 97 轮（2026-09-21）：搬走 `ui-transform.ts`，以及它当场撞出来的**一处仪器缺陷**

### 一、动作：`ui-transform.ts` 整个搬出 `legacy/`（纯移动）

`engine/ui/legacy/ui-transform.ts` → `engine/ui/ui-transform.ts`。只有两处改动：
文件内 `./ui-window.ts` → `./legacy/ui-window.ts`（2 个 import），以及 `register.ts` 里
`./ui-transform.ts` → `../ui-transform.ts`。**390 行内容逐字未动**（`git mv`，不是重打），
所以这一步的运行时风险接近 0。

⇒ `1c-store-slot-gaps` **35 → 21**（store 引用的那 14 个槽位不再「只在遗留层」），
`legacy-ui-lines` **2807 → 2412**、文件数 **9 → 8**。

> **这一步意味着什么、不意味着什么（必须写清楚）**：它让「实现在遗留目录里」这句话
> 按台账的**目录口径**不再成立，但**没有**把实现的所有权交给 store —— 那 14 个槽位
> 依然是 `UI.xxx = function(){…}` 挂在单例上。**能被这条口径骗过去的唯一保障是
> `ui-singleton-members`：它数的是 `UI.x = ` 处数（103 处 / declared 134），与目录无关，
> 本轮纹丝未动。** 1c 要收口，三条轴必须同时归零；`ui-singleton-members` 才是那座真山。

### 二、⚠️ 搬迁当场撞出的仪器缺陷（本轮最有价值的产出）

搬完先量，`ui-slot-coverage` 报 **`assigned: 153 → 144`** —— 少了 9。原因在
`scripts/lib/ui-slots.mjs` 的 `assignedSlots()`：

```js
if (uiDir.test(rel)) { /* 才算这份源码里的 this.x = … */ }   // uiDir = legacy/ 目录
```

`this.x = …` **只有落在单例所在目录里的文件才算槽位赋值**。搬走 `ui-transform.ts`
就把它那 9 处 `this.x =`（`this.centerX` / `this.hover` …）一起从计数里挪掉了。

**为什么这不只是「读数难看」**：当某个 **store 引用到的**槽位只靠 `this.x =` 赋值时，
`assigned` 一少，`storeRefsUnassigned` 就凭空变非空 ⇒ `ui-slot-coverage` **报上升** ⇒
棘轮把一次**正确的搬运**判成回归。`ui-slots.mjs` 的注释其实预言过这个形状，但它假定
搬运是「整个家族一起搬」（②那一次就是这样，所以按目录界定前后一致）；③ 是**逐个模块**搬
（第 96 轮搬 prefab、第 97 轮搬 transform），那个假设就不再成立了。

**修法**：把「是不是单例域模块」与「在不在遗留目录里」分开 —— 后者仍是目录问题
（`legacyOnlyStoreSlots` 要问「这份实现搬出去了没有」），前者是**文件身份**问题。
判据换成「在 `engine/ui/` 下、且**自己直接写了 `UI.<slot> = …`**」。

**这条路我走了三版，每版都用量出来的数字否掉上一版**（记下来，免得下次走一遍）：

| 判据                                        | 实测 `assigned` | 否掉的理由                                                        |
| ------------------------------------------- | --------------- | ----------------------------------------------------------------- |
| 只按 `legacy/` 目录（原实现）                | 144             | 域模块一搬走就少算 `this.x =` ⇒ 会造出假回归                       |
| 「本文件出现过任意 `UI.…= `」                | **303**         | 元素类文件用 `UI.a.b = …` 写单例**子对象**，被误判成域模块，把它们的 `this.x`（自己的坐标）也数进来 |
| 「`engine/ui/ui-*.ts` 文件名约定」           | **159**         | `ui-engine.ts` 也符合该命名，被扫进来                              |
| 「`engine/ui/` 下且**自己写了 `UI.<slot> = `**」 | **153** ✓   | 与搬走前的 153 逐字相等 ⇒ 搬迁不再干扰这条轴                        |

**验收方式就是那个 153**：不是「看着合理」，而是**必须回到搬走前的数**。

### 三、验证

- `1c-store-slot-gaps` 35 → **21**；`legacy-ui-lines` 2807 → **2412**（files 9 → 8）；
  `ui-slot-coverage` **持平**（`assigned` 153 未变，`storeRefsUnassigned` 仍 0）；
  其余 12 轴持平；基线已固化。
- `migration:selftest` **52/52**；`tsc` strict 0；`typecheck:vue` 0 新增；
  `lint` 0/0（1626 文件）；`format:check` 0；`docs:check` OK；`text:check` 0。
- `editor` 全量套件 **252 文件 / 2066 用例全绿、exit 0**（本次搬迁未增删用例）。

### 四、下一步

`legacy/` 现在还剩 8 个文件、2412 行，而 `1c-store-slot-gaps` 只剩 21 个槽位，
集中在 **document lifecycle**（`open/save/close/load/destroy/undo/redo/copy/paste…`，主要在
`ui-file.ts`）。那一批是附录四/六/七/八/九记的「启动即崩 / 静默冻结」高发区，
**纯移动同样适用**（同域内 `this` 语义不变），但必须真机走一遍 —— 台账绿不覆盖
`primeWindows` 路径。

## 第 98 轮（2026-09-21）：其余 6 个域模块一起搬走 —— **③ 收口（21 → 0）**

### 一、动作：仍是纯移动

`ui-file` / `ui-events` / `ui-initialize` / `ui-list` / `ui-pointer` / `ui-prefab`
一起 `git mv` 到 `engine/ui/`。每个文件只有 2 处 import 要改（`./ui-window.ts` →
`./legacy/ui-window.ts`，值 + 类型），加上 `register.ts` 的清单改成 `../ui-*.ts`。
**6 个文件的内容逐字未动**，所以运行时风险仍接近 0。

`legacy/` 里只剩两个文件：`ui-window.ts`（对象字面量 + 21 行 `UI.x = UIEngine.x` 镜像）
与 `register.ts`（接线清单，职责是「按固定顺序加载域模块」，与模块是不是遗留代码无关）。

| 轴                    | 第 96 轮后 | 第 97 轮后 | 第 98 轮后 |
| --------------------- | ---------- | ---------- | ---------- |
| `1c-store-slot-gaps`  | 35         | 21         | **0 ✅**   |
| `legacy-ui-lines`     | 2807 / 9   | 2412 / 8   | **316 / 2** |
| `ui-slot-coverage`    | 0          | 0          | **0**      |
| `ui-singleton-members`| 103        | 103        | **103**    |

**最后一行才是重点**：`ui-singleton-members` 数的是 `UI.x = ` 处数，**与目录无关**，
纯移动骗不过它 —— 它一字未动，说明这一路搬的都是**位置**、不是**所有权**。
1c 要收口，③ 与它必须**同时**归零；现在归零的只是前面那条。

### 二、③ 归零把台账自证用例的**前提**打掉了（必须当场改，不能删）

`migration:selftest` 立刻红了一条：

```txt
✗ 遗留层还在 ⟹ 两条 legacy-ui-* 轴与 1c-store-slot-gaps 都必须非 0
    只要遗留层还在，就必然有「实现只在遗留层」的 store 槽位
```

这条用例的**原始意图是对的**（守 2026-09-21 那次「假绿三连」：仪器瞎了却报「✓ 已完成」），
但它的前提是「遗留层还在 ⟹ ③ 没做完」。**这个前提现在不成立了**：`legacy/` 还有
`ui-window.ts`（那是 ④ 的活），而 ③ 的轴合法地为 0。

改法是**加强**而不是删掉 —— 把它拆成三条，其中两条能当场咬人：

1. 「**主体还在**」改由**与目录无关**的口径守：直接在遗留目录里数 `UI.<name> =`
   （`ui-singleton-members` 的口径）。为 0 才说明连这条轴也瞎了。
2. 「**轴为 0**」必须能被**独立重算**解释：在遗留目录里**正推**（翻 `UI.<slot> =`，
   排除 `UIEngine.x = …` 镜像），与轴的**反推**（从「遗留目录之外有没有赋值」倒推）
   必须给出同一个答案。两条路不一致 ⇒ 先怀疑仪器。
3. 「**目录判据本身**」必须仍能把「已搬走的模块」与「遗留目录」分开 ——
   `uiDirRe()` 要匹配 `ui-window.ts`、且**不**匹配 `engine/ui/ui-file.ts`。

> ⚠️ **诚实记一笔**：第 2 条在当前状态下是**平凡成立**的（两边都是 0），所以它现在拦不住
> 什么 —— 真正能当场咬人的是第 3 条。留第 2 条是因为等哪天真有非镜像的 store 槽位实现
> 落回遗留目录时，它会立刻变成有效守卫（那时轴必须非 0）。

**自证**（本轮实测）：把 `uiDirRe()` 从 `dirname(rel)` 放宽成 `dirname(dirname(rel))`
（即让「遗留目录」变成整个 `engine/ui/`），第 3 条当场红 ⇒ 判据确实有效。复原后 52/52。

### 三、验证

- `1c-store-slot-gaps` **21 → 0**、`legacy-ui-lines` 2412 → **316**（files 8 → 2），
  其余 12 轴持平（含 `ui-slot-coverage` 的 `assigned` 仍是 **153** —— 第 97 轮新判据
  连续跨过 7 个模块的搬迁而读数不变，这正是它该有的样子）；基线已固化。
- `migration:selftest` **52/52** · `tsc` strict 0 · `typecheck:vue` 0 新增 ·
  `lint` 0/0（1626 文件）· `format:check` 0 · `docs:check` OK · `text:check` 0。
- `editor` 全量套件 **252 文件 / 2066 用例全绿、exit 0**。

### 四、下一步：④（对象字面量退役）—— 这才是 1c 的真山

`ui-singleton-members` = **103 处挂载 / declared 134**，分布在 `ui-window.ts`（21 镜像）
与刚搬出去的 7 个域模块里。第 ④ 步要把这些实现搬到它们的**真家**（store 或 engine 平面），
让 `ui-window.ts` 的对象字面量退役。

**它和 ③ 有一个本质区别**：③ 是改**路径**（内容零改动，套件能兜住），
④ 是改**所有权与调用形态**（`this` 绑定、赋值方、就绪时序），
而且落点在 `primeWindows` 那条**没有任何测试覆盖**的路径上。
附录四/六/七/八/九记的崩溃与静默失效，全是这一类改动造成的 ——
所以 ④ 必须先有一次真机启动 + 走查，再谈收口。

## 第 99 轮（2026-09-21）：写 ④ 的设计（零运行期改动），先把底数量准

这一轮不碰运行时代码 —— ④ 的爆炸半径就是**启动本身**，先给下一个人一份可复核的设计。
全文是 PHASE-1C 末尾的「附录十三：阶段 1c 第 ④ 步设计（对象字面量退役）」，
交接节 §4 第 5 条也加了指针。这里只记底数与结论。

### 一、底数（本轮实测，脚本可复跑）

- `ui-singleton-members` **103 处 / 9 文件**：`legacy/ui-window.ts` 21（**全是镜像**）·
  `ui-events` 21 · `ui-transform` 18 · `ui-file` 15 · `ui-list` 10 · `ui-pointer` 8 ·
  `ui-slots` 6 · `ui-prefab` 3 · `ui-initialize` 1。另 `declared = 134`（字面量自身槽位）。
- `ui-engine.ts` 读过 **30 个不同的 `this.<x>`** —— 这是引擎对单例的**成员契约**。
  逐个核对「有没有新家」：**8 个**已有 store 键（`controlPointTexture` / `history` / `hover` /
  `matrix` / `scrollLeft` / `scrollTop` / `scrollRight` / `scrollBottom`），**19 个没有**：

  ```txt
  body, centerOffsetX, centerOffsetY, centerX, centerY, controlPointActive, controlPointRotation,
  controlPoints, marquee, outerHeight, outerWidth, paddingLeft, paddingTop, planToSave,
  scale, scaleX, scaleY, screen, zoomTimer
  ```

  > **本节原先写「21」，本轮改成 19（口径收紧，不是成员变少）**：原 21 里含
  > `renderingFunction` / `requestRendering` / `updateControlPoints`，而这三个由**引擎自己定义**
  > （`ui-engine.ts` 里有 `UIEngine.<name> = …`，正是那 21 行镜像的来源）—— 它们的家就是引擎。
  > 判据与 `legacyOnlyStoreSlots` 豁免 `engineBacked` 槽位同源。

  ⇒ **这 19 个就是 ④ 的第一张工作单**。该口径已固化成**台账轴 `ui-facade-gaps`**
  （首轮实测 19，带自证用例），所以 ④ 的进度从此和 ③ 一样有棘轮守着。

### 二、结论：两条路线里推荐 A

- **A（推荐）**：保留一个「UI 形状的 facade」普通对象，引擎函数继续以它为 `this` ——
  `this` 绑定语义**逐字保持**，可分批。⚠️ facade 必须在 UI 对象**诞生的同一位置**装配，
  否则重蹈第 95 轮（真机经 `primeWindows` 绕过 loader）。
- **B**：把引擎函数改成显式接收 state 参数 —— 彻底，但改的是**行为语义**（附录一记过：
  这些 `this` 绑定是承重的）。

分步计划 ④-1…④-4、每步的台账信号（如 ④-2 应让 `ui-singleton-members` 103 → 82）
与风险表见附录十三。

### 三、顺手更正一处**已被证伪**的文档声明

PHASE-1C 文末原写「`declaredSlots()` 与 `assignedSlots()` 改为按内容 / 按目录动态定位，
**搬运前后读数一致**」。后半句只对**第 ② 步**成立（整个家族一起搬）——
第 97 轮实测第 ③ 步那种**逐模块**搬运会让 `assigned` 从 153 掉到 144。已就地更正。

### 四、验证

`docs:check` OK（6 份文档）· `text:check` 0 命中 · `migration:check` 15 轴持平。
**本轮零运行期改动**：只改了 `packages/editor/PHASE-1C-TEST-PREREQ.md` 与本节。

> ⚠️ ④ 开工前的唯一有效验收仍是**真机启动 + 走查**：`primeWindows` 路径没有任何测试覆盖，
> 套件只覆盖 `loadUI` 那条路（第 95 轮）。

## 第 100 轮（2026-09-21）：④-1 落地 —— 把引擎的成员契约抽成单一真源（轴 19 → 0）

上一轮把 ④ 量成了轴 `ui-facade-gaps`（19）。这一轮做 ④-1：给那 19 个成员**显式归属**。
结果比预想的省事，因为**契约其实早就写好了，只是写在一个局部 interface 里**。

### 一、发现：`ui-engine.ts` 里已经有一份完整的契约

它早就声明了一个局部 `interface UIShape`（31 个成员，类型是照真实写入方写的：`screen:
YamiElement`、`history: History`、`background: StageColor`、`matrix: Matrix`…），
只是：
1. **局部**（没有名字、没有第二个消费者）；
2. 末尾挂着 `[k: string]: any`，于是漏声明与拼错**都通过编译**。

所以 ④-1 = 把它抽成共享的单一真源，并**逐个核对读点**补全。

### 二、核出一个真问题：原 interface **漏声明了两个成员**

对照引擎的 30 个读点逐个核，发现这两个**从来没被声明过**，一直靠索引签名蒙过去：

| 漏掉的成员 | 引擎怎么用的 | 实现在哪 |
| --- | --- | --- |
| `marquee` | `UI.marquee.resize()`（引擎与 `ui-transform`） | `legacy/ui-window.ts` 字面量 |
| `planToSave` | 四处 `this.planToSave!()` | `ui-events.ts:20` |

**这就是 ④ 要消灭的那类静默**：漏声明不会报错，只会让成员在某条路径上变 `undefined`。
两个都已显式进契约（`marquee: YamiElement`、`planToSave: (() => void) | null`）。

### 三、改动形态：**纯类型**，可自证

新增 `engine/ui/ui-facade.ts`（`UIFacadeShape` + `ControlPoint` + `UIControlPoints`）；
`ui-engine.ts` 删掉那三个局部声明、改为
`interface UIShape extends UIFacadeShape { [k: string]: any }`。

**diff 里只有 `import type` 与 interface 声明，没有一条运行期语句**（已核对）。
顺带掉出 4 个因契约搬走而变成未使用的 import（`History` / `Matrix` / `StageColor` /
`UIControlPoints`）—— `tsc` 的 `noUnusedLocals` 当场点名，已删。

### 四、验证

| 项 | 结果 |
| --- | --- |
| `ui-facade-gaps` | **19 → 0 ✅**（基线已固化） |
| `ui-slot-coverage` | **持平**（`assigned` 153、`storeRefsUnassigned` 0 —— 没有槽位搬丢） |
| `ui-singleton-members` | 103 / declared 134（持平，④ 的主体还没动） |
| `tsc` strict | 0 |
| `typecheck:vue` / `lint` / `format:check` / `docs:check` / `text:check` | 0 新增 / 0-0 / 0 / OK / 0 |
| `migration:selftest` | 53/53 |

> **诚实标注**：本轮的 `ui-facade-gaps` 归零**不等于 facade 已经在干活** —— 索引签名还在，
> 漏声明仍只表现为运行期 `undefined`。**真正的收紧是 ④-1b：删掉那个索引签名**，
> 让 `tsc` 把漏声明的成员逐个点出来（那时才可能发现更多像 `marquee` / `planToSave` 这样的洞）。
> 这也是为什么 ④-1b 被单独列成一步：它才是契约开始有强制力的时刻。

## 第 101 轮（2026-09-21）：④-1b —— 退役索引签名，让 `tsc` 点名（5 个洞 + 1 处真缺陷）

把 `ui-engine.ts` 的 `interface UIShape extends UIFacadeShape { [k: string]: any }` 换成
`type UIShape = UIFacadeShape` —— **逃生口退役**。

### 一、`tsc` 当场点名 5 个从没在契约里的成员

| 成员 | 类别 | 引擎怎么用的 |
| --- | --- | --- |
| `requestRendering` | 引擎自有 | 四处 `this.requestRendering!()` |
| `updateControlPoints` | 引擎自有 | `this.updateControlPoints!()` |
| `renderingFunction` | 引擎自有 | `Timer.appendUpdater!('stageRendering', this.renderingFunction)` |
| `hover` | store 已持有 | `drawHoverWireframe` 比较它、读 `instance` |
| `controlPointTexture` | store 已持有 | `drawControlPoints` 读它给 `gl.bindTexture` |

全部补进 `UIFacadeShape`。**这里有一条容易混淆的区分**：台账轴 `ui-facade-gaps` 把后两个
（store 键）与那三个（引擎自有）都算作「有家」，但引擎是用 `this.x` 读它们的 ⇒ 它们仍然必须
在**类型上**显式在案。**「有家」与「在契约里」是两件事** —— 这正是 ④-1b 才暴露的一层。

### 二、顺带暴露一个**真实缺陷**

`texture.base.glTexture` 里 `ImageTexture.base` 在类型上**可空**，一直靠索引签名蒙过去。
现用 `!` 把既有不变式写出（`ui-initialize.ts:88` 同样直接解引用 `.base`），运行期行为未变。

> 这正是「去掉 `any`」的价值：**它不是洁癖，是把谎话逼出来**。第 45 轮 / 第 79 轮记的都是同一类。

### 三、类型是「问出来的」，不是猜的——三次迭代都靠 `tsc`

| 我的初始猜测 | `tsc` 的纠正 | 真相 |
| --- | --- | --- |
| `instance?: unknown` | `'instance' is of type 'unknown'` | 引擎读 `instance.visible` 并调 `instance.drawWireframe(color)` ⇒ 需要真形状 |
| `renderingFunction: (timer: Timer) => void` | 不能赋给 `(deltaTime: number) => void` | 它的定义是 `function () {}`（**零参**）⇒ `() => void` 即可（TS 允许少参） |
| `instance?: HoverInstance`（可选） | `'instance' is possibly 'undefined'` | 原代码本就没有守卫 ⇒ 声明**必填**才如实反映不变式 |
| `HoverNode` 只有 `instance` + 索引签名 | TS2367：与 `UINodeShape \| null` **无重叠** | 它本来就是 UI 树节点 ⇒ 补 `class` / `children` |

最后一版把索引签名写成 `[k: string]: unknown`（**不用 `any`**），所以没有制造新足迹 ——
反过来，退役掉的那个 `[k: string]: any` 让 **`any-hatches` 52 → 51**。

### 四、验证

| 项 | 结果 |
| --- | --- |
| `tsc` strict | **0** |
| `typecheck:vue` / `lint` / `format:check` / `docs:check` / `text:check` | 0 新增 / 0-0（1627 文件）/ 0 / OK / 0 |
| `migration:selftest` | 53/53 |
| `any-hatches` | **52 → 51**（基线已固化） |
| `ui-facade-gaps` / `ui-slot-coverage` / `ui-singleton-members` | 0 / 持平 / 103 持平 |

> **本轮没有重跑全套**，并说明依据：diff 里只有**注释、一个 `type` 别名、一个 `!`**，
> **没有一条运行期语句**（已逐行核对 `git diff -U0`），产物 JS 与改前逐字相同 ——
> 与 ③ 的搬运（改的是 import 路径，属运行期）不同，这一轮套件在原理上覆盖不到任何新东西。

## 第 102 轮（2026-09-21）：④-2a —— 拆掉 store 对镜像的依赖（不需要真机的那一半）

④-2 要删 `ui-window.ts` 的 21 行 `UI.x = UIEngine.x` 镜像（`ui-singleton-members` 103 → 82）。
但删之前必须先解决一件事：**store 的 7 个引擎转发正靠那些镜像活着**。

### 一、先撞上静态环

最自然的写法是 `stores/ui.ts` 直接 `import { UIEngine }` —— **不行**：`ui-engine.ts:2`
已经静态 `import { getUIStore, loadUI } from '@app/stores/ui'`，反向 import 就是一条静态环
（`loadUI` 这个惰加载代理存在的理由，就是当初为了绕开环）。

### 二、反过来：让引擎**注册自己**（依赖方向保持单向）

```ts
// stores/ui.ts —— 模块级
let uiEngineRef: Record<string, unknown> | null = null;
export function registerUIEngine(engine) { uiEngineRef = engine; }

// engine/ui/ui-engine.ts —— **文件末尾**（所有挂载就位之后）
registerUIEngine(UIEngine);
```

store 的 7 个引擎转发改为「**优先**从注册进来的 `UIEngine` 取函数，取不到回退到 `UI` 代理」：

```ts
const fn = fromEngine[key];
if (typeof fn !== 'function') return undefined;
return fn.apply(UI, args);   // ⚠️ 接收者两种情况都必须是 UI
```

**等价性怎么判**（不靠口头保证）：两条路拿到的是**同一个函数对象**（`UI.x` 就是 `UIEngine.x`
的镜像），接收者也是**同一个**（都 `apply(UI, …)`，`this` 是那个惰加载代理）⇒ 行为逐字相同。
唯一的差别是「函数从哪个对象上取」，而那两个对象上的这个属性此刻指向同一个函数。

⚠️ 仍然**不能**把取到的函数用 `engine[key]` 那样直接调用：那样 `this` 会变成 `UIEngine`，而实现
内部读的是 `this.planToSave` / `this.scale` 等 **UI 侧**成员 —— 这正是附录一记的那条坑。

### 三、这一步买到什么

现在删镜像时，store 这条路**已经不需要镜像了**。剩下的活（④-2b）是把镜像与引擎**内部**的
`UI.drawXxx()` 调用点一起换掉 —— 那些在渲染路径上，**必须真机验证**。

### 四、验证

- `tsc` strict 0 · `lint` 0/0（1627 文件）· `format:check` 0 · `docs:check` OK · `text:check` 0 ·
  `migration:check` 15 轴持平（本步**不**改任何读数：镜像还在）。
- 先跑受影响的三条 spec（`ui-state` / `ui-slots` / `window-state`）44/44，再跑
  `editor` 全量套件 **252 文件 / 2066 用例全绿、exit 0**。
- 与上一轮不同，这**是**运行期改动（多了一次注册调用、转发器换了取函数的地方），
  所以套件是必要的，不能像 ④-1b 那样跳过。

## 第 103 轮（2026-09-21）：④-2 的计划更正 —— 那 21 行镜像**不是「删掉就行」**

打算接着做 ④-2（删镜像 ⇒ `ui-singleton-members` 103 → 82）之前先量了一遍消费者。
**结果是：原计划不成立，得改。**

### 一、先确认「镜像 = 唯一真源」（这条成立）

全仓 `UI.<镜像名> =` 的赋值共 **21 行，全部在 `ui-window.ts`，别处 0 行** ⇒
`UI.x` 与 `UIEngine.x` 确实是同一个函数对象，④-2a 的等价性论证站得住。

### 二、但消费者不止「字面量 `UI.x`」

引擎方法会被**以 UI 为接收者**调用，也就是函数体里的 `this.x(…)` —— 这才是大头。
全仓 `this.<镜像名>` 共 **259 处 / 42 文件**，**但大部分是假阳性**：

- 场景 / 动画 / 粒子 / 过渡 / 精灵那几个窗口**各自也有**同名的 `requestRendering` /
  `renderingFunction` / `stopRendering`（逐个核实过：`scene-window.ts`、`animation-window.ts`、
  `particle-window.ts`、`transition-window.ts`、`sprite.ts` 都自声明了 `requestRendering`）；
- `webgl-methods.ts` 里的 `this.drawElements` 其实是 **WebGL 上下文**的方法。

⚠️ 第一版 grep 只查了 `UI.<名字>`（21 处 / 6 文件），差点因此得出「删掉很安全」的结论 ——
**漏了 `this.` 这一整类**。这和本仓「仪器口径决定你看见什么」是同一个形状。

### 三、可静态分离的真·UI 接收者子集

声明了 `this: UIShape` 的文件恰好 **9 个**（全在 `engine/ui/`）：`ui-engine` / `ui-events` /
`ui-file` / `ui-initialize` / `ui-list` / `ui-pointer` / `ui-prefab` / `ui-slots` / `ui-transform`。
只有这些文件里的 `this.x` 才可能是 UI 单例的接收者。

⇒ 实测工作单 **70 处**：字面量 `UI.<镜像名>` **21** 处（`ui-engine` 7 · `ui-initialize` 5 ·
`ui-list` 3 · `ui-transform` 3 · `ui-events` 2 · `LayoutPanel.vue` 1）＋ UI 接收者的
`this.<镜像名>` **49** 处（`ui-engine` 7 · `ui-events` 14 · `ui-pointer` 12 · `ui-transform` 10 ·
`ui-initialize` 4 · `ui-file` 2）。

### 四、计划怎么改

| 原计划 | 改为 |
| --- | --- |
| ④-2 删镜像，103 → 82 | **④-2b** 先换 70 处调用点（`this.x()` → `UIEngine.x.call(this, …)`）→ **④-2c** 才删镜像 |

理由：镜像就是「让 `this.requestRendering()` 这类调用成立」的**机制**。先删它，那 70 处会在
运行期变 `undefined` —— 又一次静默失效，而且是全仓出过最多的那一类。
**`ui-singleton-members` 的 103 里，这 21 行是「最后才该动」的一批，不是 ④-2 的起点。**

### 五、本轮产出

纯文档（PHASE-1C 附录十三的计划表与新增的「④-2 计划更正」一节 + 本节）；
**零运行期改动**，台账 15 轴不变；`docs:check` OK · `text:check` 0。

> 方法论上值得单记一条：**「某段代码是唯一真源」不等于「删掉它安全」** ——
> 还要问「谁在**以它为接收者**调用」。前者用 `grep` 能答，后者要求先把接收者口径量清。

## 第 104 轮（2026-09-21）：结案待决策 ④ —— `TextCommandShape.color` 就是 `string`

第 79 轮发现一个「声明与用法不自洽」的疑点，并把它记成**待用户决策**（因为当时判断
「改声明 = 改行为，必须实机回归」）。这一轮把它**量到底**，结论是：**声明是对的，不是 bug。**

### 一、疑点是什么

`printer.ts` 的 `TextCommandShape.color` 声明成 `string`，而占位命令写 `color: 0`（打包整数形状）；
把声明放宽成 `string | number` 后，`tsc` 会在这 4 处报错：

```txt
context.fillStyle = color;   // ×4（drawText / drawTextWithShadow …）
```

于是当时的推断是「这个声明与文件自身用法不自洽，只是被 `as unknown as string` 盖住了」。

### 二、量到底：值从来不是整数

| 环节 | 事实 |
| --- | --- |
| 唯一写入点 | `drawBuffer()` 的 `command.color = this.colors[0]` |
| `colors[0]` 由谁写 | `CSSRGBA(...)`（另一处在 `text-element.ts:230/340`，同样 `CSSRGBA(value)`） |
| `CSSRGBA` 返回什么 | `ui-kit/src/utils/color.ts:9` 签名 **`(hex: string): string`**；用例断言 `CSSRGBA('10203040') === 'rgba(16, 32, 48, 64)'` |

⇒ 运行期是 **CSS 颜色串**。**声明 `string` 正确，那 4 处 `fillStyle` 正确。**
误导来自**同文件另一条独立的颜色通道**：效果颜色确实用
`r + (g + (b + a * 256) * 256) * 256` 打包整数 —— 但它与 `fillStyle` 毫无关系。
两条通道混在一个文件里，加上一个 `as unknown as` 的占位值，就成了一个看起来很硬的假疑点。

### 三、动手：只改那个真谎言

唯一真的错的是占位命令 `color: 0 as unknown as string` ⇒ 改成 `''`：

- **类型上**：`string` 本来就对，`''` 无需断言 ⇒ 该处 `as unknown as` 消失；
- **运行期等价**：`0` 与 `''` 对 canvas 同为**非法 fillStyle**（静默忽略，不抛），
  且这个对象是**空白模板**、必然在绘制前被填上。

顺带把两处注释（声明处、占位处）从「待决策」改写为**结论 + 证据链**，
免得下一个人再走一遍这 25 轮的弯路。

### 四、没动的那一半（如实记）

同处还有 `drawingMethod: '' as unknown as (...args: unknown[]) => unknown`。它**不是**同一个问题：
函数类型的诚实占位，要么改类型（`| null`，连带所有读点），要么改**失败行为**
（静默 no-op 取代抛错）。这属于另一条更小的独立决策，本轮**不顺手改**。

### 五、验证与账

`unknown-casts` **89 → 88**（基线已固化）· `tsc` strict 0 · `lint` 0/0（1627 文件）·
`format:check` 0 · `docs:check` OK · `text:check` 0 · `migration:selftest` 53/53 ·
`editor` 全量套件 252 文件 / 2066 用例全绿、exit 0。

> 方法上值得单记：**「声明与用法不自洽」这个判断，本身也要被验证。**
> 本次的真相是「声明是对的，占位值是错的」—— 而当时把票投给了「声明错了」。
> 判别手法很朴素：**把值的来源一路追到它的构造函数/签名**，而不是停在同文件里的相似写法。

## 第 105 轮（2026-09-21）：结案待决策 ⑤ —— 不是 `ParamHistory` 缺字段，是接口偏宽

第 80 轮发现 `script-list.ts` 把 `new ParamHistory(...)` 当 `IEditableHistory` 用，而它「结构上不满足」
（缺 `stack` / `index`），只好写 `as unknown as` 硬跨，并记成**待用户决策的类型设计债务**。
这一轮把两边都量了一遍，结论反了过来：**该改的是消费方的类型，不是 `ParamHistory`。**

### 一、先看双方到底差什么

| `IEditableHistory` 要求 | `ParamHistory` 实际 |
| --- | --- |
| `stack: HistoryData[]` | ✗ 没有（也不该有） |
| `index: number` | ✗ 同上 |
| `reset` / `save` / `restore` / `canUndo` / `canRedo` | ✓ 都有（形参更宽/更窄处靠方法双变性通过） |

### 二、关键是「谁真的需要 `stack` / `index`」

- `ParamHistory` 是**委托型适配器**：它不持栈，`canUndo` 读的是 `this.owner.history[history.index]`
  —— 栈在 owner 身上（`History extends Array`，**栈就是数组自身**，所以那边也没有独立的 `stack` 字段）。
  也就是说：**它本就不该有 `stack` / `index`**，缺这两个字段不是缺陷，是它的形态。
- 全仓把这类 history 当 `IEditableHistory` 用的 5 处（`script-list` / `property-list` / `event-list` /
  `condition-list` / `list-interface`），**只调用方法**。
- 实测 `history.index` / `history.stack` 的读取点（24 处）**没有一处**经由这些字段 ——
  命中的全是数组型 `History` 自己的 `history.index`（scene/sprite/animation/枚举/变量/属性…），
  加上 `ParamHistory` 内部读它 owner 的那两处。

⇒ **接口对这批消费方偏宽**。原判断「`ParamHistory` 不满足接口」把因果弄反了。

### 三、处置

1. 新增窄契约 `IUndoRedoHistory`（`reset` / `save` / `restore` / `canUndo` / `canRedo`），
   令 `IEditableHistory extends IUndoRedoHistory` —— **语义不变**，只是把两者分层；
2. 5 处消费方的字段类型收窄到窄契约 ⇒ **4 处 `as unknown as IEditableHistory` 直接消失**；
3. 更正 `types/history.ts` 顶部那句把 `ParamHistory` 一并列为「implements 栈式契约」的注释
   —— 那正是「矛盾」的来源（文档把一个委托型适配器混进了持有栈的那一批）。

**没有**给 `ParamHistory` 硬加 `stack`/`index`：那样只是把「谁读谁拿到 `undefined`」的风险留在原地，
再配上一句「反正没人读」。收窄消费方才是让类型与现实一致的那种改法。

### 四、验证与账

`unknown-casts` **88 → 84**（files 76 → 72；基线已固化）· `tsc` strict 0 ·
`typecheck:vue` 0 新增 · `lint` 0/0（1627 文件）· `format:check` 0 · `docs:check` OK ·
`text:check` 0 · `migration:selftest` 53/53。

> **本轮 diff 是纯类型**（`import` 的是 interface、字段标注、注释，以及被擦除的断言），
> 故未重跑全套 —— 依据是逐行核对 `git diff -U0`：语句本身逐字未变。

> 方法上两条，与第 104 轮同源：
> ① **「A 不满足接口 B」要先问「谁真的需要 B 的全部成员」** —— 需要面窄就收窄接口，而不是改造 A；
> ② **文档里的清单也要复核**：把 `ParamHistory` 列进「持有栈的那 6 个类」，
> 就是这份「矛盾」的起点，而它一直没人查。

### 五、待决策清单状态

**原 7 项 → 现在只剩 1 项**：⑦ P5-C/D 开工（前提是实机回归全过）。
（① format:check 第 91 轮关；② 测试 flake 第 89 轮证否并修；③ build:types 进门禁第 90 轮；
④ `TextCommandShape.color` 第 104 轮；⑤ 本轮；⑥「P6 三处行为缺陷」第 92/93 轮。）

## 第 106 轮（2026-09-21）：**修完声明忘了清调用点** —— 17 处多余断言，`unknown-casts` 84 → 67

台账里 `unknown-casts` 还剩 84 处 / 72 文件，文档说「剩余全在承重形状上」。这句**又一次被量翻了**
（前两次是 ④ 与 ⑤）：本轮什么都没设计，只是把**早就多余**的断言删掉，就掉了 17 处。

### 一、大头：14 处挂在 `bindInput` 上的死断言

```ts
bindInput(elements, editor, Scene as unknown as { history: unknown });
```

`InputOwner` 早在**第 89 轮**就已经放宽成 `object`（`useInspectorInput.ts:24`），
而 `Scene` / `Animation` 本来就是对象 ⇒ **这个断言完全多余，删掉即可**。`tsc` 一次都没报错 ——
因为**多余的断言不是错误，只是噪声**：没有任何门禁会告诉你「这里其实不用断言」。

分布：7 个 `Anim*Frame/LayerPage.vue`（`Animation`）+ 7 个 `Scene*Page.vue`（`Scene`）= **14 处**。

### 二、⚠️ 文档当时**声称已经清干净了**，其实没有

`useInspectorInput.ts` 的原注释写着：

> 声明成 object（不假设任何键）后，**这 18 处断言全部消失**

**实测：到本轮为止仍有 14 处**。也就是说这句「全部消失」是**改动当时的意图**被写成了「既成事实」，
而这条注释一直没人对着代码核 —— 与第 104 轮「声明与用法不自洽」、第 105 轮「文档清单把
`ParamHistory` 列进持有栈的那批」是**同一类**：**文档里的形容词（「全部」「都已」）从不复查。**
已把该注释改成如实描述，并记下「漏了整整 17 轮」。

### 三、小头：3 处用上了本来就为它导出的类型

`components/common/{NumberBox,TextBox,TextArea}.vue` 里的

```ts
(input as unknown as { history: unknown }).history = new NumberHistory(input);
```

`ui-kit` **早就导出了** `HistoryInputElement` / `HistoryTextAreaElement`（`number-box-api.ts:46`
的注释甚至写着「导出以便消费方不必各自写 as unknown as { history: unknown } —— 编辑器侧 3 个
components/common/*.vue 曾各写一遍」）。于是改成单次断言 ⇒ 3 处双断言消失：
`(input as HistoryInputElement).history = …`。**类型已经备好、注释已经写明，调用点却没跟上。**

### 四、⚠️ 过程中的一次自伤（如实记）

我用 node 脚本做那 14 处精确字符串替换（**逐字替换、不是正则**，并打印了每文件替换数）。
但随后用编辑工具改 `common/*.vue` 时，**它把两个文件开头的 UTF-8 BOM 吃掉了** ——
`git diff` 里表现为 `-<template>` / `+<template>`。发现方式就是**逐行看 diff**（`<template>` 凭空多出来
是解释不通的），随后按「HEAD 有 BOM 而当前没有」逐个恢复，共 2 个文件。**教训：改 `.vue` 之后
必须看一眼 diff 的第一行有没有编码层噪声。**

### 五、验证与账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **84 → 67**（files 72 → 55；基线已固化） |
| `tsc` strict | 0 |
| `typecheck:vue` | 0 新增（本轮改的多数是 `.vue`，所以这条必须跑） |
| `lint` / `format:check` / `text:check` / `docs:check` | 0-0（1627 文件）/ 0 / 0 / OK |
| `migration:selftest` | 53/53 |

> **本轮 diff 是纯类型 + 格式化**：删断言、加 `type` 导入、oxfmt 因实参变短而把多行调用收成一行。
> 故未重跑全套 —— 依据：`git diff -U0` 逐行核对，没有新增/删除任何运行期语句。

> 方法论再记一条（与第 104/105 轮同源）：**「剩余的都是承重形状」这类结论要按文件量一遍再信。**
> 本轮没做任何设计，只清「已经多余的断言」，就让这条轴掉了 20%——
> 说明**「难」的那批与「忘了清」的那批混在同一个数字里**，而文档只描述了前者。

## 第 107 轮（2026-09-21）：把 `any-hatches`（51 / 26 文件）**逐条量了一遍** —— 结论与上一轮相反

上一轮在 `unknown-casts` 上「量一遍」量出了 17 处死断言。于是这一轮用同样手法量 `any-hatches`，
**结论是反的：这条轴的剩余项基本确实是承重的。** 但量出了一个例外，而且它**边界精确**。

### 一、51 处的构成（脚本逐行打印，不是抽样）

| 形态 | 处数 | 说明 |
| --- | ---: | --- |
| `export const XxxEngine: Record<string, any> = {}` | **7** | `UIEngine` / `ParticleEngine` / `PaletteEngine` / `AutoTileEngine` / `SceneCameraEngine` / `SceneMarqueeEngine` / `AnimationWindowEngine` —— 同一形态的「方法注册表」 |
| `[k: string]: any` 在某个 interface 里 | ~30 | 元素/场景/粒子/UI 节点等**异质载荷**形状 |
| `Record<string, any>`（配置袋/桥接） | 若干 | 见下 |

### 二、抽查到的都**有据可依**（这次文档是对的）

- **`services/file-system/fs-bridge.ts`**：`FSP = (FS.promises ?? {}) as Record<string, any>`
  的注释记着**两个实测差别** —— `writeFile` 的第三参被换成语义不兼容的布尔 `check`（约 30 个调用点形态还不统一），
  以及它曾掩盖 `fs.promises.existsSync` 为 `undefined`（导致**文件浏览器重命名直接抛错**）。
  注释还写明「收这条轴的正确做法是先定义 `FSP` 的对外面」——**这个判断是对的**。
- **`YMParameterPane.vue`（5 处）**：第 64 轮实测过「枚举 `attachStateAccessors` 的字段」的代价是 41 处，**并已回退**。
- **`ui-window.ts`（3 处）**：属遗留层，**④ 会连文件一起删**，现在动它是白做。
- **`element-classes.ts` / `types/shapes.ts` / `particle-window.ts`**：注释里都写明了取舍（P2b-1 的教训、
  「不重做元素系统的类型」），不是漏改。

### 三、**例外**：`stores/ui.ts` 的 `UINodeShape` 索引签名 —— 承重，但**边界精确**

本轮把它删掉跑 `tsc`，得到的是**可穷举**的结果（不是「990 个错误」那种）：

```txt
缺 6 个字段 / 27 处 / 5 个文件
字段：instance · instances · name · presetId · synchronous · transform
文件：usePresetElementWindow · ui-engine · ui-events · ui-pointer · ui-transform
```

⇒ **它不是一个「承重形状」，而是一件可执行的枚举活**（手法库第 2 条：删签名 → tsc 点名 → 逐个枚举）。
之所以本轮**没做完**，是因为卡在其中一个字段上：

> `transform` 目前**没有可复用的类型** —— 真实形状是 `element-page.ts:53` 那个**局部**的
> `UIElementTransform`（`anchorX/anchorY/x/x2/y/y2/width/width2/height/height2/rotation/scaleX/scaleY/skewX/skewY/opacity`）。
> 要给它一个诚实的类型，得先把它**提取成共享类型**，那是类型设计活，不是机械枚举。
> 用 `Record<string, unknown>` 顶一下会让 `transform.x` 之类的读点变成 `unknown` 再炸一片 —— 那是拿一个坑换另一个坑。

已恢复该签名（工作树与 HEAD 逐字相同）。**下一轮的正确起点是把 `UIElementTransform` 提成共享类型，
然后照上面那份 6 字段清单一次做完。**

### 四、本轮产出与账

**零代码改动**（本轮的价值是「把 51 处逐条量清 + 给出一件边界精确的活 + 否掉一次可能的白工」）。
`tsc` 0 · `migration:check` 15 轴持平 · `git status` 干净。

> 方法论补一条，与上一轮**互为对照**：**「量一遍」既可能推翻「都很难」，也可能证实「确实难」。**
> 第 106 轮量出 17 处是死的，第 107 轮量出基本是活的 —— **同一个动作，两个相反的结论**。
> 所以结论不能从「上次量出了便宜货」推出来，只能从**这一次的实际测量**里读出来。
> 另外：**「承重」不等于「不可枚举」** —— `UINodeShape` 就是承重但可枚举的例子，
> 判据是「删掉后 `tsc` 报的是 6 个字段还是近千个错误」。

## 第 108 轮（2026-09-21）：把上轮那件「6 字段的活」**真做了一半** —— 它比看上去深三层

按第 107 轮的结论动手：先把 `UIElementTransform` 提成共享类型，再照 6 字段清单枚举 `UINodeShape`。
**第一半做好了，第二半做完后发现 6 个字段只是最浅的一层** —— 于是把它退回，并把这三层如实记下。

### 一、已落地：`UIElementTransform` 提成共享类型（纯类型移动）

`inspector/element-page.ts` 里那个**局部** interface（15 字段）→ `engine/ui/element-classes.ts`
（紧挨 `UIElementInstance`，同一领域），`element-page.ts` 改为 import。diff 里只有声明搬家，
**没有一条运行期语句**。这是真进步：它是 `UINodeShape.transform` 能具名化的**前提**。

### 二、做了一半、然后退回：`UINodeShape` 的枚举

把 6 个字段按真实类型写上去（`instance: UIElementInstance` / `instances: UIInstanceList` /
`transform: UIElementTransform` / `presetId?: string` / `name?: unknown` / `synchronous?: boolean`），
原来的 27 处「属性不存在」**全消失** —— 但换来 **31 处新错误 / 6 个根因**，而且**每一条都是真信息**：

| # | 根因 | 性质 |
| --- | --- | --- |
| A | `instances.set(…)` —— `UIInstanceList` 上**没有** `set` | 我拿的类型**不完整**（真实对象比 `element-instance-list.ts` 声明的更丰富） |
| B | `matrix` / `parent` **可空却被直接解引用**（`ui-engine` 6 处 + `ui-pointer` 8 处） | **真实潜在崩溃**（与第 101 轮 `texture.base` 同类） |
| C | `ui-engine.ts:363` **把 `null` 赋给 `instance`** | 说明 `instance` 并非「必然有主实例」 |
| D | `HoverNode` 与新的 `UINodeShape` **无重叠**（TS2367） | 第 106 轮那个障碍**回来了**（因为形状变严） |
| E | `ui-transform.ts:59`：**`ui-window.ts` 的 `UINodeShape` 与本地的 `UINodeShape` 不再兼容** | ⚠️ **全仓有两个同名 `UINodeShape`**，以前靠索引签名「碰巧兼容」 |
| F | `presetId` 可选 vs 参数要 `string` | 小 |

⇒ **第 107 轮那个「6 个字段 / 27 处」是浅层读数。** 真要做完 `UINodeShape` 归零，需要：
① 把**两个** `UINodeShape` 合成一个（E）；② 弄清 `instance` 到底可不可空（C，而 B 的 14 处解引用
全依赖这个答案）；③ 弄清 `instances` 的真实类型（A）；④ 再谈 D / F。

### 三、为什么退回来，而不是硬做完

B 与 C 是**行为问题**：那 14 处无守卫的解引用，要么证明不变式成立（补 `!`），要么加守卫（**改行为**）。
我**没有**能证明不变式的证据（要真机跑），而「先补一批 `!` 让 `tsc` 变绿」正是本仓反复记的
**静默失效制造机**（附录四/六/七/八/九全是这个形状）。所以：**只保留能证明是纯类型移动的那一半。**
`stores/ui.ts` 已逐字还原，工作树里只剩 element-classes/element-page 两处改动。

### 四、验证与账

`tsc` strict 0 · `typecheck:vue` 0 新增 · `lint` 0/0（1627 文件）· `format:check` 0 ·
`migration:check` 15 轴持平（**本轮的改动不改任何读数**：搬的是类型声明，`any-hatches` 仍是 51）·
`docs:check` OK · `text:check` 0 · `migration:selftest` 53/53。
本轮 diff 是**纯类型搬家**，故未重跑全套（依据：逐行核对 `git diff`，无运行期语句）。

> **方法论（本轮最值钱的一条）**：**「删掉签名后 `tsc` 报了几个字段」量的是第一层，
> 不是整件事的规模。** 6 个字段背后还压着「两个同名类型要合并」和「14 处可空解引用」——
> 前者是设计活，后者是**行为问题、需要实机**。
> 更好的判据不是「报了几个字段」，而是「**这些字段背后有几处需要行为判断**」。
> 一个看起来 27 处的机械活，真做下去是「1 处类型合并 + 14 处行为裁决 + 1 处类型补全」。

## 第 109 轮（2026-09-21）：合并两份同名 `UINodeShape` —— `any-hatches` 51 → 50

上一轮把 `UINodeShape` 的活拆成三件，其中**「合并两个同名类型」是唯一不含行为判断的那件**，
这一轮把它做掉。

### 一、合并：全仓只剩一处声明

`UINodeShape` 此前**被声明了两遍**：`legacy/ui-window.ts` 一份、`stores/ui.ts` 一份，
各自带 `[k: string]: any`。两份靠索引签名「**碰巧**结构兼容」⇒ **可以各自漂移而无人发现**
（第 108 轮把 store 那份收紧后，`ui-transform.ts:59` 当场报「两者不兼容」——那是隐患第一次显形）。

现在唯一声明在 `engine/ui/element-classes.ts`（与 `UIElementInstance` / `UIElementTransform` 同处），
`ui-window.ts` 只做再导出（域模块的 import 路径不变），`stores/ui.ts` 直接 import。

**收益**：① 结构上不可能再漂移；② `any-hatches` **51 → 50**（两份索引签名并成一份）。
索引签名**暂时保留** —— 理由写在声明处（第 108 轮的 14 处可空解引用是行为问题）。

### 二、⚠️ 过程中的一个真正的新坑：**给遗留文件加注释会顶起 `legacy-ui-lines`**

第一版我把 3 行「为什么合并」的注释写在了 `ui-window.ts`（**遗留目录内**），
`migration:check` 立刻报：

```txt
legacy-ui-lines  316 → 319   ✗ 上升（棘轮不允许）
```

**这条轴数的是目录里的行数，注释也算。** 于是「写清楚为什么」这个动作本身会把一条棘轮弄红。
处置：注释搬去**声明处**（`element-classes.ts`，目录外），`ui-window.ts` 里只留一行
`export type { UINodeShape };` ⇒ 读数回到 **316（持平）**。

> 教训值得单记：**在「行数棘轮」覆盖的目录里，解释性注释是有代价的。**
> 不是不能写，而是**要写在被计数的地方之外**（声明处/设计文档），
> 否则「把理由写下来」会和「别让数字变大」直接冲突 —— 而冲突的结果往往是悄悄不写理由。

### 三、验证与账

| 项 | 结果 |
| --- | --- |
| `any-hatches` | **51 → 50**（files 26 → 25；基线已固化） |
| `legacy-ui-lines` | 316（持平 —— 第一版曾是 319，已按上面所述挪走注释） |
| `tsc` strict / `typecheck:vue` / `lint` / `format:check` / `docs:check` / `text:check` | 0 / 0 新增 / 0-0（1627 文件）/ 0 / OK / 0 |
| `migration:selftest` | 53/53 |

本轮 diff 是**纯类型**（声明搬家 + import/再导出），故未重跑全套（依据：逐行核对 `git diff -U0`，
无运行期语句）。

### 四、`UINodeShape` 三件活的进度

| # | 活 | 状态 |
| --- | --- | --- |
| ① | 合并两份同名声明 | ✅ **本轮完成** |
| ② | 14 处 `matrix` / `parent` 可空解引用 + `instance` 可空性 | ⛔ **行为问题，等实机** |
| ③ | 补全 `instances` 的真实类型（`UIInstanceList` 上没有 `set`） | 需要先弄清真实对象 |

②③ 做完，那条索引签名才能退役（`any-hatches` 再 −1，且 `UINodeShape` 变成真形状）。

## 第 110 轮（2026-09-22）：一条**被本阶段自己拆掉**的硬限制 —— `primeWindows` 早已不再绕过 `loadUI`

> 本轮没有动一行运行期代码，却把 ④ 剩下三步的验收口径改了。起因是准备开工 ④-2b 前的一次复量。

### 一、先复量 ④-2b 的工作单：第 103 轮的 **70 处**被独立复现

按台账纪律「数字要能被脚本重新量一遍」，写了一次性测量
`scripts/oneoff/measure-4-2b.mjs`（只读），把「以 UI 为接收者的引擎方法调用」按两条判据分开数：

| 形态 | 判据 | 处数 |
| --- | --- | ---: |
| 字面量 `UI.<镜像>(…)` | 文件确实把 `UI` 当 UI 单例用 | **21** |
| UI 接收者的 `this.<镜像>(…)` | 文件声明了 `this: UIShape`（恰好 **9** 个文件，全在 `engine/ui/`） | **49** |
| 合计 | | **70** |

**与第 103 轮逐字一致**（分布的每一条也对得上：`ui-engine` 7/7、`ui-events` 2/14、`ui-pointer` 12、
`ui-transform` 3/10…）。原始正则还会多报 **4 处**，逐条看完全是噪声：2 处是**注释里**的示例
（`animation-player.ts:27`、`ui-engine.ts:646`），2 处在 `stores/__tests__/ui-state.spec.ts`（测试
**故意**直连遗留单例）。⇒ 复量确认：**70 这个数可以照着做**，但正则不能直接当工作单用。

### 二、顺手核对 ④ 的验收前提 —— 发现前提已经不存在了

④ 的分步计划里，④-2c / ④-3 / ④-4 的「需要真机？」一列全写「**是**」，理由（附录十三 §6）
是：真机走 `main/initialize.ts:91` 的 `primeWindows(clusterRef)`，按小写键直接
`windows.set('ui', …)`，于是**绕过 `loadUI`**，而 vitest 走的正是 loader 路径 ⇒「套件会绿着骗你」。

核这条链路时发现它**已经断了，而且是被本阶段第 ① 步自己拆掉的**：

| 环节 | 事实 |
| --- | --- |
| `primeWindows` 的实现 | `tools/window-registry.ts:82` 对入参 `Object.entries`，键取 `key.toLowerCase()` |
| 生产调用点 | 全仓只此一处：`main/initialize.ts:91`，喂的是 `await import('@app/tools/window-cluster')` 的**命名空间对象** |
| 它的键集 | 就是 `window-cluster.ts` 的 41 个导出名 —— 而 **`UI` 已不在其中**：第 ① 步 `00729b15` 的 diff 第一行就是 `-export { UI } from '@app/engine/ui/legacy/ui-window.ts';` |
| ⇒ 推论 | 没有 `UI` ⇒ **没有小写 `'ui'` 键** ⇒ 缓存里永远没有 UI 预热项 ⇒ `getLazyWindow('ui', loadUI)` 与 `loadWindow('ui', loadUI)`（`stores/ui.ts:368`）在真机上**真的走到 `loadUI`** |

⇒ **真机取 UI 对象走的就是 `loadUI`，与 vitest 同一条路。** 那句「套件会绿着骗你」，
在 1c ① 之后只剩一个残余版本：**套件跑在 jsdom 里，覆盖不到真实 WebGL 渲染**。

### 三、仪器：两个方向都要能红，且实测变红了

新增 `engine/ui/__tests__/ui-window-arrival-path.spec.ts`（2 例）：

- **用例 A** 证明**机制有效** —— 给 `primeWindows` 一个带 `UI` 键的对象，`'ui'` 槽位确实被预热
  （loader 一次都不被调用、读到的是塞进去的那个对象）。若 `primeWindows` 被改坏，A 红。
- **用例 B** 证明**生产调用点喂的键集里没有 `ui`** —— 谁把 `export { UI }` 加回 `window-cluster.ts`，B 立刻红。

**自证实测**（临时改回导出、跑完即还原）：B 红在
`expected [ 'scene', 'ui', 'animation', …(39) ] to not include 'ui'`，A 仍绿；还原后两例皆绿。

> 只留 A 会漏掉「生产喂的对象变了」；只留 B 会漏掉「机制本身坏了」。**成对才叫钉住。**

### 四、改后的验收口径

- **接线正确性**（函数拿到的是不是那个 `this`、镜像退役后有没有漏掉的读点）⇒
  **静态检查 + editor 全套**即可，不再是「CI 验不了」。
- **真实渲染**（画布画得出来、可平移缩放、点选有反应）⇒ 仍只有真机能看。走查清单保留，
  但它约束的是「画得对不对」，不是「接线接没接上」。

文档同步更正了 4 处**逐字断言旧机制**的地方：PHASE-1C 的「剩下的活」第 5 项与附录十三新增 §7、
`engine/ui/ui-slots.ts` 头部、`engine/ui/__tests__/ui-slots.spec.ts` 文档串，
以及 `legacy/ui-window.ts` 里那 4 行注释（**原地改写、行数不变** —— 见第 109 轮那个坑）。

### 五、验证与账

| 项 | 结果 |
| --- | --- |
| 新增用例 | 2 例（含变红自证） |
| `legacy-ui-lines` | **316 持平**（改写遗留目录内注释时保持了行数不变） |
| 其余 15 条轴 | 全部持平（`any-hatches` 50 / `unknown-casts` 67 / `ui-singleton-members` 103 / `1c-store-slot-gaps` 0） |
| `migration:selftest` / `tsc` / `typecheck:vue` / `lint` / `format:check` / `docs:check` / `text:check` | 53/53 · 0 · 0 新增 · 0-0 · 0 · OK · 0 |
| editor 全套 | **253 文件 / 2068 用例全绿、exit 0**（本轮改了 `.spec.ts` 与注释，按纪律跑了全套） |
| 复量脚本 | `node scripts/oneoff/measure-4-2b.mjs` ⇒ 工作点 **21 + 49 = 70**、噪声 4、排除假阳性 211 |

### 六、教训

1. **「硬限制」也是要复核的结论，尤其当它是本阶段自己的改动拆掉的。** 第 ① 步的提交说明
   用大段篇幅解释了「为什么不能直连 `ui-engine.ts`」，却**一个字都没提**这次删除顺手取消了
   `primeWindows` 对 UI 的预热 —— 一条写在设计文档里、被后续三步当成验收依据的硬限制，
   就这样静默失效了。**改动的影响面不只在「它改了什么」，还在「它让哪些既有结论不再成立」。**
2. **门禁全绿证明不了文档里的事实。** `docs:check` 只校验可执行声明与链接（§6 自己写在开头：
   「数字的真源是 `migration:ledger`，不是任何一份文档」），这条错误的前提在文档里躺了整整一轮
   阶段，`tsc`/`lint`/`format`/`text`/`docs` 五个门禁全绿。
3. **复量能确认数，但不能自动修正口径。** 70 处被逐字复现，说明第 103 轮测得准；可同一个
   精度下，「唯一验收是真机」这句话没人量过 —— **数字有棘轮，判断没有**。判断只能靠回头核前提。
4. **复量脚本自己的汇总行也会骗人。** 第一版 `measure-4-2b.mjs` 的汇总报 **74**：它把 2 处
   **注释里的示例**和 2 处**测试文件里故意的直连**也算成了工作单。加上噪声分类后才恰好复现
   **70**。⇒ 仓规说「数字的真源是脚本」，但**脚本自己也得先被复核**；否则它就成了下一个
   「没人量过的数字」。一次性脚本同样要留下、要能重跑（本轮已随提交入库，文档里引用它）。

## 第 111 轮（2026-09-22）：④-2b 不是一种改写，是**三种** —— 其中 7 处正踩在「连错三次」的那个坑上

> 上一轮把 ④ 的**验收口径**理顺了；这一轮准备真开工 ④-2b，结果在动手前发现**计划里的写法**会
> 直接复现一次已经付过代价的事故。

### 一、动手前先读那 7 行所在的函数

④-2b 的计划是一句话：「把这 9 个 UI 文件里「以 UI 为接收者」的引擎方法调用改成直连
`UIEngine.x.call(this/UI, …)`」。计划**已经**区分了 `this` 与 `UI` 两种接收者，看着很周全。

但按清单去读 `ui-engine.ts` 里那 7 处字面量 `UI.drawXxx!()`（`656`–`662`）时，
函数上方第 **637** 行躺着一段现成的警告：

> ⚠️ 必须通过 **`UI.drawXxx()`** 调用，不能写成 `UIEngine.drawXxx()` 或
> `UIEngine.drawXxx.call(this)`。原因（2026-09-18，我在这里连错三次）……

原因写得很清楚：`renderingFunction` 是被 `Timer` **裸调用**的
（`timer.ts:195` 的 `stageRendering(deltaTime)`），所以它自己的 `this` **恒为 `undefined`** ——
不是「指向了错的对象」，是**根本没有**。当年改成 `.call(this)` 再加
`if (!this?.renderingFunction) return` 作保护，后果是**每帧提前 return** ⇒
**「不报错，但整个 UI 画布一片黑」**。

⇒ 照计划「统一用 `this`」改写这 7 处，就是当年第三次错误的逐字复刻。

### 二、把 70 处按**改写形态**分类：49 + 14 + 7

`measure-4-2b.mjs` 新增 D 段（可复现）：

| 类 | 形态 | 处数 | 接收者 | 改写形态 |
| --- | --- | ---: | --- | --- |
| **C1** | UI 接收者函数里的 `this.<镜像>` | **49** | `this`（在手） | `UIEngine.x.call(this, …)` |
| **C2** | 普通方法里的字面量 `UI.<镜像>` | **14** | `UI` | `UIEngine.x.call(UI, …)` |
| **C3** | **`renderingFunction` 里的**字面量 `UI.<镜像>` | **7** | **不存在** | 只能 `.call(UI)` |

**70 = 49 + 14 + 7**。计划的问题不在「漏了 `UI` 这种接收者」，而在**把三种形态压成了一句话** ——
于是「哪一批用哪个接收者」没有落到纸面，动手的人只能自己猜。

### 三、先补仪器，再谈改写：注释不会失败

那三次连错的教训，十个月来**只写在注释里**。注释是给愿意读的人看的；它不会在 CI 里红。
所以本轮的产出是一件仪器：`engine/ui/__tests__/ui-rendering-receiver.spec.ts` ——
裸调用 `renderingFunction`，断言 7 个 draw **全部执行**且**接收者都不是 `undefined`**。

判据刻意**不**钉死具体对象：真实接收者是 `getLazyWindow('ui', …)` 的惰加载**代理**，
不是 `import { UI }` 拿到的那个单例。钉死对象会把 ④-2b 后**合法**的改写判成回归；
而三次连错的失败签名是「接收者 `undefined` ⇒ 提前 return ⇒ 7 个 draw 一个都没跑」，
判据就取这个 —— 不多不少，且**跨改写有效**。

### 四、⚠️ 仪器自己的假绿（本轮最值钱的一条）

第一版用例是**绿的**，自证突变后**仍然绿** —— 因为我把「裸调用」写成了
`UIEngine.renderingFunction()`。那是**属性调用**，`this` 被意外绑成了 `UIEngine`，
于是连 `.call(this)` 这种错写法也能蒙过去。

真实的调用约定是：`Timer` 用 `appendUpdater('stageRendering', this.renderingFunction)`
**存下函数引用**，之后在 `timer.ts:195` 直接 `stageRendering(deltaTime)` —— **脱离接收者**调用。
改成先 `const render = UIEngine.renderingFunction` 再 `render()` 之后，自证才成立：
突变 ⇒ 红在「`drawBackground` 的接收者是 undefined」，还原 ⇒ 绿。

> **用例不仅要断言对，还要复现真实的调用约定。** 第一版用例守的是一种**并不存在的调用形态**：
> 它在测「如果有人把 `UIEngine.renderingFunction()` 当方法调」，而代码里根本没有人这么调。
> 这种假绿比没有用例更坏 —— 它会让下一个人以为这个坑已经有 CI 兜着了。

### 五、口径

- **C1 / C2** 按计划改写（接收者分别是 `this` / `UI`），无歧义。
- **C3** 取 `.call(UI)`：接收者逐字等于原来的（镜像就是同一个函数对象）⇒
  **④-2c 的 103 → 82 仍然可达**。若最终决定 C3 保留 `UI.drawXxx()` 形态，则 ④-2c 的目标
  应改为 **103 → 89**（那 7 个镜像必须留下）。这一条已写进 PHASE-1C 附录十三 §8，**等改写时定**。
- 改写本身（70 处）**留到下一轮独占做** —— 本轮的产物是「先有会失败的仪器」。

### 六、验证与账

| 项 | 结果 |
| --- | --- |
| 新增用例 | 1 例（含突变自证；第一版假绿已修正） |
| 16 条轴 | 全部持平（未动任何运行期代码） |
| `migration:selftest` / `tsc` / `typecheck:vue` / `lint` / `format:check` / `docs:check` / `text:check` | 53/53 · 0 · 0 新增 · 0-0 · 0 · OK · 0 |
| editor 全套 | 254 文件 / 2069 用例全绿、exit 0 |

### 七、教训

1. **「接收者在手」是一类判据，不是一句常识。** 70 处里有 7 处**根本没有接收者**，
   而这 7 处的正确写法与另外 63 处**形式相反**（别的改成显式 `.call`，这 7 处必须保住方法调用）。
   把三种形态压成一句话的计划，看起来更简洁，实际是把判断成本转嫁给了动手的人。
2. **注释不是门禁。** 「我在这里连错三次」写得很清楚，但它躺在函数体内，只有读那个函数的人
   才会看到；而计划的作者显然没有逐处读（否则 ④-2b 那一行不会那样写）。**能被跳过的知识
   等于不存在** —— 把它变成会失败的用例，哪怕只覆盖 1 个症状。
3. **假绿比没有测试更危险。** 差一点就把一个「永远绿」的用例当成「这个坑有 CI 兜着」交出去。
   自证（「把它改坏，用例必须红」）是唯一能发现这件事的手段 —— 本轮它当场发现了。
4. **又一个「计划里不能执行的写法」**（第 ① 步是第一个）。两次的共同点：计划是**按目标**写的，
   而不是**按调用点**读出来的。⇒ 这个仓库里，「动手前先逐处读一遍」不是谨慎，是必需步骤。

## 第 112 轮（2026-09-22）：④-2b 落地 —— 70 处调用点按上一轮量好的**三类形态**分流改写

> 上一轮把工作单量成 49 + 14 + 7 并装了守卫；这一轮按量好的形态动手，一次改完。

### 一、改写形态（与上一轮的量法逐条对上）

| 类 | 处数 | 形态 |
| --- | ---: | --- |
| C1 | **49** | `this.<镜像>(…)` → `UIEngine.<x>!.call(this, …)` |
| C2 | **14** | 字面量 `UI.<镜像>(…)` → `UIEngine.<x>!.call(UI, …)` |
| C3 | **7** | `renderingFunction` 里的字面量 → `UIEngine.<x>!.call(UI)` —— **不能** `.call(this)` |
| 值引用 | **2** | `this.renderingFunction` → `UIEngine.renderingFunction`（镜像就是同一个函数对象） |

### 二、用一次性 codemod，而不是手改 70 次

`scripts/oneoff/apply-4-2b.mjs`。四个让它**可审计**的设计：

1. **只改工作单所在的 8 个文件** —— 别处还有 **212 处**同名的 `this.x`（场景/动画/粒子/调色板
   各自的 `requestRendering`，以及 `webgl-methods.ts` 里其实是 WebGL 上下文的 `this.drawElements`），
   按文件圈定范围是唯一可靠的隔离手段。
2. **跳过注释行** —— `ui-engine.ts` 那段警告注释里**就写着** `UI.drawXxx()` 这种示例；
   盲改会把注释里的示例一起改掉（那就等于把历史教训改写成了假话）。
3. **括号按深度配对取实参**，实参原样搬运：`read(this)`、`getUIStore().zoom! - 1`、
   `event!` 这些都对上了（逐行核对 `git diff` 确认）。
4. **每个文件断言 [this 接收者, UI 接收者, 值引用] 三条预期数**，对不上就**整体中止**，
   绝不「改一半」。

> 实测收获：dry-run 第一次就红了 —— 我给 `ui-engine.ts` 填的 `this: 7` 是错的，实际是
> **5 个调用 + 2 个值引用**。**断言里的预期值也必须由测量得来，不能凭印象填**；否则这个
> 「会自证的脚本」就变成了「用错误预期卡住正确改写」的机器。

### 三、一处不得不动的守卫：`LayoutPanel.vue` 的 `UI.requestRendering?.()`

那个 `?.` 守的是「UI 窗口还没加载」（`UI` 在这里是惰加载代理，取不到就是 `undefined`）。
**镜像删掉之后这条守卫无法原样保留** —— 它读的就是镜像本身。等价性论证：

> `requestRendering` 内部第一行是 `getUIStore().state === 'open'`，而该状态**只在 UI 窗口
> 对象的方法体里**（`ui-file.ts:29`）被置为 `open` ⇒ **窗口没加载时 state 必不为 `open`**，
> 内部同样直接返回。⇒ 去掉 `?.` 行为等价。

**顺手查实的反例（说明「守卫可以随手删」是错的）**：`Timer.appendUpdater` 只判断
`updaters[key] === null`，传 `undefined` 会**毒化槽位**（`undefined !== null` ⇒ 之后每帧
都去调用它 ⇒ `TypeError`）。所以那处若真把 `undefined` 传给 Timer，后果比原来的静默 no-op 更坏。
⇒ 删守卫必须**逐个论证**，不能因为「看起来是防御性代码」就一并清掉。

### 四、注释同步：代码一改，原来的警告就变成了假话

`ui-engine.ts:639` 那段「必须通过 `UI.drawXxx()` 调用，不能写成 `UIEngine.drawXxx.call(this)`」
在改写后与代码**直接矛盾**（代码现在正是 `UIEngine.drawXxx!.call(UI)`）。已整段改写为：

- 这 7 处的接收者**必须在手**（只能传 `UI`），因为本函数被 `Timer` 裸调用、`this` 不存在；
- 别处 63 处的 `this` 是**真实接收者** ⇒ 形式相似、含义相反，这正是第 111 轮量出来的那一层；
- 末尾补上「该不变式现在有会失败的用例兜着」（指向 `ui-rendering-receiver.spec.ts`）。

> 教训：**改写会把「注释里的真话」变成「注释里的假话」**，而门禁查不出这件事。
> 凡是注释在描述代码形态的地方，改写必须连注释一起改。

### 五、验证与账

| 项 | 结果 |
| --- | --- |
| ④-2b 工作单 | **70 → 0**（`node scripts/oneoff/measure-4-2b.mjs`：A 0 / B 0） |
| 16 条轴 | 全部持平（本轮只改调用点，镜像按计划**留到 ④-2c**） |
| `migration:selftest` / `tsc` / `typecheck:vue` / `lint` / `format:check` / `docs:check` / `text:check` | 53/53 · 0 · 0 新增 · 0-0（1631 文件）· 0 · OK · 0 |
| 两个守卫用例 | 改写后**仍绿** —— 上一轮把它们写成「接收者非 undefined」「键集不含 ui」这种**跨改写有效**的判据，正是为了这一刻 |
| editor 全套 | **254 文件 / 2069 用例全绿、exit 0** |

### 六、④-2c 的清单（下一步，先量后做）

镜像还在（这是 ④-2b 的既定形态）。删之前已确认还剩**两类**消费者，都在动态查找里、
**文本扫描看不见**：

1. `stores/ui.ts:602` 的 `makeEngineForwarder` **回退分支** —— `target[key]` 是动态取值，
   镜像删掉后若 `uiEngineRef` 为 `null`，会走到 `typeof fn !== 'function'` ⇒ **静默返回 undefined**
   （正是本仓反复吃过的静默失效）。要么删掉回退（引擎成为唯一来源），要么让它**响亮地失败**。
2. `stores/__tests__/ui-state.spec.ts:61/63` 的 `UI.setZoom!(2)` —— 用例意图是「引擎写进 store」，
   改写形态应是 `UIEngine.setZoom!.call(UI, 2)`。（其余 `UI.state = 'open'` 等是域槽位，不属镜像。）
   这一处在镜像删掉后会被 `tsc` **点名**（`UIFacadeShape` 已无索引签名），所以它是安全的。

### 七、教训

1. **预期值也要测量**：dry-run 第一次抓到的就是我自己凭印象填错的数（7 vs 5+2）。
2. **机器改写 + 逐行核对 diff**，比 70 次手改可靠 —— 前提是脚本自己会数数、且对不上就停。
3. **改写必须连注释一起改**：这个仓库里注释承担着「上一轮为什么这么做」的记忆，
   代码形态一变，没跟着改的注释就从教训变成了误导。
4. **守卫不能因为「像是防御性代码」就删**：`?.` 这一处要论证，`appendUpdater` 那个反例
   说明随手删真会出事。

## 第 113 轮（2026-09-22）：④-2c 动手**之前**先量 —— 拦路的不是代码，是一条轴的口径

> ④-2b 把 70 处调用点改完了，按理 ④-2c 就是「删掉 21 行镜像」。删之前照例先量一遍：
> `scripts/oneoff/measure-4-2c.mjs`（只读）回答两个问题 —— 谁会因此坏掉、
> 有没有文本扫描看不见的消费者。

### 一、量出来的结论（一句话：`ui-slot-coverage` 会把这次**正确**的删除判成回归）

| 发现 | 数字 |
| --- | --- |
| 21 个镜子里在 store 引用集合里的 | **7**（`setZoom` / `shiftAnchor` / `shiftTarget` / `resizeTarget` / `rotateTarget` / `setControlPoint` / `requestRendering`） |
| 21 个镜子里被 `assignedSlots()` 算作赋值的 | **21**（**包括**那 7 个 —— 镜子本身就是它们的赋值） |
| ⇒ 删镜像后 `storeRefsUnassigned` | **0 → 7** ⚠️ **撞棘轮** |
| 这 7 个是否恰好是 `engineBacked` | **是，7/7** |
| 文本剩下的引用 | 只有 **2 处**，都在 `stores/__tests__/ui-state.spec.ts` |
| 枚举/展开 `UI` 对象的地方 | **0 处** |
| 动态按字符串键取值的 | 只有 `stores/ui.ts` 的 7 个键 |

### 二、为什么这是「仪器跟不上」，而不是「改动有害」

`ui-slot-coverage` 的 `total` = store 引用了、但全仓**没人赋值**的槽位（终态 0）。
而 `assignedSlots()` 把遗留目录里的 `UI.x = …` 也算赋值 —— 镜子一删，那 7 个名字立刻变成
「引用了但没人赋值」。但它们的实现**本来就不在镜子里**：第 ④-2a 步已经让 store 从
**注册进来的 `UIEngine`** 取函数（`makeEngineForwarder`），它们**不再是 UI 槽位依赖**。

更说明问题的是：`legacyOnlyStoreSlots()`（另一条轴）**早就**把 `engineBacked` 排除在外了，
**只有这条轴没跟上**。⇒ ④-2c 的第一步是**口径修正**（`storeRefsUnassigned` 排除 `engineBacked`）
＋ 一条**会自证**的用例；否则那条轴会把一次正确的删除挡下来。

> 这是「**数字有棘轮，判断没有**」（第 110 轮那条教训）的第二次现形：棘轮对**真实状态**敏感，
> 但它对一个**已经变了的口径**不敏感。第 ④-2a 步改了接线，却没有回头改这条轴的判据 ——
> 于是 ④-2c 一动，棘轮就会替一个**过时的判据**说话。

### 三、唯一一处「看着像坑、其实等价」的地方

`stores/ui.ts` 的 `makeEngineForwarder` 有个从 `UI` 镜像取函数的**回退分支**（`target[key]`）。
删镜后它取到 undefined。**但它行为等价，不需要改**：

> `ui-window.ts:6` **静态** import `ui-engine.ts`（它要用镜像）⇒ `uiEngineRef === null`
> （引擎模块未求值）⟹ `ui-window.ts` 未求值 ⟹ **UI 窗口对象根本不存在** ⟹ 那个回退分支
> 本来也取不到任何函数（`typeof fn !== 'function'` → `undefined`）。**两态返回值相同。**

⇒ 保留回退**零风险**；反倒**不该**照直觉把它改成抛错 —— 那是把一个静默 no-op 变成 `TypeError`，
属于**行为变化**。

### 四、教训

1. **「先量后做」这次拦下的不是 bug，是一次假回归。** 若直接删 21 行，`migration:check` 会红在
   `ui-slot-coverage` 上，而现场的直觉多半是「这条轴坏了，改改口径」—— 恰好**方向对了但理由错了**：
   真正的原因是第 ④-2a 步改了接线却**没回头改判据**。⇒ **改接线的时候要问一句：哪条轴的判据
   建立在旧接线上。**
2. **「看着像坑」要论证到底。** 那处回退分支看着正是「删镜后会静默失效」的典型（也是我自己上一轮
   写进清单的判断），量完才发现它**两态等价**。上一轮那句「要么删掉回退，要么让它响亮失败」
   是**没有量就下的结论** —— 与第 111 轮「把三种形态压成一句话」是同一类毛病。
3. 因此 ④-2c 的产物是**三段**而不是一段：口径修正（含自证用例）＋ 删 21 行镜像 ＋ 改 2 行测试。

## 第 114 轮（2026-09-22）：④-2c 落地 —— 21 行镜像退役（103 → 82），口径与前提各修一处

> 上一轮量出「拦路的是口径」；这一轮按「先改口径、再删镜像、最后改测试」的顺序做掉。

### 一、三段产物

1. **口径修正**：`uiSlotCoverage()` 里那行 `.filter()` 抽成导出的
   `unassignedStoreSlots(refs, assigned, engineBacked)`，并把 `engineBacked` 排除掉。
   抽出来是为了**能自证** —— 样本版用例（`refs={a,b,c}`、`assigned={a}`、`engineBacked=[b]`
   ⇒ 只有 `c` 算缺口）在真实仓库里立刻可验：
   **自证实测**：去掉那条排除 ⇒ 红在「期望 `["c"]`，实际 `["b","c"]`」；还原 ⇒ 绿。
2. **删镜像**：`ui-window.ts` 里 21 行 `UI.x = UIEngine.x` 退役。
3. **改测试**：`ui-state.spec.ts` 的 2 行 `UI.setZoom!(2)` → `UIEngine.setZoom!.call(UI, 2)`，
   用例名也从「legacy 写入经 store 生效」改成「引擎写入经 store 生效」（名字得跟事实走）。

### 二、⚠️ 删掉一个 import，可能是删掉一条**不变式**（本轮最该记的一条）

删镜像后 `tsc` 立刻报 `ui-window.ts(6,1): TS6133: 'UIEngine' is declared but its value is never read`。
**照直觉就该删掉那行 import** —— 但那是错的：上一轮（第 113 轮）论证 store 回退分支
「两态等价、不必改」时，用的前提正是**「`ui-window.ts` 静态 import `ui-engine.ts`」**
⇒ 读 UI 必先求值 UIEngine ⇒ `uiEngineRef === null` 时 UI 窗口对象根本不存在。

删掉它，静态依赖就断了（引擎只剩 `uiWindowReady` 里那条**动态**的 `import('./register.ts')` 链），
于是可能出现「**UI 对象已存在、但 `uiEngineRef` 还是 null**」的窗口 —— 而 store 的 7 个引擎转发
在那状态下会**静默返回 undefined**（回退分支取不到任何函数）。

处置：把具名 import 换成**副作用 import**（`import '@app/engine/ui/ui-engine.ts';`）+ 写清理由，
把那条不变式**显式**保住。

> **`tsc` 只能看到「未使用」，看不到「承重」。** 删 import 之前要问：它是被代码用的，
> 还是被**求值顺序**用的？后者编译器不会报，删了也不会红 —— 直到某个时序窗口里静默失效。

### 三、自测里又一条前提随 ④-2c 死掉了（这次是门禁抓对了）

`遗留层还在 ⟹ 与目录无关的挂载点轴非 0` 那条例外里，① 的原判据是
「**遗留目录里仍有 `UI.x =` 挂载**」。删完镜像后它报红：

```txt
遗留目录里还有对象字面量与挂载点；与目录无关的 ui-singleton-members 口径却读到 0 ⇒ 它也瞎了
```

**不是仪器坏，是里程碑**：实测——那 21 行镜像**正是遗留目录里最后一批直接挂载**。
删完之后：

- 遗留目录里**一条直接的 `UI.<name> =` 都没有了**（剩下的是 store 桥
  `Object.defineProperty(UI, key, …)` 与嵌套挂载 `UI.list.copy = null` 这类，两者都不在本轴口径里）；
- 全仓 82 处挂载**全部**位于 `engine/ui/` 的域模块。

⇒ 判据换成正向信号「**单例本体仍在这里**」（桥安装 + 嵌套挂载二者都要能读到），
并保留一条**与目录无关**的全局读数 `> 0`。要守的东西没变：**不能因为仪器瞎了而把「已搬完」读成 0**。

### 四、验证与账

| 项 | 结果 |
| --- | --- |
| `ui-singleton-members` | **103 → 82**（files 9 → 8；基线已固化） |
| `legacy-ui-lines` | **316 → 302**（21 行镜像 −，副作用 import 的理由注释 +5） |
| `ui-slot-coverage` | `total` **0 → 0**（口径改对了）；`assigned` 153 → 132 |
| 其余 13 条轴 | 持平 |
| `migration:selftest` | **55/55**（新增 2 例；其中一条原判据按上面所述改写） |
| `tsc` / `typecheck:vue` / `lint` / `format:check` / `docs:check` / `text:check` | 0 · 0 新增 · 0-0（1632 文件）· 0 · OK · 0 |
| editor 全套 | **254 文件 / 2069 用例全绿、exit 0**（镜像已不在，套件仍全绿 ⇒ store 的引擎转发确实不再经过镜像） |

### 五、剩下什么

- **④-3**：逐域把域模块的 `UI.x = …`（现 82 处 / 8 文件）改为 facade 装配，每域一次。
- **④-4**：退役对象字面量、删 `ui-window.ts` / `register.ts` ⇒ `ui-singleton-members` 与
  `legacy-ui-lines` **同时归零**。
- 另有 `UINodeShape` 的 ②（14 处 `matrix`/`parent` 可空解引用）与 ③（`instances` 的真实类型）——
  前者是**行为问题、要实机判定**，后者要先弄清真实对象。

### 六、教训

1. **删 import 之前问一句「它是被代码用的，还是被求值顺序用的」。** 后者 `tsc` 不报、删了不红，
   直到某个时序窗口静默失效（本轮差点就这么干了，靠上一轮写下的论证拦住）。
2. **门禁报红时要先分辨「仪器坏了」还是「前提死了」。** 本轮两条都是**前提死了**：
   一条是轴的口径（第 113 轮量出），一条是自测用例的判据（本轮撞上）。
   分辨方法是一样的：**把「它要守什么」与「它怎么写」分开** —— 守的东西还在，就换写法，别删用例。
3. **改口径要连用例一起给。** 抽 `unassignedStoreSlots()` 出来，是为了让这条判据**在镜像还在时**
   就能自证；否则它要等 ④-2c 落地后才第一次咬人 —— 而那正是最不该才发现判据写错的时候。

## 第 115 轮（2026-09-22）：④-3 动手前先量 —— 82 处挂载里只有 **10 处**有测试信号，且字面量其实是张「占位表」

> ④-2c 让 103 → 82，下一步就是 ④-3（逐域把 `UI.x = …` 改成 facade 装配）。
> 照例先量：`scripts/oneoff/measure-4-3.mjs`（只读）。

### 一、工作单的分布与「被 spec 直接引用」情况

| 域模块 | 挂载 | 被 spec 直接引用 |
| --- | ---: | ---: |
| `ui-events.ts` | 21 | **0** |
| `ui-transform.ts` | 18 | 2 |
| `ui-file.ts` | 15 | **0** |
| `ui-list.ts` | 10 | 1 |
| `ui-pointer.ts` | 8 | **0** |
| `ui-slots.ts` | 6 | **6**（100%） |
| `ui-prefab.ts` | 3 | **0** |
| `ui-initialize.ts` | 1 | **1**（100%） |
| **合计** | **82** | **10（12%）** |

### 二、结论一：④-3 的改动面里 **88% 没有任何测试信号**

三条独立证据（都来自脚本，不是印象）：

1. 82 个挂载函数里只有 **10** 个被任何 `*.spec.ts` 以 `UI.<name>` / `this.<name>` 引用过。
2. spec 里出现的 `UI.<name>` **绝大多数是状态/桥成员**（`meta` `state` `target` `zoom` `hover`
   `width` `height` `list` `mode`）与元素类（`Root` `Text` `Image` `Container`）——
   **不是**这 82 个挂载函数。
3. 另有 **5 个 spec 干脆 `vi.mock` 掉整个 `legacy/ui-window`**
   （`animation` / `scene` / `ui` / `webgl` / `printer-draw`）⇒ 它们**故意不碰**这个单例。

耦合也重（同一脚本量出）：单模块 `this.` 读最多 **71** 处（`ui-file`）、`this.` 写最多 16 处
（`ui-initialize`）、模块内 `UI.*` 交叉引用最多 **54** 处（`ui-list`），还有 **1 处链式赋值**
（`uiElClasses.createElement = UI.createElement = …`，`ui-prefab.ts:48`）。

⇒ ④-3 的失效模式（`this` 绑错 / 就绪时序 / 处理器不触发）**恰好落在套件看不见的地方**。
这与第 110 轮那条「`primeWindows` 盲区已被修正」**不是同一件事**：那条是「仪器读错了路径」，
这条是「这 72 个成员本来就没被测过」。前者能靠加用例解决，后者只能靠真机走查。

### 三、结论二：④-4 不是机械活 —— 字面量是一张**占位表（vtable）**

读了 `ui-window.ts:104`–`240`：那 134 个槽位里绝大多数是

```ts
initialize: null, open: null, load: null, save: null, close: null, … setZoom: null, …
```

——**给域模块「先声明、后填充」的占位**（外加 `105`–`111` 行的几个 DOM 元素引用）。

⇒ ④-4「退役对象字面量」的真实含义不是「删一个对象」，而是
**把这 134 个占位换成有类型的 facade**，成员由各域的成员对象 + store 桥装配而成。
这也解释了台账为什么坚持 `declared`（134）与挂载点（82）**必须同时归零**：
占位表一天不拆，成员就一天没有真正的**类型归属**。

### 四、结论三：④-4 的接线面**很小**（这是好消息）

外部取 `UI` 对象的非测试点只有 **3 处**：

- `stores/ui.ts:31` —— `loadUI` 里的 inline `import(...)`，取 `m.UI`；
- `LayoutPanel.vue:1382` —— 惰加载代理的 loader；
- `file-system-core.ts:16` —— 同上。

另加 `window-cluster.ts:47`（只要 `uiWindowReady`，不要 `UI`）。其余引用全是 8 个域模块自己的
相对 import。⇒ **换成一个 facade 对象，不需要动多少调用方**；难的是那 134 个占位与 72 个无信号的成员。

### 五、建议的执行顺序（按「有信号 → 无信号」排）

| 次序 | 域 | 挂载 | 信号 | 做完之后 |
| ---: | --- | ---: | --- | --- |
| 1 | `ui-slots` | 6 | 6/6 | 套件可兜底 |
| 2 | `ui-initialize` | 1 | 1/1 | 套件可兜底（但它是 DOM/定时器引导，`this` 63 读 / 16 写） |
| 3 | `ui-list` | 10 | 1/10 | **需真机** |
| 4 | `ui-transform` | 18 | 2/18 | **需真机** |
| 5 | `ui-prefab` | 3 | 0/3 | **需真机**（含那 1 处链式赋值） |
| 6 | `ui-pointer` | 8 | 0/8 | **需真机** |
| 7 | `ui-file` | 15 | 0/15 | **需真机**（`this` 71 读 / 13 写） |
| 8 | `ui-events` | 21 | 0/21 | **需真机**（最大一域） |

并且建议**先**跑一遍那 9 项实机回归清单、建立 known-good 基线再动第 3 步以后的任何一域：
本会话至今**从未启动过真机**，现在没有任何「改之前是好的」的证据；没有基线，
④-3 之后的任何异常都**无法归因**（是这次改坏的，还是本来就这样）。

### 六、结论四：⚠️ ④-3 的轴信号**可以靠改写法白拿** —— 定义需要先收紧

`ui-singleton-members` 数的是 `UI.<name> =` 这个**文本**。实测四种写法（`countCodeMatches` +
`UI_SINGLETON_RE`，样本各一行）：

| 写法 | 命中 |
| --- | ---: |
| 现在域模块里的 `UI.hasPrefab = function (…) {}` | **1** |
| `Object.assign(UI, { hasPrefab(…) {} })` | **0** |
| `for (const [k, v] of Object.entries(members)) UI[k] = v;` | **0** |
| `Object.defineProperty(UI, 'hasPrefab', { value: fn })` | **0** |

⇒ **把 82 行挂载改写成成员对象 + 一次 `Object.assign`，这条轴就会读到 0，
而所有权一点没变**（还是同一个遗留对象在装配、域模块还是 `import { UI }` 去改它）。
这正是台账自己写过的规矩：「**度量只应对真实状态敏感，不该对写法敏感**」
（它当年就是因为 `legacyOnly` 对写法敏感才把它删掉的）。

所以 ④-3 在动手前必须先把**「什么才算这一域搬完了」**说清楚。两条路：

- **(a) 只认轴**：接受「成员搬进成员对象 + 集中装配」为完成 —— 好处是简单，坏处是上面那条白拿路径敞着，
  棘轮会为一次纯改写报喜。
- **(b) 轴 + 一条对「真实依赖」敏感的伴随判据**（本轮提议，尚未实现）：
  「域模块是否还静态 `import { UI }` 去改单例」。真正的 facade 装配里，域模块应当只**提供**成员、
  不再依赖单例对象本身。实测今天 **8/8 个域模块**都还 `import { UI } from './legacy/ui-window.ts'`
  ⇒ 这条判据的起点是 8、终态 0，且**改写法拿不到**它（成员对象不需要那个 import）。
  代价：多一条轴 + 一条自证用例。

> 建议按 (b) 走：本仓已有「一条轴可以被便宜的写法满足」的教训（`legacyOnly`、以及
> `unknown-casts` 那批「早就多余只是忘了删」的断言），值得多花一条判据把 ④-3 钉在真实状态上。
> 但这是**设计决定**，应当和 ④-3 的定义一起定下来，而不是由我在这轮里顺手加一条轴。

### 七、教训

1. **「先量后做」第三次拦下东西** —— 这次拦下的既不是假回归、也不是写法错误，而是
   **一个不该盲目开始的大步**。
2. 该量的判据是：**改动面里有多少被任何用例直接引用过**。这个数 30 秒就能算出来，
   却能决定「这一步能不能靠套件兜住」。本仓 `--json --axis` 与 spec 扫描都已具备，
   缺的只是把两者对起来（`measure-4-3.mjs` 做的就是这件事）。
3. **「需要真机」这个判断也要分层**：第 110 轮证明「接线可由 CI 验收」，
   本轮证明「**这 72 个成员连接线都没被测过**」。两句话不矛盾，但结论完全不同 ——
   前者说「真机是锦上添花」，后者说「真机是唯一信号」。

## 第 116 轮（2026-09-22）：P4 剩余 67 处**逐处判了一遍** —— 62 处承重，只有 5 处多余（已清 4 处）

> ④-3 在等一个设计决定，于是先啃计划里**不需要真机**的那批：`unknown-casts`（P4）。
> 照例先量 —— 这一次量的是「哪些断言已经是多余的」。

### 一、方法：一次 `tsc` 就能判完 67 处

判据：把 `expr as unknown as T` 降成 `expr as T`，若 `tsc` 仍然过 ⇒ 那个 `unknown` 跳板是**多余**的。

关键在于**每处的类型判定是局部且独立的**（`TS2352` 会落在该处所在行），所以可以
**一次性把 67 处全部降级、只跑一次 `tsc`**，再按行号把判决收回来 —— 不必跑 67 次。
实验脚本：`scripts/oneoff/probe-p4-dead-casts.mjs`（`--apply` 改写，判完 `git checkout -- .` 还原；
它同时报告「原始文本 130 处 vs 真实代码 67 处」—— 差的 63 处全在注释/字符串里，台账不数它们）。

判决：**58 处报 `TS2352`（承重）**，9 处看起来干净。

### 二、⚠️ 9 处「干净」里有 **4 处是假阳性** —— 多行表达式的报错落在**表达式起点行**

| 站点所在行 | `tsc` 报错所在行 | 事实 |
| --- | --- | --- |
| `engine/ui/ui-transform.ts:326` | **323** | `const node = find({ … } as unknown as UINodeShape)` 跨 4 行 |
| `inspector/file-entity-page.ts:39` | **30** | 对象字面量跨 10 行 |
| `module/eslints.ts:173` | **170** | `Object.assign(…) as unknown as …` 跨 4 行 |
| `ui-kit/src/utils/history.ts:26` | **21** | `new Timer({ … }) as unknown as …` 跨 6 行 |

⇒ **用行号把报错映射回站点时，必须容忍「同一个表达式跨多行」**，否则会把承重的断言当成多余的删掉。
这是批量判定法的固有风险，写下来给下一次用同一招的人。

### 三、真正多余的 5 处，清掉 4 处（`unknown-casts` 67 → 63）

| 站点 | 处置 |
| --- | --- |
| `commands/command-tip.ts:302` | ✅ 去掉跳板（`CommandTargetShape` 与 `HTMLElement` 可比） |
| `enum/enum-window.ts:144` | ✅ 去掉跳板 |
| `module/eslints.ts:62` | ✅ 去掉跳板 |
| `scene/scene-window.ts:990` | ✅ 去掉跳板，**并改掉注释里那句假声明**（见下） |
| `commands/custom-command-window.ts:227` | ⏸ **留着**：该行上方 223–226 有明确的「归到 P3 的 `any` 别名批次去处理，**不在 P4 里硬做**」决策记录 —— 尊重它，不为 1 个读数去动它 |

`scene-window.ts` 那条注释原文写着「**这是本文件里唯一真正需要 `unknown` 的地方**」。
**实测不成立**：对**未约束**的类型参数 `T`，`[] as T` 本身就通过（`TS2352` 只在两边类型不可比时报），
所以那个跳板多余。已去掉并就地更正注释 —— 与第 110/113 轮同一类问题：**注释里的「必须」也要被量过。**

### 四、为什么「单次 `as`」比「`as unknown as`」好（所以这不是在刷指标）

`as unknown as T` 会把「两边类型是否**可比**」这条检查**一并绕掉**（TS 只对双重断言放行），
而单次 `as T` 要求 `tsc` 认为两边可比 ⇒ 改动**被编译器真的检查过**。
这也正是 P4 的定义：这条轴数的是**双重**断言，单次断言是正常、可复核的写法。

### 五、剩下 63 处的性质（给下一轮的结论）

全部是 `TS2352`（两边类型不可比）—— 也就是 `unknown` 跳板在**做实事**：
`YamiElement`→`HTMLElement`、`string`→`Uint8Array`、`SceneLight`→`LightData`、
`never[]`→带游标数组、`SelectBoxApi`→`HTMLElement & …` 等等。

⇒ **「不要再按剩下的都难估算」这句话本身也该被量过。** 第 106 轮清掉 17 处「早就多余」的之后，
剩下的确实是硬骨头（本轮实测 **62/67 承重**）。要再动它们，只能改**类型设计** ——
即计划里已列的三类：interface→索引签名、类与接口漂移、payload 判别字段。

### 六、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **67 → 63**（files 55 → 52；基线已固化） |
| 其余 15 条轴 | 持平 |
| `tsc` / `typecheck:vue` | 0 / 0 新增 |
| `migration:selftest` / `lint` / `format:check` / `docs:check` / `text:check` | 55/55 · 0-0 · 0 · OK · 0 |
| editor 全套 | **未跑** —— 依据：逐行核对 `git diff -U0`，改动只有**被擦除的断言**（`as unknown as X` → `as X`）与注释，没有一条运行期语句 |

### 七、教训

1. **「逐处判」不必逐处跑。** 只要判定**局部独立**，就能一次性改完、只跑一次、再按行号收回判决。
2. **但「收回判决」这一步会引入新错误**：多行表达式让行号错位，9 个「干净」里有 4 个是假的。
   批量法的风险不在改，而在**读结果**。
3. **有明确决策记录的站点不要动。** `custom-command-window.ts:227` 少减 1 个读数，但保住了一条
   「为什么现在不做」的信息 —— 上一轮刚吃过「前提死了要分辨」的教训，这里同理。
4. **注释里的「必须」也要量。** 本轮第三处 `unknown` 是被一句「这里必须绕」保住的，
   而实测它根本不用绕。

## 第 117 轮（2026-09-22）：查 `UINodeShape` ③ 时揪出一个**真崩溃** —— `instances.remove` 从来不存在

> 原计划：④-3 在等设计决定，于是啃 `UINodeShape` ③「补全 `instances` 的真实类型」。
> 结果前提先被证伪，而真正的问题比「类型不全」严重得多。

### 一、③ 的前提被证伪：那处 `set` 不是调用，是**调试探测**

计划写「`UIInstanceList` 上没有 `set`」。实测全仓 `.instances` 上用到的方法：

| 方法 | 次数 |
| --- | ---: |
| `setProperty` | 50 |
| `resize` | 10 |
| **`set`** | **2** |
| `length` / `map` / `push` / `remove` | 各 1 |

那 2 处 `set` 都在 `ui-engine.ts:155`–`156`，属于 `[DEBUG-instances]` 诊断块里
**探测运行期形状**的读取（`typeof instances.set` / `instances.set?.name`），**不是调用**。
⇒ 「没有 `set`」是把那行诊断读成了调用。真正缺的是 **`remove`**。

### 二、`remove` 是一处**真崩溃**，被两层东西同时掩盖

- `element-base.ts:209` 的 `destroy()` 里写着 `node.instances.remove(this)`；
- 运行期 `node.instances` 是 `new UIInstanceList()`，而那个类只有 `setProperty` / `resize`；
- `element-base.ts:16` 把 `instances` **声明**成 `{ remove: (element: unknown) => void }`
  —— **类型在说谎**，于是 `tsc` 认为方法一定存在；
- 既有用例 `new Container()` **不带 node**，`destroy()` 在 `if (!node) return;` 就返回了；
  而真实路径（`ui-transform.ts` 的 `deleteElement` → `target.instance.destroy()`、
  `ui-file.ts` 的 `context.editor.root!.destroy()`）**一定带 node**。

**实测复现**（先写用例、确认它红）：

```txt
TypeError: node.instances.remove is not a function
  209|   node.instances.remove(this);
```

### 三、修法与先例

给 `UIInstanceList` 补 `remove(element)`，实现**委托**给 `@app/utils/array` 的同名自由函数
（避免同一个 `indexOf` + `splice` 写两遍）。这不是新花样 —— 本仓 `timer.ts:102` 早就是这个形态：

```ts
remove() {
	remove(Timer.timers, this);
	return this;
}
```

新用例放在既有 `ui.spec.ts` 的 `UI.Container` 下：造一个**带 node** 的元素、把它 push 进
`instances`、调 `destroy()`，断言它已被摘掉。**修前红、修后绿**（`ui.spec.ts` 15/15）。

### 四、同类扫了一遍：没有第二处

全仓 `.remove(` 调用点逐个看过：绝大多数是 DOM（`classList.remove` / `Element.remove`）
或 `Timer.remove`（已定义）；`element-page.ts:120` 那四处是**注释**；
`animation-motion.ts:1095` / `event-editor-commands.ts:170` 的 `nodes[i].remove()` 是 DOM 节点。
⇒ 这一类只有 `instances` 一处。

### 五、⚠️ 顺带更正：索引签名退役的真实代价是 **79 处 / ~20 字段 / 11 文件**

把 `element-classes.ts:105` 的 `[k: string]: any` 去掉实测：**79 处 `TS2339`**、11 个文件、
约 20 个字段 —— `presetId` `instances` `transform` `instance` `name` `synchronous` `destroy`
`parent` `enabled` `visible` `node` `isPointIn` `appendChild` `shadowText` `printer` `_font`
`font` `updateTextContent` `updatePrinter` `content` `update`。

**为什么计划里只有「6 字段 / 27 处 / 5 文件」**：第 108 轮量的是 **`stores/ui.ts` 那份局部
`UINodeShape`**，而第 109 轮把两份**合并成了一处共享声明** —— 同一个索引签名从此同时承重
所有域模块。两条结论：

1. 计划里 ②/③ 的底数要按 **79 处**重估（不是 6 字段）；
2. 那 20 个字段里约 **7 个是元素专有**的（`printer` `_font` `font` `content` `updateTextContent`
   `updatePrinter` `shadowText` 属文本元素；`visible` / `node` / `isPointIn` 属 hover 对象）。
   把它们**全部**堆到共享的 `UINodeShape` 上，等于把索引签名**换个写法保留下来** ——
   真正的解法是**用法处收窄/分型**，而不是列一张 21 项的表。这条已写进 PHASE-1C。

### 六、教训

1. **「补一个类型」的任务，先去问那个方法运行期到底存不存在。** 本轮的入口是类型，
   出口是一个崩溃；如果直接照计划「补全类型」，就会给一个不存在的方法写上漂亮的签名 ——
   把谎言从「索引签名」升级成「具名字段」。
2. **类型在说谎时，`tsc` 的沉默不是证据。** `element-base.ts:16` 与 `element-page.ts:64`
   描述的是同一个对象的不同子集（一个只写 `remove`，一个只写 `setProperty`/`resize`）——
   两处都「对」，合起来却是错的。
3. **既有用例不红，可能只是因为它没走到那一行。** `new Container()` 不带 node ⇒
   `destroy()` 提前返回。补用例时**必须构造真实路径的前置状态**（这里就是「带 node」），
   否则新用例会复制旧用例的盲区。

## 第 118 轮（2026-09-22）：合并两份「各写一半」的类型 —— 两处 `as unknown as` **整条消失**（63 → 61）

> 计划里点名过这一处，但只写了一句判断：「`text-element.ts` 2（`printer.images` 有两个
> **互补而非同形**的本地接口：`ImageElementShape` vs `EmbeddedImageShape` —— 要合并成一份具名形状，
> 属设计改动）」。本轮把它做掉，并顺手验证了那句判断对不对。

### 一、判断是对的，而且比它写的更清楚

两个接口描述的是**同一个运行期对象**（`printer.ts` 里 `new uiElClasses.Image!(…)` 造出来的图片元素），
但各写了一个**子集**：

| 出处 | 写了哪些成员 |
| --- | --- |
| `printer/printer.ts` 的 `ImageElementShape` | `image` `display` `clip` `destroy`（+ `startX` `startY` `transform`） |
| `engine/ui/text-element.ts` 的 `EmbeddedImageShape` | `parent` `connected` `draw` `resize`（+ 同三个公共字段） |

两处**各自都对**，但谁也看不见另一半 ⇒ 读侧只能 `as unknown as` **跳到对方的名字上**
（`text-element.ts:402` 要 `draw()`、`:452` 要 `resize()`/`parent`/`connected`）。

### 二、合并成一份具名形状，放在 `element-classes.ts`

新增 `UIImageElementShape`（`UIElementInstance` / `UIElementTransform` 的同一个家）。
选这里的理由：两个文件**本来就都** import 这个模块（`printer.ts:7`、`text-element.ts:5`）
⇒ **零新增依赖边**；而且「UI 元素实例的形状」本来就该和 `UIElementInstance` 放在一起。

**刻意不写成 `extends UIElementInstance`** —— 那个接口带 `[k: string]: any`，
继承它等于把这些成员的检查全部交还给索引签名。那只是**把索引签名换个名字保留**，
正是本仓反复记的那种「指标好看、真实状态没变」。合并后的成员全是具名的，拼错键会当场报错。

### 三、结果：两处断言**整条消失**，不是缩短

| 位置 | 之前 | 之后 |
| --- | --- | --- |
| `text-element.ts`（draw 循环） | `…images as unknown as EmbeddedImageShape[]` | `…images` |
| `text-element.ts`（resize 循环） | `…images as unknown as EmbeddedImageShape[] & { changed: boolean }` | `…images` |

之所以能整条删掉：`printer.images` 的**声明**与读侧现在是**同一个类型**
（`UIImageElementShape[] & { changed?: boolean }`），`changed` 的读/写对可选布尔都成立。
⇒ 这是「合并类型」相对「缩短断言」的本质差别：**缩短只是换写法，合并是把事实对齐。**

> 顺带一个自证信号：删完之后 `tsc` 报 `text-element.ts` 的 `UIImageElementShape`
> **未被使用**（`TS6133`）——正好证明那两处是**彻底**不需要它了，而不是还在偷偷引用。

### 四、账与验证

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **63 → 61**（files 52 → 51；基线已固化） |
| 其余 15 条轴 | 持平 |
| `tsc` / `typecheck:vue` | 0 / 0 新增 |
| 受影响 spec（`src/printer` + `ui.spec.ts`） | 2 文件 / 18 用例全绿 |
| editor 全套 | **未跑** —— 依据：逐行核对 `git diff -U0`，改动只有**接口声明**、**类型标注**与**被擦除的断言**，没有一条运行期语句（产出的 JS 不变） |

### 五、教训

1. **「两份各写一半的类型」是索引签名的另一种形态。** 它们互相看不见，于是读侧只能用
   `as unknown as` **跨过去**。识别信号很具体：**断言的来源类型与目标类型，是同一个运行期
   对象的两个子集**（而不是「类型写错了」或「类型不兼容」）。
2. **合并 vs 缩短，判别标准是「声明与读侧是不是同一个类型」。** 能合并到这一步，断言就**整条**
   没了；只是把 `as unknown as T` 降成 `as T`，说明事实还没对齐。
3. **合并时不要顺手继承带索引签名的基类型。** 那会把刚赢来的具名检查立刻还回去 ——
   与第 111 轮那条「别为了好看牺牲检查」同源。

## 第 119 轮（2026-09-22）：按**形态**重盘 P4 —— 用自家手法库第 4 条一次清掉 3 处（61 → 58）

> 上一轮找到的判别信号只解决了一处。这一轮先**按形态**把剩下 61 处盘一遍，
> 结果发现有一族完全是本仓**手法库第 4 条**的教科书案例。

### 一、先盘点：按「目标类型是不是本文件里的局部类型」分类

脚本 `scripts/oneoff/measure-p4-shapes.mjs`（只读）。61 处的分布：

| 类 | 判据 | 处数 |
| --- | --- | ---: |
| **A** | 目标类型是**本文件里声明的** `interface` / `type` | **17** |
| **B** | 目标类型是别处的具名类型 | 30 |
| **C** | 目标是匿名/字面量/交叉/泛型（`Record<…>`、`never[]`、`ConstructorParameters<…>`…） | 14 |

A 类最值得先看：它正是第 118 轮那种「两处各写一半」的高发区。

### 二、A 类里有一族一眼可认：**空数组 + 游标字段**

```ts
let elements = [] as unknown as ListItem[] & ListData;
elements.versionId = 0;
elements.count = 0;
elements.start = -1;
elements.end = -1;
elements.head = null;
elements.foot = null;
```

——**断言完紧接着写字段**。这正是本仓**手法库第 4 条**点名要换的形态：
「换 `Object.assign([], {...})`，**零断言**」。本轮把 ui-kit 里这样写的 3 处按它改掉：

| 文件 | 之前 | 之后 |
| --- | --- | --- |
| `basic/YMCommonList/YMCommonList.vue:46` | `[] as unknown as ListItem[] & ListData` + 6 行赋值 | `const elements: ListItem[] & ListData = Object.assign([], {…6 个字段…})` |
| `basic/YMSelectList/select-list-api.ts:114` | `[] as unknown as SelectListApi['elements']` + 6 行 | `box.elements = Object.assign([], {…})` |
| `business/YMFileNavPane/YMFileNavPane.vue:760` | `[] as unknown as FolderElements` + 6 行 | `elements = Object.assign([], {…})` |

### 三、为什么这是「真的清了」而不是「换个写法」

1. **断言整条消失**（不是 `as unknown as` → `as`）；
2. **行为逐字等价**：`[]` 再写 6 个属性 ⇔ `Object.assign([], {6 个字段})` —— 新数组、同属性、同值；
3. **检查反而变强了**：以前是 6 行赋值**各自**只检查一个字段；现在
   `const elements: ListItem[] & ListData = Object.assign([], {…})` 让 `tsc` 检查
   **`Object.assign` 的返回类型是否真的满足那个交叉类型**（少一个字段会立刻报错）。

### 四、账与验证

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **61 → 58**（files 51 → 49；基线已固化） |
| 形态分布变化 | A 17 → **14**；B 30、C 14 未动（总数 61 → 58） |
| 其余 15 条轴 | 持平 |
| `tsc`（editor） | 0 |
| `vue-tsc`（**ui-kit 的 `build:types`**，即 CI 里那一步） | 0 |
| `lint` / `format:check` / `docs:check` / `text:check` / `migration:selftest` | 0-0（1635 文件）· 0 · OK · 0 · 55/55 |
| **ui-kit 套件** | **115 文件 / 811 用例全绿** |
| editor 套件 | **254 文件 / 2070 用例全绿**（改动落在 ui-kit 且是运行期语句 ⇒ 两个套件都跑了） |

> ⚠️ **顺带查实一件事：ui-kit 的 115 个 spec 不在 editor 套件里。**
> 根 `package.json` **没有** `test` 脚本；只有 CI 的 `pnpm -F @yami/ui-kit test` 那一步会跑它们。
> ⇒ 以后再动 `packages/ui-kit/`，**必须显式跑那个套件**，否则「套件全绿」是假的。
> （这一点在 PHASE-1C 里也补了一句。）

### 五、教训

1. **手法库是要被用的，不是要被读的。** 第 4 条早就写好了，而这一族正是它的教科书案例 ——
   说明前几轮的盘点只按「难不难」找，没按**形态**找。**盘点口径本身就是一种工具。**
2. **分类口径决定能不能一次清一批。** 按「目标类型是不是局部类型」分类，A 类里立刻露出一族
   形状完全相同的站点；按文件或按难度看，它们散在 3 个文件里、根本不像一族。
3. **改 ui-kit 必须跑 ui-kit 的套件**（本轮差点漏掉）：editor 套件全绿证明不了组件库没事，
   而组件库有 **811 个用例**在等着被跑。

## 第 120 轮（2026-09-22）：同一族再清 3 处（58 → 55），并查实一处「声明后安装」**不是** bug

> 上一轮按形态找到「空数组 + 游标字段」这一族、清了 3 处。这一轮把这一族的**落伍者**扫干净。

### 一、本轮的三个站点

| 文件 | 之前 | 之后 |
| --- | --- | --- |
| `YMParamList.vue:207` | `elements: [] as unknown as ParamElements,` | `elements: Object.assign([], {…6 个游标字段…}),` |
| `YMParamList.vue:208` | `selections: [] as unknown as ParamSelections,` | `selections: Object.assign([], { count: 0 }),` |
| `YMFileBodyPane.vue:1988` | `elements = [] as unknown as typeof elements;` + 4 行赋值 | `elements = Object.assign([], {…4 个字段…});` |

`YMParamList` 那两处特别值得记：**同一个文件里早就有正确的写法** —— `onMounted` 里（第 84 轮改过）
已经是 `self.elements = Object.assign([], {…})`，只有**初始 state 的字面量**还留着旧断言。
⇒ 这是「**同一个事实在同一个文件里说了两遍，其中一遍是旧的**」。
修法就是把初始值也写成同形，连注释都能沿用第 84 轮那条。

**行为不变的依据**（不是「看起来没事」）：`onMounted` 随后会用同形的 `Object.assign` 覆盖它；
模板里不引用 `elements` / `selections`（实测：全文件只有接口声明与脚本里的方法读它们）；
唯一差别是「挂载前若有人读 `state.elements.count`」——以前 `undefined`、现在 `0`，而全仓没有这样的读点。

### 二、查实一处「看着像 bug、其实不是」

`tools/window-object.ts:59` 也是 `[] as unknown as HTMLElement[] & { append(…); remove(…) }`，
而且**后面没有字段赋值** —— 形态上与第 117 轮那个真崩溃（`instances.remove`）**一模一样**。

查证：该文件 `:428` 起在**模块顶层**逐个 `Object.defineProperty(frames, 'append' | 'remove', …)`
（`:461` / `:487`）把两个方法真装了上去 ⇒ **断言是诚实的**，本轮不动它。

> 这正是第 117 轮那条教训的**反面用法**：形态可疑 ⇒ **必须去查「那个成员到底有没有被装上」**，
> 而不是照着形态直接判死刑。查完两种结果都要写下来 —— 否则下一个人会把同一处再查一遍。

### 三、这个家族的另一半事实：`Object.assign([], …)` 写法**早就存在**

全仓本来就有 4 处：`particle-engine.ts:374`/`375`、`scene-window.ts:1003`、`command-api.ts:3249`/`3257`。
⇒ 上一轮那 3 处 + 本轮这 3 处，是**同一族里的落伍者**，不是新发明。
**家族盘点 = 先找到「同族里已经修好的样本」，再逐个对齐** —— 比逐个重新设计又快又稳。

### 四、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **58 → 55**（files 49 → 47；基线已固化） |
| 其余 15 条轴 | 持平 |
| `tsc`（editor） / `vue-tsc`（ui-kit `build:types`） | 0 / 0 |
| `lint` / `format:check` / `docs:check` / `text:check` / `migration:selftest` | 0-0（1635 文件）· 0 · OK · 0 · 55/55 |
| ui-kit 套件 / editor 套件 | **115 文件 / 811 用例** · **254 文件 / 2070 用例**（改动落在 ui-kit 且是运行期语句 ⇒ 两个都跑） |

### 五、教训

1. **「同文件里已有一处对的写法」是最好的修复模板。** `YMParamList` 的初始 state 之所以是落伍者，
   正是因为第 84 轮只改了 `onMounted` 那一处 —— **改一处时要问「同一事实还有几处写法」**。
2. **形态可疑 ⇒ 查证据，别照着形态判。** `window-object.ts` 差点被当成第二个 `instances.remove`：
   两者的**形状**一样，**事实**相反（一个有安装、一个没有）。判别动作只有一个：去 grep 那个成员有没有被装上。
3. **家族盘点要找「已修好的样本」。** 本轮三处全部照抄同族的既有写法，改动小、不需要新设计。

## 第 121 轮（2026-09-22）：断言在替一个**从不存在的必填字段**背书 —— 又清 1 处（55 → 54）

> 入口是「新建后装饰」这一族里唯一的生产站点。它需要的不是「把断言写短」，而是
> **先把类型里的一个谎言删掉**。

### 一、现场

```ts
element = document.createElement('div') as unknown as FolderElement;
addClass(element, 'file-nav-item');
element.file = file;
element.context = context;
```

按手法库第 4 条看，`file` / `context` 紧接着就写 ⇒ 本该能一次成型。那为什么原本需要 `unknown` 跳板？

### 二、答案：类型里有个**从不存在的必填字段**

`FolderElement = HTMLElement & { file; context; indent: number; … }`，而 `indent` 是
**P4b「字段搬进元素数据（WeakMap）」之后没跟着删掉的残留**：

- 全文件对 `indent` 的访问**只有** `data.indent`（写于 `:297`、读于 `:345`）；
- 元素上的 `el.indent` **从来没有被写过**。

⇒ 类型在说谎（说 `el.indent` 是 `number`，实际读出来是 `undefined`），
而**那个必填字段正是断言存在的理由** —— 断言在替谎言背书。

### 三、修法：先删谎言，再删断言

1. 删掉 `indent: number`（把「为什么它该删」写在声明处，免得被当成误删加回来）；
2. `createFolderElement` 改成 `Object.assign(document.createElement('div'), { file, context })`
   ⇒ **零断言**（`file` / `context` 是仅剩的必填成员）。

`changed` / `expanded` 等**可选**字段同理住在元素数据里，但它们不必填、不挡构造，本轮不动
（留给 P4b 的收尾）。

### 四、同形态站点逐个查事实：3 个里只有 1 个该改

| 站点 | 事实 | 处置 |
| --- | --- | --- |
| `YMFileNavPane.vue:285` | `file`/`context` **紧接**就写；必填的 `indent` 从不存在 | ✅ 删字段 + 零断言 |
| `scroll-bar-api.ts:164` | `ScrollThumb` 的 `left/top/width/height` 在 `:93`–`:109`（**另一批函数**里）才写 | ⏸ 诚实的「先声明、后填充」，`unknown` 跳板必要 |
| 全仓「新建后装饰」18 处 | **17 处在 `__tests__`**（造假 DOM 的测试惯用法） | ⏸ 测试面，台账不数 |

### 五、新类别：**「必填字段的残留」**

把「类型里的必填字段」与「运行期真的写过的字段」对一遍，能同时拿到两样收益：
① 类型不再说谎；② **依赖它的断言会整条消失**（而不是缩短）。

可复用的判别动作：`grep -n "\.<字段>" <文件>` —— 若只有 `data.<字段>`、没有 `el.<字段>`，
那这个字段就该从元素类型里删。**下一轮可以用它去扫 `elementDataOf` 家族**
（`*Data` 接口与元素类型重名的那些文件）。

### 六、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **55 → 54**（files 47 → 46；基线已固化） |
| 其余 15 条轴 | 持平 |
| `tsc`（editor） / `vue-tsc`（ui-kit `build:types`） | 0 / 0 |
| `lint` / `format:check` / `docs:check` / `text:check` / `migration:selftest` | 0-0（1635 文件）· 0 · OK · 0 · 55/55 |
| ui-kit 套件 / editor 套件 | **115 文件 / 811 用例** · **254 文件 / 2070 用例**（改动落在 ui-kit ⇒ 两个都跑） |

### 七、教训

1. **「这里为什么需要 `unknown`」的答案，有时是类型里的一个错字段。**
   追问「**这个断言在替谁背书**」比追问「能不能把断言写短」有用得多 ——
   本轮减掉的那 1 分，是靠**先删字段**换来的。
2. **删字段之前把「谁读它」查干净。** 本轮的证据是「只有 `data.indent`、没有 `el.indent`」——
   它既是删除的依据，也是「删掉不改变行为」的证明。
3. **同形态 ≠ 同事实。** 这一族 3 个站点里，1 个是真残留（改）、2 个是诚实的（不动）。
   形态只用来**找候选**，判决必须逐处查。

## 第 122 轮（2026-09-22）：挖出 3 处「**同一个收窄写了两遍**」—— 54 → 51

> 先按上一轮的承诺去扫 `elementDataOf` 家族；扫完发现那条线索**到此为止**，
> 于是回到 A 类站点，逐个问「这个断言在替谁收窄」。

### 一、先扫家族：4 处候选，逐处查全是误报或不该动

新探针 `scripts/oneoff/measure-element-data-residue.mjs`：找「**必填** + 只以 `data.<字段>` 出现」
（即从没写到元素上）的字段。结果：

| 候选 | 查证结论 |
| --- | --- |
| `useVariableGetterWindow.ts` 的 `VariableGetterForm.commonKey/presetKey/globalKey`（3 处） | **误报**：`VariableGetterForm` 是**表单**类型，那里的 `data` 是无关的局部变量（探针把任意 `data.` 都算上了）。假阳性模式已记在探针头部 |
| `scene-window.ts` 的 `SceneListItem.class` | **不该动**：该 interface 与 `scene-list.ts` 的 `SceneItem` **成对维护**（注释写明），且没有任何断言依赖它 |

⇒ **第 121 轮那条线索到此为止**：家族里没有第二处「必填字段残留」。
**这本身是结论**，写下来免得下一轮重扫同一个面。

### 二、回到 A 类：3 处都是「同一个收窄写了两遍」

| 站点 | 之前 | 之后 | 为什么能去掉 |
| --- | --- | --- | --- |
| `menu-list.ts:65` | 调用方 `el as unknown as MenuListElement` | `return attachMenuListApi(el)` ⇒ **零断言** | 该 helper **内部已经**有一处单次 `as`（`:31`，形参是 `HTMLElement` ⇒ 可比）。调用方那处之所以**必须** `unknown`：它手上的 `el` 是 `createDetachedElement(): HTMLDivElement`，与 `MenuListElement` **两个方向都不可比**（TS2352）。⇒ 让 helper **返回**它，契约收在一处 |
| `page-manager-api.ts:40` | `el.childNodes as unknown as PageFrameElement[]` | `for (const child of el.children)` + `target = child as HTMLElement`（**单次**） | ① 遍历 `children` **可证等价**（见下）；② 断言压到真正需要它的那一处，并降为单次（`Element` 与 `HTMLElement` 可比） |
| `YMFileBrowser.vue:263` | `headEl.value as unknown as FileHeadApi` | `headEl.value as FileHeadApi \| undefined`（**单次**） | **同文件 `:387` 早就这么写了**（同一个 `headEl.value`、同一个目标类型）⇒ 那处 `unknown` 不是必需，只是漏改 |

**`children` vs `childNodes` 的等价性论证**（必须落在具体守卫上，不能只说「差不多」）：
循环体只在 `hasClass(child, 'page-frame')` 为真时才继续，而 `hasClass` 的实现是
`if (!target || !target.classList) return false;` ⇒ 没有 `classList` 的节点（文本/注释节点）
**原本就走不进循环体** ⇒ 换成只含元素子节点的 `children`，行为不变。
（没有那一行守卫，这个替换就是行为变化。）

### 三、「同一个收窄写了两遍」是一个可复用的判别信号

本轮 3 处都不是「类型写错了」，而是**同一个运行期事实被收窄了两次**：
一次在 helper / 另一处（单次 `as` 就够），一次在调用点（被迫用 `unknown`）。

⇒ 判别动作：**在文件里搜同名类型 / 同形断言**，看是不是已经有一处更弱的写法。
这与第 120 轮那条「同文件里已有一处对的写法」是同一个教训的**第二次**出现 —— 说明它不是巧合。

### 四、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **54 → 51**（files 46 → 44；基线已固化） |
| 其余 15 条轴 | 持平 |
| `tsc`（editor） / `vue-tsc`（ui-kit `build:types`） | 0 / 0 |
| `lint` / `format:check` / `docs:check` / `text:check` / `migration:selftest` | 0-0（1636 文件）· 0 · OK · 0 · 55/55 |
| ui-kit 套件 / editor 套件 | **115 文件 / 811 用例** · **254 文件 / 2070 用例**（editor 与 ui-kit 都改了 ⇒ 两个都跑） |

### 五、教训

1. **探针找出的候选全是误报，也是结论** —— 写下来（连同假阳性模式），下一轮不必重扫。
   一个「扫完没有」的结论，价值不低于一个「扫出一堆」的结论。
2. **「同一个收窄写了两遍」的正确修法，是让已经收窄好的那处把值交出来**
   （helper 返回 / 与同文件既有写法对齐），而不是在调用点再写一遍更强的断言。
3. **等价性论证要落在具体的守卫行上。** 本轮 `children`↔`childNodes` 的等价，靠的是
   `hasClass` 里 `if (!target.classList) return false` 那一行；没有它，替换就是行为变化。

## 第 123 轮（2026-09-22）：占位表族收口 —— 工厂改成「先定义、后组装」（51 → 50）

> 上一轮点名的「占位表」族只有一处站点；这一轮把它按**换结构**（而不是换断言写法）修掉，
> 并顺带实测了另一处、结论是**不能用单次 `as`**。

### 一、`file-entity-page.ts`：断言在替「表里先写 `null`」背书

旧形态（113 行的文件里占 81 行）：

```ts
const entity = {
	target: null, meta: null, initialize: null, create: null,
	open: null, close: null, update: null, listChange: null
} as unknown as FileEntityPage;

entity.initialize = function () {};
entity.create = function (…) {…};
// … 另外 4 个方法依次赋值
```

那张表里 6 个方法位先写 `null`，而接口要求的是函数 ⇒ 不兼容 ⇒ 只能 `unknown`。
**断言在替「表里先写 `null`」这一步背书。**

新形态（手法库第 4 条的一般形态 —— **先定义、后组装**）：

```ts
const initialize = function () {};
const create = function (…) {…};   // … 另外 4 个同样改成 const
const entity: FileEntityPage = {
	target: null,
	meta: null,
	initialize,
	create,
	open,
	close,
	update,
	listChange
};
```

⇒ 断言**整条消失**；而且对象字面量现在由 `tsc` **整体**校验（少一个成员、名字写错都会报），
以前是 6 次逐字段赋值各管各的。

**行为等价**：差别只有语句顺序（函数先定义、对象后组装）；没有任何代码观察得到「半填的 entity」。

**一个必须写下来的细节**：`listChange` 的方法体读的是闭包里的 `entity`（现在在它**下面**几行才声明）。
这**是安全的** —— 方法体只在**调用时**求值，TDZ 只作用于求值那一刻。
**故意没有**把它改成 `this.meta`：那更合本文件惯例（`update` 就是 `this.meta`），
但属于**行为变化**（脱离接收者调用时会从「读闭包变量」变成「抛 `TypeError`」）。
两条都写进了代码注释 —— 否则下一个人会「顺手修好」它。

### 二、顺带实测：`eslints.ts:173` 的 `unknown` 跳板是**承重的**

该站点已经是 `Object.assign(Array.from(rendered), { count, lineClassEnabled })`（item 4 的形态），
断言把 `Element[]` 变成 `CommandListShape`。试着改成单次 `as` ⇒ `tsc` 报：

```txt
'number' index signatures are incompatible.
  Type 'Element' is not comparable to type 'CommandItemElement & { fold?; mark?; buffer? }'.
    Type 'Element' is missing … accessKey, and 253 more.
```

⇒ **确实需要 `unknown`**（两边索引签名不可比）。已还原，并把这段结论写在站点上，免得下一轮再试。
**这是本轮唯一一处「试了不行」的改动 —— 试错结论和成功结论一样值得留档**：
它把这条轴从「可能是漏改」变成「已实测承重」。

### 三、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **51 → 50**（files 44 → 43；基线已固化） |
| 其余 15 条轴 | 持平 |
| `tsc`（editor） | 0 |
| `lint` / `format:check` / `docs:check` / `text:check` / `migration:selftest` | 0-0（1636 文件）· 0 · OK · 0 · 55/55 |
| editor 套件 | **254 文件 / 2070 用例全绿**（改动是**运行期**重排 ⇒ 必须跑；`file-entity-page` 本身没有专属 spec，靠套件兜） |

### 四、教训

1. **「占位表」的正确修法是换结构，不是换断言写法。** 先写 `null` 再逐字段填，
   本质上就是「声明与事实不一致」；把函数先定义成 `const`、最后组装，表就不必存在。
2. **先定义后组装会引入前向引用**（`listChange` 读 `entity`）。它安全，但**必须把「为什么安全」
   和「为什么不改成 `this`」一起写下来** —— 否则下一个人会顺手改成「更一致」的写法而改变行为。
3. **试错也要留档。** 本轮那处承重实测（253 个缺失属性）把一条轴从「疑似漏改」变成「已判定」，
   省掉下一个人重复尝试的时间。

## 第 124 轮（2026-09-22）：清 6 处（50 → 44），并顺手修掉一行**编码事故留下的乱码**

> 本轮先按「目标类型」给剩下 50 处分类（决策用），然后按「**断言在替谁干活**」找族 ——
> 结果 6 处全落在两个族里，其中一族是第 106 轮那个坑的复发。

### 一、先分类（决策用）：50 = A 8（本文件局部类型）+ B 29（别处的具名类型）+ C 14（匿名/字面量/交叉/泛型）

分类本身**没有**直接给出答案 —— 真正有用的是下一个问题（见三）。

### 二、清掉的 6 处，两个族

**族 A：形参早就是 `unknown`，调用点那次断言纯粹多余**（第 106 轮同一个坑的复发）

| 站点 | 之前 | 之后 |
| --- | --- | --- |
| `scene-list.ts:114` | `dispatchChangeEvent(this as unknown as HTMLElement)` | `dispatchChangeEvent(this)` |
| `scene-events-list.ts:35` | `read(this as unknown as HTMLElement)` | `read(this)` |

两个函数的形参本来就是 `unknown`（内部自己收窄）⇒ 那两次断言是**签名放宽后忘了清的调用点**。
判别动作：**把调用点的断言与形参的声明类型对一下**。

**族 B：用交叉断言（手法库第 6 条）替代 `unknown` 跳板**

| 站点 | 之前 | 之后 |
| --- | --- | --- |
| `ui-kit/utils/dom.ts:7` | `el as unknown as { focus(…) }` | `el as Element & { focus(…) }` —— 保留对象类型、只补缺口那一支 |
| `particle-motion.ts:138` | `head.children as unknown as HTMLElement[]` | `Array.from(head.children) as HTMLElement[]`（`HTMLCollection` 与数组两向不可比；`Array.from` 先得 `Element[]`，与 `HTMLElement[]` 可比） |

**外加两处「断言替谎言背书」**（第 117 / 121 / 123 轮那类）：

- `element-page.ts:124`：`(alignElements as unknown as HTMLElement[]).forEach(…)` ——
  `$('.…')`（非 `#` 选择器）返回 `NodeListOf<YamiElement>`，**NodeList 自带 `forEach`**，
  而 `on` 的第一个形参本来就是 `any` ⇒ 直接调即可，**零断言**。
- `element-utils.ts:161`：`clear(el): HTMLElement` 的返回类型**在说谎** —— `if (!el)` 那一支
  真的返回 `null` / `undefined`（`return el as unknown as HTMLElement` 就是替谎背书）。
  已放宽为 `HTMLElement | null | undefined`；依据是**全仓没有任何调用方取用它的返回值**
  （`= clear(` / `return clear(` / `clear(…).x` 三种形态实测都是 0 处）⇒ 无涟漪。

### 三、⚠️ 顺带修掉一行**编码事故留下的乱码**（本轮最意外的发现）

改 `element-page.ts:124` 时，紧邻的上一行注释长这样：

```txt
// 18 闂備胶顢婇惌鍥磼濞戝崬浠?input 缂?Vue 婵犵妗呴崹顏堝礈濠靛棭鐔嗘俊顖滅帛婵粍銇勯幒鍡椾壕閻熸粍婢橀崐鍧楁瀹ュ鎹堕柣顐ゆ敘magePage.vue @input 闂?UIElement.paramInput闂?
```

即 **GBK ↔ UTF-8 误解码**的产物。三步处理：

1. **量范围**：拿这条文本里的 7 个特征 n-gram（`闂備胶` / `閻熸粍` / `濞戝崬` / `鐔嗘俊` / `婵犵` …）
   全仓搜 —— **只命中这一处** ⇒ 局部事故，不是系统性污染。
2. **逐字恢复**：`git log -L 127,127:packages/editor/src/inspector/element-page.ts` 直接给出演化史 ——
   `54a7d809`（"chore: add safe any type 3"）把它毁了一次，`3f259bc9` 又在乱码上再毁一次；
   `54a7d809^` 的原文是
   `// 18 控件 input 经 Vue 模板转发（UIImagePage.vue @input → UIElement.paramInput）`
   ⇒ 照抄恢复。
3. **记下门禁缺口**：`text:check` 的 **7 条规则都不管乱码**（乱码里既没有控制字符、也没有 U+FFFD），
   所以这一行躺了**不知多少轮**而所有门禁全绿 —— 与那节注释里写的失败模式完全同类
   （「语法合法，tsc/oxlint/oxfmt/vitest 全都看不见」）。
   ⇒ **一条可自证的 `mojibake` 规则**是明确的下一步；上面那段乱码原文留作**自证样本**
   （规则必须先在它身上报红）。

### 四、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **50 → 44**（files 43 → 37；基线已固化） |
| 其余 15 条轴 | 持平 |
| `tsc`（editor） / `vue-tsc`（ui-kit `build:types`） | 0 / 0 |
| `lint` / `format:check` / `docs:check` / `text:check` / `migration:selftest` | 0-0（1636 文件）· 0 · OK · 0 · 55/55 |
| editor 套件 | **254 文件 / 2070 用例全绿**（`particle-motion` / `element-page` 是运行期语句 ⇒ 必须跑） |

### 五、教训

1. **按「目标类型」分类不如按「断言在替谁干活」分类。** 前者只告诉我「目标是局部的还是别处的」，
   后者立刻把 6 处归成两族（多余的调用点断言 / 交叉断言可替代），并指出修法。
2. **乱码不会被任何现有门禁抓到**，而且比「代码被吞进注释」更隐蔽 —— 后者读代码时刺眼，
   乱码看起来只是「我看不懂的一段中文」。文本类事故应当有一条**能自证**的乱码规则。
3. **修复乱码的标准动作是「历史版本逐字恢复」**，工具是 `git log -L <行>,<行>:<文件>`；
   这一招值得写进手法库（它同时给出了**污染发生在哪两次提交**，便于判断有没有同类残留）。
4. **改文件时留意工具的副作用**：本轮用 PowerShell `Set-Content` 重写文件时把**整份文件变成了
   CRLF**（仓库是纯 LF），提交前查出来并归一化。⇒ 机械改写的收尾检查清单里应加一条
   「行尾/BOM 是否与仓库一致」。

## 第 125 轮（2026-09-22）：给「乱码」补上**可自证**的门禁，并把全仓 17 处乱码修掉

第 124 轮结尾记下一件事：`text:check` 的 7 条规则**看不见乱码**。本轮去补这条缺口，
结果发现那行乱码**不是孤例** —— 全仓还躺着 17 处，包括一条在 3 个文件里复制的注释、
以及 2 条**测试用例名**。

### 一、先查清「那次事故为什么躲过了 `replacement-char`」

`replacement-char` 认的是 U+FFFD。把 `54a7d809` 引入的真实乱码取出来逐码点看：
**一个 U+FFFD 都没有**，丢字处是**半角 `?`**：

```txt
// 18 闂佺鐭囬崒娑卞仺 input 缂?Vue 濠碘槅鍨崜婵嗩熆濡粯濮滄い鎺嗗亾鐟滄澘鍊块弫宥夊捶閻攢magePage.vue …
```

Node 的 `gbk` 解码器遇到无法映射的字节对写 U+FFFD，而当年那个解码器写 `?` ——
规则认错了字符，所以整整一族事故从它眼皮底下走过去，还一路全绿。

### 二、判据不用「稀有字黑名单」，用**可逆性**

直觉做法是列一批「只可能出现在乱码里」的稀有汉字。实测可行但不牢靠：那本质是**口味**
（哪些字够稀有），而且黑名单本身是一串乱码字符，放进被扫面里会被自己抓到。
这里改用语义判据 —— 误解码是**可逆的**：

```txt
UTF-8 字节 --(当成 GBK 解码)--> 乱码 --(编回 GBK 字节)--> 原字节 --(严格 UTF-8 解码)--> 原文
```

中间那步 Node 没给（`TextDecoder` 只能解不能编），但可以**反过来枚举**：把
`0x81..0xFE × 0x40..0xFE` 两万多组字节对喂给严格的 `gbk` 解码器，就得到「字符 → 字节对」表
（实测 **24 ms**，惰性建表）。于是判据是一句可执行的话：

> **这一行的字符编回 GBK 字节后，若能按 UTF-8 解出中文 ⇒ 这行就是误解码的产物。**

它没有主观量，而且**顺带把原文还回来**（门禁直接打印还原结果，修的时候不用猜）。

### 三、两个阈值/过滤器都是量出来的，不是拍的

| 选择 | 实测 |
| --- | --- |
| 阈值「一段至少还原出 1 个中文」 | 全仓命中 **881 行**（字节错位碰巧解出一两个字）⇒ 规则当场失去可信度 |
| 阈值「≥2 个中文」 | 全仓命中 **17 行**，逐行核对**全是真事故** |
| 「像文本」过滤器（中文占多数） | 必须有：宽松解码会把错位字节解出 `€` 之类残渣 |
| 一刀切「整段通篇合法」 | 会**漏掉 3 处**（丢字最严重的那三处还原结果里有 `€`）⇒ 改成**比例**阈值 |

最后一条是这一轮最值得记的取舍：**残渣是事故的标志，不是「不是事故」的理由**。

### 四、全仓 17 处，每一处的原文都取自**写坏之前**

定位手段是一条决定性的判据式：**在写坏那次提交的父提交里搜 `corrupt(X) == 现文` 的行** ——
`corrupt` 就是「UTF-8 字节按 GBK 解码」，所以命中的 X 必然是原文，不靠眼看。
可重跑的仪器：`scripts/oneoff/lookup-mojibake-origins.mjs`（判据式 + rename 解析）、
`scripts/oneoff/apply-mojibake-fixes.mjs`（改了什么、每处的原文出处都写在 `source` 上）。

| 站点 | 现文（乱码）→ 原文 | 原文来源 |
| --- | --- | --- |
| `TextPosition.vue:2` | `璁剧疆鏂囧瓧浣嶇疆` → `设置文字位置` | `1ebf7427^` 同文件第 2 行（判据式命中） |
| `Variable.vue:2` | `鍙橀噺绐楀彛` → `变量窗口` | `96303b39^` 同文件第 2 行（判据式命中） |
| `palette-pointer.ts:38` | `濡傛灉姝ｅ湪淇敼鍥惧潡缁勫楂橈紝璁╁畠绔嬪嵆鐢熸晥` → `如果正在修改图块组宽高，让它立即生效` | `4e15d838^` 同文件第 37 行（判据式命中） |
| `YMTitleBar.vue:34` | `闃叉ā鍧楃骇 dragging …` → `防模块级 dragging 残留（拖拽中 pointerup 丢失时阻断后续所有窗口拖拽）` | `f7d16bd2^` 同文件第 34 行（判据式命中） |
| `SceneTilemapPage.vue:339` | `璇█鍒囨崲涓棿鎬侊細t()/DOM …` → `语言切换中间态：t()/DOM 访问可能失败，跳过本次刷新` | `1ebf7427^` 同文件第 284 行 |
| `scene-events-list.ts:92` | `姝ｅ湪缂栬緫鍥惧潡鏃剁洿鎺ユ墦寮€鐡︾墖鍦板浘 …` → `正在编辑图块时直接打开瓦片地图 图块组关闭时打开瓦片地图检查器` | `223cc4c0^` 的 `scene/scene-events.ts` 第 1339 行 |
| `element-button-page.ts:207` | `闂佺儵鏅涢悺銊ф暜…` → `直接复制，更新语言包中的内容` | `54a7d809^` legacy 版第 353 行 |
| `element-dialog-page.ts:92` | 同上 → 同上 | `54a7d809^` legacy 版第 154 行 |
| `element-text-page.ts:156` | 同上 → 同上 | `54a7d809^` legacy 版第 218 行 |
| `file-audio-page.ts:131` | `婵烇絽娲︾换鍕汲…` → `保留对返回的原始promise的引用 以便可以取消解码音频数据的操作` | `54a7d809^` legacy 版第 104 行 |
| `file-audio-page.ts:327` | `闂佸憡鐟﹂悧妤€銆掗懜鍨氦?50ms…` → `取最近150ms的强度平均值(平滑过渡)` | `54a7d809^` legacy 版第 298 行 |
| `inspector.ts:386` | `濡傛灉鏄粦鍔ㄦ绫诲瀷鍒欒烦鍒癲efault` → `如果是滑动框类型则跳到default` | `54a7d809^` legacy 版第 294 行 |
| `inspector.ts:475` | `鍥犳闇€瑕佸垽鏂璵anager.focusing` → `因此需要判断manager.focusing` | `54a7d809^` legacy 版第 382 行 |
| `animation-action-page.ts:60` | `濠殿喗绺块崐鏇…select…` → `此处不能unselect并update Animation.list.unselect(this.target) Animation.updateTarget!()` | `54a7d809^` legacy 版第 88 行 |
| `property-list.ts:225` | `key write 缁?Vue 妯℃澘杞彂…` → `key write 经 Vue 模板转发（ObjectAttribute.vue @write → AttributeListInterface.keyWrite）` | **父提交无此行**（写入时就是乱码）⇒ 按同族约定还原：`attribute-window.ts:353` 的 `name/key input 经 Vue 模板转发（…）` + `element-page.ts:124` |
| `scroll-bar-api.spec.ts:20` | `…on target锛?.48 鍥炲綊鈥斺€攎arquee 鍚屾閾撅級` → `…on target（9.48 回归——marquee 同步链）` | `f5e9607c^` 同文件第 17 行 |
| `scroll-bar-api.spec.ts:60` | `…(denom fallback鈥斺€?.46 鍥炲綊)` → `…(denom fallback——9.46 回归)` | `f5e9607c^` 同文件第 54 行 |

路径难点：写坏的那些提交同时把 `legacy/inspector/*` 搬到了 `inspector/*`，父提交里得先按
rename 解析出旧路径（`git show --name-status -M`），否则 `git show <commit>^:<path>` 直接报
「exists on disk, but not in …」。

### 五、门禁自证（三条，缺一不可）

1. **无丢字样本必须精确可逆**：`'// 控件'` 误解码一个字节都不丢 ⇒ 断言还原结果**一字不差**。
   （为什么挑这两个字：实测 `控件` 的误解码形态无 U+FFFD —— 选谁由
   `scripts/oneoff/find-lossless-mojibake.mjs` 量出来，不是挑着顺眼。）
2. **真实事故形态必须命中，且只有它能命中**：把样本里的 U+FFFD 换成**半角 `?`**（当年那个
   解码器的形态），断言命中的规则**恰好是 `['mojibake']`** —— 这就是「此前 7 条规则全都看不见它」
   的可执行证明：把这条规则摘掉，断言立刻变成 `[]`。
3. **样本现场生成，不以乱码字面量落盘**：乱码字面量写进源码，既是仓库里的新乱码，
   又会被这条规则自己抓到。转义写法（`'\u95ba…'`）另有一条用例守着 —— 它守的是**自指的坑**：
   门禁自己的源码与自证样本就躺在被扫面里。

### 六、一处「第 124 轮留下的错误做法」的更正

第 124 轮把乱码原文留在文档里当自证样本。**这个做法本身是错的**：写文档的通道又把它转码了
两次 —— 现在 `xr.md` 里那段是**两层乱码**（`闂備胶顢婇惌鍥磼濞戝崬浠?` 比 `54a7d809` 的
原始乱码还长）。这恰好证明：**乱码不可以字面量形式存进任何文件**。判据改成现场生成之后，
样本不再需要落盘，这条错误做法也就不必保留了。

（顺带一个口径确认：`xr.md` 这类仓库根目录的文档**不在** `text:check` 的扫描面里
—— 扫描面是 `packages/editor/src`、`packages/ui-kit/src`、`packages/editor/main`、`scripts`。
所以文档里那两行乱码不是门禁问题，纯粹是记录事故。）

### 七、账

| 项 | 结果 |
| --- | --- |
| 全仓 mojibake 站点 | **17 → 0**（`scripts/oneoff/measure-mojibake-sites.mjs` 复测） |
| `text:check` | 规则 **7 → 8**（新增 `mojibake`）；命中 0 |
| `migration:selftest` | **55 → 58**（3 条新用例） |
| `unknown-casts` 等 17 条轴 | 全部持平（本轮只动注释与用例名） |
| `tsc` / `vue-tsc` | 0 / 0 |
| `lint` / `format:check` / `docs:check` | 0-0（1645 文件）· 0 · OK |
| editor 套件 / ui-kit 套件 | **254 文件 / 2070 用例** · **115 文件 / 811 用例**，全绿 |

### 八、教训

1. **「语法合法」之外还有一层「看起来像正常中文」。** 前三类文本污染（控制字符、被吞进注释、
   注释重复）读代码时刺眼；乱码不刺眼，它看起来只是「我不认得那几个字」—— 所以隐蔽度更高。
2. **判据优先找「可逆」这类结构性性质，而不是「哪些字可疑」这类口味。** 前者自带自证样本
   （现场生成即可），后者既难自证又会过期。
3. **修历史乱码要把「当时那个解码器」的性格也算进去**：它丢字写 `?` 还是 U+FFFD，决定了
   还原是精确的还是有损的。有损的部分只能靠 `git log -L` 取旧版，别去猜。
4. **本仓的 `no-misused-spread` 是有道理的**：`[...s]` 在字符串上是按码点切，
   `migration-ledger.mjs:539` 早就写着「用 for-of 逐码点累加，而不是 `[...String(s)]`」——
   这轮新写的模块踩了同一个坑，被 `lint` 拦住，改成 for-of 才对。
5. **门禁的扫描面要写清楚**：知道 `xr.md` 不在扫描面里，才不会把「文档里留着乱码样本」
   误判成门禁漏洞（也就不会为了一个不存在的问题去放宽规则）。

## 第 126 轮（2026-09-22）：`unknown-casts` 44 → 40，其中一处藏着**真 bug**

第 124 轮把「按目标类型分类」换成「按**断言在替谁干活**分类」。本轮用同一把尺子量剩下的 44 处。

**先说清一件事**：这 44 处**不可能靠删断言解决** —— 「把 `expr as unknown as T` 降成 `expr as T`
再跑 tsc」那个批量实验早就做过，留下的正是**跳板承重**的那些。所以本轮的目标只能是**改类型**：
要么声明写错了（改声明），要么断言多余（删断言），要么是真正的架构债（记下来别动）。

为此先让 `scripts/oneoff/probe-p4-dead-casts.mjs` 打印**整行**（原先只打印命中处之后的片段，
判断不了哪一侧该动）。逐处问那句判据后，4 处当场判完：

### 一、`new-project-window.ts`：`as unknown as string` 把**数组**塞进字符串比较 ⇒ `else` 是死代码

```ts
(template == 'arpg-ts-english' && noResourceObj['arpg-ts-english'].check) ||
(template == 'arpg-ts-chinese' && noResourceObj['arpg-ts-chinese'].check) ||
template != (['arpg-ts-english', 'arpg-ts-chinese'] as unknown as string)
```

第三项的本职是「模板**不是**那两个 ARPG 时也放行」—— 模板列表里确实还有第三项
`minimized-project`（见 `initialize` 的 `loadItems`）。但 `!= <数组>` 在运行期是拿 `template`
和数组 `join` 出来的 `'arpg-ts-english,arpg-ts-chinese'` 比，**对任何真实模板值都成立**
⇒ 整个条件恒真 ⇒ `else` 里那句 `alert(t('confirmation.resource-not-found'))` **永远不会执行**：
资源包缺失时也照样新建项目。`891cf657`（本地化重构）引入。

修法：把判定抽成纯函数 `newProjectConfirmAllowed(template, isResourceReady)`，让这张四行真值表
能被用例钉住（`src/title/__tests__/new-project-confirm.spec.ts`，4 条）。

### 二、`color-picker-window.ts`：声明写错了**那一侧**

```ts
const element = event.target as YamiElement & { dataValue?: string };
const index = element.dataValue as unknown as number;   // 拿它当数组下标
```

两个证据都指向「声明是错的那一侧」：

- **生产者**：`dataValue` 由 RadioBox 归一化 —— `value="0"` 这种数字串经
  `numberPattern` + `parseFloat` 落成 **number**（`RadioBox.vue` 的 `onMounted`）；
- **同族**：`eslints.ts:256` 的 `elementDataOf<{ dataValue?: number }>`、`auto-tile.ts:352` 的
  `{ class: 'common-item', '.dataValue': i }` 都按 number。

⇒ 改成 `{ dataValue: number }`，断言从「双重」直接变零（`YamiElementApi` 本来没有 `dataValue`，
所以这里的交叉声明是真的在补缺口，不是绕）。

### 三、`scene-camera-engine.ts`：断言只喂给一个 `unknown` 形参 —— 与第 124 轮**族 A 同一个坑**

```ts
const screenExt = screen as unknown as { rawScrollLeft: number; rawScrollTop: number };
screenScrollData(screenExt).rawScrollLeft = …
```

而 `screenScrollData(el: unknown)`（见 `engine/screen-scroll-data.ts`）**形参就是 `unknown`**，
且同族引擎（`particle-motion.ts:203`、`ui-engine.ts:387`…）**本来就写成 `screenScrollData(screen)`**。
⇒ 删除局部变量与断言，与同族对齐即可（这也再次证明第 124 轮那条判别动作好用：
**把调用点的断言与形参的声明类型对一下**）。

### 四、`setting-config/renderer.ts`：已有 `Reflect.has` 探成员，就用同一个口取出来

```ts
if (e.target && Reflect.has(e.target, 'value'))
	return (e.target as unknown as { value: string | number | boolean }).value;
```

`EventTarget` 上有没有 `value` 本来就是**运行期事实**，探到了就用 `Reflect.get` 取
—— 比「断言成某个形状」更贴事实，而且少一层 `unknown`。

### 五、⚠️ 自证时我自己先错了一次（这条比结论值钱）

新用例写完，我要证明它「在旧语义下是红的」。第一次的临时改写**忘了删掉前面两个提前 `return`**，
于是旧表达式根本没机会执行 —— 用例**照旧全绿**，而我在那一刻已经准备把「用例是红的」写进文档。
删干净重跑，才看到该看到的那一行：

```txt
× ARPG 模板 + 资源缺失 ⇒ 拦下（改之前这里恒为 true）
AssertionError: expected true to be false
```

⇒ 教训：**自证是「跑出来的」不是「推出来的」**。凡是要在文档里写「这条用例能抓住它」，
就必须真的看它红一次；凭推理认为「这样写肯定红」正是这一轮差点犯的错。

### 六、明确**留着的**（不是忘了，是判过不该动）

`element-base.ts:148`：`drawDefaultImage()` 是**基类**方法，却在读 `blend`
—— 而 `blend` 只声明在子类（`image-element.ts:28` / `text-element.ts:59` /
`progress-bar-element.ts:37` / `video-element.ts:7`）。要修得决定「`blend` 到底属不属于基类」，
并且 `GL.blend = this.blend` 在 `blend` 为 `undefined` 时的行为（`webgl-methods.ts:1149`
用 `updaters[(blend = this.blend)]()` 查表）**必须真机确认**才能动。⇒ 留给 ④ 系列之后。

### 七、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **44 → 40**（files 37 → 33；基线已固化） |
| 其余 16 条轴 | 持平 |
| 新增用例 | `src/title/__tests__/new-project-confirm.spec.ts`（4 条，已在旧语义下验红） |
| `tsc` / `lint` / `format:check` / `text:check` / `docs:check` / `migration:selftest` | 0 / 0-0（1642 文件）· 0 · 0 · OK · 58/58 |

剩下 40 处的形状分布（`scripts/oneoff/measure-p4-shapes.mjs` 实测）：
**A 局部类型 7 处 / B 别处具名 22 处 / C 匿名或泛型 11 处**。按「断言在替谁干活」可归成四类：

1. **第三方环境形状**（`monaco.ts:11`、`monaco-dts.ts:10`）—— 计划内既定债务；
2. **codec 的 `string ↔ Uint8Array`**（`codec.ts:82,135`）—— 计划内既定债务；
3. **被调方形参声明过窄**（`Parameters<typeof X.open>[0]` ×2、`ConstructorParameters` ×2）——
   要放宽的是**被调方**的契约，得逐个调用点复核（与本轮第三条同一族，但更贵）；
4. **动态键/成员枚举**（`printer.ts:408,1239`、`incremental.ts:364`、`history.ts:757`、
   `window-object.ts:59`、`YMParameterPane.vue:693`、`YMFileBrowser.vue:433`、`list-events.ts:47`、
   `variable.ts:162`）—— 都是「按字符串键取遗留形状对象上的成员」，需要先给那类对象一个
   诚实的索引签名（而索引签名正是 `any-hatches` 轴在压的东西）⇒ 两条轴在这里**互相拉扯**，
   动之前得先想清楚哪一边让步。

### 八、教训

1. **同一把尺子可以反复用。** 第 124 轮的判据（「这个断言在替谁干活」+「把调用点的断言与形参
   的声明类型对一下」）在本轮又抓到一处同族（第三条），说明它是可复用的动作，不是一次性技巧。
2. **「保留下来」的每一处都要写清理由**，否则下一轮会把「已经判过不该动」再判一遍
   （第五节那条 `blend` 就是显式判过并留档的）。
3. **自证必须真跑**（见第五节）。这是本轮唯一一个「差点写进文档的错误」。

## 第 127 轮（2026-09-22）：`unknown-casts` 40 → 36 —— 收掉「被调方形参声明过窄」那一族

第 126 轮把剩下 40 处归成四族，其中「被调方形参声明过窄」一族最省力（4 处），本轮收掉。
四处的形状完全一致：`X as unknown as Parameters<typeof f>[0]` / `ConstructorParameters<typeof C>[0]`。

### 一、这四处的 `unknown` 跳板在替谁干活

四处都是「参数**确实**是那个东西，只是 TS 看不出来」：

| 站点 | 被调方要什么 | 调用方手里是什么 | 差在哪 |
| --- | --- | --- | --- |
| `command-list.ts:67` | `SearchString.open(eventWindow: SearchableList)` | 契约给的 `HTMLElement` | 契约只承诺 `HTMLElement`，而实际对象两样都是 |
| `custom-box-opts.ts:103` | `ArrayList.open(target: ArrayListTarget)` | `GetterElement` | **只有可空性**：`Node \| null` vs `Node`、`string \| null` vs `string` |
| `scene-context.ts:324` | `new Light(data: LightData)` | `SceneLight`（场景节点） | `LightData` 的字段旧格式直接挂在节点上 |
| `scene-context.ts:367` | `new Parallax(...)` | `SceneParallax` | 同上 |

### 二、修法：**交叉断言**（手法库第 6 条），不是删断言

`X as unknown as P` → `X as X & P`。

为什么这不是「换个写法骗轴」：**`unknown` 跳板对目标类型没有任何检查** ——
`x as unknown as 任何东西` 都合法（这正是它危险的地方）；而 `X & P` 要求 P 是 X 的**扩展**，
tsc 会真的判可比性。本轮 4 处全部通过 `tsc --noEmit`，也就是说这一步把「凭空断言」
换成了「**有约束的收窄**」—— 轴降下去的同时，检查是**变多**的。

### 三、逐处的运行期证据（沿用判据：形态可疑 ⇒ grep 那个成员有没有被装上）

- `command-list.ts:67`：期望的成员在 ui-kit 的 `command-api.ts` 上**实数存在** ——
  `elements`(:415)、`findString`(:506)、`scrollToRow`(:339)，而契约(:237)只承诺 `HTMLElement`
  ⇒ 那个对象确实是「两样都是」，交叉断言说的是事实；
- `custom-box-opts.ts:103`：两个接口逐字段对过，差**只有可空性**。所以交叉断言的主张
  （「调用点这两个字段非空」）与原先的 `unknown` 跳板**完全一致**，只是不再丢掉源类型；
- `scene-context.ts:324/367`：`Light`/`Parallax` 的形参就是场景节点本身（旧格式把光照/视差参数
  直接挂在节点上，构造函数体第一句就是 `this.data = data`）⇒ 「节点也是 `LightData`」
  是这两个类**既有的前提**，不是本轮新加的假设。

### 四、⚠️ 明确**没有**顺手改的两处：`LayoutPanel.vue:1966/1969`

它们也是同一种形状（`{ value } as unknown as Event`），机械换成交叉断言同样能过 tsc，但**没换**：
那种换法只是把「手搓的对象冒充 `Event`」这句谎话写得更规整，谎话本身还在。

真正的修法是「让被调方的形参只声明它**读**的东西」（第 124 轮 `clear()` 那种契约修正）。但
`easingIdWrite` / `easingIdInput` 要同时接两种实参：Vue 模板转发的**真事件**（`@input`）
与这里**手搓的 `{ value }`**。直接把形参收成 `{ value?: unknown }` 会踩 TS 的 weak-type 规则
（目标全是可选成员时，实参必须至少与它有一个共同成员，而 `Event` 没有 `value`）⇒
会**打断模板绑定**。所以这需要先决定「这类处理器怎么建模」（例如统一走 `YamiEvent` 并给出手搓
事件的构造辅助），留给单独一轮，不在本轮硬凑。

### 五、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **40 → 36**（files 33 → 31；基线已固化） |
| 其余 16 条轴 | 持平 |
| 改动性质 | **纯类型擦除**（`git diff -U0` 里只有断言目标与注释，没有增删任何表达式） |
| `tsc` | 0（四处交叉断言的可比性由 tsc 判过） |
| `lint` / `format:check` / `text:check` / `docs:check` / `migration:selftest` | 0-0 · 0 · 0 · OK · 58/58 |

### 六、教训

1. **「按形状归族」比「逐处硬啃」划算**：这四处一个字都没差（`as unknown as Parameters<…>[0]`），
   于是证据只要取一次、修法只要想一次 —— 上一轮列族的那张表直接变成了这一轮的工作单。
2. **换写法要先答「检查是变多还是变少」**：`unknown` → 交叉断言之所以成立，是因为 tsc 从
   「不检查」变成「判可比性」。反过来，若某种改法只是让轴好看而检查没变多，那就是骗轴
   （第 115 轮 `ui-singleton-members` 那条白拿路径就是反例）。
3. **「能机械改」不等于「该改」**：`LayoutPanel` 那两处能过 tsc，但改了只是把谎话写规整
   （见第四节）—— 留下的每一处都要能说清「为什么留」。

## 第 128 轮（2026-09-22）：⚠️ 更正第 127 轮的一个论断 —— 交叉断言**不**增加兼容性检查

### 一、先更正：第 127 轮把交叉断言的好处说大了

第 127 轮的原话是「`X & P` 要求 P 是 X 的**扩展**，tsc 会真的判可比性 …… 轴降下去的同时，
**检查是变多的**」。本轮用一个**对照实验**把它证伪了：

| 写法 | tsc |
| --- | --- |
| `o as A & { b: string }` | 通过 |
| `o as A & { a: string }`（自相矛盾） | **通过** |
| `o as A & Date`（毫无关系） | **通过** |
| 对照组 `const n: number = 'x'` | 报错 `TS2322`（**证明编译器确实在检查**） |

原因：交叉断言的**目标类型**按构造就是源类型的子类型（`X & P` 一定是 `X` 的子类型），
所以它永远是一次合法的「向下断言」—— TS **不会**去核对 P 与源类型是否相容。

（对照组是必须的：没有它，就分不清「编译器没检查」和「编译器没在跑」。）

### 二、那它到底买到了什么（可执行证据）

一句话：**结果类型里保住了源类型的成员**（而 `unknown` 跳板会把源类型**抹掉**）：

| 写法 | 之后还能不能用源类型的成员 |
| --- | --- |
| `(o as A & { b: string }).a` | ✅ 通过 |
| `(o as unknown as { b: string }).a` | ❌ `TS2339: Property 'a' does not exist on type '{ b: string; }'` |

所以第 127 轮那 4 处改动**仍然成立**，但理由要换成上面这一条：`unknown` 跳板断言完，
表达式只剩 P 的成员（源类型从此不可见、后续访问也就无从检查），交叉断言把它留着。
这是「**类型信息变多**」，不是「断言被检查」。

⇒ 台账那条轴是**坏味道的代理量**，不等于正确性。把轴降下去时必须同时说清「换来的到底是什么」，
否则就是第 115 轮警告过的「靠改写法白拿信号」。

### 三、顺手修掉一处 `never` 谎言：`palette-pointer.ts:96`

```ts
this.pointermove((event as unknown as { latest: never }).latest);
```

`latest` 是 `Palette.pointermove` 装在**这个事件对象**上的「最新一次指针事件」
（`dragging.latest = event`，见 :400 / :483），而 `this.dragging` 就是它（:87）
⇒ 真实类型是 `PointerEvent`，`never` 是纯谎话。改成：

```ts
const latest = (event as PointerEvent & { latest?: PointerEvent }).latest;
if (latest) this.pointermove(latest);
```

**为什么加这个 `if` 不改变行为**：`never` 把「第一次 pointermove 之前还没装上」也一起藏了；
那种情况下原来会 `pointermove(undefined)`，而 `relate` 的实现是 `!!a && a.pointerId === b?.pointerId`
（对 `b` 用了可选链）⇒ `relate(dragging, undefined)` 本来就返回 `false`，进了函数也是立刻返回
（`relate` 判断之前没有任何副作用）。所以显式跳过与「进去再空转」**可观察等价**。

### 四、本轮明确留下的两处（不是忘了）

- `window-object.ts:59`：`[] as unknown as HTMLElement[] & { append; remove }` ——
  `append`/`remove` 装在**该数组实例**上，而且必须**不可枚举**（否则会被 `for…of` / `length` 看见）。
  TS 没有「数组实例加方法」的表达法，单个 `as` 会被拒（批量降级实验早验过）。要真去掉，
  得把 :461/:487 的 `defineProperty` 搬到构造处 —— 那是**运行期**改动，得真机。
- `scene-tilemap-page.ts:210`：`const element = this as unknown as HTMLElement` ——
  这里 `unknown` 是在**丢掉一个错的声明**（签名写 `this: typeof SceneTilemap`，运行期 `this` 是元素，
  见就地注释）。换成交叉断言反而**加强**了一句假话。真正的修法是把 `this` 声明对，
  但那要连 `this.changes = …` 这套「把字段挂在元素上」的旧约定一起理，留给 ④ 之后。

### 五、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **36 → 35**（files 31 → 30；基线已固化） |
| 其余 16 条轴 | 持平 |
| `tsc` | 0 |
| palette 相关 spec | 5 文件 / 25 用例绿（`src/palette` + `engine/__tests__/palette.spec.ts`） |
| 文档 | 第 127 轮的论断已就地更正（PHASE-1C 的族③ 摘要也加了更正行） |

### 六、教训

1. **写进文档的技术论断也要能复测。** 「检查是变多的」听着合理、当时四处也确实都过了 tsc ——
   但它把「碰巧都过」当成了「因为被检查所以过」。3 行对照实验就推翻了。
2. **代理量要标清是代理量**（见第二节末）。这是本轮真正的收获：比多清 1 处断言值钱。
3. **同一句 `unknown` 跳板可能有两种相反的用途**：第 127 轮那 4 处是「补上缺的成员」，
   `scene-tilemap-page.ts:210` 却是「丢掉一个错的声明」—— 后者换成交叉断言会更糟。
   ⇒ 判据不能只看形状，还要看**源类型对不对**。

## 第 129 轮（2026-09-22）：⚠️ 轴说 32，编译器说不行 —— 最终 35 → 33

本轮挑了三处「看着像谎话」的 `unknown` 跳板。最后两处修好、一处**必须保留**，
而保留的理由是**编译器**给的，不是推理给的。

### 一、先记最值钱的部分：一次「差点被骗过去」的改动

`YMTitleBar.vue:7`：

```ts
(window as unknown as Window & { Window?: { close(id?: string): void } }).Window
```

看着完全可以机械去 `unknown`（我当时的理由还写着「ui-kit playground 的 `App.vue:105` 一直这么写」）。
改成单个 `as` 之后，`vue-tsc` 直接报：

```txt
TS2352: Conversion of type '{ new (): Window; prototype: Window; }' to type
'{ close(id?: string): void }' may be a mistake because neither type sufficiently overlaps …
```

原因：`window` 的静态类型是 `Window & typeof globalThis` ⇒ **`window.Window` 静态上就是全局
`Window` 构造器**（`{ new(): Window; prototype: Window }`），它**不是**我们要的那个宿主 API
（那个是运行期用 `Reflect.set(window, 'Window', …)` 挂上去的，见 `window-object.ts:517`）。
所以这里的 `unknown` 是在**丢掉一个错的静态类型** —— 与 `scene-tilemap-page.ts:210` **同类**，
不是可机械改的那一类。写成 `window as Window & { Window?: … }` 同样被拒（那个成员与构造器同名不可比）。

⇒ 已改回 `unknown`，并把这条证据（含 TS2352 原文与「为什么」）写进就地注释，免得下一轮再试一次。
⇒ 附带收获：那句「playground 一直这么写」是**伪证据** —— `tsconfig.build.json` 只 `include`
`src/**`，**playground 根本不在类型检查范围内**。**没被检查过的先例不能当先例。**

### 二、两条真的修好了

**（1）`attachApi` 的契约过窄 → 放宽到 `object`**（第 124 轮 `clear()` 那种「契约说谎」）

```ts
export function attachApi<Api extends object>(el: HTMLElement, api: Partial<Api>): void {
	for (const key of Object.keys(api)) Reflect.set(el, key, …);
}
```

实现里只有 `Reflect.set(target, key, value)`，而 `Reflect.set` 对**任何对象**都成立 ——
`HTMLElement` 是**过窄**的契约。暴露它的是 `menu-api.ts`：那里的 `menu` 是菜单的**状态对象**
（一个对象字面量），根本不是元素，所以调用点被迫写 `menu as unknown as HTMLElement`。
放宽成 `object`：既有调用点**全部继续成立**（元素本来就是对象），跳板消失。

**（2）`scroll-bar-api.ts:164`：`thumb as unknown as ScrollThumb` → `thumb as HTMLDivElement & ScrollThumb`**

`ScrollThumb extends HTMLElement`（外加 `left`/`width`/`top`/`height` 四个 expando 字段），
而 `thumb` 就是 `document.createElement('div')` ⇒ 真实类型是「div **加上**那几个字段」。
交叉断言保住 div 的类型、只补缺口（单个 `as` 不行：`HTMLDivElement` 与 `ScrollThumb` 互不 assignable）。

### 三、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | 35 → **33**（files 30 → 28） |
| ⚠️ 过程值 | 中间一度显示 **32** —— 那是把第一节那处**不该改**的也改了的结果。**轴更小的那个数是错的** |
| `any-hatches` 等其余轴 | 持平 |
| `vue-tsc`（ui-kit `build:types`） / `tsc`（editor） | 0 / 0 |
| ui-kit 套件 / editor 套件 | 见提交说明（都跑过） |

### 四、教训

1. **「看着能机械改」必须过编译器那一关**，而且要留下记录：这次是 `vue-tsc` 拦下来的，
   不是我推出来的 —— 我当时的理由（playground 先例）是错的。
2. **没被检查过的先例不是先例**：`playground/` 不在 `tsconfig.build.json` 的 include 里，
   它写了什么都不能当证据。
3. **轴降了不等于改对了**（第 128 轮刚说过「轴是坏味道的代理量」，本轮就撞上了一次实例：
   只看台账会得到 32 这个更好看但错误的数字）。

## 第 130 轮（2026-09-22）：给 `any-hatches` 换一把**量得准**的尺子（并拆掉一把量不准的）

前几轮一直在 `unknown-casts` 上推进。本轮转向另一条类型轴 `any-hatches`（50 处 / 25 文件），
结果第一件事是**发现仓库现有的清单工具会指错地方**。

### 一、差点照着错清单去删声明

`scripts/any-hatch-inventory.mjs` 旧版按「站点行往上找最近的 interface」归属。我写了个实验
（把 50 处一次性摘掉、跑一次 tsc、按报错里的类型名归属，`unknown-casts` 那边这么干过、很有效），
结果 tsc 先报了一堆 **TS1005 语法错**：

```txt
src/palette/auto-tile.ts(51,14): error TS1005: ';' expected.   （连着十几行）
```

原因：`auto-tile.ts:49` 那一行**根本不是接口成员**，而是

```ts
export const AutoTile: Record<string, any> = {
```

—— **一个常量自己的类型注解**。把它注释掉，整个对象字面量就崩了。而旧清单把这一站归给了它
**上面**的 `AutoTileOpenParams`（`@L41`，一个毫不相干的类型）。**如果我照那张表去「删
`AutoTileOpenParams` 的签名」，删掉的是另一个声明。**

### 二、尺子换好了：先看种类，再归属

`any-hatch-inventory.mjs` 现在先读**站点自己的文本**：

| 种类 | 形态 | 归属到 |
| --- | --- | --- |
| `INDEX_SIG` | `[k: string]: any` | **它所在的那个接口**（原逻辑正确） |
| `RECORD_ANNOT` | `Record<string, any>` | 可能是常量注解 / 接口**成员**注解 / 类型别名 / 参数·返回类型；能认出 `const·let·var` 的归给**那个常量自己**，否则才退回上层声明 |

新增 `--kinds` 直接给两张表（宿主常量 / 宿主接口），默认模式打印**站点原文**（归属对错的判据就在这里）。

实测分布（50 处）：**`RECORD_ANNOT` 28 / `INDEX_SIG` 22**。其中 7 处是引擎空壳：

```ts
export const XEngine: Record<string, any> = {};
```

（`AnimationWindowEngine` / `AutoTileEngine` / `PaletteEngine` / `ParticleEngine` /
`SceneCameraEngine` / `SceneMarqueeEngine` / `UIEngine`），另有 `Palette` / `AutoTile` / `TileFrame`
三个遗留单例是「注解 + 一长串成员」。⇒ **引擎/单例这 10 处就是 ④ 那类「有类型的 facade」工作单**。

### 三、那把量不准的尺子已删（结论留在这里）

「一次性摘掉全部、按报错类型名归属」在这里**不成立**，两条原因都是实测的：

1. **两种站点的摘法不同**（删索引签名那一行 vs 去掉常量注解），混在一起直接把文件写成语法错误；
2. **代价出现在使用点**，而使用点散落全仓 ⇒ 「报错所在的文件」≠「声明的文件」，按文件归属也不成立。

⇒ 实验脚本已删除；**要量某一处的代价，只能单独摘、单独跑 tsc**（脚本已写明这条纪律）。

### 四、明确留着的：`YMParameterPane.vue` 的 5 处看着便宜、其实不便宜

该文件有 5 处 `HTMLElement & { [k: string]: any }`。`paneState` 的 14 个字段确实是运行期
`Object.defineProperty` 挂上去的（声明出来即可）—— 但读完全文发现 `self`/`el` 上还挂着
**11 个由编辑器挂的方法**：`getData` / `update` / `clear` / `recycle` / `createParamInput` /
`applyAffix` / `appendHeadPad` / `createDetailBox` / `updateParamDisplay` / `updateParamInput` /
`onResize`，而**这套元素 API 目前没有任何声明**（该目录只有 `ParamScriptListElement` 等子元素形状）。
要修得先设计这套方法签名 ⇒ 属于 ④ 那类 facade 工作，不该在这一轮半做。

### 五、账

| 项 | 结果 |
| --- | --- |
| `any-hatches` | 50 处**不变**（本轮**没有动业务代码**，只换尺子） |
| 其余轴 | 持平 |
| 工具 | `any-hatch-inventory.mjs` 增种类与正确归属（自证见第一节：旧归 `AutoTileOpenParams`，新归 `AutoTile`）；删掉量不准的批量实验脚本 |

### 六、教训

1. **工具指错地方比没有工具更危险**：那份清单精确到行号，看起来无懈可击，我差一点就照着它
   去删另一个声明。
2. **换轴之前先验那条轴的清单**：口径对了（台账与清单用的都是 `ANY_HATCH_RE`）**不等于归属对了**。
3. **在一条轴上很有效的实验法，换一条轴可能不成立**（摘法不同 + 代价在使用点）。
   方法论也得按轴重新验证 —— 这一条比本轮修掉任何一处都值钱。

### 七、⚠️ 方法论更正：上面两条「发现」，前几轮早就付过学费了

写完上面才想起来去翻 `PHASE-1C-TEST-PREREQ.md` —— 那条轴的沿革已经有 40 多轮，我自己以为的
「新发现」有两条**早已写在里面**：

- **第 63 轮**（第 3912 行）：「探针要按**站点形态**分批做。「索引签名」与「`Record<string, any>`」…」
  —— 正是本轮「两种摘法不同、不能混着批量做」的结论；
- **第 37 轮**：整批替换索引签名 → **788 个错误**；**第 64 / 39 轮**：`YMParameterPane` 的实测代价
  **41 / 71 个读点** —— 正是本轮「那 5 处不便宜」的结论；
- **第 89 轮**（第 4860 行起）已经列好 `Record<string, any>` 的 20 处 / 13 文件工作单，
  连「A 组 · 引擎命名空间对象 10 处（个位数就走本地窄类型）」都分好了组。

⇒ **教训（本轮最值钱的一条）：动手量之前，先读那条轴自己的沿革。**
`grep <轴名> packages/editor/PHASE-1C-TEST-PREREQ.md` 应该是开新轴的第一个动作 ——
本轮白花的时间，仓库已经用 40 轮记录替我付过了。

### 八、真正新的东西：清单的**归属**是错的，而且已经外溢成文档错误

上面那两条是重复劳动，这一条不是。旧 `any-hatch-inventory.mjs` 按「站点行往上找最近的 interface」
归属，于是：

| 站点 | 旧清单 | 实际是什么 |
| --- | --- | --- |
| `palette/auto-tile.ts:49` | 接口 `AutoTileOpenParams` @L41 | `export const AutoTile: Record<string, any> = {` —— **常量自己的类型注解** |
| `YMParameterPane.vue:164 / 201 / 982` | `Props`（L130 接口） | 组件内的 `let el`、`attachStateAccessors` 的**形参**、`self` —— **没有一个是 `Props` 的成员** |

第二行那处**已经写进了文档的工作单**（PHASE-1C 第 4821 行：「`YMParameterPane.vue` 3 处 ——
`Props`（L130 接口 / L164、L201、L971 站点）」）⇒ 错归属**早已外溢成文档错误**。

证据链（三条，互相独立）：
1. 旧清单输出如上；
2. 我照旧清单去删，`tsc` 直接报 **TS1005 语法错**（证明那一行是**声明行**，不是接口成员）；
3. 新清单对同一站点给出 `[RECORD_ANNOT] 归属 AutoTile (export) @L49`。

⇒ 已修：按**站点自身文本**分 `INDEX_SIG`（接口里的索引签名）/ `RECORD_ANNOT`（注解），
常量站点归给**它自己**，默认输出带**站点原文**（归属对不对，判据就在原文里），并加 `--kinds` 汇总。
实测分布：**`RECORD_ANNOT` 28 / `INDEX_SIG` 22**；其中 7 处是引擎空壳
（`AnimationWindowEngine` / `AutoTileEngine` / `PaletteEngine` / `ParticleEngine` /
`SceneCameraEngine` / `SceneMarqueeEngine` / `UIEngine` —— 与第 89 轮「A 组 10 处」对得上）。

## 第 131 轮（2026-09-22）：`any-hatches` 50 → 49 —— 照仓库自己的工作单做，并量出「便宜的那个只有一个」

### 零、先做上一轮学到的那件事：动手前先读那条轴的沿革

这次先读了 PHASE-1C 的 `any-hatches` 工作单（第 89 轮那份）。它直接给了：A 组 10 处的路径、
两条「试过并回退」的记录、以及「camera / marquee 是真承重，别当白捡」的警告。

**这一读立刻省掉两次白干**：
- `ParticleEngine` 被列入 A 组，但**第 63 轮已经试过并回退**（它的成员引用文件下方的 class，
  存在「先建空壳、等下面声明完再挂」的时序依赖）⇒ 不重试；
- `scene-camera-engine` / `scene-marquee-engine` 是第 65 轮实测的**真承重**（≈30 个字段）⇒ 跳过。

### 一、先把 A 组 10 处的「成员个数」量出来（脚本实测）

| 对象 | 文件行数 | 挂载点 |
| --- | ---: | ---: |
| `engine/animation/animation-window-engine.ts` | 839 | **29** |
| `engine/palette/palette-engine.ts` | 730 | **22** |
| `engine/particle/particle-engine.ts` | 1311 | 3 ← **第 63 轮试过并回退，别重试** |
| `engine/scene/scene-camera-engine.ts` | 192 | 12 ← 计划已警告「真承重」 |
| `engine/scene/scene-marquee-engine.ts` | 196 | 10 ← 同上 |
| `engine/ui/ui-engine.ts` | 677 | **25** ← ④ 相关 |
| `palette/auto-tile.ts` | 974 | **47** |
| `palette/tile-frame-index.ts` | 375 | 13 |
| `palette/palette.ts` | 142 | 0（成员分散在**其他文件**里挂 ⇒ 组装式单例） |
| `engine/palette/auto-tile-engine.ts` | 141 | **5** ✅ 本轮拿下 |

⇒ **「个位数就走本地窄类型」这条判据，在 A 组 10 处里只对 1 处成立。** 其余都是十到几十个成员的
命名面（逐成员枚举那一档），`palette.ts` 更是跨文件的组装式单例。

### 二、拿下 `auto-tile-engine.ts`（5 个成员）

做法：声明**本地成员表** `AutoTileEngineShape`（5 个成员，各带 `this: typeof AutoTile`），
`export const AutoTileEngine = {} as AutoTileEngineShape;`，**5 个实现一行不动**。

为什么保留赋值式写法而不是改成对象字面量：`scene-draw-engine.ts` 第 63 轮那个成功案例的前提是
「成员全是上方 import 进来的函数」；这里的成员是**内联函数表达式**。两种都可行，但保留赋值式能把
改动**限制在声明上**（diff 只有声明与注释），风险最小。

顺手删掉上方那行 `// oxlint-disable-next-line no-explicit-any` —— 第 38 轮立的规矩：删签名必须
一并删豁免注释，否则 `stale-exemptions` 会多出一处。实测该轴**保持 0** ✓。

### 三、⚠️ 本轮真正值得记的一手：`any` 还压着一个 **lint** 信号

声明成员表之后，`lint` 从 0 变成 **5 个警告**：

```txt
typescript(unbound-method) @ packages/editor/src/palette/auto-tile.ts:110–114
```

—— 正是那 5 行「逐条镜像」（`AutoTile.updateCanvas = AutoTileEngine.updateCanvas;` …）。
`AutoTileEngine` 还是 `Record<string, any>` 时，这 5 个引用是 `any`，规则**看不见**；
成员一旦有了类型，规则立刻认出「这是方法引用」并警告 `this` 可能丢。

**运行期没有问题**（那 5 个函数本来就靠调用点 `AutoTile.x()` 提供 `this`），但这说明：
**索引签名 / `any` 不只在 `tsc` 上开洞，也在 lint 上开洞。** 类型轴的收益不止类型检查。

修法（而不是加 5 条 disable 注释）：把成员表从**方法简写**改成**函数属性**
（`x: (this: T, …) => R`）—— 它们本来就是「赋值上去、被逐条搬运的函数值」，不是方法；
属性写法保留 `this` 约束与全部参数检查，且不触发 `unbound-method` ⇒ `lint` 回到 0。

### 四、账

| 项 | 结果 |
| --- | --- |
| `any-hatches` | **50 → 49**（files 25 → 24；基线已固化） |
| `stale-exemptions` | 0 持平（豁免注释与签名同时删） |
| `tsc` / `lint` / `format:check` / `text:check` / `docs:check` / `migration:selftest` | 0 / 0-0 / 0 / 0 / OK / 58/58 |
| editor 套件 | **255 文件 / 2074 用例全绿** |
| 改动性质 | **纯类型擦除**（`git diff -U0` 只有声明与注释） |

### 五、教训

1. **先读沿革 = 直接拿到「哪几个别碰」。** 本轮靠它跳过了 `ParticleEngine`（第 63 轮已回退）
   与 camera / marquee（第 65 轮实测承重）—— 上一轮记的那条教训，(这轮就换回两次白干)。
2. **别人的判据要按对象量一遍再用。** 「个位数就走本地窄类型」听着像一条通用规则，
   实测在 A 组 10 处里只对 1 处成立。
3. **类型轴与 lint 是一条绳上的**：`any` 静默掉的不只是类型错误。⇒ 汇报口径应当包含
   「lint 是否因此能看见新东西」（本轮就是能：5 条 `unbound-method`）。

## 第 132 轮（2026-09-22）：`any-hatches` 49 → 48 —— 一处拿下，另一处**验证了计划是对的**

### 一、先挑「空壳 + N 个方法」那一族

A 组剩下的对象里，空壳型（`= {}` 后面挂方法）的成员个数（实测，脚本按
`^\s*\w+\.\w+\s*=\s*(function|\()` 去重计数）：

| 对象 | 成员数 | 备注 |
| --- | ---: | --- |
| `engine/palette/auto-tile-engine.ts` | 5 | 第 131 轮已拿下 |
| `engine/scene/scene-marquee-engine.ts` | **10** | 本轮拿下 |
| `engine/scene/scene-camera-engine.ts` | **8** | 本轮试过并回退（见第三节）。⚠️ 此前记的「12」是把 `this.scrollCenterX = (…)` 这类**带括号的赋值**误计进去了 |
| `engine/palette/palette-engine.ts` | 22 | 逐成员枚举档 |
| `engine/ui/ui-engine.ts` | 25 | ④ 相关 |
| `engine/animation/animation-window-engine.ts` | 29 | 逐成员枚举档 |

另一类是**有数据字段的组装式单例**（`palette/auto-tile.ts` 47 个成员、`palette/palette.ts` 的成员
分散在其他文件里挂），与 `SceneShape` 同类。
引用数（全仓实测）：每个成员只被引用 **2–6 次**，形态都是「1 处定义 + 1 处镜像」⇒ 看着都很便宜。

### 二、拿下 `SceneMarqueeEngine`（10 个成员）

手法与第 131 轮同：声明本地成员表 + `{} as`，**10 个实现一行不动**；成员写成**函数属性**
（第 131 轮的结论：方法简写会让 `unbound-method` 在镜像点报警）⇒ 实测 `lint` 保持 0。

它的 `this` 是 `typeof Scene.marquee` —— 一个**独立**的松散对象；实现里的默认值取自 `this.x` 等
（走索引签名 ⇒ 推断为 `any`），所以形参声明成 `number`/`string` 后实现侧照样可赋，
而 `scene.spec.ts` 里那 4 处 `.call(Scene.marquee, 5, 10, 20, 30)` 本来就传数字 ⇒ 零级联。

### 三、⚠️ 接着试 `SceneCameraEngine`：撞上了计划预告的那堵墙 —— **我的估计错了**

我原本的推断是：计划把 camera / marquee 标成「真承重（≈30 个字段、含写入）」，
说的是**窗口**（`this`）那边的成本；而我只声明引擎自己的成员表（`this: typeof Scene` 原样不动），
应该同样便宜。marquee 确实便宜，**camera 不是**。声明之后 `tsc` 立刻报：

```txt
src/engine/__tests__/scene.spec.ts(399,65): error TS2345: Argument of type
'{ …63 more…; renderingFunction: Mock<…> }' is not assignable to parameter of type 'SceneShape'.
  … missing the following properties from type 'SceneShape': page, head, body, searcher, and 18 more.
```

原因：`scene.spec.ts:361` 用 `vi.mock('@app/scene/scene-window.ts', () => ({ Scene }))` 把
scene-window **换成了一个部分 mock**。而 camera 引擎的成员签名是 `this: typeof Scene`
⇒ 类型一旦落地，`.call(Scene, …)` 就要求那个 mock 满足**整个** `SceneShape`（它缺 22 个成员）。
**这正是计划说的「≈30 个字段」**：camera 的成员读的是真窗口的字段，要让它们可被 mock 满足，
就得给每个成员写**只包含它真正读的那些字段**的本地窄 `this` 类型（8 个成员各 5–15 个字段，
还牵到 `this.getGridContext()` 这类方法）—— 那才是这一处的真实成本。

⇒ **已回退**（`git checkout`），并如实记下：本轮假设「计划的警告对引擎成员表不适用」，
在 marquee 上对、在 camera 上**错**。两处的差别**不在成员个数，而在 `this` 指向谁**：

| | 成员签名的 `this` | 测试/调用点手里是什么 | 结果 |
| --- | --- | --- | --- |
| `SceneMarqueeEngine` | `typeof Scene.marquee` | 就是那个对象（`Scene.marquee`） | 便宜 ✅ |
| `SceneCameraEngine` | `typeof Scene` | 一个**部分 mock**（缺 22 个成员） | 贵 ❌ |

⇒ **判据修正**：看 `this: typeof Y` 里的 **Y 是不是「调用点/测试手里本来就有的那个对象」**，
而不是看成员个数。

### 四、账

| 项 | 结果 |
| --- | --- |
| `any-hatches` | **49 → 48**（files 24 → 23；基线已固化） |
| `stale-exemptions` | 0 持平（豁免注释与签名同时删） |
| `tsc` / `lint` / `format:check` / `text:check` / `docs:check` / `migration:selftest` | 0 / 0-0 / 0 / 0 / OK / 58/58 |
| editor 套件 | 255 文件 / 2074 用例全绿 |
| 回退 | `scene-camera-engine.ts` 已 `git checkout` 还原（无残留） |

### 五、教训

1. **判据要按 `this` 指向谁分，而不是按成员个数分**（第三节那张两行表）。
2. 「先量再动手」也要**量对指标**：我量了成员个数（对了），但真正的成本在 `this` 的满足关系上（量错了）。
3. **回退也要留证据**：这一处现在有明确的「为什么不能机械改」（tsc 原文 + mock 的位置 + 两处对照表），
   下一轮不会有人再试一次 —— 这正是第 41 轮「先读沿革」想避免的浪费。

## 第 133 轮（2026-09-22）：**不降轴的一轮** —— 补齐那把量单处的尺子，并把最大一处的底数重新量清

本轮**没有改业务代码**（`any-hatches` 48 持平）。交的是三样东西：一把可复用的尺子、
一份**决策就绪**的底数、以及「下一处该拿哪个」的确切理由。

### 一、先把尺子补齐：`scripts/oneoff/measure-any-hatch-site.mjs`

第 130 轮的「一次摘全部」被证伪（两种摘法混在一起会把文件写成语法错误；代价出现在**使用点**，
「报错文件」≠「声明文件」），当时的结论是「要量某一处，只能单独摘、单独跑 tsc」——那把尺子本轮补上了：
按**站点种类用对应的摘法**（索引签名=注释掉那一行；注解=去掉 `: Record<string, any>`），
摘**一处** → 跑一次 tsc → 按「错误码 / 属性名 / 文件」三张表归类 → **写回原样并逐字复核**。

```bash
node scripts/oneoff/measure-any-hatch-site.mjs <相对路径> <行号>
```

### 二、重新量计划里「剩下的最大一处」：`UINodeShape` 的索引签名

```bash
node scripts/oneoff/measure-any-hatch-site.mjs packages/editor/src/engine/ui/element-classes.ts 141
```

实测：**79 条报错，全部是 `TS2339`（属性不存在）**，落在 **20 个字段 / 10 个文件**上：

| 字段 | 处数 | 字段 | 处数 | 字段 | 处数 |
| --- | ---: | --- | ---: | --- | ---: |
| `transform` | 14 | `enabled` | 6 | `printer` | 3 |
| `instance` | 13 | `node` | 3 | `_font` | 2 |
| `presetId` | 13 | `parent` | 3 | 其余 11 个字段各 1 处 | 11 |
| `instances` | 10 | | | | |

文件集中度：`ui-engine` 16 · `ui-transform` 16 · `ui-pointer` 12 · `ui-initialize` 11 · `ui-slots` 8 ·
`ui-file` 6 · `ui-list` 4 · `ui-prefab` 3 · `usePresetElementWindow` 2 · `ui-events` 1。
（与第 117 轮记的「79 处 / ~20 字段 / 11 文件」**逐项对上**，文件数本轮读到 10 —— 差的那一个应是统计口径。）

⚠️ **本轮最值钱的读数：这一阶段 `0` 条可空解引用**（没有 `TS18047` / `TS2531`）。
计划里那句「14 处 `matrix` / `parent` 可空却被直接解引用」**不会在删索引签名这一步出现** ——
它们要等那些字段**被声明成可空类型之后**才浮出来。⇒ 与计划的判断一致（这一处**卡在一个需要实机的
裁决**上），但**顺序**必须写清：**先声明字段 → 才会看见可空问题**。
所以「79 处」**不是**「79 个机械补声明」；把工期按纯机械估会估错。本轮只刷新底数并留档，
这一处仍按计划与 ④ 一起处理。

### 三、顺带产出：剩余引擎壳的「cascade 风险表」（第 132 轮那条判据的落地）

判据（第 132 轮）：看 `this: typeof Y` 里的 **Y 在调用点/测试手里是不是一个能被类型满足的对象**。
于是把每个引擎 spec 的 mock 形态查了一遍：

| 引擎 | 成员数 | spec 里喂给 `this` 的实参 | 结论 |
| --- | ---: | --- | --- |
| `auto-tile-engine` | 5 | 无 `.call` 调用点 | ✅ 已拿下（第 131 轮） |
| `scene-marquee-engine` | 10 | 真 `Scene.marquee` | ✅ 已拿下（第 132 轮） |
| **`palette-engine`** | 22 | `const palette: any = { … }`（**`any` 型 mock**） | 🟡 **cascade 无风险**；剩下的是 22 个签名的抄写活 |
| `scene-camera-engine` | 8 | 具体的部分 `Scene` mock | ❌ 已试过并回退（第 132 轮） |
| `animation-window-engine` | 29 | `vi.mock(… Animation: { … })` 具体对象字面量 | ❌ 预计同 camera（未试） |

⇒ **下一处该拿的是 `palette-engine`**，而且它是唯一「cascade 无风险」的 —— 代价明确写在表里（22 个签名）。

### 四、账

| 项 | 结果 |
| --- | --- |
| `any-hatches` / `unknown-casts` | 48 / 33 **持平**（本轮不改业务源码） |
| 新增 | `scripts/oneoff/measure-any-hatch-site.mjs`（可复用；自动写回并逐字复核） |
| `lint` / `format:check` / `text:check` / `docs:check` / `migration:selftest` | 0-0 / 0 / 0 / OK / 58/58 |
| 测试套件 | 未跑（无源码改动） |

### 五、教训

1. **顺序也是结论的一部分。** 「14 处可空解引用」不在删签名那一步出现（本轮实测 0 条），而在
   **声明字段之后**。同一句话，写成「79 处待补声明」和写成「79 处里有一步需要决策、且它排在声明之后」
   会让下一批人估出完全不同的工期。
2. **「不降轴的一轮」也得交东西**，而且要交**能改变下一轮决策**的东西：本轮是
   「一把能单独量任意站点的尺子」+「最大一处的分字段底数」+「下一处（`palette-engine`）与确切理由」。
3. 量完立刻**写回并复核**（脚本里 `try/finally` + 逐字比对）—— 第 37 轮那次「探针删错行」的事故
   就是没有这一步。

### 六、尺子的边界：`type X = Record<string, any>` **不可机械测量**

复测探针时随手量了 `useSetStringCommandSchema.ts:15`（`export type SetStringOperand = Record<string, any>`），
探针**拒绝执行**——这是对的，现在它会把理由说清：

> 类型别名必须指向某个类型，换任何具体类型都会改变测量结果 ⇒ 属设计工作，不能机械测。

⇒ 这条边界值得写进工具本身（已写），也值得记在这里：**「这一处量不出来」本身就是一个结论** ——
它把该站点从「待测量」直接划到「待设计」（第 89 轮的工作单正是这么标注它的）。

顺带量到的两个参考值（供下一批挑活）：
- `palette/tile-frame-index.ts:13`（`export const TileFrame: Record<string, any> = {…}`）：摘掉注解
  **82 条**报错，且**错误码混杂**（`TS2339` 39 · `TS2322` 18 · `TS2769` 10 · `TS2721` 6 ·
  `TS2345` 4 · `TS2531` 3 · `TS2349` 2）—— 混杂说明它不只是「补声明」，还牵动赋值与可空 ⇒ **贵**。
- `scene-marquee-engine.ts` / `auto-tile-engine.ts`（已拿下）当时是**零报错**。

### 七、⚠️ 附带发现：全仓 **172 个文件带 UTF-8 BOM**（不是孤例）

复核探针写回时，字节级检查在 `useSetStringCommandSchema.ts` 上看到 `BOM=True`。于是把扫描面
（`packages/editor/src`、`packages/ui-kit/src`、`packages/editor/main`、`scripts`）整体扫了一遍：

```txt
带 BOM 的文件数 = 172
```

分布很有特征：**`composables/commands/*` 那一批命令 schema 几乎整族都在里面**，另有
`components/common/*`、`stores/*`、以及若干 `__tests__`。⇒ 像是**某次批量写入**留下的，
而不是零散编辑（第 125 轮我只抽查过自己动过的文件，全是无 BOM，于是误以为「仓库是纯无 BOM」）。

怎么看待它：
- **对工具链无害**：`tsc` / Vite / esbuild / vitest / oxfmt 都会忽略文件开头的 BOM，
  `oxfmt` 也认为它们「格式正确」（`format:check` 全绿），所以**没有任何门禁看得见它**；
- **但它是隐形的差异源**：改写同一个文件时，BOM 的有无会变成 diff 里的噪声（甚至让「我改了什么」
  这句话变难回答）；本会话新建的文件都是无 BOM，于是仓库现在是**混着**的。
- ⇒ 处理方式有两条，**都超出「本轮顺手能做完」的范围，摆在这里等人决定**：
  (a) 一次性剥掉 172 个 BOM（纯字节改动，`tsc`/产物逐字节等价，但会产生 172 文件的 diff，
      在迁移中途做会淹没真正的改动）；
  (b) 给台账加一条 `bom-files` 轴（`不增`，基线 172），先**止住扩散**、再逐批收 ——
      这正是本仓对「只许减少的清收」惯用的做法（如 `dom-on-exempted`）。

### 八、教训（补）

4. **「仓库整体是什么状态」不能靠抽查自己动过的文件来推断**：第 125 轮我只查了手改的文件
   （全无 BOM），就得出了「仓库是纯无 BOM」的印象；本轮全扫才发现 172 个带 BOM。
   ⇒ 凡是要写进文档的全仓断言，都要**全扫**（与第 133 轮第一节那条「顺序」并列）。
5. **工具的拒绝要带理由**：探针第一次只说「没找到可摘的注解」，读的人会以为工具坏了；
   现在它直接说明「类型别名不可机械摘」——**把边界写进工具，比写进文档更容易被下一批人读到**。

## 第 134 轮（2026-09-22）：`any-hatches` 48 → 47 —— 拿下 `palette-engine`（20 个成员）

### 一、按第 133 轮那张风险表挑中它

风险表（第 133 轮）说：`palette-engine` 是剩余对象里**唯一「cascade 无风险」**的 —— 因为它的 spec
把 mock 声明成 `const palette: any`。拿之前把这条**量实**（不再靠推断，第 132 轮的教训）：

- `palette.spec.ts:133` `const palette: any = { … }` ✓；调用点是
  `.call(palette, new PointerEvent('pointerdown'))` —— 传的是**真的** `PointerEvent` ✓；
- 20 个成员互不引用，也不引用文件下方的声明；`MarkPosition` / `MarkCanvasShape` 是**类型**，
  类型可以前向引用 ✓（第 63 轮 `ParticleEngine` 回退的原因正是「引用文件下方的 **class**」，
  与这里不同）。

### 二、做法与读数

成员表写成**函数属性**、`{} as PaletteEngineShape`，**20 个实现一行不动**，豁免注释与签名同时删。
三个返回类型不是猜的，是从实现里读出来的（这也省掉了「先报错再补」的来回）：

| 成员 | 返回类型 | 依据 |
| --- | --- | --- |
| `getTileCoords` | `{ x: number; y: number }` | IIFE 闭包里的 `point`，`return point` |
| `createMarkCanvas` | `MarkCanvasShape` | 建 `canvas` 后挂上 `fontSize`/`entries`/`positions`/`totalWidth`，`return canvas` |
| `ensureMarkPosition` | `MarkPosition` | `return existing` / `return position`，两者都是 `MarkPosition` |

读数：`tsc` 0 · `lint` 0（**没有** `unbound-method` —— 函数属性写法第二次被验证有效）·
`any-hatches` **48 → 47**（files 23 → 22）· `stale-exemptions` 0 · editor 套件全绿。

### 三、顺手更正一个计数：这处是 **20** 个成员，不是 22

第 133 轮那张表里写的是「palette-engine 22」，那是按**赋值行**数的；按**唯一成员名**去重后是 **20**。
差的 2 个是成员体内部 `this.xxx = (…)` 这类**带括号的赋值**被正则误计（与第 132 轮 camera 的
「12 vs 8」是同一个坑）。⇒ **量成员数一律按唯一名字去重**，别用匹配次数。

### 四、账

| 项 | 结果 |
| --- | --- |
| `any-hatches` | **48 → 47**（files 23 → 22；基线已固化） |
| `stale-exemptions` | 0 持平（豁免注释与签名同删） |
| `tsc` / `lint` / `format:check` / `text:check` / `docs:check` / `migration:selftest` | 0 / 0-0 / 0 / 0 / OK / 58/58 |
| editor 套件 | 255 文件 / 2074 用例全绿 |

### 五、教训

1. **「先量再动手」这条纪律第一次完整闭环**：第 133 轮量出风险表（含「下一处该拿哪个、为什么、
   代价是什么」）⇒ 本轮只是**执行**它。这条链值得作为后续轴工作的标准流程。
2. **计数口径要写死在工具/脚本里**：成员数按唯一名字，别按匹配次数 —— 同一个坑连续两轮出现
   （第 132 轮 camera 12→8、本轮 palette 22→20），说明「顺手 grep 出来的数」不能直接进文档。
3. 类型可以前向引用、class 不可以 —— 这正是第 63 轮 `ParticleEngine` 回退的原因，
   也是本轮敢在文件顶部声明成员表的依据。

## 第 135 轮（2026-09-22）：`unknown-casts` 33 → 31 —— 一行**漏掉的声明**消掉两处断言

### 一、先证伪一个「看着多余的断言」（它其实是承重的）

本轮上手的是 `command-list.ts:51`：

```ts
settingConfig: SettingConfig as unknown as { config: { other: { copyAsTextKeepEmptyLine: boolean } } },
```

而 `SettingConfig.config` 是 `Record<string, any>`（`setting-config/index.ts:16`）—— **看起来**链条末端
自然是 `any`，断言似乎纯属多余（那正是第 106 轮清掉过的那一类）。于是先做控制实验：

```ts
declare const loose: Record<string, any>;
const strict: { other: { flag: boolean } } = loose;
// → error TS2741: Property 'other' is missing in type 'Record<string, any>'
//                  but required in type '{ other: { flag: boolean; }; }'
declare const anyVal: any;
const viaAny: { other: { flag: boolean } } = anyVal; // → 通过
```

⇒ **索引签名不满足「必填属性」**（可赋值性只看真实属性，不认索引签名），而 `any` 满足一切。
所以那处断言是**承重的**：它把 schema 驱动的松散 `config` 桥到 ui-kit 真正读得到的形状
（契约在 `command-api.ts:231`，读点在 `:2092`）。**留档并保持不动。**

⚠️ 这条同时给「多余断言」划出了边界：**只有 `any` 源的断言才真多余**；
`Record<string, any>` 源去断言一个「带必填成员」的目标，是被 TS2741 挡住的，删了必红。

### 二、真正的发现：一行**漏掉的声明**

`variable/variable.ts:158–163` 连着 6 条挂载：

```ts
Variable.list.saveScroll = Variable.list_saveScroll;          // 直接赋值，通过
Variable.list.restoreScroll = Variable.list_restoreScroll;    // 直接赋值，通过
Variable.list.cancelSearch = Variable.list_cancelSearch;      // 直接赋值，通过
Variable.list.createFolder = Variable.list_createFolder;      // 直接赋值，通过
(Variable.list as unknown as { createVariable: () => unknown }).createVariable = …   // 只有这条要断言
```

差别不在断言技巧，在**声明**：`YamiElementApi`（ui-kit `element-contract.ts`）里
`saveScroll` / `restoreScroll` / `cancelSearch` / `createFolder` 都有，**`createVariable` 漏了**。
⇒ 补上那一行（就写在 `createFolder` 下面，同一批「运行期挂载的列表方法」，沿用该处
`(...args: unknown[]): Loose` 的写法）：

```ts
createVariable(...args: unknown[]): Loose;
```

⇒ **两处断言整条消失**（不是缩短）：`variable.ts:162`，以及 `list-events.ts:47`
—— 后者的断言一口气列了 7 个成员，而 7 个**全在接口里**，只差这一个。

### 三、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **33 → 31**（files 28 → 26；基线已固化） |
| `any-hatches` | 47 持平 |
| `vue-tsc`（ui-kit `build:types`） / `tsc`（editor） | 0 / 0 |
| ui-kit 套件 / editor 套件 | 见提交说明（ui-kit 被改动 ⇒ 两个都跑） |

### 四、教训

1. **「看着多余」要先证伪再删。** `Record<string, any>` 源**不**满足必填属性目标（TS2741 实测）
   ⇒ 那种断言承重。本轮靠一个 6 行的控制实验把「该删还是该留」变成了事实问题。
2. **缺的往往不是断言技巧，是一行声明。** 信号极强：**同一个对象的同一批挂载**里
   4 条直接通过、1 条要断言 ⇒ 把「要断言的那条」与「不用断言的邻居」对一下，
   看接口里少的是哪一行。这是第 122 轮那条判据（「同文件里已有一处更弱的写法」）的加强版 ——
   那次是**同文件**，这次是**同一个对象、同一批挂载**。
3. **「改声明」的收益是成对的**：一行声明消掉两处断言（这里甚至消掉了一个列了 7 个成员的断言）。
   ⇒ 挑活时优先找这类，而不是逐处改断言。

## 第 136 轮（2026-09-22）：`unknown-casts` 31 → 30 —— 把三处「必须保留 `unknown`」的注释**实测**分开

顺着上一轮那条线（缺声明 ⇒ 断言），本轮去查那些**写着「这里必须保留 `unknown`」的注释** ——
第 113 轮立过规矩：**注释里的「必须」也要被量过**。一次抽检三处，结论分成三种，这比「又降一处」值钱：

| 站点 | 注释怎么说 | 实测结论 |
| --- | --- | --- |
| `transition-window.ts:187` | 「`typeof Easing.list` 解析出来是字面量 `null`…要拆得先给 `Easing.list` 一个真实声明（类型设计活）」 | ❌ **注释是错的**（描述的是更早的声明状态）⇒ 已拆、已改写注释 |
| `eslints.ts:63` | （原先**没有**注释） | ✅ 真的承重，但理由与**旁边**那条注释说的不是同一件事 ⇒ 就地补上实测理由 |
| `menu-list.ts:58–64` | 「那次 `unknown` 跳板不是必需，只是把同一个收窄写了两遍」 | ✅ 注释准确（解释第 122 轮删掉的那个调用点，并说明现在只需单次 `as`） |

### 一、`transition-window.ts`：注释里的理由是**过时**的

原注释写着这处「**只能**保留 `unknown`」，理由是「`typeof Easing.list` 解析出来是字面量 `null`，
与 `YamiElement` 完全不可比」。于是先做「干脆不断言」的实测：

```txt
src/data/transition-window.ts(187,2): error TS2322: Type 'YamiElement' is not assignable to type
'(HTMLElement & YamiElementApi & { read: …; rename: …; restoreSelection: …; …5 more…;
  clear: () => void }) | null'
```

⇒ 真实阻塞是**缺那 9 个成员**（`read` / `rename` / `restoreSelection` / `addNodeTo` / `deleteNode` /
`select` / `update` / `saveSelection` / `clear`），**与 `null` 毫无关系** —— 形状里 `list` **早就有**
真实声明了（`transition-window.ts:83`）。注释错在：它描述的是**更早**的声明状态（那时 `list: null`），
后来声明改好了，注释没跟上。

修法：手法库第 6 条交叉断言 —— `Easing.list = list as NonNullable<typeof Easing.list>;`
（保留 `YamiElement`、只补缺口那一支）⇒ 断言消失，注释按实测重写。

### 二、`eslints.ts:63`：承重，但理由不是旁边注释说的那个

同文件另一处（`:173`，`renderedRowsOf` 里）写的是「`Element[]` 与 `CommandItemElement`
索引签名不可比，缺 253 个属性」。本轮顺手量了 `:63` 这处（原先**没有**注释），去掉 `unknown` 后
tsc 报的是**另一件事**：

```txt
src/module/eslints.ts(63,4): error TS2352: Conversion of type '(...args: any[]) => any' to type
'CommandListShape' … neither type sufficiently overlaps
```

⇒ `CommandList.prototype.elements` 的静态类型是 `(...args: any[]) => any`（**类侧是松散类型**），
所以这处的 `unknown` 承重。已就地补上这条实测理由（第 123 轮：**试错结论也算留档**）。

### 三、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **31 → 30**（files 26 → 25；基线已固化） |
| 就地注释 | 1 处**改写**（理由按实测重写）+ 1 处**新增**（原先没有理由） |
| `tsc` / `lint` / `format:check` / `text:check` / `docs:check` / `migration:selftest` | 0 / 0-0 / 0 / 0 / OK / 58/58 |
| editor 套件 | 见提交说明 |

### 四、教训

1. **「必须保留 `unknown`」的注释会过期。** 声明改好之后，旧理由可能已经不成立 —— 本轮 `:187` 就是
   （注释说「解析出来是 null」，而声明早已不是）。⇒ 值得定期做**「注释 × 实测」抽检**，
   成本约 40 秒/处（一次编辑 + 一次 tsc 往返）。
2. **抽检的价值在「把三种结论分开」**，不在于每次都能降一处：真的承重（补上理由）/ 注释过时（修掉）/
   注释准确（放过）。本轮三处正好各占一种 —— 这本身就是可复用的判据。
3. **别把一条注释套到两处上**：同文件里两处 `unknown` 的理由完全不同（一处是索引签名不可比、
   一处是类侧松散类型）。第 123 轮那条注释只对 `renderedRowsOf` 有效。

## 第 137 轮（2026-09-22）：`unknown-casts` 30 → 29 —— 顺手查出一个**守卫从未生效**的真 bug

### 一、起因：抽检轮到下一处

第 136 轮定下的手法「注释 × 实测」抽检，本轮轮到 `engine/scene/scene-animate-engine.ts` 的
`hasRenderableCanvas()`：

```ts
const screen = Scene.screen as unknown as HTMLCanvasElement | null | undefined;
return screen !== null && screen !== undefined && screen.width !== 0 && screen.height !== 0;
```

把断言去掉之后 **tsc 一声不响**（`GL` 与 `Scene` 在这一面上都是 `any`）—— 按第 123/128 轮的判据，
「来源与目标不重叠」这条理由站不住。于是不再争论注释，直接去查真值。

### 二、查出来的不是「多余断言」，是**恒真的死守卫**

`Scene.screen` 究竟是什么？`scene-window.ts:87` 声明 `screen: YamiElement`，两个初始化点取的都是
`sceneEls.get('scene-screen')`；而它在 `components/layout/LayoutPanel.vue` 里长这样：

```html
<div class="box" id="scene-screen" :ref="registryRef(sceneEls, 'scene-screen')" tabindex="-1" …>
```

**是 `div`，不是 canvas。** div 没有 `width` / `height` 属性（内容宽度得读 `clientWidth`），
于是 `screen.width` 是 `undefined`：

```txt
screen !== null        ⇒ true
screen !== undefined   ⇒ true
undefined !== 0        ⇒ true     // width
undefined !== 0        ⇒ true     // height
```

⇒ `hasRenderableCanvas()` **恒返回 `true`**：那条「画布退化为 0×0 时跳过绘制，免得持续刷
`GL_INVALID_FRAMEBUFFER_OPERATION: Attachment has zero size`」的守卫**从未生效过**，
而 `as unknown as HTMLCanvasElement` 正是把这次误读圆过去的那层纸。

真画布在 `GL.canvas`：`webgl-init.ts:29` 用 `document.createElement('canvas')` 造它（初值就是
`0×0`），`layout.ts:1388` 把它插进 DOM，`webgl-methods.ts:1509` 在上下文丢失时又把它置回 `0×0`。
同族早就有正确写法可对照：`palette-engine.ts:262`、`sprite.ts:410` 都是拿 canvas 自己的
`width`/`height` 判零。

修法（**断言与 bug 一起消失**，且不需要任何新断言 —— `GL` 是 `any` 面）：

```ts
const canvas = GL.canvas;
return canvas.width !== 0 && canvas.height !== 0;
```

### 三、红 / 绿自证（第 128 轮的规矩：自证必须**真的跑过**）

`scene.spec.ts` 里 `Scene.screen` 的 mock 本来就是这个形态 —— 只有
`clientWidth`/`clientHeight`，**没有** `width`/`height`（`scene.spec.ts:270`），等于已经把真实
div 录下来了，正好拿来当复现件：

```ts
GL.canvas.width = 0; GL.canvas.height = 0;
SceneAnimateEngine.updateAnimation!.call(Scene, 0);
expect(drawScene).not.toHaveBeenCalled();   // ← 未修实现在这里红
```

先写用例、对**未修**实现跑 ⇒ 红，且红的地方正是断言行：

```txt
FAIL src/engine/__tests__/scene.spec.ts > SceneAnimateEngine > updateAnimation 在真画布 0×0 时跳过绘制
AssertionError: expected "vi.fn()" to not be called at all, but actually been called 1 times
Tests  1 failed | 20 passed (21)
```

修完再跑 ⇒ **21/21 绿**（另 20 条全程绿，说明给 GL mock 补 `canvas` 是惰性改动）。

这里有个**假绿陷阱**记下来：如果把 mock 写成「`Scene.screen` 干脆不存在」，旧实现会因为
`screen !== undefined` 直接 return false 而**通过**（守卫绕过了、结果巧合一致）。所以这条用例的
关键不是「画布为 0」，而是**让 `Scene.screen` 保持 div 形态** —— 复现真实形态才有红。

### 四、行为边界（改的是渲染循环，必须写清楚）

`stageRendering` 是**一次性** updater：`timer.ts:193-195` 调用之后立刻 `updaters.stageRendering = null`。
所以被跳过的这一帧不会自己回来 —— 但它也不需要，因为尺寸从 0×0 恢复**必然**走
`Scene.windowResize`，那个函数是 `this.resize()` 紧跟 `this.requestRendering!()`
（`scene-events-window.ts:12-18`）；上下文丢失的同理由 `webglRestored` 重挂（`:6-10`）；
动画播放期间另有**持续性**的 `stageAnimation`（不在置 null 之列）逐帧 `drawScene`。
⇒ 真正的行为变化只有一句：**0×0 那一瞬间的绘制被丢掉了**（本来也画不出东西，只会在控制台刷 WebGL 错）。
这条已就地写进注释，并在下面登记为「真机待确认」项。

### 五、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **30 → 29**（files 25 → 24；基线已固化） |
| 真 bug | 1 处**死守卫复活**（`hasRenderableCanvas` 读 div → 读 `GL.canvas`） |
| spec | +1 例（含红证明），`scene.spec.ts` 21 例全绿；另给 GL mock 补 `canvas` |
| `tsc` / `lint` / `format:check` / `text:check` / `migration:check` | 0 / 0-0 / 0 / 0 / 仅 `unknown-casts` 下降 |
| editor 套件 | 见提交说明 |
| 真机待确认 | 窗口从隐藏/最小化恢复、布局重建（0×0 那一瞬）之后**首帧是否照常绘出** |

### 六、教训

1. **「多余断言」有两种：真的多余，和遮住缺陷的多余。** 判据只在去掉断言之后那一秒：tsc 不响，
   就要**再往下问一层**「这行代码本来想读什么」。本轮来源是 `div`、目标是 `HTMLCanvasElement`，
   类型上「不重叠」所以 tsc 无话可说 —— 但那种「不重叠」不是宽松，是**说谎**。
2. **去掉断言 ≠ 完工，`undefined` 传播出来的恒真条件就是缺陷本体。** `screen.width !== 0` 这个
   形状（真值守卫）明摆着作者想读画布，只是写错了对象；只删断言会留下一条**恒真的死代码**，
   比断言更糟 —— 断言至少还看得见。⇒ 收口一处的正确终点是：**读对的东西 + 留下实测理由**。
3. **红证明要挑对复现件。** 「把 mock 里那个字段删掉」常常会**假绿**（旧实现换个理由也能返回同一
   结果）；要复现的是**真实形态**，不是「让输入为空」。本轮之所以能红，全靠 spec 里那个
   div 形态的 `screen` mock 是如实录下来的。
4. **改渲染循环先查 updater 的语义。** `stageRendering` 一次性、`stageAnimation` 持续 —— 这两个字
   决定了「跳过一帧」是丢掉一次请求还是丢一帧；顺手也把原注释里「尺寸恢复后自动继续，无需重挂
   updater」这句**含糊话**改成了带行号的证据（真正负责重挂的是 resize / webglRestored 两条路）。

## 第 138 轮（2026-09-22）：`unknown-casts` 29 → 27 —— 给两个 window 全局补声明，顺手拆掉审计白名单里三条豁免

### 一、先造一把「逐处」的尺子

台账（`migration-ledger`）的 detail 只到**文件级**、且 `slice(0, 20)` —— 24 个文件里最后 4 个看不到
行号，动工前只能靠 grep 猜。于是新增 `scripts/oneoff/unknown-cast-inventory.mjs`：复用
`lib/scan.mjs` 的同一套口径（同 `SCAN_DIRS`、同 `EXCLUDE_RE`、同 `UNKNOWN_CAST_RE`、同 `codeOnly`），
逐处打印 `文件:行号 + 该行源码`。

**尺子的验收条件是与台账读数逐字相等**：本轮两边都是 **29 处 / 24 文件** ⇒ 口径没漂，可以用它做决策。
（`--context` 还能带出前后 2 行；`codeOnly` 长度不变 ⇒ 行号与源文件对齐。）

### 二、挑中的是两处 `window as unknown as Record<string, unknown>`

```ts
// main/startup.ts:33
if ((window as unknown as Record<string, unknown>).__SKIP_AUTO_INIT__) { … }
// utils/config.ts:15
if (typeof (window as unknown as Record<string, unknown>).__nodeRequire !== 'function') { … }
```

两处都只是**读一个注入到 `window` 上的全局**，断言的唯一作用是「绕过 TS 不许访问未知属性」。
正解不是换写法，是**把它声明出来** —— 而 `src/preload-env.d.ts` 里**早就**为同一类注入做了
`Window` augment（`yami?: YamiBridgeApi`），同一个家、同一个时机：

```ts
__nodeRequire?: (moduleId: string) => unknown;
__SKIP_AUTO_INIT__?: boolean;
```

注入点都查证过：`index.html:5`（head 里的行内 script，早于任何模块；`electron-renderer-resolve`
生成的 importmap 也靠它把 `electron` / `fs` 解析过去）、`index.html:21`（body 开头）。

**可选性（`?`）是如实描述，不是图省事**：`window.__nodeRequire` 在 vitest/jsdom（不加载
index.html、没有 `window.require`）下确实是 `undefined`，`config.ts` 的 `typeof !== 'function'`
判断照旧有意义 —— 那个守卫**不能**顺手删。

⇒ 两处断言消失，且**不需要任何新断言**（`unknown-casts` 29 → 27，files 24 → 22）。

### 三、顺带：审计白名单从 4 条缩到 1 条

`components/__tests__/global-mounting.spec.ts` 里有一条守卫：「`window as unknown as` 的**读**模式
只允许白名单」，原先跳过 4 类行：`__SKIP_AUTO_INIT__`、`__nodeRequire`、`Window: typeof Window`、
`__yamiLayoutDebug`。

- 前两条随本轮改动自然失效 ⇒ 删掉（守卫随之**变严**：以后谁再写这两处的断言就会被拦）。
- 第三条 `Window: typeof Window` 实测**匹配不到任何行** —— 删掉后跑守卫，3/3 绿 ⇒ 它早就是死豁免，
  一直躺在那里唯一的作用是「给将来某处放行」。
- 现在只剩 `__yamiLayoutDebug`（`layout.ts` 有意保留的控制台诊断钩子）。

### 四、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **29 → 27**（files 24 → 22；基线已固化） |
| 新尺子 | `scripts/oneoff/unknown-cast-inventory.mjs`（逐处；读数与台账逐字相等） |
| 守卫白名单 | **4 条 → 1 条**（其中 1 条证明是陈旧豁免） |
| `tsc` / `lint` / `format:check` / `text:check` / `docs:check` / `migration:selftest` | 0 / 0-0 / 0 / 0 / OK / 58-58 |
| editor 套件 | 见提交说明 |

### 五、教训

1. **「加声明」比「加断言」便宜时，就加声明。** 尤其当**同一个文件早就为同一类全局做过 augment**
   时（本例 `preload-env.d.ts`），成本只有三行 —— 断言则是每读一处写一次、每处都不可查。
2. **豁免清单会腐烂，而且腐烂得很安静。** `Window: typeof Window` 那条已经匹配不到任何行，却一直
   在为将来放行；删豁免的判断要用**守卫自身**做实验（删掉再跑，绿即死）。⇒ 豁免和轴一样要定期量。
3. **先造尺子再动手，尺子要自证。** 台账只给到文件级且只列前 20 个文件，没有逐处清单就只能靠 grep
   猜；而新尺子的验收条件必须是**与台账读数逐字相等** —— 口径漂了，量的就不是同一件事。

## 第 139 轮（2026-09-22）：`unknown-casts` 27 → 25 —— `codec` 里两处断言是**纯说谎**（值本来是 string）

### 一、起因：新尺子的第一次实战

第 138 轮造好的 `scripts/oneoff/unknown-cast-inventory.mjs` 第一次派上用场：27 处的逐处清单里，
`engine/codec/codec.ts` 一处文件占了 2 处，且两处形状**一模一样**（都是把某个值断言成 `Uint8Array`）：

```ts
scene.terrains! as unknown as Uint8Array          // :82  decodeScene
tilemap.code! as unknown as Uint8Array            // :135 decodeTilemap
```

### 二、量的不是「断言多不多余」，而是**被断言的值运行时到底是什么**

判据落在**生产者**（赋值点）上，而不是读取侧：

- `SceneData.terrains?: string`（`:20`）—— 而它由 `:74` 的
  `scene.terrains = this.encodeTerrains!(scene.terrainArray!)` 赋值，`encodeTerrains` 的返回类型
  就是 `string`（`:43`）⇒ **运行时它就是 string**。
- `TilemapData.code?: string`（`:9`）同理。

再看**被调方**：

```ts
decodeTerrains: null as ((code: Uint8Array | string, width, height) => Uint8Array) | null   // :44
decodeTiles:    null as ((code: Uint8Array | string, width, height) => Uint32Array) | null  // :40
```

形参联合里**本来就含 `string`** ⇒ 直接把 string 传进去就自洽。于是：

- 断言**没有运行时作用**（`as` 不转换值），唯一效果是把「值是 string」说成 `Uint8Array`；
- 删掉之后 tsc 一声不响，`codec.spec.ts` 19/19 全绿 ⇒ 行为不可能变（类型层改动）。

⇒ 两处一起删，`unknown-casts` 27 → 25（files 22 → 21）。两处都就地写了理由（含行号），
免得下次有人看到「string 直接传进 Uint8Array 形参」又把它加回去。

### 三、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **27 → 25**（files 22 → 21；基线已固化） |
| 就地理由 | 2 处（都在断言原位置，写明生产者与形参两端的行号） |
| 行为变化 | **0**（`as` 无运行时作用；`codec.spec.ts` 19/19 绿） |
| `tsc` / `lint` / `format:check` / `text:check` / `docs:check` / `migration:selftest` | 0 / 0-0 / 0 / 0 / OK / 58-58 |
| editor 套件 | 见提交说明 |

### 四、教训

1. **断言可以是「说谎」而不是「不足」。** 第 135/136 轮的断言是**不够**（缺声明、缺成员），
   本轮这两处是**反的**：值明明是 `string`，被说成 `Uint8Array`。类型上「看起来更具体」的
   断言最容易骗过 review —— 因为没人会怀疑一个「更窄」的类型。
2. **判据要问两端**：源头的**生产者**（`encodeTerrains` 返回 string）与被调方的**形参联合**
   （`Uint8Array | string`）。只看读取侧永远看不出问题 —— 读取侧只有一个 `!`。
3. **`as` 无运行时作用，是这类改动最值钱的性质**：删它不需要红/绿证明，只需要
   tsc 干净 + 该文件的 spec 绿（本轮 19/19）。⇒ 挑选下一处时可以优先找「源类型与目标类型
   看着不相干、但形参本来就收它」的形状，代价低、收益确定。

## 第 140 轮（2026-09-22）：`unknown-casts` 25 → 24 —— 基类读子类字段，用 `declare` 补声明的分寸

### 一、尺子第三次实战：`element-base.ts:148`

```ts
drawDefaultImage() {
	GL.alpha = this.opacity;
	GL.blend = (this as unknown as { blend: string }).blend;
```

先查「谁声明了 `blend`」：基类 `uiElClasses.Element`（`element-base.ts:52`）自己有一整套字段
（`x` / `y` / `width` / `height` / `matrix` / `opacity` / `transform` / `parent` / `children` /
`visible` / `connected`），**没有 `blend`**；真正声明它的是四个子类 —— `image-element.ts:28`、
`text-element.ts:59`、`progress-bar-element.ts:37`、`video-element.ts:7`。

再查「谁调用基类这个方法」：只有三处 —— `progress-bar-element.ts:84`、`video-element.ts:18`、
`image-element.ts:149`，**三处都有 `blend`**（`parallax.ts:127` 那个 `drawDefaultImage` 是它
自己的同名方法，与基类无关）。⇒ 断言描述的事实成立，但**没有任何一处声明表达它** ——
又是第 135 轮的形状（缺声明 ⇒ 断言），只是这次缺在**类字段**上。

### 二、修法：`declare blend?: string;`

三处判断：

- **为什么可选（`?`）**：四个子类有它，其余元素（Window / Button / Container …）没有 ⇒
  必填就是撒谎，可选才是如实。
- **为什么 `declare`**：普通字段（哪怕没有初始化器）在 `useDefineForClassFields` 下**仍会**
  在构造时 `defineProperty` —— 那等于给**所有**元素凭空长出一个自有键 `blend: undefined`，
  `Object.keys(element)` 的面就变了（序列化/遍历类代码都可能受影响）。`declare` 只进类型面、
  **不发射任何代码** ⇒ 行为等价；本文件早有先例（`declare node` / `declare resize`）。
- **为什么不用 `this` 形参**（本该是首选，因为「按读点收窄」）：基类实例类型在这里是**推断**出来的
  —— `uiElClasses.Element` 的声明类型是 `UIElementCtor = (new (data?: any) => any) & Record<string, any>`，
  实例面就是 `any`；写 `drawDefaultImage(this: UIElement & { blend?: string })` 等于把承重的推断
  换成显式引用，语义收益一模一样而风险更大。⇒ 一行 `declare` 落在**唯一**需要它的类上，
  代价只是「所有元素多一个可选成员」。

### 三、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **25 → 24**（files 21 → 20；基线已固化） |
| 运行期 | **0 变化**（`declare` 不发射代码：无 `defineProperty`、不改实例自有键集合） |
| spec | `ui.spec.ts` 15 + `scene.spec.ts` 21 全绿；全量见提交说明 |
| `tsc` / `lint` / `format:check` / `text:check` | 0 / 0-0 / 0 / 0 |

### 四、教训

1. **「缺声明」已经有三个落点**：接口（第 135 轮 `YamiElementApi`）、方法形参（第 136 轮
   `this` 窄类型）、**类字段**（本轮）。选哪个取决于读点范围：**多处会读 ⇒ 落类字段；
   只此一处 ⇒ 落形参**。本轮是「基类方法读子类字段」，读点在基类 ⇒ 只能落类字段。
2. **补类字段优先 `declare`**：判据是一句话 ——「这次改动应不应该让 `Object.keys(instance)` 变化？」
   答案是否，就用 `declare`。普通字段（无初始化器）也会 defineProperty，那是**运行期形状变化**，
   不是类型变化。
3. **先查调用点，再改读点**：`element-base.ts:148` 的读者只有 3 个调用点且全部带 `blend` ——
   这个事实同时给了两个依据（可选而非必填、不必动其它元素）。没有这一步就只能猜。

## 第 141 轮（2026-09-22）：`unknown-casts` 24 → 22 —— 两处断言把「载荷对象」谎报成「DOM 事件」，顺带改正一个被 `any` 掩盖的错误声明

### 一、起因：`LayoutPanel.vue` 里最后两处（成对，同一形状）

```ts
const onEasingIdWrite = (value: unknown) => {
	Curve?.easingIdWrite?.({ value: value as string } as unknown as Event);
};
const onEasingIdInput = (value: unknown) => {
	Curve?.easingIdInput?.({ value } as unknown as Event);
};
```

### 二、判据：这个对象**运行期**到底是什么？

- 调用方是模板里的 `@write="onEasingIdWrite"` / `@input="onEasingIdInput"`
  （`LayoutPanel.vue:898-899`），子组件是 `SelectBox`，它的 emit 载荷是 `unknown`
  （`SelectBox.vue:71-72`）⇒ 传进来的就是 **`{ value }` 这个普通对象**。
- 读侧只有两处：`easingIdWrite` 读 `event.value`；`easingIdInput` 写 `target!.easingId = event.value`。
- 而声明链把它说成事件：`useCurveWindow.ts:69-70` 写 `(event: YamiEvent)`，
  单例形状 `curve-window.ts:39-40` 写 `(event: Event)` —— 而 `YamiEvent = Event & EventPayloadFields`
  （`editor-event.ts:53`）。

⇒ 断言的**来源类型（普通对象）与目标类型（DOM 事件）结构上毫无交集**：这不是「不够窄」，
是**说错了对象**。第 139 轮的判据（「更窄的断言最容易骗过 review」）在这里的镜像版本。

### 三、修法：把载荷写成具名类型，删掉事件外衣

```ts
// useCurveWindow.ts（导出，供 curve-window 复用）
export type EasingIdPayload = Pick<EventPayloadFields, 'value'>;
```

三处一起改：`useCurveWindow.ts` 的接口两份 + 实现两份、`curve-window.ts` 的单例形状两份，
调用点直接写 `{ value }` ⇒ **两处断言消失**。

- 为什么用 `Pick<EventPayloadFields, 'value'>` 而不是新造 `{ value: any }`：`editor-event.ts:15`
  的 `Loose = any` 是**单点豁免**，复用既有词汇即可，不新增 `any` 字面量（也不动 `any-hatches` 口径）。
- 为什么**不**收紧成 `string`：见下节 —— 它会当场暴露下一个问题，本轮不夹带。

### 四、顺带查出的真问题：`Curve.index` 的声明是错的（被 `any` 掩盖）

`easingIdWrite` 把 `event.value`（缓动 **id**）存进 `index`，而 `index` 的声明是
`number | null | ''`（`useCurveWindow.ts:66/96`、`curve-window.ts:21`）—— 赋值方向因为
`event.value` 是 `Loose = any` 而被吞掉，**从不报错**。

三处独立证据说明真实类型是 `string | null`：

1. 写进去的是缓动 id（`:396 index = id`）；
2. 它被当**字符串键**使用（`Data.easings.map[id]`）；
3. spec 断言 `expect(curve.index).toBe('easing-1')`（`useCurveWindow.spec.ts:200`）与 `toBeNull()`。

改成 `string | null` 后 **tsc 0 错误、级联 0 处**（读数器全在曲线窗口内部）⇒ 纯粹的「改正谎言」。

### 五、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **24 → 22**（files 20 → 19；基线已固化） |
| 类型修正 | `Curve.index` / `useCurveWindow().index`：`number \| null \| ''` → `string \| null` |
| spec | 顺手去掉 spec 里同一处断言（`:280`，spec 不计轴） |
| 行为变化 | **0**（全部是类型层改动） |
| `tsc` / `lint` / `format:check` / `text:check` / `docs:check` / `migration:selftest` | 0 / 0-0 / 0 / 0 / OK / 58-58 |
| editor 套件 | 见提交说明 |

### 六、教训

1. **「一个对象被声明成 DOM 事件」是最好认的谎**：事件有 `type` / `target` / `addEventListener`，
   普通对象没有。**断言两侧结构毫无交集时**，先去问「调用方到底传了什么」—— Vue 模板的
   `@write` 传的是子组件 emit 的**载荷**，不是 DOM 事件。
2. **`any` 会吃掉赋值方向**：`index = event.value` 里 `event.value` 是 `any`，所以 `index` 声明错了
   也**一声不响**。⇒ 收窄事件载荷类型会**顺带照出这类被吞掉的错误声明**，那是收紧的价值本身，
   不是副作用。
3. **发现真问题要不要夹带？** 本轮夹带了，硬条件是：**一次 tsc 能判定「0 级联」**
   （`index` 修正只动 2 处声明 + 1 处形状，读数器全在窗口内）。若级联出一片，就该单独成轮 ——
   本仓 ④ 系列正是这么被推迟的。
4. **修声明的红利会出现在 spec 里**：类型改对之后，spec `:280` 那个 `as unknown as Event` 自己
   就多余了 —— 而且 tsc 当场报 `TS2559: Type 'Event' has no properties in common with type
   'EasingIdPayload'`，**正好证明了旧断言在掩盖「把 Event 当成载荷对象传进去」这件事**。

## 第 142 轮（2026-09-22）：`unknown-casts` 22 → 21 —— 跨包契约把 `Event` 写宽了，逼出宿主侧一句谎

### 一、起因：同文件里两种写法并存，这本身就是诊断信息

`ParameterPane.vue` 上方两行（`:66-72`）对 `PluginManager` 用的是**单次 `as`**：

```ts
const plugin = computed(() => PluginManager as { reconstruct(…): boolean; checkValidate(…): boolean });
```

而下面这个 `Selection` 非得 `as unknown as`：

```ts
const selection = computed(
	() => Selection as unknown as { inputKeydown?: (event: Event) => void; … }
);
```

单次 `as` 失败的条件是「两侧互不重叠」。⇒ 说明这处的问题**不是缺成员**，而是**参数类型冲突**。

### 二、查两端

- **宿主的真值**：`tools/text-capture.ts:138`
  `export const Selection = { … } satisfies Partial<SelectionShape> as SelectionShape;`
  ⇒ `Selection` 的静态类型**就是** `SelectionShape`，四个处理器声明在 `:111-114`：
  `inputKeydown` / `inputKeyup` 收 `KeyboardEvent`，`inputPointerdown` / `inputPointerup` 收 `PointerEvent`。
- **「目标」是 ui-kit 的契约**：`YMParameterPane.vue:43-48` 的 `SelectionAdapter` 写的是
  `(event: Event) => void` ×4。
- **而 ui-kit 的注册点**（`:607-618`）是
  `addEventListener('keydown' | 'keyup' | 'pointerdown' | 'pointerup', …)` —— DOM 对这四个事件名
  给的形参恰好是 `KeyboardEvent` ×2 + `PointerEvent` ×2。

⇒ 真正写错的是**契约那一侧**：把「按事件类型签名的处理器」写成 `Event` 之后，宿主那些**更准**的
签名因函数参数逆变而与之互不重叠，只能靠 `as unknown as` 把值谎报成宽签名。

### 三、修法：把契约定准（跨包，但方向是**收紧**）

- ui-kit：`SelectionAdapter` 四条改成 `KeyboardEvent` ×2 + `PointerEvent` ×2
  （注册点照旧成立 —— `addEventListener` 的对应重载正好收这两个类型）。
- editor：`const selection = computed(() => Selection);` —— 断言整条消失，
  因为 `Selection` 本来就结构满足该契约。
- ⇒ 这不是放宽而是**收紧**：原先那版 `Event` 是「任何 Event 处理器都能满足」的假契约，
  与被实现方的真实签名相反。

### 四、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **22 → 21**（files 19 → 18；基线已固化） |
| 跨包 | ui-kit `SelectionAdapter` 4 条**收窄**；editor 去掉 1 处断言 |
| 验证面 | editor `tsc` 0 / editor **vue-tsc 0 新错** / ui-kit `build:types` 0 |
| 套件 | ui-kit **811** + editor **255 文件 / 2075 用例**（见提交说明） |
| `lint` / `format:check` / `text:check` / `docs:check` | 0-0 / 0 / 0 / OK |

### 五、教训

1. **`as unknown as` 与单次 `as` 并存 = 诊断信息**：同一个文件里 `PluginManager` 能过、`Selection`
   不能过，说明后者失败的原因**不是缺成员而是参数类型冲突**。⇒ 看到两种写法并存，先问「为什么
   这处更难」，答案往往就是修法的方向。
2. **跨包契约写宽会把谎推给宿主**。ui-kit 把适配器写成 `(event: Event) => void` 看着「更通用」，
   实际效果相反：任何**按真实事件类型签名**的实现都与它不兼容，宿主只能谎报。⇒ 契约要按
   **注册点的真实事件类型**写（`addEventListener('keydown', …)` 就是 `KeyboardEvent`）。
3. **改跨包契约必须跑对面的套件**：ui-kit 的测试不在**根目录脚本**的覆盖里（根 `package.json`
   根本没有 `test` 脚本 —— 只有 `ci.yml:119` 显式跑它）⇒ 本轮显式跑了 `pnpm -F @yami/ui-kit test`。
   ⚠️ 顺带一条门禁教训：**写「某个命令不存在」时不要把这个命令原样写进文档** —— `docs:check`
   是按字面校验可执行声明的，它会反过来报「文档提到了一个 package.json 里没有的脚本」；
   连**引用它自己的报错原文**也会再次触发（第一次修正就踩了这个回旋镖）。
   改写成「根目录没有 `test` 脚本」即可（第 143 轮修正）。

## 第 143 轮（2026-09-22）：`unknown-casts` 21 → 19 —— 给「效果类型 → 方法名」那张表一个取值面

### 一、起因：`printer.ts` 一处文件占 2 处，是同一根线

```ts
command.drawingMethod = (
	Printer as unknown as Record<string, (...args: unknown[]) => unknown>
)[Printer.drawingMethods![effect.type]];                            // :408
…
drawingMethod: '' as unknown as (...args: unknown[]) => unknown     // :1239 占位模板
```

### 二、查清那条间接链

- `Printer.drawingMethods`（`:1002` 声明 `Record<string, string> | null`，`:1073` 赋值）是一张
  **效果类型 → 方法名**的表：`none: 'drawText'`、`shadow: 'drawTextWithShadow'`、
  `stroke: 'drawTextWithStroke'`、`outline: 'drawTextWithOutline'`。
- 四个实现**签名完全一致**：`static drawText(context: CanvasTextContext, command: TextCommandShape,
  text: string)`（`:1273` / `:1283` / `:1299`；`:1315` 写成分行但同形）。
- 唯一调用点是 `executeCommands()`：`drawingMethod(context, command, string[i])`，
  其中 `context` 来自 `this.context!`（类型就是 `CanvasTextContext`）。

⇒ 两个谎叠在一起：① 表的值写成「任意 string」，于是「表里的名字」与「类上真有这个方法」之间
**零检查**；② 取值时只能把整个 `Printer` 谎报成一张 `Record<string, 函数>`。

### 三、修法：给表一个**取值面**，给字段一个**真实签名**

```ts
type DrawingMethod = (context: CanvasTextContext, command: TextCommandShape, text: string) => void;
type DrawingMethodName =
	| 'drawText' | 'drawTextWithShadow' | 'drawTextWithStroke' | 'drawTextWithOutline';

static drawingMethods = null as Record<string, DrawingMethodName> | null;
drawingMethod: DrawingMethod;   // TextCommandShape
```

- `:408` 变成 `command.drawingMethod = Printer[Printer.drawingMethods![effect.type]];` —— 断言消失，
  而且**顺带获得了检查**：表里写错方法名会在编译期报错（原先零检查）。
- `:1239` 的占位值从 `'' as unknown as …` 改成 `fnEmpty`（`utils/function.ts` 的 `empty`）——
  与 `:471` 那条路径用的是**同一个空实现**，占位对象从此零断言。

### 四、为什么占位值可以换

- 占位对象在 `fetchCommand` 里造出来之后**紧跟着就被填上** `drawingMethod`（同一个函数 `:398-409`）；
  `resetCommands`（`:1276`）只清 `string` / `image*` 等字段，不碰它；
- 唯一读点是 `executeCommands`。⇒ 即便真被读到，`fnEmpty` 是**静默无操作**，而 `''` 会抛
  TypeError —— 与「占位对象」的既有语义一致（见 `color: ''` 那段注释：值必然在绘制前被填上，
  提前读也只是被 canvas 静默忽略）。
- 已登记为**行为变化**：不可能路径上「抛错 → 无操作」；随本轮 spec 与全量套件一起验证。

### 五、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **21 → 19**（files 18 → 17；基线已固化） |
| 新增检查 | `drawingMethods` 表里方法名拼错 ⇒ **编译期报错**（原先零检查） |
| 行为变化 | 占位模板的 `drawingMethod`：`''`（调用即抛）→ `fnEmpty`（无操作），只在该字段被提前调用时可见 |
| printer 套件 | `printer-draw` 3 + `printer-state` 4 全绿；全量见提交说明 |
| 门禁 | tsc 0 / lint 0-0（1644 文件）/ format 0 / text 0 / docs OK（含一次自证修正，见教训 3） |

### 六、教训

1. **「名字 → 方法」的间接层是断言的高产区**：`Record<string, string>` 这种「值只是名字」的表
   天然躲开检查；给它一个**取值面**（方法名联合）之后，「表里写的名字」与「类上真有的方法」
   第一次被连起来 —— 断言消失只是副产品，**新增检查**才是收益。
2. **占位值的类型谎言要在「同族」里找替身**：`'' as unknown as 函数` 真正想表达的是「空实现」，
   而这个文件**早就**有 `fnEmpty`（`:471` 同一个字段用过）⇒ 用既有词汇比新造一个更自然，
   也顺带让占位对象做到零断言。
3. **门禁的自证也要写进文档，而且要小心回旋镖**：本轮 `docs:check` 因为我在文档里写出了
   「某个不存在的命令」而拦下；第一次修正时我又把**门禁的报错原文**抄了进去 —— 那等于把
   那个命令又写了一遍，第二次才过。⇒ 写「X 不存在」时不要出现 X 的字面，引用报错原文同理。

## 第 144 轮（2026-09-22）：`unknown-casts` 19 → 17 —— 两份「各写一半」的局部形状合并 + 一处多带了 `YamiElement` 的断言

### 一、起因：两处都在 `composables/commands/` 里，形状却不同

```ts
model = editor!.getModel() as unknown as ScriptModel;                       // useScriptCommandSchema.ts:333
input = createSelectBox() as unknown as YamiElement & CallEventInputApi;    // useCallEventCommandSchema.ts:333
```

### 二、A：同一个运行期对象被两个**互不相交**的子集描述（第 118 轮同病）

- `ScriptEditor.getModel(): { getLanguageId(): string } | null`（`ScriptEditor` 是为 monaco
  手写的最小视图，只声明本模块用到的成员）；
- `interface ScriptModel` 只写 `setValue` / `getValue` / `getAlternativeVersionId`。

⇒ 两个子集**没有交集**，`as unknown as` 正是用来「从半边跳到另半边」的。

**修法**（照第 118 轮 `ImageElementShape` / `EmbeddedImageShape` 的手法）：合并成一份 ——
`ScriptModel` 补上 `getLanguageId(): string`，`getModel()` 的返回改成 `ScriptModel | null`
⇒ `model = editor!.getModel();` 断言消失，而两个读点（`model.getValue()`、
`editor.getModel()!.getLanguageId()`）第一次共用同一份形状。

### 三、B：断言目标多带了一个**无关**接口，把「可比的」变成「不可比」

- `createSelectBox(): SelectBoxApi`，而 `SelectBoxApi = HTMLElement & { loadItems(...): unknown;
  on(...): unknown; … }`（ui-kit `select-box-api.ts:21`）。
- 目标却写成 `YamiElement & CallEventInputApi`，其中 `YamiElement = HTMLElement & YamiElementApi`
  要求**整套** `YamiElementApi`（`createFolder` 等一大堆）—— 选择框根本没有。
- 而 `input` 的**声明**是 `HTMLElement & CallEventInputApi`：`SelectBoxApi` 本来就满足它
  （`loadItems` 收 `unknown[]` ✓；返回 `unknown` 可赋给 `void` ✓；`on` 同理 ✓；`type` / `filter`
  可选 ⇒ 不必有 ✓）。

⇒ 断言整条**可以删掉**；顺带 `:334` 那句 `(input as { loadItems?… })` 单次 `as` 也没理由了
（`CallEventInputApi` 自己就声明了 `loadItems?`）。

### 四、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **19 → 17**（files 17 → 15；基线已固化） |
| 额外 | `useCallEventCommandSchema.ts` 另删 1 处单次 `as`（不计轴） |
| spec | `useScriptCommandSchema` + `call-event-labels` + `script-change-wiring` 共 10 例绿；全量见提交 |
| 门禁 | tsc 0 / vue-tsc 0 新错 / lint 0-0 / format 0 / text 0 / docs OK |

### 五、教训

1. **「各写一半」的形状病有两个变体**：第 118 轮是两份**具名**形状各写一半，本轮是
   「**接口里的一行**」与「另一个接口」各写一半（`getModel()` 的返回 vs `ScriptModel`）。
   判据相同：**把两侧成员并起来看，是否恰好等于同一个运行期对象** —— 是，就该合并。
2. **断言目标里多带一个无关接口，会把「可比的」变成「不可比」**：`YamiElement` 对本次赋值
   毫无贡献（值本来就是 `HTMLElement`），却把要求抬到「必须实现整套 `YamiElementApi`」
   ⇒ 两侧互不重叠 ⇒ 只能 `unknown` 兜。⇒ 写断言前逐个检查：**目标里每个交叉项都是必需的吗**。
3. **一处收口会让相邻的其它断言自己暴露出来**：A 的合并、B 的删除之后，`input` 的声明类型
   成为唯一真源，紧跟着那句单次 `as` 立刻显得多余 —— 收口的收益不止轴上的那一个数字。

## 第 145 轮（2026-09-22）：`unknown-casts` 17 → 15、`any-hatches` 47 → 46 —— 揭开第 87 轮那句「类与接口已经漂移」

### 一、起因：两处，一处「包装对象不是节点」，一处「第 87 轮登记过的漂移」

```ts
const node = find({ instance: root, children: rootNodes ?? [] } as unknown as UINodeShape);  // ui-transform.ts:326
elements[eCount++] = new ParticleElement(this as unknown as ParticleElementLayer);            // particle-engine.ts:419
```

### 二、A：合成的包装对象本来就不是 `UINodeShape`

`UI.updateElement` 为了把「store 的 root + nodes」凑成一次查找入口，临时造了
`{ instance: root, children: rootNodes ?? [] }` 再断言成节点。而 `find` 实际只读两个成员：
`children`（递归下钻）与 `instance`（回传）。⇒ 按读点收成局部形状

```ts
type FindNode = { children: UINodeShape[]; instance?: UIRootApi | null };
```

包装对象与递归用的真实节点都能传进来，断言消失（与 `SceneAnimateThis` / `SceneSelectionThis`
同一手法）。

### 三、B：第 87 轮那句「漂移」的**具体内容**，这次量出来了

旧注释写的是「直接传 `this` 报 TS2345、降成单次断言又报 TS2352 ⇒ 类与接口已经漂移，
正解是把两者对齐」，并把它归入与 `ParamHistory` / `IEditableHistory` 同类的债务。
**方向是对的，但没有量出缺什么。** 本轮去掉断言后 tsc 的原话是：

```txt
TS2345: Argument of type 'this' is not assignable to parameter of type 'ParticleElementLayer'.
  Type 'ParticleLayerData' is missing the following properties from type 'ParticleElementLayerData':
  lifetime, lifetimeDev, fadeout, anchor, and 5 more.
```

⇒ 缺 **9** 个成员，而且这只是**第一个**被报出来的属性：把 `data` 修好之后，同一个错误立刻串出
下一层 —— `easing`。

### 四、修法：把「同一个运行期对象的两份声明」合并（第 118/144 轮同族）

- **`data`**：`ParticleLayerData`（引擎发射用：`interval` / `delay` / `area`）与
  `ParticleElementLayerData`（元素读：`lifetime` / `lifetimeDev` / `fadeout` / `anchor` /
  `rotation` / `hRotation` / `movement` / `scale` / `sprite`）本来就是**一个** `layer.data`
  —— 文件 `:94` 的注释自己就写着「与 particle-layer.ts 的 ParticleLayerData 共享」
  ⇒ 合并成一份，`ParticleElementLayer.data` 与 `ParticleElement.data!` 改指向它。
  **顺带掉了一个 `any-hatches`**：被删掉的那份声明自带一行 `[k: string]: any` ⇒ 47 → 46。
- **`easing`**：同一类「被 `any` 吞掉的错误声明」（第 141 轮 `Curve.index` 同族）。
  `ParticleLayerShape.easing` 与 `ParticleLayer.easing` 都声明成 `Float32Array | null`，
  而 `:632` 赋的是 `Easing.get(...)`（`EasingMapInstance`，有 `ease()`），`:1268` 的读点也确实是
  `easing.ease(...)`；从不报错只因 `Easing.get` 是 `any` 面。
  改成 `{ ease(t: number): number } | null` 之后，`ParticleElementLayer.easing`（此前**必填非空**）
  与类（可空）互斥 ⇒ 补 `| null`，并在唯一读点写 `easing!`：不变式由 `:1057`（只在
  `color.mode === 'easing'` 时才把 `updateColor` 装成 `updateColorEasing`）与 `:632`（同条件下
  赋值）共同保证 —— **不变式一旦被破坏，行为与改动前完全相同（当场抛错）**，没有引入静默分支。

### 五、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **17 → 15**（files 15 → 13；基线已固化） |
| `any-hatches` | **47 → 46**（删掉重复声明自带的索引签名） |
| 就地注释 | 3 处（合并说明 / `easing` 声明 / 读点不变式） |
| spec | particle 30 + ui 15 + layer-form 3 + useParticleLayerPage … 共 36 例绿；全量见提交 |
| 门禁 | tsc 0 / lint 0-0（1644 文件）/ format 0 / text 0 / docs OK |

### 六、教训

1. **「试过并回退」的注释要当成**待办**，不是结论**：第 87 轮那句「正解是把两者对齐」已经指明
   方向，但没量，于是读起来像一句无奈的兜底。本轮只花一次 tsc 就把它变成可执行清单。
   ⇒ 回退记录里最好带上**错误原文** —— 方向 + 原文 = 下次可以直接开工。
2. **错误信息一次只报一个属性**：`data` 修完才轮到 `easing`；所以「按报错逐个修」时要预期
   **级联**，并且把每一层当**独立结论**去核实（`easing` 那层其实是另一个真问题，不是同一个）。
   这也解释了为什么「只做一半的合并」会让情况看起来更糟。
3. **合并重复声明比修单点断言更值钱**：删掉的那份自带 `[k: string]: any` ⇒ 一次收口同时动两条轴
   （`unknown-casts` 与 `any-hatches`）。⇒ 挑目标时优先找**重复声明**。
4. **不变式有两种表达，选不改变行为的那种**：`if (!easing) return;` 会把「不变式破坏」从
   **抛错**变成**静默少更新一次颜色**；`easing!` + 注释则保持当场抛错。⇒ 不可能路径上优先选
   行为等价的写法，把「谁保证非空」写进注释。（与第 143 轮 `fnEmpty` 的取舍正好相反 ——
   那里的语义是「占位对象」，本来就该静默。）

## 第 146 轮（2026-09-22）：`unknown-casts` 15 → 13 —— ui-kit `history.ts` 两处，都是「用断言骗过一条检查」

### 一、起因：一个文件两处，形状都是「为了让某条检查闭嘴」

```ts
// :26
export const HistoryTimer = new Timer({ … }) as unknown as Omit<Timer, 'start'> & {
	complete: boolean; type: string; start: (type: string) => void;
};
// :757（`restoreState` 里，防重入后清理）
const proxy = list as unknown as Record<string, unknown>;
delete proxy.update; delete proxy.select; delete proxy.scrollToSelection;
```

### 二、A（`:757`）：`delete` 的可选性检查，用 `Reflect.deleteProperty` 解

`CommandHistory.list`（`:570-580`）把 `update` / `select` / `scrollToSelection` 声明为**必需**
方法，而 `restoreState` 为了防重入会**临时删掉**这三个方法 ⇒ `delete list.update` 过不了
「只能删可选属性」的检查 ⇒ 只好造一个 `Record<string, unknown>` 视图。

本仓手法库第 5 条早就写好了这个场景的机制：**索引签名写入 / 解锁只读用 `Reflect.*`**。改用

```ts
Reflect.deleteProperty(list, 'update');
Reflect.deleteProperty(list, 'select');
Reflect.deleteProperty(list, 'scrollToSelection');
```

⇒ 内建签名 `(target: object, key: PropertyKey) => boolean`，行为与 `delete` 完全相同，
断言消失；而且**不需要把这三个方法改成可选**（那会连带让 `:716-721` 的调用点报「可能为
undefined」，属于把债换个地方）。

### 三、B（`:26`）：`unknown` 的成因要**实测**，不能想当然

我的第一反应是「`Omit<Timer, 'start'>` 丢掉了 `Timer` 的私有成员（`timeoutId` / `duration` /
`callback`），所以两侧不可比」—— 听起来无懈可击，**但实测把它证伪了**：改成单次
`as Timer & { … }` 之后 `vue-tsc` 一声不响（`build:types` 0 错）。

顺手核实：`Timer`（`ui-kit/src/utils/timer.ts`）**根本没有 `start`** —— 成员只有 `target` /
`running` / `elapsed` / `playbackRate` 与 `add` / `finish` / `remove` ⇒ `Omit<Timer, 'start'>`
是个**空操作**，写成 `Timer & { … }` 反而更诚实（不再暗示「被 omit 掉的 `start` 另有含义」）。

### 四、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **15 → 13**（files 13 → 12；基线已固化） |
| 跨包验证面 | ui-kit `build:types` 0 / editor `tsc` 0 / editor `vue-tsc` 0 新错 |
| 套件 | ui-kit **811** + editor **255 文件 / 2075 用例**（见提交说明） |
| 行为变化 | **0**（`Reflect.deleteProperty` 与 `delete` 等价；`as` 只在类型层） |
| 门禁 | lint 0-0（1644 文件）/ format 0 / text 0 / docs OK |

### 五、教训

1. **「用断言骗过某条检查」是本轴上最容易复用的形状**：`delete` 的可选性、事件形参类型、
   必填属性……每条检查几乎都有一条**内建出口**，用它不必说谎。⇒ 遇到断言先问
   「它在骗哪条检查」，再去找那条检查的官方出口。
2. **`unknown` 的成因必须实测**：本轮我给出的「私有成员导致不可比」解释听起来很有道理，
   实测直接证伪。⇒ 别把「合理的故事」写进注释或文档 —— **只有 tsc 的输出算证据**
   （第 139 / 145 轮同一条纪律）。
3. **`Omit<T, 'k'>` 用在类上时先确认 `k` 真的存在**：`Timer` 没有 `start` ⇒ 那个 `Omit` 是空操作，
   反而误导读者以为作者在回避什么。⇒ 换成 `Timer & { … }` 更短也更准。

## 第 147 轮（2026-09-22）：`unknown-casts` 13 → 11 —— ui-kit 两处「运行期挂上的成员」

### 一、起因：ui-kit 两个组件各一处

```ts
// YMFileBrowser.vue dragstart
const page = getActivePage(event) as unknown as { pressing?; activeFile?; selections; textBox };
// YMParameterPane.vue createRepeatableGroup
const input = container as unknown as RepeatableGroupInput;
```

### 二、A：四处成员是运行期挂上的 ⇒ 收成一处**具名读点面**

`getActivePage` 返回 `HTMLElement | null`（实际返回 `FileNavApi` / `FileBodyApi`），而调用点要的
四个成员**全是运行期挂上的**：两个 pane 都用 `Object.defineProperty` 暴露 `pressing`
（`YMFileNavPane.vue:824` / `YMFileBodyPane.vue:2102`，两边各有一条 spec 断言这件事），
`selections` / `textBox` 由 body 侧提供。`HTMLElement` 与该字面量「互不重叠」（两侧唯一共同点是
`Element`）⇒ 只能 `unknown`。

**修法**：把四处成员收成**具名** `interface ActivePage extends HTMLElement`（注释写明谁是提供方、
谁是可选项），调用点写 `as ActivePage | null` —— 断言从「跨类型跳跃」降级成「补上运行期成员」的
单次 `as`，而且**契约只写一遍**（原先是调用点内联字面量）。

顺带删掉一处**冗余**断言：`(page as { selections: unknown[] }).selections` —— `page` 上刚声明的
就是 `selections`（同一批成员的第二个副本，又一例第 144 轮那条「一处收口会让相邻断言自己暴露」）。

### 三、B：第 86 轮注释里**自己写好的拆法**，本轮照做

`interface RepeatableGroupInput extends HTMLElement`，而构造点是 `document.createElement('div')`
（`HTMLDivElement`）。第 86 轮的注释写得很具体：「要拆得让 `RepeatableGroupInput` 直接
`extends HTMLDivElement`，或把构造点改成先建后补」，并把两条都判为结构性改动 ⇒ 当时保留 `unknown`。

本轮选了第一条：`extends HTMLDivElement`（源与接口同族 ⇒ 单次 `as` 即够）。动手前先量了影响面：
该接口**只在本文件**被声明与构造（`:130` + `:702`，grep 4 处命中）⇒ 改父类零外溢。
剩下那层单次 `as` 只主张「紧接着要挂那五个成员」（下面几行就是 `setTooltip` / `inputData` /
`read` / `write`），与本文件既有的「先建后补」写法一致。

### 四、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **13 → 11**（files 12 → 10；基线已固化） |
| 额外 | 删掉 1 处**冗余**单次 `as`（不计轴） |
| 跨包验证面 | ui-kit `build:types` 0 / editor `tsc` 0 / editor `vue-tsc` 0 新错 |
| 套件 | ui-kit **811** + editor **255 文件 / 2075 用例**（见提交说明） |
| 行为变化 | **0**（全是类型层；`extends` 只在声明里） |
| 门禁 | lint 0-0（1644 文件）/ format 0 / text 0 / docs OK |

### 五、教训

1. **「运行期挂上的成员」推不出类型，但可以收成一处具名读点面**：这类断言的正确终点不是删掉它，
   而是（a）契约只写一遍、（b）把「谁是提供方」写进注释、（c）把 `unknown` 降级为「补成员」的
   单次 `as`。⇒ 判据：断言的目标是**补成员**还是**跨类型**？**跨类型就说明目标类型选错了。**
2. **回退注释里写下的「拆法」是待办**：第 86 轮把两条拆法写得很具体（且注明哪条都行），本轮
   照做第一条，一次 tsc 就过。⇒ 与第 145 轮同一条纪律（方向 + 原文 = 下次可直接开工），
   本轮又多一个正面例子。
3. **改类型前先量「这个类型被谁用」**：`RepeatableGroupInput` 只在本文件声明与构造 ⇒ 改父类零外溢；
   否则就得走「先建后补」那条更长的路。⇒ 影响面可以直接量（grep 引用点），不必靠猜。

## 第 148 轮（2026-09-22）：`unknown-casts` 11 → 9 —— 重审两处「必须保留 unknown」

### 一、起因：这两处都在名单上待了很久

```ts
// scene-tilemap-page.ts（记录在案：「方法签名沿用错的 `this`，只能按元素取视图」）
const element = this as unknown as HTMLElement;
// window-object.ts（记录在案：「方法装在该数组实例上」）
frames: [] as unknown as HTMLElement[] & { append(…): boolean; remove(…): boolean },
```

### 二、A：同仓**已经有**这个形状的标准写法

`this` 的真相：`SceneTilemapPage.vue:373` 把 `layerInput` 注册成 **elLayer 的 `input` 监听**
⇒ 运行时 `this` 是元素，且会写 `this.changes`（inspector 的历史处理器读它）；而声明写的是
`this: typeof SceneTilemap`（错的）⇒ 只能 `as unknown as HTMLElement` 硬掰。

而在 `inspector.ts:473` 找到**完全同形**的既有写法：

```ts
return function (this: YamiElement & { changes?: InspectorChange[] }, _event: Event) {
```

⇒ 把 `InspectorChange` 导出（原先未导出），本处按同一手法声明 `this` ⇒ 断言整条消失。

**级联（第 145 轮那条纪律）**：tsc 随即报
`TS2322: Type 'SceneTilemapLightBox' is not assignable to type 'YamiElement' … 缺 318 个成员` ——
本地的 lightBox 视图是**纯手写形状，连 `HTMLElement` 都不含**（它明明是 `inspectorEls.get()`
拿到的 DOM 元素）。修法用**交叉**而不是 `interface extends`：

```ts
type SceneTilemapLightBox = YamiElement & { … };
```

理由：`interface extends YamiElement` 会报「incorrectly extends」（本地的 `update(): void` 与
`YamiElementApi` 的 `update(...args: unknown[]): Loose` 不兼容），而交叉写法既补上元素身份、
又不必让本地那几个成员逐一去兼容基类的宽松签名。

### 三、B：`frames` 那处不能省掉第二级断言，但可以把第一级变成**真话**

事实：`frames` 是空数组，`append` / `remove` 由 `:461` / `:487` 的 `Object.defineProperty`
**装在该数组实例上**（接口注释 `:26-28` 早就写明了）。

为什么不能一步 `as HTMLElement[] & { … }`：源是 `never[]`（`[]` 的字面量类型）——`never[]` → 交叉 ✗
（缺方法）、交叉 → `never[]` ✗ ⇒ 互不重叠 ⇒ 原作者的 `unknown` 就是这么来的。

修法：`[] as HTMLElement[] as HTMLElement[] & { … }` —— 第一级是**可验证的真话**（空数组本来就是
`HTMLElement[]`），第二级只主张「那两个方法会在下面装上」。接口里它们必需（20+ 个调用点直接用），
而挂载点晚于赋值点，所以第二级不能省。

### 四、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **11 → 9**（files 10 → 8；基线已固化） |
| 导出 | `InspectorChange`（原先未导出；现在两处共用一份形状） |
| 行为变化 | **0**（类型层；`Object.defineProperty` 与 `[]` 都没动） |
| spec | `inspector-history` 9 例绿；全量 **255 文件 / 2075 用例** |
| 门禁 | tsc 0 / vue-tsc 0 新错 / lint 0-0（1644 文件）/ format 0 / text 0 / docs OK |

### 五、教训

1. **重审「记录在案」的保留项很划算**：本仓把「必须保留 `unknown`」的理由写得很细，而**同仓往往
   已经有更好的写法**（本轮 `inspector.ts:473` 就是标准答案）。⇒ 抽检顺序：先在本仓搜**同形状**
   的既有写法，再考虑新造。
2. **`interface extends` 与交叉类型的分工**：需要「补身份」而不是「改契约」时用交叉 ——
   `interface extends` 会强制本地成员去兼容基类的宽松签名（如 `(...args: unknown[]) => Loose`），
   一旦不兼容就报「incorrectly extends」；交叉只做类型合并。
3. **`[]`（`never[]`）是「互不重叠」的常见源头**：空数组字面量断言成「数组 + 额外成员」时两头都
   不满足 ⇒ 先 `as T[]` 把元素类型说出来，剩下那一级就只是「补成员」了。

## 第 149 轮（2026-09-22）：`unknown-casts` 9 → 7 —— 推翻档案里最后一条「必须保留」，并放开一个只是「书写时假设」的约束

### 一、起因

```ts
// ui-kit YMTitleBar.vue（档案：TS2352，成员与全局 `Window` 构造器同名、不可比）
return (window as unknown as Window & { Window?: { close(id?: string): void } }).Window;
// editor events/custom-events.ts（档案：`readPayload` 的 `T` 受 `extends object` 约束）
readPayload<Record<string, unknown>>(event) as unknown as CustomEventPayloads[K],
```

### 二、A：档案的**真正解法**是给全局补声明（第 138 轮同一手法），但「补在哪」有三条硬约束

事实：`window.Window` 是**宿主**挂的（`editor/src/tools/window-object.ts` 用
`Reflect.set(window, 'Window', …)`），ui-kit 只是读方；没有声明 ⇒ 静态上被解析成全局
`Window` 构造器 ⇒ 只能 `unknown` 跳板。

第一版修法（在 ui-kit 的 `src/types/host-globals.d.ts` 里 `declare global { interface Window { Window?: … } }`）
**过不了门禁**，逼出了三条约束 —— 这三条比修法本身更值钱：

1. **补声明本身不够**：`window` 的静态类型是 `Window & typeof globalThis`，而 `typeof globalThis`
   上还有一个**同名构造器** `Window` ⇒ 两者相交后 `window.Window` 是「构造器 ∩ 可选成员」，
   直读/写/删分别报 **TS2741 / TS2322 / TS2790**（三个都实测到了）。读点仍需一行
   **窄化赋值**：`const host: Window = window;`（可赋，不是断言 —— `Window & typeof globalThis`
   可赋给 `Window`），此后 `host.Window` 才是那个可选成员，`delete` 也合法。
2. **声明所在文件必须进入「当期程序」，而本仓有三个程序**会编译到这个组件：① ui-kit 自己的
   tsconfig（`build:types`）；② 编辑器侧的 `typecheck:vue`（用自己的 tsconfig，**只按模块图 +
   自己的 glob 收文件**）；③ **oxlint 的类型感知规则**。实测：
   - 独立 `.d.ts`（`src/types/` 下，无人 import）⇒ 程序 ② 看不见（**TS2551**）；
   - 把 `declare global` 写进 `YMTitleBar.vue` ⇒ 程序 ② 好了、程序 ③ 又看不见（同样 TS2551）。
3. **最终落点**：`src/types/host-globals.ts`（**真 `.ts` 模块**，不是 `.d.ts`）+ 在 `src/index.ts`
   里 `import './types/host-globals';` —— 桶文件是编辑器必然引用到的入口 ⇒ 三个程序都看得到
   （`test`/`build` 也照常：模块是空的，运行期无副作用）。

声明成**可选**是如实描述（宿主未挂载时它确实是 `undefined`），顺带让 spec 里
`delete host.Window` 合法 —— 第 146 轮那条「`delete` 只能删可选属性」正好在这里用上。

**附一条踩坑**：第一版注释里写了 `src/**/*.d.ts`，其中 `**/` 里的 `*/` **提前闭合了块注释**，
后续文字变成代码 ⇒ 31 个语法错误（TS1434/TS1443）。本仓 `text:check` 的 `nested-comment-opener`
只查**多余的 `/*`**，查不出这种「注释被提前关闭」⇒ 写注释时别把 `*/` 拼出来（写「`src` 下的
所有 `.d.ts`」即可）。

### 三、B：一个「只是书写时假设」的约束，挡住了两件真事

`readPayload<T extends object>`：运行时就是一次 `as`，什么都不检查；而这个约束挡住了
① 载荷表里的 `undefined`（无载荷事件）与 `string`（`'yami:error'` 的类型是 `{ … } | string`），
② 于是 `onCustom` 只能写两层跳板。

改法：`PayloadEvent<T>` / `readPayload<T>` 去掉约束，调用点写
`readPayload<CustomEventPayloads[K]>(event)` ⇒ 断言消失。

**安全性论证（实测而非推断）**：现有 `readPayload<…>` 调用点**全部显式给类型实参**
（`readPayload<{ value: string }>` 之类）⇒ 放开约束不改变它们的推断；`build:types` 与
editor `tsc` 均 0 错。

### 四、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **9 → 7**（files 8 → 6；基线已固化） |
| 新增 | `packages/ui-kit/src/types/host-globals.ts`（真 `.ts` 模块）+ 桶文件 `import`（让三个程序都看得见） |
| spec | ui-kit `YMTitleBar` 6 + `payload-event` 4；editor `custom-events` 4；全量见提交 |
| 行为变化 | **0**（全是类型层；新增模块是空的） |
| 门禁 | ui-kit `build:types` 0 / editor `tsc` 0 / editor `vue-tsc` 0 新错 / lint 0-0 / format / text / docs |

### 五、教训

1. **档案里的「必须保留」是被写下的结论，不是事实**：本轮两处档案都倒了 —— 一处写着
   「不是可机械改的」，一处写着「约束挡着」。⇒ 保留项的措辞越具体（含实测报错原文），
   越容易被下一次抽检兑现；而「不可机械改」这种**结论性**措辞，应当同时写下「试过什么」。
2. **约束要分清「语义必需」与「书写时假设」**：`T extends object` 属于后者 —— 运行时零检查，
   却把 `undefined` / `string` 载荷挡在外面。⇒ 删约束前先查**调用点是否全部显式给类型实参**
   （有推断依赖就不能删）。
3. **全局声明有三件事要一次想清**：补**哪个成员**、放在**哪个程序看得见的地方**、读点是否还要
   **窄化**。本轮三条全踩过：成员可选、落点要进三个程序（`.d.ts` 无人 import ⇒ 不进模块图）、
   读点要 `const host: Window = window`（同名构造器会把成员相交掉）。
   ⇒ 「补声明」不是一句 `declare global` 就完事，**先数清有几个程序会编译这个文件**。
4. **注释里别拼出 `*/`**：写文件通配（`src/**/*.d.ts` 这种）时会意外闭合块注释，后续文字变成
   代码（本轮实测 31 个语法错误）。`text:check` 的 `nested-comment-opener` 只查多余 `/*`，
   这类查不出 ⇒ 用文字描述代替通配串。

## 第 150 轮（2026-09-22）：`unknown-casts` 7 → 6 —— 一处用模板字面量索引签名收掉，两处 monaco 保留项补上「量过」的理由

### 一、起因：剩下三处未拆的

```ts
// utils/monaco.ts:11 —— (await import('…/editor.api')) as unknown as MonacoApi
// module/monaco-dts.ts:10 —— monaco.languages.typescript as unknown as { javascriptDefaults… }
// services/updater/incremental.ts:364 —— (updater as unknown as Record<string, (update: boolean) => void>)[version]
```

### 二、A：monaco 两处 —— 先试「单次 `as` 够不够」，让 tsc 给出**精确的缺项清单**

- `monaco.ts`：把 `as unknown as MonacoApi` 降级成单次 `as` ⇒ **TS2352**，而且 tsc 直接列出缺什么：
  「missing the following properties from type … : `createWebWorker`, `css`, `html`, `json`,
  and 2 more」⇒ 本模块的运行时对象（`editor.api` + 手动注册的 typescript / json 贡献）**真的**比
  `MonacoApi`（= `typeof import('monaco-editor')` = `editor.main`）少 6 个成员 —— css / html /
  createWebWorker 我们从未注册。跳板主张的是「按需注册过的这部分，当全量 API 用」。
- `monaco-dts.ts`：直接删断言 ⇒ **TS2339**：
  `Property 'javascriptDefaults' does not exist on type '{ deprecated: true; }'` ——
  monaco 0.55 的类型里 `languages.typescript` 只是**占位**；而语言服务的类型**没地方 import**：
  实际打开 `esm/vs/language/typescript/monaco.contribution.d.ts`，内容就是一行 `export {}`。
- ⇒ 两处都**恢复断言**，但理由换成上面的实测原文（含「贡献模块 `.d.ts` 是空的」这次查证）。
  这正是第 136 / 145 轮那条：**保留项的价值 = 它写下的理由有多硬**。

### 三、B：`incremental.ts` —— 用**模板字面量索引签名**如实描述「这张表」

事实：类里 19 个版本处理函数按 `1.0.NNN` 命名，而**版本区间连续、处理器不连续**
（`1.0.132` / `1.0.133` / `1.0.138` 等是空档）⇒ 动态取值**可能为 `undefined`**，代码里
`if (handler)` 正为此存在。于是给类补一条索引签名：

```ts
[version: `1.0.${number}`]: ((update: boolean) => void) | undefined;
```

查找于是变成 `updater[version]`，断言整条消失；而 `| undefined` **保留了那个空档语义** ——
比 `as Record<string, fn>` 那种「一定存在」的口径更准，`if (handler)` 也因此不再可疑。

细节：`const version = \`1.0.${minorVer}\`` 推断出来是 `string`（TS7053）⇒ 标注成
`` const version: `1.0.${number}` = \`1.0.${minorVer}\` `` —— **模板字面量表达式的类型由上下文类型
决定**，所以这是**标注而不是断言**，`minorVer: number` 正好匹配 `${number}`。

### 四、账

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **7 → 6**（files 6 → 5；基线已固化） |
| 保留项 | 2 处 monaco 断言保留，理由从「类型缺口」升级为**实测原文 + 查证** |
| 行为变化 | **0**（索引签名是纯类型；两处 monaco 只改注释、断言语义不变） |
| 门禁 | tsc 0 / vue-tsc 0 新错 / lint 0-0（1645 文件）/ format 0 / text 0 / docs OK |

### 五、教训

1. **「单次 `as` 行不行」永远值得先试一次**：本轮两处 monaco 一测就分出了性质 ——
   一处 TS2352（**真的**缺成员，tsc 还会列出缺哪几个），一处 TS2339（成员被声明成占位）。
   两种都**不是**「写法问题」，而是「声明与运行时不一致」⇒ 结论是保留 + 写清理由。
2. **保留项也要复核，而且「确认」同样是收益**：第 149 轮推翻了另外两处「必须保留」，本轮把这两处
   **确认**为必须保留 —— 档案从「类型缺口」这种模糊说法，变成「缺 `createWebWorker` / `css` /
   `html` / `json`」与「贡献模块 `.d.ts` 就一行 `export {}`」这种可直接复核的事实。
3. **索引签名可以写到类上，模板字面量形式最贴切**：`` [k: `1.0.${number}`] `` 比
   `Record<string, fn>` 精确得多 —— 它表达了**键的形状**，也允许把值写成 `| undefined`
   来如实保留**空档**语义。
4. **模板字面量表达式的类型由上下文决定**：`\`1.0.${n}\`` 本身是 `string`，写了标注才成为
   `` `1.0.${number}` `` —— 记住这一点，就不必用断言去凑索引签名的键类型。

## 第 151 轮（2026-09-22）：`any-hatches` 46 → 44 —— 第 145 轮那次合并，让 `ParticleLayerData` 的索引签名变成可摘的

### 一、起因：把上一轮总结里的方向落地 —— 用现成的手法库去打 `any-hatches`

- 先用仓库自己的尺子看**种类**：`node scripts/any-hatch-inventory.mjs --kinds`
  ⇒ 46 处 = **25 RECORD_ANNOT**（常量自己的注解）+ **21 INDEX_SIG**（接口里的索引签名）；
- 再量**单点代价**：`node scripts/oneoff/measure-any-hatch-site.mjs <相对路径> <行号>`。

⚠️ 两个脚本都**按行号**取站点 ⇒ 只要文件被编辑过（本轮之前我刚在 `particle-engine.ts` 里加过
约 60 行），行号就漂了 —— 本轮第一次测量量到的其实是**注释行**（工具如实回报「这一行里没找到可摘的
`Record<string, any>`」）。⇒ 旧报表里的行号只能当线索，动手前 grep 一遍。

### 二、`ParticleLayerData` 的索引签名：第 145 轮埋下的伏笔

该接口在第 145 轮被**合并**（补进 `lifetime` / `lifetimeDev` / `fadeout` / `anchor` / `rotation` /
`hRotation` / `movement` / `scale` / `sprite` 共 9 个成员），当时仍留着 `[k: string]: any`。

本轮摘掉它 ⇒ tsc 只报 **12 条 TS2339，全在本文件**，精确给出候选清单：
`color` ×7、`sort` / `blend` / `light` / `image` / `count` 各 1。六个字段逐个**从读点逆推**：

| 字段 | 依据（读点） | 类型 |
| --- | --- | --- |
| `sort` | `draw` 里 `switch (data.sort)` 的三个 case | `string`（值来自工程数据，不收成联合） |
| `blend` | 直接赋给 `gl.blend` | `string` |
| `light` | `ParticleLayer.lightSamplingModes` 的下标 | `string` |
| `image` | `loadTexture` 里与 `texture.base.guid` 比对 | `string` |
| `count` | `updateCount` 里 `0` 表示不限（改成 `1e16`） | `number` |
| `color` | `mode` 决定用 `rgba` / `min`+`max` / `easingId`+`start*`+`end*` / `tint` 哪一组 | 见下 |

⇒ **第 145 轮那次「合并两份各写一半的形状」正是本轮能摘掉这行索引签名的直接原因**：接口一旦具体，
索引签名就从「逃生口」退化成「赘余」。

### 三、顺带一个**零代价**站点：`ParticleEmitterShape` 的索引签名

同文件的 `ParticleEmitterShape` 也带 `[k: string]: any`。量了一下：**摘掉后 tsc 报 0 条** ⇒ 直接删。
⇒ 值得记住的判据：**先量再删** —— 有些索引签名从写下那天起就没人依赖，量一次（约 40 秒）
比通读所有使用点便宜得多。

### 四、账

| 项 | 结果 |
| --- | --- |
| `any-hatches` | **46 → 44**（files 22 不变：同文件还有一处 `ParticleEngine: Record<string, any>`） |
| 新增声明 | `ParticleLayerData` 六字段 + `color` 分组（含一条**明写的取舍**） |
| 行为变化 | **0**（纯类型 + 注释） |
| spec | particle 13 例绿；全量 **255 文件 / 2075 用例** |
| 门禁 | tsc 0 / vue-tsc 0 新错 / lint 0-0（1645 文件）/ format 0 / text 0 / docs OK |

### 五、教训

1. **「先量种类、再量单点代价」是两条轴通用的开工顺序**：种类决定**改法**
   （RECORD_ANNOT 摘的是常量注解、INDEX_SIG 摘的是接口成员），单点代价决定**值不值得动手**。
   本轮两处都是量出来的，不是读出来的。
2. **行号会漂**：两个尺子脚本都按行号定位站点，文件一改就错位。⇒ 报表行号只是线索。
3. **索引签名也可能是「零依赖」的**：`ParticleEmitterShape` 摘掉后 0 错。⇒ 别默认它承重。
4. **取舍要明写**：`color` 的四组字段运行期**互斥存在**（inspector 切模式时会删组），
   我按「全组可读」声明以避免十来个非空断言 —— 这条**不是默认，而是写进注释的决定**，
   并给出反证位置（`inspector/particle-layer-page.ts:285`）。

## 第 152 轮（2026-09-22）：`any-hatches` 44 → 41 —— 把「挑站点」从猜变成查表（新增代价扫描尺）

### 一、起因：我挑站点的方法本身在出错

第 151 轮是**按文件名与旧笔记猜**的：先试 `ParticleEngine` 注册表（19 条、三张子表）、
再试 `useCommandParse.ts:29`（**67 条**）—— 都贵；只有 `ParticleEmitterShape` 是「0 条」的意外之喜。
⇒ 缺的不是摘法，是**判断哪一处便宜**的尺子。

### 二、新尺子：`scripts/oneoff/scan-any-hatch-costs.mjs`

- 站点枚举**复用 `lib/scan.mjs`**（同 `SCAN_DIRS` / `EXCLUDE_RE` / `ANY_HATCH_RE` / `codeOnly`），
  与 `migration:check` 的 `any-hatches` 轴**同源** ⇒ **自证**：`--limit 0` 时报「站点 44 处」，
  与台账 `any-hatches.total = 44` 逐字相等 ✓。
- 单点测量复用 `measure-any-hatch-site.mjs` 新导出的 `measureAnyHatchSite()`
  （**同一份摘法**，否则两把尺子读数不可比）—— 该文件同时被改造成「可 import、也可当 CLI 用」
  （用 `import.meta.url` 判定是否直接执行）。
- 用法：`[--limit N] [--all] [--kind INDEX_SIG|RECORD_ANNOT]`；输出按代价**升序**的表
  （带「缺哪些字段」「落在哪些文件」）。类型别名（`type X = Record<string, any>`）不可机械测
  ⇒ 单列在「跳过」区。
- ⚠️ 每测一处会**临时改写**该文件再写回（逐字复核）⇒ 扫描期间不要并行编辑仓库。

### 三、第一次扫描结果（`INDEX_SIG` 前 10 处）

| 代价 | 站点 | 备注 |
| --- | --- | --- |
| **1** | `useCommandParse.ts:37`（`CommandNode`） | 本轮摘掉 |
| **2** | `useCommandParse.ts:47`（`TextContent`，children×2） | 本轮摘掉 |
| **2** | `element-base.ts:29`（`UIParentShape`） | 本轮摘掉 |
| 5 | `animation-window.ts:78`（editor×5） | 下一轮候选 |
| 20 | `element-base.ts:10`（`UIElementShape`） | 已知「有意保留」 |
| 21 | `schema.ts:88`（targetWrite×4…） | |
| 67 | `useCommandParse.ts:29`（`CommandObjectShape`） | **我上一步猜的那处** ✗ |
| 89 | `schema.ts:71` | |
| 539 | `data-object.ts:67`（`Data` 单例） | |
| 1179 | `animation-window.ts:177`（`Animation` 单例） | |

⇒ 一眼看出规律：**便宜的是「小数据形状」（1–5 条），贵的是「单例 / 被上百处访问的大接口」**
（`Data` 539、`Animation` 1179）。第 151 轮猜的三处里有两处正属于贵的 ✗。

### 四、本轮摘掉的三处（表里最便宜的三行）

1. **`CommandNode`**：摘掉 `[k: string]: any` 后只剩 1 条 —— `commandState.currentCommand = command`
   （目标类型是 `Record<string, unknown>`）⇒ 把索引签名**降级**成 `[k: string]: unknown`
   （本仓既有写法，见 `element-classes.ts` 的 `UINodeShape`）：不进 `any-hatches` 口径，
   又保留「动态成员可写、但拼错键不会静默变成 `any`」。
2. **`TextContent`**：补 `children?: CommandNode[]` —— tsc 直接指认它被传进
   `fetchVariables(commands: CommandNode[])`（`:140`），即「嵌套子命令」。
3. **`UIParentShape`**：补 `parent: UIParentShape | null`（`contains()` 沿它上溯）与
   `requestResizing?: () => void` —— 后者**只有窗口类元素有**，调用点在
   `this.parent instanceof uiElClasses.Window` 守卫之后 ⇒ 声明可选 + 调用点写 `?.`，
   那个守卫正是它安全的理由。

### 五、账

| 项 | 结果 |
| --- | --- |
| `any-hatches` | **44 → 41**（files 22 不变：三处都在已有文件里；基线已固化） |
| 新尺子 | `scripts/oneoff/scan-any-hatch-costs.mjs`（自证 44 = 台账 44）+ 探针改造成可 import |
| 行为变化 | **0**（类型为主；`requestResizing` 一处由 `()` 改 `?.()`，其前置守卫保证等价） |
| 门禁 | tsc 0 / lint 0-0（1646 文件）/ format 0 / text 0 |

### 六、教训

1. **「挑站点」本身要有尺子**：第 151 轮靠文件名猜，三处里两处很贵。⇒ 一次扫描换一张排序表，
   之后每轮只需看表头。
2. **新尺子的验收条件是「与旧尺子同源」**：枚举复用 `lib/scan.mjs`，并在 `--limit 0` 时自证总数
   （44 = 44）；否则两张表的读数不可比。
3. **贵的形状有共同特征**：单例（`Data` / `Animation`）与「被上百处访问的大接口」；
   便宜的是小数据形状。⇒ 先看「谁在用」，再看「缺哪些字段」。
4. **降级也是收口**：`[k: string]: any` → `[k: string]: unknown` 不进轴，但确实收紧了
   （本仓 `UINodeShape` 就是这个口径）。轴只数 `any`，别为了动轴把 `unknown` 也硬拆。

## 第 153 轮（2026-09-22）：`any-hatches` 41 → 40 —— 摘掉扫描表里 5 条那处，并把 RECORD_ANNOT 一批也量了

### 一、起因：上一轮扫描表的下一行

`animation-window.ts:78`（`AnimationFileContext` 的 `[k: string]: any`）—— 代价 **5 条**，全部落在
`animation/file.ts` 的 `context.editor.*` 访问上。

### 二、修法：给 `AnimationFileContext` 补**可选**的 `editor`

- 这个上下文由 **tab 传入**、`editor` 在 `open` / `load` 时才挂上（`particle-window.ts` 里同类上下文
  就是这么注释的：`tab 传入 + open/load 运行时挂载 editor`）⇒ 声明成**可选**是如实描述。
- 九个成员**逐个从读点逆推**：`motion` / `target` / `player` / `history` / `centerX` / `centerY` /
  `selectionX` / `selectionLength` / `listScrollTop`。
- `player` 直接写成 `NonNullable<typeof Animation.player>` —— 同一个实例在两边流转
  （`load` 里 `this.player = editor.player`、`destroy` 里 `editor.player = this.player`），
  这样既不必写第三份局部形状，那两处赋值还互为校验。
- 读点补一行 `const editor = context.editor!;`（可选声明 + **一处** `!`，注释写明
  「上面的 `firstLoad` 分支刚保证它存在」）—— 比在四个读点各写一次 `!` 收敛。

### 三、顺带：把 RECORD_ANNOT 那 25 处也量了一批（此前只量了 INDEX_SIG）

| 代价 | 站点 | 备注 |
| --- | --- | --- |
| 19 | `particle-engine.ts:12` | 正是第 152 轮回退的那个（被跨视图统一挡住） |
| 20 | `scene-camera-engine.ts:9` | 第 130–132 轮试过并回退（spec mock 是具体对象字面量） |
| 54 | `animation-window-engine.ts:12` | 同上 |
| 93 | `ui-engine.ts:22` | ④ 系列所有 |
| 307 | `auto-tile.ts:49` | |
| 跳过 3 处 | | 1 处是类型别名（不可机械测）+ 2 处行号未命中 |

⇒ **RECORD_ANNOT 这批最便宜的是 19 条，而且已被挡住** —— 与 INDEX_SIG 那批（1 / 2 / 2 / 5…）
形成鲜明对比。原因不难理解：RECORD_ANNOT 多是**引擎成员表 / 单例**（一改就是几十上百个访问点），
而 INDEX_SIG 里有不少是**小数据形状**。

⇒ 结论：这条轴的**「便宜区」基本已在前两轮摘完**；剩下的要么贵，要么被别的债挡住。

### 四、账

| 项 | 结果 |
| --- | --- |
| `any-hatches` | **41 → 40**（files 22；基线已固化） |
| 新增声明 | `AnimationFileContext.editor?`（9 个成员，全部有读点依据） |
| 行为变化 | **0** |
| 门禁 | tsc 0 / vue-tsc 0 新错 / lint 0-0（1646 文件）/ format 0 / text 0 / docs OK |

### 五、教训

1. **同一个实例在两边流转时，用 `NonNullable<typeof X.field>` 复用类型**：比自己再写一份局部形状
   更不容易漂（本轮 `player`），而且两处赋值会互相校验。
2. **可选成员 + 一处 `!` 优于在多处读点各写 `!`**：把「谁保证了它存在」写进那一行
   （本轮是 `firstLoad` 分支）。
3. **负结果也要量化**：「RECORD_ANNOT 这批最便宜 19 条且被挡住」是个有用的结论 —— 它说明这条轴
   接下来该换战场（做那个跨视图统一，或回去等 ④ 的决策），而不是继续在这张表上找便宜的。

## 第 154 轮（2026-09-22）：`any-hatches` 40 → 37、`legacy-ui-lines` 302 → 300 —— 量清粒子跨视图统一（79 条）后**回退**，顺手摘掉三处**零代价**站点

### 一、起因：上一轮留下的两条路，先走「跨视图统一」

第 153 轮结论是「便宜区已摘完」，剩下两条路：① 粒子模块的跨视图统一（解锁 `particle-engine.ts:12`
那处 19 条）；② 大单例（`Data` / `Animation`，几百条）。本轮先走 ①。

### 二、做了什么（然后回退了）

按第 152 轮勘察的清单动手：

1. 引擎侧导出 5 个局部类型（`ParticleEmitterData` / `ParticleLayerData` / `ParticleElementRef` /
   `ParticleEmitterShape` / `ParticleLayerShape`）；
2. 窗口侧两份接口改成**继承**引擎侧（`ParticleLayerShape extends EngineLayerShape`、
   `ParticleEmitterShape extends EngineEmitterShape`），把 `data` / `elements` / `texture` 三个
   成员收敛成同一份；
3. 给 `ParticleEngine` 写上真实注册表类型（`Partial` 口径的三个构造器）。

**账上确实降了**：`any-hatches` 40 → **36**（4 处：注册表 + 两份窗口接口的索引签名 + 1）。
但 tsc 报出 **79 条**、跨 8 个文件：

```txt
animation-motion.ts      7   emitter.hasArea / outerLeft / outerTop / outerRight / outerBottom …
animation-player.ts     10   emitter.emitParticles / updateParticles / disabled / layer / draw / isEmpty
animation-window-engine  5   emitter.hasArea / outerLeft …
particle-motion.ts      20   emitter.active / selected / outer*；element.x / y / anchorX / anchorY …
particle-list.ts         2   emitter.active / selected
particle-layer-page.ts   1   emitter.getLayer
particle-initialize.ts   3   Particle.Emitter/Layer/Element 赋值（注册表成员可选）
particle.spec.ts        13   ParticleEngine.Element/Emitter 可能为 undefined
```

⇒ 这些错误**不是新缺陷**，而是两份索引签名原来「兜着」的全部动态成员：发射器上运行期挂的
`hasArea` / `outer*`（7 个）、`active` / `selected` / `disabled` / `isEmpty`、`layer` / `draw`、
`emitParticles` / `updateParticles` / `getLayer`，以及元素上的 `x` / `y` / `anchorX` / `anchorY` /
`rotationAngle` / `scaleFactor`。

**结论：回退**（`git checkout --` 两个文件）。理由：要给这些形状补约 25–30 个成员声明 + 16 处 `!`，
是**一次跨 8 文件的重构**，不该塞进本轮尾部；本仓的纪律是「每个提交都完整验证过」。
本轮改为把这件活的**确切清单量化下来**（上面那段报错摘要就是工作单），并把代价表补全。

### 三、补全代价表：三处**零代价**站点浮出来了

既然要走 ① 那条路，就得先确认「还有没有更便宜的」。于是把 `INDEX_SIG` 那批**剩下的全部**站点扫完
（前两轮只扫了前 10 / 前 8 个 —— 这是个方法错误：**没量过 ≠ 贵**）。结果：

```txt
    0  INDEX_SIG  engine/ui/legacy/ui-window.ts:86
    0  INDEX_SIG  particle/particle-window.ts:43   ← ParticleElementShape
    0  INDEX_SIG  particle/particle-window.ts:55   ← ParticleLayerShape
    7  INDEX_SIG  engine/ui/element-classes.ts:55
   20  INDEX_SIG  engine/ui/element-base.ts:10     ← 已知有意保留
   21  INDEX_SIG  commands/schema.ts:88
   67  INDEX_SIG  composables/useCommandParse.ts:29
   71  INDEX_SIG  particle/particle-window.ts:77   ← **粒子那个「贵」的其实是这一处**（发射器）
   79 … 89 … 452 … 539 … 897 … 1180 … 1455（单例与大接口）
```

⇒ **三处 0 条**，直接摘掉；而且顺带一个重要澄清：粒子的跨视图统一之所以爆 79 条，
主因是 `ParticleEmitterShape`（**71 条**），而不是我原先以为的整块 —— 那两份**数据/图层**视图
（43 / 55 行）本来就是零代价的。**摘掉它们还让 `legacy-ui-lines` 一起掉了**（`ui-window.ts:86`
在遗留层目录里，删两行 ⇒ 302 → 300）。

### 四、账

| 项 | 结果 |
| --- | --- |
| `any-hatches` | 40 → **37**（files 22；三处零代价站点；基线已固化） |
| `legacy-ui-lines` | **302 → 300**（遗留层顺手掉两行） |
| 产出 | 粒子跨视图统一的完整工作单（79 条 = 需补成员清单，主因是 `ParticleEmitterShape` 的 71 条） |
| 回退 | 跨视图统一那两次改动（2 个文件 `git checkout --`），tsc / 门禁恢复全绿 |
| 门禁 | tsc 0 / vue-tsc 0 新错 / lint 0-0（1646 文件）/ format 0 / text 0 / docs OK |

### 五、教训

1. **「索引签名」是记账工具，不是免费的**：它一直在兜着 79 处动态成员的访问（发射器 + 元素共约
   30 个成员）。摘它等于**一次性把这笔账翻出来** —— 所以「量单点代价」这一步永远不能跳
   （本轮量到的是 19，实际连带 79）。
2. **量到的代价是「摘一处」的**，而改法可能牵动多个文件：`particle-engine.ts:12` 显示 19 条，
   但那条路要先把窗口侧两份视图改成超集，于是 79 条。⇒ 选目标时要把「改法」也当成代价的一部分。
3. **该回退就回退**：本轮如果把 79 条硬补完，就得在同一轮里写 ~30 个成员声明 + 16 处 `!`，
   验证强度必然下降。⇒ 本仓的纪律（每提交完整验证）优先于「账上好看一点」。
4. **「没量过」不等于「贵」** —— 这是本轮最有价值的教训：前两轮各自只扫了前 10 / 前 8 个站点，
   于是「便宜区已摘完」这个结论**建立在半个表上**；把剩下的扫完，立刻浮出**三处 0 条**。
   ⇒ 扫描要么一次扫完，要么在结论里写明「只量了前 N 个」。
5. **「一次改动可能同时动两条轴」**：`ui-window.ts:86` 的索引签名在**遗留层目录**里，摘它
   顺带把 `legacy-ui-lines` 从 302 拉到 300。⇒ 挑站点时可以优先看那些**同时落在多条轴口径里**
   的位置。

## 第 155 轮（2026-09-22）：`any-hatches` 37 → 36 —— 补全 RECORD_ANNOT 代价表（又出 4 处便宜站点，3 处被别的债挡住）

### 一、起因：上一轮定下的第一件事

把 `RECORD_ANNOT` 那 25 处**也扫完**（此前只量了前 8 个 —— 正是上一轮记下的「半张表」错误）。

### 二、RECORD_ANNOT 完整表（本轮新量出的部分 + 处置）

| 代价 | 站点 | 处置 |
| --- | --- | --- |
| **0** | `YMParameterPane.vue:153` / `:263`（`guidMap` 值） | 试过 ⇒ 被 metadata 层挡住（见三），回退 |
| **1** | `particle-window.ts:249`（`ParticleElement.stage`） | 试过 ⇒ 转成**行为问题**（见四） |
| **2** | `stores/data.ts:149`（`Data.config`） | 试过 ⇒ 7 条，改成「量过的保留」（见五） |
| **7** | `element-classes.ts:55`（`UIElementInstance`） | **本轮摘掉** ✓ |
| 17 | `setting-config/index.ts:16` | |
| 19 / 20 / 54 / 82 / 93 / 307 / 696 | `particle-engine:12` / `scene-camera-engine:9` / `animation-window-engine:12` / `tile-frame-index:13` / `ui-engine:22` / `auto-tile:49` / `palette.ts:4` | 大件或已登记 |

### 三、`guidMap` 那对（0 条）为什么没摘成：**跨包契约的上游没写全**

ui-kit 自己读到 `meta.parameters` / `meta.langMap.update().get(...)` / `meta.overview?.deprecated`
（`:349-356`，实测 3 条）。于是我先在 ui-kit 侧写了具名 `ManifestEntry`（`parameters: ParamDef[]`、
`langMap: { update(): { get(key): string } }`、`overview?`）—— 两处 0 条站点确实摘掉了、**账降到 35**；
但编辑器侧的 prop 绑定随即报错：

```txt
ParameterPane.vue(7,4): TS2322   ← :data-manifest="dataManifest"
```

宿主传的是 `Data.manifest`（`ManifestShape.guidMap: Record<string, FileMeta>`，
`FileMeta = InstanceType<typeof Meta>`），而 **`Meta.parameters` 是 `unknown[] | null`、
`langMap` / `overview` 根本没声明**（`langMap` 在编辑器侧出现 **0** 次）⇒ 上游形状不全。
收口要先动 metadata 层（收紧 `Meta.parameters` + 补两个动态成员），那是独立的一件事
⇒ **回退** ui-kit 侧那部分（基线恢复 37）。

### 四、`particle-window.ts:249`（1 条）→ 转成**行为问题**

`ParticleElement.stage` 有两条赋值线索：`particle-file.ts:23` 存 `Particle` 单例、
`scene-window.ts:945` 存 `Scene` 单例；唯一读点是 `particle-engine.ts:571` 的
`.multiply(ParticleElement.stage.matrix)`。写任一单例形状都会在另一条赋值处报错；收成读点面
`{ matrix: Matrix }` 又暴露 **`SceneShape` 没有具名的 `matrix`**（运行期确实有：`scene-window.ts:195`
初始化 `null`、`:578` 赋 `new Matrix()`，一直靠索引签名兜着）。

⇒ 要收口得先判定「**场景当舞台时 `.matrix` 是否保证非空**」（读点直接进 `multiply`，传 `null`
会当场抛）—— 那是行为判定，**不能靠类型猜**。已就地写进注释（含反证位置与两条赋值线索）。

### 五、`stores/data.ts:149`（2 条）→ 改成「量过的保留」

降级成 `unknown` ⇒ 当场 **7 条**，全在 `services/updater/config.ts`（读 `config.event.startup` /
`loadGame` / `initScene` / `showText` / `showChoices` 等**具体字段**）⇒ 它**不是动态包**，而是
「有形状但尚未声明」的项目配置。注释已改成这条实测理由（不再写「schema 驱动、推不出来」）。

### 六、本轮真正摘掉的：`element-classes.ts:55`（7 条）

`UIElementInstance` 的索引签名实际只被四个成员用到：

- `draw` / `resize`：`element-base.ts` 按 `children` 循环调用，**均无参** ⇒ 写成必填无参方法；
- `addReference` / `tryUpdateReferenceElements`：**只有根元素有**（`root-element.ts:42` / `:59`）
  ⇒ 声明为可选，三个调用点补 `!`（保持不变式破坏时**当场抛错**的行为，而不是 `?.` 静默跳过）。

该接口的注释原本写着「刻意保持宽松」—— 又一次第 148 轮那条「重审保留项」命中：**量过之后
它就是 7 条**。注释按新证据续写（历史保留，不删旧理由）。

### 七、账

| 项 | 结果 |
| --- | --- |
| `any-hatches` | **37 → 36**（files 22；基线已固化） |
| 新尺子数据 | `RECORD_ANNOT` 全表（26 处，含 13 处「不可机械测」） |
| 行为变化 | **0**（三处 `!` 与一处声明补全） |
| 门禁 | tsc 0 / vue-tsc 0 新错 / lint 0-0（1646 文件）/ format 0 / text 0 / docs OK |

### 八、教训

1. **跨包契约要「上下游一起看」**：ui-kit 侧写全了，宿主侧却撞上 `Meta.parameters: unknown[]`
   ⇒ 收口前先确认**上游是否写全**（本轮若先看宿主，就不会先花两次 tsc 再回退）。
2. **「摘一处」可能撞出行为问题**：`stage` 那处最后变成「场景当舞台时 `.matrix` 是否非空」——
   类型收口的终点有时是**取机器判定**；写进注释比硬猜好。
3. **降级也是收口，但先量**：`config` 一降就 7 条 ⇒ 说明它不是「未知包」而是「没声明」，
   方向要从「降级」改成「补形状」。
4. **完整扫描的收益再次兑现**：上一轮从「补全 INDEX_SIG」里捡到 3 处 0 条；本轮从「补全
   RECORD_ANNOT」里又捡到 4 处便宜站点（0/0/1/2）—— **没量过的站点就是没被利用的机会**。

## 第 156 轮（2026-09-22）：`any-hatches` 36 → 34 —— 把第 155 轮撞上的那堵墙（上游 metadata 层）拆了

### 一、起因：复盘第 155 轮那次「账降到 35 又回退」

当时的结论是「跨包契约的上游没写全」：ui-kit 读了清单条目的 `parameters` / `langMap` /
`overview`，而宿主侧 `Meta` 里 `parameters: unknown[] | null`、`langMap` / `overview`
**根本没声明**。本轮先把上游补齐。

### 二、先量影响面（这次没白花）

`Meta.parameters` 在编辑器侧的**写点只有两处**（声明 + 构造函数里的 `= []`），而 `.parameters`
的读点在编辑器 `.ts` 里是 **0 处**（读它的是 ui-kit）⇒ 改动级联预期为零。实测确实如此。

### 三、动手（4 个文件、6 处小改）

1. ui-kit barrel 导出 `ParamDef`；
2. `Meta.parameters` → `ParamDef[] | null`（与参数面板契约**同源**），并补两个 `declare`：
   `langMap`（`update().get(key)`）与 `overview?: { deprecated?: string }` —— 形状全部取自
   ui-kit 的**读点**（不是猜的）；
3. `ManifestEntry` **搬到独立模块** `manifest-entry.ts` 并从 barrel 导出 —— 第 155 轮它只写在
   `.vue` 里，宿主**引用不到**，这正是那次 prop 绑定报错的一半原因；
4. 编辑器 `ParameterPane.vue` 的 `dataManifest` 注解改用**同一份** `ManifestEntry`；
5. ui-kit 读点改成 `if (!paramList?.length) continue;` —— `parameters` 在非 script 条目上是
   `null`，旧写法直接 `.length` 会抛 ⇒「不可能路径上由抛错改成跳过」（与第 143 轮 `fnEmpty` 同款，
   已就地注释）。

### 四、两个形状细节（都实测踩过）

- **封闭形状**：`ManifestEntry` 刻意**不留**索引签名 —— 宿主的值是
  `FileMeta = InstanceType<typeof Meta>`（**类实例**），而「带 `[k: string]: unknown` 的目标」
  要求源**也有**索引签名 ⇒ 留了反而拒收宿主（本轮实测报的正是这条）。
- **`ParamDef` 从 ui-kit 导入**：宿主的 metadata 层引用 ui-kit 的 UI 契约类型，看着像层次倒挂，
  但那就是**同一份契约**；否则两边各写一份、下次照样漂。

### 五、账

| 项 | 结果 |
| --- | --- |
| `any-hatches` | **36 → 34**（files 22；基线已固化） |
| 新增导出 | `ParamDef`、`ManifestEntry`（跨包契约的唯一来源） |
| 行为变化 | 1 处（`paramList?.length`：不可能路径由抛错改成跳过，已注释） |
| 门禁 | editor tsc 0 / **vue-tsc 0 新错** / ui-kit `build:types` 0 / lint / format / text / docs |

### 六、教训

1. **「上游没写全」是断言与 `any` 的常见根因**：第 155 轮撞墙、第 156 轮拆墙，差别只是
   **先去看了一眼上游**。⇒ 再遇到跨包不一致，先读宿主侧的声明再动手。
2. **契约要放在「两边都能引用」的地方**：写在 `.vue` 里的 `interface` 宿主引用不到
   （第 155 轮 TS2322 有一半是这个原因）⇒ 独立模块 + barrel 导出。
3. **索引签名会让目标「拒收类实例」**：把 `Record<string, any>` 收成具名形状时，若源是类实例
   （`InstanceType<…>`），**别留** `[k: string]: unknown` —— 本轮实测。

## 第 157 轮（2026-09-22）：尺子在骗人 —— 表上「最便宜的两处」其实是语法错与隐式 `any`

本轮没有降账（`any-hatches` 仍 34 处 22 文件），但它修掉了一件更贵的事：**代价表会把人引向假站点**。

### 一、起因

准备动手做第 155 轮记下的「两个便宜站点」：`stores/data.ts` 的 `Data.config`（表里代价 **2**）
与 `particle-window.ts` 的 `stage`（表里代价 **1**，全表最便宜）。按仓库规矩「先量再说」，一量就露了。

### 二、实测：两处读数都不是真实代价

| 站点（当时行号） | 表里记的代价 | 实际报错 | 真相 |
| --- | --- | --- | --- |
| `stores/data.ts` `config: Record<string, any> \| null;` | **2** | TS1131 + TS1128，**两条都在本行** | 摘掉注解后写成 `config \| null;` —— **不是合法声明** |
| `particle-window.ts` `stage: Record<string, any>;` | **1** | TS7008，**打在本行** | 接口成员摘掉注解 = **隐式 `any`**，逃生口**根本没关** |

也就是说：**表上最便宜的两处，恰好就是两处读数无效的**。第 155 轮想动它们时「撞墙」，
撞的不是代码，是尺子 —— 那两个「便宜」是仪器故障的产物，不是机会。

### 三、根因：摘法在两种落点上不成立

唯一的摘法是「删掉 `: Record<string, any>`」。这只在**带初始化式的声明**上等价于
「关掉逃生口」（类型由初值推断）：

- **成员 / 参数位**：删掉后 TS 给隐式 `any`，`noImplicitAny` 只在**本行**报 TS7008/TS7006
  ⇒ 下游一条错都不报 ⇒ 读数 0~1；
- **联合 / 交叉 / 数组位**：删掉后不是合法声明 ⇒ 只有**本行**的语法错 ⇒ 读数 1~2。

两类都**看起来极其便宜**，实际要的却是设计工作（具名形状）。这是「度量必须对真实状态敏感」
的又一例：尺子对**落点**不敏感，于是把「没量到」伪装成了「很便宜」。

### 四、修法（`scripts/oneoff/measure-any-hatch-site.mjs`）

1. **正向判据**：`RECORD_ANNOT` 只有摘掉后仍是「带初始化式的声明」（`const/let/var x = …`，
   或类字段 `[修饰符] x = …`）才可机械测 —— 那才是「类型由初值推断」；
2. 其余两种落点**拒绝**，并把原因分成「联合 / 交叉 / 数组位」与「成员 / 参数位」两种（诊断到类）；
3. **仪器自检**（这条才防再犯）：若报错**全部**是语法族（TS1xxx）或隐式 `any`（TS7006/TS7008），
   读数标 `suspect` —— CLI 与扫描表都打 ⚠️「不得当便宜用」。触发条件用 `every`：
   真实代价几乎必然含 TS2339 / TS2322 之类，所以不会误伤。

### 五、自证（不做这步不算修好）

| 检查 | 结果 |
| --- | --- |
| 修改前 · `config` | 2 条 = **全是 TS1131/TS1128**（已存档） |
| 修改前 · `stage` | 1 条 = **TS7008（本行）**（已存档） |
| 修改后 · `config` | **拒绝**：「注解在联合 / 交叉 / 数组位…」✓ |
| 修改后 · `stage` | **拒绝**：「注解在成员 / 参数位…」✓ |
| 修改后 · 真实站点 `animation-window-engine.ts:12` | 仍读到 **54**（与旧表一致）✓ ⇒ 只修了假读数，没动真读数 |
| 站点普查 | 仍 **34** 处 ✓ ⇒ 仪器改动没动口径 |
| **全表复扫 · 19 处可测** | **每一处读数都与旧表逐位一致**：1180 · 1455 · 897 · 696 · 539 · 452 · 307 · 93 · 89 · 82 · 79 · 71 · 67 · 54 · 21 · 20 · 20 · 19 · 17 ✓ |
| **全表复扫 · 15 处拒绝** | 13 处别名 / 交叉 / 断言（原本就不可测）+ **2 处本轮新拒**（`stage`、`Data.config`）✓ |
| 自检的正向触发 | 端到端 **0 次** —— 前置闸先把那两类落点拦住了 ⇒ 用**归档的真实报错串**做 5 条断言自证规则本身（含「0 条报错不得误判」）✓ |

⇒ 结论：这次改动**只删掉了两个假读数**，真实读数一位没变 —— 这正是「修仪器」该有的样子。

### 六、复扫后的真实工作单

34 处 = **19 处可机械测** + **15 处不可测**（13 处别名 / 交叉 / 断言 + 2 处成员 / 联合位）。
可测的 19 处按代价升序，前四名（也就是真正值得动手的）：

| 代价 | 站点 | 种类 | 主要字段 |
| --- | --- | --- | --- |
| **17** | `services/project/setting-config/index.ts:16` | RECORD_ANNOT | `other` `server` `github` `recent` |
| **19** | `engine/particle/particle-engine.ts:12` | RECORD_ANNOT | `Emitter` `Element` `Layer` |
| **20** | `engine/scene/scene-camera-engine.ts:9` | RECORD_ANNOT | `getConvertedCoords` `rasterizeScrollPosition` |
| **20** | `engine/ui/element-base.ts:10` | INDEX_SIG | `parent` `connect` `resize`（登记为**故意保留**） |

`setting-config/index.ts:16`（17）是其中最便宜的一处，且**未被任何已知障碍挡住** —— 下一轮候选。

### 七、教训

1. **「最便宜」要先怀疑**：一处读数便宜到不合常理（0/1/2），而它显然是一大块结构时，
   先问「我的摘法在这个落点上还成立吗」。
2. **删掉注解 ≠ 关掉逃生口**：成员位删注解得到隐式 `any`，代价被记在**被改的那一行**上。
   ⇒ 凡是报错**全部落在刚改的那一行**，都该先当**仪器故障**处理；语法族报错同理。
3. **自检要写进仪器**：这次不是靠人眼，而是让工具对**自己的输出**做一次「这读数像不像真的」检查。

## 第 158 轮（2026-09-22）：`SettingConfig.config` 收成具名形状（`any-hatches` 34 → 33）

### 一、从第 157 轮修好的尺子上挑活

复扫后**最便宜且无已知障碍**的一处：`services/project/setting-config/index.ts` 的
`SettingConfig.config: Record<string, any> = {}`（类字段，代价 **17**）。

### 二、为什么不能靠删注解

它必须收成**具名形状**，而**类型层没有真源**：`settingSchema` 是运行期数据
（`SettingSection[]`，`id: string`），`buildDefaultConfig()` 只返回 `Record<string, unknown>`
⇒ 形状只能**按读者逆推**。于是先把 8 个读者文件抄了一遍（表在 PHASE #32），得出 7 个顶层分区：
**server / apkbuild / signed / other / recent / github / update**。

巧的是这 7 个与 `settingSchema` 的顶层 `id` **逐个对齐** —— 而 `buildDefaultConfig()`
保证每个分区都存在 ⇒ 后面 `patch()` 那次断言是**与事实相符**的，不是「断言可能说谎」。

### 三、动手（3 个文件）

1. `types.ts` 新增 `SettingConfigShape`（**`type` 别名**：7 个分区 + 顶层索引签名）；
2. `index.ts`：字段换成它（`{} as SettingConfigShape`）；`patch()` 那次赋值补断言并写明**为什么相符**；
3. `open.ts`：`config?.server ?? {}` 成了联合类型，把本地形状标注成 `{ auto?: boolean }`
   —— 行为一字未改（仍然是「取不到就当作没开自动启动」）。

### 四、三条约定（写进类型注释的「别随手改」）

1. **顶层索引签名的值类型必须可再索引**（`Record<string, unknown>`，不是 `unknown`）——
   `load()` 要写 `config[key][sub]` 与 `config[key] ??= {}`；
2. **已知分区不标 `?`** —— `apply()` 裸取 `config.server.port`；标成可选就逼着改那行，
   而改成 `?.` 是把「config 尚未加载」从**抛错**变成**静默写入 `undefined`**（行为变化）。
   类型在这里表达的是**调用前提**（`apply()` 只从 `save()` 进，而 `save()` 前必先 `load()`）；
3. **用 `type` 而非 `interface`** —— `renderer.ts` 的 `SettingHost.config` 是
   `Record<string, unknown>`，TS 只对**对象类型别名**推断隐式索引签名（第 156 轮同一族坑）。

### 五、账与验证

| 项 | 结果 |
| --- | --- |
| `any-hatches` | **34 → 33**（files 22 → 21） |
| editor `tsc` | **0 错，一次过** |
| `typecheck:vue` | 0 新错（baseline 0） |
| 行为变化 | **0**（`as` 编译期即消失；`?? {}` 处的本地注解不改语义） |
| 门禁 | lint / format / text / docs / 棘轮 |

### 六、教训

1. **先抄读者，再写形状**：形状的真源不在 schema 里，在**读者的用法**里 —— 抄完读者，
   形状自己就出来了（7 个分区，一个不多一个不少）。
2. **运行期 schema 给不了类型**：别指望「从 schema 派生类型」，那是把运行期与编译期混为一谈；
   但 schema 的 `id` 可以拿来**校验**手写形状有没有多 / 少（本轮正是靠它确认了 7 个分区）。
3. **断言分两种**：「可能说谎的断言」（第 139 轮）与**与前提相符的断言**（本轮 `patch()` 那次）。
   后者必须把**为什么相符**写出来，否则下一个人只看到一个 `as`，不知道能不能删。

## 第 159 轮（2026-09-22）：`SceneCameraEngine` 收成员表（`any-hatches` 33 → 32）

### 一、挑活

复扫表里代价 20 的有两处：`element-base.ts:10`（**登记为故意保留**）与
`scene-camera-engine.ts:9`（未勘探）。取后者。

### 二、勘探结果：它和 `particle-engine` 看着一样，其实**不是同一类**

| | `particle-engine.ts:12`（第 154 轮已记录受阻） | `scene-camera-engine.ts:9`（本轮） |
| --- | --- | --- |
| 成员 | ~16 个，**赋值来自视图层多个不同形状** | **8 个，全部在本文件内各挂一次** |
| 消费方 | 多处，视图与引擎形状分歧 | 只有 `scene-camera.ts`（8 条整体拷到 `Scene`）+ 1 个 spec |
| 真实工作量 | 实测 **79 条 / 8 文件** | **2 条**（且已用更好的办法消掉，见五） |

⇒ **「代价 20」同样是入口代价，不是工作量**：那 20 条是「删掉注解让 TS 去推 `{}`」的报错，
而正确改法是把 8 个成员**声明出来**，一次全消。**读数相同的两个站点，工作量差 40 倍。**

### 三、动手

一个模块内的 `type SceneCameraEngineShape`（8 条方法，`this` 一律 `typeof Scene`）
+ `export const SceneCameraEngine: SceneCameraEngineShape = {} as SceneCameraEngineShape;`
—— 断言**与事实相符**：8 条在模块求值结束时必然都已挂上（全部是无条件赋值）。

### 四、唯一的两条报错，以及比「给夹具打补丁」更好的做法

第一轮 typecheck 只报 2 条，全在 `scene.spec.ts`：夹具是**局部 mock**，而
`rasterizeScrollPosition.call(Scene, …)` 现在要求 `this` 是整只 `SceneShape`，mock 缺 22 个字段。

顺手的改法是给夹具加一个 `as unknown as`。**没这么干** —— 声明贴事实更值钱：
那个函数从头到尾只读 6 个字段（`scaleX/scaleY/scrollLeft/scrollTop/scrollRight/scrollBottom`），
于是抽出 `type RasterizeScrollThis = Pick<typeof Scene, …那 6 个…>`，**声明与实现两边都用它**。
⇒ 夹具**一行没改**，而契约比原来更准。

过程里踩到一次：只改声明不改实现会报 TS2322 —— **`this` 参数的检查是逆变的**，两边必须一致。
所以别把 `this` 形状内联在声明里，**抽成类型别名**才可能两边同源。

### 五、类型一收口，`lint` 就看见了新东西：8 条 `unbound-method`

`tsc` 干净之后 `lint` 却报 **8 条 `typescript(unbound-method)`**，全在镜像点
（`scene-camera.ts:10-17` 那 8 行 `Scene.x = SceneCameraEngine.x;`）。原因很直白：
成员原来是 `any`，这条**类型敏感**的规则根本看不见它们；一收成具名形状，它立刻就看见了。

这不是噪音，而是**类型收紧的必然副作用**，而且本仓已经解决过 —— 去搜规则名就找到了同形写法
（`scene-marquee-engine.ts`、`palette-engine.ts`、`auto-tile-engine.ts` 都是同一手法）：
**成员写成「函数属性」而不是「方法简写」**（`name: (this: X, …) => R`，不是 `name(this: X, …): R`）。
方法简写会被 `unbound-method` 命中；函数属性不会。改完 `lint` 回到 **0 warning 0 error**，
**一条豁免注释都不需要**。

⇒ 这比「给那 8 行各加一个 `oxlint-disable-next-line`」好得多：既没留豁免债，也和隔壁文件同形。

### 六、账与验证

| 项 | 结果 |
| --- | --- |
| `any-hatches` | **33 → 32**（files 21 → 20） |
| editor `tsc` | 0 错 |
| `typecheck:vue` | 0 新错 |
| `lint` | **0 warning 0 error**（含上面的 `unbound-method` 处置） |
| editor 测试 | 255 文件 / 2075 全绿 |
| 行为变化 | **0**（本轮改动全是类型注解，编译期即消失） |

### 七、教训

1. **同读数 ≠ 同工作量**：两处都读「20」，一处是 10 行声明、一处是 79 条级联。
   读数可以用来**排序**，估工必须先勘探**成员数 + 赋值来源**。
2. **「成员全部在本文件内各挂一次」是分水岭**：这正是 `particle-engine` 做不到的
   （它的赋值来自多个视图形状，一收口就暴露视图/引擎的形状分歧）。
3. **`this` 声明要贴事实**：读 6 个字段就声明 6 个 —— 既不苛求夹具，也不放松检查；
   而**逆变**决定了它必须与实现共享同一个类型别名。
4. **收 `any` 会打开 `lint` 的新视野**：类型敏感的规则此前对 `any` 是瞎的。收口后新增的
   报警**先当成信息**（这里正是真问题：搬运点丢 `this`），再找**同形写法**解决 ——
   本轮靠搜规则名找到隔壁文件的既有手法，一条豁免都没加。

## 第 160 轮（2026-09-22）：`AnimationWindowEngine` 收成员表（`any-hatches` 32 → 31）

### 一、判据第二次生效（这次是**先预测、后验证**）

拿第 159 轮定下的两条判据去量 `animation-window-engine.ts:12`（代价 **54**）：

| 判据 | 结果 |
| --- | --- |
| ① 成员是否**全部在本文件内各挂一次** | ✅ **27 条全部**（改动前该文件第 43~837 行） |
| ② 消费方是否**只有一处** | ✅ 只有 `animation-window.ts`（27 行逐条镜像到 `Animation`） |

⇒ 预测「这是与 `scene-camera-engine` 同一手法，工作量≈10 行声明」——**实测就是如此**，
而且**一次 typecheck 就 0 错**（连第 159 轮那 2 条 spec 报错都没有：没有 spec 碰这 27 条）。

**代价 54 同样是入口代价**：那 54 条 = 「删掉注解让 TS 去推 `{}`」的报错（源文件 27 + 消费方 27）。

### 二、动手

一个模块内的 `type AnimationWindowEngineShape`（27 条**函数属性**）+ `{} as …`；
另加一个 `type AnimationContextList = { count: number; [index: number]: AnimationContext }` ——
`drawSpriteLayers` 的 `contexts` 参数。

**只声明用到的那两件事**（索引 + `count`），**不假装它是 `Array`**：全仓的用法就只有
`contexts[i]` 与 `contexts.count`。声明贴事实，第二次。

### 三、账与验证

| 项 | 结果 |
| --- | --- |
| `any-hatches` | **32 → 31**（files 20 → 19） |
| editor `tsc` | **0 错，一次过** |
| `lint` | **0 warning 0 error** —— 函数属性写法再次让 27 个镜像点**不报** `unbound-method`（预测命中） |
| `typecheck:vue` | 0 新错 |
| editor 测试 | 255 文件 / 2075 全绿 |
| 行为变化 | **0**（改动全是类型注解） |

### 四、教训

1. **判据可以「先预测」了**：前两轮是「勘探后决定」，本轮是**先按判据预测、再用实测验证**，
   连「会不会有 spec 报错」都预测准了（没有 spec 碰这 27 条）。
   ⇒ 一套判据成熟的标志就是：它开始能**提前**回答问题，而不只是事后解释。
2. **注册表写法是一条产线**：`scene-marquee-engine`（10）/ `scene-camera-engine`（8）/
   `animation-window-engine`（27）三处同形、**零级联**；而 `particle-engine` 卡在判据①
   （赋值来自多个视图形状）。剩下的 registry 袋（`ui-engine` 93 / `tile-frame-index` 82 /
   `auto-tile` 307 / `palette` 696）都用**同两条判据**逐一筛，别按代价排序直接上。
3. **函数属性写法要当默认**：本轮 27 个镜像点如果写成方法简写，会多出 27 条 `unbound-method`
   警告，且每条都要么加豁免、要么绕开。**声明形态在这里决定 lint 成本**。

## 第 161 轮（2026-09-22）：把「注册表袋」一次筛完 —— 本轮**没有降账**，但把两类活钉死了

### 一、动机

第 159/160 轮连摘三处同形注册表，于是想按同样的路子把剩下的几个一次做完。
结果四个袋子全被**实测或结构**挡住。这一轮的价值不在账上，在**不让人重复挑错活**。

### 二、筛选表（判据①②来自第 159 轮）

| 候选 | 本文件内挂载 | 外部消费方 | 结论 |
| --- | --- | --- | --- |
| `TileFrame`（82） | 13 | 2（`auto-tile.ts` / `palette-initialize.ts`） | ⛔ 见四 |
| `UIEngine`（93） | 21 | 10（全是「读」） | ⛔ 见三 |
| `AutoTile`（307） | 62 | 10 | ⛔ 大对象字面量 + 被 `Palette` 家族共引用 |
| `Palette`（696） | 20（字面量成员） | **~40 个文件** | ⛔ 排除 |

`UIEngine` 与 `TileFrame` 都**满足前两条判据**（外部没有 `X.y = …`，也没有动态 `X[…]`；
`UIEngine` 那两处「读了但没挂」的 `drawXxx` / `x` 经查只是**注释里的散文**，不是代码）。

### 三、`UIEngine` 实测挡住：**64 条 / 8 文件**（已回退）

声明 21 条成员后 `tsc` 报 64 条，**全是同一句**：

```
Argument of type 'UIShape' is not assignable to parameter of type 'UIFacadeShape'.
  Type 'UIShape' is missing: marquee, planToSave, requestRendering, updateControlPoints, and 3 more.
```

根因：成员声明的 `this: UIShape` 是**本文件里**的 `type UIShape = UIFacadeShape`（引擎读 UI 的契约），
而**调用点传进来的接收者**是 `engine/ui/legacy/ui-window.ts:34` 那个**同名但更窄**的 `UIShape`
（它没有那 7 个成员）。`UIEngine.x` 原来是 `any`，`.call(接收者, …)` 根本没检查；一收口就全暴露。
连 `ui-engine.ts` 自己那 7 处 `.call(UI)`（第 699~705 行）也中招。

⇒ **这正是 ④-3/④-4 的接缝**（遗留 UI 单例 vs facade 契约）。已 `git checkout` 回退，
按仓库规矩不硬上半个级联。**它反过来是那条待决策问题的最硬证据**：④-4 不做，`ui-engine`(93)
与 `ui-window`(452) 这两处都动不了。

### 四、另两个：一个是**类**索引签名，一个是**自指**形状

- `schema.ts:88`（21）：不是「普通字段忘了声明」，而是**类**索引签名，账里混着 4 个
  「每个 schema 动态挂上去的处理器」——`targetWrite` / `operationWrite` / `typeWrite` / `writeHandler`
  （`useRegisterEventCommandSchema.ts:412-414`、`useSetBooleanCommandSchema.ts:198`）。
  它们的签名**互相分歧**：`(e: { value: string }) => void` 与 `(e: { value?: unknown }) => void`。
  函数属性的参数检查是**逆变**的 ⇒ 声明成一个类型就会让另一批挂载点报错。**得先定处理器契约**。
- `TileFrame`（82）实测构成：`TS2339` 39 + `TS2322` 18 + `TS2769` 10 + `TS2721` 6 + …，
  缺的字段是 `x` `y` `scaleX` `scaleY` `mode` `screen` `scrollLeft` … —— 因为它的成员写成
  `this: typeof TileFrame`（**自指**），所以「成员表」还得顺带声明**一批数据字段**，
  另有 43 条是重载/可空/不可调用。这是 `element-base` 那一类，不是前三轮那一类。

### 五、教训：给筛选加**第三条**判据

1. ① 成员是否全部在定义文件内挂载？② 消费方是否只有一处 / 是否只读？
2. **③ 成员契约与调用点/挂载点是否同一份形状？**
   —— `this: X` 里的 `X` 是否**就是**调用点传的那个类型；动态挂上去的处理器是否只有一种签名。
   前两条过、第三条不过，就是 `UIEngine` 这种「看着白拿、一收口 64 条」。
   **前两条判据筛的是「形状能不能逆推」，第三条筛的是「逆推出来的形状有没有人认」。**

### 六、本轮账

**不变**（`any-hatches` 仍 31 · files 19）。工作树已回退干净（`tsc` 0 错），
`git status` 无残留。下一轮改从**未被这三条判据否掉的**站点里挑，别再从代价表直接取。

## 第 162 轮（2026-09-22）：重审一处登记保留项 —— `unknown-casts` 6 → 5

### 一、换轴：`any-hatches` 的便宜站点确实挑完了

第 161 轮把四个注册表袋筛完（两处实测阻挡、两处结构性排除）后，`any-hatches` 剩下的全是大件
（452 / 539 / 696 / 897 / 1180 / 1455）或已记录受阻项。于是换到最小的一条**从没动过**的轴：
`unknown-casts`（6 处 / 5 文件）。

### 二、先看清单，再逐处问「**当初让它必须断言的那个缺口，还在不在**」

6 处里 5 处是有记录的保留项（`eslints` ×2 的 253 属性错配、`custom-command-window:227` 的
`any` 且可空的别名、monaco 两处的模块解析 / 无声明文件）。**第 6 处**——
`components/command-list.ts:51`——**恰好被第 158 轮改过上游**：

```ts
settingConfig: SettingConfig as unknown as { config: { other: { copyAsTextKeepEmptyLine: boolean } } },
```

ui-kit 的契约（`command-api.ts:231`）要求 `config.other.copyAsTextKeepEmptyLine` **非可选**，
而第 158 轮我写 `SettingConfigShape.other` 时只声明了 `browserSearchHistoryLimit`，
另一支靠 `[key: string]: unknown` 兜着 ⇒ 落到 `unknown`，不满足 `boolean` ⇒ 只好双层断言。

### 三、动手（2 个文件）

1. `types.ts`：给 `other` 补上 `copyAsTextKeepEmptyLine: boolean` —— 它**确实是 schema 字段**
   （`schema.ts` 的 `other` 分区，checkbox，默认 `true`），而 `load()` 会按 schema 补默认值
   ⇒ 加载后必然存在（与 `server.port` 同一前提，注释里写明）；
2. `command-list.ts`：**整段去掉** `as unknown as`，写成 `settingConfig: SettingConfig`，
   并注明这是按手法库第 148/155 条做的重审。

### 四、账与验证

| 项 | 结果 |
| --- | --- |
| `unknown-casts` | **6 → 5**（files 5 → 4） |
| `any-hatches` | 31 · files 19（持平，本轮不动它） |
| editor `tsc` / `lint` / `typecheck:vue` | 0 错 / 0 warning 0 error / 0 新错 |
| editor 测试 | 255 文件 / 2075 全绿 |
| 行为变化 | **0**（去掉的是断言，编译期就消失） |

### 五、教训

1. **「登记保留」不是永久豁免**：它记的是「**当时**那个缺口」，缺口一补就该重审。
   本轮 6 处里唯一**没**被登记的，恰好是被我第 158 轮解锁的那一处 —— 等于说
   **我刚做的改动让另一处保留项过期了**。⇒ 收口一处之后，顺手扫一遍**同族的登记项**。
2. **重审要问具体那一句**：不是「它还在不在用」，而是「**当初让它必须断言的那个缺口，还在不在**」。
   这里缺口就是 `other.copyAsTextKeepEmptyLine` 的类型，而第 158 轮恰好绕过了它。
3. **补字段是补契约，不是补断言**：这个字段是从 ui-kit 的**读点**逆推的（第 158 轮「形状按读者逆推」），
   而它在 `schema.ts` 里有真身 ⇒ 把断言换成声明，两头都对得上。

## 第 163 轮（2026-09-22）：量了 `Data` 那处「代价 539」的真实债务 = **619**（未落地）

### 一、动机：找「两个半形状」的同类

第 162 轮的教训是「保留项会过期」，但我也想确认大件里有没有便宜的。`data-object.ts:67`（代价 539）
看着正像「同一个运行期对象的两个半形状」（手法库 #118 / #144 / #145）：

- `DataModule` 只声明**方法**（27 条），`[k: string]: any` 让 26 个**数据字段**漏出去；
- `stores/data.ts` 的 `DataShape` 正好声明那 26 个字段**且带真类型**（`ManifestShape | null` 等），
  还被 `dataKeys` 与 store 的 `setData` 一起用着 ⇒ **它才是真源**。

两半的字段集合**逐个对得上**（`Data` 字面量那 26 个 = `DataShape` 的 26 个）⇒ 合并是正解。

### 二、实测：合并 = **619 条**（已回退）

把 `DataModule` 改成 `DataShape & DataMethods` 后跑 `tsc`：

`TS18047` **302**（possibly null）· `TS18046` 71 · `TS2345` 63 · `TS2339` **51** · `TS2322` 25 ·
`TS18048` 18 · `TS2531` 18 · `TS2769` 17。前几个文件：`data-object` 70 · `log/related-references` 48 ·
`enum/enum-window` 34 · `attribute/attribute-window` 31 · `engine/scene/draw-object` 27 …

⇒ **539 是入口代价，619 才是债务**（与第 157 轮同向）。**已回退**，未落地。

### 三、两条路，代价不同（需要决策）

- (a) 合并 + 在 302 处补 `!`（或加守卫）：五十来个文件、三百处断言 —— **断言不带安全性**，
  机械加 `!` 只是把「编译器看得见」换成「人肉保证」，未必比留着 `any` 好；
- (b) 合并 + 让读点改读**真源 store**（`getDataStore().data`，已是 `DataShape | null`）：更干净，
  但要动的读点更多，且牵出「这份数据该归谁」的架构问题。

无论哪条，**先得把 `DataShape` 缺的那 51 个字段补上**。

### 四、教训

1. **「两个半形状」的前提是两半合起来就完整**：#118 之所以便宜，是因为合成即全貌；这里合成**仍缺 51 个字段**
   ⇒ 合并本身不解决问题。⇒ 同类站点的**第三个前置问题：真源完整吗？**
2. **大件的正确开法就是「先量债务、再谈路线」**：本轮没降账，但把「539」换成了「619 + 两条路线各自的代价」，
   下一个动它的人不必再试一遍。

## 第 164 轮（2026-09-22）：重审第二处登记保留项 —— `any-hatches` 31 → 30

### 一、动机：把第 162 轮的教训再用一次

第 162 轮重审 `unknown-casts` 的登记项时发现「**我刚做的改动让另一处保留项过期了**」。
于是本轮拿同一问法去扫 `any-hatches` 里登记为「**故意保留**」的那一处 —— `element-base.ts:10`（代价 20）。

### 二、一问就发现它根本不是「保留」，是**没人量过**

`UIElementShape` 是个**空接口 + `[k: string]: any`**，而文件里 `:249` 有一句 2026-09-18 的注释：

> `UIElementShape` 是 `[k: string]: any`，所以 tsc 永远看不见（2026-09-18）

**它自己就写着这是个洞**。量一下（摘掉索引签名）：**20 条 TS2339，全部在这一个文件里**，
点名要的只有 **7 个成员**（`parent`9 · `connect`3 · `resize`3 · `connected`2 · `destroy` · `disconnect` · `draw`）。

### 三、动手：声明 7 个成员 + 两处 `?.`

- 必填 6 个 + `draw` **可选**（与同文件 `requestResizing` 同一处理）；
- 配套两处：`children[i].draw?.()`（`:217`）、`element.parent!.requestResizing?.()`（`:269`）。
  后者**不是本轮的新决定** —— 同文件 `remove()`（`:287`）早就写成 `?.` 了，
  `requestResizing` 的注释（`:54`）也写明「声明成可选即如实描述；调用点配 `?.`，
  `instanceof Window` 守卫就是它安全的理由」。⇒ 这两处是**把同文件已定的规矩补齐**。

### 四、账与验证

| 项 | 结果 |
| --- | --- |
| `any-hatches` | **31 → 30**（files 19 → 18） |
| editor `tsc` / `lint` / `typecheck:vue` | 0 错 / 0 warning 0 error / 0 新错 |
| editor 测试 | 255 文件 / 2075 全绿 |
| 行为变化 | **0**（`?.` 只在成员真缺失时生效，而 children 全是具体元素类 ⇒ 那条路径运行期走不到） |
| 门禁 | format / text / docs / 棘轮 |

### 五、教训

1. **「登记为故意保留」也要定期质疑，判据是看它描述的是谁**：
   本轮这处登记的理由是「索引签名让 tsc 看不见」—— 那**不是理由，是症状**。
   ⇒ **如果一条保留的理由描述的是「洞本身」而不是「洞外面有什么」，那它就不是保留，是欠账。**
2. **同文件已有的规矩要补齐**：`requestResizing` 的「可选 + `?.`」早在第 152 轮就定了，
   另一处调用点当时被 `any` 挡着没跟上。⇒ 收口 `any` 的**直接收益之一**就是
   **发现旧规矩没落实到的地方** —— 这也是「收 `any` 会打开 lint 新视野」（第 159 轮）的同族现象。

## 第 165 轮（2026-09-22）：把「保留项」扫完 + 一处动态读取（`any-hatches` 30 → 29）

### 一、按第 164 轮的判据扫剩余保留项

| 站点 | 判定 | 依据（都是实测或代码原文） |
| --- | --- | --- |
| `fs-bridge.ts:29` | ✅ **真保留** | 理由描述的是**洞外面**：两条语义差别（`writeFile` 的布尔 `check` vs node 的 options；`fs.promises` 上没有的成员曾被静默放过并**真出过一次 `TypeError`**）+ 约 30 个调用点 |
| `element-classes.ts:169` `UIElementCtor` | ✅ **真保留** | 13 个元素类的构造参数各不相同、都要登记进同一张表；收窄成联合会制造长期维护点（P2b-1 批评过） |
| `animation-window.ts:14` `AnimationElement` | ✅ **真保留** | **实测 163 条 / 8 文件**（`animation-timeline` 98），字段散布 `x`38 `y`30 `layer`30 `length`27 `pointerevent`9 … ⇒「避免穷举」的理由成立 |
| `element-classes.ts:156` `UINodeShape` | ⚠️ 混着**读错类型**的债 | 见下 |

⇒ **NO-STRIP 那一族（15 处）到此判完**：真保留 13 处，另 2 处是「读错类型」或「已可枚举」。

### 二、`UINodeShape`：计划书里的「下一步」**已经过期**

计划书「剩下的活」第 2 条的 ⚠️ 写着（第 107 轮）：

> `UINodeShape` 索引签名删掉后只报 **6 个字段 / 27 处 / 5 文件**，属**可穷举的枚举活**；
> 卡点是 `transform` 没有可复用类型（`element-page.ts:53` 的局部 `UIElementTransform`）
> ⇒ **下一步先把那个局部类型提成共享类型，再照清单做完。**

按它动手，第一件事就发现**两处都变了**：

1. **那个「下一步」早在第 108 轮就做完了**：`element-page.ts:10` 现在 `import type { UIElementTransform }
   from '@app/engine/ui/element-classes.ts'`（该文件 `:117` 导出、`:54` 的注释写着「已于 2026-09-21
   第 108 轮提成共享类型」）⇒ **前提不在了**。**计划书自己的「下一步」也会过期。**
2. **债务长大了**：现在删掉它是 **79 条 / 21 个字段 / 8 文件**（不再是 6/27/5）。而且 21 个字段里
   **12 个是「元素类的方法」而不是「节点数据」**（`appendChild` · `appendChildTo` · `isPointIn` ·
   `destroy` · `printer` · `font` · `_font` · `content` · `shadowText` · `update` · `updatePrinter` ·
   `updateTextContent`）⇒ **把它们声明进 `UINodeShape` 会让「节点数据」这个类型说谎**；
   正解是把那些读点改成对着**元素类型**读（落在 `ui-transform` / `ui-pointer` / `ui-initialize`），
   那是设计工作，不是枚举活。

⇒ 两条更正已写回计划书（手法库 #39），免得下一个照旧清单动手。

### 三、顺手拿下一处：动态读取用**收窄断言**，而不是整块 `Record<string, any>`

`scene-window.ts` 的 `Scene.create` 原来是：

```ts
const editor = (Inspector as Record<string, any>)[key];
const object = editor.create();   // ← 这一行**完全不被检查**
```

而 `map` 的值本来就是 `Inspector` 的成员名（同文件 `:580` 的初始化表）⇒ 改成一次**收窄断言**：

```ts
const editor = Inspector[key as keyof typeof Inspector];
```

⇒ `any-hatches` **30 → 29**，而且 `editor.create()` **从此受检查**。
这是手法库第 139 条第 N 次复用：**`Record<string, any>` 的问题不是「它也是断言」，
而是它连断言都不给** —— 断言之后至少还有类型，`any` 之后什么都没有。

### 四、账与验证

| 项 | 结果 |
| --- | --- |
| `any-hatches` | **30 → 29**（files 18 持平 —— 同文件另有一处站点） |
| editor `tsc` / `lint` / `typecheck:vue` | 0 错 / 0 warning 0 error / 0 新错 |
| editor 测试 | 255 文件 / 2075 全绿 |
| 行为变化 | **0**（断言编译期消失；`key` 的来源与取值没变） |
| 门禁 | format / text / docs / 棘轮 |

### 五、教训

1. **计划书里的「下一步」也会过期**：与第 162 / 164 轮的「保留项会过期」是**同一条**，
   只是这次过期的是**计划书自己** ⇒ **动手前按代码复核前提与数字**，别照抄清单。
2. **「可枚举」不等于「该往里塞」**：12 个字段枚举出来很容易，但塞进 `UINodeShape` 会让类型说谎。
   ⇒ 枚举之后还要问一句：**这个成员属于这个类型吗？**
3. **`any` 与「收窄断言」要讲清区别**：两者都不是零代价，但 `Record<string, any>` 之后的读点
   **不被检查**，`as keyof typeof T` 之后的读点**被检查** —— 后者把「运行期事实」变成了
   「编译期可验证的收窄」。

## 第 166 轮（2026-09-22）：把 ④-3 的开工前提解开 —— 新轴 `ui-domain-singleton-imports`（17 条轴）

本轮**没有降任何旧轴**，但解开了本阶段最大那件活（④ 步骤）的**开工前提**。

### 一、先否掉一个候选：`SceneShape` 不是「两个半形状」

按上一轮的想法去量大件 `scene-window.ts:117`（代价 1455），第一件事就是判据①（成员是否全在
一个文件里挂载）—— 实测 **`Scene` 的成员挂在 18 个文件、179 处**（`scene-window` 28 · `scene-draw` 27 ·
`scene-animate` 15 · `scene-context` 14 …）⇒ **它与 `particle-engine` 同类**（多来源），
不是 `Data` 那种「两个半形状」。**判完就撤，不试。**

### 二、读计划书时发现：我把两件事都说成了「要等用户」

翻到附录十三「结论四」，发现 ④-3 的轴口径被写成待决策的 **(a)/(b)**，而我把这条反复上报成
「需要用户拍板」。**这个框法是错的**：

- **(a)「只认轴」与台账自己的立身规矩冲突** ——「**度量只应对真实状态敏感，不该对写法敏感**」。
  而支持这个判断的证据是**实测的**：`Object.assign(UI, { x() {} })` / `for (…) UI[k] = v` /
  `Object.defineProperty(UI, 'x', …)` 三种等价写法，在 `ui-singleton-members` 上**命中都是 0**
  ⇒ 把 82 行挂载改写成「成员对象 + 一次 `Object.assign`」，那条轴就归零，而**所有权一点没变**。
- **(b) 是附录自己的建议**，唯一缺口是「伴随判据**尚未实现**」⇒ **那是工程量，不是决策。**

⇒ **这不是偏好题，是「某个判据还没写」。正确动作是去写。**（本仓已有 ④/⑤/⑥ 三条同类先例，
都是「靠证据判定」关掉的。）

### 三、动手：新轴 + 把洞钉进门禁

- **新轴** `ui-domain-singleton-imports`（口径函数 `domainSingletonImporters()` 落在
  `lib/ui-slots.mjs`，纯函数 `isLegacySingletonUiImport()` 供自证复用）：数「还有几个**域模块**
  在静态 `import { UI }` 去改遗留单例」。计**文件数**，起点 **8**（实测 8/8 个域模块都还 import）、
  终态 **0**，与 `ui-singleton-members` **同生共死**（两条同时归零才算 ④-3 收口）。
  台账 **16 → 17 条轴**，基线已固化 8。
- **自证（两处）**：
  1. **永久进 `migration:selftest`（58 → 61 通过）**：同一份「白拿写法」样本里断言
     「旧轴读 **0**」+「伴随判据命中 **1**」；另两条断言限定它只认「运行时 + 具名 `UI` + 遗留窗口」
     三条同时成立，并用**独立文本重算**复核轴报的每个文件（轴为 0 时必须能被解释）。
  2. **端到端实测**（临时文件，用完即删）：白拿写法的探针 ⇒ 旧轴 **82 不动**（瞎），新轴 **8 → 9**；
     经典 `UI.x =` 写法的探针 ⇒ 两条**同时** +1。⇒ 洞确实被补上，且两条轴对经典写法一致。

### 四、附带更正：另一句我也说旧了

我此前把 ④-3 / ④-4 说成「**必须真机才能验收**」—— 这句**过期**了：第 110 轮已把「需要真机」
从**唯一有效验收**降为**推荐**（`primeWindows` 绕过 `loadUI` 的盲区在第 ① 步消除，
jsdom 与真机同走 `loadUI`，且该不变式有 spec 钉着）。⇒ **待决策/前置条件清单也会过期。**

### 五、账与验证

| 项 | 结果 |
| --- | --- |
| 轴数 | **16 → 17**（新增 `ui-domain-singleton-imports` = 8） |
| `migration:selftest` | **58 → 61 通过**（3 条新自证） |
| 旧轴 | 全部持平（本轮只动 `scripts/`） |
| 临时探针文件 | 已删除，`git status` 无残留 |
| 门禁 | lint / format / text / docs / `migration:check` |

### 六、教训

1. **「待决策」要先分类**：**偏好题**（要人定）vs **「某个判据/仪器还没写」**（去写就行）。
   后者挂成「等用户」会白等 —— 本轮把它解开，等于给 ④ 步骤扫清了开工前提。
2. **判据① 又一次省下一轮**：`SceneShape` 一眼看像大件里的机会，一条 grep（挂载点分布在几个文件）
   就判定它属「多来源」那类，直接撤，没浪费测量。
3. **过期的会传染**：从「保留项会过期」（162/164）→「计划书的下一步会过期」（165）→
   **「我自己上报给用户的前置条件也会过期」（166）**。⇒ 每轮复述前提前，先回代码/最新⚠️ 核一遍。

## 第 167 轮（2026-09-22）：④-3 第一个域落地 —— `ui-slots`（82 → 76，伴随判据 8 → 7）

### 一、先查「能不能改」：调用点全都是以 UI 为接收者

决定「体内 `UI.x` 能否改成 `this.x`」的唯一问题是 `this === UI` 是否恒成立。实测这 6 个槽位的
调用点**全部**是 `UI.x(…)` 形式：`stores/ui.ts` 6 处转发（`UI?.x?.(…)`）· `ui-pointer.ts` 3 ·
`ui-list.ts` 5 · `ui-events.ts` 1 · `LayoutPanel.vue` 1 · 本域 spec 6 ⇒ 恒成立。
于是 `this.meta.guid` / `this.list.update()` / `this.unregisterPreset!(child)`（自引用解析**当前**绑定）
与原写法**逐字等价**；`registerPreset` 里的箭头递归辅助函数没有自己的 `this`，改成**显式传接收者**。

### 二、装配点没有搬家（这域能白拿的关键）

计划书要求「facade 必须在 **UI 诞生的同一位置**装配」，而那个位置**本来就有一条动态 import**
（`ui-window.ts` 的 `uiWindowReady` 第 3 项）。所以 ④-3 的最小形态就是：

```ts
import('@app/engine/ui/ui-slots.ts').then(({ uiSlotsMembers }) => Object.assign(UI, uiSlotsMembers))
```

—— 域模块只**导出**成员对象，已有的动态 import 负责挂上去。**不新增静态 import 边**：
`ui-slots`（连带 `Data`/`Editor`）若被 `ui-window.ts` 静态引入会先于 `UI` 求值、踩 TDZ
（这是该文件头自己写的约束），而现在的装配时机与「自我绑定」**完全相同**。

### 三、仪器连瞎三次 —— 本轮真正的工作量

改完一跑 `migration:check`，**三条轴同时报错**，而它们都不是「代码改错了」：

| 轴 | 读数 | 真相 |
| --- | --- | --- |
| `legacy-ui-lines` | 300 → **307** | 它数**目录里所有行**（含注释）⇒ 我加的 7 行注释就是「上升」。压回 4 行注释 + 1 行代码，**净 0** |
| `ui-slot-coverage.assigned` | 132 → **127** | `assignedSlots()` 只认四种**文本赋值**，不认 `Object.assign(UI, 成员对象)` ⇒ 仪器瞎 |
| `1c-store-slot-gaps` | 0 → **5** | 同一件事：它按「目录外有没有赋值」判「实现是否搬走」，facade 装配看不见 |

后两条是**同一族**：装配写法一变，仪器就瞎，而**瞎的表现是「指标变差」**。
修法（都补进 `lib/ui-slots.mjs`，后面 7 个域共用）：
新增纯函数 `keysOfObjectAt` / `objectLiteralKeys`（取对象**顶层键**，含 IIFE 成员；内部先跑 `codeOnly`）；
`assignedSlots()` 认 `Object.assign(UI, X)`（X 是标识符 ⇒ **跨文件**解析 `const X: T = {…}` 的键，
内联字面量直接取键）；`legacyOnlyStoreSlots()` 把「facade 成员对象声明在目录外」也算成「有新家」。

**自证**：新测试进 `migration:selftest`（61 → **62**），断言成员对象的顶层键（IIFE 成员要取到、
注释里的键不算）—— 而它**当场抓到我自己的一处缺陷**：`keysOfObjectAt` 假设调用方已经去过注释，
测试传原文就露了 ⇒ 改成函数内部自己 `codeOnly`。

### 四、账与验证

| 项 | 结果 |
| --- | --- |
| `ui-singleton-members` | **82 → 76**（files 8 → 7） |
| `ui-domain-singleton-imports` | **8 → 7**（伴随判据：域模块不再 import 单例） |
| `legacy-ui-lines` / `1c-store-slot-gaps` / `ui-slot-coverage` | **全部持平**（0 假回归） |
| `migration:selftest` | 61 → **62** |
| 其余 | editor `tsc` / `typecheck:vue` / lint / format / text / docs / 全套 |

### 五、教训

1. **「装配写法一变、仪器就瞎」是 ④-3 的固定成本**：8 个域每个都可能踩同一族；本轮把口径一次
   补进 lib，后面共用。
2. **「指标变差」先怀疑仪器**：三条轴同时报错，而我改的是「自我绑定 → 装配」，**代码语义没变、
   变的是写法** —— 这正是台账立身规矩要防的那件事。若照读数走，会得出「本轮把 ③ 干回去了」的错误结论。
3. **注释也占轴**：`legacy-ui-lines` 数的是行数（含注释）。在遗留层写长注释 = 让「归零」倒退
   ⇒ 该压就压：**知识写进 `xr.md` / PHASE，不写进遗留文件**。

## 第 168 轮（2026-09-22）：④-3 第 2 个域的**前提核实** —— 它卡在「行预算」上（未落地）

### 一、先做第 167 轮那套「先查调用点」

第 2 个域是 `ui-initialize`（1 处挂载，spec 可兜底），它的唯一挂载是 `UI.initialize`（体内 330 行、
约 15 处 `UI.` 内部读）。查两头：

1. **调用路径只有一条**：`LayoutPanel.vue` 的 `onMounted` → `nextTick(() => getUIStore().initialize())`
   → store 转发 `UI?.initialize?.()` ⇒ **接收者就是 UI** ✓（`ui-state.spec.ts` 的注释也是这么记的）。
2. **体内所有嵌套回调都是箭头函数**：`History.processors[…] = (…) => {}`（9 个）· `File.get!().then(…)` ·
   `new Timer({ update: (…) => {} })`（2 个）· `list.bind(() => …)` ⇒ 箭头捕获外层 `this`，
   所以 `UI.x` → `this.x`、`UIEngine.x.call(UI)` → `.call(this)` **逐字等价** ✓。

⇒ 「能不能改」这一问，答案是**能**，而且比第 1 个域更干净（只有一个调用路径）。

### 二、但「改完占不占轴」这一问拦住了它

第 167 轮的教训是「注释也占 `legacy-ui-lines`」。这一轮升级成：**装配入口本身占不占**。
实测：每接一个域就要在 `legacy/ui-window.ts` 里**多一行**
（`import('…/ui-XXX.ts').then((m) => Object.assign(UI, m.xxxMembers))`）——
而 `legacy-ui-lines` 是**零目标**轴，多一行就报「✗ 上升」。**8 个域 = +8 行，这条轴不允许。**

⇒ 第 2…8 个域的共同前提是**一个通用的装配入口**（一行装配 + 目录外的成员汇总）。
而这里有个陷阱：汇总对象必然是 `{ ...a, ...b }` 形式，**`assignedSlots()` / `legacyOnlyStoreSlots()`
只认 `Object.assign(UI, <单个名字>)`** ⇒ 换写法仪器第 5 次失明（第 167 轮「点号路径」那次同型）。
所以口径要先扩成**多源 + 传递解析 spread**。

另一条路是用字面量占位符腾预算：那 6 个已被 facade 接管的占位退役后，`declared` **134 → 128**、
`legacy-ui-lines` **300 → 294**（两条都下降，且正是 ④-4「退役字面量」的方向）；
⚠️ 但动之前**必须实测** store 桥与 `loadUI` 不会在装配之前枚举 `Object.keys(UI)`。

### 三、本轮账

**不变**（`ui-singleton-members` 76 · companion 7 · `legacy-ui-lines` 300 · 17 轴持平）。
交付物是**核实过的前提**与**两条出路的判据**（PHASE 手法库 #42），
目的是让下一轮不必再试一遍「直接接第 2 个域」这条路。

### 四、教训

1. **「能不能改」与「改完占不占轴」是两个问题**：第 1 个域时后者只是「注释别写长」，
   到这个域就升级成「装配入口占不占」——**同一个约束会随规模变硬**。
2. **前提也是产物**：本轮没降账，但把「第 2 个域可改（有证据）」与「它卡在哪（有实测）」
   两句话钉下来；否则下一轮会重复「先查调用点 → 才发现行预算」这两步。
3. **仪器口径与装配形态是一对**：只要装配形态演进（单个源 → 多源 → spread），
   口径就得同步演进 —— 这已经是同一族失明的第 4、5 次，**下次改形态前先改口径**。

## 第 169 轮（2026-09-22）：④-3 的**通用装配入口** + 口径第 5 次扩容（未降账，但后 7 个域变成机械活）

### 一、为什么需要它（把第 168 轮的结论落地）

每接一个域就要在 `legacy/ui-window.ts` 里多一行装配，而 `legacy-ui-lines` 是**零目标**轴
（实测多一行报「✗ 上升」）⇒ 8 个域 = +8 行，不允许。所以把**汇总外移**到目录外的新文件
`engine/ui/ui-members.ts`（`{ ...uiSlotsMembers }`），遗留文件里**永远只有一行**：

```ts
import('@app/engine/ui/ui-members.ts').then((m) => Object.assign(UI, m.uiMembers))
```

⇒ **遗留文件净 0 行**（第 167 轮那行只是换了模块名），新增域只改 `ui-members.ts`（目录外，不占任何轴）。
后 7 个域因此从「每域重新发明一次装配方式」变成**同一个动作**：域模块导出成员对象 →
在 `ui-members.ts` 加一条 spread。

### 二、代价：仪器口径第 5 次扩容（这次**提前**做了）

汇总是 `{ ...a, ...b }`，而旧口径只认「`Object.assign(UI, <单个名字>)` + 该名字的**具名键**」
⇒ 换形态必失明（前四次：正则字面量 · 模板字面量 · 点号路径 · 注释里的键）。本轮**先扩口径、再换形态**：

- `facadeAssemblySites()` 支持**多源** `Object.assign(UI, a, b, { … })`（配对 `)` 定位 + 顶层逗号切实参）；
- 新增 `objectPartsAt()`（具名键 **+ `...spread` 引用**）与 `resolveMemberKeys()`
  （**传递**解析：worklist 迭代到收敛、`seen` 防环、**跨文件**）；
- `assignedSlots()` / `legacyOnlyStoreSlots()` 都改走它；后者只从**目录外**的文件解析，
  保持「实现搬出遗留层」的原意。

### 三、自证（62 → **63**）

新增一条测试覆盖两件新能力：① `objectPartsAt` 要分出 keys/spreads、`facadeAssemblySites` 要认出
**三个源**（含内联字面量）；② **传递**解析 —— `resolveMemberKeys(…, ['uiMembers'])` 必须展开出那 6 个
槽位名（这条直接把第 5 类失明钉进门禁）。它当场抓过一次**我自己**的写法问题
（`[...set].includes` 被 lint 的 `prefer-set-has` 拦下 ⇒ 改用 `set.has`）。

### 四、账与验证

| 项 | 结果 |
| --- | --- |
| 五条相关轴 | **全部持平**：`ui-singleton-members` 76 · companion 7 · `legacy-ui-lines` 300 · `1c-store-slot-gaps` 0 · `ui-slot-coverage` 0/132 |
| `migration:selftest` | 62 → **63** |
| editor `tsc` / `typecheck:vue` / `lint` / `format` / `text` / `docs` | 全过 |
| 受影响的两个 spec | **7 测试通过**（含 `ui-slots` 的「uiWindowReady 解析后槽位已被绑定」不变量） |
| 运行时行为 | **0 变化**（装配内容与时机完全相同，只是入口换了模块） |

### 五、教训

1. **装配形态与仪器口径是一对，要一起改**：本轮先扩口径、再换形态；反过来做就会先看到
   「三条轴假报回归」，然后再回头查仪器（第 167 轮走过的路）。
2. **「只许一行」也是设计约束**：零目标轴把「每域一行」这种最自然的写法变成不可接受
   ⇒ 汇总必须外移。这类约束**不写在需求里，只写在读数里**。
3. **传递解析是这类口径的终态**：装配一旦变成「汇总 + 展开」，任何单层扫描都会失明；
   `resolveMemberKeys` 的 worklist 形态可以直接复用到后面任何「对象拼装」的写法上。

## 第 170 轮（2026-09-22）：④-3 第二个域 `ui-initialize`（76 → 75 / 伴随判据 7 → 6）

### 一、纯机械活？不 —— 仪器又瞎了两次

第 168 轮已核实「可以改」（唯一调用路径 `getUIStore().initialize()` 接收者绑定 ✓；
体内嵌套回调**全是箭头函数** ⇒ `UI.x` → `this.x` 逐字等价 ✓），装配入口第 169 轮也备好了。
于是照做：把 `UI.initialize = function (this: UIShape) {…}` 改成 `const initialize = …` +
导出 `uiInitializeMembers`，体内 16 处 `UI.` → `this.`、4 处 `.call(UI)` → `.call(this)`，
`ui-members.ts` 加一条 `...uiInitializeMembers`。

结果**两条轴正常下降**（`ui-singleton-members` **76 → 75** / 伴随判据 **7 → 6**），
但第三条露出**新的一类失明**：`ui-slot-coverage.assigned` **132 → 119**（−13）。

### 二、第 6、7 类失明（都在这一轮被同一件事触发）

| # | 失明 | 根因 | 修法 |
| --- | --- | --- | --- |
| 6 | 成员对象写成**简写** `{ initialize }` 时，`objectPartsAt` 不认（旧正则要求 `key:` / `key(` / `key=`） | 而 `{ initialize: initialize }` 正是**最自然**的写法（还可能被 formatter 压成简写） | `flush()` 增加一支：整个 chunk 就是一个标识符 ⇒ 也是键 |
| 7 | **家族判据**把 `ui-initialize.ts` 踢出「域模块」⇒ 它体内 **13 处 `this.x =` 不再算槽位赋值** | 家族判据原来是「`engine/ui/` 下 + 文件里出现过 `UI.x =`」，而 ④-3 的域模块**正是为了不写 `UI.x =`** 才改的 ⇒ 判据与目标互相拆台 | 新增 `domainModuleRels()`：**装配入口 `ui-members.ts` import 进来的模块**就是域模块；它们的 `this.x =` 照算 |

第 7 类是**方向上**的错误（不是漏一种写法，而是判据的前提被自己的目标推翻）——
这类最值得记：**当一次重构的目标就是「不再出现某种写法」时，任何以那种写法为锚的判据都会在这一步失明。**

顺带踩到一个实现细节：`domainModuleRels()` 第一版用了 `codeOnly()`，而它**连字符串字面量一起吃掉**
——模块路径正是字符串 ⇒ 一条 import 都匹配不到（`assigned` 仍是 119）。改用 `stripComments()`（只去注释）。
**「去注释」与「去字符串」是两个不同的口径，别顺手用错。**

### 三、自证（63 → **64**）

新增一条断言：`assignedSlots()` 必须包含 `translationTimer` / `zoomTimer` / `inspectorTypeMap` /
`controlPoints` —— 这四个**只在 `ui-initialize.ts` 里以 `this.x =` 赋值**，所以它正是第 7 类失明的
探针（没有 `domainModuleRels()` 那条修法，这条测试必红）。简写那类也补进第 5 类的自证里。

### 四、账与验证

| 项 | 结果 |
| --- | --- |
| `ui-singleton-members` | **76 → 75**（files 7 → 6） |
| `ui-domain-singleton-imports` | **7 → 6**（域模块不再 import 单例） |
| `legacy-ui-lines` / `1c-store-slot-gaps` / `ui-slot-coverage` | 持平（`assigned` 修好后回到 132） |
| `migration:selftest` | 63 → **64** |
| 其余 | editor `tsc` / `typecheck:vue` / `lint` / 全套 2075 用例 |

### 五、教训

1. **「目标是消灭某种写法」时，判据要换锚点**：第 7 类失明的根因不是漏写正则，而是
   `UI_DIRECT_SLOT_RE` 这条锚点**恰好是被消灭的对象**。⇒ 这类重构动手前，先列出
   「哪些判据以它为锚」。
2. **「去注释」≠「去字符串」**：本轮第一版修法就栽在这里（`codeOnly` 把 import 路径吃掉）。
   仪器里每换一个扫描原语，都要问它吃不吃什么。
3. **每接一个域都要重跑三条轴**：②③④ 三次失明都发生在「接下一个域」这一步 ——
   同样的动作，第二次仍然会踩到新的口径缺口（因为每个域的写法细节不同）。

## 第 171 轮（2026-09-22）：第 3 个域 `ui-list` 的前提核实 —— 它需要**第二种装配形态**（未落地）

### 一、`ui-list` 与前两域不是同一类

按老办法先摸清它的形状（454 行）：

- **10 处顶层挂载**（`UI.searcherInput` / `listKeydown` / `listPointerdown` / `listSelect` /
  `listRecord` / `listPopup` / `listOpen` / `listRename` / `listChange` / `listPageResize`）
  —— 这部分与前两域同形，可机械搬；
- ⚠️ **另有 7 处对「成员的成员」的赋值**：`UI.marquee.resize` · `UI.list.copy` · `UI.list.paste` ·
  `UI.list.delete` · `UI.list.toggle` · `UI.list.cancelSearch` · `UI.list.updateHead`
  —— 实测这 7 处**缩进全是 0**（**模块顶层语句**，不是函数体内部）。

⇒ 差别就在这 7 处：它们要的是**单例本体**（更准确说：单例上那两个**子对象** `list` / `marquee`），
而「成员对象」形态只能表达「往单例上挂哪些键」，**表达不了「往子对象上挂」**。

### 二、因此第 3 个域要的是「成员对象 + attach 钩子」

自然形态：域模块导出

```ts
export const uiListMembers: UIListMembers = { searcherInput, listKeydown, … };   // 10 项
export function attachUiList(target: UIShape): void {                            // 7 项子对象
	target.marquee.resize = …; target.list.copy = …; …
}
```

由 `ui-members.ts` 在装配时两者都调 —— 域模块**依旧不需要 `import { UI }`**（接收者由参数传入）✓。
⇒ 这是**第 2 种装配形态**（前两域只有第 1 种），`ui-members.ts` 的「汇总对象」要把 attach 钩子也列上。

### 三、要先算的两笔账（下一轮动手前）

1. **仪器**：那 7 处子对象赋值今天由 `SLOT_ASSIGN_RES` 的第 3 条（`UI.x.y =`）算成「槽位 x 被赋值」。
   改成 `target.list.copy = …` 后这条不再匹配 ⇒ 要确认 `list` / `marquee` **仍能从别处**拿到
   「已赋值」的证据（据查 `ui-initialize.ts` 里有 `this.list = uiEls.get('ui-list')` /
   `this.marquee = …`，而它已是家族成员 ⇒ 应该仍算）——**但这必须实测，不能靠推断**。
2. **`Object.assign(UI, …)` 的识别面**：attach 钩子**不是** `Object.assign`，而是「传入 target 后逐个赋值」。
   如果那些赋值写成 `target.list.copy = …`，`assignedSlots` 的 `this.x =` 家族分支也不认（`target.` 不是 `this.`）
   ⇒ 要么让钩子内部用 `Object.assign(target.list, { copy, paste, … })`（仪器认 `Object.assign(UI, …)` 只认
   **第一个参数是字面 `UI`**，所以还得扩口径），要么接受「这些子槽位的证据来自别处」。
   **两条都要先量，别先改。**

### 四、本轮账

**不变**（`ui-singleton-members` 75 · companion 6 · 17 轴持平）。交付物是**核实过的形状**
（10 + 7，且 7 处是模块顶层 —— 这是决定性事实）与**两笔要先算的账**。

### 五、教训

1. **「同一个动作」这话要限定范围**：第 167/170 两轮之后我以为「接域」已经标准化，
   但那只对**只有顶层挂载**的域成立；`ui-list` 一出现「成员的成员」就换了形态。
   ⇒ 判据：**先数「顶层挂载」与「子对象赋值」各几处**，两者都存在时不能用第 1 种形态。
2. **形态的边界由「谁提供接收者」决定**：成员对象能表达「挂到单例」，表达不了「挂到单例的子对象」；
   后者必须让装配点把**接收者传进来**（钩子），这恰好仍然满足「域模块不依赖单例」的终态要求。

## 第 172 轮（2026-09-22）：第 3 个域的**转换规则**核实 —— 一句 `this.` 会静默改行为（未落地）

### 一、查出来的坑：那 7 处的 `this: UIShape` **是谎话**

第 171 轮已确认 `ui-list` 有「10 处顶层挂载 + 7 处子对象赋值」。本轮要定的是**转换规则**：
体内那些 `UI.x` 到底该改成 `this.x` 还是「捕获的 `target.x`」。查调用点，结论泾渭分明：

- **10 处顶层挂载**的调用点都是 `UI.x(…)`（store 转发 · `LayoutPanel` · `ui-initialize` 的 `on(…, this.x)`）
  ⇒ `this === UI` ⇒ 体内 `UI.x` → `this.x` **等价** ✓（与前两域同）。
- **7 处子对象成员**（`UI.list.copy` / `.paste` / `.delete` / `.toggle` / `.cancelSearch` / `.updateHead`
  / `UI.marquee.resize`）的调用点是 **`list.copy(item)` 这种「子对象当接收者」**：
  实测 `ui-list.ts:210/224/225/233/241/257`、`ui-file.ts:172/182/253/258`，以及 `scene-*` ·
  `variable` · `attribute` · `enum` · `plugin` 等处**全是这个形状**。
  ⇒ 运行期 `this` 是**子对象**，而它们源码里写的 `this: UIShape` **是谎话**（「断言可能说谎」那一家族）。

**若照老办法一律 `this.`，这 7 处会在运行期从 list 对象上读 `history` / `marqueePointermove`
（都是 `undefined`）⇒ 复制/粘贴/删除/折叠/搜索清空整片静默失效，而套件未必抓得住** ——
这正是本仓反复记的那类「不报错的静默失效」。

### 二、正确规则（写进手法库 #45 的第 3 个必查项）

- 10 处顶层挂载：`UI.x` → `this.x` ✓（`this === UI`，调用点可证）；
- 7 处子对象成员 + `getListConfig(UI.list).onCreate/onRemove/onDelete/onResume` 那几个回调
  （`:429/436/441/450`，接收者也不是 UI）：一律用**钩子参数捕获的 `target`** ——
  `target.history!.save(…)` · `target.marqueePointermove!(…)`，**不能**写 `this.…`。

**判据（可复用）**：**改 `UI.x` 之前先看调用点是不是 `UI.x(…)`**；只要接收者是子对象
（`list.` / `marquee.`），就只能用捕获的 `target`。

### 三、另两笔账也顺带定了

- 子槽位证据（第 171 轮的账①）：`list` / `marquee` 在 `ui-initialize.ts` 里有
  `this.list = uiEls.get('ui-list')` / `this.marquee = …`，而该文件已是**家族成员**（第 170 轮的修法）
  ⇒ 即使 `UI.x.y =` 那 7 条不再匹配，两个槽位**仍有证据** ✓（落地后用 `migration:check` 复核 `assigned` 是否仍 132）；
- 账②（要不要扩口径）：**不需要** —— 钩子内部写成 `target.list.copy = …`（而不是
  `Object.assign(target.list, …)`）就不涉及新形态，仪器只需「子槽位证据来自别处」这一点成立 ✓。

### 四、本轮账

**不变**（75 / 6 / 17 轴持平）。交付物是**转换规则**与**一个会静默改行为的坑**的定位 ——
下一轮按它实施即可，且不必再试错。

### 五、教训

1. **「同样的动作」在第三个域就不成立了**，而**它的失败方式是静默的**：不是编译错，是运行期读 `undefined`。
   ⇒ 每接一个域，先问**「这些成员的调用点长什么样」**，而不是照抄上一轮的手法。
2. **`this: X` 标注不能当证据**：本仓早就有「断言可能说谎」这条（#139），这次它落在**方法接收者**上 ——
   唯一的证据是**调用点**。查一次调用点（一条 grep）就能抵掉一整轮运行期排错。

## 第 173 轮（2026-09-22）：`ui-list` 先搬**声明**（75 → 65），把 `this` 那一问留给证据

### 一、动手时撞上一个「验不了」的点，于是换了切法

按第 172 轮的规则做整域转换（10 处顶层用 `this.`、7 处子对象用捕获的 `target`）。脚本化改写后**自检**，
发现一处**必须先证伪**的地方：`ui-initialize.ts` 用 `on(list, 'keydown', this.listKeydown)` 之类注册了
这些挂载，而 `on()` 对自定义元素是**转调 `el.on(type, listener)`** —— 接收者由**各组件自己的实现**决定。
也就是说：那 10 个函数到底以谁为接收者被调用，**在 `on()` 这一层看不出来**。

支持「`this === UI`」的**旁证**是文件里**本来就**有 `this.copy!` / `this.data`（作者一直当它是 UI）；
但那是**推断**，不是证据。⇒ 在验明之前，**不把体内 `UI.x` 改成 `this.x`**（那是会静默改行为的改法，
第 172 轮刚记过这一类）。

于是换一个**零风险**的切法：**本轮只搬声明、不动函数体**。

### 二、切法与收益

- 10 处 `UI.name = function (…) {…}` → `const name = function (…) {…}` + 文件末尾
  `export const uiListMembers = { searcherInput, …, listPageResize }`（简写键 —— 第 170 轮补的
  「简写」口径在这里正好用上 ✓）；
- 函数体**一个字符没动**（`UI.` 原地保留）⇒ **行为逐字不变**；
- `ui-members.ts` 加一条 `...uiListMembers`。

账：`ui-singleton-members` **75 → 65**（files 6 → 5，**一次降 10，是目前最大的一步**）；
伴随判据 **6 持平** —— 这是**如实**的：域模块**仍然** `import { UI }`（函数体还在用它），
所以它没有满足 (b) 的终态，只是「成员由域提供、装配由 facade 完成」这一半已经达成 ✓。

### 三、账与验证

| 项 | 结果 |
| --- | --- |
| `ui-singleton-members` | **75 → 65**（files 6 → 5） |
| `ui-domain-singleton-imports` | 6 持平（**如实**：域模块仍 import UI） |
| `legacy-ui-lines` / `1c-store-slot-gaps` / `ui-slot-coverage` | 全部持平（`assigned` 仍 132，0 盲区） |
| editor `tsc` / 全套 2075 用例 | 0 错 / 全绿 |

### 四、教训

1. **「验不了」不等于「做不了」**：把一次改动**切成「只搬声明」与「搬语义」两步**，
   前者零风险且照样能把轴推进 10 点；后者等证据齐了再做。**这一步的收益并不小**（本轮是最大的一步）。
2. **旁证 ≠ 证据**：文件里已有的 `this.copy!` 是很强的旁证，但**同一个函数还有 `UI.setTarget!`**
   —— 两种写法并存说明「谁是接收者」这件事在作者那边也没有一致口径。⇒ 并存本身就是**要查的信号**。
3. **脚本化改写必须带自检**：本轮脚本自带了「10 处声明是否都改到」的断言（少一处就 `exit 2`），
   并在跑完后用**大小写敏感**的 grep 复核「体内 `UI.` 仍在（46 处）」。第 37 轮那次「脚本把 349 行改坏」
   的教训，靠的就是这种**改完立刻数两遍**。

## 第 174 轮（2026-09-22）：接收者那一问**没能在本仓闭合**——它是跨包的（未降账）

### 一、查了四层，结论是「权威不在编辑器里」

第 173 轮留下的那一问：`ui-initialize.ts` 用 `on(list, 'keydown', this.listKeydown)` 注册的那些挂载，
**运行期到底以谁为接收者**（决定体内 `UI.x` 能不能改 `this.x`）。本轮逐层查：

| 层 | 查到什么 |
| --- | --- |
| `utils/element-utils.ts` | `on()` 对自定义元素走 `el.on(type, listener, options)`（`:48`）——**只是转调** |
| 编辑器侧 SFC | 一律是 `ym.value?.on(type, listener, options)`（`WindowFrame` / `CommonList` / `SelectBox` / `TextBox` … 20+ 处）⇒ **实现在别处** |
| `ui-kit/src` | `on(type, listener)` **只有声明**（`YMFont` / `YMRename` / `YMZoom`…）；且**找不到任何派发点**：`.call(this/el/target)` 与 `listener(` / `cb(` 在 ui-kit 里 **0 命中** |
| 运行期 | `template-arpg/runtime/Script/ui.ts:3147` 有 `input.on(type, listener)` ⇒ 元素/事件系统落在**运行时或 ui-kit 的元素工厂**，编辑器里看不到派发语义 |

⇒ **跨包语义不要靠推断**。第 173 轮那条旁证（文件里已有 `this.copy!`）本轮**不成立**：
同一个函数里 `this.copy!` 与 `UI.setTarget!` **并存**，只能说明作者那边也没有一致口径，
不能推出「`this` 就是 UI」。

### 二、下一步（按成本排序，已写进 PHASE）

- **(a) 写一条能红的 spec**（本仓惯用「靠一次判定」）：在 jsdom 里走 `on(list, 'keydown', handler)`
  的真实注册路径，在 handler 内断言 `this === UI` —— **最直接、可复现**；
- (b) 读 `template-arpg/runtime/Script/ui.ts` 的 `on` 实现与派发点（权威在运行期，但要读懂跨包调用）；
- (c) 若 (a) 判定「`this` 不是 UI」，则这 10 个挂载**保持** `UI.` 写法（第 173 轮已是如此），
  并把终态从「依赖 `this`」改成「**显式接收者**」。

### 三、本轮账

**不变**（65 / 6 / 17 轴持平）。交付物是**把问题定位到跨包**、排除了一个不成立的旁证，
并把三条下一步按成本排序钉下来 —— 免得下一轮又从「读编辑器代码」开始绕。

### 四、教训

1. **推断链要标注强度**：第 173 轮的旁证在写下来时就该标成「旁证，未验」；本轮一查就不成立。
   ⇒ **凡是没写「怎么证伪」的旁证，都不要拿它当决策依据。**
2. **「在本仓找不到」本身就是结论**：四层查完、每层都有明确「0 命中」，这就把问题**限定**在
   运行时/元素工厂那一层 —— 比继续在编辑器里翻要有价值。
3. **跨包语义优先用 spec 判定，而不是读实现**：读三个包要跟调用链，而一条 spec 只有十几行，
   而且**能红**（这才是证据）。

## 第 175 轮（2026-09-22）：判定完成 —— `this` 是**元素**，而那个函数**故意用两个接收者**

### 一、决定性证据：一行实现

不用写 spec，`ui-kit` 里就有答案（第 174 轮之所以没找到，是因为搜索的是 `on(type, listener)` 的**声明**；
实现写成 `const on = (` 才躲开了）：

```ts
// ui-kit/src/components/basic/YMCommonList/YMCommonList.vue:219
const on = (type, listener, options) => {
	const el = root.value;
	if (!el) return;
	el.addEventListener(type, listener, options);   // ← 原生 addEventListener
	…
};
```

⇒ 浏览器派发时 **`this` = 那个 DOM 元素**，**不是单例** ✓。
凡经 `on(el, …)` 注册的挂载，体内 `UI.x` 改 `this.x` 会在运行期从元素上读 `history` / `setTarget`
（`undefined`）⇒ **静默失效**。**第 173 轮「只搬声明、不动函数体」因此被证据确认是对的。**

### 二、又推翻了我自己的一个推断（这次是「缺陷」）

看到 `listKeydown` 里有 `if (!this.data) return;`（`:29`）时，我推断「元素接收者 ⇒ `this.data` 为
`undefined` ⇒ 早退 ⇒ **列表快捷键静默失效**」。全仓 `grep` 一次就把它推翻了：

- **兄弟模块全都把 `this` 注成元素**：`Attribute.listKeydown(this: TreeListElement)` ·
  `Enum` · `Localization` · `PluginManager` · `Easing.listKeydown(this: YamiElement)` ·
  `Particle.listKeydown(this: ParticleShape['list'])` · `useTeamWindow.listKeydown(this: TeamListElement)`；
  而 `command-tip.ts` 干脆**不写 `this`**。**只有 `ui-list.ts` 这一处注成 `this: UIShape`** ⇒ 注错的是它。
- `this.copy!` / `this.delete!` / `this.toggle!` / `this.cancelSearch!` / `this.data` 是**元素自己的 API**
  —— 同文件 `:224/225/241` 就是 `list.copy(item)` 这种在元素上调用，别处模块也一样。

⇒ `listKeydown` 体内**两种接收者并存是刻意的**：`this` = 列表元素（`this.copy!` 等）、`UI` = 单例
（`UI.setTarget!` / `UI.history!`）。**第 173 轮那条脚本若真把 `UI.` 全换成 `this.`，就会当场改坏它。**

### 三、结论与终态

- 这 10 个挂载**保持** `UI.` 写法 ✓（现状即正确）；
- 终态是「**显式接收者**」：把元素侧写成参数 / `target`，不再依赖 `this` 与 `UI` 两种**隐式**来源；
- `this: UIShape` 这个**错误标注**应改（属类型债，不是行为债，可单独立项）。

### 四、本轮账

**不变**（65 / 6 / 17 轴持平）。交付物是**判定**（一行实现）+ **第二次自我推翻**（推断的缺陷不存在）
+ 明确的终态。**两轮之内推翻了两个自己的推断**（第 174 轮推翻旁证，本轮推翻缺陷假设）——
两次都靠**一次 grep / 一次读实现**，而不是靠推理链。

### 五、教训

1. **「两种写法并存」有两种解释，必须先排除「刻意为之」**：第 173 轮我把它读成「口径不一致」，
   实际是「**两个接收者**」。⇒ 判据：并存时先问**「它们各自指向谁」**（元素 vs 单例），而不是先判混乱。
2. **搜「声明」会漏掉「实现」**：第 174 轮找 `on(type, listener)` 只找到声明，本轮换成 `const on = (`
   一行就命中。⇒ **找实现要搜赋值形态，不是签名形态**（同一族的教训：判据不能认写法）。
3. **推断越顺，越要先找反例**：本轮那个「静默失效」的故事讲得通、也符合本仓历史，
   但它错在**没查兄弟模块怎么注 `this`** —— 一次全仓 grep 就够了。

## 第 177 轮（2026-09-22）：`ui-prefab` **走完全程** —— ④-3 第一个彻底收口的域（65 → 62 / 伴随判据 6 → 5）

### 一、按第 176 轮的核实动手，3 个槽位一次做完

`ui-prefab.ts` 只剩 3 个槽位，前三轮的准备在这一轮一次性兑现：

| 槽位 | 处理 |
| --- | --- |
| `createPrefabItem` | 改成 `const`；体内那个**非箭头**的 `click`（`this` 是菜单项）需要单例 ⇒ **入口捕获** `const ui = this;`，再由闭包带进去（`ui.createPrefab!(…)`）——**不靠 `this`，也不必保留 `import { UI }`** |
| 链式赋值 `uiElClasses.createElement = UI.createElement = function …` | **拆开**：`const createElement = …` + 单独一行 `uiElClasses.createElement = createElement;`（两个目标，一行只对一个） |
| `loadElement` | 改成 `const`；自递归 `UI.loadElement!(child, instance)` → `this.loadElement!(child, instance)`（调用点全是 `UI.x(…)` ⇒ `this === UI` ✓）；体内原有的 `this.createElement!` 本来就是这个口径 ✓ |

末尾 `export const uiPrefabMembers = { createPrefabItem, createElement, loadElement };`，
`ui-members.ts` 加一条 spread，**`import { UI }` 整行删掉**。

### 二、账（两条轴同时动，且都是预期值）

| 项 | 结果 |
| --- | --- |
| `ui-singleton-members` | **65 → 62**（files 5 → 4） |
| `ui-domain-singleton-imports` | **6 → 5** ✓ —— **第一个「走完全程」的域**（不再 import 单例） |
| `legacy-ui-lines` / `1c-store-slot-gaps` / `ui-slot-coverage` | 持平（`assigned` 仍 132，0 盲区） |
| editor `tsc` / 全套 2075 用例 | 0 错 / 全绿 |

### 三、这一轮立起的样板（后面 4 个域照抄）

1. **先核实接收者**（第 175/176 轮的方法）：`UI.x(…)` ⇒ 可 `this.`；`on()` 注册 ⇒ `this` 是元素；
   嵌套的**非箭头**函数 ⇒ **入口捕获**（`const ui = this`）—— 这条是新的，前两域没遇到；
2. **链式赋值要拆**（一行两个目标）；
3. **终态判据 = 能否删掉 `import { UI }`**：能删 ⇒ 伴随判据下降；只能删一半（如 `ui-list` 的
   `on()` 域）⇒ 如实保留，不硬凑。
4. ⚠️ 本域能用「删掉 import」是因为它**没有** `on()` 注册、也**没有**子对象赋值；
   `ui-list` / `ui-pointer` 这类必须先解决那两条（见手法库 #45）。

### 四、教训

1. **准备三轮、实施一轮**：第 174–176 轮都在查证（跨包、两个接收者、链式赋值），本轮 3 个槽位
   一次过、`tsc` 0 错、两条轴都落在预期值上。**查证不是拖延，它让实施变成抄写。**
2. **「入口捕获」是第三种接收者解法**：前两域只有「`this`」与「捕获的 `target`」两种；
   本域的 `click` 既不是 UI 也不是装配目标，而是**菜单项** ⇒ 解法是在**入口**把 `this` 存成局部变量，
   让非箭头闭包也能拿到单例。⇒ 手法库的接收者解法从 2 种变 3 种。
3. **一条链式赋值值得单独记**：`uiElClasses.createElement = UI.createElement = function` 同时给
   注册表与单例赋值 —— 拆开后才可能让域模块不依赖单例；不拆则永远留着那半条 `UI.`。

## 第 179 轮（2026-09-22）：`ui-transform` 只搬声明 —— 一次降 **18**（62 → 44）

### 一、按第 178 轮的排序，直接砍最大那一个

第 178 轮把剩下的域分成「干净 / 存疑 / 最难」三档，`ui-transform`（18 处）是**最大且最干净**的一域
（0 处 `on()` 注册、0 处子对象赋值、全是 API 方法）。本轮用**与第 173 轮同一策略**处理它：
**只搬声明、不动函数体** —— 行为逐字不变、零风险。

脚本把 18 处 `UI.name = ` → `const name = `，并在末尾生成
`export const uiTransformMembers = { setSize, setHover, …, resize }`（**简写键**，第 170 轮补的口径刚好接住），
`ui-members.ts` 加一条 spread。**自检**：脚本先断言「挂载数必须 = 18」（不等就 `exit 2`），
改完再断言「不再有任何 `^UI.x = `」；跑完还用**大小写敏感**的 grep 复核「体内 `UI.` 仍在」（4 处）。

### 二、账

| 项 | 结果 |
| --- | --- |
| `ui-singleton-members` | **62 → 44**（files 4 → 3）—— **一次降 18，是目前最大的一步** |
| `ui-domain-singleton-imports` | 5 持平（**如实**：函数体仍用 `UI`，import 保留） |
| `legacy-ui-lines` / `1c-store-slot-gaps` / `ui-slot-coverage` | 持平（`assigned` 仍 132，0 盲区） |
| editor `tsc` / 全套 2075 用例 | 0 错 / 全绿 |

### 三、教训

1. **排序的收益立刻兑现**：第 178 轮花一轮把判据钉死成两问，本轮直接命中最大目标、一次过。
   **把「先做哪个」当成一件事来做，比每个都试一遍便宜得多。**
2. **「只搬声明」这一步在大域上尤其划算**：18 处声明、零行为风险，却拿下 18 点 ——
   如果坚持「一次走完全程」（还要判 21 处体内引用的接收者），这一轮多半又会变成查证轮。
   ⇒ **切法要按「风险」切，不是按「完整性」切。**
3. **自检要写在脚本里**（第 37 轮「脚本把 349 行改坏」的教训）：本轮脚本两道断言 + 跑完两道 grep，
   全部在提交前跑；这已经是本会话第三次脚本化改写（第 167/173/179 轮），一次都没出事故。

## 第 182 轮（2026-09-22）：`ui-file` 只搬声明（44 → 29），外加一个保留字陷阱

### 一、同一策略第五次复用

`ui-file.ts` 的 15 处顶层挂载（`open` / `load` / `save` / `close` / `destroy` / `copy` / `paste` /
`duplicate` / `create` / `createPrefab` / `createShortcut` / `delete` / `toggle` / `undo` / `redo`）
按第 173/179 轮的同一策略处理：**只搬声明、不动函数体** ⇒ 行为逐字不变、零风险。
脚本仍带两道断言（挂载数必须 = 15；改完不得再有 `^UI.x = `）+ 跑完大小写敏感 grep 复核。

### 二、第一次跑**被 tsc 当场拦下**：`delete` 是保留字

第一版脚本照抄「`UI.name = ` → `const name = `」，于是生成了 `const delete = …` ——
**语法错误**（`delete` 是 JS 保留字）。`tsc` 立刻红，脚本的「改名成功」断言却**是绿的**
（它只检查文本改没改到）。⇒ 修法：**局部名与成员键分开** —— 局部叫 `deleteSlot`，
成员对象里仍写 `delete: deleteSlot`（**键**是属性名，允许保留字 ✓）。

**这是本轮最有价值的一条**：脚本的断言只覆盖了「我改到了没有」，**覆盖不到「改出来的东西合不合法」**；
后者由 `tsc` 兜住 ⇒ **脚本化改写必须紧跟一次 `tsc`，不能只看脚本自检的绿**。

### 三、账

| 项 | 结果 |
| --- | --- |
| `ui-singleton-members` | **44 → 29**（files 3 → 2） |
| `ui-domain-singleton-imports` | 5 持平（如实：函数体仍用 `UI`） |
| `ui-slot-coverage` / `legacy-ui-lines` / `1c-store-slot-gaps` | 持平（`assigned` 仍 132，0 盲区） |
| editor `tsc` / 全套 2075 用例 | 0 错 / 全绿 |

### 四、教训

1. **脚本自检 ≠ 合法性检查**：断言「改到了 15 处」是**文本层**的绿，`tsc` 才是**语义层**的绿。
   本轮两者结论相反（脚本绿、tsc 红）—— ⇒ 流程固定为「脚本 → tsc → 棘轮 → 跑套件」。
2. **保留字只在这一步才会露头**：`UI.delete = …` 完全合法（属性名），改成 `const delete = …` 才炸。
   ⇒ 批量改名时**必须过一遍保留字表**（`delete` / `new` / `class` / `default`…）；本仓的槽位名里
   恰好只有 `delete` 一个。
3. **键与局部名可以不同**：成员对象的**键**要保真（`delete`，装配口径与 store 转发都按这个名字找），
   局部名只是实现细节 ⇒ 两者解耦是这类改写的常规手法。

## 第 183 轮（2026-09-22）：`ui-events` + `ui-pointer` 只搬声明，`ui-singleton-members` 归零

### 一、做了什么

`ui-singleton-members` 最后两个域一次收口（同第 173/179/182 轮口径：**只搬声明、不动函数体**）：

| 域文件 | 搬走的声明 | 导出 |
| --- | --- | --- |
| `ui-events.ts` | 21 | `uiEventsMembers` |
| `ui-pointer.ts` | 8 | `uiPointerMembers` |

装配侧只动 `ui-members.ts`：两行 import + 两行 spread；`ui-window.ts` 的**唯一**装配线未动
（`legacy-ui-lines` 持平 300）。

**`ui-singleton-members.total: 29 → 0`（files 2 → 0），`declared` 仍 134。**

### 二、`.total = 0` 不等于 ④-3 完成

伴随判据 `ui-domain-singleton-imports` **持平 5**，如实：`ui-list` / `ui-transform` / `ui-events` /
`ui-pointer` 等域的函数体仍走 `UI`，import 保留。按第 181 轮判据，这是**终点而非中间站**——
它们的挂载经 `on()` 注册，运行期 `this` 是**元素**（手法库 #45），把体内 `UI.` 一律改成 `this.`
是错的；而装配期注入模块级引用属于 **white-grab**（改的是获取方式，不是依赖关系），已判为禁止。

⇒ 伴随判据从此的含义是「**能真正解耦**的域」，不是「还没干完的域」。

### 三、把上一轮的教训做成了工具

第 182 轮的保留字陷阱（`UI.delete` 合法 / `const delete` 不合法）当时靠**人工**过表；
本轮把它写进脚本（RESERVED 集合 + 局部名兜底 `n + 'Slot'`），29 个名字自动过筛 ⇒ 命中 **(none)**。
**教训只有被写成判据、进到工具里，才算真的被吸收。**

### 四、教训

1. `total = 0` 是**声明层**的终点，不是**依赖层**的终点。层与层各有自己的刻度，
   拿上一层的归零去宣称下一层完成，是这一轮最容易犯的错。
2. 收口这一层**更不能**顺手改体内引用：搬声明的正确性恰恰来自「函数体逐字未动」，
   一旦顺手改 `this.`，零风险就不再是零风险（第 173 轮已用 `ui-list` 的双接收者证明过）。
3. 下一步（④-4：退役字面量、删 `ui-window.ts` / `register.ts`）是**声明层的下一层**，
   它才会动 `declared 134 → 0` 与 `legacy-ui-lines` / `legacy-ui-refs`。
### 五、一条守卫的前提到期了（本轮唯一的红灯）

`migration:selftest` 在搬完最后一处挂载后**当场变红**：用例「遗留层还在 ⟹ 挂载点轴非 0」的
后半条断言「全仓仍应有 `UI.<name> =` 挂载点（当时 82 处）」——本轮它**合法地**归零了。
这正是第 182 轮记下的那条：**守卫的前提会随目标达成而失效**。

处理方式**不是删掉它**：要守的东西没变（「仪器瞎了」不能读成「搬完了」），换两条替代读数：

| 要守的 | 新锚 | 为什么它够 |
| --- | --- | --- |
| 正则没瞎 | 本文件开头 `UI_SINGLETON_RE` 的合成样本自证 | 与真实仓库状态无关，坏了必红 |
| 134 个槽位仍被提供 | **另一条轴**的词法读数 `assignedSlots()`（`ui-slot-coverage` 132） | 跨轴交叉验证，一起归零才是真瞎 |

教训：**自证只能证明「我没瞎」，证明不了「东西还在」** ⇒ 守「主体还在」的锚必须来自**另一个仪器**。
## 第 184 轮（2026-09-22）：④-3 收口后的两个裁定 —— 伴随判据的归零时机，与一个不能「顺手」改的 `UI`

### 一、做了什么

本轮**没动产品代码**。做了两件必须有人做的事（都写进 PHASE-1C）：

1. **裁定伴随判据的归零时机**。计划原文写着「与 `ui-singleton-members` 同生共死，
   两条同时归零才算 ④-3 收口」—— 实测**不成立**：`isLegacySingletonUiImport` 只认
   `legacy/ui-window` 这个**说明符** ⇒ companion=0 只能等 ④-4 退役该文件之后达成。
   诚实切分：**④-3 = 声明层（已 0）**，**④-4 = 依赖层（companion + `declared` + 删文件）**。
2. **5 个域的实测工作单**（`stripComments` 后逐行，含行号与性质分类）：
   `ui-list` 44 处/21 名（双接收者）· `ui-events` 9/6 · `ui-pointer` 5/5 ·
   `ui-transform` 3/2（在 `Timer` 回调里）· `ui-file` 1。

### 二、差点被「顺手」改掉的一行

`ui-file.ts:115` 的 `UndoManager.setActive!(UI)` 是全文件最后 1 处 `UI`，看上去就是漏网的。
**不能改**：

- 同一个 `open` 函数体内，别的单例成员一律走 `this.`（`this.setTarget!` `this.list.update()`…），
  **只有这一行写 `UI`** ⇒ 同一体内两种接收者并存；
- 全仓 **`UI.open(` 没有任何静态调用点** ⇒ 无法证明 `this === UI`。

这正是第 173 轮 `ui-list` 那条的同型（双接收者并存是**刻意**的，一律转换会改行为）。
⇒ 本轮的真实价值 = **拦下一次「看起来零风险」的改动**。

### 三、账

不变（`ui-singleton-members` 0 · companion 5 · 17 轴持平）。交付物是**裁定 + 工作单**。

### 四、教训

1. **判据的「终态」要能被判据自己的实现证伪**：写下「两条同时归零」时，没人去读
   `isLegacySingletonUiImport` 认的是哪个说明符。**写下终态之前，先读一遍判据的实现。**
2. **轴归零之后的那一轮最容易犯错**：归零会诱发「剩下的都是漏网之鱼」的错觉。
   而**数引用数不出接收者** —— 第 173 轮已经吃过一次同型的亏，这次靠复查接收者拦住了。
3. 前提也是产物：本轮不降账，但让下一轮不必再怀疑「companion 为什么降不下去」。
## 第 185 轮（2026-09-22）：④-4 动手前实测 —— 字面量不是「134 行实现」，是「123 个空占位」

### 一、两处必查项

1. **枚举**（原计划点名的那条，②的必查项）：全仓 `Object.keys(UI)` / `Object.entries(UI)` /
   `Object.getOwnPropertyNames(UI)` / `...UI` / `for (const k in UI)` **命中 0 处**
   ⇒ store 桥与 `loadUI` **不会在装配之前枚举单例**。**通过**。
2. **体积**（本轮自己加的量）：134 声明 = 133 运行时条目（末条 `createShortcut` 无尾逗号），其中
   **123 个 `null` 占位**、**10 个真值**（7 个 DOM 引用 + 2 个状态 + 1 个位标志）；
   另有 **39 行 `UIShape` 类型签名**（`ui-window.ts:23`–`73`）与字面量同文件。

⇒ ④-4 的实现面比名字听起来小一个数量级：搬 10 个真值 + 39 行契约、确认 123 个占位有提供者、
删字面量与 `register.ts`、重接 ~10 处 import。**但它有一个陷阱，本轮才看清。**

### 二、陷阱：仪器的锚就钉在「即将被删的那个东西」身上

`declaredSlots()` 靠 `uiWindowRel()` 定位「含单例字面量的文件」。字面量一删或一搬，它会
**静默返回空数组** ⇒ `declared` 从 134 掉到 0，报表写「✓ 已完成」——与 PHASE 开头记的
「假绿三连」同型。**④-4 必须先把仪器换锚，再动字面量**，否则那一轮的"归零"无法与"瞎了"区分。

### 三、顺带露头的一处账目不一致（留给下一轮）

`declaredSlots() − assignedSlots()` = **23 个**；而轴报 `assigned = 132`，`declared = 134`
⇒ 反推**还有 21 个 assigned 不在 declared 里**。两边集合定义不同，**动手前必须逐条判定**。
本轮只把数字与 23 个名字入档（名字不是证据，别按名字猜）。

### 四、教训

1. **「听起来的大小」与「实测的大小」可以差一个数量级**：④-4 被描述了三轮「退役 134 个槽位」，
   实测实现面只有 10 个真值 + 39 行契约。**动手前先量，别按名字排期。**
2. **仪器的锚若钉在被删对象上，删除当轮必然"报喜"**：这类归零必须与"瞎了"可区分，
   ⇒ 换锚要**先于**删除（第 183 轮 selftest 红灯是同一条教训的另一次现形）。
3. **账目不一致只有交叉相减才会露头**：我本来只是想要一张工作单，顺带发现了
   `assigned` 与 `declared` 的口径差 21 个键 —— 没有任何单条轴会报这件事。
## 第 186 轮（2026-09-22）：给「缺锚」装上响声，并把 134 拆成三层

### 一、做了什么（产品代码 0 行，仪器多一道响声）

`declaredSlots()` 原先在找不到字面量时 **`return []`** —— 而「找不到字面量」正是 ④-4 删掉它那一轮的
**必然结果** ⇒ `declared` 134 → 0、报表写「✓ 已完成」。**那不是"完成"，是仪器失锚。**

本轮拆出纯函数内核 `declaredSlotsFrom(src)`：缺字面量 / 花括号不配平**一律抛错**；
`declaredSlots()` 在 `uiWindowRel()` 返回 null 时抛错并给出换锚指引。已核实
`migration-ledger.mjs` 里**没有**任何包住轴求值的 `try/catch`（只有 `loadBaseline` 的
`JSON.parse` 用了两处）⇒ 抛错会一路冒到 CLI，**响声是真的**。
`migration:selftest` **65/65**（新增：写法免疫的合成样本 + 两条缺锚自证）。

### 二、把 134 拆开：它不是一张表，是三层

| 层 | 数 | 是什么 |
| --- | ---: | --- |
| declared ∩ assigned | 112 | 有提供者 / 有实现的槽位 |
| **only-declared** | **22** | 只有字面量声明了它。其中 **21 个在 `UIEngine` 上有实现**（④-2c 退役镜像的残留），7 个被 store 引用（= `engineBacked`） |
| **only-assigned** | **20** | **字面量从未声明**、运行期才挂上的成员（`x` `scale` `scaleX` `scaleY` `matrix` `history` `inspectorTypeMap` `controlPointTexture` `display` …），其中 1 个（`x`）被 store 引用 |

⇒ ④-4 的契约应写成 **134 + 20 = 154 个成员**，其中 21 个是引擎实现。
**只照字面量写 facade 会漏掉那 20 个** —— 这正是"先量再动"的价值。

### 三、⚠️ 更正：第 185 轮那个「23 / 21」是错的，真值 **22 / 20**

第 185 轮我用**肉眼数**打印出来的名字列表得 23，并据此反推 21；本轮用 `.length` 得 **22 / 20**。
差 1 的原因就是手数。**这是本仓那条「数字必须由仪器给」的规矩又一次现场生效 —— 而这次不合格的
仪器产物，是我自己上一轮写的。** 已在 PHASE-1C 就地留更正。

### 四、教训

1. **给「归零」装响声，比给「增长」装警报更急**：所有轴的失败模式都是「瞎了却报好」，
   而仪器失锚当轮**一定**是往下走的（越瞎越像完成）。
2. **手数的数字看起来和机器数的一模一样**，没有任何迹象提示你去复核 —— 唯一防线是流程：
   **数字只从程序来，不从眼睛来**（包括我自己上一轮写下的）。
3. 第 185 轮那句「必须先换锚再动字面量」本轮落成了一条会炸的重载 —— **结论要变成代码才算数**。
## 第 187 轮（2026-09-22）：④-4 前置判据落地 —— 缺口 0，而「缺口」本身先被证伪了一次

### 一、做了什么

新增 `providedSlots()` / `declaredWithoutProvider()`（`scripts/lib/ui-slots.mjs`）：**只看提供者** ——
域成员对象 / 家族文件里的 `this.x =` / 嵌套挂载 / store 桥 / `UIEngine` 实现，
**完全不碰字面量**。判据 = `declaredSlots() − providedSlots()` =
「删掉字面量后，谁还会提供它」。

**实测：declared 134，缺口 0。** 134 个声明槽位**全部另有提供者** ⇒ 删字面量不会丢成员 ——
④-4 的前置条件**已满足**（这是本轮真正想要的结论）。self-test **66/66**：新增用例把
「缺口必须为 0」与「`providedSlots()` 不是 `declaredSlots()` 的同义反复」两条一起钉住。

### 二、缺口本身先被证伪了一次

首版 `providedSlots()` 只认 `^UIEngine\.`，于是报出 `controlPointActive`「没有家」。查下去：
它写在 `ui-engine.ts:258-259` 的 `this.controlPointActive = point` —— **有家，只是这个家以 `this`
为接收者**。补上引擎内的 `this.x =` 后，缺口从 1 归 0。

⇒ **「待办清单」里的每一条都可能是仪器造出来的**。缺口不为 0 时，第一个要怀疑的是探测器，
不是代码。第 183/186 轮记的是「轴报喜」，这次是「轴报忧」——**两个方向都会错，而报忧的更隐蔽，
因为你会照单去做。**

### 三、账

不变（17 轴持平：`declared` 134 / `assigned` 132）。`providedSlots()` = 159 是**上界**
（把 `UIEngine` 里不属于 UI 槽位的内部字段也算进来了）⇒ 用法是「缺口 = 0」，不是「159 有意义」。

### 四、教训

1. **一个数的方向决定它怎么骗你**：报喜的轴（归零）与报忧的轴（缺口）都会瞎；
   而报忧的轴瞎起来更危险 —— 它会让你**去做一件不需要做的事**。
2. **把「前置判据」做成函数而不是检查表**：检查表会被跳过，函数会被 self-test 钉住，
   而且它自己也要先证伪一次（本轮就是这么抓到那个虚假缺口的）。
## 第 188 轮（2026-09-22）：④-1b 是一次「删一行 → 370 个错」的实验，回退并量出边界

### 一、做了什么

`ui-facade.ts` 的存在说明 ④ 的类型底座早已铺好（`ui-facade-gaps` 已是 0），它文档里写明的下一步是
**④-1b：删掉 `UIShape` 的 `[k: string]: any`** —— 那才是契约开始干活的一刻。本轮把它**做成了实验**：
删掉 `ui-window.ts:67` 那一行，跑 `tsc`，数错，**然后把文件回退**。

### 二、结果：370 → 100

| 项 | 值 |
| --- | ---: |
| error 行数 | **370**（TS2339 359 / TS2551 8 / TS2352 2 / TS2353 1）|
| 去重待声明成员 | **100** = 字面量声明过的 **84** + **字面量没声明的运行期成员 16** |

那 16 个（`data` `state` `target` `zoom` `width` `height` `input` `mode` `display`
`controlPointTexture` `addNodeTo` `cancelSearch` `deleteNode` `expandToSelection`
`scrollToSelection` `update`）**只活在 store 桥与元素 API 里** ⇒ 「契约不能只照字面量写」这件事
**从第二条独立路径再次被证实**（第 186 轮那 20 个 only-assigned 是第一条）。

### 三、为什么回退

370 个错不可能在一轮里补完**并**通过全套验证。按本仓规矩：**宁可回退，不留半成品**
（第 152/154/161/163/174/180 轮都这么做）。回退后 `tsc` 0 错、工作树干净。

⇒ 本轮的交付物不是代码，是**边界**：④-1b 被证明是「删一行 → 逐条补 100 个声明」，
而那 100 个由 `tsc` 枚举，不由人猜。**一个可复跑的实验，比一份估计的排期有用。**

### 四、教训

1. **「纯类型改动 = 零风险」只对运行时成立**，对**工期**不成立：删一行能让 370 处红。
   类型层的「一行」可以是工程层的 100 个成员。
2. **实验本身是可以交付的**：本轮回退了全部改动，却拿到了 ④-1b 的真实边界。
   「做了什么」不等于「改了多少行」。
3. **两条独立路径同答一题，比一条路径答两次可信**：第 186 轮的 20 个与本周期的 16 个
   是两个口径、两次测量，指向同一结论。
## 第 189 轮（2026-09-22）：68 个「可派生」是假省力 —— 循环引用挡住，回退并记下三条路

### 一、测量：100 = 68 可派生 + 32 手写

用**正式仪器** `resolveMemberKeys`（解析 9 个域成员对象、共 82 个键）对照第 188 轮那 100 个待声明成员
⇒ **68 个可由域成员对象派生 + 32 个需手写**。

⚠️ 中途我先用**自己写的正则**量了一次，报 `uiListMembers(0)` —— 因为它是**简写键**
`{ listRename, … }`。仓库里已经有正式仪器的地方，**不要临时写一个**（第 186 轮的手数是同一类错）。

### 二、实验：派生不通（tsc 当场拒收）

`import type { uiMembers }` + `type UIDomainMembers = typeof uiMembers` +
`interface UIShape extends UIDomainMembers` ⇒ **5 个错**：

- `TS2456: Type alias 'UIDomainMembers' circularly references itself`
- `TS2310: Type 'UIShape' recursively references itself as a base type`
- `TS7022` ×3（`windowResize` / `uiEventsMembers` / `uiMembers` 类型退化为 any）

**原因**：域成员函数的签名里写着 `this: UIShape` ⇒ `typeof uiMembers` **依赖 `UIShape`**，
而 `UIShape` 又要 `extends` 它 ⇒ **成环**。⇒ 「由域成员对象派生」**不是省力，是不通**。

### 三、为什么这仍然是有价值的

连续三轮各自干掉了一条「看起来省力」的路：

| 轮 | 干掉的错判 |
| --- | --- |
| 188 | ④-1b 不是「删一行」，是「补 100 个声明」 |
| 189 | 那 100 个里「能派生的 68 个」**其实不能派生** |

⇒ 剩下的路是「**手写 100 个**」，而且它是**被两条独立的失败实验逼出来的**，不是拍脑袋选的。

### 四、教训

1. **「有现成类型」≠「能拿到那个类型」**：`typeof` 是免费的，但类型图成环时它拿不到。
2. **自己的临时仪器会瞎**（`uiListMembers(0)`）：仓库里已有正式仪器的地方，
   临时写一个等于自愿放弃那批已修的失明。
3. **回退不是失败**：本轮在动工之前，把「68 个可派生」这个**诱人的错误判断**挡掉了 ——
   如果直接开写，会在第 68 个成员上撞见循环引用，然后被迫推翻整份契约的设计。
## 第 190 轮（2026-09-22）：④-1b 的第二条路 —— extends facade 只差 10 处，而 10 处都是真分歧

### 一、实验（可逆，已回退）

`ui-facade.ts` 不 import 引擎任何东西 ⇒ 无环。让 `UIShape extends UIFacadeShape`：

| 实验 | `tsc` error |
| --- | ---: |
| 只删索引签名 | 370 |
| **只加 `extends`** | **10** |
| 两者都做 | **341** |

⇒ `extends` 消掉 29 个错，**剩下的 10 个是真分歧**。三类：① 可空性被打死（字面量的 `null` 占位
对不上非空声明，2 处）② `hover` 的 `HoverNode` vs `UINodeShape`（2 处）③ `pointerevent` 不在
`YamiElement` 上（3 处）；另 +1 TS2430、+1 可能为 null。

### 二、从 2 个编译错里「读」出一条设计规则

第 ① 类不是 10 个错之一，它是一条**规则**：**装配前以 `null` 起始的成员，契约必须允许 `null`。**
否则字面量**永远满足不了**契约 —— ④-4 写契约时每加一个"装配期填充"的成员都要过这条。

### 三、账

`tsc` 0 错（回退后）· 工作树干净 · 产品代码零改动。交付物：**10 处分歧的分类 + 1 条设计规则**。

### 四、教训

1. **「只差 10 处」比「370 处」更危险**：370 处一眼就知道不能硬推；10 处会诱人「顺手改完」——
   而这 10 处每一处都要先定「哪一边是对的」（设计决定），不是改写。
2. **实验的价值在于把「分歧」与「噪声」分开**：370 → 10（extends 消掉 29）说明剩下的是真分歧；
   如果只看 370，会以为全是缺声明。
3. **规则常常藏在编译错的形状里**：第 ① 类的两处错报的是「类型不匹配」，读出来的却是一条
   适用于**全部 134 个成员**的可空性规则。**别只修错，读错。**
## 第 191 轮（2026-09-22）：第一处可空性落地（341 → 339），外加契约文件的两个坑

### 一、落地

按第 190 轮分类，先修第 1 类（契约可空性）。第一处：

```diff
- renderingFunction: () => void;
+ renderingFunction: (() => void) | null;
```

**判据不是「我觉得」**：它的紧邻上一行就是同类成员的既有写法
`updateControlPoints: (() => void) | null;` —— **契约自己的惯例就是判据**（这就是第 190 轮
把 370 压到 10 之后才可能发生的事：目标小到能用既有惯例判定）。

**双向验证**：只改 facade ⇒ `tsc` 0 错；启实验（`extends` + 删索引签名）⇒ **341 → 339**。

### 二、两个坑（都当场回退了）

1. **按名字批量改契约 = 命中率 100%、正确率 0%。** 我用「名字 = `resize`」的正则改，
   命中的是 `UIControlPoints.resize` 而不是 `marquee.resize` —— **同名成员分处不同位置**，
   当场 24 个错。⇒ **改契约要用结构定位，不能用名字定位。**
2. **`() => void | null` ≠ `(() => void) | null`**：前者是「函数返回可为 null」，后者是「函数可为 null」。
   编译器不报错 ⇒ 这是纯类型世界里的一种**静默**。本仓对「静默」的敏感度一直很高，
   这条值得单列。

### 三、账

`tsc` 0 · `typecheck:vue` 0 new · `lint` 0/0 · `format:check` · 17 轴持平 · `selftest` 66/66 ·
实验读数 341 → 339。

### 四、教训

1. **收敛的标志不是找到捷径，而是找到一个「既有惯例就能判定」的最小改动。**
   前两轮各干掉一条省力路（那是在收敛），本轮第一次落地（那是收敛完成的信号）。
2. **把「0 错」和「消掉几个错」分开看**：`tsc` 0 只说明没弄坏；**341 → 339 才说明这行有用**。
   只报前者，等于用「没坏」冒充「有进展」。
## 第 192 轮（2026-09-22）：规模化路径探明 —— 100 个待声明成员里 75 个可机械提取

### 一、为什么这一轮换了目标

第 191 轮落地 1 处（341 → 339），是对的。但按那个粒度，339 个实验错误要几百轮 ——
**「1 处/轮」不是一条能完成的路。** 所以本轮不改代码，改问一个更根本的问题：
**这 100 个声明能不能批量生成？** 答案决定了后面几十轮该用什么粒度。

### 二、结果：75 可机械提取 / 25 需手写

| 形态 | 数 | 能否机械提取 |
| --- | ---: | --- |
| `const X = function (this: UIShape, …)` | **55** | **能**（丢 `this` 即可抬签名） |
| `const X = (…) => …` | 2 | 能 |
| 对象内成员 | 18 | 多半能，但须按**结构**定位 |
| 找不到 | **25** | 不能，需手写 |

25 个「找不到」的正是 **store 状态 / 元素 API / 引擎 API** —— 与第 186 轮（20 个 only-assigned）、
第 188 轮（16 个字面量外的待声明成员）指向**同一批成员**。三次独立测量，同一个答案。

### 三、教训

1. **在错误的粒度上勤奋，等于慢性的不做。** 第 191 轮那 1 处本身没错，但如果我没停下来问
   「这个粒度能否走完」，就会用几百轮换一个必然的失败。**先问粒度，再谈勤奋。**
2. **「难」不是均匀分布的**：100 个里 55 个有现成签名可抬、25 个才需要人想。
   **先量分布，再定粒度。**
3. **三次独立测量同答一题**之后，就可以把结论当事实用：④-4 的契约里**必须人写**的那部分，
   就是「没有域成员对象的那三个来源（store / 元素 API / 引擎 API）」。
## 第 193 轮（2026-09-22）：契约生成器落地 —— 76 条声明，靠类型检查器而不是正则

### 一、为什么正则不行

69 个成员全是 `const X = function (this: UIShape, …) {` —— **返回类型是推断的**，源码里没有可抬的注解。
正则实测生成 **0 条**。而答案一直在 `tsc` 手里：类型检查器本来就能把类型**打印成文本**。

### 二、四道工序 → 76 条

| 工序 | 来源 |
| --- | --- |
| 丢掉 `this: UIShape` 参数 | 第 189 轮成环的根源（76 条全带它） |
| null 起始的成员并上 `| null`（函数类型加括号） | 第 190/191 轮的设计规则 |
| 含 `UIShape` / `any` 的跳过 | 前者会成环；后者会涨 `any-hatches` 棘轮 |
| 清掉可选参数里冗余的 `| undefined` | lint 门禁 |

生成 **76 条**；`tsc` 0 错 · `lint` 0/0 · 17 轴持平（`legacy-ui-lines` 仍 300）· selftest 66/66。

### 三、下一步的账单（已量）

接线（`UIShape extends UIDomainMembers`）后仍有 **~47 个消费侧错误** ——
`registerWindowKeydown('ui', UI.keydown)` 这类**把可空成员当非空用**。
这正是第 190 轮那条设计规则的**下游账单**：允许 `null` 让字面量满足了契约，
但把「可能是 null」这件事**如实传给了每一个消费者**。

### 四、教训

1. **该换工具时就换工具**：三轮都在源码文本上想办法（抬签名、`typeof` 派生、`extends` facade），
   而工具（类型检查器）一直就在仓库里。**当正则反复做不到时，先问"谁本来就知道这件事"。**
2. **门禁会逼出更好的实现，而不是被绕过**：`require-array-sort-compare` 要 compare、
   冗余 `| undefined` 要清、`=> any` 不能进契约 —— 这三条各自改进了生成物。
3. **前几轮的"失败"是这一轮的地基**：成环那次告诉我必须丢 `this`，可空性那两次告诉我必须并 `| null`。
   **没有一个教训是浪费的** —— 只是要等一个把它们同时用上的机会。
## 第 194 轮（2026-09-22）：接线的正确写法与它的账单 —— 49 个消费侧错误

### 一、接线的正确写法（本轮实测出的一条）

**用模块增强，从非遗留文件并入**：

```ts
// ui-domain-contract.ts（非 legacy/）
declare module './legacy/ui-window.ts' {
	interface UIShape extends UIDomainMembers {}
}
```

为什么不是别种写法：

- 在 `ui-window.ts` 里写 `extends` ⇒ 要加 2 行，而 **`legacy-ui-lines` 是硬棘轮 300，加行即回归**；
- `interface UIShape extends import('../ui-domain-contract.ts').UIDomainMembers` ⇒ **TS2499**
  （interface 只能 extends 标识符/限定名）。内联 import 类型在 `extends` 里不合法。

⇒ **「不涨遗留层行数」这个约束，决定了接线必须发生在非遗留文件里。** 约束又一次当了设计者。

### 二、账单：49 个消费侧错误

| 码 | 数 | 含义 |
| --- | ---: | --- |
| TS2345 | 19 | 实参可能是 null |
| TS2769 | 18 | 无匹配重载（多为传可能为 null 的处理器） |
| TS2554 | 9 | 实参个数/可选性不匹配 |
| 零头 | 3 | TS2352 / TS2721 / TS2322 |

全部同族：**把「可能是 null」的成员当非空用**。

### 三、这一轮真正证明的事

第 190 轮那条规则（装配前以 null 起始的成员，契约必须允许 null）**不是免费的**：
它让字面量满足了契约，代价是**如实传给了每一个消费者**。
⇒ **规则没有消灭成本，它只是把成本从「运行期静默 undefined」挪到了「编译期 49 处显式确认」。**
这正是 ④ 想要的：**把静默变成响声**。

### 四、教训

1. **约束可以替你做设计**：因为「遗留层不能涨行」，接线只能走模块增强 —— 而模块增强本来就是更对的写法
   （契约留在新世界，遗留层只被增强、不被修改）。
2. **量出账单再动手**：49 处必须**一次做完**才算闭环，分 49 轮做毫无意义。
   ⇒ 这类"量已明确、改动机械但必须成批"的工作，**是下一轮的第一步，不是本轮的尾巴**。
3. **回退不是失败（第三次说这句话，但每次的原因不同）**：这次回退的是"接线"，
   留下的是"接线的方法 + 它的账单" —— 而这两样正是下一轮的全部前提。
## 第 195 轮（2026-09-22）：批量插 `!` 的第一版不收敛且写坏文件 —— 回退并记下 AST 判据

### 一、做了什么

49 处「可能为 null 被当非空用」必须**成批**做完（第 194 轮已定）。第一版用 TS API 取诊断的
`start/length`，在跨度末尾插 `!`，迭代到不动点。

### 二、结果：不收敛，且写坏文件

| 轮 | 目标错误 | 插入 |
| --- | ---: | ---: |
| 1 | 40 | 40 |
| 2 | 24 | 23 |
| 3–8 | 24 | 23（**原地打转**） |

根因：**诊断跨度不只在表达式上。** 字面量里 `X: null` 对上契约类型的 `TS2322`，跨度落在
**类型注解**上 ⇒ 脚本在类型尾部插 `!` ⇒ `TS17019: '!' at the end of a type is not valid TypeScript syntax`
（同一条报 7 次）+ `TS1255`。**在类型位置插 `!` 会让错误"变形"而不是消失** ⇒ 不收敛。

### 三、下一版的判据（已写进 PHASE-1C）

1. 插之前先用 AST 确认跨度是**表达式节点**（`ts.isExpression`）；
2. `TS2769`（无匹配重载）要**下钻到出问题的那个实参**，不是整个调用；
3. **收敛**是验收标准：错误数必须单调下降直到 0 —— 不收敛就回退，不硬凑。

### 四、账

已全部回退：`tsc` 0 错、工作树干净。第一版脚本**未保留**（它会写坏文件，留着是隐患）。

### 五、教训

1. **"机械的改动"里藏着"不机械的判断"**：49 处看着一模一样，但**该插在哪**需要知道
   "这个跨度是表达式还是类型" —— 那是 AST 的判断，不是字符串的判断。
2. **不收敛是一个信号，不是噪音**：第 2 轮后数字卡在 24 不动，那一刻就该停手回退，
   而不是把 8 轮跑完。**循环的上限救了我一次。**
3. **会写坏文件的脚本不要留在仓库里**：负面结果写进文档，工具本身销毁。
## 第 196 轮（2026-09-22）：批量插 `!` 的第二版 —— 判据对了，但只能吃掉 12 处

### 一、第二版换对了判据

第 195 轮的失败教训是「跨度不只在表达式上」。第二版改成**包含 + 可空性**：

1. 在诊断位置上取**最深的、类型可空的表达式节点**（`ts.isExpression` + 类型含 `null`/`undefined`）；
2. `TS2769` 另外**下钻到出问题的那个实参**；
3. **不收敛就退出**（退出码 2）—— 第 195 轮记下的第三条判据当场起了作用。

| 轮 | 目标错误 | 插入 |
| --- | ---: | ---: |
| 1 | 40 | 9 |
| 2 | 38 | 3 |
| 3 | 36 | **0 ⇒ 停** |

### 二、真正学到的东西：这 49 处**不是同一种活**

第二版在 36 处停住，判定「无可插入处」⇒ 剩下的**不是「在可空表达式后加 `!`」能解决的**：

| 族 | 规模 | 解法 |
| --- | ---: | --- |
| 纯可空性 | ≈12 | `!` 即可（脚本已能自动做完） |
| **签名分歧** | ≈36（含 9 个 `TS2554`） | 要先定「契约改还是调用改」—— **设计决定，不是断言** |

⇒ **把两族混在一起做，就会像第 195 轮那样把错误「变形」而不是消灭它。**

### 三、账

已回退：`tsc` 0 错、工作树干净。两版脚本都未保留 —— 第一版会写坏文件；
第二版虽正确，却会把「**该判断的**」当「**该断言的**」处理，留着同样危险。

### 四、教训

1. **正确性不等于适用性**：第二版的判据是对的（它没写坏任何东西），但它**只能解决一类问题**。
   工具对了 ≠ 问题被解决了 —— **要量它能吃掉多少**。
2. **"剩下的"通常换了性质**：前 12 个是「加 `!`」，后 36 个是「定对错」。
   同一份错误清单里混着两种活，是自动化最容易踩空的地方。
3. **停在 36 比停在 0 更有信息量**：它精确地告诉下一轮"机械部分到此为止"。
## 第 197 轮（2026-09-22）：机械路径终结于 12 处，并给出「贪心接线」的绿色落地方案

### 一、第四版：读数与第三版完全一致，但多给了一个信号

v4 加了「沿链下钻」（诊断位置常落在属性名上，可空的是子表达式）。结果 **40 → 38 → 36**，
第 3 轮**插入 0、跳过 0**。

**「插入 0 且跳过 0」这个组合才是关键**：36 处都找到了目标表达式，而它们**已经有 `!` 了**
⇒ **这些错误与"该处可空性"无关**。⇒ 不是「漏了断言」，而是「**断言了也没用**」：
契约签名与调用点的**类型分歧**（含 9 个 `TS2554`）。

**机械路径在此终结于 12 处。** 这条结论是三轮（195/196/197）一步步逼出来的，
而每一轮都留下了判据：跨度要在表达式上 → 要按可空性取节点 → 要能识别"已经断言过"。

### 二、下一轮的安全落地方案：贪心接线

不要在「全接线」与「不接线」之间二选一：

1. 把 `UIDomainMembers` 拆成**可增量的声明**；
2. **逐批**接进 `declare module` 增强，每批跑一次 `tsc`；
3. **只保留让全仓保持 0 错的成员**；会把消费者打红的**留在契约文件里但不接**，
   并注明「待定：需先定契约改还是调用改」；
4. 验收：`tsc` 0 + 17 轴持平 + 全套 2075 用例。

⇒ 预计可**立刻落地 60+ / 76 条成员**，并把真正需要人判断的名单精确剩下（≈16 条成员 + 9 个调用点）。

### 三、账

已回退（`tsc` 0 错、工作树干净）；v4 脚本未保留（与 v3 同因：会把「该判断的」当「该断言的」）。

### 四、教训

1. **"插入 0、跳过 0"比"插入 0、跳过 36"信息量大得多** —— 前者说「**不是这类问题**」，
   后者只说「这次没找到」。**给脚本区分「不该做」与「没做成」，是它能给出结论的前提。**
2. **终结于 12 处是一种结果，不是失败**：三轮把 49 拆成了「12 可机械 + 36 需判断」，
   而 36 这个数字是**可执行的清单**（下一步按它分类即可），不是一句「很难」。
3. **当"全有/全无"都不通时，找可增量的中间态**：贪心接线把"能不能自动化"换成了
   "分批落地 + 明确待定清单" —— **这是本轮唯一真正的新想法**。
## 第 198 轮（2026-09-22）：贪心接线落地（32 接 / 40 待定），以及一次「假绿」的教训

### 一、方法：用 `Pick` 把「接了」与「待定」分开

「全接线」48 处错、「不接线」零进展 ⇒ 走中间态：增强里写
`interface UIShape extends Pick<UIDomainMembers, …> {}`，**未接的成员留在契约文件里**，
待定名单写在增强块上方 —— 下一个人一眼能看到欠了什么。
循环（逐批接入 → 跑诊断 → 把打红的挪进待定）固化在 `scripts/oneoff/wire-contract-members.mjs`。

**结果**：`tsc` 0 · `typecheck:vue` 0 新错 · `lint` 0/0 · 17 轴持平 · selftest 66/66；
**接线 32 条 / 待定 40 条**。这是 ④-4 上线以来**第一个既真实又绿色的接线增量**。

### 二、⚠️ 贪心循环的第一次「绿」是假的

循环的 oracle 是 **TS API + `tsconfig.strict.json`（只有 `.ts`）**，而门禁里还有 **`vue-tsc`（含 `.vue`）**
⇒ 循环报「收敛」，`vue-tsc` 报 **4 处**新错（`LayoutPanel.vue` 的 `UI?.listSelect?.(event)` 等）。
把那 4 个成员（`listSelect` `listRecord` `listPopup` `listOpen`）并入待定后才真绿。

⇒ **判据的视野必须与门禁的视野一致。** 「0 错」的真实含义是「0 错**在我的视野里**」——
**一个比门禁窄的 oracle 只会稳定地产出假绿**（本仓记过多次"仪器瞎了却报好"，这是一次**新变种**：
不是仪器瞎，而是**仪器看得太少**）。

### 三、账

32 接 / 40 待定 · `tsc` 0 · `vue-tsc` 0 · `lint` 0/0 · 17 轴持平 · selftest 66/66。

### 四、教训

1. **「全有/全无」都不通时，找可增量的中间态**（第 197 轮的想法，本轮落地）。
   中间态的关键不是"少接一点"，而是**把待定的部分显式留在原处并写明**。
2. **假绿的新变种：视野窄**。以往是「正则匹配不到」（瞎），这次是「oracle 只扫了一半文件类型」（窄）。
   **两种都表现为绿，但修法完全不同**：前者改口径，后者**对齐视野**。
3. **待定名单本身就是交付物**：40 条的名单（写在契约文件里）比"接线完成"这句话更有用 ——
   它把「还剩什么」变成了可执行的东西。
## 第 200 轮（2026-09-22）：接线 32 → 57 —— 定向断言、一个尾逗号 bug、以及把教训写进仪器

### 一、归因表先行（第 197 轮定的规矩：分类之前不动手）

新只读仪器 `classify-deferred-members.mjs`：临时「全接线」跑诊断，把每条错误**归到成员**上，
打印「成员 → 错误数 + 样例」。48 条错误、29 个成员，一眼看出最大族是
**「可空处理器被当非空用」**（`on(this.page, 'resize', this.windowResize)` 这类）。

### 二、两步收掉

| 步 | 做法 | 效果 |
| --- | --- | --- |
| 1 | **定向**插 `!`（**已知成员名** ⇒ 直接在 `this.<name>`/`UI.<name>` 后插） | 30 处，目标错误 37 → 7 |
| 2 | 修生成器正则：**允许多字面量末条没有尾逗号** | 契约 76 → 77，接线 **32 → 63** |
| 3 | 新脚本 `defer-vue-breaking-members.mjs`：按 `.vue` 错误再挪成员进待定 | 挪 6 条 ⇒ **接线 57** |

**第 2 步最值得记**：字面量最后一条 `createShortcut: null` 没有尾逗号，而生成器认占位的正则要求
`:\s*null\s*,` ⇒ 它没被当占位 ⇒ 契约给的是非空类型 ⇒ 整个字面量的 `as UIShape` 转换报 TS2352。
**一个字符的正则盲点挡住了 31 个成员** —— 而它只在「全接线」时才显形（部分接线时被 `Pick` 挡在外面）。

### 三、第 198 轮的教训变成了代码

第 198 轮记的是「判据的视野必须与门禁的视野一致」。本轮把它**写进了仪器**：
`.ts` oracle 收敛之后，再用 `typecheck:vue` 的输出做**第二阶段**，把 `.vue` 里打红的成员一并挪进待定。
⇒ **教训停留在文字里，下一轮就会重犯；写进脚本，它才会反复生效。**

### 四、账

**接线 57 / 待定 20**；`tsc` 0 · `vue-tsc` 0 新错 · `lint` 0/0 · 17 轴持平 · selftest 66/66。
待定 20 条主要两族：**TS2554（调用侧多传实参）**与**事件类型比契约更宽**。

### 五、教训

1. **知道"是谁"之后，自动化才可靠**：通用脚本（195–197 轮）三轮没成，定向脚本（知道成员名）
   一次收掉 30 处。**归因表 == 让自动化重新可行的前置条件。**
2. **最容易被忽略的是"最后一条"**：没有尾逗号的末条、没有换行符的末行、边界上的最后一个 case ——
   正则与解析器在这三处反复翻车。**写到"最后一条"时，专门为它跑一遍。**
3. **教训要变成代码**：`defer-vue-breaking-members.mjs` 的存在，让第 198 轮的教训从此**自动生效**。
## 第 201 轮（2026-09-22）：接线 57 → 62 —— 契约描述「调用方怎么调它」

### 一、问题与做法

`.vue` 里写 `UI?.listSelect?.(event)`（`event: Event`），契约却写具体事件类 ⇒ **形参比调用方窄**。
给生成器加**显式覆盖表**（`EVENT_WIDE`），只把**形参**放开成 `Event`：

```js
if (EVENT_WIDE.has(prop.name)) s = s.replace(/(\([^)]*?): [A-Za-z_$][\w$]*/, '$1: Event');
```

**为什么诚实**：这些调用点**今天就在传 `Event`**（过去靠索引签名蒙过去）。契约写 `Event`
是把**已经发生的事**写下来，不是放松要求；实现的形参类型不受契约影响。
⇒ **契约描述的是「调用方怎么调它」，不是「实现最精确能收什么」。**

### 二、上一轮的仪器本轮自己生效了

`.ts` 侧收敛到 63 接 / 14 待定后，**`.vue` 第二阶段自动**再挪 1 条（`zoomFocus`）
⇒ **接线 62 / 待定 15**。我没有手工去找 `.vue` 的问题 —— 是第 200 轮写进脚本的教训
（`.ts` oracle 视野窄）**自己把活干了**。

⇒ **教训写进脚本之后，它从"记住的事"变成"干活的东西"。** 这是本轮最值得记的一条。

### 三、账

**62 接 / 15 待定** · `tsc` 0 · `vue-tsc` 0 新错 · `lint` 0/0 · 17 轴持平 · selftest 66/66。

待定 15 条：`copy create createPrefab createShortcut delete duplicate hasPrefab loadFromConfig
paste revealTarget save saveToConfig screenBlur toggle zoomFocus`。

### 四、教训

1. **契约的口径问题，答案常在调用侧**：不是"实现能收什么"，而是"**谁在怎么调它**"。
   拿实现的最精确类型当契约，会把调用方的既成事实判成错误。
2. **工具化过的教训会复利**：第 198 轮记的教训 → 第 200 轮写成脚本 → 第 201 轮**它自己发现了
   一个我没看的地方**（`zoomFocus`）。三轮干同一件事，成本递减。
3. **待定列表在"缩"，而不只是在"变"**：20 → 15，每一步都伴随 `tsc`/`vue-tsc` 双双 0 错 ——
   这是"能落地的进度"，不是"改了很多行"。
## 第 202 轮（2026-09-22）：接线 62 → 64 —— TS2554 不是参数问题，是接收者问题

### 一、症状与病

待定里 `copy delete duplicate toggle paste` 报 `TS2554: Expected 0 arguments, but got 1`，
看着像"调用侧多传了实参"。**那是症状**：`ui-list.ts:28` 写着 `this: UIShape`，
而注册点是 `on(list, 'keydown', this.listKeydown)` ⇒ 运行期 `this` 是**元素**（手法库第 45 条）
⇒ `this.copy/this.delete/this.data` 全是**元素自己的 API**，`item` 本来就该传。

修法**一行**：

```diff
- const listKeydown = function (this: UIShape, event: KeyboardEvent) {
+ const listKeydown = function (this: YamiElement, event: KeyboardEvent) {
```

⇒ `tsc` 0，且那一族**当场可接线**：`.ts` 侧 **65 接 / 8 待定**，`.vue` 阶段再挪 1 条（`zoomFocus`）
⇒ **接线 64 / 待定 9**。

### 二、第 173 轮的笔记，本轮兑现

第 173 轮（`ui-list` 搬声明那轮）只是把"这里的 `this` 标注是错的"**记了下来**，
当时不能改（改注解要连带处理多域）。**三十轮后，它变成了修复** ——
而那 11 个成员（`copy/delete/duplicate/toggle/paste/…`）一直卡在一个错误的注解上。

⇒ **笔记的价值不在当时，在它被兑现的那一刻**；前提是它写清楚到"下次能直接用"。

### 三、账

**64 接 / 9 待定** · `tsc` 0 · `vue-tsc` 0 新错 · `lint` 0/0 · 17 轴持平 · selftest 66/66。

待定 9 条：`create createShortcut hasPrefab loadFromConfig revealTarget save saveToConfig
screenBlur zoomFocus`。

### 四、教训

1. **错误码描述的是"症状发生在哪"，不是"病在哪"**：`TS2554`（实参个数）真实病因是"接收者是谁"。
   **按症状修（删掉实参）会把元素 API 的调用改坏** —— 这类"改了对、改了也错"的地方，
   正确动作是先问"这个 `this` 应该是谁"。
2. **一行注解解锁 11 个成员**：卡住进度的常常不是难题，而是**一处错误的标注**。
   而它之所以是错的，是因为**同一段代码里两种接收者并存**（第 173 轮已定性）。
3. **先把症状归类，再找病因**：第 199 轮的归因表把 `TS2554` 单独列了出来，
   否则它会被当成"参数多传"混进断言族里一起糊过去。
## 第 203 轮（2026-09-22）：接线 64 → 70 —— 最后 9 条按「错误形状」分流

### 一、形状决定修法（不需要逐个想）

| 形状 | 成员 | 修法 |
| --- | --- | --- |
| 可空值交给非空形参 | `create` `createShortcut` `save` | 调用侧补 `!`（3 处） |
| 实现里形参**未被使用**、调用侧零参调用 | `screenBlur` | 生成器加 `OPTIONAL_FIRST`，放开为可选 |
| **真·形状分歧** | `revealTarget` `hasPrefab` `saveToConfig` `loadFromConfig` | 留待定（需判"契约改还是调用改"） |

⇒ **接线 70 / 待定 6**（含 `.vue` 阶段挪走的 `zoomFocus`）。

### 二、`screenBlur` 暴露的一条规则

实现写的是 `_event`（**有意不用**），契约却把它当**必填** ⇒ **契约比现实更严**。
⇒ **实现不用的形参，不该在契约里是必填的。** 这条以后写契约时可以直接照用。

### 三、这轮的账

**70 接 / 6 待定** · `tsc` 0 · `vue-tsc` 0 新错 · `lint` 0/0 · 17 轴持平 · selftest 66/66。

### 四、还剩什么

待定 6 条：`createPrefab hasPrefab loadFromConfig revealTarget saveToConfig zoomFocus` ——
**每一处都是真·形状分歧**（调用方传的形状与契约要求的是两个不同形状）。
这是 ④-4 剩下**唯一**需要人判断的部分；其余全部可以机械收敛。

### 五、教训

1. **"逐个想"往往是"没先看形状"**：把 9 条按错误形状一摊，4 条立刻有了机械修法（2 类形状），
   只有 4 条真的要判断。**归因表 → 形状表 → 分流**，这个顺序把工作量压到了最小。
2. **契约比现实更严也是一种错**：`_event` 这种"有意不用的形参"被写成必填，会让调用方
   被迫给一个没人要的参数。**契约的松紧要与实现一致，两个方向都算。**
3. **待定表在收敛**：20 → 15 → 9 → 6，且每一步 `tsc`/`vue-tsc` 双 0 —— 进度是"能落地的"，
   不是"改了很多行"。
## 第 204 轮（2026-09-22）：接线 70 → 72，并修掉仪器的一次误归因

### 一、收掉的两条

| 成员 | 依据 | 修法 |
| --- | --- | --- |
| `zoomFocus` | 实现写 `_event`（有意不用） | 与 `screenBlur` 同族 ⇒ `OPTIONAL_FIRST` 再收一个 |
| `createPrefab` | —— | 随上面变绿，自动接线 |

### 二、陷阱：删"多余实参"要确认它没承担别的作用

`revealTarget` 的实现确实收 0 个参数，`ui-list.ts` 两处调用传了会被忽略的实参。
我按"去掉多余实参"改掉后，**`event` 在 `listOpen` 里成了未使用参数（TS6133）** ——
因为那处 `event.value` 是 `event` 在该函数里的**唯一用途**。⇒ **已还原**，`revealTarget` 继续待定。

**教训：删掉一个"多余"的实参前，先确认它没有顺带承担别的作用。**

### 三、⚠️ 仪器误归因（本轮真正的新发现）

还原之后，`.vue` 阶段把 **`ui-list.ts` 的 `TS6133`** 归到成员 `listOpen` 上并挪进了待定 ——
因为 **`vue-tsc` 的输出里也包含 `.ts` 的错误**，而那个脚本按"文件里出现的成员名"归因。
修法：**defer 脚本只处理 `.vue` 的命中**。

⇒ 「视野」教训再深一层：

| 轮 | 视野问题的方向 |
| --- | --- |
| 198 | oracle 比门禁**窄**（只看 `.ts`） ⇒ 假绿 |
| 200 | 把该教训写成第二阶段脚本 |
| **204** | **门禁的输出比该阶段负责的范围宽**（`.vue` 工具也报 `.ts`）⇒ 误归因、把好成员挪走 |

**两个方向都会让脚本去做它不该做的事。**

### 四、账

**接线 72 / 待定 4** · `tsc` 0 · `vue-tsc` 0 新错 · `lint` 0/0 · 17 轴持平 · selftest 66/66。
待定 4 条：`hasPrefab loadFromConfig revealTarget saveToConfig`。
## 第 205 轮（2026-09-22）：接线 72 → 73 —— 实现的签名就是权威

### 一、`revealTarget` 怎么收的

它的实现写的是 `(this: UIShape)` —— **自己声明收 0 个参数** ⇒ 两处调用传的实参本来就是**惰性**的。
上一轮我只做了"去掉实参"一半，导致 `event` 成了未使用参数（TS6133）而回退。
本轮把两件事一起做：去掉惰性实参 + 把参数按本仓惯例写成 `_event` ⇒ `tsc` 0、接线成功。

**通用判据（本仓"接收者/签名"类教训的第 4 条）**：
**实现的签名是权威** —— 调用侧多传的实参是死代码，去掉它不改行为；
但去掉前要确认它没有顺带承担别的作用（第 204 轮的 `event.value` 就是反例：
它同时是那个函数里 `event` 的唯一用途）。

### 二、账

**接线 73 / 待定 3** · `tsc` 0 · `vue-tsc` 0 新错 · `lint` 0/0 · 17 轴持平 · selftest 66/66。

### 三、最后 3 条（实测线索已入档）

- **`hasPrefab`**：实现真正需要的是 **`node.presetId`**（`ui-slots.ts:64`）；
  调用侧是 `LayoutPanel.vue:1725` 与 `PresetElement.vue:90`（后者经 store 转发）。
  ⇒ 要判 `node` 那侧给的形状（`PrefabRefShape`）到底有没有 `presetId`。
- **`saveToConfig` / `loadFromConfig`**：契约 `{ colors: Record<string, string> }`
  vs 调用侧 `Record<string, unknown>` ⇒ **颜色值的类型两侧不一致**。
  ⚠️ 已抓到的调用点属于**别的单例**（`Animation` / `Layout`），**同名不等于同一个方法** ——
  这一条本身就是个陷阱：拿别的单例的同名方法当证据会得出完全错误的结论。

### 四、教训

1. **惰性的实参也是代码**：它不产生行为，却产生**约束**（这里是"用掉一个参数"）。
   删它是对的，但要连它承担的那点副作用一起处理。
2. **同名方法不等于同一个方法**：`Animation.saveToConfig` / `Layout.saveToConfig` / `UI.saveToConfig`
   是三个不同的东西。**检索调用点时，必须把"接收者是谁"一起看**——这与第 202/205 轮
   "接收者问题"是同一条主线的第三次现形。
