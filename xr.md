# Yami RPG Editor —— 项目介绍 · 技术栈

> 本文只写两件事：**项目介绍**与**技术栈**。
> 迁移阶段清单、逐轮沿革与遗留债清单已按收尾流程删除 —— 需要原文看 `git log -- xr.md`。
> 度量与门禁的**单一真源永远是脚本本身**（`pnpm migration:ledger`），本文里的版本号只是快照。

---

## 一、项目介绍

### 1.1 这是什么

**Yami RPG Editor** —— Electron 桌面端的 RPG 编辑器（游戏《Yami RPG》的配套工具）。
以「场景 / 界面 / 动画 / 粒子 / 调色板」为中心的 2D 游戏数据编辑器，附带工程管理与导出。

渲染进程原先是一套**无框架**架构：手写 HTML 片段（200+ partial）+ 43 个 CustomElements +
`export const X = { … }` 的单例对象字面量 + 挂在 `window` 上的自定义事件总线 + 大量全局原型扩展。
2026-08 起做了彻底的框架迁移，现在是 **Vue 3 + Pinia** 的单页多面板应用（页面切换由布局管理器
控制，不引入 vue-router）；上面那些旧结构已全部拆除，其中 `src/legacy/`（486 文件 / 9.7 万行）
整体平移到 `src/` 的分层里。

### 1.2 分层模型

```
Vue 视图层（SFC + <template>）            ← 200+ HTML partial 1:1 迁入
Pinia stores（响应式状态 + actions）       ← 状态唯一真源
Composables（可复用逻辑）
Services（无状态 IO / IPC / 文件系统 / project）
引擎层 engine/**（WebGL / Canvas / 布局 / 场景 / 粒子 / 调色板）  ← 只认数据，不认单例
ui-kit（独立包的通用 / 业务组件）
```

### 1.3 工作区（pnpm monorepo）

| 包                         | 作用                                                                     |
| -------------------------- | ------------------------------------------------------------------------ |
| `packages/editor`          | 编辑器应用（Electron 主进程 + 渲染进程），主产物（`2D Game Editor`）      |
| `packages/ui-kit`          | 跨项目通用组件库（纯 Vue 契约，CSS Module + design tokens）               |
| `packages/template-arpg`   | ARPG TS 游戏项目模板（多语言）                                            |
| `packages/export-electron` | Player 应用壳子包（electron-vite），游戏部署 / 导出用                     |
| `packages/script`          | 脚本骨架模板                                                             |

```
yami-rpg-editor/                        # 仓库根（工作区 monorepo）
├── packages/
│   ├── editor/
│   │   ├── main/                       # Electron 主进程：main / preload / ipc-handlers /
│   │   │                               #   window-manager / window-registry / apk / log
│   │   ├── src/                        # 渲染进程源码
│   │   │   ├── main.ts / App.vue / AppShell.vue
│   │   │   ├── main/                   # 单例编排：initialize / startup / register / editor-hooks
│   │   │   ├── stores/                 # Pinia stores（状态真源）
│   │   │   ├── components/             # 面板 / 弹窗 / inspector 页面族 SFC
│   │   │   ├── composables/            # 可复用逻辑（useXxxPage / useXxxWindow / 命令 schema）
│   │   │   ├── engine/                 # 引擎域：webgl / layout / ui / scene / particle / palette
│   │   │   ├── services/               # 无状态 IO / IPC / 文件系统 / project
│   │   │   ├── inspector/ tools/ commands/ scene/ animation/ particle/ palette/ file/
│   │   │   ├── i18n/ localize/         # vue-i18n 唯一真源 + 兼容层
│   │   │   └── utils/ types/ constants/ events/ module/ directives/ plugin/
│   │   ├── Project/                    # 运行期资源：index.html / css / jsons / Templates / global.d.ts
│   │   ├── vite/plugins/               # 构建插件（静态资源拷贝 / dev middleware / monaco 懒加载修复）
│   │   └── dist/ dist-electron/        # 构建产物
│   ├── ui-kit/                         # components/{basic,business} + composables / styles / theme / utils
│   └── template-arpg/  export-electron/  script/
├── scripts/                            # 门禁与一次性工具（migration-ledger / dom-guard / text-integrity / docs-check …）
└── .github/workflows/ci.yml            # CI：门禁 / 测试 / 构建 三个 job
```

---

