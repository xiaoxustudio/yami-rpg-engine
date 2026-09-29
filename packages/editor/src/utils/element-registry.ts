/**
 * 元素注册表：SFC 用 `:ref="registryRef(reg, id)"` 把**元素**登记进模块导出的
 * Map，模块侧据此取用——替代 `按 id` 的 DOM 查找。
 *
 * 与 `createAccessorFields()`（控件实例注册表）的区别：这里登记的是元素本身
 * （组件 ref 取 `$el`，裸元素直接用），适用于模块把这些元素当作**命令式 API 对象**使用的场景
 * （tree list / text box / window frame 等）。
 */
import type { YamiElement } from '@app/types/element-api';

/**
 * 元素句柄类型：注册表里的元素**明确来自本仓库**（SFC 的模板 ref），因此带 `YamiElementApi`
 * 契约。过去这一步靠 `global.d.ts` 的全局 `interface HTMLElement` 兜底——那会让**所有** `HTMLElement`
 * 都"看起来"有这些方法，普通 DOM 元素也失去了拼写检查。现在只有显式来源才具备。
 */
export type ElementRegistry = Map<string, YamiElement | null>;

/**
 * 建一个注册表。可选 `mirror`：本注册表的每次写入（含卸载时的 `null`）同时镜像一份过去——
 * 用于「SFC 局部注册表 + 跨模块共享注册表」并存的情形（命令表单 SFC 的控件挂在局部
 * `fieldEls`，而 composable 侧要读共享的 `composableEls`）。
 *
 * 为什么在**写入时**镜像、而不是在 SFC 的 `onMounted` 里循环拷贝：子组件的 `onMounted`
 * 早于父组件的 `onMounted` 执行（Vue 的 post-flush 顺序），而命令表单控件会在自己的
 * `onMounted` 里 emit `write`/`input` 触发模块侧代码——那时父组件的 `onMounted` 还没跑，
 * 循环拷贝会「慢一拍」。
 */
export const createElementRegistry = (mirror?: ElementRegistry): ElementRegistry => {
	const registry: ElementRegistry = new Map();
	if (!mirror) return registry;
	const set = registry.set.bind(registry);
	registry.set = (id: string, el: YamiElement | null): ElementRegistry => {
		mirror.set(id, el);
		return set(id, el);
	};
	return registry;
};

/**
 * `registryRef` 回调缓存。
 *
 * Vue 3 对函数 ref **不做身份判断**，每次 patch 都会用当前元素再调一次回调
 * （见 runtime-core `setRef`：`isFunction(ref)` 分支无条件 `callWithErrorHandling`）。
 * 而 `:ref="registryRef(reg, id)"` 这种内联写法每次渲染都会新建闭包 —— 全仓约 1300 处。
 * 回调本身无状态，按 `(registry, id)` 缓存后返回稳定引用，省掉每次渲染的闭包分配与 GC 压力。
 */
const registryRefCallbacks = new WeakMap<ElementRegistry, Map<string, (el: unknown) => void>>();

/** 生成模板 ref 回调：组件实例取 `$el`，元素直接用；卸载（null）时清空该项 */
export const registryRef = (registry: ElementRegistry, id: string): ((el: unknown) => void) => {
	let callbacks = registryRefCallbacks.get(registry);
	if (!callbacks) {
		callbacks = new Map();
		registryRefCallbacks.set(registry, callbacks);
	}
	let callback = callbacks.get(id);
	if (!callback) {
		callback = (el: unknown): void => {
			if (el === null || el === undefined) {
				registry.set(id, null);
				return;
			}
			const element =
				el instanceof HTMLElement
					? (el as YamiElement)
					: ((el as { $el?: HTMLElement }).$el ?? null);
			registry.set(id, element as YamiElement | null);
		};
		callbacks.set(id, callback);
	}
	return callback;
};

/**
 * 命令式登记：用于 `:ref` 槽位已被占用的组件——例如 `<WindowFrame ref="frame">`
 * 无法再加 `:ref`，于是在组件的 `onMounted` 里调用
 * `registerElement(reg, 'windowId', frame.value?.root ?? null)`。
 */
