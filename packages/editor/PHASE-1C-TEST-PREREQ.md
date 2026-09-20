# 阶段 1c 前置：测试侧待改清单（2026-09-17 静态审查）

> 本文件由「无法运行 vitest」的会话产出。**内容来自逐文件静态审查，不是测试结果** —— 每一条都标了
> 判定依据，请在有测试环境时对着跑一遍确认。
>
> 背景：阶段 1b 把 `UI` 单例的消费面从 52 个文件清到 4 个（且那 4 个都不是迁移债）。
> 但**测试侧仍绑定着遗留单例的形状**。在删除 `src/ui/` 之前必须先处理下面这些，
> 否则删除的那一刻测试会成批变红，而「测试该改」与「代码真坏了」将无法区分。

## 已修复（本轮）

### 1. `stores/__tests__/ui-state.spec.ts` —— 脆断言

```ts
expect(uiStateKeys).toHaveLength(6);   // ← 已失效：实际 25 项
```

`uiStateKeys` 随迁移推进持续增长（每搬一个遗留成员 +1）。写死数字会让**每一次搬迁都顺带弄红一个
与它无关的测试**，而那个红不代表任何行为回归。

**改法**：去掉硬编码数量，改为「每个登记键都必须在 store 上真实存在」+「表内无重复」，
另加一条「六个原始桥接键仍在」的回归保护。判定依据：`uiStateKeys` 实际长度 25（脚本核对过）。

### 2. `components/__tests__/element-page-bridge.spec.ts` / `ui-button-page-bridge.spec.ts` —— mock 缺 `getUIStore`

```ts
vi.mock('@app/stores/ui', () => ({ useUIStore: () => ({ syncState: vi.fn() }) }));
```

迁移后这些页面不再 `import { UI } from '@app/ui/ui-window.ts'`，而是在 `onMounted` 里调
`bindInput(elements, getUIStore(), editor)`。**mock 缺失具名导出 `getUIStore` 时，ESM 导入会直接
失败**（不是「返回 undefined 后静默跳过」）。

**改法**：两个 mock 各补一个最小 `getUIStore`（只含页面实际用到的成员）。

### 3. `engine/__tests__/ui.spec.ts` —— 元素类 mock 缺口 ✅ 已修

这个 spec 测的就是元素类，靠 `vi.mock('@app/ui/ui-window.ts')` **内联定义**它们。
阶段 1b 之后那些类改由 `element-classes.ts` 的 `uiElClasses` 持有 ⇒ 测试读到的是 `null`。

**关键事实（原判断有误，已纠正）**：该 spec **本来就会真实加载元素文件**
（`import '@app/engine/ui/element-base.ts'` 等 7 行），所以 `uiElClasses.*` 其实**会被填好** ——
真正的问题只是**测试读错了地方**（读 mock 的 `UI.Element`，而不是真实的 `uiElClasses.Element`）。

**改法（已落地）**：
- `const { UI } = await import('@app/ui/ui-window.ts')` → `import { uiElClasses } from '@app/engine/ui/element-classes.ts'`
- 15 处 `new (UI.X as any)(…)` → `new (uiElClasses.X as any)(…)`
- store mock 补 `matrix`（`ui-engine.ts` 的 `GL.matrix.set(getUIStore().matrix!)` 走这里）与
  `foreground`（`RootElement.draw` 的 `getINTRGBA`）。`Matrix` 替身原本只在 `vi.mock` 工厂内部可见
  ——因为 `vi.mock` 的工厂会被提升、不能引用外部变量，所以在模块作用域另建了一份 `matrixStub`。

### 4. `composables/__tests__/usePresetElementWindow.spec.ts` —— 遗留 mock 已失去意义 ✅ 已修

它 mock 了 `@app/ui/ui-window.ts` 并 `vi.mocked(UI).target/meta = …`，但生产代码（`usePresetElementWindow`）
阶段 1b 起读的是 `getUIStore()`。该 spec **本来就在 `beforeEach` 里装了 Pinia**
（`setActivePinia(createPinia())`），所以直接改读真 store —— 比 mock 更接近真实行为，
也正是迁移想要的：**测试不再绑定遗留层的形状**。

## 待复核（低风险，下一轮顺手确认）

| 文件 | 判定 |
|---|---|
| `engine/__tests__/scene.spec.ts` | **不** mock `@app/stores/ui`（用真 store），但把 `renderingFunction`/`drawElements` 都标成了 `vi.fn()` ⇒ **不会走到** `GL.matrix.set(getUIStore().matrix!)`，因此 `matrix` 为 null 不构成问题。**低风险** |
| `engine/__tests__/animation.spec.ts` | 同上（`drawBackground`/`drawElements` 均为 `vi.fn()`）。**低风险** |
| `engine/__tests__/webgl.spec.ts` | 同上；它测的是真实的 `GL.drawElements`（bufferData 路径），不经过 ui-engine。**低风险** |
| `printer/__tests__/printer-draw.spec.ts` | `printer.ts` 的 `new UI.Image(...)` 已改为 `new uiElClasses.Image!(...)`。该 spec 用 `vi.mock('@app/ui/ui-window.ts', () => ({ UI: {} }))`，0 处引用元素类 ⇒ 若它走到 `printer.ts:434` 则需要 `uiElClasses.Image` 非空。**需确认**（未确认） |

### 5. 删除遗留层时同步要处理的非测试引用

```
tools/window-cluster.ts:2    export { UI } from '@app/ui/ui-window.ts';      ← stores/ui.ts:15 与 file-system-core.ts:14 通过它惰加载 UI 窗口
tools/window-cluster.ts:48   import { uiWindowReady } from '@app/ui/ui-window.ts';
stores/ui.ts:15              return m.UI;
file/file-system-core.ts:14  const UI = getLazyWindow('ui', () => loadCluster().then((m) => m.UI));
```

`stores/ui.ts` 的 `loadUI` 目前是「等 clusterReady 后拿 `m.UI`」——删掉遗留层后，
它应当改为**直接** `import('@app/engine/ui/ui-engine.ts')`（`ui-engine.ts` 已经不再依赖遗留层），
`window-cluster.ts` 的 `UI` 导出随之删除。

## 附录：`UI` 单例槽位三态审计（`node scripts/audit-ui-slots.mjs`，2026-09-17）

阶段 1b 之后做了一次系统核对：**156 个声明槽位 / 152 个有赋值 / 55 个有消费**。

### 结论一：没有「有消费但从未被赋值」的真实槽位

唯一的告警 `UI.drawXxx` 是**我自己写在 `stores/ui.ts` 注释里的说明文字**（解释那 7 个 draw 方法
原本指回 UIEngine），不是代码。也就是说：**没有发现「某个槽位永远读到 null 却被消费」的静默缺陷。**

### 结论二：6 个「既无赋值也无消费」的槽位，分成两类（已逐个人工确认）

| 槽位 | 遗留层内部引用 | store 接管 | 真结论 |
|---|---|---|---|
| `scrollLeft` / `scrollTop` / `scrollRight` / `scrollBottom` | **0** | ✅ | **已完全迁到 store**；遗留侧的 `this.scrollXxx = null` 已是死字段 |
| `controlPointActive` / `controlPointRotation` | 4 / 1 | ❌ | **遗留层内部专用**（只在 `ui-pointer` / `ui-transform` 里用），随阶段 1c 一起删，**不需要找新家** |

这条结论是「先粗筛、再逐个精确核对」得来的：粗暴的文本扫描会把上表两类的**性质完全不同的东西**
放进同一张「可删」清单里 —— 前者是「迁移已完成」，后者是「功能会一起消失」。**不能只看清单就动手。**

### 审计脚本的已知局限（写在脚本头部，免得被当成权威结论）

- `/i` 让 `uiElClasses.x` 这条也匹配到 `WebGLClass.foo =` 之类无关赋值 ⇒「有赋值」偏宽松，
  只会让告警**变少**（偏保守），不会凭空制造告警。
- 「有赋值但无消费」那 98 项噪音很大：很多槽位是**由外部 UI 注册机制按名字读取**的，
  静态文本扫描看不到那种读取。该列仅作参考，**不要**据此判定「赋值方白做」。
- 真正有行动价值的只有前两列。

## 附录二：`null as unknown as` 轴的实测构成（2026-09-17）

台账的 `null-casts` 轴是 689 处 / 52 文件。做了一次数构分析，结论对「怎么收口这条轴」很关键。

### 689 里有 **559 处**是同一个形状

```ts
setClass: null as unknown as (className: string) => string,
initialize: null as unknown as CommandMethod,
// …共 71 个 CommandMethod、57 个 () => void、49 个 number、15 个 YamiElement …
```

也就是「对象字面量里先把字段占成 null，等别的模块在加载时把真函数/真值赋上去」。

### 这些断言**不是偷懒，而是必需品**

`tsconfig.strict.json` 开了 `strictNullChecks: true`。对声明为 `() => void`（不含 null）的字段，
赋值 `null` 是非法的 ⇒ `as unknown as X` 是绕过它的**唯一**写法。
换句话说：**只要还在用「占位 + 后期赋值」这个模式，这些断言就删不掉。**

要真正消掉它们，只有两条路，都很大：

1. **改声明为 `X | null`**，然后**修掉每一个消费点的空值处理**（`!` 或可选链）——
   这是 52 个文件、数百个调用点的改动，且每处都要判断「这里到底可能为空吗」。
2. **把单例改成真正的初始化协议**（类 + 构造参数，或 `init(deps)` 一次性注入），
   让「占位态」在类型上不存在。语义最干净，但波及面最大。

### 一次失败的「小步尝试」记录（不要重复）

我曾试着找出「目标类型里已经写了 `| null` ⇒ 断言多余」的那一批（20 处），批量删掉。
**结果是 tsc 立刻报 12 个错**，例如：

```
data/data-object.ts(122): Type 'null' is not assignable to type '() => Promise<void> | null'
composables/commands/useGetObjectPropertyCommandSchema.ts(23): Type '"get-object-index"' is not assignable to type 'null'
```

原因：字段**没有类型注解**时（靠字面量推断），去掉断言后 TS 会把该属性**推断为 `null` 字面量类型**，
于是后续任何赋值都失败。而我上一段引用的 `const root = shallowRef<UIElementInstance | null>(null)`
能通过，是因为 `shallowRef<T>()` **显式提供了 T**、不靠推断。

⇒ **教训：「目标类型含 `| null`」并不等于「可以写裸 null」**，取决于类型是注解来的还是推断来的。
这条已被回滚，`null-casts` 仍是 689（基线未动）。

### 一条可安全删掉的例外（已定位，但**尚未落地**）

上面那个「注释来的类型 vs 推断来的类型」的区别，正好给出一个**可判定的**判据：

> 字段所在的对象字面量**有显式类型注解** ⇒ 断言多余、可删；**没有注解** ⇒ 断言必要、别动。

实例：`tools/undo-manager.ts`

```ts
export const UndoManager = {
	active: null as unknown as ActiveEditorShape | null,
	//      ^^^^ 可降级：把 `unknown as` 去掉、只留 `as ActiveEditorShape | null` 仍然合法，
	//           因为字面量本身没有被注解，TS 需要那个断言来给 active 定型。
};
```

⚠️ **这段推理我改到一半时环境失效了（沙箱后端挂掉），没能跑 `tsc` 验证，所以已回滚、没有落地。**
留在这里是因为判据本身有价值；落地时必须先跑一次 `tsc` —— 这恰好是「改动与验证不可分割」
的例子：一次未经 `tsc` 的断言降级，收益是减少 1 处计数，风险是整条 `strictNullChecks` 链上多一个洞。

### 建议

这条轴的收口**排在阶段 1c 之后**，并且**必须有运行时验证**：它要动 52 个单例的字段声明与全部消费点，
任何一处判断错（把「其实可能为空」当成「一定不为空」）都会变成运行时崩溃，
而 `tsc` 只会告诉你类型对不对、不会告诉你业务上会不会真的为空。

## 附录三：`src/ui/` 不是「一个遗留层」，是 **8 个域模块 + 1 个接线文件**

（2026-09-17 实测）把 `src/ui/` 当成一个整体来删是**错的**。逐个统计「谁给 `UI` 单例挂了成员」：

| 文件 | 挂的成员数 | 域 |
|---|---|---|
| `ui-window.ts` | 21（自身）+ 对象字面量 | **接线/形状**（唯一真·接线件） |
| `ui-events.ts` | 21 | 窗口事件（21 个 handler） |
| `ui-transform.ts` | 18 | 元素变换/属性同步 |
| `ui-file.ts` | 15 | 文档生命周期（open/load/save/close/destroy + copy/paste/undo/redo） |
| `ui-list.ts` | 10 | 列表交互 |
| `ui-pointer.ts` | 8 | 画布指针交互（marquee/selectObject/pointermove…） |
| `ui-prefab.ts` | 8 | **预设/预制体**（registerPreset / hasPrefab / createPrefabItem / loadElement…） |
| `ui-initialize.ts` | 1（`initialize`） | DOM 引用与定时器初始化 |
| `element-registry.ts` / `register.ts` | 0 | 元素注册表 + import 顺序 |

合计约 **102 处 `UI.x = ` 赋值**分布在 8 个域模块里。

### 一个必须先补的缺口：**41 个槽位**

精确核对（遗留层挂载 102 个成员 vs store 暴露 61 个同名动作）后，**store 尚缺 41 个**。
但按「实现来源」拆开看，情况比数字乐观得多：

| 类别 | 数量 | 说明 |
|---|---|---|
| **A. UIEngine 自身函数** | **10** | `drawBackground` / `drawElements` / `drawCoordinateAxes` / `drawHoverWireframe` / `drawTargetWireframe` / `drawTargetAnchor` / `drawControlPoints` / `getPointerCoords` / `updateCamera` / `updateControlPoints` / `selectControlPoint` / `renderingFunction` / `stopRendering` —— 这些在 `ui-engine.ts` 里**已有实现**，只需 `UIEngine.x.apply(UI, args)`（`this` 绑定，见附录一），**零新逻辑** |
| **B. `ui-prefab.ts` 域方法** | **2** | `createPrefabItem` / `loadElement` —— 需要真正搬过来 |
| **C. `ui-list.ts` 域方法** | **5** | `listKeydown` / `listPointerdown` / `listRename` / `listPageResize` / `searcherInput` |
| **D. `ui-events.ts` 域 handler** | **8** | `keydown` / `themechange` / `localizationchange` / `loadFromProject` / `screenBlur` / `screenUserscroll` / `translationKeyup` |
| **E. `ui-pointer.ts` 域 handler** | **5** | `selectObject` / `marqueePointermove` / `marqueePointerleave` / `menuPopup` / `pointerup` / `pointermove` |
| **F. `ui-transform.ts` 域方法** | **3** | `updateAllReferences` / `updateHead` / `resize` |

⇒ **直接删 `src/ui/` 会让「UI 预设 / 列表快捷键 / 画布指针交互 / 主题与本地化切换」这些功能静默失效**：
store 的转发是 `UI?.x?.()`，槽位不存在时**静默返回 undefined，不报错**。
（`registerPreset` / `unregisterPreset` / `setAsPrefab` / `unsetAsPrefab` / `clearInvalidPrefabs` /
`hasPrefab` / `createPrefab` 等 store **已有**，缺的是上表这些。）

### 更严重的：惰加载接线是**活的**

`stores/ui.ts:17` 是 `getLazyWindow('ui', loadUI)`，而 `getLazyWindow` 返回的是 **Proxy**：
任何一次 `UI?.requestRendering?.()` 的属性读取都会触发 `ensure('ui', loadUI)` ⇒
动态 import `window-cluster` ⇒ 静态 import `ui-window.ts`（连带 7 个扩展模块的副作用）。

也就是说：**删掉 `src/ui/` 之后，store 的每一次动作都会去 import 一个不存在的模块。**
这不会在 `tsc` / `oxlint` 里报出来（动态 import 的字符串，Vite 构建时才会炸 / 或者静默失败）。

### 因此 1c 的正确形态是「搬迁 + 换接线」，不是「删除」

```
① stores/ui.ts 的 loadUI 从 `window-cluster → m.UI` 改为直连 `ui-engine.ts`
   （ui-engine.ts 已不依赖遗留层，这一步让接线不再指向 src/ui/）
② 把 8 个域模块从 src/ui/ 搬到 engine/ui/（或各自更合适的位置），
   内容零改动，只改 import 路径 —— 这一步**不改变任何行为**，纯移动
③ 逐域把 store 缺的槽位补上（上表缺口），再让调用方改走 store
④ 全部改完之后，ui-window.ts 的对象字面量才退役；stores/ui.ts 改直连 UIEngine，
   那 21 行 `UI.x = UIEngine.x` 转为 `UIEngine.x.apply(UI, args)`（**不能**写成 `.x()`，见附录一）
```

**② 是纯移动（低风险、可验证：tsc + 引用面计数）**，也是下一步该做的。
**③④ 需要运行时证据。**

## 附录四：**首次拿到运行时反馈** —— 抓到一个启动即崩的回归（2026-09-18）

在此之前 19 轮里我一次都没能运行 vitest / Electron。第一次拿到真实运行时信息，就是一条致命错误：

```
initialize.ts:34 [init] Layout stack: TypeError: Invalid value used as weak map key
    at getElementDataStore (ui-kit/src/utils/element-data.ts:24:18)
    at elementDataOf      (ui-kit/src/utils/element-data.ts:40:9)
    at Layout.initialize  (src/engine/layout/layout.ts:331:3)
    at initSingleton → initCore → Editor.initialize
```

### 根因：**初始化时序**，不是类型问题

`Layout.initialize` 里有一行我迁过的代码：

```ts
this.heads = [
  Scene.head,
  elementDataOf<{ head: HTMLElement }>(Scene.list).head,
  getUIStore().head!,                                   // ← 我改的
  elementDataOf<{ head: HTMLElement }>(getUIStore().list!).head,  // ← 我改的
  …
];
```

时序对比（这是全部问题所在）：

| | 谁来赋值 | 何时赋值 |
|---|---|---|
| 旧：`UI.head` / `UI.list` | `ui-window.ts` 的对象字面量 | **模块加载期**（import 时就绪） |
| 我改成：`getUIStore().head` / `.list` | `ui-initialize.ts` 的 `this.head = …`（经 `uiStateKeys` 桥） | **`UI.initialize()` 时** |

而 `Layout.initialize` 由 `initCore` 调用，**早于** UI 窗口的 `UI.initialize()`（后者在 `lazyComponentsReady` 之后才走）。
于是那一刻 `getUIStore().head` 是 `undefined` ⇒ `elementDataOf(undefined)` ⇒ WeakMap 键非法 ⇒ **启动即挂**。

`element-data.ts:39-40` 的注释早就写着这个陷阱（「el 为 null/undefined 时会抛 … 调用前必须自行判空」），
**但 `tsc` 拦不住**：`getUIStore().head!` 里的 `!` 让类型层面看着没问题，运行时却真的是 undefined。

### 修法：改读**元素注册表**，而不是 store

```ts
uiEls.get('ui-head'),
elementDataOf<{ head: HTMLElement }>(uiEls.get('ui-list')).head,
```

为什么这样是对的：`uiEls` 由 `LayoutPanel.vue` 的模板 `:ref="registryRef(uiEls, 'ui-head')"` 登记，
而 Vue 是**同步 mount** —— `main.ts` 里 `app.mount(el)` 完成后才 `emitCustom('vue-app-mounted')`，
`Editor.initialize` 是在那个事件里启动的。因此到 `Layout.initialize` 时注册表一定已经登记好。
而且注册表始终反映**当前**元素，不受「谁先初始化」影响。

### 教训（写给后续批次）

**「把 `UI.x` 改成 `getUIStore().x`」不是等价替换。** 遗留单例的很多 DOM 引用是**模块加载期**就绪的，
而 store 的对应字段要等 `UI.initialize()` —— 两者相差整整一个初始化阶段。
凡是**启动早期路径**（`initCore` / `initEditors` / `initTools` / 各自的 `initialize()`）里读到的 DOM 引用，
都必须走 `uiEls`（元素注册表）而不是 store。

已复核全部 42 处 `getUIStore().<DOM 引用>`：除本处外，其余都在**绘制回调**或**用户交互 handler**
（`pageSwitch` / `tabBarSelect` / `unselect` / `pointerdown`）里，那时 UI 窗口必然已打开、store 已赋值。
唯二需要警惕的是 `layout.ts:1378` 的 `getUIStore().body`（在 `pageSwitch` 里，属交互路径，低风险）
与 `title-bar.ts:629/656` 的 `getUIStore().screen`（同样在 tab 交互路径里）。

## 附录五：迁移的**反向危险** —— store 字段「只被读、从没被写」（2026-09-18）

附录四是「读得太早」，这一条是它的镜像：**字段根本没有写入方**。

### 症状

点开 UI 页面时抛：

```
TypeError: Cannot read properties of null (reading 'addReference')
    at set prefabId (reference-element.ts:43)
    at new ReferenceElement (reference-element.ts:25)
    at UI.loadElement (ui-prefab.ts)
    at UI.load (ui-file.ts)
    at UI.open (ui-file.ts)
```

同一轮还伴随**中间预览区全黑** —— 但黑屏不是独立故障，见下。

### 根因

`stores/ui.ts` 里 `root` / `nodes` / `history` 三个 `shallowRef` 声明齐全、
**15 处读取方**（`reference-element.ts`、`element-base.ts`、`ui-engine.ts`、`inspector/*`），
但全仓库**没有任何一处写过它们**：

```bash
# 写入方：0 命中
rg 'getUIStore\(\)\.(root|nodes|history)\s*=' packages/editor/src
```

原因是迁移只做了**读侧**替换（`UI.root` → `getUIStore().root`），写侧留在了原地：
`ui-file.ts` 的 `this.root = editor!.root` 写的是遗留单例的**另一个存储位置**。

于是：

