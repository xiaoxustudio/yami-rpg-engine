import { getYamiI18n } from '@app/i18n';
import { onCustom } from '@app/events/custom-events';
import { parseLocalTip } from '@app/localize/dom-localizer';
import { setTooltip } from '@app/utils/element-utils';

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
	return onCustom('localizationchange', run);
}

/**
 * 给**组件外持有的元素**挂 `components.<键>.tip` 的 tooltip，语言切换时重新挂。
 *
 * 用途：元素由模板之外的代码创建/取得（如文件浏览器标题栏里的搜索框），
 * 模板 `v-tip` 够不着。若靠"模块在运行期给元素**赋一个 id**，本地化器再按
 * id 反查"来实现，这些键就会留在本地化器的扫描面里。这条路径让 key 随代码走，
 * 不依赖按 id 的 DOM 反查。
 *
 * 注：这里**刻意不写出那个受限 API 的字面量**（`document` + 点 + 方法名）——tracker 的
 * `getElementById` 列按 `document\s*\.\s*getElementById` 计数且**含注释提及**，在注释里
 * 写出它会凭空多算一处（实测曾因插入的注释把统计抬到 464/109 假命中）。
 *
 * 返回取消订阅函数。
 */
export function applyLocalizedTip(
	element: HTMLElement | null | undefined,
	key: string
): () => void {
	const run = (): void => {
		if (!element) return;
		const { t } = getYamiI18n().global;
		setTooltip(element, parseLocalTip(t(`components.${key}.tip`), ''));
	};
	run();
	return onCustom('localizationchange', run);
}