export const registerElement = (registry: ElementRegistry, id: string, el: unknown): void => {
	registryRef(registry, id)(el);
};

/**
 * 按 id 列表取注册表里的元素（替代「一次批量取多个控件」的
 * `document.querySelectorAll('#a, #b, …')`——返回顺序与传入 ids 一致，未登记的项跳过）。
 */
export const registryElements = (registry: ElementRegistry, ids: string[]): YamiElement[] =>
	ids.map((id) => registry.get(id)).filter((el): el is YamiElement => el instanceof HTMLElement);

/**
 * 按 id 取一个**具体类型**的句柄 —— 把「收窄」集中在这一处。
 *
 * ## 为什么需要它（`unknown-casts` 收口，2026-09-20）
 *
 * 注册表的元素类型是**故意宽的** `YamiElement | null`：登记时（`registryRef`）只知道
 * 「这是一个来自本仓模板 ref 的元素」，静态上无法表达「这个 id 是 canvas、那个 id 是 marquee」
 * （id 是字符串、由模板里的 `:ref="registryRef(reg, 'x')"` 决定）。
 *
 * 于是每个想把 `get('color-palette-canvas')` 当 `HTMLCanvasElement` 用的调用方，都只能自己
 * `as unknown as HTMLCanvasElement`。实测**全仓 56 处**都是这个形状 —— 它是
 * `unknown-casts`（285 处）里最大的一块单一形态。
 *
 * ## 这个函数做了什么、没做什么（别读成「类型安全变好了」）
 *
 * - **做了**：把 56 处**各自为政、没有理由**的收窄，换成 1 处**具名、有文档、可审计**的收窄。
 *   想知道「谁在骗类型系统」现在只需要看这一个函数；将来若给注册表换成 id→类型 的映射表，
 *   也只需要改这一处。
 * - **没做**：类型系统在这条路径上**依然不受检**。收窄是**必要的**（注册表按 id 存异构元素），
 *   问题从来不是「要不要断言」，而是「断言散落 56 处、没人复核」。
 *   ⇒ 所以台账上的 `unknown-casts` 从 56 降到 1 是**如实**的，但**不等于**这 56 个用法变安全了。
 *
 * ## 返回值为什么是可空的
 *
 * 旧写法 `as unknown as T` 同时撒了两个谎：**类型不对** + **一定存在**。
 * 这里只保留「类型由调用方指定」这一个约定，**存在性交回类型系统**（返回 `T | null`）。
 * 因此调用方要写 `registryElement<HTMLCanvasElement>(colorEls, '…')!` 或自己判空 ——
 * 那个 `!` 是**可见**的，而 `as unknown as` 里的非空假设是**看不见**的。
 *
 * ## 为什么 `T` 只约束到 `object`，而不是 `HTMLElement`
 *
 * 注册表里存的是元素，但**调用方要的形状不一定是元素**：例如
 * `commands/text-tip.ts` 要的是 `TextSuggestionList`（`Partial<TreeListRowApi<…>>`，
 * 一个**方法包**），`composables/useCurveWindow.ts` 要的是 `CurveList` 等同理。
 * 收窄到 `HTMLElement` 会把这些真实用法挡在门外（实测 1 处），
 * 而放到 `object` 既允许它们、又仍能挡住 `registryElement<number>(…)` 这类明显的误用。
 *
 * ## 用法：**不要把 `| null` 写进尖括号里**
 *
 * `T` 只写「存在的那个类型」，可空性由返回值负责。写 `registryElement<BoundList | null>(…)`
 * 会当场报 `TS2344`（`null` 不满足 `T extends object`）——
 * 而旧写法 `as unknown as BoundList | null` 里那个 `| null` 是**必须**写的
 * （因为 `Map.get` 的 `undefined` 要自己补上）。
 * ⇒ 搬迁时**顺手把 `| null` 删掉**即可，语义完全一致。实测撞到 1 处
 * （`composables/__tests__/branch-registry.spec.ts`）。
 */
export const registryElement = <T extends object>(
	registry: ElementRegistry,
	id: string
): T | null => (registry.get(id) as T | null) ?? null;
