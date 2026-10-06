# Pinia 迁移分析（yami-rpg-editor）

> 口径：当前工作区源码，`E = packages/editor/src`。结论均带 `file:line`；数字为脚本统计（排除 `__tests__`）。
> 本文档只做**分析**，未改动任何代码。

---

## 0. 结论速览

项目**早就是成熟的 Pinia 应用**（36 个 store、`app.use(pinia)` 顺序正确、测试逐个 `setActivePinia`）。真正要做的是三类事：

| 类 | 问题 | 量级 |
|---|---|---|
| **A** | **还有手写 store 没进 Pinia**：模块级 `let`/`reactive` 藏在 composable 顶部 | 40 个模块级 `reactive/ref`（14 命令 schema + 26 弹窗）+ 5 处模块级 `let` 句柄；其中 7 个最值得先动 |
| **B** | **已进 store 的域只「反转」了白名单里的键**：`*StateKeys`/`*BridgeKeys` + `Object.defineProperty` 桥；文档数据/运行时/DOM 仍在单例 | 13 个域桥接生效，其中 **4 个的白名单已经漂移** |
| **C** | **一致性/卫生**：白名单双份、2 个死 store、4 处只写不读、`storeToRefs` 全仓 0 次、2 个服务模块在用裸 `useXStore()` | 见第 4 节 |

**已经做对、不要再动的**：`app.use(pinia)` 是第一个插件（`E/main.ts:17-19`）；`getXStore()` 统一显式传 `pinia`（`E/stores/layout.ts:309-311`，**1283** 处调用点，规避 "no active Pinia"）；setup store **34/36** 完整 return（另 2 处是有注释的有意私有）；`provide/inject` 只用于检查器页上下文（18 provide / 37 inject，正统用法）；410 个 `.vue` 里**没有** 3 层以上的同值 prop 链；`window.__*` 只有 2 个 bootstrap 标志。

---

## 1. 现行机制（先读这节）

```
① 模块单例      export const X = { ...state, ...methods }        （或 composable 顶部模块级 let/reactive）
② Pinia store   defineStore('x', () => {...})                    三种角色：
                  HOLDS  store 即状态源（data/browser/selector/resource/confirmation/search-string/variable/enum/attribute…）
                  MIRROR syncState() 从单例抄一份（history.ts:14、audio.ts、event-editor.ts:12）
                  FACADE 只转发 X?.m?.()（约 80 个成员，scene.ts:47-121、animation.ts:67-169、layout.ts:113-255）
③ 桥接循环      for (const key of xxxKeys) Object.defineProperty(X, key, {get/set → store})
                  → 把单例变成 store 的访问器，即「该字段 store 为源」
```

### 1.1 白名单是迁移手段，但它现在有**两份**

- **20 个** `export const xxxStateKeys` 在 `stores/*.ts`（文档化契约）
- **17 个** `const xxxBridgeKeys` 在单例侧（真正被桥接循环迭代）
- 13 个域两边都有 → **4 个已经漂移**：

| 域 | StateKeys | BridgeKeys | 漂移内容 | 含义 |
|---|---|---|---|---|
| `animation` | 7 | **12** | BridgeKeys 多：`showMark/showOnionskin/mirror/loop/playing` | 导出的白名单**少写了** 5 个已桥接键（`E/stores/animation.ts:15` vs `E/animation/animation-window.ts:630-643`） |
| `autoTile` | 11 | **8** | StateKeys 多：`state/target/ruleBits` | 这 3 个只在 store 里，单例侧没有访问器（`stores/auto-tile.ts:5` vs `palette/auto-tile.ts:1111`） |
| `ui` | **21** | 6 | StateKeys 多 15 个（promote 但未桥接） | 有意为之（`stores/ui.ts:63-84` vs `engine/ui/ui-singleton.ts:341`） |
| `window` | 5 | **4** | StateKeys 多：`stack` | `stack` 只是 `Window.frames` 的镜像（`stores/window.ts:6` vs `tools/window-object.ts:360`） |

另外 **8 个域只有 StateKeys、桥接直接迭代它**（`resource/history/command/team/easing/project/local/title`，如 `E/data/project-settings-window.ts:55`）——这是**应该统一成的那种写法**。

### 1.2 各域状态分布（白名单内 = store 为源；其余仍在单例）

