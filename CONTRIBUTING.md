# 贡献指南

首先，感谢您对 [yami-rpg-editor 社区版](https://github.com/Open-Yami-Community/yami-rpg-editor) 的贡献！

## 贡献方式

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 将您的改动记录提交到远程仓库 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 开发规范

本仓库是 **pnpm workspace monorepo**（Phase 8 起）。根目录只做脚本转发与工程配置，代码在 `packages/` 下。

```shell
pnpm install      # 安装（lockfile 已入库，CI 用 --frozen-lockfile）
pnpm dev          # 开发（Vite dev server + Electron）
pnpm start:prod   # 先构建再以生产模式启动
```

**改动放哪里**

- 编辑器功能 → `packages/editor/src`（Vue 3 + Pinia + TS）
- 通用组件 / 元素 API → `packages/ui-kit/src`（`components/basic` 与 `components/business`）
- 游戏模板与运行时 → `packages/template-arpg`
- 迁移台账与门禁脚本 → `scripts/`

**样式**

- 组件样式写在组件自己的 `<style module>` 里；ui-kit 里需要全局类名兜底时用 `:global(:where(…))`（特异性归零，编辑器 CSS 永远胜出）。
- 编辑器全局样式放 `packages/editor/Project/css/` 下对应的模块文件；`packages/editor/Project/index.css` 是**手动维护**的入口（`@import` 聚合 ui-kit 与 `Project/css/`），新增模块后必须在此补上 `@import`。
- 配色必须同时支持**亮色**与**暗色**：优先用 design token（ui-kit 的 `--ym-*`；编辑器 `Project/css/` 里已有变量），不要写死颜色值。

**注释**

- 只在**需要**的地方注释；不要每行或每几行一个注释。
- 本仓的注释文化是**记「为什么」**：为什么必须这么写、为什么不能用那种写法、哪次实测踩过什么坑。不要写「我改过这里」这类过程路标 —— 阶段代号（`P1b` / `M4` / `第 N 轮`）一旦所在文件被搬运就会变成**错误坐标**。
- `pnpm text:check` 会拦下「注释被写坏」的形态（控制字符吃字、代码被吞进 `//` 注释、整段注释被复制进自己）。这类污染**语法合法**，`tsc` / `oxlint` 都看不见。

**多语言**

社区版维护 `中文` 与 `english` 两个版本：改动涉及文案时，请同时确认 `packages/template-arpg/languages/zh-CN`、`packages/template-arpg/languages/en-US` 与编辑器语言包都正确。

**模板资源**

改动了 `packages/template-arpg` 下的模板内容后，需要 `pnpm pack:resources` 重新打包资源再提交。

**提交前必跑**（与 CI 一致；`editor` 测试请**独占**跑，与 ui-kit 测试并发会把 `template-localized.spec.ts` 逼成超时红）

```shell
pnpm run migration:selftest          # 门禁口径自证（应全绿）
pnpm run migration:check             # 迁移台账棘轮：任一轴上升即红
pnpm run text:check                  # 文本污染（控制字符 / 注释被写坏）
pnpm run docs:check                  # 文档里写的包脚本 / 链接 / node 脚本引用真实存在
pnpm run format:check                # oxfmt（editor + ui-kit，与 lint 同口径）
pnpm run lint                        # oxlint（一个包都不漏：editor + ui-kit + scripts）
pnpm -F @yami/editor typecheck       # tsc strict
pnpm -F @yami/editor typecheck:vue   # vue-tsc 增量棘轮
pnpm -F @yami/ui-kit build:types     # 组件库 .vue 的类型门禁
pnpm -F @yami/ui-kit test
pnpm -F @yami/editor test            # 独占跑
pnpm run build:vite
```

> **本地跑 editor 测试时的一个坑（2026-09-21 实测）**：`electron` 的 `index.js` 在**被 require 时**
> 会检查 `dist/` 里的二进制，缺失就**当场下载**；本机若下不到 `electron@43.2.0`（镜像/网络受限），
> 任何**间接 import 了 `electron`** 的 spec 都会以
> `Error: Electron failed to install correctly` **整文件**失败（表现为「137 个文件 0 用例」，很容易
> 被误读成代码坏了）。它是**环境问题**，与改动无关。绕过办法（不下载、不改代码）：
>
> ```shell
> # 让 electron 直接返回一个路径、不再尝试下载（内容不会被用到 —— 测试里 electron 全被 window.yami 垫掉）
> $env:ELECTRON_OVERRIDE_DIST_PATH = "$env:LOCALAPPDATA\electron\Cache"   # PowerShell
> pnpm -F @yami/editor test
> ```
>
> **另一个「别把它当成自己弄坏的」现象**：跑完测试/typecheck 后，
> `packages/editor/src/module/packmeta.json` 在 `git status` 里变成已修改。这不是幻觉 ——
> `src/module/constants.ts` 在**模块加载期**就会把 `Editor` / `Project` / `Community` 版本号
> 写回这个文件（`JSON.stringify(PackMeta)`，单行形态）。所以：
>
> - 它是**运行期自有**的数据文件，**已在 `.oxfmtrc.json` 的 `ignorePatterns` 里豁免格式化** ——
>   否则「跑一次测试」就会把 `format:check` 这条件禁弄红，而红的原因与任何人的改动无关；
> - 提交前请 `git checkout -- packages/editor/src/module/packmeta.json`，
>   不要把它（连带被刷新的版本号）顺手提交进去。
>
> **`.md` 为什么也不在 `format:check` 的扫描面里**：`oxfmt` 会把 Markdown **围栏里的代码**
> 按本项目的 TS 配置一起格式化 —— 实测它把 `PHASE-1C-TEST-PREREQ.md` 里一段**专门演示
> 「只留单次断言、保留尾逗号」**的样例的尾逗号删掉了。文档是本项目的**记忆**（尤其那份
> 三千多行的沿革记录：代码片段是证据，不是待格式化的源码），所以 `ignorePatterns` 里加了
> `**/*.md`。写文档时仍请遵循既有排版，只是这条门禁不替你做决定。
>
> 判定「是不是这两个坑」的方法：**同一个 spec 在 `git stash` 前后都失败** ⇒ 与你的改动无关。

**迁移进度的唯一数字真源**是 `pnpm migration:ledger`（跨轴总账 + 棘轮），基线在 `scripts/migration-ledger-baseline.json`。任何文档里的数字都可能过时，以脚本输出为准。

## 目录详解

```
yami-rpg-editor/
├── packages/
│   ├── editor/              # @yami/editor 编辑器
│   │   ├── src/             #   渲染进程（Vue 3 + Pinia + TS）
│   │   ├── main/            #   Electron 主进程（main.ts / preload.ts / apk.ts / IPC / services）
│   │   ├── Project/         #   运行期资源：Locales 多语言 / Fonts / Images / css + index.css / commands.json / default.json / global.d.ts / Templates
│   │   ├── index.html       #   渲染页面（手写，含 electron 等模块的 importmap 垫片）
│   │   ├── vite/plugins/    #   构建插件（静态资源拷贝、dev middleware、electron 解析、monaco 懒加载修复）
│   │   └── extension/       #   外部 Browser 插件目录（运行时扫描）
│   ├── ui-kit/              # @yami/ui-kit 通用组件库（components/basic + business、theme tokens、playground）
│   ├── template-arpg/       # 游戏模板（runtime 运行时 + languages/{zh-CN,en-US}）
│   ├── export-electron/     # @yami/export-electron 播放器壳子（游戏部署依赖）
│   └── script/              # 游戏侧脚本模板
├── scripts/                 # 迁移台账、门禁与一次性工具（见下）
├── .github/workflows/       # CI（门禁 / 测试 / 构建三个 job）
└── xr.md                    # 重构方案与阶段记录（唯一的总路线图）
```

**`scripts/` 里哪些是门禁（会进 CI，别乱改口径）**

| 脚本                       | 作用                                                                       |
| -------------------------- | -------------------------------------------------------------------------- |
| `migration-ledger.mjs`     | 跨轴迁移总账 + 棘轮（**数字真源**，基线 `migration-ledger-baseline.json`） |
| `lib/self-test.mjs`        | 台账口径自证（零依赖、零子进程；新增口径必须先在这里塞「故意写错」的样本） |
| `check-text-integrity.mjs` | 文本污染门禁（口径 `lib/text-integrity.mjs`）                              |
| `docs-check.mjs`           | 文档一致性（文档里的包脚本 / 相对链接 / `node scripts/x` 引用必须存在）    |
| `dom-guard.mjs`            | DOM 迁移矩阵（人读明细，落盘 `dom-migration-tracker.md`，属生成物）        |
| `event-surface.mjs`        | 事件面报表（自定义事件、单侧事件、内联匿名监听）                           |
| `global-types-audit.mjs`   | `global.d.ts` 全局类型增强审计（接口块应为 0）                             |
| `stale-exemptions.mjs`     | 陈旧豁免注释（应为 0）                                                     |
| `i18n-skip-list.mjs`       | 生成 `src/localize/template-localized.ts`（生成物，勿手改）                |

其余（`any-hatch-*`、`null-cast-*`、`lazy-slot-*`、`audit-ui-slots`、`element-registry-migrate`、`element-ref-annotate`、`smoke-layout`）是**一次性 codemod / 探针**，任务已完成，只在需要复现当时的做法时参考。
