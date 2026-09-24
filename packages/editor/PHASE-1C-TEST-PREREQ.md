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
expect(uiStateKeys).toHaveLength(6); // ← 已失效：实际 25 项
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

| 文件                                     | 判定                                                                                                                                                                                                                                         |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `engine/__tests__/scene.spec.ts`         | **不** mock `@app/stores/ui`（用真 store），但把 `renderingFunction`/`drawElements` 都标成了 `vi.fn()` ⇒ **不会走到** `GL.matrix.set(getUIStore().matrix!)`，因此 `matrix` 为 null 不构成问题。**低风险**                                    |
| `engine/__tests__/animation.spec.ts`     | 同上（`drawBackground`/`drawElements` 均为 `vi.fn()`）。**低风险**                                                                                                                                                                           |
| `engine/__tests__/webgl.spec.ts`         | 同上；它测的是真实的 `GL.drawElements`（bufferData 路径），不经过 ui-engine。**低风险**                                                                                                                                                      |
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

| 槽位                                                        | 遗留层内部引用 | store 接管 | 真结论                                                                                            |
| ----------------------------------------------------------- | -------------- | ---------- | ------------------------------------------------------------------------------------------------- |
| `scrollLeft` / `scrollTop` / `scrollRight` / `scrollBottom` | **0**          | ✅         | **已完全迁到 store**；遗留侧的 `this.scrollXxx = null` 已是死字段                                 |
| `controlPointActive` / `controlPointRotation`               | 4 / 1          | ❌         | **遗留层内部专用**（只在 `ui-pointer` / `ui-transform` 里用），随阶段 1c 一起删，**不需要找新家** |

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
	active: null as unknown as ActiveEditorShape | null
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

| 文件                                  | 挂的成员数             | 域                                                                              |
| ------------------------------------- | ---------------------- | ------------------------------------------------------------------------------- |
| `ui-window.ts`                        | 21（自身）+ 对象字面量 | **接线/形状**（唯一真·接线件）                                                  |
| `ui-events.ts`                        | 21                     | 窗口事件（21 个 handler）                                                       |
| `ui-transform.ts`                     | 18                     | 元素变换/属性同步                                                               |
| `ui-file.ts`                          | 15                     | 文档生命周期（open/load/save/close/destroy + copy/paste/undo/redo）             |
| `ui-list.ts`                          | 10                     | 列表交互                                                                        |
| `ui-pointer.ts`                       | 8                      | 画布指针交互（marquee/selectObject/pointermove…）                               |
| `ui-prefab.ts`                        | 8                      | **预设/预制体**（registerPreset / hasPrefab / createPrefabItem / loadElement…） |
| `ui-initialize.ts`                    | 1（`initialize`）      | DOM 引用与定时器初始化                                                          |
| `element-registry.ts` / `register.ts` | 0                      | 元素注册表 + import 顺序                                                        |

合计 **103 处 `UI.x = ` 赋值**分布在 8 个域模块里（本行早先写 102，漏了 `ui-prefab.ts:105` 的链式赋值；
实测口径与守卫见文末「删完之后应该发生什么」）。

### 一个必须先补的缺口：**41 个槽位**

精确核对（遗留层挂载 102 个成员 vs store 暴露 61 个同名动作）后，**store 尚缺 41 个**。
但按「实现来源」拆开看，情况比数字乐观得多：

| 类别                              | 数量   | 说明                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. UIEngine 自身函数**          | **10** | `drawBackground` / `drawElements` / `drawCoordinateAxes` / `drawHoverWireframe` / `drawTargetWireframe` / `drawTargetAnchor` / `drawControlPoints` / `getPointerCoords` / `updateCamera` / `updateControlPoints` / `selectControlPoint` / `renderingFunction` / `stopRendering` —— 这些在 `ui-engine.ts` 里**已有实现**，只需 `UIEngine.x.apply(UI, args)`（`this` 绑定，见附录一），**零新逻辑** |
| **B. `ui-prefab.ts` 域方法**      | **2**  | `createPrefabItem` / `loadElement` —— 需要真正搬过来                                                                                                                                                                                                                                                                                                                                              |
| **C. `ui-list.ts` 域方法**        | **5**  | `listKeydown` / `listPointerdown` / `listRename` / `listPageResize` / `searcherInput`                                                                                                                                                                                                                                                                                                             |
| **D. `ui-events.ts` 域 handler**  | **8**  | `keydown` / `themechange` / `localizationchange` / `loadFromProject` / `screenBlur` / `screenUserscroll` / `translationKeyup`                                                                                                                                                                                                                                                                     |
| **E. `ui-pointer.ts` 域 handler** | **5**  | `selectObject` / `marqueePointermove` / `marqueePointerleave` / `menuPopup` / `pointerup` / `pointermove`                                                                                                                                                                                                                                                                                         |
| **F. `ui-transform.ts` 域方法**   | **3**  | `updateAllReferences` / `updateHead` / `resize`                                                                                                                                                                                                                                                                                                                                                   |

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

|                                       | 谁来赋值                                                     | 何时赋值                        |
| ------------------------------------- | ------------------------------------------------------------ | ------------------------------- |
| 旧：`UI.head` / `UI.list`             | `ui-window.ts` 的对象字面量                                  | **模块加载期**（import 时就绪） |
| 我改成：`getUIStore().head` / `.list` | `ui-initialize.ts` 的 `this.head = …`（经 `uiStateKeys` 桥） | **`UI.initialize()` 时**        |

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

| 字段                          | 真实写入点                           | 后果                                            |
| ----------------------------- | ------------------------------------ | ----------------------------------------------- |
| `root` / `nodes` / `history`  | `ui-file.ts` 写 `this.x`             | 崩溃 + 黑屏 ✅ 已修                             |
| `scrollLeft/Top/Right/Bottom` | `ui-engine.ts:434` 写 `this.scrollX` | `animation-element.ts` 的 `!` 读到 null ✅ 已修 |
| `dragging`                    | `ui-pointer.ts` 写 `this.dragging`   | 按钮按下态判断恒 false ✅ 已修                  |
| `hover`                       | `ui-transform.ts` 写 `this.hover`    | 按钮/文本框 hover 贴图静默失效 ✅ 已修          |

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
		UI.drawBackground!(); // ← 方法调用，this 绑定到 UI 单例
		// …其余 6 个同理
	}
};
```

我曾把它改成 `UIEngine.drawXxx!.call(this)` 并加了一行"保护"：

```ts
if (!this?.renderingFunction) return; // ← 致命
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
this.red = parseInt(hex.slice(0, 2), 16) / 255; // …green/blue
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

| 操作           | 调用链                                             | 结果            |
| -------------- | -------------------------------------------------- | --------------- |
| 左侧列表点选   | `UI.listSelect` → `UI.setTarget` → store           | ✅ 选中框出来了 |
| **画布上点选** | `UI.marqueePointerdown` → `this.selectObject(x,y)` | ❌ 无反应       |

既然列表那条能出框，说明 `setTarget` / store / 绘制链**全都是通的** —— 问题只在
`selectObject` 这一个函数里。

### 根因：`UI.selectObject` 读了已迁到 store 的 `this.root`

```ts
// 修复前（ui-pointer.ts）
return function (this: UIShape, x: number, y: number) {
	return find(this.root.children, x, y); // ❌ this.root 是 undefined
};
```

`root` 和其它字段一样在迁移中搬进了 store（`ui-file.ts` 的 `getUIStore().root = this.root`），
所以遗留的 `this.root` 从来不会被赋值 ⇒ 读 `.children` 直接抛
`Cannot read properties of undefined (reading 'children')` ⇒ 每次画布点选都在
「先找对象」这一步就断了。

**而列表路径不经过 `selectObject`，所以它照常工作** —— 这正是那句话能定位问题的原因。

### 同形状还有 5 处（一起修了）

| 位置                                               | 读法                       | 后果                          |
| -------------------------------------------------- | -------------------------- | ----------------------------- |
| `ui-pointer.ts` `selectObject`                     | `this.root.children`       | 画布点选失效（主症状）        |
| `ui-transform.ts` `updateElementFont` ×2           | `this.root`                | 换字体不刷新                  |
| `ui-transform.ts` `updateElementLanguage`          | `this.root.children`       | 换语言不刷新                  |
| `ui-transform.ts` `updateElementTextScaling`       | `this.root.children`       | 改文本缩放不刷新              |
| `ui-transform.ts` `UI.resize`                      | `this.root.resize()`       | **缩放/改尺寸时不重算根节点** |
| `ui-transform.ts` `UI.updateElement`               | `this.nodes` / `this.root` | 元素改名/属性同步失效         |
| `ui-events.ts` `loadFromConfig` 的 foreground 回调 | `this.root.resize()`       | 改前景色不重绘                |

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

|              | 位置                                                              | 谁在用                                                                         |
| ------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 相机**写入** | `UI.matrix`（`ui-initialize.ts` 的 `this.matrix = new Matrix()`） | `ui-engine.ts` 的 `updateTransform`：`this.matrix.reset().scale().translate()` |
| 绘制**读取** | `getUIStore().matrix`                                             | `element-base.ts:85/149`、`ui-engine.ts:477/567/638`                           |

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
getUIStore().matrix = this.matrix; // ← 之后两边是同一个对象
```

初值仍保留（防初始化前读到 null），但它不再是真源。

### 这一类缺陷的完整清单（本次迁移累计发现）

`target` / `list` / `meta` / `root` / `nodes` / `history` / `dragging` / `hover` /
`scroll*` / `background` / `foreground` / **`matrix`** —— 全部是同一个形状：
**store 声明了字段，但真正的写入方在遗留单例上。**

区别只在于"症状形态"：

| 症状                                | 触发条件                                                |
| ----------------------------------- | ------------------------------------------------------- |
| 抛 `Cannot read properties of null` | 读取方用了 `!`，且初值是 `null`                         |
| **静默不显示 / 不更新**             | 读取方用了 `?.`，或初值是**合法值**（单位矩阵、透明色） |

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
interface UIElementShape {
	[k: string]: any;
} // ← element-base.ts:8
```

于是 `element.parent!.children` 的静态类型是 `any`，`.remove(x)` 怎么点都不报错。
`Data.manifest` 同理（`manifest: null` + 松散对象），`changes.append` 也不报错。

**这是本次迁移最危险的一类盲区**：`!` 抹掉 null、索引签名抹掉成员检查 ——
两个逃生口合起来，能让「一定会抛的代码」完整通过全部静态检查。

### 完整的家族清单（同一个机械改写，共 8 处）

| 文件                           | 错误写法                                | 正确写法                    |
| ------------------------------ | --------------------------------------- | --------------------------- |
| `file/file-system-core.ts`     | `changes.append(meta)`                  | `append(changes, meta)`     |
| `file/file-system-core.ts`     | `changes.remove(meta)`                  | `remove(changes, meta)`     |
| `file/directory-object.ts`     | `changes.remove(meta)`                  | `remove(changes, meta)`     |
| `engine/ui/element-base.ts` ×2 | `children.remove(element)`              | `remove(children, element)` |
| `scene/scene-context.ts` ×3    | `actors/animations/particles.remove(o)` | `remove(arr, o)`            |

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

| 形态                                      | 数量                 | 性质                                                           |
| ----------------------------------------- | -------------------- | -------------------------------------------------------------- |
| ② 对象字面量 `prop: null as unknown as T` | **584**（38 文件）   | 不是死写：接口声明非空，初值只能写 null ⇒ **要改类型**才能去掉 |
| ① 赋值 `X.prop = null as unknown as T`    | **82**               | 混合：其中一部分是**纯死写**，可直接删                         |
| ① 里的「直线型死写」                      | 初始 19 → 现在 **0** | 本轮已全部清除                                                 |

② 集中在：`command-object.ts` 74、`sprite.ts` 65、`transition-window.ts` 58、
`attribute-window.ts` 51、`local-window.ts` 44、`enum-window.ts` 40…

### 本轮的收益（已锁定进基线）

删掉 3 处「先写 null、紧接着又赋真值」的直线型死写块：

| 文件                                | 删除行 | 说明                                       |
| ----------------------------------- | ------ | ------------------------------------------ |
| `plugin/plugin-initialize.ts`       | 14     | 7 个成员占位 + 7 条 `no-explicit-any` 豁免 |
| `commands/custom-command-window.ts` | 6      | 6 个成员占位                               |
| `composables/useTeamWindow.ts`      | 6      | 6 个成员占位                               |

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
let animationWindow = null as unknown as typeof Animation; // ← 不是死写
export function bindAnimationWindow(instance) {
	animationWindow = instance;
}
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

| #   | 手法                                                                                         | 适用形态                                                         | 本轮实例                                                                                                                                              |
| --- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **类型本来就含 `\| null`** ⇒ 直接 `null as T \| null`（类型完全不变，只删掉 `unknown` 中转） | `null as unknown as T \| null`                                   | `useGetObjectPropertyCommandSchema` / `useRequestURLCommandSchema` / `update-log-window` / `printer`（共 8 处）                                       |
| 2   | **真值在同作用域已可得** ⇒ 字面量里直接内联，占位消失                                        | 循环变量/参数就在手边                                            | `engine/animation/animation-player.ts` 的 `layer: null as unknown as PlayerLayer` → `layer`（循环变量）                                               |
| 3   | **把子对象提前成局部 const** ⇒ 有序数组可内联进字面量                                        | `list/rectList: null as unknown as {x;y;angle}[]` 后紧跟整体赋值 | `ui/ui-initialize.ts`（用已有 `UIControlPoints` 标注 + `list: []`）、`animation/animation-initialize.ts`（提取 `rectRotate`/`rectResize` 两个 const） |
| 4   | **标注成标准库类型** ⇒ 其属性本就允许 null                                                   | `{ writable: true, value: null as unknown as T }`                | `data/metadata.ts` → `const fileDescriptor: PropertyDescriptor`（`value?: any`，`null` 直接合法）                                                     |

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

| 形态                                                                   | 数量 | 占比  |
| ---------------------------------------------------------------------- | ---- | ----- |
| `literal-prop`：对象字面量里的属性初始化 `name: null as unknown as T,` | 539  | 82.9% |
| `stmt-assign`：语句赋值 `x = null as unknown as T`                     | 63   | 9.7%  |
| 其它                                                                   | 43   | 6.6%  |
| `decl-init`：`const x = null as unknown as T`                          | 5    | 0.8%  |

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

| 手法 | 触发条件                                                                  | 处理                                                |
| ---- | ------------------------------------------------------------------------- | --------------------------------------------------- |
| 5a   | 字面量顶层、单行属性、右值恰为 `null as unknown as …`                     | 自动清理（348 处 / 18 文件）                        |
| 5b   | 类型标注跨行（`searcher: null as unknown as` 换行接 `HTMLElement & {…}`） | 人工（本轮剩 6 处）                                 |
| 5c   | 占位在嵌套层级（`Partial` 是浅层的，删了会让内层对不上类型）              | 人工（本轮剩 5 处，如 `variable.ts` 的 `inputs.*`） |
| 5d   | `.vue` 脚本段里的局部对象字面量                                           | 人工（本轮剩 10 处）                                |

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
   _教训：指标下降时，先确认是「问题变少」还是「探针失效」。_

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

| 语义                                 | 例子                                                               | 删掉的后果                           |
| ------------------------------------ | ------------------------------------------------------------------ | ------------------------------------ |
| **预声明**（后面紧跟 binder 赋真值） | `list.copy = null` + 末尾 `bindListClipboardMethods({list})`       | 安全                                 |
| **状态重置**                         | `Particle.close()` 里的 `this.context/meta/layers/emitter = null`  | ❌ 字段**保留旧值**                  |
| **故意禁用**                         | `if (this.noWindow) { this.load = null; this.initialize = null; }` | ❌ 回落到原型方法，noWindow 语义反转 |

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

| #   | 处理                                                                                                          | 手法                                                                                                                                                                                      | 波及面                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1   | `searcher` / `overviewPane` / `filterManifest` / `context` / `Layer` / `Element` 六个**跨行类型**的字面量属性 | 5b：属性本身就是占位，整段删掉（字面量早已是 `satisfies Partial<T> as T`）                                                                                                                | 0                                                                                   |
| 2   | `text-capture.ts` 的两处 `element: null as unknown as EventTargetElement`                                     | 类型改 `\| null` + 字面量写 `null`。**读侧本来就是 `this.element ? getFocus(...) : undefined`**                                                                                           | 0                                                                                   |
| 3   | `window-element.ts` 的 `matrix: null as unknown as Matrix`                                                    | **饿汉构造**：`matrix: new Matrix()`。`Matrix extends Float32Array(9)`，构造就是置单位阵；`element-base.ts` 的构造函数本来就是 `this.matrix = new Matrix()`，这是跟既有约定对齐           | 0                                                                                   |
| 4   | `progress-bar-element.ts` 的 `vertexLength` / `drawingLength`                                                 | 给「长度」一个自然初值 `0`（`calculateProgressVertices()` 每条返回路径都先写它们再返回）                                                                                                  | 0                                                                                   |
| 5   | `useCommandState.CommandState.id`                                                                             | 类型改 `\| null`                                                                                                                                                                          | **2**（`schema.ts` 的 `save()` 里三处补 `!`，并写明「只在解析后调用」这一既有前提） |
| 6   | 两个 `.vue` 里 `withDefaults(defineProps<Props>(), { … })` 的 5 个 `null as unknown as Fn` 默认值             | **直接删掉**：这些 prop 本来就声明成可选（`localize?: …`），可选 prop 的默认值本来就是 `undefined`；读侧也早就是真值判断 / `?.()`。只剩两个 getter 需要 `?? null` 维持 `\| null` 返回契约 | 0（+ `vue-tsc` 兜底）                                                               |

**结果**：`null-casts` 45 → 28，`unknown-casts` 806 → 789。

### 两个「探针报错太多」的案例（本轮**故意没动**）

| 候选                                            | 改动                             | tsc 报错 | 结论                                                                                                                                                                                                     |
| ----------------------------------------------- | -------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CommandState.words`                            | `\| null`                        | **184**  | `words.push(...)` 遍布几乎所有指令 schema。不能用 `\| null` 硬推                                                                                                                                         |
| `command-custom.ts` 的 `Command.custom = { … }` | 改成 `satisfies Partial<…> as …` | 15+      | 这个字面量是**赋值形态**（类型来自赋值目标），且内部 ~15 个方法依赖 `this` 的**非可选**类型；`Partial<T>` 会把每个成员变成 `\| undefined` ⇒ 内部全炸。**该文件的形态不适合这套手法**，已在工具输出里标注 |

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

| 文件                                                                                             | 漏掉的                         |
| ------------------------------------------------------------------------------------------------ | ------------------------------ |
| `plugin-parse-meta.ts`                                                                           | `null as unknown as` **8 → 0** |
| `commands/schema.ts`                                                                             | `null-cast` 1 → 0              |
| `animation-initialize.ts`                                                                        | `null-cast` 2 → 0              |
| `animation-player.ts` / `custom-command-window.ts` / `useTeamWindow.ts` / `plugin-initialize.ts` | 各 1–2 → 0                     |
| （DOM 模式同理，但 `dom-pending` 复核后仍为 0，门禁结论未变）                                    |                                |

**修复**：给扫描器补上正则字面量识别 —— 用「上一个有意义字符/标识符」判断 `/` 是正则还是除号
（跟在标识符/数字/`)`/`]` 之后是除号；`return`/`typeof` 等关键字之后是正则），
正则体内跳过转义与字符类 `[...]`，不跨行。

**回归测试**：`scripts/lib/self-test.mjs` 新增 5 条用例（25 → **30 通过**），
覆盖「正则含引号 / 含反引号 / 字符类里的斜杠 / 除号不误判 / `return /re/`」。
并且**证明了用例非空测**：拿修复前的算法跑同样输入，命中数是 `0 → 1`。

**⚠️ 这导致两条轴的数字「上升」，属于口径修正而非回归**：

| 轴              | 修复前（瞎） | 修复后（真值） |
| --------------- | ------------ | -------------- |
| `null-casts`    | 28           | **35**         |
| `unknown-casts` | 789          | **799**        |

也就是说：**第 23–26 轮报出的数字都是偏低的历史值**，真实起点比当时看到的高。
按台账的既定流程（「若这是有意的设计变更，请复核后在 PR 里显式执行 `--update-baseline`
并在描述里贴前后对比」），本轮已复核并显式更新基线 + 在此处留档。

### 第 27 轮同时清掉的 8 处（真修复）

| #   | 位置                                                                                     | 手法                                                                                                                                                                           | 波及面 |
| --- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| 1–5 | `plugin-parse-meta.ts` 的 `overview` / `parameters` / `paramMap` / `langMap` / `manager` | 这五个的**初值就是返回的闭包开头立刻写进去的值**（`{ requires: [] }` / `[]` / `{}` / `new LanguageMap()` / `new OptionManager()`）⇒ 直接写成真值，类型保持不可空，读侧一行不改 | 0      |
| 6–7 | `scene-animate.ts` 的 `items` 记录（`tilemap: null` ×2）                                 | 记录的值类型改 `Record<string, HTMLElement \| null>`；读取处本来就是 `if (element)` 真值判断                                                                                   | 0      |
| 8   | `tree-api.ts` 的 `renderElement` SSR 分支                                                | 原写 `null as unknown as HTMLDivElement`（谎报非空 host，随后 `render(vnode, null)` 会以难懂方式炸）⇒ 改成**显式抛错**说明「这里需要 DOM」                                     | 0      |

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

| #     | 位置                                                                                                                         | 手法                                                                                                                                                                                        | 波及面                                                                                                                                                                             |
| ----- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1–5   | `plugin-parse-meta.ts` 收尾重置块里的 `overview` / `parameters` / `paramMap` / `langMap` / `manager`                         | **删掉**：闭包开头（L786 起）会无条件重新赋值，这五行是纯死写；而且 `meta` 已通过 `Object.defineProperties` 持有 `langMap`/`manager` 引用，置空也释放不了内存                               | 0                                                                                                                                                                                  |
| 6–7   | 同文件 `parameter` 的声明与重置                                                                                              | 类型改 `ParameterShape \| null`。**代码本来就有十来处 `if (parameter === null) return;` 与 `parameter?.type`** —— 只有类型在谎报                                                            | 5 处（都是「解析阶段才可能为 null」的读点，补 `!` 并逐条写明前提：`parseDefault()` 唯一调用点就在 `if (parameter === null) return;` 之后；`append()`/`relate()` 只在解析阶段调用） |
| 8–9   | `YMParamList.vue` 的 `self.start = null as unknown as number` ×2                                                             | `ParamListElement.start` **本来就是 `number \| null`**（L125）⇒ 直接写 `null`                                                                                                               | 0                                                                                                                                                                                  |
| 10–11 | `image-crop-window.ts` 的 `resolve(null as unknown as HTMLImageElement)` 与 `image ?? (null as unknown as HTMLImageElement)` | `new Promise<HTMLImageElement \| null>`：图片加载失败时**确实** resolve null，`.then` 回调本来就按可空声明。`updateTitle` 的参数是 `(...args: unknown[])`，`??` 那一支永远走不到 ⇒ 一并去掉 | 0                                                                                                                                                                                  |

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

| 位置                                              | 数量 | 建议                                                                                                                                |
| ------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `variable.ts` 的 `inputs.*`                       | 5    | 嵌套成员改 `\| null` + 读侧；`inputs` 是「元素注册表」语义，可以整体看成一个可空子对象                                              |
| `command-custom.ts`                               | 3    | 该字面量是**赋值形态**且内部方法依赖 `this` 非可选（实测改 `satisfies Partial<…>` 会炸 15+ 处）⇒ 要么给这三个字段加 `?`，要么换写法 |
| `useCallEventCommandSchema.ts`                    | 2    | `let input: … = null as unknown as …` 声明形态，按第 27 轮 `parameter` 的同款做法                                                   |
| `YMTabBar.vue` 的 `hint` ×2                       | 2    | 拖拽态契约：`hint` 在 3 条构造路径里有 2 条没有值，读侧却按非空用 ⇒ 要先定「无 hint 的拖拽态怎么办」                                |
| `Particle.emitter`                                | 1    | 见上（15 处断言，安全但成批）                                                                                                       |
| `ui-file.ts` 的 `this.history`                    | 1    | `close()` 清空 + 读侧 `this.history.canUndo()` ⇒ 同 emitter                                                                         |
| `editdata.ts` 的 `editor`                         | 1    | 与已改成 `\| null` 的 `model` 成对；约 14 个读点                                                                                    |
| `useCommandState.ts` 的 `words`                   | 1    | 184 处读取（`words.push` 遍布指令 schema），**不要**用 `\| null` 硬推                                                               |
| `animation-window-engine.ts` 的 `animationWindow` | 1    | 40 个读点；且不能用抛错桩（`if (animationWindow.layers !== null)` 会恒真）                                                          |
| `text-capture.ts` 的 `ColorProxy.color`           | 1    | 要动 `read(): string` 契约                                                                                                          |
| `tree-api.ts` 的 `textBox`                        | 1    | 模块加载期的 SSR 分支，要先定契约                                                                                                   |
| `command-api.ts`                                  | 1    | 单点，未评估                                                                                                                        |

**共同的结论**：剩下的每一处都**需要一个契约决定**（要么「这个字段什么时候可以为 null」，
要么「读侧怎么处理」），机械替换的时代已经过去了 —— 这与第 26 轮末尾的判断一致。

### 第 29 轮：把「读侧早就当可空用」的那批一次清完 —— 21 → 12

上一轮量错的那一处先更正（见上），本轮真正清掉 9 处，全部属于同一个模式：
**声明在撒谎，而它所有的读取点早就在按可空处理**。所以每一项都只需要改类型，
再让 tsc 把「少数几个没判空的点」报出来：

| #   | 位置                                                                      | 手法                                                           | 波及面 | 备注                                                                                                                                                                                                                                                                                             |
| --- | ------------------------------------------------------------------------- | -------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1–2 | `useCallEventCommandSchema.ts` 两处 `let input: … = null as unknown as …` | 去掉初值，交给 tsc 的「使用前赋值」分析                        | **9**  | 分析报出 9 处「使用前未赋值」⇒ 两个 `switch` 因为 `CallEventArg.type` 是普通 `string` **本来就无法穷尽**，落空时 `input` 保持 null、在下面的 `setTooltip`/`appendChild` 处以「null 上取属性」炸 ⇒ 各补一个 `default: throw` 明确报错（**这处不是删谎言，而是把一个隐藏的空指针变成了具名错误**） |
| 3   | `editdata.ts` 的 `editor` 类字段                                          | `(…IStandaloneCodeEditor & { getFocus?: () => void }) \| null` | 5      | 与第 25 轮已改成 `\| null` 的 `model` 成对；补的 `!` 与相邻的 `this.model!` 同一约定                                                                                                                                                                                                             |
| 4   | `ui-window.ts` 的 `UIShape.history`                                       | `History \| null`                                              | 7      | store 侧的 `history` 早就改成 `History \| null` 并写明「调用方必须判空」——只有单例侧没跟上；`ui-list.ts` 的 5 处 `UI.history.save(` 补 `!`，`ui-file.ts` 的 undo/redo 条件改 `this.history?.canUndo()`（`?.` 在条件里顺带完成收窄，函数体不用再改）                                              |
| 5–9 | `variable.ts` 的 `inputs.name/value/number/string/note`                   | 5 行声明改 `YamiElement \| null`，字面量去掉 cast              | **1**  | `inputs` 形状里本来就有 `[k: string]: unknown` 索引签名，动态读取（`this.inputs[type]`）走的是它 ⇒ 全仓只有一个读点报错（`panel.ts` 的 `const { style } = Variable.inputs.value`，补 `!`）                                                                                                       |

**⛔ 本轮自己踩到并当场纠正的一个坑**：改 `ui-window.ts` 的 `UIShape.history` 时顺手写了一段
7 行说明注释，结果 `legacy-ui-lines` 立刻从 2868 涨到 2874 ——
**`src/ui/` 里加的每一行都算迁移债**（这个约定第 23 轮就写下了）。已把注释缩成零行、
说明挪到本文档，轴回到 2868。以后在 `src/ui/` 里只做**等长或减行**的改动。

### 第 30 轮：赋值形态的 3 处 + 两处单点契约 —— 12 → 7

| #   | 位置                                                                     | 手法                                                                       | 波及面 | 备注                                                                                                                                                                                                                                                                                                                                                       |
| --- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1–3 | `command-object.ts` 的 `windowFrame` / `parameterPane` / `parameterGrid` | 字段改可选（`windowFrame?: …`），带一段说明注释                            | 5      | 这一处是**赋形字面量**（类型来自赋值目标），`satisfies Partial<T> as T` 走不通（TS2352：字面量里仍留着值为 `null` 的成员）⇒ 只能把字段改成可选；`command-custom.ts` 的 8 行占位赋值删掉，5 个读点补 `!`（`this.windowFrame!` / `this.parameterPane!`）。与 `initialize()` 里本来就有的 `if (!this.parameterPane) return;` 相互印证：它**本来就当成可空用** |
| 4   | `tools/text-capture.ts` 的 `ColorProxy.color`                            | `color: string \| null` + `read(): string \| null`，字面量写 `color: null` | 1      | 同一文件里 `VariableProxy.element` 一并改成 `EventTargetElement \| null`                                                                                                                                                                                                                                                                                   |
| 5   | `YMCommandList/command-api.ts` 的 `element.contents`                     | 删断言、直接赋 `null`                                                      | 0      | **不是新契约**：`contents` 的声明本来就是 `CommandContent[] \| null`，当初那句 `null as unknown as CommandContent[]` 纯粹是写法债                                                                                                                                                                                                                          |

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

| 路径                                   | 位置               | hint                             |
| -------------------------------------- | ------------------ | -------------------------------- |
| `mode: 'close'`（按住标签上的 × 拖动） | `pointerdown` L351 | **无**（不显示落点提示）         |
| `mode: 'popup'`（右键拖出菜单）        | `pointerdown` L373 | **无**                           |
| HTML5 拖动（`dragstart`）              | L392               | `createDragAndDropHintElement()` |

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

1. **PowerShell 变量名大小写不敏感** —— 我用 `$T="`t"`存制表符，而`$t` 正是文件内容，结果**把内容覆盖成了一个制表符**。所幸脚本在写入前有一条长度 sanity check 挡住了。以后存放内容的变量一律用 `$content` 这类不会撞车的名字。
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

| 文件                               | 读点 | 备注                                              |
| ---------------------------------- | ---- | ------------------------------------------------- |
| `particle-motion.ts`               | 30   | 每个函数都以 `const emitter = this.emitter;` 开头 |
| `particle-pointer.ts`              | 11   | 有 1 处局部量 + 2 处 `this.emitter.` 直读         |
| `particle-list.ts`                 | 6    | 列表回调 onCreate/onRemove/onDelete/onResume      |
| `particle-file.ts`                 | 2    | `save()` 的赋值 + `restart()` 的读                |
| `particle-events.ts`               | 1    | 已在 `state === 'open'` 守卫内                    |
| `inspector/particle-layer-page.ts` | 1    | inspector 回调                                    |

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
const make = (m) => `[${m}: string]: ...`; // ← 有捕获组时，第一个参数是**整个匹配**，不是分组
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

| 文件                                     | 性质                                                                  | 结果                                                                                                                                                                       |
| ---------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `engine/scene/scene-selection-engine.ts` | 模块私有 `SceneObjectShape`（角色/动画/区域/光照/粒子/视差/瓦片共用） | 47 个报错点名 **21 个真属性**，全部枚举进类型；**零新增断言** —— `data`（`object.data?.size ?? 1`）与 `emitter`（`emitter?.bounding`）读侧本来就写了 `?.`，所以标 `?` 即可 |
| `data/transition-window.ts`              | `EasingDrag` 上的索引签名                                             | **0 个报错** ⇒ 纯噪声，直接删掉                                                                                                                                            |
| `engine/layout/layout.ts`                | `LayoutScheme` 上的索引签名                                           | **0 个报错** ⇒ 直接删掉                                                                                                                                                    |
| `commands/custom-command-window.ts`      | 大方法面板接口                                                        | 只报出 2 个真成员：`state` / `commands` —— 正是与 Pinia store 桥接的那对键（`stores/custom-command.ts` 的 `customCommandStateKeys`），按 store 的 `shallowRef` 类型补上    |
| `composables/useTeamWindow.ts`           | `TeamData`                                                            | 报出 1 个真成员 `parent`                                                                                                                                                   |

**一处被 tsc 纠正的错误假设（如实记录）**：我先按「读侧从不判空 ⇒ 声明为必需」的约定把 `parent` 写成必需，tsc 立刻报 3 处 —— **新建队伍时该字段还不存在**（`createData` 只造 id/name/…，父节点由树列表稍后挂上）。改成 `parent?`，并在唯一那个「已挂进树」的读点（`list_updateTextNode`）补 1 个 `!`。这正是「先改类型、让 tsc 把真实契约顶出来」的价值：我原来的猜测是错的，而错在**类型层就被挡住**，没有变成运行时的 NaN。

**验证**：5 个文件的 esbuild 产物**逐字节相同**（14767 / 34167 / 56386 / 10393 / 12649 字节）⇒ 纯类型改动、零运行时影响。`stale-exemptions` 保持 0 —— 删索引签名的同时把上面那行 `oxlint-disable-next-line no-explicit-any` 一并删掉，没有留下陈旧豁免。

**下一批怎么挑（重要）**：从第 37 轮的全量测量看，核心形状（`schema.ts`、`useCommandParse.ts`、`animation-player.ts`、`particle-engine.ts`…）的读点级联是几十到几百，每处都要走「删签名 → tsc 点名 → 逐个给类型」这一套。所以下一轮优先挑**级联为 0 的纯噪声索引签名**（本轮那两个就是最便宜的例子），把「删掉即完事」的先扫干净，再啃需要枚举的硬骨头。

## 第 39 轮：一次拿到全图（65 → 64）—— 以及「tsc 对 .vue 是假绿」再次被门禁抓住

### ① 全量测量：5897 个错误，说明剩下的索引签名**全是承重的**

把剩余 65 处一次性全删（改前逐文件备份到 `%TEMP%`）→ `tsc` 报 **5897 个错误**，散落在约 290 个文件。前排：`scene-window` 296、`animation-timeline` 285、`animation-motion` 235、`animation-list` 212、`scene-events-pointer` 212、`layout` 180、`animation-window-engine` 129…… ⇒ 「整批换成 `unknown`」或「整批删掉」都没有空间，只能逐个定契约（如第 38 轮那样）。

一次性全删还有个副作用：**恢复了全部 36 个文件、树哈希与开轮时逐字节相同**（`f4bab0e5…`），确认测量过程没留下痕迹。

### ② 逐个候选的归因链（本轮最有价值的产出）

从「错误列表里没出现」推断出 8 个可疑文件（12 处），单独删它们：

| 步骤                                                                                       | 错误数 | 归因                                                                                                  |
| ------------------------------------------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------- |
| 删 8 个文件（12 处）                                                                       | 990    | 全是 `DynamicShape` ⇒ **`types/shapes.ts` 是全局松散对象类型**（承重）                                |
| 恢复 `types/shapes.ts`                                                                     | 109    | `ParticleEmitterShape` 71 + `UIElementInstance` 7 + 其余 ⇒ `particle-window.ts` 与 `engine/ui/*` 承重 |
| 恢复 `particle-window.ts` + `root-element.ts` + `window-element.ts` + `element-classes.ts` | 31     | 全是 `HistoryData` ⇒ **`types/history.ts` 承重**（历史记录载荷按操作变化）                            |
| 恢复 `types/history.ts`                                                                    | **0**  | 只剩两个 `.vue` 候选                                                                                  |

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

| 形态           | 数量 | 说明                                                                                                                                                                                                                                                                                                |
| -------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 缩进的赋值形态 | 11   | **状态重置 / 故意禁用**，要改类型（`\| null`）或换写法，不能删                                                                                                                                                                                                                                      |
| 声明形态       | 11   | `let x = null as unknown as T;`（`plugin-parse-meta` 6、`useCallEventCommandSchema` 2、`animation-window-engine` 1、`scene-animate` 1、`tree-api` 1）⇒ 应改成 `let x: T;` 或用 `\| null`，再让 tsc 找出「使用前未赋值」                                                                             |
| 其它           | 6    | `variable.ts` 的 `inputs.*`（嵌套 5 处，需 `\| null` + 读侧）、`text-capture.ts` 的 `ColorProxy.color`（要动 `read(): string` 契约）、`command-custom.ts`（形态不适合本套手法，见上表）、`image-crop-window.ts` 的 2 处**调用实参**、`tree-api.ts` 2 处、`command-api.ts` 1 处、两个 `.vue` 各 1 处 |

**推荐顺序**：声明形态（11 处）最机械 —— `let x: T;` 之后 tsc 会把「使用前未赋值」逐条报出来，
是纯机械的、tsc 全程兜底的改动；剩下的按「每个都要先定契约」单独处理。

另：`legacy-ui-refs` 轴**原为 2**（`tools/window-cluster.ts` 的 `export { UI }` 再导出 +
`import { uiWindowReady }`）。**第 ① 步已于 2026-09-21 第 94 轮落地，读数 2 → 1**
（删掉了那行再导出；`UI` 改由 `stores/ui.ts` / `file-system-core.ts` / `LayoutPanel.vue`
三处**内联 `import()`** 直连 `engine/ui/legacy/ui-window.ts`）。

> ⚠️ **两处纠偏，写给接手的人**：
>
> 1. **这里原先写「应改成 `loadUI` 直连 `ui-engine.ts`」—— 那个写法不能执行**：
>    `ui-engine.ts:2` 自己就 `import { loadUI } from '@app/stores/ui'`，把 `loadUI` 指向它是
>    循环，且它 resolve 出来的是**模块命名空间对象**、不是 `UI` 实例 ⇒ `UI.drawBackground`
>    恒 `undefined`，渲染会被静默打碎。① 的正确形态是**直连遗留窗口模块**（同附录三 ④ 的目标
>    分开：① 只换「从哪取」，④ 才换「取到的还是不是遗留对象」）。`await clusterReady`
>    **必须保留** —— 它等的是五个窗口全部就绪，只等 `uiWindowReady` 会缩短就绪契约。
> 2. **这条轴只数静态依赖**：上面那三处现在都是内联 `import()`，**轴看不见它们**。
>    所以「读到 1」**不等于**「只剩一个耦合点」。④ 收尾时请按这三处手工核对，别信读数。

## 交接（第 87 轮 · 当前真实数字与工作单）——**先读这一节**

> 本节取代下面那份「交接（第 62 轮）」，是**唯一**仍然准确的现状描述。数字取自
> `node scripts/migration-ledger.mjs --check`。
>
> **数字刷新于第 91 轮（2026-09-21）**，全 15 轴当场重测（`unknown-casts` 已从 136 降到 89、
> 并修正了两条**恒为假 0** 的轴 —— 见下表脚注）。**以 `pnpm migration:ledger` 的输出为准**。

### 1. 轴现状

> ### ⚠️ 本节数字的复核记录（2026-09-21，第 89 轮 + 第 91 轮）
>
> 第 89 轮（无代码改动）核出**两处失真**：
>
> | 本文原写法                                                             | 实测              | 处置                                                                                                                     |
> | ---------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------ |
> | `any-hatches`「会话起点 **67**」                                       | 会话起点是 **52** | 67 是**第 62 轮扩口径当轮**的数（`32 + 35`）；第 63→87 轮之间又清掉了 15 处，**67 早就过时了**，却一直留在这里当「起点」 |
> | §4 工作单第 1 条：「**口径有跨行漏洞**，`Record<\n…,any\n>` 匹配不到」 | **漏洞不存在**    | 已删除该任务，理由见 §4                                                                                                  |
>
> 第 91 轮又核出**第三处、也是最严重的一处**：下表原先写的
> `legacy-ui-lines` / `legacy-ui-refs` = **0 / 0**，并据此判「阶段 1c 的 B（纯移动）已完成」。
> **两条轴都是假 0**：`legacy-ui-lines` 的目录被**写死**成 `packages/editor/src/ui`（P5-B 搬运后
> 该目录已不存在，而 `collectFiles` 对不存在的目录返回 `[]` 且不抛错）；`legacy-ui-refs` 用
> `^@app/ui/` 前缀、且只认 `import … from`（真实引用点是 `window-cluster.ts` 的**再导出**
> `export { UI } from '@app/engine/ui/legacy/ui-window.ts'`）。两条轴同时读 0，而
> `ui-singleton-members` 报 **103** —— **同一张表自相矛盾时，先怀疑仪器。** 已修（第 90 轮）。
>
> **教训（与「数字必须自证」同源）**：本文档的**历史轮次小节**是沿革记录，数的是当轮的数，
> 这是对的；但**交接节**声称「唯一准确」，就必须**每个数字都当场由脚本重测**。
> 上面那个「67」是「把第 62 轮的数字抄进第 87 轮的交接节」的产物 —— 抄的当时就已经不是真值；
> 那个「0 / 0」更糟，是**仪器瞎了却说「已完成」**。

| 轴                                                                     | 现状                            | 说明                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `unknown-casts`                                                        | **89 处 / 76 文件**             | 会话起点 285 ⇒ 已减 196（第 91 轮又清 12：修声明 5 / `registryElement` 收窄 5 / `Reflect.set` 2）                                                                                                                              |
| `any-hatches`                                                          | **52 处 / 26 文件**             | **实测起点就是 52**（索引签名 32 + `Record<string, any>` 20）。⚠️ 此前这里写的「起点 67」「跨行漏洞」均已被第 89 轮证伪 —— 见上方复核记录。**剩余全在承重形状上**（`SceneShape` / `DynamicShape` / `UIShape` / 粒子同名形状…） |
| `legacy-ui-lines`                                                      | **316 行 / 2 文件**             | 遗留单例层所在的**目录**（`dirname(uiWindowRel())`）。⚠️ 曾经假 0，见上方复核记录。**第 98 轮后目录里只剩 `ui-window.ts`（对象字面量 + 21 行镜像）与 `register.ts`（接线清单）** —— 2859 → 2807（第 96 轮 prefab）→ 2412（第 97 轮 transform）→ **316**（第 98 轮其余 6 个域模块）                                                                        |
| `legacy-ui-refs`                                                       | **1 处 / 1 文件**（runtime=1）  | 唯一剩项是 `tools/window-cluster.ts` 的 `import { uiWindowReady }`（`clusterReady` 必须等 UI 窗口就绪，属**正当依赖**，随 ④ 一起走）。⚠️ 曾经假 0。**只抓静态依赖**：1c ① 之后 `UI` 改由**三处内联 `import()`** 取（`stores/ui.ts`、`file/file-system-core.ts`、`components/layout/LayoutPanel.vue`），而动态 `import()` **不在这条轴的口径里** ⇒ **读数 1 不代表只剩 1 个耦合点**，④ 收尾必须按这三处手工核对 |
| `1c-store-slot-gaps`                                                   | **0 ✅（第 98 轮收口）**        | **第 90 轮新增**：store 引用了、但**实现只在遗留目录里**的槽位 = 1c 第 ③ 步的工作单（首轮 41）。**41 → 35**（第 96 轮 prefab 6 个槽位）→ **21**（第 97 轮 `ui-transform.ts`）→ **0**（第 98 轮其余 6 个域模块搬出）。⚠️ **为 0 只说明「实现在遗留目录里」按目录口径不再成立，不等于 store 拿到了所有权** —— 那 14 个槽位仍是 `UI.xxx = function(){…}`；真正拦着 1c 的是 `ui-singleton-members`（103 / declared 134，**不受目录影响**） |
| `ui-singleton-members`                                                 | 103 files=8 declared=134        | 属 P5-C/D，**等实机回归后才能动**（三条 1c 轴必须**同时**归零才算收口）                                                                                                                                                        |
| `null-casts` / `dom-pending` / `stale-exemptions` / `ui-slot-coverage` | 全 0                            | —                                                                                                                                                                                                                              |
| `unremovable-listeners` / `dom-on-exempted` / `dom-whitelist-size`     | 9 / 120 / 14                    | 只需不增                                                                                                                                                                                                                       |
| `dom-whitelist-drift` / `dom-whitelist-unjustified`                    | 0 / 0                           | 白名单单一真源（`.oxlintrc.json`）                                                                                                                                                                                             |

### 2. 已完成

- **P0**（解红）：`tree-core.ts` 的 `children: null` 崩溃（`4d26baf1`）。
- **P1**（仪器）：补 `ui-singleton-members` 轴、扩 `any-hatches` 口径（`a27d2819`）。
- **P5-B**（纯移动）：8 个遗留 UI 域模块 → `src/engine/ui/legacy/`（`8c40b735`），
  7 个文件零改动、2 个只改一个 import。
- **P4**：285 → 137（第 38–89 轮，逐轮记录见下面各节）；**第 91 轮再 101 → 89**。
- **第 90 轮（2026-09-21，仪器轮）**：修好两条**恒为假 0** 的轴（`legacy-ui-lines` /
  `legacy-ui-refs`，见 §1 的复核记录）、新增 `1c-store-slot-gaps` 轴（1c 第 ③ 步的工作单，
  首轮 41 与附录三手工数一致）、新增 `pnpm text:check` 文本污染门禁（7 条规则 + 11 条自证用例）、
  `docs-check` 重写（原实现只扫已删除的 `docs/`，恒绿）、`pnpm-lock.yaml` 入库
  （此前未跟踪而 CI 用 `--frozen-lockfile`）、清掉一批只被自身 spec 养着的死代码。
- **第 91 轮**：`scripts/` 的 37 条 lint warning 清零并把 `scripts` 纳入 `pnpm lint`；
  新增 `replacement-char` 规则并修掉 15 处 U+FFFD 编码事故（11 处从污染前的历史版本逐字恢复）。
- **顺带修的真 bug**：`FSP.existsSync`（`fs.promises.existsSync` 为 undefined，文件改名会抛）；
  7 个文件的文本污染（单词首字母被控制字符吃掉、两条真代码被吞进 `//` 注释）。
- **第 92–94 轮**：交接节里那项**查无内容**的待决策就地展开（「P6 三处行为缺陷」这个标签全仓
  `grep` + `git log -S` 都只有引用、没有清单，而唯一的清单在被本节声明已取代的旧交接节里）；
  修掉第 45 轮那两处行为缺陷并各配**会自证的**回归用例；**阶段 1c 第 ① 步落地**
  （`legacy-ui-refs` 2 → 1，并纠正计划里「直连 `ui-engine.ts`」这个**不能执行**的写法）。
- **第 95–96 轮**：量清 ③ 的机制（轴只认「遗留目录之外出现 `UI.<slot> =` 文本」，
  所以转发/纯移动都不降轴），并量出**绑定点不能放在 `loadUI`**（会被 `primeWindows` 短路，
  且 vitest 走 loader 路径 ⇒ 套件绿着骗你）；据此落地 ③ 的**首批切片** ——
  `ui-prefab.ts` 的 6 个 store 槽位（`hasPrefab` / `clearInvalidPrefabs` / `registerPreset` /
  `unregisterPreset` / `setAsPrefab` / `unsetAsPrefab`）搬到目录外的新模块
  `engine/ui/ui-slots.ts`，动态挂在 `uiWindowReady` 上 ⇒ `1c-store-slot-gaps` **41 → 35**、
  `legacy-ui-lines` 2859 → 2807，而 `ui-slot-coverage` **持平 0**（没有槽位搬丢）。
- **第 97 轮**：把 `ui-transform.ts` 整个从 `legacy/` 搬到 `engine/ui/`（纯移动，只改 import 路径）
  ⇒ `1c-store-slot-gaps` **35 → 21**、`legacy-ui-lines` 2807 → **2412**（文件数 9 → 8）。
  搬迁时实测到**一处仪器缺陷**并修掉：`assignedSlots()` 原先按「在不在 `legacy/` 目录里」
  决定要不要数 `this.x = …`，于是域模块一搬出去就少算它的 `this.x =`（实测 153 → 144）；
  当某个 store 引用的槽位只靠 `this.x =` 赋值时，`ui-slot-coverage` 会**凭空报上升**、
  把正确的搬运挡成假回归。判据已改为「`engine/ui/` 下、且自己直接写 `UI.<slot> = …` 的文件」。
- **第 98 轮**：把其余 6 个域模块（`ui-file` / `ui-events` / `ui-initialize` / `ui-list` /
  `ui-pointer` / `ui-prefab`）一并搬到 `engine/ui/`（仍是**纯移动**：只改 import 路径 +
  `register.ts` 的清单）⇒ **`1c-store-slot-gaps` 21 → 0（③ 收口）**、
  `legacy-ui-lines` 2412 → **316**（文件数 8 → 2：目录里只剩 `ui-window.ts` 与 `register.ts`）。
  同时改写了台账自证用例里那条「遗留层还在 ⟹ 槽位轴必须非 0」——它的前提已不成立，
  新判据**更强**：① 「主体还在」改由**与目录无关**的 `ui-singleton-members` 口径守；
  ② 「轴为 0」必须能被**独立重算**解释（直接翻遗留目录，不允许仍有非镜像的 store 槽位实现）；
  ③ 目录判据本身必须仍能把「已搬走的模块」与「遗留目录」分开。
  ⚠️ 但 ③ 收口**不等于 1c 收口**：`ui-singleton-members` 仍是 **103 处 / declared 134**，
  一字未动 —— 那是第 ④ 步（对象字面量退役），且是**运行时高危**，必须实机验证。

### 3. 手法库（拆 `as unknown as` 的五条，按判定顺序用）

1. **先看报错码**：TS2540 = 只读 ⇒ 用 `Reflect.set`；TS2352 = 可比性问题 ⇒ 下面几条；
   TS2345/TS2322 = **声明与事实不符** ⇒ 回去改声明。
2. **声明写松了**（第 75/76/83 轮）：N 个读点给同一形状打补丁 ⇒ 修声明/抽工厂/抽小工具。
3. **契约写偏了**（第 77 轮）：`textContent: string` 写紧了、参数要了用不到的能力、宿主漏声明成员。
4. **断言完紧接着写字段**（第 82/84/87 轮）：换 `Object.assign([], {...})`，零断言。
5. **索引签名写入 / 解锁只读**（第 78/81 轮）：`Reflect.set` / `Reflect.get`（**别**用它取有类型的返回值，
   那会引入没被计量的 `any`）。
6. **交叉断言**（第 85/86 轮）：保留对象类型只补缺口那一支；**边界**：交叉里必须有一支与源类型是同一支，
   否则 TS 仍报缺成员。
7. **收窄集中到一处**（第 91 轮）：按 id 取元素统一走 `registryElement<T>(registry, id)`；
   多读点各自 `as unknown as` 时先问「是不是同一个事实被解释了 N 遍」。
8. **「同名方法换签名」无解**（第 91 轮）：`WebGLRenderingContext.prototype.bufferData` 那种
   重载补丁连单次 `as` 都会被 TS2352 挡住 ⇒ 换机制（`Reflect.set`），而不是换写法。
9. **「同一批挂载里只有一条要断言」⇒ 先查接口漏了哪一行声明**（第 135 轮）：`variable.ts:158–163`
   连着 6 条挂载，`saveScroll`/`restoreScroll`/`cancelSearch`/`createFolder` 四条直接通过、
   只有 `createVariable` 要 `as unknown as` —— 差别是 `YamiElementApi` 里**漏了那一行**。
   补上后 `variable.ts` 与 `list-events.ts` **两处**断言整条消失。
   ⇒ 判别动作：把「要断言的那条」与**同一个对象上不用断言的邻居**对一下。
   这是第 122 轮「同文件里已有一处更弱的写法」的加强版（那次同文件，这次同对象同批挂载）。
   ⚠️ **边界（同轮实测）**：只有 `any` 源的断言才真多余；
   `Record<string, any>` 源去断言一个**带必填成员**的目标会被 `TS2741` 挡住
   （索引签名不满足必填属性）⇒ 那种断言是**承重的**（例：`command-list.ts:51` 桥
   `SettingConfig` 的 schema 驱动 config 到 ui-kit 契约）。动手前先跑一个 6 行控制实验。
10. **「注释说这里必须保留 `unknown`」⇒ 定期抽检，注释会过期**（第 136 轮，约 40 秒/处）：
    本轮抽检三处，结论分三种 ——
    - `transition-window.ts:187`：注释理由是**过时**的（说「`typeof Easing.list` 是字面量 `null`」，
      而形状里 `list` 早有真实声明 `:83`；实测真实阻塞是缺 9 个成员）⇒ 换交叉断言
      `list as NonNullable<typeof Easing.list>` ⇒ 断言消失，注释按实测改写；
    - `eslints.ts:63`：**真的承重**，但理由是**类侧松散**（`CommandList.prototype.elements` 的静态类型是
      `(...args: any[]) => any` ⇒ TS2352），与同文件 `:173` 那条「253 个属性不可比」**不是**同一件事
      ⇒ 就地补上理由（试错结论也算留档）；
    - `menu-list.ts:58–64`：注释**准确**（解释第 122 轮删掉的调用点）⇒ 放过。
    ⇒ 抽检的价值在**把三种结论分开**，不在于每次都能降一处；也提醒：**一条注释别套到两处上**。
11. **「断言去掉后 tsc 不响」⇒ 去查真值，可能藏着恒真的死守卫**（第 137 轮）：
    来源面是 `any`（`GL`、`Scene` 这类）时，`as unknown as T` 去掉之后 tsc **一声不响**
    —— 这时别急着判「多余」，先回答「这个值**运行时**到底是什么」。
    本轮实例：`scene-animate-engine.ts` 的 `hasRenderableCanvas()` 读 `Scene.screen.width` / `.height`，
    而 `Scene.screen` 是 `<div class="box" id="scene-screen">`（`LayoutPanel.vue`）——**div 没有
    `width`/`height` 属性**，`undefined !== 0` **恒真** ⇒ 那条「0×0 时跳过绘制」的守卫
    **从未生效过**，断言只是把误读圆了过去（本意：读 `GL.canvas`）。
    - 动作：**凡是「真值守卫」形状**（`x !== null` / `x !== undefined` / `x !== 0`）里出现的断言，
      先确认被读对象**有没有那个属性**；DOM 侧尤其常错 —— `width`/`height` 只有
      `canvas`/`img`/`video` 有，`div` 得用 `clientWidth`/`offsetWidth`。
    - 终点不是「删掉断言」，而是**读对的东西 + 留下实测理由**：只删断言会留下一条**恒真的死代码**，
      比断言更糟（断言至少看得见）。
    - 红证明的坑（第 128 轮的规矩）：复现件要保留**真实形态**（本轮靠 spec 里那个
      div 形态的 `scene.screen` mock 才红）；写成「那个字段干脆不存在」会**假绿** ——
      旧实现换个理由（`screen !== undefined`）也能返回同一结果。
12. **「读一个注入到 `window` 的全局」⇒ 补声明，别断言**（第 138 轮，2 处断言一次消掉）：
    `window as unknown as Record<string, unknown>` 的唯一作用就是绕过「TS 不许访问未知属性」；
    而 `src/preload-env.d.ts` **早就**为同一类注入 augment 过 `Window`（`yami?: YamiBridgeApi`）
    ⇒ 在同一处补 `__nodeRequire?: (moduleId: string) => unknown;` 与 `__SKIP_AUTO_INIT__?: boolean;`
    （注入点：`index.html:5` / `:21`），两处断言一起消失，**且不需要任何新断言**。
    - **可选性要如实**：`typeof window.__nodeRequire !== 'function'` 那个守卫在 vitest/jsdom 下
      是**真守卫**（不加载 index.html ⇒ 确实 `undefined`）⇒ 补声明时别把守卫顺手删了。
    - 派生收益：`components/__tests__/global-mounting.spec.ts` 的 `window as unknown as` 读模式
      白名单**从 4 条缩到 1 条**（其中 `Window: typeof Window` 一条实测陈旧、匹配不到任何行）。
    - ⇒ 一般判据：先问「这个全局为什么没有类型」，答案若是「没人写」，就写；断言是最后手段。
13. **断言可能是在「说谎」，而不只是「不够」**（第 139 轮，`codec.ts` 2 处）：
    前几轮的断言都是**不够**（缺声明 / 缺成员 / 索引签名不可比），这两处是**反的** ——
    `scene.terrains`（`SceneData.terrains?: string`）与 `tilemap.code`（`TilemapData.code?: string`）
    运行时确实是 **string**（`encodeTerrains` 返回 string，赋值在 `:74`），却被断言成 `Uint8Array`。
    而 `decodeTerrains` / `decodeTiles` 的形参**本来就收 `Uint8Array | string`** ⇒ 删掉断言即可。
    - **判据要问两端**：源头的**生产者**（谁赋的值、它的返回类型）+ 被调方的**形参联合**；
      只看读取侧只有一个 `!`，看不出任何问题。
    - **`as` 没有运行时作用** ⇒ 这类改动不需要红/绿证明，只需要 tsc 干净 + 该文件 spec 绿
      （本轮 `codec.spec.ts` 19/19）⇒ 优先找「源类型与目标类型看着不相干、但形参本来就收它」的形状。
    - 反例警示：**「类型更窄」的断言最容易骗过 review**（没人会怀疑一个更具体的类型）⇒
      看到 `as` 后的类型比 `as` 前**更具体**时，先问「运行时真是这个吗」。
14. **「基类方法读子类字段」⇒ 在基类 `declare` 一个可选字段**（第 140 轮，`element-base.ts:148`）：
    `drawDefaultImage()` 读 `this.blend`，而 `blend` 只在四个子类里声明（image / text /
    progress-bar / video；调用点也正好只有这三处，`parallax.ts` 那个是它自己的同名方法）
    ⇒ 原写法 `(this as unknown as { blend: string }).blend`。补法三处分寸：
    - **可选**（`blend?`）：不是所有元素都有它 ⇒ 必填是撒谎；
    - **`declare`**：普通字段（无初始化器）在 `useDefineForClassFields` 下**仍会** defineProperty
      ⇒ 给所有实例凭空加一个自有键、`Object.keys` 面就变了；`declare` 不发射代码（本文件已有
      `declare node` / `declare resize` 先例）。**判据一句话：「这次改动该不该让
      `Object.keys(instance)` 变化？」不该就用 `declare`。**
    - **不用 `this` 形参**：`uiElClasses.Element` 的声明类型是 `(new (data?: any) => any) &
      Record<string, any>`（实例面 `any`），基类实例类型全靠**推断**；写显式 `this: UIElement & …`
      等于把承重的推断换成显式引用，收益相同而风险更大。
    ⇒ 「缺声明」的三个落点：**接口**（第 135 轮）/ **方法形参**（第 136 轮）/ **类字段**（本轮）；
      选择依据是**读点范围**：多处会读 ⇒ 类字段，只此一处 ⇒ 形参。
15. **「对象被声明成 DOM 事件」⇒ 写载荷类型，删掉事件外衣**（第 141 轮，2 处一次消掉）：
    模板 `@write="handler"` 传的是子组件 emit 的**载荷对象**（`SelectBox.vue` emit
    `write: [value: unknown]`），而处理器声明写成 `YamiEvent` / `Event`
    ⇒ 调用点只能 `{ value } as unknown as Event`。改法：
    ```ts
    export type EasingIdPayload = Pick<EventPayloadFields, 'value'>;
    ```
    —— **复用 `editor-event.ts:15` 那个 `Loose = any` 单点豁免**，不新增 `any` 字面量
    （也不动 `any-hatches` 口径）；接口 / 实现 / 单例形状各改一处，调用点直接 `{ value }`。
    - 判据：断言两侧**结构上毫无交集**（`Event` vs `{ value }`）⇒ 不是「不够窄」，是**说错了对象**。
    - **附带红利（本轮实测）**：收窄载荷类型会**照出被 `any` 吞掉的错误声明** ——
      `Curve.index` 原声明 `number | null | ''`，真实值是缓动 **id**（`string | null`）：
      三处证据（`index = id` 赋值 / 当字符串键 `Data.easings.map[id]` / spec `toBe('easing-1')`），
      改正后 **tsc 0 级联**。
    - ⚠️ **夹带的条件**：一次 tsc 能判定「0 级联」才夹带；级联出一片就单独成轮。
16. **跨包「适配器」契约要按注册点的真实事件类型写**（第 142 轮）：ui-kit 的 `SelectionAdapter`
    原写 `(event: Event) => void` ×4，而它的注册点是
    `addEventListener('keydown' | 'keyup' | 'pointerdown' | 'pointerup', …)`
    ⇒ DOM 给的是 `KeyboardEvent` ×2 + `PointerEvent` ×2。写宽之后，宿主（editor 的 `Selection`，
    静态类型就是 `SelectionShape`，处理器按真实事件签名）与契约**互不重叠**，只能 `as unknown as`
    谎报。收窄契约 ⇒ 断言消失，且方向是**收紧**。
    - 判据：同一文件里「单次 `as` 能过、`as unknown as` 不能过」= 不是缺成员，是**参数类型冲突**。
    - ⚠️ ui-kit 的改动不在**根目录脚本**的覆盖内（根 `package.json` 没有 `test` 脚本，
      只有 `ci.yml:119` 跑）⇒ 必须显式
      `pnpm -F @yami/ui-kit test`，并跑 `-F @yami/ui-kit run build:types` 与 editor 的
      `typecheck:vue`（跨包契约改动会同时落在三条检查上）。
17. **「名字 → 方法」的间接层：给表一个取值面**（第 143 轮，`printer.ts` 2 处一次消掉）：
    `static drawingMethods: Record<string, string>`（效果类型 → 方法名）配上取值时的
    `Printer as unknown as Record<string, (...args) => unknown>`。修法：定义
    `type DrawingMethodName = 'drawText' | 'drawTextWithShadow' | …`（四个**真实**方法名）与
    `type DrawingMethod = (context, command, text) => void`（四者共同签名，取自**唯一调用点**），
    表声明成 `Record<string, DrawingMethodName>` ⇒ `Printer[name]` 直接就是 `DrawingMethod`。
    - 收益不是「少一处断言」，而是**新增检查**：表里拼错方法名 ⇒ 编译期报错。
    - 占位值若也是断言（`'' as unknown as 函数`），先在**同族**里找替身（本文件 `:471` 早有
      `fnEmpty`）；并写清那层行为变化（不可能路径上「抛错 → 无操作」）。
18. **「各写一半」的形状病：接口里的一行 vs 另一个接口**（第 144 轮，2 处）：
    `ScriptEditor.getModel()` 的返回只写 `{ getLanguageId(): string }`，而 `ScriptModel` 只写
    `setValue` / `getValue` / `getAlternativeVersionId` —— **同一个 monaco `ITextModel` 的两个
    互不相交子集** ⇒ `as unknown as` 用来从半边跳到另半边。合并成一份（补 `getLanguageId`）、
    把返回类型改成 `ScriptModel | null` ⇒ 断言消失。
    - 与第 118 轮同族（那次是两份**具名**形状），本轮的变体是「**接口里的一行**」与「另一个接口」。
      判据相同：**把两侧成员并起来看，是否恰好等于同一个运行期对象**。
    - 同轮另一处：`as unknown as YamiElement & CallEventInputApi` —— 目标里多带了一个**对本次
      赋值毫无贡献**的 `YamiElement`（要求整套 `YamiElementApi`），把「可比的」变成「不可比」。
      ⇒ 写断言前逐个检查：**目标里每个交叉项都是必需的吗**。
19. **「试过并回退」的注释要带错误原文**（第 145 轮）：`particle-engine.ts` 第 87 轮留下
    「直接传 `this` 报 TS2345、降成单次断言又报 TS2352 ⇒ 类与接口漂移，正解是把两者对齐」——
    方向正确但**没量**，于是搁置了三轮才被一次 tsc 变成可执行清单：
    `ParticleLayerData` 缺 `lifetime` / `lifetimeDev` / `fadeout` / `anchor` 等 **9** 个成员。
    - **错误信息一次只报一个属性** ⇒ 修完 `data` 才轮到 `easing`；级联的每一层都要当**独立结论**
      核实（那层其实是被 `any` 吞掉的另一个错误声明：`easing` 声明成 `Float32Array | null`，
      实际赋/读的都是 `Easing.get(...)` 的 `ease()`）。
    - **合并两份声明比修单点断言更值钱**：删掉的那份自带 `[k: string]: any` ⇒ 一次收口同时动
      `unknown-casts` 与 `any-hatches` 两条轴。
    - 不变式的两种写法选**不改变行为**的：`if (!x) return;` 把抛错变成静默少做一次；
      `x!` + 注释保持当场抛错（与第 143 轮 `fnEmpty` 的取舍相反 —— 那里「占位对象」本就该静默）。
20. **「用断言骗过某条检查」⇒ 找那条检查的内建出口**（第 146 轮，ui-kit `history.ts` 2 处）：
    - `delete` 只能删**可选**属性 ⇒ 别把接口成员改成可选（调用点立刻报「可能为 undefined」，
      等于把债换个地方），用 **`Reflect.deleteProperty(target, key)`**（内建签名、行为等价，
      与手法库第 5 条同源）。
    - `Omit<T, 'k'> & {…}` 这种「换签名 / 补字段」的写法：**先确认 `k` 在 `T` 上真的存在**
      （`Timer` 根本没有 `start` ⇒ 那是空操作），再**实测**单次 `as` 是否就够 ——
      本轮推断的「私有成员导致不可比」被实测证伪，`as Timer & {…}` 直接通过。
    - ⇒ 通用判据：**这个断言在骗哪条检查？那条检查有没有官方出口？**
      （可选性 → `Reflect`；事件形参 → 按注册点的真实事件类型声明；
      必填属性 → 补声明或 `Pick<EventPayloadFields, …>`。）
21. **「运行期挂上的成员」⇒ 收成具名读点面，把 `unknown` 降级为单次 `as`**（第 147 轮，ui-kit 2 处）：
    - `YMFileBrowser.dragstart`：四个成员（`pressing` / `activeFile` / `selections` / `textBox`）全是
      两个 pane 用 `Object.defineProperty` 运行期挂上的 ⇒ 静态推不出来。收成
      `interface ActivePage extends HTMLElement`（注释写明提供方与可选项），调用点写
      `as ActivePage | null`；顺带删掉 `(page as { selections }).selections` 那处**冗余**断言。
    - `YMParameterPane.createRepeatableGroup`：第 86 轮的注释**自己写好了两条拆法**
      （「让 `RepeatableGroupInput` 直接 `extends HTMLDivElement`」或「先建后补」）⇒ 照做第一条。
      动手前先量影响面：该接口只在本文件被声明与构造（grep 4 处）⇒ 改父类零外溢。
    - **判据：断言的目标是「补成员」还是「跨类型」？跨类型 = 目标类型选错了**（该收成具名读点面，
      只写一遍契约，而不是在每个调用点内联一个字面量）。
22. **重审「记录在案」的保留项：先在本仓找同形状的既有写法**（第 148 轮，2 处）：
    - `scene-tilemap-page.ts` 的 `this as unknown as HTMLElement`：`inspector.ts:473` **早就有**
      标准答案 `function (this: YamiElement & { changes?: InspectorChange[] }, …)` ⇒ 导出
      `InspectorChange` 后照抄，断言消失；随后 tsc 报出下一层（本地 lightBox 视图连 `HTMLElement`
      都不含）⇒ 用**交叉** `type X = YamiElement & {…}` 补身份（`interface extends` 会因本地
      `update(): void` 与基类宽松签名不兼容而报「incorrectly extends」）。
    - `window-object.ts` 的 `[] as unknown as HTMLElement[] & {…}`：源是 `never[]`，与交叉**两头都不
      满足** ⇒ 改成**两级单次 `as`**（第一级 `as HTMLElement[]` 是可验证的真话，第二级只主张
      「`append`/`remove` 稍后由 `Object.defineProperty` 装上」）。
    - 判据：保留项要区分**「现在真的无解」**与**「当时无解」**；同仓同形状的既有写法优先复用。
23. **「全局没有声明」⇒ 补声明，但要一次想清三件事**（第 149 轮，2 处）：
    ui-kit 的 `YMTitleBar.getWindow()` 读宿主挂的 `window.Window`，档案原写「必须保留 `unknown`
    （TS2352：该成员与全局 `Window` 构造器同名、不可比）」。真解法是补声明 + 窄化，三件事缺一不可：
    1. **成员**：`declare global { interface Window { Window?: { close(id?: string): void } } }`
       —— 可选是如实（宿主未挂载时确实不存在），也让 `delete` 合法。
    2. **落点**：声明所在文件必须进**当期程序**，而本仓有**三个**程序会编译该组件：
       ① ui-kit 自己的 tsconfig（`build:types`）；② 编辑器侧 `typecheck:vue`（只按**模块图 +
       自己的 glob** 收文件）；③ **oxlint 的类型感知规则**。实测：独立 `.d.ts`（无人 import）
       ⇒ ② 看不见（TS2551）；写进 `.vue` 里 ⇒ ③ 看不见（同样 TS2551）。最终落在
       `src/types/host-globals.ts`（**真 `.ts` 模块**）+ 桶文件 `import './types/host-globals';`。
    3. **读点**：补声明**不够** —— `window` 是 `Window & typeof globalThis`，`typeof globalThis`
       上那个同名构造器会把成员相交掉（直读 / 写 / 删分别报 TS2741 / TS2322 / TS2790，均实测）
       ⇒ 仍需一行**窄化赋值** `const host: Window = window;`（可赋，不是断言）。
    - ⚠️ 写注释别拼出 `*/`：`src` 下的通配写法里 `**/` 会**提前闭合块注释**（本轮实测 31 个语法
      错误）；`text:check` 的 `nested-comment-opener` 只查多余 `/*`，查不出这种 ⇒ 用文字描述。
    - 同族判据：**约束要分「语义必需」与「书写时假设」**（`readPayload<T extends object>` 属后者；
      删前先确认调用点**全部显式给类型实参**）。
24. **保留项复核：先试单次 `as`，让 tsc 给出缺项清单**（第 150 轮，2 处确认 + 1 处收掉）：
    - `utils/monaco.ts`：`as MonacoApi` 单次 ⇒ TS2352，且 tsc 列出缺
      `createWebWorker` / `css` / `html` / `json` + 2（本模块只注册了 typescript / json 贡献）⇒ 保留。
    - `module/monaco-dts.ts`：去掉断言 ⇒ TS2339 —— `languages.typescript` 被声明成
      `{ deprecated: true }`，而语言服务类型**无处可 import**：贡献模块的 `.d.ts` 内容就是一行
      `export {}`（实际打开确认过）⇒ 保留。
    - `services/updater/incremental.ts`：**模板字面量索引签名**收掉 —— 类上写
      `` [version: `1.0.${number}`]: ((update: boolean) => void) | undefined; ``
      （`| undefined` 如实表达「版本连续、处理器有空档」，`if (handler)` 因此不再可疑），
      并把 `` const version = `1.0.${minorVer}` `` **标注**成 `` `1.0.${number}` ``
      （模板字面量表达式的类型由**上下文类型**决定 ⇒ 标注而非断言）。
    - 判据：保留理由要写成**可复核的事实**（缺哪几个成员 / 哪个文件是空的），不要停在「类型缺口」。
25. **`any-hatches` 开工顺序：先量种类、再量单点代价**（第 151 轮，2 处，46 → 44）：
    `node scripts/any-hatch-inventory.mjs --kinds` 给**种类**（RECORD_ANNOT = 常量注解 /
    INDEX_SIG = 接口里的索引签名，改法不同）；`node scripts/oneoff/measure-any-hatch-site.mjs
    <相对路径> <行号>` 给**该点的 tsc 代价**。
    - ⚠️ **两个脚本都按行号** ⇒ 文件改过之后必须重新 grep 定位（本轮第一次就量到了注释行）。
    - 本轮两处：`ParticleLayerData` 的索引签名（摘掉后 12 条 TS2339、全在本文件 ⇒ 逆推六个字段
      `sort` / `blend` / `light` / `image` / `count` / `color`）；`ParticleEmitterShape` 的索引签名
      （**摘掉后 0 条** ⇒ 直接删）。
    - 关键因果：**第 145 轮那次「合并两份各写一半的形状」让第 151 轮这处索引签名变成可摘的** ——
      接口一旦具体，索引签名就从逃生口退化成赘余。⇒ 修「重复声明」常给后续修「索引签名」铺路。
    - `color` 的取舍（四组运行期互斥、按「全组可读」声明以免十来个非空断言）要**明写 + 给反证位置**
      （`inspector/particle-layer-page.ts:285`），不要留成默认。
    - 下一步（未做）：同文件的 `ParticleEngine: Record<string, any>`（第 12 行，RECORD_ANNOT）——
      实测 19 条 TS2339，涉及三张子表 `Emitter`（12）/ `Element`（5）/ `Layer`（2），
      分布在 engine（3）/ particle-initialize（3）/ particle.spec（13）。
26. **`any-hatches`：用代价扫描表挑站点**（第 152 轮，44 → 41）：
    `node scripts/oneoff/scan-any-hatch-costs.mjs [--limit N] [--all] [--kind INDEX_SIG|RECORD_ANNOT]`
    —— 枚举复用 `lib/scan.mjs`（与台账**同源**；`--limit 0` 自证总数相等 = 44），单点测量复用
    `measure-any-hatch-site.mjs` 导出的 `measureAnyHatchSite()`（**同一份摘法**）。输出按代价升序。
    - **第一次扫描的结论**：便宜的是**小数据形状**（1–5 条）；贵的是**单例 / 被上百处访问的大接口**
      （`Data` 539、`Animation` 1179、`schema.ts:71` 89、`CommandObjectShape` 67）
      ⇒ 第 151 轮「按文件名猜」的三处里两处属于贵的。
    - 本轮摘掉最便宜的三行：`CommandNode`（索引签名**降级**成 `[k: string]: unknown`，不进轴但收紧）、
      `TextContent`（补 `children?: CommandNode[]`）、`UIParentShape`（补 `parent` /
      `requestResizing?`，后者配合 `instanceof Window` 守卫写 `?.`）。
    - ⚠️ 扫描会临时改写被探文件（逐字复核写回）⇒ **扫描期间不要并行编辑仓库**，也别并发跑两个扫描。
    - 下一批候选（表里 5–21 名）：`animation-window.ts:78`（5 条，editor×5）、
      `element-base.ts:10`（20 条，已知有意保留）、`schema.ts:88`（21 条）。
27. **`any-hatches` 两批扫描的对比结论：便宜区已摘完**（第 153 轮，41 → 40）：
    - **INDEX_SIG 批**（21 处）：便宜区 1 / 2 / 2 / 5 条 —— 多为**小数据形状**；
      第 151 / 152 / 153 轮已摘 4 处。
    - **RECORD_ANNOT 批**（25 处，已量前 8）：**最便宜 19 条，且是被挡住的** `particle-engine.ts:12`
      （跨视图统一，见第 152 轮记录的 4 文件清单）；其余 20 / 54 / 93 / 307 条分别为
      spec mock 挡住的两处引擎表、④ 所有的 `ui-engine`、以及 `auto-tile`。
      ⇒ 结论：**「便宜区」已摘完**。继续推进要么做那个跨视图统一，要么等 ④-3 的决策。
    - 本轮摘掉 INDEX_SIG 里 5 条那处：`AnimationFileContext` 补**可选** `editor?`
      （tab 传入、open/load 才挂），九个成员全部从读点逆推；`player` 写
      `NonNullable<typeof Animation.player>` 复用类型（同一实例两边流转）；
      读点一处 `context.editor!`（`firstLoad` 分支刚保证它存在）。
    - 剩余候选与代价（供下次决策）：`element-base.ts:10` 20 条（已知有意保留，`UIElementShape`）、
      `schema.ts:88` 21 条（`CommandSchema` 类上的索引签名，动态成员 `targetWrite` / `writeHandler` …）。
28. **`any-hatches` 完整代价表 + 粒子跨视图统一的工作单**（第 154 轮，40 → 37；顺带 `legacy-ui-lines` 302 → 300）：
    - **完整表**（`INDEX_SIG` 全部已量；`RECORD_ANNOT` 已量前 8）：
      `0` ×3（`ui-window.ts:86` / `particle-window.ts:43` / `:55` —— 本轮摘掉）、`7`（`element-classes.ts:55`）、
      `20`（`element-base.ts:10`，有意保留）、`21`（`schema.ts:88`）、`67`、`71`（`particle-window.ts:77`
      = 发射器视图）、`79`、`89`、`452`、`539`、`897`、`1180`、`1455`。
      ⇒ **「便宜区已摘完」这个结论以前只建立在半个表上**（前两轮各只扫前 10 / 前 8）——
      扫完之后立刻浮出三处 0 条。**扫描要么一次扫完，要么在结论里写明只量了前 N 个。**
    - **粒子跨视图统一的工作单**（本轮试过、量到 79 条后回退）：主因是 `ParticleEmitterShape`
      （71 条），需要给它补约 16 个运行期成员：`hasArea`、`outerLeft/Top/Right/Bottom/Width/Height`、
      `active`、`selected`、`disabled`、`isEmpty`、`layer`、`draw`、`emitParticles`、`updateParticles`、
      `getLayer`；`ParticleElementRef` 还要补 `x` / `y` / `anchorX` / `anchorY` / `rotationAngle` /
      `scaleFactor`；另有注册表消费点 3 处 `!` + spec 13 处 `!`。
      ⇒ 两份**数据/图层**视图（`particle-window.ts:43` / `:55`）本来就是零代价的，本轮已摘；
      剩下那处发射器视图才需要那套成员声明。
    - 一次改动可能同时动两条轴：`ui-window.ts:86` 在遗留层目录里，摘它顺带把 `legacy-ui-lines`
      从 302 拉到 300。⇒ 挑站点时可优先看**同时落在多条轴口径里**的位置。
29. **`RECORD_ANNOT` 全表 + 三处「被挡住的便宜站点」**（第 155 轮，37 → 36）：
    - 全表（本轮补完）：`0` `YMParameterPane:153` / `:263`（`guidMap` 的值）、
      `1` `particle-window:249`（`stage`）、`2` `stores/data:149`（`Data.config`）、
      **`7` `element-classes:55`（本轮摘掉）**、`17` `setting-config:16`、`19` `particle-engine:12`、
      `20` `scene-camera-engine:9`、`54` `animation-window-engine:12`、`82` `tile-frame-index:13`、
      `93` `ui-engine:22`、`307` `auto-tile:49`、`696` `palette.ts:4`（另有 13 处不可机械测）。
    - 三处**被别的债挡住**的便宜站点（动手前先修上游更划算）：
      ① `guidMap` 那对：ui-kit 侧写具名 `ManifestEntry` 后账降到 35，但宿主侧
         `Data.manifest.guidMap` 的值是 `FileMeta = InstanceType<typeof Meta>`，而
         **`Meta.parameters` 是 `unknown[] | null`、`langMap` / `overview` 未声明**
         （`langMap` 在编辑器侧出现 0 次）⇒ 跨包契约的上游没写全。
      ② `stage`：两条赋值线索（`particle-file.ts:23` 存 `Particle`、`scene-window.ts:945` 存
         `Scene`）+ 唯一读点 `.multiply(stage.matrix)`，而 `SceneShape` 没有具名 `matrix`
         ⇒ 转成**行为判定**（场景当舞台时 `.matrix` 是否保证非空）。
      ③ `Data.config`：降级成 `unknown` ⇒ 7 条（updater 读 `config.event.startup` 等具体字段）
         ⇒ 需要的是**具名形状**，不是降级。
    - 本轮摘掉的 `element-classes.ts:55`：`UIElementInstance` 的索引签名只被
      `draw` / `resize`（无参必填）与 `addReference` / `tryUpdateReferenceElements`
      （只有根元素有 ⇒ 可选，三个调用点补 `!`）用到 —— 「重审登记保留项」再次命中。
    > ⚠️ **2026-09-22 第 157 轮更正（本表的「代价」列有两处是仪器故障，不是机会）**：
    > 上面全表里最便宜的两处 —— `1` `particle-window` 的 `stage` 与 `2` `stores/data` 的
    > `Data.config` —— 实测下来的报错**全部落在被改的那一行**：
    > `stage` 是 **TS7008（隐式 `any`，接口成员摘掉注解后逃生口没关）**，
    > `Data.config` 是 **TS1131 + TS1128（`config: Record<string, any> | null` 摘掉注解后
    > 写成 `config | null;`，根本不是合法声明）**。
    > ⇒ 这两处**不是**便宜站点，它们要的是设计工作（具名形状）；表把它们排在最前面，
    > 正是第 155 轮「撞墙」的原因。**尺子已修**（见手法库 #31）：`RECORD_ANNOT` 只对
    > 「带初始化式的声明」可机械测，其余一律拒绝并给出落点类别。

30. **跨包契约的收口顺序：先写宿主侧的上游，再把契约放进「两边都能引用」的模块**（第 156 轮，36 → 34）：
    - 症状（第 155 轮撞墙）：ui-kit 侧把 `guidMap` 的值收成具名 `ManifestEntry` 后账降到 35，
      但宿主 `:data-manifest` 绑定报 **TS2322** —— 宿主的值是 `FileMeta = InstanceType<typeof Meta>`，
      而 `Meta.parameters` 是 `unknown[] | null`、`langMap` / `overview` **未声明**。
    - **顺序**（照这个顺序做，一次过）：
      ① 先量宿主侧的读写点：`.parameters` 在编辑器 `.ts` 里读点 **0 处**、写点 2 处
         ⇒ 级联预期为零（实测为零，所以这轮很便宜）；
      ② 收紧 `Meta.parameters` 成 `ParamDef[] | null`（`ParamDef` **从 ui-kit 导入** —— 是同一份契约，
         两边各写一份必漂），并按 ui-kit 的**读点**补 `declare langMap` / `declare overview?`；
      ③ 把 `.vue` 里的 `interface` 搬到**独立模块**（`manifest-entry.ts`）并从 barrel 导出 ——
         写在 `.vue` 里的 interface 宿主**引用不到**（第 155 轮 TS2322 的另一半原因）；
      ④ 宿主的注解改用**同一份**类型；⑤ 读点写 `?!.length`（`parameters` 可为 `null`）。
    - 两个形状坑（都实测）：**别留索引签名** —— 收成具名形状时，若源是**类实例**
      （`InstanceType<…>`），带 `[k: string]: unknown` 的目标会**拒收**它；**契约类型跨包导入不算层次倒挂**
      —— UI 契约从 ui-kit 导入好过两边各写一份。

31. **「删掉注解」只在两种落点上等于「关掉逃生口」；其余落点的读数必须拒绝**（第 157 轮，账不变、工作单被修正）：
    - 症状：代价表里最便宜的两处（`1` `stage`、`2` `Data.config`）读数无效 ——
      `stage: Record<string, any>;`（**接口成员**）摘掉注解后是 `stage;` = **隐式 `any`**
      （TS7008 打在本行，下游 0 条错）；`config: Record<string, any> | null;`（**联合位**）
      摘掉注解后是 `config | null;` = **语法错**（TS1131 + TS1128，全在本行）。
      两者都因此被读成「极便宜」，而实际要的是**设计工作**（具名形状）。
    - **判据**：`RECORD_ANNOT` 只有摘掉后仍是「**带初始化式的声明**」
      （`const|let|var x = …` 或类字段 `[修饰符] x = …`）才可机械测 —— 那时类型由初值推断，
      删注解才真的关掉了 `any`。成员 / 参数位（隐式 `any`）与联合 / 交叉 / 数组位（语法错）一律拒绝。
    - **仪器自检**（防再犯的关键）：若报错**全部**是语法族（TS1xxx）或隐式 `any`（TS7006/TS7008），
      把读数标成 `suspect`，CLI 与扫描表都打 ⚠️「不得当便宜用」。触发条件用 `every`（真实代价
      几乎必然含 TS2339 / TS2322，故不误伤）。
    - **通用教训**：报错**全部落在刚改的那一行**、或**全是语法族**时，先当**仪器故障**，别当结论；
      「最便宜」的读数要先怀疑自己的摘法，再怀疑代码。
    - **复扫结果（第 157 轮，全 34 处）**：**19 处可机械测**，读数与旧表**逐位一致**
      （1180 · 1455 · 897 · 696 · 539 · 452 · 307 · 93 · 89 · 82 · 79 · 71 · 67 · 54 · 21 · 20 · 20 · 19 · 17）
      ⇒ 证明这次只删掉了**两个假读数**，真实读数一位没变；**15 处拒绝** = 13 处别名 / 交叉 / 断言
      + 2 处本轮新拒。可测里最便宜且未被障碍挡住的是 `setting-config/index.ts:16`（**17**，下一轮候选）。
    - **诚实边界**：自检的**正向触发端到端 0 次**（前置闸先拦住了那两类落点）；规则本身用归档的
      真实报错串做了 5 条断言自证（含「0 条报错不得误判」）。别把「本轮没触发」说成「端到端验证过」。

32. **工作单：`setting-config/index.ts` 的 `SettingConfig.config`（代价 17，目前最便宜且无已知障碍）**：
    - 站点：`services/project/setting-config/index.ts:16` `config: Record<string, any> = {}`（**类字段**，
      带初始化式 ⇒ 第 157 轮的新尺子确认它**可机械测**，读数 **17**）。
    - 为什么不是「删掉注解」：它必须收成**具名形状**，而**没有类型层的真源** ——
      `settingSchema` 是**运行期数据**（`SettingSection[]`，`id: string`），
      `buildDefaultConfig()` 只返回 `Record<string, unknown>` ⇒ 形状只能**按读者手写**。
    - 读者清单（全部实测 grep 过，8 个文件）与所需字段：
      | 字段 | 读者 |
      | --- | --- |
      | `server.port` / `server.auto` | `index.ts:138` · `services/project/open.ts:194-195` |
      | `other.browserSearchHistoryLimit` | `index.ts:119-124` · `module/browser-search-history.ts:66` · `__tests__/search-history-dropdown.spec.ts:16` |
      | `github.accelerationNode` | `module/resource.ts:38` · `:101` |
      | `recent.statsMode` | `title/home-page.ts:131-132` |
      | `update.checkOnStart` | `module/constants.ts:81` |
      | `apkbuild` / `signed`（整体展开） | `title/menu-bar.ts:849-850` |
      | 动态两级索引 `config[key][sub]` | `index.ts:110-118`（`??= {}` 与补默认值） |
    - **两个已知坑（都属第 156/157 轮学到的那一族）**：
      1. **用 `type` 别名，不要用 `interface`** —— `renderer.ts:30` / `:35` 把 `this.host.config`
         赋给 `Record<string, unknown>`；TS 只对**匿名对象类型 / 对象类型别名**推断隐式索引签名，
         `interface` **不**推断 ⇒ 写成 interface 会在这里报错。
      2. **索引签名的值类型必须仍然可索引** —— `index.ts:110-118` 要做 `config[key][sub]`，
         所以顶层索引签名得是 `Record<string, unknown>`（不是 `unknown`），否则那两行先炸。
    - 验收：`pnpm migration:check` 的 `any-hatches` **34 → 33**（站点本身消失，尺子的 17 条只是
      入口代价）；editor `tsc` / `typecheck:vue` **0 新错**；editor 测试 2075 全绿；
      lint / format / text / docs 全过。做完再按第 157 轮的新尺子复扫一次（确认没有新假读数）。

### 4. 剩下的活（按性价比排序）

1. ~~**`any-hatches` 口径漏洞先修**~~ —— ❌ **该任务已于 2026-09-21（第 89 轮）撤销：漏洞不存在。**
   原文声称正则 `Record<string,\s*any>` 匹配不到跨行书写的 `Record<\n…,\nany\n>`。
   **实测证伪**：`\s` 在 JS 正则里**本来就包含换行**，所以 `Record<` 与 `string` 之间、
   `string,` 与 `any` 之间无论怎么换行都能匹配。复核做法是把全仓 `Record<…>` 构造按
   **尖括号配对**穷举出来（共 **1196** 个），再筛「泛型实参里含 `any`」的：**31** 个；
   其中**跨行且恰为 `string, any`** 的：**0** 个。另外把「容忍跨行」的正则
   （`Record<[\s\n]*string[\s\n]*,[\s\n]*any[\s\n]*>`）与现行正则逐文件比对，
   **无一个文件读数不同**（都是 20）。
   ⇒ 这条轴**是在口径内被数干净的**，不存在「改个写法就能凭空归零」的后门。不要再做这个任务。
2. **P4 剩余 89 处的成组形态**（第 91 轮刷新）：`eslints.ts` 3（要先动 `CommandListShape` 的类型设计）·
   `printer.ts` 3（`typeof Printer` 是类类型、无隐式索引签名；另有 2 处占位值待决策）·
   `scene-context.ts` 2（`Light`/`Parallax` 的构造参数与本地 `SceneLight` **漂移**，`LightData` 未导出）·
   `command-list.ts` 2（选项契约写窄了）· `codec.ts` 2（`terrains`/`code` 的声明与运行期的 `Uint8Array` 不符）·
   `text-element.ts` 2（`printer.images` 有两个**互补而非同形**的本地接口：`ImageElementShape` vs
   `EmbeddedImageShape` —— 要合并成一份具名形状，属设计改动）· 其余为零散 1–2 处的 `.vue` 组件。
   **第 91 轮已拿下 12 处**，手法与「为什么剩下的这些更难」记在 `xr.md` 的「第 91 轮」一节。
   > ⚠️ **2026-09-21 第 106 轮刷新（当前 67 处 / 55 文件）**：上表只描述了「**难**的那批」，
   > 而台账里还混着「**早就多余、只是忘了删**」的那批 —— 本轮一次清掉 **17 处**：
   > 14 处是 `bindInput(elements, editor, Scene/Animation as unknown as { history: unknown })`
   > （`InputOwner` 第 89 轮已放宽成 `object`，断言纯属多余），
   > 3 处是 `common/{NumberBox,TextBox,TextArea}.vue` 改用 ui-kit **本就导出**的
   > `HistoryInputElement` / `HistoryTextAreaElement` 做单次断言。
   > ⇒ **不要再按「剩下的都难」估算这条轴**；按文件逐个量过再说。详见 `xr.md` 第 106 轮。
   > ⚠️ **2026-09-22 第 116 轮：逐处量完了（当前 63 处 / 52 文件）** —— 方法是「把每处
   > `as unknown as T` 降成 `as T`，跑**一次** `tsc`，按行号收回逐处判决」
   > （`scripts/oneoff/probe-p4-dead-casts.mjs`）；判据是类型判定**局部独立**。
   > 结论：**67 处里 58 处报 `TS2352`（承重）**，9 处看似多余 —— 但其中 **4 处是假阳性**
   > （多行表达式的报错落在**表达式起点行**：`ui-transform` 326/报错 323、`file-entity-page` 39/30、
   > `eslints` 173/170、`ui-kit/history` 26/21）。真正多余 **5 处**，已清 **4 处**：
   > `command-tip.ts:302`、`enum-window.ts:144`、`eslints.ts:62`、`scene-window.ts:990`
   > （最后一处连注释里「这里必须 `unknown`」的**假声明**一起更正 —— 对未约束的 `T`，`[] as T` 本来就过）。
   > 第 5 处 `custom-command-window.ts:227` **故意留着**：它有「归到 P3 的 `any` 别名批次」的决策记录。
   > ⇒ 剩下 63 处**全是 `TS2352`**（两边类型不可比，跳板在做实事），要再动只能改**类型设计**：
   > 即下面第 3 条那三类。
   > ✅ **第 118 轮做掉一处具名形状合并**：`text-element.ts` 那 2 处（`printer.images` 的
   > `ImageElementShape` vs `EmbeddedImageShape` 两个**互补子集**）已合并为
   > `UIImageElementShape`（`engine/ui/element-classes.ts`）⇒ 两处断言**整条消失**（不是缩短），
   > `unknown-casts` **63 → 61**、files 52 → 51。判别信号：**断言的来源类型与目标类型是同一个
   > 运行期对象的两个子集** ⇒ 该合并，不该缩短。详见 `xr.md` 第 118 轮。
   > ✅ **第 119 轮按形态重盘并清掉 3 处**（`unknown-casts` **61 → 58**）：形态分布
   > A（目标类型是本文件里的局部类型）17 · B（别处的具名类型）30 · C（匿名/交叉/泛型）14；
   > A 类里立刻露出一族「**空数组 + 游标字段**」：`[] as unknown as X[] & CursorData` 后紧跟
   > 6 行逐字段赋值 —— 正是**手法库第 4 条**（「断言完紧接着写字段 ⇒ 换 `Object.assign([], {…})`，
   > 零断言」）的教科书案例。已改 `ui-kit` 的 `YMCommonList.vue:46` / `select-list-api.ts:114` /
   > `YMFileNavPane.vue:760`（A 17 → 14）。**教训：手法库是要被用的，盘点口径本身也是工具。**
   > ✅ **第 120 轮把这一族的落伍者扫干净**（`unknown-casts` **58 → 55**）：
   > `YMParamList.vue:207`/`208`（**初始 state** 的旧断言 —— 同文件的 `onMounted` 里第 84 轮就改成
   > `Object.assign` 了，只有初始值没跟上）与 `YMFileBodyPane.vue:1988`。
   > 另查实 `tools/window-object.ts:59` 的 `[] as unknown as HTMLElement[] & { append; remove }`
   > **不是** bug：该文件 `:461`/`:487` 在模块顶层用 `Object.defineProperty` 真把两个方法装上了
   > ⇒ 形态可疑时必须去 grep「那个成员到底有没有被装上」，别照着形态判死刑。
   > 家族里 `Object.assign([], …)` 的既有样本本就有 4 处（`particle-engine` / `scene-window` /
   > `command-api`）⇒ **家族盘点 = 找已修好的样本再逐个对齐**。详见 `xr.md` 第 120 轮。
   > ✅ **第 121 轮：搞清楚了一处断言「在替谁背书」**（`unknown-casts` **55 → 54**）。
   > `YMFileNavPane.vue:285` 的 `document.createElement('div') as unknown as FolderElement` 之所以
   > 需要 `unknown` 跳板，是因为 `FolderElement` 里有个**从不存在的必填字段** `indent` ——
   > 它是 P4b「字段搬进元素数据（WeakMap）」后**没跟着删掉**的残留（全文件只有 `data.indent`，
   > 没有 `el.indent`）。删掉该字段后那处断言**整条消失**（改 `Object.assign(createElement('div'),
   > { file, context })`）。
   > ⇒ **新类别：`elementDataOf` 家族的「必填字段残留」** —— 判别动作：
   > `grep -n "\.<字段>" <文件>`，若只有 `data.<字段>`、没有 `el.<字段>`，则该字段应从元素类型里删；
   > 收益是「类型不再说谎」＋「依赖它的断言整条消失」。**下一轮用这个动作去扫那个家族。**
   > 同形态的另两处经查**是诚实的、不动**：`scroll-bar-api.ts:164`（字段在另一批函数里才写）、
   > 全仓 18 处「新建后装饰」里的 17 处（在 `__tests__` 里，造假 DOM 的测试惯用法）。
   > ✅ **第 122 轮：那条线索扫完了，到此为止**（新探针 `scripts/oneoff/measure-element-data-residue.mjs`）——
   > 家族里只有 4 处候选，逐处查**全是误报或不该动**（3 处是表单类型里的同名局部 `data`；
   > 1 处 `SceneListItem.class` 与 `scene-list.ts` 的 `SceneItem` 成对维护）。**「扫完没有」也是结论。**
   > 于是回到 A 类站点，又清 3 处（`unknown-casts` **54 → 51**），它们同属一个新信号：
   > **「同一个收窄写了两遍」** ——
   > `menu-list.ts:65`（helper 内部已有单次 `as`，让它**返回**即可 ⇒ 零断言）、
   > `page-manager-api.ts:40`（遍历 `children` 代替 `childNodes`，等价性靠 `hasClass` 里
   > `if (!target.classList) return false` 那行守卫；断言压到 `target = child as HTMLElement`）、
   > `YMFileBrowser.vue:263`（**同文件 `:387` 早就用单次 `as`**）。
   > ⇒ 判别动作：**在文件里搜同名类型/同形断言，看是不是已有一处更弱的写法**
   > （这是第 120 轮那条教训的第二次出现）。详见 `xr.md` 第 122 轮。
   > ✅ **第 123 轮：占位表族收口**（`unknown-casts` **51 → 50**）。`inspector/file-entity-page.ts`
   > 的工厂原来是「先写一张 8 键 `null` 占位表、再逐个填方法」⇒ 只能 `as unknown as FileEntityPage`；
   > 已按手法库第 4 条的**一般形态**改成「**先定义、后组装**」（6 个方法先各自 `const`，最后在一个
   > 对象字面量里一次成型）⇒ 断言整条消失，且字面量由 `tsc` 整体校验。
   > ⚠️ 改后 `listChange` 会**前向引用** `entity`（调用时求值，安全）；**故意没**改成 `this.meta`
   > ——那是行为变化（脱离接收者调用时会抛）。两条都写在代码注释里。
   > ⚠️ 另**实测**了 `eslints.ts:173`：改成单次 `as` 会被 tsc 拒绝（`Element` 比 `CommandItemElement`
   > 少 253 个属性 ⇒ 索引签名不可比）⇒ 该处 `unknown` **承重**，已还原并把结论写在站点上。
   > **试错结论也算留档**：它把这条轴从「疑似漏改」变成「已判定」。
   > ✅ **第 124 轮清 6 处**（`unknown-casts` **50 → 44**），全落在两族：
   > ① **形参早就是 `unknown`、调用点断言多余**（第 106 轮那个坑的复发）——
   > `scene-list.ts:114`（`dispatchChangeEvent`）、`scene-events-list.ts:35`（`read`）；
   > ② **交叉断言（手法库第 6 条）替代 `unknown` 跳板** —— `ui-kit/utils/dom.ts:7`
   > （`Element & { focus(…) }`）、`particle-motion.ts:138`（`Array.from(children) as HTMLElement[]`）。
   > 外加两处「断言替谎言背书」：`element-page.ts:124`（`NodeList` 自带 `forEach`、`on` 形参是 `any`
   > ⇒ **零断言**）、`element-utils.ts:161`（`clear` 的返回类型在说谎：`if (!el)` 真的返回 null/undefined
   > ⇒ 放宽为 `HTMLElement | null | undefined`，依据是全仓无调用方取用其返回值）。
   > ⚠️ **同一轮还修掉一行「编码事故乱码」**：`element-page.ts:127` 的注释是 GBK↔UTF-8 误解码的产物，
   > 用 `git log -L 127,127:<file>` 定位到污染发生在 `54a7d809`（后又被 `3f259bc9` 二次毁坏），
   > 按 `54a7d809^` **逐字恢复**。
   > ⇒ **门禁缺口**：`text:check` 的 7 条规则**都不管乱码**（无控制字符、无 U+FFFD）⇒
   > 加一条**可自证的 `mojibake` 规则**是下一步（乱码原文已留在 `xr.md` 第 124 轮作自证样本）。
   > 另记：机械改写要查**行尾/BOM**（本轮 PowerShell 重写把整份文件变成 CRLF，提交前已归一化）。
   > ⚠️ **另记一条基础设施事实**：**ui-kit 的 115 个 spec 不在 editor 套件里** ——
   > 根 `package.json` **没有** `test` 脚本，只有 CI 的 `pnpm -F @yami/ui-kit test` 会跑它们
   > （`ci.yml:119`）。⇒ 任何改动落在 `packages/ui-kit/` 时，**必须显式跑那个套件**，
   > 否则「套件全绿」是假的。详见 `xr.md` 第 119 轮。
3. **已确认「必须留 `unknown`」的三类**（要归零只能改写法或改类型设计）：
    - **interface → 索引签名**（`TreeListHost as Record<string, unknown>` 一类）：换 `Reflect.*`；
    - **类与接口漂移**：`ParticleElementLayer` vs 粒子层类（两条路都试过：TS2345 + TS2352）、
      `ParamHistory` vs `IEditableHistory`（缺 `stack`/`index`）—— 都是**真债务**，不是写法问题；
      > ⚠️ **第 105 轮已结案**：`ParamHistory` 那条其实**不是债务** —— 该改的是消费方的类型
      > （收窄成新的 `IUndoRedoHistory`），4 处断言已消失。**「真债务」这个标签也要复核。**
    - **payload 判别字段**：从 `{ [k: string]: unknown }` 断言到具体字段集时，目标里必须带 `type`（第 78 轮）。
    > ⚠️ **`any-hatches` 已于第 107 轮逐条量过（51 处 / 26 文件）**，结论与 `unknown-casts` **相反**：
    > 剩余项**基本确实承重**（`fs-bridge` 的注释记着两个实测差别含一个真实 `TypeError`；
    > `YMParameterPane` 第 64 轮实测代价 41 处并已回退；`ui-window.ts` 的 3 处随 ④ 一起删）。
    > **但有一个例外，且边界精确**：`stores/ui.ts` 的 `UINodeShape` 索引签名 ——
    > 删掉后 `tsc` 只报 **6 个字段 / 27 处 / 5 文件**（`instance`·`instances`·`name`·`presetId`·
    > `synchronous`·`transform`），属**可穷举的枚举活**（手法库第 2 条）。
    > 卡点是 `transform` **没有可复用类型**（真实形状是 `element-page.ts:53` 那个局部
    > `UIElementTransform`，15 个字段）⇒ **下一步先把那个局部类型提成共享类型，再照清单做完。**
    > 判据：**「承重」不等于「不可枚举」—— 看删掉后 `tsc` 报 6 个还是近千个。**
    > ⚠️ **第 108 轮：共享类型已提好，但「照清单做完」被证明是浅层估计 —— 已退回。**
    > 6 个字段枚举上去后，原来的 27 处消失，却换来 **31 处 / 6 个根因**，其中三条是**真问题**：
    > - **全仓有两个同名 `UINodeShape`**（`legacy/ui-window.ts` 与本 store 各一个），以前靠索引签名
    >   「碰巧兼容」，形状一严就互不兼容（`ui-transform.ts:59`）；
    > - **`instance` 并不必然存在**（`ui-engine.ts:363` 把 `null` 赋给它）；
    > - **`matrix` / `parent` 可空却被直接解引用 14 处**（`ui-engine` 6 + `ui-pointer` 8）——
    >   与第 101 轮 `texture.base` 同类，**属行为问题，必须实机判定**，不能靠补 `!` 蒙过去。
    > ⇒ 真做完 = ① 合并两个 `UINodeShape`（设计活）＋ ② 裁决 14 处可空解引用（**要真机**）＋
    > ③ 补全 `instances` 的真实类型（`UIInstanceList` 上没有 `set`）。详见 `xr.md` 第 108 轮。
    > ✅ **① 已于第 109 轮完成**：`UINodeShape` 现在**只有一处声明**
    > （`engine/ui/element-classes.ts`，与 `UIElementInstance` / `UIElementTransform` 同处），
    > `ui-window.ts` 只再导出、`stores/ui.ts` 直接 import ⇒ 两份「碰巧兼容」的重复声明不可能再漂移，
    > 且 `any-hatches` **51 → 50**。② ③ 仍是行为/真实类型问题，等实机。
    > ⚠️ **第 117 轮：上面那个「6 个字段 / 27 处 / 5 文件」已过期，真实代价是 79 处 / ~20 字段 / 11 文件。**
    > 直接删 `element-classes.ts:105` 的 `[k: string]: any` 实测 **79 处 `TS2339`**：`presetId` `instances`
    > `transform` `instance` `name` `synchronous` `destroy` `parent` `enabled` `visible` `node` `isPointIn`
    > `appendChild` `shadowText` `printer` `_font` `font` `updateTextContent` `updatePrinter` `content` `update`。
    > 原因：第 108 轮量的是 **`stores/ui.ts` 那份局部 `UINodeShape`**，而第 109 轮把两份**合并成一处共享声明**
    > —— 同一个索引签名从此同时承重所有域模块。**② 的底数要按 79 处重估。**
    > ⚠️ 且其中约 **7 个字段是元素专有**的（`printer` `_font` `font` `content` `updateTextContent`
    > `updatePrinter` `shadowText` 属文本元素；`visible`/`node`/`isPointIn` 属 hover 对象）——
    > **把它们全堆到共享 `UINodeShape` 上等于把索引签名换个写法保留**；真解法是用法处收窄/分型。
    > ⚠️ **③ 的前提被证伪**：计划写「`UIInstanceList` 上没有 `set`」，实测那 2 处 `set` 在
    > `ui-engine.ts:155`–`156` 的 `[DEBUG-instances]` 诊断块里**探测运行期形状**，不是调用。
    > 真正缺的是 **`remove`** —— 那是一个**真崩溃**（`element-base.ts:209` 的
    > `node.instances.remove(this)` 抛 `TypeError`），已修 + 补会自证的用例（`xr.md` 第 117 轮）。
    > ⚠️ 另一条实测到的坑：**给遗留目录里的文件加注释会顶起 `legacy-ui-lines`**
    > （第一版把 3 行说明写在 `ui-window.ts`，读数 316 → 319 被判上升；注释已挪到**声明处**，回到 316）。
    > 在「行数棘轮」覆盖的目录里，**理由要写在被计数的地方之外**。
4. **P3（52 处）**：都压在承重类型上（`SceneShape` 字段、`DynamicShape`、`UIShape`、粒子同名形状…）。
5. **P5-C/D 与 P6**：**运行时高危，必须等用户按 9 项实机回归清单验证过再动**
   （清单全文见第 66 轮「下一步（1c 第 ③ 步）与实机回归清单」一节；原文此处写「10 项」是笔误 —— 该清单实测为 9 条）。
   > **第 ③ 步已收口（第 96–98 轮，`1c-store-slot-gaps` 41 → 0）**，剩下的就是第 ④ 步。
   > ⚠️ 动 ④ 之前**先读本文末尾的「附录十三：阶段 1c 第 ④ 步设计（对象字面量退役）」**
   > —— 那里有本轮实测的底数（103 处挂载的分布、引擎读的 30 个 `this.<x>` 里**21 个尚无新家**）、
   > 推荐路线（保留 UI 形状 facade）与分步计划（④-1…④-4），以及**CI 覆盖不到 `primeWindows`
   > 那条路径**这条硬限制。
   > ⚠️ **2026-09-22 第 110 轮更正最后半句**：`primeWindows` 绕过 `loadUI` 这件事**已经不存在** ——
   > 第 ① 步（提交 `00729b15`）删掉了 `window-cluster.ts` 的 `export { UI }`，而 `primeWindows`
   > 遍历的正是该模块的**命名空间对象**，没有 `UI` 就没有小写 `'ui'` 键 ⇒ 真机取 UI 同样走
   > `loadUI`，与 vitest 同一条路。该不变式已由 `engine/ui/__tests__/ui-window-arrival-path.spec.ts`
   > 钉住（把 `export { UI }` 加回去，用例立刻变红）。
   > ⇒ ④-2c / ④-3 / ④-4 的「需要真机」从**唯一有效验收**降为**推荐**；jsdom 仍覆盖不到真实渲染。
   > 完整证据与改后的口径见**附录十三新增的 §7**。

### 5. 待用户决策（原 7 项 → **已降到 5 项**，2026-09-21 第 89 轮）

> ✅ **① 已关闭（第 91 轮，选了 (a)）**：一次 `pnpm format` 收口 **305 个文件**（+7836 / −4359），
> `format:check` 从此 **0** 并接进 CI 的 `gates` job。定性记录保留如下：
>
> - 它**不是**「格式从没被管过」：`.husky` + `lint-staged.config.js` 已在**每次提交时**
>   对暂存文件跑 `oxfmt`，所以**新增/改动的代码一直是合规的**；红的只是「全仓历史存量」。
> - 扫描面缺口（原先只扫 `packages/editor`、不含 `packages/ui-kit`）已在第 90 轮补上；
>   实测存量 **321** 个文件，实际被改写 **305** 个。
> - 实测体量：`LayoutPanel.vue`（2109 行）单文件重排就是 **+1251 / −985 行** ——
>   所以第 90 轮「顺手删 `#uiContainer-vue-mount` 那个死 id」被推迟，本轮仍留作下次同类清理的顺手项。
>   > **〔第 95 轮复核：这个「死 id」的结论要收一收，别照删〕** 它**确实**没有任何渲染者
>   > （也没有 `components/inspector/UIContainerPage.vue`），但它**不是「被误加的」**：
>   > `AppShell.vue:263` 是**推导**出挂载点的 —— `#${value}-vue-mount`，而 `value` 由 SFC 文件名
>   > 反推（`UIContainerPage.vue` → `uiContainer`）。也就是说：**哪天有人补上那个 SFC，
>   > 它要的目标 id 恰好就是 `#uiContainer-vue-mount`**。同理 `inspector.ts:53` 用的是
>   > **后缀选择器** `[id$="-vue-mount"]`，并不按名字读。所以它是**该页槽位的约定锚点**，
>   > 删掉「今天安全、明天留坑」。结论：**不删**，理由写进 `xr.md` 第 95 轮。
> - ⚠️ 收口后跑全量套件曾出现「**137 个文件 0 用例失败**」，报 `Electron failed to install correctly` ——
>   **是环境问题不是回归**（同一个 spec 在 `git stash` 前后都失败）：`electron@43.2.0` 的 `index.js`
>   在 require 时检查 `dist/` 二进制、缺失就当场下载，而本机下不到该版本。绕过办法见
>   `CONTRIBUTING.md`（`ELECTRON_OVERRIDE_DIST_PATH`）；设上之后 editor 250/2057、ui-kit 115/811 全绿。
>   ✅ **② 已关闭，并且它不是 flake**：原文把它记成「真·间歇性」，**这个判断是错的**。
>   第 89 轮实测：它是 **`tools/window-registry.ts` 里两处 `void ensure(...)` 丢弃了派生 promise
>   却没给原始 promise 挂 rejection 回调**导致的**确定性**缺陷 —— 全量套件 **2066 用例全绿、
>   却 `exit 1`**（vitest 把 unhandled rejection 记成**套件级**错误）。已修 + 已加自证回归 spec。
>   连带纠正：「必须独占跑」只对 `template-localized.spec.ts` 的**超时**成立，与本条无关。

**仍待决策的 1 项**：⑦ P5-C/D 开工（前提是实机回归全过）。
（⑤ 已于第 105 轮关闭，④ 已于第 104 轮关闭 —— 见下。）

> ✅ **⑤ 已关闭（2026-09-21 第 105 轮，靠证据判定，不需要用户拍板）**：
> `ParamHistory` vs `IEditableHistory` 的「矛盾」**不是 `ParamHistory` 缺字段，而是接口对这批消费方偏宽**。
> `ParamHistory` 是**委托型适配器**（栈在 `this.owner.history` 上、`History extends Array`），
> 所以它**本就不该**有独立的 `stack` / `index`；而全仓把它当 `IEditableHistory` 用的地方
> （`script-list` / `property-list` / `event-list` / `condition-list` / `list-interface`）**只调用方法**
> （`save` / `restore` / `canUndo` / `canRedo` / `reset`）—— 实测 `history.index` / `history.stack`
> 的读取点**没有一处**经由这些字段（命中的全是数组型 `History` 自己的 `history.index`）。
>
> 处置：新增**窄契约** `IUndoRedoHistory`（`IEditableHistory extends IUndoRedoHistory`，语义不变），
> 把那 5 处消费方的字段类型收窄到它，于是 **4 处 `as unknown as IEditableHistory` 直接消失**
> ⇒ `unknown-casts` **88 → 84**。同时更正了 `types/history.ts` 顶部那句把 `ParamHistory`
> 一并列为「implements 栈式契约」的注释 —— 那正是「矛盾」的来源。
> **没有**给 `ParamHistory` 硬加两个假的 `stack`/`index`（那会让「谁读谁拿到 undefined」的风险留在原地）。

> ✅ **④ 已关闭（2026-09-21 第 104 轮，靠证据判定，不需要用户拍板）**：
> `TextCommandShape.color` 的真实类型就是 **`string`** —— 声明与那 4 处 `context.fillStyle = color`
> **本来就是对的**，不是 bug。原先的疑点（「真实取值是不是打包整数」）可以把来源一路量到底排除：
> 唯一写入点是 `drawBuffer` 的 `command.color = this.colors[0]`，而 `colors[0]` 由 `CSSRGBA(...)` 写入
> （另一处写入在 `text-element.ts:230/340`，同样是 `CSSRGBA(value)`），
> `ui-kit/src/utils/color.ts:9` 的签名是 `CSSRGBA(hex: string): string`，
> 且 `ui-kit` 用例断言 `CSSRGBA('10203040') === 'rgba(16, 32, 48, 64)'`。
> **误导来自同文件另一条独立的颜色通道**（效果颜色用打包整数），那条与 `fillStyle` 无关。
> 唯一真正的谎言是占位命令里的 `0 as unknown as string`，已改成 `''`
> ⇒ `unknown-casts` **89 → 88**，且运行期等价（`0` 与 `''` 对 canvas 同为非法 fillStyle，静默忽略；
> 该对象是空白模板、必然在绘制前被填上）。
> ⚠️ 同处还有一个 **`drawingMethod: '' as unknown as (...args) => unknown`** 占位值**未动** ——
> 它与本条**不是**同一个问题：函数类型的诚实占位要么改类型（连带读点）、要么改失败行为
> （静默 no-op 取代抛错），属另一条更小的独立决策。

> ✅ **⑥ 已关闭（2026-09-21 第 93 轮，用户选「都修」）**。下面这段是它关闭前的复核记录，保留作沿革：
>
> ⚠️ **⑥ 原先写的是「P6 三处行为缺陷」—— 这个标签指向不了任何地方，「三处」也已经过期**
> （2026-09-21 第 92 轮核）。两处失真：
>
> - **「P6」查无内容**：全仓 `grep` + `git log -S`（全历史）里，`P6 三处行为缺陷` 只在本节与
>   `xr.md` 各出现一次，**都没有清单**。`P6` 在本仓是 `xr.md` 的阶段名，指的是巨石渲染层重写
>   （`command-api.ts` / `YMFileBodyPane.vue`），与这三处无关。唯一有清单的地方，是
>   **本节开头声称已被自己取代的**那份「交接（第 62 轮）」§五第 2 条 —— 照本节指引去读的人
>   永远看不到它。
> - **「三处」实际只剩两处**：第 3 处（`progressPointermove` 的 `this` 标注撒谎）**已在第 45 轮
>   当场改成 `this: HTMLElement`**（`inspector/file-audio-page.ts:428`，纯类型、产物不变），
>   不是待办。
>
> 就地展开（2026-09-21 逐处在代码里核过）—— **两处已在第 93 轮修掉，并各配一条会自证的回归用例**：
>
> | #   | 位置                                   | 关闭前的代码事实                                                                                                                                                                                              | 第 93 轮的处置                                                                                                                                                                       |
> | --- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | 1   | `inspector/element-page.ts:216`        | `(this._openRetry ?? NaN) < 10` —— `NaN < 10` 恒假 ⇒ **首次 `open()`（页面还没挂载时）根本不重试**；可下一行偏偏写 `(this._openRetry ?? 0) + 1`，可见本意允许 `undefined`，是判断那行漏了 `?? 0`               | 改 `?? 0`（首次 `open` 也进入重试）。`element-page-open-before-mount.spec.ts` 新增第 3 例：**把判断临时还原成 `?? NaN`，该例失败于 `expected undefined to be 1`** ⇒ 用例真的钉住了这条路径 |
> | 2   | `inspector/file-audio-page.ts:417-421` | `pointer.time` 在首次 `pointermove` 之前是 `undefined`（Vue 页只设 element，不设 `time`），而 `time !== -1` 为真 ⇒ 把 `undefined` 交给 `audio.currentTime`（按 NaN 处理，播放头被拉到开头）                   | 加 `time !== undefined`（`-1` 哨兵照旧）；顺带去掉 `as number` 断言。新增 `file-audio-page-progress-down.spec.ts`（3 例）：**把判断还原成 `time !== -1` 后，`undefined` 那例失败于 `expected undefined to be 7`，`-1` 那例仍通过** ⇒ 正好只钉住新行为 |
>
> 两处都是**行为改动**，已按计划交用户判定（第 93 轮明确选「都修」）；`editor` 全量套件
> **251 文件 / 2061 用例全绿、exit 0**（较改前 250/2057 恰好多出这 4 条新用例）。

> ✅ **③ 已落地（2026-09-21）**：`pnpm -F @yami/ui-kit build:types` 已加进 CI 的 `gates` job
> （此前 ui-kit 的 `.vue` **不在任何门禁里**）。

### 6. 纪律与坑（踩过的，别再踩）

- **editor 全量套件必须独占跑**（第 86 轮实测）：与 ui-kit 测试/`vue-tsc` 并发会把
  `template-localized.spec.ts`（遍历源码树、单跑 9.9s、上限 60s）逼成超时红。
- **提交后要按 hook 改写过的树复核**：husky 的 `oxfmt/oxlint` 只作用于 staged 的 `*.{js,ts,css}`
  （`.vue`/`.mjs` 不在内），提交后必须重跑 `lint`/`typecheck`/`migration:check`。
- **commitlint**：body 行 ≤100 字符（中英混排时最容易超），subject 不能以 `P5-B` 这类大写专名开头。
- **仪器要自证**：新增扫描规则时先塞一个「故意错误」验证检查面（第 75 轮对 `build:types` 做过）。
- **验收命令**（照抄即可）：

    ```bash
    node scripts/migration-ledger.mjs --check
    pnpm run migration:selftest && pnpm run lint
    pnpm -F @yami/editor typecheck && pnpm -F @yami/editor typecheck:vue
    pnpm -F @yami/ui-kit build:types
    pnpm -F @yami/ui-kit test && pnpm -F @yami/editor test   # editor 那条**独占**跑
    ```

## 第 89 轮（续二）：`unknown-casts` 111 → 102 —— 修声明两批，外加两个**新踩到的坑**

### 一、`FileItemStats`：1 处声明缺口 → 5 处断言（111 → 106）

`stats` 的形状在**三处逐字重复**（`FileItem` 字段 / `FileItem` 构造参数 / `FolderItem` 字段），
三份**都漏了 `size`**。而 `size` 在运行期一直存在（来自 `FSP.stat`）。
后果不是「读不到」，而是**每个读点各自撒谎**：

```ts
Number((file.stats as unknown as { size: number }).size); // 5 个文件各一遍
```

收口成具名 `FileItemStats` + 补 `size`，5 处断言消失。

**⚠️ 动笔时发现的真相，值得单独记住**：本仓读到的 `size` 其实**不是 `number` 而是 `bigint`**。

- `FolderItem.bigint = { bigint: true }`；
- 目录树里的 `FileItem` **全部**由 `FolderItem.readdir` 创建，那里**唯一**的 `FSP.stat` 就是 `bigint: true`；
- `directory-tree.ts` 里那两处 `FSP.stat(path)` 确实不带 bigint，但它们的返回值**只用来调
  `isDirectory()`，不构造 `FileItem`** —— 我一开始正是被这两处误导，差点把 `size` 写成 `number`。

所以类型如实写成 **`number | bigint`**。这同时解释了一件事：6 个读点**本来**就都包着
`Number(...)` —— 那不是啰嗦，是**必需的归一化**，只是从来没人写下理由。
⇒ **又一次印证「先改类型、让 tsc 把真实契约顶出来」**：我原来的猜测（`number`）是错的，
而错在类型层就被挡住。

顺带删掉 `FileItem.update` 里一处**收窄型**的 `as { isDirectory; ino?; mtimeMs? }` ——
它把 `fs.Stats` 上真实存在的字段在类型上抹掉，**正是下游不得不各自断言的源头**。

### 二、`CustomBoxApi` 的 4 处 `filter` 写入（106 → 102）

`if (el) (el as unknown as CustomBoxApi).filter = filter` 在 4 个文件里各一处。
其中**两个文件本来就 import 了 `registryElement`** 并用它做别的注册表查找 ⇒
这属于**向既有 helper 收敛**，不是引入新模式。判空守卫直接折进 helper 的可空返回值。

### 三、⚠️ 两个新坑（都不是本轮引入，但都差点骗过我）

1. **PowerShell 的 `Set-Content -Encoding utf8` 会剥掉 BOM。** 实测：`data/metadata.ts` 原本
   带 UTF-8 BOM（全仓 **173 / 1520** 个文件带），我改写后 BOM 消失 ⇒ diff 里多出一行
   「看似只有引号不同」的噪音。`.editorconfig` 的 `charset = utf-8` **不要求** BOM，
   功能上无害，但**不该由一次类型改动顺手改掉文件的字节形态**。
   **正确做法（本轮后半程已改用）**：写入走 .NET
   `[System.IO.File]::WriteAllText(path, text, (New-Object System.Text.UTF8Encoding($false)))`，
   并在改完后用脚本逐文件对比 `HEAD` 与工作区的 BOM 状态（本轮实测 0 处变化）。
2. **「按行号逐行比对 emit 产物」是错的验证方式。** 本轮我给含**增删行**的改动套用了
   原先为「行数不变的纯替换」写的对比脚本，于是插入一行 import 让其后**每一行**都错位，
   脚本报出 671 处「差异」——**全是假阳性**，而真正的 1 处改动淹没在里面。
   ⇒ **验证脚本也有适用域**：行数不变用逐行比对；含增删行必须用**真正的 diff**（或先按
   hunk 归一化）。本轮后半程改看 `git diff -U3`（4 个 hunk，逐条即预期改动），
   并以 `tsc` + 全量套件（**253 files / 2070 tests / exit 0**）为准。

## 第 89 轮：修掉测试套件级红灯（`unknown-casts` 136 → 111）

本轮是**跨轴体检 + 两批落地**，四件事按价值排序记在这里。

### 一、`@yami/editor` 全量套件曾经**必然红**，且被误记为「flake」

**实测症状**：`252 passed / 2066 passed` 全绿，**进程却 `exit 1`** ——
`Errors 1 error: EnvironmentTeardownError: Cannot load '/src/composables/useZoomWindow.ts'
imported from .../title/menu-bar.ts after the environment was torn down`。

**先纠正上一轮（第 87 轮）的判断**：交接节把它记成「真·间歇性」，并推断「并发负载只影响
`template-localized.spec.ts` 的超时」。**这个判断是错的** —— 它不是 flake，是**确定性缺陷**：

- 根因在 `tools/window-registry.ts`：两处 `void ensure(...)` **丢弃了派生 promise，
  却没给原始 promise 挂 rejection 回调**。两处都要修，因为它们各自派生一个 promise：
  `get` trap 的 `void ensure(...)`，以及 `set` trap 的 `void ensure(...).then(回填)`。
- 触发链（第 84 轮已记录，但当时归因错了）：`ui-state.spec.ts` 写 store 字段 →
  懒代理 `get`/`set` 取不到实例 → `loadUI()` 动态 `import('window-cluster')` →
  该 barrel 静态 re-export `useZoomWindow`（→ `menu-bar.ts`）；环境在 import 完成前拆除 ⇒ reject。
- **vitest 把 unhandled rejection 记成「套件级」错误**，所以它不会让任何 `expect` 失败 ——
  「用例全绿但退出码 1」正是骗过人的形态。**判据是退出码，不是用例计数。**

**修法**：`ensure()` 内 `void promise.catch(ignoreUnhandledRejection)`（只标记「已处理」，
**不替换** pending 里的 promise ⇒ `loadWindow()` 调用方仍能照常拿到 rejection），
`set` trap 的回填链再挂一次。**失败后仍保留在 pending 里**（与改动前一致，避免 loader 反复失败时无限重试）。

**新增自证回归** `tools/__tests__/window-registry-rejection.spec.ts`（4 例）：自己装
`process.on('unhandledRejection')` 把「静默失败」变成**可断言的数字**。
**已按本仓纪律实测自证**：把两处 catch 去掉复跑 → `3 failed`
（`expected 1 to be +0`，正是两条 trap 路径 + 缓存用例），装回 → 4/4 通过。
**修完事实**：`253 files / 2070 tests passed`，**`Errors 0`，`exit 0`**。

### 二、`unknown-casts` 两批：136 → 121 → 111

**批次 1 · `Reflect.set`（−15 处，纯机械）**：`(getXStore() as unknown as Record<string, unknown>)[key] = value`
这一形态在**15 个文件各 1 处**，且**13 处上下文完全相同**（都在 `Object.defineProperty` 的
`set: (value: unknown) => {…}` 里）。改成本仓既有的 `Reflect.set(getXStore(), key, value)`
（先例：`layout.ts` / `scene-window.ts` / `window-object.ts` 早已这么写）。

> ⚠️ **这批不能用「esbuild 产物逐字节比对」自证** —— 前几轮的手法库是为**纯类型改动**立的，
> 而 `Reflect.set(...)` 是**真实调用**，产物**必然不同**。本轮改用更贴切的判据：
> 逐行打印 emit 出来的**每一处差异**，确认**全部且仅有** `obj[k] = v;` → `Reflect.set(obj, k, v);`
> （15/15，无一处例外）。两者走同一个 `[[Set]]`，语义逐条相同。
> **教训：验签方式要跟着改动性质走，别把上一轮的结论直接套到下一轮。**

**批次 2 · `registryElement` 收口（−10 处，并修掉一处真损坏）**：

`composableEls.get(id) as unknown as | (HTMLElement & {write?:…}) | null` 这形态在
**5 个 `tools/*.vue` 各 2 处**，正是 `registryElement<T>()` 文档里点名的那一族。
但**实测发现真正的病灶不是「写得啰嗦」**：

```ts
const control = composableEls.get(id) as unknown as unknown as
	(HTMLElement & { write?: (value: unknown) => void }) | null;
```

`as unknown as␉unknown as` —— **`as unknown as` 被套了两遍**。这说明**某次 codemod 在
这 5 个文件上跑了两次**：第一次把 `as unknown as | T | null` 换成 `as unknown as T`（丢掉 `| null`），
第二次又在已经改过的文本上匹配、再插一遍前缀，于是留下 `unknown as | (…)` 后面还跟着 `| null;`
的**畸形但合法**的语法。`tsconfig` 接受、`tsc` 不报、`oxlint` 不报；**台账也只数 1 处**
（`\bas\s+unknown\s+as\b` 匹配 `as unknown as unknown as` 只有 1 次）。
⇒ 它是**仪器盲区 + 语法畸形**的叠加，只有人工读代码才看得见。

改成既有 helper（`registryElement<HTMLElement & { write?: (value: unknown) => void }>(composableEls, id)`），
5 个文件各加 import，**10 处畸形与断言一起消失**。

### 三、三条**可复用的新教训**

1. **`.vue` 的类型债，`tsc` 与 `typecheck:vue` 会给出相反结论。** 本轮实测：删掉
   `AnimMotionPage.vue` 的一个 `as unknown as`，`pnpm typecheck` **`exit 0`（0 错误）**，
   而同一次改动 `typecheck:vue` 报 **`TS2345`（1 new error）**。第 31/39/48 轮的「`tsc` 对 `.vue`
   是假绿」这次拿到了**同一改动上的对照证据**，不再只是告诫。
2. **「一次改两处」能拿到单点实验拿不到的信息。** 本轮把 `useInspectorInput.ts` 的
   `InputOwner.history` 从 `unknown` 收紧成真实契约 `History | null`（与 `Inspector.inputBlur`
   的声明一致），再删调用点的断言 —— 立刻报 **17 new errors**，点名 `Scene*` / `Anim*` 一族。
   ⇒ 这条 `bindInput` 家族（14 处断言）**不是写法问题，而是压在 `SceneShape` / `AnimationShape`
   的 `[k: string]: any` 上**：删断言与清 hatch 必须**同一轮一起做**，属 P3。**已如实回退，未留半成品。**
3. **判据要跟着改动性质走**：纯类型改动 → esbuild 逐字节；含真实调用的改动 → 逐行 emit 差异对账。

### 四、顺手关闭的两个待决策项 + 一处文档纠偏

- **③ 已落地**：`pnpm -F @yami/ui-kit build:types` 加进 CI `gates` job（此前 ui-kit 的 `.vue`
  **不在任何门禁里**）。
- **② 已关闭**：见本节第一条（不是 flake，是缺陷，已修）。
- **① 已定性待拍板**：`format:check` 实测 **249 个文件**（原文 261 也已过时）。**它不是
  「格式从没被管过」** —— husky + `lint-staged` 已在每次提交时对暂存文件跑 `oxfmt`，
  红的只是**全仓历史存量**。处置二选一：跑 `pnpm format` 收口存量（**249 个文件的大面积机械改写，
  按第 37 轮教训必须避开任何并行写入者**）后进门禁；或明确降级为非门禁脚本。
  ⚠️ `format` 的扫描面是 `packages/editor`，**不含 `packages/ui-kit`**。
- **文档纠偏**：交接节「`any-hatches` 起点 67」是**第 62 轮**的数（第 63→87 轮又清掉 15 处），
  实测起点就是 **52**；§4 工作单第 1 条「口径跨行漏洞」经穷举证伪（全仓 1196 个 `Record<…>`
  构造，跨行且为 `string, any` 的 **0 个**）**已删除**；台账表 4 行过时数字已刷新。

## 第 88 轮（续轮）：`unknown-casts` 137 → 136 —— 用「**两端共用的具名类型**」解开第 84 轮那个死结

### 第 84 轮留下的问题，这轮正式解掉

第 84 轮在 `command-api.ts` 的 `textPointerenter` 上撞到过一对约束，当时判定「两条路都不行、
需要把类型提升成具名类型，属类型设计改动」并回退了。这轮把它做完了 —— 关键动作是**同时改两端**：

```ts
/**
 * 变量标识文本元素：`varSpace`/`varType`/`varKey` 由 `updateCommandElement` 用
 * `Object.defineProperty` 装成 getter，`textPointerenter` 读它们来高亮。
 * 这个具名类型是**读点与注册点共用**的那一个。
 */
interface VariableTextElement extends HTMLDivElement {
	[k: string]: unknown; // 该元素还被挂了不少临时字段（如 text.name）
	varSpace: string;
	varType: string;
	varKey: string;
}
```

- **读点**：`textPointerenter: function (this: VariableTextElement)` ⇒
  `commandListStatics.highlightTexts(this)` 直接通过，**一个断言都不需要**；
- **注册点**：`const text = renderDetachedDiv('command-text') as VariableTextElement;` ⇒
  后面的 `.call(text)` 也满意。

**为什么单次断言当年过不了、现在却根本不需要**：当年的源类型（`GlobalEventHandlers & { [k: string]: unknown }`）
与目标类型（`{ varSpace: string; … }`）是**两个临时形状**，谁也不包含谁；现在两端指的是**同一个具名类型**，
约束自然消失。`[k: string]: unknown` 保留在交叉里，是为了不打断 `text.name = id` 这类临时字段写入。

> ⇒ 这条把第 86 轮的判据补成完整版：**遇到 TS2352 与 TS2345 交替出现时，不要继续在两端各打补丁，
> 而是找出（或造出）两端共用的那个具名类型。** 造出来往往还能顺手去掉断言本身，而不只是降级。

### 验证（本轮）

- `unknown-casts` **137 → 136 处（−1）**，且这处是**断言彻底消失**（不是降级）
- `tsc` 0 · `build:types`(ui-kit vue-tsc) 0 · `lint` 0 warnings 0 errors · `typecheck:vue` 0 新增
- `migration:selftest` 38/38 · ui-kit **115 文件 / 811 通过** ·
  editor **252 文件 / 2056 通过（独占跑，exit 0）**
- **运行期零改动**：只改了类型声明与注解

## 第 87 轮（续轮）：`unknown-casts` 139 → 137 —— 粒子引擎两处 `Object.assign`，外加一处**类与接口漂移**的实测

### 批次 1 `particle-engine.ts` 2 处：`Object.assign` 规则第 3 次复用

```ts
this.elements = [] as unknown as ParticleElementRef[] & { count: number };
this.elements.count = 0; // 断言之后紧接着写字段 ⇒ 合并
// ↓
this.elements = Object.assign([], { count: 0 });
this.reserves = Object.assign([], { count: 0 });
```

### 批次 2（试过并回退）：`new ParticleElement(this as unknown as ParticleElementLayer)`

两条路都试了、都被堵死，而且**报错内容本身就说明是真债务**：

- 直接传 `this` → **TS2345**：`this` 不满足 `ParticleElementLayer`；
- 降成单次断言 `this as ParticleElementLayer` → **TS2352**：「两个类型都不足以重叠」。

⇒ 这不是写法问题：**`ParticleElementLayer` 与该类的实际声明已经漂移**
（`data`/`emitter` 等成员对不上）。与第 80 轮记下的 `ParamHistory` vs `IEditableHistory` 属同一类债务 ——
**接口还在，实现已经长歪了**。要修得先把两者对齐（类型设计活 + 需要实机验证行为），已记入 §4。

### 验证（本轮）

- `unknown-casts` **139 → 137 处（−2）**：`particle-engine.ts` 3 → 1
- `tsc` 0 · `lint` 0 warnings 0 errors · `typecheck:vue` 0 新增 · `migration:selftest` 38/38 · 基线已更新
- ui-kit **115 文件 / 811 通过**
- editor **独占跑**：252 文件 / 2056 通过 + 1 个 error（那个已知 teardown flake，exit 1）。
  **这条把第 86 轮的假设收窄了**：flake 在**独占**跑时也会出现（上一轮独占跑时没出现）⇒
  它是真·间歇性；「并发负载」只确定会影响 `template-localized.spec.ts` 那条**超时**测试，
  不能用来解释 teardown flake。
- **运行期改动 2 处**（`Object.assign`，可证等价：原来就是「空数组 + 写 count」）

## 第 86 轮（续轮）：`unknown-casts` 143 → 139 —— 交叉断言**不是万能的**：两处实测边界

这轮 4 处成功、**2 处试过并回退**，而回退的两处把「交叉断言」的适用边界标清楚了 —— 比多减 2 个数更有价值。

### 成功 4 处

**（1）`transition-window.ts` 2 处：交叉的一支就写**源类型本身\*\*

```ts
// radio 的真实静态类型是 RadioProxyElement
(radio as RadioProxyElement & { pointerdown: (event: WheelEvent) => void }).pointerdown(event);
event = dragging as EasingDrag & PointerEvent;
```

**（2）`YMParameterPane.vue` 2 处：病灶又是「参数声明写窄了」**

```ts
interface ParamScriptListElement extends HTMLElement {
	object?: { update: (...args: unknown[]) => unknown };
	data?: ScriptDef[];
}
const bind = (scriptList: ParamScriptListElement): void => { … scriptList.object! … scriptList.data! … };
```

两个读点原来的 `as unknown as { object: … }` / `as unknown as { data: … }` 随之消失，
`!` 保持原来的空值语义。（第 75/76/83 轮同一个手法。）

### ⚠️ 回退 1：`typeof Easing.list` 解析出来是**字面量 `null`**

```ts
Easing.list = list as typeof Easing.list; // TS2352: Conversion of type 'YamiElement' to type 'null'
```

`Easing.list` 在形状里的初始值就是 `null`，所以 `typeof Easing.list` **不是**「`YamiElement | null`」而是 `null`。
⇒ 想拆这处，得先给 `Easing.list` 一个真实声明（类型设计活）。**这提醒我：`typeof x.prop` 在
「属性是对象字面量初始化」时会退化成字面量类型**，别想当然当它是联合。

### ⚠️ 回退 2：交叉断言**不能**用来「给一个 interface 加 DOM 基类」

```ts
const input = container as HTMLElement & RepeatableGroupInput; // TS2352
// Type 'HTMLDivElement' is missing the following properties from type 'RepeatableGroupInput':
//   setTooltip, parameters, key, read, write
```

`RepeatableGroupInput extends HTMLElement`，源是 `HTMLDivElement` —— 我原以为「交叉里有一支是 `HTMLElement`，
而 `HTMLDivElement` 可赋给 `HTMLElement`」就够了，**实际不行**：TS 会要求源对**交叉整体**可比，
于是仍报「缺 `RepeatableGroupInput` 的成员」。

> **交叉断言的适用边界（本轮实测收口）**：只有当交叉里有一支**与源类型是同一支**（或源可直接赋值给它、
> 且另一支不引入**必需**成员冲突）时才成立。经验判据：
>
> - ✅ `TreeItem[] & TreeItem`（源就是 `TreeItem[]`）、`RadioProxyElement & {…}`（源就是前者）、
>   `FileNavPaneElement & CommonListLike`（源可赋给前者、后者成员在源上齐备）；
> - ❌ `HTMLElement & RepeatableGroupInput`（后者有源上不存在的必需成员）。

### 验证（本轮）

- `unknown-casts` **143 → 139 处（−4）**：`transition-window.ts` 3 → 2 · `YMParameterPane.vue` 3 → 2
  （另有 2 处试过并回退，已在代码里写明原因）
- `tsc` 0 · `build:types`(ui-kit vue-tsc) 0 · `lint` 0 warnings 0 errors · `typecheck:vue` 0 新增
- `migration:selftest` 38/38 · ui-kit **115 文件 / 811 通过**
- editor：**独占重跑 = 252 文件 / 2056 通过、exit 0**（而且连那个 teardown flake 也没出现）。
  但**首次运行出现了 1 个非预期红**，查明是**并发负载导致的超时**，不是代码问题：
  `src/localize/__tests__/template-localized.spec.ts` 的「与源码反推的集合一致」会**遍历整个源码树**
  （单跑 ~9.9s，已显式放宽到 60s 上限），而我当时把 ui-kit 测试 + `vue-tsc` + selftest 与它**并发**跑了。
  单跑该 spec：4/4 通过（9.9s）。
  ⇒ **操作纪律（记下来）：editor 全量套件必须独占跑。** 否则会把这个「慢但正常」的测试逼成偶发红 ——
  这也给那个 teardown flake 提供了一个新假设：它同样可能是**负载敏感**的，而不是纯粹的代码竞态。
- **本轮无运行期改动**（删的/换的都是断言；`ParamScriptListElement` 只是把参数声明加宽）

## 第 85 轮（续轮）：`unknown-casts` 150 → 143 —— 「**保留对象类型、只补索引签名那一支**」的交叉断言

### 批次 1 `utils/dom.ts` 3 → 0：`CSSStyleDeclaration & Record<string, string>`

`css()` 这个 helper 按**动态键**读写样式（`css(el, 'marginLeft')` 这种用法），
三个站点原来都写 `as unknown as Record<string, string>` —— 等于把整张类型表丢掉，
只剩「一张字符串表」。改成交叉断言：

```ts
(getComputedStyle(el as Element) as CSSStyleDeclaration & Record<string, string>)[
	args[0] as string
](el.style as CSSStyleDeclaration & Record<string, string>)[key] = props[key];
```

为什么这样更好：

- `CSSStyleDeclaration` 是 **interface**（没有隐式字符串索引签名），指向 `Record<string, string>`
  的断言过不了可比 ⇒ 这是「必须绕」的真实场景；
- 但**不必把对象类型也丢掉** —— 交叉一支保留了它，读出来的值仍是 `string`（不是 `any`），
  而且单次断言即可（交叉里有一支与源类型一致）。
- 与「用 `Reflect.get` 图省事」的区别：`Reflect.get` 返回 `any`，那是**没被计量的坏味道**（第 79 轮已拒绝过一次）。

> ⇒ 这条是「必须绕时怎么绕得最小」的模板：**保留原类型 + 只补缺口的那一支**，而不是 `unknown` 换表。

### 批次 2 `tools/window-object.ts` 3 → 1

- 桥接 setter → `Reflect.set(getWindowStore(), key, value)`（**这是全仓第 4 处同形桥接**：layout / scene /
  customCommand / window —— 已经够格称为一个「家族」了）。
- `(window as unknown as { Window: typeof Window }).Window = Window;` → `Reflect.set(window, 'Window', Window)`。
- 剩下那 1 处（`frames: [] as unknown as HTMLElement[] & { append; remove }`）**留着**：
  `append`/`remove` 是在文件后半段（470-510 行）**后挂**到这条数组上的，初始字面量里根本没有这两个方法，
  所以这里没有「先断言、再自己写字段」的结构，`Object.assign` 规则不适用；要拆得先重排初始化顺序。

### 批次 3 `commands/command-tip.ts` 3 → 1

- 「取 → 判空 → 断言」三段式 → `registryElement<CommandSuggestionWidget>(…)`（同第 83 轮）。
- **又一处死别名**：`Command.words as unknown as { push(s): number; join(j?): string } & Array<string>`
  —— 与第 83 轮在 `command-custom.ts` 删掉的 `WordListInstance` **是同一个多余形状**，
  `Command.words` 的真实类型本来就带 `push`/`join` ⇒ 直接读。
  （同一个死形状在两个文件里各写了一遍，说明它是「照抄型」债务，值得每轮顺手搜一遍。）

### 验证（本轮）

- `unknown-casts` **150 → 143 处（−7）**：`dom.ts` 3 → **0** · `window-object.ts` 3 → 1 ·
  `command-tip.ts` 3 → 1
- `tsc` 0 · `build:types`(ui-kit vue-tsc) 0 · `lint` 0 warnings 0 errors · `typecheck:vue` 0 新增
- `migration:selftest` 38/38 · ui-kit 本轮未改（仍跑一遍：115 文件 / 811 通过）
- editor **252 文件 / 2056 全部通过**，1 个 error = 同一个已知 flake（调用链与第 84 轮记下的一致）
- 运行期改动：2 处 `Reflect.set`（可证等价）；`dom.ts` 三处只是换了个断言写法

## 第 84 轮（续轮）：`unknown-casts` 157 → 150 —— 第 82 轮那条规则**一轮复用了 4 次**

### 批次 1 `command-api.ts` 5 → 1

**(1) `Object.assign` 规则复用（第 82 轮提出，这轮在 ui-kit 里连中两处）**

```ts
// 前：断言声称有 6 个游标字段，紧接着自己把 6 个逐个写上去
list.elements = [] as unknown as CommandListElements;
list.elements.versionId = 0; … list.elements.foot = null;
// 后
list.elements = Object.assign([], { versionId: 0, count: 0, start: -1, end: -1, head: null, foot: null });
listData.selections = Object.assign([], { count: 0 });
```

**(2) 「声明说的是公开契约、运行期其实是数组」的读点：保留 `| null` 的交叉断言**

```ts
this.createItems((this.data as (CommandData & CommandList) | null)!, 0);
const allSelectable = (this.data as (CommandData & CommandList) | null)!.length > 0;
```

`CommandListHost.data` 声明成 `CommandData | null`，但文件里 397-399 行的注释早就写明**运行期是命令行数组**
（`createItems` 逐行遍历、`data.length`）。诚实的写法就是把「两者都成立」写成交叉类型；
因为源是 `X | null`，**断言目标里也必须带 `| null`**（第 80 轮细则），再用 `!` 保持原来的空值语义。

### 批次 2 `YMParamList.vue` 5 → 2

- 同一处 `Object.assign` 规则（`elements` 六字段 + `selections.count`）。
- `self._paddingTop = undefined as unknown as number;` → **`self._paddingTop = undefined;`**：
  `_paddingTop` 在类型里本来就是 `_paddingTop?: number`（可选），断言纯属多余。
  ⇒ 新的一条小分类：**断言在替一个「本来就是可选的字段」圆谎**。

### 试过并**回退**的一处（这轮最有信息量的一次失败）

`command-api.ts` 的 `textPointerenter`：

```ts
textPointerenter: function (this: GlobalEventHandlers & { [k: string]: unknown }): void {
	commandListStatics.highlightTexts(this as unknown as { varSpace: string; varType: string; varKey: string });
```

两条路都试了、都被编译器堵死：

1. **降成单次断言** `this as { varSpace: string; … }` → TS2352：源与目标**两个方向都不可比**
   （源只有索引签名，目标只有三个具名字段，谁也不满足谁）；
2. **把三个字段写进 `this` 注解**（读点就不用断言了）→ 注册点报 **TS2345**：
   注册处传的是 `HTMLDivElement & { [k: string]: unknown }`（本文件 1366 行附近），
   注解一严，轮到注册点不满足。

⇒ 结论：**这里的正解是把「哪一类元素才有这三个字段」提升成一个具名类型、并在注册点一起用**，
属于类型设计改动，不在 P4 顺手做的范围。已在代码里写清两条路都试过、为什么不行。

> 这也是本轮值得记的：**「读点」与「注册点」是一对约束** —— 只放宽/收紧其中一端，
> 报错只会从一端跳到另一端。遇到 TS2352 + TS2345 交替出现时，就该停下来找那个**两边共用的具名类型**。

### 验证（本轮）

- `unknown-casts` **157 → 150 处（−7）**：`command-api.ts` 5 → 1 · `YMParamList.vue` 5 → 2
- `tsc` 0 · `build:types`(ui-kit vue-tsc) 0 · `lint` 0 warnings 0 errors · `typecheck:vue` 0 新增
- `migration:selftest` 38/38 · ui-kit **115 文件 / 811 通过**
- editor **252 文件 / 2056 全部通过**，1 个 error = 那个已知 flake；**这轮抓到了它的完整调用链**
  （用于日后决定治不治）：

    ```txt
    EnvironmentTeardownError: Cannot load '/src/title/menu-bar.ts' imported from
      packages/editor/src/tools/window-cluster.ts after the environment was torn down.
    - /src/title/menu-bar.ts
    - packages/editor/src/tools/window-cluster.ts
    - packages/editor/src/stores/ui.ts
    - packages/editor/src/stores/__tests__/ui-state.spec.ts
    ```

    ⇒ 即 `ui-state.spec.ts` 触发 `stores/ui.ts` 的惰性代理 → 模块级 `tools/window-cluster.ts`
    → 拉起 `title/menu-bar.ts`，而此刻该 spec 的环境已经被拆掉。

- **运行期改动**：4 处 `Object.assign`（均可证等价：都是「先空数组、再逐个写字段」的合并写法）
  ＋ 1 处 `= undefined`（原来就是 undefined）；均在 ui-kit 列表装配路径上

## 第 83 轮（续轮）：`unknown-casts` 163 → 157 —— 一个断言常常**同时盖住两件事**

### 批次 1 `command-custom.ts` 4 → 0

**(1) `{ box, grid, children: [] } as unknown as ParameterWrap` —— 拆开才发现它盖了两件事**

第一眼看上去这处是「多写的断言」：`interface ParameterWrap` 的成员**恰好就是**
`box` / `grid` / `children` 三项，字面量本来就是它的形状。于是改成类型标注：

```ts
const wrap: ParameterWrap = { box, grid, children: [] };
```

`tsc` 立刻报第二件事：

```txt
src/commands/command-custom.ts(132,38): error TS2322: Type 'HTMLElement' is not assignable to type 'YamiElement'.
```

`grid` 来自 `this.parameterGrid`，而它在 `command-object.ts` 里被声明成 `HTMLElement`；
`ParameterWrap.grid` 要的是 `YamiElement`。**光删断言不够，得回到声明处把事实写对**：

```ts
// command-object.ts：initialize() 里就是从元素注册表取的 YamiElement（见 command-custom.ts:111）
parameterGrid?: YamiElement;
```

> ⇒ 一条经验：**一个 `as unknown as` 常常同时盖住两件事 ——「多写的断言」与「声明与事实不符」。**
> 拆的时候两件都要处理；只处理一件，编译器的下一条报错会立刻告诉你另一件在哪。

**(2) `Command.words as unknown as WordListInstance` → 直接 `Command.words`**

而且那个别名**整个都是多余的**：

```ts
type WordListInstance = Array<string> & { push(s: string): number; join(j?: string): string };
```

`push`/`join` 本来就在 `Array<string>` 上，而 `Command.words` 的真实类型 `WordListShape` 也自带它们。
⇒ 断言与别名**一起删掉**（别名删除后由 `tsc` 的 TS6196「声明了但没用到」确认没有别处引用）。

**(3) 两处 `as unknown as number/string` 是无意义的**

```ts
numbers[i] = Command.setNumberColor!(numbers[i] as number) as unknown as number;
strings[i] = Command.setStringColor!(`"…"`) as unknown as string;
```

`Command.setNumberColor/setStringColor` 的类型是 `CommandMethod = (...args: any[]) => any` ——
**返回值本来就是 `any`**，`any` 可以赋给 `number`/`string` ⇒ 这两个断言纯属噪音，直接删。

### 批次 2 `custom-command-window.ts` −2

1. 三段式「取 → 判空 → 断言」换成一句既有 helper（第 56 轮引入的 `registryElement`）：

    ```ts
    const list = registryElement<CustomCommandList>(customCommandEls, 'command-list');
    if (!list) return;
    CustomCommand.list = list;
    ```

2. `Easing.getItemById as unknown as (id: string) => CustomCommandData | null` → 单次断言
   （两个函数类型本来就可比）。

### 验证（本轮）

- `unknown-casts` **163 → 157 处（−6）**：`command-custom.ts` 4 → **0** ·
  `custom-command-window.ts` 3 → 1（剩下那处已注明归 P3 的 `any` 别名批次）
- `tsc` 0 · `build:types`(ui-kit vue-tsc) 0 · `lint` 0 warnings 0 errors · `typecheck:vue` 0 新增
- `migration:selftest` 38/38 · ui-kit **115 文件 / 811 通过** · editor **252 文件 / 2056 通过（exit 0）**
- 本轮**没有运行期改动**：删掉的都是断言和多余类型别名，`parameterGrid` 的声明只影响类型

## 第 82 轮（续轮）：`unknown-casts` 169 → 163 —— 「断言完紧接着把字段写上去」就该用 `Object.assign`

### 批次 1 `scene-window.ts` 4 → 1

**(1) 桥接 setter**：`(getSceneStore() as unknown as Record<string, unknown>)[key] = value`
→ `Reflect.set(getSceneStore(), key, value)`（与第 78/81 轮同一条）。

**(2) 两行变一行、且零断言（本轮最值得记的一处）**

```ts
// 前：断言声称有 `count`，紧接着自己把 `count` 写上去
regions.visibleList = [] as unknown as unknown[] & { count: number };
regions.visibleList.count = 0;
// 后
regions.visibleList = Object.assign([] as unknown[], { count: 0 });
```

`Object.assign([] as unknown[], { count: 0 })` 与「先 `[]` 再 `.count = 0`」**逐条等价**（同一个 `[[Set]]`），
类型是 `unknown[] & { count: number }` —— 正好就是字段声明的形状，一个断言都不需要。

> ⇒ 规则：**断言之后紧跟着「把断言里声称的字段写上去」时，`Object.assign` 就是零断言的写法。**

**(3) 两处同形 `[] as unknown as XxxShape` 收敛成一个工厂**

```ts
/**
 * 列表型容器：运行期就是「空数组 + 窗口游标」，游标由 `common-list` 家族助手稍后填写。
 * 类型上必须带游标字段（否则助手读不到），但**声明这一刻它们确实还不存在** ——
 * 这是本文件里唯一真正需要 `unknown` 的地方，收敛到这一个工厂里。
 */
const emptyListWithCursor = <T>(): T => [] as unknown as T;
```

把「为什么这里必须绕」写在唯一的地方，比在两个站点各写一遍断言更有信息量。
（第 75/76 轮是「N 个读点 → 1 处声明/工具」，这轮是「N 个构造点 → 1 个工厂」，同一族手法。）

### 批次 2 `custom-command-window.ts` 的桥接 setter

原来是 `getCustomCommandStore() as unknown as Record<…, any>`（**多行泛型实参里的 `any`**，
还带一条 `oxlint-disable-next-line no-explicit-any`）。改成 `Reflect.set(...)` 后两条一起消失。

> **顺带发现一个计量口径漏洞（如实记账）**：`any-hatches` 的正则是
> `\[(?:k|key):\s*string\]:\s*any\b|Record<string,\s*any>` —— 它匹配不到
> `Record<\n\t…,\n\tany\n>` 这种**跨行书写**的 `Record<..., any>`。
> 也就是说这个站点一直在口径之外。本轮它被删掉了，但**口径漏洞本身仍在**，
> 若以后要按这条轴归零，得先把正则改成能跨行（属于仪器活，留待 P3 收尾时一起做）。

### 批次 3 `YMFileNavPane.vue` 4 → 2

`commonListResize(el.value! as unknown as CommonListLike)` →
`as FileNavPaneElement & CommonListLike`（单次断言）；`updateHeadAndFoot` 同理用
`& HeadAndFootListLike`（第 77 轮收窄出来的窄契约）。为什么单次就够：`FileNavPaneElement`
本身就 `extends HTMLElement`，**交叉类型里有一支与源类型一致** ⇒ 可比。

### 试过并**回退**的一处（说明「不是所有 unknown-casts 都该在 P4 拆」）

`custom-command-window.ts` 的 `updaters.push(list.updateTextNode as unknown as (item: unknown) => void)`
本来想用适配器替掉，撞上两件事：

- `updateTextNode` 的类型是**本地别名** `type CustomCommandMethod = ((...args: any[]) => any) | null`
  —— 既是 `any` 又**可空**，于是 `Parameters<typeof …>` 连约束都不满足（TS2344）；
- 给它加 `?.` 就**改了行为**：原来是把「可能为 null 的值」登记进去、由调用点抛，
  加了 `?.` 就变成静默跳过。

⇒ 回退，并在代码里写明**归到 P3 的 `any` 别名批次**（先把别名去掉、再谈拆断言）。

### 验证（本轮）

- `unknown-casts` **169 → 163 处（−6）**：`scene-window.ts` 4 → 1（保留的那 1 处在工厂里）·
  `custom-command-window.ts` −1 · `YMFileNavPane.vue` 4 → 2
- `tsc` 0 · `build:types`(ui-kit vue-tsc) 0 · `lint` 0 warnings 0 errors · `typecheck:vue` 0 新增
- `migration:selftest` 38/38 · ui-kit **115 文件 / 811 通过**
- editor **2056 项全部通过**，但**又是**「全通过 + 1 个环境错误」的已知 flake（exit 1）；
  本轮会话实测 **5 次 exit 1 / 3 次 exit 0**，与本次改动无关（改动点在场景初始化与文件导航面板）
- **本轮有两处运行期「写法」改动（均可证等价）**：`Reflect.set` ×2 与
  `Object.assign([] as unknown[], { count: 0 })`。它们分别落在**场景初始化/存档**与
  **设置桥接**路径上 —— 实机回归清单第 8 项（保存重开项目布局与缩放）会覆盖到。

## 第 81 轮（续轮）：`unknown-casts` 179 → 169 —— 「把 NodeList 当数组」与「readonly 的绕法」两类伪装

### 批次 A `layout.ts` 6 → 0

**(1) 三处同形 `X.childNodes as unknown as LayoutGroupElement[]` → `as NodeListOf<LayoutGroupElement>`**

要点是**不要**图省事写成 `Array.from(node.childNodes)` —— 那是把**活的** NodeList 变成快照，
语义就变了（这几处的循环体里会 `outer.insertBefore(node, inner)`、`inner.remove()`）。
`NodeListOf<T>` 既保住活性，又能 `for…of`（`tsconfig` 的 `lib` 里有 `dom.iterable`：见 `tsconfig.json:15`）。

**(2) 去掉一个断言，改用**类型谓词**（本轮最漂亮的一处）**

```ts
// 前：DOM 的 childNodes 真的可能含文本/注释节点 ⇒ 「断言成 ArrayLike<Element>」过不了「可比」
const children: ArrayLike<Element> =
	element.children ?? (element.childNodes as unknown as ArrayLike<Element>) ?? [];
const list = Array.from(children).filter((child) => child?.nodeType === 1);
// 后：如实声明 + 把「只留元素」写成类型谓词
const children: ArrayLike<ChildNode> = element.children ?? element.childNodes ?? [];
const list = Array.from(children).filter((child): child is Element => child?.nodeType === 1);
```

运行期**一模一样**（类型谓词是编译期的东西），但类型上第一次说清了那句 filter 的意图。
⇒ 规则：**当「断言出来的形状」与「后面那句 filter/if」说的是同一件事时，删掉断言、
把那句过滤改写成类型谓词。**

**(3) 另两处 `Record<string, unknown>` 写入 → `Reflect.set`**（同第 78 轮 tree-api）：
`window`（interface，无隐式索引签名）与 `getLayoutStore()` 的动态键写入，都没有合法的单次断言写法。

### 批次 B `YMGamepadBox.vue` 4 → 0

`clonePad` 里的动态键拷贝与 `buttons` 赋值（3 处 `Record<string, unknown>`）→
`Reflect.set(clone, key, Reflect.get(pad, key))` / `Reflect.set(clone, 'buttons', …)`。

第 4 处是**另一种伪装**：

```ts
for (const button of lastPad.buttons as unknown as { pressed: boolean; value: number }[]) {
	button.pressed = false; // ← 报 TS2540：Cannot assign to 'pressed' because it is a read-only property
	button.value = 0;
}
```

第一次直接删掉断言，`vue-tsc` 立刻报 **TS2540 —— DOM 里 `GamepadButton.pressed`/`value` 是 `readonly`**。
所以这个断言的真实用途不是「形状不符」，而是**解锁只读**。改法：

```ts
Reflect.set(button, 'pressed', false);
Reflect.set(button, 'value', 0);
```

操作的是 `clonePad` 复制出来的普通对象，`Reflect.set` 与 `button.pressed = false` 是同一个 `[[Set]]`，
语义相同且不需要断言。

> ⇒ 记一条分类：`as unknown as` 至少有两类成因 ——
> **① 真形状不符**（改声明、收窄、或给个具名交叉类型）；
> **② 解锁 readonly / 索引签名写入**（用 `Reflect.get`/`Reflect.set`）。
> 今天这轮把两类都摸清了，判定顺序应当是：先看报什么错（TS2540 就是②，TS2352 才可能是①）。

### 验证（本轮）

- `unknown-casts` **179 → 169 处（−10）**：`layout.ts` 6 → **0** · `YMGamepadBox.vue` 4 → **0**，
  两者都已从台账的 files 计数里消失
- `tsc` 0 · `build:types`(ui-kit vue-tsc) 0 · `lint` 0 warnings 0 errors · `typecheck:vue` 0 新增
- `migration:selftest` 38/38 · ui-kit **115 文件 / 811 通过**
- editor **2056 项全部通过**，但**又一次**出现「全通过 + 1 个环境错误」的已知 flake 形态（exit 1）；
  本轮会话该命令实测 **4 次 exit 1 / 3 次 exit 0**。它与本次改动无关（改动点是布局引擎与手柄克隆，
  两者都不在那个 teardown 报错的链路上），仍是待用户决策项。

## 第 80 轮（续轮）：`unknown-casts` 193 → 179 —— 一个**由 spec 直接作证**的谎话，外加第 7 项待决策

### 批次 A `useSwitchConditionSchema.ts` 5 → 0：不是「可能为 null」，是**必然 `undefined`**

5 条校验失败路径写的是：

```ts
return requestFocus('switch-condition-attribute-attributeId') as unknown as SwitchConditionData;
```

而 `requestFocus` 的签名是 `(id: string, mode?: string): void`（`src/directives/focus.ts:15`）——
**它返回 `void`**。所以这 5 处的运行期值是 `undefined`，声明却说是 `SwitchConditionData`。

**决定性证据：既有 spec 早就把契约钉死了**（`composables/__tests__/useSwitchConditionSchema.spec.ts`）：

```ts
it('save 校验失败返回控件焦点且不关闭窗口', async () => {
	…
	expect(SwitchCondition.save!()).toBeUndefined();
});
```

⇒ 运行期契约一直是「失败返回 `undefined`」，**只有类型在撒谎**。改法（纯类型 + 两条语句拆分）：

```ts
const save = (): SwitchConditionData | undefined => { … requestFocus('…'); return undefined; }
// 接口同步：SwitchConditionTarget.save / SwitchConditionShape.save / .confirm 都带上 | undefined
```

（`return requestFocus(…)` 在 `| undefined` 的返回类型里**不合法** —— `void` 不能赋给 `undefined`，
所以必须拆成两句；行为逐条相同，spec 的 `toBeUndefined()` 就是验收。）

**零连锁**：改完后 `tsc` **一处新报错都没有**。原因是唯一的真实消费点
`useSwitchBranchSchema.ts:65-66` 早就写了 `if (condition !== undefined)` ——
类型一改，那句「不可能的比较」变成有意义的检查。这反过来证明运行期契约确实是 `undefined`。

### 批次 B `animation-list.ts` 5 → 0：`this: typeof Animation & HTMLElement`

4 个处理器（`layerListScroll` / `layerListKeydown` / `outerTimelineListScroll` /
`outerTimelineListPointerdown`）原来都在用 `this as unknown as HTMLElement`。依据不是猜的：

- 注册处 `animation-initialize.ts:506/512` 写的是 `on(this.layerList, 'scroll', this.layerListScroll)`
  ⇒ **`this` 就是那个元素**（`on` 是 DOM 事件绑定）；
- 函数体里本来就在读 `this.scrollTop` / `this.scrollLeft`（元素成员）。

这是第 75 轮「修声明」在 **`this` 参数**上的同一条：声明补上 `& HTMLElement`，5 处断言消失。

### 批次 C `script-list.ts` 5 → 1：接口**漏了继承**，加上去 3 处就没了

`interface ScriptListElement` 逐项声明了 `contains(target: Node): boolean`（DOM 成员），
却没写 `extends HTMLElement` ⇒ 每个 `removeClass/addClass(this, …)` 都得先断言一次。
补上继承后 3 处直接消失（`listDragleave` / `listDragover` / `listDrop`）。

第 4 处（`this.target`）改用**保留 `| null` 的单次断言**：`(this.target as (HTMLElement & ScriptListTarget) | null)!.save()`。

> **踩到一条新细则：断言目标里也必须保留 `| null`。** 第一次写成 `as HTMLElement & { save(): void }`
> 时报 TS2352 —— 因为源是 `X | null`，而「可比」对**联合源要求每个成分都可比**，`null` 与交叉类型不可比。
> 这与第 73 轮「不要把 `| null` 写进尖括号」是同一族规则的两面：
> **`registryElement<T>` 里那个 `| null` 该删（`Map.get` 的语义由 helper 表达），断言目标里那个 `| null` 该留。**

### ⚠️ 第 5 处保留 `unknown`，并记下第 7 项待决策：`ParamHistory` 不满足 `IEditableHistory`

`script-list.ts` 把 `new ParamHistory(...)` 当 `IEditableHistory` 用。单次断言被 TS 拒绝，原因不是形式：

| `IEditableHistory` 要求                | `ParamHistory` 实际                                 |
| -------------------------------------- | --------------------------------------------------- |
| `stack: HistoryData[]`                 | **没有**                                            |
| `index: number`                        | **没有**                                            |
| `save(data: HistoryData)`              | `save(data: { type: string } & InspectorParamData)` |
| `restore(operation: HistoryOperation)` | `restore(operation: string)`                        |

而 `types/history.ts` 的头部注释明确写着「项目中 CommandHistory / NumberHistory / TextHistory /
ParamListHistory / **ParamHistory** 6 个 History 类重复实现同一组栈式 undo/redo 契约 …… 供各 History 类
implements 复用」。**注释与结构矛盾**：任何读 `history.stack` / `history.index` 的地方都会拿到 `undefined`。

⇒ 本轮**只记录、不改**（补字段或改使用方都是行为改动，须按计划交实机回归判定），
已在代码处留下注释，并列入待用户决策清单（第 7 项）。

### 验证（本轮）

- `unknown-casts` **193 → 179 处（−14）**：A 5 处（`useSwitchConditionSchema.ts` 归零）·
  B 5 处（`animation-list.ts` 归零）· C 4 处（`script-list.ts` 5 → 1）
- `tsc` 0 · `build:types`(ui-kit vue-tsc) 0 · `lint` 0 warnings 0 errors · `typecheck:vue` 0 新增
- `migration:selftest` 38/38 · ui-kit **115 文件 / 811 通过**
- editor **252 文件 / 2056 通过（exit 0）** —— 其中就包含那条把 `save()` 契约钉死的 spec

## 第 79 轮（续轮）：`unknown-casts` 202 → 193 —— 索引签名**直接承接**扩展字段，外加一个**新发现的行为疑点**

### 批次 1 `tile-frame-index.ts` 6 → **0**：连单次断言都不需要

```ts
TileFrame.marqueePointerdown = function (this: typeof TileFrame, event: PointerEvent & { [k: string]: unknown }) {
	(event as unknown as { screen: typeof screen }).screen = screen;   // ← 6 处这样的写法
```

参数声明里**本来就有索引签名**（`{ [k: string]: unknown }`），而索引签名**既能读也能写** ——
所以写扩展字段只要 `event.screen = screen;` 就够了，一个断言都不需要（两处 ×3 字段全清）。

> 与第 75 轮对照记一条判定顺序：**先看参数/变量的声明里有没有索引签名**。
>
> - 有 ⇒ 读写扩展字段都**无需断言**（本轮 6 处）；
> - 没有、且要**读**回来 ⇒ 在声明处给一个具名交叉类型（第 75 轮 `Dragging`，8 处）；
> - 没有、且只在**外部**读 ⇒ 抽小工具收一次断言（第 76 轮 `fileElementOf`，3 处）。

补一句如实记账：这个文件的 `TileFrame` 本身是 `Record<string, any>`（P3 的 `any-hatch`，
现有 oxlint-disable 注释在案），所以 `this.dragging` 是 `any`；本轮清掉的 6 处是打在**有类型**的
`event` 参数上的。`Record<string, any>` 那一处仍留在 P3 欠账里。

### 批次 2 `printer.ts` 的 `imported.signature` 3 处：又是「修声明」

```ts
static imported: FontNameList & { signature?: string } = [];   // 运行期在这条数组上挂指纹
```

3 个读点（1080 / 1376 / 1377）随即变成普通字段访问。与第 75/76/77 轮同一个手法。

### ⚠️ 批次 3：**新发现的行为疑点 —— `TextCommandShape.color` 与文件自身用法不自洽**（本轮只记录、不修）

顺手想把占位命令里的 `color: 0 as unknown as string` 也清掉，于是把声明改成 `string | number`
（同一文件里效果颜色确实会构造**打包整数**：`color: r + (g + (b + a * 256) * 256) * 256`）。
`tsc` 立刻报 **4 处**：

```txt
src/printer/printer.ts(1266,3): error TS2322: Type 'string | number' is not assignable to
  type 'string | CanvasGradient | CanvasPattern'.
（另见 1282 / 1298 / 1319，均为 `context.fillStyle = color` 一类）
```

也就是说：**这个声明与文件自身的用法不自洽，只是被 `as unknown as string` 盖住了。**
证据链（全部在本文件内）：

| 事实                                                                  | 位置                                       |
| --------------------------------------------------------------------- | ------------------------------------------ |
| 声明 `color: string`                                                  | `TextCommandShape`                         |
| 占位命令写 `color: 0`（打包整数形状）                                 | `fetchCommand()`                           |
| `command.color = this.colors[0]`                                      | `drawBuffer()`                             |
| `colors = [Printer.color!]`，而 `Printer.color = CSSRGBA('ffffffff')` | 类静态/初始化                              |
| 同文件效果颜色构造**打包整数**                                        | 三处 `r + (g + (b + a * 256) * 256) * 256` |
| 4 处把 `color` 直接交给 canvas                                        | `drawText` / `drawTextWithShadow` 等       |

**本轮不修的理由**：真实取值究竟是「打包整数」还是「CSS 颜色串」是**行为问题**，
改声明 = 改行为（canvas 对非法 `fillStyle` 是静默忽略的，所以线上一旦是整数，文字颜色一直在吃上一次的值）。
按计划，行为改动必须交用户按实机回归判定 ⇒ **已在代码里（声明处 + 占位处）留下待决策注释**，
并列入待用户决策清单（第 5 项候选缺陷）。

> 这一条值得单独记住：**P4 的价值不在于「台账数字变小」，而在于把谎话逼出来。**
> 本轮台账只减 9，但换来了一个可复现、有证据链、且能一句话说清后果的行为疑点。

### `printer.ts` 剩余 3 处（都记了理由）

- 行 406 `Printer as unknown as Record<string, (...args) => unknown>`：`typeof Printer` 是类类型，
  **没有隐式索引签名** ⇒ 与第 78 轮 `Record<string, unknown>` 同类，**没有合法的单次断言写法**。
  诚实解法是给绘制方法建一张有类型的查找表（`drawingMethods` 现在只存方法名），属设计改动。
  **不用 `Reflect.get` 图省事** —— 它返回 `any`，那是把「被计量的坏味道」换成「没被计量的坏味道」，
  等于骗计量口径，不做。
- 行 1228 / 1235：两个占位值（`0 as unknown as string`、`'' as unknown as (...args) => unknown`），
  随上面那条一起待决策。

## 第 78 轮（续轮）：`unknown-casts` 209 → 202 —— `tree-api.ts` 7 → **0**，以及「接口 → 索引签名」无解的那一处

### 6 处单次断言化（纯类型层）

1. **`treeData` 直接复用既有 helper**：

    ```ts
    // 前：getElementData(el as HTMLElement) as unknown as TreeListElementData
    const treeData = (el: unknown): TreeListElementData => elementDataOf<TreeListElementData>(el);
    ```

    依据不是猜的：`utils/element-data.ts:42-44` 里 `elementDataOf<T>` 的实现**就是**
    `getElementData(el as HTMLElement) as T` —— 同一个调用、同一个单次断言，所以是**可证等价**。
    顺带删掉因此变成未使用的 `getElementData` 导入（lint 又抓到一次，与第 77 轮同一套路）。

2. `dItem = data as unknown as TreeItem` → `data as TreeItem[] & TreeItem`：
   代码上方的注释早就写着「**根"节点"就是 `data` 数组本身**」，所以诚实形状是交叉类型；
   单次断言合法，因为交叉的一支与源类型一致。
3. 4× `response as unknown as { … }` → `response as { type: string; … }`（见下）。

### 第一次尝试失败，而**失败信息本身就是一条规则**

4 处只把 `unknown as` 拿掉、原样保留字段集时，编译报：

```txt
Type '{ [k: string]: unknown; type: string; }' is missing the following properties
from type '{ item: TreeItem; oldValue: string; newValue: string; }': item, oldValue, newValue
```

原因是**源类型带索引签名**时，断言要「两个方向之一可比」：目标 → 源这一向要求目标里也有 `type`
（源把它声明成 required）。**把判别字段 `type: string` 写进目标类型**，单次断言立刻合法。

> 规则：**从 `{ [k: string]: unknown }` 形状的载荷断言到具体字段集时，目标里必须带上判别字段。**

### 最后一处：`unknown` 在这里**不是懒，是 TS 不允许单次断言**

```ts
const prototypeSink = list as unknown as Record<string, unknown>; // TreeListHost 是 interface
```

`TreeListHost` 是 **interface ⇒ 没有隐式索引签名**，而目标是指向索引签名的类型。
TS 对这种转换**没有合法的单次写法**（`Record<string, unknown>`、`Pick<…>` 都一样会报
`Index signature for type 'string' is missing`）。两条路：

- 留着 `as unknown as` ⇒ **P4 永远到不了 0**；
- **换写法**：`Reflect.set(list, name, Reflect.get(treeListPrototype, name))` ——
  与 `sink[name] = value` 走的是同一个 `[[Set]]`（`Reflect.get` 同 `[[Get]]`），
  **语义逐条相同，且一个断言都不需要**。本轮采用后者。

> 记一条路线级结论：**「接口 → 索引签名」的转换没有单次断言的合法写法**，
> P4 归零的路上这类站点只能逐个换写法（`Reflect.*` / `Object.assign` / 或显式声明索引签名）。
> 目前这类站点很少（本轮 1 处），但**到 0 之前必须逐个处理**，不能靠「反正只剩几处」放着。

### 本轮唯一的运行期改动（可证等价）＋ 它落在哪条回归项上

上面那条 `Reflect.set` 是本轮**唯一**不是纯类型层的改动。它落在 `createTreeListApi()` 里 ——
**左侧列表的装配入口**，因此实机回归清单第 4 项（左侧列表：快捷键 / 改名 / 拖拽 / 翻页）
会直接覆盖它。已在提交信息里单独标出。

### 验证（本轮）

- `unknown-casts` **209 → 202 处（−7：类型层 6 处 + 运行期换写法那 1 处）**，
  且 `files` **118 → 117** ⇒ `tree-api.ts` 已从清单里消失
  （该文件 `as unknown as` 计数为 **0**，只剩历史注释里提到过它）
- `tsc` 0 · `build:types`(ui-kit vue-tsc) 0 · `lint` 0 warnings 0 errors · `migration:selftest` 38/38
- ui-kit **115 文件 / 811 通过**（含 `tree-core.spec.ts` 15 项）
- editor **252 文件 / 2056 通过（exit 0，本轮没有出现那个 flake）**

## 第 77 轮（续轮）：`unknown-casts` 214 → 209 —— **契约写错了，不是类型系统看不懂**

第 75/76 轮的规律是「声明**写松了**，读点各自打补丁」。这一轮的五个站点（`command-api.ts` 4 ·
`tree-api.ts` 1，全都是 `commonList*` 共享助手）恰恰相反 —— **是契约本身写偏了**，而且三种偏法各占一种：

| 偏法       | 事实                                                                                                                  | 后果                                                                                   |
| ---------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 写**紧**了 | `CommonListLike.textContent: string`，而助手只**写不读**它（`commonListResize` 里 `el.textContent = ''`）             | DOM 侧是 `string \| null`，两边「不可比」⇒ 每个调用点 `as unknown as`                  |
| 写**宽**了 | `commonListUpdateHeadAndFoot(list: CommonListLike)`，可它只读 `list.elements` 的窗口游标，**从不调 `updateOnResize`** | 树列表宿主**真的没有**这个能力 ⇒ 契约在索要一个用不到的能力 ⇒ 调用方只能绕道 `unknown` |
| **漏**写了 | `CommandListHost` 没声明 `updateOnResize`（原型上有，接口里没有）；`TreeListHost` 连 `elements` 都没声明              | 宿主「缺零件」⇒ 与助手契约不可比                                                       |

### 改法（4 个文件，全部是类型层）

```ts
// utils/common-list.ts
textContent: string | null;                       // 写紧了 → 改回 DOM 的原生类型（助手只写不读）

export type HeadAndFootListLike = Pick<CommonListLike, 'elements'>;   // 写宽了 → 窄契约
export const commonListUpdateHeadAndFoot = (list: HeadAndFootListLike): void => { … };

// command-api.ts：CommandListHost 补上原型真实提供的能力
updateOnResize(element: HTMLElement): void;

// tree-api.ts：TreeListHost 补上 elements，形状直接复用，不另抄一份
elements: CommonListLike['elements'];
```

### 结果比预期好：5 处**断言彻底消失**，而不是「降级成单次断言」

```ts
commonListClearElements(this, elements.count); // 原来是 this as unknown as CommonListLike
commonListUpdateHeadAndFoot(this); // 原来两处都是 as unknown as
```

宿主契约补齐后 `this` 与 `CommonListLike` **真的可赋值**了 ⇒ 一个断言都不需要。
**这是本轮最值得记的一条：把契约修对，逃逸口会自己消失；只把 `unknown` 拿掉，逃逸口还在。**

### 迭代方式：一次只修一个原因，让编译器点名下一个

1. 先只 relax `textContent` → 报错立刻从「`textContent` 冲突」变成
   `Property 'updateOnResize' is missing in type 'CommandListHost'`；
2. 再补 `CommandListHost.updateOnResize` → `command-api.ts` 四处全绿，**只剩** `tree-api.ts:585`，
   且报错点名 `missing: updateOnResize, elements` —— 两个原因一次说清；
3. 于是分开处理：`updateOnResize` 是**契约写宽了**（收窄助手参数），`elements` 是**漏写了**（补声明）。

**每一步都只依据编译器的下一条报错，不猜。** 这比「一次性想清楚所有冲突」快得多，
也不会把「其实不需要的能力」硬声明进宿主契约（那等于用谎话消灭 `unknown`）。

### 一条被门禁抓到的收尾（说明 lint 门禁真的在干活）

`commonListClearElements(this as CommonListLike, …)` 变成 `commonListClearElements(this, …)` 之后，
`type CommonListLike` 这个**类型导入**在本文件里不再被引用，oxlint 报：

```txt
Found 1 warning and 0 errors.   help: Consider removing this import.
```

（warning 也会让 `pnpm run lint` 非零退出 —— 这正是我们要的行为。）已删掉该导入。

### 验证（本轮）

- `unknown-casts` **214 → 209 处（−5）**，且这 5 处的断言是**归零**而非降级
- `tsc` 0 · `build:types`(ui-kit vue-tsc) 0 · `lint` 0 warnings 0 errors
- `migration:selftest` 38/38 · `migration:check` 下降、基线已更新
- ui-kit **115 文件 / 811 通过** · editor **252 文件 / 2056 通过**，但**又命中一次**那个已知 flake
  （`EnvironmentTeardownError`，`ui-state.spec.ts` → `tools/window-cluster.ts`），exit 1 ——
  本轮会话里这条命令的实测分布是 **3 次 exit 1 / 2 次 exit 0**，间歇性已经不用再怀疑；
  它仍是待用户决策项（治 / 不治 / 从门禁里摘出来单独跑）。
- **运行时代码零改动**：4 个文件里改的全是类型（接口成员、参数类型、类型别名）

## 第 76 轮（续轮）：`unknown-casts` 226 → 214 —— 两批 −12：`eslints.ts` 12 → 3、`YMFileBrowser.vue` 5 → 2

### 批次 1 `module/eslints.ts`（−9）：还是「病灶在声明」——**3 个声明喂出 9 个读点**

这个文件是**猴子补丁模块**（给 `CommandList` 的运行期扩展打补丁）。它的类型不是「错的」，
而是**写松了**，于是每个读点各自拿 `as unknown as` 把松掉的那半截补回来：

| 声明（改前）                                                              | 挨着的读点      | 改后                                                                                           |
| ------------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------- |
| `CommandItemElement.lines: HTMLElement[]`                                 | 80 / 97         | `lines: (HTMLElement & { mark?: string })[]` ⇒ `needNode.mark !== 'header'`                    |
| `CommandListShape[i].mark?: unknown`                                      | 197 / 319 / 327 | `mark?: string` ⇒ `e.mark!` 与普通读取                                                         |
| `on(…, 'update', function (this: { elements: { dataIndent: number }[] })` | 303 / 323       | `this: { elements: CommandListShape } & HTMLElement` ⇒ `this.elements`、`renderedRowsOf(this)` |
| `rendered[i] as unknown as { classList: DOMTokenList }`（**两处同形**）   | 196 / 326       | 元素类型本来就 `extends YamiElement`（自带 `classList`）⇒ 直接读                               |

改 `this` 注解**不是猜的**：同一文件里 `resize(this: { elements: CommandListShape } & HTMLElement, …)`
早就是同一形状，而且它内部就调 `renderedRowsOf(this)` —— **既有先例可直接照抄**，
这是「同文件内部的形状一致性」比外部文档更可信的一个例子。

### ⚠️ 一个差点改出 bug 的地方（`?.` 会**反转**分支，不只是简写）

```ts
// 改前（两处）：
if (needNode && (needNode as unknown as { mark?: string }).mark !== 'header') { … }
// 「顺手简化」的写法 —— 错的：
if (needNode?.mark !== 'header') { … }
```

`needNode` 为空时，后者求值为 `undefined !== 'header'` ⇒ **`true`**，于是原来的「跳过」
变成了「继续执行下一行的 `needNode.classList.add('hover')`」⇒ 空指针。
**本轮保留了 `needNode &&` 这半截**：`&&` 与 `?.` 混用时，`?.` 只在**比较**里等于「undefined 参与比较」，
不等于「整体跳过」。这类改写没有类型错误、也没有 lint 提示，只能靠人看出来。

### 批次 2 `YMFileBrowser.vue`（−3）：同形 3 处 → 抽一个小工具

```ts
const fileElementOf = (element: HTMLElement): { path: string } | null => {
	const file = (element as { file?: unknown }).file;
	return file instanceof FolderItem ? (file as { path: string }) : null;
};
```

3 个读点（行 530 / 532 / 677）改为 `fileElementOf(element)` —— 断言从 3 处收到 1 处。
**调用点特意保留 `!`**（`fileElementOf(element)!.path`）：外层 `instanceof FolderItem` 已经保证非空，
用 `?.path ?? null` 会把「不变量被破坏就该抛」悄悄改成「静默地没有 dropPath」。
**行为等价优先于写法漂亮** —— 这条在 P5/P6 高危区尤其要守。

### 验证（本轮）

- `unknown-casts` **226 → 214 处（−12）**，与两批清单（9 + 3）逐一对上；`any-hatches` 52 持平
- `tsc` 0 · `build:types`(ui-kit vue-tsc) 0 · `lint` 0 warnings 0 errors
- `typecheck:vue` 0 新增 · `migration:selftest` 38/38 · `migration:check` 下降、基线已更新
- ui-kit **115 文件 / 811 通过**
- editor **252 文件 / 2056 通过（最终代码上 exit 0）**
- 但同一批改动的**中途**一次运行又命中了那个已知 flake（`EnvironmentTeardownError`，源自
  `src/stores/__tests__/ui-state.spec.ts` → `tools/window-cluster.ts`），exit 1 ——
  **同一批代码、同一条命令，一次 1 一次 0**，再次确认它是间歇性的、与本轮改动无关。

### 剩余

- `eslints.ts` 3 处（行 62/63 的 `this.elements ?? CommandList.prototype.elements`、175 的
  `Object.assign(Array.from(rendered), …)`）：这两处是**真实的结构谎言** ——
  运行期把 `elements` 与「带 count/findIndex 的数组」互相冒充。要消掉得先动
  `CommandListShape` 的**定义**（例如 `CommandItemElement[] & { count: number; findIndex(…): number }`），
  属于「改类型设计」而不是「搬断言」，**需要单独一轮并单独验证**，不在本轮硬做。
- `YMFileBrowser.vue` 剩 2 处：`headEl.value as unknown as FileHeadApi`（1）·
  `getActivePage(event) as unknown as { … }`（1）。

## 第 75 轮（续轮）：`unknown-casts` 234 → 226 —— **修声明，而不是修 8 个读点**（`YMFileBrowser.vue` 13 → 5）

第 74 轮结尾建议「挑一个文件内 ≥5 处同形」。按这个口径打开 `YMFileBrowser.vue`（13 处，全仓第一）
后，发现它根本不是 13 个独立问题 —— 其中 **8 处是同一个根因**：

```ts
let dragging: DragEvent | PointerEvent | null = null;   // ← 根因在这一行
...
const d = dragging as unknown as DragState;             // ×5
const { dropTarget, page } = dragging as unknown as DragState;  // ×2
if ((dragging as unknown as DragState).dragLeaved) { ... }      // ×1
```

### 根因：这个变量装的是「事件 ∩ 状态」，声明只写了一半

`dragstart` / `osDragstart` 把 `dropPath`/`dropTarget`/`mode`/`page` 等字段**直接写在触发它的那个
DOM 事件对象上**，之后又从同一个变量读回来。所以运行时对象的形状是 `事件 & 状态`，
而声明只写了 `DragEvent | PointerEvent` —— 差的这半截，就是那 8 个 `as unknown as`。

**改法（一行声明 + 两个赋值点）**：

```ts
type Dragging = (DragEvent | PointerEvent) & DragState;
let dragging: Dragging | null = null;
...
dragging = event as Dragging;   // 2 处（dragstart / osDragstart）
```

8 个读点随即变成普通读取：`const d = dragging;` / `if (dragging.dragLeaved)` / `const { dropTarget } = dragging;`。
**这 8 处不是「换成单次断言」，而是断言彻底消失。**

### 为什么台账减 8 是**合法的**（而不是把 `unknown` 藏起来）

新写法只在**赋值处**留了 **1 次单断言**（`event as Dragging`，×2 处），
`unknown as` 一次不剩：

- `as unknown as T` 的含义是「我跳过整张类型表，随便你说」；
- `event as Dragging` 的含义是「事件与 `DragState` 有可比性，我断言交叉部分成立」 ——
  TS 会**检查可比性**，写错形状会 TS2352。

**这是本轮想记下来的通用手法：当 N 个读点都在给同一个形状打补丁时，病灶在声明，
不在读点。** 先数同形站点，再去找它们的公共父节点（这里是变量声明），
往往能让台账掉得比「逐个读点替换」更多。

### 顺带清掉的两处**冗余单断言**

`switch ((dragging as DragState | null)?.mode)` → `switch (dragging?.mode)`；
`!(d as DragState).target!.contains(element)` → `!d.target!.contains(element)`。
（单断言不进台账，但它们在声明修好之后已无意义。）

### 如实记账：这个「谎」只是**收敛**，没有被消除

`Dragging` 仍然声称「事件对象上有 `dropPath`/`dropTarget`」——
这与原来 8 个断言声称的是同一件事，只是从 8 处收敛到 1 处。
**运行时该是 undefined 还是 undefined**，本轮**没有**去核对「先设后读」的实际顺序。
⇒ 与第 74 轮 `scene-window.ts` 的 `any` 一样，属于「形状更集中、但承重事实未验证」。

### 又一次「检查面自证」：ui-kit 的 `.vue` **不在任何门禁里**

改动落在一个 `.vue` 文件、而这个包**没有 `typecheck` 脚本**，`pnpm -F @yami/ui-kit build:types`
（`vue-tsc --emitDeclarationOnly`）看起来是唯一会检查它的命令 —— 但「看起来」不算证据，
所以照第 39 轮的规矩做了**探针**：在文件里塞一行 `const __probe_type_surface: number = 'x';`，
`build:types` 立刻报

```txt
src/components/business/YMFileBrowser/YMFileBrowser.vue(227,7): error TS2322: Type 'string' is not assignable to type 'number'.
```

⇒ **检查面确认覆盖该文件**（探针已删，复跑 `build:types` exit 0）。

**但由此暴露一个门禁缺口（记入待用户决策）**：editor 的 `typecheck:vue` **不覆盖 ui-kit 的 `.vue`**，
而 `build:types` **不在 CI 门禁清单里** ⇒ 本轮这类改动目前**只靠人工跑 `build:types` 把关**。
建议把 `-F @yami/ui-kit build:types` 加进门禁（它与 `typecheck:vue` 同类，都是「tsc 对 .vue 假绿」的解药）。

### 剩余（本文件 5 处，另一批）

`headEl.value as unknown as FileHeadApi`（1）· `getActivePage(event) as unknown as {…}`（1）·
`(element as unknown as { file: { path: string } }).file.path`（**3 处同形**，行 530/532/677）。
第 3 组值得照本轮手法再来一次：同一个文件里紧挨着就有
`(element as { file?: unknown }).file instanceof FolderItem` 的**真实收窄**，
⇒ 抽一个 `fileElementOf(el)` 小函数把单次断言收在里面，3 处读点全部变成 `fileElementOf(element)?.path`。

### 验证（本轮）

- `unknown-casts` **234 → 226 处**（−8，与 8 个读点逐一对上；`YMFileBrowser.vue` 由 13 降到 5）
- **运行时代码零改动**：本轮所有编辑都是类型层（断言/声明），不留任何执行语句差异
- `tsc` 0 · `build:types`(ui-kit, vue-tsc) 0 · `lint` 0 warnings 0 errors · `migration:selftest` 38/38
- ui-kit **115 文件 / 811 通过** · editor **252 文件 / 2056 通过（exit 0，本轮没有出现那个 flake）**

## 第 74 轮（续轮）：`unknown-casts` 242 → 234 —— **形状 B（类型跨行）8 处清零**，预测与实测逐一对上

第 73 轮结尾预言的「剩余形状 B —— 类型跨行的 8 处」本轮全部拿下，**一处不多、一处不少**：
`command-custom.ts` 1（`windowFrame`）· `file-event-page.ts` 2 · `SetNumberOperand.vue` 2 ·
`scene-window.ts` 1 · `particle-window.ts` 1 · `sprite.ts` 1 · `Reference.vue` 1。

台账 `unknown-casts` **242 → 234（−8）**，`files` 121 → 118 —— **减量与清单完全一致**，
说明第 73 轮那次人工清点是准的（这类「先点名再动手」的清单值得每轮做一次）。

### 形态 B 的搬运手法（与形状 A 不同的两点）

形状 A（类型单行）可以用「先改成调用、再替换类型」的办法；形状 B 的类型**从 `as unknown as`
那一行开始跨行**，只能整块搬。实际操作顺序固定为三步，避免第 72 轮那种「找结尾」的朴素循环：

1. 先在目标位置写好 `registryElement<` + 换行 + 原类型逐字照抄（含注释）+ `>(registry, 'id')`；
2. 再删掉旧的 `x.get(id) as unknown as …` 整块；
3. 最后按 `tsc` 报错决定要不要补 `!` —— **不预先猜**。

### `!` 的分布：4 处要，4 处不要 —— 把第 73 轮的规则补完整

本轮 8 处的旧类型里**没有一处写过 `| null`**，但只有一半需要 `!`：

| 站点                      | 要 `!` 吗 | 原因                                                |
| ------------------------- | --------- | --------------------------------------------------- |
| `command-custom.ts`       | ✅        | `windowFrame` 本身声明为可选（`command-object.ts`） |
| `scene-window.ts`         | ✅        | `SceneShape.list` 非空                              |
| `particle-window.ts`      | ✅        | `ParticleShape.head` 非空                           |
| `sprite.ts`               | ✅        | `SpriteShape.canvas` 非空                           |
| `file-event-page.ts` ×2   | ❌        | 下游本来就是 `?.(…)` 可选调用                       |
| `SetNumberOperand.vue` ×2 | ❌        | 下游本来就是 `if (control && typeof …)`             |
| `Reference.vue`           | ❌        | 下游本来就是 `if (!list) return;`                   |

⇒ 第 73 轮那条规则应当写成：**旧断言没写 `| null` 时，非空假设必须显式化 —— 要么补 `!`，
要么下游本来就有真正的空值检查。** 本轮正好 4 + 4 = 8，没有第三种情况。

### 一个「顺手改顺眼」反而弄红 `tsc` 的坑（值得记）

`command-custom.ts` 的第一次落地不是写 `!`，而是写 `?? undefined`（因为 `windowFrame?` 是可选的，
看起来很「诚实」）。结果 `tsc` 报：

```txt
src/commands/command-custom.ts(151,3): error TS2532: Object is possibly 'undefined'.
```

第 151 行是同一个方法里后面的 `this.windowFrame.addEventListener(…)`。原因是**赋值即收窄**：
旧代码 `this.windowFrame = … as unknown as T` 赋的是非空 `T`，TS 顺着赋值把 `this.windowFrame`
收窄成非空；换成 `?? undefined` 后收窄结果也带上了 `undefined`，于是下游立刻报错。

**结论**：`!` 在这里不只是「省事」，它同时保住了 ① 收窄结果 ② 运行时值（`!` 是纯类型操作，
运行时仍是 `registry.get()` 的原值；`?? undefined` 会把 `null` 变成 `undefined`）。
本轮已改回 `!` 并就近写了理由，**不引入任何运行时差异**。

### `scene-window.ts`：`any` 只搬了家，没被清掉（如实记账）

```ts
this.list = registryElement<
	// oxlint-disable-next-line no-explicit-any
	HTMLElement & SceneListExtensions & { [k: string]: any }
>(sceneEls, 'scene-list')!;
```

`{ [k: string]: any }` 从断言里搬进了尖括号 —— `unknown-casts` 减 1，但
**`any-hatches` 一处都没减（52 持平）**。那条 `oxlint-disable-next-line` 也必须跟着搬进去，
**实测 `oxfmt` 没有把它和 `any` 拆开**（`lint` 0-0 可证）。这一处仍计入 P3 的欠账。

### 验证（本轮）

- `unknown-casts` **242 → 234 处**（计入台账 −8，与清单 8 处逐一对上）；`any-hatches` 52 持平
- `tsc` 0（首次 1 处 `TS2532`，见上）· `lint` 0 warnings 0 errors · `typecheck:vue` 0 新增
- `migration:selftest` **38/38** · `migration:check` ✓ 下降 · 基线已 `--update-baseline`
- `build:vite` 未跑（本轮无构建面改动）· ui-kit **115 文件 / 811 通过**
- editor **252 文件 / 2056 通过**，但**照旧**带 1 个已知 flake：
  `EnvironmentTeardownError`（源自 `src/stores/__tests__/ui-state.spec.ts` → `tools/window-cluster.ts`），
  exit code 1。**与本轮改动无关，第 66 轮起就在**；这条仍挂在待用户决策项里。

### 形状 B 之后的剩余面（`unknown-casts` 234）

最大的三块已经从「散点」变成「文件内的成组形态」，分别是
`YMFileBrowser.vue` 13 · `module/eslints.ts` 12 · `command-api.ts` 9 · `tree-api.ts` 8 …
下一轮宜先挑一个**单一文件内 ≥5 处同形**的（`eslints.ts` 12 处或 `YMFileBrowser.vue` 13 处），
理由同第 73 轮：同形批量处理时「手法可复用」的判断成本只付一次。

## 第 73 轮（续轮）：`unknown-casts` 250 → 242 —— 多行 `.get(` 形态 9 处

### 形状 A：调用本身跨行，类型单行

```ts
CustomCommand.overview = customCommandEls.get(
	'command-overview'
) as unknown as CustomCommandShape['overview'];
```

→ `registryElement<CustomCommandShape['overview']>(customCommandEls, 'command-overview')`

一次改掉 **9 处**（`custom-command-window.ts` 3 · `command-custom.ts` 2 · `command-tip.ts` 2 ·
`event-editor-initialize.ts` 1 · `branch-registry.spec.ts` 1[不计台账]）。

### 又一批「谎言浮出水面」：4 处必须补 `!`

`custom-command-window.ts` 2 · `event-editor-initialize.ts` 1 · `command-tip.ts` 2
（另有 1 处**下游**使用因收窄而报 `'box' is possibly 'null'`）。
这些站点的旧写法把「元素一定在」与「类型是 T」捆在一个 `as unknown as` 里；
拆开之后，**非空假设必须显式写出来**。

累计至今：**单行 13 处里 11 处要 `!`；带 `| null` 的 13 处里 0 处要 `!`；
本批 9 处里 4 处要 `!`。** 三个数字合起来说明一件事 ——
**`!` 的多少完全取决于旧代码有没有把 `| null` 写出来，而不是取决于改动方式。**

### 新增一条 helper 用法规则（实测撞出来的）

**不要把 `| null` 写进尖括号里。** `registryElement<BoundList | null>(…)` 会报 `TS2344`
（`null` 不满足 `T extends object`）；而旧写法 `as unknown as BoundList | null` 里那个 `| null`
是**必须**写的（要自己补上 `Map.get` 的 `undefined`）。⇒ 搬迁时**顺手删掉**即可，语义一致。
这条已写进 `element-registry.ts` 的 JSDoc。

### 验证（本轮）

- `unknown-casts` **250 → 242 处**（计入台账 −8，另 1 处在 spec 内）
- `tsc` 0 · `lint` 0-0 · `typecheck:vue` 0 新增 · `migration:selftest` 38/38
- editor 252 文件 / 2056 通过（exit 0，无 flake）；ui-kit 811 通过

### 剩余：形状 B —— 类型跨行的 8 处

`command-custom.ts` 1（`windowFrame`）· `file-event-page.ts` 2 · `SetNumberOperand.vue` 2 ·
`scene-window.ts` 1 · `particle-window.ts` 1 · `sprite.ts` 1 · `Reference.vue` 1。
这 8 处的类型**从 `as unknown as` 那一行开始跨行**（`HTMLElement & { … }` 多行书写），
需要把整块类型搬进 `<>` 并找到类型的结束位置 —— **人工活，不再交给正则**
（第 72 轮已经证明「找结尾的朴素循环」会截断含 `)` 的类型）。

## 第 72 轮（续轮）：`unknown-casts` 263 → 250 —— `| (T) | null` 家族 13 处，**零 `!`**

### 这一族为什么最便宜

`Registry.get` 返回 `| undefined`，所以旧代码在**该诚实的地方**不得不写出 `| null`：

```ts
X.get('id') as unknown as (HTMLElement & { form?: TextForm }) | null;
```

而这个形状与 `registryElement<T>()` 的 **`T | null` 完全对齐** ⇒ 改完**一个 `!` 都不用加**：

```ts
registryElement<HTMLElement & { form?: TextForm }>(inspectorEls, 'uiText-vue-mount');
```

本轮一次改掉 **13 处 / 10 个文件**（`inspector/` 的 6 个 `*-vue-mount` 页、`useIfConditionSchema` 2、
`useNumberOperandSchema` 2、`useSetStringCommandSchema` 1、`useVariableGetterWindow` 1、
`scene-animation-page.ts` 1）。其中 `useVariableGetterWindow.ts:486` 的类型里还嵌着两级对象
（`selectBox?: HTMLElement & { … }`），跨行照原样压成单行后依然通过 —— 因为 `<>` 里放的是**类型**，
换行与缩进不影响语义。

> 与第 71 轮那 13 处对照：那一批是**单行**站点，11/13 必须补 `!`；
> 这一批是**多行且带 `| null`** 的站点，0/13 需要 `!`。
> **`!` 的数量不是风格差异，而是旧代码「有没有承认可能为空」的直接读数。**

### ⚠️ 同一族里又踩了两次「仪器不精确」（第 5、6 次）

| 轮次     | 仪器                                            | 错在哪                                                                                                                                               |
| -------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 第 70 轮 | 行式 `grep 'Els\.get\([^)]*\)\s*as unknown as'` | **ripgrep 按行匹配，`\s*` 跨不了行** ⇒ `.get('x')` 与 `as unknown as` 分行写的站点**全部漏掉**。所以「56 处」是**低估**                              |
| 第 72 轮 | 自写的分类脚本                                  | 用「往下找第一个以 `;` 或 `)` 结尾的行」来判定类型块结尾 ⇒ 类型里**含 `)`** 的（如 `{ setForm?: (data: X) => void }`）**当场截断**，于是把绝大多数 ` | null`站点误判成「不以` | null` 结尾」 |

**两次都指向同一条**：**多行形态不能用行式工具，也不能用「找结尾」的朴素循环去量。**
本轮最后改用**跨行正则**（`\.get\(([^)]*)\)\s*as unknown as`，`\s` 显式跨行）才拿到准数：

```
全部站点       31 处
  其中 spec 内 14 处（不计入台账）
  计入台账     17 处，分布在 10 个文件
```

⇒ 加上本轮已改的 13 处与前面各轮，这个形态的真实总量在 **60+**，比第 70 轮报的 56 更大。
**「打印命中集合、并用已知会命中的样例反证」这条（第 69 轮定下）在这里第二次救了场** ——
这次是靠「打印每个文件的计数」看出 `inspector/` 明明有 6 个 `vue-mount` 却只报 1 处。

### 验证（本轮）

- `unknown-casts` **263 → 250 处 / 129 → 121 文件**；`any-hatches` 52 未动
- `tsc` 0 · `lint` 0-0 · `typecheck:vue` 0 新增 · `migration:selftest` 38/38
- editor 252 文件 / 2056 通过（exit 0，本轮无 flake）；ui-kit 811 通过
- 语义不变：旧写法本来就写了 `| null`，新的 `T | null` 语义一致

### 剩余（下一轮）

**计入台账的 17 处**，按文件：`command-custom.ts` 3 · `custom-command-window.ts` 3 ·
`file-event-page.ts` 2 · `SetNumberOperand.vue` 2 · `command-tip.ts` 2 · `scene-window.ts` 1 ·
`particle-window.ts` 1 · `sprite.ts` 1 · `Reference.vue` 1 · `event-editor-initialize.ts` 1。
另有 **14 处在 spec 内**（不影响台账，可顺手改）。

## 第 71 轮（续轮）：`unknown-casts` 279 → 266 —— 注册表形态第一批 13 处（单行站点）

承接第 70 轮定型的 `registryElement<T>()`，本轮把**单行形态**的 13 处一次改完
（7 个文件：`variable.ts` · `text-tip.ts` · `transition-window.ts` ×2 · `image-crop-window.ts` ×2 ·
`title-bar.ts` · `useCurveWindow.ts` ×2 · `useIfConditionSchema.ts` ×2 · `useTileNodeWindow.ts` ×2）。

### 顺带修掉 helper 的一个过窄约束（实测撞出来的）

第 70 轮把 `T` 约束成 `extends HTMLElement`。本轮 `text-tip.ts` 立刻报
**TS2344**：`TextSuggestionList does not satisfy the constraint 'HTMLElement'` ——
因为注册表里虽然存的是元素，但**调用方要的形状不一定是元素**：
`TextSuggestionList extends Partial<TreeListRowApi<…>>` 是个**方法包**，
`CurveList` 同理。⇒ 约束放宽到 `extends object`（仍能挡住
`registryElement<number>(…)` 这类明显误用）。**这条只有真改一遍才会暴露**，
与第 65/69 轮那两次「数字看起来合理所以没怀疑」正好相反：这次是**编译期**替我把关。

### 一个如实的数据：13 处里有 **11 处**必须补 `!`

说明这 11 个站点的旧写法 `as unknown as T` **同时在两个维度撒谎**：类型不对 **且** 谎称非空。
现在类型由调用方指定、存在性交回类型系统，于是那 11 个 `!` 全部**浮到表面上**。
剩下 2 处（`transition-window.ts` 的 `Easing.curve` / `Easing.preview`）目标本来就是可空，
所以**一个 `!` 都不用加** —— 这也反过来印证了返回可空是**如实**的。

### 做法（可复核）

用一个只处理**单行**形态的 codemod（`X.get('id') as unknown as T`，类型段禁止跨行、
禁止吃到 `)` / `;`），**逐站点打印改了什么**（本仓规矩：只报计数的批量脚本不可信）。
多行站点（类型跨行，约 30 处）**故意不交给正则** —— 需要把类型搬进 `<>`
并找到类型的结束位置，属人工活，留下一轮。

新增 import 的处理也自动化了：已有 `@app/utils/element-registry` 的并入该行，
否则插在最后一条 import 之后（7 个文件全部核对过）。

### 多行形态也拿下 3 处（同轮第二批）

多行站点里有一类**极整齐**的形状 —— 因为 `Registry.get` 返回 `| undefined`，旧代码不得不把
`| null` 写出来：

```ts
const setForm = (
	sceneEls.get('scene-shift') as unknown as
		(HTMLElement & { setForm?: (data: Partial<SceneShiftForm>) => void }) | null
)?.setForm;
```

⇒ 这个 `| (T) | null` 与 `registryElement<T>()` 的 `T | null` **完全对齐**，
所以改完**一个 `!` 都不用加**：

```ts
const setForm = registryElement<
	HTMLElement & { setForm?: (data: Partial<SceneShiftForm>) => void }
>(sceneEls, 'scene-shift')?.setForm;
```

已改 3 处：`scene/move-scene.ts`（1）· `local/export-language-window.ts`（2）。
**这是「多行形态」里最好啃的一类**，下一轮优先按这个形状筛（同样的 `| (T) | null` 结尾）。

### 验证（本轮）

- `unknown-casts` **279 → 279 − 13 − 3 = 263 处 / 135 → 129 文件**；`any-hatches` 52 未动
- `tsc` 0 · `lint` 0-0 · `typecheck:vue` 0 新增 · `migration:selftest` 38/38
- editor 252 文件 / 2056 通过（exit 0）；ui-kit 811 通过
- 语义不变：旧写法在元素未登记时同样抛错，新增的 `!` 行为一致

### 剩余（下一轮直接接）

**多行形态约 30 处**，集中在：`YMFileBrowser.vue` 13 · `eslints.ts` 12 · `command-api.ts` 9 ·
`tree-api.ts` 8 · `command-custom.ts` 7 · `custom-command-window.ts` 7 · `layout.ts` 6 ·
`tile-frame-index.ts` 6 · `printer.ts` 6 · `scene-window.ts` 6 · `particle-window.ts` 5 ·
`element-base.ts` 2 …（含 `SetNumberOperand.vue` 与 `branch-registry.spec.ts` 的
`as unknown as unknown as` 双写形态）。其中 spec 里的 9 处不影响台账。

## 第 70 轮（续轮）：`unknown-casts` 285 → 279 —— 开始 P4，找到最大的**单一形态**（56 处）

第 69 轮更正了「哪些字段真有类型」的真相后，`Scene*` 剩余几处都归入「先动核」。
本轮转向**此前一直没碰过的 P4**（`unknown-casts` 285 处 / 135 文件），先找有没有**可复用的形态**。

### 找到的形态：注册表查找 `xxxEls.get(id) as unknown as T`（56 处）

`grep 'Els\.get\([^)]*\)\s*as unknown as'` 实测 **56 处**，是 285 里最大的一块单一形态。
根因是**注册表的类型故意宽**：`ElementRegistry = Map<string, YamiElement | null>` ——
登记时（`registryRef`）只知道「这是来自本仓模板 ref 的元素」，
静态上**无法表达**「这个 id 是 canvas、那个 id 是 marquee」（id 是字符串，由模板里的
`:ref="registryRef(reg, 'x')"` 决定）。

⇒ 收窄是**必要的**。问题从来不是「要不要断言」，而是**断言散落 56 处、各自没有理由**。

### 做法：把收窄集中到 `registryElement<T>()` 一处

```ts
export const registryElement = <T extends HTMLElement>(
	registry: ElementRegistry,
	id: string
): T | null => (registry.get(id) as T | null) ?? null;
```

- 调用方从 `colorEls.get('color-palette-canvas') as unknown as HTMLCanvasElement`
  改成 `registryElement<HTMLCanvasElement>(colorEls, 'color-palette-canvas')!`；
- **返回值故意是可空的**：旧写法 `as unknown as T` 同时撒了两个谎（**类型不对** + **一定存在**），
  这里只保留「类型由调用方指定」这一个约定，**存在性交回类型系统**。
  于是调用方那个 `!` 是**可见**的，而 `as unknown as` 里的非空假设是**看不见**的。

> ### ⚠️ 别把这个读成「类型安全变好了」
>
> 类型系统在这条路径上**依然不受检**。本轮把**56 处各自为政的收窄**换成了
> **1 处具名、有文档、可审计的收窄**。台账上 `unknown-casts` 从 56 降到 1 是**如实**的，
> 但这 56 个用法**并没有变安全**。
>
> 收益是真实的但属于**可维护性**：① 想知道「谁在骗类型系统」只需看这一个函数；
> ② 将来若给注册表换成 id→类型 的映射表，只需改这一处；
> ③ review 时那 56 个站点不再是噪音。
>
> 这与第 69 轮记的「别把轴数字当作类型安全程度的读数」是同一条纪律。

### 本轮只做了 1 个文件（6 处），**剩余 50 处待做**

已迁移：`tools/color-picker-window.ts`（6 处，全是 `colorEls` 的 canvas 查找）。
**剩余 50 处**分布（按文件计数，供下一轮机械推进）：

`YMFileBrowser.vue` 13（含 6 个 `registryElement` 形态）· `eslints.ts` 12 · `command-api.ts` 9 ·
`tree-api.ts` 8 · `command-custom.ts` 7 · `custom-command-window.ts` 7 ·
`layout.ts` 6 · `tile-frame-index.ts` 6 · `printer.ts` 6 · …
其中**测试文件里的 9 处**（`*-registry.spec.ts` 等）不影响台账（`.spec.ts` 被 `EXCLUDE_RE` 排除），
可顺手改但**没有轴收益**。

### 验证（本轮）

- `unknown-casts` **285 → 279 处**（−6）；`any-hatches` 52 未动
- `tsc` 0 · `lint` 0-0 · `typecheck:vue` 0 新增 · `migration:selftest` 38/38
- editor 252 文件 / 2056 通过；ui-kit 811 通过
- 语义不变：旧写法在元素未登记时也是抛错，新的 `!` 行为一致

## 第 69 轮（续轮）：**自查并更正第 68 轮的两处过度声称** —— 一个关于「仪器自证」的收束

本轮没有推进任何轴。原计划是照第 68 轮的结论直接做 `scene-camera-engine`，
但动手前按第 68 轮自己写下的教训**做了一次「已知会命中的样例」反证**，
结果发现**第 68 轮的检查本身也错了**。先把错误的记录改对，比再多清一处更值钱。

### 一、两次错误叠加的完整链条

| 轮次     | 我写了什么                                              | 错在哪                                                                                                                 | 真相                                                                    |
| -------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 第 65 轮 | 「三个引擎读的字段在 `SceneShape` 里 **0 命中**声明」   | PowerShell 里 `'^\\\\t'` → node 收到 `^\\t` → 正则匹配「反斜杠 + t」，**永不命中**                                     | —                                                                       |
| 第 68 轮 | 「修好了：`edit` **21/22**、`camera` **29/32** 已声明」 | 检查面放大到**整个 `scene-window.ts`**，把 `export const Scene = { matrix: null, … }` 的**对象字面量键**当成了接口声明 | `SceneShape` 只有 **27 个成员**；`edit` 命中 **3**、`camera` 命中 **2** |

两次都产出了一个**看起来完全合理**的数字，所以都没触发怀疑 —— 第一次是「22 个全未声明」
（那个索引签名确实背着一大堆字段，很可信），第二次是「21/29 已声明」（也符合直觉）。

### 二、由此定下的一条硬规矩（写给后面的每一轮）

> **只报计数的脚本不可信；数字必须连同「数的是哪个区间」一起自证。**

具体两条动作，缺一不可：

1. **反证**：拿一个**已知会命中**的样例跑一遍（这里测 `marquee` —— 它确实在 `SceneShape` 接口里）。
   若不命中，脚本就是瞎的，不要读它的数字。
2. **打印命中集合本身**，而不只是计数。这里一打印就会看到 `matrix` / `scaledTileWidth`
   这些明显**不该出现在接口里**的名字 —— 区间错误当场暴露，根本不用等到下结论。

> 这与第 37 / 46 轮记的「探针撒谎」「只报计数的批量脚本不可信」是同一个病，
> 只是这次犯在了**测量脚本**上而不是**改写脚本**上。本仓的 `migration:selftest` 之所以存在，
> 就是为了把这类错误变成**可执行的断言**而不是纪律。

### 三、第 68 轮的代码改动**是否成立**？—— 成立，但价值要说准

`SceneEditEngine` 那次改动的**真实收益**（逐条可验证）：

1. **命名空间键集被关掉**：`SceneEditEngine.AnythignAtAll` 以前能编译，现在报错；
   `scene-edit.ts` 那 12 行镜像**拼错成员名会编译失败**。**这正是本轴的定义**
   （「泛型逃生口 = 任何成员名都能编译」），所以 `any-hatches` 53 → 52 **是正当的**。
2. `this.layer` / `this.tilemap` 两个**手动补的**字段是真类型。
3. 运行时 `import { Scene }` 消失（此前唯一用途就是 `typeof Scene` 注解）。

**它没有做到的**：其余 **17 个 `this` 字段仍是 `any`**（因为它们在 `SceneShape` 的
索引签名里，`Pick` 出来就是 `any`）。我上一轮写成「字段有类型了」，**是过度声称**。

### 四、新发现的**仪表盲区**（本轮只记录，不扩轴）

`Pick<SomeTypeWithIndexSignature, K>` 会让字段变成 `any`，但**文本上不出现 `any`** ——
所以 `any-hatches` / `unknown-casts` **两条轴都看不见它**。也就是说：

> **本轴可以因为「关掉键集」而下降，同时字段层面一个新类型都没加上。**

这不是说该轴没用（键集检查是真实收益），而是说**别把轴数字当作「类型安全程度」的读数**。
真正的读数需要另立口径（例如「`this` 上 `any` 字段数」），但**本轮不扩轴** ——
按本仓纪律，扩口径要先想清楚再记基线，不能顺手做。

### 五、正确的下一步（据更正后的真相重排）

- `scene-camera-engine.ts`：只有 `marquee` / `screen` 两个字段有真类型 ⇒ **不值得**照第 68 轮
  的配方做（那只会是又一次「关键集」）。要做就先**把这 30 个字段声明出来** —— 那才是真活。
- 真正便宜、且**有真实类型收益**的，是像第 63 轮 `scene-selection-engine.ts` 那样
  **手写窄接收者类型**（字段类型逐个由读点定），或先把字段补进 `SceneShape`。
- 因此`Scene*` 剩余三处（`camera` / `marquee`，`edit` 已做完但只关键集）
  应当归入**「先动核」**那一档，与 `DynamicShape` / `UIShape` / `DataModule` / particle 同批。

### 验证（本轮）

本轮**只改文档**（`PHASE-1C-TEST-PREREQ.md`），无源码改动；
`migration:selftest` 38/38、`migration:check` 14 轴持平（与上一轮相同的数字）。

## 第 68 轮（续轮）：`any-hatches` 53 → 52 —— 纠正第 65 轮的 grep 错误后，`SceneEditEngine` 一轮拿下

> ### ⚠️ 本轮有两处过度声称，已在第 69 轮更正（保留原文以便对照）
>
> 1. 本轮写「`edit` **21/22** 已声明、`camera` **29/32** 已声明 ⇒ `Pick` 拿到的是**真类型**」——
>    **数字与结论都错**。第二次的检查面误把 **`export const Scene` 对象字面量的键**
>    当成了接口声明；`SceneShape` 实际只有 **27 个成员**，`edit` 命中 **3 个**、`camera` **2 个**。
> 2. 因此「`edit` 与 `camera` 都便宜」「camera 下一轮直接做」**不成立**：
>    `Pick` 只关掉了**命名空间的键集**，字段类型**大部分仍是 `any`**。
>
> **本轮的代码改动本身仍然成立**（它正当且有益，理由见第 69 轮），
> 但**不要**据本轮的结论去推断「字段有类型了」或「camera 很便宜」。

### 先纠错：第 65 轮那句「0 命中」是我的 grep 写错了

第 65 轮我记「`edit`/`camera`/`marquee` 读的 22/32/24 个字段在 `SceneShape` 里一个都没有显式声明」，
并据此判定「`Pick<SceneShape, …>` 是假绿，不做」。**理由是错的**（详见证文里的勘误框）；
**结论「不宜据此宣称字段有类型」在方向上是对的**。

### 拿下 `scene-edit-engine.ts`（12 个成员）

```ts
type SceneEditThis = Pick<SceneShape, 'brush' | 'editInPencilMode' | … 21 个 …> & {
	layer: string;                                    // SceneShape 未声明
	tilemap: { width: number; height: number } | null; // SceneShape 声明为 unknown，就地收窄
};
export const SceneEditEngine: Partial<SceneEditEngineShape> = {};
```

配套（全部机械，`tsc` 一次全绿，**无任何预料之外的连带**）：

1. `SceneShape` 改为**导出**（`import type` 会被擦除，不引入循环依赖）；
2. 本文件 12 处 `this: typeof Scene` → `this: SceneEditThis`；
3. 3 个返回类型按实际签名修正（`createTiles` / `cloneTiles` → `TileBuffer`，
   `createTerrains` → `TerrainBuffer`）—— 这是 `tsc` 当场点出来的，`Record<string, any>` 之前一直盖着；
4. **`import { Scene }` 整个消失了**：本文件运行时用到 `Scene` 的**唯一**地方就是那些
   `typeof Scene` 注解，换成本地窄类型后运行时依赖随之归零。

> 顺带一条**不对称**，记下来免得下次困惑：`scene-animate.ts` 的 7 行镜像**需要补 `!`**
> （`Partial` 的必然结果），而 `scene-edit.ts` 的 12 行**不需要** —— 因为
> `SceneShape` **显式声明**了 `requestAnimation` / `requestRendering` 等（类型是 `(() => void) | null`，
> 收不下 `| undefined`），却没显式声明 `edit` / `setTile` 这些（由索引签名兜着，`any` 来者不拒）。
> ⇒ **`!` 的有无不是风格问题，是「该成员有没有被显式声明」的直接读数。**

### 剩下的 `Scene*` 命名空间，按同一判据分流

| 文件                                                                             | 字段已声明比例 | 结论                                                                                         |
| -------------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------- |
| `scene-edit-engine.ts`                                                           | 21/22          | ✅ 本轮拿下                                                                                  |
| `scene-camera-engine.ts`                                                         | **29/32**      | ⏭ **同样便宜**，下一轮直接做（只差 `layer` / `scaleX` / `scaleY`）                           |
| `scene-marquee-engine.ts`                                                        | 5/24           | ❌ 它的接收者是 `Scene.marquee`（`HTMLElement & { [k: string]: any }`），19 个字段要另找类型 |
| `scene-animate-engine.ts` / `scene-selection-engine.ts` / `scene-draw-engine.ts` | —              | ✅ 已拿下（本地窄类型 / 无 `this`）                                                          |

### 验证（本轮）

- `any-hatches` **53 → 52 处 / 27 → 26 文件**
- `tsc` 0 · `lint` 0-0 · `typecheck:vue` 0 新增 · `migration:selftest` 38/38
- editor 252 文件 / 2056 通过；ui-kit 811 通过
- 纯类型改动；**运行时依赖还少了一条**（`scene-edit-engine.ts` 不再 import `Scene`）

## 第 67 轮（续轮）：修掉一个**真 bug**（`FSP.existsSync`）+ 补上第 66 轮留下的**三处仪器盲区**

本轮由「按孤例判据找 `any-hatches` 便宜站点」开始，结果先挖出一个真实缺陷，
再被第 66 轮的纯移动**反咬了一口** —— 两件事都比一个轴数字值钱。

### 一、`Record<string, any>` 底下压着一个必崩的调用：`FSP.existsSync`

`services/file-system/fs-bridge.ts` 的 `FSP` **就是 `fs.promises` 本体**，
而 `fs.promises` **没有** `existsSync`（实测 `node -e "typeof require('fs').promises.existsSync"`
→ `undefined`；同步的 `existsSync` 只在 `fs` 上，`fs.promises` 只有异步 `access`）。

而 `components/file-browser/FileBrowser.vue:101` 写的是 `existsSync: (p) => FSP.existsSync(p)`，
经 `YMFileBrowser.vue:211` 转发到 `YMFileNavPane.vue:719` 的**重命名失焦**分支：

```ts
if (!props.fileSystem!.existsSync(path)) { return …rename…; }
```

⇒ **在文件浏览器里重命名文件会直接抛 `TypeError: FSP.existsSync is not a function`，改名不生效。**
它能编译、且一直没人发现，纯粹因为 `FSP` 当时的类型是 `Record<string, any>`。

这是本轴挖出的**第二个真实运行时缺陷**（第一个是第 0 轮 `tree-core.ts` 的
`children: null` 崩溃）。两次都不是「类型不好看」，而是**会崩**。

已改为 `FS.existsSync`。全仓 `existsSync` 的其它 30 余处调用**都正确地写在 `fs`/`FS` 上**，
只有这一处是孤例 —— 又一次印证「**同名成员在别处的写法**」是最有效的判据。

> **`FSP` 的 hatch 这轮没有收**，理由写进了 `fs-bridge.ts` 的注释（不是偷懒）：
> ① `writeFile` 是**语义不兼容**的覆盖（node 第三参是 `options`，这里换成了布尔 `check`），
> 收紧要先定义 `FSP` 的对外面并同步改约 30 个调用点；
> ② 就是这次踩到的 `existsSync`。换成一个更窄但**不成立**的类型会把差别藏得更深。

### 二、`any-hatches` 54 → 53：`palette-file.ts` 的 `meta` 参数

```ts
meta: { guid: string; path?: string } & Record<string, any>   // 旧
meta: FileMeta | null                                          // 新
```

两处「对齐已有口径」的便宜：

- 唯一调用方 `inspector/file-tileset-page.ts:73` 传的本来**就是** `FileMeta | null`
  （`this.meta`，类型 `FileMeta | null`）；
- `FileMeta` 连 `x` / `y`（`number | null`）都有 —— 而 `palette-engine.ts` 正是往
  `Palette.meta.x` / `.y` 写值，两边因此**第一次对上**。

### 三、⚠️ 第 66 轮的纯移动咬回来的三处**仪器盲区**（比移动本身更值得记）

第 66 轮我把「`vi.mock` 字符串要跟着改」写进了记录，**但漏了另外三类同样不走类型系统的路径**：

| 位置                                               | 症状                                                                                                                | 严重度          |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------- |
| `scripts/lib/self-test.mjs:417`                    | 写死 `packages/editor/src/ui/ui-window.ts`，读不到 ⇒ **`migration:selftest` 红（37/38）**                           | **CI 门禁红**   |
| `scripts/audit-ui-slots.mjs:33`                    | 同一路径写死；那行 `windowSrc` **根本没被用到** ⇒ 一句纯粹的 ENOENT 地雷                                            | 诊断脚本崩      |
| `components/__tests__/bridge-integrity.spec.ts:37` | 根目录清单里写死 `'ui'`。空目录还在时 `walk()` 返回 `[]` ⇒ **用例照样绿（覆盖悄悄变小）**；空目录一删就 ENOENT ⇒ 红 | **测试假绿→红** |

**最该记的是第一行的「没被复跑」**：第 66 轮我跑了 `migration:check`（绿）就以为门禁全过，
而 `migration:selftest` 才是红的 —— **验收清单里的两条命令不能互相替代**。
这正是「仪器瞎了，却表现为指标正常」的自家版本。

**修法是让仪器只维护一份**（本仓一贯的口径纪律）：

- `ui-slots.mjs` 把 `uiDirRe()` 也**导出**（此前只有 `uiWindowRel()` 是导出的）；
- `self-test.mjs` 与 `audit-ui-slots.mjs` 一律改用 `uiWindowRel()` / `uiDirRe()`，
  **删掉各自的写死副本**；
- `bridge-integrity.spec.ts` 的根目录清单把 `'ui'` 换成 `'engine/ui/legacy'`，
  并加一句**显式断言**：清单里的根目录不存在就直接抛错 ——
  **宁可红在「清单过期」，也不要绿在「覆盖变小」**。

修完复核：`migration:selftest` **38/38**、`audit-ui-slots.mjs` 报 `声明槽位：134`
（与台账 `declared=134` 一致，证明动态定位在独立脚本里也对）、`bridge-integrity` 1 passed。

### 验证（本轮，全部实跑）

`migration:selftest` 38/38 · `migration:check` 无上升 · `lint` 0-0 · `tsc` 0 ·
`typecheck:vue` 0 新增 · editor **252 文件 / 2056 通过（exit 0，本轮无 flake）** ·
ui-kit 115 文件 / 811 通过 · `bridge-integrity` 1 passed · `audit-ui-slots.mjs` 正常输出。

### 本轮新增的实机回归项

- **文件浏览器里重命名文件**（此前必抛 `TypeError`，现应正常改名并刷新列表）。

## 第 66 轮（续轮）：**P5-B 纯移动落地** —— `legacy-ui-lines` 2866 → **0**、`legacy-ui-refs` 1 → **0**

按文末「删完之后应该发生什么」的第 ② 步执行：把 `src/ui/` 整个搬走，**内容零改动**，只改 import 路径。

### 搬迁映射

| 原路径                                                                                  | 新路径                                       |
| --------------------------------------------------------------------------------------- | -------------------------------------------- |
| `src/ui/ui-window.ts`                                                                   | `src/engine/ui/legacy/ui-window.ts`          |
| `src/ui/{ui-events,ui-transform,ui-file,ui-list,ui-pointer,ui-prefab,ui-initialize}.ts` | `src/engine/ui/legacy/…`（同上，7 个域模块） |
| `src/ui/register.ts`                                                                    | `src/engine/ui/legacy/register.ts`           |
| `src/ui/element-registry.ts`                                                            | `src/engine/ui/element-registry.ts`          |

**为什么 9 个文件进 `legacy/`、唯独 `element-registry.ts` 不进**：
`uiEls` 是**活的元素注册表**（SFC 用 `:ref="registryRef(uiEls, id)"` 登记、模块按 id 取用），
不是遗留单例 —— 台账早就把它排除在 `legacy-ui-refs` 之外。放在 `engine/ui/` 与
`engine/element-registry.ts`（`engineEls`）形成同一命名约定。

### 为什么相对 import 全都不用改

8 个域模块一律 `import { UI } from './ui-window.ts'`，`register.ts` 又相对 import 那 7 个 ——
**它们是一起搬的**，相对关系不变。需要改的只有两类**别名说明符**：

- `@app/ui/element-registry` → `@app/engine/ui/element-registry`（6 处代码 + 2 处搬迁文件内部）
- `@app/ui/ui-window.ts` → `@app/engine/ui/legacy/ui-window.ts`（`tools/window-cluster.ts` 2 处）

### ⚠️ 一处**不会报错**、只能靠人工发现的连带：5 个 `vi.mock` 路径

`vi.mock('@app/ui/ui-window.ts', …)` 的**字符串必须与实际 import 说明符一致**，
否则 mock 静默失效 —— `tsc` 不报错、测试**照样通过**（只是测的不再是原来那个东西）。
本轮逐一改了这 5 处：`engine/__tests__/webgl.spec.ts`、`ui.spec.ts`、`scene.spec.ts`（无扩展名形式）、
`animation.spec.ts`（无扩展名形式）、`printer/__tests__/printer-draw.spec.ts`。

⇒ **记法：纯移动类改动，除 `tsc` 外必须单独 grep `vi.mock(` 与动态 `import(` 的字符串**
（两者都不走类型系统）。

### 验证（本轮，全部实跑）

| 项                                     | 结果                                                                                                                    |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `tsc --noEmit -p tsconfig.strict.json` | **0** 错误                                                                                                              |
| `lint`                                 | 0 warning / 0 error                                                                                                     |
| `typecheck:vue`                        | **0 新增**                                                                                                              |
| `-F @yami/ui-kit test`                 | 115 文件 / **811 通过**                                                                                                 |
| `-F @yami/editor test`                 | 252 文件 / **2056 通过**（仅既有的 `ui-state.spec.ts` teardown flake 噪声，无失败用例）                                 |
| `build:vite`                           | **exit 0** —— 这一条对纯移动尤其关键：它才验证得了 `ui-window.ts` 里那句**动态** `import('./register.ts')` 与整张模块图 |
| `migration:check`                      | 14 轴全平（baseline 已固化）                                                                                            |

### 轴的变化 —— 以及「替代轴」这一轮证明了自己

```
legacy-ui-lines      2866 → 0     ✓ 下降（2866 行 / 10 文件 → 0）
legacy-ui-refs          1 → 0     ✓ 下降
ui-singleton-members  103 → 103   = 持平   ← 关键
```

**`ui-singleton-members` 保持 103 / `declared=134` 不动**，正是第 62 轮补这条轴的全部目的：
搬迁**没有**让任何遗留成员消失，只是换了目录。如果没有这条轴，本轮之后
「1c 已完成 2/4 条轴」看起来会非常漂亮，而**103 处成员挂载、134 个槽位一行没少**。

第 62 轮同时修的另外两处「仪器瞎了」也经受住了检验：
`declaredSlots()` 的动态定位（写死路径的话这里会静默返回空数组、`declared` 假降到 0）
与 `assignedSlots()` 的目录判定（写死 `^packages/editor/src/ui/` 的话，
域模块里的 `this.x = …` 会不再计入 `assigned` ⇒ 凭空报一条**假回归**）。
两者本轮都无漂移：`ui-slot-coverage` 仍是 `declared=134 / assigned=153 / storeRefs=49 / engineBacked=7`。

### 下一步（1c 第 ③ 步）与**实机回归清单**

**必须先实机回归**：本轮是运行时高危改动（附录四/六/七/八/九记的都是这一带的静默失效）。
请按顺序点一遍：

1. **启动编辑器不崩**（附录四：初始化时序类回归曾导致启动即崩）；
2. UI 窗口：打开 / 新建 / 保存 / 关闭 / 撤销重做 / 复制粘贴 / 缩放；
3. UI 画布：点选、框选、右键菜单、拖动控制点（附录八：`selectObject` 读已迁字段导致点选无反应）；
4. 左侧列表：快捷键、重命名、拖拽、分页；
5. 预设 / 预制体：注册、创建、无效预设清理；
6. 主题切换 + 语言切换后 UI 正常（附录六：`background`/`foreground` 双存储导致「一片黑且不报错」）；
7. UI 窗口交互后**不冻住**（附录七：`updateTargetItem` 读已迁字段）；
8. 保存 / 重新打开项目后 UI 布局与缩放正常；
9. 图块组（Palette）窗口与自动图块生成（用到了 `element-registry` 改名后的 `uiEls`）。

回归通过后再做第 ③ 步（逐域把 store 缺的 41 个槽位补上，`ui-singleton-members` 103 → 0），
最后第 ④ 步（换接线 + 退役对象字面量，`declared` 134 → 0）。

**回滚**：本次搬迁是单个 commit，`git revert` 即可原样退回 `src/ui/`（rename 保留了历史）。

## 第 65 轮（续轮）：`any-hatches` 55 → 54，**拿下 `SceneAnimateEngine`** —— `this: typeof Scene` 的正确解法

第 63 轮把 `SceneAnimateEngine` 判为「被 `SceneShape` 挡住」并回退；第 64 轮把挡因修正为
「**测试侧局部 mock 够不着承重形状**」。**本轮给出解法并落地**，且它**不需要**动 `SceneShape`。

### 解法：按**读点**声明本地窄接收者类型（同目录已有先例）

```ts
type SceneAnimateThis = {
	state: string;
	showAnimation: boolean;
	parallaxes: { hidden?: boolean; player: { update(deltaTime: number): void } }[];
	updateAnimation: (deltaTime: number) => void;
	renderingFunction: () => void;
};
```

八个成员**读到的全部**只有这 5 个成员 —— 这正是 `scene-selection-engine.ts` 的
`SceneSelectionThis` 一直在用的手法（那处第 63 轮已拿下）。所以本轮的要点不是新设计，
而是**意识到它可复用**：`this: typeof Scene` 并不是「必须的精确」，只是当初懒得枚举。

三处配套改动，全部机械：

1. `SceneAnimateEngine` 声明为 `Partial<SceneAnimateEngineShape>`（如实描述先空后挂）；
2. 本文件 8 处 `function (this: typeof Scene …)` → `(this: SceneAnimateThis …)`；
3. `scene-animate.ts` 的 7 行镜像补 `!`（`Partial` 的必然结果），**spec 再补 5 处 `!`**。

`tsc` 一次全绿，**没有任何预料之外的连带** —— 与第 63 轮那次「加接口就红 5 处」形成对照：
**差别只在接收者类型是宽的（`SceneShape`）还是窄的（本地 5 个成员）。**

### 修正第 63/64 轮的两句判断

> 第 63 轮：「`this: typeof Scene` 的三处需 `SceneShape`」→ **不成立**，窄接收者即可。
> 第 64 轮：「两条路…都不是机械枚举」→ **一半不成立**：`SceneSelectionThis` 那样的窄类型
> 在这批文件里是**机械枚举**（照读点抄），不是设计决定。

**判据（本轮定型）**：
`export const XxxEngine: Record<string, any> = {}` 后跟 `XxxEngine.foo = function (this: typeof Y)` 时 ——
**不要**判定为承重，先**数一下这些成员一共读/写了 `Y` 的哪几个字段**：

| `Y` 上被读/写的字段数                      | 做法                     | 实例                                                                                                                        |
| ------------------------------------------ | ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| 个位数（≈≤10，且全是具名字段）             | **本地窄类型**，一轮拿下 | `SceneAnimateThis`（5 个）、`SceneSelectionThis`（本已存在）                                                                |
| 几十个 / 含大量写入 / 子对象本身是承重形状 | 整片留到最后             | `SceneCameraEngine`（≈30 个，含 `this.scrollLeft = …` 等**写入**）、`SceneMarqueeEngine`（`typeof Scene.marquee` 是 hatch） |

「字段数」比「`Y` 是不是承重形状」有用得多 —— 前者是**可实测的成本**，后者只是个标签。

### 用「字段数」把整批命名空间量了一遍（本轮实测，可直接接着做）

`this.*` 的**去重字段数**（读+写），以及这些字段在 `SceneShape` 里**有没有显式声明**：

| 文件                                          | 命名空间成员 | `this.*` 去重字段 | 其中写入 | `SceneShape` 显式声明              | 结论            |
| --------------------------------------------- | ------------ | ----------------- | -------- | ---------------------------------- | --------------- |
| `scene-animate-engine.ts`                     | 8            | **5**             | 0        | —（用本地窄类型）                  | ✅ 本轮拿下     |
| `scene-draw-engine.ts`                        | 27           | **0**             | 0        | —                                  | ✅ 第 63 轮拿下 |
| `scene-selection-engine.ts`                   | 10           | 24                | 0        | —（文件自带 `SceneSelectionThis`） | ✅ 第 63 轮拿下 |
| `scene-edit-engine.ts`                        | 12           | **22**            | 0        | **0**                              | ❌ 见下         |
| `scene-camera-engine.ts`                      | 8            | **32**            | 10       | **0**                              | ❌ 见下         |
| `scene-marquee-engine.ts`                     | 10           | **24**            | 8        | **0**                              | ❌ 见下         |
| `engine/palette/palette-engine.ts`            | 20           | 41                | —        | —                                  | ❌              |
| `engine/animation/animation-window-engine.ts` | —            | 28                | —        | —                                  | ❌              |
| `engine/ui/ui-engine.ts`                      | 21           | 31                | —        | —                                  | ❌              |
| `engine/particle/particle-engine.ts`          | 3            | 96                | —        | —                                  | ❌              |
| `engine/palette/auto-tile-engine.ts`          | 5            | **7**             | —        | —                                  | ⚠️ 见下         |

**本轮最有用的一条实测**（⚠️ **本表在第 67 / 69 轮被更正过两次，见下**）：

| 文件                      | 读到的字段 | ~~曾记为已声明~~ | **真相：在 `SceneShape` 接口体内声明**                |
| ------------------------- | ---------- | ---------------- | ----------------------------------------------------- |
| `scene-edit-engine.ts`    | 22         | ~~21~~           | **3**（`marquee` `planToSave` `requestRendering`）    |
| `scene-camera-engine.ts`  | 32         | ~~29~~           | **2**（`marquee` `screen`）                           |
| `scene-marquee-engine.ts` | 24         | 5                | 0（它的 `this` 是 `Scene.marquee`，**不是** `Scene`） |

**真相的关键**：`SceneShape` 是**一个只有 27 个成员的扁平接口**
（`body close copy create destroy duplicate head info initialize list load loadFromConfig
loadFromProject marquee open page paste planToSave redo requestRendering save saveToConfig
saveToProject screen searcher toggle undo`），外加一个 `[k: string]: any` 索引签名。
`width` / `height` / `tileWidth` 这些**属于另一个接口**（`SceneDataShape`，L127 起），
所以 `Pick<SceneShape, 'width'>` 拿到的是**索引签名给的 `any`**，不是 `number`。

⇒ **结论（第 69 轮定稿）**：`Pick<SceneShape, K>` 只对那 **27 个成员**给真类型，
其余一律 `any`。因此它对 `edit` / `camera` 这类引擎**主要是「关掉命名空间键集」**，
**不是**「把字段类型补上」。轴数字下降是**正当的**（该命名空间上
`SceneEditEngine.AnythignAtAll` 以前能编译、现在会报错，这正是本轴的定义），
但**不能**说成「字段有类型了」。

要真正给字段补类型，只有两条路：

1. 把字段**声明进 `SceneShape`**（或声明进一个专门的窄接口）；
2. 像 `SceneSelectionThis` 那样**手写**窄接收者类型（12 个函数签名 + 10 个数据字段，是真活）。

> ### ⚠️ 勘误一（第 67 轮追记）：本节原先写的「**0 命中**」是**我自己的 grep 写错了**
>
> 原话是「`edit` 的 22 个、`camera` 的 32 个、`marquee` 的 24 个
> ——**在 `SceneShape` 里一个都没有显式声明**（grep 实测 0 命中）」，
> 并据此下了结论「`Pick<SceneShape, …>` 只能让台账下降、不带来安全性 —— 属假绿，不做」。
>
> **错因**：PowerShell 双引号里写 `'^\\\\t'`：PowerShell 不处理反斜杠，node 收到 `'^\\\\t'`
> ⇒ JS 字符串是 `^\\t` ⇒ 正则匹配的是「**一个字面反斜杠 + t**」，于是对任何字段名都返回 false
> ⇒ 全被误报成「未声明」。**结论「属假绿」在方向上是对的**（见勘误二），但**理由是错的数字**。
>
> ### ⚠️ 勘误二（第 69 轮追记）：修好正则后写下的「21 / 29」**也是错的**
>
> 第二次我把检查面从「接口体」放大到了**整个 `scene-window.ts` 文件** ——
> 于是 `export const Scene: SceneShape = { matrix: null, scaledTileWidth: null, … }`
> 这些**对象字面量的键**被当成了「接口声明」。真值是 **3 / 2**（上表）。
>
> **教训（两次同一个病）**：**「数出来的数字」必须连同「数的是哪个区间」一起自证。**
> 第一次是转义写错（正则永远不命中），第二次是**区间选错**（把字面量当接口）。
> 两次都产出了一个**看起来完全合理**的数字，所以都没触发怀疑。
> ⇒ 下结论前必须做两件事：
> ① 用一个**已知会命中**的样例反证（这里测 `marquee` —— 它确实在接口里，若它也不命中，脚本就是瞎的）；
> ② 打印**命中集合本身**（而不只是计数）—— 一打印就会看到 `matrix` / `scaledTileWidth`
> 这些明显不该出现在接口里的名字，区间错误当场暴露。

**`auto-tile-engine.ts`（7 个字段，本应便宜）** 卡在一个具体的类型细节上：
`image` 是**哨兵联合** `CanvasImageSource | symbol`（`noImage` 是「无图」哨兵、加载中临时用
`Symbol()` 占位）。而 `drawFrame()` 里 `const symbol = (this.image = Symbol());` 这次**赋值**
会让 `this.image` 的 `instanceof Image` 收窄失效，块后的 `const image = this.image`
又变回联合类型，`drawAndFitImage(context, image, …)` 报错。
给 `image` 写 `any`（等于没做）、改 `drawFrame` 流程（动生产逻辑）、调用点加断言（糊）——
**都不是「只加类型」** ⇒ 留到最后与 `AutoTile`（`palette/auto-tile.ts:49`）一起处理
（那个单例本身也是 hatch，两边是同一份形状的两半）。

### 验证（本轮）

- `any-hatches` **55 → 54 处 / 29 → 28 文件**
- `typecheck` 0 / `typecheck:vue` 0 新增 / `lint` 0-0；`scene.spec.ts` 20 测试通过
- 纯类型改动，无运行时行为变化

## 第 64 轮（续轮）：`any-hatches` 61 → 56 —— `.vue` 三处拿下，`YMParameterPane` 的 3 处的**实测代价 41**

### 拿下 4 处

| 站点                                 | 做法                                                                                                 | 判据                                                                                                                                                                                                                                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `YMParameterPane.vue:691`            | `const data: Record<string, any> = {}` → `Record<string, unknown>`                                   | 同一函数里 `result: Array<Record<string, unknown>>` 就是它的去处 ⇒ 纯多余                                                                                                                                                                                                                         |
| `YMFileHeadPane.vue:346,350`（2 处） | `Record<string, any>` → `Partial<Record<SliderViewMember, unknown>>`，名单 `as const` 派生字面量联合 | 搬的本来就只是 5 个**具名**成员；`as const` 让 `key` 是联合而不是 `string`，于是**不需要索引签名**，`any` 就没有存在理由                                                                                                                                                                          |
| `YMFileBodyPane.vue:244`             | `inoMap: Record<string, any>` → `Record<string, unknown>`                                            | **全仓其余 5 处 `inoMap` 声明全都是 `Record<string, unknown>`**（`YMFileNavPane.vue:143`、`file-nav-pane-core.ts:43/138`、`YMFileBrowser.vue:347`、`directory-tree.ts:30`、`directory-object.ts:17`），只有这一处是孤例；真正的提供方 `Directory.inoMap` 也是 `unknown` ⇒ 原先的 `any` 比来源还宽 |

**可复用的判据**：遇到 `Record<string, any>`，先全仓搜**同名成员**的其它声明。
若其余声明都已经是 `unknown`/精确类型，这一处就是**孤例**，对齐即可，零设计成本。

### 试过并**回退**：`YMParameterPane.vue` 的 3 处 `HTMLElement & { [k: string]: any }`（164 / 201 / 971）

三处是同一个类型：面板元素。它被 `attachStateAccessors` 用 `Object.defineProperty` 装上
`paneState` 的 14 个访问器（`paneStateFields` 与 `paneState` 逐项对应），另外 `bind()` 挂
`getData`、布局侧挂 `onResize`。看起来很干净：写成

```ts
type ParameterPaneElement = HTMLElement & typeof paneState & { getData?: …; onResize?: … };
```

**实测 `typecheck:vue` 一次性红 41 处**（TS2339 成员不存在、TS18046 「of type unknown」、
TS2322 赋值不兼容……）。**根因不是元素类型写得不对，是 `paneState` 的字段本身全是 `unknown`**：
14 个字段声明为 `null as unknown` / `[] as unknown[]`，`any` 一直在替它们兜底；一旦把元素
类型收窄，这 14 个字段的 **`unknown` 就全部暴露到 41 个读点上**。

⇒ 回退（`git diff` 该文件只剩 691 那一处）。**记法**：`.vue` 里 `HTMLElement & { [k: string]: any }`
的成本**由它承载的状态字段的类型决定，而不是由 `any` 本身决定**。要收这类站点，
得连 `paneState` 的 14 个字段一起定类型（= 类型设计活），不是给元素加个名字就完事。

> 建议读法：动手前先看**这个 `any` 底下压着多少个 `unknown`**。压着 0 个（如
> `YMFileHeadPane` 的 5 个具名成员）就便宜；压着十几、几十个就整片留到最后。

### 同批未动：`YMParameterPane.vue:135 / 245` 的 `guidMap: Record<string, any>`

**提供方已经比它窄**：`components/common/ParameterPane.vue:65` 写的是
`const dataManifest = (): { guidMap: Record<string, unknown> } | null => Data.manifest;`。
但 ui-kit 侧拿 `guidMap[id]` 之后要读 `meta.parameters` / `meta.langMap.update()` /
`meta.overview?.deprecated` ⇒ 光换成 `unknown` 会在 3 个读点报「of type unknown」，
必须同时给出 `ScriptMeta` 形状。而那个形状的来源 `Data.manifest` 正是
`data/data-object.ts` 的承重 hatch（`DataModule`）⇒ **与核同批**。

### 同批拿下：`data/transition-window.ts:86` 的 `read: () => Record<string, any>`

**孤例判据的第二个实例**：全仓其它 `read` 声明一律是 `unknown` 或精确类型 ——
`commands/command-tip.ts:104` `read(...args: unknown[]): unknown`、
`commands/custom-command-window.ts:57` `read(): CustomCommandData | null`、
`utils/element-utils.ts:183` `(el as { read: () => unknown })`…… 只有这一处是 `Record<string, any>`。

改成 `Record<string, unknown>` 的连带**只有 4 行**，就在唯一的读点 `Easing.pointInput`：
它按 `-` 分段逐层下钻（`node = node[keys[i]]`），每层都是同一种具名对象 ⇒
加**一次单断言** `as Record<string, unknown>` 即可（不是双重断言，不增 `unknown-casts`）。

> 与上面的 `guidMap` 对比：同样是「提供方已经更窄」，但那边读侧要 3 个具名成员，
> 必须同时给出形状；这边读侧只是**继续下钻**，单断言就够。
> ⇒ **判据要落到「读侧怎么用」上，不只是「别处怎么声明」。**

### 同批判定为**不便宜**（不是孤例）：两处 `config`

`services/project/setting-config/index.ts:16` 的 `config: Record<string, any>` 看着很像孤例 ——
**它自己那个目录里** `types.ts:5/23/24` 与 `renderer.ts:14` **全都是 `Record<string, unknown>`**。
但那些是**形参位置**（接受任意 config），而本类是**结构化访问**：
`this.config[key][sub]`、`this.config.other.browserSearchHistoryLimit`、`this.config.server.port`
⇒ 换成 `unknown` 会在这几行直接报「of type unknown」，必须同时给出配置 schema 的嵌套形状。

`stores/data.ts:149` 的 `config: Record<string, any> | null` 同理：`Data.config.deadzone` /
`Data.config.localization.languages` / `Data.config.window.title` / `Data.config.script` /
`Data.config.lightArea` 全是具名结构化读点。

⇒ **记法修正**：孤例判据要求「成员名相同 **且用法位置同类**」——形参位置与结构化访问是两回事。
只看「同名成员在别处是什么类型」，会把 `config` 这类误判成便宜。

### 验证（本轮）

- `any-hatches` **61 → 55 处 / 33 → 29 文件**（`.vue` 三处 4 点 + `transition-window` 1 处）
- `typecheck` 0 / `typecheck:vue` 0 新增（回退后回到 0）/ `lint` 0-0
- ui-kit 115 文件 811 测试全通过
- 纯类型改动，无运行时行为变化

## 第 63 轮（续轮）：`any-hatches` 67 → 61 —— 6 处白捡，两处试过并回退

### 本轮最重要的发现：第 62 轮的探针**没覆盖这批站点**

第 62 轮用 `any-hatch-probe.mjs` 得出「23 处站点白捡 0 处、剩下全是逐成员枚举」。**那个结论对
索引签名成立，但探针的口径只删「独占一行的 `\t[k: string]: any;`」** —— 它**碰不到**
`Record<string, any>`（第 62 轮扩口径新增的那 35 处）。而这 35 处里有 5 处**根本不是承重形状**，
是一次断言、一个形参、甚至一行**完全多余的 cast**。

⇒ **教训（写给下一批）**：探针要按**站点形态**分批做。「索引签名」与「`Record<string, any>`」
在语法位置、可删性、承重方式上都不一样；用一把探针的负面结果去概括两条口径，会**误判整片区域**。

### 清掉的 5 处（逐站点理由，均可复核）

| #   | 站点                                                                                                   | 为什么是白捡                                                                                                                                                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `ui-kit/.../type-registry.ts:58` `types: Record<string, any>`                                          | `get()` 的返回类型**本来就叫** `RegistryEntry`，`register()` 的 40 处调用**全部**传 `{ component, create }`。改成 `Record<string, RegistryEntry>` 后 `register(config: unknown)` 同步收紧为 `RegistryEntry`；**外部零调用方**（`.types[` 全仓只有本文件 2 处，且只用于 `Object.keys`） |
| 2   | `ui-kit/utils/radio-proxy.ts:95` `value as string \| number \| boolean \| Record<string, any> \| null` | **纯多余**：`dataValue` 的声明就是 `unknown`，`value` 也是 `unknown` ⇒ `unknown` 直接可赋。那串断言既无约束力，又是该文件唯一的 `any` 逃生口。删掉即可                                                                                                                                 |
| 3   | `stores/ui.ts:538` `makeForwarder(key, resolve: () => Record<string, any> \| null)`                    | **形参与调用方口径不一致**：两个调用点本来写的就是 `() => UI as Record<string, unknown> \| null`。改成 `unknown` 后函数体在 `typeof fn !== 'function'` 处正常收窄，无需新断言                                                                                                          |
| 4   | `module/eslints.ts:284` `prototype as HTMLElement & Record<string, any>`                               | 为给 `HTMLElement` 挂一个新方法而临时造索引签名。真实契约**只有一个方法**，且消费方早已各自声明（`commands/schema.ts:45`、`composables/useCommandState.ts:6`、`commands/command-tip.ts:61`）⇒ 提成具名 `SelectionPositionHost`，单次断言（不增 `unknown-casts`）                       |
| 5   | `palette/tile-frame-generator.ts:17` `FrameGenerator: Record<string, any>`                             | 自包含单例，成员就 6 个且**全部在本文件挂载**。`this.callback` / `this.windowClosed` 两处补 `!`（类型层，运行期路径上必已赋值）                                                                                                                                                        |

第 5 处顺带说明一个判据：**「成员是否全部在本文件挂载」决定枚举成本**。
`FrameGenerator`（6 个，全在本文件）一轮拿下；而下面那个反例（9 个 engine 命名空间）全部挂在
**别的**形状上。

### 试过并**回退**：`engine/scene/scene-animate-engine.ts`（`SceneAnimateEngine`）

按 5 处的经验先挑了它（只有 8 个成员）。加 `interface SceneAnimateEngineShape` 后：

1. `= {}` 初始化立刻报 **TS2740**（接口成员非可选 ⇒ 空对象不满足）；
2. 更要紧的是 **`scene.spec.ts` 一次性红 5 处**：`SceneAnimateEngine.requestRendering.call(Scene)`
   里的 `Scene` 是 63 个成员的**局部 mock**，而成员签名写的是 `this: typeof Scene`。

**根因不是签名写错，是接收者形状**：这些 engine 命名空间的方法都以 `Scene`（即 `SceneShape`）为
`this`，而 `SceneShape` 自己就是第 62 轮实测**级联 296** 的承重 hatch。先给命名空间定类型，
就必然要么拉进 `SceneShape`、要么临时造一个更窄的 `this` 形状 —— 后者是**类型设计决定**，
不是机械枚举（第 56/57 轮对 `UIElementInstance` / `UIShape` 的判定完全一样）。

⇒ **回退，且逐字节复原**（`git diff --numstat` 该文件为空即证）。
**记法**：`export const Xxx: Record<string, any> = {}` 后面跟着 `Xxx.foo = function (this: typeof Y)` 的，
先看 **`Y` 是不是承重形状**；是就整片留到最后，不是才可以枚举。

### 拿下：`engine/scene/scene-draw-engine.ts` 的 `SceneDrawEngine`（27 个成员，一轮完成）

按「成员是不是全在本文件、且由**上方 import** 提供」这个判据筛出来的第一处。27 个成员
`SceneDrawEngine.drawScene = drawScene;` …… 全部是 `./draw-*.ts` 的导入函数，**没有 `this`**，
所以既能改成对象字面量（类型全部由导入推断、零手写签名），又**不需要**动位置：

```ts
export const SceneDrawEngine = { drawScene, drawBackgrounds /* …27 个… */ };
```

唯一的消费方 `scene-draw.ts` 是**逐条镜像**到 `Scene` 上（`Scene.drawScene = …`，30 行），
而 `SceneShape` 带索引签名 ⇒ 目标侧是 `any`，不会因推断出的精确签名而报错。
`tsc` / `lint` / `vue-tsc` 一次全绿，无连带。

> 顺带说明这个名字面上 `any` 的真实危害：镜像**逐条**写，若某条拼错，`Record<string, any>`
> 会让它静默镜像一个 `undefined` 到 `Scene` 上，直到运行时某个绘制调用才炸。
> 改成字面量后拼错立刻是编译错误。

### 拿下（第二处）：`engine/scene/scene-selection-engine.ts` 的 `SceneSelectionEngine`（10 个成员）

**这一处推翻了上一节那句「`Scene*` 全部被 `SceneShape` 挡住」的概括** —— 真正的判别式是
**该文件有没有自己声明接收者类型**：

| 文件                                                                          | 成员的 `this`                                                        | 结果               |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------ |
| `scene-selection-engine.ts`                                                   | `SceneSelectionThis`（**本文件声明**，按读点枚举）                   | ✅ 干净拿下        |
| `scene-draw-engine.ts`                                                        | 无 `this`（纯函数引用）                                              | ✅ 已拿下          |
| `scene-animate-engine.ts` / `scene-camera-engine.ts` / `scene-edit-engine.ts` | `this: typeof Scene`                                                 | ❌ 需 `SceneShape` |
| `scene-marquee-engine.ts`                                                     | `this: typeof Scene.marquee`（`HTMLElement & { [k: string]: any }`） | ❌ 同上            |

做法与本轮 `FrameGenerator` 同构：`Partial<SceneSelectionEngineShape>`（**如实描述**
「对象在下面按域逐个挂载，`{}` 时确实一个成员都没有」，不用 `{} as Shape` 把它盖掉）。
接收者类型**直接复用文件里已有的** `SceneSelectionThis`，零新增设计。

连带只有 spec 侧：`scene.spec.ts` 的 7 处 `SceneSelectionEngine.selectObject.call(Scene, …)`
补 `!`（`Partial` 的必然结果）。

> **重要**：spec 的 `Scene` 局部 mock **满足** `SceneSelectionThis`，却**不满足** `SceneShape`
> （第 63 轮首测时它「缺 page / head / body / searcher 等 18 个」）。
> 这正是 `this: typeof Scene` 那三处难做的**真正**原因 —— 不是生产代码，是
> **测试侧的局部 mock 够不着承重形状**。所以那三处若要推进，要么给引擎声明更窄的接收者类型
> （= 类型设计决定，见第 56/57 轮判例），要么改 spec 的 mock 形状。**两条路都不是机械枚举。**

### 同类待办（修正后的判据）

先看 `this` 是不是**本文件声明的窄形状**：是 → 直接做（`Partial<>` + spec 补 `!`）；
是 `typeof Scene` / `typeof Scene.marquee` / 其它承重形状 → 整片留到最后。
按此，剩下 4 个（`animate` / `camera` / `edit` / `marquee`）与 `UIEngine`
全部属于后者，**排在 `SceneShape` 之后**。

### 试过并**回退**：`engine/particle/particle-engine.ts` 的 `ParticleEngine`

这里踩到的是**另一种**拦截，和第 56/57 轮那类「接收者形状」不同 —— 值得单独记，因为
它暴露了一个**真实的、此前被 `any` 掩盖的类型不一致**。

`ParticleEngine` 只有 3 个成员，且都是**类引用**（`Emitter` / `Layer` / `Element`），
看着是全场最便宜的一处。把「空对象 + 末尾三行赋值」换成类引用字面量后（类型全部推断，
零手写接口），本文件**自己**通过，但 `particle-initialize.ts` 一处立刻红：

```ts
Particle.Emitter = ParticleEngine.Emitter; // ← 137-139，模块求值期执行
Particle.Layer = ParticleEngine.Layer;
Particle.Element = ParticleEngine.Element;
```

```
Type 'typeof ParticleLayer' is not assignable to type
  'new (emitter: ParticleEmitterShape, data: ParticleLayerDataShape) => ParticleLayerShape'
```

**根因：`ParticleEmitterShape` / `ParticleLayerShape` 这两个名字在全仓有**两份互不相同的定义** ——
一份在 `engine/particle/particle-engine.ts`（类所用的本地形状），另一份在
`particle/particle-window.ts`（导出的那个，带 `[k: string]: any`，即台账里的一处 hatch）。
两边的成员对不上，`particle-window.ts` 的还多出 `speed / opacity / scale / angle / matrix`；
另有一处 `draw(opacity: number)` vs `draw(opacity?: number)` 在 `strictNullChecks` 下不兼容。

⇒ **`particle-initialize.ts:137-139` 就是这两份同名形状的接缝**。也就是说：
`ParticleEngine` 的 1 处 hatch **不可能单独清掉** —— 它和 `particle-window.ts` 的 hatch
（第 62 轮实测级联 **71**）是**同一个决定**的两半。用 `as unknown as` 在接缝上架桥能骗过
`tsc` 并让 `any-hatches` −1，但会 **+1 `unknown-casts`**，且把真问题藏起来 —— **不做**。

⇒ 回退，**逐字节复原**（`git diff --numstat` 该文件为空即证）。
**记法**：`Xxx.A = SomeClass` 形态的命名空间，先查 `SomeClass` 与消费侧接口**是不是同一份声明**；
同名不同源 = 承重形状的两半，与「接收者形状」一并留到最后。

### 验证（本轮）

- `any-hatches` **67 → 61 处 / 38 → 33 文件**（5 处白捡 + `SceneDrawEngine` 1 处；两处回退未计入）
- `tsc --noEmit -p tsconfig.strict.json` 0 错误；`lint` 0/0；`vue-tsc` 0 新增
- ui-kit / editor 测试全通过
- 纯类型改动：**无运行时行为变化**（唯一的语义面是 `FrameGenerator` 两处 `!`，路径上必已赋值）

## 第 62 轮（续轮）：`any-hatches`「可白捡组」探测 —— **负面结果：0 处**，以及一个度量漏洞

第 38–61 轮反复出现「某个站点删了签名、`tsc` 零报错 ⇒ 直接删」的白捡（第 60 轮 `ParticleEmitterRef`
就是这么拿下的）。本轮把这一步**机械化**成工具，以便不再靠人工试：

```bash
node scripts/any-hatch-probe.mjs
```

它逐文件删掉该文件里**独占一行**的索引签名（`\t[k: string]: any;`），跑 `tsc`，0 报错即「白捡」。
自带工作树脏检查，结束时用 `git checkout -- .` 还原（只统计**已跟踪**文件，脚本自身是未跟踪的）。

### 结果：13 个文件全部承重，白捡 0 处

23 处独占一行站点逐文件实测（报错数含测试侧连带）：

| 文件                                 | 独占一行站点 | 删后 `tsc` 报错 | 首条报错点名                                                                                   |
| ------------------------------------ | ------------ | --------------- | ---------------------------------------------------------------------------------------------- |
| `scene/scene-window.ts`              | 1            | **1446**        | `MockedObject<SceneShape>` 缺 `target` / `meta`                                                |
| `animation/animation-window.ts`      | 2            | **1191**        | `AnimationShape` 缺 `requestRefreshingList` / `switchMark` / `requestRendering`                |
| `types/shapes.ts`                    | 1            | **889**         | `DynamicShape` 缺 `fileAnimation` / `open` / `close`                                           |
| `data/data-object.ts`                | 1            | **528**         | `DataModule` 缺 `animations` / `attribute`                                                     |
| `ui/ui-window.ts`                    | 2            | **520**         | `UIShape` 缺 `drawBackground` / `drawElements`（`TS2551` 还提示 "Did you mean 'background'?"） |
| `commands/schema.ts`                 | 2            | 110             | `TS7053` 索引取键 + `CommandSchema` 缺 `colorizeCodeLines`                                     |
| `particle/particle-window.ts`        | 3            | 71              | `ParticleEmitterShape` 缺 `hasArea` / `outerLeft` / `outerTop` / `outerRight`                  |
| `composables/useCommandParse.ts`     | 3            | 70              | `CommandObjectShape` 缺 `eventId`                                                              |
| `stores/ui.ts`                       | 1            | 27              | `UINodeShape` 缺 `presetId` / `instances` / `transform`                                        |
| `engine/ui/element-base.ts`          | 2            | 22              | `UIElementShape` 缺 `connect` / `disconnect` / `draw` / `resize`                               |
| `engine/particle/particle-engine.ts` | 3            | 19              | `ParticleLayerData` 缺 `sort` / `blend` / `color`                                              |
| `engine/ui/ui-engine.ts`             | 1            | 16              | `UIShape` 缺 `planToSave` / `requestRendering`                                                 |
| `engine/ui/element-classes.ts`       | 1            | 7               | `UIElementInstance` 缺 `tryUpdateReferenceElements` / `addReference`                           |
| **合计**                             | **23**       | —               | **可白捡 0 处**                                                                                |

**结论（写给下一批）**：`any-hatches` 剩下的 32 处**没有任何一处可以靠「只删签名」拿下**。
白捡机制已经榨干 —— 第 38–61 轮能白捡的都捡完了，**剩下 100% 是「逐成员枚举进具名接口」的活**，
且最小的 `element-classes.ts`（7 处报错）也已被第 56 轮判定为类型设计决定而非机械枚举。
不要再用「先删了看 `tsc` 报什么」当作省力的赌注 —— **它一定报错，报错数是上表那一列**。

> 另外注意：报错数**含测试侧连带**（`tsconfig.strict.json` 的 `include` 覆盖 `src/**/*.ts`，
> 故 `src/**/__tests__/*.spec.ts` 也在内）。`scene-window.ts` 的 1446 里首条就是
> `usePresetObjectWindow.spec.ts` 的 `MockedObject<SceneShape>` —— 说明改这些承重形状时
> **测试侧 mock 会成批变红**，那正是「测试该改」与「代码真坏了」最容易混淆的地方。

### 本轮同时修掉一个度量漏洞（详见文末）

`legacy-ui-lines` 是**目录**口径，阶段 1c 第 ② 步「纯移动」会让它归零而遗留代码一行未少。
已在文末「删完之后应该发生什么」一节写明替代轴 `ui-singleton-members`（**第 62 轮已落地**，起点实测 **103 处 / 8 文件**、`declared=134`）。

### 验证（本轮）

- 探针结束后工作树**干净**（`git status --porcelain --untracked-files=no` 为空）、`tsc` 0、
  台账 13 轴与基线持平（`migration:check` 全绿）。
- 本轮**无源码改动**，只新增工具 `scripts/any-hatch-probe.mjs`；`.oxlintrc` 白名单未动。

## 第 61 轮（续轮）：`element-base.ts` 的 2 处试过、判定为类型设计活并回退

探针（删两处签名 → 一次 `tsc` → 按「类型.成员」去重）：22 条报错、**9 个成员**，看着是叶字段 ——
`UIElementShape` 缺 `connect/disconnect/draw/resize/destroy/connected/parent`，`UIParentShape` 缺
`parent/requestResizing`。但补进去是**越补越深**：`UIElementShape` 在本文件里**是空的**
（`interface UIElementShape {}`），成员实际要由 `Element` 类反向决定；`element.parent = this` 报
「this 不能赋给 UIElementShape」（类的 `resize` 等带形参，`() => void` 收不下）；改多态
`parent: this | null` 后比较点又报 `UIParentShape 与 this 无重叠`。

⇒ 正确解法是把**元素类的公共成员抽成接口**（或让类 `implements` 它），属类型设计决定。本轮**全部回退**
（树已还原、`tsc` 0、台账 32/14 与基线持平）。

> 再确认第 56/57 轮那条规矩：**「成员数少」不等于「活小」**；判据是**成员的类型由谁决定** ——
> 答案里出现另一个类或另一个子系统，就先停手。

## 第 60 轮（续轮）：`ParticleEmitterRef` 白捡 1 处 —— 33 → 32（`particle-engine.ts` 从 8 处到 3 处）

用 `any-hatch-inventory` 把 `particle-engine.ts` 剩下的 4 处逐个点名归属：`ParticleLayerData`（color/sprite
嵌套 ✗）、`ParticleEmitterShape`（跨文件读点 ✗）、`ParticleElementLayerData`（area/color 嵌套 ✗）、
**`ParticleEmitterRef`（未测过）** —— 只测最后那个：删掉签名后 `tsc` **零报错** ⇒ 白捡（连同上方的
豁免注释一起删）。至此 `particle-engine.ts` 从 8 处清到 3 处（第 53/54/55/60 轮共清 5 处）。

**结果**：`any-hatches` **33 → 32 处**；产物与 HEAD 逐字节相同；`tsc` 0、`typecheck:vue` 0 new、
`lint` 0/0，基线已固化。

## 第 59 轮（续轮）：`EnumModule` 清 1 处 —— 34 → 33（先用新工具定位，再按名字找大括号）

第 58 轮新增的 `scripts/any-hatch-inventory.mjs` 先给出归属：`enum-window.ts:116` → 接口 `EnumModule`。
探针（删签名 → 一次 `tsc` → 按「类型.成员」去重）只有 **4 个成员 / 7 条报错**：

| 成员      | 类型                     | 依据                                                          |
| --------- | ------------------------ | ------------------------------------------------------------- |
| `mode`    | `string`                 | 测试里 `Enum.mode = 'string'` / `store.state.mode = 'normal'` |
| `data`    | `unknown[]               | null`                                                         | 桥接用例 `Enum.data = [{ id: 'e1' }]`、`Enum.data = null`；元素形状交给 store（那里才是真源） |
| `changed` | `boolean`                | `Enum.changed = true`                                         |
| `idMap`   | `Record<string, unknown> | null`                                                         | `monkey-patches.ts` 的 `Enum.idMap![copy.id]` 判重                                            |

⚠️ **又一个小坑（这次是脚本自己的）**：探针已经把签名删掉了，我却让「找签名行再替换」的脚本去定位 ——
自然找不到（`no hatch`）。改用第 54 轮那条规矩就一次过：**按接口名找到声明行，再往下找第一个 `}`**，
在它前面插入成员。⇒ 结论：**探针与落地要用两种不同的定位方式**，探针可以按模式删，落地必须按名字插。

**结果**：`any-hatches` **34 → 33 处、15 → 14 文件**（`enum-window.ts` 归零）。产物与 HEAD **逐字节相同**；
`tsc` 0、`typecheck:vue` 0 new、`lint` 1603 文件 0/0，基线已固化。

## 第 55 轮（续轮）：`ParticleElementLayer` 再清 1 处 —— 35 → 34（`particle-engine.ts` 只剩 2 处）

第 54 轮那条教训（按**接口名**定位、别按行号映射）本轮直接用上了：`ParticleElementLayer` 正是
`export interface` 声明的那一个（第 54 轮踩空就是漏了它们）。补 5 个成员：

| 成员                                                          | 类型                          | 依据                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `unitWidth` / `unitHeight` / `textureWidth` / `textureHeight` | `number`                      | 读点在渲染循环（`const sw = layer.unitWidth`），赋点 `this.unitWidth = Math.floor(texture.width / data.sprite.hframes)`                                                                                                                                                                               |
| `easing`                                                      | `{ ease(t: number): number }` | 读点只有 `easing.ease(this.elapsed / this.lifetime)`。⚠️ 这里**不能**写 `Easing`：`data/transition-window.ts` 的 `Easing` 是 `export const Easing = EasingBase as …`（**值**，不是类型），所以按结构写；另外它也不该写成 `Float32Array`（同名的 `easing` 在 `ParticleLayerShape` 上才是 `Float32Array | null`，两个接口的 `easing`**不是一回事** —— 一开始照抄就吃了`Property 'ease' does not exist on type 'Float32Array'`） |

**结果**：`any-hatches` **35 → 34 处**（`particle-engine.ts` 从 8 处清到 **4 处**（第 53 轮内联 `static stage`、第 54 轮 `ParticleLayerShape` + `ParticleElementRef`、第 55 轮 `ParticleElementLayer`），只剩嵌套形状的
`ParticleLayerData`(color/sprite) 与 `ParticleElementLayerData`(area/color)）。产物与 HEAD **逐字节相同**；
`tsc` 0、`typecheck:vue` 0 new、`lint` 1603 文件 0/0，基线已固化。

> 又一条可复用的判据：**同名成员在不同接口上不一定是同一回事**（这里的 `easing` 一个是 `Float32Array`
> 一个是缓动器）。跨接口「照抄类型」之前，先把该成员的**读点**过一遍 —— 读点用什么形状，它就是什么形状。

## 第 54 轮（续轮）：`particle-engine.ts` 再清 2 处 —— 37 → 35（以及一次「接口→行号」映射踩空）

接着第 53 轮在同一文件里推进，这次挑**形状自足**的那两个接口：

| 接口                 | 处理                                                                                                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ParticleLayerShape` | 6 个方法全部来自引擎自身装配（读点就是 `layer.emitParticles(dt)` / `updateParticles(dt)`（返回计数）/ `draw(opacity)` / `updateEasing()` / `clear()` / `destroy()`）⇒ 逐个写出签名 |
| `ParticleElementRef` | 索引签名删掉后没有任何成员报错 ⇒ 纯属没人按运行时键读，直接删（连同上方的豁免注释）                                                                                                |

留着的三处仍是**嵌套形状**（`ParticleLayerData` 的 `color` / `sprite`、`ParticleElementLayerData` 的
`area` / `color`、`ParticleElementLayer`），按第 53 轮的判定不做。

⚠️ **踩空一次，记下来**：我先用 `grep '^interface '` 把「接口 → 签名行号」列了个映射表，据此删了 4 处；
结果 `tsc` 报 `ParticleElementLayer.unitWidth` 等错误 —— 因为**有些接口是 `export interface` 声明的**，
`^interface ` 根本没匹配到，映射表整体错位，删掉的是别的接口的签名。教训：

> 用 grep 建立「接口 → 行号」映射时，模式必须覆盖 `export interface`（以及 `interface X extends Y`），
> 否则行号会**整体错位**；错位后删掉的仍是合法语法（编译能过一部分），但语义已经完全不是你想改的那个接口。
> 可靠的替代：**按接口名定位**（先读该行，再在它到下一条 `^}` 之间找签名），或干脆让 `tsc` 点名成员再回头补。

本轮已回退错删的 2 处、只保留 `tsc` 证明干净的那 2 处。**结果**：`any-hatches` **37 → 35 处**
（`particle-engine.ts` 从 8 处清到 3 处）。产物与 HEAD **逐字节相同**；`tsc` 0、`typecheck:vue` 0 new、
`lint` 1603 文件 0/0，基线已固化。

## 第 53 轮（续轮）：`particle-engine.ts` 的 8 处里先做**内联的那一处**（38 → 37），其余 7 处量清了但**不做**

这个文件有 8 处索引签名，是本轮剩余文件里最多的。探针结果值得完整记下来，因为它把「看着像大活」
和「其实是大活」区分开了：

- **8 处里 7 处是独立签名行**（`ParticleLayerShape` / `ParticleLayerData` / `ParticleElementLayer` /
  `ParticleElementLayerData` 等）。删掉后 32 条报错，但按「类型.成员」去重后是 **20 个成员** ——
  乍看像 animation-player（第 52 轮，6 个成员，一轮做完）。**但这里不一样**：`data.color` / `data.sprite` /
  `data.area` 这些成员自己又是**嵌套形状**（读点里出现 `data.color.mode` / `.tint` / `.rgba` / `.min` /
  `.max` / `.startMin`…、`data.sprite.hframes` / `.vframes`、`area` 的多个字段）⇒ 实际要枚举的是
  **35–40 个成员**，且散在四层。**判定：本轮不做**，已完整回退（备份还原）。
- **第 8 处是内联的**：`static stage: { matrix: Matrix; requestRendering: () => void; [k: string]: any };`
  —— 删掉索引签名后 `tsc` 只点名 4 个成员（`scrollLeft` / `scrollTop` / `scrollRight` / `scrollBottom`，
  都是 `number`）⇒ **落地**。

> **教训（补第 52 轮那条）**：去重后的「成员数」还要再看一层 —— **成员是不是又是形状**。
> 20 个成员里有 3 个是嵌套对象，工作量就翻了近一倍。估工时看的是**叶字段数**，不是成员数。

**结果**：`any-hatches` **38 → 37 处**（该文件 8 处里清掉 1 处，剩 7 处）。产物与 HEAD **逐字节相同**；
`tsc` 0、`typecheck:vue` 0 new、`lint` 1603 文件 0/0，基线已固化。

## 第 52 轮（续轮）：`animation-player.ts` 的三处 —— 41 → 38（一轮清掉一个文件）

第 50 轮量到这个文件级联「约 24」就搁下了。本轮先用**探针**把范围收窄（删三处签名 → 一次 `tsc` →
按 `类型.成员` 去重），结果只有 **6 个成员**、8 条报错：

| 形状            | 需要补的成员                                                                                                                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AnimationData` | **一个都不用补** ⇒ 索引签名纯粹没人按运行时键读，直接删                                                                                                                                                     |
| `PlayerLayer`   | `angle: string`（`switch (layer.angle)`）· `sprite: string`（当 key 用）· `blend: string`（`setBlendMode`）· `light: string`（`Scene.showLight ? layer.light : 'raw'`）· `particleId: string`（当 guid 用） |
| `PlayerContext` | `tint?: Int16Array` —— 读点是**惰性初始化**（`let tint = this.tint; if (tint === undefined) tint = this.tint = new Int16Array(4)`，见 L787-790）⇒ 必须**可选**，否则上下文对象字面量（L668）立刻 TS2741     |

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

| 文件                                   | 形状                                          | 级联        | 判定                                                                       |
| -------------------------------------- | --------------------------------------------- | ----------- | -------------------------------------------------------------------------- |
| `particle/particle-window.ts`          | `ParticleEmitterShape`                        | **71**      | 承重（发射器字段读点遍布 `particle-motion.ts` / `animation-motion.ts` …）  |
| `composables/useCommandParse.ts`       | `CommandObjectShape`                          | **67**      | 承重（`parseVariable` / `parseActor` … 一族都读 `.type` / `.key` …）       |
| `composables/useIfConditionSchema.ts`  | `IfConditionData` + `IfConditionOperandShape` | **18 + 33** | 承重（条件数据的「按 `type` 分派」字段，第 46 轮已分析过改法）             |
| `engine/animation/animation-player.ts` | `PlayerLayer` / `PlayerContext`               | **约 24**   | 承重（`angle` / `sprite` / `tint` / `blend` / `light` 都是运行时挂上去的） |

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

| 文件                 | 形状                 | 结果                                                                                                                                                     |
| -------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `window-element.ts`  | `WindowProxyShape`   | ✅ 干净（成员都声明了，没人按动态键读）⇒ **保留删除**                                                                                                    |
| `root-element.ts`    | `PrefabElementShape` | ✅ 干净 ⇒ **保留删除**                                                                                                                                   |
| `element-classes.ts` | `UIElementInstance`  | ✗ 7 处：`tryUpdateReferenceElements`×3 / `addReference` / `draw` / `resize`×2 ⇒ 回退                                                                     |
| `ui-engine.ts`       | `UIShape`            | ✗ 约 16 处：`planToSave`×4 / `requestRendering`×4 / `hover`×3 / `renderingFunction`×2 / `controlPointTexture` / `marquee` / `updateControlPoints` ⇒ 回退 |

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

| 批次                                                                                 | 站点 | 结果                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 除 `scene-window.ts` / `YMParameterPane.vue` / `types/shapes.ts` 外的 17 个文件      | 37   | 数百个错误：`AnimationShape`(27+24+17+16+15+15+13+12…) / `UIShape`(`ui-list.ts`、`ui-file.ts`) / `ElementShape` 派生类 … 全部承重                                                                       |
| `commands/schema.ts` + `types/history.ts` + `element-classes.ts` + `root-element.ts` | 5    | `CommandSchema`/`CommandSchemaConfig` 的缺口外溢到 **约 60 个** `use*CommandSchema.ts` + 测试；`HistoryData` 缺 4 个成员；UI 元素基类缺口外溢到 `ui-engine.ts`/`element-base.ts`/`reference-element.ts` |
| 只删 `types/shapes.ts`（`DynamicShape`）                                             | 1    | **上千个**错误（`Animation`/`Scene`/`Inspector`/`Window` 全靠它动态挂字段）——第 41 轮「990 级联」的结论仍然成立                                                                                         |

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

| 文件                  | 成员 | 类型上的关键决定                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `file-script-page.ts` | 10   | `create: () => string`；`open` 是 **async** ⇒ `Promise<void>` ⇒ 立刻被 oxlint 的 `no-floating-promises` 抓住 ⇒ 调用点加 `void`（见下「产物差异」）                                                                                                                                                                                                                                                      |
| `file-font-page.ts`   | 11   | `previews: YamiElement[] & { dpr?: number }` —— 列表由 Vue 页的 `registryElements` 赋值，`dpr` 是运行时挂上去的                                                                                                                                                                                                                                                                                         |
| `file-actor-page.ts`  | 14   | 四个列表描述符共用 `ActorListDescriptor`（用**方法语法**换双变检查，`parse(item: never)` 兼容各不相同的入参）；`inventory` 写成 `ActorListDescriptor & { loadTypeItems(): void }` 而**不是**可选成员 —— 否则调用点只能写 `?.()`，产物会跟着变                                                                                                                                                           |
| `element-page.ts`     | 21   | `_elementInitialized` / `_openRetry` 声明为**可选**：它们不在字面量初值里，声明必填就得往字面量加初值（那是运行时改动）；`owner` 复用 `UIOwnerShape`；`UIElementData` 补 `id: string` 才过得了 `ScriptListInterface` 的 `{ target?: ScriptListItem }` 门                                                                                                                                                |
| `file-audio-page.ts`  | 36   | 三个具名别名描述「运行时挂字段」：`AudioWaveformPromise`（带 `canceled`）、`AudioProgressElement`（带 `percent`）、`AudioPointerElement`（带 `time`）；`dataArray: Uint8Array<ArrayBuffer>` / `intervals: Float64Array` / `intensities: Float64Array & { index: number }` 全部**照 Vue 页的真实赋值写**（`new Uint8Array(analyser.frequencyBinCount)`、`new Float64Array(64)`、`.index = 0`），不是猜的 |

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
    - `ui-kit` 的 `YMParameterPane.vue`（L164 / L201 / L970）。
      照同文件 `HTMLElement & SceneListExtensions` 的先例：声明**具名扩展接口**，把运行时挂的字段枚举进去。
2. **承重核心（必须与读侧分批改）**：`types/shapes.ts`(990) / `data/data-object.ts`(600) /
   `scene/scene-window.ts`(296) / `particle/particle-window.ts`(71) / `engine/particle/particle-engine.ts`(62) /
   `types/history.ts`(31) / `stores/ui.ts` + `engine/ui/ui-engine.ts`。
3. **口径缺口仍待决定**：`Record<string, any>`（35 处 / 31 文件）是否纳入本轴；
   以及上面三处「真问题」要不要修（都需要一次实机回归）。
    > 〔第 62 轮补注〕`Record<string, any>` **已决定纳入**（见文末交接节）；三处「真问题」仍待决定。

## 第 44 轮（续轮）：`any-hatches` 56 → 52 —— 四个 inspector 单点，和一条被实测推翻的假设

本轮先把**剩下所有「单点」文件一次性删签名、跑一次 `tsc` 归因**（第 41 轮用过的批量法），
再按级联来源分三类：能枚举的当场做、承重的回退、形状待查的记进工作单。

| 文件（删签名后）                      | 级联 | 判定 / 处理                           |
| ------------------------------------- | ---- | ------------------------------------- |
| `inspector/file-audio-page.ts`        | 80   | 见「下一轮工作单」第 1 条             |
| `inspector/element-page.ts`           | 50   | 同上                                  |
| `inspector/file-actor-page.ts`        | 26   | 同上                                  |
| `inspector/file-font-page.ts`         | 26   | 同上                                  |
| `inspector/file-script-page.ts`       | 23   | 同上                                  |
| `inspector/file-scene-page.ts`        | 15   | ✅ 本轮枚举（**级联数被高估**，见 ①） |
| `inspector/element-container-page.ts` | 0    | ✅ 本轮枚举                           |
| `inspector/element-button-page.ts`    | 0    | ✅ 本轮枚举                           |
| `inspector/file-trigger-page.ts`      | 1    | ✅ 本轮处理（`any` → `unknown`）      |

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

| 文件                        | 处理                                                                                                                                                                                                                                           |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `element-container-page.ts` | 6 个成员；`owner` 直接复用 `ui-owner.ts` 已导出的 **`UIOwnerShape`**（3 成员）—— 两处 `owner: any` 从此是同一份契约                                                                                                                            |
| `element-button-page.ts`    | 7 个成员；`create` 的返回是 **`Omit<UIButtonData, 'instances'>`**（`instances` 由运行时补，写成 `() => UIButtonData` 立刻 TS2322）                                                                                                             |
| `file-scene-page.ts`        | 9 个成员；顺带删掉 **`FileSceneData` 的 `[k: string]: unknown`** —— 它只是「允许额外字段」，而该类型在本文件里只作形参/返回标注、没有任何动态键读取；删掉后 `Codec.encodeScene` 的返回（codec 私有的 `SceneData`）才赋得进 `create` 的返回类型 |
| `file-trigger-page.ts`      | 索引签名**有意保留**（`update()` 按运行时键分派，键来自属性面板），只把 `any` 降成 `unknown`；连带修掉「联合键写入」这个新坑（③）                                                                                                              |

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
   _两边注释里都写了「成对维护」_，免得下次只改一边。
2. **`parent` 的类型是节点自身**（`parent?: SceneItem`），不是 `{ children: … }` —— 因为 `check(folder.parent)` 要把父节点当节点用；读点补 `!`（3 处，都是「已在树里」的路径）。
3. **运行时键改用 `Reflect`**：`node[key]` / `folder[key]` / `item[key]` 共 **6 处**（`restoreRecursiveStates`、`setRecursiveStates`、`updateFolderState`）改成 `Reflect.get/set(node, key, …)`。
   这样**不需要**给整个类型挂索引签名（那会连门面赋值一起卡住），也**不需要**任何 `as unknown as`（会撞 `unknown-casts` 轴）。

另外两处 `?? []` 兜底：`folder.children` / `item.children`（叶子/空文件夹本来就没有 children —— 原来会抛「undefined is not iterable」，现在是空循环，语义更正确）。

**验证**：`scene-window.ts` 产物与 HEAD **逐字节相同**（纯类型层）；`scene-list.ts` 的差异**逐条核对过**，恰好是上面那 11 行（6 处 Reflect + 2 处 `?? []` + 3 处断言，断言在产物里不可见）。`tsc` 0、`check-vue-types` 0 new、`lint` 0/0。

## 第 42 轮（续轮）：`any-hatches` 61 → 58（`LightData` 枚举 + `HomeShape.state`）

| 文件                                | 处理                                                                                                                                                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scene/light.ts`（`LightData`）     | ✅ 按实测读点枚举 6 个成员：`red`/`green`/`blue`/`intensity`（`drawPointLight` 里参与算术）、`blend: string`（`gl.blend` 就是 string，见 `webgl-methods.ts`）、`mask: string`（`Scene.textures` 的键）；产物**逐字节相同** |
| `title/home-page.ts`（`HomeShape`） | ✅ 补 `state: string` + 字面量 `state: 'closed'`。store 侧其实早就写了 `homeStateKeys: (keyof HomeShape)[] = ['state']` —— 也就是说这条**类型一直在等这个字段**；产物差异恰为新增的一行 `state: "closed",`                 |
| `title/__tests__/home-init.spec.ts` | 顺手修正：mock 原本把 `Home.state` 重置成 `null`（旧类型是 `any` 才允许），现按 store 的初值改成 `'closed'`                                                                                                                |

**`scene/scene-list.ts` 的 `SceneItem`：本轮量清但没做**（留下批）。删掉索引签名后 32 个错误分三类：

1. 可枚举成员 `name` / `shortcut` / `parent` / `children` ✓；
2. `restoreRecursiveStates` / `snapshotStates` 按**运行时键**读写（`node[key]`）⇒ 需要索引签名或断言；
3. 真正卡住的是：给 `SceneItem` 加索引签名后，**store 侧 `SceneListItem` 门面赋值**（`Scene.list.copy` 等 6 处）全部报 TS2322 —— 因为「没有索引签名的类型」不能赋给「有索引签名的类型」。

⇒ 正确做法是**两边一起枚举**（`SceneItem` 与 store 的 `SceneListItem` 同步补齐 `name`/`shortcut`/`parent`/`children`），再加一处局部断言处理运行时键；本轮只把这条写进工作单，避免半改。

## 第 41 轮（续轮）：`any-hatches` 再清 3 处 —— 64 → 61

方法同前：**逐批删签名 → tsc/vue-tsc 点名 → 按真契约处理**。本轮把 8 个单点文件一起删、再按错误来源回退，一次 tsc 就量出了这批的承重情况：

| 文件                                  | 级联        | 处理                                                                                                                                                                                       |
| ------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data/data-object.ts`（`DataModule`） | **600**     | 承重 ⇒ 回退（全局数据模块，读点遍布全仓）                                                                                                                                                  |
| `stores/ui.ts`（`UINodeShape`）       | 72 的一部分 | 承重 ⇒ 回退                                                                                                                                                                                |
| `engine/ui/ui-engine.ts`（`UIShape`） | 72 的一部分 | 承重 ⇒ 回退                                                                                                                                                                                |
| `enum/enum-window.ts`（`EnumModule`） | 29 的一部分 | 承重 ⇒ 回退                                                                                                                                                                                |
| `scene/light.ts`（`LightData`）       | 29 的一部分 | **可枚举**（`blend`/`red`/`green`/`blue`/`intensity`/`mask`）⇒ 留下一批                                                                                                                    |
| `title/deploy-project-window.ts`      | 4           | ✅ manifest 的键本来就都声明了，索引签名只是让**字符串循环变量**通过 ⇒ 两处循环加 `as DeploymentGroupKey[]` / `as DeploymentListKey[]`（12 个分组键 / 5 个数组键）；循环键从此也被类型检查 |
| `local/local-window.ts`               | 11 的一部分 | ✅ `LocalizationShape` 补 `state: string`（与 `localizationStateKeys = ['state','strings']` 对齐）                                                                                         |
| `title/menu-bar.ts`                   | 11 的一部分 | ✅ `MenubarShape` 补 `state: string`，并给 `Menubar` 字面量补初值 `state: 'closed'`（与 store 的 `shallowRef('closed')` 一致）                                                             |

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

| 轴                                                  | 开轮基线          | 现在          | 说明                                                          |
| --------------------------------------------------- | ----------------- | ------------- | ------------------------------------------------------------- |
| `null-casts`（遗留单例形状）                        | 28                | **0**         | 第 26 → 36 轮清完，第 36 轮归零                               |
| `unknown-casts`（双重断言）                         | 799（口径修正后） | **764**       | 随 `null-casts` 一并下降                                      |
| `any-hatches`（泛型逃生口）                         | 70                | **64**        | 第 38 轮 5 处、第 39 轮 1 处                                  |
| `dom-pending`（待迁移 DOM 用法）                    | —                 | **0**         | 白名单单一真源（`.oxlintrc.json` ↔ 台账）无漂移               |
| `dom-whitelist-drift` / `dom-whitelist-unjustified` | —                 | **0 / 0**     | 白名单 14 条，条条有理由                                      |
| `stale-exemptions`                                  | —                 | **0**         | 陈旧豁免注释 0                                                |
| `ui-slot-coverage`                                  | —                 | **0**         | store 引用的 UI 槽位均有赋值方（declared 134 / assigned 153） |
| `unremovable-listeners`                             | 9                 | 9（**不增**） | 该轴只要求不增                                                |

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

| 项                    | 现状              | 下一步怎么走                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `any-hatches`         | 64 处 / 35 文件   | 按第 39 轮的量化排序：① `YMParameterPane.vue` 的 **71** 个动态成员读点（需要把 `attachStateAccessors` 挂的字段枚举进类型）；② 三个「全局/核心形状」`types/shapes.ts`（`DynamicShape`，全删引发 990 个错误）、`types/history.ts`（`HistoryData`，31 个错误）、`particle/particle-window.ts`（`ParticleEmitterShape`，71 个错误）—— 必须与读侧分批改；③ 其余按「删签名 → tsc/vue-tsc 点名 → 逐个枚举」推进 |
| `legacy-ui-lines`     | 2868 行 / 10 文件 | 阶段 1c：`src/ui/` 是 8 个域模块 + 1 个接线文件（附录三有拆分账）。收尾顺序见文末「删完之后应该发生什么」                                                                                                                                                                                                                                                                                                |
| `legacy-ui-refs`      | **1**（第 94 轮 2 → 1） | ✅ **阶段 1c 第 ① 步已落地**：`window-cluster.ts` 那行 `export { UI }` 已删，`UI` 改由三处内联 `import()` 直连 `engine/ui/legacy/ui-window.ts`（`await clusterReady` 原样保留 ⇒ 可证行为等价）。⚠️ 原先这里写的「改为直连 `ui-engine.ts`」是**不能执行的写法**（循环 + `UI` 会变成命名空间对象，见上文纠偏）；且本轴**只数静态依赖**，数不到那三处，④ 收尾手工核对 |
| `Record<string, any>` | 35 处 / 31 文件   | ✅ **已解决（2026-09-20 第 62 轮）**：口径已扩展并入 `any-hatches`，该轴随之 **32 → 67**，并显式记入新基线。理由：它与索引签名是**同一个逃生的两种写法**，只数一种的话把 `[k: string]: any` 改写成 `Record<string, any>` 就能凭空「归零」                                                                                                                                                                |

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

1. ~~**`Record<string, any>` 是否纳入 `any-hatches` 口径**~~ —— ✅ **已决定并落地（第 62 轮）**：纳入。口径扩展后该轴 32 → 67，并显式记入新基线（理由：两种写法是同一个逃生）。
2. **阶段 1c 的实机回归**：`legacy-ui-refs` 1 → 0 与 `legacy-ui-lines` 2868 → 0 是运行时高危改动，需要能启动编辑器、逐个窗口点一遍的环境（附录四、六、七、八、九记的都是这类改动曾经造成的静默失效）。

**另外**：本轮所有迁移改动都在**工作区**（HEAD 是 `9d19bb91 build(deps): bump vue to rc.9…`，即 rc.9 事务本身已提交）—— 是否分批提交由你决定。

## 交接（第 62 轮 · 2026-09-20）：**当前**真实数字与工作单

> 本节原为「第 47 轮」的交接，**第 62 轮在其上刷新**（补 `ui-singleton-members` 轴、
> 扩 `any-hatches` 口径、修两处「仪器瞎了」的写死路径）。下面各小节的**表格数字**是第 62 轮实测；
> 其中的**逐文件工作单与教训**仍是第 47–61 轮沉淀的，依然有效。
> 更早两节「交接（第 40 轮）」「交接（第 47 轮）」的数字已过时，保留作历史；**以本节为准**。
>
> ⚠️ 本文件里**任何数字**都请跑 `pnpm migration:ledger` 复核。本轮就抓到一次转录事故：
> 台账表格列宽不足时相邻两列会**粘连**成一串，有人把 `…engineBacked=7` 后面的
> `0 declared=…` 读成了「engineBacked=70」并抄进了 `xr.md`（真值 **7**）。该渲染缺陷已修
> （每列加尾随空格），但「以脚本输出为准」这条纪律不能省。

### 一、台账现状（14 轴，`pnpm migration:check` 全平）

> 数字刷新于 **2026-09-21 第 89 轮**（全 14 轴脚本重测）。**以 `pnpm migration:ledger` 输出为准。**
>
> ⚠️ 本表此前记的是**第 62 轮的快照**，其中 4 行到第 89 轮已过时（`any-hatches` / `unknown-casts` /
> `legacy-ui-lines` / `legacy-ui-refs`）。**「刷新于」这句话必须和表里每一行同时成立** ——
> 否则它就成了一句看起来权威、实际误导的话。

| 轴                                                                                                            | 现值（第 89 轮实测）                                          | 目标                              |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------- |
| `any-hatches`                                                                                                 | **52 处 / 26 文件**（索引签名 32 + `Record<string, any>` 20） | 归零                              |
| `unknown-casts`                                                                                               | **136 处 / 109 文件**（第 48 轮从 764 降下来）                | 归零                              |
| `ui-singleton-members`                                                                                        | **103 处 / 8 文件**（`declared=134`）—— 第 62 轮新增的替代轴  | 归零（与 `legacy-ui-lines` 同时） |
| `legacy-ui-lines`                                                                                             | **0 行 / 0 文件**（第 66 轮纯移动已收口）                     | ✅ 已归零                         |
| `legacy-ui-refs`                                                                                              | **0**（第 66 轮已收口）                                       | ✅ 已归零                         |
| `null-casts`                                                                                                  | 0                                                             | ✅ 已归零                         |
| `dom-pending` / `dom-whitelist-drift` / `dom-whitelist-unjustified` / `stale-exemptions` / `ui-slot-coverage` | 0                                                             | ✅ 已归零                         |
| `dom-on-exempted` 120 · `dom-whitelist-size` 14 · `unremovable-listeners` 9                                   | 持平                                                          | 不增                              |

> ⚠️ **`legacy-ui-lines` / `legacy-ui-refs` 归零 ≠ 阶段 1c 收口。** 这两条是**目录口径**，
> 第 66 轮的**纯移动**（`src/ui/` → `src/engine/ui/legacy/`）就会让它们读到 0，而遗留代码**一行没少** ——
> 这正是第 62 轮要补 `ui-singleton-members` 替代轴的原因。**1c 真正未完成的证据是
> `ui-singleton-members` 仍是 103 处 / 8 文件、`declared` 仍是 134。**

> **`any-hatches` 剩下的 15 个文件 / 32 处 —— 与下面的表逐字对账过**（第 89 轮用
> `node scripts/any-hatch-inventory.mjs --axis` 重测；该脚本与台账共用 `scan.mjs` 的口径）。
> 此前本行写的是「14 个文件」，**与它正下方那张表并不一致**：表里列了 15 行，缺的是
> `composables/commands/useSetStringCommandSchema.ts` 的 `SetStringOperand`（1 处，第 62 轮漏记）。
> ⇒ **处数（32）一直是对的，文件数（14）是错的。**「按接口名而不是行号定位站点」这条要求不变。
>
> ⚠️ **上表 15 个文件 / 32 处只覆盖「索引签名」这一种写法。** 本轴还有另一种写法
> `Record<string, any>`（**20 处 / 13 文件**），合起来才是台账里的 **52 处 / 26 文件**。
> 只照上表清，清完仍会剩 20 处 —— 那 20 处的清单见下方「下一批工作单」第 1 条：
>
> | 文件                                 | 处数  | 所属接口（`any-hatch-inventory` 输出）                                                                                                                                         |
> | ------------------------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
> | `scene/scene-window.ts`              | **5** | `SceneShape`×3（L74 声明）+ `PresetNodeShape` + `SceneMarqueeData`；marquee 待对齐 `saveData` 两个写入方，list 需 19 签名 / 45 处 `!`                                          |
> | `engine/particle/particle-engine.ts` | **3** | `ParticleLayerData` / `ParticleEmitterShape` / `ParticleElementLayerData` —— 要枚举 **35–40 个叶字段**（`data.color` / `data.sprite` / `data.area` 自身又是形状），级联实测 62 |
> | `particle/particle-window.ts`        | **3** | `ParticleElementShape` / `ParticleLayerShape` / `ParticleEmitterShape`，级联实测 71                                                                                            |
> | `ui-kit/.../YMParameterPane.vue`     | **3** | ⚠️ **第 130 轮更正：这一行的归属是错的。** 旧 `any-hatch-inventory` 按「往上找最近的 interface」归属，把该文件的站点记成了 `Props`（L130 接口）—— 但那几处**都不是 `Props` 的成员**：`L164` 是组件内的 `let el`、`L201` 是 `attachStateAccessors` 的**形参**、`L982` 是 `self`（`Props` 的成员只在 `L135`，即 `dataManifest` 的返回值）。旧工具已修（按站点自身文本分 `INDEX_SIG` / `RECORD_ANNOT`，常量与局部归给它们自己），现输出为 `Props`(L135) / `el`(L164) / `attachStateAccessors`(L201) / `getManifest`(L245) / `self`(L982) —— **5 处**，不是 3 处。详见 `xr.md` 第 130 轮第八节。 |
> | `animation/animation-window.ts`      | **3** | `AnimationElement` / `AnimationFileContext` / `AnimationShape`                                                                                                                 |
> | `composables/useCommandParse.ts`     | **3** | `CommandObjectShape` / `CommandNode` / `TextContent`，级联实测 67                                                                                                              |
> | `ui/ui-window.ts`                    | **3** | `UIShape` / `UINodeShape` / `UIContextShape`                                                                                                                                   |
> | `commands/schema.ts`                 | **2** | `CommandSchemaConfig`，外溢约 60 个 `use*CommandSchema`                                                                                                                        |
> | `engine/ui/element-base.ts`          | **2** | `UIElementShape` / `UIParentShape` —— 第 61 轮试过并回退（见下）                                                                                                               |
> | `data/data-object.ts`                | **1** | `DataModule`（读点遍布全仓）                                                                                                                                                   |
> | `engine/ui/element-classes.ts`       | **1** | `UIElementInstance` —— 第 56 轮试过并回退（见下）                                                                                                                              |
> | `engine/ui/ui-engine.ts`             | **1** | `UIShape` —— 第 57 轮试过并回退（见下）                                                                                                                                        |
> | `stores/ui.ts`                       | **1** | `UINodeShape`                                                                                                                                                                  |
> | `types/shapes.ts`                    | **1** | `DynamicShape`（独立实测级联**上千**，承重之首）                                                                                                                               |
>
> 其中 `DynamicShape` 与 `UIShape` / `UIElementInstance` / `DataModule` / `SceneShape` / `AnimationShape`
> 是**读点遍布全仓**的承重形状，**必须与读侧分批改** —— 且正是 `unknown-casts` 剩下 292 处的同一批类型。
>
> **`element-classes.ts` 的 `UIElementInstance`（1 处）单独记一笔**（第 56 轮试过、已回退）：它缺的是
> `draw()` / `resize()` / `tryUpdateReferenceElements(parent)` / `addReference(prefab)` 四个方法，
> 但**形参类型跨了三个文件**：调用点分别传 `UIElementInstance`（`element.parent`）、
> `element-base.ts` 自己的 `UIElementShape`（`this`）、`UIParentShape`（`this.parent`）、
> `PrefabElementShape`（`this.prefab`），而实现写在 `root-element.ts`：
> `addReference(prefabElement: PrefabElementShape | null)`、
> `tryUpdateReferenceElements(element: PrefabElementShape | this | null)`。
> ⇒ 正确做法是**把这套共享形状抽出来导出**（`PrefabElementShape` 目前没导出），两边都用它；
> 在调用点加单断言的话还要额外 `import type`（擦除、无循环依赖），且要过一遍实现侧的参数检查。
> **别在轮末硬塞**——这是一次小小的类型设计决定，不是机械枚举。
>
> **`engine/ui/ui-engine.ts` 的 `UIShape`（1 处）同理**（第 57 轮试过、已回退）：7 个成员里 4 个是现成的
> （`planToSave` / `requestRendering` / `updateControlPoints` 可空方法，另有 `renderingFunction`
> 实际签名是 `(deltaTime: number) => void`），但 `controlPointTexture` / `marquee` / `hover`
> 会把 WebGL 侧的形状拉进来 —— 报错落在 `ui-engine.ts` L554（`.instance` on `{} | undefined`）与
> L653（`.base` on `{}`）⇒ 得先把这几个成员的真实形状（贴图/选框对象）追出来。
> 记法：**凡是"某个成员的类型要把另一个子系统的形状拉进来"，就先停手**。

### 二、下一批工作单（都带**实测**成本，不是估的）

> **第 89 轮补记：本工作单此前只覆盖了「索引签名」那一半。** `any-hatches` 有两种写法，
> 上表 15 文件 / 32 处是索引签名；另有一半是 `Record<string, any>`，**20 处 / 13 文件**，
> 而原工作单**一处都没列**。只照原单清，清完台账仍停在 20。故新增下面第 1 项列全。

1. **`Record<string, any>` 20 处 / 13 文件**（第 89 轮实测，按可做性分三组；**下列 20 条与
   「`Record<string, any>` 站点清单」逐条对账，不重不漏**）：
    - **A 组 · 引擎命名空间对象 `export const Xxx: Record<string, any> = {}`（10 处）** ——
      与第 65 轮定的判据同一族，可照做：先数 `XxxEngine.foo = function (this: typeof Y)` 真正
      读/写了 `Y` 的哪几个字段，**个位数就走本地窄类型，一轮拿下**。
      `engine/animation/animation-window-engine.ts:12` · `engine/palette/auto-tile-engine.ts:21` ·
      `engine/palette/palette-engine.ts:20` · `engine/particle/particle-engine.ts:12` ·
      `engine/scene/scene-camera-engine.ts:9` · `engine/scene/scene-marquee-engine.ts:16` ·
      `engine/ui/ui-engine.ts:24` · `palette/auto-tile.ts:49` · `palette/palette.ts:4` ·
      `palette/tile-frame-index.ts:13`。
      ⚠️ **以脚本清单为准，本行只是导航**（10 条路径 = 10 处；`engine/palette/palette-engine.ts`
      与 `palette/palette.ts` 是**两个不同的对象**，各算一处）。行数请以
      `node scripts/any-hatch-inventory.mjs --axis` + 台账逐文件计数复核。
      ⚠️ `scene-camera-engine` / `scene-marquee-engine` 是第 65 轮实测过的**真承重**（≈30 个字段、
      含 `this.scrollLeft = …` 写入），按判据属「整片留到最后」，别当白捡。
      ⚠️ `ui-engine.ts:24` 与 `useSetStringCommandSchema.ts:15` 顶上各有一行
      `// oxlint-disable-next-line no-explicit-any`：**删签名时必须一并删掉豁免注释**，
      否则 `stale-exemptions` 轴会多出一处陈旧豁免（第 38 轮已立此规矩）。
      > ✅ **第 131 轮：`auto-tile-engine.ts` 已拿下（`any-hatches` 50 → 49）。**
      > 做法=本地成员表 `AutoTileEngineShape` + `{} as`（5 个实现一行不动），豁免注释与签名同时删，
      > `stale-exemptions` 实测保持 0。
      > **A 组 10 处的挂载点个数（第 131 轮实测，按 `^\s*\w+\.\w+\s*=\s*(function|\()` 去重计数）**：
      > `animation-window-engine` **29** · `palette-engine` **22** · `particle-engine` **3**
      > （⚠️ 第 63 轮试过并回退：成员引用文件下方的 class —— **别重试**）· `scene-camera-engine` **12** ·
      > `scene-marquee-engine` **10**（后两者本行已警告「真承重」）· `ui-engine` **25**（④ 相关）·
      > `palette/auto-tile` **47** · `palette/tile-frame-index` **13** · `palette/palette` **0**
      > （成员分散在**其他文件**里挂 ⇒ 组装式单例，与 `SceneShape` 同类）。
      > ⇒ **「个位数就走本地窄类型」这条判据在这 10 处里只对 1 处成立**（已拿下）；其余属于
      > 「逐成员枚举」那一档，别按「一轮一个」估工期。
      > ⚠️ **附带发现（值得单独记）**：成员一旦有类型，`typescript(unbound-method)` 会在**搬运点**
      > 报出来（`AutoTile.updateCanvas = AutoTileEngine.updateCanvas` 那 5 行）—— `any` 时代这个信号
      > 被一起吞掉了。**修法是把成员写成函数属性**（`x: (this: T, …) => R`）而不是方法简写，
      > 别加 disable 注释。⇒ 类型轴的汇报口径应包括「lint 是否因此能看见新东西」。
      > ✅ **第 132 轮：`scene-marquee-engine.ts` 也已拿下（`any-hatches` 49 → 48）**，手法同上
      > （10 个成员，函数属性写法，零级联）。
      > ❌ **`scene-camera-engine.ts` 第 132 轮试过并回退** —— 本行「真承重」的警告**是对的**，
      > 而第 132 轮一开始的假设（「那句话说的是窗口，引擎成员表应该很便宜」）**在 camera 上错了**。
      > 依据：声明成员表之后 `tsc` 报 `scene.spec.ts(399,65) … is not assignable to parameter of type
      > 'SceneShape' … missing … page, head, body, searcher, and 18 more` —— 因为该 spec 第 361 行用
      > `vi.mock('@app/scene/scene-window.ts', () => ({ Scene }))` 把窗口换成了**部分 mock**，
      > 而 camera 成员的 `this` 是 `typeof Scene` ⇒ 类型一落地，`.call(Scene, …)` 就要求那个 mock
      > 满足**整个** `SceneShape`。要让它们可被 mock 满足，得给 8 个成员各写**只含它真正读的字段**的
      > 本地窄 `this`（5–15 个字段/个，还牵到 `this.getGridContext()` 这类方法）—— 那才是真成本。
      > ⇒ **判据修正**：看 `this: typeof Y` 里的 **Y 是不是「调用点/测试手里本来就有的那个对象」**，
      > 而不是看成员个数。marquee 的 `this` 是 `Scene.marquee`（测试直接传它）⇒ 便宜；
      > camera 的 `this` 是 `Scene`（测试传部分 mock）⇒ 贵。详见 `xr.md` 第 132 轮。
      > 🔎 **第 133 轮把这条判据落成了一张表（每个引擎 spec 的 mock 形态实测）**：
      > `auto-tile-engine` 5 ✅（无 `.call` 点）· `scene-marquee-engine` 10 ✅（真 `Scene.marquee`）·
      > **`palette-engine` 22 🟡（spec 里是 `const palette: any = {…}` ⇒ cascade 无风险，剩下 22 个签名的抄写活）** ·
      > `scene-camera-engine` 8 ❌（具体部分 mock，已回退）· `animation-window-engine` 29 ❌（`vi.mock` 返回
      > 具体对象字面量，预计同 camera）。
      > ⇒ **下一处该拿 `palette-engine`**。
      > ✅ **第 134 轮：`palette-engine.ts` 已拿下（`any-hatches` 48 → 47）** —— 风险表直接生效：
      > 20 个成员写成函数属性成员表 + `{} as`，实现一行不动，豁免注释与签名同删（`stale-exemptions` 0）。
      > ⚠️ **计数更正：这处是 20 个成员，不是 22** —— 第 133 轮表里的「22」是按**赋值行**数的，
      > 按**唯一成员名**去重后是 20（差的 2 个是成员体里 `this.xxx = (…)` 这类带括号的赋值被误计；
      > 与第 132 轮 camera「12 → 8」同一个坑）⇒ **量成员数一律按唯一名字去重。**
      > ⚠️ 剩余仍未动的：`scene-camera-engine`（❌ 已试过并回退）、`animation-window-engine`（29 个成员，
      > 其 spec 用 `vi.mock` 返回具体对象字面量 ⇒ 预计同 camera）、`ui-engine`（25，属 ④）、
      > `particle-engine`（3，第 63 轮已回退：成员引用文件下方的 class）。
      > 也提醒一句：**类型可以前向引用、class 不可以** —— 这是 `particle-engine` 回退的原因，
      > 也是 `palette-engine` 能在文件顶部声明成员表的依据。
      > 🔎 **同一轮还给 `UINodeShape` 的索引签名做了决策就绪的复量**（新工具
      > `scripts/oneoff/measure-any-hatch-site.mjs <路径> <行号>`，按站点种类用对应摘法、单独摘、
      > 单独跑 tsc、自动写回并逐字复核）：`element-classes.ts:141` 摘掉后 **79 条全是 TS2339**，
      > 分布在 20 个字段 / 10 个文件（`transform` 14 · `instance` 13 · `presetId` 13 · `instances` 10 ·
      > `enabled` 6，其余 15 个字段合计 23）。⚠️ **这一阶段 `0` 条可空解引用** —— 计划里那句
      > 「14 处 `matrix`/`parent` 可空被直接解引用」**要等字段声明之后**才浮出来
      > ⇒ 「79 处」里**有一步需要实机裁决**，不是纯机械补声明。这一处仍按计划与 ④ 一起处理。
      > ⚠️ **同轮两个附带结论**：
      > 1. 那把尺子对 `type X = Record<string, any>`（类型别名）**拒绝测量**（换任何具体类型都会改变
      >    结果 ⇒ 属设计工作）——「量不出来」本身就是结论，它把该站点从「待测量」划到「待设计」
      >    （第 89 轮的工作单正是这么标的）。参考值：`palette/tile-frame-index.ts:13` 摘注解后
      >    **82 条、错误码混杂**（2339/2322/2769/2721/2345/2531/2349）⇒ 贵；
      >    `auto-tile-engine` / `scene-marquee-engine` 当时是**零报错**。
      > 2. **全仓 172 个文件带 UTF-8 BOM**（扫描面全扫；`composables/commands/*` 几乎整族都在里面）
      >    —— 对工具链无害且**没有任何门禁看得见**，但它让「BOM 有无」成为 diff 噪声源。
      >    两条处理路线（一次性剥 172 个 / 加一条 `bom-files`「不增」轴先止住扩散）**都等人决定**，
      >    见 `xr.md` 第 133 轮第七节。⚠️ 第 125 轮「机械改写收尾清单：查行尾/BOM」那条要按此更新：
      >    **仓库不是纯无 BOM**，抽查自己动过的文件推不出全仓状态。
    - **B 组 · 型态变体（6 处，各需单独设计）**：
      `particle/particle-window.ts:49`（`Array<Record<string, any>> & { count: number }`）·
      `particle/particle-window.ts:253`（`stage`）·
      `scene/scene-window.ts:1365`（`(Inspector as Record<string, any>)[key]` 动态取键）·
      `composables/commands/useSetStringCommandSchema.ts:15`（`type SetStringOperand` ——
      **9 个用法全在本文件内**，是「枚举真成员」的好候选）·
      `ui-kit/.../YMParameterPane.vue:135` 与 `:245`（`guidMap`；`.vue` 只能靠 `typecheck:vue` 量）。
    - **C 组 · 已注明「承重，别顺手删」（4 处）**：`services/file-system/fs-bridge.ts:29`（`FSP` ——
      底下曾压着一个必崩的 `existsSync` 调用）· `services/project/setting-config/index.ts:16` ·
      `stores/data.ts:149` · `engine/ui/element-classes.ts:68`（`UIElementCtor`）。
      **动之前先读该处注释**，它们各自写着为什么不能直接删。
2. **`Scene.list`**（`scene/scene-window.ts` L80 声明 + L470 初始化，2 处）：索引签名兜住的是
   `SceneListExtensions` 之外的约 19 个成员（`addNodeTo / canSwitchState / createFolder /
createTilemapShortcutItems / data / deleteNode / duplicate / generateUniqueName / getItemByProperties /
read / resize / restoreSelection / saveScroll / saveSelection / scrollTop / searchNodesDebounced /
select / selectDefaultCommand / unselect / update / updateFolderState / updateItemName / updateNodeElement`）。
   成本：19 个签名 + 调用点 **45 处缺 `!`**（已有 9 处）。
   ⚠️ **不能**直接拿 `ui-kit` 的 `TreeListElementApi` 当这个类型：它的兜底是 `[k: string]: unknown`，
   接上去会让 `addNodeTo` 之类变成 `unknown` 而不可调用。
3. **`Scene.marquee`**（L75 + L164，2 处）：先对齐 `saveData` 的**两个写入方** ——
   `scene-marquee-engine.ts` 写 `{x,y,width,height,offsetX,offsetY,tiles}`，而 `palette-engine.ts`
   读 `width/height/rowOffset`（后者根本不在前者的形状里）；对齐后约 12 处 `!`。
   成员清单见第 47 轮。⚠️ `scene.spec.ts` 的 marquee mock 是 `as any`：**类型写错测试不会红**。
4. **`YMParameterPane.vue`**（3 处）：`.vue` 对 `tsc` 不可见，只能靠 `typecheck:vue` 量；
   按 `attachStateAccessors` 挂上去的字段清单枚举。
5. **核心形状（承重，必须与读侧分批）**：`types/shapes.ts` 的 `DynamicShape`（独立实测仍是**上千**级联）、
   `data/data-object.ts`(600)、`scene/scene-window.ts` 的 `SceneShape`(296)、
   `engine/animation/animation-window.ts` 的 `AnimationShape`、`ui/ui-window.ts` 的 `UIShape`、
   `particle/particle-window.ts`(71)、`engine/particle/particle-engine.ts`(62)、
   `stores/ui.ts` + `engine/ui/ui-engine.ts`。
   ⚠️ 这批正是 `unknown-casts` 剩下 292 处的**同一批类型**：两侧类型相容之后，两条轴会一起下降。
6. **阶段 1c**（`legacy-ui-lines` 2866 → 0、`ui-singleton-members` 103 → 0、`legacy-ui-refs` 1 → 0）：
   运行时高危，**必须实机回归**（附录四/六/七/八/九记的都是这类改动造成的静默失效）。
   ✅ **前置条件已就绪**：`ui-singleton-members` 替代轴第 62 轮已落地（见文末），
   `ui-slots.mjs` 的两处写死路径也已改为动态定位，搬运不会再让仪器失明或制造假回归。

    ⚠️ **顺序必须改**：原文附录三写的 ①→②→③→④ **按字面执行会打断运行时**。
    ① 说「`stores/ui.ts` 的 `loadUI` 改为直连 `ui-engine.ts`」——但 `loadUI` 决定惰加载代理
    解析到谁，而 `ui-engine.ts` 只实现 **21** 个成员、store 引用 **49** 个槽位，
    先做 ① 会让 **41 个动作在 `UI?.x?.()` 下静默 no-op**。正确顺序是
    **B（纯移动）→ C（逐域补槽位）→ D（换接线 + 退场）**。

### 三、门禁（本地 = CI 同一套；第 47/48 轮全部跑绿）

> 站点归属先跑 `node scripts/any-hatch-inventory.mjs [--axis]`：它按站点行往上找最近的 interface 声明，
> 输出「文件:行 + 接口名 + 是否 `export`」，口径与台账一致（第 58 轮新增；动机是第 54 轮漏掉 `export interface` 的那次错位）。

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

1. ~~`Record<string, any>`（35 处 / 31 文件）是否纳入 `any-hatches` 口径~~ —— ✅ **已纳入（第 62 轮）**：基线 32 → **67**（含该写法 35 处 / 31 文件）。
2. 第 45 轮记的三处真问题要不要修 —— `element-page.ts` 的 `_openRetry` 首次 `open` 其实不重试、
   `file-audio-page.ts` 未移动就点进度条会把 `undefined` 交给 `currentTime`、
   `progressPointermove` 的 `this` 标注与运行时不一致。三处都会**改变行为**，需要一次实机回归。
3. 阶段 1c（`src/ui/` 搬迁 + 换接线）的实机回归安排在什么时候。

## 删完之后应该发生什么

> 数字为 2026-09-20 第 62 轮实测（此前本节写的 2820 / 4 是阶段 1b 前后的快照）。

- `legacy-ui-lines` 轴：**2866 行 / 10 文件** → 0
- `legacy-ui-refs` 轴：**1 → 0**（唯一剩项是 `tools/window-cluster.ts` 的 `import { uiWindowReady }`）

> **〔第 94 轮补注〕** 上面这行原先写的是「唯一剩项是 `tools/window-cluster.ts:2` 的
> `export { UI }`」—— 那句话**已被第 ① 步兑现**（那行再导出已删，轴 2 → 1）。现在剩下的
> 是 `clusterReady` 对 `uiWindowReady` 的等待，它属于**正当依赖**，要随 ④ 一起走。
> 别把「轴读到 1」当成「只剩一个耦合点」：① 之后 `UI` 由三处**内联 `import()`** 取，
> 而这条轴只数静态依赖、看不见它们（口径已在 §1 的表里写明）。

### ✅ 替代轴已落地：`ui-singleton-members`（第 62 轮）

**这是第 62 轮发现的度量漏洞，当轮即已修复。** `legacy-ui-lines` 的口径是**目录行数**：

```js
const dir = join('packages', 'editor', 'src', 'ui');
const files = collectFiles({ dirs: [dir], includeTests: true });
```

⇒ 阶段 1c 的第 ② 步（把 8 个域模块**原样搬到** `engine/ui/`）会**立刻把这条轴打到 0，
而遗留代码一行都没少。实测 `collectFiles` 对不存在的目录返回 `[]`（不抛错），
所以它会**静默变绿** —— 棘轮就此失明，后续 ③④ 步再没有任何数字守着。

**已落地的口径**：台账新增轴 `ui-singleton-members` = 扫描面内 `UI.<name> = ` 的处数
（**不受目录影响**），2026-09-20 实测起点 **103 处**，分布在 8 个文件：

| 文件               | `UI.x =` 处数 | 域                                           |
| ------------------ | ------------- | -------------------------------------------- |
| `ui-events.ts`     | 21            | 窗口事件（21 个 handler）                    |
| `ui-window.ts`     | 21            | 接线/形状（全部是 `UI.x = UIEngine.x` 镜像） |
| `ui-transform.ts`  | 18            | 元素变换/属性同步                            |
| `ui-file.ts`       | 15            | 文档生命周期                                 |
| `ui-list.ts`       | 10            | 列表交互                                     |
| `ui-prefab.ts`     | 9             | 预设/预制体                                  |
| `ui-pointer.ts`    | 8             | 画布指针交互                                 |
| `ui-initialize.ts` | 1             | DOM 引用与定时器初始化                       |
| **合计**           | **103**       |                                              |

`target: 'zero'`，另带子指标 `declared`（对象字面量**自身**槽位数，现 **134**，同样归零）：
两个数字同时为 0 才说明「挂载点删干净了**且**字面量退役了」——
否则删掉 21 行镜像、留着字面量就能让挂载点归零。

> ⚠️ **不要用「行首锚定」近似这个口径**：`ui-prefab.ts:105` 是链式赋值
> `uiElClasses.createElement = UI.createElement = …`，行首数不到它 ——
> 本文早先写的「102 处」就是这么来的，比真值少 1。同理裸 `\s*=` 会把
> `UI.dragging === null`（`ui-events.ts:80`）数成赋值（+1）。
> 正则、`(?!=)` 守卫与四条 self-test 见 `scripts/lib/scan.mjs` / `scripts/lib/self-test.mjs`。

**顺带修掉的两个同类「仪器瞎了」风险**（`scripts/lib/ui-slots.mjs`）：
`declaredSlots()` 与 `assignedSlots()` 原先写死 `packages/editor/src/ui/ui-window.ts` 路径与
`^packages/editor/src/ui/` 目录前缀 ⇒ 第 ② 步搬运后，前者会静默返回空数组
（`declared` 134 → 0，看着像「改善」），后者会让域模块里的 `this.x = …` 不再计入 `assigned`
⇒ `storeRefsUnassigned` 凭空变非空、`ui-slot-coverage` 报**上升**，用一条假回归挡住搬运。
现两者都改为按内容 / 按「UI 窗口所在目录」动态定位，搬运前后读数一致（已实测 `declared=134` 不变）。

> ⚠️ **2026-09-21 第 97 轮更正上面最后半句**：「按**目录**动态定位」只对**第 ② 步**成立
> —— 那一步是「整个家族一起搬」（`src/ui/` → `engine/ui/legacy/`），所以目录口径前后一致。
> 第 ③ 步是**逐个模块**搬出那个目录，此时「在不在遗留目录里」与「是不是单例域模块」是
> **两个不同的问题**，混用一个判据就会出事：实测搬走 `ui-transform.ts` 时 `assigned`
> 从 **153 掉到 144**（它那 9 处 `this.x =` 不再被计入）—— 而当某个 store 引用的槽位只靠
> `this.x =` 赋值时，`storeRefsUnassigned` 就会凭空变非空，**用一条假回归挡住正确的搬运**。
> 现已把两者拆开：目录判据仍用于 `legacyOnlyStoreSlots`（问「实现搬出去了没有」），
> `assignedSlots()` 改用**文件身份**（`engine/ui/` 下、且自己直接写 `UI.<slot> = …`）。
> 那条判据改了三版、每版都用实测数字否掉上一版（144 / 303 / 159 → **153**），见 `xr.md` 第 97 轮。

### 其余收尾项

- `stores/ui.ts` 里那 21 行 `UI.x = UIEngine.x` 的转发（在 `ui-window.ts`）可删；`stores/ui.ts` 的
  动作层改为直连 `UIEngine`，`getLazyWindow('ui')` 也能一并退场
- 台账的 `dom-on-exempted` 会小幅下降（`ui-window.ts` 不在白名单里，但 `ui-singleton-members` 归零才是主信号）

---

## 附录十三：阶段 1c 第 ④ 步设计（对象字面量退役）—— 2026-09-21 第 98 轮实测

> 第 ③ 步（把实现搬出遗留目录）已收口：`1c-store-slot-gaps` **41 → 0**。
> 但 **③ 搬的是位置，不是所有权** —— 判据 `ui-singleton-members` 数的是 `UI.x =` 处数、
> 与目录无关，所以它**一字未动**（103 处 / declared 134）。④ 才是那条轴归零的活。
> 本节先给**实测底数**与**分步计划**，不动运行时。

### 一、底数：103 处挂载现在分布在哪（本轮实测）

| 文件（均在 `engine/ui/`，只有 `ui-window.ts` 在 `legacy/`） | `UI.<name> =` 处数 | 性质 |
| --- | ---: | --- |
| `legacy/ui-window.ts` | 21 | **全是** `UI.x = UIEngine.x` 镜像 |
| `ui-events.ts` | 21 | 窗口事件 handler |
| `ui-transform.ts` | 18 | 元素变换 / 属性同步 |
| `ui-file.ts` | 15 | 文档生命周期 |
| `ui-list.ts` | 10 | 列表交互 |
| `ui-pointer.ts` | 8 | 画布指针交互 |
| `ui-slots.ts` | 6 | 预制体域（第 96 轮搬来的） |
| `ui-prefab.ts` | 3 | 预制体域剩余 |
| `ui-initialize.ts` | 1 | DOM 引用与定时器初始化 |
| **合计** | **103** | 9 个文件 |

另外 `declared = 134`：`ui-window.ts` 对象字面量**自身**声明的槽位数。两数必须**同时**归零
—— 否则「删掉 21 行镜像、留下字面量」就能让挂载数归零，1c 会在字面量还在的情况下被判收口。

### 二、为什么不能「删掉那 21 行镜像就完事」

`ui-engine.ts` 里读过 **30 个不同的 `this.<x>`**（本轮实测）。它们就是引擎对 UI 单例的
**成员契约** —— 也就是说：把 `UIEngine.x` 交给 `UI` 当接收者（`UI.x = UIEngine.x` 的用途）
不是多一层间接，而是**把 UI 侧的成员喂给引擎**。逐个核对它们有没有「新家」：

| 已有 store 键（8） | `controlPointTexture` · `history` · `hover` · `matrix` · `scrollLeft` · `scrollTop` · `scrollRight` · `scrollBottom` |
| --- | --- |
| **尚无新家（19）** | `body` · `centerOffsetX` · `centerOffsetY` · `centerX` · `centerY` · `controlPointActive` · `controlPointRotation` · `controlPoints` · `marquee` · `outerHeight` · `outerWidth` · `paddingLeft` · `paddingTop` · `planToSave` · `scale` · `scaleX` · `scaleY` · `screen` · `zoomTimer` |

> ⚠️ **本节的 21 已在第 99 轮改为 19**（口径收紧，不是成员变少）：原先那 21 里含
> `renderingFunction` / `requestRendering` / `updateControlPoints`，而这三个是**引擎自己定义**的
> （`ui-engine.ts` 里有 `UIEngine.<name> = …`，也正是那 21 行镜像的来源）——它们的家就是引擎，
> 不是缺口。判据与 `legacyOnlyStoreSlots` 豁免 `engineBacked` 槽位同源。
> 该口径已固化成台账轴 **`ui-facade-gaps`**（首轮实测 **19**），所以 ④ 的进度从此有棘轮守着。
>
> ✅ **④-1 已落地（2026-09-21 第 100 轮）**：契约已抽成**单一真源**
> `engine/ui/ui-facade.ts` 的 `UIFacadeShape`，`ui-engine.ts` 改为
> `interface UIShape extends UIFacadeShape { [k: string]: any }`（索引签名暂时保留）。
> **轴读数 19 → 0**、`ui-slot-coverage` 持平（没有槽位搬丢）。**纯类型改动**：diff 里只有
> `import type` 与 interface 声明，没有一条运行期语句。
> ⚠️ 抽的时候对照读点逐个核，发现**原局部 interface 漏声明了两个成员**：`marquee`
> （`UI.marquee.resize()`）与 `planToSave`（四处 `this.planToSave!()`）—— 它们一直只是被
> 索引签名兜着。**这正是 ④ 要消灭的那类静默**，现已显式进契约。
> ⚠️ 但要说清楚：**facade 现在还没有强制力**（索引签名还在，漏声明仍只表现为运行期
> `undefined`）。真正的收紧是 **④-1b：把那个索引签名删掉**，让 `tsc` 逐个点名。
>
> ✅ **④-1b 已落地（2026-09-21 第 101 轮）**：`ui-engine.ts` 的
> `interface UIShape extends UIFacadeShape { [k: string]: any }` 已换成 `type UIShape = UIFacadeShape`
> —— **逃生口退役**。`tsc` 当场点名 **5 个**从没在契约里的成员，全部补进 `UIFacadeShape`：
>
> | 成员 | 类别 | 引擎怎么用的 |
> | --- | --- | --- |
> | `requestRendering` | 引擎自有 | 四处 `this.requestRendering!()` |
> | `updateControlPoints` | 引擎自有 | `this.updateControlPoints!()` |
> | `renderingFunction` | 引擎自有 | `Timer.appendUpdater!('stageRendering', this.renderingFunction)` |
> | `hover` | store 已持有 | `drawHoverWireframe` 比较并读 `instance` |
> | `controlPointTexture` | store 已持有 | `drawControlPoints` 读它给 `gl.bindTexture` |
>
> ⚠️ **「有家」与「在契约里」是两件事**：台账轴把 `hover`/`controlPointTexture`（store 键）
> 与那三个引擎自有的都算「有家」，但引擎用 `this.x` 读它们，就仍然必须在**类型上**显式在案。
> 这正是 ④-1b 才能暴露的一层。
>
> 顺带**暴露一个真实缺陷**：`texture.base.glTexture` 里 `ImageTexture.base` 在类型上可空 ——
> 一直靠索引签名蒙过去。现已用 `!` 把既有不变式写出（`ui-initialize.ts:88` 同样直接解引用
> `.base`），运行期行为未变。
>
> 另外 `any-hatches` **52 → 51**：退役的那个 `[k: string]: any` 本身就是一条足迹；
> 新加的 `HoverNode` 用的是 `[k: string]: unknown`，不再制造新的 `any`。
> **本轮 diff 里没有一条运行期语句**（只有注释、一个类型别名、一个 `!`），故未重跑全套。

⇒ **这 19 个成员就是 ④ 的第一张工作单**（与 `uiStateKeys` 现有 21 个键互补）。
在它们有家之前删镜像，引擎会读到 `undefined` —— 而 `UI?.x?.()` 不报错，是**静默**失效。

### 三、两条路线，推荐 A

- **A. 保留一个「UI 形状的 facade」**：一个普通对象，由 store/引擎装配，引擎函数继续以它为
  `this`。`this` 绑定语义**逐字保持**，改动面小、可分批。
- **B. 把引擎函数改成显式接收 state 参数**：彻底，但要改 30 个读点 × 全部调用面，
  且**改的是行为语义**（附录一记过：`this` 绑定在这些函数里是承重的）。

**推荐 A**：④ 的目标是让两条轴归零，而 A 能达到且不重写语义；B 属于其后的清洁工作。
⚠️ 不论走哪条，facade **必须在 UI 对象诞生的同一位置**装配 —— 否则重蹈第 95 轮：
真机走 `primeWindows` 直接塞缓存、**绕过 loader**，把装配写在 loader 里等于没写，
而 vitest 走的正是 loader 路径 ⇒ **套件会绿着骗你**。

### 四、分步计划（每步独立可验证、可回滚）

| 步 | 动作 | 台账信号 | 需要真机？ |
| --- | --- | --- | --- |
| ④-1 | 给上表 19 个成员按域补「家」（facade 显式字段或 store 键） | **新轴 `ui-facade-gaps` 19 → 0**；`storeRefsUnassigned` **不得新增** | 否（纯类型/结构） |
| ④-1b | **把索引签名删掉**：`ui-engine.ts` 的 `interface UIShape extends UIFacadeShape { [k: string]: any }` 里的逃生口退役，让 `tsc` 逐个点名 | `tsc` 0（漏声明的成员必须补进契约，而不是补回 `any`） | 否（纯类型） |
| ④-2a | 让 store 的 7 个引擎转发**不再依赖镜像**：引擎在模块末尾 `registerUIEngine(UIEngine)`，store 优先从它取函数、`apply(UI, args)` | 无（镜像还在，读数不变）；行为等价由既有用例兜底 | 否（但本轮仍跑了全套） |
| ④-2b | **先换调用点**：把 9 个 UI 文件里「以 UI 为接收者」的引擎方法调用改成直连 `UIEngine.x.call(this/UI, …)` —— 清单见下方「⚠️ ④-2 的计划更正」 | 无（镜像还在） | 否（但要跑全套） |
| ④-2c | 删 `ui-window.ts` 的 21 行 `UI.x = UIEngine.x` 镜像 | `ui-singleton-members` **103 → 82** | **是**（真机） |
| ④-3 | 逐域把域模块的 `UI.x = …` 改为 facade 装配（每域一次，粒度同 ③） | 每域 −N，直到域模块归零 | **是** |
| ④-4 | 退役对象字面量，删 `ui-window.ts` / `register.ts` | 两条轴**同时**归零 | **是** |

### ⚠️ ④-2 的计划更正：那 21 行镜像**不是「删掉就行」**（2026-09-21 第 103 轮实测）

原计划把 ④-2 写成「删 21 行镜像 ⇒ `ui-singleton-members` 103 → 82」。**动手前先量，发现不成立**：

- **镜像本身是**那 21 个名字的**唯一**定义（全仓 `UI.<name> =` 共 21 行，**全部**在 `ui-window.ts`，
  别处 0 行）—— 所以「`UI.x` 就是 `UIEngine.x`」这条等价性成立。
- 但**消费者远不止字面量 `UI.x`**：引擎方法会被**以 UI 为接收者**调用，即函数体里的 `this.x(…)`。
  全仓 `this.<镜像名>` 共 **259 处 / 42 文件** —— 这个数字**大部分是假阳性**：场景/动画/粒子/
  过渡/精灵那几个窗口**各自也有**同名的 `requestRendering` / `renderingFunction` / `stopRendering`
  （已逐个核实：`scene-window.ts`、`animation-window.ts`、`particle-window.ts`、
  `transition-window.ts`、`sprite.ts` 都自声明了 `requestRendering`），另外 `webgl-methods.ts`
  里的 `this.drawElements` 其实是 **WebGL 上下文**的方法。
- **可静态分离的真·UI 接收者子集**：声明了 `this: UIShape` 的文件恰好 **9 个**，全在 `engine/ui/` ——
  `ui-engine` / `ui-events` / `ui-file` / `ui-initialize` / `ui-list` / `ui-pointer` / `ui-prefab` /
  `ui-slots` / `ui-transform`。

实测的 ④-2b 工作单（**70 处**）：

| 形态 | 处数 | 位置 |
| --- | ---: | --- |
| 字面量 `UI.<镜像名>(…)` | **21** | `ui-engine` 7 · `ui-initialize` 5 · `ui-list` 3 · `ui-transform` 3 · `ui-events` 2 · `LayoutPanel.vue` 1 |
| UI 接收者的 `this.<镜像名>(…)` | **49** | 上面 9 个文件里（`ui-engine` 7 · `ui-events` 14 · `ui-pointer` 12 · `ui-transform` 10 · `ui-initialize` 4 · `ui-file` 2） |

⇒ 结论：**镜像必须留到这些调用点全部改完**（`this.x()` → `UIEngine.x.call(this, …)`），
否则 `this.requestRendering()` 之类会在运行期变 `undefined` —— 又一次静默失效。
**`ui-singleton-members` 的 103 里，这 21 行是「最后才该动」的那批**，而不是 ④-2 的起点。

> 这也解释了为什么 `ui-singleton-members` 与 `ui-facade-gaps` 必须**一起**看：后者量的
> 19 个（已归零）是「引擎**读**的成员」，而这 70 处是「引擎**被**以 UI 为接收者**调用**」——
> 两个方向都要在契约里有着落，镜像才能安全退役。

每步都跑：`migration:check` + `migration:selftest` + `tsc` + `typecheck:vue` + `lint`
+ `format:check` + **editor 全套（独占）**。④-2 之后**每步都要真机启动一次**。

### 五、风险表（都是这个仓库真实吃过的）

| 风险 | 形态 | 出处 |
| --- | --- | --- |
| `this` 绑定 | 写成 `.x()` 会让 `this` 变成 `UIEngine`，而实现读的是 UI 侧成员 | 附录一 / `stores/ui.ts:585` 那段注释 |
| 就绪时序 | 「启动即崩」/「画布一片黑」/「像截图一样冻住」 | 附录四 / 六 / 七 |
| 静默失效 | `UI?.x?.()` 槽位不存在时不报错、只返回 undefined | 附录三 / 五 |
| **CI 盲区** | `primeWindows` 路径**没有任何测试覆盖**（vitest 走 loader） | 第 95 轮 |
| 大面积机械改写 | 必须独占一轮、避开并行写入者 | 第 37 轮 |

### 六、明确**不可**由 CI 验证的部分（写给下一个人，别拿绿灯当验收）

> ⚠️ **本节的前提已被 §7 更正（2026-09-22 第 110 轮）**：`primeWindows` 那条绕过路径
> 在第 ① 步之后就断了，真机与 vitest 同走 `loadUI`。**不要把本节当成「CI 验不了接线」的依据。**
> 下面这段保留原文，只用来说明「曾经为什么这么判断」，以及**真实渲染**为什么仍需真机。

`main/initialize.ts:91` 的 `primeWindows(clusterRef)` 按小写键直接 `windows.set('ui', …)`，
**绕过 `loadUI`**。套件永远走 `loadUI`。所以 ④-2 / ④-3 / ④-4 的**唯一**有效验收是
**真机启动 + 走查**：至少覆盖「启动不崩、UI 窗口画得出来、画布可平移缩放、点选有反应、
打开/保存/撤销重做、预制体可建可设」。CI 绿只能证明 loader 那条路没坏。

### 七、⚠️ 计划更正之二：上面那条「CI 覆盖不到 `primeWindows`」的硬限制，已被第 ① 步自己拆掉

（2026-09-22 第 110 轮实测；本节更正 §五 风险表里的「CI 盲区」一行、§6，以及 §四 表格的「需要真机？」一列。）

§6 把真机走查写成 ④-2 / ④-3 / ④-4 的**唯一**验收，理由是「真机走 `primeWindows` 绕过 `loadUI`，
而 vitest 走 loader」。**这条理由今天不成立**，而且是被本阶段第 ① 步顺手拆掉的：

| 环节 | 事实 |
| --- | --- |
| `primeWindows` 做什么 | `tools/window-registry.ts:82` 对入参做 `Object.entries`，键取 `key.toLowerCase()` |
| 谁是生产调用点 | 全仓只此一处：`main/initialize.ts:91`，喂的是 `await import('@app/tools/window-cluster')` 的**命名空间对象** |
| 该对象有哪些键 | 就是 `window-cluster.ts` 的 **41 个导出名**；`UI` **已不在其中** —— 第 ① 步 `00729b15` 的 diff 第一行即 `-export { UI } from '@app/engine/ui/legacy/ui-window.ts';` |
| ⇒ 推论 | 没有 `UI` 就**没有小写 `'ui'` 键** ⇒ 缓存里永远没有 UI 预热项 ⇒ `getLazyWindow('ui', loadUI)` 与 `loadWindow('ui', loadUI)`（`stores/ui.ts:368`）在真机上**真的走到 `loadUI`** |

⇒ **真机取 UI 对象走的就是 `loadUI`，与 vitest 同一条路。** 原先「套件会绿着骗你」的判断，
在 1c ① 之后只剩一个残余版本：**套件跑在 jsdom 里，覆盖不到真实 WebGL 渲染**。

**改后的口径**：

- **接线正确性**（函数拿到的是不是那个 `this`、镜像退役后有没有漏掉的读点）⇒
  **静态检查 + editor 全套**即可验收，不再属于「CI 验不了」。
- **真实渲染**（画布画得出来、可平移缩放、点选有反应）⇒ 仍然只有真机能看。
  §6 的走查清单因此**保留**，但它约束的是「画得对不对」，不是「接线接没接上」。

不变式（会自证）：`engine/ui/__tests__/ui-window-arrival-path.spec.ts`
—— 用例 A 证明 `primeWindows` 的预热机制本身有效；用例 B 断言 `window-cluster` 的键集里没有 `ui`。
**实测自证**：把 `export { UI }` 加回 `window-cluster.ts`，用例 B 立刻红
（`expected [ 'scene', 'ui', 'animation', …(39) ] to not include 'ui'`）；还原后绿。
两个方向都钉住：只留 A 会漏「生产喂的对象变了」，只留 B 会漏「机制本身坏了」。

### 八、⚠️ 计划更正之三：④-2b 的 70 处**不是一种改写，是三种** —— 其中 7 处与「连错三次」冲突

（2026-09-22 第 111 轮实测；本节更正 §四 表格里 ④-2b 那一行的写法。）

§四 把 ④-2b 写成一句话：「把这 9 个文件里以 UI 为接收者的调用改成直连
**`UIEngine.x.call(this/UI, …)`**」。计划**已经**意识到接收者有两种（`this` 与 `UI`），
但没写明「哪一批用哪个」——而照着「统一用 `this`」改写，会**直接复现**作者在
`ui-engine.ts:637` 记下的那次事故。

实测把 70 处按改写形态分成三类（`node scripts/oneoff/measure-4-2b.mjs` 的 D 段可复现）：

| 类 | 形态 | 处数 | 接收者 | 改写形态 |
| --- | --- | ---: | --- | --- |
| **C1** | UI 接收者函数里的 `this.<镜像>` | **49** | `this`（在手） | `UIEngine.x.call(this, …)` |
| **C2** | 普通方法里的字面量 `UI.<镜像>` | **14** | `UI` | `UIEngine.x.call(UI, …)` |
| **C3** | **`renderingFunction` 里的**字面量 `UI.<镜像>` | **7** | **不存在** | 见下 |

**C3 为什么是特殊类**：`renderingFunction` 由 `Timer` **裸调用**
（`timer.ts:195` 的 `stageRendering(deltaTime)`），所以它自己的 `this` 恒为 **`undefined`** ——
不是「指向错的对象」，是根本没有。那 7 行之所以能工作，恰恰因为 `UI.drawXxx!()` 是
**方法调用**、`this` 自然绑到 UI 单例。`ui-engine.ts:639` 明文写着：

> ⚠️ 必须通过 **`UI.drawXxx()`** 调用，不能写成 `UIEngine.drawXxx()` 或
> `UIEngine.drawXxx.call(this)`。原因（2026-09-18，我在这里连错三次）……

当年改成 `.call(this)` 并加 `if (!this?.renderingFunction) return` 作保护，后果是
**每帧提前 return** ⇒ 「不报错，但整个 UI 画布一片黑」。

**处置（本轮定下的口径）**：

1. **先补仪器，再动这 7 行** —— 原来这条不变式**只写在注释里**，而注释不会失败。
   新增 `engine/ui/__tests__/ui-rendering-receiver.spec.ts`：裸调用 `renderingFunction`，
   断言 7 个 draw **全部执行**且**接收者都不是 `undefined`**。
   判据故意**不**钉死具体对象（真实接收者是惰加载代理，不是 `import { UI }` 那个对象），
   这样它**跨 ④-2b 的改写依然有效**。
2. **C3 的改写形态取 `.call(UI)`**：接收者逐字等于原来的（`UI.drawXxx()` ⇔ `UIEngine.drawXxx.call(UI)`，
   因为镜像就是同一个函数对象）。⇒ **④-2c 的 103 → 82 仍然可达**。
   若最终决定 C3 保留 `UI.drawXxx()` 形态，则 ④-2c 的目标应改为 **103 → 89**（7 个镜像必须留下）。
3. **自证两处**：把 `drawBackground` 那行改成 `.call(this)` ⇒ 新用例红在
   「`drawBackground` 的接收者是 undefined；还原后绿」。

> ⚠️ **仪器自己的假绿（本轮真实发生，值得单记）**：第一版用例把「裸调用」写成了
> `UIEngine.renderingFunction()` —— 那是**属性调用**，`this` 被意外绑成 `UIEngine`，
> 于是**连 `.call(this)` 那种错写法都能绿**。自证时才发现（突变后仍然通过）。
> 真实约定是「`Timer` 存下函数引用、之后脱离接收者调」⇒ 必须先
> `const render = UIEngine.renderingFunction` 再 `render()`。
> **用例不仅要断言对，还要复现真实的调用约定**，否则它守的是一种并不存在的调用形态。

#### ✅ ④-2b 已落地（2026-09-22 第 112 轮）

70 处按上表三类分流改完（C1 49 · C2 14 · C3 7，另 2 处值引用）：
`this.<镜像>(…)` → `UIEngine.<x>!.call(this, …)`；字面量 `UI.<镜像>(…)` →
`UIEngine.<x>!.call(UI, …)`；**C3 取 `.call(UI)`**（理由见上，故 **④-2c 的 103 → 82 仍成立**）。

- 改写由一次性 `scripts/oneoff/apply-4-2b.mjs` 完成（只改工作单所在的 8 个文件、**跳过注释行**、
  括号按深度配对搬实参、**每文件断言预期条数、对不上整体中止**）。
  dry-run 第一次就抓到「凭印象填的预期数」是错的（`ui-engine` 的 7 实为 5 + 2 个值引用）。
- 工作单复测：**70 → 0**（`node scripts/oneoff/measure-4-2b.mjs`）。
- **唯一动了守卫的地方**是 `LayoutPanel.vue` 的 `UI.requestRendering?.()`：镜子删掉后该守卫无法
  原样保留，等价性由「`state` 只在 UI 窗口方法体内被置为 `open`」论证（`ui-file.ts:29`）。
  反例已查实：`Timer.appendUpdater` 收 `undefined` 会**毒化槽位**（`undefined !== null` ⇒ 每帧
  TypeError）⇒ 守卫必须逐个论证，不能当「防御性代码」一并清掉。
- `ui-engine.ts` 那段「必须写成 `UI.drawXxx()`」的警告**已整段改写** —— 否则代码一改，
  注释就成了假话，而门禁查不出这件事。

**④-2c 的清单（2026-09-22 第 113 轮实测 —— `node scripts/oneoff/measure-4-2c.mjs`）**

删 21 行镜像之前把「谁会因此坏掉」量了一遍。结论：**真正的拦路虎不是代码，是一条轴的口径。**

0. ⚠️ **`ui-slot-coverage` 会把正确的删除判成回归。** 该轴的 `storeRefsUnassigned`（`total`，终态 0）
   = store 引用了但全仓没人赋值的槽位；而 `assignedSlots()` 把遗留目录里的 `UI.x = …`
   **也算赋值** ⇒ 镜子一删，那 7 个名字（`store` 的引擎转发清单）就变成「引用了但没人赋值」：
   **实测 `storeRefsUnassigned` 会 0 → 7 ⇒ 撞棘轮。**
   而这 7 个**恰好就是** `engineBacked` 集合 —— ④-2a 已经让 store 从注册进来的 `UIEngine` 取函数，
   它们**不再是 UI 槽位依赖**（`legacyOnlyStoreSlots()` 早就是这么判的，只有这条轴没跟上）。
   ⇒ ④-2c 必须先做一步**口径修正**：`storeRefsUnassigned` 排除 `engineBacked`，并为它补
   **会自证**的用例（否则那条轴会把一次正确的删除挡下来）。这是「数字有棘轮、判断没有」的又一例。
1. **文本剩下的只有 2 处**：`stores/__tests__/ui-state.spec.ts:61/63` 的 `UI.setZoom!(2)`。
   意图是「引擎写进 store」，应改为 `UIEngine.setZoom!.call(UI, 2)`。删镜子后它会被 `tsc`
   **点名**（`UIFacadeShape` 已无索引签名）⇒ 是安全的一处。
2. **枚举/展开 `UI` 对象的地方：0 处**（`Object.keys/values/entries(UI)`、`{...UI}`、`for…in UI`、
   `Object.assign(…, UI)` 全仓都没有）⇒ 删镜像不会让某个序列化/遍历悄悄少成员。
3. **动态按名取值的只有 `stores/ui.ts` 那 7 个字符串键**（`uiEngineForwardKeys`）。
   其中 `makeEngineForwarder` 的**回退分支**（`target[key]`）在删镜后会返回 undefined。
   **但它行为等价，不必改**：`ui-window.ts:6` **静态** import `ui-engine.ts` ⇒
   `uiEngineRef === null`（引擎未求值）⟹ `ui-window.ts` 未求值 ⟹ UI 窗口对象根本不存在
   ⟹ 那个回退分支**本来也取不到函数**（`typeof fn !== 'function'` → undefined）。
   两态返回值相同 ⇒ 保留回退零风险；反倒**不该**改成抛错（那会把一个静默 no-op 变成 TypeError，
   是行为变化）。
4. 账面上 ④-2c 的收益：`ui-singleton-members` **103 → 82**、`legacy-ui-lines` **316 → ~295**（均为下降）。

#### ✅ ④-2c 已落地（2026-09-22 第 114 轮）

按上面那条清单的「先改口径、再删镜像、最后改测试」做掉：

- **口径修正**：`uiSlotCoverage()` 的候选集抽成导出的 `unassignedStoreSlots(refs, assigned, engineBacked)`
  并排除 `engineBacked`。**抽出来是为了能自证**：样本版用例在镜像还在时就能咬人
  （自证实测：去掉那条排除 ⇒ 红在「期望 `["c"]`，实际 `["b","c"]`」）。
- **镜像退役**：`ui-window.ts` 的 21 行 `UI.x = UIEngine.x` 删除 ⇒
  `ui-singleton-members` **103 → 82**（files 9 → 8）、`legacy-ui-lines` **316 → 302**、
  `ui-slot-coverage.total` **0 → 0**（口径改对了），基线已固化。
- **测试**：`ui-state.spec.ts` 的 2 行改为 `UIEngine.setZoom!.call(UI, 2)`，用例名改为
  「引擎写入经 store 生效」（名字跟事实走）。

⚠️ **顺带保住的另一条不变式**：删镜像后 `tsc` 会报 `ui-window.ts` 的 `UIEngine` 未使用，
但**不能直接删那行 import** —— 第 113 轮论证 store 回退分支「两态等价」的前提正是
「`ui-window.ts` **静态** import `ui-engine.ts`」（读 UI 必先求值 UIEngine）。已改为
**副作用 import** 并写明理由。**`tsc` 只看到「未使用」，看不到「承重」。**

⚠️ **自测的一条前提也随本轮死了**：「遗留层还在 ⟹ 挂载点轴非 0」里 ① 的原判据是
「遗留目录里仍有 `UI.<name> =` 挂载」——实测那 21 行镜像是**最后一批**，删完全局读数恰好 0。
这不是仪器坏、是里程碑（现在 82 处挂载全在 `engine/ui/` 的域模块）。
判据已换成正向信号「单例本体仍在这里」（桥安装 + 嵌套挂载），并保留一条与目录无关的全局读数 `> 0`。

**下一步是 ④-3**：逐域把域模块的 `UI.x = …`（82 处 / 8 文件）改为 facade 装配；
之后 ④-4「退役对象字面量、删 `ui-window.ts` / `register.ts`」⇒ 两条轴同时归零。

#### ⚠️ ④-3 / ④-4 的**动手前实测**（2026-09-22 第 115 轮，`node scripts/oneoff/measure-4-3.mjs`）

**结论一：④-3 的改动面里 88% 没有任何测试信号。**

| 域 | 挂载 | 被 spec 直接引用 |
| --- | ---: | ---: |
| `ui-events` | 21 | **0** |
| `ui-transform` | 18 | 2 |
| `ui-file` | 15 | **0** |
| `ui-list` | 10 | 1 |
| `ui-pointer` | 8 | **0** |
| `ui-slots` | 6 | **6** |
| `ui-prefab` | 3 | **0** |
| `ui-initialize` | 1 | **1** |
| **合计** | **82** | **10（12%）** |

spec 里出现的 `UI.<name>` 绝大多数是**状态/桥成员**（`meta` `state` `target` `zoom` `hover` …）
与元素类，**不是**这些挂载函数；另有 **5 个 spec 直接 `vi.mock` 掉整个 `legacy/ui-window`**。
耦合：单模块 `this.` 读最多 71 处、模块内 `UI.*` 交叉引用最多 54 处、1 处链式赋值（`ui-prefab.ts:48`）。

⇒ 这与第 110 轮那条「`primeWindows` 盲区已被修正」**不是同一件事**：那条是仪器读错路径（能靠加用例解决），
这条是**这 72 个成员本来就没被测过**（只能靠真机走查）。

**结论二：④-4 不是机械活 —— 字面量是一张占位表（vtable）。** `ui-window.ts:104`–`240` 的 134 个槽位里
绝大多数是 `initialize: null, open: null, … setZoom: null` 这类**给域模块先声明、后填充的占位**
（外加 105–111 行的 DOM 元素引用）。⇒ ④-4 = 把 134 个占位换成**有类型的 facade**，成员由各域成员对象 +
store 桥装配；这也解释了台账为什么坚持 `declared`(134) 与挂载点(82) **必须同时归零**。

**结论三：④-4 的接线面很小（好消息）。** 外部取 `UI` 的非测试点只有 3 处：
`stores/ui.ts:31`（`loadUI` 的 inline import）、`LayoutPanel.vue:1382`、`file-system-core.ts:16`；
另加 `window-cluster.ts:47`（只要 `uiWindowReady`）。其余全是 8 个域模块自己的相对 import。

**建议次序（有信号 → 无信号）**：`ui-slots`(6) → `ui-initialize`(1) → `ui-list`(10) →
`ui-transform`(18) → `ui-prefab`(3) → `ui-pointer`(8) → `ui-file`(15) → `ui-events`(21)。
前两域（共 7 处）套件可兜底；**从第 3 域起每域做完必须真机走查**。
并且**先**跑一遍 9 项实机回归清单建立 known-good 基线 —— 本会话至今从未启动过真机，
没有基线则 ④-3 之后的任何异常都无法归因。

**结论四（动手前必须先定）：④-3 的轴信号可以靠改写法白拿。**
`ui-singleton-members` 数的是 `UI.<name> =` 文本；实测 `Object.assign(UI, { x() {} })`、
`for (… ) UI[k] = v`、`Object.defineProperty(UI, 'x', …)` 三种写法**命中都是 0**。
⇒ 把 82 行挂载改写成「成员对象 + 一次 `Object.assign`」，轴就归零，而**所有权一点没变**
（仍是同一个遗留对象在装配、域模块仍 `import { UI }` 去改它）。
这违反台账自己那条规矩「**度量只应对真实状态敏感，不该对写法敏感**」。两条路：

- **(a) 只认轴**：简单，但那条白拿路径敞着，棘轮会为纯改写报喜。
- **(b) 轴 + 伴随判据**（**建议**，尚未实现）：「域模块是否还静态 `import { UI }` 去改单例」——
  真正的 facade 装配里域模块只**提供**成员、不依赖单例对象本身。实测今天 **8/8** 个域模块都还
  `import { UI } from './legacy/ui-window.ts'` ⇒ 起点 8、终态 0，且**改写法拿不到它**。

⇒ **④-3 开工前请先定 (a) 还是 (b)**（并顺带定下那 9 项实机回归清单要不要先跑一遍建立基线）。

#### ✅ 文本门禁补上 `mojibake` 规则（2026-09-22 第 125 轮）

第 124 轮发现 `text:check` 看不见「GBK ↔ UTF-8 误解码」，本轮补上（规则 7 → 8 条，自证 55 → 58），
并顺带修掉全仓 **17 处**乱码（含 2 条测试用例名）。要点：

- 判据是**可逆性**，不是「稀有字黑名单」：把一行的字符编回 GBK 字节，能按 UTF-8 解出中文即为误码
  —— `TextDecoder` 只能解不能编，于是**反过来枚举** `0x81..0xFE × 0x40..0xFE` 得到编码表（24 ms）。
  实现：`scripts/lib/gbk-mojibake.mjs`；规则挂在 `scripts/lib/text-integrity.mjs`。
- 阈值是量出来的：降到「1 个中文」全仓命中 881 行（噪音），「≥2 个中文 + 中文占多数」命中 17 行
  **全是真事故**。
- 修法：**先在写坏那次提交的父提交里搜 `corrupt(X) == 现文` 的行** —— 命中的 X 就是原文，不用猜
  （17 处里 15 处逐字取回；`property-list.ts:225` 是写入时即乱码，按同族约定还原）。
  陷阱：写坏的那些提交同时搬了目录，父提交路径要先按 rename 解析。
- 对 ④-3 无影响：本轮只改注释与用例名，17 条轴全部持平。详见 `xr.md` 第 125 轮。

#### ✅ P4 尾部：`unknown-casts` 44 → 40（2026-09-22 第 126 轮）

剩下的 44 处**都是跳板承重的**（「降级成单次 `as` 再跑 tsc」的批量实验早做过），所以本轮只能
**改类型**。用第 124 轮那把尺子（「这个断言在替谁干活」）判完 4 处：

| 站点 | 判定 | 依据 |
| --- | --- | --- |
| `title/new-project-window.ts:365` | **真 bug**：`template != (['arpg-ts-english','arpg-ts-chinese'] as unknown as string)` 运行期是与数组 join 出的字符串比 ⇒ 条件恒真、`else`（资源缺失提示）是死代码 | `891cf657` 引入；修法=抽纯函数 + 4 条用例（已验红） |
| `tools/color-picker-window.ts:357` | 声明写错了那一侧 | 生产者 `RadioBox.vue` 用 `numberPattern`+`parseFloat` 归一化成 **number**；同族 `eslints.ts:256` / `auto-tile.ts:352` 也按 number |
| `engine/scene/scene-camera-engine.ts:158` | 断言多余（只喂 `screenScrollData(el: unknown)`） | 同族 `particle-motion.ts:203` / `ui-engine.ts:387` 本来就写成 `screenScrollData(screen)` |
| `setting-config/renderer.ts:139` | 已有 `Reflect.has` 探成员 ⇒ 用 `Reflect.get` 取 | `EventTarget` 有没有 `value` 是运行期事实 |

**显式留着不动**：`engine/ui/element-base.ts:148` —— 基类方法读子类才有的 `blend`，要动得先定
「`blend` 属不属于基类」以及 `blend` 为 `undefined` 时 `GL.blend` 的行为（`webgl-methods.ts:1149`
用 `updaters[blend]()` 查表）⇒ **必须真机确认**。

剩下 40 处的形状（`node scripts/oneoff/measure-p4-shapes.mjs`）：**A 局部类型 7 / B 别处具名 22 /
C 匿名或泛型 11**。下一步最省力的两族：③「被调方形参声明过窄」（`Parameters<typeof X.open>[0]` ×2、
`ConstructorParameters` ×2）、④「动态键取成员」8 处 —— 但 ④ 要先解决它与 `any-hatches` 轴
「索引签名」的互相拉扯。详见 `xr.md` 第 126 轮。

#### ✅ 族 ③ 已收口：`unknown-casts` 40 → 36（2026-09-22 第 127 轮）

四处形状完全一致（`X as unknown as Parameters<typeof f>[0]` / `ConstructorParameters<typeof C>[0]`），
修法统一为**交叉断言**：`X as unknown as P` → `X as X & P`（手法库第 6 条）。

- 为什么不是骗轴：`unknown` 跳板对目标类型**零检查**（`as unknown as 任何东西` 都合法），
  而 `X & P` 要求 P 是 X 的扩展 ⇒ tsc 真的判可比性（四处都过了）⇒ **检查是变多的**。

> ⚠️ **更正（第 128 轮，对照实验）**：上面这句「tsc 真的判可比性 / 检查是变多的」**说得太满**。
> 实测 `o as A & Date`、`o as A & { a: string }` 都能过（交叉断言的目标按构造就是源类型的子类型，
> 永远是一次合法的向下断言，TS 不核对 P 与源类型是否相容）。
> 交叉断言**真正**的收益是**结果类型保住源类型**：`(o as A & { b: string }).a` 通过，
> 而 `(o as unknown as { b: string }).a` 报 `TS2339`。四处改动仍然成立，理由换成这一条。
> ⇒ `unknown-casts` 是**坏味道的代理量**，不等于正确性。详见 `xr.md` 第 128 轮。
- 运行期证据：`command-list.ts:67` 期望的成员在 ui-kit `command-api.ts` 上实数存在
  （`elements`:415 / `findString`:506 / `scrollToRow`:339，契约:237 只承诺 `HTMLElement`）；
  `custom-box-opts.ts:103` 两侧接口差**只有可空性**；`scene-context.ts:324/367` 的形参
  就是场景节点本身（构造函数第一句 `this.data = data`）。
- **没顺手改**：`LayoutPanel.vue:1966/1969`（`{ value } as unknown as Event`）。机械换成交叉断言
  能过 tsc，但那只是把谎话写规整。真正的契约修法会踩 TS weak-type 规则（全可选的形参类型要求
  实参有共同成员，`Event` 没有 `value`）而打断 Vue 模板绑定 ⇒ 需要先定「这类处理器怎么建模」。

下一族建议从 ④「动态键取成员」8 处动手，但**先**决定它与 `any-hatches` 轴谁让步。详见 `xr.md` 第 127 轮。

#### `unknown-casts` 35 → 33（2026-09-22 第 129 轮）：两处真修 + 一处**必须保留**（编译器判的）

- **契约说谎 → 放宽形参**：`ui-kit/src/utils/attach-api.ts` 的 `attachApi(el: HTMLElement, …)`
  实现只有 `Reflect.set(target, key, value)`（对**任何对象**都成立）⇒ `HTMLElement` 过窄。
  暴露它的是 `menu-api.ts:492`：那里的 `menu` 是菜单的**状态对象**（对象字面量），不是元素。
  放宽成 `target: object` 后既有调用点全部继续成立，`menu as unknown as HTMLElement` 消失。
  这就是第 124 轮 `clear()` 那类「契约修正」，**优先找这种**（改一处声明，去掉调用点的谎话）。
- **交叉断言**：`scroll-bar-api.ts:164` 的 `thumb as unknown as ScrollThumb` →
  `thumb as HTMLDivElement & ScrollThumb`（`ScrollThumb extends HTMLElement` + 四个 expando 字段，
  而 `thumb` 是 `createElement('div')`）。
- ⚠️ **必须保留的一处**：`YMTitleBar.vue:7` 的 `window as unknown as Window & { Window?: … }`。
  去 `unknown` 会被 `vue-tsc` 拒（TS2352）：`window` 的静态类型是 `Window & typeof globalThis`，
  所以 `window.Window` 静态上就是全局 **`Window` 构造器**，不是宿主挂的那个 API
  ⇒ 这里 `unknown` 是在**丢掉一个错的静态类型**（与 `scene-tilemap-page.ts:210` 同类）。
  已在就地注释里写明证据。**轴的中间值一度是 32，那个数是错的。**

⇒ 目前「**必须**保留 `unknown`」的站点已明确记录在案的有三处：
`window-object.ts:59`（数组实例加方法）、`scene-tilemap-page.ts:210`（丢错的 `this` 声明）、
`YMTitleBar.vue:7`（丢错的全局构造器类型）。判据：**先看源类型对不对，再看形状。**

⇒ 附带一条通用教训：`ui-kit/playground/` **不在** `tsconfig.build.json` 的 include 里
（只 `src/**`）⇒ 那里写了什么都不受类型检查，**不能当先例**。

剩下 33 处仍按第 126 轮那张表分族（A/B/C），最省力的 ③ 已收口；下一步是 ④（8 处，先定它与
`any-hatches` 谁让步），以及两族计划内债务（monaco 的环境形状、codec 的 `string ↔ Uint8Array`）。