| 域 | 白名单键 | 单例里**未**反转的大类 |
|---|---|---|
| `Layout` | dragging, resizing, focusableSelector, focusableElements（+ `pageTargets`/`tabTargets` 自持） | `manager`/`items`/`heads`（live DOM/PageManagerApi）、`layout`/`layouts`/`default`（scheme 字典）、模块级 WeakMap/Map 缓存 |
| `Scene` | state, target, mode, tilemap, layer, showGrid, zoom, scaleX, scaleY | 文档数据（`context/objects/events/scripts/…` 与 `Data.scenes` 同对象）、相机缓存（`scale/scaledTileWidth/scrollCenterX…`）、每帧 `animationFrame/Elapsed` |
| `Animation` | state, target, motion, direction, mode, speed, zoom（+ 桥接实际含 5 个开关） | 文档数据（`motions/layers/player`）、`animIndex`（每帧）、marquee、25 个 DOM 元素 |
| `Particle` | state, target, paused, showWireframe, showAnchor, speed, zoom, scaleX, scaleY | `emitter/layers/history`、每帧 `scale/centerX` |
| `UI` | 21 键（6 桥接 + 15 promote） | `page/head/body/screen/marquee/list`（DOM，走 `elements` getters）、`dragging/hover`（computed 委托） |
| `Easing` | state, target, data | `data` 是 `deepClone(Data.easings)` 编辑缓冲（`transition-window.ts:370` → 提交 `1254-1268`）；表单真相在 `useEasingWindow.ts:31-36` |

只有 **`animation`** 的白名单键被模板响应式读取（`AnimationPanel.vue:20,28,36`、`AnimationTimelinePanel.vue:48,50,86`）。Scene/Particle 界面是命令式 DOM（`registryRef` + `addClass`），它们的 store 键目前「只写不读」——迁移动机是**可调试性**，不是渲染。

---

## 2. A 类：建议迁进 Pinia（按性价比）

### P0 — 纯状态、无 DOM 纠缠、有现成消费者

| # | 现状 | 位置 | 建议 | 难度 |
|---|---|---|---|---|
| 1 | **`stores/command.ts` 是死 store**（0 生产调用点，仅测试引用），真正状态是模块级 `reactive`（82 处引用） | `E/composables/useCommandState.ts:42-55`；store `E/stores/command.ts:9-10` | 把 `commandState` 折进 `stores/command.ts`（`words` 保持 `markRaw:45`），或删 store 的 `state/target` | 低 |
| 2 | **缓动表单是模块级 `reactive`**，已被 2 个模板直接读 | `E/composables/useEasingWindow.ts:31-36`；消费者 `Easing.vue:103`、`EasingPointsSection.vue:238` | 新建 `stores/easingForm.ts`（或并入 `stores/easing.ts`） | 低 |
| 3 | **曲线窗口是手写 store**，无 Pinia 对应物 | `E/composables/useCurveWindow.ts:96-103`（`state/page/head/list/canvas/target/index/curveMap`） | 新建 `stores/curve.ts`：`state/target/index` 入 store，DOM/实例留单例；`E/animation/curve-window.ts:45-130` 的 getter 门面改读 store | 低–中 |
| 4 | 新建/部署项目表单是模块级 `reactive`+`ref` | `E/title/new-project-window.ts:34,39`；`E/title/deploy-project-window.ts:47,56` | `stores/new-project.ts`、`stores/deployment.ts` | 低 |
| 5 | 瓦片帧生成器表单是模块级 `reactive`，**所有窗口实例共享** | `E/palette/tile-frame-generator.ts:14` | 并入 `stores/palette.ts` | 低 |
| 6 | 组件直接 import 的模块级表单 | `E/composables/commands/useGetObjectPropertyCommandSchema.ts:16`、`useRequestURLCommandSchema.ts:19`、`E/composables/useSwitchConditionSchema.ts:61`（消费者如 `components/tools/RequestKeyValue.vue:6,16`、`SwitchCondition.vue:129`） | 各自一个 store | 低 |
| 7 | `localization` 只镜像一小片 | `E/stores/localization.ts:19-20`（仅 `state/strings`）vs `E/local/local-window.ts:139-143`（`target/data/languages/history/changed`） | 扩桥接 PARTIAL→HOLDS；注意 `strings` 目前 0 读者 | 低–中 |

### P1 — 白名单扩容（改一行 + 同步类型）

