# 贡献指南

首先，感谢您对 [yami-rpg-editor 社区版](https://github.com/Open-Yami-Community/yami-rpg-editor) 的贡献！

## 贡献方式

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 将您的改动记录提交到远程仓库 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 开发规范

本仓库是 **pnpm workspace monorepo**。根目录只做脚本转发与工程配置，代码在 `packages/` 下。

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
- 本仓的注释文化是**记「纯函数」**：不要写为什么必须这么写、为什么不能用那种写法、哪次实测踩过什么坑。不要写「我改过这里」这类过程路标 —— 阶段代号（`P1b` / `M4` / `第 N 轮`）一旦所在文件被搬运就会变成**错误坐标**。
- `pnpm text:check` 会拦下「注释被写坏」的形态（控制字符吃字、代码被吞进 `//` 注释、整段注释被复制进自己）。这类污染**语法合法**，`tsc` / `oxlint` 都看不见。

**多语言**

社区版维护 `中文` 与 `english` 两个版本：改动涉及文案时，请同时确认 `packages/template-arpg/languages/zh-CN`、`packages/template-arpg/languages/en-US` 与编辑器语言包都正确。

编辑器语言包按组件命名空间拆分（每种语言两份数据）：

- `Project/Locales/<lang>.<alias>.json`：入口，放 `properties` 与**不能延迟到完整加载**的组件键（`[confirm]` 这类不在 `template-localized.ts` 里的静态本地化键）；
- `Project/Locales/<lang>/components.<ns>.json`：组件文案分片。`ns` = 组件 id 的第一个 `-` 前段（`setList-operand` → `setList`）。加载语言时并行读入口 + 全部分片、在内存里**一次合并**，运行期不再 `mergeLocaleMessage`（逐片 merge 会让所有 `t()` 消费者重渲染，250+ 窗口时直接卡死渲染进程；分片收益在文件布局与 diff，不在运行期懒加载）。

新增/修改文案时，键写进对应 `components.<ns>.json`（入口键才写入口文件）；`pnpm run i18n:guard` 会把**入口 + 全部分片**聚合成每种语言的 key 集合再比对，并校验分片文件名与内部 id 的命名空间一致、id 不重复。需要从旧单文件语言包重新拆分时跑 `node scripts/oneoff/i18n-split-locales.mjs`（加 `--check` 只校验不写盘）。

**元素契约迁移：控件从「元素 API」到组件 `defineExpose`**

现状（2026-11-04 实测；**数字真源是脚本，不是本文**）：

```shell
node scripts/contract-inventory.mjs                                  # 还挂着 registryRef 的窗口 / 控件 id / 谁在读它们
node scripts/oneoff/report-blocked-by-consumer.mjs                   # 按「卡住多少窗口」给消费方文件排序（决定先动谁）
node scripts/oneoff/triage-registry-windows.mjs <窗口…>               # 这些窗口挂的注册表，别处有没有**动态**读
node scripts/oneoff/audit-migrated-controls.mjs <迁过的 .vue…>        # 迁后回查：还有别的文件按 id 读它吗
node scripts/oneoff/audit-expose-vs-attach.mjs                       # 包装组件的 defineExpose 是否覆盖 attachElementApi
node scripts/oneoff/wire-command-bridges.mjs <窗口> <bridgeId> "<spec>" --apply   # 生成桥模块并给窗口接线
```

- 104 个 `.vue` 仍用 `registryRef(...)`（560 个控件 id），其中 **96 个**「有全局消费方或 schema 按 id 动态读」；
- 台账三轴：`element-registry-lookups` 775 / 175 文件、`yami-element-refs` 508 / 96、`element-api-attach` 114；
- 74 个 `attachElementApi` 组件里 47 个的 `defineExpose` **不全**（多为 inspector 页的 `sync` / `update` / `form`）：迁到实例之前必须补齐，否则调用点在运行期静默变 `undefined`。

**存量是碎片化的，不存在「再迁一批就清零」**：119 个消费方文件里最重的那个也只卡 5 个窗口（`report-blocked-by-consumer.mjs` 的输出）。所以一批的粒度应该是**一个消费方 + 它卡住的 1–5 个窗口**，而不是一个目录。

三类消费方，三种收尾方式：

- **单例只要窗口根元素上的一个能力**（如 `update-log-window.ts` 对 `update-log` 的 `closed` 监听、`deploy-project-window.ts` 对 `deployment-warning` 的写文案）→ 这一步**根本不需要桥**：能力搬回窗口自己（`@closed` / `defineExpose`），单例把这段代码删掉；
- **单例要驱动窗口内的一批控件**（命令 schema、`useProjectSettingsWindow`、`element-page.ts`）→ 走路径 2 的桥，把「控件级能力」一次性交给单例；
- **装配本来就是窗口自己的配置**（文本捕获族的候选项 / 隐藏行关系 / 变量名补全）→ 搬进窗口的 `onMounted`，单例只留 `open` / `confirm`；这类最干净，连桥都不用。



**目标契约**：控件 = 组件实例，能力来自 `defineExpose`；控件寻址不再经过 `ElementRegistry`。按消费方分三条路径，**不要混用**：

1. **窗口内部**：`composables/control-refs.ts` 的 `useControlRefs<Id>()` —— `:ref="controlRef('x')"` 收实例，`controls['x']?.loadItems?.(…)` 调用。`Id` 是字面量联合，**拼错在 tsc / vue-tsc 就红**（注册表时代拼错只在运行期静默 no-op）。确实需要 DOM 的少数站点用 `controlRoot(controls['x'])` 取根元素；**不要**为了省事把表存成裸元素 —— 那样 `element-api-attach` 永远不会降。
2. **非 Vue 单例（命令 schema / 老 window 模块）**：模块桥 `composables/form-bridge.ts` 的 `createFormBridge<Api>(id)`。表单用 `setForm`/`getForm`，**控件级能力**（`loadItems` 等）也走这条桥 —— 单例不再知道任何控件 id（样板：`change-actor-equipment-bridge.ts`、`set-animation-component-bridge.ts`）。
3. **跨窗口共享助手**：按 key 建表的桥（`preset-getter-bridge.ts`），助手只认 key。

阶段与判据：

| 阶段 | 内容 | 完成判据 |
| --- | --- | --- |
| P1 契约类型 + 接缝 | `control-refs.ts`（唯一接缝）、桥工厂 | 窗口内不再出现「元素上挂方法」的调用形状 |
| P2 批次迁移 | 一批一个面板家族：`.vue` 改 `useControlRefs`、单例改桥 | 该批 `registryRef` / `*Els.get` 归零；typecheck + **vue-tsc** + 相关 spec + `pnpm e2e` 全绿 |
| P3 包装层收尾 | 补齐 `defineExpose` 后，删掉元素消费方已归零的包装组件的 `attachElementApi` | `element-api-attach` 按包装组件逐个下降 |
| P4 拆除 | 删 `attachApi` / `markApiAttached` / `ElementRegistry` / `registryRef` / `registryElement` / `YamiElement` | 三轴归零，引擎层不再出现注册表 |

批次顺序（按消费密度）：命令窗口族 → tools → inspector 页族 → scene / animation / palette 引擎域（最后，风险最高）。命令窗口族里「无全局消费方」的窗口已迁完；剩下的卡在 schema 按 id 读控件，按路径 2 逐个接桥。

反模式（都踩过）：

- **双写**（既 `registryRef` 又模板 ref）：之后无法判断谁在驱动控件；确需过渡时只镜像**被单例读的那一个** id，并在注释里写明是过渡（见 `commands/Return.vue`）；
- **读写分裂**（read 走 ref、write 仍走注册表）：懒挂载时序上必然翻车；
- **一次性全仓替换**：每批必须能被单测 + 真机 E2E 自证；
- **把 ref 表存成裸元素**：只是把查找搬出注册表，元素 API 还在，`element-api-attach` 不降；
- **每个窗口复制一份 ref 表助手**：44 份副本已经漂移过一次口径，接缝只能有一份；
- ⚠️ **只认字面量 id 的清单会假绿**：`useProjectSettingsWindow.ts` 用 `el(id)`（变量）读控件，`contract-inventory` 看不见，迁移后测试直接 `undefined.bind` 崩；同理 `titleEls.get(...)` 这类**别的注册表**的读也是消费方（早期只认 `composableEls`，把 45 个窗口误判成 clean）。动手前先跑 `triage-registry-windows.mjs` 看动态读；
- ⚠️ **登记侧不上台账**：`registryRef` 窗口数只出现在清单里，`element-registry-lookups` 只数**读**。一批只改登记侧时轴不会降，别以为白干了，也别用轴没降当「没成效」的证据；
- ⚠️ **改 `.vue` 的类型必须过 `typecheck:vue`**：`tsc` 对 `.vue` 是假绿（15 个 `clear(el)` 站点就是 vue-tsc 抓到的）；
- ⚠️ **`relate()` 的 `targets` 仍是 DOM 语义**（`select-box-core` 读写 `element.style` 与兄弟标签），必须传 `controlRoot(...)`；这是 P3 之前拆不掉 `attachElementApi` 的主要原因；
- ⚠️ **`write2()` 在新列表里找不到旧值时会把第一项当默认值写进去**：只在「原来就有选中值」时回写，否则会变成替用户选一个（`SetAnimationComponent` 那条单测就是这么红的）；
- ⚠️ **默认写路径是拼出来的 id**：`useCommandSchema` 的 `load` 用 `${name}-${field}` 去注册表取元素，所以非 `skipWrite` 的命令窗口必须先传 `controls: () => 控件表` 才迁得动（`WebSocketSend` 是第一个这么迁的）；
- ⚠️ **清的 import 要按 specifier 摘，不要整行删**：`import { Selection, textCaptureEls }` 同行时，整行删会把还被用到的 `Selection` 一起删掉 —— 而 `Selection` 正好是 DOM 全局类名，删完不报「找不到名字」，只报一串 `Property 'xxx' does not exist` 的怪错（文本捕获族四个窗口踩过）。


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

其余（`any-hatch-*`、`null-cast-*`、`lazy-slot-*`、`audit-ui-slots`、`element-registry-migrate`、`element-ref-annotate`、`smoke-layout`）是**一次性 codemod / 探针**，任务已完成，只在需要复现当时的做法时参考。元素契约迁移的四个工具（`control-refs-codemod`、`audit-migrated-controls`、`audit-expose-vs-attach`、`fix-relate-targets`）放在 `scripts/oneoff/`，用法见上文「元素契约迁移」一节。
