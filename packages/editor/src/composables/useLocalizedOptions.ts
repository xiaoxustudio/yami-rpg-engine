/**
 * R2b 迁移⑦：把「选项名来自语言文件」的控件选项改为**模板侧的响应式 `t()`**。
 *
 * 背景：`localizeDomComponents` 过去在语言切换时按语言文件的
 * `components.<键>.options.<值>.name` 写进控件（`setItemNames`），因此这些键
 * 一直留在本地化器的扫描面里。改成这里的写法后：
 *   - 选项名由 `t()` 生成，**语言切换时 watchEffect 自动重建**（不再依赖本地化器）；
 *   - 该键可被 `scripts/i18n-skip-list.mjs` 判为「模板已承担」，扫描面随之下降。
 *
 * 用法（SFC 的 `<script setup>` 里）：
 * ```ts
 * useLocalizedOptions('addAnimationComponent-rotatable', [true, false], (items) =>
 * 	fieldEls.get('addAnimationComponent-rotatable')?.loadItems?.(items)
 * );
 * ```
 */
import { watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

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
): void {
	const { t } = useI18n();
	watchEffect(() => {
		apply(
			values.map((value) => {
				const explicit = nameKeys?.[String(value)];
				const name = explicit ?? `components.${key}.options.${String(value)}.name`;
				const tip = explicit !== undefined ? undefined : `components.${key}.options.${String(value)}.tip`;
				return { name: t(name), tip: tip === undefined ? undefined : t(tip), value };
			})
		);
	});
}
