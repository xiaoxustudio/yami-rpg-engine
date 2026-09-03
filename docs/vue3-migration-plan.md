# Vue 3 数据驱动视图迁移方案

> 配套自动生成数据见 [dom-migration-tracker.md](./dom-migration-tracker.md)（`node scripts/dom-guard.mjs tracker`）。
> 本文档是迁移的总体规划：反模式清单 + 分阶段改造方案 + 验收标准。

## 进展记录

- 2026-08-31 阶段 1 完成：`stores/window.ts` 新增响应式 `stack`（窗口 id 栈）+ `syncStack`/`getTopWindowId`，`isWindowOpen` 改为读栈；`window-object.ts` 的 `frames.append/remove` 作为唯一同步点；`title-bar.ts`、`scene-context.ts`、`text-tip.ts`、`command-tip.ts` 4 个消费方改读 store。`Window` 门面与全部调用方零改动。
- 2026-08-31 阶段 2 第一批完成：YMTextBox 双实现去重——新增 `text-box-core.ts` 共享核心（10 个原语方法：read/insert/enable/disable/focus/getFocus/setPlaceholder/setMaxLength/fitContent/deleteInputContent），`YMTextBox.vue` 与 `text-box-api.ts` 均消费核心；分叉行为（write 的 history/lastText、addCloseButton、addKeydownFilter 签名、focus/blur 桥接）保留在各自文件。对外导出与行为零变化。
- 2026-08-31 阶段 2 第二批完成：YMNumberBox 同模式去重——新增 `number-box-core.ts`（whiteList/inputKeydown/readValue/write/enable/disable/getFocus/on 事件桥，read/write 接收 decimals 参数），`.vue` 319→228 行、`api.ts` 248→131 行，净删 381 行。CheckBox/RadioBox 的 .vue 只 expose root、无双实现重复，不在本批范围。
- 2026-08-31 阶段 3 试点完成：新增 `directives/focus.ts`（`focusTarget` 响应式状态 + `requestFocus(id, mode?)` + `v-focus` 指令，优先调元素挂载的 `getFocus(mode)` 组件 API，原生 focus 回退；token 递增支持重复聚焦；watcher 存 WeakMap），main.ts 全局注册，vitest.setup.ts 测试注册。试点迁移 useCastSkillCommandSchema（3 处）、useForEachCommandSchema（12 处）及 CastSkill.vue / ForEach.vue 模板加 v-focus。实测口径修正：`getFocus(document.getElementById(...))` 共 352 处（无参 333 / 'all' 18 / 'end' 1），非此前估计的 830。
- 2026-08-31 阶段 3 批量铺开完成：三个并行批次迁移全部静态 id 的 `getFocus(document.getElementById(...))` → `requestFocus(id[, mode])`——批次 A（commands 高频 27 文件 107 处）、批次 B（commands 其余 110 文件 139 处）、批次 C（非 commands composables 25 文件 90 处，含 ui-kit 6 个业务组件模板加 v-focus）。合计 162 文件 336 处替换、164 个组件模板加 v-focus。剩余 14 处动态 id 保留（useVariableGetterWindow 的 `${prefix}-*` 9 处、usePresetGetterWindow 的 `${domKey}-*` 3 处、useTextCaptureWindow 的参数 focusId 2 处）。全量测试 1766/1767 通过（唯一失败为预存的 global-mounting.spec.ts 审计问题，与迁移无关）；lint 0 警告、typecheck 通过。
- 2026-08-31 修复存量时序 bug：AppShell.vue 中 CommandSuggestions/LogMessage/TextSuggestions 三个首帧同步挂载组件错误携带 `@vue:mounted` 计数钩子，导致 lazyMounted 虚高 3、lazyComponentsReady 提前 resolve、Inspector.initialize 抢跑（animJointFrame/animSpriteFrame/animParticleFrame 三条 null 警告的根因）。
- 2026-08-31 阶段 3 收尾（第一批）完成：`useCommandSchema` 新增 `options.skipWrite` 开关（关闭 load 的 write(getElementById) 循环）；三批并行迁移——批次 A（19 个 0% v-model 小窗组件补 26 个 v-model）、批次 B（SetString/SetObject/Return/CallEvent/StopEvent/SetList/LoadImage 7 个大缺口组件补 63 个 v-model、删 80 处 read，CallEvent 加 createdEventId 幂等守卫防 v-model watch 二次触发）、批次 C（15 个 read 密集 schema 删 136 处 read、补 31 个 v-model）。合计约 41 个命令窗口完成「模板 v-model 全覆盖 + skipWrite + save 纯 form 化」。测试适配：insert/edit 后补 nextTick（v-model watch 异步刷新）、save 路径改 form 断言范式。全量 1766/1767 通过（唯一失败为预存 global-mounting 审计）。
- 2026-08-31 阶段 3 收尾（第二批）完成：三批并行——批次 D/E（28 个含 read 文件补 v-model、删 97 处 `read(getElementById)`，含 JumpTo 重构为 useCommandSchema、WebSocket 两命令 getFocus→requestFocus）、批次 F（71 个机械迁移命令补 43 处 v-model、57 个开 skipWrite）。阶段 3 最终状态：**125 个 schema 开 skipWrite、composables/commands 下 `read(getElementById)` 清零**；`useCommandSchema.load` 的 write 循环仅剩 Script（monaco 编辑器容器）与 12 个手写 schema（本无 write 循环，等效已跳过）不适用。全量 1766/1767 通过（唯一失败为预存 global-mounting 审计）、lint 0 警告、typecheck 过。
- 2026-08-31 阶段 4 启动：①静态 getFocus 清理——14 个 TS 文件 41 处 `getFocus($('#静态id'))` → requestFocus，17 个模板补 30 个 v-focus（含 ui-kit YMRequestKeyValue）；静态残留 0，保留 2 处动态反引号 id 与约 15 处元素引用形式（元素在手直调，属合理用法）。②inspector 批次 1——10 个 scene/element 页面删 36 处冗余 write 回填：7 个 scene 页面的 write() 外部回写路径（原 Scene 拖动回写，已无调用方）统一改走 `$('#xxx-vue-mount')?.sync?.()`；element-window/element-animation 新建 useUIWindowPage/useUIAnimationPage（18 字段 form 化 + v-model + sync 桥）。ParamList（conditions/events/scripts）无 v-model 协议，其 write 暂留。
- 2026-08-31 阶段 4 inspector 批次 2+3 完成：批次 2（8 个 file/element 页面）——新建 useFileTilesetPage/useFileUIPage/useUIVideoPage 3 个 composable、复用扩展 5 个，补 37 处 v-model，删 37 处 write 回填、5 处 read 改 form（file-audio paramInput 整体移除）；批次 3（4 个动态键重建页面）——particle-layer 43 处 + file-trigger 7 + element-button/text 各 6 处 read(DOM) 清零，切型重建改读 form（经 `#xxx-vue-mount` 桥暴露 form，可选链复刻元素不存在语义），paramInput 保留控件 API 直读（NumberBox v-model 在 change 才提交，@input 时 form 是旧值——e2e 实测确认，新增 particle-layer-page-form.spec.ts 固化）。批次 2 发现的横切问题待办：ui-kit SelectBox/SliderBox 的 onInput 先 emit('input') 后 emit('update:modelValue') 的顺序问题，需统一修。
- 2026-09-01 阶段 4 批次 4 + emit 顺序统一修复完成：
  - 批次 4a（transition-window/Easing）：新建 useEasingWindow（form: points×8/mode/preview/scale + clampEasingPointX/Y 与 NumberBox readValue 等价），Easing.vue 补 20 处 v-model，transition-window.ts 删 38 处 write、24 处 read，clamp 往返全部函数化（canvas/TreeList/RadioBox 保留）。
  - 批次 4b（inspector History + palette）：`processors['inspector-change']` 改为 write(DOM) + form 桥赋值（三级键解析：直接键/camelCase/嵌套路径）+ dispatch input，无桥/键不可解析时回退原路径；palette auto-tile 的 rule-0..7 开关 v-model 化（store.ruleBits），canvas/TreeList 交互入白名单。新增 13 个测试用例。
  - emit 顺序统一：ui-kit 9 组件 11 处 `emit('input')` 先于 `emit('update:modelValue')` 的顺序倒置全部修正（ColorBox/FileVar×2/NumberVar/SelectBox×2/SelectVar/SliderBox/StringVar/TextAreaVar/CustomBox），`@input` handler 现在能读到 v-model 更新后的 form 值。ui-kit 450/450、editor 1781/1782（唯一失败为预存 global-mounting 审计）、lint 0 警告、typecheck 过。