- `getUIStore().root` 恒为 `null` → 加载含引用/预制体的 UI 文件时 `addReference` 崩；
- `getUIStore().root?.draw()`（`ui-engine.ts:459`）恒为 `undefined` → **静默不绘制**
  → 预览区全黑（`?.` 把 null 变成了"什么都不做"，比抛错更难发现）；
- `getUIStore().history!.save(...)`（`reference-element.ts:99` 等）恒为 `null` → `!` 断言后抛错。

### 同一形状还有一批（审计方法在下面）

| 字段 | 真实写入点 | 后果 |
| --- | --- | --- |
| `root` / `nodes` / `history` | `ui-file.ts` 写 `this.x` | 崩溃 + 黑屏 ✅ 已修 |
| `scrollLeft/Top/Right/Bottom` | `ui-engine.ts:434` 写 `this.scrollX` | `animation-element.ts` 的 `!` 读到 null ✅ 已修 |
| `dragging` | `ui-pointer.ts` 写 `this.dragging` | 按钮按下态判断恒 false ✅ 已修 |
| `hover` | `ui-transform.ts` 写 `this.hover` | 按钮/文本框 hover 贴图静默失效 ✅ 已修 |

### 两步审计（补 `ui-slot-coverage` 的死角）

`ui-slot-coverage` 轴只查「有消费但无赋值」的**遗留**槽位，查不到 store 自己的字段：

```bash
# ① 列出 store 的公共字段（uiStateKeys 是权威清单）
node -e "const s=require('fs').readFileSync('packages/editor/src/stores/ui.ts','utf8');\
console.log(s.match(/export const uiStateKeys = \[([\s\S]*?)\]/)[1])"

# ② 对每个键分别数「读」和「写」，只读不写的就是嫌疑对象
rg -c 'getUIStore\(\)\.<key>\b(?!\s*=)' packages/editor/src   # 读
rg -c 'getUIStore\(\)\.<key>\s*=[^=]' packages/editor/src     # 写
```

### 两种修法，按「写入端有没有迁」二选一

1. **写入端已迁或就在同一个文件** → 补写 store（`ui-file.ts` 的做法）。
   注意 `ui-file.ts` 位于 `src/ui/`，补写会**抬高 `legacy-ui-lines`**。本次是有意为之：
   +9 行 = 3 行必要写入 + 6 行说明，已在基线里显式记录（棘轮 message 认可的路径）。
2. **写入端散落在遗留层多处、暂不迁** → **让 store 委托读取**遗留单例，
   即 `computed(() => UI.x ?? null)`，**不要**留一个没有写入方的 `shallowRef`。
   本次 `scroll*` / `dragging` / `hover` 走的就是这条：`scroll*` 因为
   `UIShape` 已声明 `scrollLeft: number` 而**零断言**；`dragging`/`hover` 则在
   `ui-window.ts` 的字面量上补了显式类型标注（`null as UIPointerEvent | null`），
   把断言也省掉了 —— 行数不变，`unknown-casts` 不涨。

### 教训（写给后续批次）

**「把 `UI.x` 改成 `getUIStore().x`」必须同时确认 store 侧有写入方。**
这条替换在类型上几乎总能通过（`!` / `?.` 会把 null 抹平），所以 tsc 和 lint 都不会拦。
两个自查动作，改完立刻做：

1. `rg 'getUIStore\(\)\.<字段>\s*='` —— 确认写入方存在，且**写的是同一个存储位置**；
2. 判断读取处的 `?.` / `!` 是哪一种沉默：`?.` 会**静默不做事**（黑屏就是这么来的），
   `!` 会**延迟到运行时才崩**。两者都不该用来掩盖"字段永远是 null"。

## 附录六：**UI 画布一片黑，且不报错** —— 两个独立的静默失效（2026-09-18）

崩溃修掉之后暴露出这一条。**黑屏不是"顺带"的现象，它有两个各自独立的原因**，
两次都表现为"没有任何报错"，因此都不能靠读 stack 定位。

### 原因一：`renderingFunction` 的「保护」每帧都提前 return

`ui-engine.ts` 的实现原本是：

```ts
UIEngine.renderingFunction = function () {
	if (GL.width * GL.height !== 0) {
		UI.drawBackground!();   // ← 方法调用，this 绑定到 UI 单例
		// …其余 6 个同理
	}
};
```

我曾把它改成 `UIEngine.drawXxx!.call(this)` 并加了一行"保护"：

```ts
if (!this?.renderingFunction) return;   // ← 致命
```

**为什么致命**：`timer.ts:195` 是 `stageRendering(deltaTime)` —— **裸函数调用，没有接收者**。
所以 `this` 恒为 `undefined`，这行保护**每帧都执行 return**，一个像素都不画。

而 `UI.drawXxx()` 之所以能工作：`ui-window.ts` 在模块加载期把 `UIEngine.drawXxx`
镜像成 `UI.drawXxx`，于是它是**方法调用**，`this` 自然绑定到 UI 单例 ——
那些实现里的 `this.scaleX` / `this.centerX` 才取得到值。

**教训**：不要给「和原实现不一样的调用形态」打补丁。先看清原来的接收者是谁；
`UIEngine.drawXxx.call(this)` 与 `UI.drawXxx()` 在类型系统里都没问题，
差别只在运行时 `this`，tsc 和 lint 都拦不住。

> 附带一个坑：`UI` 在本文件里**不能**用 `import { UI } from '@app/ui/ui-window.ts'`
> —— 那是 `ui-window.ts → ui-engine.ts` 的静态循环导入。现在改用
> `getLazyWindow('ui', loadUI)`（`loadUI` 从 `stores/ui.ts` 导出复用），
> 只在运行时解析目标，天然避开循环。

### 原因二：`background` 的写入方和读取方不是同一个存储位置

和附录五**同一个缺陷类**，但这次的症状是"画成了透明"而不是"抛错"：

- 读取方：`ui-engine.ts:drawBackground` → `getUIStore().background`；
- 写入方：`ui-events.ts:30` 的 `this.background = new StageColor(...)` → 写 **UI 单例**；
- store 的 `loadFromConfig` 动作只是 `UI?.loadFromConfig?.(config)` **纯转发**。

于是 store 里永远是构造时那个透明兜底值，每帧 `clearColor(0,0,0,0)` —— 黑屏，零报错。

**修法**：让 store 的 `loadFromConfig` **自己**建 `StageColor`（它才是 `drawBackground` 的真源），
再继续调用 `UI.loadFromConfig` 以兼容仍读 `UI.background` 的遗留路径（如 `saveToConfig`）。

### `StageColor` 的真实输入格式是 **8 位 RGBA hex**

写这个修复时踩到的第三个坑：想当然以为 `StageColor` 是 6 位 RGB。它的 `input()` 是

```ts
this.red = parseInt(hex.slice(0, 2), 16) / 255;   // …green/blue
this.alpha = parseInt(hex.slice(6, 8), 16) / 255; // ← 第 4 位是 alpha
```

所以**6 位输入会让 `alpha` 变成 `NaN`**（`'ffffff'.slice(6,8)` 是 `''`），
`getGLRGBA()` 再把 NaN 混进 GL 状态。默认配置给的就是 8 位
（`services/project/config.ts` 的 `uiBackground: '00000000'` / `uiForeground: '000000ff'`）。
落地的 `safeHex` 归一化规则：**8 位原样 / 6 位补 `ff` / 其余退回 fallback**。

### 这一类缺陷的判别口诀

凡是「迁移后不报错、只是**什么都不显示**」的，去查**读取方与写入方是否指向同一个存储位置**。
`?.`（静默跳过）和"读到兜底值"（画成透明/空）都不会进 stack，
只能靠下面两个动作发现：

```bash
# ① 写入方到底写的是谁
rg 'getUIStore\(\)\.<字段>\s*=' packages/editor/src   # store 侧写入方（0 命中就是分叉了）
rg 'this\.<字段>\s*=' packages/editor/src            # 遗留侧写入方（可能才是真源）
# ② 读取方读的是谁
rg 'getUIStore\(\)\.<字段>|this\.<字段>' packages/editor/src
```

回归保护：`__tests__/ui-state.spec.ts` 的
「loadFromConfig 把配色写进 store（drawBackground 的真源）」用例
**故意断言具体颜色**而不是"不为 null" —— 透明兜底值也不是 null，
只有具体颜色能抓住这个缺陷。

## 附录七：**「UI 像截图一样冻住」** —— 遗留层读了已迁移字段（2026-09-18）

黑屏修完后暴露的第三个症状：画面能出来，但**点选、拖拽、缩放全部无反应**，
连「选中框」都不出现。用户的原话是「像截图一样完全冻住」。

### 关键判别

「选中框不出现」这一条把范围直接缩小了：`drawTargetWireframe` 是**每帧**画的，
如果只是"不重绘"，已选中的框会留在屏幕上；框完全不出现，说明**选中动作本身失败了**。
于是问题不在渲染，而在 `setTarget` 这条链上。

### 根因：`UI.updateTargetItem` 读了两个已迁走的字段

```ts
// 修复前（ui-transform.ts）
UI.updateTargetItem = function (this: UIShape) {
	const { target } = this;          // ❌ target 已迁到 store ⇒ undefined
	if (target !== null) {
		const { list } = this;        // ❌ list 已迁到元素注册表；未登记时是 `{}` 兜底
		if (read(list) !== target) {  // ❌ read({}) 抛 Invalid value used as weak map key
```

`UI.setTarget` 的**第一句**就是 `this.updateTargetItem!()`，所以：

**每次点选 ⇒ `setTarget` 在第一行抛异常 ⇒ target 从未写入 store ⇒
`drawTargetWireframe` 永远拿到 null ⇒ 没有选中框、没有重绘、没有后续一切。**

而且这个异常被 **Vue 的事件错误处理吞掉**了（只在控制台留一行 warn），
所以既看不到崩溃、也看不到界面变化 —— 完美的"静默冻住"。

### 附带找到的同类：`UI.updateTarget` 与 `meta`

- `UI.updateTarget` 同样 `read(this.list)`，已一并改用 `getUIStore().elements.list`；
- `getUIStore().meta` 也**没有写入方**（`ui-file.ts` 只写 `this.meta`），
  而读取方是 `ui-events.ts` 的 `File.planToSave!(this.meta)` 与
  `usePresetElementWindow.ts:87` 的 `uiId` 取值 ⇒ 已补写。

### 这一类的统一判别手法

```bash
# ① store 里声明了、但全仓库没有写入方的字段（读方必然拿到初值）
rg 'getUIStore\(\)\.<字段>\s*=' packages/editor/src        # 0 命中 = 危险
# ② 遗留层里是否还在读「已经迁走」的字段
rg 'this\.(target|list|meta)\b' packages/editor/src/ui/    # 这些字段的真实位置已不是 this.*
# ③ 该字段的兜底值会不会让读取本身抛错
#    `this.list` 的兜底是 `{}`（见 ui-window.ts 的 `list: (...) || {}`），
#    而 `read({})` / `elementDataOf({})` 会抛 `Invalid value used as weak map key`
```

**特别注意 `.list` 的那个 `|| {}` 兜底**：它让"读一个不存在的元素"从
"明显的 undefined 错误"退化成"一个能通过判空、但一用就抛的假对象"。
`read()` 里的 `if (el == null) return undefined` 恰好挡不住 `{}`。

### 回归保护

`__tests__/ui-state.spec.ts` 新增
「elements.target 跟随 store 的 target（遗留 UI.updateTargetItem 的取值口）」。

## 附录八：**画布上点选无反应，但从左侧列表点选正常**（2026-09-18）

附录七修完后症状变成这样一句非常有信息量的描述：

> 在左侧 UI 对象列表选择组件，可以看到选中框；其他还是一样卡住。

### 这句话直接定位了问题

两条路径的差异就是答案：

| 操作 | 调用链 | 结果 |
| --- | --- | --- |
| 左侧列表点选 | `UI.listSelect` → `UI.setTarget` → store | ✅ 选中框出来了 |
| **画布上点选** | `UI.marqueePointerdown` → `this.selectObject(x,y)` | ❌ 无反应 |

既然列表那条能出框，说明 `setTarget` / store / 绘制链**全都是通的** —— 问题只在
`selectObject` 这一个函数里。

### 根因：`UI.selectObject` 读了已迁到 store 的 `this.root`

```ts
// 修复前（ui-pointer.ts）
return function (this: UIShape, x: number, y: number) {
	return find(this.root.children, x, y);   // ❌ this.root 是 undefined
};
```

`root` 和其它字段一样在迁移中搬进了 store（`ui-file.ts` 的 `getUIStore().root = this.root`），
所以遗留的 `this.root` 从来不会被赋值 ⇒ 读 `.children` 直接抛
`Cannot read properties of undefined (reading 'children')` ⇒ 每次画布点选都在
「先找对象」这一步就断了。

**而列表路径不经过 `selectObject`，所以它照常工作** —— 这正是那句话能定位问题的原因。

### 同形状还有 5 处（一起修了）

| 位置 | 读法 | 后果 |
| --- | --- | --- |
| `ui-pointer.ts` `selectObject` | `this.root.children` | 画布点选失效（主症状） |
| `ui-transform.ts` `updateElementFont` ×2 | `this.root` | 换字体不刷新 |
| `ui-transform.ts` `updateElementLanguage` | `this.root.children` | 换语言不刷新 |
| `ui-transform.ts` `updateElementTextScaling` | `this.root.children` | 改文本缩放不刷新 |
| `ui-transform.ts` `UI.resize` | `this.root.resize()` | **缩放/改尺寸时不重算根节点** |
| `ui-transform.ts` `UI.updateElement` | `this.nodes` / `this.root` | 元素改名/属性同步失效 |
| `ui-events.ts` `loadFromConfig` 的 foreground 回调 | `this.root.resize()` | 改前景色不重绘 |

### 类型上的附带收获

`root` 在 store 里的类型是 `UIElementInstance`，成员不足以覆盖遗留层的用法。
没有用 `as unknown as`（那会给 `unknown-casts` 加 1），而是在 `ui-transform.ts` 里
声明了一个 `interface UIRootApi extends UINodeShape { … }` 单次断言 ——
`extends UINodeShape` 是必需的，因为这些实例本身还要被当作 `UINodeShape`
传给递归的 `update()` / `find()`。

### 判别口诀（本类缺陷第四次出现了）

**凡「某个入口能用、另一个入口不能用」的，先把两个入口的调用链并排写出来，
差异点就是根因所在。** 然后对差异点里的每个 `this.<字段>` 问一句：
这个字段还在 `this` 上吗，还是已经搬到 store/注册表了？

```bash
# 一次扫出「已迁走但遗留层还在读」的字段
rg 'this\.(root|nodes|target|list|meta|history|background|foreground)\b' packages/editor/src/ui/
# 对照：这些字段在 store 里的写入方
rg 'getUIStore\(\)\.(root|nodes|target|meta|history)\s*=' packages/editor/src
```

## 附录九：**画面能出来、但平移/缩放完全不动，且一个异常都没有**（2026-09-18）

这是整个 UI 迁移排查里最难的一类：**不崩、不报错、只是不动**。
最后靠屏幕浮层诊断（使用者无法访问控制台）拿到关键数据才定位。

### 决定性证据

```
init=done                                  初始化完整跑完
after=scr=1 mrq=1 lst=1 zt=1 itm=1 pts=1   所有字段就绪
store: st=open tgt=Y zoom=1 w=1920 h=1080  状态正常，甚至已选中元素
frames=221 click=11 drag=N                 事件到达画布、dragging 没卡住
ERR: -                                     没有任何异常
```

「一切正常、没有异常、但画面不动」把范围直接压到：**绘制用的输入量从来没变过**。

### 根因：`matrix` 有两份，改的和读的不是同一个

| | 位置 | 谁在用 |
| --- | --- | --- |
| 相机**写入** | `UI.matrix`（`ui-initialize.ts` 的 `this.matrix = new Matrix()`） | `ui-engine.ts` 的 `updateTransform`：`this.matrix.reset().scale().translate()` |
| 绘制**读取** | `getUIStore().matrix` | `element-base.ts:85/149`、`ui-engine.ts:477/567/638` |

`getUIStore().matrix` **全仓库没有任何写入方**（`rg 'getUIStore\(\)\.matrix\s*='` 零命中），
所以它永远是构造时那个**单位矩阵**。相机怎么平移缩放，绘制都用同一个单位矩阵
—— 画面逐像素不变。

**为什么连异常都没有**：单位矩阵是完全合法的值。不像 `null`（会抛 `reading 'x' of null`），
它安静地算出一份"看起来没问题"的结果。

### 这个坑是排查者自己挖的：把「崩溃」换成了「静默失效」

早先为这个字段加过一个兜底：

```ts
// 当时的想法：矩阵是"纯计算对象"，给它个实例就不会 null 崩
const matrix = shallowRef<Matrix>(new Matrix());
```

它确实挡住了 `reading 'drawBackground' of null` 那次崩溃 ——
**但也顺手把"看得见的崩溃"变成了"看不见的冻结"**，让后面三轮排查都找错了方向。

> **教训（写给后续所有批次）**
>
> 给 store 字段补"安全初值"之前，必须先回答：**这个字段是谁在改？**
> 如果它是被别处**持续变更**的状态（矩阵、滚动位置、相机参数），
> 那么一个"隔离的初值"就等于把共享状态劈成了两份 —— 读者永远看不到变更。
> 兜底值只应该用在**真正只读的常量**上。
>
> 判据：`rg 'getUIStore\(\)\.<字段>\s*='` 零命中，而该字段又出现在绘制/计算路径上
> ⇒ 它极可能是「另一份副本」，而不是「常量」。

### 修法

`ui-initialize.ts` 里把**同一个实例**交给 store：

```ts
this.matrix = new Matrix();
getUIStore().matrix = this.matrix;   // ← 之后两边是同一个对象
```

初值仍保留（防初始化前读到 null），但它不再是真源。

### 这一类缺陷的完整清单（本次迁移累计发现）

`target` / `list` / `meta` / `root` / `nodes` / `history` / `dragging` / `hover` /
`scroll*` / `background` / `foreground` / **`matrix`** —— 全部是同一个形状：
**store 声明了字段，但真正的写入方在遗留单例上。**

区别只在于"症状形态"：

| 症状 | 触发条件 |
| --- | --- |
| 抛 `Cannot read properties of null` | 读取方用了 `!`，且初值是 `null` |
| **静默不显示 / 不更新** | 读取方用了 `?.`，或初值是**合法值**（单位矩阵、透明色） |

后一种永远更难查。凡是"迁移后只是不显示/不动"的，一律先去查**读写是否同一存储位置**。

## 附录十：**把自由函数误改成方法调用** —— 迁移脚本的机械产物（2026-09-18）

附录九修完（矩阵）后，浮层诊断立刻抓到下一个真实异常：

```
TypeError: Data.manifest.changes.append is not a function
    at File.planToSave      (file-system-core.ts:236)
    at UI.planToSave        (ui-events.ts:21)
    at UIEngine.shiftTarget (ui-engine.ts:155)   ← 拖动元素时每帧都调
    at ui-pointer.ts:388
```

**拖动元素时每移动一像素就抛一次** —— 所以「拖拽完全无反应」，
而且 `shiftTarget` 里排在后面的 `requestRendering()` 永远执行不到。

### 根因：`@app/utils/array` 是**自由函数**，却被写成了方法

```ts
// @app/utils/array
export function append<T>(arr: T[], value: T): boolean { if (!arr.includes(value)) { arr.push(value); … } }
export function remove<T>(arr: T[], value: T): boolean { … arr.splice(index, 1) … }

// ❌ 迁移后的写法（changes 是普通数组，没有 append/remove 方法）
Data.manifest.changes.append(meta);
Data.manifest.changes.remove(meta);

// ✅ 全仓库几十处的正确形态（services/updater/*.ts 全是这样）
append(getDataStore().data.manifest!.changes as unknown[], meta);
```

`git log -S 'changes.append'` 指向**唯一一个提交**：`d087d0cd refactor(editor): legacy migration`
—— 即迁移时把 `append(changes, meta)` 机械改写成了 `changes.append(meta)`。

### 为什么 tsc 全程没拦住

那些元素类型带**索引签名**，把成员访问"洗"成了 `any`：

```ts
interface UIElementShape { [k: string]: any; }   // ← element-base.ts:8
```

于是 `element.parent!.children` 的静态类型是 `any`，`.remove(x)` 怎么点都不报错。
`Data.manifest` 同理（`manifest: null` + 松散对象），`changes.append` 也不报错。

**这是本次迁移最危险的一类盲区**：`!` 抹掉 null、索引签名抹掉成员检查 ——
两个逃生口合起来，能让「一定会抛的代码」完整通过全部静态检查。

### 完整的家族清单（同一个机械改写，共 8 处）

| 文件 | 错误写法 | 正确写法 |
| --- | --- | --- |
| `file/file-system-core.ts` | `changes.append(meta)` | `append(changes, meta)` |
| `file/file-system-core.ts` | `changes.remove(meta)` | `remove(changes, meta)` |
| `file/directory-object.ts` | `changes.remove(meta)` | `remove(changes, meta)` |
| `engine/ui/element-base.ts` ×2 | `children.remove(element)` | `remove(children, element)` |
| `scene/scene-context.ts` ×3 | `actors/animations/particles.remove(o)` | `remove(arr, o)` |

**同一个文件里两种形态并存**是最好认的指纹 —— `element-base.ts`：

```ts
if (element && append(this.children, element)) {      // ✅ 自由函数
    element.parent!.children.remove(element);          // ❌ 方法形态（同一函数、同一数组）
}
…
if (… && remove(this.parent!.children, this)) {        // ✅ 自由函数
```

### 如何系统排查这一类（可复用）

