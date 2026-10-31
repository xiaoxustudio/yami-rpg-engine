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

编辑器语言包按组件命名空间拆分（每种语言两份数据）：

- `Project/Locales/<lang>.<alias>.json`：入口，放 `properties` 与**不能延迟到完整加载**的组件键（`[confirm]` 这类不在 `template-localized.ts` 里的静态本地化键）；
- `Project/Locales/<lang>/components.<ns>.json`：组件文案分片。`ns` = 组件 id 的第一个 `-` 前段（`setList-operand` → `setList`）。加载语言时并行读入口 + 全部分片、在内存里**一次合并**，运行期不再 `mergeLocaleMessage`（逐片 merge 会让所有 `t()` 消费者重渲染，250+ 窗口时直接卡死渲染进程；分片收益在文件布局与 diff，不在运行期懒加载）。

新增/修改文案时，键写进对应 `components.<ns>.json`（入口键才写入口文件）；`pnpm run i18n:guard` 会把**入口 + 全部分片**聚合成每种语言的 key 集合再比对，并校验分片文件名与内部 id 的命名空间一致、id 不重复。需要从旧单文件语言包重新拆分时跑 `node scripts/oneoff/i18n-split-locales.mjs`（加 `--check` 只校验不写盘）。

**动态 key 只能靠运行期观测**（`src/i18n/missing-keys.ts`）

`t('components.' + id + '.placeholder')` 这类拼接 key 静态门禁看不见（前缀以 `.` 结尾，自动跳过），拼错不会报错，`t()` 直接把 key 原样显示在界面上。所以 i18n 实例上挂了一个 `missing` 钩子，把受管命名空间（`components.` / `properties.`）的缺失记进 `window.__I18N_MISSING__`，`pnpm e2e` 在黄金路径跑完后**断言它为空**。

两条口径，别改错方向：

- **只记 `components.` / `properties.`**：`command.*` / `common.*` / `confirmation.*` 这些并不在编辑器语言包里 —— 它们由**工程模板**在运行期注入，算成"缺失"会制造几百条假阳性；
- 语言包就位之前首页已经在渲染，期间的 miss 是启动顺序使然，加载完成后会**清空一次**再开始计数（否则每次启动都会固定带一批假红）。

> 2026-10-30 这条观测第一次跑就抓到两类真缺口：`*.placeholder` 从来没进消息表（`convert.ts` 只导出 title/label/tip/content），以及无独立 tip 的选项 key（`options.x.tip`）——界面上的表现是占位符/tooltip 直接显示 `components.block-note.placeholder`。修完 179 → 0。

**模板资源**

改动了 `packages/template-arpg` 下的模板内容后，需要 `pnpm pack:resources` 重新打包资源再提交。

**提交前必跑**（与 CI 一致；`editor` 测试请**独占**跑，与 ui-kit 测试并发会把 `template-localized.spec.ts` 逼成超时红）

```shell
pnpm run migration:selftest          # 门禁口径自证（应全绿）
pnpm run migration:check             # 迁移台账棘轮：任一轴上升即红
pnpm run text:check                  # 文本污染（控制字符 / 注释被写坏）
pnpm run window:guard                # 懒挂载窗口 open 后写控件（应为 0）
pnpm run i18n:guard                  # components./properties. 静态 key 在所有语言里都存在
pnpm run docs:check                  # 文档里写的包脚本 / 链接 / node 脚本引用真实存在
node scripts/workflows-check.mjs     # .github/workflows 里的 pnpm 脚本名 / scripts 路径存在
pnpm run format:check                # oxfmt（editor + ui-kit，与 lint 同口径）
pnpm run lint                        # oxlint（一个包都不漏：editor + ui-kit + scripts）
pnpm -F @yami/editor typecheck       # tsc strict
pnpm -F @yami/editor typecheck:vue   # vue-tsc 增量棘轮
pnpm -F @yami/ui-kit build:types     # 组件库 .vue 的类型门禁
pnpm -F @yami/ui-kit test
pnpm -F @yami/editor test            # 独占跑
pnpm run build:vite
```

CI 里 editor 全量测试按 `vitest --shard` 切 **3 片并行**（分片由 vitest 按文件分配，无需维护清单）。
本地想快速验证某一片：

```shell
pnpm -F @yami/editor exec vitest run --shard=1/3
```

**端到端（真机 E2E）：独立 workflow，不进 `ci.yml` 必跑门禁**

