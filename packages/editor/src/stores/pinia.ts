import { createPinia } from 'pinia';

export const pinia = createPinia();

/**
 * # Pinia 约定（本仓所有 store 共享；跨域规则集中在这里，改规则请改这里）
 *
 * ## 1. 取 store 一律用 `getXStore()`
 *
 * 每个 `stores/<domain>.ts` 都导出一个 `getXStore()`，内部 `useXStore(pinia)` —— 显式传**本文件这个
 * 模块级实例**。不要用无参 `useXStore()`：它依赖 `app.use(pinia)` 设的 active pinia，在
 * 「先 import 后 use(pinia)」或测试 `setActivePinia(createPinia())` 的场景下会拿到**另一个实例**。
 * 这条 HIGH 影响项已在迁移里清零（服务模块 17 处 + 组件层 8 处）。
 * 也因此 `main.ts` 里 `startup.ts` 的模块求值期副作用与 `app.use(pinia)` 的**先后无关**。
 *
 * ## 2. 组件里解构 store 必须用 `storeToRefs`
 *
 * `const { zoom } = getUIStore()` 会丢响应性；`.ts` 里读**快照**（取一次值、不参与渲染）直接解构没问题。
 *
 * ## 3. 「桥接列表」与「`*StateKeys`」是两个不同的角色
 *
 * - 单例模块里的 `xxxBridgeKeys`：被 `Object.defineProperty` 装到遗留单例上的键 = 「外部/遗留按
 *   `Singleton.xxx` 取用的字段」。循环写在**单例模块**里，且数组是**模块求值期**读的。
 * - store 导出的 `xxxStateKeys`：该 store 拥有的**全部**状态，供测试与文档用。
 *
 * ⇒ 两者长度**本来就可以不等**（`stores/ui.ts` 15 个键只在 editor 内经 `getUIStore()` 用；
 * `stores/auto-tile.ts` 的 `ruleBits` 是 store 侧派生数据）。差异要**写成注释**，不是每轮当漂移审。
 * ⇒ 两边需要同一份键表时，放进**叶子模块**（如 `stores/animation-keys.ts`：不 import 任何东西，
 * store 与单例各自 import 它）——单例侧不能直接 import store 的导出，否则踩 TDZ。
 *
 * ## 4. 哪些状态可以迁、哪些不能
 *
 * **模块级 = 单例，可迁 store；工厂函数 / 组件 / composable 函数体内 = 每实例私有，不可迁**
 * （如 `usePresetGetterWindow` 在 `createPresetGetterWindow()` 内、`useFileTilesetPage` 在
 * `useFileTilesetPage()` 内 —— 迁进去会让多个调用者共享同一份表单）。
 *
 * 不得进 store（B 类）：DOM 元素与 Vue 实例句柄、GPU/WebGL 句柄、每帧重写的值、
 * 与 `Data.*` 共享的文档对象、vue-i18n composer 单例。它们留在模块/组件作用域，
 * 需要跨包读取时用**注入端口**（如 `ui-kit` 的 `setWindowFramesLengthProvider`，带全局回退）。
 *
 * ## 5. 三种迁移手法（调用点零改动为原则）
 *
 * - **键已知的表单**：store 里放 `reactive` 切片，原文件保留同名对象，改成逐字段
 *   `get/set` **访问器**（`Object.assign(form, …)`、`form.x`、模板 `v-model` 全部照旧）。
 * - **键动态的表单**（`Record<string, unknown>`）：用 `composables/dynamic-form.ts` 的
 *   `dynamicForm(select)`（Proxy 转发，保留展开/`Object.keys`/`delete`/`in` 与响应性）。
 * - **ref 形态**（含 `*ConfirmDisabled`、脏标记）：store 里 `shallowRef`，原文件给**可写 computed**，
 *   保持 `.value` 写法与模板自动解包。
 *
 * ## 6. 测试
 *
 * - vitest **必须在包目录内**跑（`cd packages/editor` / `cd packages/ui-kit`）：它按 cwd 定 root，
 *   从仓库根跑会报出成百上千个「文件失败」的假信号。
 * - spec 用 `setActivePinia(createPinia())` 时同样适用第 1 条。
 * - **`vi.mock('@app/stores/xxx')` 的假模块必须同时导出 `useXStore` 与 `getXStore`**：
 *   ESM 具名导入在 mock 上缺失会直接抛 `No "getXStore" export is defined on the … mock`。
 * - 改了 `*StateKeys` 之类的常量，要跑整个 `src/stores`（既有 spec 里写死了键数期望）。
 * - `tsc -p tsconfig.strict.json` **不覆盖 `.vue`**：改 SFC 时以 vitest 的退出码为准。
 * - 判断测试是否通过要读**进程退出码**：`Select-Object -First N` 会提前掐断管道，让退出码失真。
 */
