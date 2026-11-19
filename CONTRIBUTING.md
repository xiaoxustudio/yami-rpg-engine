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

现状（2026-11-10 实测；**数字真源是脚本，不是本文**）：

```shell
node scripts/contract-inventory.mjs                                  # 还挂着 registryRef 的窗口 / 控件 id / 谁在读它们
node scripts/migration-ledger.mjs --axis element-registry-lookups    # 还按 id 摸注册表的消费方（按文件计数）
node scripts/oneoff/report-blocked-by-consumer.mjs                   # 按「卡住多少窗口」给消费方文件排序（决定先动谁）
node scripts/oneoff/triage-registry-windows.mjs <窗口…>               # 这些窗口挂的注册表，别处有没有**动态**读
node scripts/oneoff/audit-migrated-controls.mjs <迁过的 .vue…>        # 迁后回查：还有别的文件按 id 读它吗
node scripts/oneoff/audit-expose-vs-attach.mjs                       # 包装组件的 defineExpose 是否覆盖 attachElementApi
node scripts/oneoff/wire-command-bridges.mjs <窗口> <bridgeId> "<spec>" --apply   # 生成桥模块并给窗口接线
```

- **元素注册表已整体拆除**：13 个按域拆分的 `element-registry.ts` 与 `utils/element-registry.ts` 已删除，业务代码里不再有 `registryRef` / `*Els` / 按 id 摸注册表的读法；spec 侧改用只在测试里可见的 `src/__tests__/test-registry.ts`（压测 imperative 组件用，不进生产构建）。
- 台账三轴：`element-registry-lookups` **0 / 0 文件**（已清零）、`yami-element-refs` 481 / 91、`element-api-attach` 21；
- editor 包装层只剩 **`ParameterPane`** 一处 attach（`WindowFrame` / `SliderBox` / `NumberBox` / `SelectBox` / `SelectVar` / `CustomBox` 等已清）；ui-kit 侧还有 15 个 `.vue` 的 `attachApi` 与 23 个 `*-api.ts` 命令式工厂。
- 收尾只剩 P3 一条装配轴，做法见下一节「P3：元素 API → 能力缝」。
- **状态（2026-11-13）**：P3 已完成——editor 侧控件寻址全部走组件实例/句柄，只剩 `ParameterPane` 一条 attach（被 `YMParameterPane.self = 根元素` 挡住）；`element-api-attach` **33**（editor 0、ui-kit 21）。
- **P4（拆元素 API 本身）尚未开工**：它是独立工程，前置、批次与判据见本文件「P4：拆掉元素 API」一节。

**存量是碎片化的，不存在「再迁一批就清零」**：119 个消费方文件里最重的那个也只卡 5 个窗口（`report-blocked-by-consumer.mjs` 的输出）。所以一批的粒度应该是**一个消费方 + 它卡住的 1–5 个窗口**，而不是一个目录。

五类消费方，五种收尾方式：

- **单例只要窗口根元素上的一个能力**（如 `update-log-window.ts` 对 `update-log` 的 `closed` 监听、`deploy-project-window.ts` 对 `deployment-warning` 的写文案）→ 这一步**根本不需要桥**：能力搬回窗口自己（`@closed` / `defineExpose`），单例把这段代码删掉；
- **单例要驱动窗口内的一批控件**（命令 schema、`useProjectSettingsWindow`）→ 走路径 2 的桥，把「控件级能力」一次性交给单例；
- **装配本来就是窗口自己的配置**（文本捕获族的候选项 / 隐藏行关系 / 变量名补全）→ 搬进窗口的 `onMounted`，单例只留 `open` / `confirm`；这类最干净，连桥都不用；
- **单例长期持有元素**（`image-crop-window.ts`、`enum-window.ts`、`tile-frame-index.ts`：把 list / panel / inputs 存成字段、跨 open/close 复用，还会往元素上挂方法）→ 窗口挂载时**一次性交出句柄表**（`composables/image-crop-handles.ts`、`enum-handles.ts`、`frame-index-handles.ts`），卸载注销；单例只读这份表。这类不能按「每次取一次元素」改，否则每次调用都要重新解析一遍；
- **一批控件跨多个组件、单例都要**（`element-page.ts` 要页面 5 个 + general section 3 个 + transform section 17 个）→ **页持有控件表**：页面建表并 `provide(KEY)`，各 section 挂载时把自己那一半填进去，单例经桥按 key 读（`composables/ui-element-page-controls.ts`）。一个组件的 section 拆得越散，这条越省事。