本机与 CI 都没有 `@playwright/test` 与浏览器二进制，**不要**把 Playwright 加进来（装不上会把整条流水线拖红）。真机这条路由 `scripts/e2e/` 承担：只用 `pnpm install` 自带的 Electron + CDP，零额外依赖。

```shell
pnpm e2e            # 先 build:vite，再起真机跑黄金路径（约 15-60s）
pnpm e2e:fast       # 复用现有 dist/，本地迭代用
pnpm e2e:selftest   # 自测：故意给一个打不开的工程，断言这条门禁会红
```

它跑的是「装得起来≠跑得起来」那一段：主进程起来 → 首页渲染 → 打开工程切到 directory 工作区 → 编辑器域就绪 → 十个**懒挂载**工具窗口首次打开且控件已接线（含元素契约密集的 `variableGetter` / `if-condition`），并对已迁完表单桥的窗口逐个走 `setForm → getForm` 往返（当前 6 个） → 运行时无缺失文案 key → 启动时间线有界 → 页面无未捕获异常。失败现场（截图 / 页面 HTML / 主进程日志）落在 `scripts/e2e/.artifacts/`（已 gitignore），CI 失败时作为 artifact 上传。

**启动预算**按比例而不按绝对值：`scripts/e2e/boot-baseline.json` 记录一台参照机的 `__BOOT_MARKS__`，默认只拦 **×5** 以上的退化（同一份代码在不同机器差 3-5 倍是常态，卡绝对值必然假红），能抓的是同步阻塞、重复初始化、懒加载失效这类数量级问题。换机型后用 `pnpm e2e --write-boot-baseline` 重写基线并提交。

约定：