- 2026-09-01 阶段 4 prototype patch 拆除完成：`HTMLElement.prototype` 的 name/innerHeight/addScrollListener/on/off 五个 monkey-patch 全部删除（name/innerHeight 消费者为零直接删；addScrollListener 迁至新模块 `utils/scroll-listener.ts`，palette/scene/animation 画布区显式导入；on/off patch 删除但全局 on()/off() 函数保留 `el.on` 探测——它是 ui-kit 元素 API 的路由机制（YMTreeList.on 启用事件派发开关），误删后 5 测试失败已恢复）。修复 animation-list 的 this 陷阱（addEventListener 回调的 this 是元素非单例）。36 文件 58 处 `.on(` 元素方法调用改全局函数。
- 2026-09-01 阶段 4 收官（editor/components 模板 ref 化）完成：inspector 页面 .vue 的 onMounted 中 `document.getElementById('自己模板的id')` 全部改为模板 ref——子组件用 `ref<InstanceType<typeof X> | null>` 调 expose API（loadItems/bind/relate/enableHiddenMode），普通 div 用 `ref<HTMLElement | null>`。三个批次共 42 个 inspector 页面 + 4 个 tools 页面，editor/components 的 getElementById 从 387 → 54，剩余全部合理保留（37 个 vue-mount 挂载容器跨组件 + 5 个 specialTarget 容器 + 12 处动态 id 循环）。commands/animation/data 残留确认为动态拼接 id 与 monaco 容器（保留）。dom-guard 矩阵：全仓待迁移豁免文件 299 → 157、getElementById 1164 → 231。全量 1781/1782、lint 0 警告、typecheck 过。
- 剩余集中在：ui-kit/components 的 37 个豁免文件（createElement/appendChild 大头，阶段 5 巨石组件：tree-api/command-api/FileBodyPane 等）、editor/composables 的 170 处（动态 id：variableGetter/presetGetter 的 prefix 循环）、engine/scene/palette 画布白名单区。
- 2026-09-01 阶段 5 启动完成：①热身——下线 slider-box-api 死代码（editor 零消费，仅 index.ts 导出 + 自身 spec），删 256 行消 21 处命中，YMSliderBox.spec 6 用例即护栏。②第一刀 select-box 收敛（方案 A：抽 select-box-core.ts 375 行三段式共享）——先补 7 个行为锁定测试（relate+enableHiddenMode 全链路/reselect 边界/invalid 回退/save-restore 等），select-box-api.ts 511→274、YMSelectBox.vue 647→376，双实现净删约 508 行，relate 的 previousSibling 语义原样保留并被测试锁定。③巨石第一步 tree-core 抽取——tree-api.ts 纯数据层 7 函数（createParents/deleteCaches/cloneNode/searchNodesAlgorithm/generateUniqueName/findItemByProperties/containsItem）迁出 179 行 + 14 个单测，tree-api 1795→1666，DOM 渲染/拖拽/键盘层未动。menu-api 评估为弹层合理命令式（保留豁免）。全量：ui-kit 468/468、editor 1781/1782（预存审计失败）、lint 0 警告、typecheck 过。dom-guard：豁免文件 157→156、createElement 149→145、addEventListener 597→579。
- 阶段 5 后续：command-api（2762 行）抽 parse/选择索引/clipboard 序列化 core；FileBodyPane（2399 行）抽文件操作编排 core；tree-api 行渲染 v-for 化（需迁移 element 缓存语义，风险最高放最后）；YMParameterPane（56 命中）下一梯队。
- 2026-09-01 补齐类型检查盲区：`ref is not defined` 运行时事故暴露 editor 的 .vue 不在 typecheck 覆盖内（tsc 不解析 SFC）。新增 `scripts/check-vue-types.mjs` + `vue-types-baseline.json`（baseline 门禁模式：只拦新增不要求清零存量），package.json 加 `typecheck:vue` 脚本；门禁接入即检出 15 个迁移遗留类型错误（v-model 绑 form.unknown → writable computed 收窄、死 import、未用参数、spec mock 断言），全部修复，baseline 754→736。同批完成 ParameterPane（param-pane-core 103 行 7 函数 + 14 测试）与 FileNavPane（file-nav-pane-core 176 行 11 函数 + 23 测试）core 抽取。ui-kit 全量 548/548、editor 1781/1782、lint 0 警告。
- 2026-09-01 阶段 5 中型组件 core 抽取完成：YMParamList（param-list-core 149 行 9 函数：选区归一化/可视区间/拖拽选区/toggle 收集等 + 21 测试）、YMTabBar（tab-bar-core 154 行 9 函数：标签插入去重/拖拽插入位置/drop 重排 + 19 测试）、YMCommonList（common-list-core 117 行 6 函数 + 13 测试）。ui-kit 测试规模 548 → 601。tree-api v-for 化设计方案已写入 docs/tree-list-vfor-plan.md（方案 B 分阶段：WeakMap 稳定 key + :ref 回写 item.element 桥保 136 处 API 契约零改动，先补 18-22 个金标准测试再动渲染层，5 步独立可回滚）。
- 阶段 5 剩余：tree-api v-for 化实施（按 docs/tree-list-vfor-plan.md 五步走）；YMFileHeadPane/YMScrollBar/YMKeyboardBox 等 SFC 内命令式小件收敛。
- 2026-09-01 vue-tsc baseline 存量清零（736 → 0）：三个并行 agent 按目录消减——tools（283→0，97 文件：死代码删除 ~190、confirm 补参 ~27、writable computed ~35、popup handler 签名对齐等）、inspector（221→0，38 文件：onParamInput 解构重命名统一包装 ~140、bindInput owner cast 16、tint 可空 computed 16 等）、ui-kit+commands+common（剩余 ~230→1，我修最后 1 处 commandListOptions 导出收窄）。**editor + ui-kit 全部 .vue 现在处于 vue-tsc 零错误状态，baseline 为空数组**——后续任何 .vue 类型错误都会被门禁拦截。全量：editor 1781/1782（预存审计）、ui-kit 548/548、lint 0 警告、typecheck:vue 通过。
- 2026-09-01 阶段 5 巨石 core 抽取完成：①command-core.ts（279 行）——parseSearchRegExp/parseScript（多行折叠 20 行截断）/computeSelectRange（多选区间）等纯函数 + 27 个单测，command-api 改委托调用（断连遗留的 1 个错误断言已修正：无斜杠搜索串因 flags 非法实际返回 null）。②file-body-core.ts（159 行）——虚拟滚动窗口计算（computeListGridMetrics/computeTileGridMetrics/computeVisibleRange）与键盘网格导航索引（computeNavigationIndex）参数化纯函数 + 16 个单测（含零项负偏移经 Uint32Array 强转的原始边界行为），DOM 读取留在 .vue 传参。至此三巨石均完成纯数据层分离：tree-core 179 行 + command-core 279 行 + file-body-core 159 行，DOM 渲染层暂保留命令式。全量：ui-kit 511/511（较阶段 5 开始时 +43 测试）、editor 1781/1782（预存审计失败）、lint 0 警告、typecheck 过。
- 2026-09-03 ⚠️ tree v-for 化第 2 步（渲染层 v-for）已回滚（revert `648773f0` 及依赖的 `0001ee0e`/`05b69561`）：真实运行「首次点击 TabBar 标签页」即崩（Vue `insertBefore null`/`__vnode null`）。根因是架构级——layout 系统在首次 `loadLayoutScheme` 的 `createGroups`（layout.ts:243-244）把 Vue 渲染的 PageManager（`#workspace-page-manager`/`#layout-page-manager`，LayoutPanel.vue 内 `<PageManager>`）子页命令式 `appendChild` 搬运进新建 group，Vue vnode 仍持旧父子关系；v-for 化 TreeList 的同步 flushRender（绕过 Vue scheduler 直接 instance.update()）频繁触发 patch，与搬运交错即 vnode/DOM 失配。v-for 化前命令式行渲染无 Vue patch 故不暴露。
  - **前置条件结论**：YMTreeList 行渲染 Vue 化的前提是先做 layout 页面组织 Vue 化（PageManager/group/nav 结构改为 Vue 渲染或 Teleport，消除命令式 reparent）。
  - **护栏保留**：金标准测试 26 用例（tree-list-interactions.spec.ts，行为级断言新旧实现均绿）与 41303633 一并保留，供将来重做。
  - **保留**：element-utils clear 委托修复（ef5d3173，与 v-for 无关）、小件 core 抽取（a49a5ffd）、SFC 小件收敛、vue-tsc 清零等全部前置成果。
  - 当前 YMTreeList 回到旧命令式渲染，全量测试绿（editor 1781/1782 仅预存审计、ui-kit 55/55 tree 目录）。