| # | 目标 | 建议加的键（证据） |
|---|---|---|
| 8 | `Animation` | 把 `stores/animation.ts:15` 的导出白名单补齐到桥接的 12 键（`showMark/showOnionskin/mirror/loop/playing`），再考虑加 `particleUpdating:564`、`background:571`、`inspectorTypeMap:580`、`translationKey:569` |
| 9 | `Scene` | `showLight:324`、`showAnimation:325`、`brush:317`、`symbol:318`、`activeTilemapId:355`（写入点仅 `scene-animate.ts:119,155,161`、`scene-target.ts:60-69`） |
| 10 | `Particle` | `showAxes:319`、`restartKey:316`、`translationKey:317` |
| 11 | `UI` | 5 个 **computed 委托**（`scrollLeft/Top/Right/Bottom`、`dragging`、`hover`）改成真正 store 状态（`E/stores/ui.ts:344-362`） |
| 12 | `Selection`（文本捕获） | `inserting:131`、`context:172`（`E/tools/text-capture.ts`） |
| 13 | `Color`（取色器） | `paletteX:38`、`paletteY:39`、`pillarY:40`、`indexEnabled:41`（`E/tools/color-picker-window.ts`） |
| 14 | 其余命令弹窗表单（`composables/commands/*` 14 处 + `use*Window.ts` 26 处） | 例 `useCastSkillCommandSchema.ts:66`、`useScriptCommandSchema.ts:264`、`useColorWindow.ts:41`、`useArrayWindow.ts:44-48`、`useZoomWindow.ts:18` → 各一个 store 或统一 `useCommandFormStore` |
| 15 | `Command.custom` | `windowX/windowY/parsingScript/loadedScript`（`E/commands/command-object.ts:105-108`，~38 处引用） |

### P2 — 有价值，但要先拆耦合

| # | 目标 | 阻塞点 |
|---|---|---|
| 16 | `Layout.layout/layouts/default`（scheme 字典，`E/engine/layout/layout.ts:558-560`） | ~15 个 spec 直接赋值 `Layout.manager/heads/layout` 复位；`Layout.manager` 40 处引用/12 文件 |
| 17 | `Menu.state`（`E/components/menu-list.ts:32-35`，真状态在 ui-kit 闭包 `packages/ui-kit/.../menu-api.ts:71-84`） | 3 个消费者已按「函数」读（`AppShell.vue:123`、`FileBrowser.vue:151`、`tree-list.ts:10`）→ 加 `getState()` 兼容层；`Menu.popup` 38 处/31 文件 |
| 18 | `Window.frames` + `stores/window.ts:19 stack` 双源 | **ui-kit 直接读全局**：`packages/ui-kit/src/utils/dom.ts:188` `window.Window.frames.length`（`menu-api.ts:131`、`select-list-api.ts:411`）→ 必须先给 ui-kit 注入端口 |
| 19 | 文档数据（`Scene.context/objects/…`、`Animation.motions/layers`、`Particle.layers/emitter`） | 与 `Data.scenes/animations/particles[…]` 是同一批对象；进 Pinia 要么代理污染资源模型、要么 deepClone+commit。**结论：不迁**（`Easing.data` 是唯一的 deepClone 个例） |

---

## 3. B 类：明确不要进 Pinia

| 类别 | 代表 | 理由 |
|---|---|---|
| 每帧写入的运行时数值 | `Animation.animIndex:585`（引擎 `animation-window-engine.ts:830/838/843` 每 tick 写）、`Scene.animationFrame/Elapsed:326-327`、Scene 相机缓存 `:331-344`、`Particle.scale/scaleX/centerX`（`particle-motion.ts:171-172,226-227`） | 60Hz 走响应式 = 可测量回归；它们是派生缓存 |
| GPU/画布句柄 | `GL`/`GL.program`/`GL.binding`（`engine/webgl/webgl-init.ts:4`、`webgl-methods.ts:27-28`）、`TextureManager.map/images:7-11`、`Printer` 的 GL + `Float64Array` 字宽表（`printer/printer.ts:1005-1027`） | 身份不可序列化、每帧重绑定 |
| DOM 元素（用元素注册表） | `Scene.page/head/body/screen/marquee/list:305-315`、`Animation` 的 25 个元素 `:492-559`、`Particle:298-313`、`UI.page/…/dragging:290-305`、`Window.frames:62` | 代理 HTMLElement 破坏 `instanceof`/身份；项目已有正解：`registryRef` + `stores/element-registry.ts`、`stores/ui.ts:299-327` 的 `elements` getters |
| 每实例引擎对象 | `AnimationPlayer` 28 字段（`animation-player.ts:32-59`，按文件构造/销毁）、`ParticleEngine.Emitter/Layer/Element`（`particle-engine.ts:256/462/809`）、`Scene*Engine` 的 `this: typeof Scene` 方法容器 | 实例身份即模型；`engine/scene/*` 已无模块级可变状态（干净） |
| 第三方单例 | `vue-i18n` composer（`E/i18n/index.ts:62`） | store 只能做镜像（`stores/local.ts:15-21` 现状） |
| 元素键缓存 | `log/related-references.ts:82-85` 的 HTMLElement-keyed Map、各 `element-registry.ts`、`title-bar.ts:176-178` 的 `tabBar.data` | 键是元素对象，代理会改键身份 |

