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

**写行为测试时的三个坑（2026-10 实测）**

1. **「卸载时调了 `removeEventListener`」不等于「挂载真的发生过」。** 收口到 `useEventListener`
   之后，卸载是**无条件**摘除的，于是「拖拽中卸载」这类用例恒绿、其实什么也没测。
   判据：**「如果我让挂载永远不发生，这条用例会红吗？」** 不会红的就是**假绿**
   （本仓实测翻出过两条）。行为用例应断言**相对基线**的变化，而不是绝对次数。
2. **`mount` 不带 `attachTo` 时，事件不会冒泡到 `window`。** 组件树挂在游离容器里，到不了
   `document`。凡验证「监听挂在 `window` 上」的用例，必须
   `mount(…, { attachTo: document.body })`，否则表现为「处理器根本没跑」。
3. **jsdom 没实现 `document.execCommand`。** 走它的路径（如 `deleteInputContent()`）要打桩；
   **打桩后别断言「内容被清空」**（没东西真的删了），改断言 `stopPropagation` /
   `stopImmediatePropagation` 的可观测效果（冒泡是否被拦下）。

> 另：`toHaveBeenCalledWith` 比对的是**完整实参表**。`useEventListener` 内部是
> `removeEventListener(type, handler, native)`，`native` 未传时实参是**三个**（第三个
> `undefined`），只写两个实参的断言会莫名失败。

**编辑器版本只有一个真源：`packages/editor/package.json` 的 `version`**

改动版本号时**只改这一处**，其余都是派生：

- `src/services/updater/updater.ts` 的 `latestEditorVersion` 直接 import 它（不再有字面量）；
- 该值会被写进用户 `config.json`（迁移纪元，见 `services/project/version.ts`）与
  运行期 packmeta 的 `Editor`（生产写 `src/module/packmeta.json`、dev 写
  `packages/editor/packmeta.json`，见下），并显示在首页"当前编辑器版本"；
- electron-builder 用它命名安装包；发布时由 tag 覆盖（见下节）。

守卫：`src/services/updater/__tests__/version.spec.ts` 会**从磁盘独立读** package.json
并与 `latestEditorVersion` 比对 —— 若有人把字面量写回去，版本一涨就会红。

> `latestProjectVersion`（1.0.147）是**项目数据 schema 的纪元**，与编辑器版本无关，仍是字面量。
> `CommunityVersion`（`26072501`）同理，是社区版纪元。

**两个同名 `packmeta.json` 是**同一段代码的两个写回目标** —— 差在运行模式，别只当成重复副本**

`src/module/constants.ts` 在模块加载期把 `Editor`/`Project`/`Community` 覆写进去并落盘，
落盘路径由 `moduleDir` 决定：

```ts
const moduleUrl = new URL(import.meta.url);
const moduleDir = moduleUrl.protocol === 'file:' ? Path.dirname(fileURLToPath(moduleUrl)) : './';
```

- **生产/打包**：`import.meta.url` 是 `file:` ⇒ 写 `packages/editor/src/module/packmeta.json`；
- **`pnpm dev`（Vite dev server）**：`import.meta.url` 是 `http:` ⇒ `moduleDir = './'`，
  于是写到**当前工作目录** = `packages/editor/packmeta.json`。

所以这两个文件都会被运行期覆盖成**单行 JSON**，都在 `.oxfmtrc.json` 的 `ignorePatterns` 里
（漏掉任何一个，跑一次 dev / 测试就会把 `format:check` 顶红，而红的原因与改动无关）。
提交前若看到它们变脏，`git checkout --` 掉，不要提交被刷新的版本号。

注意 `format:check` 的扫描面只有 `packages/editor` + `packages/ui-kit`，`scripts/**` 不在其中 ——
所以 `scripts/oneoff/declare-data-fields.mjs` 单独跑 `oxfmt --check` 虽会红，但不影响 CI。

**发布（已自动化）**：`.github/workflows/release.yml`

- **怎么发**：推一个 `v*` tag —— `git tag v1.2.3 && git push origin v1.2.3`。
  也可以在 Actions 页面手动 dispatch，填一个**已经推送过**的 tag。
  tag 带连字符（如 `v1.2.3-beta.1`）会自动标记为 prerelease。
- **打什么**：四腿矩阵 `win-x64` / `mac-x64` / `mac-arm64` / `linux-x64`，分别跑
  `packages/editor` 的 `build:winexe` / `build:macexe` / `build:macArmexe` / `build:linuxexe`
  （每条 = `build:all && electron-builder <target>`，配置内联在 `packages/editor/package.json`
  的 `build` 字段；产物落 `packages/editor/build/`）。
- **版本号由 tag 驱动**：打包前 `scripts/release-sync-version.mjs` 把 tag 的 semver 写进
  `packages/editor/package.json`（**只在 CI 工作区生效，不提交**）。
  因为那个 `version` 是编辑器版本的唯一真源，安装包命名、界面显示、用户
  `config.json` 的迁移纪元都会跟着对齐 —— 不覆盖的话安装包会一直叫 `… 1.0.18.exe`。
- **发到哪**：产物先 `upload-artifact`，再由单个 `release` job 用 `gh release create`
  发到 **workflow 所在的仓库**（`${{ github.repository }}`）。
  **刻意不用 `electron-builder --publish`**：`package.json` 的 `repository` 指向
  `yami-pro/yami-rpg-editor`，与实际跑 workflow 的仓库不一定相同，
  用它发布可能打到别处去。
- **签名**：目前**不签名**（仓库里没有证书 secret）。mac 侧显式
  `CSC_IDENTITY_AUTO_DISCOVERY: 'false'`，win 侧 electron-builder 自己会
  `no signing info identified, signing is skipped`。将来要签名，配 `CSC_LINK` /
  `CSC_KEY_PASSWORD`（mac+win）与 `APPLE_ID` / `APPLE_APP_SPECIFIC_PASSWORD` /
  `APPLE_TEAM_ID`，**workflow 结构不用改**。
- **已知噪音**：`extraResources` 里有一条 `node_modules/@typescript/typescript-win32-x64`，
  本仓没装（它是 `typescript@7` 的可选依赖，`main/services/tsc.ts` 已有回退链）。
  打包时会打印 `file source doesn't exist` 但**不中断**（实测 `--dir --win` exit=0）。
  想去掉这条噪音就删那两行 —— 但先确认 tsgo 路径是否还要它。

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
├── .github/workflows/       # ci.yml（门禁 / 测试 / 构建）+ release.yml（tag 触发打安装包并发 Release）
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