- 2026-09-03 layout/PageManager 页面组织 Vue 化开工：新增 `docs/layout-vue-plan.md`（现状模型 + 方案对比[推荐 Teleport 起步/组件化远期] + M1-M6 分步计划 + 风险回滚）。Phase 0 摸底测试落地 `layout-scheme-baseline.spec.ts`（6 用例）锁定现状语义：首载 `clear` 摧毁 palette 挂载与节点搬移、group 递归结构、首 tab 激活、页签点击切换（nav write→manager.switch）、跨工作区节点对象不变仅 parent 迁移、二次加载 lastValue 恢复、saveLayoutScheme 往返保真。layout __tests__ 10/10 绿、lint 0。M2（scheme 数据化）为下一项。
- 2026-09-03 layout M2 数据层交付：新增 `engine/layout/layout-scheme.ts` 纯数据模型（SplitNode/GroupNode，稳定 id，`active` 用页签 value）与不可变变换 `parseLayoutScheme/toLayoutScheme/leavesOf/findGroup/activateLayoutTab/moveLayoutTab`（同组重排/跨组插入/源组清空后折叠：空 split 删除、单子组提升继承父 end，对齐 navDrop DOM 折叠语义）+ `layout-scheme.spec.ts` 19 用例。sub-agent 同步盘点布局状态读写面并并入 layout-vue-plan 附录 B（含 `Layout.layout/default` 与 editor store `config.layout` 同引用、`afterChange` 死代码等线索）。本轮刻意不接入渲染，M1 基线零扰动：layout __tests__ 29/29 绿、lint 0 警告。M2b（config 读写收敛 + 响应式宿主）为下一项。
- 2026-09-03 layout M1 补齐完成 + 两个接线调研落档：新增共享 fixture `layout-spec-utils.ts` 与 `layout-lifecycle.spec.ts`（5 用例）——saveNavStates 全路径（selected→lastValue + write(null) 清空）、同页二次加载 lastValue 恢复、updateGroupTabs 重建 tabs 并进 saveLayoutScheme 往返、mergeGroups 同向嵌套平铺合并与 end 重算、navDragstart/dragend 生命周期。layout __tests__ 34/34 绿、lint 0。sub-agent 调研并入 layout-vue-plan 附录 C（M3 接线：页面成分/双实现桥接/Teleport 语义与坑/createGroups 调用面/建议次序）、附录 D（DOM→树反序列化契约与 mirror 结论：M2b 走「DOM 为事实源 + 7 个收敛点快照」改动面最小）。M2b（mirror 快照 + saveToConfig 从树落盘）为下一项。
- 2026-09-03 layout M2b 反序列化接入：新增 `engine/layout/layout-deserialize.ts`（附录 D 契约：`deserializeGroupElement`/`deserializePage`，kind 以 expando split 为准、tabs 读 group.tabs、active 读 manager.index 且 undefined→null、空/未物化页返回 null）+ `layout-deserialize.spec.ts`（6 用例，含 merge 平铺后新 end 与跨工作区往返一致性）。`Layout.saveLayoutScheme` 改为 `toLayoutScheme(deserializeGroupElement(root))`，删除原手写递归序列化（L785-808）；既有基线往返/updateGroupTabs/merge 测试钉死行为零变化。layout __tests__ 40/40 绿、oxlint 0、editor typecheck 通过。下一步 M3（叶子 group Vue 组件 + 页/页签 Teleport）为下一项。
- 2026-09-03 layout M3a 交付：新增递归数据渲染组件 `components/layout/LayoutTreeView.vue`（LayoutTreeNode → group DOM，稳定 key，结构/类与命令式一致，node=null 空渲染）+ `layout-tree-view.spec.ts`（5 用例：4 个 scheme 与命令式 createGroups 结构签名/叶子数/叶子宿主等价 + 空树）。layout __tests__ 45/45、oxlint 0、editor typecheck 通过、vue-tsc 门禁 0 新增。editor 全量回归 1825/1827（2 失败均为预存 global-mounting 审计，单跑同样失败与本次无关）、ui-kit 627/627。M3b（双路开关接线 + Teleport 换源）需真机冒烟阶段实施，见 layout-vue-plan M3 小节。
- 2026-09-03 layout M3 方案 A 前提试验通过：新增 `layout-teleport-probe.spec.ts`——动态 `Teleport :to` 挂「命令式创建的 manager 元素」在 A↔B 间切换**只移动不重建**（mounted 计数恒 1）、manager 内命令式插入的外部兄弟节点在 teleport 子树 patch 期间不被吞、目标清空（disabled 兜底）回宿主仍不重建。风险表 R1/R2 标注 jsdom 层已验证，剩余真机拖拽压测。layout __tests__ 46/46、oxlint 0。M3b（双路开关接线 + Teleport 换源）待真机冒烟阶段。
- 2026-09-03 layout M3b 归属源落地：新增 `engine/layout/layout-page-targets.ts`（DOM walker 收集 value→归属 group-manager）；`stores/layout.ts` 加响应式 `pageTargets`/`setPageTargets`/`resetPageTargets`；`layout.ts` 在 loadLayoutScheme 与 navDrop 收敛点后 `syncPageTargets` 刷新（layout-page-targets.spec.ts 5 用例：空态/载入归属/跨工作区整表刷新/切页签不改归属）。layout __tests__ 51/51、oxlint 0、editor typecheck 通过。下一步 M3b 渲染接线（LayoutPalettePage Teleport 组件 + 双路开关）仍待真机冒烟阶段。
- 2026-09-03 layout M3b 页面 Teleport 组件落地：新增 `components/layout/LayoutPalettePage.vue`（slot 经 Teleport 挂 `store.pageTargets[value]`，无归属 disabled 留宿主）+ `layout-palette-page.spec.ts`（2 用例：纯 store 驱动搬家/清归属不重建；与真实 loadLayoutScheme 联动、跨工作区往返目标一致且不重建）。layout __tests__ 53/53、oxlint 0、editor typecheck 与 vue-tsc 门禁通过。剩余 M3b 渲染接线（12 页接入 + 双路开关 + clear 语义替换）待真机冒烟阶段。
- 2026-09-03 layout M2b 收尾完成：新增 `layout-config.spec.ts`（5 用例）钉死布局字典生命周期——saveToConfig 把已物化页 DOM（含重排后 tabs）反序列化回 layout、未物化页保持原样；switchLayout 整本字典切换立即重建当前页；loadFromConfig 接管后驱动加载；loadLayoutScheme 在 layout 缺 key 时回落 Layout.default；双缺不构建。layout __tests__ 58/58、oxlint 0。M2 至此闭环（数据层 + 反序列化 + 序列化落盘统一走 layout-scheme/layout-deserialize），M3b 渲染接线为下一项（需真机冒烟）。
- 2026-09-03 layout M3b-1（C.5#1 叶子宿主 Vue 化）交付：`LayoutTreeView.vue` 叶子改由 `YMNavBar`/`YMPageManager`(.vue) 渲染——组件 onMounted 把 read/write/unselect/on 与 switch/on/index/active 命令式 API 挂到 root，命令式消费方零改动，`.nav-bar`/`.page-manager.group-manager`/`.group-border` 结构与类不变（M3a 结构断言继续绿）；新增 `engine/layout/layout-vue-tree.ts` 水合层 `mountVueGroupTree(host, scheme, handlers)`（parseLayoutScheme → render(LayoutTreeView) → nextTick 后按先序绑 end/split/tabs/nav/manager/border expando + 与 createGroupContent/createGroupBorder 一致的事件接线）+ `unmount()` 幂等只卸载组树。金标准 `layout-vue-leaf.spec.ts` 6 用例：Vue 宿主 vs 命令式 loadLayoutScheme 的结构签名/叶子宿主类/首载激活/页签点击切换双路等价 + expando 与数据树一致 + unmount/重挂。layout __tests__ 58→64 全绿、oxlint 0 警告、editor typecheck 过、vue-tsc 门禁 0 新增（含 0 存量基线）。M3b-2（双路开关接线 + LayoutPanel 12 页 LayoutPalettePage 接入 + clear 语义替换 + async 时序）待真机冒烟阶段，实施要点见 layout-vue-plan 附录 E。
- 阶段 5 后续（调整后顺序）：layout/PageManager 页面组织 Vue 化 →（前置完成后再）重做 tree 行渲染 v-for 化 → 其余巨石 core 化与 editor 消费方迁移。