---

## 4. C 类：Pinia 卫生与一致性

| 规则 | 现状 | 证据 | 建议 |
|---|---|---|---|
| 安装顺序 | ✅ `app.use(pinia)` 先于 i18n/指令/mount（`E/main.ts:17-19`） | — | 保持 |
| **引导顺序脆弱** | ⚠️ `E/main.ts:7` 先 `import '@app/main/startup.ts'`，其**模块级**副作用先于 `app.use(pinia)` 执行；当前只因那些函数只赋值槽位（`services/project/config.ts:96-99`）、真正读 store 在 `Editor.initialize` 的 `await`（`main/initialize.ts:78,82,98`）之后才安全 | `E/main/startup.ts:14-19,29-41` | 把 startup 注册移到 `app.use(pinia)` 之后，或在文件头固化约束 |
| **不要裸调 `useXStore()`** | ⚠️ 服务模块（非 Vue）在用**无参** `useXStore()`：`services/project/config.ts:29,31,38,42,91,93`、`services/project/project.ts:27,32,35,36,46,50,58,60,63,64`；组件层另有 9 处（`tools/AutoTile.vue:183`、`CommandSuggestions.vue:18`、`Confirmation.vue:19`、`Selector.vue:33`、`AppShell.vue:125-127`、`FileTilesetPaletteSection.vue:108`、`SceneTilemapPropertiesSection.vue:216`） | 同函数另一半却用 `getXStore()`（`config.ts:24,26,30`） | 统一 `getXStore()`；可加 lint 规则 |
| setup store 必须 return 全部状态 | ✅ 34/36 完整；2 处有意私有且有注释 | `stores/ui.ts:206-213`（`listEl/headEl/bodyEl/screenEl`，经 `elements:299-327` 暴露）、`stores/layout.ts:50`（`makeTargets` 工厂） | 保持，注释保留即可 |
| 解构丢响应性 → `storeToRefs` | ⚠️ 全仓 `storeToRefs` **0** 次；**32** 处解构（全在 `.ts`、全解构 state） | `engine/layout/layout.ts:1179,1798,1823,1852,1864,1911,1918`(`{dragging}`)、`:2148,2177`(`{resizing}`)、`palette/auto-tile.ts:372`、`particle/particle-motion.ts:98,381`、`services/updater/*.ts` 19 处 `{manifest,…} = getDataStore().data`、`title/title-bar.ts:365` | 当前都是命令式「读一次」，**无实际症状**；组件/composable 层请用 `storeToRefs`；可加 lint 禁止 `= getXStore()` 解构 |
| 避免双真源/镜像 | ⚠️ `stores/window.ts:19 stack` 只是 `Window.frames` 的 id 镜像（`window-object.ts:104,119,155,453,483,502`）；`stores/data.ts:271 manifest` 与 `:275 data.manifest` 手动同步（`:273-276`）；`stores/local.ts` 镜像 i18n；`stores/command.ts` vs `commands/event-editor.ts:231-232` | 同左 | `manifest` 改 `computed(() => data.manifest)`；`stack` 见 P2-#18；command 见 P0-#1 |
| 窗口开闭两处口径 | ⚠️ `stack` 与各窗口 store 的 `state`（`ui.ts:133`、`scene.ts:28`、`selector.ts:80`…）语义重叠 | 同左 | 以 `stack` 为唯一真源，`state` 派生 |
| 清理死代码/只写不读 | ⚠️ `stores/timer.ts` 全仓 **0** 引用（且是唯一没有 `getXStore()` 的 store）；`stores/command.ts` 仅测试引用；只写不读：`stores/home.ts:21`、`stores/menubar.ts:17`、`stores/localization.ts:20`、`stores/printer.ts:7`；`SetQuantity.callback`（`E/tools/set-number-window.ts:6`）无读者无写者 | 同左 | 删或补读者，二选一 |
| 样板膨胀 | ⚠️ `stores/ui.ts` 796 行、`browser.ts` 588、`selector.ts` 423、`layout.ts` 311…但状态极少，绝大多数是 `X?.m?.()` 转发器（`ui.ts:366-701`）；键名跨 store 重复：`state` 23 个、`target` 9 个、`initialized` 6 个、`zoom` 5 个、`mode` 4 个 | 同左 | 抽 `createWindowStore(engine, {keys})` 工厂，可消掉 20+ 个 store 的样板 |
| 已健康的范例（照抄） | ✅ `stores/browser.ts`、`selector.ts`、`resource.ts`、`confirmation.ts`、`search-string.ts`、`auto-tile.ts`、`variable.ts`、`enum.ts`、`attribute.ts`（含 `AutoTile.vue:90` 的 `v-model="store.ruleBits[1]"`） | 同左 | 新迁移按这组写 |

