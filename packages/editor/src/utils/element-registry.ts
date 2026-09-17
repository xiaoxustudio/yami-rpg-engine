/**
 * 元素注册表（P5b 批次 2/4）：SFC 用 `:ref="registryRef(reg, id)"` 把**元素**登记进模块导出的
 * Map，模块侧据此取用——替代 `按 id` 的 DOM 查找。
 *
 * 与 `createAccessorFields()`（控件实例注册表）的区别：这里登记的是元素本身
 * （组件 ref 取 `$el`，裸元素直接用），适用于模块把这些元素当作**命令式 API 对象**使用的场景
 * （tree list / text box / window frame 等）。
 */
import type { YamiElement } from '@app/types/element-api';

/**
 * 元素句柄类型（P4c）：注册表里的元素**明确来自本仓库**（SFC 的模板 ref），因此带 `YamiElementApi`
 * 契约。过去这一步靠 `global.d.ts` 的全局 `interface HTMLElement` 兜底——那会让**所有** `HTMLElement`
 * 都"看起来"有这些方法，普通 DOM 元素也失去了拼写检查。现在只有显式来源才具备。
 */
export type ElementRegistry = Map<string, YamiElement | null>;

/**
 * 建一个注册表。可选 `mirror`：本注册表的每次写入（含卸载时的 `null`）同时镜像一份过去——
 * 用于「SFC 局部注册表 + 跨模块共享注册表」并存的情形（P1b：命令表单 SFC 的控件挂在局部
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

/** 生成模板 ref 回调：组件实例取 `$el`，元素直接用；卸载（null）时清空该项 */
export const registryRef =
	(registry: ElementRegistry, id: string) =>
	(el: unknown): void => {
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

/**
 * 命令式登记：用于 `:ref` 槽位已被占用的组件——例如 `<WindowFrame ref="frame">`
 * 无法再加 `:ref`，于是在组件的 `onMounted` 里调用
 * `registerElement(reg, 'windowId', frame.value?.root ?? null)`。
 */
export const registerElement = (registry: ElementRegistry, id: string, el: unknown): void => {
	registryRef(registry, id)(el);
};

/**
 * 按 id 列表取注册表里的元素（P1b：替代「一次批量取多个控件」的
 * `document.querySelectorAll('#a, #b, …')`——返回顺序与传入 ids 一致，未登记的项跳过）。
 */
export const registryElements = (registry: ElementRegistry, ids: string[]): YamiElement[] =>
	ids.map((id) => registry.get(id)).filter((el): el is YamiElement => el instanceof HTMLElement);