## 一、现状总览

| 指标 | 数值 |
| --- | --- |
| 扫描文件总数 | 1083 |
| 仍带 oxlint-disable 豁免的待迁移文件 | 299 |
| `getElementById` 调用 | 1164（editor/composables 占 830） |
| `document.createElement` 调用 | 149（ui-kit/components 占 117） |
| `appendChild` 调用 | 134 |
| `addEventListener` 调用 | 597 |
| 使用 `useCommandSchema` 的命令表单 | 142 个 |
| ui-kit 命令式 API 文件（`*-api.ts`） | 27 个 |

现状判断：项目已完成「阶段 0」——Vue 3 壳、Pinia store、模板组件（153 个命令表单 .vue、ui-kit 组件 .vue）已就位，且模板内已大量使用 `v-model` / `@input`。**但状态与视图仍是"双轨制"**：reactive form 与 DOM 元素同时作为数据源，靠 `id` 互相找回，属于典型的"伪 Vue"。

## 二、反模式清单

### P1 `domId` + `getElementById` 双向同步（最大债务）

**现象**：`useCommandSchema.ts:32`

```ts
const load = (params: Record<string, unknown>): void => {
	Object.assign(form, createDefault(), params);
	for (const field of fields) {
		write(document.getElementById(`${name}-${field.domId ?? field.key}`), form[field.key]);
	}
};
```