---

## 5. 落地顺序与验收

**阶段 1（低风险，1–2 天）**：P0 #1–#7（7 个手写 store → Pinia）。
验收：`packages/editor` 的 `vitest run --project src`、`packages/ui-kit` 套件、`tsc -p tsconfig.strict.json`、`oxlint`、`oxfmt`；每个迁移补 `stores/__tests__/<name>-state.spec.ts`（已有先例 `stores/__tests__/scene-state.spec.ts:5`）。

**阶段 2（2–4 天）**：P1 #8–#15 —— 白名单扩容（`Animation`/`Scene`/`Particle`/`UI`）+ tools（`Selection`/`Color`）+ 命令弹窗表单。
注意：Scene/Particle 扩容后要做一次真机冒烟（DevTools 能看到 + 引擎读值不变 + 未引入每帧响应式写入）。

**阶段 3（按需）**：P2 #16–#17；P2 #18/#19 先出设计稿（前者要动 ui-kit 注入端口，后者建议不迁）。

**卫生清理（随时，独立提交）**：删 `stores/timer.ts`；统一白名单（桥接直接 import store 的 `*StateKeys`，或删掉重复的 17 个 `*BridgeKeys`）；服务模块统一 `getXStore()`；`stores/data.ts` manifest 去重；组件层引入 `storeToRefs`；抽 `createWindowStore` 工厂。

---

## 6. 风险清单

1. **代理污染**：文档对象与单例是同一批对象（`stores/ui.ts:186-199` 记录了代理身份坑）→ 一律 `shallowRef`（现有约定）或 `markRaw`（`useCommandState.ts:45`）。
2. **`Object.defineProperty` 桥绕过响应式**：`Data` 的 `.map`/`mapById` 缓存（`data-object.ts:328-331,346`）走 defineProperty，读它不建立依赖；别指望 store 化后能触发更新。
3. **测试直接改单例**：~15 个 spec 赋值 `Layout.manager/heads/layout` 复位；迁移这些字段必须同步改 spec，否则假绿。
4. **每帧写入**：`animIndex`、相机缓存、粒子数值只在「值变化频率 ≪ 渲染频率」时才进 store。
5. **ui-kit 反向依赖**：`packages/ui-kit/src/utils/dom.ts:188` 读 `window.Window.frames.length`；ui-kit 不能 import editor 的 store（成环），必须先做注入端口。
6. **`this` 接收者约定**：引擎方法是 `this: typeof Scene|Animation|UI`；桥接后仍是「方法挂单例、状态在 store」，别把方法也搬走（`stores/ui.ts:594-604` 有记录）。

---

## 附录 · 统计口径

```
非测试源文件                1131（.ts/.vue）
Pinia store                 36（35 个带 getXStore()；timer.ts 无，0 引用）
桥接白名单                  导出的 *StateKeys 20 个 / 单例本地 *BridgeKeys 17 个 / 两边都有 13 个 / 已漂移 4 个
getXStore() 调用点          1283
useXStore() 调用点          65（其中服务模块 16 处、组件 9 处为裸调用）
storeToRefs                 0
store 解构                  32（全在 .ts，全部解构 state）
setup store 未 return 状态  0 漏报 / 2 处有意私有（有注释）
测试 setActivePinia         250
模块级 reactive/ref         40（composables/commands/* 14 + use*Window 26）
provide / inject            18 / 37（检查器页上下文，正统用法）
window.__* 应用状态         0（仅 __SKIP_AUTO_INIT__、__nodeRequire 两个 bootstrap 标志）
```