**引擎骨架 / 页面节点用「类型化小表」（第六种，也是现在的主力）**

一批**长期存在、单实例、只有一两个主人**的节点（场景面板、粒子面板、动画骨架、inspector 各页的列表控件、命令面板、浮层）不再进共享注册表，而是各建一张 `createSkeletonTable<K>({ key: '稳定 id' })`（`composables/skeleton-table.ts`）：

```ts
export const sceneNodes = createSkeletonTable<SceneNodeKey>({ page: 'scene', head: 'scene-head' });

// 组件侧：一个 scoped() 换掉一屏 registryRef
const { bind, dispose } = sceneNodes.scoped();
onUnmounted(dispose);
// <div id="scene" :ref="bind('page')">

// 引擎/页面模块侧：pick 读表
const page = sceneNodes.pick('page');
```

- **`pick` 里的 id 兜底是刻意的**（引擎初始化可能早于组件挂载），删了会变成竞态 bug；
- 模块级单例（`SearchString`、`useProjectSettingsWindow`、`CustomCommand`）**没有组件树**，所以表放在模块里：窗口挂载时 `bind` / `set`，模块 `pick`；
- 页面 + 多 section 的形态（项目设置、inspector 页）用**登记式表**（`project-settings-controls.ts`、`inspector-scene-nodes.ts`）：section `set` 自己那一半、页面 `pick`；
- 这些表的收益是**同一条轴**：消费方不再按 id 摸注册表，`element-registry-lookups` 才会下降；但节点本身仍可能挂着元素 API（`on` / `write` / `relate` 的 targets），那是 P3 的事，**不要**在这一步顺手改写成组件实例。

**P3：元素 API → 能力缝**（`element-api-attach` 归零的唯一剩余路径）

`attachApi(el, api)` / `attachElementApi(el, api)` 把方法挂到**元素**上。控件能力现在都走 `defineExpose`，真正还需要按元素查的只剩两类「天然是 DOM」的能力：

| 能力 | 谁只拿得到元素 | 收尾方式 |
| --- | --- | --- |
| `getFocus(mode)` | `v-focus` 指令（Vue 交给指令的只有根元素） | 组件 `onMounted` 里 `setElementCapabilities(el, { getFocus })`；指令先查能力表，再回退原生 `focus()` |
| `enable` / `disable` | `relate()` 的 targets 是行 / 控件根，`select-box-core` 还要读写 `style.display` 与兄弟标签 | 同上登记；`enableElement` / `disableElement` 先查表，再回退 `classList` |

- 能力表在 `packages/ui-kit/src/utils/element-capabilities.ts`（WeakMap，按元素查）。**只放 DOM 型能力**；`read` / `write` / `loadItems` / `relate` 这些控件能力**不许进表** —— 它们只能从组件实例上拿；
- `enableHiddenMode()` 返回的是**隐藏模式句柄** `{ relate }`，不是根元素：返回元素会逼调用方继续依赖元素 API；
- ⚠️ **包装层不能整批删**（2026-11-11 实测：一次删 27 个 `attachElementApi` 直接红 41 个测试）。仍按元素用的消费方有三类，必须和组件一起迁：
  1. `SliderBox.synchronize(target)`：既读 `slider.input`（元素上的 `input`），又**改写** `number.write`（把同步逻辑挂到元素方法上）——这是真正的方法替换，不是读值；
  2. 旧式 window 模块的 `el(prefix, id)` 助手（`useVariableGetterWindow` 的 `loadPresetKeys`、`useProjectSettingsWindow` 的 `config-*`）：它们从控件表 `controlRoot()` 取根元素，再调 `.loadItems()` / 写 `.filter`；
  3. spec 自己 `document.getElementById(id)` 取元素再调 `.read()` / `.write()`（`set-list-bridge`、`input-bridge`、inspector 页族桥接 spec）——测试也在按元素契约断言；