表单数据 `form` 是 reactive，但 `load` 时被命令式写入 DOM；保存/联动时又用 `read(document.getElementById(...))` 从 DOM 读回（如 `useCallEventCommandSchema.ts:555`、`useChangeActorSkillCommandSchema.ts:61`）。数据流向混乱：模板事件 → DOM → `read()` → form → `write()` → DOM，绕开了响应式系统。

**波及**：142 个 `use*CommandSchema.ts`、全部 `components/commands/*.vue` 的 `id` 属性、`CommandSchema.fields[].domId` 字段。

### P2 ui-kit `attachApi` 元素 API 模式

**现象**：27 个 `*-api.ts` 把 `read/write/enable/disable/focus/loadItems...` 直接挂到 `HTMLElement` 实例上（`TextBoxApi extends HTMLElement`），组件 `.vue` 内部还复制了一份逻辑（`YMTextBox.vue` 与 `text-box-api.ts` 双实现）。外部代码通过 `document.getElementById('castSkill-key')?.loadItems?.(...)` 调用（`useCastSkillCommandSchema.ts:80`）。

**危害**：绕过 props/emits 契约；类型靠 duck-typing（`DynamicShape`、大量 `as unknown as`）；同一组件两套实现漂移；无法用 Vue DevTools 观测。

