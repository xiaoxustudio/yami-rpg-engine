/**
 * R2b（模块侧选项名）：给**组件外**的代码（元素工厂 / 数据模块）一条与 `useLocalizedOptions`
 * 等价的路径——按当前语言生成选项名，并在**语言切换时重新应用**。
 *
 * 为什么不能直接用组合式函数：`useLocalizedOptions` 依赖 `useI18n()` 与 `watchEffect`，只能在
 * Vue 的 setup 里调用；而 `data/transition-window.ts`、`components/condition-list.ts` 这类
 * **元素工厂模块**不是组件。它们过去靠本地化器在语言切换时往控件里写名字，因此那些键一直
 * 留在扫描面里。这里用 `getYamiI18n()`（非响应式）+ 订阅 `localizationchange` 事件达到同样效果。
 */
import { getYamiI18n } from '@app/i18n';

export interface LocalizedItem<T> {
	name: string;
	tip?: string;
	value: T;
}

/** 按当前语言生成选项名（约定：`components.<键>.options.<值>.name/.tip`） */
export function localizedItems<T>(key: string, values: readonly T[]): Array<LocalizedItem<T>> {
	const { t } = getYamiI18n().global;
	return values.map((value) => ({
		name: t(`components.${key}.options.${String(value)}.name`),
		tip: t(`components.${key}.options.${String(value)}.tip`),
		value
	}));
}

/**
 * 生成选项名并 `apply`：**立即执行一次**，随后在每次 `localizationchange` 时重新执行
 * （语言切换后名字随之更新）。返回取消订阅函数，调用方在销毁时调用。
 */
export function applyLocalizedItems<T>(
	key: string,
	values: readonly T[],
	apply: (items: Array<LocalizedItem<T>>) => void
): () => void {
	const run = (): void => apply(localizedItems(key, values));
	run();
	window.addEventListener('localizationchange', run);
	return () => window.removeEventListener('localizationchange', run);
}