## 二、技术栈

### 2.1 一览（2026-09-26 实测解析版本）

| 层       | 选型                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------- |
| 构建     | Vite 8.3.0（+ Rolldown）、`@vitejs/plugin-vue` 6.0.9、`vite-plugin-electron`、`vite-plugin-vue-devtools` |
| 语言     | TypeScript 6.0.3（catalog；`strict: true` 全开）                                                     |
| 规范     | oxlint 1.83.0 + oxfmt 0.60.0，另有 `oxlint-tsgolint` 与 `vue-tsc` 3.3.11 增量门禁（`typecheck:vue`）  |
| 宿主     | Electron 43.2.0（catalog），`nodeIntegration: true`、`contextIsolation: false`                        |
| 框架     | Vue 3.6.0-rc.9 + Pinia 4.0.3                                                                        |
| 测试     | vitest 4.1.11 + jsdom 30.1.0 + `@vue/test-utils` 2.5.1                                               |
| 编辑器内核 | monaco-editor 0.55.1（按需动态 import，不进主包）                                                     |
| 国际化   | vue-i18n 11.4.12（唯一真源 + 兼容层 `Local.get/createGetter/getLabel`）                               |

> 版本口径以 `package.json` / `catalog` 与实际解析结果为准；上表是一次实测快照，不是承诺。

### 2.2 技术选型

| 层                  | 选型                                   | 理由                                                                 |
| ------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| 视图框架            | Vue 3                                  | 模板语法最接近既有 HTML partial；单文件组件即页面/面板               |
| 状态管理            | Pinia                                  | 单例对象 → store 的自然映射；devtools 友好                            |
| 构建工具            | Vite 8                                 | Vue 插件 + Electron 双入口 + 分包懒加载                              |
| 语言                | TypeScript                             | 全量 strict；`tsc` 与 `vue-tsc` 两道门禁                              |
| 路由                | **不引入 vue-router**                  | 编辑器是单页多面板应用，页面切换由布局管理器控制                       |
| Electron 集成       | `vite-plugin-electron`                 | 主进程/渲染进程单一构建配置                                          |
| 渲染进程裸说明符    | 仓库内插件 `electron-renderer-resolve` | 把 `electron` / `node:fs` 等桥接到 `window.__nodeRequire`，不再依赖第三方 renderer 插件 |
| 组件库              | `@yami/ui-kit`（工作区包）             | 纯 Vue 契约（`defineModel` + props/emits）；编辑器经 alias 直接引源码 |
| **alias**           | **`@app`（非 `@vue`）**                | 避免与 `@vue/runtime-dom` 包子路径冲突                                |

### 2.3 依赖（`packages/editor`）

```
dependencies:
  vue / pinia / vue-i18n / monaco-editor        # 框架 · 国际化 · 编辑器内核
  axios / koa / fs-extra / mime-types           # 网络 · 内置 web server · 文件系统
  exceljs / xml2js / yauzl / archiver           # 表格 · 工程数据 · 压缩包
  markdown-it / qrcode / sharp / uglify-js      # 文档渲染 · 二维码 · 图像 · 压缩
  steamworks.js                                 # 平台集成
devDependencies:
  vite / @vitejs/plugin-vue / vue-tsc / vitest / jsdom / @vue/test-utils
  electron / vite-plugin-electron / electron-builder
  oxlint / oxlint-tsgolint / oxfmt
```

### 2.4 常用命令

| 想知道什么                                             | 跑什么                                                          |
| ------------------------------------------------------ | --------------------------------------------------------------- |
| 跨轴迁移总账（唯一真源；`--check` 是 CI 棘轮门禁）      | `pnpm migration:ledger` · `pnpm migration:check`                |
| 类型 / 规范 / 格式                                     | `pnpm typecheck` · `pnpm lint` · `pnpm format:check`             |
| 测试                                                   | `pnpm -F @yami/editor test` · `pnpm -F @yami/ui-kit test`        |
| 文本污染 / 文档一致性 / 事件面                          | `pnpm text:check` · `pnpm docs:check` · `pnpm events:surface`     |
| 开发 / 构建                                            | `pnpm dev` · `pnpm build:vite`                                   |

详细的门禁清单与 CI 定义见 `scripts/` 与 `.github/workflows/ci.yml`，协作约定见 [CONTRIBUTING.md](./CONTRIBUTING.md)。