- 所以 P3 的批次单位是「**一个组件 + 它的元素消费方 + 对应 spec**」：先把消费方改成实例/句柄，再删 `attachElementApi`，最后删 api 模块里的 `attachApi`；api 模块里 `box.write(...)` 这类**经元素回读自己**的写法要改成闭包直调（`write(...)`），否则删 attach 后就是运行期 undefined。
- spec 里读控件状态统一走 `src/__tests__/control-api.ts` 的 `controlApi(id)`：沿 `__vueParentComponent` 往上跳过 `YM*`（它们常常只暴露 `root`）拿 editor 包装层的 `defineExpose`；同 id 的游离节点按 `isConnected` 过滤。`document.getElementById` 只留两类用途：拿**元素数据**（`dataValue` / `filter` 属性）和派发 DOM 事件。`filter` 这类元素自有属性另配了 `CustomBox.getFilter()`，测试读它而不是读元素。



**P4：拆掉元素 API**（本阶段单独开工，不要混进 P3 批次里）

P3 清零后剩下的元素 API 全部集中在四个**结构性**位置，逐个删 attach 会在别处报运行期错误；
必须先换掉它们依赖的元素语义，再删 `attachApi` / `attachElementApi` / `YamiElement`：

| 位置 | 现在怎么用元素 | 收尾方式 |
| --- | --- | --- |
| `localize/dom-localizer.ts` | `setLocalElement(el, item)` 直接调元素上的 `setTitle` / `setPlaceholder` / `setItemNames` | 改成组件监听 `yami-localize` DOM 事件（`detail` 就是 item）；元素只负责 textContent / tip / label |
| 窗口管理器（`tools/window-object.ts`、`command-custom.ts`、`tile-frame-index.ts`） | 按窗口 id 取 `WindowFrame` 根元素，调 `open/close/absolute/setTitle`，再直接写 `style.height` | 加一张 `window-handles`（按窗口 id 存 `{ root, open, close, setTitle, absolute, setPosition, on }`），`WindowFrame` 挂载登记、卸载清空；DOM 查询只留给焦点落点 |
| 旧式命令式构造（`components/ParameterPane.vue`、`components/var-factories.ts`、`local/local-window.ts`） | `createXxxElement()` 造裸元素、挂方法、再手动 append | 改成动态 Vue 组件（`<component :is>` + 控件表）；确实要保留命令式入口的，让工厂返回 `{ root, api }` 句柄而不是往元素上挂 |
| ui-kit 的 `*-api.ts` 工厂与 17 个 `.vue` 的 `attachApi` | 元素与 API 是同一个对象（`CheckBoxApi extends HTMLElement`），模块内部还靠 `box.write(...)` 回读自己 | 每个工厂返回 `{ root, api }`；组件 `defineExpose(api)`；`markApiAttached` / 元素数据标记一起删 |