- 它在 `.github/workflows/e2e.yml` 里跑（`workflow_dispatch` + 相关路径的 PR），**不是** `ci.yml` 的必跑门禁；
- 崩溃 / 接线 / 窗口内重复 id 这类回归仍由 `src/tools/__tests__/deferred-window-smoke.spec.ts` 的 jsdom 冒烟兜底 —— 真机 E2E 是它的补充，不是替代（jsdom 快且稳，真机慢但真实）；
- `scripts/e2e/fixture/` 是**最小可打开工程**（约 300KB，只有 Data/*.json，没有 Assets 实体）。模板数据 schema（`latestProjectVersion`）变更时同步更新它 —— 四处版本（updater 常量 / template-arpg `yami.projectVersion` / `packmeta.Project` / fixture `game.yamirpg`）由 `pnpm e2e:fixture-check` 守着，`pnpm e2e` 起步也会先跑它，漂移时直接一行报错；
- 截图对比等视觉回归仍按老做法：有网络环境再补成独立 job，不进必跑门禁。

**覆盖率：目录级行覆盖率的「只许降」棘轮**

```shell
pnpm coverage           # 两个包各跑一次 vitest --coverage（产物 <pkg>/coverage/）
pnpm coverage:check     # 台账判定（读已有产物，秒级）
pnpm coverage:baseline  # 把当前数字写回 scripts/coverage-baseline.json（基线只许降）
pnpm coverage:selftest  # 门禁自证：持平判绿 / 下降判红 / 新目录判红
```

口径（实现见 `scripts/coverage-ledger.mjs`）：按目录加权**行**覆盖率（不是"文件 pct 求平均"，那样会被大量 0 行小文件稀释）；容差 0.2pp；**新出现的目录必须先入基线**，否则判红 —— 这条挡的是"新建目录天生没测试、混进来把总数稀释掉"。`scripts/coverage-baseline.json` 是唯一真源，改它请单独提交。

⚠️ **它不进 PR 必跑门禁**：v8 插桩把这套 jsdom 组件测试从约 5 分钟拉到约 20 分钟（2026-10-30 实测），PR 门禁扛不住。它跑在独立的 `.github/workflows/coverage.yml`（每天一次 + 手动触发）—— 日线棘轮照样拦得住"悄悄变红"，且不会让每个 PR 多等 20 分钟。改了公共代码（`src/stores`、`src/engine`、`main`）建议本地至少跑一次 `pnpm coverage:gate`。

**已知边界：哪些「看起来像债」其实是有意为之**

改到这里之前先看这一节，别把设计前提当成疏忽"顺手修掉"：

1. **进程模型是刻意放宽的。** `packages/editor/main/window-manager.ts` 用 `nodeIntegration: true` / `contextIsolation: false` / `sandbox: false`。编辑器是本地工程工具、渲染进程不加载远程页面，且 `main.ts` 对 `window.open` / `will-navigate` / 权限请求一律拒绝（`setWindowOpenHandler` / `will-navigate` / `setPermissionRequestHandler` 全为 deny/false）。收紧成 `contextIsolation: true` 意味着把 `window.__nodeRequire` 的使用面整体收敛进 preload 白名单，是一次跨渲染层的迁移，不是顺手改。**只要新增任何"加载远程内容"的能力（远程 URL、iframe、可编辑 HTML 预览），这条前提就失效了，必须重新评估。**
2. **播放器窗口跑的是用户工程自己的 `index.html`**，工程脚本天然拥有完整 Node 权限。这是"本地工具打开本地工程"的设计前提；如果哪天要跑不受信工程，这里是第一道口子。
3. **`dom-*` 系列里大部分是"不增"而不是"归零"**（`dom-style-writes` 300、`dom-class-state` 342、`dom-measure-reads` 154…）。canvas / 布局引擎只能测量、只能写样式，把它们清零既不现实也没收益。真正该归零的是台账里 `target=zero` 的那批（`element-registry-lookups`、`yami-element-refs`、`element-api-attach`、`element-custom-events`），见下一节的批次推进。
4. **自动更新只支持 Windows**：`packages/editor/main/updater.ts` 首行对非 `win32` 直接 return；README 已声明"目前只构建了 Windows 版本"。要支持 macOS，除了去掉这个 guard，还需要签名 + 公证 + 发布渠道策略 —— 那是发布工程，不是代码修补。

**迁移台账的批次推进（注册表寻址等「归零」轴）**

`element-registry-lookups`、`yami-element-refs` 这类轴的终态是 0，但存量分散在数百个文件里，只能按批下降：

- 每批只挑**同构、能靠 typecheck / 单测自证**的站点。例：同一个 store 里反复查同一批控件 → 首次打开时一次性绑定成字段（`stores/search-string.ts` 就是这种批次）；
- 批次改完跑 `pnpm migration:check` 看目标轴是否下降，再用 `pnpm migration:baseline` 写回新数字。基线**只许降**：别为了让 check 变绿把不相关的轴一起抬上去；
- 提交信息里写「轴名：旧值 → 新值」，下一批用 `node scripts/migration-ledger.mjs --axis <轴>` 的明细挑下一个大头。

**别把「计数下降」当成「迁移完成」** —— 这条轴最容易自欺：

- `element-registry-lookups` 数的是 `*Els.get(...)` / `registryElement(s)` 的**寻址点**。给 `fieldEls` 包一层 memoize、或把 `fieldEls.get(id)` 换成 `el(id)`，计数会掉，耦合一点没少 —— 那不是迁移，是改数字。
- 真正的终态是「元素契约消失」：控件由 `props` / `emits` + 模板 ref 提供，组件不再从全局注册表按 id 取裸元素。所以一批的验收标准应该是**该文件的注册表依赖被删掉**（`yami-element-refs`、`element-api-attach` 同批下降），而不是只有 `element-registry-lookups` 掉了几十。
- 实测头部存量（2026-10-30，`--axis element-registry-lookups`）：`composables/useIfConditionFields.ts` 72 次寻址但只涉及 **42 个不同控件**、`useSetNumberOperandFields.ts` 56 次、`useSetStringFields.ts` 44 次 —— 这三个都是「一个 setup 函数里把同一批控件反复取」，适合作为下一批：把 `Map<id, control>` 换成调用方解析一次的强类型字段表，composable 变成纯函数（可单测），寻址点随之从 composable 里消失。
- 数量级的现实：这支轴还有 1337 处 / 301 个文件。按月排批次、每批一个面板家族，比追求一次性归零可靠；不要为了「看起来在做迁移」去动 `engine/**` 里那些被 canvas 直接驱动的站点。
- **已落第一批（2026-10-30）**：`composables/useVariableGetterWindow.ts` 33 → 20。做法是「同一次装配里每个控件只寻址一次」——`preset-key` 原来在 6 个 case 里各取一遍、`confirmCore` 里 `getFocus(...)` 7 个分支各寻址一次，现在各自只有一处。同批把真机 E2E 扩到 `variableGetter` / `variableGetter2` / `if-condition`（40 个控件）——**先有兜底再动契约**，否则「注册表依赖删掉了」只能靠肉眼确认。
- **已落第二批（2026-10-30）**：`composables/useIfConditionFields.ts` 72 → 0、`components/tools/IfCondition.vue` 2 → 0 —— 控件表从 `Map<string, FieldControl>` 换成普通对象入参 `IfConditionFieldMap`，composable 不再知道寻址方式，组件用模板 ref 直接按 id 落表；同批补了 4 条单测（缺控件早退 / 11 种类型灌入 / 隐藏行关系分组 / 本地化选项落位），它现在是可单测的纯装配函数。`element-registry-lookups` 1475 → 1394。
- **已落第三批（2026-10-30）**：`composables/useSetNumberOperandFields.ts` 51 → 0、`components/tools/SetNumberOperand.vue` 同批改为控件表入参；补 4 条单测（缺控件早退 / 6 种运算符 / 隐藏行关系挂在 operand-type 上 / 根元素挂 open·closed 钩子），真机 E2E 同时把 `setNumber-operand`（42 控件）纳入。`element-registry-lookups` 1394 → 1337。

**元素 API 挂载（`attachElementApi`）怎么安全拆掉 —— 三步必须成套**

`attachElementApi(el, { setForm, getForm })`（`IfCondition.vue` / `SetNumberOperand.vue` 等）**不是死代码**：对应的 schema（`useIfConditionSchema.ts`、`useNumberOperandSchema.ts`）就是通过 `registryElement(composableEls, '<id>')?.setForm` 把值灌进窗口的，删了窗口就打不开表单。真机 E2E 的契约往返也曾经只认这条 DOM 桥。

所以收尾不是「把 attach 删掉」，而是一次**配套替换**，缺一不可：

1. 用模块级强类型桥（`provideXxxBridge(api)` / `getXxxBridge()`）取代 DOM 属性挂载；
2. 把 schema 里的 `registryElement(...)?.setForm` 改为读该模块；
3. 给 E2E 一条等价驱动通道：`utils/debug-bridges.ts` 在 `--debug-mode` 下把同一份桥登记到 `window.__YAMI_BRIDGES__`（生产构建不创建该属性）。

只做 1、2 会让上门禁失去表单级验证，只做 3 等于给测试开后门。

> **已落样板（2026-10-30）**：`if-condition` / `setNumber-operand` / `exportLanguage` / `scene-shift` / `lightGetter` / `objectGetter` 六个窗口已完成成套替换（`variableGetter2` 的元素桥无任何消费方，直接删除） —— `composables/{if-condition,set-number-operand}-bridge.ts` + `utils/debug-bridges.ts`，两个 `.vue` 不再 `attachElementApi`，对应 schema 改读 `getXxxBridge()`，E2E 改从 `__YAMI_BRIDGES__[id]` 驱动（往返表 `BRIDGE_ROUNDTRIPS` 每迁一个窗口加一行）。`element-api-attach` 122 → 115。
>
> 照抄清单（剩余窗口）：① 用 `composables/form-bridge.ts` 的 `createFormBridge<T>(id)` 声明三行（provide/reset/get 箭头函数）；② `.vue` 里 `provide` / `onUnmounted(reset)`；③ schema 两处改读模块；④ `branch-registry.spec` 断言「元素上没有 setForm、桥在模块上」；⑤ E2E 往返表 `BRIDGE_ROUNDTRIPS` 加一行。`launch.mjs` 已默认带 `--dirname=.` 打开 debug 通道，不用再动。
>
> 带 `attachElementApi(el, { setForm, getForm })` 的窗口已全部迁完。最后一个变体是**共享助手**：`LightGetter` / `ObjectGetter` 的 setForm/getForm 不在各自 schema，而在 `usePresetGetterWindow` 里按 `domKey` 统一取元素 —— 对应桥也做成按 key 建表的 `presetGetterBridge(domKey)`，助手改读它，窗口只负责 `provide` / `onUnmounted(reset)`。`variableGetter2` 更简单：它的元素桥全仓没有消费方（表单由 composable 直接写控件），属于死挂载，直接删。
>
> 顺带一条实测：一次性脚本扫 75 个 `attachElementApi` 站点，其中 **45 个的成员在「其它文件」里找不到调用**，看着像死代码 —— 但抽查发现正是 `sync` 这类**由本文件内回归测试直接驱动**的桥（`components/__tests__/animation-frame-page-bridge.spec.ts` 里的 `el.sync?.()`）。结论：静态扫不到消费方 ≠ 可删。

**新增工具窗口检查清单（懒挂载）**

工具窗口是**按需挂载**的（`tools/tool-window-host.ts`）：控件 API 在组件挂载时才接线，
`Window.open()` 返回 ≠ 控件可写。加新窗口时逐条对一遍，前四条踩中任意一条都会在**首次打开**时炸：

1. **挂载策略**：要按需挂载就把 `.vue` 文件名 + 窗口 id 加进 `AppShell.vue` 的
   `deferredToolFiles` / `deferredToolIds`；两边名字要能归一化对应（冒烟测试按这个关系找组件）。
   漏加 → 启动期挂载（更慢），也不进冒烟测试。
2. **打开后写控件**：一律 `Window.openWith(id, () => { ...loadItems/setForm/写 style... })`，
   不要在 `Window.open()` 后面接着写（首次打开时控件还不存在：`?.` 静默丢数据、裸调用抛错）。
3. **启动期初始化**：`Command.initAll()` / `initTools()` 早于挂载，这类 `initialize()` 要用
   `onToolWindowMounted(id, …)` 在挂载后补跑一次，并且**幂等**（用 WeakSet 按元素去重）。
4. **隐藏行关系**：`relate()` 在 ui-kit 里会自动 `toggleRelatedElements()`，不要再手工同步；
   但窗口高度要容得下「最多可见行数 + 标题 + 按钮」，实在多就加 `scrollable`（内容区滚动，
   否则 `overflow: hidden` 会把字段裁掉、按钮压在上面）。
5. **监听只挂一次**：宿主窗口挂载后不卸载，`addEventListener`/`on()` 重复挂会双触发；
   用一次性标记或 `WeakSet` 按元素去重，并在 `closed` 里清掉回调。
6. **文案 key**：`components.<窗口id>.*` 要同时补进两份**对应命名空间分片**
   `Project/Locales/<lang>/components.<窗口id>.json`（`pnpm run i18n:guard` 会拦）。
7. **验证**：`pnpm -F @yami/editor exec vitest run src/tools/__tests__/deferred-window-smoke.spec.ts`
   —— 它会真实挂载所有 deferred 窗口，断言控件已接线、id 不重复。

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

- **怎么发**：先提交版本号（只改 `packages/editor/package.json`），再从该提交打 annotated tag：
  `git tag -a v1.2.3 -m v1.2.3 && git push origin v1.2.3`。
  也可以在 Actions 页面手动 dispatch，填一个**已经推送过**的 tag；勾选 `publish` 会在 Draft 创建后自动发布。
  tag 带连字符（如 `v1.2.3-beta.1`）会自动标记为 prerelease。
- **版本必须与 tag 一致**：`verify` job 会跑 `scripts/release-verify-tag.mjs`，不一致直接失败；
  并校验 tag commit 在 `origin/main` 上。发布前会跑完整门禁、ui-kit/editor 测试和 `build:vite`。
- **打什么**：四腿矩阵 `win-x64` / `mac-x64` / `mac-arm64` / `linux-x64`，分别跑
  `packages/editor` 的 `build:winexe` / `build:macexe` / `build:macArmexe` / `build:linuxexe`
  （每条 = `build:all && electron-builder <target>`，配置内联在 `packages/editor/package.json`
  的 `build` 字段；产物落 `packages/editor/build/`）。
  每腿生成 `SHA256SUMS.txt`，以独立 artifact 上传。
- **发到哪**：`release` job 汇总后创建 **Draft Release**，上传安装包、`.blockmap`、`latest*.yml`
  和校验和；确认无误后人工 Publish，或 dispatch 时勾选 `publish` 走 `release-stable` 环境审批。
  mac 两腿的 `latest-mac.yml` 会分别重命名为 `latest-mac-x64.yml` / `latest-mac-arm64.yml`，
  避免摊平覆盖。
  **刻意不用 `electron-builder --publish`**：`package.json` 的 `repository` 指向
  `yami-pro/yami-rpg-editor`，与实际跑 workflow 的仓库不一定相同，
  用它发布可能打到别处去。
- **Release Notes**：优先从 `CHANGELOG.md` 中读取对应版本段落（`scripts/release-notes.mjs`）；
  没有该段落时回退 GitHub 自动生成。
- **自动更新**：Windows 安装包通过 `electron-updater` 从 GitHub Release 的 `latest.yml` 检查更新；
  Draft 不会被客户端看到，Publish 后才生效。稳定版只接受正式 Release，版本号带 `-` 的 beta
  构建允许 prerelease。macOS / Linux 目前仍建议手动下载，
  因为 mac 双架构元数据、签名与公证尚未就绪；`autoUpdater` 只在 `win32` + `app.isPackaged` 时启动。
- **签名**：目前**不签名**（仓库里没有证书 secret）。mac 侧显式
  `CSC_IDENTITY_AUTO_DISCOVERY: 'false'`，win 侧 electron-builder 自己会
  `no signing info identified, signing is skipped`，且 `verifyUpdateCodeSignature` 仍为 `false`。
  将来要签名，配 `CSC_LINK` / `CSC_KEY_PASSWORD`（mac+win）与 `APPLE_ID` /
  `APPLE_APP_SPECIFIC_PASSWORD` / `APPLE_TEAM_ID`，再把 win 的
  `verifyUpdateCodeSignature` 改为 `true`。
- **已知噪音**：`extraResources` 里有一条 `node_modules/@typescript/typescript-win32-x64`，
  本仓没装（它是 `typescript@7` 的可选依赖，`main/services/tsc.ts` 已有回退链）。
  打包时会打印 `file source doesn't exist` 但**不中断**（实测 `--dir --win` exit=0）。
  想去掉这条噪音就删那两行 —— 但先确认 tsgo 路径是否还要它。

**资源包发版**：`.github/workflows/release-resources.yml`（导出壳见 `release-export.yml`）

模板、脚本、导出壳不单独做安装包，只发 GitHub Release 附件：

| 包 | tag | Release 产物 |
| --- | --- | --- |
| `template-arpg` | `template-v1.0.23` | `*_pack.zip` + `*_pack.json` + `SHA256SUMS.txt` |
| `script` | `script-v1.0.1` | `script_pack.zip` + `script_pack.json` + `SHA256SUMS.txt` |
| `export-electron` | `export-v1.0.1` | Electron 壳 zip + `manifest-*.json` + `SHA256SUMS.txt` |
| `ui-kit` | `ui-kit-v0.2.0` | npm tarball + GitHub Release 附件 |
| 编辑器 | `v1.0.18` | 安装包（仍由 `release.yml` 处理） |

- 资源 tag 不会触发编辑器 Release；`v*` 只匹配编辑器。
- 资源包发布后，编辑器通过根目录 `resources.lock.json` 锁定版本；
  `pnpm pack:resources` 会先跑 `scripts/resources-lock.mjs`，版本不一致直接失败。
- 资源包的 `*_pack.json` 带 `minEditorVersion` / `projectVersion`，用于编辑器启动时做兼容检查。
- **tag 必须落在编辑器正在读的那个仓库上**：运行时用 `RESOURCE_REPO`
  （`packages/editor/src/module/resource-release.ts`）拼
  `api.github.com/repos/<owner>/<repo>/releases`，而 workflow 只在 **tag 所在仓库**建 Release。
  当前指向 `xiaoxustudio/yami-rpg-engine`；旧地址 `xiaoxustudio/yami-rpg-editor` 已 301 到
  `Open-Yami-Community/yami-rpg-editor`，存量客户端仍读旧仓库 ⇒ 迁移期两边各发一份，别只发一边。
- **只有 Published 的正式 Release 生效**：Draft 对客户端不可见；tag 里带 `-`
  （如 `template-v1.0.23-beta.1`）会被标成 prerelease 并被 `parseResourceReleases()` 跳过
  ⇒ 资源包不要发 beta。每个 kind 只取 `published_at` 最新的那一个 Release，
  所以**同一 tag 必须一次带齐该 kind 的全部资产**（模板两语言、导出壳两平台）；
  发布后再往同一个 Release 补传资产不会生效，得重新发一个版本。
- **`minEditorVersion` / `projectVersion` 目前不构成拦截**：编辑器下载时只校验 manifest 里的
  `sha256`，不比对版本号，旧客户端不会被挡住（这个字段只是给将来的兼容检查留的口子）。
- **导出壳的 `install-templates.js` 与发版无关**：它把壳复制到
  `packages/editor/Project/Templates/`（在 `.gitignore` 内、运行时也不读那里）；
  发版用的是打包脚本产出的 `build/electron-*.zip` 与 `manifest-*.json`。
- `ui-kit` 由 `release-ui-kit.yml` 发 npm；需要配置 `NPM_TOKEN`，beta 版本发 `next` dist-tag。
  编辑器在切换为 npm 版本前仍使用 workspace 依赖。

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