### P3 窗口系统命令式管理

**现象**：`tools/window-object.ts` 的 `Window` 单例——`frames: HTMLElement[]`、`open(id)`/`close(id)` 直接操作 DOM 栈、`$('#window-ambient')`；`stores/window.ts` 只是薄包装转发 `Window?.open?.(id)`，状态（打开哪些窗口、层级）不落 store。

**危害**：窗口栈是"藏在 DOM 里的状态"，Vue 无法感知，无法用 `<component :is>` + `v-for` 驱动，Teleport/过渡动画/KeepAlive 均不可用。

### P4 `HTMLElement.prototype` monkey-patch

**现象**：`element-utils.ts:13-73` 给 `HTMLElement/NodeList.prototype` 扩展 `on/off`；`App.vue:14-56` 扩展 `name/innerHeight/addScrollListener`。

**危害**：全局污染、类型不可靠（`legacy-ambient.d.ts` 补丁）、与 Vue 事件指令（`@click` 等）职责重叠。

### P5 jQuery 风格 DOM 工具层

**现象**：`utils/dom.ts`（`show/hide/css/addClass/rect`）、`element-utils.ts`（`read/write/getFocus/on/off/clear`）共 70 个文件引用；`App.vue` 顶层调用 `css()`。

**危害**：`show/hide/css` 对应 `v-show/:style/:class`；`on/off` 对应 `v-on` 或 `useEventListener`（@vueuse 已引入）；`read/write/getFocus` 是 P1/P2 的底层支撑，是命令式访问器的"根"。

### P6 Vue 组件内命令式渲染

**现象**：大型组件/模块在 `onMounted` 或初始化函数中 `createElement + appendChild` 手工建 DOM：`tree-api.ts`（1795 行，59 处命中）、`command-api.ts`（2762 行，37 处）、`YMFileBodyPane.vue`（2399 行，42 处）、`engine/layout/layout.ts`（1556 行，54 处）、`element-utils.ts` 中 `h()/render()` 手动挂载 tooltip。

**危害**：视图结构与数据脱钩，列表增删靠手动 DOM 差量操作，内存泄漏风险（手动 `render(null)` 清理）。

### P7 innerHTML / 字符串拼接视图