> **为什么 23 个 `*-api.ts` 工厂要等 ParameterPane**（2026-11-13 核查）：`text-box-api` /
> `number-box-api` / `select-box-api` / `detail-box-api` / `var` 族等工厂的**唯一生产消费方**
> 就是 `ParameterPane` 的 `controls` 表（`detailBox: () => createDetailBoxElement()` 这类），
> 其余只在 spec 里出现。所以「工厂返回 `{ root, api }`」这批必须先做 `YMParameterPane` 的
> `self → { root, api }` 拆分，否则改了也没有消费方承接。
> ⚠️ **ParameterPane 是 editor 侧最后一条 attach，且它是被挡住的**：ui-kit 的 YMParameterPane.vue 里 self 就是根元素（ParameterPaneElement = HTMLElement & ParameterPaneApi），getData / onResize / createDetailBox / clear 都是宿主**往元素上赋值**的。要删这条 attach，得先把 self 拆成 { root, api }（与工厂改造同款），组件读 api 而不是读元素。
>
> **WindowFrame 批已落地（2026-11-12）**：`window-handles` 上移到 ui-kit，由 `YMWindowFrame` 自己登记；`window-object` 的 4 处
> `element.open/close/focus` 改成 `window-handles` 后，`window-object.spec`（23 条）与
> `window-state.spec`（23 条）都能通过；卡住的是 `auto-tile-window-close.spec` 的
> 「未保存确认」两条：给夹具补 `setWindowHandle` 后，`on(frame,'close')` 已确认走到
> 实例的 `on`（元素上没有 `on`、`controlApiOfElement` 能命中），但 `Window.confirm`
> 仍未被调用 —— 说明 YM 的 `closeEventEnabled` 置位与标题栏关闭按钮之间还有一处
> 元素语义没接上，下一批先在这里下断点。
> 2026-11-12 已落地前置：`element-utils` 的 `read` / `write` / `clear` 三个 shim 现在会经
> `utils/control-instance.ts` 按元素反查控件实例（优先级：元素方法 → 实例 API → 元素数据）。
> 但**直接写 `el.read()` / `el.write()` 的窗口模块与 spec 不走 shim**，那批仍要逐个改。
> `YMTextBox` / `YMTextArea` / `YMCustomBox` 同理被命令窗口的旧模块用着：`presetElement` / `presetObject` 窗口、
> for-each / if-condition 表单桥、懒挂载冒烟测试都经 `read(el)` / `write(el)` 这类 shim 走元素 API；
> 先按「窗口模块改实例」再删这三条 attach。
> **FileNavPane 批的阻塞（2026-11-12）**：`YMFileBrowser.setupLinks()` 把 `links` 对象**挂在 nav 元素上**（`attachLinks(nav)`），head/body 两个 pane 再从自己的元素读 `links`；同时 `FileNav` 的 `selections` 也不是实例方法。要删 `YMFileNavPane` 的 attach，得先把 `links` / `selections` 换成显式句柄或 props，属于整组改造。
> 其余 ui-kit 组件的元素消费方（2026-11-18 更新）：`YMCommonList` 已完成（AutoTile / Reference 改持实例；`templates` 仍是 `TreeList` 元素，等 `YMTreeList` 迁移）；剩余输入框族与 `*-api.ts` 工厂。

判据：`element-api-attach` 0、`yami-element-refs` 0、`attachApi`/`attachElementApi` 两个导出删除、
`ElementCapabilities` 只剩 `getFocus`（relate 的 enable/disable 也走能力表，不碰元素方法）。

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
- ⚠️ **「没人读这条登记」不能靠静态分析判**（2026-11-06 实测吃过亏）：`audit-dead-by-file.mjs` 报出 30 条「全死」登记，删完 `if-condition-bridge` 与 `deferred-window-smoke` 直接红 —— 漏掉的三类读法是
  ①变量 id 的循环登记（`registerElement(composableEls, id, …)` 的 id 在 schema 里以字面量出现）、
  ②`registryElement<T>(composableEls, '…')!.filter = …` 这种「取到就写属性」、
  ③冒烟测试统计「接线了的控件数」。**注册侧删不删，只有跑测试能定**；
- ⚠️ **改 `.vue` 的类型必须过 `typecheck:vue`**：`tsc` 对 `.vue` 是假绿（15 个 `clear(el)` 站点就是 vue-tsc 抓到的）；
- ⚠️ **`relate()` 的 `targets` 仍是 DOM 语义**（`select-box-core` 读写 `element.style` 与兄弟标签），必须传 `controlRoot(...)`；这是 P3 之前拆不掉 `attachElementApi` 的主要原因；
- ⚠️ **`write2()` 在新列表里找不到旧值时会把第一项当默认值写进去**：只在「原来就有选中值」时回写，否则会变成替用户选一个（`SetAnimationComponent` 那条单测就是这么红的）；
- ⚠️ **默认写路径是拼出来的 id**：`useCommandSchema` 的 `load` 用 `${name}-${field}` 去注册表取元素，所以非 `skipWrite` 的命令窗口必须先传 `controls: () => 控件表` 才迁得动（`WebSocketSend` 是第一个这么迁的）；
- ⚠️ **`filter` 是根元素上的自有属性，既不是 prop 也不是 attribute**：`custom-box-opts` 的 getter（`VariableGetter.open(el)` 一类）打开选择框时读的就是 `el.filter`。迁成组件实例后必须走 `CustomBox` 暴露的 `setFilter(...)` —— 写成 `control.filter = x` 是**静默 no-op**（实例代理上没有这个可写成员，`tsc` / `vue-tsc` 都不会报），「换操作数类型 → 变量框可选项过滤」就这么悄悄失效；
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