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
	nameKeys?: Record<string, string>
): WatchStopHandle {
	return watchEffect(() => {
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