**现象**：`module/resource.ts:655` `this.content.innerHTML = ''`；测试文件大量 `document.body.innerHTML = ...`（已被 dom-guard 的 `EXCLUDE_RE` 排除，不算债务）。

### P8 合理豁免区（不建议迁移）

以下属于 Canvas/指针交互层，DOM 操作是合理的，应显式白名单而非强改 Vue：

- `engine/*`（场景渲染）、`scene/scene-events-pointer.ts`、`palette/palette-pointer.ts`（画布交互）
- `main/`（Electron 主进程）、`scripts/`
- 测试与 playground（已排除）

## 三、目标架构

```
Pinia store（唯一状态源）
   ├── windowStore.stack: WindowInstance[]   ← 窗口栈数据化
   ├── form (reactive) + v-model             ← 表单单一数据源
   └── focusTarget (ref + autofocus 指令)    ← 焦点管理数据化
        ↓ 声明式渲染
Vue 模板（v-for / v-if / <component :is> / Teleport）
   └── ui-kit 组件：props in → emits out，defineExpose 暴露命令式方法（仅供过渡桥接）
```

原则：
1. **单一数据源**：任何值只存在于 reactive/store，DOM 只读渲染。
2. **id 仅用于测试与无障碍**，不得作为模块间寻址手段。
3. **删除一个反模式必须连根删除其支撑层**（P1 删完 → P5 的 `read/write` 才能删）。

## 四、分阶段迁移方案

### 阶段 1：窗口系统数据化（P3）— 建议最先做

窗口栈是所有表单/弹窗的宿主，数据化后 P1/P2 的迁移才有干净的宿主模型。

**改造**：

```ts
// stores/window.ts（重写）
export const useWindowStore = defineStore('window', () => {
	const stack = shallowReactive<WindowInstance[]>([]); // {id, component, props, resolve}
	function open<T>(id: string, props?: Record<string, unknown>): Promise<T | undefined> {
		return new Promise((resolve) => {
			stack.push({ id, component: windowRegistry[id], props, resolve });
		});
	}
	function close(id?: string, result?: unknown) { /* pop + resolve */ }
	return { stack, open, close, ... };
});
```

```html
<!-- WindowHost.vue：唯一窗口渲染点 -->
<Teleport to="body">
	<WindowFrame v-for="win in windowStore.stack" :key="win.id" v-bind="win.props"
		@confirm="win.resolve" @close="windowStore.close(win.id)" />
</Teleport>
```

- `WindowFrame` 组件化（对应 ui-kit `YMWindowFrame.vue`），承接 open/close 动画、ambient 遮罩、焦点保存/恢复。
- 旧 `Window.open(id)` 保留为兼容门面，内部转发到 store，调用方零改动过渡；迁移完成后删除门面与 `window-object.ts`。
- `window-registry.ts` 从"getLazyWindow 加载命令式对象"改为"注册异步组件 + props 契约"。

**验收**：`window-object.ts` 中 `frames: HTMLElement[]` 消失；`stores/window.ts` 不再出现 `Window?.xxx?.()` 转发；`getTopWindow()` 返回 store 中的 id 而非 HTMLElement。

### 阶段 2：ui-kit 组件契约化（P2）

**顺序**（按复杂度递增）：TextBox / NumberBox / CheckBox / RadioBox → SelectBox / MenuList / SliderBox / ScrollBar → TreeList / CommandList / FileBodyPane / ParamList。

**单组件改造模式**（以 YMTextBox 为例）：

```ts
// 之前：TextBoxApi extends HTMLElement，read/write 挂元素上
// 之后：
const value = defineModel<string>({ default: '' });
const disabled = defineModel<boolean>('disabled', { default: false });
const inputEl = ref<HTMLInputElement | null>(null);
function insert(text: string) { /* 操作 inputEl，emit input 事件 */ }
function focus(mode?: 'all' | 'end') { /* 内部实现，替代全局 getFocus */ }
defineExpose({ insert, focus, inputEl });
```

**兼容桥**：`*-api.ts` 暂留一层，`attachApi` 改为把调用转发到组件实例（`getCurrentInstance().exposed`），使 `document.getElementById('x')?.write?.(v)` 这类旧调用在过渡期继续工作。每迁移完一批调用方，删除对应 api 文件，最终删除 `attach-api.ts`。

**去重**：`YMTextBox.vue` 与 `text-box-api.ts` 的双实现合并为 `.vue` 单实现，api 文件只做转发。

**验收**：`-api.ts` 文件数从 27 → 0；组件 props/emits 有完整类型；playground demo 全部可交互。

### 阶段 3：表单读写去 getElementById（P1）— 工作量最大

**改造 `useCommandSchema.ts`**：

```ts
// 之前
const load = (params) => {
	Object.assign(form, createDefault(), params);
	for (const field of fields)
		write(document.getElementById(`${name}-${field.domId ?? field.key}`), form[field.key]);
};

// 之后：纯数据，DOM 交给 v-model
const load = (params) => {
	Object.assign(form, createDefault(), params);
	options.onLoad?.(params);
};
const save = () => {
	for (const field of fields) {
		if (field.required && isEmpty(form[field.key])) return; // 校验读 form，不读 DOM
	}
	commit(pick(form, fields.map((f) => f.key)));
};
```

