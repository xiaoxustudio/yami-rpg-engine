/**
 * R2b 迁移⑦：把「选项名来自语言文件」的控件选项改为**跟随语言的响应式重建**。
 *
 * 背景：`localizeDomComponents` 过去在语言切换时按语言文件的
 * `components.<键>.options.<值>.name` 写进控件（`setItemNames`），因此这些键
 * 一直留在本地化器的扫描面里。改成这里的写法后：
 *   - 选项名由 `t()` 生成，**语言切换 / 语言表重载时自动重建**（不再依赖本地化器）；
 *   - 该键可被 `scripts/i18n-skip-list.mjs` 判为「代码已承担」，扫描面随之下降。
 *
 * **不依赖 setup 上下文（2026-09-17 修）**：原先这里用 `useI18n()` + `watchEffect`，
 * 而 `useI18n()` 要求调用点处在组件 setup（或生命周期钩子）里——偏偏调用点既可能在
 * `onMounted` 内部、也可能在 **`localize` 事件回调**（`inspector/SceneParallaxPage.vue` 等
 * 页面原先就是"监听 localize → 重新调用一次"），后者没有组件实例，于是运行期直接抛
 * `vue-i18n` 的 `SyntaxError: Must be called at the top of a setup function`，把
 * `Editor.initialize` 的后续步骤一起打断。
 *
 * 现在改用 **全局 Composer**（`getYamiI18n().global`，与 `utils/localized-items.ts` 同一真源）：
 * 它在任何上下文都能调用；`watchEffect` 里读 `t()` 会同时跟踪两件事——
 *   ① Composer 的 `locale`（语言切换 / `applyLocaleData` 重载语言表 ⇒ 重建选项名）；
 *   ② `apply` 回调里读到的 `ref`（组件挂载后 `:ref` 才被赋值 ⇒ 那时再补一次 `loadItems`）。
 *
 * 组件内调用时，effect 归属组件作用域（`onMounted`/setup 都在作用域里）→ 随组件销毁自动停止；
 * 组件外调用时返回停止函数，调用方自行停止（不要再在事件回调里反复调用它——那是重复订阅）。
 *
 * 用法（SFC 的 `<script setup>` 里，`onMounted` 内或 setup 顶层都可）：
 * ```ts
 * useLocalizedOptions('addAnimationComponent-rotatable', [true, false], (items) =>
 * 	fieldEls.get('addAnimationComponent-rotatable')?.loadItems?.(items)
 * );
 * ```
 */
import { watchEffect, type WatchStopHandle } from 'vue';
import { getYamiI18n } from '@app/i18n';

export interface LocalizedOption<T> {
	name: string;
	tip?: string;
	value: T;
}

/** 生成选项数组（含 name/tip/value），`watchEffect` 内会随语言切换重跑 `apply` */
export function useLocalizedOptions<T>(
	key: string,
	values: readonly T[],
	apply: (items: Array<LocalizedOption<T>>) => void,
	/**
	 * 选项名所在的消息键（`值 → 完整键路径`）。
	 * 省略时按约定取 `components.<键>.options.<值>.name` / `.tip`；
	 * 给出时按 `t(nameKeys[值])` 取名（用于选项名沿用 `command.*` 等既有命名空间的组件）。
	 */
	nameKeys?: Record<string, string>
): WatchStopHandle {
	return watchEffect(() => {
		// 全局 Composer：无组件实例也能取（旧的 `useI18n()` 会抛），且在 effect 内读到
		// `locale` ⇒ 语言变化时本 effect 自动重跑。
		const { t } = getYamiI18n().global;
		apply(
			values.map((value) => {
				const explicit = nameKeys?.[String(value)];
				const name = explicit ?? `components.${key}.options.${String(value)}.name`;
				const tip =
					explicit !== undefined
						? undefined
						: `components.${key}.options.${String(value)}.tip`;
				return { name: t(name), tip: tip === undefined ? undefined : t(tip), value };
			})
		);
	});
}