```bash
# ① 自由函数的定义（这些名字一旦以 `.name(` 出现就要警惕）
rg '^export function (\w+)' packages/editor/src/utils/array.ts

# ② 方法形态的调用（带参数的 .remove 才是可疑的：DOM/Timer 的 .remove() 不带参数）
rg '\.(append|remove|subtract)\s*\(\s*[^)\s]' packages/editor/src

# ③ 逐个辨认接受者：普通数组（`= []`）就是 bug；自定义集合/类方法是合法的
#    本次合法的：classList.remove / Window.frames / TextureManager.append /
#    LanguageMap.append / makeTargets.remove / UIInstanceList.setProperty・resize /
#    Resources.remove / scrollListener.remove
```

### 教训

**迁移把「函数」改成「方法」时，唯一的护栏是类型。** 而本仓库的
`[k: string]: any` 索引签名与 `!` 断言恰好把这道护栏拆了。
所以这类改写必须**在改的当时**用「同一文件里是否还有另一种形态」自查
（`append(x, y)` 与 `x.append(y)` 绝不该在同一文件里共存），
事后只能靠运行期崩溃发现。

## 附录十一：**事件编辑器插入指令** —— 空白行没有 command，却带着 fold 把手（2026-09-18）

浮层诊断（附录九/十那套）在用户点「插入指令」时抓到：

```
TypeError: Cannot read properties of null (reading 'folded')
    at updateCommandElementFold (command-api.ts)
    at updateCommandElement     (command-api.ts)
    at bindRowElement           (command-api.ts)
    at setRef (vue)   ← Vue 的 :ref 回写桥
```

异常发生在 Vue 的 `setRef`（`:ref` 回写桥）里，会**打断整棵子树的 patch**，
紧接着连锁爆出 `Cannot set properties of null (setting '__vnode')` ——
后者是 DOM 与虚拟树失配的后果，不是独立问题。

### 两个独立成因

**① `command` 是合法可为 null 的**

`CommandRowData.command` 的类型就是 `CommandData | null`。列表末尾那行"插入指令"的
**空白行**，其 `dataItem` 由 `createBlankElement` 明确写成 `get: () => null`，
`rebuildCommandRowData` 于是记成 `command: null`。而实现写的是：

```ts
if (element?.fold) {
	const command = rowOf(element).command;
	const folded = !!command!.folded;   // ← `!` 把合法的 null 分支抹掉了
```

空白行天然没有"折叠"概念 ⇒ 加一行 `if (!command) return;`。

**② `fold` 把手只加不减**

`bindRowElement` 只在 `source.fold !== undefined && node.fold === undefined` 时创建把手，
**从不清理**；而行内重建那一步还刻意保留了 `.command-fold` 子节点。于是行元素被 Vue
复用到**不可折叠**的行（例如空白行）时，仍带着 `fold` ⇒ 走进上面那条错误分支。
修法是与创建条件**对称**地清掉：

```ts
} else if (node.fold !== undefined) {
	node.fold.remove();
	node.fold = undefined;
}
```

### 回归保护

两条用例并入 `YMCommandList.lifecycle.spec.ts`（不新建文件 —— 新增文件会抬高
`dom-whitelist-drift.coveredFiles` 这个派生计数）。**已实测非空转**：
撤掉修复后两条都用**用户报的那句原文**
（`TypeError: Cannot read properties of null (reading 'folded')`）失败，恢复后通过。

### 教训

`!` 断言的危害在这一类缺陷里反复出现：**它把"类型上合法的 null 分支"变成运行期崩溃**，
而且因为类型本来就写着 `T | null`，`tsc` 完全没有意见。
遇到 `foo!.bar`，先问一句：**这个 `foo` 在类型上可空吗？** 可空就说明存在合法路径。

## 附录十二：`null-casts` 轴的拆解与降本（2026-09-18，第 21 轮）

### 关键结构性发现：一个断言，两条轴

`null as unknown as T` **同时命中**台账里两个正则（`NULL_CAST_RE` 与 `UNKNOWN_CAST_RE`），
所以每一处都在 `null-casts` 与 `unknown-casts` 上**各记一笔**。
⇒ 689 处 null-cast 里有 689 处同时也是 unknown-cast。
把这个形态整体清掉，等于两条轴一起减 —— 这是整张台账里杠杆最大的单点。

### 实测构成（`npm run migration:null-dead-stores`）

| 形态 | 数量 | 性质 |
| --- | --- | --- |
| ② 对象字面量 `prop: null as unknown as T` | **584**（38 文件） | 不是死写：接口声明非空，初值只能写 null ⇒ **要改类型**才能去掉 |
| ① 赋值 `X.prop = null as unknown as T` | **82** | 混合：其中一部分是**纯死写**，可直接删 |
| ① 里的「直线型死写」 | 初始 19 → 现在 **0** | 本轮已全部清除 |

② 集中在：`command-object.ts` 74、`sprite.ts` 65、`transition-window.ts` 58、
`attribute-window.ts` 51、`local-window.ts` 44、`enum-window.ts` 40…

### 本轮的收益（已锁定进基线）

删掉 3 处「先写 null、紧接着又赋真值」的直线型死写块：

| 文件 | 删除行 | 说明 |
| --- | --- | --- |
| `plugin/plugin-initialize.ts` | 14 | 7 个成员占位 + 7 条 `no-explicit-any` 豁免 |
| `commands/custom-command-window.ts` | 6 | 6 个成员占位 |
| `composables/useTeamWindow.ts` | 6 | 6 个成员占位 |

**结果：`null-casts` 689 → 670，`unknown-casts` 1450 → 1431**（各 −19），
`tsc` 0 错、全量 2052 用例通过、行为不变（死写无可观测语义）。

### 工具：`scripts/null-cast-dead-store-audit.mjs`

```bash
npm run migration:null-dead-stores            # 汇总
npm run migration:null-dead-stores -- --list  # 逐条候选
```

判据（三条同时满足才算死写）：
1. 之后存在对**同一路径**的再赋值，且右侧不是 `null as unknown as`；
2. 占位写与再赋值之间**没有读取**该路径；
3. 两者处于**同一个大括号深度**。

第 3 条是踩坑后加的：只看位置会把**跨函数的延迟赋值**误判成死写。实测误报形态：

```ts
let animationWindow = null as unknown as typeof Animation;   // ← 不是死写
export function bindAnimationWindow(instance) { animationWindow = instance; }
```

以及类字段在异步 `create()` 里赋值（`module/editdata.ts` 的 `editor` / `model`）。

工具还区分**直线型**（中间各行全部是对同一 family 的赋值 ⇒ 可直接删）
与**需人工确认**（中间夹了函数调用，可能间接读写）。当前报告：
直线型 0、需人工确认 11（`animation-window-engine.ts` / `editdata.ts` 是已确认的误报；
`enum-window.ts` 因为中间有 `bindListClipboardMethods({...})` 这类**间接写入**，
工具看不见 ⇒ 不报为可删，留给人工）。

### 下一步（给后续轮次）

1. **① 剩余 82 处**：用上面的工具逐文件核；间接写入形态要人工看。
2. **② 584 处**：这是主战场，做法是**把接口里对应成员放宽成可空/可选**，再把
   `null as unknown as T` 换成 `null`。每个文件两步：改 interface → 改字面量；
   中间产生的调用点报错全部由 `tsc` 找出来（这是安全的，因为类型变honest 而非变松）。
   建议按文件从少到多做（`command-object.ts` 74 处最大，可放最后）。
3. 注意 ② 与 `any-hatches` 可能重叠：给单例抽 interface 时，顺手别再用索引签名接盘。

### 教训

「占位写」不都是必需的。**先写 null 再赋真值、中间无读取**的那一批是纯死写，
删掉零风险且两轴同降。而"接口非空 + 初值 null"的那一批才需要真的改类型。
用工具把两类分开，比整体啃 689 处现实得多。

### 第 22 轮：② 的四种可安全去除法（实测）

关键认识：**`null as X` 被 `strictNullChecks` 直接禁掉**（"Conversion of type 'null' to type 'X'
may be a mistake"）—— 这正是这个形态必须绕 `as unknown as` 的原因。
所以去掉它只有两条路：**(a) 把目标类型放宽到含 `null`**（会波及读取方，产生 `!` 级联），
或 **(b) 重构掉占位本身**。本轮走的是 (b) 与 (a) 的轻量形态，共 −13 处：

| # | 手法 | 适用形态 | 本轮实例 |
| --- | --- | --- | --- |
| 1 | **类型本来就含 `\| null`** ⇒ 直接 `null as T \| null`（类型完全不变，只删掉 `unknown` 中转） | `null as unknown as T \| null` | `useGetObjectPropertyCommandSchema` / `useRequestURLCommandSchema` / `update-log-window` / `printer`（共 8 处） |
| 2 | **真值在同作用域已可得** ⇒ 字面量里直接内联，占位消失 | 循环变量/参数就在手边 | `engine/animation/animation-player.ts` 的 `layer: null as unknown as PlayerLayer` → `layer`（循环变量） |
| 3 | **把子对象提前成局部 const** ⇒ 有序数组可内联进字面量 | `list/rectList: null as unknown as {x;y;angle}[]` 后紧跟整体赋值 | `ui/ui-initialize.ts`（用已有 `UIControlPoints` 标注 + `list: []`）、`animation/animation-initialize.ts`（提取 `rectRotate`/`rectResize` 两个 const） |
| 4 | **标注成标准库类型** ⇒ 其属性本就允许 null | `{ writable: true, value: null as unknown as T }` | `data/metadata.ts` → `const fileDescriptor: PropertyDescriptor`（`value?: any`，`null` 直接合法） |

**累计：`null-casts` 689 → 657，`unknown-casts` 1450 → 1418**（各 −32），
`legacy-ui-lines` 未受影响（`src/ui/` 内的改动保持净零行）。

### 剩余 ②（566 处）的处理顺序

按文件升序推进（工具 `--slots` 给出完整列表），优先挑**符合上表 1–4 形态**的先做；
剩下的才需要动接口（放宽为 `T | null`，再由 `tsc` 逐个找出读取方补 `!`）。

⚠️ **不要用 PowerShell `Set-Content` 改这些文件**：它会丢掉 UTF-8 BOM，
在 diff 里制造一整行"看不见的改动"。本轮踩过一次，已用字节级 `ReadAllBytes`/`WriteAllBytes` 补回。
如需批量改写，请保留原文件的前 3 字节（`EF BB BF`）。

### 第 23 轮：③「延迟绑定单例」—— 一个写法吃掉 348 处（含 82.9% 的存量）

先把存量按**语法位置**归类（`pnpm migration:cast-shapes`）：

| 形态 | 数量 | 占比 |
| --- | --- | --- |
| `literal-prop`：对象字面量里的属性初始化 `name: null as unknown as T,` | 539 | 82.9% |
| `stmt-assign`：语句赋值 `x = null as unknown as T` | 63 | 9.7% |
| 其它 | 43 | 6.6% |
| `decl-init`：`const x = null as unknown as T` | 5 | 0.8% |

`literal-prop` 只分布在 **29 个字面量**里，且绝大多数是同一类东西 ——
**「单例模块对象 + 延迟绑定槽」**：

```ts
export const Sprite: SpriteModule = {
	state: 'closed',
	body: null as unknown as YamiElement,   // ← 声称是 YamiElement，实际是 null
	...
};
```

槽位（DOM 元素、canvas 上下文、方法）在 `initialize()` 之前**没有合法值**，
所以这些占位只能靠 `as unknown as` 圆谎。改法：

```ts
export const Sprite = {
	state: 'closed',
	...
} satisfies Partial<SpriteModule> as SpriteModule;
```

要点：

- `satisfies Partial<T>` **保留全部检查强度**：字段名拼错报 `TS2561`、类型写错报 `TS2322`、
  内联方法的参数仍按上下文推断；而槽位不再被谎报，由 `initialize()` 里的真实赋值补齐
  （那些赋值同样逐字段受检）。
- 这是既有手法的推广：`attribute-window.ts` / `variable.ts` / `plugin.ts` 早就写成
  `const x: Omit<T, '桥键'> = {…}` + `export const X = x as T`。
  `Partial<T>` 与 `Omit<T, 一长串键>` 检查强度相同，但**不必枚举键**。
- **为什么不走「把字段类型放宽成 `T | null`」**：那等于把同一处谎言扩散到每一个读取点，
  几十处 `!` 级联，而不是消除它。
- 运行期差别只有一个：被删的键由「值为 `null`」变成「键不存在」（读取得 `undefined`）。
  落地前已全仓核对：不存在 `X.slot === null` 形式的比较（7 处命中全部落在真正的
  `null` 初值上，如 `Sprite.dragging`、`menu.submenu`，那些行原样保留）；
  唯一的展开处 `{...Localization, idMap}` 只做真值判断（`if (module.closePropertyPanel)`），
  `null`/`undefined` 等价。

| 手法 | 触发条件 | 处理 |
| --- | --- | --- |
| 5a | 字面量顶层、单行属性、右值恰为 `null as unknown as …` | 自动清理（348 处 / 18 文件） |
| 5b | 类型标注跨行（`searcher: null as unknown as` 换行接 `HTMLElement & {…}`） | 人工（本轮剩 6 处） |
| 5c | 占位在嵌套层级（`Partial` 是浅层的，删了会让内层对不上类型） | 人工（本轮剩 5 处，如 `variable.ts` 的 `inputs.*`） |
| 5d | `.vue` 脚本段里的局部对象字面量 | 人工（本轮剩 10 处） |

### 三个必须记住的坑（都是本轮真实踩到的）

1. **`satisfies Partial<T> as T` 不总是合法。** `as` 要求两侧之一可赋值；若字面量里**保留了**
   值为 `null`、而声明类型是 `X | null` 的成员，两侧互不可赋值 ⇒ `TS2352`
   （本轮 18 个文件里挂了 4 个）。补一个中间断言即可，且**不需要** `unknown` 中转：
   `… satisfies Partial<T> as Partial<T> as T`（`T` 必然可赋给 `Partial<T>`，所以第二步恒合法）。
2. **正则里的 `[ \t]*$` 会漏掉 CRLF 文件**：`split('\n')` 后行尾留着 `\r`，
   于是整批「非单行属性」被误判成需人工（`data-object.ts` 26 处全部误判）。
   写成 `[ \t\r]*$`。同理，`dli` 这类"找声明行"的正则要用 `\{\s*$`。
3. **⚠️ 仪器会瞎，而且瞎得像"指标改善"**：`scripts/lib/ui-slots.mjs` 的 `declaredSlots()`
   写死了 `indexOf('export const UI: UIShape = {')` 与 `indexOf('\n};')`。
   声明形态一改，它**静默返回空数组** —— 台账里 `declared` 从 156 掉到 0，
   看上去是进步，实际是探测面归零（`audit-ui-slots.mjs` 还会输出一张全空的"三态核对"表）。
   已改成「正则匹配声明（类型标注可有可无）+ 花括号配平找闭合」，并把 `audit-ui-slots.mjs`
   里那份重复实现删掉改为 import —— **仪器只维护一份**。
   *教训：指标下降时，先确认是「问题变少」还是「探针失效」。*

**本轮结果（已锁定进基线）**：`null-casts` 657 → 302，`unknown-casts` 1418 → 1063，
`legacy-ui-lines` 2895 → 2873（`ui-window.ts` 少 22 行占位，`src/ui/` 内仍无新增注释）。
工具：`scripts/lazy-slot-codemod.mjs`（`pnpm migration:lazy-slots`，默认 dry-run，加 `--apply` 才写盘）
与 `scripts/null-cast-shapes.mjs`（`pnpm migration:cast-shapes`，只读，给出形态分布与各字面量簇大小）。

### 本轮顺带观察到的两件事（都不是本轮引入，留给后续轮次）

1. **全量 vitest 每次都会带 1 个未处理的 teardown 竞态**：`EnvironmentTeardownError: Cannot load '…'
   after the environment was torn down`，报错模块三次运行里换过（`title/menu-bar.ts` ×2、
   `stores/custom-command.ts` ×1）⇒ 是惰加载（`getLazyWindow` 那条链）在并行 worker 拆环境后
   才 resolve 的系统性竞态，不是某个文件的问题（涉及的 spec 单独跑 3/3 通过）。
   `Test Files 250 passed / Tests 2052 passed` 三次一致，但进程退出码是 1 —— 用 CI 判定时要记得
   把这一条和真实失败区分开。
2. **`pnpm format:check` 全仓 296 个文件不合规（改动前就如此）**，其中一类是纯 CRLF 文件
   （`oxfmt --check` 拒绝 CRLF）。`local-window.ts` / `data-object.ts` 在 `oxfmt --write` 后
   被规范成 LF（与其余文件一致），另外三个本轮只做机械替换的文件
   （`transition-window.ts` / `color-picker-window.ts` / `image-crop-window.ts`）保持原 CRLF 未动。
   **不要为了清零这个数字跑 `pnpm format`** —— 它会一并重排 `LayoutPanel.vue`（见正文警告）。

### 第 24 轮：④「内联类型字面量」（5e）与「无标注单例」（5f）—— 再 −185 处

第 23 轮之后剩下的 200 处 `literal-prop` 里，**181 处集中在 4 个文件**，
而它们的写法与 5a 都不同（5a 的前置条件是「类型标注与 `= {` 同行」）。两类：

**5e：类型标注是跨行内联类型字面量**（`command-object.ts`，74 处）

```ts
export const Command: {                 interface CommandShape {
	target: typeof commandState.target;     target: typeof commandState.target;
	initialize: CommandMethod;      →       initialize: CommandMethod;
} = {                                   }
	initialize: null as unknown as …      export const Command = {
};                                      } satisfies Partial<CommandShape> as CommandShape;
```

把匿名类型提成具名 `interface`，其余与 5a 完全一致。若 `NAMEShape` 已被占用则跳过。

**5f：无类型标注、类型靠 cast 推断出来**（`transition-window.ts` / `color-picker-window.ts` /
`image-crop-window.ts`，111 处）

```ts
export const Easing = {                    const EasingBase = {
	data: null as EasingData[] | null,         changed: false
	scale: null as unknown as number,        };
};                                         interface EasingSlots {
                                           	data: EasingData[] | null;
                                           	scale: number;
                                           }
                                           export const Easing = EasingBase as typeof EasingBase & EasingSlots;
```

5f 的关键设计：

- 槽位那几行**原地搬进 interface**，只去掉 `null as [unknown as] `、把结尾 `,` 换成 `;`
  ⇒ 多行类型、类型里的注释、缩进全部原样保留（`list:` 那种 `null as` 后换行的也照办）。
- **真实值部分不写类型**，靠 `typeof NAMEBase` 推断 ⇒ 逐属性与改动前一致，
  不必人工抄写几十个成员类型；也正因为两个成员集互不相交，交集不会把属性收窄成 `never`。
- `as` 的方向是「交集 → 其成员」，必然可赋值 ⇒ 合法且**不需要 `unknown` 中转**。
- 真实值为空时（`Color` / `ImageClip`）不造空 base，直接 `export const X = {} as XSlots;`。

**本轮结果（已锁定进基线）**：`null-casts` 302 → 117，`unknown-casts` 1063 → 878，
涉及 4 个文件（`command-object` / `transition-window` / `color-picker-window` / `image-crop-window`）。

### 第 24 轮的三个坑（每个都差点把缺陷放出去）

1. **按逗号切属性会丢掉最后一个**：最后一个属性是以**闭合括号**结尾的，不是逗号。
   第一版把 `}` 当「深度减一」处理 ⇒ `close: null as (() => void) | null` 被整个吞掉。
   它没被立刻发现，是因为**删掉一个槽位不会报错**——最后是 `stores/easing.ts` 读
   `Easing.close` 时 tsc 报 `TS2339` 才暴露。**终止判定要在括号更新之前做**。
2. **`as` 后面不能用 `\s+`**：`null as\n\t\t| (YamiElement & {…})` 这种换行写法的类型，
   `\s+` 会把换行一起吃掉，生成 `list: | (…)`（合法但很难看）。要写成 `as[ \t]*`，
   并且只在「类型与名字同行」时补空格。
3. **生成文本要用「EOL 归一化后的逐行对比」验证，不能靠 `git diff`**：
   本仓 `core.autocrlf` 让 `git diff` 对**行尾差异完全免疫**，
   于是 `oxfmt --write` 的 EOL 转换在 diff 里是隐形的（第 23 轮已踩过一次）。
   本轮改成「复制到临时目录 → `oxfmt --write` → 两边 `ReadAllText` 后把 `\r\n` 换成 `\n`
   再逐行比」，一次就抓出 `…EasingSlots;;`（多吃了一个原字面量结尾的分号）
   和 interface 后面挂着的 `};`。

### ⚠️ 又一个「仪器瞎了」，这次是 PowerShell

```powershell
# 假阴性：目录 + -Include 但不带 -Recurse ⇒ 一条都找不到，看起来像「全仓没有」
Select-String -Path packages/editor/src -Include *.ts,*.vue -Pattern '…'
```

`-Include` 只在「带 `-Recurse`」或「路径本身带通配符」时生效。用它做过的一次
「`Easing`/`Color`/`ImageClip` 有没有 `=== null` 比较、有没有被展开」审出的是**空结果**，
差点被当成「已核对、无风险」。改用递归检索（ripgrep / `grep` 工具）复核后结论不变
（确实没有），但**这类「空结果」在下结论前必须换个工具再验一次**。
同理，`-Path <目录>`（不带 `-Include`）是会递归的，所以只错在「目录 + `-Include`」这一种组合。

### 第 25 轮：技法 6（赋值形态）—— −72 处，以及**一次真实的误删**

剩下的 117 处里最大的一簇是**赋值形态**：模块顶层往单例上补一个还没绑定的槽。

```ts
Animation.list.copy = null as unknown as (...args: unknown[]) => any;
// oxlint-disable-next-line no-explicit-any     ← 连注释一起删，否则变成陈旧豁免
```

删掉它安全，理由是三条**已递归核对**（不是目录 + `-Include` 那种假阴性写法）：

- 槽位类型来自接口声明，**赋值语句本身不参与类型** ⇒ 删掉不会产生类型错误；
- 运行期唯一差别是属性从「存在且为 `null`」变成「不存在（`undefined`）」。敏感的读法只有三种：
  `=== null` 比较（全仓 0 命中）、`Object.keys` / `for…in` 枚举（0 命中）、
  真值判断（`null` 与 `undefined` 同为假，行为一致）；
- 调用点若在绑定前执行，`null is not a function` 与 `undefined is not a function` **同样抛错**。

**结果**：`null-casts` 117 → 45，`unknown-casts` 878 → 806。

### ⚠️ 但是：这个技法第一版删错了 10 行（tsc / lint 都拦不住）

第一版把**缩进的**同类语句也一起删了。缩进意味着它在函数体里，而函数体里的
`X.field = null as unknown as T;` 有两种完全不同的语义：

| 语义 | 例子 | 删掉的后果 |
| --- | --- | --- |
| **预声明**（后面紧跟 binder 赋真值） | `list.copy = null` + 末尾 `bindListClipboardMethods({list})` | 安全 |
| **状态重置** | `Particle.close()` 里的 `this.context/meta/layers/emitter = null` | ❌ 字段**保留旧值** |
| **故意禁用** | `if (this.noWindow) { this.load = null; this.initialize = null; }` | ❌ 回落到原型方法，noWindow 语义反转 |

**实测踩到的 10 处**（已全部恢复）：

- `YMParamList.vue`：`self.start`（×2）、`self.object`。`self.start` 全文件有 **20 多处
  `if (self.start !== null)`** ⇒ 清空失败会让**旧选区复活**，属于功能性回归；
- `Particle.close()` 的 `this.emitter`、`UI.close()` 的 `this.history`（都是关闭时的清场）；
- `plugin-parse-meta.ts` 重置块的 `overview` / `parameters` / `manager`；
- `schema.ts` 的 `if (this.noWindow){ this.load = null; … }`：调用点 `initialize?.()` 会因此
  回落到原型实现。这一处改用**无断言**写法，既保住语义又不再贡献棘轮：

  ```ts
  if (this.noWindow) {
  	// 这两个槽在类上声明为不可空方法，直接赋 null 会被 tsc 拒
  	Object.assign(this, { load: null, initialize: null });
  }
  ```

**为什么 tsc / lint / 测试都没抓到**：删除不会产生类型错误（赋值不参与类型）、
不产生 lint 报错（唯一线索是 `schema.ts` 那个空 `if` 块被 `no-empty` 抓到）、
而运行时后果（旧选区复活、noWindow 语义反转）**只有在 Electron 里操作才会显形**
—— 正是本项目反复吃亏的那一类。

**教训（已写进工具）**：这两类靠静态分析分不开，所以
`scripts/lazy-slot-assign-codemod.mjs` 现在**只删顶格的（第 0 列）**，
缩进的一律只报告、交人工；`--list` 会逐条列出。改动后复核：
顶格剩余 0 处、缩进 11 处全部列在「只报告」里。

### 第 26 轮：逐个「设计型」收尾 —— 45 → 28（这批靠 tsc 当探针）

剩下的每一处都要**先想清楚语义**再动，不能批量。本轮用到的方法：**把类型改对，让 tsc
把「波及面」报出来**——报错少就顺手改完，报错多就说明该换设计。实测数据：

| # | 处理 | 手法 | 波及面 |
| --- | --- | --- | --- |
| 1 | `searcher` / `overviewPane` / `filterManifest` / `context` / `Layer` / `Element` 六个**跨行类型**的字面量属性 | 5b：属性本身就是占位，整段删掉（字面量早已是 `satisfies Partial<T> as T`） | 0 |
| 2 | `text-capture.ts` 的两处 `element: null as unknown as EventTargetElement` | 类型改 `\| null` + 字面量写 `null`。**读侧本来就是 `this.element ? getFocus(...) : undefined`** | 0 |
| 3 | `window-element.ts` 的 `matrix: null as unknown as Matrix` | **饿汉构造**：`matrix: new Matrix()`。`Matrix extends Float32Array(9)`，构造就是置单位阵；`element-base.ts` 的构造函数本来就是 `this.matrix = new Matrix()`，这是跟既有约定对齐 | 0 |
| 4 | `progress-bar-element.ts` 的 `vertexLength` / `drawingLength` | 给「长度」一个自然初值 `0`（`calculateProgressVertices()` 每条返回路径都先写它们再返回） | 0 |
| 5 | `useCommandState.CommandState.id` | 类型改 `\| null` | **2**（`schema.ts` 的 `save()` 里三处补 `!`，并写明「只在解析后调用」这一既有前提） |
| 6 | 两个 `.vue` 里 `withDefaults(defineProps<Props>(), { … })` 的 5 个 `null as unknown as Fn` 默认值 | **直接删掉**：这些 prop 本来就声明成可选（`localize?: …`），可选 prop 的默认值本来就是 `undefined`；读侧也早就是真值判断 / `?.()`。只剩两个 getter 需要 `?? null` 维持 `\| null` 返回契约 | 0（+ `vue-tsc` 兜底） |

**结果**：`null-casts` 45 → 28，`unknown-casts` 806 → 789。

### 两个「探针报错太多」的案例（本轮**故意没动**）

| 候选 | 改动 | tsc 报错 | 结论 |
| --- | --- | --- | --- |
| `CommandState.words` | `\| null` | **184** | `words.push(...)` 遍布几乎所有指令 schema。不能用 `\| null` 硬推 |
| `command-custom.ts` 的 `Command.custom = { … }` | 改成 `satisfies Partial<…> as …` | 15+ | 这个字面量是**赋值形态**（类型来自赋值目标），且内部 ~15 个方法依赖 `this` 的**非可选**类型；`Partial<T>` 会把每个成员变成 `\| undefined` ⇒ 内部全炸。**该文件的形态不适合这套手法**，已在工具输出里标注 |

`words` 真正的解法不是 `| null`：`Command.WordList` 这个构造器是**后绑定**的
（`command-object.ts` 末尾 `Command.WordList = WordList as unknown as …`），所以没法在
`commandState` 初始化时 `new`。要么把绑定顺序提前，要么把「解析中/解析后」做成显式状态机
—— 留给专门一轮。

### 顺带修掉的：**孤立的 `no-explicit-any` 豁免注释**

前几轮删占位行时，紧邻的 `// oxlint-disable-next-line no-explicit-any` 会一起删；
但**不紧邻**的那些就留了下来，而台账的 `stale-exemptions` 轴**只管 DOM 豁免**、
不管这一类，于是它们悄悄累积 —— `data-object.ts` 里一次性堆了 **4 条**（下一行已是 `}`）。
全仓扫描后共清理 5 条（4 + `event-editor.ts` 1 条），现在全仓 0 条。



### 第 27 轮：**仪器修复** —— `codeOnly()` 不认正则字面量（389/1516 文件被少统计）

这一轮最有价值的产出不是清掉几处债务，而是发现**台账对一大批文件一直是瞎的**。

**症状**：`plugin-parse-meta.ts` 里明明有 8 处 `null as unknown as`，台账却记 **0**。
手工清掉 5 处之后，数字**纹丝不动** —— 这就是线索。

**根因**：`scripts/lib/scan.mjs` 的 `codeOnly()` 只处理注释与字符串，**不认识正则字面量**。
该文件是元数据解析器，遍布 `/["']/`、`/`/` 这类正则；扫描器把正则里的引号当成字符串开头，
于是**从那里到下一个同类引号之间的所有代码都被置空**。因为置空是**等长**的（保留换行、
行号仍对得上），肉眼与 diff 都看不出来。

**影响面（实测）**：全仓 1516 个文件里 **389 个**存在「原文命中 > codeOnly 命中」，
其中不全是 bug（注释/字符串里的命中本来就该被吃掉），但已确认的漏统计包括：

| 文件 | 漏掉的 |
| --- | --- |
| `plugin-parse-meta.ts` | `null as unknown as` **8 → 0** |
| `commands/schema.ts` | `null-cast` 1 → 0 |
| `animation-initialize.ts` | `null-cast` 2 → 0 |
| `animation-player.ts` / `custom-command-window.ts` / `useTeamWindow.ts` / `plugin-initialize.ts` | 各 1–2 → 0 |
| （DOM 模式同理，但 `dom-pending` 复核后仍为 0，门禁结论未变） | |

**修复**：给扫描器补上正则字面量识别 —— 用「上一个有意义字符/标识符」判断 `/` 是正则还是除号
（跟在标识符/数字/`)`/`]` 之后是除号；`return`/`typeof` 等关键字之后是正则），
正则体内跳过转义与字符类 `[...]`，不跨行。

**回归测试**：`scripts/lib/self-test.mjs` 新增 5 条用例（25 → **30 通过**），
覆盖「正则含引号 / 含反引号 / 字符类里的斜杠 / 除号不误判 / `return /re/`」。
并且**证明了用例非空测**：拿修复前的算法跑同样输入，命中数是 `0 → 1`。

**⚠️ 这导致两条轴的数字「上升」，属于口径修正而非回归**：

| 轴 | 修复前（瞎） | 修复后（真值） |
| --- | --- | --- |
| `null-casts` | 28 | **35** |
| `unknown-casts` | 789 | **799** |

也就是说：**第 23–26 轮报出的数字都是偏低的历史值**，真实起点比当时看到的高。
按台账的既定流程（「若这是有意的设计变更，请复核后在 PR 里显式执行 `--update-baseline`
并在描述里贴前后对比」），本轮已复核并显式更新基线 + 在此处留档。

### 第 27 轮同时清掉的 8 处（真修复）

| # | 位置 | 手法 | 波及面 |
| --- | --- | --- | --- |
| 1–5 | `plugin-parse-meta.ts` 的 `overview` / `parameters` / `paramMap` / `langMap` / `manager` | 这五个的**初值就是返回的闭包开头立刻写进去的值**（`{ requires: [] }` / `[]` / `{}` / `new LanguageMap()` / `new OptionManager()`）⇒ 直接写成真值，类型保持不可空，读侧一行不改 | 0 |
| 6–7 | `scene-animate.ts` 的 `items` 记录（`tilemap: null` ×2） | 记录的值类型改 `Record<string, HTMLElement \| null>`；读取处本来就是 `if (element)` 真值判断 | 0 |
| 8 | `tree-api.ts` 的 `renderElement` SSR 分支 | 原写 `null as unknown as HTMLDivElement`（谎报非空 host，随后 `render(vnode, null)` 会以难懂方式炸）⇒ 改成**显式抛错**说明「这里需要 DOM」 | 0 |

**本轮净变化**：真值起点 40 → 32（仪器修复 +7，真修复 −8，另有几处第 26 轮遗留的计数变化）。

### 剩余（32 处）：三个「不动」的决定 + 明细

本轮明确**放弃**的两处（都写清了理由，避免下一轮重复评估）：

- **`animation-window-engine.ts` 的 `animationWindow`**（1 处）：`let animationWindow = null as unknown as typeof Animation;`
  ＋ `bindAnimationWindow()` 后绑定。读侧有 **约 40 个 `animationWindow.matrix/xxx()` 调用点**，
  改成 `| null` 就是 40 处 `!` —— 与第 25 轮「批量机械改要付出代价」的教训冲突。
  另外**不能**用「抛错桩」替换：L819 是 `if (animationWindow.layers !== null)`，
  桩会让这个判断恒真 ⇒ **语义被改**。留给「绑定式单例」专门设计。
- **`tree-api.ts` 的 `textBox` IIFE**（1 处）：`if (isSSR) return null as unknown as TextBox;`
  这个 IIFE 在**模块加载时**执行，所以既不能像 `renderElement` 那样抛错（会让无 DOM 环境
  的 import 直接失败），消费方又全都按非空使用（`treeListStatics.textBox.parentNode` 遍布
  ui-kit / editor / 测试）。要动就得先决定「SSR 下这个静态量是什么」这个契约。

其余 30 处的分布：`plugin-parse-meta` 7（`parameter` 声明 1 + 重置块 6）、`variable.ts` 5（嵌套 `inputs.*`）、
`command-custom.ts` 3、`YMParamList.vue` 3、`useCallEventCommandSchema` 2、`image-crop-window` 2、
`YMTabBar.vue` 2，以及 6 个单点文件。

### 第 28 轮：仪器修好之后的第一轮正常推进 —— 32 → 21

扫描器可信之后，先做了一次**全量重排形态**：`stmt-assign` 从 63 掉到 13、`decl-init` 从 11 掉到 4
（不是债务消失了，而是原先有一大批根本没被统计进来 —— 见上一节的仪器修复）。
本轮清掉 11 处，全部是「读侧早就在按可空使用、只有类型在撒谎」的那一类：

| # | 位置 | 手法 | 波及面 |
| --- | --- | --- | --- |
| 1–5 | `plugin-parse-meta.ts` 收尾重置块里的 `overview` / `parameters` / `paramMap` / `langMap` / `manager` | **删掉**：闭包开头（L786 起）会无条件重新赋值，这五行是纯死写；而且 `meta` 已通过 `Object.defineProperties` 持有 `langMap`/`manager` 引用，置空也释放不了内存 | 0 |
| 6–7 | 同文件 `parameter` 的声明与重置 | 类型改 `ParameterShape \| null`。**代码本来就有十来处 `if (parameter === null) return;` 与 `parameter?.type`** —— 只有类型在谎报 | 5 处（都是「解析阶段才可能为 null」的读点，补 `!` 并逐条写明前提：`parseDefault()` 唯一调用点就在 `if (parameter === null) return;` 之后；`append()`/`relate()` 只在解析阶段调用） |
| 8–9 | `YMParamList.vue` 的 `self.start = null as unknown as number` ×2 | `ParamListElement.start` **本来就是 `number \| null`**（L125）⇒ 直接写 `null` | 0 |
| 10–11 | `image-crop-window.ts` 的 `resolve(null as unknown as HTMLImageElement)` 与 `image ?? (null as unknown as HTMLImageElement)` | `new Promise<HTMLImageElement \| null>`：图片加载失败时**确实** resolve null，`.then` 回调本来就按可空声明。`updateTitle` 的参数是 `(...args: unknown[])`，`??` 那一支永远走不到 ⇒ 一并去掉 | 0 |

### 本轮**主动放弃**的一处（连同理由记下来，免得下轮重复评估）

`Particle.emitter`：`close()` 里清空 ⇒ 类型真相是 `ParticleEmitterShape | null`。

> ⚠️ **第 29 轮更正：这里的「15 个编译错误」是错的，真值是 55 个。**
> 第 28 轮读 tsc 输出时用了 `Select-Object -First 16`，把清单截断后当成了全量 ——
> 一个纯粹自己造成的测量错误。第 29 轮重新量（`Select-String 'error TS' | Measure-Object -Line`）
> 才发现 `particle-motion` 一个文件就 40+，`particle-pointer` 还有 12 个。
> **教训：量波及面时必须取全量输出，任何截断都会让「可做/不可做」的判断反转。**

真值 55 处分布在 `particle-motion`（40+）/ `particle-pointer`（12）/ `particle-list`（6）/
`particle-events` / `inspector/particle-layer-page`。补 `!` 是编译期行为、运行期无影响，
所以在「正确性」上无风险；但一次在数值密集的粒子引擎里插入 55 个断言，属于应当单独立轮的改动。

### 剩余 21 处的分布与建议

| 位置 | 数量 | 建议 |
| --- | --- | --- |
| `variable.ts` 的 `inputs.*` | 5 | 嵌套成员改 `\| null` + 读侧；`inputs` 是「元素注册表」语义，可以整体看成一个可空子对象 |
| `command-custom.ts` | 3 | 该字面量是**赋值形态**且内部方法依赖 `this` 非可选（实测改 `satisfies Partial<…>` 会炸 15+ 处）⇒ 要么给这三个字段加 `?`，要么换写法 |
| `useCallEventCommandSchema.ts` | 2 | `let input: … = null as unknown as …` 声明形态，按第 27 轮 `parameter` 的同款做法 |
| `YMTabBar.vue` 的 `hint` ×2 | 2 | 拖拽态契约：`hint` 在 3 条构造路径里有 2 条没有值，读侧却按非空用 ⇒ 要先定「无 hint 的拖拽态怎么办」 |
| `Particle.emitter` | 1 | 见上（15 处断言，安全但成批） |
| `ui-file.ts` 的 `this.history` | 1 | `close()` 清空 + 读侧 `this.history.canUndo()` ⇒ 同 emitter |
| `editdata.ts` 的 `editor` | 1 | 与已改成 `\| null` 的 `model` 成对；约 14 个读点 |
| `useCommandState.ts` 的 `words` | 1 | 184 处读取（`words.push` 遍布指令 schema），**不要**用 `\| null` 硬推 |
| `animation-window-engine.ts` 的 `animationWindow` | 1 | 40 个读点；且不能用抛错桩（`if (animationWindow.layers !== null)` 会恒真） |
| `text-capture.ts` 的 `ColorProxy.color` | 1 | 要动 `read(): string` 契约 |
| `tree-api.ts` 的 `textBox` | 1 | 模块加载期的 SSR 分支，要先定契约 |
| `command-api.ts` | 1 | 单点，未评估 |

**共同的结论**：剩下的每一处都**需要一个契约决定**（要么「这个字段什么时候可以为 null」，
要么「读侧怎么处理」），机械替换的时代已经过去了 —— 这与第 26 轮末尾的判断一致。



### 第 29 轮：把「读侧早就当可空用」的那批一次清完 —— 21 → 12

上一轮量错的那一处先更正（见上），本轮真正清掉 9 处，全部属于同一个模式：
**声明在撒谎，而它所有的读取点早就在按可空处理**。所以每一项都只需要改类型，
再让 tsc 把「少数几个没判空的点」报出来：

| # | 位置 | 手法 | 波及面 | 备注 |
| --- | --- | --- | --- | --- |
| 1–2 | `useCallEventCommandSchema.ts` 两处 `let input: … = null as unknown as …` | 去掉初值，交给 tsc 的「使用前赋值」分析 | **9** | 分析报出 9 处「使用前未赋值」⇒ 两个 `switch` 因为 `CallEventArg.type` 是普通 `string` **本来就无法穷尽**，落空时 `input` 保持 null、在下面的 `setTooltip`/`appendChild` 处以「null 上取属性」炸 ⇒ 各补一个 `default: throw` 明确报错（**这处不是删谎言，而是把一个隐藏的空指针变成了具名错误**） |
| 3 | `editdata.ts` 的 `editor` 类字段 | `(…IStandaloneCodeEditor & { getFocus?: () => void }) \| null` | 5 | 与第 25 轮已改成 `\| null` 的 `model` 成对；补的 `!` 与相邻的 `this.model!` 同一约定 |
| 4 | `ui-window.ts` 的 `UIShape.history` | `History \| null` | 7 | store 侧的 `history` 早就改成 `History \| null` 并写明「调用方必须判空」——只有单例侧没跟上；`ui-list.ts` 的 5 处 `UI.history.save(` 补 `!`，`ui-file.ts` 的 undo/redo 条件改 `this.history?.canUndo()`（`?.` 在条件里顺带完成收窄，函数体不用再改） |
| 5–9 | `variable.ts` 的 `inputs.name/value/number/string/note` | 5 行声明改 `YamiElement \| null`，字面量去掉 cast | **1** | `inputs` 形状里本来就有 `[k: string]: unknown` 索引签名，动态读取（`this.inputs[type]`）走的是它 ⇒ 全仓只有一个读点报错（`panel.ts` 的 `const { style } = Variable.inputs.value`，补 `!`） |

**⛔ 本轮自己踩到并当场纠正的一个坑**：改 `ui-window.ts` 的 `UIShape.history` 时顺手写了一段
7 行说明注释，结果 `legacy-ui-lines` 立刻从 2868 涨到 2874 ——
**`src/ui/` 里加的每一行都算迁移债**（这个约定第 23 轮就写下了）。已把注释缩成零行、
说明挪到本文档，轴回到 2868。以后在 `src/ui/` 里只做**等长或减行**的改动。

### 第 30 轮：赋值形态的 3 处 + 两处单点契约 —— 12 → 7

| # | 位置 | 手法 | 波及面 | 备注 |
| --- | --- | --- | --- | --- |
| 1–3 | `command-object.ts` 的 `windowFrame` / `parameterPane` / `parameterGrid` | 字段改可选（`windowFrame?: …`），带一段说明注释 | 5 | 这一处是**赋形字面量**（类型来自赋值目标），`satisfies Partial<T> as T` 走不通（TS2352：字面量里仍留着值为 `null` 的成员）⇒ 只能把字段改成可选；`command-custom.ts` 的 8 行占位赋值删掉，5 个读点补 `!`（`this.windowFrame!` / `this.parameterPane!`）。与 `initialize()` 里本来就有的 `if (!this.parameterPane) return;` 相互印证：它**本来就当成可空用** |
| 4 | `tools/text-capture.ts` 的 `ColorProxy.color` | `color: string \| null` + `read(): string \| null`，字面量写 `color: null` | 1 | 同一文件里 `VariableProxy.element` 一并改成 `EventTargetElement \| null` |
| 5 | `YMCommandList/command-api.ts` 的 `element.contents` | 删断言、直接赋 `null` | 0 | **不是新契约**：`contents` 的声明本来就是 `CommandContent[] \| null`，当初那句 `null as unknown as CommandContent[]` 纯粹是写法债 |

### 第 31 轮：`YMParamList` 的 `self.object` —— 7 → 6

这一处只值 1 个债点，却是**唯一一个要动 `*.vue` 的**，于是踩到一个此前没遇到过的坑：

1. `ParamListElement.object: ParamObject` 改成 `ParamObject | null` 之后，`pnpm typecheck` 报 **0** —— 看起来像白改；
2. 真正的 10 个读点**全部**由 `typecheck:vue`（`vue-tsc`）报出来：`update()` 2 处、`insert()` 2 处、`edit()` 4 处、`paste()` 1 处、`save()` 1 处。

**为什么这 10 处可以光明正大写 `!`**（而不是把 `| null` 硬推给读侧、也不是加空值守卫）：

- `self.object` 全仓只在 `bind()` 里被赋值，而 `bind()` 在它之前只有一句 `object.initialize(self)`；
- 仓内唯一的 `initialize` 实现（`composables/useArrayWindow.ts` 的 `listInterface.initialize`）只注册两个 click 监听，**不回调 element 的任何方法** ⇒ 不存在「已经能跑 `update()` 但还没 bind」的时刻；
- 其余 9 处全是键盘 / 鼠标处理器，只有列表已经挂上对象、并且有数据时才可能被触发；
- 决定性的一条：HEAD 的运行时值**本来就是 `null`**（`onMounted` 里那句 `self.object = null as unknown as ParamObject`）—— 也就是说 `object: ParamObject` 这个声明**从第一天就在撒谎**。`!` 只是把「所有读侧早就默认的前提」显式写在每个点上，**运行时行为一个字节都没变**（`!` 只存在于编译期）。

顺带清掉同一文件里两处**没有任何轴在统计**的死断言：`state` 字面量的 `object: null as unknown` → `object: null`（声明变 `| null` 之后它就是普通 `null` 了），以及 `self.start = null as unknown as number` ×2 → `self.start = null`。

**本轮的方法论教训（必须记住）**：`*.vue` 里的类型债，`pnpm typecheck` **永远看不见**（ui-kit 的 tsconfig 不含 `*.vue`）。以后凡是改 `*.vue` 里的声明，必须立刻跑 `node packages/editor/scripts/check-vue-types.mjs`，否则拿到的是**假绿**。

### 第 32 轮：`YMTabBar.vue` 的 `hint` ×2 —— 6 → 4（顺带修掉一个真崩溃）

`TabDraggingEvent` 有 3 条构造路径，其中 **2 条本来就没有拖拽提示元素**：

| 路径 | 位置 | hint |
| --- | --- | --- |
| `mode: 'close'`（按住标签上的 × 拖动） | `pointerdown` L351 | **无**（不显示落点提示） |
| `mode: 'popup'`（右键拖出菜单） | `pointerdown` L373 | **无** |
| HTML5 拖动（`dragstart`） | L392 | `createDragAndDropHintElement()` |

所以 `hint: null` 是**如实的**，不是占位：这两条路径的唯一出口 `windowPointerup` 全程不碰 `hint`（它直接 `data.dragging = null` 并摘掉自己）。

**⛔ 但这次把类型改成 `TabHint | null`，顺着读侧追下去发现一个真崩溃（HEAD 就有）**：

`dragend()`（L331）无条件执行 `data.dragging.hint.remove()`，而它**可以**在 `data.dragging` 是「无 hint 的 dragging」时被调用：

- 按住 × 不放（close 拖动已建立），再按另一个鼠标键 ⇒ `pointerdown` 在 L344 先调 `dragend()`；
- 或被中断的 HTML5 拖动的 DOM `dragend` 事件晚到（L606 把 `dragend` 也挂到了 DOM 事件上），而此刻 `data.dragging` 已经是 close/popup 的 dragging。

HEAD 的运行时值就是 `null` ⇒ **`TypeError`**，而且抛出点在 `dragend()` 中段：`data.dragging = null` 和 4 个拖拽监听器的摘除**全都没执行**（留脏状态）。改成 `hint?.remove()` 后语义正好是「没有提示元素就没什么可移除」，并且清理能跑完。

**读侧那 3 处 `!` 是可证的**：`dragleave`/`dragover`/`drop` 只在 `dragstart` 的 `if (!data.dragging)` 分支里注册（L405–408）、只在 `dragend()` 里摘除（L333–336）；而 `pointerdown` 的 close/popup 分支是**先调 `dragend()` 再赋值**（L344 → L360/L379）⇒ 「无 hint 的 dragging」不可能与那 4 个监听器同时存在。

**回归测试（已证非空转）**：`YMTabBar.spec.ts` 新增「close 拖动期间再次 pointerdown：dragend 不因 hint 为 null 而中断」。断言的是**可观测状态**（`dragging` 是否被清成 `null`），不是控制台有没有报错 —— 因为 jsdom 会把监听器里的异常吞成 unhandled error。把 `?.` 临时改回 `.` 复跑：该测试失败，证据正是预期的那两条（`AssertionError: expected { hint: null, …(4) } to be null` + 1 个 unhandled error），改回后 31/31 全过、文件逐字节复原。

**🔍 本轮定位、但有意留给单独一轮的相邻问题**：`windowPointerup` 只在 `if (dragging && dragging.relate!(event))` **成立**时才 `removeEventListener` 自己 ⇒ 若 `dragging` 已被 `dragend()` 清成 `null`，它走「早退」分支、**永不摘除**；而每次 close/popup 拖动都会新注册一个 ⇒ 被中断过的拖动会留下常驻监听器，之后的新拖动会让**多个** `windowPointerup` 同时响应同一次 pointerup（close/popup 副作用可能执行多次）。不能顺手改：「`relate` 为 false 时保留监听」是既有语义（拖动到标签外松手仍保持 armed）。需要单独一轮定契约。

### 第 33 轮：`tree-api.ts` 的 `textBox` —— 4 → 3（IIFE 属性 → 惰性 getter）

这一处的形态是：对象字面量里一个**立即执行的 IIFE**，模块加载期就 `document.createElement`，无 DOM 时 `return null as unknown as TextBox` —— 既谎报一个非空 host，又把「碰 DOM」提前到了**只要 import 就会发生**。

**为什么不照 `renderElement` 那样直接抛错**：那等于把「import 一下就炸」当成代价，而这个模块是被 `@ui-kit` 入口 re-export 的。惰性 getter 把代价推迟到**首次访问**，而首次访问在无 DOM 环境下本来也不可能发生：

```ts
let textBoxInstance: TextBox | null = null;

export const treeListStatics = {
	…
	get textBox(): TextBox {
		if (textBoxInstance) return textBoxInstance;
		if (isSSR) throw new Error('[tree-api] textBox 需要 DOM 环境');
		textBoxInstance = createTextBox();
		return textBoxInstance;
	}
};
```

**只改 ui-kit 是白改**：`packages/editor/src/components/tree-list.ts` 里那个镜像对象写的是 `textBox: treeListStatics.textBox,` —— **模块加载期就求值**，惰性 getter 会被它立刻触发掉（更糟的是：无 DOM 的 import 下会当场抛错）。所以同一轮把它也改成 getter 转发。顺带查清：`TreeList.textBox` 在编辑器里**没有任何读取点**（只有 `TreeList.prototype.*` 在用），但它是导出面（插件可见）⇒ **保留成员**、只改惰性，不删。

**改动的可信度怎么证明**：`createTextBox` 的主体是原来的 123 行**整体降一级缩进**搬过来的。逐行核对的证据是 `git diff -w` —— **这 123 行一行都没出现在 diff 里**（只有「除缩进外完全相同」的行才会这样消失），所以 diff 里剩下的全是真正的语义改动。

**新测试（已证非空转）**：`__tests__/tree-api-lazy-textbox.spec.ts` 用 `vi.spyOn(document, 'createElement')` 记录 import 阶段与首次访问阶段各创建了什么，断言：import 之后**没有**任何 `.node-list-text-box`、首次访问恰好创建一个、再访问拿到**同一实例**。把 `let textBoxInstance = null` 临时改成 `= createTextBox()`（即还原「加载期创建」）后：测试失败，证据正是 `AssertionError: import 阶段不应创建重命名文本框: expected 1 to be +0`；改回后通过、文件逐字节复原。

**两条工具教训（本轮踩到、已绕开）**：

1. **PowerShell 变量名大小写不敏感** —— 我用 `$T="`t"` 存制表符，而 `$t` 正是文件内容，结果**把内容覆盖成了一个制表符**。所幸脚本在写入前有一条长度 sanity check 挡住了。以后存放内容的变量一律用 `$content` 这类不会撞车的名字。
2. **PowerShell 双引号字符串里再嵌双引号**（`"… $([regex]::Matches($c,"`r`n").Count) …"`）会让锚点比较得出莫名其妙的结果（同一条比较单独测是 `True`）。多行文本改写改用 `node` 脚本写文件，一次成型。

**顺带一笔格式债**：整体降一级缩进之后，`textBox.addEventListener('input', …)` 那 6 行第一次「装得进一行」，`oxfmt --check` 随即报出这一处 —— 这属于**我这次改动引入的**格式债（区别于 YMTabBar 那种既存不合规），已 `--write` 收口；新增的 spec 也过 `oxfmt`。三个改动文件现在格式都是干净的。

### 第 34 轮：`animation-window-engine.ts` 的 `animationWindow` —— 3 → 2

形态是标准的「迟绑定单例」：`let animationWindow = null as unknown as typeof Animation;` + `bindAnimationWindow(instance)`（在 `animation-window.ts` 的**模块顶层** L525 调用）+ **40 个**读取点 `animationWindow.<member>`。改法：`typeof Animation | null` + 40 处 `!`（脚本把 `animationWindow.` 整体替成 `animationWindow!.`，并断言 40→40；声明与 `bindAnimationWindow` 本身不含 `.`，因而天然不受影响）。

**这一轮换了更强的验证方式 —— 因为这一处没有测试兜底**：`animation-window-engine` / `bindAnimationWindow` 在**所有 spec 文件里出现 0 次**，即这个引擎没有直接测试覆盖，所以「测试全绿」并不能说明什么。于是直接量**编译产物**：

1. 把改动反推回原样（去掉 40 个 `!`、声明改回 cast）得到 before；
2. 用 `esbuild` 对两份文件各做一次「只去类型」的转译（不打包）；
3. 比对产物：**逐字节相同**（before = after = 26423 字节，`identical emitted JS: True`）。

产物里那 36 个 `!` 是源码本来就有的逻辑非运算符，两份完全一致。⇒ 这次改动**可证明**不改变运行时行为。这比前几轮「`!` 只在编译期存在」的口头论证更硬，值得作为后续同类改动的标准动作（尤其在没有测试覆盖的文件上）。

**顺带更正第 29 轮的一个顾虑**：当时把这一处标成「抛错桩会让 `if (animationWindow.layers !== null)` 恒真 ⇒ 语义被改」而搁置。`| null + !` 完全不碰表达式本身（仍是 `instance.layers !== null`），所以那个顾虑对本手法不成立。

### 台账口径缺口（本轮量出来、**不擅自改**）

`any-hatches` 轴只统计 `[k: string]: any` 索引签名（70 处 / 41 文件）。但同一类「泛型逃生口」还有另一种写法：**`Record<string, any>`** —— 用台账**同一套原语**（`codeOnly` + 排除测试）量下来是 **35 处 / 31 文件**，并且集中在 `*-engine` 这批遗留命名空间对象上（`animation-window-engine`、`palette-engine`、`particle-engine`、`scene-draw-engine`、`scene-camera-engine` …）。

也就是说这条轴目前只看见大约一半形态。要不要把口径扩成「两种写法都统计」是**策略决定**（会立刻把基线从 70 抬到 105，按棘轮规则必须写明理由），所以本轮只记录数字：不动代码、不动轴、不动基线。若决定扩口径，应单独一轮做「先扩轴 → 记新基线 → 再逐批清」。

### 第 35 轮：`Particle.emitter` —— 2 → 1（51 个读点，只用 23 处断言）

契约本来就写在代码里：`ParticleShape.emitter` 在窗口打开时由 `editor.emitter` 带过来（`Particle.load`），`close()` 里清空 ⇒ **关闭后确实是 null**。老注释预估「收紧会波及约 15 个读取点」，实际把 `| null` 收紧后 tsc 报出 **51 个**：

| 文件 | 读点 | 备注 |
| --- | --- | --- |
| `particle-motion.ts` | 30 | 每个函数都以 `const emitter = this.emitter;` 开头 |
| `particle-pointer.ts` | 11 | 有 1 处局部量 + 2 处 `this.emitter.` 直读 |
| `particle-list.ts` | 6 | 列表回调 onCreate/onRemove/onDelete/onResume |
| `particle-file.ts` | 2 | `save()` 的赋值 + `restart()` 的读 |
| `particle-events.ts` | 1 | 已在 `state === 'open'` 守卫内 |
| `inspector/particle-layer-page.ts` | 1 | inspector 回调 |

**手法要点（省下大量断言）**：这些函数几乎都以 `const emitter = this.emitter;`（或 `const { emitter } = this;`）开头、后面连着用十几处 ⇒ **一处 `!` 覆盖整段**。于是 51 个读点只用 **23 处 `!`** 就收口（`particle-motion` 30 → 9）。

**逐点做了契约核对，不是无脑补 `!`**：

- `particle-events.ts:65` 本来就在 `if (getParticleStore().state === 'open' && …)` 里；
- `Particle.restart()` 的两个调用点（`keydown` 的 KeyR、控制条点击）都在「窗口已打开」路径上；
- `particle-pointer.ts:63` 原本就写着 `if (this.emitter?.active)`，且 TS 的收窄已覆盖紧邻的 L64 —— 说明**这里早就有人按可空写过**，只有 L53/L54 没跟上；
- `particle-list.ts` 那 6 处是列表回调，只在开窗操作列表时触发。

**验证（沿用第 34 轮建立的标准动作）**：把 6 个文件的改动逐条反推回原样，各自用 `esbuild` 只去类型转译，再逐字节比对 —— **6/6 全部 IDENTICAL**（包括把 `const { emitter, info } = this;` 拆成两行那一处）。⇒ 这批改动不含任何运行时影响。

### 第 36 轮：`useCommandState.ts` 的 `words` —— 1 → **0（该轴归零）**

计划里写的是「按第 33 轮的惰性 getter 手法、目标零读点改动」，但**先核对前提**就发现 getter 不成立：`commandState.words` 有**写入点**（`command-object.ts` 门面的 `set words` → `commandState.words = value`），getter-only 属性会把那条赋值打断。改走另一条同样零读点改动的路：**给真默认值**。

老注释的前提也是错的：它说「`Command.WordList` 是后绑定的，所以没法在这里提前 new」。其实**后绑定的只是 `Command` 门面上的那个构造器属性**（`command-object.ts` 末尾 `Command.WordList = WordList`）；类本身可以直接 `import { WordList } from './useWordList.ts'`（→ `@ui-kit`，构造函数只置 `count = 0`、无副作用）。于是：

```ts
words: markRaw(new WordList()),   // 原来是 null as unknown as WordListShape
```

**184 个 `words.push(...)` 读点一个都没改**，类型也不再撒谎。

**过程中的两个真问题（都不是靠猜解决的）**：

1. `markRaw(new WordList())` **不满足 `WordListShape`**：那个接口带一条 `[index: number]: string`，而类实例永远不满足索引签名。追下去发现**这条签名本身就是假的** —— `WordList` 的数据在私有 `#arr` 里，实例上 `wordList[0]` 其实是 `undefined`（只对历史数组形态成立），而且全仓 `words[...]` 计算索引**0 处**用到。所以把它从接口里删掉（连同说明），谎言少一条、`new WordList()` 也就能直接赋给接口。
2. 写测试时踩到一个真陷阱：**把没有 `markRaw` 的 `WordList` 赋进 reactive 状态会得到一个 Proxy**，而 `WordList` 内部用私有字段 `#arr` ⇒ 一调用就抛 `Cannot read private member #arr from an object whose class did not declare it`。这正好解释了为什么 `schema.ts` 里那句是 `markRaw(new Command.WordList())`。新测试把这条**写成了断言的注释**，免得后人「顺手」去掉 `markRaw`。

**新测试（已证非空转）**：`__tests__/useCommandState-default-words.spec.ts` —— 断言默认值是空 `WordList`（非 null）、`push/join` 可用、换新实例（markRaw）后是干净的新列表。把它换回 `null as unknown as WordListShape` 复跑：失败，证据是 `AssertionError: expected null to be an instance of WordList`；改回后 2/2 通过、文件逐字节复原。

**行为差异（如实记录）**：解析**之前** `words` 从 `null` 变成「一个空 WordList」。旧行为下解析前的第一次 `push` 会崩、之后的解析若忘了换新则会**静默累积进上一轮的表**；现在是「始终可用、每次解析换新」，语义唯一且不再有首轮特例。

## 第 37 轮：`any-hatches` 的第一次尝试 —— 负面结果 + 一次自伤事故（已逐字节修复）

**本轮没有推进任何轴。** 如实记录全过程，因为两条教训比那个数字更值钱。

### ① 负面结果：整批 `any` → `unknown` 不可行（已实测）

`any-hatches` 是 70 处 / 41 文件，形态都是 `[k|key: string]: any`。先试最机械的路子：把代码里的这类索引签名整批换成 `unknown`（跳过注释行与注释尾部，避免改掉历史说明），再让 tsc 说话。

结果：**788 个错误**，且高度集中 —— `scene/scene-window.ts` 313、`commands/schema.ts` 65、`engine/particle/particle-engine.ts` 62、`animation-window` / `particle-window` / `animation-player` / `ui-window` / `useCommandParse` 各 21…… 说明这些索引签名**确实被大量「未声明成员读取」依赖**，整批替换等于把逃生口一次性拆掉，读点会成片报错。

⇒ 这条轴只能**按接口逐个设计**（先例就是 `components/tree-list.ts` 里那段注释记的 P6b-1 收口：把 `[k: string]: any` 换成**枚举出来的真成员**）。整批方案作废。

### ② 自伤事故：脚本把 349 行改坏（已完全修复，逐字节验证）

我为「可逆」写了 `scripts/tmp-any-hatch.mjs forward|reverse`，替换回调写成：

```js
const make = (m) => `[${m}: string]: ...`;   // ← 有捕获组时，第一个参数是**整个匹配**，不是分组
line.replace(re, make);
```

于是 `[k: string]: any` 被换成 `[[k: string]: any: string]: unknown`（反向亦然）。forward 打坏 70 行；随后我为了恢复跑的 reverse **又打坏 279 行** —— 因为反向模式 `unknown → any` 匹配到了 **209 处它从来没有创建过的、本来就存在的 `[k: string]: unknown`**。合计 **349 行 / 182 文件**，tsc 报 2882 个语法错误。

修复：对 4 种畸形文本做**纯字面** `split/join` 还原 —— 67 + 3 + 241 + 38 = **349，与损坏数完全对账**；修完 `[[k:` / `[[key:` 残留 0 处。

**能声称「完全修复」而不是「看起来好了」，靠的是实验前记下的 tree hash**：修复后 `packages/{editor,ui-kit}/src` 全量文件哈希与实验前**逐字节相同**（`5a3f3704…`），tsc 0，且每条轴都与基线持平。这一条经验值得固化成规矩。

### ③ 从此固定下来的三条规矩

1. **「可逆变换」只有在反向模式不可能命中既有内容时才可逆。** 这里的反向模式命中了 209 处既有 `unknown`。正确做法：**先备份（或先记 tree hash），恢复用备份，不要用反向变换**。
2. `.replace(re, cb)` 带捕获组时，回调签名是 `(match, p1, p2, offset, string)` —— 不要把第一个参数当成分组。
3. **任何批量改写前先记 tree hash**，它让「到底有没有改坏」变成一行可回答的问题。

### ④ 下一轮的工作单（已测量，不是猜的）

`engine/scene/scene-selection-engine.ts` 里模块私有的 `type SceneObjectShape = { hidden?: boolean; locked?: boolean; [k: string]: any }`：删掉索引签名后 tsc 报 **47 个错误，点名 21 个真实属性** ——

`x`×8、`y`×8、`scale`×4、`width`×3、`height`×3、`offsetX`×2、`offsetY`×2、`anchorX`×2、`anchorY`×2，以及各 1 次的 `emitter` / `data` / `class` / `range` / `repeatX` / `repeatY` / `angle` / `scaleX` / `scaleY` / `type` / `instance` / `player`。

下一轮就按这张单子把 21 个属性按真实类型枚举进类型（改前先备份文件），顺带删掉它上面那行 `// oxlint-disable-next-line no-explicit-any` —— 否则 `stale-exemptions` 轴会多出一处陈旧豁免。

## 第 38 轮：`any-hatches` 第一批 —— 70 → 65（逐接口枚举，**几乎零新断言**）

方法是第 37 轮量出来的：**删掉索引签名 → tsc 点名到底读了哪些成员 → 按真类型逐个声明**（改前先把文件备份下来，这是第 37 轮事故后立的规矩）。为了省 tsc 时间，本轮把 4 个**互不相关**的单点文件一起删、再按错误所属文件分摊 —— 级联大小因此一目了然。

| 文件 | 性质 | 结果 |
| --- | --- | --- |
| `engine/scene/scene-selection-engine.ts` | 模块私有 `SceneObjectShape`（角色/动画/区域/光照/粒子/视差/瓦片共用） | 47 个报错点名 **21 个真属性**，全部枚举进类型；**零新增断言** —— `data`（`object.data?.size ?? 1`）与 `emitter`（`emitter?.bounding`）读侧本来就写了 `?.`，所以标 `?` 即可 |
| `data/transition-window.ts` | `EasingDrag` 上的索引签名 | **0 个报错** ⇒ 纯噪声，直接删掉 |
| `engine/layout/layout.ts` | `LayoutScheme` 上的索引签名 | **0 个报错** ⇒ 直接删掉 |
| `commands/custom-command-window.ts` | 大方法面板接口 | 只报出 2 个真成员：`state` / `commands` —— 正是与 Pinia store 桥接的那对键（`stores/custom-command.ts` 的 `customCommandStateKeys`），按 store 的 `shallowRef` 类型补上 |
| `composables/useTeamWindow.ts` | `TeamData` | 报出 1 个真成员 `parent` |

**一处被 tsc 纠正的错误假设（如实记录）**：我先按「读侧从不判空 ⇒ 声明为必需」的约定把 `parent` 写成必需，tsc 立刻报 3 处 —— **新建队伍时该字段还不存在**（`createData` 只造 id/name/…，父节点由树列表稍后挂上）。改成 `parent?`，并在唯一那个「已挂进树」的读点（`list_updateTextNode`）补 1 个 `!`。这正是「先改类型、让 tsc 把真实契约顶出来」的价值：我原来的猜测是错的，而错在**类型层就被挡住**，没有变成运行时的 NaN。

**验证**：5 个文件的 esbuild 产物**逐字节相同**（14767 / 34167 / 56386 / 10393 / 12649 字节）⇒ 纯类型改动、零运行时影响。`stale-exemptions` 保持 0 —— 删索引签名的同时把上面那行 `oxlint-disable-next-line no-explicit-any` 一并删掉，没有留下陈旧豁免。

**下一批怎么挑（重要）**：从第 37 轮的全量测量看，核心形状（`schema.ts`、`useCommandParse.ts`、`animation-player.ts`、`particle-engine.ts`…）的读点级联是几十到几百，每处都要走「删签名 → tsc 点名 → 逐个给类型」这一套。所以下一轮优先挑**级联为 0 的纯噪声索引签名**（本轮那两个就是最便宜的例子），把「删掉即完事」的先扫干净，再啃需要枚举的硬骨头。

## 第 39 轮：一次拿到全图（65 → 64）—— 以及「tsc 对 .vue 是假绿」再次被门禁抓住

### ① 全量测量：5897 个错误，说明剩下的索引签名**全是承重的**

把剩余 65 处一次性全删（改前逐文件备份到 `%TEMP%`）→ `tsc` 报 **5897 个错误**，散落在约 290 个文件。前排：`scene-window` 296、`animation-timeline` 285、`animation-motion` 235、`animation-list` 212、`scene-events-pointer` 212、`layout` 180、`animation-window-engine` 129…… ⇒ 「整批换成 `unknown`」或「整批删掉」都没有空间，只能逐个定契约（如第 38 轮那样）。

一次性全删还有个副作用：**恢复了全部 36 个文件、树哈希与开轮时逐字节相同**（`f4bab0e5…`），确认测量过程没留下痕迹。

### ② 逐个候选的归因链（本轮最有价值的产出）

从「错误列表里没出现」推断出 8 个可疑文件（12 处），单独删它们：

| 步骤 | 错误数 | 归因 |
| --- | --- | --- |
| 删 8 个文件（12 处） | 990 | 全是 `DynamicShape` ⇒ **`types/shapes.ts` 是全局松散对象类型**（承重） |
| 恢复 `types/shapes.ts` | 109 | `ParticleEmitterShape` 71 + `UIElementInstance` 7 + 其余 ⇒ `particle-window.ts` 与 `engine/ui/*` 承重 |
| 恢复 `particle-window.ts` + `root-element.ts` + `window-element.ts` + `element-classes.ts` | 31 | 全是 `HistoryData` ⇒ **`types/history.ts` 承重**（历史记录载荷按操作变化） |
| 恢复 `types/history.ts` | **0** | 只剩两个 `.vue` 候选 |

这条链把「哪些逃生口承重、承重多少」量化了下来，后续按它排优先级。

### ③ ⚠️ 又踩了一次「`tsc` 对 `.vue` 是假绿」

删掉 `YMParameterPane.vue` 的索引签名后，`tsc` 报 **0** —— 但 `check-vue-types.mjs` 报出 **72 个新错误**：该文件内部有 **71 处**读取动态挂载在元素上的成员（正是那个索引签名在兜的东西）。

这正是第 31 轮写下的教训（ui-kit 的 tsconfig 不含 `*.vue`），**本轮被门禁当场抓住** —— 说明那道门禁是有效的。已恢复该文件，它的 71 个读点记入后续工作单。

⇒ **新规矩**：候选若是 `.vue`，**先跑 `check-vue-types.mjs` 再下结论**，`tsc` 的 0 不算证据。

### ④ 本轮唯一落地：`YMFileBodyPane.vue`（1 处）

`tsc` 只报 1 个错误，点名 `props.links.head`（赋值点在 `YMFileBrowser.setupLinks()`），所以按真实契约补：

```ts
head?: { view: { write(index: number): void } } | null;
```

**可选可空**是有依据的：测试桩里确实存在 `head: null` 的「初始化前」状态；唯一读点（`setViewIndex`）在「浏览器已初始化」路径上，补 1 个 `!`。改完 `tsc` 0、`check-vue-types` 0 new、`lint` 0/0，脚本块 esbuild 产物**逐字节相同**（45176 字节）。

### ⑤ 后续工作单（按本轮量化结果排序）

1. `YMParameterPane.vue`：71 个动态成员读点 —— 需要把 `attachStateAccessors` 装的那些字段枚举进类型（比第 38 轮的 21 个属性更大，但同类工作）。
2. `types/shapes.ts`（`DynamicShape`）、`types/history.ts`（`HistoryData`）、`particle-window.ts`（`ParticleEmitterShape`）—— 三个「全局/核心形状」，各自牵动上百个读点，必须与读侧一起分批改。
3. 其余 61 处按 `tsc` 点名逐个枚举。

### 剩余 0 处：`null-casts` 轴已归零

`null as unknown as` 这类「遗留单例形状」在全仓已清零（`null-casts 0 files=0`，从第 26 轮的 28 处清到 0，其中第 29 轮 21→12、30 轮 12→7、31 轮 7→6、32 轮 6→4、33 轮 4→3、34 轮 3→2、35 轮 2→1、第 36 轮 1→0）。台账里这条轴的终态就是「归零」，现在达成。



### 历史留存：第 26 轮对「28 处」的分类（数字与判断均已被后续各轮取代，仅作沿革记录）

| 形态 | 数量 | 说明 |
| --- | --- | --- |
| 缩进的赋值形态 | 11 | **状态重置 / 故意禁用**，要改类型（`\| null`）或换写法，不能删 |
| 声明形态 | 11 | `let x = null as unknown as T;`（`plugin-parse-meta` 6、`useCallEventCommandSchema` 2、`animation-window-engine` 1、`scene-animate` 1、`tree-api` 1）⇒ 应改成 `let x: T;` 或用 `\| null`，再让 tsc 找出「使用前未赋值」 |
| 其它 | 6 | `variable.ts` 的 `inputs.*`（嵌套 5 处，需 `\| null` + 读侧）、`text-capture.ts` 的 `ColorProxy.color`（要动 `read(): string` 契约）、`command-custom.ts`（形态不适合本套手法，见上表）、`image-crop-window.ts` 的 2 处**调用实参**、`tree-api.ts` 2 处、`command-api.ts` 1 处、两个 `.vue` 各 1 处 |

**推荐顺序**：声明形态（11 处）最机械 —— `let x: T;` 之后 tsc 会把「使用前未赋值」逐条报出来，
是纯机械的、tsc 全程兜底的改动；剩下的按「每个都要先定契约」单独处理。

另：`legacy-ui-refs` 轴当前 **1**（`tools/window-cluster.ts` 的 `import { uiWindowReady }`，
以及 `stores/ui.ts:15` / `file-system-core.ts:14` 通过 `window-cluster → m.UI` 惰加载 UI 窗口）。
把它清到 0 = 阶段 1c 的第 ① 步（**`loadUI` 直连 `ui-engine.ts`**），
是**运行时高危改动**（UI 窗口正是本项目反复出崩溃的地方），应在能实机验证时单独做一轮。

## 第 52 轮（续轮）：`animation-player.ts` 的三处 —— 41 → 38（一轮清掉一个文件）

第 50 轮量到这个文件级联「约 24」就搁下了。本轮先用**探针**把范围收窄（删三处签名 → 一次 `tsc` →
按 `类型.成员` 去重），结果只有 **6 个成员**、8 条报错：

| 形状 | 需要补的成员 |
| --- | --- |
| `AnimationData` | **一个都不用补** ⇒ 索引签名纯粹没人按运行时键读，直接删 |
| `PlayerLayer` | `angle: string`（`switch (layer.angle)`）· `sprite: string`（当 key 用）· `blend: string`（`setBlendMode`）· `light: string`（`Scene.showLight ? layer.light : 'raw'`）· `particleId: string`（当 guid 用） |
| `PlayerContext` | `tint?: Int16Array` —— 读点是**惰性初始化**（`let tint = this.tint; if (tint === undefined) tint = this.tint = new Int16Array(4)`，见 L787-790）⇒ 必须**可选**，否则上下文对象字面量（L668）立刻 TS2741 |

两个过程性收获：

1. **探针要按「类型.成员」去重再报**：直接看「约 24 条报错」会以为是大活，去重后只有 6 个成员 ——
   报错条数 ∝ 读点次数，成员数才是工作量（第 44 轮那条规矩的又一次验证）。
2. `tint` 那处补完之后 `tsc` 还报 4 处 `possibly undefined`（L427/428 用了 `tint[0..3]`）；
   把局部声明收窄成 `const tint = context.tint!;` 即可 —— 与 L787 的惰性初始化是同一个不变式
   （`reset()` 跑过之后 `tint` 必然存在），断言被擦除、运行时不变。

**结果**：`any-hatches` **41 → 38 处、16 → 15 文件**（该文件 3 处全清，索引签名一个不剩）。
产物与 HEAD **逐字节相同**；`tsc` 0、`typecheck:vue` 0 new、`lint` 1603 文件 0/0，基线已固化。

## 第 51 轮（续轮）：`useIfConditionSchema` 的两个条件数据形状 —— 43 → 41

这处（第 46 轮量过级联：`IfConditionData` 18 + `IfConditionOperandShape` 33）属于「按 `type` 分派」的
**异质载荷**，与 `HistoryData`（第 46 轮）同类 —— 但这里能**真枚举**，因为字段名是固定的：

- `IfConditionOperandShape` 补 10 个字段：`value?: boolean | number | string`（三种 type 共用一个常量字段）、
  `variable?: { type; key }`（变量操作数），以及 8 个对象类操作数
  `actor / skill / state / equipment / item / trigger / light / element`（各自只用到 `type`）。
- `IfConditionData` 补 5 个：`variable` / `actor` / `element` / `list` / `target`（都是「按 type 才出现」的字段）。
- 读点收窄走**模式表**脚本（每条规则带**期望计数**、逐条打印 before/after）：`operand!.value!.toString()` ×2、
  `as string/number/boolean` ×3、`parseX(operand.X!)` ×9、`parseVariable(…variable!, …)` ×8、
  `commonVariable = condition.variable!` ×4 …… 共 25 条。

⚠️ 值得记一笔：第一轮有一条规则的**期望计数我写错了**（`'object'` 那处被我单列，所以主规则实际只有 3 处、
不是 4 处）。脚本按「计数不符就**不改**」的策略跳过了它，于是 `tsc` 精确点名剩下 4 处 ⇒ 补一轮即过。
**这正是配计数断言的价值**：它把「静默改错」变成「明确跳过 + 编译期点名」。

**结果**：`any-hatches` **43 → 41 处、17 → 16 文件**（该文件 2 处全清）。产物与 HEAD **逐字节相同**
（纯类型层 + 被擦除的断言）；`tsc` 0、`typecheck:vue` 0 new、`lint` 1603 文件 0/0，基线已固化。

## 第 50 轮（续轮）：再探四个候选 —— **全部承重**，并记一次「台账降了、`tsc` 却红了」

沿用第 49 轮的批量探针（`engine/ui/` 那两个能删，是因为**没人按运行时键读**），本轮一次删四个文件的签名，
按报错里提到的**形状名**归因：

| 文件 | 形状 | 级联 | 判定 |
| --- | --- | --- | --- |
| `particle/particle-window.ts` | `ParticleEmitterShape` | **71** | 承重（发射器字段读点遍布 `particle-motion.ts` / `animation-motion.ts` …） |
| `composables/useCommandParse.ts` | `CommandObjectShape` | **67** | 承重（`parseVariable` / `parseActor` … 一族都读 `.type` / `.key` …） |
| `composables/useIfConditionSchema.ts` | `IfConditionData` + `IfConditionOperandShape` | **18 + 33** | 承重（条件数据的「按 `type` 分派」字段，第 46 轮已分析过改法） |
| `engine/animation/animation-player.ts` | `PlayerLayer` / `PlayerContext` | **约 24** | 承重（`angle` / `sprite` / `tint` / `blend` / `light` 都是运行时挂上去的） |

四处**全部回退**，本轮没有新增落地。但过程里有一条值得单独记下来的观察：

> ⚠️ **台账会降，`tsc` 会红。** 只删 `animation-player.ts` 的三处签名时，`any-hatches` 从 43 掉到 **40**、
> 文件数 17 → 16 —— 台账「看起来进步了」；而同一时刻 `tsc` 报出 `PlayerLayer.angle` / `PlayerContext.tint`
> 等错误。**台账是代理指标，`tsc` / `typecheck:vue` / 测试才是判据**：先跑判据，再信指标。
> 任何「只看台账下降就合并」的自动化都是危险的 —— 这一条也正是本台账当初要配 CI 门禁的原因。

**下一步**（都已在交接一节的工作单里）：`particle-window`(71)、`useCommandParse`(67)、
`useIfConditionSchema`(51) 属于「必须与读侧一起改」的那一类；`Scene.list`（19 个签名 + 45 处缺 `!`）
与 `YMParameterPane.vue`（只能靠 `typecheck:vue` 量）是另外两块。

## 第 49 轮（续轮）：四个 UI 元素基类形状的「删签名」实验 —— 45 → 43

`engine/ui/` 下四个单点文件一起删签名、一次 `tsc` 归因（第 41 轮的批量法；脚本逐站点打印 before/after，
遵守第 46 轮的规矩）：

| 文件 | 形状 | 结果 |
| --- | --- | --- |
| `window-element.ts` | `WindowProxyShape` | ✅ 干净（成员都声明了，没人按动态键读）⇒ **保留删除** |
| `root-element.ts` | `PrefabElementShape` | ✅ 干净 ⇒ **保留删除** |
| `element-classes.ts` | `UIElementInstance` | ✗ 7 处：`tryUpdateReferenceElements`×3 / `addReference` / `draw` / `resize`×2 ⇒ 回退 |
| `ui-engine.ts` | `UIShape` | ✗ 约 16 处：`planToSave`×4 / `requestRendering`×4 / `hover`×3 / `renderingFunction`×2 / `controlPointTexture` / `marquee` / `updateControlPoints` ⇒ 回退 |

**结果**：`any-hatches` **45 → 43 处、19 → 17 文件**。保留下来的两处删除，esbuild 产物与 HEAD
**逐字节相同**（纯类型层）；`tsc` 0、`typecheck:vue` 0 new、`lint` 1603 文件 0/0，基线已固化。

**判据再次成立**（第 44 轮那条的推论）：`interface XShape { [k: string]: any }` 是否承重，只取决于
**有没有人按运行时键读它**；「有没有人往里写」不影响 —— 写侧的兼容性由声明成员与字面量本身保证。
`UIElementInstance` / `UIShape` 属于「元素实例上挂任意字段」那一类，读点遍布派生类
（`element-base.ts` / `reference-element.ts` / `stores/ui.ts` / `ui/ui-events.ts`）⇒ 必须与读侧一起改。

## 第 48 轮（续轮）：`unknown-casts` 764 → 292 —— 「批量收窄断言」的完整流水线

这一轴（双重断言 `as unknown as`）此前一直是 764 处 / 262 文件的存量。本轮的观察是：
**`x as unknown as T` 里的 `unknown` 跳板，很多时候是多余的** —— 直接写 `x as T` 同样合法。
而断言在产物里是**空的**，所以收窄它**运行时可证不变**。于是做成一条可复用的流水线：

1. **全量改写**（口径与台账一致：`collectFiles` / `codeOnly` / `UNKNOWN_CAST_RE`）：`as unknown as` → `as`，
   只做**单行**站点（跨行的 12 处本轮不动），并**逐站点打印 before/after 到日志**（第 46 轮的规矩：
   改写脚本必须能说明自己改了什么）⇒ 752 处 / 257 文件。
2. **`tsc` 点名**：收窄后不合法的（TS2352）就是**真的需要 `unknown` 跳板**的 ⇒ 191 处 / 94 文件。
3. **按报错行回退**（脚本从备份重建、只保留不在报错行上的站点）→ 再跑 → 迭代。
4. **`.vue` 单独一轮**：`tsc` 对 `.vue` 是盲的（第 31/39 轮的教训），必须再跑 `typecheck:vue` ——
   它又点出 **54 处 / 29 文件**（全是 TS2352），同样回退。
5. 还剩 17 处「报错行号指向整个表达式起点、而不是 `as` 记号那一行」的顽固站点 ⇒ 按**整份文件回退**收尾（11 个文件）。
6. `oxfmt --write` 统一格式（收窄后换行位置会变）。

**结果**：`unknown-casts` **764 → 292 处、262 → 138 文件**（净清 472 处）；`any-hatches` 不变（45 处）。

### 验证

- **产物逐字节相同**：148 个被改动的 `.ts` 文件逐个用 esbuild 转译、与 HEAD 版本比对 ——
  **148/148 完全相同、0 个不同**（这就是「断言是空的」的直接证据）；52 个 `.vue` 的断言同样在编译期被抹掉。
- `tsc` 0、`typecheck:vue` 0 new、`lint` 1603 文件 0/0、`migration:selftest` 30/30、
  `@yami/editor` 252 文件 / 2056 测试全绿；台账仅本轴下降，基线已固化。

### 教训 / 留给下一轮

- **`tsc` 的点名行号不一定落在 `as` 上**（它指向整个断言表达式的起点）⇒ 按行回退必须留
  「迭代 + 顽固站点整文件回退」这两手，否则会反复把已经回退掉的站点又改回去（本轮真实发生过一次）。
- `.vue` 里的这类站点**只能**靠 `typecheck:vue` 发现（本轮 54 处）—— 同一个坑第三次踩。
- 剩下的 292 处是**真需要** `unknown` 跳板的（两侧类型确实不相交，例如 `AnimationShape` → `HTMLElement`、
  `YamiElement | null` → 具名接口）。要再降，得先让**那两侧的类型**真正相容 —— 多半和
  `any-hatches` 剩下的 45 处是同一批活（`types/shapes.ts` 的 `DynamicShape`、`AnimationShape`、`UIShape`…）。

## 第 47 轮（续轮）：`Scene.searcher` 落地（46 → 45）；`Scene.marquee` 试完**回退**，坑记在下面

### ① 落地：`Scene.searcher` 的运行时扩展

`Scene.searcher` 上真正被用到的扩展只有三个（仓内 grep 实测）：`deleteInputContent()`
（`scene-list.ts:123`）、`addCloseButton()` / `addKeydownFilter()`（`scene-window.ts:597/598`），
来自 `components/common/TextBox.vue` 暴露的实例 API。照仓内既有先例
（`local/local-window.ts` 的 `searcher: (HTMLElement & { addCloseButton(): void; deleteInputContent(): void }) | null`、
`stores/browser.ts` 的 `searcher?: HTMLElement & { addKeydownFilter?(): void }`）声明为**可选方法**：

```ts
interface SceneSearcherExtensions {
	deleteInputContent?(): void;
	addCloseButton?(): void;
	addKeydownFilter?(): void;
}
```

**为什么必须可选**：字面量里那行是 `searcher: sceneEls.get('scene-searcher') as YamiElement` ——
`YamiElement` 上没有这几个方法；成员一旦写成必填，这行初始化立刻 TS2352（且不能用双断言绕，
那会撞 `unknown-casts`）。可选之后：既有的 `this.searcher?.addCloseButton?.()` 原样通过，
只有 `scene-list.ts:123` 那处直呼补了一个 `!`。两个文件的产物**逐字节相同**。

### ② 回退：`Scene.marquee` —— 89 个错误，真正的坑是**存档数据有两套形状**

按上轮记的清单把 `SceneMarqueeExtensions`（引擎 11 个方法 + 状态/数据字段 + 组件实例属性）写全、
并解决掉初始化那行的可赋值性之后，`tsc` 报 **89 个错误**，分布很有信息量：
`useTileNodeWindow.ts` 12 个、`palette-engine.ts` 约 70 个。

决定性发现在 `palette-engine.ts`：它把 `Scene.marquee.saveData.tile` 当成
`{ width, height, rowOffset, tiles … }` 用（`sTiles.width` / `sTiles.height` / `sTiles.rowOffset`），
而 `engine/scene/scene-marquee-engine.ts` 的 `save()` 写进去的是
`{ x, y, width, height, offsetX, offsetY, tiles }` —— **`rowOffset` 根本不在里面**。
即 `saveData` 至少有**两个写入方、两套形状**；只读引擎那一个文件是量不出来的。
89 个里绝大多数是「可空读取」（加 `!` 就能过），但 `rowOffset` / `width` / `height` 这几条是
**类型本身错了**，不能靠断言糊过去。

⇒ 正确顺序：**先把 `saveData` 的两个写入方（`scene-marquee-engine.ts` / `palette-engine.ts`）
与全部读点对齐**，再动 `marquee` 的类型。本轮不硬推，已完整回退（三处反向编辑逐字还原）。

⚠️ **顺带记一条危险**：`engine/__tests__/scene.spec.ts` 的 marquee mock（L280-308）虽然把成员列全了
（`visible/x/y/width/height/offsetX/offsetY/tiles/terrain/tilesetMap/saveData/key/…Color*/previewTiles/
save/restore/select/getTiles/pointerevent/info`），但**整个对象是 `as any`** —— 所以
**marquee 的类型写错了测试也不会红**。这一族的正确性只能靠 `tsc` + 逐站点核对读点，不能指望测试兜底。

### 验证（本轮）

- `scene-window.ts` / `scene-list.ts` 的 esbuild 产物与 HEAD **逐字节相同**（纯类型层 + 被擦除的 `!`）；
- `tsc` 0、`typecheck:vue` 0 new、`lint` 1603 文件 0/0；台账 46 → **45 处**
  （文件数仍 19：`scene-window.ts` 里还剩 marquee / list / `SceneShape` 共 5 处），基线已固化。

## 第 46 轮（续轮）：`HistoryData` 的异质载荷 → `unknown`（47 → 46），以及**一次探针撒谎**

第 44/45 轮把 inspector 一族清完之后，剩下的 47 处全落在「核心形状」上。本轮先想验证一个
诱人的猜想：**这些索引签名会不会其实没人用**（去掉就行）。为此写了批量探针，结果两个：

### ① ⚠️ 探针撒谎了 —— 只报计数的仪器必须废弃

第一版探针（`codeOnly` 口径匹配 + 按行删除 + **只打印每个文件删了几行**）报出的结果是
「47 处全删 → 全仓只剩 **2 个语法错误**」，看起来意味着这一轴几乎可以直接归零。
换成一个**逐站点打印 before/after 文本**的清扫脚本重放同一批删除，结果是**上千个错误**
（`AnimationShape` / `UIShape` / `CommandSchema` / `DynamicShape` … 各几十到几千处）。

两者只差一件事：**探针不打印它到底删了什么**。最可能的原因是偏移错位（`codeOnly` 未必处处
与原文等长），于是它删掉的是**相邻的**那些行 —— 而索引签名原封不动地留着，所以「没有错误」；
因为不打印文本，这个错完全看不出来。教训与文档里已有那几次仪器故障同源，单独记一条：

> **批量改写脚本必须打印「改了什么」，否则它的计数毫无意义。**
> 判据不是「脚本说了 0 个错误」，而是「**台账 + 原文 diff** 说站点确实没了、而 `tsc` 干净」。
> 本轮最终采用的清扫脚本在**删除前**逐站点回报 `整行删除 "<原文>"` / `删片段 "<前>⟨片段⟩<后>"`，
> 可逐条核对；这也是后面所有批量的标准形态。

### ② 实测：这 47 处全是承重的（没有「顺手删掉」的）

用可信的那版脚本做过三组实验，全部回退：

| 批次 | 站点 | 结果 |
| --- | --- | --- |
| 除 `scene-window.ts` / `YMParameterPane.vue` / `types/shapes.ts` 外的 17 个文件 | 37 | 数百个错误：`AnimationShape`(27+24+17+16+15+15+13+12…) / `UIShape`(`ui-list.ts`、`ui-file.ts`) / `ElementShape` 派生类 … 全部承重 |
| `commands/schema.ts` + `types/history.ts` + `element-classes.ts` + `root-element.ts` | 5 | `CommandSchema`/`CommandSchemaConfig` 的缺口外溢到 **约 60 个** `use*CommandSchema.ts` + 测试；`HistoryData` 缺 4 个成员；UI 元素基类缺口外溢到 `ui-engine.ts`/`element-base.ts`/`reference-element.ts` |
| 只删 `types/shapes.ts`（`DynamicShape`） | 1 | **上千个**错误（`Animation`/`Scene`/`Inspector`/`Window` 全靠它动态挂字段）——第 41 轮「990 级联」的结论仍然成立 |

⇒ 结论：**「删签名 → tsc → 留下干净的」这条路已经走到头**，剩下的一律是逐族枚举。
这轮最大的产出就是**否掉了这条捷径**，免得后面几轮反复试。

### ③ 本轮唯一落地：`types/history.ts` 的 `HistoryData`

`HistoryData` 的索引签名是**真需要**的，但它属于另一类：**异质载荷容器**。写侧有 12 处塞
`editor`、10 处塞 `response`、5 处塞 `item`、2 处塞 `settings`（另有 `swap`）——都是「各编辑器
按 `type` 往同一容器里放自己的字段」。所以照第 44 轮 `file-trigger-page.ts` 的先例，**保留结构、
把 `any` 降成 `unknown`**，并把理由写在类型上（写侧全放行、读侧必须先收窄）。

降级后只暴露出**一处**真实读点：`tools/event-list.ts` 的 `delete data.swap.commands.symbol;`
（`swap` 现在是 `unknown`）⇒ 按该 `type` 的形状原地断言收窄：

```ts
delete (data.swap as { commands: Record<string, unknown> }).commands.symbol;
```

**验证**：`types/history.ts` 与 `tools/event-list.ts` 的 esbuild 产物与 HEAD **逐字节相同**
（纯类型层 + 被擦除的断言）；`tsc` 0、`typecheck:vue` 0 new、`lint` 1603 文件 0/0、
`stale-exemptions` 仍为 0（顺手删掉了那条 `oxlint-disable` 豁免）；台账 47 → **46 处、20 → 19 文件**，
基线已固化。

### ④ 顺手量清的下一批「清单」（省掉后面的探查）

- **`Scene.marquee`**（`scene/scene-window.ts` L75/L164 两处）：方法由 `scene/scene-marquee.ts`
  在运行时从 `SceneMarqueeEngine` 挂上（`save/switch/resize/clear/select/selectInPencilMode/
  selectInRectMode/selectInCopyMode/selectInObjectMode/getTiles`）⇒ 槽位初值是 `null`，故都应是
  `((…) => …) | null`；`key` 是**元素数据**（`scene-window.ts` 的 `marqueeData`/WeakMap，类型 `string | null`）；
  `visible/x/y/width/height/background*Color*/border*Color*` 是 `YMMarqueeArea.vue` 的**组件实例属性**；
  数据字段 `offsetX/offsetY/tilesetMap/tiles/saveData/terrain/previewTiles/pointerevent`。
  其中 `tiles` 是**带 `standard` 属性的定型数组**（`scene-marquee-engine.ts` 里 `sTiles.standard = dTiles`），
  `getTiles(raw)` 返回它；`tilesetMap` 是数字键 → guid 的映射（`palette-engine.ts` 赋值）。
- **`Scene.searcher`**（L78）：Scene 侧只用到 `deleteInputContent()`（`scene-list.ts:123`）、
  `addCloseButton()`、`addKeydownFilter()`（`scene-window.ts:597/598`）。
- **`Scene.list`**（L80/L470）：`SceneListExtensions` 已覆盖约 13 个成员，索引签名兜住的是另外约 19 个 ——
  `addNodeTo / canSwitchState / createFolder / createTilemapShortcutItems / data / deleteNode / duplicate /
  generateUniqueName / getItemByProperties / read / resize / restoreSelection / saveScroll / saveSelection /
  scrollTop / searchNodesDebounced / select / selectDefaultCommand / unselect / update / updateFolderState /
  updateItemName / updateNodeElement`（仓内 grep 实测）。
- **`YMParameterPane.vue`**（3 处）：`.vue` 对 `tsc` 不可见 ⇒ 只能靠 `typecheck:vue` 量，
  按 `attachStateAccessors` 挂上去的字段清单枚举（第 39 轮的既有结论）。

## 第 45 轮（续轮）：inspector 单点族**收尾** —— 52 → 47，以及类型逼出来的三处真问题

第 44 轮立的口径（**成员清单就在该文件自己的对象字面量里**）让这一族变成机械活。
本轮把剩下 5 个一次做完，`inspector/` 里再没有 `[k: string]: any`：

| 文件 | 成员 | 类型上的关键决定 |
| --- | --- | --- |
| `file-script-page.ts` | 10 | `create: () => string`；`open` 是 **async** ⇒ `Promise<void>` ⇒ 立刻被 oxlint 的 `no-floating-promises` 抓住 ⇒ 调用点加 `void`（见下「产物差异」） |
| `file-font-page.ts` | 11 | `previews: YamiElement[] & { dpr?: number }` —— 列表由 Vue 页的 `registryElements` 赋值，`dpr` 是运行时挂上去的 |
| `file-actor-page.ts` | 14 | 四个列表描述符共用 `ActorListDescriptor`（用**方法语法**换双变检查，`parse(item: never)` 兼容各不相同的入参）；`inventory` 写成 `ActorListDescriptor & { loadTypeItems(): void }` 而**不是**可选成员 —— 否则调用点只能写 `?.()`，产物会跟着变 |
| `element-page.ts` | 21 | `_elementInitialized` / `_openRetry` 声明为**可选**：它们不在字面量初值里，声明必填就得往字面量加初值（那是运行时改动）；`owner` 复用 `UIOwnerShape`；`UIElementData` 补 `id: string` 才过得了 `ScriptListInterface` 的 `{ target?: ScriptListItem }` 门 |
| `file-audio-page.ts` | 36 | 三个具名别名描述「运行时挂字段」：`AudioWaveformPromise`（带 `canceled`）、`AudioProgressElement`（带 `percent`）、`AudioPointerElement`（带 `time`）；`dataArray: Uint8Array<ArrayBuffer>` / `intervals: Float64Array` / `intensities: Float64Array & { index: number }` 全部**照 Vue 页的真实赋值写**（`new Uint8Array(analyser.frequencyBinCount)`、`new Float64Array(64)`、`.index = 0`），不是猜的 |

顺带改了一处**共享类型**：`script-list.ts` 的 `editor: { target?: ScriptListItem }` 补 `| null` ——
页面的 `target` 在关闭时就是 `null`，原来的声明与真实调用方不符（第 44 轮口径的推论：**枚举之后，
门面类型该松的松、该紧的紧，不能靠调用方 `any` 蒙过去**）。

### ⚠️ 类型逼出来的三处真问题（本轮**只记录，不顺手改**）

类型收窄的价值就在这里：三处都是「原来被 `any` 兜住的真实缺陷」，本轮一律用**零运行时增量的写法**
保住既有行为，改不改留给人决定。

1. **`element-page.ts` 的重试路径其实是死的**（第 43 轮崩溃修复里的缺口）：
   `_openRetry` 首值是 `undefined`，而 `undefined < 10` 恒为 `false` ⇒ **第一次 `open()`（页面还没挂载时）
   根本不会重试**。有意思的是下一行写的是 `(this._openRetry ?? 0) + 1` —— 作者本意显然允许 `undefined`，
   是判断那行漏了 `?? 0`。本轮写成 `(this._openRetry ?? NaN) < 10`：`undefined < 10` ≡ `NaN < 10` ≡ `false`，
   **语义逐字保持**。要真正修好得写 `?? 0`（那会改变行为：首次 open 也开始重试），需要实机回归。
2. **`file-audio-page.ts` 未移动就点击进度条**：`pointer.time` 在首次 `pointermove` 之前是 `undefined`
   （Vue 页只赋 element，不赋 `time`），而 `time !== -1` 为 `true` ⇒ 会把 `undefined` 交给
   `audio.currentTime`。本轮写 `time as number`（断言被擦除，行为不变）；要不要加 `!== undefined` 同理需决定。
3. **`file-audio-page.ts` 的 `this` 标注与运行时不一致**：`progressPointermove` 标的是 `this: typeof FileAudio`，
   但它由 `progress.addEventListener('pointermove', …)` 注册 ⇒ 运行时 `this` 是 **DOM 元素**；
   里面读的 `this.clientWidth` 正是按 DOM 读才工作。本轮把标注改成 `this: HTMLElement`（纯类型、产物不变）
   —— 这是「标注撒谎、代码照跑」的一处实例，值得记住：**注册成监听器的函数，`this` 由注册方决定**。

### 验证（本轮）

- **产物自证**（esbuild，逐字节）：`file-font-page` / `file-audio-page` / `file-actor-page` / `script-list.ts`
  与 HEAD **完全相同**；`file-script-page` 唯一差异是 `void FileScript.open(…)` 的 **`void ` 前缀**
  （oxlint 要求显式忽略 promise；`void expr` 的求值与副作用不变）。
- `pnpm typecheck` 0；`typecheck:vue` 0 new；`pnpm lint` 1603 文件 0/0；
  改动文件 `oxfmt --check` 合规；`migration:selftest` 30/30。
- 台账：`any-hatches` **52 → 47 处、25 → 20 文件**，其余轴持平，基线已固化。
- 测试：`@yami/editor` 全绿（见交接一节的噪声说明：计数器才是判据）。

### 下一轮工作单（`any-hatches` 47 / 20 文件）

1. **`HTMLElement & { [k: string]: any }` 一族（8 处 / 2 文件）**——现在这是**唯一一类「形状已知但没做」**的：
   `scene/scene-window.ts`（`marquee` L75 / `searcher` L78 / `list` L80、L164 的 `{} as unknown as …` 兜底、L470）
   + `ui-kit` 的 `YMParameterPane.vue`（L164 / L201 / L970）。
   照同文件 `HTMLElement & SceneListExtensions` 的先例：声明**具名扩展接口**，把运行时挂的字段枚举进去。
2. **承重核心（必须与读侧分批改）**：`types/shapes.ts`(990) / `data/data-object.ts`(600) /
   `scene/scene-window.ts`(296) / `particle/particle-window.ts`(71) / `engine/particle/particle-engine.ts`(62) /
   `types/history.ts`(31) / `stores/ui.ts` + `engine/ui/ui-engine.ts`。
3. **口径缺口仍待决定**：`Record<string, any>`（35 处 / 31 文件）是否纳入本轴；
   以及上面三处「真问题」要不要修（都需要一次实机回归）。

## 第 44 轮（续轮）：`any-hatches` 56 → 52 —— 四个 inspector 单点，和一条被实测推翻的假设

本轮先把**剩下所有「单点」文件一次性删签名、跑一次 `tsc` 归因**（第 41 轮用过的批量法），
再按级联来源分三类：能枚举的当场做、承重的回退、形状待查的记进工作单。

| 文件（删签名后） | 级联 | 判定 / 处理 |
| --- | --- | --- |
| `inspector/file-audio-page.ts` | 80 | 见「下一轮工作单」第 1 条 |
| `inspector/element-page.ts` | 50 | 同上 |
| `inspector/file-actor-page.ts` | 26 | 同上 |
| `inspector/file-font-page.ts` | 26 | 同上 |
| `inspector/file-script-page.ts` | 23 | 同上 |
| `inspector/file-scene-page.ts` | 15 | ✅ 本轮枚举（**级联数被高估**，见 ①） |
| `inspector/element-container-page.ts` | 0 | ✅ 本轮枚举 |
| `inspector/element-button-page.ts` | 0 | ✅ 本轮枚举 |
| `inspector/file-trigger-page.ts` | 1 | ✅ 本轮处理（`any` → `unknown`） |

### ① ⚠️ 一条被推翻的假设：「级联 15 / 50 / 80」≠「形状未知」

第 41 轮把 inspector 一族的缺口写成「**很可能**是动态挂载成员，要按 `attachStateAccessors`
的字段清单枚举（`element-page.ts` 同源）」。本轮拿级联最小的那个（`file-scene-page.ts`，15）实测：
**假设不成立。**

删掉索引签名后的 15 个错误**全部落在同一个文件里**，而且**全部指向该文件自己的对象字面量**
（`FileScene = { button, owner, target, initialize, create, open, close, write, update }`）——
清一色 `TS2339: Property 'x' does not exist on type 'FileSceneShape'`。

原因是索引签名把**同一处声明的两件事**一起放行了：①「对象字面量的多余属性检查」
（`const X: XShape = {…}` 本来会逐项核对）②之后所有 `X.成员` 的读取。
所以**成员清单不用去别处找 —— 它就在下面那 9 行字面量里**。

> **规矩（对后面 5 个文件同样适用）**：`interface XShape { [k: string]: any }` 配
> `const X: XShape = {…}` 这种写法，**级联数 ∝ 访问次数，与「形状是否已知」无关**。
> 判断承重与否的口径是**错误有没有落在同一文件、同一份字面量覆盖的成员上**；
> 只有落在别处的才是真承重（对照第 41 轮：`types/shapes.ts` 990 / `data-object.ts` 600 是真承重）。

### ② 本轮落地的四处

| 文件 | 处理 |
| --- | --- |
| `element-container-page.ts` | 6 个成员；`owner` 直接复用 `ui-owner.ts` 已导出的 **`UIOwnerShape`**（3 成员）—— 两处 `owner: any` 从此是同一份契约 |
| `element-button-page.ts` | 7 个成员；`create` 的返回是 **`Omit<UIButtonData, 'instances'>`**（`instances` 由运行时补，写成 `() => UIButtonData` 立刻 TS2322） |
| `file-scene-page.ts` | 9 个成员；顺带删掉 **`FileSceneData` 的 `[k: string]: unknown`** —— 它只是「允许额外字段」，而该类型在本文件里只作形参/返回标注、没有任何动态键读取；删掉后 `Codec.encodeScene` 的返回（codec 私有的 `SceneData`）才赋得进 `create` 的返回类型 |
| `file-trigger-page.ts` | 索引签名**有意保留**（`update()` 按运行时键分派，键来自属性面板），只把 `any` 降成 `unknown`；连带修掉「联合键写入」这个新坑（③） |

两个 `element-*-page.ts` 顶上原本挂着 `// oxlint-disable-next-line no-explicit-any` ——
说明这两处**从第一天起就是「懒得写形状」**，不是真需要索引签名。

### ③ 新坑：用「联合字面量」做键**写入**时，目标类型是那些键声明类型的**交**

```ts
switch (key) {                    // key: 'selector' | 'onHitWalls' | …
	case 'selector':
		trigger[key] = value;         // ✗ TS2322：unknown 不能赋给 string
```

`selector` 有静态类型 `string`，于是 `trigger[key]` 的**写入**目标退化成 `string`，
而索引签名的值类型是 `unknown` ⇒ 不可赋。**读侧没事（读是并集），只有写侧这样。**

修法是显式走索引签名视图，且**零运行时增量**（断言在产物里被擦除）：

```ts
if ((trigger as Record<string, unknown>)[key] !== value) {
	(trigger as Record<string, unknown>)[key] = value;
}
```

`as Record<string, unknown>` **不撞任何轴**（`unknown-casts` 轴的正则是双断言 `as unknown as`）；
比引入局部别名更好：别名会让产物多一行，而这个写法产物逐字节不变。

### 验证（本轮）

- **产物自证**：四个文件的 esbuild 转译结果与 HEAD **逐字节相同**
  （`05c0201265223dce` / `7befecbbc7362830` / `786971ab4e94e1b0` / `67f0ec68b65750fd`，长度也一致）
  ⇒ 纯类型层，运行时不变。
- `pnpm typecheck` 0；`typecheck:vue` 0 new；`pnpm lint` 1603 文件 0/0；四文件 `oxfmt --check` 合规。
- 测试：`@yami/editor` **252 文件 / 2056 测试全绿**；`@yami/ui-kit` **115 / 810 全绿**。
- 门禁：`migration:selftest` 30/30；`migration:check` 仅 `any-hatches` 下降（**56 → 52、29 → 25 文件**），
  基线已固化；`dom:guard:tracker` exit 0；`build:vite` exit 0。

⚠️ **「测试退出码噪声」本轮查清了**：`ui-state.spec.ts` 会触发
`EnvironmentTeardownError: Cannot load '/src/title/menu-bar.ts' imported from … window-cluster.ts
after the environment was torn down` —— 惰加载在**环境拆除之后**才落地。计数始终 252/2056 全绿，
退出码在 0 与 1 之间**随机**（本轮两次跑：一次 0、一次 1）。与迁移改动无关（四处产物逐字节相同），
但会让 CI 的 tests job 偶发红，值得单独修一轮（在 `ui-state.spec.ts` 里等惰加载落定，或 mock 该动态导入）。

> 交接一节（第 40 轮）的数字是当时的快照：`any-hatches` 64/35 → 现 **52/25**；
> editor 测试 251/2054 → 现 **252/2056**。

### 下一轮工作单

1. **inspector 剩 5 处，同一形状**：`file-audio-page`(80) / `element-page`(50) / `file-actor-page`(26) /
   `file-font-page`(26) / `file-script-page`(23)。按 ① 的口径做：**读该文件的对象字面量 + 该文件的错误清单**，
   逐成员标类型即可 —— 不要再当成「未知形状」去别处找字段清单。
2. **`HTMLElement & { [k: string]: any }` 一族（8 处 / 2 文件）**：`scene/scene-window.ts`
   （`marquee` L75 / `searcher` L78 / `list` L80、L164 的 `{} as unknown as …` 兜底、L470 的返回类型）+
   `ui-kit` 的 `YMParameterPane.vue`（L164 / L201 / L970，`attachStateAccessors` 挂上去的字段）。
   先例可抄：同文件 L80 的 `HTMLElement & SceneListExtensions` —— 声明**具名扩展接口**，
   把运行时挂上去的字段枚举进去，兜底那处也就一起消掉了。
3. **承重核心（不要单文件删）**：`types/shapes.ts`(990) / `data/data-object.ts`(600) /
   `scene/scene-window.ts`(296) / `particle/particle-window.ts`(71) / `engine/particle/particle-engine.ts`(62) /
   `types/history.ts`(31) / `stores/ui.ts` + `engine/ui/ui-engine.ts`（第 41 轮量的 72 的一部分）。
   必须**与读侧分批改**，且宜先扩 `Record<string, any>` 口径（见交接第五节第 1 条）再动。

## 第 43 轮（续轮）：`SceneItem` 双向枚举 —— 58 → 56

第 42 轮量清的那条（`scene-list.ts` 的 `SceneItem`）本轮做完了。三件事必须一起改，缺一处就报错：

1. **两个声明同步枚举**：`SceneItem`（实现侧）与 store 门面的 `SceneListItem`（`scene-window.ts:28`）各补 `name?` / `shortcut?` / `parent?` / `children?` —— 门面要求 `SceneListItem` 可赋给 `SceneItem`，两边字段不一致就 TS2322（6 处）。
   *两边注释里都写了「成对维护」*，免得下次只改一边。
2. **`parent` 的类型是节点自身**（`parent?: SceneItem`），不是 `{ children: … }` —— 因为 `check(folder.parent)` 要把父节点当节点用；读点补 `!`（3 处，都是「已在树里」的路径）。
3. **运行时键改用 `Reflect`**：`node[key]` / `folder[key]` / `item[key]` 共 **6 处**（`restoreRecursiveStates`、`setRecursiveStates`、`updateFolderState`）改成 `Reflect.get/set(node, key, …)`。
   这样**不需要**给整个类型挂索引签名（那会连门面赋值一起卡住），也**不需要**任何 `as unknown as`（会撞 `unknown-casts` 轴）。

另外两处 `?? []` 兜底：`folder.children` / `item.children`（叶子/空文件夹本来就没有 children —— 原来会抛「undefined is not iterable」，现在是空循环，语义更正确）。

**验证**：`scene-window.ts` 产物与 HEAD **逐字节相同**（纯类型层）；`scene-list.ts` 的差异**逐条核对过**，恰好是上面那 11 行（6 处 Reflect + 2 处 `?? []` + 3 处断言，断言在产物里不可见）。`tsc` 0、`check-vue-types` 0 new、`lint` 0/0。

## 第 42 轮（续轮）：`any-hatches` 61 → 58（`LightData` 枚举 + `HomeShape.state`）

| 文件 | 处理 |
| --- | --- |
| `scene/light.ts`（`LightData`） | ✅ 按实测读点枚举 6 个成员：`red`/`green`/`blue`/`intensity`（`drawPointLight` 里参与算术）、`blend: string`（`gl.blend` 就是 string，见 `webgl-methods.ts`）、`mask: string`（`Scene.textures` 的键）；产物**逐字节相同** |
| `title/home-page.ts`（`HomeShape`） | ✅ 补 `state: string` + 字面量 `state: 'closed'`。store 侧其实早就写了 `homeStateKeys: (keyof HomeShape)[] = ['state']` —— 也就是说这条**类型一直在等这个字段**；产物差异恰为新增的一行 `state: "closed",` |
| `title/__tests__/home-init.spec.ts` | 顺手修正：mock 原本把 `Home.state` 重置成 `null`（旧类型是 `any` 才允许），现按 store 的初值改成 `'closed'` |

**`scene/scene-list.ts` 的 `SceneItem`：本轮量清但没做**（留下批）。删掉索引签名后 32 个错误分三类：

1. 可枚举成员 `name` / `shortcut` / `parent` / `children` ✓；
2. `restoreRecursiveStates` / `snapshotStates` 按**运行时键**读写（`node[key]`）⇒ 需要索引签名或断言；
3. 真正卡住的是：给 `SceneItem` 加索引签名后，**store 侧 `SceneListItem` 门面赋值**（`Scene.list.copy` 等 6 处）全部报 TS2322 —— 因为「没有索引签名的类型」不能赋给「有索引签名的类型」。

⇒ 正确做法是**两边一起枚举**（`SceneItem` 与 store 的 `SceneListItem` 同步补齐 `name`/`shortcut`/`parent`/`children`），再加一处局部断言处理运行时键；本轮只把这条写进工作单，避免半改。

## 第 41 轮（续轮）：`any-hatches` 再清 3 处 —— 64 → 61

方法同前：**逐批删签名 → tsc/vue-tsc 点名 → 按真契约处理**。本轮把 8 个单点文件一起删、再按错误来源回退，一次 tsc 就量出了这批的承重情况：

| 文件 | 级联 | 处理 |
| --- | --- | --- |
| `data/data-object.ts`（`DataModule`） | **600** | 承重 ⇒ 回退（全局数据模块，读点遍布全仓） |
| `stores/ui.ts`（`UINodeShape`） | 72 的一部分 | 承重 ⇒ 回退 |
| `engine/ui/ui-engine.ts`（`UIShape`） | 72 的一部分 | 承重 ⇒ 回退 |
| `enum/enum-window.ts`（`EnumModule`） | 29 的一部分 | 承重 ⇒ 回退 |
| `scene/light.ts`（`LightData`） | 29 的一部分 | **可枚举**（`blend`/`red`/`green`/`blue`/`intensity`/`mask`）⇒ 留下一批 |
| `title/deploy-project-window.ts` | 4 | ✅ manifest 的键本来就都声明了，索引签名只是让**字符串循环变量**通过 ⇒ 两处循环加 `as DeploymentGroupKey[]` / `as DeploymentListKey[]`（12 个分组键 / 5 个数组键）；循环键从此也被类型检查 |
| `local/local-window.ts` | 11 的一部分 | ✅ `LocalizationShape` 补 `state: string`（与 `localizationStateKeys = ['state','strings']` 对齐） |
| `title/menu-bar.ts` | 11 的一部分 | ✅ `MenubarShape` 补 `state: string`，并给 `Menubar` 字面量补初值 `state: 'closed'`（与 store 的 `shallowRef('closed')` 一致） |

**验证**：`local-window.ts` 与 `deploy-project-window.ts` 的 esbuild 产物**逐字节相同**（纯类型层）；`menu-bar.ts` 产物**只多一行** `state: "closed",` —— 删掉该行后两份产物逐字节相同（即差异恰为那一个预期属性）。`tsc` 0、`check-vue-types` 0 new、`lint` 0/0、三文件 `oxfmt` 合规、定向测试 8 例通过。

**下一批工作单**：`scene/light.ts` 的 `LightData`（6 个成员）；`scene/scene-list.ts`、`title/home-page.ts`（各 2 处）；`inspector/element-*-page.ts` / `file-*-page.ts` 一族（各 1 处，形状与 `element-page.ts` 同源 —— 很可能是**动态挂载成员**，要按 `attachStateAccessors` 的字段清单枚举）。

## 附录十二：真机崩溃 —— 「按需渲染的 inspector 页面 + 一次性 initialize」的 null 链（2026-09-19）

**现象**（用户贴的真实栈）：点选一个 UI 元素就报

```
[Inspector.open] sub.open failed: uiButton
Cannot read properties of null (reading 'previousElementSibling')
  at UIElement.open (inspector/element-page.ts)
  at UIButton.open → Inspector.open → UI.setTarget → UI.listSelect → LayoutPanel.vue
```

**根因链**（三件事叠在一起，缺一不可）：

1. inspector 的控件改成**由 SFC 挂载时**经 `registryRef`/`registerElement` 登记进 `inspectorEls`
   （P5b 批次 3，`element-registry.ts` 已提交）。
2. inspector 的页面是**按需渲染**的：第一次 `open('uiButton')` 往往发生在该页挂载**之前**。
3. `UIElement.initialize` 开头是 `if (!inspectorEls.get('uiElement-name')) return;` —— 于是这一次
   初始化**什么都没做**；而 `Inspector.initialize()` 的 `_initialized` 只让它跑一次 ⇒ **再也不补**
   ⇒ `this.pointerEvents` 永远是初始的 `null` ⇒ 之后每次 `open()` 都在
   `this.pointerEvents.previousElementSibling` 上炸（`show`/`hide` 本身对 null 是安全的，
   **炸的是属性读取**）。

**这不是本轮迁移引入的**：`git show HEAD:…/element-page.ts` 里同样的守卫、同样的无保护读取都在，
即缺陷随注册表迁移一起进了主干，只是要「首次点选 UI 元素」才触发。

**修法**（`element-page.ts`，三处，都很小）：

1. `initialize` 改**幂等**（`_elementInitialized` 标志）—— 早退时**不**置位，因此可以重试。
2. `open()` 开头先 `this.initialize()`；若控件仍未就绪，则 `setTimeout(…, 0)` **重试一次**
   （上限 10 次，Vue 的挂载刷新是微任务，宏任务必定在其后），并且**就绪前不往下读**。
3. 两处 `previousElementSibling` 读取加 `?.` 兜底 —— 即使真的缺失也只是这一行不显示，不再抛错。

**验证**：新增 `inspector/__tests__/element-page-open-before-mount.spec.ts`（2 例）。把 `open()`
临时还原成旧实现，测试**复现出与真机逐字相同的报错**
（`TypeError: Cannot read properties of null (reading 'previousElementSibling')`，指向同一行）；
改回修复后 2/2 通过、文件逐字节复原。全量门禁：`tsc` 0、`check-vue-types` 0 new、`lint` 0/0、
editor **2056** 测试、ui-kit **810** 测试、台账全部轴持平。

**测试环境的一个坑（顺手记下）**：`vitest.setup.ts` 把**所有** legacy inspector 页面模块
`vi.mock(..., () => ({}))` 成空模块（为了让各用例自己控挂载点）。所以在这个 spec 里必须
`vi.unmock('@app/inspector/element-page.ts')`，否则导入「成功但什么都没发生」——
我为此白查了三轮（现象是 `Inspector.uiElement` 恒为 null、连模块顶层的 `console.log` 都不打印）。

**同类但暂不修的**：`file-ui-page.ts` 有同样的「早退后永不重来」，但它的 `open()` 只用
`addClass(this.button, …)`，而 `addClass`/`removeClass` **对 null 是安全的**（返回 false），
所以最多是「选中态没画上」，不会崩。

## 交接（第 40 轮，2026-09-19）

自动轮次到此用完（40/40）。这一节是**可交接的状态清单**：已经达成什么、还剩什么、门禁怎么跑、哪些决定需要人来做。

### 一、已经达成的（有台账数字支撑）

| 轴 | 开轮基线 | 现在 | 说明 |
| --- | --- | --- | --- |
| `null-casts`（遗留单例形状） | 28 | **0** | 第 26 → 36 轮清完，第 36 轮归零 |
| `unknown-casts`（双重断言） | 799（口径修正后） | **764** | 随 `null-casts` 一并下降 |
| `any-hatches`（泛型逃生口） | 70 | **64** | 第 38 轮 5 处、第 39 轮 1 处 |
| `dom-pending`（待迁移 DOM 用法） | — | **0** | 白名单单一真源（`.oxlintrc.json` ↔ 台账）无漂移 |
| `dom-whitelist-drift` / `dom-whitelist-unjustified` | — | **0 / 0** | 白名单 14 条，条条有理由 |
| `stale-exemptions` | — | **0** | 陈旧豁免注释 0 |
| `ui-slot-coverage` | — | **0** | store 引用的 UI 槽位均有赋值方（declared 134 / assigned 153） |
| `unremovable-listeners` | 9 | 9（**不增**） | 该轴只要求不增 |

**机制类交付**（对应目标里的「先建立统一的迁移台账与棘轮门禁」）：

- `scripts/migration-ledger.mjs` —— 13 轴棘轮；`--check` / `--json` / `--axis <id>` / `--update-baseline`；
  基线固化在 `scripts/migration-ledger-baseline.json`。
- `scripts/lib/scan.mjs` 的 `codeOnly`（注释/字符串/正则/模板全部**等长**抹白）+ `scripts/lib/self-test.mjs`
  **30/30** 自证（这批自证本身就是发现过三次口径错误的地方：正则字面量、`Select-String` 假空、行尾）。
- `.github/workflows/ci.yml` —— 把「本地人工纪律」变成机制：9 条门禁（台账自测 → 棘轮 → DOM 矩阵 →
  lint → tsc → vue-tsc 棘轮 → 全局类型审计 → 事件面报表 → 陈旧豁免）+ 测试 job + 构建 job。
  **第 40 轮已按 workflow 顺序逐条本地跑过，9/9 exit 0。**
- 文档归位：本文件即迁移台账的「为什么」；每轮一节，含**失败与原路返回**的记录。

### 二、还没清完的（都带实测数字，可直接接着做）

| 项 | 现状 | 下一步怎么走 |
| --- | --- | --- |
| `any-hatches` | 64 处 / 35 文件 | 按第 39 轮的量化排序：① `YMParameterPane.vue` 的 **71** 个动态成员读点（需要把 `attachStateAccessors` 挂的字段枚举进类型）；② 三个「全局/核心形状」`types/shapes.ts`（`DynamicShape`，全删引发 990 个错误）、`types/history.ts`（`HistoryData`，31 个错误）、`particle/particle-window.ts`（`ParticleEmitterShape`，71 个错误）—— 必须与读侧分批改；③ 其余按「删签名 → tsc/vue-tsc 点名 → 逐个枚举」推进 |
| `legacy-ui-lines` | 2868 行 / 10 文件 | 阶段 1c：`src/ui/` 是 8 个域模块 + 1 个接线文件（附录三有拆分账）。收尾顺序见文末「删完之后应该发生什么」 |
| `legacy-ui-refs` | 1 | = 阶段 1c 第 ① 步：`stores/ui.ts` 的 `loadUI` 从 `window-cluster → m.UI` 改为直连 `ui-engine.ts`。**运行时高危**（UI 窗口是本项目反复出崩溃的地方），**必须实机回归**，不要在没有实机验证的会话里动 |
| `Record<string, any>` | 35 处 / 31 文件 | **口径缺口**：`any-hatches` 只统计 `[k: string]: any` 索引签名，看不见这种写法。要扩轴的话应先扩口径、再记新基线（会立刻从 64 抬到 99），**需要人的决定** |

### 三、门禁怎么跑（本地 = CI 同一套）

```bash
pnpm migration:selftest      # 门禁口径自证（30/30）
pnpm migration:check         # 棘轮：任一轴上升即红
pnpm dom:guard:tracker       # DOM 迁移矩阵明细
pnpm lint                    # oxlint（1602 文件，应 0/0）
pnpm typecheck               # tsc strict（注意：**不含 .vue**）
pnpm -F @yami/editor typecheck:vue   # vue-tsc 棘轮（.vue 里的类型债只有它能看见）
node scripts/global-types-audit.mjs  # global.d.ts 接口块应为 0
pnpm events:surface          # 事件面报表
pnpm stale-exemptions        # 陈旧豁免注释应为 0
pnpm -F @yami/ui-kit test    # 115 文件 / 810 测试
pnpm -F @yami/editor test    # 251 文件 / 2054 测试（进程退出码可能因既有 unhandled-error 噪声为 1，看计数）
pnpm build:vite              # 构建
```

### 四、这几十轮沉淀下来的操作规矩（踩过坑才有的）

1. **`.vue` 里的类型债 `tsc` 看不见** —— 改 `.vue` 声明后必须跑 `typecheck:vue`。第 31 轮和第 39 轮各踩一次，第二次是门禁当场抓住的。
2. **批量改写前先记 tree hash、并做文件备份**；「反向变换」不是备份（第 37 轮：反向模式命中了 209 处它从未创建过的既有 `unknown`，把 349 行改坏，靠 tree hash 才敢说「逐字节复原」）。
3. **`.replace(re, cb)` 带捕获组时第一个参数是整段匹配**，不是分组（第 37 轮事故的直接原因）。
4. **类型层改动用编译产物自证**：`esbuild` 只去类型转译，改动前后逐字节比对（第 34–39 轮的标准动作）；`.vue` 取 `<script setup>` 块再转译。
5. **PowerShell 变量名大小写不敏感**，别用 `$T`/`$t` 这类同名变量存内容与常量；双引号里再嵌双引号会让比较结果不可信 —— 多行文本改写用 `node` 脚本。
6. **`src/ui/` 里只做等长或减行的改动**（加注释会直接抬高 `legacy-ui-lines`）。
7. **棘轮纪律**：下降随时可以；上升必须 `--update-baseline` 并写明前后理由（本文件即理由所在）。

### 五、需要人来做决定 / 需要实机的两件事

1. **`Record<string, any>` 是否纳入 `any-hatches` 口径**（见上；不纳入的话，这条轴的「归零」只覆盖约一半形态）。
2. **阶段 1c 的实机回归**：`legacy-ui-refs` 1 → 0 与 `legacy-ui-lines` 2868 → 0 是运行时高危改动，需要能启动编辑器、逐个窗口点一遍的环境（附录四、六、七、八、九记的都是这类改动曾经造成的静默失效）。

**另外**：本轮所有迁移改动都在**工作区**（HEAD 是 `42a99077 build(deps): bump vue to rc.9…`，即 rc.9 事务本身已提交）—— 是否分批提交由你决定。

## 交接（第 47 轮 · 2026-09-19）：**当前**真实数字与工作单

> 上面那节「交接（第 40 轮）」是当时的快照，数字已过时；**以本节为准**。

### 一、台账现状（13 轴，`pnpm migration:check` 全平）

| 轴 | 现值 | 目标 |
| --- | --- | --- |
| `any-hatches` | **45 处 / 19 文件** | 归零 |
| `unknown-casts` | **292 处 / 138 文件**（第 48 轮从 764 降下来） | 归零 |
| `legacy-ui-lines` | 2863 行 / 10 文件 | 归零（阶段 1c，高危） |
| `legacy-ui-refs` | 1 | 归零（= 1c 第 ① 步） |
| `null-casts` | 0 | ✅ 已归零 |
| `dom-pending` / `dom-whitelist-drift` / `dom-whitelist-unjustified` / `stale-exemptions` / `ui-slot-coverage` | 0 | ✅ 已归零 |
| `dom-on-exempted` 120 · `dom-whitelist-size` 14 · `unremovable-listeners` 9 | 持平 | 不增 |

### 二、下一批工作单（都带**实测**成本，不是估的）

1. **`Scene.list`**（`scene/scene-window.ts` L80 声明 + L470 初始化，2 处）：索引签名兜住的是
   `SceneListExtensions` 之外的约 19 个成员（`addNodeTo / canSwitchState / createFolder /
   createTilemapShortcutItems / data / deleteNode / duplicate / generateUniqueName / getItemByProperties /
   read / resize / restoreSelection / saveScroll / saveSelection / scrollTop / searchNodesDebounced /
   select / selectDefaultCommand / unselect / update / updateFolderState / updateItemName / updateNodeElement`）。
   成本：19 个签名 + 调用点 **45 处缺 `!`**（已有 9 处）。
   ⚠️ **不能**直接拿 `ui-kit` 的 `TreeListElementApi` 当这个类型：它的兜底是 `[k: string]: unknown`，
   接上去会让 `addNodeTo` 之类变成 `unknown` 而不可调用。
2. **`Scene.marquee`**（L75 + L164，2 处）：先对齐 `saveData` 的**两个写入方** ——
   `scene-marquee-engine.ts` 写 `{x,y,width,height,offsetX,offsetY,tiles}`，而 `palette-engine.ts`
   读 `width/height/rowOffset`（后者根本不在前者的形状里）；对齐后约 12 处 `!`。
   成员清单见第 47 轮。⚠️ `scene.spec.ts` 的 marquee mock 是 `as any`：**类型写错测试不会红**。
3. **`YMParameterPane.vue`**（3 处）：`.vue` 对 `tsc` 不可见，只能靠 `typecheck:vue` 量；
   按 `attachStateAccessors` 挂上去的字段清单枚举。
4. **核心形状（承重，必须与读侧分批）**：`types/shapes.ts` 的 `DynamicShape`（独立实测仍是**上千**级联）、
   `data/data-object.ts`(600)、`scene/scene-window.ts` 的 `SceneShape`(296)、
   `engine/animation/animation-window.ts` 的 `AnimationShape`、`ui/ui-window.ts` 的 `UIShape`、
   `particle/particle-window.ts`(71)、`engine/particle/particle-engine.ts`(62)、
   `stores/ui.ts` + `engine/ui/ui-engine.ts`。
   ⚠️ 这批正是 `unknown-casts` 剩下 292 处的**同一批类型**：两侧类型相容之后，两条轴会一起下降。
5. **阶段 1c**（`legacy-ui-lines` 2863 → 0、`legacy-ui-refs` 1 → 0）：运行时高危，**必须实机回归**
   （附录四/六/七/八/九记的都是这类改动造成的静默失效）。

### 三、门禁（本地 = CI 同一套；第 47/48 轮全部跑绿）

```bash
pnpm migration:selftest && pnpm migration:check && pnpm dom:guard:tracker
pnpm lint && pnpm typecheck && pnpm -F @yami/editor typecheck:vue
pnpm -F @yami/editor test     # 252 文件 / 2056 测试（exit 0）
pnpm -F @yami/ui-kit test     # 115 文件 / 810 测试
pnpm build:vite
```

### 四、三条仪器/流程教训（都是这几十轮真踩出来的，写给下一批）

1. **只报计数的批量脚本不可信**（第 46 轮）：必须逐站点打印「改了什么」。判据是台账 + 原文 diff + `tsc`，
   不是脚本自己的计数。而且 `codeOnly()` 与原文**并非处处等长** —— 按偏移做行映射会错位，
   错位后「删掉相邻的无害行」会伪装成「没有错误」，一次就骗过了整轮判断。
2. **`tsc` / `vue-tsc` 的点名行号指向整个表达式起点，不是 `as` 记号那一行**（第 48 轮）：
   按行回退必须留「迭代 + 顽固站点整文件回退」两手。
3. **`.vue` 里的类型债只有 `typecheck:vue` 看得见**（第 31 / 39 / 48 轮，同一个坑三次）：
   批量改写只要碰了 `.vue`，就必须再跑它。

### 五、仍需人决定的三件事

1. `Record<string, any>`（35 处 / 31 文件）是否纳入 `any-hatches` 口径（纳入则基线要从 45 抬到约 80）。
2. 第 45 轮记的三处真问题要不要修 —— `element-page.ts` 的 `_openRetry` 首次 `open` 其实不重试、
   `file-audio-page.ts` 未移动就点进度条会把 `undefined` 交给 `currentTime`、
   `progressPointermove` 的 `this` 标注与运行时不一致。三处都会**改变行为**，需要一次实机回归。
3. 阶段 1c（`src/ui/` 搬迁 + 换接线）的实机回归安排在什么时候。

## 删完之后应该发生什么

- `legacy-ui-lines` 轴：2820 → 0
- `legacy-ui-refs` 轴：4 → 0（当前那 4 项里有 2 项就是 `ui/` 自身）
- `stores/ui.ts` 里那 21 行 `UI.x = UIEngine.x` 的转发（`ui-window.ts`）可删；`stores/ui.ts` 的
  动作层改为直连 `UIEngine`，`getLazyWindow('ui')` 也能一并退场
- 台账的 `dom-on-exempted` 会小幅下降（`ui-window.ts` 不在白名单里，但 `legacy-ui-lines` 归零是主信号）