**焦点管理替代方案**（消灭 `getFocus(document.getElementById(...))`，约 830 处中的大部分）：

```ts
// composables/useFocusField.ts
export function useFocusField() {
	const focusTarget = ref<string | null>(null); // 存字段 key，不存元素
	const requestFocus = (key: string, mode?: 'all' | 'end') => { focusTarget.value = `${key}:${mode ?? ''}`; };
	return { focusTarget, requestFocus };
}
```

```html
<NumberBox v-model="form.actor" v-focus="focusTarget" />
<!-- v-focus 指令 watch focusTarget 变化并调用组件 expose 的 focus() -->
```

**联动逻辑归位**：`useChangeActorSkillCommandSchema.ts` 这类 `read(getElementById(...)) ?? form.x` 的联动，改为 `watch(() => form.actor, ...)`，联动条件直接读 reactive form。

**迁移节奏**：按命令分组（约 142 个），每组：删除 `id` props → 删除 schema `domId` 字段 → 删除该文件 `getFocus/read` 调用 → 移除文件顶部 `oxlint-disable`。单文件提交，靠 dom-guard tracker 监控进度。

**验收**：`CommandSchema.fields` 无 `domId`；`use*CommandSchema.ts` 无 DOM 导入；`components/commands/*.vue` 无 `id` 属性（测试用的 `data-testid` 除外）。

### 阶段 4：原型扩展与工具层回收（P4 + P5）

前置条件：阶段 2/3 完成后，`read/write/getFocus/on/off` 的外部引用归零。

1. `HTMLElement.prototype` 的 `on/off/name/innerHeight/addScrollListener` 全部删除：
   - `on/off` → `@event` 指令或 `useEventListener`
   - `innerHeight` → `useElementSize`（@vueuse）或 computed
   - `addScrollListener` → `useScroll`/自定义指令
2. `utils/dom.ts` 的 `show/hide/css/addClass` → `v-show/:style/:class`；`$()` 选择器删除。
3. `element-utils.ts` 收缩为纯工具（`rect`、`dispatchResizeEvent` 等少量保留），删除 `read/write/getFocus/clear/hasClass` 等。
4. tooltip（`element-utils.ts` 中 `h()/render()` 手动挂载）→ 改为 store 驱动的 `<YTooltip>` 组件。

**验收**：`legacy-ambient.d.ts` 中对应类型声明删除；全仓 grep 无 `HTMLElement.prototype`。

### 阶段 5：大型命令式渲染重写（P6 + P7）— 高风险，最后做

| 目标 | 行数 | 方案 |
| --- | --- | --- |
| `YMCommandList/command-api.ts` | 2762 | 命令树用 `v-for` + 数据驱动展开/折叠/拖拽；虚拟滚动用数据驱动组件 |
| `YMTreeList/tree-api.ts` | 1795 | 扁平化可见节点数组 computed + `v-for`；折叠/选中是数组/Map 状态 |
| `YMFileBodyPane.vue` | 2399 | 文件列表数据化，`v-for` 渲染，拖拽用事件而非手动 DOM |
| `engine/layout/layout.ts` | 1556 | 区分：纯布局计算保留；DOM 生成部分改声明式 |
| `module/resource.ts:655` | - | `innerHTML = ''` → `v-if` / 列表数据清空 |

策略：先补集成测试快照（现有 `__tests__` 模式）锁行为，再重写；一次只动一个组件。

### 收尾：拆除脚手架

- 删除 `.oxlintrc.json` 中 `eslint/no-restricted-properties` 的存量豁免机制与所有 `/* oxlint-disable eslint/no-restricted-properties */`（299 个文件）。
- `scripts/dom-guard.mjs` 的 `exempt` 子命令退役，`tracker` 保留作为防回归报表。
- `engine/scene/palette` 画布交互区加入显式白名单目录（lint overrides），明确"豁免是设计决定"。

## 五、优先级与排期建议

| 阶段 | 内容 | 预估规模 | 风险 | 依赖 |
| --- | --- | --- | --- | --- |
| 1 | 窗口栈数据化 | 小（约 5 个文件） | 中 | 无 |
| 2 | ui-kit 契约化 | 中（27 组件，可分批） | 中 | 无（可与 1 并行） |
| 3 | 命令表单去 DOM | 大（142 文件，机械性强） | 低（可逐文件灰度） | 2 |
| 4 | 工具层/原型回收 | 中（删代码为主） | 低 | 2、3 |
| 5 | 大型组件重写 | 大（5 个巨石文件） | 高 | 2 |
| 6 | 拆除脚手架 | 小 | 低 | 全部 |

## 六、度量与防回归

- 进度指标：`node scripts/dom-guard.mjs tracker` 的「待迁移」列（当前 299 → 目标 0，画布白名单除外）。
- 提交规范：每个迁移 PR 必须同时移除所改文件的 `oxlint-disable eslint/no-restricted-properties` 注释，CI 跑 `pnpm lint` 保证无新增违规。
- 行为锁定：阶段 5 的每个重写必须有对应 `__tests__` 快照/交互测试先行的 PR。
